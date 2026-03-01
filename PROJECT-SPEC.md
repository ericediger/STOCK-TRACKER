# PROJECT-SPEC.md — STALKER Phase II

> **Role:** Anchor document. The single source of product truth for STALKER Phase II. All epics, sessions, and deliverables are derived from and validated against this specification. No session output can contradict this document without a formal amendment (§10).
>
> **Author:** Executive Sponsor
> **Custodians:** PM and BA lead agents (maintain traceability; flag drift; propose amendments)
> **Status:** Active
> **Version:** 1.0
> **Last Updated:** 2026-03-01
> **Read by:** Every lead agent at bootstrap and at the start of any planning session

---

## How Agents Use This Document

**Lead agents:** Read this document at bootstrap (Step 2 of the Bootstrap Sequence in FRAMEWORK.md) and before any planning session. Use §3 (Epics) to derive session scope. Use §4 (Product ACs) to validate that session deliverables are on track. If a session's proposed scope cannot be traced to this document, stop and escalate to the Executive Sponsor.

**PM agents:** This is your primary reference for scope, priority, and acceptance criteria. When session-level ACs are written, they must trace to §4. When scope questions arise, the answer is in §3 or §8.

**BA agents:** This is your requirements anchor. When eliciting or structuring requirements, trace every requirement back to §3 or §4. Flag any requirement that cannot be traced as an open question for the ES.

**All agents:** If a session produces an output that contradicts this document, the output is wrong — not the document. Surface the contradiction. Do not silently resolve it in favor of the session output.

---

## Phase I Baseline (Read This First)

Phase II is built on a complete, production-ready foundation delivered across Sessions 1–21. Agents must treat the Phase I codebase as stable infrastructure, not as material to be refactored or revisited unless a Phase II epic explicitly requires it.

The Phase I system consists of: a local-first Next.js application with SQLite via Prisma, a standalone scheduler process, three market data providers (FMP, Tiingo, Alpha Vantage), a five-tool LLM advisor package (`@stalker/advisor`), a full FIFO analytics engine, 22 API endpoints, 4 UI pages, and 720 passing tests across 62 files. The production portfolio contains 83 instruments, 87 transactions, and approximately 53,600 price bars.

The authoritative record of Phase I state is `HANDOFF.md` (Post-Session 21). Agents read it at bootstrap to establish current state before executing any Phase II session.

**Two Phase I items are unresolved and must be closed before any Phase II session begins.** First, manual browser verification of four UAT flows from the S21 report is required (APLD price display, non-blocking portfolio load, instrument add without page reload, news link behavior). Second, the XRP asset decision must be made by the Executive Sponsor: if the intent is XRP crypto, the current record is incorrect and must be remediated after Epic 4 (Crypto Support) ships. If the intent is the Bitwise XRP ETF, no action is required. Both items must be documented in HANDOFF.md before Phase II Session 1 begins.

---

## §1 Vision and Problem Statement

### 1.1 Product Vision

STALKER Phase II expands a production portfolio tracker from equities-only coverage into a multi-asset, information-rich platform — adding crypto asset support, a real-time news feed embedded in the holding detail experience, and consistency improvements that eliminate friction when navigating between views. When Phase II is complete, the user has a single local-first tool that accurately tracks and contextualizes an 83-instrument portfolio spanning stocks, ETFs, and crypto, without leaving the application to find relevant information.

### 1.2 Problem Statement

UAT conducted on 2026-03-01 against the Phase I application validated four gaps that the user encounters in daily use. The holdings table has no enforced default sort order, requiring a user managing 83 instruments to reorient on every page load. The holding detail page is missing fields that are visible on the holdings table, creating a discontinuity when drilling into a position — the user loses context mid-flow rather than gaining depth. News about a holding requires leaving the application entirely; the current implementation is a single external link that opens a raw Google News search page, providing no scannable feed within STALKER. And the portfolio contains at least one intended crypto asset (XRP) that cannot be correctly tracked because no crypto provider, asset type, or scheduler logic exists for non-equity instruments.

A fifth gap — specific enhancements to the LLM advisor's system prompt, model configuration, and placement UI — is blocked pending Executive Sponsor input and is scoped as Epic 5 (Advisor Enhancements), with work deferred until the ES provides the required inputs.

### 1.3 Opportunity

Phase I delivered a complete and correct foundation. The agentic team is now being rebuilt under the Agent Ops Framework, making Phase II the first project to run under the new operating model. The four UAT-validated gaps are well-understood, bounded, and directly traceable to user behavior in the live application. Addressing them now compounds the value of Phase I — the user already trusts the numbers; Phase II makes the tool faster to navigate, more complete in its data coverage, and contextually richer at the holding level.

---

## §2 Target User

### 2.1 Primary User

