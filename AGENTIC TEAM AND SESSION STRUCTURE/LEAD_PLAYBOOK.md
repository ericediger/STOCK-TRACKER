# Lead Playbook — Agent Ops Pack
**Audience:** Human leads and automated lead agents  
**Companion:** FRAMEWORK.md (architecture) · AGENTS.md (schema)  
**Last Updated:** {YYYY-MM-DD}

---

## Quick Start (< 5 minutes)

```
1. Read HANDOFF.md first — this is your current state.
2. Read AGENTS.md — this is your operating schema.
3. Determine session objective from HANDOFF.md §5 or from external input.
4. Select mode, comms policy, and roles (§2 below).
5. Generate SESSION-KICKOFF and Session Contracts.
6. Spawn teammates. Monitor for escalation triggers.
7. Integrate outputs. Run quality gates.
8. Write SESSION-REPORT + HANDOFF.md. Session closes.
```

If HANDOFF.md does not exist: this is session 1. Generate SESSION-KICKOFF from AGENTS.md §2 (Project Snapshot). Leave HANDOFF.md absent until session close.

---

## 1. Pre-Session: Orient

### 1.1 Context Loading Order (mandatory sequence)

Read in this order, without skipping:

1. **HANDOFF.md** — current state of the project. If this contradicts something in a prior session plan, HANDOFF.md wins.
2. **AGENTS.md** — operating rules, role interfaces, guardrails, quality gates.
3. **Session plan or objective** — if a session plan was pre-written, read it. If not, derive the objective from HANDOFF.md §5 (Next Session Scope).

Do not read prior SESSION-KICKOFF or SESSION-REPORT files as a substitute for HANDOFF.md. They are historical records, not current state.

### 1.2 Orient Checklist

Before generating the SESSION-KICKOFF, confirm:

```
[ ] I know the current state (from HANDOFF.md §1)
[ ] I know what blockers must be resolved first (HANDOFF.md §3)
[ ] I know what escalations are pending human decision (HANDOFF.md §6)
[ ] I know what the next session should accomplish (HANDOFF.md §5)
[ ] I have read the quality gates and know the commands (AGENTS.md §9)
[ ] I know which roles are relevant for this session (AGENTS.md §5)
```

If any of these are unclear after reading both documents, that is an ambiguity requiring escalation before proceeding (see FRAMEWORK.md §5.2).

---

## 2. Session Design: Choose Mode and Staff Roles

### 2.1 Mode Decision Tree

```
Is the work sequential (output of step 1 feeds step 2)?
  YES → Solo or Subagents
  
  NO — Is the work parallelizable (tasks are independent)?
    YES — Do teammates need to share mid-task discoveries?
      YES → Agent Teams (hybrid comms)
      NO  → Subagents (faster, cheaper, no peer messaging needed)
    NO  → Solo (no benefit to delegation)
```

**Agent Teams cost awareness:** Agent Teams runs at 3–4× the token cost of solo. Document the mode choice and justification in SESSION-KICKOFF. Record in HANDOFF.md §7 whether the choice was justified by the parallelism achieved.

### 2.2 Role Selection

Staff only the roles the session actually needs. Over-staffing increases coordination overhead and token cost.

| Session type | Typical roles |
|-------------|--------------|
| Discovery / requirements | PM/PO, BA |
| Design only | UX, (BA for requirements) |
| Build session (new feature) | ENG, (BA for requirements clarity), QA |
| Build session (refactor) | ENG, QA |
| Cross-layer build | ENG (FE + BE), QA |
| Release / sign-off | QA, (PM for go/no-go) |
| Planning | PM/PO, (BA for scope analysis) |

The lead may merge roles or operate solo when session scope is narrow.

### 2.3 Comms Policy Selection

Default to **hybrid** unless there is a specific reason to change it.

Choose **lead_mediated** when: the session involves schema, auth, or security changes where full lead visibility into all dependency information is required, OR when a prior session had coordination thrash that warrants a tighter policy for this session. Document the reason in SESSION-KICKOFF.

Choose **direct** when: the session is low-risk, exploratory, and fast velocity of teammate coordination matters more than lead visibility.

---

## 3. Session Execution: Spawn and Monitor

### 3.1 Generating Session Contracts

For each teammate, generate a Session Contract from the template in AGENTS.md §7. Required fields — none optional:

- Objective (what this teammate is building or producing)
- In scope / out of scope (explicit)
- Role and persona snippet (pasteable snippet from personas/{ROLE}.md)
- File scope (allowed, forbidden, shared paths requiring lead approval)
- Stop conditions (when to pause and surface to lead rather than proceed)
- Plan approval requirement (yes/no — automatic yes for risky-work triggers)

**Automation note:** For fully automated leads, Session Contract generation is a template substitution. Inputs: session objective (from HANDOFF.md §5), role (from AGENTS.md §5), persona (from personas/{ROLE}.md), file scope (derived from role and task).

### 3.2 Risky Work Trigger — Automatic Plan Approval

Apply plan approval automatically when any teammate's task involves:

| Trigger | Examples |
|---------|---------|
| Database or schema changes | New table, column rename, migration, index |
| Auth or security changes | Token handling, permission logic, credential storage |
| Multi-module interface changes | API contract change, shared type modification |
| Broad refactors | Cross-directory changes, framework upgrades |

For these tasks: teammate submits plan → lead approves → teammate implements. Do not allow implementation to begin without explicit plan approval.

### 3.3 Monitoring During Execution

In automated sessions, the lead monitors for:

