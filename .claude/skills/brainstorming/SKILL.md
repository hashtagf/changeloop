---
name: brainstorming
description: "Use when the outcome or approach is still open and the user must choose between real alternatives before building: 'what should we build', 'which approach', 'ควรทำ A หรือ B', compare options' trade-offs. Skip settled work and how/why questions (investigate)."
---

# Brainstorming

Facts come from sources; choices come from the user.

## Steps

1. Read the existing specs or docs and only the code needed to understand the seam.
   Separate verified facts, hypotheses, constraints, and unknowns.
2. Never ask what you can find. Challenge fuzzy or conflicting project terms
   against specifications and code; ask only when more than one material
   domain meaning remains.
3. Model open decisions as a private dependency tree (prerequisites,
   alternatives, dependent effects); never persist it as an
   artifact or lifecycle state.
4. Offer at most three approaches and recommend one with concrete tradeoffs.
   Ask only what materially changes behavior, compatibility, security,
   persistence, scope, or an observable non-functional target
   (performance, capacity, availability, privacy, accessibility).
5. Ask in rounds, not one at a time: every open decision whose
   prerequisites are already settled, through the host's
   structured question tool (AskUserQuestion; else plain text),
   recommendation first. Recompute from the answers; stop only when
   every material decision has been asked and answered.
6. End with a compact agreement: outcome, in/out, scenarios, chosen approach,
   remaining risk, canonical terms, and
   each asked question with its chosen answer. Hand it to the next step, reuse
   the settled answers without asking them again, and record them in the
   change agreement or design doc, not chat.

## Harness

No product code lands here; prototypes are evidence; no interview ledger.
With OpenSpec/Change Loop: hand off to `/change`; the harness owns lifecycle and receipts.
Otherwise: record the agreement in the design doc or issue.

## References

None.