- **Role / persona name:** Individual investor, technical practitioner
- **Context:** Runs STALKER locally on a Mac at desktop resolution. Checks the portfolio daily or weekly. Not day-trading. Has 83 instruments including ETFs, individual equities, and at least one intended crypto asset. All historical trades are imported; ongoing use is monitoring and occasional transaction entry.
- **Job to be done:** When I open my portfolio tracker, I want to understand where each position stands and what is happening with it — without navigating to external tools or re-orienting the interface on every visit — so that I can make informed decisions about my holdings efficiently.
- **Current pain:** The table re-sorts unpredictably. Navigating to a holding detail page drops context that was visible in the table. Checking news requires leaving the app. XRP cannot be tracked correctly because it was added as an ETF. The daily workflow involves unnecessary friction at each of these points.

### 2.2 Secondary Users

None. STALKER is a single-user, local-first application. There are no secondary users, no shared access, and no multi-tenant considerations.

### 2.3 Out-of-Scope Users

Any user profile beyond the single local user is explicitly out of scope for Phase II. Multi-user access, cloud sync, authentication, and public-facing deployment are not considered.

---

## §3 Epic Breakdown

> **For lead agents:** Work through epics in order unless HANDOFF.md §5 specifies otherwise. Do not begin an epic until all blocking epics are complete and entry criteria are satisfied. Epics 1 and 2 may execute in the same session if capacity permits — they share no file-level conflicts. Epics 3 and 4 each require their own session or isolated scope due to external dependency and schema migration risk respectively. Epic 5 is blocked on ES input and must not be started without explicit ES authorization.

---

### Epic 1 — Default Sort: Symbol A-Z

**Status:** Not started
**Priority:** Must
**Depends on:** Phase I close-out (S21 blockers resolved)
**Estimated sessions:** 1 (combined with Epic 2)

**What this epic delivers:** The portfolio dashboard and dedicated holdings page render their holdings tables in alphabetical symbol order (A-Z) on every page load and every background data refresh, by default. Users no longer need to re-sort or scan the full 83-row table to locate a position. The sort state is preserved in the URL so that deep links and page refreshes maintain the user's active sort.

**In scope:**
- Default sort applied to the dashboard (`/`) holdings table: symbol ascending on initial load and after background rebuilds.
- Default sort applied to the holdings page (`/holdings`) holdings table: symbol ascending on initial load.
- Sort state reflected in URL query params (`?sort=symbol&dir=asc`).
- Sort indicator (ascending chevron) displayed on the symbol column header by default.
- User-initiated column sort overrides the default for the session duration; default is not re-applied after a user manually re-sorts.

**Out of scope for this epic:**
- Persisting user sort preference across browser sessions (local storage).
- Server-side sorting or pagination.
- Sort behavior changes on the Transactions page.
- Any change to the API layer — this is a client-side state change only.

**Entry criteria:**
- S21 manual browser verification is complete and documented.
- XRP data decision is made and documented in HANDOFF.md.
- HANDOFF.md reflects Post-S21 state.

**Exit criteria:**
- On a fresh page load of `/` with no query params, the holdings table renders alphabetically by symbol (A-Z).
- On a fresh page load of `/holdings` with no query params, the holdings table renders alphabetically by symbol (A-Z).
- The symbol column header displays the ascending sort indicator on page load.
- After a background data refresh, the table remains sorted A-Z unless the user has re-sorted manually during the session.
- `pnpm test` passes with 0 failures. TypeScript reports 0 errors.

---

### Epic 2 — Column Parity: Holding Detail Matches Holdings Table

**Status:** Not started
**Priority:** Must
**Depends on:** Phase I close-out (S21 blockers resolved)
**Estimated sessions:** 1 (combined with Epic 1)

**What this epic delivers:** Every field visible in the holdings table (`/holdings`) has a corresponding representation on the holding detail page (`/holdings/[symbol]`). Three specific fields confirmed missing by UAT are added: Current Price (as an explicitly labeled standalone field), Realized PnL, and Average Cost Per Share. The position summary grid expands from the current 12-field layout to accommodate these additions without visual crowding.

**In scope:**
- **Current Price** added to the position summary grid as a labeled field. Value is the mark price from existing price resolution logic (live quote or PriceBar fallback). When price is derived from the PriceBar fallback, an amber "As of [date]" staleness label appears below the price value, using the existing `provider: 'price-history'` discriminator introduced in S21.
- **Realized PnL** added to the position summary grid. If no sells exist for the instrument, displays `$0.00` in `text-muted` (neutral, no gain/loss color). Data is already computed by the FIFO engine; confirm it is present in the API response or add it as a parallel query following the S21 pattern.
- **Average Cost Per Share** added to the position summary grid. Computed at render time as `totalCostBasis ÷ totalShares`; no new database query required.
- Position summary grid layout expanded to 4 rows × 4 columns (from current 3 rows × 4 columns) to accommodate the three new fields cleanly. The 16th cell is intentionally empty — no placeholder content.
- All numeric values in the expanded grid use right-alignment, `tabular-nums`, and the minus sign character (U+2212) for negative values, consistent with the existing design system specification.

