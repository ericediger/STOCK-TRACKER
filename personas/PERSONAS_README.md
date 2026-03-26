# Personas Pack (v1)

**Last Updated:** 2026-02-28

These persona files are **modular role “lenses”** for agentic work. They are intentionally **not overly prescriptive**.

## How to use
1) In your **Session Contract** (AGENTS.md §7), assign a role (PM/BA/ENG/UX/QA).
2) In the spawn prompt, include:
   - A link (or copy) of the persona file for that role
   - File scope + constraints
   - Deliverables (what “done” looks like)
3) Teammates should follow the repo’s **comms policy** and **standard deliverable format** (AGENTS.md §8).

## Editing guidance
- Keep personas short and stable.
- Put evolving or project-specific guidance in session prompts, not personas.
- If a persona becomes too “process heavy,” move that content into checklists or session playbooks.

## Suggested layout
- `PM.md` — product framing, acceptance criteria, success metrics
- `BA.md` — requirements, process, data definitions, UAT scenarios
- `ENG.md` — implementation quality, interfaces, tests, performance/security
- `UX.md` — flows, interaction states, accessibility, content
- `QA.md` — test strategy, coverage, signoff readiness
