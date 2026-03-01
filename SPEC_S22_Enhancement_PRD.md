# STALKER — S22 Enhancement Specification
## Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-01
**Status:** Approved for Engineering
**Author:** Product (Senior PM)
**Sponsor:** Executive Sponsor
**Inputs:** SPEC v4.0, STALKER-ux-ui-plan v1.0, AGENTS.md, HANDOFF.md (Post-S21), S21 Product Summary Report, UAT Findings (2026-03-01)

---

## Prerequisites Before S22 Work Begins

The following two S21 blockers must be formally closed before any S22 scope is initiated.

**P1 — Manual browser verification.** Complete the four UAT flows from the S21 report:
(1) APLD detail page shows a real price, not $0; (2) portfolio loads without a blocking spinner;
(3) adding an instrument does not trigger a full page reload; (4) news link opens correctly in a new tab.
This is a 10-minute walkthrough. Owner: Product / QA.

**P2 — XRP data decision.** Determine whether the intended asset is the Bitwise XRP ETF
(current state is correct — no action) or XRP crypto (must be deleted and re-added after
crypto support ships in this session). Document the decision in HANDOFF.md before S22 begins.
Owner: Executive Sponsor.

---

## Scope Summary

UAT performed on 2026-03-01 validated four of the five proposed enhancements as genuine gaps.
The fifth item (Advisor NLU) is architecturally complete — the `@stalker/advisor` package ships
five tools, context windowing, rolling summaries, and a UI panel — but is held pending
sponsor-provided configuration inputs (custom system prompt, model selection, and placement UI
details). That item is documented below under Section 5 (Blocked) and will be scoped into
S23 once inputs are received.

The four confirmed gaps addressed in this document are:

| # | Enhancement | Complexity | Session Target |
|---|-------------|------------|----------------|
| 1 | News feed: cards/list UI on holding detail page | Medium | S22 |
| 2 | Default sort: symbol A-Z on holdings tables | Low | S22 |
| 3 | Column parity: holding detail matches dashboard/holdings table | Medium | S22 |
| 4 | Crypto asset support via free/public APIs | High | S22 |

---

## Section 1 — News Feed: Card/List UI on Holding Detail Page

### 1.1 Problem Statement

UAT confirmed that the current `LatestNews.tsx` implementation — a single external link
opening a Google News search in a new tab — does not meet the product intent. The user
needs to scan recent news headlines without leaving the application or interpreting a raw
search results page. The feature must present news as a scannable card list within the
holding detail page, positioned below the transaction block.

### 1.2 Users and Context

Single user. Checks portfolio daily or weekly. On the holding detail page, their immediate
goal after reviewing position data and transactions is to understand what, if anything, is
happening with the company. News must be ambient and fast — no additional navigation, no
extra clicks to reach relevance.

### 1.3 Functional Requirements

**FR-1.1** The holding detail page shall display a news section below the transaction
history block. The section is always visible when the detail page is loaded; it is not
hidden behind a toggle or tab.

**FR-1.2** The news section shall display a minimum of five and a maximum of ten news
article cards per load. Cards are sorted by publication date, most recent first.

**FR-1.3** Each card shall display: article headline, source publication name, publication
date (relative format: "3 hours ago", "2 days ago"), and a brief article excerpt or
description where available (maximum 160 characters, truncated with ellipsis).

**FR-1.4** Each card shall be fully clickable. Clicking any part of the card opens the
article URL in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).

**FR-1.5** News data shall cover the trailing 90 days from the current date. Articles
older than 90 days shall not be displayed.

**FR-1.6** The news section shall handle three states: loaded (cards visible), loading
(skeleton cards), and empty (no articles found in the 90-day window — display a
contextual message per Section 1.6).

**FR-1.7** The news feed shall use the GNews API (free public tier, no API key required
for basic usage) as the primary source. The query shall be constructed using the
instrument's `name` field, not the ticker symbol, to maximize headline relevance. Example
query construction: `"Apple Inc" financial news`. Fallback: if GNews returns zero results
for the company name, retry with the ticker symbol alone (`AAPL`).

**FR-1.8** News data shall be fetched server-side via a new API route to avoid CORS
restrictions. The route shall accept the instrument symbol as a path parameter and
return a normalized news array.

**FR-1.9** News data shall be cached for 30 minutes per instrument (in-memory or
route-level cache). The cache timestamp shall not be visible to the user.

### 1.4 API Specification

**New route:** `GET /api/holdings/[symbol]/news`

Request parameters: `symbol` (path, string, required).

Response shape:
```typescript
interface NewsResponse {
  articles: NewsArticle[];
  fetchedAt: string; // ISO datetime
  symbol: string;
}

interface NewsArticle {
  title: string;
  description: string | null;    // Excerpt, max 160 chars
  url: string;
  source: string;                // Publication name
  publishedAt: string;           // ISO datetime
  relativeTime: string;          // Pre-computed: "2 hours ago"
}
```