**Revised position summary grid layout (canonical reference for engineering):**

```
Row 1: Current Price | Shares       | Avg Cost     | Market Value
Row 2: Unreal. PnL   | Day Change   | Allocation % | Cost Basis
Row 3: Realized PnL  | First Buy    | Data Source  | (reserved — empty)
```

**Out of scope for this epic:**
- Adding new columns to the dashboard or holdings table views (those are confirmed correct by UAT).
- Changing any existing field label or value formatting on the detail page beyond the three new additions.
- A "Total Return" composite field (derivable by the user; deferred).
- Any responsive or mobile layout work.

**Entry criteria:**
- Same as Epic 1 (S21 close-out complete).
- Engineering has confirmed whether `realizedPnl` is currently present in the `GET /api/portfolio/holdings/[symbol]` response. If absent, it must be added before exit criteria can be met.

**Exit criteria:**
- The holding detail page displays "Current Price" as a labeled field in the position summary grid.
- When Current Price is derived from the PriceBar fallback, an amber "As of [date]" staleness label is visible below the price value.
- The holding detail page displays "Realized PnL" as a labeled field. Zero-sell state shows `$0.00` in neutral color.
- The holding detail page displays "Avg Cost" (average cost per share) as a labeled field.
- Every field in the `/holdings` holdings table has a corresponding field on `/holdings/[symbol]`.
- All values are right-aligned, use `tabular-nums`, and use U+2212 for negative values.
- `pnpm test` passes with 0 failures. TypeScript reports 0 errors.

---

### Epic 3 — News Feed: Card/List UI on Holding Detail Page

**Status:** Not started
**Priority:** Must
**Depends on:** Phase I close-out (S21 blockers resolved); `GNEWS_API_KEY` credential status confirmed by ES (see §9.3)
**Estimated sessions:** 1

**What this epic delivers:** The holding detail page displays a "Recent News" section below the transaction history block. The section shows up to ten recent news article cards — each with a headline, excerpt, source, relative timestamp, and external link — covering the trailing 90 days. News is fetched server-side via a new API route to avoid CORS. A graceful fallback (single Google News link card, matching the current S21 behavior) activates automatically if the API key is not configured, ensuring the page is never broken by missing credentials.

**In scope:**
- New API route: `GET /api/holdings/[symbol]/news`. Accepts the instrument symbol as a path parameter. Returns a normalized `NewsResponse` array (title, description, url, source, publishedAt, relativeTime). Caches responses for 30 minutes per instrument (in-memory or route-level cache).
- GNews API (`https://gnews.io/api/v4/search`) as the primary news source. Query constructed using the instrument's `name` field (quoted for exact match), filtered to `lang=en`, `max=10`, and a 90-day date window. Retry with ticker symbol alone if company name returns zero results.
- News section rendered as a card list below the transaction history block on `/holdings/[symbol]` only. Not visible on any other page.
- Individual card content: headline (2-line clamp), excerpt (1-line clamp, max 160 characters), source name, relative time ("3 hours ago", "2 days ago", "Feb 22"), Lucide `ExternalLink` icon (12px, `text-subtle`). Clicking any part of the card opens the article URL in a new tab.
- Three section states: loaded (article cards), loading (five skeleton cards with `animate-pulse`), and empty (contextual message when no articles found in the 90-day window).
- Fallback behavior when `GNEWS_API_KEY` is absent: the API route returns a single synthetic record representing a Google News search URL. The UI renders this as a single link card. This is the existing S21 behavior, preserved and promoted to a first-class fallback state.
- `GNEWS_API_KEY` added to `.env.local` and `.env.example`.

**Out of scope for this epic:**
- Real-time news streaming or WebSocket updates.
- Sentiment analysis or AI-generated summaries in the news section (the Advisor panel handles analytical synthesis).
- Filtering, searching, or sorting within the news section.
- News images or thumbnails.
- Pagination beyond the initial ten articles.
- News on any page other than the holding detail page.

**Entry criteria:**
- Phase I close-out complete.
- ES has confirmed whether `GNEWS_API_KEY` is available (provided, pending, or confirmed that the fallback mode is acceptable as the initial state). If the key is not available and fallback mode is not acceptable, this epic is blocked — escalate to ES before beginning.

