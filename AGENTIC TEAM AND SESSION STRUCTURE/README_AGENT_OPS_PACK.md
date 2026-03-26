# Agent Ops Pack (v1)

**Last Updated:** 2026-02-28

This pack is designed to be **portable across repos and machines**.

## What you get
- `AGENTS.md` — stable operating rules + session contract schema
- `ROLE_REGISTRY.md` (+ `ROLE_REGISTRY.yaml`) — reusable role registry
- `TEAM-CHECKLIST.md` — detailed role checklists (optional but recommended)
- `personas/` — lightweight role personas (PM/BA/ENG/UX/QA)
- `templates/` — session kickoff/plan/report templates + session contract snippet + lead playbook

## How to adopt in a new repo
1) Copy these files/directories into the repo root.
2) Fill in:
   - `AGENTS.md` §3 Project snapshot
   - `AGENTS.md` §9 Quality gates commands (repo-specific)
3) Keep `TEAM-CHECKLIST.md` in the repo if you want prescriptive “completeness” checks.
4) Start a session by copying a template under `templates/` and renaming to your artifact convention.

## Design intent
- AGENTS.md stays stable and short.
- ROLE_REGISTRY is reusable across repos.
- TEAM-CHECKLIST remains the deep “do we cover all the bases?” resource.
- Personas are short “lenses” to steer output without over-prescribing.
