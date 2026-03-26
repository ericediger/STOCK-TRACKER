# AGENTS.md — {PROJECT_NAME}

> **Purpose:** Operating schema for agentic work in this repo: roles, guardrails, coordination model, session contract, and quality gates. The "what." See FRAMEWORK.md for the "why and how."  
> > **Owner:** {NAME/TEAM}  
> **Last Updated:** {YYYY-MM-DD}

---

## 1) Defaults

Sessions default to **hybrid** comms policy and **plan approval enabled** for risky work. Mode is chosen per session based on task parallelism.

The recommended default mode selection:
- Solo or subagents for most sessions (lower cost, lower overhead)
- Agent Teams when tasks genuinely benefit from parallel execution and mid-task discovery sharing (3–4× token cost — choose deliberately)

> **[TEAM DECISION — fill before first use]** Confirm the project's default mode and document the decision here. See FRAMEWORK.md §6.3 for cost tradeoff guidance.

---

## 2) Project Snapshot

- **Primary Goal:** {1 sentence}
- **Stakeholders:** {e.g., Business user, Engineering, Ops}
- **Non-Goals:**
  - {bullet}
  - {bullet}
- **Runtime Constraints:** {local-only | cloud | hybrid}
- **Data Constraints:** {PII, regulated data, internal-only, none}

---

## 3) Hard Guardrails

### 3.1 Data Handling
- Never commit secrets or sensitive data: API keys, tokens, credentials, customer data.
- Redact and avoid PII in examples, fixtures, screenshots, and exported artifacts.
- When sample data is required, generate synthetic data only.

### 3.2 Repo Boundaries
- Follow existing patterns. Avoid broad refactors unless explicitly stated in the Session Contract.
- Keep changes scoped and reversible.

### 3.3 Stakeholder Interaction
- Default assumption: stakeholders may be non-technical. Do not ask them to run commands, edit files, or perform technical steps unless they explicitly indicate they are comfortable doing so.
- Leads may override per session for technical stakeholders.

---

## 4) Delegation Modes and Comms Policy

### 4.1 Mode Selection

| Mode | When to use |
|------|-------------|
| **Solo** | Small, sequential, or tightly coupled work. |
| **Subagents** | Focused tasks where workers do not need to share mid-task discoveries. Output flows back to the caller only. |
| **Agent Teams** | Parallel workstreams requiring coordination — cross-layer changes, adversarial review, or tasks where a teammate's mid-task discovery is likely to change another teammate's approach. Enable with: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |

### 4.2 Comms Policy

**Dependency rule — read before selecting:**

If mode is **subagents**, comms policy does not apply. Subagents can only report to the caller; peer messaging is not available at the platform level regardless of policy.

If mode is **agent_teams** with policy **lead_mediated**, the lead is intentionally degrading the system to subagent-equivalent communication. This is a valid choice for high-risk sessions where full lead visibility into all information flow is required. If selected, document the reason in the Session Contract.

| Policy | Behavior |
|--------|----------|
| **direct** | Teammates message each other freely. Use for low-risk exploratory sessions. |
| **lead_mediated** | Teammates do not message each other. Lead relays all dependencies. Requires documented reason when used in agent_teams mode. |
| **hybrid** *(recommended default)* | Direct messaging permitted for the four cases below only. All other comms route through lead. |

**Hybrid — four permitted cases for direct teammate messaging:**

1. **Dependency clarification** — resolving a known interface or data dependency between tasks
2. **File or interface conflict avoidance** — coordinating before writing to a shared or adjacent path
3. **Peer review or challenge** — one teammate reviewing or questioning another's approach before finalization
4. **Material discovery** — a teammate has uncovered information mid-task that changes the scope, approach, or feasibility of another teammate's active work. Route immediately; do not wait for the lead relay cycle.

### 4.3 Plan Approval for Risky Work

Require teammates to submit a plan and wait for lead approval before implementing when the task involves:
- Database or schema changes
- Auth or security changes
- Multi-module interface changes
- Broad refactors

State this requirement explicitly in the Session Contract.

---

## 5) Role Registry

> Leads decide which roles to staff per session. Roles may be merged or omitted.  
> This registry defines **interfaces only** — what each role owns and produces.  
> Persona prompts live in `personas/{ROLE}.md` and are included in spawn prompts.  
> Detailed checklists live in `TEAM-CHECKLIST.md` and are used at review and signoff.

| Role | Primary responsibility | Typical outputs | Persona | Checklist |
|------|------------------------|-----------------|---------|-----------|
| **Lead** | Orchestrate, assign, integrate, own final output | Kickoff, Session Contracts, SESSION-REPORT, HANDOFF.md | `personas/LEAD.md` (optional) | — |
| **Product Manager / PO** | Outcome clarity, ACs, scope, success metrics | Problem statement, scope, priorities, ACs, rollout notes, go/no-go rationale | `personas/PM.md` | `TEAM-CHECKLIST.md` (Product Owner) |
| **Business Analyst** | Requirements fidelity, process and data clarity, traceability | BRD-lite, as-is/to-be flows, rules, data dictionary, UAT scenarios | `personas/BA.md` | `TEAM-CHECKLIST.md` (Business Analyst) |
| **Engineering (FE / BE / FS)** | Implementation, clean interfaces, verification | Code, tests, migration scripts, inline docs | `personas/ENG.md` | `TEAM-CHECKLIST.md` (Frontend / Backend) |
| **UX / UI** | User flow clarity, interaction states, accessibility, dev handoff | Flow outline, state table, copy recommendations, dev notes | `personas/UX.md` | `TEAM-CHECKLIST.md` (UX/UI) |
| **QA** | Verification strategy, risk-based coverage, release readiness | Test plan, test cases, regression targets, findings, go/no-go recommendation | `personas/QA.md` | `TEAM-CHECKLIST.md` (QA) |

