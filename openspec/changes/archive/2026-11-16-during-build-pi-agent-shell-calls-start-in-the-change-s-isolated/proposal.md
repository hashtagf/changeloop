# Change: During Build, Pi agent shell calls start in the change's isolated workspace and Pi shows the phase guard's shell warnings to the agent, so relative shell writes land in the workspace instead of the main checkout; the benchmark scorecard records the Pi host.

- **Change:** `during-build-pi-agent-shell-calls-start-in-the-change-s-isolated` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## Why

In the paid notes-api comparison the Pi arm reached proven with 13/13 oracle cases but Land refused it: Pi starts every bash call in the project root, the agent wrote src/server.js there by shell, and the guard's warning about that write is dropped by the Pi adapter. Claude Code keeps the agent's cwd after the contract's single cd into the workspace and shows the warning. The Pi run's scorecard also said host claude-code.

## Scope

- **In scope:** Agent shell calls during Build run in the change workspace; The agent sees the guard's shell warnings; A Pi run's scorecard names the Pi host
- **Out of scope:** edits outside `.claude/harness/adapters/pi-extension.mjs`, `.claude/harness/tests/pi-extension.test.mjs`, `.claude/harness/README.md`, `CHANGELOG.md`, `.claude/tests/bench/openspec-native/run.mjs`, `.claude/tests/bench/openspec-native/lab.mjs`, … +1 more

## Work type

bugfix

## Capabilities

| Capability | Requirements | Tasks |
|---|---|---|
| pi-host-adapter | build-shell-cwd, guard-warning-visible | T001 |
| scenario-benchmark-hosts | scorecard-host | T002 |

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| build-shell-cwd | Relative write lands in the workspace | unclassified | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | Outside Build nothing moves | unclassified | T001 |  |  |
|  | Worker inherits the coordinator's workspace | unclassified | T001 |  |  |
| guard-warning-visible | Shell write outside the workspace is reported | unclassified | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
| scorecard-host | Pi dry run names the host | unclassified | T002 | test: `.claude/tests/bench/openspec-native/run.mjs`, `.claude/tests/bench/openspec-native/lab.mjs`, `.claude/tests/bench/tests/openspec-native-lab.test.mjs` | — |

## Definition of done

- Fresh evidence for every claim (5).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
