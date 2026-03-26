# AGENTS.md — STOCKER

> **Purpose:** Operating schema for agentic work in this repo: roles, guardrails, coordination model, session contract, and quality gates. The "what." See CLAUDE.md for the architecture and coding rules.
> **Owner:** Eric Ediger
> **Last Updated:** 2026-02-28 (Post-Session 20 — Hardening & Project Close-Out)

---

## 1) Defaults

Sessions default to **solo** for most work. **Hybrid** comms policy and **plan approval enabled** apply when multi-agent sessions are warranted.

**Mode selection rationale:**
- **Solo** is the default. STOCKER is a local-first, single-developer project. Most sessions are sequential with tightly coupled tasks.
- **Subagents** are used when a session has two or more clearly separable workstreams (e.g., backend API work vs. frontend component work) with no mid-task dependency on each other.
- **Agent Teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) are reserved for sessions requiring genuine parallel execution with mid-task coordination. The 3–4× token cost must be justified explicitly in the Session Contract.

> **Project default:** Solo or subagents. Agent Teams require explicit justification and lead sign-off before the session begins.

---

## 2) Project Snapshot

- **Primary Goal:** A local-first, single-user stock portfolio tracker with FIFO lot accounting, real-time market data polling, and an LLM-powered financial advisor.
- **Stakeholders:** Single developer/user (Eric Ediger). No external stakeholders or end-users.
- **Non-Goals:**
  - Multi-user or multi-tenant support
  - Cloud deployment or hosted infrastructure
  - Real-time (sub-minute) trading features
  - Non-US exchange support (beyond basic instrument tracking)
- **Runtime Constraints:** Local Mac dev machine only. Two processes: `next dev` (UI + API) and `scheduler` (standalone Node polling process), launched together via `pnpm dev`.
- **Data Constraints:** No PII. No regulated financial data transmitted externally beyond API key-gated market data provider calls (FMP, Tiingo, Alpha Vantage). No customer data. Local SQLite database — no cloud persistence.

---

## 3) Hard Guardrails

### 3.1 Data Handling

- Never commit secrets or credentials: API keys (`FMP_API_KEY`, `ANTHROPIC_API_KEY`, etc.) live exclusively in `apps/web/.env.local`, which is gitignored.
- No PII in fixtures, examples, or exports. Use synthetic portfolio data only.
- `DATABASE_URL` is a local SQLite file path. Never point it at a remote database in any committed config.

### 3.2 Repo Boundaries

- Follow existing patterns. No broad refactors unless explicitly stated in the Session Contract.
- Changes must be scoped and reversible. Prefer additive changes over rewrites.
- **Decimal precision is non-negotiable.** No `number` type for money or quantity in business logic. All financial arithmetic uses `Decimal.js` via `@stalker/shared` utilities. No `parseFloat()`, `Math.round()`, or native arithmetic operators (`+`, `-`, `*`, `/`) on financial values. Violations are bugs, not style issues.
- **TypeScript strict mode is non-negotiable.** No `any`, no `@ts-ignore`, no `@ts-expect-error`. All function parameters and return types must be explicitly typed.
- **Event-sourced write rule:** Every transaction write (create, edit, delete) must validate the sell invariant and trigger a snapshot rebuild for the affected date range. Skipping this corrupts the portfolio state.
- Named exports only. No `export default` except for Next.js page/layout/route files.

### 3.3 Stakeholder Interaction

This is a solo developer project. The lead and the stakeholder are the same person. Teammates should write clear output and surface decisions explicitly in their deliverables rather than assuming verbal follow-up.

---

## 4) Delegation Modes and Comms Policy

### 4.1 Mode Selection

| Mode | When to use |
|------|-------------|
| **Solo** | Default. Small, sequential, or tightly coupled work. Single engineer most sessions. |
| **Subagents** | Focused parallel tasks with no mid-task dependency — e.g., BE API teammate + FE component teammate working on separated file scopes. |
| **Agent Teams** | Cross-layer changes or sessions where a teammate's mid-task discovery is likely to change another teammate's approach. Requires explicit justification. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. |

