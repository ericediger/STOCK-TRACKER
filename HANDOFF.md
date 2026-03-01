# HANDOFF.md — STALKER

> **Purpose:** Session transition artifact. Written by the lead at the end of every session. Read first by the lead at the start of the next session — before AGENTS.md, before any code.
> **Replaces reading:** Do not re-read prior session plans or chat history. If it is not in this document, it is not guaranteed to be current.
> **Last Updated:** 2026-03-01
> **Session:** Phase I Close / Phase II Planning → Phase II Session 1 (S22)

---

## 1) Current State (One Paragraph)

STALKER Phase I is complete across 21 sessions with zero scope cuts. The application is a production-ready, local-first portfolio tracker running on SQLite via Prisma, Next.js 15 App Router, a standalone scheduler, three market data providers (FMP, Tiingo, Alpha Vantage), and a fully operational five-tool LLM advisor. The real portfolio contains 83 instruments, 87 transactions, and approximately 53,600 price bars. Session 21 resolved seven IAT issues (data correctness bugs, performance blockers, and missing features), and the codebase is at 720 tests passing across 62 files with zero TypeScript errors. Phase II has been formally scoped: `PROJECT-SPEC.md` is authored and in Active status (M0 approved), defining four confirmed epics derived from UAT findings and one blocked epic awaiting Executive Sponsor input. Two S21 items remain unresolved and are hard blockers for Phase II Session 1 — they must be cleared by the Executive Sponsor before any coding begins. See §6 for the formal escalations.

---

## 2) What Happened This Session

### 2.1 Completed

- **S21 Product Summary Report reviewed** — Seven IAT issues confirmed resolved in code across three categories: data bugs (PriceBar fallback, APLD price, XRP triage), performance (non-blocking rebuild, surgical refetch on instrument add), and features (detail page metrics expansion to 12 fields, Google News external link component).

- **UAT conducted on five proposed enhancements** — Executive Sponsor performed manual testing and confirmed four of the five enhancements represent genuine gaps in the live application. The news feature shipped in S21 as a single external link; UAT determined the product intent is an embedded card/list feed. The advisor enhancement request remains valid but is blocked on ES-provided inputs.

- **Phase II named and scoped** — The enhancement work is formally designated Phase II to distinguish it from Phase I (Sessions 1–21) and the prior informal use of "Phase II" in `STALKER_PHASE-II_ADDENDUM.md` (which described provider architecture corrections in S11–S15). The agentic team is being rebuilt concurrently under the Agent Ops Framework.

- **`SPEC_S22_Enhancement_PRD.md` produced** — Engineering-ready product requirements document covering all four confirmed gap items: news feed card/list UI (`GET /api/holdings/[symbol]/news`, GNews integration, skeleton loading, fallback states), default sort (symbol A-Z, URL state, sort indicator), column parity (Current Price, Realized PnL, Avg Cost fields on detail page, revised 4×4 grid layout), and crypto asset support (CoinGecko provider, `CRYPTO` instrument type, scheduler partitioning, chart adaptation). Located at `SPEC_S22_Enhancement_PRD.md` in the project outputs.

- **`PROJECT-SPEC.md` authored and approved at M0** — Full spec in the Agent Ops Framework template. Defines five epics, product-level acceptance criteria (AC-F-01 through AC-F-09, AC-NF-01 through AC-NF-05, AC-Q-01 through AC-Q-06), non-functional requirements, five release milestones (M0 through M_Release), definition of done, explicit out-of-scope list, and external dependency table. Epic 5 (Advisor Enhancements) is formally blocked pending ES inputs. Located at `PROJECT-SPEC.md` in the project outputs.

- **`HANDOFF.md` restructured** — The Phase I HANDOFF.md (written for human-led sessions) has been replaced with this document, conforming to the Agent Ops Framework `HANDOFF_TEMPLATE.md` structure. All Phase I state, metrics, and architecture decisions are preserved below in §2.3 and the appendix.

