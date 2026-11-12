# Design memory — source of truth, DESIGN.md, routing, reuse

Agents drift between sessions: a new run picks a different radius, padding,
font or density. Fix it by deciding once, writing the decision down with its
reason, and reading it before every design task.

> Make decisions once, apply them consistently, change them intentionally.

## 1. Inspect before designing (Phase 0)

Look for, in this order, and note what exists:

1. Product docs: `PRODUCT.md`, `IDEA.md`, PRDs, the [design context](../assets/design-context.md) file.
2. Design language: `DESIGN.md`, `docs/design*`, Figma library links.
3. Tokens: CSS variables, Tailwind `@theme`/config, token JSON.
4. Component system: `components.json` (shadcn), `package.json` deps (Radix, MUI,
   Ant, Chakra, Vuetify, PrimeVue, Element Plus, Naive UI, shadcn-vue, Reka UI),
   local `components/ui/`.
5. Existing screens for the same pattern; reuse their structure.

Report what was found in one line each. Missing ≠ permission to invent a full
system; propose defaults and label them unapproved.

Shipped UI but no DESIGN.md (brownfield): `python3 scripts/code_extract.py SRC` reports
tokens, roles and drift; `design_md.py --from-code SRC` writes a draft DESIGN.md from it
([brownfield](brownfield.md)).

## 2. Precedence when sources disagree

| Rank | Source | Wins over lower ranks because |
|---|---|---|
| 1 | User request and safety/legal constraints | Explicit instruction and harm prevention |
| 2 | Product goal and the role's job | The page exists for this |
| 3 | Approved DESIGN.md / design context | Agreed brand and system decisions |
| 4 | Existing code and components | What actually ships today |
| 4a | The chosen direction's own rules ([direction library](direction-library.md)) | The look the user picked |
| 5 | This skill's defaults | General craft, not project facts |
| 6 | Creative defaults | Unapproved proposals |

Rules:
- A lower rank never silently overrides a higher one. Example: a creative
  default wants visual variety, DESIGN.md says operations pages are dense
  tables → keep the dense table; propose variety only where DESIGN.md allows.
- **A chosen direction is a decision.** When its material needs something this
  skill's defaults ban (paper lift needs a shadow, a print look needs hairlines),
  state the rule it overrides and why, record it in DESIGN.md, and report the
  resulting checker findings as accepted, not as failures. The hard gates in the
  [review loop](review-loop.md) §5 still apply. Never edit a checker or its
  config to make it pass.
- **Docs vs code conflict** (DESIGN.md says 8px radius, code uses 6px):
  report both values and where each lives, recommend one, change neither
  system-wide without approval. Scoped work follows the code for consistency
  and records the deviation.
- **Cross-domain conflict** (UX vs SEO vs Figma vs code vs a generated preview):
  decide in this order and record the accepted trade-off. 1 security, privacy,
  legal accuracy, user safety → 2 accessibility and primary-task completion →
  3 true visible facts and product constraints → 4 semantic HTML, crawlability →
  5 conversion and comprehension → 6 design-system consistency → 7 maintainability
  and verification cost → 8 novelty and trend fit. Items 1–3 may veto. Real
  evidence (render, source, readback) beats generated previews; AI-exploration
  tools and style libraries are candidates, never authority. No majority votes.
- A user request that conflicts with rank 3 is followed for the scope asked,
  and the answer names the deviation so DESIGN.md can be updated or not.

## 3. DESIGN.md — design language with reasons

`design-context.md` holds product facts (roles, vocabulary, statuses,
patterns decided). `DESIGN.md` holds the look and its rationale. Projects may
merge them; keep one source per fact. Write or edit either only when the user
asks or the host workflow owns the file.

What makes it useful is the *why* and the *never*, not a hex list. Ask:
what should the brand feel like; what does typography express; what density
fits the users; why these shapes and this whitespace; what does the brand
deliberately avoid.

DESIGN.md follows the Google Labs **design.md** format (alpha, `github.com/google-labs-code/design.md`):
YAML front matter with machine-readable tokens, then prose sections with the reasons. We add a few
sections and a dark theme on top; the spec keeps unknown sections and tokens.

```markdown
---
version: alpha
name: <product>
description: <one line>
colors:                      # hex recommended; {refs} allowed elsewhere
  canvas: "#..."  surface: "#..."  on-surface: "#..."  muted: "#..."  border: "#..."
  primary: "#..."  on-primary: "#..."  primary-text: "#..."  focus: "#..."
  success: "#..."  warning: "#..."  error: "#..."
  dark-canvas: "#..."        # our extension: the dark theme as dark-* tokens
typography:
  headline-display: { fontFamily: ..., fontSize: 56px, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.03em }
  body-md: { fontFamily: ..., fontSize: 16px, fontWeight: 400, lineHeight: 1.6 }   # Thai body 1.55-1.7
rounded: { none: 0px, sm: 4px, md: 10px, lg: 18px, full: 9999px }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 40px }
components:
  button-primary: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", rounded: "{rounded.full}", height: 44px }
  button-primary-hover: { backgroundColor: "{colors.primary-text}", textColor: "{colors.on-primary}" }
---

# DESIGN.md: <product>
Status: draft | approved (<date>, <owner>)

## Overview            <- personality, each adjective with what it means on screen; ranked philosophy
## Colors              <- roles and why; which pairs are contrast-checked; dark theme decision
## Typography          <- families, scale, weights, Thai pairing and line-height ([visual system](visual-system.md) Part A)
## Layout              <- page pattern and composition per area; breakpoints
## Elevation & Depth   <- one depth strategy; border vs shadow policy
## Shapes              <- radius per component class; corner treatment
## Components          <- library + version; approved variants; overrides with reason; specs for anything used 2+ times (`Button primary — 36h · 12/16 pad · 6r · 14/500`)
## Do's and Don'ts     <- what the brand deliberately avoids (3 or more)
## Direction dials     <- ours: Variance n/10 · Motion n/10 · Density n/10
## Interaction rules   <- ours: loading, destructive confirmation, validation timing, keyboard, motion limits
## Decision log        <- ours: date, decision, reason, replaces; the interview answers
                          Mark each token group documented / derived / assumed, and pin library versions
                          ([design system benchmarks](design-system-benchmarks.md) §6)
```