**Exit criteria:**
- On load of any holding detail page, a "Recent News" section appears below the transaction history block.
- When `GNEWS_API_KEY` is configured: the section displays between five and ten article cards, each showing a headline, excerpt, source, and relative time. Articles are limited to the trailing 90 days.
- When `GNEWS_API_KEY` is absent: the section displays the single Google News link card fallback with no error state.
- Clicking any article card opens the article URL in a new tab without navigating away from the holding detail page.
- While news is loading, skeleton cards are visible and the page does not block.
- `GNEWS_API_KEY` is present in `.env.example` with a comment explaining its purpose and the fallback behavior if absent.
- `pnpm test` passes with 0 failures. TypeScript reports 0 errors.

---

### Epic 4 — Crypto Asset Support

**Status:** Not started
**Priority:** Must
**Depends on:** Epics 1, 2, and 3 complete (crypto is highest-risk; execute last to avoid blocking earlier epics)
**Estimated sessions:** 1–2

**What this epic delivers:** STALKER gains first-class support for crypto assets. A new `CRYPTO` instrument type is added to the schema. A new CoinGecko provider (free public API, no key required) handles crypto symbol search, real-time price quotes, and historical price bars. The scheduler polls crypto instruments on a 24/7 basis, bypassing NYSE market calendar gating. The holding detail chart for crypto instruments uses a line/area series rather than a candlestick series, reflecting that CoinGecko's free tier provides close price only. The user can add any CoinGecko-listed coin through the existing Add Instrument flow. All existing equity instrument behavior is unaffected.

**In scope:**
- Schema migration: `Instrument.type` enum expanded to include `CRYPTO`. Additive, backwards-compatible. All existing records unaffected.
- Crypto instrument conventions: `exchangeTz = 'UTC'`, `exchange = 'CRYPTO'`, `providerSymbolMap.coingecko = '{coinId}'`.
- New provider module: `packages/market-data/src/providers/coingecko.ts` implementing the existing `MarketDataProvider` interface. Methods: `searchSymbols` (calls `/api/v3/search`), `getQuote` (calls `/api/v3/simple/price`), `getHistory` (calls `/api/v3/coins/{id}/market_chart/range`). All price values use `new Decimal(String(jsonNumber))` conversion per AD-P2-10.
- Batch quote method: `getCryptoBatchQuotes(coinIds: string[]): Promise<Quote[]>` on the CoinGecko provider (outside the `MarketDataProvider` interface), supporting up to ~200 coin IDs per call. Called directly by the scheduler's crypto polling path.
- `MarketCalendar.isTradingDay()` updated to accept an optional `instrumentType` parameter. When `instrumentType === 'CRYPTO'`, returns `true` unconditionally.
- Scheduler partitioning: at each 30-minute polling cycle, instruments are partitioned into `equities` (STOCK, ETF, FUND) and `cryptoAssets` (CRYPTO). Equity polling uses the existing NYSE-gated Tiingo batch path. Crypto polling runs unconditionally via `getCryptoBatchQuotes()`. Both paths write to the same `LatestQuote` table using the existing upsert pattern.
- Symbol search extension: `GET /api/market/search` calls both FMP and CoinGecko, merges results, and deduplicates. CoinGecko results display a "Crypto" type badge in the dropdown (consistent with existing STOCK/ETF/FUND type display).
- Instrument creation: `POST /api/instruments` accepts `type: 'CRYPTO'` and handles CoinGecko-specific fields. Historical backfill uses `CoinGeckoProvider.getHistory()`. Coin ID is stored in `providerSymbolMap.coingecko` at creation time.
- Holding detail chart: CRYPTO instruments display a line/area series (matching the dashboard portfolio chart configuration) instead of a candlestick series, because CoinGecko free tier provides close price only (no OHLC).
- Day Change label: for CRYPTO instruments, the position summary field label reads "24h Change" instead of "Day Change" to accurately reflect that the value is a rolling 24-hour window.
- `COINGECKO_RPM=100` added to `.env.local` and `.env.example`.
- Architecture decisions AD-S22-1 through AD-S22-5 recorded in HANDOFF.md at session close.
- KL-7 (CoinGecko single-provider dependency, no free-tier fallback) added to KNOWN-LIMITATIONS.md.

**Audit requirement:** All existing switch/case or if/else statements on `instrument.type` in business logic, API routes, and UI components must be identified and verified to handle `CRYPTO` without silent fall-through or incorrect behavior. This audit is a mandatory pre-commit step and must be documented in the session report.

**CoinGecko key endpoints (reference for engineering):**

| Purpose | Endpoint |
|---------|----------|
| Search | `GET https://api.coingecko.com/api/v3/search?query={q}` |
| Single quote | `GET /api/v3/simple/price?ids={id}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true` |
| Batch quote | `GET /api/v3/simple/price?ids={id1,id2,...}&vs_currencies=usd&include_24hr_change=true` |
| Price history | `GET /api/v3/coins/{id}/market_chart/range?vs_currency=usd&from={unix}&to={unix}` |