Error response: Standard `{ error: string }` with HTTP 500. The UI handles this as an
empty state (see Section 1.6).

**GNews API integration:**
- Base URL: `https://gnews.io/api/v4/search`
- Required params: `q` (query string), `lang=en`, `max=10`,
  `from` (ISO date, today minus 90 days), `to` (ISO date, today)
- Note: GNews free tier allows 100 requests/day with an API key. Add `GNEWS_API_KEY`
  to `.env.local` and `.env.example`. If the key is absent, fall back to the Google
  News URL construction pattern (current behavior) and render a single link card
  instead of article cards. This ensures the feature degrades gracefully if the key
  is not configured.

### 1.5 UI/UX Specification

**Section header.** Crimson Pro, 1.125rem, `text-heading`. Label: "Recent News".
Right of the header: a "90 days" label in DM Sans 0.75rem, `text-subtle`. No
refresh button in MVP — the cache refreshes automatically.

**Card container.** `bg-surface-raised`, `rounded-lg`, `border border-surface-border`,
`divide-y divide-surface-border/50`. Cards share a container with a dividing line
between them. No individual card borders.

**Individual card layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Headline text (DM Sans, 0.875rem/500, text-heading)         │
│  Truncated to 2 lines (line-clamp-2)                         │
│                                                               │
│  Excerpt text (DM Sans, 0.8rem, text-muted)                  │
│  Truncated to 1 line (line-clamp-1)                           │
│                                                               │
│  Source Name · 3 hours ago (DM Sans, 0.75rem, text-subtle)   │
└─────────────────────────────────────────────────────────────┘
```

**Card dimensions.** Padding: `p-4`. No fixed height — cards expand to content.
Hover state: `bg-surface-overlay`, `cursor-pointer`, `transition-colors 150ms`.

**Loading state.** Display five skeleton cards. Each skeleton has:
- A gray bar at 75% width for the headline (`bg-surface-overlay`, `rounded`, `h-4`).
- A gray bar at 55% width for the excerpt (`h-3`).
- A gray bar at 35% width for the meta line (`h-3`).
- Animate with CSS `animate-pulse`.

**Relative time formatting rules:**
- Less than 1 hour: "X minutes ago"
- 1–23 hours: "X hours ago"
- 1–6 days: "X days ago"
- 7+ days: Formatted date, e.g., "Feb 22" (current year omitted) or "Feb 22, 2025"
  (prior year included)

**External link indicator.** A small Lucide `ExternalLink` icon (12px, `text-subtle`)
displayed to the right of the source/date meta line. Indicates to the user that the
card will open externally.

**Placement on the holding detail page.** The news section is inserted after the
transaction history block and before the page footer. Full-width, same horizontal
padding as the other page sections.

### 1.6 Empty and Error States

**No articles found (GNews returned zero results):**
Section renders with the header visible. Below the header, a single centered message:
"No recent news found for [Instrument Name]." in DM Sans 0.875rem, `text-muted`.

**API key not configured (GNEWS_API_KEY absent):**
Section renders a single card-style link:
- Label: "Search Google News for [Instrument Name]"
- Icon: Lucide `ExternalLink`, 14px, `text-subtle`
- Style: Same card container, `p-4`, `hover:bg-surface-overlay`, `cursor-pointer`
- Behavior: Opens the Google News search URL in a new tab (current S21 behavior,
  preserved as the no-key fallback)
This fallback ensures the page is never broken by missing configuration.

**Network/fetch error:**
Section renders: "News temporarily unavailable." in `text-muted`. No retry button
in MVP.

### 1.7 Non-Goals

- Real-time news streaming or WebSocket updates.
- Sentiment analysis or AI-generated news summaries on this page
  (the Advisor panel handles analytical synthesis).
- Filtering, searching, or sorting within the news section.
- Displaying news images or thumbnails.
- Pagination beyond the initial ten articles.

### 1.8 Acceptance Criteria

- AC-1: On load of any holding detail page, a "Recent News" section appears below
  the transaction history block.
- AC-2: The section displays between five and ten article cards, each showing a
  headline, excerpt, source, and relative time.
- AC-3: Clicking any card opens the article in a new tab without navigating away
  from the holding detail page.
- AC-4: While news is loading, skeleton cards are visible and the page is not blocked.
- AC-5: If GNEWS_API_KEY is absent, the section displays the Google News fallback
  link card rather than an error.
- AC-6: Articles are limited to the trailing 90 days. No articles older than 90
  days appear.
- AC-7: The section is not visible on any page other than `/holdings/[symbol]`.

---

## Section 2 — Default Sort: Symbol A-Z on Holdings Tables

### 2.1 Problem Statement

UAT confirmed that the portfolio dashboard holdings table and the dedicated holdings
page table do not render in a predictable order on page load. With 83 instruments,
an undefined default sort creates cognitive overhead — the user cannot reliably find
a holding without scanning the entire table or using browser search. The fix is a
single, consistent default: alphabetical ascending by symbol.

### 2.2 Functional Requirements

**FR-2.1** The holdings table on the dashboard (`/`) shall default to sorting by
`symbol` ascending (A-Z) on every page load and on every data refresh (including
the background rebuild refresh introduced in S21).

**FR-2.2** The holdings table on the holdings page (`/holdings`) shall apply the
same A-Z default.

**FR-2.3** User-initiated column sorts shall override the default for the duration
of the session. The default is not re-applied after a user manually re-sorts.

**FR-2.4** Sort state shall be reflected in URL query params (`?sort=symbol&dir=asc`)
so that deep links and page refreshes preserve the active sort. On a fresh page load
with no query params, the A-Z default is applied.

**FR-2.5** The symbol column header shall display the active sort indicator
(Lucide `ChevronUp`, 14px, `text-muted`) on initial page load, confirming to the
user that the default sort is active.

### 2.3 Scope and Implementation Notes

This is a client-side state change. Data is already fetched from the API in a single
call; sorting is performed in the component. No API changes are required. The
implementation is confined to the table component's initial sort state configuration.
Estimated effort: 1-2 hours including URL param plumbing and verification.

### 2.4 Non-Goals

- Persisting the user's chosen sort across browser sessions (local storage).
- Server-side sorting or pagination.
- Any changes to the sort behavior on the Transactions page, which has its own
  established default (date descending).

### 2.5 Acceptance Criteria

- AC-1: On a fresh page load of `/` with no query params, the holdings table is
  sorted alphabetically by symbol (A-Z).
- AC-2: On a fresh page load of `/holdings` with no query params, the holdings table
  is sorted alphabetically by symbol (A-Z).
- AC-3: The symbol column header displays the ascending sort indicator on page load.
- AC-4: After a background data refresh (the S21 non-blocking rebuild), the table
  remains sorted A-Z unless the user has re-sorted manually.
- AC-5: Loading `/?sort=symbol&dir=asc` produces a table sorted A-Z.

---

## Section 3 — Column Parity: Holding Detail Matches Dashboard/Holdings Table

### 3.1 Problem Statement

UAT confirmed that navigating from the holdings table to a holding detail page
creates a discontinuity: fields visible on the table disappear from the detail view.
The user loses context mid-flow. The detail page, which is the highest-information
view in the application, should be a superset of the dashboard table — every data
point visible at the list level must also be visible at the detail level, plus
additional detail unique to that view.

### 3.2 Gap Analysis: Dashboard/Holdings Table vs. Holding Detail Page

The following table documents the UAT-confirmed state as of S21 and identifies gaps.

| Field | Dashboard Table | Holdings Table | Detail Page (Post-S21) | Gap? |
|-------|----------------|----------------|------------------------|------|
| Symbol | Yes | Yes | Yes (header) | No |
| Instrument Name | Yes (truncated) | Yes (truncated) | Yes (header) | No |
| Quantity (Shares) | Yes | Yes | Yes (Position Summary) | No |
| Current Price | Yes | Yes | Indirect (via Market Value / Shares) | **Yes** |
| Market Value | Yes | Yes | Yes (Position Summary) | No |
| Unrealized PnL ($) | Yes | Yes | Yes (Position Summary) | No |
| Unrealized PnL (%) | Yes | Yes | Yes (Position Summary) | No |
| Day Change ($) | No | Yes | Yes (S21 addition) | No |
| Day Change (%) | No | Yes | Yes (S21 addition) | No |
| Allocation % | No | Yes | Yes (S21 addition) | No |
| Cost Basis | No | Yes | Yes (Position Summary) | No |
| Realized PnL | No | Yes | **Missing** | **Yes** |
| First Buy Date | No | No | Yes (S21 addition) | No |
| Data Source | No | No | Yes (S21 addition) | No |
| Avg Cost Per Share | Derivable | Derivable | **Missing as explicit field** | **Yes** |

**Confirmed gaps requiring addition to the detail page:**

1. **Current Price** — Must be displayed as a standalone, prominently labelled field.
   Currently, the user must divide Market Value by Shares to infer the price. This is
   unacceptable on a detail page.

2. **Realized PnL** — Available on the holdings table page, absent from the detail view.
   The data already exists in the API response (computed by the FIFO engine).

3. **Average Cost Per Share** — The holdings table provides enough data to compute this,
   but it is not surfaced as an explicit labeled field on the detail page. Users commonly
   use this figure to assess whether to add to a position.

### 3.3 Functional Requirements

**FR-3.1** The holding detail page position summary grid shall be expanded to include
Current Price as an explicitly labeled field. Label: "Current Price". Value: the mark
price from the existing price resolution logic (live quote or PriceBar fallback, with
staleness indicator per the `provider` discriminator).

**FR-3.2** The position summary grid shall include Realized PnL as an explicitly labeled
field. Label: "Realized PnL". Value: formatted as `+$X,XXX.XX` or `−$X,XXX.XX`
with gain/loss color. If no sells have occurred, display `$0.00` in `text-muted`.

**FR-3.3** The position summary grid shall include Average Cost Per Share as an
explicitly labeled field. Label: "Avg Cost". Value: `(totalCostBasis ÷ totalShares)`,
formatted as `$XXX.XX`. This is derivable from fields already returned by the API.
No new database query is required.

**FR-3.4** The position summary grid layout shall accommodate the three new fields
without visual crowding. If the existing 12-field, 3-row × 4-column grid cannot
absorb three additional fields cleanly, the layout shall expand to 4 rows × 4 columns
(16 fields maximum, with the 16th used for a future field or left as intentional
whitespace).

**FR-3.5** The staleness indicator logic introduced in S21 (`provider: 'price-history'`
discriminator) shall apply to the Current Price field. When price is derived from
the PriceBar fallback, an amber staleness label shall appear below the price value
("As of [date]" in DM Sans 0.75rem, `stale-fg` color).

### 3.4 UI/UX Specification

**Revised position summary grid layout (4 rows × 4 columns):**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Current Price│ Shares       │ Avg Cost     │ Market Value │
│ $245.30      │ 120          │ $208.40      │ $29,436.00   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Unreal. PnL  │ Day Change   │ Allocation % │ Cost Basis   │
│ +$2,428 +9.4%│ +$1.20 +0.5%│ 20.7%        │ $25,008.00   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Realized PnL │ First Buy    │ Data Source  │ (reserved)   │
│ +$1,540.00   │ Jun 15, 2025 │ Live Quote   │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Field ordering rationale: The most decision-critical fields (price, shares, current
value) lead. PnL fields follow. Metadata fields (First Buy, Data Source) trail.
The reserved slot is explicitly empty — do not fill with placeholder content.

**Current Price field — staleness variant:**
```
Current Price
$245.30
As of Feb 25 ← amber text, 0.75rem, stale-fg
```

**Realized PnL — zero-sell variant:**
```
Realized PnL
$0.00  ← text-muted, no gain/loss color
```

**Typography and formatting** follow the existing position summary specification:
label 0.75rem, uppercase, `text-muted`; value 1.125rem/500, `text-heading` for
neutral values, gain/loss color for PnL fields. Right-align all numeric values.
Use `tabular-nums`. Use `−` (U+2212) for negative values, not hyphen.

### 3.5 API Changes

The existing `GET /api/portfolio/holdings/[symbol]` route already returns the data
needed to derive Avg Cost Per Share (totalCostBasis and totalShares are both present).
The UI should compute `avgCost = totalCostBasis / totalShares` at render time.

Realized PnL: confirm whether `realizedPnl` is currently included in the route
response. If absent, add it as a parallel query consistent with the S21 pattern
(FIFO engine already computes this value).

Current Price: already returned as the `latestQuote.price` field. The label change
and staleness indicator are purely UI-side.

### 3.6 Non-Goals

- Adding new columns to the dashboard table or the holdings table (those views are
  already confirmed correct by UAT).
- Changing any existing field label or value formatting on the detail page.
- Adding a "Total Return" composite field — derivable by the user from Unrealized +
  Realized PnL and out of scope for this session.

### 3.7 Acceptance Criteria

- AC-1: The holding detail page displays "Current Price" as an explicitly labeled
  field in the position summary grid.
- AC-2: The holding detail page displays "Realized PnL" as an explicitly labeled
  field. The value is zero (displayed in neutral color) if no sells exist for the
  instrument.
- AC-3: The holding detail page displays "Avg Cost" (average cost per share) as
  an explicitly labeled field.
- AC-4: When Current Price is derived from the PriceBar fallback, an amber "As of
  [date]" staleness label appears below the price value.
- AC-5: All numeric values in the position summary grid are right-aligned and use
  tabular-nums. Negative values use the minus sign character (U+2212).
- AC-6: Every field visible in the holdings table (`/holdings`) has a corresponding
  representation on the holding detail page.

---

## Section 4 — Crypto Asset Support via Free/Public APIs

### 4.1 Problem Statement

The portfolio includes at least one intended crypto asset (XRP, currently stored as
the Bitwise XRP ETF due to the absence of crypto provider support). The existing
`Instrument.type` enum covers STOCK, ETF, and FUND — CRYPTO is not a valid type.
The scheduler uses NYSE market calendar gating, which is inappropriate for
24/7 crypto markets. No provider in the current chain supports crypto quotes or
price history.

This enhancement adds first-class crypto support: a new asset type, a new provider
(CoinGecko public API, no key required), scheduler calendar bypass for crypto
instruments, and UI adaptations for assets without a traditional exchange.

### 4.2 Scope Decision — XRP Prerequisite

The executive sponsor must resolve the XRP data decision (S21 P2 blocker) before
this section is implemented. If the intent is XRP crypto, the current instrument
record must be deleted and re-added using the new crypto flow after this feature ships.
If the intent is the Bitwise XRP ETF, this section proceeds independently without
affecting the existing XRP record.

### 4.3 Supported Asset: Crypto via CoinGecko

**Provider selection.** CoinGecko public API is selected as the primary crypto data
source. Rationale: no API key required for the free tier (100 calls/minute unauthenticated),
supports coin search by name/symbol, provides real-time price, 24-hour change, and
full price history back to coin inception. Responses are JSON with a well-documented
shape. No CAPTCHA risk, no IP ban pattern observed.

**CoinGecko coin ID vs. ticker symbol.** CoinGecko uses internal coin IDs
(e.g., `bitcoin`, `ripple`, `ethereum`) rather than ticker symbols (BTC, XRP, ETH).
The mapping from user-entered symbol to CoinGecko coin ID must be resolved at
instrument creation time via the CoinGecko search endpoint and stored in
`Instrument.providerSymbolMap` (e.g., `{ "coingecko": "ripple" }`). This is
consistent with the existing pattern used for FMP and Tiingo symbol mappings.

**Rate limits.** CoinGecko free tier: 100 calls/minute, no daily cap (unauthenticated).
Add a `COINGECKO_RPM=100` environment variable. Rate limiter integration follows
the existing `RateLimiter` pattern in `@stalker/market-data`. The scheduler's
batch polling for crypto instruments should use CoinGecko's
`/api/v3/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true`
endpoint, supporting up to ~200 coin IDs per call — equivalent to the Tiingo batch
pattern (one call, all crypto instruments).

### 4.4 Schema Changes

**Migration 1 — Instrument.type enum expansion.**
Add `CRYPTO` to the `Instrument.type` enum in `schema.prisma`.

Before:
```prisma
type InstrumentType = "STOCK" | "ETF" | "FUND"
```

After:
```prisma
type InstrumentType = "STOCK" | "ETF" | "FUND" | "CRYPTO"
```

This is an additive change. Existing records are unaffected. All existing type-based
conditionals in business logic and UI must be audited to ensure they handle CRYPTO
without falling through to unexpected behavior. Specifically, any switch/case or if/else
on `instrument.type` must explicitly handle or gracefully ignore CRYPTO.

**Migration 2 — Instrument.exchangeTz handling for crypto.**
Crypto instruments do not belong to an exchange with a fixed timezone. For CRYPTO
instruments, set `exchangeTz` to `"UTC"` and `exchange` to `"CRYPTO"`. The
`MarketCalendar.isTradingDay()` function must treat CRYPTO instruments as always-
trading (return `true` for any date).

No new columns are required. The existing `providerSymbolMap` JSON column stores the
CoinGecko coin ID. No other schema changes.

### 4.5 New Provider: CoinGeckoProvider

Create `packages/market-data/src/providers/coingecko.ts` implementing the existing
`MarketDataProvider` interface.

**Interface implementation:**

```typescript
class CoinGeckoProvider implements MarketDataProvider {
  readonly name = 'coingecko';

