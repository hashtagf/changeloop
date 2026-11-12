# UI/UX design-intelligence workflow

Use this when the task needs a searchable product/style/palette direction.
Use `ux-ui-principles` (if installed) for the underlying experience decision or usability review;
do not load the catalog merely because a task touches a user interface.

Catalog rules are design candidates and dated guidance, not universal standards.
Preserve product constraints and recheck primary sources before consequential
numeric or conformance claims. Assess suggestions that affect the task against
observed behavior and cited sources, not catalog authority (deeper reading, if
installed: `ux-ui-principles`).

## Workflow

1. Identify product type, audience, primary jobs, platforms, content density,
   brand constraints, and critical states.
2. Inspect the existing rendered experience and code/tokens when present. Label
   facts, assumptions, and unknowns.
3. Establish direction: hierarchy, navigation, interaction model, responsive
   behavior, typography/color roles, and accessibility requirements.
4. For reviews, prioritize findings by user impact and support each with an
   observable example. Recommend one coherent replacement direction rather than
   isolated cosmetic tweaks.
5. Validate critical flows at small/large viewports, keyboard/touch, reduced
   motion, zoom/dynamic type, loading/empty/error states, and light/dark themes
   where applicable.

## Priority rules

1. Preserve access: semantic structure, visible focus, keyboard operation,
   labels/names, adequate contrast, zoom, and non-color cues.
2. Make actions usable: sufficient touch targets, clear feedback, safe loading
   and destructive states, and no hover-only essential behavior.
3. Prevent layout/performance harm: responsive reflow, reserved media space,
   bounded motion, and no hidden or horizontally clipped content.
4. Keep navigation and forms predictable; place errors next to causes and
   preserve user input across recoverable failure.
5. Use consistent tokens and visual roles; charts require readable labels,
   legends, accessible color, and a nonvisual interpretation.

Use `quick-reference.md` for the full rule catalog. Use
`search-tool.md` and bundled `search.py` scripts only when generating
or comparing design-system directions. Use `app-ui-rules.md` for
native/mobile sign-off.

Record consequential UX decisions and acceptance scenarios in the agreement
(with OpenSpec: the active change; otherwise: the issue or design doc). Settled
visual implementation follows (`frontend-design`, if installed); browser and
accessibility checks or CI output prove the rendered behavior.