Authentication: none required for the free public tier. Rate limit: 100 requests/minute unauthenticated. Monitor `X-RateLimit-Remaining` response header but rely on in-process rate limiter per existing pattern.

**Out of scope for this epic:**
- Crypto derivatives, staking rewards, DeFi instruments, or NFTs.
- CoinGecko paid-tier features (OHLC data, intraday bars).
- A fallback crypto provider (single-provider is consistent with KL-5 pattern for Tiingo).
- Crypto-to-crypto or non-USD denominated valuation.
- Any change to equity instrument polling, pricing, or analytics behavior.

**Entry criteria:**
- Epics 1, 2, and 3 are complete and their exit criteria verified.
- ES has resolved the XRP data decision (see Phase I Baseline, above). If XRP is confirmed as intended crypto, the existing XRP instrument record must be deleted before this epic begins. It will be re-added via the new crypto Add Instrument flow after epic completion.

**Exit criteria:**
- A user can search for a cryptocurrency (e.g., "XRP", "bitcoin", "ethereum") in the Add Instrument modal and see CoinGecko results with a "Crypto" badge.
- Selecting a crypto result creates an Instrument record with `type: CRYPTO`, `exchange: CRYPTO`, `exchangeTz: UTC`, and `providerSymbolMap.coingecko` populated with the correct coin ID.
- Historical price bars are backfilled from CoinGecko on instrument creation. `firstBarDate` is populated after backfill completes.
- The scheduler polls crypto instrument quotes at every 30-minute cycle, regardless of NYSE market hours or day of week. Verified by log output.
- The holding detail page for a CRYPTO instrument displays "24h Change" (not "Day Change") and uses a line/area chart (not candlestick).
- FIFO lot accounting, PnL calculation, and portfolio value snapshots function correctly for a crypto instrument. Verified by adding a test BUY transaction and confirming market value and PnL display correctly.
- The `instrument.type` audit is documented: all switch/case and if/else branches handling `type` have been reviewed and confirmed to handle `CRYPTO` correctly.
- All new test cases for `CoinGeckoProvider` (search, quote, history, error paths) pass.
- Scheduler partitioning logic is covered by tests.
- `MarketCalendar.isTradingDay()` for CRYPTO instruments is covered by tests.
- `pnpm test` passes with 0 failures. TypeScript reports 0 errors. Build succeeds.
- HANDOFF.md updated with AD-S22-1 through AD-S22-5 and KL-7.

---

### Epic 5 — Advisor Enhancements

**Status:** Blocked — pending ES input
**Priority:** Should
**Depends on:** ES provides required inputs (see below); all other epics complete
**Estimated sessions:** 1 (after inputs received)

**What this epic delivers:** The existing `@stalker/advisor` package — which is fully operational with five tools, context windowing, rolling summaries, and a slide-out panel UI — is enhanced with sponsor-specified configuration: a custom system prompt, a specific model selection, and any placement UI changes the ES requires.

**Why this epic is blocked.** The advisor is architecturally complete and in production use. No work can be scoped for this epic until the ES provides three specific inputs. Engineering must not speculate on, mock, or approximate these inputs. If this epic is initiated without ES authorization, it is a scope drift violation.

**Inputs required from ES before this epic can begin (Category B escalation trigger):**

1. **Custom system prompt.** The full text of the system prompt to replace or augment the current advisor system prompt in `@stalker/advisor`. If augmenting, the ES must specify which sections of the current prompt are preserved and which are replaced.
2. **Model selection.** The target model identifier. The current default is `claude-sonnet-4-6`. If a change is required, the ES must specify the model string and rationale.
3. **Placement UI.** The current advisor is a slide-out panel triggered by a floating action button at bottom-right (Bookworm pattern). If the ES requires changes to the trigger mechanism, panel width, panel position, or a shift to a dedicated page, those requirements must be specified before engineering begins.

**Entry criteria:**
- All other epics complete.
- ES has provided all three inputs above in writing, and PM agent has confirmed they are sufficient to write a complete session scope.

**Exit criteria:** To be defined by PM agent upon receipt of ES inputs. Exit criteria will trace to AC-F-05 through AC-F-07 (§4.1), which are currently placeholder until ES inputs are received.

---

## §4 Product-Level Acceptance Criteria

> **For lead agents:** Before closing Phase II (all epics complete), verify every item below is satisfied. Any unsatisfied item is a blocker for M_Release.

### 4.1 Functional Criteria