  // Searches by symbol or name. Calls:
  // GET /api/v3/search?query={query}
  // Maps results to SymbolSearchResult with type: 'CRYPTO'.
  // Includes coin ID in providerSymbol field for downstream mapping storage.
  searchSymbols(query: string): Promise<SymbolSearchResult[]>;

  // Calls:
  // GET /api/v3/simple/price?ids={coinId}&vs_currencies=usd
  //   &include_24hr_change=true&include_last_updated_at=true
  // coinId is retrieved from instrument.providerSymbolMap['coingecko'].
  getQuote(symbol: string): Promise<Quote>;

  // Calls:
  // GET /api/v3/coins/{coinId}/market_chart/range
  //   ?vs_currency=usd&from={unixStart}&to={unixEnd}
  // Returns daily bars derived from the 'prices' array in the response.
  // Each [timestamp, price] pair becomes a PriceBar with date derived from timestamp.
  getHistory(symbol: string, start: Date, end: Date, resolution: '1D'): Promise<PriceBar[]>;

  getLimits(): ProviderLimits; // requestsPerMinute: 100, requestsPerDay: Infinity
}
```

**Quote normalization.** CoinGecko returns price as a raw number. Apply the existing
`new Decimal(String(jsonNumber))` conversion pattern (per AD-P2-10) to prevent
float contamination. Map `last_updated_at` (Unix timestamp) to `asOf` (UTC datetime).

**Day change.** CoinGecko provides `price_change_percentage_24h` natively in the
`/coins/markets` endpoint. Use this value for day change display. Note: this is a
rolling 24-hour change, not a market-session-based change — this behavioral difference
must be noted in the UI (see Section 4.8).

**Batch quote support.** The scheduler shall call CoinGecko's batch endpoint to
fetch all crypto instrument prices in a single call. Implement a
`getCryptoBatchQuotes(coinIds: string[]): Promise<Quote[]>` method on the provider
(outside the `MarketDataProvider` interface, called directly by the scheduler's
crypto polling path). This mirrors the `pollAllQuotes()` pattern used for Tiingo.

### 4.6 Scheduler Changes

**Crypto polling path.** The scheduler currently polls all instruments via Tiingo
batch quotes during market hours (gated by `MarketCalendar.isMarketOpen()`). Crypto
instruments must be polled on a separate path that:

1. Is not gated by NYSE market hours. Crypto is 24/7.
2. Runs at the same 30-minute interval as the equity polling cycle.
3. Uses `CoinGeckoProvider.getCryptoBatchQuotes()` for all CRYPTO-type instruments.

**Implementation.** At each polling cycle, partition `instruments` into `equities`
(STOCK, ETF, FUND) and `cryptoAssets` (CRYPTO). Equity polling proceeds with the
existing NYSE gate. Crypto polling runs unconditionally. Both paths write to the
same `LatestQuote` table using the existing upsert pattern.

**Calendar module.** Update `MarketCalendar.isTradingDay()` to accept an optional
`instrumentType` parameter. When `instrumentType === 'CRYPTO'`, return `true`
unconditionally, bypassing all exchange calendar logic.

### 4.7 Instrument Creation Flow: Adding a Crypto Asset

The existing "Add Instrument" modal uses `GET /api/market/search?q=...` which currently
calls FMP only. This must be extended to also call CoinGecko when the user enters
a query, then merge and deduplicate results.

**Search result display.** Crypto results from CoinGecko shall be distinguished from
equity results in the dropdown by a "Crypto" type badge (`bg-surface-overlay`,
`text-muted`, `rounded`, `text-xs`). This matches the existing type display pattern
for STOCK/ETF/FUND.

**Instrument creation.** When a CoinGecko result is selected:
1. `POST /api/instruments` is called with `type: 'CRYPTO'`, `exchange: 'CRYPTO'`,
   `exchangeTz: 'UTC'`, and `providerSymbolMap: { coingecko: "{coinId}" }`.
2. Historical backfill uses `CoinGeckoProvider.getHistory()` instead of Tiingo.
3. The initial quote fetch uses `CoinGeckoProvider.getQuote()`.

**No changes to the transaction flow.** Crypto instruments support BUY and SELL
transactions identically to equity instruments. The FIFO engine is asset-agnostic.
Quantity supports fractional shares (already in schema as `Decimal`).

### 4.8 UI Adaptations for Crypto

**Holdings table and dashboard.** No layout changes required. Crypto instruments
render identically to equities. A "Crypto" type badge may appear in a future
instrument-type filter — not in scope for this session.

**Holding detail page — Day Change label.** For CRYPTO instruments, the Day Change
field label shall read "24h Change" instead of "Day Change" to accurately reflect
that the value is a rolling 24-hour window, not a NYSE-session-based change.
All other position summary fields remain identical.

**Holding detail page — Exchange field.** The Data Source field already shows
the provider name. No exchange field is displayed for crypto instruments (exchange
is `CRYPTO`, which is not meaningful to show to the user as-is). If a future
"Instrument Info" section is added, "Crypto — CoinGecko" is the appropriate label.

**Staleness.** The existing staleness indicator logic applies to crypto instruments
without modification. `LatestQuote.asOf` is populated with CoinGecko's `last_updated_at`
timestamp. Crypto never enters the PriceBar fallback path during market hours
(since it has no market hours) — but a stale crypto quote (older than 1 hour) shall
still display the amber staleness indicator.

**Charts.** The candlestick chart on the holding detail page uses PriceBar data.
CoinGecko history returns `[timestamp, price]` pairs without OHLC data — only the
close price is available. For CRYPTO instruments, the chart shall use a line series
(area chart style, matching the dashboard portfolio chart configuration) instead of
a candlestick series, since open/high/low data is not available on the free tier.
This decision shall be documented as an architecture decision in HANDOFF.md.

### 4.9 CoinGecko API Error Handling

| Scenario | Behavior |
|----------|----------|
| Rate limit hit (HTTP 429) | Log warning, skip this poll cycle for crypto. Existing bars and latest quote remain in DB. Consistent with equity provider failure handling. |
| Coin ID not found | Return empty result from `searchSymbols`. Instrument creation blocked at the UI (no result to select). |
| `getHistory` returns empty array | Log warning. `firstBarDate` remains null. UI shows unpriced warning per existing Spec 5.5 pattern. |
| CoinGecko unreachable | Log error, return cached `LatestQuote`. Consistent with KL-5 (single provider, no fallback). Document as KL-7 in KNOWN-LIMITATIONS.md. |

### 4.10 Environment Variables

Add to `.env.local` and `.env.example`:
```env
COINGECKO_RPM=100     # CoinGecko free tier: 100 req/minute unauthenticated
```

No API key is required for the CoinGecko free public tier. If a key is later added
for the paid tier, `COINGECKO_API_KEY` shall be the variable name.

### 4.11 Non-Goals

- Support for crypto derivatives, staking rewards, or DeFi instruments.
- Paid CoinGecko API tier features (OHLC data, intraday bars).
- Multiple crypto data providers or a fallback chain for crypto (single provider
  is consistent with the existing Tiingo-only pattern for historical bars, KL-5).
- Crypto-to-crypto or non-USD denominated portfolio valuation.
- NFT support.

### 4.12 Architecture Decisions to Record

The following decisions shall be added to HANDOFF.md and the master architecture
decision log at session close.

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-S22-1 | CoinGecko selected as crypto provider (unauthenticated free tier) | No key required. 100 req/min. JSON REST API. Coin ID system well-documented. Covers search, quotes, and history. Consistent with free-tier-first provider philosophy. |
| AD-S22-2 | Crypto instruments use UTC timezone, exchange = "CRYPTO" | No exchange-session semantics apply. MarketCalendar always returns isTradingDay=true for CRYPTO. Avoids inventing a crypto-specific calendar concept. |
| AD-S22-3 | Crypto chart uses area/line series, not candlestick | CoinGecko free tier returns close price only (no OHLC). Area chart is honest about data resolution. Paid tier OHLC is post-MVP. |
| AD-S22-4 | Crypto batch quote via separate scheduler path, not Tiingo | Crypto instruments must not be gated by NYSE market hours. Partitioned polling paths are the simplest solution without scheduler refactor. |
| AD-S22-5 | Day Change label reads "24h Change" for CRYPTO instruments | CoinGecko reports rolling 24h change, not session-based change. Label must be accurate to prevent user confusion. |

### 4.13 Test Requirements

The following test coverage is required before the crypto feature is considered
complete.

- `CoinGeckoProvider.searchSymbols()` — happy path, empty result, network error.
- `CoinGeckoProvider.getQuote()` — happy path, rate limit response (HTTP 429),
  invalid coin ID.
- `CoinGeckoProvider.getHistory()` — happy path, empty result, partial data.
- Scheduler partitioning logic — confirm CRYPTO instruments are excluded from the
  Tiingo equity path and included in the CoinGecko crypto path.
- `MarketCalendar.isTradingDay()` — confirm CRYPTO instruments always return true.
- `POST /api/instruments` — confirm a CRYPTO instrument can be created with the
  correct type, exchangeTz, and providerSymbolMap shape.

### 4.14 Acceptance Criteria

- AC-1: A user can search for "XRP" (or "bitcoin", "ethereum") in the Add Instrument
  modal and see a CoinGecko result distinguished by a "Crypto" type badge.
- AC-2: Selecting a crypto result creates an Instrument record with
  `type: CRYPTO`, `exchange: CRYPTO`, `exchangeTz: UTC`, and
  `providerSymbolMap.coingecko` populated with the correct coin ID.
- AC-3: Historical price bars are backfilled from CoinGecko on instrument creation.
  The `firstBarDate` field is populated after backfill completes.
- AC-4: The scheduler polls crypto instrument quotes at every 30-minute cycle,
  regardless of NYSE market hours or day of week.
- AC-5: The holding detail page for a crypto instrument displays "24h Change" instead
  of "Day Change".
- AC-6: The candlestick chart on the holding detail page is replaced with an area/line
  chart for CRYPTO instruments.
- AC-7: FIFO lot accounting, PnL calculation, and portfolio value snapshots function
  correctly for crypto instruments (no behavioral difference from equity instruments
  in the analytics layer).
- AC-8: All new test cases pass. `pnpm test` reports 0 failures.

---

## Section 5 — Advisor NLU: Blocked Pending Sponsor Input

### 5.1 Status

**Blocked.** Not in S22 scope.

### 5.2 Context

The `@stalker/advisor` package is architecturally complete and production-operational,
including five tools, Anthropic Claude integration, context windowing, rolling
summaries, and a slide-out panel UI. The executive sponsor has indicated intent to
provide specific configuration inputs: a custom system prompt, a model selection,
and placement UI details. This feature will be scoped into S23 once those inputs
are received.

### 5.3 Inputs Required From Sponsor (Before S23 Scoping)

1. **System prompt.** The custom prompt text that should replace or augment the current
   advisor system prompt in `@stalker/advisor`. If augmenting, specify which sections
   of the current prompt should be preserved and which replaced.
2. **Model selection.** The target model identifier (e.g., `claude-sonnet-4-6`,
   `claude-opus-4-6`). Current default is `claude-sonnet-4-6`. Specify if change is
   needed and the rationale.
3. **Placement UI.** The current advisor is a slide-out panel triggered by a FAB
   (floating action button) at bottom-right, following the Bookworm pattern.
   Specify any desired changes to trigger mechanism, panel width, position, or
   whether a dedicated page is preferred over the panel pattern.

---

## Section 6 — S22 Session Checklist

The following ordered checklist represents the recommended execution sequence.

**Pre-session (today, before coding begins):**
- [ ] Complete S21 manual browser verification (4 flows)
- [ ] Resolve and document XRP data decision
- [ ] Update HANDOFF.md and KNOWN-LIMITATIONS.md with S21 state
- [ ] Reconcile test count delta (683 → 720) and document source
- [ ] Confirm GNEWS_API_KEY is available (or confirm fallback mode is acceptable)

**S22 Execution Order (recommended by risk, lowest to highest):**
1. Default sort: symbol A-Z (Section 2) — lowest risk, immediate visible fix
2. Column parity: price, realized PnL, avg cost fields (Section 3) — low-medium risk,
   UI-only changes with minor API verification
3. News feed: card/list UI with GNews integration (Section 1) — medium risk,
   new external dependency, new API route
4. Crypto support: full provider, schema migration, scheduler changes (Section 4) —
   highest risk, most test surface, implement last so earlier items are not blocked
   by any crypto-related issues

**Post-session:**
- [ ] All S22 acceptance criteria verified via manual browser testing
- [ ] Architecture decisions AD-S22-1 through AD-S22-5 recorded in HANDOFF.md
- [ ] KL-7 (CoinGecko single-provider dependency) added to KNOWN-LIMITATIONS.md
- [ ] `pnpm test` passes with 0 failures and new crypto/news test coverage included
- [ ] `.env.example` updated with `COINGECKO_RPM` and `GNEWS_API_KEY`
- [ ] HANDOFF.md session state updated
- [ ] Advisor sponsor inputs requested for S23 scoping

---

## Appendix A — CoinGecko API Reference (Key Endpoints)

| Purpose | Endpoint | Key Params |
|---------|----------|------------|
| Search by symbol/name | `GET /api/v3/search?query={q}` | `query` |
| Real-time price (single) | `GET /api/v3/simple/price?ids={id}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true` | `ids`, `vs_currencies` |
| Real-time price (batch) | `GET /api/v3/simple/price?ids={id1,id2,...}&vs_currencies=usd&include_24hr_change=true` | `ids` (comma-separated) |
| Price history | `GET /api/v3/coins/{id}/market_chart/range?vs_currency=usd&from={unix}&to={unix}` | `id`, `from`, `to` |
| Coin details | `GET /api/v3/coins/{id}` | `id` |

Base URL: `https://api.coingecko.com`
Authentication: None required for free tier.
Rate limit header: `X-RateLimit-Remaining` (monitor but do not rely on — use in-process limiter).

