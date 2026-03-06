# Session 26 Report — 2026-03-05

## Session Overview

**Date:** 2026-03-05
**Session:** Phase II Session 5 (S26)
**Type:** ES-reported defect remediation
**Scope:** 8 defects across dashboard math, day change accuracy, chart data, and first-load reliability

## Work Completed

### 1. Hero Percentage Fix
The hero metric's percentage change was displaying as a decimal ratio (e.g., 0.16%) instead of the actual percentage (16%). The `changePct` computation in the snapshot API was missing `.times(100)`. Fixed by adding the multiplication and adjusting precision to `.toFixed(2)`.

### 2. Crypto PriceBar Backfill
ETH and XRPUSD had 0 PriceBars because the 10-year backfill range exceeded CoinGecko's free tier limit. The backfill silently failed. Fixed by capping crypto backfill to 365 days in both `instruments/route.ts` and `auto-create-instrument.ts`. Ran one-time backfill script to populate 365 daily bars for each crypto instrument.

### 3. Chart-Hero Value Mismatch
The portfolio chart showed the cached snapshot value (~$220K) while the hero showed the live-recomputed value (~$255K). Fixed by having the timeseries API append a synthetic "today" data point computed from LatestQuote prices when the last snapshot predates today.

### 4. Dashboard Empty on First Load
On first visit (no cached snapshots), the holdings table showed empty because `useHoldings()` fetched before the snapshot rebuild completed and never refetched. Fixed by adding a `useEffect` that watches the `isRebuilding` state transition and triggers `refetchHoldings()` when rebuild completes.

### 5. Charts Page 1D/1W "No Data"
PriceBars for equities stop at Feb 25. The 1D range queries `date >= Mar 4` and finds nothing. Fixed by falling back to the 30 most recent bars when a date-filtered query returns empty.

### 6. Day $ Per-Position Instead of Per-Share
The "Day $" column showed per-share price change instead of total position day change. For 100 shares down $1, it showed `-$1.00` instead of `-$100.00`. Fixed by multiplying per-share change by quantity in both holdings APIs.

### 7. Day Change Accuracy (prevClose Pipeline)
Day change used PriceBars from Feb 25 (8 days stale). NVDA showed -$1,222 instead of +$30 because it compared current price ($183.34) to the Feb 25 close ($195.56). Fixed by:
- Adding `prevClose` to `Quote` interface and `LatestQuote` schema
- Tiingo IEX already provides `prevClose` in every response — now extracted and stored
- CoinGecko: derived as `price / (1 + usd_24h_change/100)`
- Holdings APIs: two-tier lookup (quote.prevClose → PriceBar fallback)

### 8. Charts Page 1D/1W Range Pills
Added `1D` and `1W` options to the CandlestickChart range selector.

## Technical Details

### prevClose Data Flow
```
Tiingo IEX response → { prevClose: 183.04 }
                          ↓
Quote interface → prevClose?: Decimal
                          ↓
upsertQuote() → LatestQuote.prevClose column
                          ↓
Holdings API → quote.prevClose ?? PriceBar.close (fallback)
                          ↓
dayChange = qty × (price - prevClose)
```

### Architecture Decisions
- **AD-S26-1**: prevClose in LatestQuote — providers supply it; storing is zero-cost
- **AD-S26-2**: CoinGecko 365-day cap — free tier limit
- **AD-S26-3**: Timeseries live today point — AD-S25-1 pattern extended
- **AD-S26-4**: Market history bar fallback — stale data > no data

## Files Changed

| File | Description |
|------|-------------|
| `apps/web/prisma/schema.prisma` | Added `prevClose Decimal?` to LatestQuote |
| `packages/shared/src/types/index.ts` | Added `prevClose?: Decimal` to Quote |
| `packages/market-data/src/cache.ts` | Updated record type, delegate, upsertQuote for prevClose |
| `packages/market-data/src/providers/tiingo.ts` | Extract prevClose from IEX in getQuote + getBatchQuotes |
| `packages/market-data/src/providers/coingecko.ts` | Derive prevClose from usd_24h_change in getQuote + getBatchQuotes |
| `packages/market-data/src/service.ts` | Pass prevClose through cacheQuote |
| `apps/web/src/app/api/portfolio/snapshot/route.ts` | changePct × 100 |
| `apps/web/src/app/api/portfolio/timeseries/route.ts` | Append live today point |
| `apps/web/src/app/api/portfolio/holdings/route.ts` | prevClose with fallback; position-level dayChange |
| `apps/web/src/app/api/portfolio/holdings/[symbol]/route.ts` | Same prevClose + fallback |
| `apps/web/src/app/api/market/history/route.ts` | 30-bar fallback on empty range |
| `apps/web/src/app/api/instruments/route.ts` | 365-day crypto cap; store prevClose |
| `apps/web/src/lib/auto-create-instrument.ts` | 365-day crypto cap |
| `apps/web/src/app/(pages)/page.tsx` | Refetch holdings after rebuild |
| `apps/web/src/components/holding-detail/CandlestickChart.tsx` | 1D/1W range options |

## Testing & Validation

| Gate | Result |
|------|--------|
| `pnpm tsc --noEmit` | Pass — 0 errors |
| `pnpm test` | Pass — 770 tests, 64 files |

Database verification:
- Confirmed 0 PriceBars for crypto before fix, 365 each after backfill
- Confirmed prevClose is NULL for all 95 existing quotes (awaiting scheduler cycle)
- Confirmed PriceBar fallback produces day change values in the interim

## Issues Encountered

1. **CoinGecko silent backfill failure** — 10-year range request returned 0 bars with no error. The catch clause logged but the user never saw it. Fixed by capping to 365 days.

2. **prevClose data gap** — After adding the schema column, all existing quotes have NULL prevClose. Initially removed the PriceBar fallback, causing day change to disappear entirely. Added the two-tier fallback pattern to handle the transition period.

3. **PriceBar staleness** — Equity PriceBars stop at Feb 25. The scheduler polls LatestQuotes but never fetches new daily bars. This is a pre-existing architectural gap.

## Outstanding Items

- **prevClose NULL for existing quotes** — Will populate on next scheduler cycle. PriceBar fallback active in the interim.
- **PriceBar staleness** — No mechanism to add new daily bars. Charts show data ending Feb 25. Not blocking but should be addressed.
- **PriceBar fallback unit tests (KL-PB)** — Deferred since S21.

## Next Steps

1. **ES re-verification** — Browser verification of all 8 fixes
2. **Verify prevClose population** — Confirm values appear after first scheduler cycle
3. **Scheduler daily bar fetch** — Add end-of-day PriceBar insertion to keep charts current
4. **Phase II close-out** — All epics complete; 17 UAT defects remediated across S24-S26
