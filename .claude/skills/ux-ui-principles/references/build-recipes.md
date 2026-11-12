# Build recipes — lessons from shipping a page and its back office

Small, tested practices for BUILD mode on a static or early-stage page. Each
one came from a real defect or a lint finding; read the one that matches the
task, not the whole file.

## 1. Pick the surface mode first

The surface decides the rules, not the product. A tool's landing page is still
a page.

| Surface | Visitor's success | Rules that change |
|---|---|---|
| **Persuade** (landing, campaign, pricing) | Decides and acts | Scale, one idea per screen, real pictures, no filler; ornaments (eyebrows, tracked caps, gradients, glow) off |
| **Operate** (admin, dashboard, settings, inbox; a surface, not a workflow mode) | Finishes a task | Density, scanability, quiet borders and small labels allowed; accent only for state that needs attention |
| **Read** (docs, articles, changelog) | Understands | Structure and measure first |
| **Experience** (portfolio, gallery) | Is inside the work | The artifact leads; the interface recedes |

When a request mixes surfaces (a landing page plus its back office), build each
with its own mode and **one shared token file** so they read as one brand.

## 2. One live thing, with no script

Give a marketing page one thing the visitor can try. Prefer CSS-only so it
works with scripting off and costs no bundle:

```html
<input class="visually-hidden" type="radio" name="goal" id="g1" checked>
<label for="g1">…</label>
<div class="plan plan-1">…</div>
```
```css
.plan { display: none }
.picker:has(#g1:checked) .plan-1 { display: grid }
.choices input:focus-visible + span { outline: 3px solid var(--color-paper) }
```

Rules: real content only (a plan, a price, a sample), the first option checked
so the no-JS view is complete, a visible focus state on the hidden input's label,
a 56px touch target (large demo control; project default is in [accessibility.md](accessibility.md)). If the demo needs state beyond show/hide, then add script.

## 3. Grid placement: never trust DOM order for a hero

A decorative slot placed after the headline in the DOM but before it in the
layout, or auto-placed beside a spanning heading, pushes the headline down and
breaks the fold. Fix it by naming rows and columns:

```css
.hero h1    { grid-column: 1 / span 8; grid-row: 1 }
.hero-copy  { grid-column: 1 / span 5; grid-row: 2 }
.hero-slot  { grid-column: 9 / span 4; grid-row: 1 / span 2; align-self: stretch }
@media (max-width: 60rem) { .hero h1, .hero-copy { grid-column: 1 / -1; grid-row: auto } }
```

Always screenshot at **1280×800** and confirm headline, one sentence and the
primary action are all visible, with the slot not above the headline.

## 4. Honest placeholders

- **No pictures yet:** a flat `data-slot` field in a *neutral* token
  (`--paper-3`), labelled for assistive tech (`role="img" aria-label="Space for
  the team photo"`), with a one-line script that swaps in a real image later.
  A large accent-colour fill as a stand-in breaks the restrained posture's "accent ≤ 5% of viewport"
  ([color palette](color-palette.md) "Colour posture"); reserve accent for actions and state.
- **No numbers yet:** show `—` in stat tiles. Never fill them to look busy.
- **Sample rows:** name them "Sample Person A", use `example.com` / `.example`
  addresses and add a visible "Sample data for illustration" line.
- **No customers, logos, quotes or case studies?** Leave those sections out and
  say so in the hand-off; offer to add them when the client supplies real ones.
- **No facts yet, user asked for placeholders:** placeholder mode in
  [marketing copy](marketing-copy.md) (`.ph` spans, `scripts/placeholders.py` for the list).

### Base CSS every page starts with

Three bugs only the render showed in one session; put these lines in the reset of
every page:

```css
img { display: block; max-width: 100%; height: auto; } /* the height attribute otherwise stretches the image */
[hidden] { display: none !important; }                  /* a component's display:flex otherwise shows hidden parts ("฿0" in an empty bag) */
.nw { white-space: nowrap; }                             /* Thai number + word ("2 ออเดอร์"): ICU splits loanwords mid-word */
```

