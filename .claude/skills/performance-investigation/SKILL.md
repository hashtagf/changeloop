---
name: performance-investigation
description: "Use when something is slow (ช้า), latency or throughput regressed, memory grows or leaks toward OOM, or a speedup or benchmark claim must be proven. Skip functional bugs (debug-fundamentals) and telemetry design (observability-fundamentals)."
---

# Performance investigation

Measure before you believe; a number without its limiter is not a result.

## Steps

1. State the user-visible metric, workload, success/error counts, environment,
   versions, and whether the goal is diagnosis or an approved implementation.
2. Read the measurement code. Confirm real work and correct output happen inside
   the timed region; exclude no-ops, errors, and cache effects.
3. Capture comparable baselines: both sides tuned as deployed, at least five
   alternating runs per side, spread and noise recorded.
4. Profile separately from timing. Name the limiter from observed counters or
   profiles, tie it to source, and check physical limits and the end-to-end
   share of any microbenchmark gain.
5. Test one hypothesis at a time. Keep an improvement only when correctness
   holds and the gain exceeds uncertainty; otherwise report inconclusive.
6. Keep raw runs as evidence, not a status ledger.
   Never fabricate missing measurements, weaken a gate, or run paid workloads
   without explicit authority.

## Harness

With Change Loop: diagnose via `investigate`; approved repair stays in the returned Build workspace; harness receipts are proof; Build never stages or commits.
Otherwise: diagnose read-only first; the project's benchmark or profiler output, with raw runs, is proof.

## References

- `references/measurement.md` — portable observation, the claim sentence, "why not double?", report fields.
- `references/hillclimb.md` — bounded optimisation loop: stop predicate, harness freeze, attempt log, plateau pivot.
