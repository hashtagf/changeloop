# Design system benchmarks — what 126 published systems agree on

Use when naming tokens, fixing a focus ring, choosing radius/breakpoints/density,
building a multi-step or lookup flow, or writing a DESIGN.md. Values here fill
gaps; an existing design system or approved DESIGN.md wins.

**Evidence [S102].** Open Design's study guides (`DESIGN-<slug>.md`) of 126
public systems: enterprise (Atlassian, SAP Fiori, Salesforce, Workday Canvas,
Fluent, Spectrum, Twilio Paste), open-source kits (Bootstrap, Mantine, Radix,
Chakra…), and ~45 government/public systems (GOV.UK, USWDS, NHS, NAV Aksel,
Digdir, DSFR, Japan DADS…). Counts below are **keyword matches across those 126
guides**, not market share and not audits of the live systems. Treat a count as
"how common in the documented practice", and the rules as project
recommendations.

Full study guides for all 126 systems (token tables, flows, agent prompts) are in
[assets/design-systems/](../assets/design-systems/index.md); open one file for the sector you need.

**Do not open a whole guide** (~30 KB, mostly HTML in Component Examples). Use the lookup script:
`python3 scripts/ds_lookup.py gov-uk` (outline) · `… gov-uk design-reference --sub spacing` (one token table) ·
`… nhs agent-prompt` · `… --find "density"` (search all 126, grouped by system and section). Cite the guide's
own linked official source for any exact value.

Contents: §1 Token architecture · §2 Type and spacing · §3 Focus and targets ·
§4 Radius, breakpoints, density · §5 Service flows from public-sector systems ·
§6 Identity and provenance · §7 Sector tendencies

## 1. Token architecture

- **Primitive → semantic always; component layer only where it earns control.** Primitive (`base.size.100`, a hue ramp) → semantic
  role (`sys.padding.md`, `color-accent-border-default`) → component. 51 of 126
  guides document aliasing; 9 name a component layer. Components read roles,
  never primitives, never hex.
- **Role ladder per hue** (Digdir): `{hue}-{background|surface|border|text|base}-{default|subtle|tinted|hover|active}`
  plus `base-contrast` (the text on a `base` fill). One hue yields ~11 roles;
  that is the unit to contrast-check, not the 12-step ramp.
- **Neutral is a role too.** Use neutral for supporting surface/text without
  implying status; status hues (success/warning/danger/info) get the same ladder.
- **Spacing has intent roles** (Workday): `padding` (inside a control), `gap`
  (between siblings), `section gap` (between blocks). Name by use, not by number,
  so density can change one role without touching the rest.
- **Composite type roles**: a role bundles size + line-height + weight (`type.body.sm`).
  Apply the bundle to `font`, not to `font-size` alone (Atlassian); a size without
  its line-height is the usual cause of cramped Thai/Latin mixes.
- **Dark mode swaps role values under a scheme switch** (`data-color-scheme`,
  `color-scheme`; 33 guides). Hard-coding a light hex survives light and breaks
  dark (NAV Aksel: `--ax-text-neutral` is `#202733` light, `#dfe1e5` dark).
  Dark roles are authored, not inverted: re-check every contrast pair.
- **Prefer named accessors to pasted hex** in production (GOV.UK says its hex is
  a snapshot). In DESIGN.md write the role and the value.
- **Prefix and namespace** every custom property (`--ds-`, `--ax-`, `--ecl-`,
  `--bs-`…); the most common unprefixed `--color-*` collides in mixed pages.

## 2. Type and spacing

- **Body size:** 16px is the floor on the web; GOV.UK goes up to 19/25 (16/20
  for supporting text). Serve users of unknown ability a larger body, not a smaller one.
- **Responsive type is a pair per breakpoint**, size and line-height together
  (GOV.UK xl 32/35 → 48/50, l 27/30 → 36/40, m 21/25 → 24/30, body 19/25).
  Define the step down on small screens instead of scaling everything with `vw`.
- **Base unit.** ~120 of 126 guides use a 4px or 8px base. Pick one; 4px for
  dense product UI, 8px for content pages. GitLab shows a legitimate non-linear
  scale (0, 2, 4, 8, 12, 16…) when the first steps need to be finer than the base.
- **Responsive spacing** (GOV.UK units 1–9) lets the large-screen gaps grow
  while the small-screen ones hold; keep one static scale for inside controls.
- **Use `rem` for type, line-height and spacing roles** (68 guides) so browser
  font-size settings are honored; keep 1px borders in `px`.
- **Reading width:** DADS uses a 52rem content width (its own application
  choice). Cap prose by measure, not by container; wider panes need columns.

## 3. Focus and targets

- **Focus ring: 3px is the mode** (observation; the house value is in [component states](component-states.md) "Focus") (about 134 of ~190 declared widths; 2px next,
  4px for high-contrast kits). Use ≥ 3px, offset 0–2px, a color that clears 3:1
  against both the surface and the control, and a second contrasting edge
  (inner/outer) when the surface varies. GOV.UK pairs a yellow fill with a black
  underline so the indicator survives any background. This is practice; the
  normative minimum is WCAG 2.4.7, 2.4.11 AA and 2.4.13 AAA ([accessibility](accessibility.md)).
