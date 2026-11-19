---
name: ux-design
description: "Use when a product's UX/UI must be designed end to end in confirmed phases: uxui.md, a versioned design-system HTML, and per-feature or landing HTML artifacts (ออกแบบ UX/UI ทั้งโปรเจกต์). Skip single UX questions, audits, or one-screen fixes (ux-ui-principles)."
---

# Design UX/UI in confirmed phases

`ux-ui-principles` owns what good UI is; this skill owns the order, the files,
and the gates. Each phase ends with a short summary and stops for the user's
CONFIRM.

## Steps

1. Phase 0: ask the brief in `references/phases.md`; build nothing before the answers.
2. Phase 1: write `uxui.md` from `references/uxui-template.md`; label persona
   and journey items `[Data]` or `[Assumption]`. CONFIRM.
3. Phase 2: build `design-system.html` per `references/design-system.md`
   (every base component, states, snippets, Token Block v1.0). CONFIRM, then
   fill Design Rules, Changelog, and Artifact Index.
4. Phase 3: one key page as the first artifact. CONFIRM.
5. Phase 4: remaining artifacts (back office: one per feature, CONFIRM each;
   landing: extend the one file). Token or component changes go to the design
   system first with a new version and a Changelog row.
6. After each artifact run `node <skill>/scripts/uxui-check.mjs <dir>` and fix
   every finding; Phase 5 ends with a clean run and CONFIRM.

## Harness

Writes design files only; an approved artifact enters Change as `prototypeSelection`.
Building product code is Change Loop's Build, never this skill.

## References

- `references/phases.md` — brief, phase outputs, gates, delivery.
- `references/uxui-template.md` — uxui.md sections for back office and landing.
- `references/design-system.md` — tokens, components, Token Block, Design QA.
