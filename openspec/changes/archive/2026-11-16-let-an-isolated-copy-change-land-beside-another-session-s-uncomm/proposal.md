# Change: Let an isolated-copy change land beside another session's uncommitted work: files copied from the target's dirty state at isolation and left untouched by the change are never counted as the change's edits or as sync conflicts.

- **Change:** `let-an-isolated-copy-change-land-beside-another-session-s-uncomm` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-15

## Why

On 2026-11-16 a refactor touching two files could not Land because another session's landed-but-uncommitted pi-extensions files had been copied into its isolated sandbox. Those files are invisible to the copy baseline (untracked, undeclared), so once the other session committed them the harness saw the stale copies as this change's creations: Land's projection claimed them (TARGET_EDITED_OUTSIDE_SANDBOX), and sandbox sync reported 'both changed' conflicts. The isolation snapshot (workspace.targetDirty) already records their exact bytes, but neither check consults it. Running several changes at once is the normal multi-session workflow, so this blocks parallel work.

## Scope

- **In scope (`sandbox`):** A copy-mode change does not claim files it copied from the target's dirty state and never edited; Sync follows the target for an untouched isolation copy instead of reporting a conflict
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/change-policy.mjs`, `.claude/harness/tests/change-policy-surface.test.mjs`, `.claude/harness/runtime/workflow/sandbox-runtime.mjs`, `.claude/harness/tests/sandbox-runtime-sync.test.mjs`; the authored Non-goals below

## Non-goals

- Releasing the Land phase lock after a stopped Land (separate change).
- The phase guard matching 'archive' inside git path arguments (separate change).
- Scoping --accept-target-edits to only the blocking paths (separate change).

## Impact and risk

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| untouched-copy-not-claimed | Untouched foreign file is not claimed | success | T001, T003 | test: `.claude/harness/tests/change-policy-surface.test.mjs` | — |
|  | Edited foreign file is still claimed | boundary | T001, T003 |  |  |
| untouched-copy-forwards-on-sync | Untouched copy fast-forwards | success | T002, T003 | test: `.claude/harness/tests/sandbox-runtime-sync.test.mjs` | — |
|  | Edited copy still conflicts | failure | T002, T003 |  |  |

## Definition of done

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Derived by the harness

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for untouched-copy-not-claimed, untouched-copy-forwards-on-sync.

## Appendix: Review record

| Round | Finding | Severity | Fix | Reviewer |
|---|---|---|---|---|
| 1 | minor-surface-test-level: The surface scenarios are exercised through the `carriedInUnchanged` helper with a fake digest function, not through the changed-surface computation (`createChangePolicy` and its changed-surface method). The wiring is a single call site that already passes `state`, so risk is low, but an end-to-end surface test would pin the claim more directly. (root/.claude/harness/tests/change-policy-surface.test.mjs:436) | minor | open | claude-opus |
