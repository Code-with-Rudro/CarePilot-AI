# MEMORY.md — TPU Project Memory & Team Activity Log

> **Project:** Altrix Labs — AI-Powered Personal Health Copilot
>
> **Purpose:** Maintain continuity across sessions and track each team member's work step by step, including progress, bugs, decisions, blockers, integrations, and important discoveries.
>
> **Security:** Never store passwords, API keys, access tokens, real patient data, or other secrets here. Record only the minimum non-sensitive information needed for project coordination.

---

## 1. Project Overview

Build an AI-powered Personal Health Copilot that helps people organize and understand medical records, prescriptions, diagnostic reports, and wellness data through clear, actionable explanations.

The intended system includes document upload and organization, OCR/extraction, RAG-based retrieval, AI-generated explanations, a user-friendly interface, privacy safeguards, and a documented integration point for Sai's Unity work.

Treat this as project context, not proof that every feature is implemented. Use the PRD and architecture document as the source of truth for detailed requirements and design.

## 2. Team Ownership and Boundaries

| Team member | Known context | Current task source |
|---|---|---|
| Rudra Prasad Panigrahi | Project coordination and project-document workflow | `TASK.md` |
| BODDU MANI SANKAR | Team member; confirm exact technical ownership in the task tracker | `TASK.md` |
| Manikanta Namburi | Team member; confirm exact technical ownership in the task tracker | `TASK.md` |
| Sai | Developing Unity work in an external Unity IDE, outside the Antigravity workspace | Unity integration section in `TASK.md` |

Do not infer or silently reassign technical ownership from this table. Update it when the team confirms assignments.

### Boundary and permission rules

1. Work within your assigned files, modules, and responsibilities.
2. Ask the owner before changing another person's owned files or implementation.
3. For cross-boundary work, record the request, reason, affected files/interfaces, owner approval, and outcome.
4. Do not overwrite or remove another person's work without explicit agreement.
5. Record integration dependencies and interface changes in the task tracker.

## 3. Step-by-Step Work Tracking

Maintain one work log per person. Every meaningful task should have a unique ID and be updated as work progresses.

### Status definitions

- `Not started` — work has not begun.
- `In progress` — actively being implemented or investigated.
- `Blocked` — cannot proceed until a dependency or decision is resolved.
- `In review` — implementation is ready for review or testing.
- `Done` — acceptance criteria are met and evidence is recorded.
- `Deferred` — intentionally postponed, with a reason.

### Work item template

Copy this template for each task or subtask:

```md
### [TASK-ID] Short task title
- Owner:
- Module / boundary:
- Status: Not started
- Priority: Medium
- Created:
- Last updated:
- Goal:
- Prerequisites / dependencies:
- Steps:
  1. [ ] ...
  2. [ ] ...
  3. [ ] ...
- Expected result / acceptance criteria:
- Files or components affected:
- Tests / verification:
- Bugs linked:
- Decisions linked:
- Blockers:
- Evidence (PR, commit, test output, screenshot path; no secrets):
- Next step:
```

Use small steps that produce a verifiable result. Update the status, last-updated date, completed steps, blockers, and next step whenever meaningful progress occurs.

## 4. Individual Work Logs

Append dated entries rather than silently replacing history. Keep the latest status near the top of each person's section.

### 4.1 Rudra Prasad Panigrahi

- **Assigned scope:** Project coordination and project-document workflow; confirm detailed implementation ownership in `TASK.md`.
- **Current task IDs:** _Not recorded yet._
- **Current status:** _Needs team update._

#### Progress history

| Date / time | Task ID | Step completed / attempted | Result | Next step |
|---|---|---|---|---|
| _YYYY-MM-DD_ | _TASK-ID_ | _Describe the specific step_ | _Done / issue / blocked_ | _Next action_ |

#### Open bugs and blockers
- _None recorded yet. This means not yet recorded, not necessarily that none exist._

#### Important decisions / discoveries
- _Add dated entries with a link to the decision log below._

### 4.2 BODDU MANI SANKAR

- **Assigned scope:** Confirm in `TASK.md`.
- **Current task IDs:** _Not recorded yet._
- **Current status:** _Needs team update._

#### Progress history

| Date / time | Task ID | Step completed / attempted | Result | Next step |
|---|---|---|---|---|
| _YYYY-MM-DD_ | _TASK-ID_ | _Describe the specific step_ | _Done / issue / blocked_ | _Next action_ |

#### Open bugs and blockers
- _None recorded yet. This means not yet recorded, not necessarily that none exist._

#### Important decisions / discoveries
- _Add dated entries with a link to the decision log below._

