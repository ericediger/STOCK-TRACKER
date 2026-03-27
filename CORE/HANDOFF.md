# HANDOFF.md — STOCKER

> **Purpose:** Session transition artifact. Written by the lead at the end of every session. Read first by the lead at the start of the next session — before AGENTS.md, before any code.
> **Replaces reading:** Do not re-read prior session plans or chat history. If it is not in this document, it is not guaranteed to be current.
> **Last Updated:** 2026-03-27 (Post-S28, Post-Reorganization Regression + UAT)
> **Session:** Session 28 — Post-Reorganization Regression & UAT Defect Fixes

---

## 1) Current State (One Paragraph)

Session 28 had two phases. Phase 1 verified and fixed the post-S27 repo reorganization: config files moved from `CORE/config/` to `CORE/` root, CI workflow updated with `working-directory: CORE`, `.gitignore` and `.git/info/exclude` updated for new structure, all documentation refreshed (`@stalker/*` → `@stocker/*`, CORE/ prefix). Phase 2 was UAT: 6 defects identified, 5 fixed. Symbol column sort cycle was stuck (asc→reset); fixed to asc→desc→reset. 1D snapshot startValue used stale carry-forward snapshots; fixed to use prevClose from LatestQuotes. Instruments with 0 transactions were invisible on the dashboard; now shown as zero-value entries. Add Instrument modal created duplicates on 409 conflict; now reuses existing instrument. Zod decimal validation rejected prices without leading zero (`.3109`); regex updated. CoinGecko 365-day history cap confirmed as provider limitation (not a bug). Quality gates green: 0 tsc errors, 770 tests pass, build succeeds.

---

## 2) What Happened This Session

### 2.1 Completed

**Phase 1 — Post-Reorganization Regression**

- **Config file relocation** — Moved `package.json`, `tsconfig.base.json`, `tsconfig.json` from `CORE/config/` to `CORE/` root. All package tsconfig `extends` paths now resolve correctly.
- **CI workflow update** — Added `working-directory: CORE` and `cache-dependency-path: CORE/pnpm-lock.yaml`.
- **`.gitignore` modernization** — Removed stale path-specific patterns, added generic and CORE/-aware patterns.
- **`.git/info/exclude` update** — Updated for CORE/ structure per AD-S28-1.
- **Documentation refresh** — README.md (full rewrite), CLAUDE.md, AGENTS.md (all `@stalker/*` → `@stocker/*`, CORE/ prefix), DECISIONS.md (AD-S28-1 added).

**Phase 2 — UAT Defect Fixes**

- **Symbol sort fix** — Sort cycle was asc→reset (stuck on symbol column because default IS symbol/asc). Fixed to asc→desc→reset.
- **1D snapshot startValue** — Used stale carry-forward snapshot ($220K). Now recomputes using `prevClose` from LatestQuotes for the 1D window specifically.
- **Holdings visibility** — Instruments with 0 transactions now appear on the dashboard as zero-value entries with live quote prices.
- **Add Instrument 409 handling** — When instrument already exists, modal now reuses existing instrument for transaction creation instead of showing a dead-end error.
- **Zod decimal validation** — Regex `^\d+(\.\d+)?$` rejected `.3109` (no leading zero). Updated to `^\d*\.?\d+$`. Also: empty-string fees now transform to "0" before validation.
- **Error surfacing** — Add Instrument modal now shows actual API error messages in toast instead of generic fallback.

### 2.2 Quality Gates Run

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `pnpm tsc --noEmit` | Pass — 0 errors |
| Tests | `pnpm test` | Pass — 770 tests across 64 files |
| Build | `pnpm build` | Pass |
| PII Scrub | grep scan | Pass — no secrets or PII |

### 2.3 Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| AD-S28-1: Source code in CORE/, 5 docs pushed, HANDOFF+PROJECT-SPEC excluded | Separates operational code from project management artifacts | Lead Engineering |
| 1D startValue uses prevClose, not snapshot | Stale snapshots all have identical carry-forward values; prevClose gives accurate day change | Lead Engineering |
| All instruments shown on dashboard (including qty=0) | User expects to see tracked instruments regardless of transaction history | Lead Engineering |

### 2.4 What Was Not Completed

- **CoinGecko 365-day history cap** — User's XRP transaction is from 2019 but CoinGecko free tier caps history at 365 days. This is a provider limitation, not fixable without a paid plan or alternative provider.
- **Flat chart from March 5** — Root cause is PriceBars end at March 5 (scheduler doesn't write daily bars). Requires scheduler daily bar fetch feature.
- **1W+ windows still use stale snapshot startValues** — Only 1D was fixed (using prevClose). 1W and longer windows still use carry-forward snapshot data.

---

## 3) Active Blockers and Open Items

### Blockers

None.

### Open items

- **PriceBar staleness** — Equity PriceBars stop at Feb 25, crypto at Mar 5. Scheduler needs end-of-day PriceBar insertion.
- **1W+ snapshot startValues stale** — All snapshots from Mar 5 onward carry the same value. Need daily PriceBars to fix.
- **PriceBar fallback unit tests (KL-PB)** — Still deferred.
- **CoinGecko history cap (KL-7)** — 365-day limit on free tier. Crypto charts can't show pre-2025 data.

---

## 4) Risks Surfaced This Session

- **Stale PriceBars degrade all time-windowed views** — Without daily PriceBar refresh, 1W/1M/3M/1Y windows all show the same stale change values. This is the highest-priority item for the next session.

---

## 5) Next Session

### 5.1 Recommended Scope

1. **Scheduler daily bar fetch** — Add end-of-day PriceBar insertion to the scheduler so charts and snapshots stay current. This is the #1 priority — it fixes flat charts, stale snapshots, and incorrect 1W+ window values.
2. **Snapshot rebuild trigger** — After daily bars are written, trigger a snapshot rebuild to update portfolio values.
3. **Re-backfill stale instruments** — Run a one-time backfill to fill the gap from March 5 to today.

### 5.2 Roles to Staff

| Role | Required / Optional | Notes |
|------|---------------------|-------|
| Lead Engineering | Required | Scheduler feature work |

### 5.3 Context to Load

1. This file (done).
2. `CORE/session read-ins/CLAUDE.md` — coding rules and architecture.
3. `CORE/packages/scheduler/src/poller.ts` — current scheduler implementation.

### 5.4 Epic Status Summary

| Epic | Status | Session |
|------|--------|---------|
| All Phase I+II Epics | Complete | S17-S24 |
| UAT Defects | 22 remediated (S24-S26: 17, S28: 5) | S28 |
| Repo Reorganization | Complete | S28 |

---

## 6) Escalations Pending Human Decision

No new escalations.

---

## 7) Agent Team Notes

### Teammates Spawned

3 parallel Explore agents for UAT investigation (XRP, sort, chart/snapshot). Solo execution for fixes.

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
| Sessions completed | 28 |
| UAT defects remediated | 22 (S24-S26: 17, S28: 5) |

---

*Handoff written by: Lead Engineering*
*Next session starts: On-demand*
