# DECISIONS.md — STALKER

> **Role:** Persistent log of architecture, product, and process decisions that carry forward across sessions. Every decision recorded here was made for a reason; that reason is the most valuable part of the entry. Agents consult this document before making any implementation choice that touches an area already decided. If a prior decision covers the situation, follow it. If a prior decision needs to change, propose an amendment — do not silently deviate.
>
> **Authors:** Lead Engineering agent and Lead Product agent (joint custodians). Any agent may propose a decision entry; both leads must agree before it is recorded.
> **Authorized amendments:** Amendments to existing entries require the same joint lead approval. If the amendment carries product authority implications (scope, user-facing behavior, release criteria), escalate to the Executive Sponsor before recording.
> **Status:** Active
> **Last Updated:** 2026-03-01
> **Read by:** All agents at session start, after HANDOFF.md and before writing any code that touches a decided area.

---

## How Agents Use This Document

When you are about to make an implementation choice, search this document for the relevant area first. If a decision exists, follow it and cite the decision ID in your session output. If no decision exists, make the best choice available, record it here at session close using the template below, and note it in the session report. Never let an undocumented decision leave a session — the next agent has no way to know why things are the way they are.

If you believe a prior decision is wrong or no longer applicable, do not silently override it. Raise it as a discovery-pattern message to the lead, who will determine whether an amendment is needed and whether ES escalation is required.

---

## Decision Entry Template

Copy this block for each new decision. Assign the next sequential ID in the relevant category.

```
### {ID} — {Short Title}

**Date:** {YYYY-MM-DD}
**Session / Epic:** {Session N or Epic N}
**Status:** Active

**Context:**
{1–3 sentences. What situation or problem prompted this decision? What would have happened if no decision had been made?}

**Options considered:**
- {Option A}: {brief description and key tradeoff}
- {Option B}: {brief description and key tradeoff}
- {Option C if applicable}

**Decision:**
{One clear sentence stating what was decided.}

**Rationale:**
{2–4 sentences. Why this option over the others? What evidence, constraints, or principles drove the choice?}

**Consequences and tradeoffs:**
{What does this decision foreclose? What technical debt does it accept? What follow-on work does it create?}

**Owner:** {Role or agent that owns the consequences of this decision}
```

---

## Category: Data Architecture

### AD-S22-2 — Crypto Instruments Use UTC Timezone, exchange = 'CRYPTO'

**Date:** 2026-03-01
**Session / Epic:** Phase II Planning → Epic 4
**Status:** Active

**Context:**
Crypto assets trade 24/7 with no exchange sessions. The existing instrument model requires `exchangeTz` (IANA timezone) and `exchange` (exchange name). Without a decision, engineering would need to invent a timezone and exchange concept for a 24/7 market.

**Options considered:**
- Use a real exchange name (e.g., "Coinbase"): Incorrect — CoinGecko aggregates across exchanges.
- Use a synthetic convention: `exchange = 'CRYPTO'`, `exchangeTz = 'UTC'`.

**Decision:**
Crypto instruments use `exchangeTz = 'UTC'` and `exchange = 'CRYPTO'`. `MarketCalendar.isTradingDay()` returns `true` unconditionally for CRYPTO instrument type.

**Rationale:**
No exchange-session semantics apply to crypto. UTC is the neutral timezone for 24/7 markets. A synthetic exchange name avoids falsely associating prices with a specific exchange. The `isTradingDay()` override is the minimal change to the existing calendar system.

**Consequences and tradeoffs:**
The `CRYPTO` exchange value is synthetic — it does not correspond to any real exchange. Any future feature that relies on exchange-specific behavior must handle this value explicitly.

**Owner:** Lead Engineering

---

## Category: Market Data and Providers

### AD-S22-1 — CoinGecko Selected as Crypto Provider

**Date:** 2026-03-01
**Session / Epic:** Phase II Planning → Epic 4
**Status:** Active

**Context:**
Phase II adds crypto asset support (Epic 4). A provider is needed for crypto symbol search, real-time quotes, and historical price data. Without a decision, engineering would need to evaluate providers mid-session.