### 2.2 Quality Gates Run

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `pnpm typecheck` | ✅ Pass — 0 errors (confirmed S21 close) |
| Tests | `pnpm test` | ✅ Pass — 720 tests across 62 files (confirmed S21 close) |
| Lint / format | `pnpm lint` | ✅ Pass (confirmed S21 close) |
| Build | `pnpm build` | ✅ Pass (confirmed S21 close) |
| Manual browser UAT | Four S21 flows | ⚠️ **Not yet run** — required before Phase II S1 begins. See §3 Blockers. |

> The automated gates reflect S21 close state reported by engineering. The manual browser UAT has not been performed as of this handoff — it is a hard blocker for Phase II Session 1. The next session lead must not begin any coding work until the Executive Sponsor confirms the four UAT flows have passed.

### 2.3 Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| Phase II designation adopted | Distinguishes the current enhancement work from Phase I (S1–S21) and the prior informal "Phase II" label in `STALKER_PHASE-II_ADDENDUM.md`. Scoped to four UAT-confirmed gaps plus one blocked advisor epic. | Executive Sponsor |
| UAT is the authoritative gate for feature status | PM analysis of code state alone is insufficient to declare a feature complete. Only Executive Sponsor UAT against the live application determines whether product intent is met. Applied retroactively to correct an error in the initial PM analysis of the S21 news feature. | Product (PM) |
| News feature gap confirmed by UAT | The S21 `LatestNews.tsx` component (single external link) does not meet product intent. Epic 3 replaces it with an embedded card/list feed via GNews API with a graceful fallback. | Executive Sponsor (UAT finding) |
| GNews API selected for news feed | Free tier (100 req/day) is sufficient for single-user use. Query constructed from instrument `name` field (quoted, 90-day window). Key optional — fallback to Google News link card preserves S21 behavior when key is absent. | Product (PM) |
| CoinGecko selected as crypto provider | No API key required for free public tier. 100 req/min unauthenticated. Supports search, real-time quotes (batch-capable), and full price history via `/market_chart/range`. Consistent with free-tier-first provider philosophy. Coin ID stored in `providerSymbolMap.coingecko`. | Product (PM), confirmed AD-S22-1 |
| Crypto instruments use UTC timezone, exchange = "CRYPTO" | No exchange-session semantics apply to crypto. `MarketCalendar.isTradingDay()` returns `true` unconditionally for CRYPTO type. Avoids creating a crypto-specific calendar concept. | Product (PM), confirmed AD-S22-2 |
| Crypto chart uses area/line series, not candlestick | CoinGecko free tier provides close price only — no OHLC data. Area chart is accurate to the available data. Candlestick requires paid tier; deferred post-Phase II. | Product (PM), confirmed AD-S22-3 |
| Crypto scheduler path is partitioned, not merged | CRYPTO instruments must not be gated by NYSE market hours. Separate polling path (CoinGecko batch) runs unconditionally at each 30-minute cycle. Equity path (Tiingo batch, NYSE-gated) is unchanged. | Product (PM), confirmed AD-S22-4 |
| Day Change label reads "24h Change" for CRYPTO instruments | CoinGecko reports rolling 24-hour change, not session-based change. Label must be accurate to prevent user confusion. | Product (PM), confirmed AD-S22-5 |
| Epic 5 (Advisor Enhancements) formally blocked | `@stalker/advisor` is architecturally complete and in production. No engineering work may begin until ES provides: custom system prompt text, model selection, and placement UI specification. Blocking is a hard framework rule — not a deferral. | Product (PM) |
| `PROJECT-SPEC.md` status set to Active (M0 approved) | Spec is complete, reviewed, and approved by Executive Sponsor. Phase II sessions may begin once S21 blockers are cleared. | Executive Sponsor |

> Architecture decisions AD-S22-1 through AD-S22-5 are formally adopted in this planning session. They must be recorded in the project `DECISIONS.md` (or equivalent) at Phase II Session 1 close.

### 2.4 What Was Not Completed