- **Never remove an outline** without an equal replacement; keep it in
  `forced-colors` (use `outline` and borders, not box-shadow alone).
- **Targets.** WCAG 2.2 AA is 24px (2.5.8); 119 guides mention 24px, 23 reach
  44px (WCAG AAA 2.5.5, Apple HIG). Use 44px for primary/touch controls and
  24px with spacing only for dense desktop tables.
- **Skip link** first in tab order for multi-region pages (rare in the guides,
  1 of 126 — a gap worth closing, not a norm to copy).
- **Reduced motion** is documented by only 9 systems; make it a default
  ([motion](motion.md) §1), not an extra.

## 4. Radius, breakpoints, density

- **Radius camps** (declared values, most to least common): 4px (24), 8px (22),
  2px (20), 6px (15), 12–16px (28). Government and enterprise kits sit
  at 0–4px (Foundation 0, Flowbite/Twilio/Fluent/TDesign 2px); consumer-leaning kits at 8–16px (Kobalte 16px); automotive/finance brands
  (Porsche 2px, Volvo 4px, Visa 6px) stay small with one saturated blue.
  Choose one camp per product ([visual system](visual-system.md) Part C §4).
- **Primary blue is the common default** (e.g. `#0070f2` SAP, `#0c66e4` Atlassian,
  `#165dff` Arco, `#2d72d2` Blueprint, `#0052d9` TDesign; not counted across all 126).
  A non-blue primary needs an idea ([design quality](design-quality.md)), not a default.
- **Breakpoints (declared):** 768px (46), 600px (26), 1200px (24), 1024px (21),
  720/640/992/576/480/1440 trail. Content-driven bands still land near
  ≈ 600 / 768–1024 / 1200+; check 320 and 390 first.
- **Density is a mode, not a restyle.** 32 guides ship compact/comfortable/
  spacious. Implement as a change to the padding and row-height roles only
  (our suggestion: rows ~32 / 40 / 48), never to type size below 14px.

## 5. Service flows from public-sector systems

GOV.UK, NHS, USWDS, DADS, DSFR, Digdir and Aksel document flows, not only
components. Reuse them for forms, applications, lookups and records.

1. **Error summary** at the top on submit, each item links to its field, focus
   moves to it; plus an inline message at each field ([forms](forms.md) §6).
2. **Retain answers** across validation failure, navigation back and "change".
3. **Review before submit** with a summary list: key, value, a **contextual
   "Change" link** whose accessible name includes the key ("Change email
   address"); returning from a change goes back to the review, not step 1.
4. **Group radios/checkboxes with `fieldset` + `legend`**, hints associated with
   each option; optional help in a native disclosure while the instruction that
   is *required* to answer stays visible.
5. **Three distinct lookup outcomes**: malformed input (fix it), no match (what
   to try next, keep the query), found. Move focus to the new status heading and
   keep the query in the field (DADS receipt lookup).
6. **Comparison/directory pages**: a real `table` with `caption` and column
   headers, labelled search and filter, a **result count**, a useful no-match
   state and reset. Accordions may hold supporting detail; the data needed to
   compare stays visible (USWDS).
7. **Local demo state is labelled**: where a flow is not wired to a backend,
   no invented results, counts, bookings or eligibility (every guide's Agent Prompt).

## 6. Identity and provenance

- **Do not reproduce a state/organization identity** (crest, wordmark, official
  font such as GDS Transport or Marianne) for an
  independent project; DSFR, GOV.UK, NHS and DADS each restrict this. Use the
  structure and tokens; swap the identity and the font.
- **Mark provenance in DESIGN.md.** Each token group states *documented*
  (cite the source), *derived* or *assumed*; 108 of 126 guides label their
  preview values "illustrative". Do the same so an assumption is never read as
  a rule. See [design memory](design-memory.md) §3.
- **Pin versions** (GOV.UK Frontend 6.5.1, USWDS 3.14.0, Digdir 1.23.0): note the
  package version with the tokens, since roles and class names change between majors.
- **Every system guide ends with an agent prompt**: one paragraph naming the
  package/version, the structures to use, the states to verify and what not to
  invent. Write the same for this project's DESIGN.md so a later agent can reproduce a screen.

## 7. Sector tendencies (starting point only)

| Sector | Typical choices |
|---|---|
| Government / public service | 0–4px radius, 3px+ high-contrast focus, body 16–19px, text-led, form-flow patterns (§5), plain-language headings |
| Enterprise / back office | 2–4px radius, dense tables, density modes, semantic status ladders, neutral-heavy palette, 14px UI text |
| Developer / tooling | Neutral ramp with one accent, 4–8px radius, mono for ids, light + dark from day one |
| Consumer SaaS | 8–16px radius, friendly neutral, larger hero type, motion with reduced-motion branch |
| Brand-led (auto, finance) | One saturated color, 2–6px radius, large photographic or typographic hero, restrained palette |

Pick the sector row from the job and users, then use [direction library](direction-library.md)
to choose a named look inside it.
