# DECISIONS.md — {PROJECT_NAME}

> **Role:** Persistent log of architecture, product, and process decisions that carry forward across sessions. Every decision recorded here was made for a reason; that reason is the most valuable part of the entry. Agents consult this document before making any implementation choice that touches an area already decided. If a prior decision covers the situation, follow it. If a prior decision needs to change, propose an amendment — do not silently deviate.
>
> **Authors:** Lead Engineering agent and Lead Product agent (joint custodians). Any agent may propose a decision entry; both leads must agree before it is recorded.
> **Authorized amendments:** Amendments to existing entries require the same joint lead approval. If the amendment carries product authority implications (scope, user-facing behavior, release criteria), escalate to the Executive Sponsor before recording.
> **Status:** {Active | Superseded entries marked inline}
> **Last Updated:** {YYYY-MM-DD}
> **Read by:** All agents at session start, after HANDOFF.md and before writing any code that touches a decided area.

---

## How Agents Use This Document

When you are about to make an implementation choice, search this document for the relevant area first. If a decision exists, follow it and cite the decision ID in your session output. If no decision exists, make the best choice available, record it here at session close using the template below, and note it in the session report. Never let an undocumented decision leave a session — the next agent has no way to know why things are the way they are.

If you believe a prior decision is wrong or no longer applicable, do not silently override it. Raise it as a discovery-pattern message to the lead, who will determine whether an amendment is needed and whether ES escalation is required.

---

## Decision Entry Template

Copy this block for each new decision. Assign the next sequential ID in the relevant category.

```
### {ID} — {Short Title}

**Date:** {YYYY-MM-DD}
**Session / Epic:** {Session N or Epic N}
**Status:** Active

**Context:**
{1–3 sentences. What situation or problem prompted this decision? What would have happened if no decision had been made?}

**Options considered:**
- {Option A}: {brief description and key tradeoff}
- {Option B}: {brief description and key tradeoff}
- {Option C if applicable}

**Decision:**
{One clear sentence stating what was decided.}

**Rationale:**
{2–4 sentences. Why this option over the others? What evidence, constraints, or principles drove the choice?}

**Consequences and tradeoffs:**
{What does this decision foreclose? What technical debt does it accept? What follow-on work does it create?}

**Owner:** {Role or agent that owns the consequences of this decision}
```

---

## Category: Data Architecture

{Decisions about schema design, data storage, event sourcing, caching strategy, migration policy, and data integrity invariants.}

---

## Category: Market Data and Providers

{Decisions about provider selection, provider chain ordering, rate limiting strategy, fallback behavior, and data normalization.}

---

## Category: Analytics Engine

{Decisions about lot accounting methodology, PnL computation, portfolio valuation, snapshot rebuild strategy, and numeric precision.}

---

## Category: API Layer

{Decisions about endpoint design, request/response shapes, validation strategy, error handling, and API contract stability.}

---

## Category: Scheduler

{Decisions about polling cadence, market calendar gating, budget governance, and process isolation.}

---

## Category: UI and UX

{Decisions about component architecture, design system application, charting library usage, state management, and interaction patterns.}

---

## Category: Advisor (LLM)

{Decisions about model selection, system prompt design, tool definitions, context window management, and thread persistence.}

---

## Category: Testing and Quality

{Decisions about test scope, mocking strategy, coverage thresholds, and quality gate configuration.}

---

## Category: Process and Operations

{Decisions about session operating model, agent team structure, escalation routing, and document ownership.}

---

## Amendment Log

All changes to existing decision entries after their initial recording must be logged here. An amendment that carries product authority implications requires Executive Sponsor authorization before being applied.

| Date | Decision ID | What changed | Reason | Approved by |
|------|------------|-------------|--------|-------------|
| {YYYY-MM-DD} | {ID} | {what changed} | {why} | {Lead Engineering + Lead Product, or ES if required} |

---

*Decisions not documented here did not officially happen. When in doubt, write it down.*