- **AC-F-01:** The portfolio dashboard and holdings page both default to symbol A-Z sort on every page load and every background data refresh, with no user action required.
- **AC-F-02:** Every data field visible in the holdings table (`/holdings`) has a corresponding labeled representation on the holding detail page (`/holdings/[symbol]`). No field is lost when the user drills from list to detail.
- **AC-F-03:** Current Price, Realized PnL, and Average Cost Per Share are displayed as explicitly labeled fields in the holding detail position summary grid.
- **AC-F-04:** The holding detail page displays a "Recent News" section below the transaction history block. When `GNEWS_API_KEY` is configured, the section shows up to ten article cards (headline, excerpt, source, relative time) covering the trailing 90 days. When the key is absent, a single Google News link card is displayed. The page is never in an error or broken state due to news fetch failure.
- **AC-F-05:** A cryptocurrency instrument can be added through the existing Add Instrument modal using CoinGecko search results. (Advisor-specific ACs to be defined after ES inputs received for Epic 5.)
- **AC-F-06:** A crypto instrument added to the portfolio is polled for live quotes at every 30-minute scheduler cycle regardless of NYSE market hours or day of week.
- **AC-F-07:** FIFO lot accounting, unrealized and realized PnL, portfolio value snapshots, and all analytics functions operate correctly for crypto instruments, with no degradation to existing equity instrument behavior.
- **AC-F-08:** The holding detail chart for CRYPTO instruments displays a line/area series. The Day Change field label reads "24h Change" for CRYPTO instruments.
- **AC-F-09:** All price values — for both equity and crypto instruments — continue to use the `new Decimal(String(jsonNumber))` conversion pattern with no floating-point drift.

### 4.2 Non-Functional Criteria

- **AC-NF-01:** No Phase II change degrades the page load performance established in Phase I. The non-blocking snapshot rebuild introduced in S21 must remain non-blocking. News fetch must not block the holding detail page render.
- **AC-NF-02:** No API key, credential, or secret is committed to version control. `GNEWS_API_KEY` and `COINGECKO_RPM` are added to `.env.example` with comments, not to `.env.local` in the committed codebase.
- **AC-NF-03:** The CoinGecko rate limiter (100 req/min) is enforced in-process using the existing `RateLimiter` pattern. Rate limit errors (HTTP 429) are handled gracefully: logged, scheduler cycle skipped for crypto, existing data preserved.
- **AC-NF-04:** All user-supplied input — including symbol search queries and instrument creation payloads — continues to be validated by Zod before processing. The new `CRYPTO` instrument type is a valid Zod enum value in all relevant schemas.
- **AC-NF-05:** The GNews news fetch route caches responses per instrument for 30 minutes. Repeated page loads within the cache window do not generate additional GNews API calls.

### 4.3 Quality Criteria

- **AC-Q-01:** `pnpm test` passes with 0 failures at Phase II close. New test coverage is required for: the CoinGecko provider (search, quote, history, all error paths), scheduler partitioning logic (equity vs. crypto paths), `MarketCalendar.isTradingDay()` for CRYPTO instruments, `GET /api/holdings/[symbol]/news` (success, empty result, missing key fallback, fetch error), and the `POST /api/instruments` endpoint for a CRYPTO type instrument.
- **AC-Q-02:** TypeScript strict mode reports 0 errors at Phase II close.
- **AC-Q-03:** The `instrument.type` audit (Epic 4) is documented in the session report before the epic is closed. All branches handling `type` are confirmed to handle `CRYPTO`.
- **AC-Q-04:** Architecture decisions AD-S22-1 through AD-S22-5 are recorded in HANDOFF.md. KL-7 is added to KNOWN-LIMITATIONS.md.
- **AC-Q-05:** `.env.example` is updated to include `COINGECKO_RPM` and `GNEWS_API_KEY`, with comments explaining each variable's purpose and behavior when absent.
- **AC-Q-06:** All Phase II UAT flows are verified by the Executive Sponsor before M_Release approval is issued.

---

## §5 Non-Functional Requirements

These requirements apply across all Phase II epics and sessions. They are constraints, not features. Agents consult this section before any implementation decision that could affect these properties.

### 5.1 Performance

The target environment is a single Mac desktop running the application locally. Performance requirements are scoped to this environment. No Phase II change may introduce synchronous blocking behavior on the main user-facing pages. Background operations (news fetch, scheduler polling, snapshot rebuild) must remain asynchronous. Minimum acceptable behavior: the holding detail page renders with existing position data while news loads in the background.

### 5.2 Security and Compliance

No credentials, API keys, or secrets are committed to version control under any circumstances. This is a zero-tolerance rule inherited from Phase I. All user-supplied input is validated with Zod before processing. No PII is stored or transmitted — the application is local-first with no cloud dependency introduced in Phase II.

### 5.3 Accessibility