- **Manual browser UAT (S21 four flows)** — Required before Phase II begins. Cannot be performed in a planning session. Owner: Executive Sponsor. See §3.
- **XRP data decision** — The Executive Sponsor has not yet confirmed whether the intended asset is XRP crypto or the Bitwise XRP ETF. Decision determines whether the existing XRP instrument record must be deleted before Epic 4 ships. See §6.
- **`GNEWS_API_KEY` status** — ES has not confirmed whether the key is available or whether fallback mode is the acceptable initial state for Epic 3. See §6.
- **Epic 5 inputs** — Custom system prompt, model selection, and placement UI specification have not been provided. Epic 5 cannot be scoped until received. See §6.
- **Test count reconciliation** — The test count moved from 683 to 720 between sessions with no new tests explicitly added in S21. Source of the 37 additional tests should be confirmed with a fresh `pnpm test` run. Owner: Engineering. This is an open item, not a blocker.
- **PriceBar fallback unit tests** — No unit test coverage exists for the S21 PriceBar fallback route. Prisma mocking is required. Deferred to Phase II Session 1 backlog. Owner: Engineering.
- **`HANDOFF.md` and `KNOWN-LIMITATIONS.md` update** — The Phase I versions of these documents have been superseded by this document and the Phase II `PROJECT-SPEC.md`. Engineering must add the new PriceBar fallback limitation entry to `KNOWN-LIMITATIONS.md` at Phase II Session 1 open.

---

## 3) Active Blockers and Open Items

### Blockers — resolve before starting Phase II Session 1

- **S21 manual browser verification:** Four UAT flows must be confirmed by the Executive Sponsor with `pnpm dev` before any Phase II coding begins: (1) APLD detail page shows a real price, not $0; (2) portfolio loads without a blocking spinner; (3) adding an instrument does not trigger a full page reload; (4) news link opens correctly in a new tab. Estimated time: 10 minutes. If any flow fails, engineering must fix before Phase II proceeds. Owner: Executive Sponsor.

- **XRP data decision:** The asset currently stored as "Bitwise XRP ETF" must be confirmed as either (a) correct as-is (ETF was always the intent — no action required) or (b) incorrect (XRP crypto was the intent — existing record must be deleted before Epic 4 ships). The asset cannot remain in an ambiguous state. Owner: Executive Sponsor. Decision must be documented in §6 before Phase II Session 1 closes.

### Open items — resolve during or after Phase II Session 1

- **`GNEWS_API_KEY` provision or fallback confirmation:** Epic 3 can begin with the fallback mode active (Google News link card, matching current S21 behavior). If the ES wants the full card feed from day one, the key must be provided before Epic 3 is coded. Engineering does not need the key to build the feature — fallback mode is a first-class state. Owner: Executive Sponsor.

- **Test count reconciliation (683 → 720):** Run a fresh `pnpm test` and confirm the source of the 37 additional tests. Likely pre-existing tests that were not previously running; document the source. Owner: Engineering. Non-blocking.

- **PriceBar fallback unit tests:** Add to Phase II Session 1 scope. Prisma mocking is required. Owner: Engineering. Non-blocking for Epic 1 and 2 start; should be complete before Epic 4 closes.

- **`KNOWN-LIMITATIONS.md` update:** Add the new PriceBar fallback limitation (zero unit test coverage) as an open entry. Owner: Engineering. Complete at Phase II Session 1 open.

---

## 4) Risks Surfaced This Session

**`instrument.type` audit risk (Epic 4).** The `CRYPTO` enum value is additive, but any existing switch/case or if/else on `instrument.type` in the 62-file codebase that lacks a default or explicit CRYPTO branch could produce silent incorrect behavior for equity instruments. This audit is mandatory and has been written into the Epic 4 exit criteria in `PROJECT-SPEC.md §3`. It must be documented in the session report before Epic 4 closes. Failure to perform the audit is the most likely source of a post-Phase II regression.

**GNews API rate limit at scale.** The GNews free tier allows 100 requests per day. With a single user checking 83 instruments and a 30-minute cache per instrument, the worst-case daily call volume is 83 × (24hr ÷ 0.5hr cache) = 3,984 — well above the free tier limit. In practice the user visits a small number of holding detail pages per session, making actual usage far lower. However, if usage patterns change, this limit will bind. The 30-minute cache is the primary mitigation; a secondary mitigation is the fallback link card, which requires zero API calls. This should be logged as a known limitation alongside KL-5 and KL-6.

