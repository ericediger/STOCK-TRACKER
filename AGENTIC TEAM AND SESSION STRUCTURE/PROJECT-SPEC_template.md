# PROJECT-SPEC.md — {PROJECT_NAME}

> **Role:** Anchor document. The single source of product truth for this project. All epics, sessions, and deliverables are derived from and validated against this specification. No session output can contradict this document without a formal amendment (§10).
>
> **Author:** Executive Sponsor  
> **Custodians:** PM and BA lead agents (maintain traceability; flag drift; propose amendments)  
> **Status:** {Draft | Active | Amended | Complete}  
> **Version:** 1.0  
> **Last Updated:** {YYYY-MM-DD}  
> **Read by:** Every lead agent at bootstrap and at the start of any planning session

---

## How Agents Use This Document

**Lead agents:** Read this document at bootstrap (Step 2 of the Bootstrap Sequence in FRAMEWORK.md) and before any planning session. Use §3 (Epics) to derive session scope. Use §4 (Product ACs) to validate that session deliverables are on track. If a session's proposed scope cannot be traced to this document, stop and escalate to the Executive Sponsor.

**PM agents:** This is your primary reference for scope, priority, and acceptance criteria. When session-level ACs are written, they must trace to §4. When scope questions arise, the answer is in §3 or §8.

**BA agents:** This is your requirements anchor. When eliciting or structuring requirements, trace every requirement back to §3 or §4. Flag any requirement that cannot be traced as an open question for the ES.

**All agents:** If a session produces an output that contradicts this document, the output is wrong — not the document. Surface the contradiction. Do not silently resolve it in favor of the session output.

---

## §1 Vision and Problem Statement

### 1.1 Product Vision
{1–3 sentences. What will exist when this project is complete? What meaningful change does it make in the world or for its users? Avoid technical language here — this is the "why."}

### 1.2 Problem Statement
{2–4 paragraphs. What problem is being solved? Who experiences it? How severe is it? What is the cost of not solving it? What has been tried before and why was it insufficient?}

### 1.3 Opportunity
{1–2 paragraphs. Why now? What makes this the right moment to build this? What conditions have created the opening?}

---

## §2 Target User

### 2.1 Primary User
{Name the primary user role or persona. This is the person whose job to be done drives every product decision.}

- **Role / persona name:** {e.g., "Corporate travel manager," "Solo developer," "Registered nurse"}
- **Context:** {Where are they? What environment do they work in? What tools do they use today?}
- **Job to be done:** {Complete the sentence: "When [situation], I want to [action], so that [outcome]." This is the anchor for all acceptance criteria.}
- **Current pain:** {What does the current approach cost them in time, money, errors, or frustration?}

### 2.2 Secondary Users (if applicable)
{List any secondary users whose needs must be accommodated but do not drive primary product decisions. For each: role, relationship to the product, what they must be able to do.}

### 2.3 Out-of-Scope Users
{Who is explicitly NOT the target? This prevents scope creep from trying to serve users the product was not designed for.}

---

## §3 Epic Breakdown

> **Definition:** An epic is a cohesive unit of product capability that can be built across one or more sessions. Each epic has a clear scope boundary, entry criteria, and exit criteria. Epics are ordered by dependency and priority.
>
> **For lead agents:** Work through epics in order unless HANDOFF.md §5 specifies otherwise. Do not begin an epic until all blocking epics are complete. Do not expand an epic's scope without ES approval.

### Epic 1 — {Name}

**Status:** {Not started | In progress (Session N) | Complete}  
**Priority:** {Must / Should / Could}  
**Depends on:** {None | Epic N}  
**Estimated sessions:** {N}

**What this epic delivers:**
{2–4 sentences. What capability exists when this epic is done that did not exist before? Write in terms of user or system behavior, not implementation steps.}

**In scope:**
- {bullet — specific, verifiable}
- {bullet}

**Out of scope for this epic:**
- {bullet — what might seem related but is explicitly deferred}

