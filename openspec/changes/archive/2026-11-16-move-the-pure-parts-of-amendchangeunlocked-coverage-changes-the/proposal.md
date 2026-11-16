# Change: Move the pure parts of amendChangeUnlocked (coverage changes, the amendment history row, the AMENDED report) and the approval-delta and waiver formatters into a new amendment-record.mjs, keeping every output identical.

- **Change:** `move-the-pure-parts-of-amendchangeunlocked-coverage-changes-the` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

amendChangeUnlocked is the longest function in change-lifecycle.mjs (366 lines). It mixes a filesystem transaction with pure data shaping and report text. Pulling the pure parts out leaves the transaction readable on its own and lets those parts be tested directly. Slice 2 of the owner-approved refactor of the largest runtime files.

## Scope

- **In scope (`runtime-maintainability`):** Amendment record shaping and report text live in their own module
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/amendment-record.mjs`, `.claude/harness/runtime/workflow/change-lifecycle.mjs`, `.claude/harness/tests/amendment-record.test.mjs`

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
| amendment-record-module | Report text unchanged | success | T001, T002 | test: `.claude/harness/tests/amendment-record.test.mjs` | — |

## Definition of done

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-16): The new amendment-record.test.mjs must run in the default gate, which lists harness tests explicitly in run-all.sh.