**Schema migration on live data (Epic 4).** The `Instrument.type` enum expansion is the only schema migration in Phase II. The database contains real user data (83 instruments, 87 transactions, 53,600+ price bars). Engineering must generate and review the Prisma migration SQL before applying it. A dry-run against a copy of `portfolio.db` is strongly recommended before the live migration. This is not a blocker but is a process requirement.

**CoinGecko unauthenticated rate limit change.** CoinGecko has historically adjusted free-tier rate limits without notice. The 100 req/min unauthenticated limit is current as of the planning date but is an external dependency the team cannot control. The in-process rate limiter (`COINGECKO_RPM=100`) mitigates this within the session; the external change risk should be logged as KL-7 in `KNOWN-LIMITATIONS.md`.

---

## 5) Next Session

### 5.1 Recommended Scope

**Phase II Session 1 objective:** Close the two S21 blockers (manual UAT verification and XRP decision), then execute Epics 1 and 2 in full within the same session. Epics 1 (default sort) and 2 (column parity) share no file-level conflicts and are both low-to-medium risk with no external dependencies. They are the correct starting point — they deliver immediate, visible improvements and establish that the Phase II coding loop is working cleanly before the external-dependency work (Epic 3: GNews) and schema-migration work (Epic 4: crypto) begin.

Additionally at session open: run `pnpm test` to reconcile the 683→720 test count delta, and update `KNOWN-LIMITATIONS.md` with the PriceBar fallback coverage gap.

Do not begin Epic 3 or Epic 4 in this session unless Epics 1 and 2 are fully complete, UAT-verified, and all quality gates are passing. If capacity remains after Epics 1 and 2, the lead may begin Epic 3 scoping but should not write code until the GNEWS_API_KEY status is confirmed.

### 5.2 Roles to Staff

| Role | Required / Optional | Notes |
|------|---------------------|-------|
| Lead Engineering | Required | Owns all Phase II Session 1 execution. Solo mode is appropriate for Epics 1 and 2 given low complexity and no parallelism benefit. |
| Lead Product | Required at epic close | Conducts joint review with Lead Engineering after each epic closes to verify exit criteria, assess downstream session impact, and update HANDOFF.md §5 before the next session begins. Not required during active coding. |
| BA | Optional | Not needed for Epics 1 and 2. Required for Epic 5 scoping once ES inputs are received. |

### 5.3 Context to Load

1. This file (done).
2. `PROJECT-SPEC.md` — read §3 (Epics 1 and 2 scope and exit criteria), §4 (AC-F-01 through AC-F-03, AC-Q-01 through AC-Q-03), and §6 (operating model and session-to-session governance). These are the validation anchors for Phase II Session 1.
3. `DECISIONS.md` — read in full before writing any code. If a decision exists covering an area you are about to implement, follow it and cite the decision ID in your session output. Record any new decisions made this session at session close.
4. `SPEC_S22_Enhancement_PRD.md` — Section 2 (default sort) and Section 3 (column parity) for engineering-level implementation detail.
5. `AGENTS.md` (project) — operating rules, guardrails, quality gate commands.
6. `KNOWN-LIMITATIONS.md` — update at session open before coding begins (add PriceBar fallback coverage gap).
7. `apps/web/src/components/holding-detail/PositionSummary.tsx` — current 12-field implementation; starting point for Epic 2 expansion.
8. `apps/web/src/app/(pages)/page.tsx` and `/holdings/page.tsx` — current sort implementation; starting point for Epic 1.
9. `apps/web/src/app/api/portfolio/holdings/[symbol]/route.ts` — confirm whether `realizedPnl` is in the response (Epic 2 entry criterion).

### 5.4 Session Contract Starting Points

> **Epic close protocol:** When each epic's exit criteria are satisfied, Lead Engineering and Lead Product conduct a joint review before the next session begins. They verify exit criteria against `PROJECT-SPEC.md §3`, assess whether any discovery or technical debt requires amendment to subsequent epic scope, record any decisions in `DECISIONS.md`, and update HANDOFF.md §5 before the next session contract is issued. If a required amendment carries product authority implications, it is escalated to the ES as a Category B item. All other scope adjustments are resolved by the leads and documented.