**Entry criteria** (epic cannot begin until these are true):
- {bullet — e.g., "PROJECT-SPEC.md is in Active status," "Epic N is complete"}

**Exit criteria** (epic is complete when all of these are true):
- {bullet — verifiable, not vague}
- {bullet}
- {bullet — "ES has signed off on UAT for this epic" if applicable}

---

### Epic 2 — {Name}

**Status:** {Not started | In progress (Session N) | Complete}  
**Priority:** {Must / Should / Could}  
**Depends on:** {Epic 1}  
**Estimated sessions:** {N}

**What this epic delivers:**
{2–4 sentences.}

**In scope:**
- {bullet}

**Out of scope for this epic:**
- {bullet}

**Entry criteria:**
- {bullet}

**Exit criteria:**
- {bullet}

---

{Duplicate the Epic block for each epic in the project. Number them sequentially. Five to eight epics is a typical range for a meaningful product; fewer than three suggests the scope is too narrow to need this system; more than twelve suggests the specification needs further decomposition.}

---

## §4 Product-Level Acceptance Criteria

> **Distinction from session-level ACs:** These are product-level criteria that span multiple epics and sessions. They define what "done" means for the product as a whole, not for any single session. Session-level ACs (in SESSION-KICKOFF artifacts) must trace to one or more of these.
>
> **For lead agents:** Before closing a project (all epics complete), verify every item below is satisfied. Any unsatisfied item is a blocker for the final release.

### 4.1 Functional Criteria
{Each item should be testable — observable behavior, not a description of intent.}

- {AC-F-01}: {e.g., "A user can complete [primary job to be done] without encountering an unhandled error state."}
- {AC-F-02}: {e.g., "All data persists correctly across sessions."}
- {AC-F-03}: {bullet}

### 4.2 Non-Functional Criteria
{Performance, reliability, security, accessibility — stated as measurable thresholds where possible.}

- {AC-NF-01}: {e.g., "Page load time is under 2 seconds on a standard broadband connection for the primary user flow."}
- {AC-NF-02}: {e.g., "No PII is stored in logs or transmitted to third-party analytics."}
- {AC-NF-03}: {bullet}

### 4.3 Quality Criteria
{What does acceptable output quality look like at the product level?}

- {AC-Q-01}: {e.g., "All primary user flows are covered by automated tests."}
- {AC-Q-02}: {e.g., "No open bugs of Severity 1 or 2 at time of release."}
- {AC-Q-03}: {bullet}

---

## §5 Non-Functional Requirements

> These requirements apply across all epics and sessions. They are constraints, not features. Engineering agents must consult this section before any implementation decision that could affect these properties.

### 5.1 Performance
- {e.g., "Target environment is [hardware/cloud tier]. Performance requirements are scoped to this environment."}
- {e.g., "The system must handle [N] concurrent users / [N] requests per second under normal load."}

### 5.2 Security and Compliance
- {e.g., "No credentials, API keys, or secrets are committed to version control under any circumstances."}
- {e.g., "The system must comply with [GDPR | SOC 2 | HIPAA | internal policy] — specify which."}
- {e.g., "All user-supplied input is validated and sanitized before processing."}

### 5.3 Accessibility
- {e.g., "The product meets WCAG 2.1 AA standards for all primary user flows."}
- {e.g., "Keyboard navigation is fully supported."}

### 5.4 Reliability and Availability
- {e.g., "Target uptime: [N]% for [environment type]."}
- {e.g., "Data loss is acceptable only in [scenario]; all other scenarios require data durability."}

### 5.5 Maintainability
- {e.g., "All code follows the conventions defined in TECH_STACK.md."}
- {e.g., "No function or module exceeds [complexity threshold]."}
- {e.g., "All public interfaces are documented."}

---

## §6 Release Milestones