### 4.2 Comms Policy

**Dependency rule:** If mode is **subagents**, comms policy does not apply. Subagents report to the caller only — peer messaging is not available.

If mode is **agent_teams** with policy **lead_mediated**, the lead is intentionally operating subagent-equivalent communication. Document the reason in the Session Contract.

| Policy | Behavior |
|--------|----------|
| **direct** | Teammates message each other freely. Use for low-risk exploratory sessions. |
| **lead_mediated** | Teammates do not message each other. Lead relays all dependencies. Requires documented reason when used in agent_teams mode. |
| **hybrid** *(recommended default for multi-agent sessions)* | Direct messaging permitted for the four cases below only. All other comms route through lead. |

**Hybrid — four permitted cases for direct teammate messaging:**

1. **Dependency clarification** — resolving a known interface or data dependency between tasks
2. **File or interface conflict avoidance** — coordinating before writing to a shared or adjacent path
3. **Peer review or challenge** — one teammate reviewing or questioning another's approach before finalization
4. **Material discovery** — a teammate has uncovered information mid-task that changes the scope, approach, or feasibility of another teammate's active work. Route immediately; do not wait for the lead relay cycle.

### 4.3 Plan Approval for Risky Work

Require teammates to submit a plan and wait for lead approval before implementing when the task involves:
- Database schema changes (`prisma/schema.prisma`)
- Multi-package interface changes (types in `@stalker/shared`)
- Changes to the event-sourced write pipeline (transaction CRUD + snapshot rebuild)
- Broad refactors across more than one package

State this requirement explicitly in the Session Contract.

---

## 5) Role Registry

Roles may be merged or omitted per session. This registry defines interfaces only — what each role owns and produces.

| Role | Primary responsibility | Typical outputs |
|------|------------------------|-----------------|
| **Lead** | Orchestrate, assign, integrate, own final output. Maintains `HANDOFF.md`, `CLAUDE.md`, `AGENTS.md`. | Kickoff, Session Contracts, SESSION-REPORT, HANDOFF.md |
| **Engineering — Backend** | API routes, Prisma schema, analytics engine, market data, scheduler. | Code, migration scripts, Vitest tests, inline docs |
| **Engineering — Frontend** | React components, hooks, Tailwind styling, TradingView chart integration. | Component code, hook code, visual verification notes |
| **Engineering — Full-Stack** | Spans both layers. Used when changes are too coupled to split. | As above, both layers |
| **QA** | Verification strategy, test coverage, release readiness. | Test plan, test cases, regression targets, go/no-go recommendation |

**Spawn pattern:** Include role, filesystem scope, constraints, and deliverable format in every teammate Session Contract. Teammates do not read each other's contracts — the lead relays all cross-teammate dependencies.

**Review pattern:** After teammate outputs are received, the lead verifies against the session plan's exit criteria and the quality gates in §9 before sign-off.

---

## 6) Filesystem Scoping

### 6.1 Scope Rule

Every Session Contract must specify:
- **Allowed paths** — directories and files the teammate may read and write
- **Forbidden paths** — explicitly out of scope for that teammate
- **Shared files requiring lead approval before write** — typically `packages/shared/src/types/`, `apps/web/prisma/schema.prisma`, `CLAUDE.md`, `AGENTS.md`, `HANDOFF.md`

**Default enforcement rule:** If a path is not explicitly listed as allowed in the Session Contract, it is out of scope. Teammates who identify a necessary out-of-scope path during execution must surface it to the lead before writing — not after. This is a hard stop, not a guideline.

### 6.2 Conflict Rule

Teammates must not write to the same file unless explicitly coordinated and serialized by the lead. If overlap is detected during execution, pause and resolve before proceeding. Last-write-wins in Agent Teams mode — concurrent writes to the same file produce silent data loss.

### 6.3 Reference: Standard File Ownership

