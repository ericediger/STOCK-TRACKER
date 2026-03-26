# ROLE_REGISTRY.md

> **Purpose:** A reusable, lightweight role registry for agentic teams.  
> **Version:** 1  
> **Notes:** This is an interface-level registry (what roles do + what they typically output).  
> Detailed, prescriptive checklists remain in `TEAM-CHECKLIST.md`. Persona prompts live in `personas/*.md`.

---

## Roles

| Role | Primary responsibility | Typical outputs | Persona file | Checklist reference |
|---|---|---|---|---|
| **Lead** | Orchestrate work, assign tasks, integrate results, own final output | Session plan/kickoff, synthesis report, integration notes, verification status, handoff notes | (optional) `personas/LEAD.md` | n/a |
| **Product Manager / Product Owner (PM/PO)** | Priorities, success metrics, acceptance criteria | Epic/story framing, DoR/DoD, release notes, go/no-go rationale | `personas/PM.md` | `TEAM-CHECKLIST.md` → Product Owner |
| **Business Analyst (BA)** | Requirements fidelity, process + data clarity | BRD/spec, as-is/to-be flows, data dictionary, UAT scenarios | `personas/BA.md` | `TEAM-CHECKLIST.md` → Business Analyst |
| **Engineering (ENG: FE/BE/FS)** | Implementation | Code, tests, docs, migrations | `personas/ENG.md` | `TEAM-CHECKLIST.md` → Frontend/Backend |
| **UX/UI (UX)** | Flows, interaction, states, accessibility | IA/flows, state table, copy guidance, edge-case handling notes | `personas/UX.md` | `TEAM-CHECKLIST.md` → UX/UI |
| **Quality Assurance (QA)** | Verification, release readiness | Test plan, test cases, regression targets, findings summary, signoff | `personas/QA.md` | `TEAM-CHECKLIST.md` → QA |

---

## How to use (recommended)
1) Lead selects roles for the session (roles may be merged/omitted).
2) For each delegated task, include:
   - role + persona file
   - file scope
   - deliverables (standard format)
3) Use `TEAM-CHECKLIST.md` for completeness checks and sign-off.
