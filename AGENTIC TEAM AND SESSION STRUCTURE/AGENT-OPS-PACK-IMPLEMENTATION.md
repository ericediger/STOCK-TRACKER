# AGENT-OPS-PACK-IMPLEMENTATION.md

**Version:** 1  
**Last Updated:** 2026-03-01  
**Owner:** {NAME/TEAM}  
**Audience:** Engineering leads, product/BA leads, platform/tooling owners

---

## 1) Context and goal

Multiple AGENTS.md variants exist today and diverge in:
- document purpose (operating manual vs tech stack vs decision log)
- coordination model (lead-mediated vs direct teammate comms)
- degree of prescription (tight rules vs loose guidance)

**Goal:** Deploy a **portable, reusable “Agent Ops Pack”** that works across repos and machines, produces consistent outputs, stays flexible for lead methodology choices, and supports expanded roles (PM/PO + BA + ENG + UX + QA).

---

## 2) Key findings

### 2.1 Mixed document intent causes drift
Some AGENTS.md documents function as “team operating manuals,” while others are tech stack catalogs or decision logs. This causes inconsistent expectations and inconsistent session outcomes across repos.

### 2.2 Coordination model mismatch
Some existing docs assume “teammates do not communicate directly; lead relays.” Anthropic’s Agent Teams capability supports direct teammate communication. The important requirement is to make comms behavior an **explicit policy toggle**, not an implicit assumption.

### 2.3 Prescriptiveness belongs outside AGENTS.md
Checklists and long technical notes evolve frequently. Embedding them in AGENTS.md makes AGENTS.md long, unstable, and repo-specific. A portable operating system requires a short AGENTS.md that links out to more detailed materials.

---

## 3) Design principles

1) **Separation of concerns**
- AGENTS.md = stable operating rules + session contract schema
- ROLE_REGISTRY = reusable “org chart + outputs”
- personas = reusable “prompt lenses”
- TEAM-CHECKLIST = prescriptive completeness/quality checks
- templates = reusable session artifacts and copy/paste snippets
- (optional) TECH_STACK / DECISIONS / RUNBOOK = separate docs linked from AGENTS.md

2) **Defaults, not mandates**
AGENTS.md provides recommended defaults and available options. Leads decide per session using the Session Contract.

3) **Portability**
- No absolute paths
- Repo-relative references only
- Repo-specific commands isolated to “Quality Gates” placeholders

---

## 4) Target architecture (portable pack)

### 4.1 Canonical repo layout
Place these at the repo root (or a standard ops folder if your org uses one):

- `AGENTS.md`  
  Stable operating rules + session contract schema (references external artifacts).
- `ROLE_REGISTRY.md` (+ optional `ROLE_REGISTRY.yaml`)  
  Roles, responsibilities, typical outputs, persona/checklist pointers.
- `TEAM-CHECKLIST.md` *(optional but recommended)*  
  Prescriptive role checklists (completeness and signoff).
- `personas/`  
  Short persona files (PM, BA, ENG, UX, QA).
- `templates/`  
  Kickoff/plan/report/technical plan templates + Session Contract snippet + Lead playbook.
- *(Optional)* `TECH_STACK.md`, `DECISIONS.md`, `RUNBOOK.md`  
  Kept out of AGENTS.md to prevent bloat.

### 4.2 Why this structure works
- AGENTS.md remains stable and portable across repos.
- ROLE_REGISTRY is the reusable single truth for roles and expected outputs.
- TEAM-CHECKLIST supports deep rigor without polluting the operating manual.
- Personas guide behavior without becoming rigid process documents.
- Templates standardize outcomes without forcing one methodology.

---

## 5) Role integration (PM/PO and BA included)

### 5.1 Role Registry is the integration point
PM/PO and BA are first-class roles captured in ROLE_REGISTRY. The registry specifies:
- what each role owns
- typical outputs
- which persona to use when spawning that role
- where the detailed checklist lives for validation/signoff