| File / Path | Default Owner | Notes |
|-------------|---------------|-------|
| `apps/web/prisma/schema.prisma` | Lead or designated BE teammate | Lead approval required before write |
| `packages/shared/src/types/` | Lead or designated BE teammate | Lead approval required before write |
| `apps/web/src/components/` | FE teammate | |
| `apps/web/src/app/api/` | BE teammate | |
| `packages/analytics/`, `packages/market-data/`, `packages/advisor/`, `packages/scheduler/` | BE teammate | |
| `CLAUDE.md`, `AGENTS.md`, `HANDOFF.md` | Lead only | Never written by teammates |
| `data/test/` | QA or BE teammate | Fixtures are shared; coordinate before write |

---

## 7) Session Contract Template

When the lead spawns any delegated unit of work:

```
- Objective:          {1–2 sentences}
- In scope:           {bullets}
- Out of scope:       {bullets}
- Role:               {ENG-BE | ENG-FE | ENG-FS | QA | Other}
- Mode:               {solo | subagents | agent_teams}
- Comms policy:       {direct | lead_mediated | hybrid}
  If lead_mediated + agent_teams — reason: {required}
- File scope:         Allowed: {paths}
                      Forbidden: {paths}
                      Lead approval required: {shared paths}
- Constraints:        {reference CLAUDE.md rules that apply — e.g., Rule 1 Decimal, Rule 4 Event-Sourced Writes}
- Deliverable(s):     {list — format per AGENTS.md §8.1}
- Stop conditions:    {when to pause and surface to lead rather than proceed}
- Plan approval:      {required | not required}
  If required: submit plan, wait for lead approval before implementing
```

---

## 8) Standard Deliverables

### 8.1 Teammate Output Format

All teammates produce output in this format:

1. **Summary** (max 5 bullets)
2. **Changes made** (files modified, APIs changed, decisions made)
3. **Risks and edge cases**
4. **Open questions**
5. **Next actions**

### 8.2 Lead Synthesis and Handoff

At session close, the lead produces:

- **SESSION-REPORT** (stored in `Session Reports/` with date prefix): decisions, changes, verification results
- **HANDOFF.md** (updated in repo root): current state, next session scope, open issues

`HANDOFF.md` is always the final act of a session and the first document read at the start of the next session. Breaking this chain means the next session starts with stale context.

### 8.3 Commit Pattern

Each teammate commits their own work using the format:

```
Session {N}: {brief description of what changed}
```

Example: `Session 12: Add FIFO lot engine with sell validation and snapshot rebuild`

The lead verifies all teammate commits are present in `git log` before session sign-off.

---

## 9) Quality Gates

| Gate | Command | Run when |
|------|---------|----------|
| TypeScript | `pnpm tsc --noEmit` | After every major change |
| Tests | `pnpm test` | After every major change |
| Build | `pnpm build` | Before session close |

**Gate rule:** No session closes with a failing gate. Gate failures that cannot be resolved within the session are recorded as blockers in `HANDOFF.md §3` and become the first task of the next session.

**Current baseline:** 720 passing Vitest tests as of Session 20. Any PR that reduces this count without explicit QA sign-off is a regression.

---

## 10) Related Documents

| Document | Role |
|----------|------|
| `CLAUDE.md` | Architecture overview, coding rules, session history, agent protocols — read first every session |
| `AGENTS.md` | This file — tech stack, design decisions, coordination model |
| `HANDOFF.md` | Current project state — read at every session start, written at every session end |
| `STOCKER_MASTER-PLAN.md` | Roadmap, epics, strategic decisions — read during planning sessions |
| `SESSION-{N}-PLAN.md` | Implementation spec for session N — read only during that session |
| `SESSION-{N}-KICKOFF.md` | Launch prompt for session N — used to start that session |
| `KNOWN-LIMITATIONS.md` | Documented MVP gaps with impact and mitigation |
| `apps/web/prisma/schema.prisma` | Database schema — consult when touching the data layer |
| `packages/shared/src/types/` | Shared TypeScript interfaces — consult frequently |
| `data/test/reference-portfolio.json` | PnL validation fixture — used in financial testing sessions |
| `Session Reports/` | Date-prefixed session reports — historical record |

---

## 11) Tech Stack & Design Decisions

> These decisions are **final unless explicitly revisited in a planning session.** Rationale is included to prevent re-litigation during build sessions.

### Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Framework** | Next.js (App Router) | 15.5.12 — single repo, file-based API routes, SSR optional |
| **Language** | TypeScript (strict) | 5.9.3 — full stack across all packages |
| **Runtime** | Node.js | 22.16.0 LTS |
| **Database** | SQLite via Prisma | 6.19.2 — `file:../data/portfolio.db` relative to `prisma/` |
| **Decimal math** | Decimal.js + Prisma Decimal | 10.x — stored as TEXT in SQLite; exact financial arithmetic |
| **Timezone** | date-fns + date-fns-tz | 3.x — IANA timezone strings, automatic DST handling |
| **Market calendar** | Custom `MarketCalendar` | Weekday + NYSE holiday calendar (2025–2026) |
| **UI styling** | Tailwind CSS | 4.2 — CSS-based `@theme` config (no `tailwind.config.ts`), PostCSS |
| **UI utilities** | clsx + tailwind-merge | `cn()` utility for conditional class merging |
| **Typography** | Crimson Pro / DM Sans / JetBrains Mono | Local woff2 via `next/font/local` |
| **Charting** | TradingView Lightweight Charts | 5.1.0 MIT — v5 API: `chart.addSeries(AreaSeries, opts)` |
| **Monorepo** | pnpm workspaces | 10.30.1 — no Turborepo/Nx needed |
| **Testing** | Vitest | 3.2.4 — TypeScript-native, 720 tests passing |
| **Validation** | Zod | 4.3.6 — input validation for API routes |
| **IDs** | ULID | 2.x — sortable, no coordination, SQLite-friendly |
| **Process manager** | concurrently | 9.x — runs Next.js + scheduler together via `pnpm dev` |
| **LLM** | Anthropic Claude Sonnet 4.6 (primary, adaptive thinking); OpenAI (secondary) | Provider-agnostic adapter |

**Package manager:** pnpm exclusively. No npm, no yarn. Install: `pnpm install`. Scripts: `pnpm {script}`.

### Workspace Packages

| Package | Path | Purpose | Depends On |
|---------|------|---------|------------|
| `@stalker/shared` | `packages/shared/` | Types, Decimal utils, ULID, constants | Nothing |
| `@stalker/analytics` | `packages/analytics/` | FIFO lots, PnL, portfolio value series | `@stalker/shared` |
| `@stalker/market-data` | `packages/market-data/` | Provider interface, implementations (FMP, Tiingo, AV), calendar, rate limiter | `@stalker/shared` |
| `@stalker/advisor` | `packages/advisor/` | LLM adapter, tool definitions, system prompt, context window management | `@stalker/shared` |
| `@stalker/scheduler` | `packages/scheduler/` | Polling orchestration | `@stalker/market-data` |
| `web` | `apps/web/` | Next.js application (UI + API routes) | All packages |

### Data Architecture Decisions

| Decision | Detail | Why |
|----------|--------|-----|
| Event-sourced core | Transactions + PriceBars are truth. Everything else is a rebuildable cache. | Backdated trades require full history replay. Mutable position records would corrupt under backdating. |
| SQLite, not Postgres | Single user, local-first. Zero config. | Prisma makes migration to Postgres a one-line change if ever needed. |
| Decimal.js for financial math | All money and quantity values use Decimal operations. Stored as TEXT in SQLite. | Float drift is unacceptable for a portfolio tracker. |
| ULID for entity PKs | Sortable by creation time, no coordination needed. | Auto-increment IDs only for high-volume tables (PriceBar, LatestQuote) where sortability by creation isn't meaningful. |
| Symbol-keyed holdingsJson | `PortfolioValueSnapshot.holdingsJson` uses ticker symbol as key, not instrumentId. | Debuggability. Symbol changes are rare enough to handle manually. |

### Market Data Decisions

