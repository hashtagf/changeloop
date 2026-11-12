---
name: ux-ui-principles
description: "Use when designing or reviewing user flows, hierarchy, forms, navigation, UI states, accessibility, or responsive layout, or when users find a screen confusing (ใช้งานยาก, UX). Skip visual styling (frontend-design), tokens (tailwind-design-system), style/palette search (ui-ux-pro-max)."
---

# UX/UI principles

Resolve experience decisions from the user's task, observed evidence, and
product constraints; preserve working conventions and disclose unverified checks.

## Steps

1. Establish the actor, outcome, devices, language, permissions, and failure
   consequence from supplied artifacts; ask only for choices that change the
   decision.
2. Pick the mode (research, design, audit, improve) in
   `references/experience-workflow.md` and load only the matching topic guide.
3. Map entry → understand → act → feedback → recover → finish. Specify the
   loading, empty, error, denied, and partial states, keyboard/focus, and
   responsive behavior that apply.
4. Tie each finding to a location/state, user consequence, repair, and
   observable check; fix blocked access and lost work before polish.
5. State what was verified and what was not; a screenshot does not prove
   keyboard, persistence, or accessibility behavior.

## Harness

With OpenSpec/Change Loop: record choices in the compiled agreement per `references/change-loop-handoff.md`.
Otherwise: the issue or design doc holds decisions; a UX report is not proof.
This skill grants no execution, Git, or delivery authority.

## References

- `references/experience-workflow.md` — modes and selective topic guides.
- `references/change-loop-handoff.md` — working contract and handoffs.
- `references/upstream.md` — source snapshot and adaptations.
- Optional, if available: `frontend-design` for settled visuals,
  `tailwind-design-system` for tokens, `ui-ux-pro-max` for searchable design data.
