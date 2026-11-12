# Direction recipes and component recipes

A direction in the library says what the look is. A **recipe** says how to build and check it: hard rules, banned
devices, required components, motion and a tick-box pre-flight. Adopted from the template pre-flights in
[OpenDesign templates study](../assets/evidence.md).

```
python3 scripts/direction_recipe.py <direction-id>            # print the recipe
python3 scripts/direction_recipe.py <direction-id> --out recipe.md
```

The script derives the recipe from `assets/directions/directions.json` (palette, type, radius, button shape, surface
rule, hero). Pair it with [tokens to code](tokens-export.md) and run the pre-flight in phase 7. Use the recipe as a
checklist, not as a license to add devices; where a recipe and the context card disagree, the card wins.

## Component recipes (reusable, direction-neutral)

| Recipe | Build | When |
|---|---|---|
| **Double-bezel card** | An outer shell (small padding, hairline ring, soft outer shadow) holding an inner core with its own background and a smaller concentric radius (inner = outer minus the shell padding). | Soft or premium directions with bento grids |
| **Button-in-button CTA** | Full-pill primary; a trailing arrow sits in its own small circle flush to the right edge; on press the pill scales to 0.98 and the arrow nudges up-right. | Soft directions; one per view |
| **Floating pill nav** | A narrow pill detached from the top (margin above), translucent with backdrop blur and a hairline ring, 44px targets; never an edge-to-edge bar glued to the top. | Soft and editorial directions |
| **Hairline ink grid** | Cells on an ink-colored background with a 1px gap, so every divider is exactly 1px. | Swiss, brutalist, data indexes |
| **Uneven bento** | Mixed tile sizes with at least one wide and one tall tile; visible 1px dividers; never three equal cards. | Feature areas |
| **Register strip** | A monospace band (issue, date, coordinates or status) edge to edge, hairline above and below. | Print-led directions |
| **Marquee** | Duplicated logo track translating -50% over 20-30s, pauses on hover and under reduced motion, plus a visible pause control (WCAG 2.2.2, [motion](motion.md) §4); real logos only. | Proof strips when real logos exist |
| **Eyebrow tag** | A small uppercase label above a section heading; use at most once per section and not on every section. | Optional; see anti-slop |

## Three worked recipes (paraphrased from the template study)

**Soft premium** (calm consumer or SaaS). Canvas warm cream or silver grey, never pure white; heavy display
(700+) at a tight tracking and a line-height under 1; squircle radii 28-40px on major surfaces; double-bezel cards;
button-in-button CTA; floating pill nav; one slow mesh blob behind the hero at low opacity; diffuse shadows only
(for example `0 20px 40px -15px` at 5%); easing `cubic-bezier(0.32, 0.72, 0, 1)`; scroll entry by transform, blur and
opacity through IntersectionObserver. Banned: hard drop shadows, generic 1px grey borders (use a 5% ring), linear or
ease-in-out, `h-screen` (use dynamic viewport units), animating layout properties, pure black. Pre-flight: pill nav,
one double-bezel card, button-in-button CTA, section padding at least 96px, all transitions custom-eased, one column
under 768px.

**Editorial minimalism** (documentation, knowledge product, premium SaaS). Warm off-white canvas, off-black ink,
muted secondary; 1px borders only; serif display with grotesque body and mono for meta; radius 8-12px at most, no pills
on cards; pastel chips for tags only, never as section backgrounds; uneven bento with visible dividers; a "what it
isn't" block separated by a rule, not a card; reveals are a 12px rise over 600ms. Banned: gradients, glows, glassmorphism
beyond a faint nav blur, centered hero over a dark image, generic placeholder names, cliche verbs.