**Escalation triggers** (see FRAMEWORK.md §5.2) — surface to human immediately
**Scope drift** — teammate proposes or begins work outside defined file scope. Stop. Apply default enforcement rule: surface to lead, get approval, then proceed.
**Discovery patterns** — teammate output that invalidates or significantly changes another teammate's current approach. Route as hybrid case 4 (material discovery). Do not wait for session close.
**Gate pre-failures** — evidence in teammate output that quality gates will fail (e.g., "I skipped tests for speed," "this changes the API contract"). Flag before integration, not after.

### 3.4 Plan Approval Protocol

When a teammate submits a plan for approval:

1. Read the plan. Verify it is within scope and does not introduce undeclared dependencies or out-of-scope changes.
2. If approved: respond with explicit approval and any amendments. Teammate proceeds.
3. If not approved: respond with specific objections. Teammate revises. Loop once. If second revision is still not approvable, escalate to human.

---

## 4. Integration: Collect and Validate Outputs

### 4.1 Output Collection

Collect all teammate outputs. Verify each is in the standard format (AGENTS.md §8.1). If a teammate output is missing a required section, request it before proceeding to gate evaluation.

### 4.2 Checklist Evaluation

For each role's output, evaluate against the corresponding section of TEAM-CHECKLIST.md. Record the evaluation in SESSION-REPORT §5. Mark each item as:

- ✅ **Satisfied** — evidence present in output
- ⚠️ **Partial** — partially addressed, acceptable for this session's scope
- ❌ **Not satisfied** — required item is missing or incorrect
- **N/A** — item does not apply to this session's scope (state why)

Any ❌ item that is in scope for the session must be resolved before gate evaluation. Either the teammate remediated it, or it is recorded as a blocker.

### 4.3 Quality Gate Execution

Run all gates defined in AGENTS.md §9 in sequence:

```
typecheck → tests → lint/format → build
```

On failure:
1. Attempt one round of automated remediation (fix the specific failure, re-run the gate)
2. If resolved: continue
3. If not resolved after one remediation attempt: escalate to human (provide gate name, failure output, files affected, remediation attempted)

Do not skip gates. Do not close the session with a failing gate.

---

## 5. Session Close: Report and Handoff

### 5.1 SESSION-REPORT

Generate using `templates/SESSION-REPORT_template.md`. Required sections:

- Executive summary (≤8 bullets — what was accomplished, what changed)
- What was completed (task ID, result, owner)
- Key decisions (decision, rationale, impacted components, follow-ups)
- Changes made (files, interfaces, APIs)
- Verification (gate commands + results, manual checks, known issues)
- Risks and mitigations
- Open questions / blocked items
- Next actions (prioritized)

### 5.2 HANDOFF.md

Write HANDOFF.md using `HANDOFF_TEMPLATE.md`. This is always the final act of a session. Required fields:

- Current state (1 paragraph — what the system is capable of right now)
- What happened this session (completed items, gate results, decisions)
- Active blockers (anything that blocks the next session from starting normal work)
- Open items (things to resolve during or after the next session)
- Risks surfaced
- Next session scope (recommended objective, roles, Session Contract starting points)
- Escalations pending human decision
- Agent team notes (if agent_teams mode was used)

**The HANDOFF.md is the contract between this session and the next.** It is not a summary — it is a state document. Write it assuming the next lead has zero context beyond what is in this file and AGENTS.md.

### 5.3 Close Checklist

```
[ ] All teammate outputs collected and in standard format
[ ] TEAM-CHECKLIST.md evaluation recorded in SESSION-REPORT
[ ] All quality gates run and results recorded
[ ] No failing gates (or failure recorded as blocker in HANDOFF.md §3)
[ ] SESSION-REPORT written and complete
[ ] HANDOFF.md written and complete
[ ] All session work committed
[ ] Any pending human escalations recorded in HANDOFF.md §6
```

---

## 6. When to Stop and Escalate

Stop and surface to a human. Do not attempt to continue the session. The full escalation trigger list is in FRAMEWORK.md §5.2. The most common:

- Quality gate fails after one remediation attempt
- Session objective is ambiguous and cannot be resolved from available documents
- Out-of-scope path access is needed and cannot be avoided
- A stakeholder-authority decision is required (go/no-go, release approval, scope change)
- PII or sensitive data encountered unexpectedly
- Schema, auth, or security change required that was not in the session plan
- Conflicting requirements between roles that require business judgment

When escalating: write a partial HANDOFF.md that records current state, the specific trigger, what context a human needs to resolve it, and the options the lead has identified. Mark the next session as a resolution session.

---

## 7. Reference: Anti-Patterns to Avoid

| Anti-pattern | Consequence | Correct behavior |
|-------------|-------------|-----------------|
| Reading prior session artifacts instead of HANDOFF.md | Operating on stale state | Always read HANDOFF.md first |
| Closing a session with a failing gate | Next session inherits broken state | Record as blocker in HANDOFF.md; do not close until resolved or explicitly escalated |
| Embedding project-specific content in personas | Personas become repo-specific and non-portable | Project context in session prompts; personas define role identity only |
| Spawning teammates without explicit file scopes | File conflicts, scope drift | File scope is mandatory in every Session Contract |
| Using agent_teams when subagents would suffice | 3–4× token cost for no parallelism benefit | Apply mode decision tree (§2.1) before spawning |
| Skipping checklist evaluation | Output quality inconsistency | Evaluate TEAM-CHECKLIST.md for every role's output |
| Writing HANDOFF.md as a summary instead of a state document | Next session lacks orientation | Write as if the next lead has zero context beyond this file and AGENTS.md |
