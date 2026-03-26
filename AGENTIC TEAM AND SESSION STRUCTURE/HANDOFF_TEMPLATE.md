# HANDOFF.md — {PROJECT_NAME}

> **Purpose:** Session transition artifact. Written by the lead at the end of every session. Read first by the lead at the start of the next session — before AGENTS.md, before any code.  
> **Replaces reading:** Do not re-read prior session plans or chat history. If it is not in this document, it is not guaranteed to be current.  
> **Last Updated:** {YYYY-MM-DD HH:MM}  
> **Session:** {N} → {N+1}

---

## 1) Current State (One Paragraph)

{Write 3–5 sentences. What is the system capable of right now, as of the end of this session? What was just completed? What is the state of the codebase, document set, or deliverable? A new session lead should be able to orient from this paragraph alone without reading anything else.}

---

## 2) What Happened This Session

### 2.1 Completed
{Bullet each completed deliverable or change. Be specific: file paths, API names, document sections, decisions made. "Backend route implemented" is insufficient. "`POST /api/sessions` implemented in `src/api/sessions.ts`; returns session ID and status; tested with Vitest" is sufficient.}

### 2.2 Quality Gates Run
| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `{command}` | ✅ Pass / ❌ Fail — {details if failed} |
| Tests | `{command}` | ✅ Pass / ❌ Fail — {details if failed} |
| Lint / format | `{command}` | ✅ Pass / ❌ Fail — {details if failed} |
| Build | `{command}` | ✅ Pass / ❌ Fail — {details if failed} |

> If any gate is failing at handoff, the next session must resolve it before adding new work.

### 2.3 Decisions Made
{For each significant decision made this session, record what was decided and why. Decisions without rationale will be re-litigated. If the decision belongs in `DECISIONS.md`, copy it there and note it here.}

| Decision | Rationale | Owner |
|----------|-----------|-------|
| {decision} | {why} | {who or which role} |

### 2.4 What Was Not Completed
{List anything that was planned for this session but not finished. Include the reason (time, blocker, scope change) so the next session lead knows whether to pick it up or reassess.}

---

## 3) Active Blockers and Open Items

{Anything that must be resolved before the next session can proceed with normal work. Separate true blockers (work cannot continue) from open items (work can continue around them).}

### Blockers — resolve before starting next session
- {blocker}: {what is needed to unblock, and who can provide it}

### Open items — resolve during or after next session
- {item}: {what is needed and when it matters}

---

## 4) Risks Surfaced This Session

{Issues that did not block this session but that the next session should be aware of. Include technical debt that was knowingly incurred, edge cases that were identified but not addressed, and external dependencies that could affect the work.}

---

## 5) Next Session

### 5.1 Recommended Scope
{What should the next session accomplish? One clear objective and, if helpful, an ordered list of tasks beneath it. Do not pre-solve — give the next lead enough to make good decisions, not a script to follow.}

### 5.2 Roles to Staff
{Which roles from the AGENTS.md §5 roster are needed for the recommended scope? Which are optional?}

| Role | Required / Optional | Notes |
|------|---------------------|-------|
| {role} | {Required / Optional} | {why and what they own} |

### 5.3 Context to Load
{What documents, files, or sections the next lead should read after this handoff, in reading order.}

1. This file (done)
2. {next document and why}
3. {next document and why}

### 5.4 Session Contract Starting Points
{If the next session's delegation is predictable enough, draft the starting Session Contracts here. The next lead refines them — they are not binding.}

```
- Objective:       {1–2 sentences}
- Role:            {role}
- Mode:            {solo | subagents | agent_teams}
- Comms policy:    {direct | lead_mediated | hybrid}
- File scope:      Allowed: {paths} | Forbidden: {paths}
- Deliverables:    {list}
- Stop conditions: {when to pause}
```

---

## 6) Escalations Pending Human Decision

{Items that require a stakeholder or human authority decision before the agent team can proceed. These are not open questions the team can resolve internally — they require external input.}

| Item | Decision needed | From whom | By when |
|------|----------------|-----------|---------|
| {item} | {what decision is needed} | {stakeholder or role} | {urgency} |

> Leads: do not block the next session on these items unless they are hard blockers (§3). Surface them here and work around them where possible.

---

## 7) Agent Team Notes (if Agent Teams mode was used this session)

### Teammates Spawned
| Teammate ID / Role | Task assigned | Output location | Status |
|--------------------|--------------|-----------------|--------|
| {role} | {task} | {file or section} | ✅ Complete / ⚠️ Partial / ❌ Incomplete |

### Coordination Issues
{Any file conflicts, messaging failures, scope overlaps, or coordination patterns that should inform how the next session structures its team. If none, write "None."}

### Token Cost Observation
{Was the Agent Teams mode justified by the parallelism achieved? If the session would have been more efficient as solo or subagent work, note it here so the pattern can be adjusted.}

---

*Handoff written by: {Lead agent ID or session identifier}*  
*Next session starts: {YYYY-MM-DD} or {on-demand}*
