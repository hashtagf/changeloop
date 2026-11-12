---
name: architecture-fundamentals
description: "Use when deciding how services, runtimes, or deployables split, talk, fail, or scale: monolith vs microservices, sync vs async, timeouts and retries, 'แยก service'. Skip single-process module design (programming-fundamentals) and domain meaning (ddd-strategic)."
---

# Architecture fundamentals

Draw the boundaries before the boxes; compare distinct designs when the
uncertainty is consequential.

## Steps

1. Split by cohesive ownership and rate of change, not technology or org chart.
   Settle business meaning first.
2. Give every durable fact exactly one write owner; others read through its
   contract, event stream, or projection.
3. Choose sync or async per interaction: synchronous only when the caller needs
   the result now. Default cross-boundary state to eventual consistency with a
   named staleness budget; confine strong consistency to one transaction.
4. Treat every cross-process call as fallible: latency budget, timeouts, bounded
   jittered retries, breakers/bulkheads, graceful degradation.
5. Make each critical path operable: structured events, correlation, an SLI, an
   owner, and a rollback path. Evolve contracts additively; version breaks and
   let old and new consumers overlap.
6. For each changed boundary record owner, callers, sync/async rationale,
   failure and consistency expectations, compatibility window, and rollback.

Deeper reading, if installed: `ddd-strategic` for meaning, `queue-fundamentals`
for async, `api-design-fundamentals` for contracts, `hexagonal-backend` inside
one service.

## Harness

With OpenSpec/Change Loop: record boundary decisions in the change design; providers prove behavior; Build never stages or commits.
Otherwise: record them in an ADR or the PR; integration and load-test output is proof.

## References

- `references/boundaries.md` — split, merge, extraction, anti-corruption layers
- `references/communication.md` — sync/async matrix, consistency, contract evolution
- `references/resilience.md` — timeouts, retries, breakers, load shedding, health checks
- `../observability-fundamentals/references/logs-metrics-traces.md` — optional, if installed: telemetry, SLOs, alerting
