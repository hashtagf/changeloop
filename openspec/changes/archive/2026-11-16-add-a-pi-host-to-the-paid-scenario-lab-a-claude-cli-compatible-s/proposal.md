# Change: Add a Pi host to the paid scenario lab: a Claude-CLI-compatible shim drives Pi over RPC and translates its events into the stream the runner already measures, and lab.mjs gains --host pi and --model so the same scenario runs on Claude Code and Pi with one pinned model.

- **Change:** `add-a-pi-host-to-the-paid-scenario-lab-a-claude-cli-compatible-s` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-15

## Why

The owner authorized one paid notes-api comparison of Change Loop on Claude Code, Change Loop on Pi, and the no-harness baseline-review arm. The runner only drives the Claude Code CLI, and Pi's JSON print mode exits before an extension command's turn runs, so a Pi arm needs an RPC driver that preserves the runner's terminal, budget, oracle and Land logic unchanged.

## Scope

- **In scope (`scenario-benchmark-hosts`):** Pi sessions produce the stream the runner measures; Cost and termination behave like the Claude CLI for the runner; The Pi arm uses an isolated agent directory and never rotates the operator's login; The lab runs a scenario on Pi with a pinned model
- **Out of scope:** edits outside `.claude/tests/bench/openspec-native/pi-host.mjs`, `.claude/tests/bench/tests/openspec-native-pi-host.test.mjs`, `.claude/tests/bench/tests/fixtures/fake-pi-rpc.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/bench/openspec-native/lab.mjs`, `.claude/tests/bench/tests/openspec-native-lab.test.mjs`, … +1 more

## Work type

test

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| Short-lived credential | the shim exits non-zero with an error result and starts no Pi process | No separate step; the outcome is the handling | pi-host-isolation |
| Baseline stays on Claude | the lab refuses the combination | No separate step; the outcome is the handling | lab-pi-host |

## Impact and risk

- **Impact:** low
- **Coupling:** isolated

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| pi-host-stream | Translated session | unclassified | T001 | test: `.claude/tests/bench/openspec-native/pi-host.mjs`, `.claude/tests/bench/tests/openspec-native-pi-host.test.mjs`, `.claude/tests/bench/tests/fixtures/fake-pi-rpc.mjs`, `.claude/tests/run-all.sh` | — |
|  | Extension command runs its turn | unclassified | T001 |  |  |
| pi-host-budget | Budget cap | unclassified | T001 | test: `.claude/tests/bench/openspec-native/pi-host.mjs`, `.claude/tests/bench/tests/openspec-native-pi-host.test.mjs`, `.claude/tests/bench/tests/fixtures/fake-pi-rpc.mjs`, `.claude/tests/run-all.sh` | — |
|  | Runner stop keeps cost | unclassified | T001 |  |  |
| pi-host-isolation | Short-lived credential | failure | T001 | test: `.claude/tests/bench/openspec-native/pi-host.mjs`, `.claude/tests/bench/tests/openspec-native-pi-host.test.mjs`, `.claude/tests/bench/tests/fixtures/fake-pi-rpc.mjs`, `.claude/tests/run-all.sh` | — |
|  | Isolated directory | unclassified | T001 |  |  |
| lab-pi-host | Baseline stays on Claude | failure | T002 | test: `.claude/tests/bench/openspec-native/lab.mjs`, `.claude/tests/bench/tests/openspec-native-lab.test.mjs` | — |
|  | Pi dry run | unclassified | T002 |  |  |

## Definition of done

- Fresh evidence for every claim (8).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
