---
name: grill-task-gu
description: "Use when grooming an approved PRD into one source-grounded Decision Sheet and an ordered task backlog with coverage (แตก task จาก PRD). Skip open product ideas (brainstorming), implementation, and compiled-spec approval."
---

# Grill Task Gu

`full discovery → one Decision Sheet → backlog + coverage → handoff`; never
implement or run a one-question interview.

## Steps

1. Read `references/intake-contract.md`, the PRD, and the backlog; read critical
   files end to end along the production path.
2. Reuse locked decisions; never re-ask them.
   Discoverable facts come from sources; only product/scope/risk choices are material.
3. Challenge fuzzy or conflicting terms against
   specifications and code; settle factual conflicts from source;
   only a remaining semantic choice goes on the sheet as one canonical term.
4. Model remaining choices as a private dependency tree; settle source-owned
   prerequisites yourself.
5. Present one Decision Sheet: every material choice, defaults, alternatives,
   effects, groups, risk tier, critical tests, blockers. When one choice changes
   another, show the prerequisite and every conditional effect in this same
   sheet; do not defer known choices to a later question round.
   Assignee and date are non-blocking unless `--schedule` is present.
   Ask for approval or all overrides together; do not ask to approve the same PRD
   choices again. This approves intake choices, not a compiled OpenSpec packet.
   With Change Loop, Change still requires explicit compiled-spec approval before Build.
6. Write `docs/backlog/{service}/{PRD-ID}.md`: stable task IDs, locked
   decisions, acyclic groups, two-way coverage; name the ready group.

## Harness

With OpenSpec/Change Loop: New material gaps follow Change intake; terms go in `design.md`.
Otherwise: gaps go to the PRD owner; terms to the backlog.
No implementation, Land, or Git mutation.

## References

- `references/intake-contract.md` — read set, rules, backlog fields.
