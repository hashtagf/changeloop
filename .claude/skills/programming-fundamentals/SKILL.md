---
name: programming-fundamentals
description: "Use for nontrivial logic inside one process: modeling types and state, data structures, error paths, module boundaries, abstraction depth ('design this module', 'ออกแบบโมดูล'). Skip trivial or generated code, cross-service design (architecture-fundamentals), and behavior-preserving restructuring (refactoring-fundamentals)."
---

# Programming fundamentals

Model the data first; make illegal states unrepresentable; keep decisions pure
and effects at the edge.

## Steps

1. Model inputs, outputs, and state transitions before operations. Prefer the
   most constrained useful type; brand primitives only where needed.
2. Make illegal states unrepresentable with enums, variants, wrappers, and
   validated constructors; enforce each invariant once, at the boundary.
3. Design deep, cohesive modules: a small interface hiding meaningful
   complexity. One reason to change per function; extract policy, not line
   counts or pass-through layers.
4. Keep decision logic pure; isolate I/O, clocks, randomness, network, and
   storage at the edge so the core runs without infrastructure.
5. Represent expected failure explicitly: add context at boundaries, never
   swallow or double-log, keep error and cancellation paths tested.
6. Choose data structures from expected scale; measure before optimizing. Name
   by domain meaning and effect.

## Harness

With OpenSpec/Change Loop: record only durable behavior or module-boundary decisions in the change; providers prove it; Build never stages or commits.
Otherwise: keep detail in code and tests; CI or test output is proof.
No parallel design ledger; this grants no commit authority.

## References

- `references/module-design.md` — module boundaries, abstraction depth, cohesion, skip signals
- `references/details.md` — data modeling and the pure core / effectful shell
- `references/error-handling.md` — the three error buckets and where to handle each
- `references/complexity.md` — accidentally quadratic patterns, when to optimize
- `references/naming.md` — naming by meaning and effect
- `../testing-fundamentals/references/test-design.md` — optional, if installed: what to test and how
