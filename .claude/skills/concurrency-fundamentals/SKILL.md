---
name: concurrency-fundamentals
description: "Use when threads, async tasks, goroutines, locks, shared mutable state, cancellation, or races affect correctness inside one process: deadlock, flaky race, 'runs twice', unbounded Promise.all. Skip cross-process queues (queue-fundamentals) and database isolation (database-fundamentals)."
---

# Concurrency fundamentals

The easiest race is the one you designed out; correctness must not depend on
timing.

## Steps

1. Avoid shared mutable state first: immutability, ownership confinement, or
   message passing.
2. Where sharing is unavoidable, make each read-modify-write one atomic
   operation with the narrowest lock, atomic, CAS, or version check.
3. Prevent deadlock structurally: fixed lock order, minimal scope, no nested
   locks, never hold a lock across unowned I/O.
4. Treat `async`/`await` as concurrency: await or supervise every task, choose
   sequential versus parallel explicitly, keep CPU work off the event loop.
5. Propagate cancellation and deadlines; release resources and define how
   partial effects unwind. Ask of every operation: what if it runs twice,
   crashed halfway, or overlaps another run?
6. Bound in-flight work to the real bottleneck (semaphore, pool, backpressure),
   then prove with deterministic interleaving tests, stress tests, or a race
   detector — never sleeps.

A PID alone cannot prove a lock stale.

## Harness

With OpenSpec/Change Loop: record material invariants and failure expectations in the change; test/race-detector providers prove them; harness scheduling is not application concurrency; Build never stages or commits.
Otherwise: note invariants in code or the PR; race-detector and stress-test output is proof.
No parallel ledger; this skill grants no commit authority.

## References

- `references/shared-state-and-async.md` — lock/atomic/CAS selection, deadlock recipes, async pitfalls, bounded patterns, idempotency and crash questions
