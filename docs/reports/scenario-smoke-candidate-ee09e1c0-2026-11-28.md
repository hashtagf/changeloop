# Scenario smoke: v3.7.10 candidate `ee09e1c0` (2026-11-28)

**Scope:** the ten paid lanes recorded for v3.7.9, run once each on the
release candidate. This is a smoke check (n=1), not a repeated-assurance or
speedup claim. Raw run bundles stay outside Git under
`.claude/tests/bench/results/egm-ee09e1c0-cc/`.

| Item | Value |
|---|---|
| Candidate | `ee09e1c01ef104aa4d0db01beb8ab5400787f93a` (clean `main`, CI `--full` green, run 46116419117) |
| Host / model | Claude Code 2.1.332, `claude-sonnet-5-5` (matrix default) |
| Toolchain | Node v26.11.1, macOS arm64 |
| Concurrency | one lane at a time |
| Budget | US$10 authorized by the owner for the whole smoke; per-lane cost cap US$0.90 (US$1.50 for `project-tracker-api`) |
| Lane records | [`benchmarks/3.7.10.json`](benchmarks/3.7.10.json), compared with [`benchmarks/3.7.9.json`](benchmarks/3.7.9.json) |

## Result

All ten lanes reached `archived` with a passing pre-Land oracle.

| | 3.7.9 | 3.7.10 candidate | change |
|---|---|---|---|
| Passed (archived, oracle pass) | 10/10 | 10/10 | |
| Wall time | 16.4 min | 17.0 min | +4% |
| Cost | US$3.86 | US$3.77 | −2% |
| Model requests | 102 | 91 | −11% |

| Lane | 3.7.9 | 3.7.10 candidate |
|---|---|---|
| bare-node-boundary | 6/6 · 0.72 min · $0.251 | 6/6 · 0.83 min · $0.288 |
| cart-coupons | 11/11 · 1.30 min · $0.426 | 11/11 · 1.34 min · $0.447 |
| database-migration-rollback | 6/6 · 1.33 min · $0.314 | 6/6 · 1.15 min · $0.312 |
| multi-service-event-flow | 6/6 · 1.54 min · $0.339 | 6/6 · 1.27 min · $0.261 |
| notes-api | 13/13 · 2.22 min · $0.480 | 13/13 · 2.61 min · $0.480 |
| project-tracker-api | 33/33 · 6.42 min · $0.847 | 33/33 · 7.44 min · $0.927 |
| python-api-validation | 5/5 · 0.89 min · $0.313 | 5/5 · 0.76 min · $0.232 |
| refactor-no-reproduction | 6/6 · 0.63 min · $0.313 | 6/6 · 0.50 min · $0.270 |
| tiny-feature | 8/8 · 0.81 min · $0.293 | 8/8 · 0.58 min · $0.280 |
| typescript-react-state | 6/6 · 0.56 min · $0.283 | 6/6 · 0.52 min · $0.273 |

Time and cost differences per lane are within the noise of a single run.

## What this candidate changes

Since v3.7.9: tsx and node test runs end when their tests do and a run that
waits after its tests is named; quality lanes can declare `paths` and are
skipped when untouched; a provider that timed out on unchanged content is not
rerun; toolchain packs (Flutter, Gradle, Maven, Rust, Ruby, Terraform, Helm,
Dockerfile, Kubernetes, project packs); per-module lanes for monorepos;
"no tests" told apart from "tests not found"; a passing review wave the code
moved past does not consume the review cap; a finding outside the review
scope is repairable; the onboard fast-checks guide; and a sandbox backup fix.
None of the ten lanes stopped for a user decision.

## Not covered

- One run per lane; no repeated assurance.
- The ten lanes use small single-repository seeds: monorepo module lanes,
  toolchain packs for other languages, and slow-lane guidance are not exercised
  by this smoke and have deterministic coverage only.
- No production or dogfood evidence.
