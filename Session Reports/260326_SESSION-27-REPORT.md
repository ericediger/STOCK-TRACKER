# Session 27 Report — Project Rename (STALKER → STOCKER)

**Date:** 2026-03-26
**Session Number:** 27
**Focus:** Full project rename from STALKER to STOCKER

---

## Session Overview

Session 27 was a housekeeping session triggered by the Executive Sponsor renaming the GitHub repository from STALKER to STOCKER. The session updated all internal references to match: workspace package namespace (`@stalker/*` → `@stocker/*`), TypeScript imports, configuration files, documentation, UI metadata, file names, and the git remote URL. No functional changes were made.

---

## Work Completed

### Package Namespace Rename
- Renamed all 7 workspace packages: `@stocker/shared`, `@stocker/analytics`, `@stocker/market-data`, `@stocker/advisor`, `@stocker/scheduler`, plus root and `apps/web`
- Updated all `package.json` files (name fields and dependency references)
- Updated 69+ TypeScript/TSX source files with new import paths
- Updated `vitest.config.ts`, `apps/web/tsconfig.json`, `apps/web/next.config.mjs` path aliases
- Regenerated `pnpm-lock.yaml`

### Documentation Rename
- Updated 58+ markdown files replacing STALKER with STOCKER
- Updated GitHub URL to `https://github.com/ericediger/STOCKER`
- Renamed 4 files: STALKER_MASTER-PLAN.md, STALKER_PHASE-II_ADDENDUM.md, stalker-mockups.jsx, STALKER-ux-ui-plan.md

### Code and Config Updates
- `apps/web/src/app/layout.tsx` — page title
- `apps/web/.env.example` — comment header
- `packages/advisor/src/anthropic-adapter.ts` — code comments
- `data/test/cross-validate.ts`, `data/test/benchmark-rebuild.ts` — comments/logs
- `.claude/settings.local.json` — GitHub URLs and package references
- Git remote URL updated to `git@github.com:ericediger/STOCKER.git`

---

## Technical Details

The rename was executed by two parallel agents for efficiency:
1. **Package rename agent** — Handled all `@stalker/` → `@stocker/` changes in code, configs, and lockfile. Verified with `pnpm install` and `pnpm tsc --noEmit`.
2. **Documentation rename agent** — Handled all STALKER → STOCKER text changes in docs, UI, config, and file renames.

Key technical decisions:
- **AD-S27-1**: Historical git commit messages are immutable and retain old STALKER references
- The database file `stalker.db` is not referenced by any config (the app uses `portfolio.db`) — left as-is
- Old permission entries in `.claude/settings.local.json` with `@stalker/` are harmless stale entries

---

## Files Changed

| Category | Count | Description |
|----------|-------|-------------|
| package.json files | 7 | Name + dependency references |
| TypeScript/TSX source | 69+ | Import statements |
| Config files | 4 | vitest, tsconfig, next.config, settings.local |
| Documentation | 58+ | All markdown docs |
| File renames | 4 | STALKER_* → STOCKER_* |
| Lockfile | 1 | Regenerated |
| UI | 1 | Page title in layout.tsx |
| **Total** | **~145** | |

---

## Testing & Validation

| Gate | Result |
|------|--------|
| `pnpm tsc --noEmit` | Pass — 0 errors |
| `pnpm test` | Pass — 770 tests, 64 files |
| `grep -r "@stalker/"` on code files | Clean (only stale settings.local.json permissions remain) |
| `git push` | Successful to new STOCKER remote |

---

## Issues Encountered

- **GitHub redirect** — First push after rename showed `remote: This repository moved. Please use the new location`. Fixed by updating the git remote URL with `git remote set-url origin`.
- **No other issues.** The rename was mechanical and clean.

---

## Outstanding Items

- **Stale settings.local.json permissions** — Old bash command strings reference `@stalker/` package names. Harmless but could be cleaned up.
- **Carried forward from S26:** PriceBar staleness, scheduler daily bar fetch, PriceBar fallback unit tests.

---

## Next Steps

1. ES browser verification post-rename
2. Scheduler daily bar fetch (carried forward)
3. Optional: settings.local.json cleanup

---

*Report written by: Lead Engineering*
*Quality gates: All green*
