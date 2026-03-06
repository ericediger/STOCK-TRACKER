import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/errors';
import { PrismaSnapshotStore } from '@/lib/prisma-snapshot-store';
import { toDecimal, ZERO, add, sub, mul } from '@stalker/shared';
import type { HoldingSnapshot } from '@stalker/shared';

function toDateStr(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return apiError(400, 'VALIDATION_ERROR', 'Both startDate and endDate are required (YYYY-MM-DD)');
    }

    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return apiError(400, 'VALIDATION_ERROR', 'Dates must be in YYYY-MM-DD format');
    }

    if (startDate > endDate) {
      return apiError(400, 'VALIDATION_ERROR', 'startDate must be before or equal to endDate');
    }

    const snapshotStore = new PrismaSnapshotStore(prisma);
    const snapshots = await snapshotStore.getRange(startDate, endDate);

    const series = snapshots.map((s) => ({
      date: s.date,
      totalValue: s.totalValue.toString(),
      totalCostBasis: s.totalCostBasis.toString(),
      unrealizedPnl: s.unrealizedPnl.toString(),
      realizedPnl: s.realizedPnl.toString(),
    }));

    // If the last snapshot is before today, append a live-recomputed "today" point
    // so the chart reflects current prices (AD-S25-1)
    const todayStr = toDateStr(new Date());
    const lastSnapshotDate = snapshots.length > 0 ? snapshots[snapshots.length - 1]!.date : null;

    if (lastSnapshotDate && lastSnapshotDate < todayStr && endDate >= todayStr && snapshots.length > 0) {
      const lastSnapshot = snapshots[snapshots.length - 1]!;
      const holdingsJson = lastSnapshot.holdingsJson as Record<string, HoldingSnapshot>;

      // Build instrument lookup and fetch live quotes
      const instruments = await prisma.instrument.findMany();
      const instrumentBySymbol = new Map<string, typeof instruments[number]>();
      for (const inst of instruments) {
        instrumentBySymbol.set(inst.symbol, inst);
      }

      const quotes = await prisma.latestQuote.findMany();
      const quoteByInstrumentId = new Map<string, typeof quotes[number]>();
      for (const q of quotes) {
        const existing = quoteByInstrumentId.get(q.instrumentId);
        if (!existing || q.fetchedAt > existing.fetchedAt) {
          quoteByInstrumentId.set(q.instrumentId, q);
        }
      }

      // Recompute total value from live quotes
      let liveTotal = ZERO;
      let liveCostBasis = ZERO;
      for (const [symbol, entry] of Object.entries(holdingsJson)) {
        const inst = instrumentBySymbol.get(symbol);
        const quote = inst ? quoteByInstrumentId.get(inst.id) : undefined;
        const livePrice = quote ? toDecimal(quote.price.toString()) : null;
        const currentValue = livePrice ? mul(entry.qty, livePrice) : entry.value;
        liveTotal = add(liveTotal, currentValue);
        liveCostBasis = add(liveCostBasis, entry.costBasis);
      }

      const liveUnrealizedPnl = sub(liveTotal, liveCostBasis);

      series.push({
        date: todayStr,
        totalValue: liveTotal.toString(),
        totalCostBasis: liveCostBasis.toString(),
        unrealizedPnl: liveUnrealizedPnl.toString(),
        realizedPnl: lastSnapshot.realizedPnl.toString(),
      });
    }

    return Response.json(series);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(500, 'INTERNAL_ERROR', message);
  }
}
