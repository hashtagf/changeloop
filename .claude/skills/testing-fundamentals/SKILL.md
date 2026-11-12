---
name: testing-fundamentals
description: "Use when a requirement or scenario needs tests: write failing-first tests, pick unit/integration/e2e level and mocks, fix flaky or hollow tests, read coverage. Skip docs, renames, and unknown-cause bugs (debug-fundamentals)."
---

# Testing fundamentals

A red test must fail for the predicted behavior, not a setup error; exercise
the real user path.

## Steps

1. Map each scenario to one test that asserts observable behavior: return
   value, persisted state, emitted contract, or error, not call order or shape.
2. Pick the cheapest level that proves the claim: unit for local decisions,
   integration for real boundaries, contract tests between independently
   evolving components, a few e2e tests for critical journeys.
3. Cover the contract, boundaries, failure paths, concurrency where relevant,
   and every shipped bug. Skip framework behavior and trivial accessors.
4. Double only at a real seam when the collaborator is slow, costly,
   nondeterministic, or out of scope; use the real DB/protocol in the focused
   integration test that claims that boundary.
5. Keep tests isolated and deterministic: own state, inject time/randomness/IDs,
   no sleeps or order dependence, one behavioral reason to fail.
6. Confirm the test fails for the intended reason on the old behavior and stays
   green through a behavior-preserving refactor. Use coverage to find untested
   critical branches, never as a target.

## Harness

With OpenSpec/Change Loop: claims define what must be true; harness receipts are proof; no parallel test plan; Build never stages or commits.
Otherwise: acceptance criteria define claims; the test run or CI output is proof.
Never claim completion by hand.

## References

- `references/test-design.md` — cases, assertions, two-edit test.
- `references/test-doubles-and-levels.md` — choosing level and seam.
- `references/coverage.md` — reading coverage.
- `references/verification-drivers.md` — executable surface checks.