```
Epic 1 — Default Sort

- Objective:       Set the default sort on the dashboard and holdings page
                   holdings tables to symbol ascending (A-Z). Apply to
                   initial render and background data refreshes. Reflect
                   sort state in URL query params.
- Role:            Lead Engineering
- Mode:            Solo
- Comms policy:    Direct (single agent, no coordination overhead)
- File scope:
    Allowed:       apps/web/src/app/(pages)/page.tsx
                   apps/web/src/app/(pages)/holdings/page.tsx
                   apps/web/src/components/ (table components only)
    Forbidden:     packages/*, apps/web/src/app/api/*, schema.prisma
- Deliverables:    Holdings table on / defaults to symbol A-Z.
                   Holdings table on /holdings defaults to symbol A-Z.
                   Sort state in URL params (?sort=symbol&dir=asc).
                   Ascending sort indicator on symbol column header.
                   pnpm test passes. TypeScript 0 errors.
                   Any new decisions recorded in DECISIONS.md.
- Stop conditions: Pause and surface to Lead Product if sort change
                   requires API modification (it should not).
```

```
Epic 2 — Column Parity

- Objective:       Add Current Price, Realized PnL, and Average Cost Per
                   Share to the holding detail page position summary grid.
                   Expand grid from 3×4 to 4×4. Apply staleness label to
                   Current Price when provider is 'price-history'.
- Role:            Lead Engineering
- Mode:            Solo
- Comms policy:    Direct
- File scope:
    Allowed:       apps/web/src/components/holding-detail/PositionSummary.tsx
                   apps/web/src/lib/hooks/useHoldingDetail.ts
                   apps/web/src/app/api/portfolio/holdings/[symbol]/route.ts
                   (only if realizedPnl is confirmed absent from response)
    Forbidden:     packages/analytics/* (FIFO engine — read only, not modified)
                   schema.prisma
- Deliverables:    Current Price field with staleness label variant.
                   Realized PnL field (neutral color for zero-sell state).
                   Avg Cost field (computed at render, no new DB query).
                   4×4 grid layout with reserved empty 16th cell.
                   All values right-aligned, tabular-nums, U+2212 for negatives.
                   pnpm test passes. TypeScript 0 errors.
                   Any new decisions recorded in DECISIONS.md.
- Stop conditions: Pause and surface to Lead Product if realizedPnl
                   requires a new analytics computation not already
                   present in the FIFO engine output. Confirm before
                   adding new database queries.
```

> After both epics complete: Lead Engineering and Lead Product conduct joint review per the protocol above before Epic 3 session contract is issued.

---

## 6) Escalations Pending Human Decision

> **Operating model note:** The Executive Sponsor does not manage sessions. The items below are genuine product authority decisions that only the ES can make. All other decisions — session scope, team staffing, task sequencing, epic scope adjustments within spec bounds — are resolved autonomously by the joint Lead Engineering and Lead Product review after each epic close. Agents must not escalate those categories to the ES.

| Item | Decision needed | From whom | By when | Resolution |
|------|----------------|-----------|---------|------------|
| **S21 manual browser verification** | ES must run the four UAT flows (`pnpm dev`) and confirm pass or report failures: (1) APLD detail page shows real price, not $0; (2) portfolio loads without blocking spinner; (3) instrument add does not trigger full page reload; (4) news link opens in new tab. If any flow fails, engineering resolves before Phase II coding begins. | Executive Sponsor | Before Phase II Session 1 begins — hard blocker | **RESOLVED (2026-03-01).** All four UAT flows confirmed pass by ES. Phase II Session 1 may proceed. |
| **XRP data decision** | Confirm whether the asset stored as "Bitwise XRP ETF" is (a) correct as-is (no action) or (b) intended to be XRP crypto (existing record must be deleted before Epic 4 ships). | Executive Sponsor | Before Epic 4 begins — hard blocker for Epic 4 entry | **RESOLVED (2026-03-01).** XRP instrument record deleted. Will be re-added via the new crypto Add Instrument flow after Epic 4 ships. No further action required before Epic 4 begins. |
| **`GNEWS_API_KEY` provision** | Confirm whether the key is available and should be provided now, or whether fallback mode (Google News link card, current S21 behavior) is the acceptable initial state for Epic 3. Engineering builds the feature either way; the key is required only to activate the GNews card feed rather than the fallback. | Executive Sponsor | Before Epic 3 begins — non-blocking for Epics 1 and 2 | **RESOLVED (2026-03-01).** Key provided by ES. To be added to `.env.local` and `.env.example` per Epic 3 spec. |
| **Epic 5 advisor inputs** | To scope Epic 5, provide: (1) custom system prompt text; (2) model selection (current default: `claude-sonnet-4-6`); (3) placement UI specification (current: FAB → slide-out panel). Epic 5 cannot be planned or started without all three. | Executive Sponsor | Before Epic 5 planning — non-blocking for Epics 1–4 | **RESOLVED (2026-03-01).** System prompt updated directly in `@stalker/advisor` package source. Model: `claude-sonnet-4-6` (unchanged). Placement: existing FAB to slide-out panel (unchanged). Epic 5 is unblocked — scope as verification and integration task, no design changes required. |

