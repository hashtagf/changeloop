---
name: prd
description: "Use when a product requirement document must be written or revised as PRD.md plus prd.html: goal, stories, acceptance, rules, flows, NFR, ADR, scope, data, errors, open questions (เขียน PRD). Skip grooming a PRD into tasks (grill-task-gu)."
---

# Write a PRD

The PRD states the product agreement before any change; it never replaces the
OpenSpec packet a change compiles from it.

## Steps

1. Ask the brief questions in `references/prd-template.md` §0 that sources
   cannot answer; read every reference, prototype, and existing product the
   user names, and cite what you observed.
2. Write `PRD.md` with the 18 sections in template order. Label every fact
   `[Data]` (observed, with source), `[Assumption]`, or `[Decision]`; never
   state an assumption as fact. Give stories, criteria, rules, features, and
   ADRs stable IDs and cross-reference them.
3. Put each unanswered material choice in Open Questions with who must answer;
   ask the user only the ones that change scope or an ADR, together.
4. Run `node <skill>/scripts/prd-check.mjs PRD.md`; fix every finding.
5. Run `node <skill>/scripts/prd-html.mjs PRD.md` for `prd.html`; open it and
   confirm the diagrams render.
6. Report the version, open questions, and assumptions awaiting review; stop
   for review before the next version.

## Harness

Writes only PRD.md and prd.html where the user asks; never starts a change.
An approved PRD goes to `grill-task-gu`, then `/feature` or `/change`, whose draft
names it in `productHandoff` so nothing in scope is dropped.

## References

- `references/prd-template.md` — the 18 sections, what each must hold, and the
  brief questions.