All Phase II UI additions follow the existing design system conventions (Bookworm dark theme, Tailwind semantic tokens, Lucide icons) as specified in `STALKER-ux-ui-plan.md`. The `prefers-reduced-motion` CSS support gate established in Phase I applies to any new animations (news card skeleton pulse, loading states).

### 5.4 Reliability and Availability

The application is local-first with no uptime target. Data durability follows the Phase I model: `Transaction` and `PriceBar` records are the source of truth; all other data is a rebuildable cache. Phase II introduces two new external dependencies (GNews, CoinGecko) whose unavailability must be handled gracefully. GNews unavailability results in the fallback link card or a "temporarily unavailable" message — never an application error. CoinGecko unavailability results in the existing quote being preserved and a log warning — consistent with the KL-5 pattern for Tiingo.

### 5.5 Maintainability

All Phase II code follows the conventions in `AGENTS.md` and the Phase I codebase. New provider implementations follow the `MarketDataProvider` interface. No function or module introduced in Phase II should require a refactor of the existing provider chain, analytics engine, or scheduler architecture. The `CoinGeckoProvider` is a new file, not a modification of existing provider files.

---

## §6 Release Milestones

> **Operating model — amended 2026-03-01 (v1.1):** The Executive Sponsor does not manage sessions or conduct interim epic reviews. Sessions are autonomous. After each epic completes, Lead Engineering and Lead Product agents conduct a joint review to verify exit criteria, assess whether unforeseen dependencies, technical debt, or blockers require amendment to subsequent session scope, and record any decisions in `DECISIONS.md`. The ES is involved only at M_UAT and M_Release — the two points that carry product acceptance and release authority that no agent holds.
>
> **For lead agents:** Do not escalate to the ES at epic close. Conduct the joint lead review, update HANDOFF.md with the outcome, and proceed to the next epic. Escalate to the ES only if a Category B or C trigger fires (see FRAMEWORK.md §5.3), or if a release milestone is reached.

### Session-to-Session Governance (between milestones)

After each epic closes, Lead Engineering and Lead Product agents jointly:

1. Verify all exit criteria for the completed epic against `PROJECT-SPEC.md §3`.
2. Review the next epic's entry criteria and confirm they are satisfied.
3. Assess whether any discovery, technical debt, or unforeseen dependency requires an amendment to a subsequent epic's scope. If an amendment is needed and it carries product authority implications, escalate to the ES as a Category B item. If it is an internal scope adjustment within the bounds of the spec, the leads apply it and record it in `DECISIONS.md` and HANDOFF.md.
4. Update HANDOFF.md §5 (Next Session scope) with any revised session contracts.
5. Proceed to the next session without ES contact unless a formal escalation trigger fires.

### Milestone Table

| Milestone | Trigger | Who acts | Exit condition |
|-----------|---------|----------|----------------|
| **M0 — Specification approved** | `PROJECT-SPEC.md` is complete and in Active status | ES reviews and approves spec; confirms Phase I close-out complete | `PROJECT-SPEC.md status = Active`; S21 blockers resolved in HANDOFF.md |
| **M_UAT — Full Phase II UAT** | All epics complete; all AC-F, AC-NF, AC-Q criteria satisfied; joint lead review passed | ES conducts UAT across all Phase II changes; raises defects or accepts | All UAT defects resolved or formally deferred with documented rationale; ES issues UAT acceptance |
| **M_Release — Phase II production state** | M_UAT accepted; all quality gates passing; HANDOFF.md current | ES issues final go/no-go | Application reflects all Phase II changes; HANDOFF.md updated to Phase II close state; ES approval on record |

---

## §7 Definition of Done — Product Level

Phase II is complete when all of the following are true:

```
[ ] All epics are in "Complete" status (Epic 5 may be deferred to Phase III
    if ES inputs are not received before M_UAT)
[ ] All product-level ACs (§4) are satisfied
[ ] pnpm test passes with 0 failures on the main branch
[ ] TypeScript strict mode reports 0 errors
[ ] Build succeeds (pnpm build)
[ ] UAT has been conducted and accepted by the Executive Sponsor
[ ] All Severity 1 and 2 defects are closed
[ ] All open Severity 3 defects are documented and accepted as known issues
    in KNOWN-LIMITATIONS.md
[ ] instrument.type audit documented in session report for Epic 4
[ ] Architecture decisions AD-S22-1 through AD-S22-5 in HANDOFF.md
[ ] KL-7 added to KNOWN-LIMITATIONS.md
[ ] .env.example updated with COINGECKO_RPM and GNEWS_API_KEY
[ ] ES has issued final go/no-go approval at M_Release
[ ] HANDOFF.md reflects Phase II close state
```

---

## §8 Explicit Out of Scope

The following capabilities are explicitly not part of Phase II. If a session produces work in these areas without an ES-authorized amendment, it is scope drift.

