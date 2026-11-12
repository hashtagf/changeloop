---
name: ddd-strategic
description: "Use when business terms, bounded contexts, aggregates, or who owns a model are unclear: one word means two things, event storming, splitting a domain, aggregate too big. Skip generic CRUD, settled single-context code, and runtime splits (architecture-fundamentals)."
---

# Strategic DDD

Settle what a concept means and where that meaning is valid before deciding
runtimes.

## Steps

1. Classify each subdomain as core, supporting, or generic. Invest custom
   design in differentiation; buy, borrow, or keep it pragmatic elsewhere.
2. Discover boundaries from real workflows, events, actors, policies, and
   language shifts — not from a noun list or existing tables.
3. Keep one ubiquitous language per bounded context. When one word carries two
   meanings, record two concepts.
4. Name each context relationship: Shared Kernel, Customer/Supplier,
   Conformist, Anticorruption Layer, Open Host Service, Published Language, or
   Separate Ways.
5. Size aggregates around invariants that must change atomically; keep them
   small, reference others by identity, coordinate across aggregates eventually.
6. Keep internal domain events rich and private; translate cross-context
   integration events into narrow, versioned contracts at the boundary.

Capture only what resolves the active decision: changed terms, the changed
context map, the invariant behind each aggregate boundary, and event ownership.
Deeper reading, if installed: `programming-fundamentals` (value objects),
`hexagonal-backend` (inside one context), `architecture-fundamentals` (runtimes).

## Harness

With OpenSpec/Change Loop: changed vocabulary and boundary decisions go in the change design, not a standalone glossary or ADR store; providers prove behavior; Build never stages or commits.
Otherwise: use the project's glossary or ADR; tests are proof.

## References

- `references/subdomain-classification.md` — core/supporting/generic and investment
- `references/event-storming.md` — event-first boundary discovery
- `references/bounded-contexts.md` — language, context maps, relationship patterns
- `references/aggregate-design.md` — aggregate sizing, invariants, events
- `references/failure-modes.md` — diagnostics when the model is going wrong
