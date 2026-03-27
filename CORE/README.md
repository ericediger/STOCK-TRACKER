# STOCKER — Stock & Portfolio Tracker + LLM Advisor

A local-first, event-sourced portfolio tracker built for a single user on macOS. No auth, no cloud, no multi-tenancy.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript 5.9** (strict)
- **SQLite** via **Prisma 6** — zero-config local database
- **Decimal.js** — exact financial arithmetic (no floats)
- **TradingView Lightweight Charts v5** — portfolio area charts + candlestick charts
- **Tailwind CSS 4** — dark financial theme with Crimson Pro / DM Sans / JetBrains Mono
- **Vitest** — 770 tests across 64 test files
- **pnpm workspaces** — monorepo with 5 packages + 1 app
- **Anthropic Claude** — LLM-powered financial advisor with 5 tools

## Quick Start

```bash
cd CORE
pnpm install
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Create/sync database schema
cd apps/web && npx prisma db seed  # Seed demo data (28 instruments, 30 transactions)
cd ../..
pnpm dev                  # Starts Next.js + scheduler
```

The app runs at `http://localhost:3000`.

## Project Structure

All source code lives under `CORE/`. Planning docs, session reports, and design docs live at the repo root.

```
CORE/
  apps/web/                  # Next.js App Router (UI + API routes)
  packages/
    shared/                  # Types, Decimal utils, ULID, constants
    analytics/               # FIFO lot engine, PnL, portfolio value series
    market-data/             # 5 providers (Tiingo, FMP, AV, CoinGecko, Stooq), rate limiter, calendar
    advisor/                 # LLM adapter, tool definitions, context window management
    scheduler/               # Standalone polling process (equity + crypto)
  data/test/                 # Reference portfolio fixtures, cross-validation
  scripts/                   # Backfill, benchmark, name resolution utilities
  session read-ins/          # Shipped project documents (CLAUDE.md, AGENTS.md, etc.)
```

## Running Tests

```bash
cd CORE
pnpm test                 # All 770 tests
pnpm tsc --noEmit         # TypeScript type check
pnpm build                # Full Next.js production build
```

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](session%20read-ins/CLAUDE.md) | Architecture, coding rules, API catalog, component inventory |
| [AGENTS.md](session%20read-ins/AGENTS.md) | Tech stack, design decisions, coordination model |
| [DECISIONS.md](session%20read-ins/DECISIONS.md) | Architectural decision log |
| [KNOWN-LIMITATIONS.md](session%20read-ins/KNOWN-LIMITATIONS.md) | Documented MVP gaps with impact and mitigation |

## Environment

Copy `.env.example` to `CORE/apps/web/.env.local` and fill in API keys:

```bash
cp .env.example CORE/apps/web/.env.local
```

Required keys: `FMP_API_KEY`, `TIINGO_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `ANTHROPIC_API_KEY`. See [AGENTS.md](session%20read-ins/AGENTS.md) for the full variable reference.

## Status

27 sessions completed. All Phase I and Phase II epics complete. 770 tests passing. Project is feature-complete.
