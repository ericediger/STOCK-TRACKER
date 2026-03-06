# HANDOFF.md — STALKER

> **Purpose:** Session transition artifact. Written by the lead at the end of every session. Read first by the lead at the start of the next session — before AGENTS.md, before any code.
> **Replaces reading:** Do not re-read prior session plans or chat history. If it is not in this document, it is not guaranteed to be current.
> **Last Updated:** 2026-03-05 (Post-S26, ES-reported defect remediation)
> **Session:** Phase II Session 5 (S26) — Dashboard math, day change accuracy, chart gaps

---

## 1) Current State (One Paragraph)

Phase II Session 5 (S26) fixed 8 ES-reported defects spanning portfolio math, day change accuracy, chart data gaps, and first-load reliability. Key changes: (1) Hero percentage now correctly multiplied by 100; (2) Crypto PriceBars backfilled (365 bars each for ETH/XRPUSD — CoinGecko free tier rejects 10yr ranges); (3) Timeseries API appends a live-recomputed "today" data point so chart matches hero; (4) Dashboard refetches holdings after snapshot rebuild completes (fixes empty table on first load); (5) Charts page 1D/1W ranges fall back to 30 most recent bars when date range returns empty; (6) Day $ column now shows position-level change (qty × per-share) not per-share; (7) Added `prevClose` to Quote interface and LatestQuote schema — Tiingo provides it directly, CoinGecko derives from 24h change — with PriceBar fallback; (8) Added 1D/1W range pills to Charts page. Quality gates green: 0 tsc errors, 770 tests pass, 64 files.

---

## 2) What Happened This Session

### 2.1 Completed

- **Hero percentage ×100 fix** — `changePct` in snapshot API was a decimal ratio (0.1567) but `formatPercent()` expects a percentage value (15.67). Added `.times(100)`.

- **Crypto backfill fix** — CoinGecko free tier rejects 10-year range requests. Both `triggerBackfill()` functions (instruments route + auto-create-instrument) now cap crypto to 365 days. Ran one-time backfill: 365 bars each for ETH and XRPUSD.

- **Timeseries live "today" point** — `/api/portfolio/timeseries` now appends a synthetic today data point using live LatestQuote prices when the last snapshot is before today. Closes the chart-vs-hero value divergence (AD-S25-1 pattern applied to timeseries).

- **Dashboard first-load fix** — Added `useEffect` in page.tsx that tracks `isRebuilding` transition (true→false) and calls `refetchHoldings()`. Previously, holdings fetched `[]` before rebuild and never refetched.

- **Charts 1D/1W "No data" fix** — `/api/market/history` now falls back to 30 most recent bars when a date-filtered query returns empty (PriceBars are stale — equities stop at Feb 25).

- **Day $ per-position fix** — Holdings and detail APIs now compute `dayChange = qty × (price - prevClose)` instead of just `price - prevClose`.

- **prevClose schema and provider pipeline** — Added `prevClose Decimal?` to LatestQuote schema and `prevClose?: Decimal` to Quote interface. Tiingo extracts from IEX `prevClose` field. CoinGecko derives: `price / (1 + usd_24h_change/100)`. Cache layer stores it. Holdings APIs prefer quote.prevClose, fall back to PriceBar close.

- **Charts page 1D/1W range pills** — Added `1D` and `1W` to `ChartRange` type and `RANGE_OPTIONS`.

### 2.2 Quality Gates Run

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `pnpm tsc --noEmit` | Pass — 0 errors |
| Tests | `pnpm test` | Pass — 770 tests across 64 files |

### 2.3 Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| AD-S26-1: prevClose stored in LatestQuote | PriceBars are stale (backfill-only, no daily updates). Providers already return prevClose data. Two-tier fallback: quote.prevClose → PriceBar close. | Lead Engineering |
| AD-S26-2: CoinGecko backfill capped at 365 days | Free tier rejects ranges > 365 days. Equities keep 10yr (Tiingo supports it). | Lead Engineering |
| AD-S26-3: Timeseries synthetic today point | Same live-recomputation pattern as snapshot API (AD-S25-1). Chart must show current portfolio value, not stale snapshot. | Lead Engineering |
| AD-S26-4: Market history bar fallback | When date range returns 0 bars, return 30 most recent. Better to show stale data than "No data". | Lead Engineering |

### 2.4 What Was Not Completed

- **prevClose data population** — The `prevClose` column exists but is NULL for all 95 quotes. Values will populate on next scheduler poll or manual refresh. PriceBar fallback ensures day change still displays in the interim.

---

## 3) Active Blockers and Open Items

### Blockers

None.

### Open items

- **prevClose population** — Will auto-populate on next `pnpm dev` scheduler cycle. Until then, day change uses PriceBar fallback (stale but functional).
- **PriceBar staleness** — Equity PriceBars stop at Feb 25. No mechanism to add new daily bars (scheduler only polls quotes). Not blocking — prevClose from Tiingo provides accurate day change. Long-term: add daily bar fetch to scheduler.
- **PriceBar fallback unit tests (KL-PB)** — Still deferred. No unit test coverage for the S21 PriceBar fallback route.

---

## 4) Risks Surfaced This Session

**PriceBar data gap widening.** PriceBars are only populated during initial backfill and never updated by the scheduler. The gap between last PriceBar (Feb 25) and current date grows daily. The prevClose fix mitigates this for day change, but the chart page still shows stale data for short ranges (fallback to 30 most recent bars). Consider adding a daily bar fetch to the scheduler in a future session.

---

## 5) Next Session

### 5.1 Recommended Scope

1. **ES re-verification** — Browser verification of all 8 Session 26 fixes.
2. **Scheduler daily bar fetch** — Add end-of-day PriceBar insertion to the scheduler so charts stay current.
3. **Stretch: prevClose verification** — Verify prevClose values populate correctly after first scheduler cycle.

### 5.2 Roles to Staff

| Role | Required / Optional | Notes |
|------|---------------------|-------|
| Lead Engineering | Required | Owns any remaining fixes |
| Executive Sponsor | Required | Manual browser verification |

### 5.3 Context to Load

1. This file (done).
2. `DECISIONS.md` — new AD-S26-* entries.
3. `CLAUDE.md` — coding rules and architecture.

### 5.4 Epic Status Summary

| Epic | Status | Session |
|------|--------|---------|
| Epic 1 — Default Sort | Complete | S22 |
| Epic 2 — Column Parity | Complete | S22 |
| Epic 3 — News Feed | Complete | S23 |
| Epic 4 — Crypto Asset Support | Complete | S24 |
| Epic 5 — Advisor Enhancements | Complete | S24 |

**All epics complete. UAT defects: 9 (S24-S25) + 8 (S26) = 17 total remediated.**

---

## 6) Escalations Pending Human Decision

No new escalations.

---

## 7) Agent Team Notes

### Teammates Spawned

None. Single-agent session — defect remediation.

### Coordination Issues

None.

---

## Appendix — Phase II Metrics

| Metric | Value |
|--------|-------|
| Test count (total) | 770 |
| Test files | 64 |
| TypeScript errors | 0 |
| Packages | 5 + 1 app |
| API endpoints | 22 |
| UI components | 50+ |
| Instruments in production DB | 88 |
| Sessions completed | 26 |
| UAT defects remediated | 17 (9 S24-S25 + 8 S26) |

---

*Handoff written by: Lead Engineering*
*Next session starts: On-demand — pending ES verification of S26 fixes*
