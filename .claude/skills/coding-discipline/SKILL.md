---
name: coding-discipline
description: "Use before coding a fix or feature whose scope, assumptions, or size is unclear: keep the diff minimal, avoid over-building or bundled cleanup, fix causes not symptoms, verify done. Skip unknown-cause bugs (debug-fundamentals) and behavior-preserving restructuring (refactoring-fundamentals)."
---

# Coding discipline

Make the smallest change that fixes the cause and provably meets the request.

## Steps

1. Treat the request's premise as a hypothesis. Surface assumptions that change
   behavior, compatibility, security, persistence, scope, or an irreversible
   effect; check repository facts first; ask only for a consequential choice.
2. Cover the whole requirement with the least code: none, standard library,
   platform, installed dependency, then minimal new code. Never drop required
   safety, correctness, accessibility, or evidence. Validate inputs before
   irreversible effects.
3. Reproduce, trace back to the first wrong state, fix it there, and pin it with
   a regression test. A guard or retry hiding an illegitimate state is not a
   fix; a specified fallback is.
4. Trace every changed line to the request. A behavior-preserving preparatory
   refactor is in scope as its own slice. Remove only
   debris you caused; record unrelated issues as follow-ups, unfixed.
5. Keep comments for non-obvious constraints and contracts. Prove a guard
   unnecessary before removing it.
6. State checkable outcomes. Verify each unit on the real artifact until
   evidence proves it or a blocker remains; never weaken a gate.

## Harness

With OpenSpec/Change Loop: the Change holds intent, decisions, follow-ups; `tasks.md` status; receipts proof.
Otherwise: the issue tracker or TODO holds follow-ups; CI or test output is proof.
"Goal-driven" grants no authority to widen scope, mutate external systems, commit, or Land.

## References

- `references/details.md` — rationale, root cause, preparatory refactoring, follow-up routing, verification, recurring corrections, levers.
- `references/cleanup.md` — removing residue after a change.
