# Change: When a Land stops before applying anything, record the session's phase as prove again so the main checkout is not held under Land rules for the phase freshness window.

- **Change:** `when-a-land-stops-before-applying-anything-record-the-session-s` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

On 2026-11-16 a Land stopped on a resource boundary while the change stayed proven. The session's last phase row still said land, and the phase guard keeps that for 12 hours, so every main-checkout write was refused under Land rules, including a git commit the user explicitly asked for. Under prove, the guard already lets a user-instructed commit or push run and asks otherwise. The phase should follow the lifecycle: a Land that never applied leaves the change proven.

## Scope

- **In scope (`land`):** A stopped Land that applied nothing returns the session to the prove phase
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/advance-runtime.mjs`, `.claude/harness/tests/advance-runtime.test.mjs`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** advance --through archived on a proven change whose Land returns REPAIR; the last phase-context row stays land.
- **Root cause:** advanceThrough records the land phase when it enters Land and never records a phase again when Land returns without applying.
- **Regression proof:** —

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| stopped-land-releases-phase | Stopped Land records prove | success | T001, T002 | test: `.claude/harness/tests/advance-runtime.test.mjs` | — |
|  | Interrupted apply keeps land | boundary | T001, T002 |  |  |

## Definition of done

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