| Decision | Detail | Why |
|----------|--------|-----|
| Three providers | FMP (search + quotes via `/stable/`), Tiingo (historical daily bars), Alpha Vantage (backup quotes) | FMP `/api/v3/` dead since Aug 2025. Stooq deprecated. Tiingo: REST API, 30+ years of data, documented limits. |
| Flat polling | All instruments polled at equal interval. No priority tiers. | Single user, not day-trading. Tiered polling adds ~150 LOC for no user-facing benefit. |
| Weekday + holiday calendar | `isTradingDay()` = weekday check + NYSE holiday list (2025–2026) for US exchanges. | Static holiday set, updated annually. Half-days not tracked. |
| Configurable rate limits | Provider limits read from env vars, not hardcoded. | When providers change free tiers, update `.env.local` — no code changes. |
| Standalone scheduler | Long-lived Node process separate from Next.js. | Next.js request-scoped execution model cannot sustain a polling loop. |

### UI & Charting Decisions

| Decision | Detail | Why |
|----------|--------|-----|
| Bookworm design system | Dark-theme adaptation. Crimson Pro + DM Sans. Five-state status system with financial semantics. | Proven component patterns. Financial domain mapping well-defined in UX Plan. |
| TradingView Lightweight Charts | Area chart (portfolio value), candlestick (instrument price). Shared `useChart` hook for lifecycle. | MIT license, purpose-built for financial data, tiny bundle (<40 KB). |
| Overlay chart deferred | Single-instrument chart only in MVP. Overlay/compare is post-MVP. | UI-only work when added later (daily bars pipeline already exists). |
| Advisor as slide-out panel | Floating action button → slide-out chat, not a dedicated page. | Matches Bookworm pattern. Post-MVP may add side-by-side layout if conversations get long. |

### Advisor Decisions

| Decision | Detail | Why |
|----------|--------|-----|
| Cached data only (MVP) | Advisor reads LatestQuote and analytics caches. No live fetches, no web search. | Small, predictable tool surface. No side effects from chat. No rate limit risk. |
| Five tools | `getTopHoldings`, `getPortfolioSnapshot`, `getHolding`, `getTransactions`, `getQuotes` | Covers all five intent categories. `getTopHoldings` added in S17 for efficient 83-instrument scale. |
| Provider-agnostic adapter | `LLMAdapter` interface. Anthropic implementation for MVP. | Adding OpenAI is trivial later. Interface prevents vendor lock-in. |
| Context window management | Token estimation + message windowing + rolling summaries. Trims oldest turns at turn boundaries. | Prevents context overflow in long threads. Conservative token estimation is the safe failure mode. |
| FIFO lot accounting only | No specific identification, no LIFO. | Industry standard for retail investors. Matches what brokerages report. |

### Environment Variables

All configuration via `apps/web/.env.local`:

```env
# Market Data Providers
FMP_API_KEY=                     # Financial Modeling Prep (search + quotes)
ALPHA_VANTAGE_API_KEY=           # Alpha Vantage (backup quotes)
TIINGO_API_KEY=                  # Tiingo (historical daily bars)

# Provider Rate Limits (configurable — update here, no code changes)
FMP_RPM=5                        # Requests per minute
FMP_RPD=250                      # Requests per day
AV_RPM=5
AV_RPD=25
TIINGO_RPH=50                    # Requests per hour
TIINGO_RPD=1000                  # Requests per day

# LLM Provider
LLM_PROVIDER=anthropic           # or "openai"
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
LLM_MODEL=claude-sonnet-4-6

# Scheduler
POLL_INTERVAL_MARKET_HOURS=1800  # seconds (30 min)
POST_CLOSE_DELAY=900             # seconds after close for final prices

# Database
DATABASE_URL=file:./data/portfolio.db
```

---

## 12) Change Log

| Date | Version | Change |
|------|---------|--------|
| 2026-02-28 | 2.0 | Migrated content from session-specific AGENTS.md into new AGENTS.md template schema. Sections restructured: Defaults, Project Snapshot, Guardrails, Delegation Modes, Role Registry, Filesystem Scoping, Session Contract, Deliverables, Quality Gates, Related Documents. Tech stack and design decisions moved to §11. |
| 2026-02-28 | 1.x | Original AGENTS.md — tech stack, design decisions, and agent coordination patterns (pre-migration). |
