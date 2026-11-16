# Change: A recorded --accept-target-edits decision clears the target-edit stop when it covers every blocking path with the same bytes, instead of requiring the whole dirty-file set to match exactly.

- **Change:** `a-recorded-accept-target-edits-decision-clears-the-target-edit-s` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

On 2026-11-16 the user confirmed another session's files were not this change's, yet Land repeated the same TARGET_EDITED_OUTSIDE_SANDBOX stop until repeated-no-progress. The decision digests every dirty path then (12), while the gate compares that digest to a differently filtered set (landed output excluded) and any new unrelated dirty file changes the set, so the exact string never matches. Acceptance should be per path: an accepted path with unchanged bytes is accepted.

## Scope

- **In scope (`sandbox`):** Accepted target edits stay accepted per path
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/target-edits.mjs`, `.claude/harness/tests/target-edits.test.mjs`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** Accept target edits while another dirty file is present, then let that file change or another appear; the stop repeats.
- **Root cause:** targetEditIssues requires the accepted digest to equal the digest of the current path set exactly; resolve records a different, wider set.
- **Regression proof:** —

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| Changed bytes need a new decision | the TARGET_EDITED_OUTSIDE_SANDBOX issue is raised again | No separate step; the outcome is the handling | acceptance-per-path |

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| acceptance-per-path | Wider acceptance clears the stop | success | T001, T002 | test: `.claude/harness/tests/target-edits.test.mjs` | — |
|  | Changed bytes need a new decision | failure | T001, T002 |  |  |

## Definition of done

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
