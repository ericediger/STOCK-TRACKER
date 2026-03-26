# MASTER-PLAN-UPDATE-S15.md — Changes to Apply

When updating STOCKER_MASTER-PLAN.md to v5.0, apply these changes:

## Session Status Tracker — Add Row

| 15 | 11 (completion) + 13 | Quote pipeline unblock (Tiingo IEX batch), dashboard scale UX | Lead + 1 parallel | 🟡 Planned |

## Dependency Chain — Append

```
Session 14 (Data Integrity + Rebuild Perf + UAT Sweep) ✅
    └──→ Session 15 (Quote Pipeline Unblock + Scale UX) ← NEXT
              └──→ Visual Browser UAT (human)
                        └──→ Production use
```

## Architecture Decisions — Add

| AD-S15-1 | S15 | Tiingo IEX batch as primary quote source for scheduler polling | 1 API call = all instruments. FMP reserved for search + single-symbol fallback. |
| AD-S15-2 | S15 | Dashboard shows top 20 holdings by allocation | 83 rows below the fold defeats "health at a glance" design goal. |
| AD-S15-3 | S15 | Staleness banner adapts text based on stale ratio | "80 stale" reads as failure. "Prices updating — 3 of 83 refreshed" reads as progress. |
| AD-S15-4 | S15 | Quote chain: Tiingo batch → FMP single → AV single → cache | Cheapest per-instrument first. FMP/AV as fallbacks. |

## Provider Architecture — Update

### Provider Chain (Updated S15)

```
Symbol Search:    FMP only
Real-time Quotes: Tiingo IEX (batch) → FMP (single) → AV (single) → cache
Historical Bars:  Tiingo only
```

### Budget Impact

| Before (S14) | After (S15) |
|---|---|
| 83 instruments × FMP single = 83 calls/poll | 83 instruments × Tiingo batch = 1 call/poll |
| ~3 polls/day (250 FMP budget ÷ 83) | ~13 polls/day (30min × 6.5hrs market) |
| Full population: ~1 trading day | Full population: first poll cycle (~30 sec) |

## Risks — Add

| R-S15-1 | Tiingo IEX doesn't cover mutual funds/foreign instruments | Medium | Medium | FMP single-symbol fallback. |

## Lessons — Add (post-session)

| L-11 | Design for 4× the planned instrument count. | System designed for 15-20 instruments hit 83 in real use. Budget math, UX patterns, and table layouts all broke at scale. |