### 4.3 Manikanta Namburi

- **Assigned scope:** Confirm in `TASK.md`.
- **Current task IDs:** _Not recorded yet._
- **Current status:** _Needs team update._

#### Progress history

| Date / time | Task ID | Step completed / attempted | Result | Next step |
|---|---|---|---|---|
| _YYYY-MM-DD_ | _TASK-ID_ | _Describe the specific step_ | _Done / issue / blocked_ | _Next action_ |

#### Open bugs and blockers
- _None recorded yet. This means not yet recorded, not necessarily that none exist._

#### Important decisions / discoveries
- _Add dated entries with a link to the decision log below._

### 4.4 Sai — External Unity Work

- **Assigned scope:** Unity development in an external Unity IDE.
- **Integration boundary:** Record the agreed interface and integration location in `TASK.md` and the architecture document.
- **Current task IDs:** _Not recorded yet._
- **Current status:** _Needs team update._

#### Progress history

| Date / time | Task ID | Step completed / attempted | Result | Next step |
|---|---|---|---|---|
| _YYYY-MM-DD_ | _TASK-ID_ | _Describe the specific step_ | _Done / issue / blocked_ | _Next action_ |

#### Open bugs and blockers
- _None recorded yet. This means not yet recorded, not necessarily that none exist._

#### Important decisions / discoveries
- _Add dated entries with a link to the decision log below._

## 5. Bug and Issue Tracker

Give every bug a unique ID such as `BUG-001`. Link it to the affected task and owner. Do not mark a bug fixed until the fix has been verified.

### Bug template

```md
### [BUG-ID] Short, specific title
- Reported:
- Reported by:
- Owner:
- Related task:
- Severity: Critical / High / Medium / Low
- Status: Open / Investigating / Fix in progress / Ready to verify / Fixed / Won't fix
- Area:
- Environment / version:
- Steps to reproduce:
  1. ...
  2. ...
- Expected behavior:
- Actual behavior:
- Error output / logs (remove secrets and personal data):
- Root cause:
- Proposed fix:
- Fix / commit reference:
- Verification steps and result:
- Related decisions:
- Next action:
```

### Bug list

| Bug ID | Summary | Owner | Severity | Status | Related task | Last updated |
|---|---|---|---|---|---|---|
| _No bugs recorded yet_ | | | | | | |

### Severity guidance

- **Critical:** Data exposure/loss, major security issue, or core system unavailable.
- **High:** Major feature broken with no reasonable workaround.
- **Medium:** Important behavior impaired, with a workaround.
- **Low:** Minor defect, cosmetic issue, or low-impact edge case.

## 6. Important Decision Log

Record decisions that affect architecture, APIs, data formats, ownership, security, scope, dependencies, or integration. Keep the reasoning and alternatives so future sessions do not reopen settled questions without cause.

### Decision template

```md
### [DEC-ID] Short decision title
- Date:
- Proposed by:
- Decision owner / approver:
- Status: Proposed / Accepted / Rejected / Superseded
- Context / problem:
- Options considered:
- Decision:
- Reasoning and trade-offs:
- Affected modules / people:
- Follow-up tasks:
- Related bugs:
- Review trigger (if any):
```

### Decision list

| Decision ID | Decision | Status | Date | Affected areas | Reference |
|---|---|---|---|---|---|
| DEC-001 | Keep team work areas separate; get owner permission before cross-boundary changes | Accepted as a team working rule | 2026-10-10 | All workstreams | `RULES.md` |
| DEC-002 | Include RAG as part of the intended system architecture | Discussed; implementation details pending | 2026-10-10 | Retrieval / AI | Architecture document |
| DEC-003 | Provide a documented integration point for Sai's external Unity work | Discussed; interface details pending | 2026-10-10 | Unity / main app | `TASK.md`, architecture |
| DEC-004 | Use a clean, professional UI with purposeful, understandable animation | Design direction discussed | 2026-10-10 | UI / UX | `DESIGN.md` |

Only mark a decision `Accepted` when the appropriate owner or team has actually confirmed it. Update the entries above if the team changes or clarifies them.

## 7. Blocker and Dependency Log

Use a blocker ID such as `BLK-001`. A blocker must have an owner and a next action.

| Blocker ID | Description | Blocking person / task | Needed from | Owner | Opened | Status | Next action |
|---|---|---|---|---|---|---|---|
| _No blockers recorded yet_ | | | | | | | |

For each blocked task, also add the blocker ID to its work item. Close a blocker only after verifying the dependent task can proceed.

## 8. Milestones and Integration Checkpoints