---

## Appendix B — GNews API Reference (Key Endpoints)

| Purpose | Endpoint | Key Params |
|---------|----------|------------|
| News search | `GET /api/v4/search` | `q`, `lang`, `max`, `from`, `to`, `apikey` |
| Top headlines (fallback) | `GET /api/v4/top-headlines` | `category`, `lang`, `apikey` |

Base URL: `https://gnews.io`
Authentication: API key (`GNEWS_API_KEY`) in query param `apikey`.
Free tier: 100 req/day, 10 articles/request.
Date format for `from`/`to`: ISO 8601 (`2026-01-01T00:00:00Z`).
Query construction for this feature: `"{instrumentName}" financial` (quoted for exact match).

**Fallback behavior if GNEWS_API_KEY is absent.** The `GET /api/holdings/[symbol]/news`
route detects missing key at startup and returns a single synthetic article record:
```json
{
  "articles": [{
    "title": "Search Google News for {instrumentName}",
    "url": "https://www.google.com/search?q={encoded}&tbm=nws&tbs=qdr:m3",
    "source": "Google News",
    "publishedAt": null,
    "relativeTime": null,
    "description": null
  }]
}
```
The UI renders this as the single-link fallback card described in Section 1.6.

---

*This document supersedes any prior notes or chat summaries describing the S22 scope.
Engineering should treat this as the authoritative specification. Questions or
ambiguities should be raised with Product before coding begins, not discovered mid-session.*
