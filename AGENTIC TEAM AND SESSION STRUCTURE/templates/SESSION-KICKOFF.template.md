# SESSION-{ID}-KICKOFF — {SESSION_TITLE}

**Date:** 2026-02-28  
**Lead:** {NAME}  
**Repo / Project:** {PROJECT_NAME}  
**Schema:** SESSION_TEMPLATES_VERSION=2

---

## 1) Session objective
- **Objective (1–2 sentences):** {...}
- **Success looks like:** {...}
- **Non-goals (explicit):**
  - {...}
  - {...}

---

## 2) Working mode and coordination
- **Mode:** {solo | subagents | agent_teams}
- **Comms policy (session choice):** {direct | lead_mediated | hybrid}
- **Plan approval required for risky work:** {yes/no}
  - **Plan-approval criteria:** {e.g., DB/schema changes; auth/security; multi-module interface changes}

---

## 3) Roles staffed (choose what you need)
> Roles may be merged or omitted. Use the role registry in AGENTS.md.

| Role | Assigned agent | Persona | Notes |
|---|---|---|---|
| PM/PO | {...} | `personas/PM.md` | {...} |
| BA | {...} | `personas/BA.md` | {...} |
| ENG | {...} | `personas/ENG.md` | {...} |
| UX | {...} | `personas/UX.md` | {...} |
| QA | {...} | `personas/QA.md` | {...} |

---

## 4) Constraints and guardrails
- **Data / privacy constraints:** {PII rules, synthetic data only, etc.}
- **Architecture constraints:** {stack, services, boundaries}
- **Performance / security constraints:** {...}
- **Repo guardrails:** {no broad refactors, follow patterns, etc.}

---

## 5) File scope / ownership map (conflict avoidance)
> Teammates should not edit the same files unless explicitly coordinated.

| Agent | Allowed paths | Forbidden paths | Shared files (lead approval) |
|---|---|---|---|
| {Agent A} | {...} | {...} | {...} |
| {Agent B} | {...} | {...} | {...} |
| {Agent C} | {...} | {...} | {...} |

---

## 6) Task list (what gets done this session)
### Tasks
1. **T1 — {name}**  
   - Owner: {role/agent}  
   - Dependencies: {none / T#}  
   - Deliverable: {...}  
   - Scope: {paths}  

2. **T2 — {name}**  
   - Owner: {...}  
   - Dependencies: {...}  
   - Deliverable: {...}  
   - Scope: {...}  

### Stop conditions (when to pause/ask)
- {e.g., acceptance criteria unclear; policy ambiguity; schema change required}

---

## 7) Standard deliverables for each teammate
Use the standard teammate output format (AGENTS.md §8):
1) Summary (≤5 bullets)  
2) Changes / proposals  
3) Risks & edge cases  
4) Open questions  
5) Next actions

---

## 8) Quality gates (run before sign-off)
- **Typecheck:** {command}
- **Tests:** {command}
- **Lint/format:** {command}
- **Build:** {command}
- **Manual verification checklist:** {...}

---

## 9) Session closeout checklist
- [ ] Decisions captured (DECISIONS.md / ADR)
- [ ] Tasks marked complete / follow-ups created
- [ ] Verification recorded
- [ ] Handoff notes written (report template)