**Options considered:**
- CoinGecko (free public tier): No key required, 100 req/min unauthenticated, JSON REST API, coin ID system, covers search + quotes + history.
- CoinMarketCap: Requires API key for basic access, free tier more restrictive.
- Binance API: Exchange-specific, not a general market data provider, no search capability.

**Decision:**
CoinGecko's unauthenticated free public tier is the crypto data provider. Coin ID is stored in `providerSymbolMap.coingecko`.

**Rationale:**
No API key required — consistent with the free-tier-first provider philosophy established in Phase I. 100 req/min is sufficient for single-user polling. The `/api/v3/` endpoints cover all three required capabilities (search, quotes, price history). Coin ID system is well-documented and stable.

**Consequences and tradeoffs:**
Single-provider dependency for crypto (no fallback chain). CoinGecko free tier provides close price only — no OHLC for candlestick charts. Rate limit changes by CoinGecko are an external risk. Logged as KL-7.

**Owner:** Lead Engineering

### AD-S22-10 — Decimal Conversion for CoinGecko JSON Numbers

**Date:** 2026-03-01
**Session / Epic:** Phase II Planning → Epic 4
**Status:** Active

**Context:**
CoinGecko API returns price values as JSON numbers. Per CLAUDE.md Rule 1, all financial values must use Decimal.js. The conversion pattern must be specified to prevent floating-point drift.

**Decision:**
All CoinGecko price values use `new Decimal(String(jsonNumber))` — stringify the JSON number first, then construct Decimal. Never `new Decimal(jsonNumber)` directly.

**Rationale:**
Consistent with the established pattern for Tiingo and FMP providers. String intermediary prevents JavaScript float precision loss during Decimal construction.

**Consequences and tradeoffs:**
None. This is the existing pattern applied to a new provider.

**Owner:** Lead Engineering

---

## Category: Analytics Engine

*No decisions recorded yet.*

---

## Category: API Layer

### AD-S23-1 — News API Route at `/api/holdings/[symbol]/news`, Separate from Portfolio Holdings

**Date:** 2026-03-01
**Session / Epic:** S23 / Epic 3
**Status:** Active

**Context:**
The news route needs a path. The spec says `/api/holdings/[symbol]/news`. The existing holdings detail route is at `/api/portfolio/holdings/[symbol]`. These are in different directory trees.

**Decision:**
The news route is at `/api/holdings/[symbol]/news/route.ts`, a new directory tree separate from `/api/portfolio/holdings/`. This matches the spec path exactly.

**Rationale:**
News is not a portfolio analytics concern — it's an external data fetch. Keeping it outside `/api/portfolio/` maintains the conceptual separation: portfolio routes serve computed financial data, holdings news routes serve external content.

**Consequences and tradeoffs:**
Two directory trees contain `[symbol]` routes. Future cleanup could consolidate, but is not warranted now.

**Owner:** Lead Engineering

### AD-S23-2 — Spec CSS Tokens Mapped to Existing Theme Tokens

**Date:** 2026-03-01
**Session / Epic:** S23 / Epic 3
**Status:** Active

**Context:**
The SPEC_S22_Enhancement_PRD.md references CSS tokens (`bg-surface-raised`, `text-subtle`, etc.) not defined in the Tailwind `@theme` config. The existing theme uses a different naming convention.

**Decision:**
Mapped spec tokens to existing theme: `bg-surface-raised` → `bg-bg-secondary`, `border-surface-border` → `border-border-primary`, `bg-surface-overlay` → `bg-bg-tertiary`, `text-heading` → `text-text-primary`, `text-muted` → `text-text-secondary`, `text-subtle` → `text-text-tertiary`.

**Rationale:**
The existing theme tokens are semantically equivalent. Adding new aliases would create unnecessary duplication in the CSS layer.

**Consequences and tradeoffs:**
None. Visual output matches the spec intent.

**Owner:** Lead Engineering

### AD-S23-3 — GNews Free Tier: 30-Day Historical Limit