**Swiss industrial print** (agency portfolio, manifesto). Newsprint ground, carbon ink, one hazard-red accent used on
rules and strikes, never on large fills; heavy neo-grotesque at viewport-bleeding scale, uppercase, tight tracking and
leading under 0.9; micro type in monospace at 12-13px with wide tracking; radius 0 everywhere; hairline ink grid; a
register strip at the top; numbered theses; a colophon at the end; ASCII ornaments (`[ LABEL ]`, `>>>`, `///`) at least
three times; motion is mechanical (instant reveals, press inverts ink and paper in under 120ms). Banned: radius above
0, shadows, gradients, centered body text, any color besides ink, paper and red.

## How to adapt a recipe

1. Start from the generated recipe for the chosen direction.
2. Add the component recipes the direction needs; remove those that contradict its shape language.
3. Put the result in DESIGN.md under Components and Do's and Don'ts ([design memory](design-memory.md) §3).
4. Tick the pre-flight before delivery; failing items go into the fix list by [gate tiers](gate-tiers.md) class.

## Typographic voice and editorial furniture (from the rendered template study)

These are what separate a designed page from a themed one ([measured study](../assets/evidence.md)). Add them
per direction, sparingly; a recipe may require one or two, never all.

| Device | Build | Fits |
|---|---|---|
| **Roman plus italic emphasis** | One headline mixes upright and italic of the same serif or a paired italic; emphasize one or two words, never a whole line; no gradient on the emphasis | Editorial, premium, soft |
| **Oversized numeral or word** | One figure or word at 15-30vw, cropped by the viewport or a rule; the rest of the page stays small | Swiss, brutalist, campaigns |
| **Micro mono labels** | 10-12px uppercase monospace, tracking 0.1em, low contrast but at least 4.5:1: issue, date, section index, status | Print-led, technical, premium |
| **Register or plate strip** | Top band with volume, issue, date, coordinates; hairline above and below; carries real facts (date, version), not decoration | Editorial, brutalist |
| **Vertical rail** | One rotated line of mono text at a page edge (section name, scroll index); hidden on phones | Editorial, creative |
| **Marginalia** | Small numbered notes, captions, "filed under" tags beside the main column | Editorial, long-form |
| **Pinned note** | A paper card rotated 1-3 degrees with a soft shadow and a pin or tape mark; one or two per page | Playful, craft |
| **Editorial dashboard** | A sentence first ("14 payments waiting, 3 failed"), then large serif numerals with sparse labels; one accent bar or number highlighted in an otherwise ink chart | Back office with a point of view |

**Which rule wins.** These devices are *Reflex* class in [gate tiers](gate-tiers.md): allowed when chosen on purpose and
written in the context card's waivers, otherwise the [design quality](design-quality.md) avoid-list applies. Allowed
without a waiver: **one** roman-plus-italic emphasis per page on one or two words (never color or gradient on the
emphasis), and mono labels that carry a true fact. Still avoided: an eyebrow above every heading, mono for body
captions, numbering everything. `slop_check.py` reports the allowed italic emphasis as a note (`italic-emphasis`).

**Thai.** Thai has no true italic and a synthetic slant distorts the marks, so never use faux italic. Emphasize one
phrase with weight contrast (400 against 700), a soft tint highlight (marker style, `tint` fill behind the phrase) or the
`primary-text` color step. Mono labels: uppercase and tracking apply to Latin only; Thai labels stay at normal case and
spacing in a Thai-capable face, at 12px or more. Thai headlines wrap by characters: up to 3 lines at 1440 and 4 at 390 is fine;
do not shrink type to force 2 ([visual system](visual-system.md) Part A "Headline length").

**No true facts to show** (no issue, date, version, numbers). Do not invent volume or coordinates. Skip the register
strip, rail and oversized numeral; keep the typographic voice (italic or weight emphasis) and at most one object (a
pinned note that restates the page's own promise). A page may carry one signature move and no furniture at all.

Rules: furniture must carry true information where possible; it is hidden or simplified under 768px; it never reduces text
contrast below AA; one signature move per page decides which furniture appears.