---

## 7) Agent Team Notes

### Teammates Spawned

Not applicable. This was a planning and documentation session, not a coded execution session. No agent teammates were spawned. No Agent Teams mode was used.

### Coordination Issues

None.

### Token Cost Observation

This session operated as a single PM agent in direct conversation with the Executive Sponsor. The appropriate mode for a planning and specification session is human-led, not agent-automated. Phase II Session 1 will be the first session to operate under the Agent Ops Framework bootstrap sequence.

---

## Appendix — Phase I State (Preserved from S21 HANDOFF.md)

### Infrastructure

- pnpm workspace monorepo with 7 packages (5 in `packages/`, 1 app, 1 root)
- TypeScript 5.9.3 with strict mode, zero errors
- Prisma 6.19.2 with SQLite — all 7 tables defined
- Vitest 3.2.4 — 720 tests passing across 62 files
- Next.js 15.5.12 App Router with all API routes and all UI pages (including advisor)
- Tailwind CSS 4.2 with PostCSS — dark financial theme via CSS `@theme` directives
- Zod v4 for input validation
- TradingView Lightweight Charts v5 for portfolio area chart and candlestick charts with transaction markers
- `.env.example` template with all environment variables
- `concurrently` wired: `pnpm dev` launches both Next.js and scheduler
- GitHub Actions CI: `.github/workflows/ci.yml` — type-check, test, build on push/PR to main
- `prefers-reduced-motion` CSS support gating all animations

### Packages

- `@stalker/shared` — Types (incl. `ProviderLimits.requestsPerHour`), Decimal.js utilities, ULID generation, constants
- `@stalker/analytics` — FIFO lot engine, PnL computation, sell validation, BatchPriceLookup, portfolio value series
- `@stalker/market-data` — 3 active providers (FMP, Tiingo, AV), NYSE holiday calendar, rate limiter, Tiingo IEX batch quotes, `pollAllQuotes()`
- `@stalker/advisor` — 5 tools, system prompt, context window management (token estimation, message windowing, rolling summaries), single message conversion pipeline
- `@stalker/scheduler` — Batch polling via `pollAllQuotes()`, budget-aware, graceful shutdown

### API Layer

22 endpoints, all implemented — no stubs remaining. All transaction writes enforce sell validation and snapshot invalidation. Advisor chat with 5-tool loop, context windowing, and rolling summary generation. Detail page API returns allocation, firstBuyDate, dayChange/dayChangePct.

### Real Portfolio State

- 83 instruments (all with proper names)
- 87 transactions
- ~53,600 price bars (12,748 added in S18 re-backfill)
- 813 portfolio value snapshots (Dec 2022 – present)

### Phase I Metrics

| Metric | Value |
|--------|-------|
| Test count (total) | 720 |
| Test files | 62 |
| TypeScript errors | 0 |
| Packages created | 5 of 5 |
| API endpoints | 22 (all implemented) |
| UI components | 50 (+1: LatestNews) |
| Data hooks | 12 |
| Utility modules | 19 |
| UI pages | 4 (Portfolio, Charts, Holding Detail, Settings) |
| Prisma tables | 7 of 7 |
| Market data providers | 3 active (FMP, Tiingo, AV) + 1 deprecated (Stooq) |
| Advisor tools | 5 |
| Snapshot rebuild | ~4s for 83 instruments |
| Sessions completed | 21 (zero scope cuts) |