**Date:** 2026-03-01
**Session / Epic:** S23 / Epic 3
**Status:** Active

**Context:**
The spec requests a 90-day news window. Testing revealed that GNews free tier only returns articles from the last 30 days (older articles are removed from the response with a message about paid plans). The `from` parameter is still sent as 90 days ago, but GNews silently filters.

**Decision:**
Accept the 30-day effective window on the free tier. The route sends `from=<90 days ago>` to maximize results. The section header still reads "90 days" to match the spec. If the user upgrades to a paid GNews plan, the full 90-day window will automatically work without code changes.

**Rationale:**
No code change can override the provider's free-tier limitation. The forward-compatible request means a plan upgrade immediately expands coverage.

**Consequences and tradeoffs:**
Users see fewer articles than the spec implies. Documented as a known external constraint, not a bug.

**Owner:** Lead Engineering

---

## Category: Scheduler

### AD-S22-4 — Crypto Batch Quote via Separate Scheduler Path

**Date:** 2026-03-01
**Session / Epic:** Phase II Planning → Epic 4
**Status:** Active

**Context:**
CRYPTO instruments must be polled for quotes regardless of NYSE market hours. The existing scheduler gates polling on `isTradingDay()` for US exchanges. Merging crypto into the existing path would require conditional gating per instrument type within the poll loop.

**Options considered:**
- Merge: Single polling path with per-instrument type checks inside the loop. Simpler code but couples crypto lifecycle to equity polling logic.
- Partition: Separate polling paths for equities and crypto. Equity path (Tiingo batch, NYSE-gated) unchanged. Crypto path (CoinGecko batch) runs unconditionally.

**Decision:**
Crypto instruments use a separate scheduler polling path. At each 30-minute cycle, instruments are partitioned into equities (STOCK, ETF, FUND) and crypto (CRYPTO). Each path runs independently.

**Rationale:**
Partitioning is the simplest solution that avoids modifying the working equity polling path. The equity path (Tiingo batch, NYSE calendar gating) is unchanged and tested. Crypto polling runs unconditionally with no calendar dependency.

**Consequences and tradeoffs:**
Two code paths to maintain. Both write to the same `LatestQuote` table using the existing upsert pattern. If a third asset class is added, the partitioning model should be reconsidered.

**Owner:** Lead Engineering

---

## Category: UI and UX

### AD-S22-3 — Crypto Chart Uses Area/Line Series, Not Candlestick

**Date:** 2026-03-01
**Session / Epic:** Phase II Planning → Epic 4
**Status:** Active

**Context:**
CoinGecko's free tier provides close price only — no OHLC (open, high, low, close) data. The existing holding detail chart uses a candlestick series which requires all four OHLC values. Without a decision, the chart would show empty or incorrect candles for crypto instruments.

**Options considered:**
- Candlestick with synthetic OHLC (set O=H=L=C): Visually misleading — shows "doji" candles that imply zero volatility.
- Area/line series for crypto: Matches the available data (close only) and the dashboard portfolio chart configuration.
- No chart for crypto: Functional regression — holding detail always shows a chart.

**Decision:**
CRYPTO instruments display a line/area series on the holding detail chart, matching the dashboard portfolio chart configuration. Candlestick is reserved for equity instruments with full OHLC data.

**Rationale:**
Area chart is accurate to the available data. Candlestick requires OHLC data from the paid CoinGecko tier, which is explicitly out of scope. The area chart series is already implemented for the portfolio chart, so the charting infrastructure supports it.

**Consequences and tradeoffs:**
Crypto charts have less visual information density than equity charts. Upgrading to candlestick requires a CoinGecko paid plan — deferred post-Phase II.

**Owner:** Lead Engineering

### AD-S22-5 — Day Change Label Reads "24h Change" for CRYPTO Instruments

**Date:** 2026-03-01
**Session / Epic:** Phase II Planning → Epic 4
**Status:** Active