- Mobile or responsive layout changes. The user is on a Mac at desktop resolution; this is an accepted deferral from Phase I.
- Multi-provider fallback for crypto quotes. CoinGecko is the single crypto provider. A fallback chain is post-Phase II.
- CoinGecko paid-tier features, including OHLC data and intraday bars for crypto instruments.
- Crypto derivatives, staking, DeFi, NFTs, or any crypto instrument type beyond spot assets listed on CoinGecko.
- Non-USD denominated portfolio valuation.
- Multi-user access, authentication, or cloud sync of any kind.
- Any change to the existing equity provider chain (FMP, Tiingo, Alpha Vantage).
- Any change to the existing FIFO analytics engine beyond confirming it handles CRYPTO instruments correctly without modification.
- In-database rate limit tracking (KL-6). Post-Phase II item.
- Overlay/compare charts. Deferred from Phase I; remains deferred.
- Advisor enhancements (Epic 5) without explicit ES authorization and input provision.
- The `summaryText` bulk population for existing advisor threads (KL-3 resolved in S19 for new threads; retroactive population is out of scope).

---

## §9 Known Constraints and External Dependencies

### 9.1 Technical Constraints

The application must remain local-first with SQLite via Prisma. No cloud database, no authentication layer, no external storage dependency may be introduced. All Phase II work executes within the existing monorepo structure (`pnpm` workspaces). The tech stack defined in `AGENTS.md` is fixed; no new runtime dependencies may be added without documenting the rationale in HANDOFF.md.

The Phase I database schema is live and contains real user data (83 instruments, 87 transactions, 53,600+ price bars). The Epic 4 schema migration (`Instrument.type` enum expansion) is additive — no existing data is modified or deleted. Engineering must verify that Prisma generates a safe migration before applying it.

### 9.2 External Dependencies

| Dependency | What is needed | Owner | Risk if unavailable |
|-----------|---------------|-------|---------------------|
| GNews API | API key (`GNEWS_API_KEY`) for news search; free tier sufficient (100 req/day) | ES provides or confirms fallback mode is acceptable | Epic 3 degrades to fallback link card (acceptable); full card feed unavailable |
| CoinGecko API | No key required for free public tier | N/A — unauthenticated | Epic 4 blocked if CoinGecko changes authentication requirements; log as external risk |
| Anthropic API key | Already present in `.env.local` from Phase I | Provided | Advisor (Epic 5) blocked; Epics 1–4 unaffected |
| ES inputs for Epic 5 | Custom system prompt, model selection, placement UI specification | ES provides when ready | Epic 5 blocked; all other epics unaffected |

### 9.3 Credentials and API Keys Required

> **For agents:** Do not stub, mock, or invent credentials. If a required credential is not available, escalate to ES using the Category B escalation format. Record the dependency in HANDOFF.md §6 (Escalations Pending Human Decision).

| Credential | Required for | ES status |
|-----------|-------------|-----------|
| `GNEWS_API_KEY` | Epic 3 — news feed card list | Pending ES confirmation (fallback acceptable as initial state if key unavailable) |
| `COINGECKO_RPM` | Epic 4 — rate limiter configuration | Not a secret; default value is `100`; engineering can set this without ES input |
| `FMP_API_KEY` | Already present from Phase I | Provided |
| `TIINGO_API_KEY` | Already present from Phase I | Provided |
| `ALPHA_VANTAGE_API_KEY` | Already present from Phase I | Provided |
| `ANTHROPIC_API_KEY` | Already present from Phase I | Provided |
| Epic 5 model / prompt inputs | Epic 5 — Advisor enhancements | Pending ES input (blocking for Epic 5 only) |

---

## §10 Amendment Log

> All changes to this document after M0 (Specification Approved) must be recorded here. An amendment requires ES authorization. Agents may propose amendments but cannot apply them — proposals go to the ES as an escalation (Category B).

| Date | Version | Section changed | What changed | Authorized by |
|------|---------|----------------|-------------|---------------|
| 2026-03-01 | 1.0 | — | Initial specification, Phase II defined. Epics 1–5 scoped from UAT findings (2026-03-01) and S21 Product Summary Report. Epic 5 blocked pending ES input. | Executive Sponsor |
| 2026-03-01 | 1.1 | §6 | Operating model amended. ES removed from session management and interim epic review. Milestone table reduced to M0, M_UAT, and M_Release (ES-only intervention points). Joint Lead Engineering and Lead Product review established as the session-to-session governance gate after each epic close. `DECISIONS.md` added to the document set as the persistent architecture and product decision log, jointly owned by Lead Engineering and Lead Product. | Executive Sponsor |

---

*This document is the north star. When in doubt, return to it.*