**On PM/BA artifact scope:** These roles work on document artifacts, not code paths. Their filesystem scope is a documents directory (e.g., `docs/requirements/`, `docs/decisions/`). Their authority is over artifact content — not implementation decisions. Define paths explicitly in their Session Contracts.

**Spawn pattern:** Include the pasteable prompt snippet from the persona file in every teammate Session Contract. For automated leads, this is a template substitution: `personas/{ROLE}.md → snippet → Session Contract → spawn prompt`.

**Review pattern:** After teammate outputs are received, evaluate them against the corresponding TEAM-CHECKLIST.md section. The persona governs spawn-time behavior; the checklist governs review-time quality.

---

## 6) Filesystem Scoping

### 6.1 Scope Rule
Every Session Contract must specify:
- Allowed paths
- Forbidden paths
- Shared files requiring lead approval before write

**Default enforcement rule:** If a path is not explicitly listed as allowed in the Session Contract, it is out of scope for that teammate. Teammates who identify a necessary out-of-scope path during execution must surface it to the lead before writing — not after. This is a hard stop, not a guideline.

### 6.2 Conflict Rule
Teammates must not write to the same file unless explicitly coordinated and serialized by the lead. If overlap is detected during execution, pause and resolve before proceeding. Last-write-wins in Agent Teams mode — concurrent writes to the same file produce silent data loss.

---

## 7) Session Contract Template

When the lead spawns any delegated unit of work:

```
- Objective:          {1–2 sentences}
- In scope:           {bullets}
- Out of scope:       {bullets}
- Role:               {PM | BA | ENG | UX | QA | Other}
- Persona:            Include pasteable snippet from personas/{ROLE}.md
- Mode:               {solo | subagents | agent_teams}
- Comms policy:       {direct | lead_mediated | hybrid}
  If lead_mediated + agent_teams — reason: {required}
- File scope:         Allowed: {paths}
                      Forbidden: {paths}
                      Lead approval required: {shared paths}
- Constraints:        {architecture, performance, security, compliance}
- Deliverable(s):     {list — format per AGENTS.md §8.1}
- Stop conditions:    {when to pause and surface to lead rather than proceed}
- Plan approval:      {required | not required}
  If required: submit plan, wait for lead approval before implementing
```

---

## 8) Standard Deliverables

### 8.1 Teammate Output Format

All teammates produce output in this format. Persona files reference this section by name — they do not reproduce it.

1. **Summary** (max 5 bullets)
2. **Changes / proposals** (files, APIs, decisions, document sections)
3. **Risks and edge cases**
4. **Open questions**
5. **Next actions**

### 8.2 Lead Synthesis and Handoff

At session close, the lead produces:
- **SESSION-REPORT** using `templates/SESSION-REPORT_template.md`: decisions, changes, verification results
- **HANDOFF.md** using `HANDOFF_TEMPLATE.md`: current state, next session scope, escalations pending

HANDOFF.md is always the final act of a session and the first document read in the next session.

---

## 9) Quality Gates

Populate these commands for this repo:

| Gate | Command | Run when |
|------|---------|----------|
| Typecheck | `{command}` | After every major change |
| Tests | `{command}` | After every major change |
| Lint / format | `{command}` | After every major change |
| Build | `{command}` | Before session close |

**Gate rule:** No session closes with a failing gate. Gate failures that cannot be resolved within the session are recorded as blockers in HANDOFF.md §3 and become the first task of the next session.

---

## 10) Related Documents

| Document | Role |
|----------|------|
| `FRAMEWORK.md` | Architecture and automation model — the "why and how" |
| `LEAD_PLAYBOOK.md` | Operational guide for leads — session execution procedures |
| `HANDOFF_TEMPLATE.md` | Session close artifact — required at every session end |
| `personas/{ROLE}.md` | Role spawn prompts — included in Session Contracts |
| `TEAM-CHECKLIST.md` | Role and quality checklists — used at review and signoff |
| `templates/SESSION-KICKOFF_template.md` | Session start artifact |
| `templates/SESSION-REPORT_template.md` | Session close artifact |
| `templates/SESSION_CONTRACT_SNIPPET.md` | Per-teammate spawn template |
| `TECH_STACK.md` *(optional)* | Stack, versions, runtime |
| `DECISIONS.md` *(optional)* | Architecture decision record |
| `RUNBOOK.md` *(optional)* | Operational notes — deployments, env vars, rollback |

---

## 11) Change Log

| Date | Version | Change |
|------|---------|--------|
| {YYYY-MM-DD} | initial | Initial schema |
| {YYYY-MM-DD} | current | Removed YAML config block. Corrected mode/comms coupling. Added material discovery as hybrid case 4. Added default filesystem enforcement rule. Separated PM/BA artifact scope. Deduped output format (single definition here, referenced in personas). Aligned with FRAMEWORK.md automation model. |
