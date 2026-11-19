# Phases, gates, and delivery

Every phase ends with a summary of what was made and what is still open, then
stops for the user's CONFIRM. Silence is not a confirmation. A requested edit
reopens the phase; a token or component edit always goes to the design system
first (see `design-system.md` "Versioning").

## Contents

- Phase 0 — Brief
- Phase 1 — uxui.md
- Phase 2 — Design system
- Phase 3 — First artifact
- Phase 4 — Remaining artifacts
- Phase 5 — Delivery
- Change Loop handoff

## Phase 0 — Brief

Ask all at once; build nothing until answered:

- Product, primary users, the problem, the business goal.
- Work type: landing / marketing pages, back office, web app, other (several allowed).
- Landing: how many pages and the goal of each. Back office: features, which
  first, roles and what each may do.
- Real user data (research, analytics, feedback) — ask for the files.
- Breakpoints with widths (default desktop 1440, tablet 768, mobile 390).
- Style: mood and tone, brand colours, Thai and Latin fonts, light/dark;
  analyse any reference image or URL and say what you take from it.
- Screen language: Thai, English, both.
- Constraints: framework, an existing design system to follow.

Missing information is asked, not guessed. Only persona and journey items may
be assumed, and each carries `[Assumption]`.

## Phase 1 — uxui.md

Write `uxui.md` with the sections in `uxui-template.md` for the work type
(both sets when the project has both). Design Rules, Artifact Index, and
Changelog start empty. Use `ux-ui-principles` for the content: experience
architecture, content design, accessibility. CONFIRM.

## Phase 2 — Design system

Build `design-system.html` per `design-system.md`. CONFIRM. Then, in the
same turn: fill uxui.md Design Rules (colour, type, spacing, grid, which
component when, Do / Don't, the design system version in use), add
`Design System v1.0` to the Changelog and the Artifact Index.

## Phase 3 — First artifact

The most important page: the landing hero plus one or two sections, or the
main screen of the first back-office feature. It is the start of a final
artifact, never a separate file: the landing file grows in Phase 4; the
back-office screen becomes part of its feature's artifact. Use the Token
Block only, the Phase 0 breakpoints, the uxui.md microcopy, and realistic Thai
mock data with edge cases: very long text, ฿1,250,000.00, no data, many pages.
End with a Design QA section. CONFIRM.

## Phase 4 — Remaining artifacts

- Landing / marketing: complete the Phase 3 file with every section and every
  marketing page (switched by navigation or tabs). One artifact in total.
- Back office / web app: one artifact per feature with a page and state
  switcher covering list, detail, create/edit, empty, loading, error, success,
  and permission denied. CONFIRM after each feature.
- A component missing from the design system: say so first, add it there with
  a new version, record it in the Changelog, then use it.
- After each feature: update the Screen Inventory status and Artifact Index.

## Phase 5 — Delivery

1. Sync uxui.md with the files: every Screen Inventory row done, Design
   Rules, Artifact Index, Changelog, remaining Open Questions.
2. Every artifact's Token Block equals the design system's current one.
3. Every component an artifact uses exists in the design system.
4. List the delivered files: uxui.md, design-system.html (vX.Y), artifacts.

`scripts/uxui-check.mjs` checks 1–3 mechanically; a clean run is required
before the final CONFIRM.

## Change Loop handoff

An approved artifact is the design reference for implementation: the change
draft names it in `prototypeSelection` (with `excludes` for anything the
agreement rejects), names `uxui.md` in `productHandoff` so every Screen
Inventory state must appear in the change's `uiStates`, declares work type
`ui`, and wires screenshots so the `visual` check compares the built UI with it. uxui.md counts as the project's
design document in `cloop quality readiness`.
