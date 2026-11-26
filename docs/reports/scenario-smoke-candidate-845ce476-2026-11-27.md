# Scenario smoke: v3.7.9 candidate `845ce476` (2026-11-27)

**Scope:** the ten paid lanes recorded for v3.7.8, run once each on the
release candidate. This is a smoke check (n=1), not a repeated-assurance or
speedup claim. Raw run bundles stay outside Git under
`.claude/tests/bench/results/egm-845ce476-cc/`.

| Item | Value |
|---|---|
| Candidate | `845ce4769aaa54370e7b9b06e04d31d64db7ae36` (clean `main`, CI `--full` green, run 45854542824) |
| Host / model | Claude Code 2.1.332, `claude-sonnet-5-5` |
| Toolchain | Node v26.11.1, macOS arm64 |
| Concurrency | one lane at a time |
| Budget | US$3 authorized for the last five lanes (US$0.60 cap per lane); the first five ran under the earlier paid-e2e authorization |
| Lane records | [`benchmarks/3.7.9.json`](benchmarks/3.7.9.json), compared with [`benchmarks/3.7.8.json`](benchmarks/3.7.8.json) |

## Result

All ten lanes reached `archived` with a passing pre-Land oracle.

| | 3.7.8 | 3.7.9 candidate | change |
|---|---|---|---|
| Passed (archived, oracle pass) | 10/10 | 10/10 | |
| Wall time | 17.0 min | 16.4 min | −4% |
| Cost | US$3.80 | US$3.86 | +2% |
| Model requests | 94 | 102 | +9% |

| Lane | 3.7.8 | 3.7.9 candidate |
|---|---|---|
| bare-node-boundary | 6/6 · 0.70 min · $0.303 | 6/6 · 0.72 min · $0.251 |
| cart-coupons | 11/11 · 1.84 min · $0.489 | 11/11 · 1.30 min · $0.426 |
| database-migration-rollback | 6/6 · 1.25 min · $0.293 | 6/6 · 1.33 min · $0.314 |
| multi-service-event-flow | 6/6 · 1.27 min · $0.299 | 6/6 · 1.54 min · $0.339 |
| notes-api | 13/13 · 2.46 min · $0.440 | 13/13 · 2.22 min · $0.480 |
| project-tracker-api | 33/33 · 6.33 min · $0.811 | 33/33 · 6.42 min · $0.847 |
| python-api-validation | 5/5 · 0.94 min · $0.291 | 5/5 · 0.89 min · $0.313 |
| refactor-no-reproduction | 6/6 · 0.82 min · $0.315 | 6/6 · 0.63 min · $0.313 |
| tiny-feature | 8/8 · 0.87 min · $0.288 | 8/8 · 0.81 min · $0.293 |
| typescript-react-state | 6/6 · 0.54 min · $0.267 | 6/6 · 0.56 min · $0.283 |

Time and cost differences per lane are within the noise of a single run.

## Findings fixed before this candidate

Earlier paid runs of this cycle (Pi and Claude Code, same model) found the
following; each fix has a deterministic regression and is in the changelog.

- `cart-coupons` stopped before Land: product files written during Change were
  deleted in Build. Build's first action now names them
  (`change-phase-target-edits`).
- `refactor-no-reproduction` stopped at spec approval on Pi; paid lanes now
  approve the compiled spec explicitly (`benchmark:spec-approval`).
- `project-tracker-api`: a test helper file triggered a false test-discrimination
  repair; `node --test` runs that left a keep-alive connection open waited out
  the ten-minute cap; the runner reported a pre-repair oracle; and the oracle
  required 15 tests that the task never states. Before these fixes one run took
  56 minutes.

## Not covered

- One run per lane; no repeated assurance.
- The 21 other lanes in the benchmark matrix have no 3.7.8 record and were not run.
- No production or dogfood evidence.
