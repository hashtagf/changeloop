# The benchmark counted zero requests before the terminal state on a loaded runner

| Field | Value |
|---|---|
| Id | 2026-11-17-terminal-watcher-counted-before-read |
| Detected | 2026-11-17, by CI on PR #12 and again on PR #13 (openspec native benchmark) |
| Affected versions | the benchmark runner only; no shipped runtime |
| Severity | minor (see [REVIEW.md](../../REVIEW.md#severity)) |
| Status | closed |
| Decision | Read pending host output before counting; reproduce the stall in the test |
| Fix change | none (repository maintenance, PR #13) |
| Regression | `.claude/tests/bench/tests/openspec-native-cost.test.mjs` (stalls the event loop past the terminal write) |

## Symptom

`requests count up to the terminal state: null !== 1` on CI only.

## Evidence

Locally the test failed every time once the event loop was stalled for 1.5s;
it passed with the fix three times in a row.

## Cause

Timers run before I/O in an event-loop turn: after a stalled turn the terminal
watcher saw `archived` before the host's earlier output was read. PR #12
widened the test's sleep, which treated the symptom.

## Resolution

PR #13 records the count in `setImmediate` and makes the test stall the loop
deliberately. Lesson added to [lessons.md](../lessons.md).
