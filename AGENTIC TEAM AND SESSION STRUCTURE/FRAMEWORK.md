# Agent Ops Framework — Architecture and Automation Model
**Status:** Canonical reference  
**Companion documents:** PROJECT-SPEC.md (anchor), AGENTS.md (schema), LEAD_PLAYBOOK.md (operations), personas/*.md (roles)

---

## 1. Purpose and Scope

This document defines the architecture, automation model, and session lifecycle for running consistent, repeatable agentic teams across repos and projects. It is the "why and how" that sits above AGENTS.md's "what." A newly invoked lead agent reads this document first and follows the Bootstrap Sequence in §3 to begin executing autonomously.

The framework is designed for three operating conditions, and works identically across all three because the documents it produces are machine-readable and structured.

**Human-led sessions:** A practitioner reads AGENTS.md and operates the system directly.

**Lead-automated sessions:** A Claude Code lead agent reads this framework and runs the session autonomously, surfacing to the Executive Sponsor only when an ES-level escalation trigger fires.

**Fully automated sessions:** The entire session lifecycle — planning, delegation, execution, quality gating, and handoff — runs without human intervention until an escalation trigger fires.

---

## 2. System Architecture

### 2.1 The Document Hierarchy

The system is organized in four layers. A document in a higher layer takes precedence over a document in a lower layer when they conflict. Agents read downward from Layer 0; they write upward only through the defined amendment process.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0: PROJECT ANCHOR (changes only with ES authorization)   │
│  PROJECT-SPEC.md                                                │
│  The north star. Defines what is being built, why, for whom,   │
│  and what "done" means. All epics and sessions are derived      │
│  from it. Nothing produced by the team can contradict it        │
│  without a formal amendment authorized by the ES.               │
└─────────────────────────────────────────────────────────────────┘
                            ↓ governs
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: STABLE INFRASTRUCTURE (changes rarely)                │
│  AGENTS.md · ROLE_REGISTRY · personas/*.md · TEAM-CHECKLIST    │
│  Defines how the team works: roles, guardrails, coordination,   │
│  quality gates. Read at session start; does not change during   │
│  a session.                                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓ informs
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: SESSION EXECUTION (changes per session)               │
│  SESSION-KICKOFF · Session Contracts · Teammate outputs         │
│  SESSION-REPORT                                                  │
│  Generated fresh each session from Layers 0 and 1.             │
│  Ephemeral — prior session artifacts are not current state.     │
└─────────────────────────────────────────────────────────────────┘
                            ↓ produces
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: SESSION STATE (updated every session)                 │
│  HANDOFF.md                                                      │
│  Single source of current truth. Written at session close;      │
│  read first at session start. Replaces re-reading all prior     │
│  session artifacts.                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 File Relationships

```
PROJECT-SPEC.md ─────────────────────────────────────────────────┐
  │ governs                                                        │
  ├── All epic definitions and session scope                       │ Layer 0
  ├── Product-level ACs (session ACs must trace to these)         │
  └── Release milestones (defines ES intervention points)         │
                                                                   │
AGENTS.md ───────────────────────────────────────────────────────┤
  │ references                                                     │
  ├── ROLE_REGISTRY.md (role interfaces)                          │
  ├── personas/*.md (spawn-time injections)                       │ Layer 1
  ├── TEAM-CHECKLIST.md (review/signoff gates)                    │
  ├── TECH_STACK.md (optional, linked)                            │
  ├── DECISIONS.md (optional, linked)                             │
  └── HANDOFF_TEMPLATE.md (session close artifact)                │
                                                                   │
SESSION-KICKOFF ────────────────────────────────────────────────┤
  │ references                                                     │
  ├── PROJECT-SPEC.md §3 (epic scope validation)                  │ Layer 2
  ├── AGENTS.md (mode, comms, guardrails)                         │
  └── personas/*.md (teammate spawn prompts)                      │
                                                                   │
HANDOFF.md ──────────────────────────────────────────────────────┘
  Written at: session close (final act)                            Layer 3
  Read at: next session start (first act)
  Replaces: re-reading prior session plans, reports, or kickoffs
```

### 2.3 The Automation Loop

For a fully automated lead agent, the execution cycle — after the initial bootstrap — is:

```
Read HANDOFF.md (current state)
        ↓
Validate session scope against PROJECT-SPEC.md
        ↓
Read AGENTS.md (rules + roles + guardrails)
        ↓
Generate SESSION-KICKOFF (objective, mode, roles, scopes)
        ↓
Spawn teammates with Session Contracts + persona injections
        ↓
Teammates execute → produce standard outputs
        ↓
Lead integrates outputs → validates against PROJECT-SPEC.md §4
        ↓
Lead runs quality gates
        ↓
Gate result: PASS → write SESSION-REPORT + HANDOFF.md → session closes
             FAIL → attempt remediation → PASS or escalate to ES
        ↓
Next session reads HANDOFF.md
```

No human is required in this loop unless an ES-level escalation trigger fires (see §5) or a release milestone is reached (see PROJECT-SPEC.md §6).

---

## 3. Bootstrap Sequence

> **This section is an executable protocol.** When a lead agent is invoked with an instruction to read this framework and begin working, it follows this sequence in order without skipping steps. This is what makes the system self-starting from a single human instruction.

### The Initiation Instruction

The Executive Sponsor initiates a session with a single instruction to a Claude Code lead agent:

> *"Read FRAMEWORK.md and begin."*

Everything that follows is autonomous until an ES-level escalation fires or a release milestone is reached.

---

### Step 1 — Confirm Entry Point

You have been told to read FRAMEWORK.md and begin. You are now executing the Bootstrap Sequence. Do not skip steps. Do not begin session work until all steps are complete.

### Step 2 — Read the Project Anchor

Read `PROJECT-SPEC.md`.

This is the north star. Every decision you make, every session you plan, every deliverable you accept must be traceable to this document. If it cannot be traced, the work is out of scope.

**If PROJECT-SPEC.md does not exist:** Stop immediately. Escalate to the Executive Sponsor. Provide the PROJECT-SPEC_template.md and request that the ES complete it. No session work can begin without an approved specification. This is a hard stop, not a judgment call.

**If PROJECT-SPEC.md exists but its status is Draft:** Escalate to the ES. Confirm whether the spec is approved (M0) before proceeding.

### Step 3 — Establish Current State

Check for `HANDOFF.md`.

**If HANDOFF.md exists:** Read it in full. This is your current state. It supersedes any prior session artifacts (kickoffs, plans, reports). Note any pending ES escalations in HANDOFF.md §6 — resolve them before proceeding to Step 4.

**If HANDOFF.md does not exist:** This is Session 1. Current state is: project has not started. Proceed from PROJECT-SPEC.md §3 (Epic Breakdown), beginning with Epic 1.

### Step 4 — Read the Operating Schema

Read `AGENTS.md`. This defines your operating rules, available roles, guardrails, filesystem constraints, and quality gates. Do not proceed without reading it — it governs how you execute.

### Step 5 — Resolve Pending Escalations

If HANDOFF.md exists and §6 (Escalations Pending Human Decision) contains unresolved items, surface them to the ES before planning the next session. Provide the decision needed, the context, and your recommendation. Do not begin session planning until the ES has responded to blocking escalations.

Non-blocking escalations (noted as informational in HANDOFF.md) do not require ES response before proceeding.

### Step 6 — Determine Session Scope

**If HANDOFF.md exists:** Use HANDOFF.md §5 (Next Session Scope) as the starting point. Before committing to it, validate that the proposed scope traces to PROJECT-SPEC.md §3. If the proposed scope cannot be traced or if it contradicts the spec, flag the discrepancy and determine the correct scope from the spec directly.

**If Session 1:** Derive scope from PROJECT-SPEC.md §3 (Epic Breakdown). Begin with Epic 1. Verify entry criteria are satisfied before committing to the scope.

### Step 7 — Design the Session

Using the scope determined in Step 6, execute the session design protocol from LEAD_PLAYBOOK.md §2:

- Select mode (solo / subagents / agent_teams) and justify the choice
- Select comms policy
- Staff only the roles the session actually needs
- Generate SESSION-KICKOFF using the template
- Generate Session Contracts for each teammate, including persona snippets from `personas/{ROLE}.md`

### Step 8 — Execute

Spawn teammates per their Session Contracts. Monitor for escalation triggers and discovery patterns. Integrate outputs. Run quality gates. Write SESSION-REPORT and HANDOFF.md at session close.

---

## 4. Component Specifications

### 4.0 PROJECT-SPEC.md (Layer 0 Anchor)

**Role:** The product definition that governs the entire project. It answers what is being built, for whom, to what quality standard, and across which epics and milestones.

**Author:** Executive Sponsor. The ES writes or approves this document before any session work begins (Milestone M0).

**Custodians:** PM and BA lead agents maintain traceability and flag drift. They may propose amendments but cannot apply them.

**What it must contain:** Vision and problem statement, target user and job to be done, full epic breakdown with scope boundaries and entry/exit criteria, product-level acceptance criteria, non-functional requirements, release milestones with ES intervention points, product-level definition of done, explicit out-of-scope list, known constraints and external dependencies, amendment log.

**Amendment protocol:** Any change to PROJECT-SPEC.md after M0 requires ES authorization and must be recorded in the amendment log. Agents surface proposed amendments as escalations — they do not edit the document directly.

**Drift detection:** If a session's proposed scope, deliverable, or acceptance criterion cannot be traced to PROJECT-SPEC.md §3 or §4, it is a drift signal. The lead agent flags it, does not proceed with the drifted work, and surfaces the discrepancy to the ES.

### 4.1 AGENTS.md (Layer 1 Schema)

**Role:** The operating system of the agent team. Defines hard guardrails, available modes, role interfaces, filesystem scoping rules, the session contract schema, and quality gates. The "what."

**Must contain:** Project snapshot (goal, stakeholders, constraints), hard guardrails, delegation mode and comms policy definitions, role registry (interfaces only), filesystem scoping rules with default enforcement, session contract template, standard output format (single definition), quality gate commands, links to all companion documents.

**Must not contain:** Tech stack tables (→ TECH_STACK.md), architecture decision logs (→ DECISIONS.md), persona prompt text (→ personas/*.md), detailed checklists (→ TEAM-CHECKLIST.md), session plans or reports (→ session artifacts).

**Stability:** AGENTS.md changes are rare and versioned. Session-to-session variation is handled through the Session Contract.

### 4.2 HANDOFF.md (Layer 3 State)

**Role:** The only source of current session state. Every session ends by writing it; every session starts by reading it.

**Critical properties:** Written in past tense for what was done; present tense for what is true now. Failing quality gates at handoff are explicitly marked as blockers. Pending ES escalations are listed in §6. If HANDOFF.md does not exist, this is Session 1 and the lead reads PROJECT-SPEC.md to establish starting state.

### 4.3 Personas

**Role:** Spawn-time identity injections. Each persona defines a role's mission, focus, deliverables, escalation triggers, and what to avoid.

**Usage:** The pasteable prompt snippet from each persona file is included in every teammate Session Contract. For automated leads, this is a template substitution: `personas/{ROLE}.md → snippet → Session Contract → spawn prompt`.

**Must not contain:** The standard output format (defined once in AGENTS.md §8.1 and referenced by name in each persona).

### 4.4 TEAM-CHECKLIST.md

**Role:** Completeness and quality gates at review and signoff time. Consulted when the lead validates teammate outputs, not at spawn time. The lead uses it as a structured rubric; checklist items requiring human judgment are escalation triggers.

---

## 5. Executive Sponsor Protocol

> The Executive Sponsor (ES) is the only human in the autonomous operating loop. This section defines the ES role precisely — both what it includes and, critically, what it does not include — so that the system operates autonomously by default and escalates to the ES only when genuinely necessary.

### 5.1 ES Role Definition

The Executive Sponsor holds product authority and final release authority. The ES defines what is being built (PROJECT-SPEC.md), provides access to external dependencies (credentials, API keys), and makes decisions that carry business or legal weight that no agent holds authority over. The ES does not manage sessions, assign tasks, select roles, write code, or operate the agent team — the lead agent does all of this.

### 5.2 ES-Only Intervention Points

These are the only situations that require ES involvement. All other decisions are made autonomously by the lead agent.

| Intervention | What the ES does | Trigger |
|-------------|-----------------|---------|
| **Project initiation** | Authors or approves PROJECT-SPEC.md; issues the initiation instruction to the lead agent | Before Session 1 |
| **Specification amendment** | Authorizes changes to PROJECT-SPEC.md proposed by PM or BA agents | Proposed amendment escalation from lead |
| **Credential and API key provision** | Provides credentials listed in PROJECT-SPEC.md §9.3 when needed | Escalation when a session reaches a dependency that requires a credential not yet provided |
| **Release milestone review** | Reviews milestone reports; issues approval or raises issues before the next phase begins | At each milestone defined in PROJECT-SPEC.md §6 |
| **UAT** | Conducts or approves user acceptance testing; raises defects or accepts the release | At M_UAT milestone |
| **Go / no-go for production release** | Issues final release approval | At M_Release milestone |
| **External blocker resolution** | Resolves blockers involving third parties, vendors, or external systems the team cannot control | Escalation when an external dependency is blocking and cannot be worked around |
| **Scope change authorization** | Approves changes to PROJECT-SPEC.md §3 that expand, reduce, or reorder epics | Escalation when session work reveals that the spec needs amendment |

### 5.3 Partitioned Escalation Matrix

Every potential escalation falls into one of three categories. Agents apply this matrix before surfacing anything to the ES.

**Category A — Lead Resolves Autonomously (no ES contact):**

Session mode and comms policy selection, teammate count and role staffing, file scope assignment, task decomposition, plan approval for risky work, quality gate execution, one round of automated remediation after gate failure, teammate output acceptance against TEAM-CHECKLIST.md, HANDOFF.md content, discovery routing between teammates, and any decision that does not carry product authority or require external input.

**Category B — Escalate to ES (surface and await response before continuing):**

PROJECT-SPEC.md does not exist or is in Draft status (hard stop), credential or API key needed that has not been provided, session scope cannot be traced to PROJECT-SPEC.md (scope drift), a release milestone has been reached, proposed amendment to PROJECT-SPEC.md, an external system or third-party dependency is blocking work and cannot be worked around, conflicting requirements that require a business judgment call the lead cannot make from available documents, UAT or release approval required.

**Category C — Full Stop (write partial HANDOFF.md, notify ES, cease session):**

Quality gate fails after one remediation attempt with no viable path to resolution, PII or sensitive data encountered in a form that cannot be handled under existing guardrails, a security vulnerability is discovered that makes continuing unsafe, a legal or compliance constraint is identified that was not in the specification and requires legal review before work can continue.

### 5.4 Escalation Format

When the lead agent escalates to the ES, every escalation must include, in this order: the escalation category (B or C), a one-sentence description of the trigger, the specific decision or input needed from the ES, the context the ES needs to make the decision, the options the lead has identified, and the lead's recommendation. Escalations without a recommendation are not acceptable — the lead must always attempt to solve the problem before surfacing it.

**Escalation template:**
```
ESCALATION — Category {B | C}
Trigger: {one sentence}
Decision needed from ES: {specific and actionable}
Context: {what the ES needs to know}
Options: {list the realistic paths}
Lead recommendation: {what the lead would do if it held the authority}
Relevant files: {paths to documents the ES should read}
```

### 5.5 After ES Resolution

When the ES responds to an escalation, the lead agent records the decision in HANDOFF.md §6 (marking it resolved), records it in DECISIONS.md if it affects architecture or scope, and resumes from where the session was paused. If the ES decision changes the session scope, the lead updates the SESSION-KICKOFF and notifies active teammates before they continue.

---

## 6. Session Lifecycle — State Machine

A session moves through five states. Quality gates and PROJECT-SPEC.md validation govern state transitions.

```
STATE 1: ORIENT
─────────────────────────────────────────────────────────────────
Lead reads: HANDOFF.md → PROJECT-SPEC.md (scope validation)
            → AGENTS.md → session plan (if pre-written)
Lead resolves: any pending ES escalations from HANDOFF.md §6
Lead determines: session objective, mode, roles, file scopes
Lead validates: that session scope traces to PROJECT-SPEC.md §3
Output: SESSION-KICKOFF

STATE 2: DELEGATE
─────────────────────────────────────────────────────────────────
Lead generates: Session Contract per teammate
Lead injects: persona snippet + file scope + objective + stop conditions
Lead spawns: teammates (subagent Task calls or Agent Teams)
Output: Active teammates with defined scopes

STATE 3: EXECUTE
─────────────────────────────────────────────────────────────────
Teammates work within their scopes
Teammates communicate per comms policy
Teammates produce: standard output format (AGENTS.md §8.1)
Lead monitors: escalation triggers, scope drift, discovery patterns
Output: Teammate deliverables

STATE 4: INTEGRATE
─────────────────────────────────────────────────────────────────
Lead collects teammate outputs
Lead validates: outputs trace to PROJECT-SPEC.md §4 (product ACs)
Lead evaluates: outputs against TEAM-CHECKLIST.md rubric
Lead runs: quality gates (typecheck, tests, lint, build)
Gate result:
  PASS → proceed to STATE 5
  PARTIAL → lead attempts remediation → re-run → PASS or escalate
  FAIL → lead attempts remediation → if unresolved → Category C stop

STATE 5: CLOSE
─────────────────────────────────────────────────────────────────
Lead checks: has a release milestone been reached?
  YES → write milestone report → escalate to ES → await approval
  NO → proceed
Lead writes: SESSION-REPORT (decisions + changes + verification)
Lead writes: HANDOFF.md (current state + next session scope)
Lead commits: all session work
Session ends.
```

---

## 7. Coordination Model — Automation Notes

### 7.1 The Discovery Problem

In fully automated sessions, the most common cause of wasted work is one teammate proceeding with an approach that another teammate's concurrent finding has already invalidated. The hybrid comms policy's fourth case — material discovery — is the primary mechanism for preventing this.

When a discovery-pattern message is received from a teammate, the lead routes it immediately: if Teammate A's discovery eliminates Teammate B's current approach, the lead notifies B before B continues. If A's discovery changes B's scope but does not eliminate it, the lead records the update and notifies B at a natural task boundary. If A's discovery requires a new task not in the original plan, the lead adds it to the shared task list rather than spawning a new teammate without re-evaluating team size.

### 7.2 Automated File Conflict Prevention

In agent_teams mode, file conflicts are the primary source of silent data loss (last write wins, no merge). File scope is assigned in the Session Contract before spawning — not ad hoc. The default enforcement rule (out-of-scope paths require lead approval before writing) is a hard stop. For shared files requiring lead approval, the lead serializes writes; no two teammates write to a shared file concurrently.

### 7.3 Token Cost Governance

Agent Teams runs at approximately 3–4× the token cost of a solo session. In automated environments, cost control requires explicit governance: default to solo or subagents for tasks that do not require parallel exploration or mid-task discovery sharing; document the mode choice and justification in the SESSION-KICKOFF; record in HANDOFF.md §7 whether the mode choice was justified by the parallelism achieved.

---

## 8. Adoption

### 8.1 New Project Setup (< 45 minutes)

```
[ ] Copy Agent Ops Pack to repo root
[ ] ES completes PROJECT-SPEC_template.md → saves as PROJECT-SPEC.md
[ ] ES reviews and sets PROJECT-SPEC.md status = Active (M0)
[ ] Fill AGENTS.md §2 (Project Snapshot: goal, stakeholders, constraints)
[ ] Fill AGENTS.md §9 (Quality Gates: actual commands for this repo)
[ ] Confirm TEAM-CHECKLIST.md applies (recommended: yes)
[ ] Leave HANDOFF.md absent (Session 1 bootstrap handles this)
[ ] ES issues initiation instruction: "Read FRAMEWORK.md and begin."
```

### 8.2 Document Stability Tiers

| Document | Change frequency | Change trigger |
|----------|-----------------|----------------|
| PROJECT-SPEC.md | Rare (ES-authorized only) | Product vision change, epic scope change, milestone change |
| AGENTS.md | Rare (versioned) | Coordination model change, new guardrail, schema update |
| ROLE_REGISTRY.md | Slow | New roles, changed role responsibilities |
| personas/*.md | Slow | Role behavior change, new escalation triggers |
| TEAM-CHECKLIST.md | Moderate | Quality standard evolution |
| HANDOFF.md | Every session | Session state |
| Session artifacts | Per session | Ephemeral |

### 8.3 Portability Rules

No absolute paths anywhere in the pack. Repo-specific content lives in AGENTS.md §2 and §9, and PROJECT-SPEC.md. All other pack content is repo-agnostic and copied without modification. Quality gate commands use repo-local invocations, not global tool assumptions.

---

## 9. Quality Model

### 9.1 Gate Types

| Gate | When | Automated? | Failure action |
|------|------|-----------|----------------|
| Typecheck | After every major change | Yes | Lead remediation → Category C stop if unresolved |
| Tests | After every major change | Yes | Lead remediation → Category C stop if unresolved |
| Lint / format | After every major change | Yes | Lead auto-fixes → re-run |
| Build | Before session close | Yes | Lead remediation → Category C stop if unresolved |
| Spec traceability | Before STATE 5 (close) | Yes (lead validates) | Drift flagged → scope correction or ES escalation |
| Checklist | During STATE 4 (integrate) | Semi-automated | Missing items → remediation or blocker in HANDOFF.md |

### 9.2 Gate Rule

No session closes with a failing automated gate. Gate failures that cannot be resolved become Category C stops: the lead writes a partial HANDOFF.md recording the failure as a blocker, notifies the ES, and ceases session work. The next session resolves the failure before adding new work.

---

## 10. Anti-Patterns and Failure Modes

| Anti-pattern | Symptom | Correct behavior |
|-------------|---------|-----------------|
| No PROJECT-SPEC.md | Sessions produce inconsistent or drifting output; each session reinterprets the goal | Hard stop at bootstrap; no sessions without an approved spec |
| Spec exists but is never read | Teammate work gradually drifts from product intent | Lead validates scope against PROJECT-SPEC.md at STATE 1 and STATE 4 |
| ES over-invoked | Lead surfaces routine decisions to ES; ES becomes a bottleneck | Apply the partitioned escalation matrix (§5.3); only Category B and C items reach the ES |
| ES under-invoked | Agents make product authority decisions autonomously; releases happen without approval | Milestone protocol in PROJECT-SPEC.md §6 forces ES touchpoints; lead must pause at milestones |
| AGENTS.md becomes a dumping ground | File grows beyond 4–5 pages | Enforce links-out rule |
| Broken handoff chain | Next session re-reads prior kickoffs | HANDOFF.md is always the first document read and the last document written |
| Spec amendment without authorization | Agents edit PROJECT-SPEC.md directly during a session | Amendments are escalations; agents propose, ES authorizes, amendment log is updated |
| Discovery not shared | Teammate A's finding invalidates B's work; both complete; conflict discovered at integration | Hybrid mode case 4 (material discovery) is mandatory for automated sessions |

---

*This framework is the architecture. PROJECT-SPEC.md is the north star. AGENTS.md is the schema. LEAD_PLAYBOOK.md is the operations guide. Together they form the Agent Ops Pack.*
