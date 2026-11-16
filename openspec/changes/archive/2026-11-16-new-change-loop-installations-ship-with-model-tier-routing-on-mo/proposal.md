# Change: New Change Loop installations ship with model-tier routing on (models.routing true in the shipped foundation.json), while upgrades keep every existing project's effective routing setting, and the English and Thai configuration docs and the changelog describe the new default.

- **Change:** `new-change-loop-installations-ship-with-model-tier-routing-on-mo` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## Why

The owner chose to make model-tier routing the product default so tasks use haiku, sonnet or opus by kind and risk, matching the agent-team roles. The installer's upgrade merge used jq //=, which treats an explicit false as missing, so shipping true would silently flip projects that chose false; projects without the key ran with routing off and must keep that behavior.

## Scope

- **In scope (`model-tier-routing-default`):** A new installation routes tasks across model tiers; Upgrades never change an existing project's routing behavior; Docs and changelog state the new default
- **Out of scope:** edits outside `install.sh`, `foundation.json`, `.claude/tests/harness/run-upgrade-compat-tests.sh`, `.claude/tests/harness/run-context-budget-tests.sh`, `CHANGELOG.md`, `website/docs/src/content/docs/foundation-config.md`, … +1 more

## Impact and risk

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| ship-routing-on | Fresh install | unclassified | T001 | test: `.claude/tests/harness/run-upgrade-compat-tests.sh`, `.claude/tests/harness/run-context-budget-tests.sh` | — |
| upgrade-keeps-routing | Explicit false survives | unclassified | T001 | test: `.claude/tests/harness/run-upgrade-compat-tests.sh`, `.claude/tests/harness/run-context-budget-tests.sh` | — |
|  | Missing key stays off | unclassified | T001 |  |  |
|  | Explicit true survives | unclassified | T001 |  |  |
| docs-default | Docs agree | unclassified | T002 | test | — |

## Definition of done

- Fresh evidence for every claim (5).
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Derived by the harness

- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for ship-routing-on, upgrade-keeps-routing, docs-default.

## Appendix: Review record

| Round | Finding | Severity | Fix | Reviewer |
|---|---|---|---|---|
| 1 | f-test-placement: The new `optout` and `fresh` blocks are inserted between the `optin` routing assertion and the `optin` quality-gate assertion (line 75). The 'consumer quality gate survives upgrade' check now reads as if it follows the fresh-install block, though it still reads `$optin`. Moving the new blocks after line 76 would keep the `optin` assertions together. It is not blocking. (root/.claude/tests/harness/run-upgrade-compat-tests.sh:69) | minor | open | claude-opus |