And a cascade trap: a utility that hides an element (`.menu-btn { display: none }`)
loses to a later component rule of equal weight (`.icon-btn { display: grid }`).
Scope the hide (`.top .menu-btn`) or put it after the component rule.

## 5. Contact without a backend

Until a backend exists, the primary contact action is a `mailto:` link with a
written subject and body prefilled, not a form that posts nowhere:

```html
<a class="btn" href="mailto:hello@brand.example?subject=New%20project&body=…">Email hello@brand.example</a>
```

State in the hand-off that the address is a placeholder and what replaces it
(form → API → lead table). Never fake a submitted state.

## 6. Verify with what is installed

1. `python3 scripts/check.py page.html --render` runs every static check plus the render, the public-page
   metadata line and `fold_check.js` (CTA above the 390×844 and 1440×900 fold, offer on the first screen).
2. Use `render_check.js` (`--doctor` first). Only when it reports exit 3, fall back to a headless
   browser screenshot, no new installs. macOS example:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --screenshot=/tmp/p.png --window-size=1280,800 --virtual-time-budget=4000 file://$PWD/index.html`
   Run at 1440 and 390 wide (fold and a tall capture), matching SKILL.md "Render and look".
3. **Look at the PNG.** A linter said "0 FAIL" on a page whose hero was broken
   by the grid bug in §3; only the render showed it.
4. The page's one live thing or main task: write its steps once as JSON and run
   `node scripts/flow_check.js page.html steps.json` (click, fill, expect text/disabled/hidden; fails on
   console errors). Include one failure path. Visually hidden inputs are clicked with a force fallback.
5. If `render_check.js --doctor` exits 3 (no Playwright browser) and no fallback runs, report
   *render step not run*; do not claim it passed.

Common first-build slips, worth fixing early (`slop_check.py` notes the first three): straight quotes in
prose (use ’ “ ”), no `:disabled` / `aria-disabled` style on buttons, more than
one filled-button recipe (derive variants from one `.btn`), large accent fills outside a declared posture.

## 7. Back-office preview before back-office code

Before building an admin, make a **static visual mock** of the key screen and
get it approved, in the product's own tokens:

- Same `tokens.css` as the public page; sidebar in `ink`, content on `paper`.
- Accent reserved for the one state that needs attention (e.g. a *New* lead and
  the primary action). Other states in neutral or ink pills.
- First screen: stat tiles (empty `—`), status filter pills, table with
  rows as tone-stepped bands (no gridlines), a detail panel with the next step.
- Name the stack, the data model and the screens in the hand-off, then ask for
  go-ahead before scaffolding (framework, database, auth).

For a shadcn project: pick the preset (nova = compact, mira = densest, maia =
soft, lyra = angular, luma = airy, vega = classic) *after* showing the mock,
and map brand tokens onto the shadcn CSS variables instead of recolouring
components.

## 8. Offering directions without overwhelming

When asked "what directions are there?", list the set grouped by genre in a few
lines, recommend **three** that fit the audience with a one-line character each,
and show their preview images. Do not read every direction in `directions.json`. Say which direction the
current build uses (or that it is custom).

## Checks

- [ ] Surface mode named; mixed surfaces share one token file
- [ ] One live thing works with scripting off, first option checked
- [ ] Hero rows/columns named; 1280×800 screenshot read
- [ ] Every placeholder is neutral, labelled and honest; no invented proof
- [ ] Contact path is real (`mailto:` or wired form) and the placeholder is reported
- [ ] Base CSS lines present (`img{height:auto}`, `[hidden]`, `.nw`)
- [ ] `fold_check.js` passes at 390×844; `flow_check.js` passes for the live thing incl. one failure path
- [ ] A render was *looked at*, not only linted; skipped tiers reported
- [ ] Back-office mock approved before back-office code
