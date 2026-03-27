import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/errors';
import { PrismaSnapshotStore } from '@/lib/prisma-snapshot-store';
import { toDecimal, ZERO, add, div, mul } from '@stocker/shared';
import type { Decimal } from '@stocker/shared';
import type { HoldingSnapshot } from '@stocker/shared';

export async function GET(): Promise<Response> {
  try {
    const snapshotStore = new PrismaSnapshotStore(prisma);

    // Get the most recent snapshot
    const latestRow = await prisma.portfolioValueSnapshot.findFirst({
      orderBy: { date: 'desc' },
    });

    // Build instrument lookup by symbol
    const instruments = await prisma.instrument.findMany();

    if (!latestRow) {
      // No snapshots — return all instruments as zero-value entries
      const quotes = await prisma.latestQuote.findMany();
      const quoteByInstId = new Map<string, typeof quotes[number]>();
      for (const q of quotes) {
        quoteByInstId.set(q.instrumentId, q);
      }
      return Response.json(
        instruments.map((inst) => {
          const quote = quoteByInstId.get(inst.id);
          return {
            symbol: inst.symbol,
            name: inst.name,
            instrumentId: inst.id,
            instrumentType: inst.type,
            qty: '0',
            price: quote ? quote.price.toString() : '0',
            value: '0',
            costBasis: '0',
            unrealizedPnl: '0',
            unrealizedPnlPct: '0',
            dayChange: null,
            dayChangePct: null,
            allocation: '0',
            firstBuyDate: null,
          };
        }),
      );
    }

    const latest = await snapshotStore.getByDate(latestRow.date);
    if (!latest) {
      return Response.json([]);
    }
    const instrumentBySymbol = new Map<string, typeof instruments[number]>();
    for (const inst of instruments) {
      instrumentBySymbol.set(inst.symbol, inst);
    }

    // Build latest quote lookup by instrumentId
    const quotes = await prisma.latestQuote.findMany();
    const quoteByInstrumentId = new Map<string, typeof quotes[number]>();
    for (const q of quotes) {
      const existing = quoteByInstrumentId.get(q.instrumentId);
      if (!existing || q.fetchedAt > existing.fetchedAt) {
        quoteByInstrumentId.set(q.instrumentId, q);
      }
    }

    // Build PriceBar fallback for prevClose (used when LatestQuote.prevClose is null)
    const allInstrumentIds = instruments.map((i) => i.id);
    const barPrevCloseByInstrumentId = new Map<string, string>();
    await Promise.all(
      allInstrumentIds.map(async (instId) => {
        const bar = await prisma.priceBar.findFirst({
          where: { instrumentId: instId, resolution: '1D' },
          orderBy: { date: 'desc' },
          select: { close: true },
        });
        if (bar) {
          barPrevCloseByInstrumentId.set(instId, bar.close.toString());
        }
      }),
    );

    // Derive first BUY date per instrument
    const firstBuyRows = await prisma.transaction.groupBy({
      by: ['instrumentId'],
      where: { type: 'BUY' },
      _min: { tradeAt: true },
    });
    const firstBuyByInstrumentId = new Map<string, Date>();
    for (const row of firstBuyRows) {
      if (row._min.tradeAt) {
        firstBuyByInstrumentId.set(row.instrumentId, row._min.tradeAt);
      }
    }

    // First pass: compute current value for each holding using fresh quotes
    const holdingsData: Array<{
      symbol: string;
      name: string;
      instrumentId: string | null;
      instrumentType: string;
      qty: string;
      price: string;
      currentValue: Decimal;
      costBasis: string;
      unrealizedPnl: string;
      unrealizedPnlPct: string;
      dayChange: string | null;
      dayChangePct: string | null;
      firstBuyDate: string | null;
    }> = [];

    let computedTotalValue = ZERO;

    for (const [symbol, entry] of Object.entries(latest.holdingsJson) as Array<[string, HoldingSnapshot]>) {
      const inst = instrumentBySymbol.get(symbol);
      const quote = inst ? quoteByInstrumentId.get(inst.id) : undefined;
      const latestPrice = quote ? toDecimal(quote.price.toString()) : null;

      // Use latest quote price to compute current value if available, otherwise use snapshot value
      const currentValue = latestPrice ? mul(entry.qty, latestPrice) : entry.value;
      computedTotalValue = add(computedTotalValue, currentValue);

      const unrealizedPnl = currentValue.minus(entry.costBasis);
      const unrealizedPnlPct = entry.costBasis.isZero()
        ? '0'
        : div(unrealizedPnl, entry.costBasis).times(100).toFixed(2);

      const firstBuyDate = inst ? firstBuyByInstrumentId.get(inst.id) ?? null : null;

      // Compute day change: prefer quote.prevClose (live from provider),
      // fall back to most recent PriceBar close (may be stale)
      let dayChange: string | null = null;
      let dayChangePct: string | null = null;
      if (inst && latestPrice && !latestPrice.isZero()) {
        const prevCloseStr = quote?.prevClose != null
          ? quote.prevClose.toString()
          : barPrevCloseByInstrumentId.get(inst.id) ?? null;
        if (prevCloseStr) {
          const prevClose = toDecimal(prevCloseStr);
          if (!prevClose.isZero()) {
            const perShareChange = latestPrice.minus(prevClose);
            dayChange = entry.qty.times(perShareChange).toString();
            dayChangePct = perShareChange.dividedBy(prevClose).times(100).toFixed(2);
          }
        }
      }

      holdingsData.push({
        symbol,
        name: inst?.name ?? symbol,
        instrumentId: inst?.id ?? null,
        instrumentType: inst?.type ?? 'STOCK',
        qty: entry.qty.toString(),
        price: latestPrice ? latestPrice.toString() : (entry.qty.isZero() ? '0' : entry.value.dividedBy(entry.qty).toString()),
        currentValue,
        costBasis: entry.costBasis.toString(),
        unrealizedPnl: unrealizedPnl.toString(),
        unrealizedPnlPct,
        dayChange,
        dayChangePct,
        firstBuyDate: firstBuyDate ? firstBuyDate.toISOString() : null,
      });
    }

    // Include instruments with no transactions (not in snapshot) as zero-value entries
    const symbolsInSnapshot = new Set(holdingsData.map((h) => h.symbol));
    for (const inst of instruments) {
      if (!symbolsInSnapshot.has(inst.symbol)) {
        const quote = quoteByInstrumentId.get(inst.id);
        const latestPrice = quote ? toDecimal(quote.price.toString()) : ZERO;
        holdingsData.push({
          symbol: inst.symbol,
          name: inst.name,
          instrumentId: inst.id,
          instrumentType: inst.type,
          qty: '0',
          price: latestPrice.toString(),
          currentValue: ZERO,
          costBasis: '0',
          unrealizedPnl: '0',
          unrealizedPnlPct: '0',
          dayChange: null,
          dayChangePct: null,
          firstBuyDate: null,
        });
      }
    }

    // Second pass: compute allocation using recomputed total value
    const holdings = holdingsData.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      instrumentId: h.instrumentId,
      instrumentType: h.instrumentType,
      qty: h.qty,
      price: h.price,
      value: h.currentValue.toString(),
      costBasis: h.costBasis,
      unrealizedPnl: h.unrealizedPnl,
      unrealizedPnlPct: h.unrealizedPnlPct,
      dayChange: h.dayChange,
      dayChangePct: h.dayChangePct,
      allocation: computedTotalValue.isZero()
        ? '0'
        : div(h.currentValue, computedTotalValue).times(100).toFixed(2),
      firstBuyDate: h.firstBuyDate,
    }));

    return Response.json(holdings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(500, 'INTERNAL_ERROR', message);
  }
}