### Service Health

Both processes start via `pnpm dev`. Database at `apps/web/data/portfolio.db`. Seed with `cd apps/web && npx prisma db seed`.

Environment variables required in `apps/web/.env.local`:

| Variable | Purpose |
|----------|---------|
| `FMP_API_KEY` | Financial Modeling Prep — search and single-symbol fallback quotes |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage — backup quotes |
| `TIINGO_API_KEY` | Tiingo — batch quotes and historical bars |
| `TIINGO_RPH=50` | Tiingo requests per hour |
| `TIINGO_RPD=1000` | Tiingo requests per day |
| `ANTHROPIC_API_KEY` | LLM advisor |

Phase II adds:

| Variable | Purpose |
|----------|---------|
| `COINGECKO_RPM=100` | CoinGecko free tier — requests per minute (no key required) |
| `GNEWS_API_KEY` | GNews — news feed card list (fallback active if absent) |

### Known Limitations (Current as of Phase I Close)

| ID | Limitation | Mitigation |
|----|-----------|------------|
| KL-4 | Bulk paste date conversion uses noon UTC — timezone-specific trading times not captured | Acceptable for daily-resolution data. Matches existing single-transaction pattern. |
| KL-5 | Single provider for historical price bars (Tiingo only) — no fallback if Tiingo is unreachable | Existing bars in the database are unaffected. No free-tier alternative available. |
| KL-6 | Rate limiter is in-process only — scheduler and Next.js maintain separate states | Single user, low frequency. Post-Phase II: track calls in a `ProviderCallLog` table. |
| NEW (unnamed) | PriceBar fallback route has zero unit test coverage | Add to Phase II Session 1 scope. Prisma mocking required. |

KL-7 (CoinGecko single-provider dependency) to be added to `KNOWN-LIMITATIONS.md` at Epic 4 close.

### Architecture Decisions — S21

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-S21-1 | PriceBar fallback with `provider: 'price-history'` discriminator | Reuses existing `latestQuote` response shape without breaking the API contract. Provider field lets UI distinguish live quotes from historical fallbacks. |
| AD-S21-2 | Non-blocking rebuild: render stale data, rebuild in background | Eliminates 4–30s blocking page loads. Users see data immediately. |
| AD-S21-3 | Day change computed from 2nd-most-recent PriceBar (`skip: 1`) | Compares current mark price to previous trading day's close. Consistent with brokerage convention. |
| AD-S21-4 | Google News URL construction, no backend | Zero API cost, no rate limits, no key management. Quoted company name plus 90-day window surfaces relevant results. MVP-appropriate scope. |

### Architecture Decisions — Phase II Planning (Pending formal recording in DECISIONS.md at Phase II S1 close)

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-S22-1 | CoinGecko selected as crypto provider (unauthenticated free tier) | No key required. 100 req/min. JSON REST API. Coin ID system well-documented. Covers search, quotes, and full price history. Consistent with free-tier-first provider philosophy. |
| AD-S22-2 | Crypto instruments use UTC timezone, `exchange = 'CRYPTO'` | No exchange-session semantics apply. `MarketCalendar.isTradingDay()` returns `true` unconditionally for CRYPTO. Avoids a crypto-specific calendar concept. |
| AD-S22-3 | Crypto chart uses area/line series, not candlestick | CoinGecko free tier returns close price only — no OHLC. Area chart is accurate to the available data. Paid-tier OHLC is post-Phase II. |
| AD-S22-4 | Crypto batch quote via separate scheduler path, not merged with Tiingo | CRYPTO instruments must not be gated by NYSE market hours. Partitioned polling paths are the simplest solution without scheduler refactor. Equity path unchanged. |
| AD-S22-5 | Day Change label reads "24h Change" for CRYPTO instruments | CoinGecko reports rolling 24-hour change, not session-based change. Label must be accurate to avoid user confusion. |

---

*Handoff written by: PM (Senior PM, Phase II planning session)*
*Next session starts: On-demand — pending Executive Sponsor resolution of §6 blockers*
