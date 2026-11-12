# Benchmarks

The benchmark for the current runtime lives in
[`openspec-native/`](openspec-native/README.md): scenario matrix, disposable
consumer lab, runner, oracles, scorecards, and the zero-cost release sentinel.

| Path | Contents |
|---|---|
| `openspec-native/` | Runner, lab, oracles, scorecards, sentinel, and release report |
| `config/` | Scenario matrix, scorecard schema, targets, and rollout policy |
| `tasks/` | Frozen workload fixtures (seed, oracle, acceptance) per scenario |
| `tests/` | Deterministic tests for the above; registered in `run-all.sh` |
| `rationale.md` | Historical record of measured and rejected cost optimizations |

Deterministic checks run in the normal gate (`openspec native benchmark`); the
release-only `openspec native sentinel` runs under `run-all.sh --release` and
when `--affected` selects it for benchmark edits. Paid scenario runs are a separate, explicitly
authorized release activity; see [RELEASING.md](../../../RELEASING.md).

The earlier phase-orchestrator runner (`run-bench.sh` and its grading
scripts) targeted the retired `.workflow/` flow and was removed in 3.7.