**Context:**
CoinGecko reports a rolling 24-hour price change, not a session-based day change. Equity instruments use "Day Change" based on the previous trading day's close. Using the same label for crypto would misrepresent the metric.

**Decision:**
For CRYPTO instruments, the position summary field label reads "24h Change" instead of "Day Change".

**Rationale:**
Label accuracy prevents user confusion. The underlying data is semantically different (rolling 24h window vs. previous session close), so the label must reflect the actual computation.

**Consequences and tradeoffs:**
Conditional label rendering adds a minor branch to the PositionSummary component. The component will need the instrument type to determine which label to display.

**Owner:** Lead Engineering

### AD-S22-6 — Default Sort: Symbol A-Z with URL State

**Date:** 2026-03-01
**Session / Epic:** S22 / Epic 1
**Status:** Active

**Context:**
The portfolio holdings table defaulted to allocation descending, requiring users to re-orient on every page load to find a specific instrument in an 83-row table. UAT confirmed this as a friction point.

**Options considered:**
- Allocation descending (existing): Highlights top positions but makes finding a specific instrument difficult.
- Symbol ascending: Alphabetical order is predictable and scannable for any portfolio size.
- Last trade date: Useful for active traders but not the primary user's workflow.

**Decision:**
The portfolio table defaults to symbol ascending (A-Z) on every page load. Sort state is reflected in URL query params (`?sort=symbol&dir=asc`). The sort cycle resets to symbol A-Z (not allocation desc).

**Rationale:**
Alphabetical is the most predictable default for an 83-instrument portfolio. URL state enables deep links and page refresh stability. Preserving the cycle reset to the new default prevents confusion.

**Consequences and tradeoffs:**
Users who preferred allocation-first must manually re-sort. No persisted sort preference across browser sessions (explicitly out of scope per spec).

**Owner:** Lead Engineering

### AD-S22-7 — Column Parity: Canonical Position Summary Layout

**Date:** 2026-03-01
**Session / Epic:** S22 / Epic 2
**Status:** Active

**Context:**
UAT identified that navigating from the holdings table to the detail page dropped context — some fields visible in the table were missing or misnamed on the detail page. The PositionSummary grid needed to be reordered and relabeled to match the table.

**Decision:**
The PositionSummary grid uses a 3-row × 4-column canonical layout: Row 1 (Current Price, Shares, Avg Cost, Market Value), Row 2 (Unrealized P&L, Day Change, Allocation, Cost Basis), Row 3 (Realized P&L, First Buy, Data Source, reserved empty). "Mark Price" renamed to "Current Price". "Quote Time" removed (replaced by staleness label on Current Price when provider is 'price-history').

**Rationale:**
Column parity between table and detail eliminates the context-drop friction. "Current Price" matches the holdings table column header. The staleness label on Current Price is more useful than a separate "Quote Time" field.

**Consequences and tradeoffs:**
"Quote Time" is no longer shown as a standalone metric. The staleness information is preserved via the amber "As of" label, which is visible only when relevant (price-history fallback).

**Owner:** Lead Engineering

---

## Category: Advisor (LLM)

*No decisions recorded yet.*

---

## Category: Testing and Quality

*No decisions recorded yet.*

---

## Category: Process and Operations

*No decisions recorded yet.*

---

## Amendment Log

All changes to existing decision entries after their initial recording must be logged here. An amendment that carries product authority implications requires Executive Sponsor authorization before being applied.

| Date | Decision ID | What changed | Reason | Approved by |
|------|------------|-------------|--------|-------------|
| 2026-03-01 | — | Initial population | AD-S22-1 through AD-S22-5 recorded from Phase II planning. AD-S22-6 and AD-S22-7 recorded from S22 Epic 1 and Epic 2 implementation. AD-S22-10 recorded for Decimal conversion pattern. | Lead Engineering |
| 2026-03-01 | — | S23 additions | AD-S23-1 (news route path), AD-S23-2 (CSS token mapping), AD-S23-3 (GNews 30-day free-tier limit). | Lead Engineering |

---

*Decisions not documented here did not officially happen. When in doubt, write it down.*