Track milestones at the level of testable outcomes, not just activity.

| Milestone ID | Deliverable | Owner(s) | Acceptance criteria | Status | Dependencies |
|---|---|---|---|---|---|
| MS-001 | Product requirements agreed | Team / coordinator | Scope, user flows, and acceptance criteria reviewed | To confirm | PRD |
| MS-002 | Architecture and interfaces agreed | Relevant owners | Components, data flow, APIs, RAG approach, security, and Unity boundary documented | To confirm | PRD |
| MS-003 | Main UI workflow implemented | UI owner to confirm | Core pages and loading/error/empty states work | Not recorded | Design |
| MS-004 | Document ingestion and OCR flow verified | Owner to confirm | Supported sample files processed; uncertain extraction is flagged | Not recorded | Architecture |
| MS-005 | RAG-grounded response flow verified | Owner to confirm | Relevant sources are retrieved and displayed; unsupported claims are handled safely | Not recorded | Storage / retrieval |
| MS-006 | Unity integration verified | Sai + integration owner | Agreed interface exchanges expected data and failure states are handled | Not recorded | Unity interface |
| MS-007 | End-to-end test and release readiness | Team | Critical paths tested; open high-severity bugs reviewed | Not recorded | Prior milestones |

These milestones are a suggested tracking structure. Confirm owners and scope before treating them as committed delivery dates.

## 9. Project Architecture and Safety Notes

The intended logical areas are:

1. **Frontend/UI:** upload, dashboard, records, summaries, insights, and processing feedback.
2. **Document ingestion:** validation, safe file handling, and storage.
3. **OCR/extraction:** text and structured fields, with confidence and review for uncertain results.
4. **Normalization/storage:** organized extracted data with source references and appropriate access control.
5. **RAG/retrieval:** relevant user-record excerpts and approved reference material for grounded answers.
6. **AI insight generation:** plain-language explanations linked to supporting sources.
7. **Privacy and safety:** protect sensitive health information, communicate uncertainty, and avoid replacing professional medical care.
8. **Unity integration:** documented interface between the main application and Sai's separately developed component.

This is a logical outline, not confirmation that the implementation or technology choices are complete.

### Health-data safeguards

- Treat medical records and extracted health information as highly sensitive.
- Use synthetic or properly de-identified data for demos and development whenever possible.
- Do not invent missing medical facts or conceal OCR uncertainty.
- Keep source references so users can verify summaries and extracted values.
- Do not place patient data, secrets, or sensitive logs in this memory file.
- Encourage qualified medical advice for medical decisions, urgent symptoms, or conflicting information.

## 10. Access and Secret Handling

- The team discussed individual access credentials.
- Never store passwords, API keys, tokens, or recovery codes in this file or version control.
- Use an approved password manager or secret store, plus environment variables or ignored local configuration files.
- Rotate any credential exposed in a chat, log, screenshot, or commit.
- Enforce access through the actual repository and application permissions; a memory file is not an access-control system.

## 11. Session Handoff Log

At the end of a work session, add a concise handoff so the next person or session can resume without guessing.

```md
### Session — YYYY-MM-DD
- Person / session owner:
- Main goal:
- Tasks touched:
- Steps completed:
- Bugs discovered or resolved:
- Decisions proposed or accepted:
- Blockers / dependencies:
- Files changed:
- Tests run and results:
- Uncommitted or unreviewed work:
- Next 1–3 actions:
```

## 12. How to Keep the Tracker Accurate

1. Update task status as work happens, not only at the end.
2. Record a progress entry for each meaningful step; include the outcome and next action.
3. Link bugs, decisions, and blockers to task IDs.
4. Include evidence such as a pull request, commit, test result, or screenshot path when available; never include secrets or real patient data.
5. Record both failed attempts and successful fixes when they teach the team something important.
6. Distinguish confirmed facts from proposals and assumptions.
7. Do not claim that a person completed work unless there is a reported update or verifiable evidence.
8. Use `TASK.md` for actionable work and ownership, this `MEMORY.md` for durable context and history, `RULES.md` for collaboration boundaries, and the architecture/design/PRD documents for their respective details.
9. If the team later adopts an issue tracker or project-management tool, use it as the operational source of truth and keep this file as a concise handoff/index.

---

## 13. Initial Status Snapshot

**Last initialized:** 2026-10-10

The team tracking structure is now defined, but detailed per-person task progress, actual bugs, and completed implementation steps have not yet been supplied in this file. Do not interpret blank sections as proof that no work or bugs exist. Populate the logs from team updates and verifiable project evidence.
