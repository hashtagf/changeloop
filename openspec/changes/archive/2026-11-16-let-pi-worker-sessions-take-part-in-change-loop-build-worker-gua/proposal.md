# Change: Let Pi worker sessions take part in Change Loop Build: worker guards inherit the parent session's phase through FOUNDATION_PARENT_SESSION_ID without inheriting Land or Deliver authority, and the maintainer agent-team extension propagates that identity, dispatches leased Change Loop tasks, offers model-tier roles, and caps active workers by configuration and foundation.json maxParallelAgents.

- **Change:** `let-pi-worker-sessions-take-part-in-change-loop-build-worker-gua` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

Host capabilities declare Pi native dispatch available, but a Pi worker is a separate session: the phase guard resolves the recorded phase by session id, so every worker write into the parent's Build workspace is refused as 'active phase is unavailable' (reproduced with the installed guard). The owner chose to close this gap and to adopt the useful pi-crew ideas (roles bound to existing model tiers, structured reports, limits) without per-worker worktrees, which would conflict with Change Loop's one-writer-per-workspace rule.

## Scope

- **In scope:** A Pi worker can edit inside its parent's Build workspace and nowhere else; A worker never holds Land or Deliver authority; agent-team workers carry the coordinating session's identity; One call starts a worker for a leased Change Loop task; Roles pick a model tier, tool limits and a report format; Active worker count follows configuration and the project's Change Loop limit
- **Out of scope:** edits outside `.claude/harness/adapters/pi-extension.mjs`, `.claude/harness/tests/pi-extension.test.mjs`, `.claude/harness/README.md`, `CHANGELOG.md`, `pi-extensions/agent-team/roles.ts`, `pi-extensions/agent-team/roles.test.cjs`, … +4 more

## Work type

feature

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| Unknown change is refused | an error is returned and no worker starts | No separate step; the outcome is the handling | team-changeloop-task |
| Unknown role is refused | an error names the supported roles | No separate step; the outcome is the handling | team-roles |
| Project cap | the spawn is refused with a message naming maxParallelAgents | No separate step; the outcome is the handling | team-limits |

## Capabilities

| Capability | Requirements | Tasks |
|---|---|---|
| pi-host-adapter | worker-phase-inheritance, worker-no-land | T001, T002 |
| maintainer-pi-extensions | team-propagates-parent, team-changeloop-task, team-roles, team-limits | T003 |

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| worker-phase-inheritance | Worker writes in the parent's workspace | unclassified | T001, T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | Worker stays out of the main checkout | unclassified | T001, T002 |  |  |
|  | Unrelated session gains nothing | unclassified | T001, T002 |  |  |
| worker-no-land | Worker cannot land | unclassified | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
| team-propagates-parent | Nested workers keep the root session | unclassified | T003 | test: `pi-extensions/agent-team/roles.test.cjs` | — |
| team-changeloop-task | Unknown change is refused | failure | T003 | test: `pi-extensions/agent-team/roles.test.cjs` | — |
|  | Leased task brief | unclassified | T003 |  |  |
| team-roles | Unknown role is refused | failure | T003 | test: `pi-extensions/agent-team/roles.test.cjs` | — |
|  | Reviewer is read-only and deep | unclassified | T003 |  |  |
| team-limits | Project cap | failure | T003 | test: `pi-extensions/agent-team/roles.test.cjs` | — |

## Definition of done

- Fresh evidence for every claim (10).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