The first eight `##` headings are the spec's canonical sections and must stay in that order (omit what does not apply and say so in
`omitted:`); ours follow them. No duplicate headings or keys. Token references use `{colors.primary}`.
`python3 scripts/design_md.py` writes this shape ([generate and wire](#generate-and-wire-new-look) below); `design_md_check.py`
validates it, and files without front matter are flagged as the older prose-only format.

This is a starter structure, not values to impose. Example values in any
template are placeholders until the project approves them. The idea of keeping
decisions in a project file read every session follows the DESIGN.md draft
format (S101).

Validate before handing it on: `python3 scripts/design_md_check.py DESIGN.md`
(front matter, token references, value formats, canonical section order, contrast of component pairs,
dark values, don'ts, dials in range, status line, placeholders). `letterSpacing` needs a unit: a bare `0` warns
(write `0em`), a unitless non-zero value is an error. Thai line-height checks run when the file uses Thai (Thai
script, `lang="th"` / `lang: th`, or a Thai font name such as Sarabun, Noto Sans Thai, IBM Plex Sans Thai). Optionally also run the official linter,
`npx @google/design.md lint DESIGN.md` (third-party package; alpha, so it may disagree with us). Then check the built tokens with
`python3 scripts/contrast.py --css <page>`.

### Generate and wire (new look)

After the interview ([design direction](design-direction.md) §9), write the answers to `interview.json` and run
`python3 scripts/design_md.py <direction-id> --interview interview.json --out . --wire`. It creates DESIGN.md
(Status: draft; spec front matter with `colors`, `typography`, `rounded`, `spacing`, `components`; the eight canonical
sections; AA-checked light and `dark-*` colors; dials; the interview as the decision log) and adds a block between `<!-- design-md:start -->` and `<!-- design-md:end -->`
to `AGENTS.md` and `CLAUDE.md` (creating `AGENTS.md` if neither exists). Running it again replaces the block; it
never overwrites DESIGN.md without `--force`, and without `--out` it refuses to write into the skill folder itself.
Interview list fields (`feel`, `languages`, `never`, …) also accept one string (`"feel": "warm"`). Validate with
`design_md_check.py`; mark Status: approved only after the user confirms.

### Brownfield: draft DESIGN.md from existing code

For a project that already ships UI: `python3 scripts/code_extract.py SRC` reports what the code actually uses (stack, custom properties for light and
dark, color literals with counts, fonts, sizes, radii, Tailwind utility usage, drift such as near-duplicate colors and hard-coded colors in
components) and maps variables to the DESIGN.md color roles by name, marking each value found, guessed or derived.
`python3 scripts/design_md.py --from-code SRC --out . --wire` writes a Status: draft DESIGN.md from it. It reports; the team decides what
should change, then approves.

## 3b. Brand extraction — from references to a design language

The goal is the
brand's *philosophy*, not a copied palette.

A real brand's colours and fonts come from its live site and same-origin CSS, never from
memory: cluster the literals, name the primary (most-used saturated colour on controls) and
the surface, record source and date in DESIGN.md. Cannot fetch: ask for the hex once, or
build with no brand claim. Never redraw a real logo.

1. **Collect.** The brand's own site and product (several pages and states),
   logo, printed or physical artefacts, 2–5 references the user likes, and what
   they dislike. Record the URL/screenshot and date for each.
2. **Observe values.** Read computed styles or measure screenshots: colors by
   role (not by frequency), type families and the scale, spacing steps,
   radius, border vs shadow, density, motion, imagery, icon style, copy voice.
   Mark each value *observed* or *inferred*.
3. **Interpret.** Answer the five questions above (feel, typography's job,
   density, shape/whitespace reasons, what it avoids), each with the
   observation that supports it.
4. **Translate.** Map observations to roles and tokens; add the states the
   source never showed (focus, error, disabled, dark) so they belong to the
   same language; check contrast and fix by shifting lightness, not hue.
5. **Write DESIGN.md** (§3) as *draft*, with the dials and anti-patterns, and
   validate it with `design_md_check.py`.
6. **Prove it.** Render two different page patterns (e.g. a table page and a
   form) with the language. If they don't read as one product, the language is
   under-specified; tighten §3 and repeat.

Never copy another company's logo, trademarked assets or distinctive layout
into a different brand; extract principles, then design original output.

## 4. Changing an approved decision

Change a token, radius, density or component default only with a reason
tied to rank 1–2 (a task fails, a constraint changed, an a11y defect). Write
the old value, new value, reason and affected screens in the decision log. Taste
alone is not a reason.

## 5. Reuse before invent

| Exists in project | Do |
|---|---|
| Button, input, dialog, drawer | Use them; add a variant only with a reason |
| Data table pattern | Extend it (columns, filters, bulk) rather than build a new table |
| Form components | Wire validation and states into them |
| Tokens | Reference tokens; no raw hex/px in new code |
| Theme (light/dark) | Support both through the existing mechanism |

A component library does not make UI good, and is not a reason to change a
project's stack. shadcn/ui fits React/Next projects already on Tailwind; for
Vue use a Vue-native library the project already has.