> Milestones define when the Executive Sponsor reviews, approves, or makes a go/no-go decision. They are not arbitrary checkpoints — each milestone corresponds to a meaningful product state that warrants ES review before the team continues.
>
> **For lead agents:** At each milestone, pause and surface a milestone report to the ES before beginning the next phase. Do not proceed past a milestone without explicit ES approval.

| Milestone | Trigger | ES action required | Exit condition |
|-----------|---------|-------------------|----------------|
| **M0 — Specification approved** | PROJECT-SPEC.md is complete and in Active status | ES reviews and approves spec; sets project in motion | `PROJECT-SPEC.md status = Active` |
| **M1 — {Name}** | {e.g., "Epic 1 and Epic 2 complete"} | {e.g., "ES reviews demo; approves scope for next phase"} | {what ES approval looks like} |
| **M2 — {Name}** | {epic completion trigger} | {ES action} | {exit condition} |
| **M_UAT — User Acceptance Testing** | All epics complete; all product ACs satisfied | ES conducts or approves UAT; raises defects or accepts | All UAT defects resolved or deferred with documented rationale |
| **M_Release — Production release** | UAT accepted; release criteria met | ES issues go/no-go; approves release communications | System is live; post-release monitoring active |

---

## §7 Definition of Done — Product Level

The project is complete when all of the following are true:

```
[ ] All epics are in "Complete" status
[ ] All product-level ACs (§4) are satisfied
[ ] All quality gates pass on the main branch
[ ] UAT has been conducted and accepted by the Executive Sponsor
[ ] All Severity 1 and 2 defects are closed
[ ] All open Severity 3 defects are documented and accepted as known issues
[ ] Release documentation is complete
[ ] HANDOFF.md reflects post-release steady state (or project closure)
[ ] ES has issued final go/no-go approval
```

---

## §8 Explicit Out of Scope

> This section exists to prevent scope creep. If a capability is not in §3, it is out of scope. This section names the items most likely to be confused as in-scope.

- {e.g., "Mobile native applications (iOS/Android) — web responsive only"}
- {e.g., "Multi-tenant architecture — single-tenant only in v1"}
- {e.g., "Real-time collaboration — single-user sessions only"}
- {e.g., "Integration with [system] — API contract is defined but implementation is deferred"}

---

## §9 Known Constraints and External Dependencies

> These are facts about the environment, third parties, or decisions that are fixed and outside the team's control. Agents must work within them, not around them.

### 9.1 Technical Constraints
- {e.g., "Must deploy to [cloud provider / on-premise environment]. No exceptions."}
- {e.g., "Must integrate with [existing system] via its existing API. API modifications are not available."}

### 9.2 External Dependencies
| Dependency | What is needed | Owner | Risk if unavailable |
|-----------|---------------|-------|---------------------|
| {e.g., "Payment API"} | {API key, sandbox access} | {ES provides} | {Blocks Epic 3} |
| {e.g., "Design system"} | {Component library access} | {ES provides} | {Blocks UX work in Epic 2} |

### 9.3 Credentials and API Keys Required
> **For agents:** Do not stub, mock, or invent credentials. If a required credential is not available, escalate to ES. Record the dependency in HANDOFF.md §6 (Escalations Pending Human Decision).

| Credential | Required for | ES status |
|-----------|-------------|-----------|
| {e.g., "STRIPE_API_KEY"} | {Epic 3 — payments} | {Provided / Pending / Not yet needed} |
| {e.g., "ANTHROPIC_API_KEY"} | {All LLM-dependent features} | {Provided / Pending / Not yet needed} |

---

## §10 Amendment Log

> All changes to this document after M0 (Specification Approved) must be recorded here. An amendment requires ES authorization. Agents may propose amendments but cannot apply them — proposals go to the ES as an escalation.

| Date | Version | Section changed | What changed | Authorized by |
|------|---------|----------------|-------------|---------------|
| {YYYY-MM-DD} | 1.0 | — | Initial specification | {ES name} |
| {YYYY-MM-DD} | {N} | {§N} | {what changed and why} | {ES} |

---

*This document is the north star. When in doubt, return to it.*