### 5.2 Personas vs checklists (use both, for different purposes)
- **Personas**: steer how an agent thinks, communicates, and frames output (used at spawn time).
- **Checklists**: validate completeness and quality (used during review and signoff).

Recommended operating model:
- Spawn → persona
- Review/signoff → checklist

---

## 6) Coordination strategy (explicit session toggles)

### 6.1 Mode toggle (session-level)
- `solo` vs `subagents` vs `agent_teams`
Guidance:
- subagents for focused research/inspection where only the result matters
- agent teams for parallel work requiring coordination, peer review, and shared task tracking

### 6.2 Communication policy toggle (session-level)
- `direct`: teammates message each other directly
- `lead_mediated`: lead relays dependencies (tight control)
- `hybrid`: allow direct messaging only for dependencies, conflict avoidance, and peer review (recommended default)

### 6.3 Risk-control lever: plan approval for risky work
Enable a “plan first, approve before implement” rule for:
- DB/schema changes
- auth/security changes
- multi-module interface changes
- broad refactors

---

## 7) Implementation strategy

### Phase 0 — Adopt the pack (same day)
1) Copy the Agent Ops Pack into the repo.
2) Confirm the expected structure exists:
   - AGENTS.md, ROLE_REGISTRY.md, personas/, templates/
3) Decide if TEAM-CHECKLIST.md will be included:
   - recommended for consistency and onboarding

### Phase 1 — Repo-specific wiring (1 session)
1) Populate AGENTS.md:
   - Project snapshot (goal, constraints)
   - Quality gates commands (typecheck/tests/lint/build)
2) Link existing docs (optional):
   - TECH_STACK.md
   - DECISIONS.md / ADRs
   - RUNBOOK.md

### Phase 2 — Operationalize sessions (ongoing)
1) Start each session using:
   - `templates/SESSION-KICKOFF.template.md` (copy + rename)
2) Staff roles as needed (PM/BA optional).
3) Spawn work using:
   - `templates/SESSION_CONTRACT_SNIPPET.md`
   - include role + persona + file scopes + deliverables + stop conditions
4) Require standard deliverable format for every agent response.
5) End sessions using:
   - session report template (decisions + verification + handoff)

### Phase 3 — Governance and maintenance (lightweight)
- AGENTS.md updates are rare and versioned (schema_version)
- ROLE_REGISTRY evolves slowly (new roles/outputs)
- TEAM-CHECKLIST evolves most frequently (best practices)
- Personas are short and practical; do not turn personas into process manuals

---

## 8) Risks and mitigations

### Risk: AGENTS.md becomes a dumping ground again
**Mitigation:** enforce “links out” rule:
- no tech stack tables inside AGENTS.md
- no long decision logs inside AGENTS.md

### Risk: Over-prescription leads to non-adoption
**Mitigation:** defaults-not-mandates, session-level toggles, short personas.

### Risk: Coordination thrash with agent teams
**Mitigation:** hybrid comms policy by default, explicit file scopes per agent, plan approval for risky work.

### Risk: Inconsistent outputs between sessions
**Mitigation:** standard deliverable format, mandatory session report template, checklist-based signoff for critical work.

---

## 9) Deliverables (what to hand teams)

**Core**
- `AGENTS.md` (portable)
- `ROLE_REGISTRY.md` (+ optional `ROLE_REGISTRY.yaml`)
- `personas/` directory
- `templates/` directory

**Recommended**
- `TEAM-CHECKLIST.md` (prescriptive completeness checks)

**Optional**
- `TECH_STACK.md`, `DECISIONS.md`, `RUNBOOK.md`

---

## 10) Success criteria

- New repo can adopt in < 30 minutes:
  - copy pack
  - fill Project Snapshot + Quality Gates
- Leads can run consistent sessions:
  - kickoff + contract + report artifacts
- Cross-repo consistency improves:
  - roles and outputs stable via ROLE_REGISTRY
  - agents follow standard deliverable format
- Low maintenance burden:
  - AGENTS.md changes are rare and controlled
