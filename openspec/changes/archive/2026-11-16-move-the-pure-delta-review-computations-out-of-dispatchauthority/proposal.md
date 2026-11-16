# Change: Move the pure delta-review computations out of dispatchAuthorityUnlocked (delta scope rows, closure findings, delta packet projection) into a new review-delta-scope.mjs, keeping every dispatched packet identical.

- **Change:** `move-the-pure-delta-review-computations-out-of-dispatchauthority` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

dispatchAuthorityUnlocked in authority-runtime.mjs is the longest function left in the large runtime files (271 lines), with five levels of nested helper functions. The delta-review part only reshapes manifests and packet sections and touches no store or lock, so it can move out as plain functions and be tested directly. Slice 4 of the owner-approved refactor of the largest runtime files.

## Scope

- **In scope (`runtime-maintainability`):** Delta-review scope and packet projection live in their own module
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/review-delta-scope.mjs`, `.claude/harness/runtime/workflow/authority-runtime.mjs`, `.claude/harness/tests/review-delta-scope.test.mjs`, `.claude/tests/run-all.sh`

## Work type

refactor

## Refactor invariants

- —

- **Characterization:** —

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| review-delta-scope-module | Dispatched packets unchanged | success | T001, T002 | test: `.claude/harness/tests/review-delta-scope.test.mjs`, `.claude/tests/run-all.sh` | — |

## Definition of done

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
