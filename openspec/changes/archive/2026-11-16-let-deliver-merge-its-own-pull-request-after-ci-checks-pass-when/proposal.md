# Change: Let /deliver merge its own pull request after CI checks pass when the project opts in with deliver.merge, so one Deliver invocation reaches a merged change.

- **Change:** `let-deliver-merge-its-own-pull-request-after-ci-checks-pass-when` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-15

## Why

Today /deliver stops at an open pull request and the user must merge by hand, while the owner's workflow expects deliver to cover PR and merge. Merging changes the default branch for every user of the repository, so it must be an explicit project opt-in, bound to the exact delivered commit, gated on passing checks, and never bypass branch protection.

## Scope

- **In scope (`deliver-merge`):** Deliver never merges unless the project opted in; An opted-in Deliver merges the exact delivered commit after every check passes; Deliver never merges on pending, failing, missing checks, a draft PR, or blocked branch protection; Multi-repository deliveries keep stopping at open pull requests
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/delivery-merge.mjs`, `.claude/harness/runtime/workflow/pull-request-runtime.mjs`, `.claude/harness/tests/pull-request-runtime.test.mjs`, `.claude/commands/deliver.md`, `README.md`, `README.th.md`, … +5 more; the authored Non-goals below

## Non-goals

- Tagging or releasing after merge (a separate follow-up change).
- Merging multi-repository deliveries.
- Bypassing branch protection or required reviews (no --admin).

## Impact and risk

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## Communication, support, and release note

### Release note

Deliver can now merge its pull request after CI passes: set deliver.merge to after-checks in foundation.json. Without it Deliver still stops at the open pull request.

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| merge-is-opt-in | No merge policy keeps the PR open | success | T001, T002 | test: `.claude/harness/tests/pull-request-runtime.test.mjs` | — |
|  | Unknown merge policy is refused | failure | T001, T002 |  |  |
| merge-after-green-checks | Green checks merge the pull request | success | T001, T002 | test: `.claude/harness/tests/pull-request-runtime.test.mjs` | — |
|  | Repeated Deliver does not merge twice | boundary | T001, T002 |  |  |
| merge-stops-safely | Pending checks wait | boundary | T001 | test: `.claude/harness/tests/pull-request-runtime.test.mjs` | — |
|  | Failing checks stop | failure | T001 |  |  |
|  | No reported checks stop | failure | T001 |  |  |
|  | Branch protection refusal waits | failure | T001 |  |  |
|  | Draft pull request is not merged | failure | T001 |  |  |
| merge-single-repository | Multi-repository delivery is not merged | boundary | T001 | test: `.claude/harness/tests/pull-request-runtime.test.mjs` | — |

## Definition of done

- Fresh evidence for every claim (10).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Derived by the harness

- **Failure matrix:** read from the failure scenarios (5); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for merge-is-opt-in, merge-after-green-checks, merge-stops-safely, merge-single-repository.

## Appendix: Review record

| Round | Finding | Severity | Fix | Reviewer |
|---|---|---|---|---|
| 1 | f1: The reuse path (`priorReceipt` plus merge enabled) calls `mergeDelivered` directly. It skips `assertProviderBinding(delivery.provider, provider)` and the `verifyPullRequest` and follow-up successor checks that the non-merge reuse path runs through `reusedPullRequests`. `mergeStage` still binds the merge to `receipt.commit` and the read-back head, so no unsafe merge results. The two reuse paths do drift in how strictly they verify. (root/.claude/harness/runtime/workflow/pull-request-runtime.mjs:1308) | minor | open | claude-opus |
| 1 | f2: `requestDelivery` still persists `authority.forbidden` with "merge" in the delivery state. With `deliver.merge: after-checks` that recorded authority contradicts what Deliver then does. Nothing reads it for enforcement, so this is only a record inconsistency. (root/.claude/harness/runtime/workflow/pull-request-runtime.mjs:1025) | minor | open | claude-opus |
| 1 | f3: When the PR is already `MERGED`, `mergeStage` records it without checking that the merged head matches the delivered commit. The prior-receipt path is the only guard against an unrelated merge. The risk is low and it is not in a scenario. (root/.claude/harness/runtime/workflow/delivery-merge.mjs:73) | minor | open | claude-opus |
| 1 | f4: The edited last line of `deliver.md` is a long single line that does not wrap like the surrounding prose. This is cosmetic. (root/.claude/commands/deliver.md:22) | minor | open | claude-opus |
