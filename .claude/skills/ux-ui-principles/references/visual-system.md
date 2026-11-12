# Visual system — foundations, composition and measured values

One file for how a screen is built to look right: tokens, type, space and theming (Part A),
hierarchy, responsive and mobile composition, Thai text (Part B), and the measured values from
designed sites with presets and the craft pass (Part C). It replaces visual-system.md,
visual-system.md and visual-system.md; Part C keeps the old section numbers, so
"visual benchmarks §13" means Part C §13. What to avoid and how to critique a render:
[design quality](design-quality.md). What picture goes where: [visual assets](visual-assets.md).

## Part A — Foundations (tokens, type, space, layout, motion)

Everything a designer needs to define a coherent visual system for a product,
at design level. If the project already has a design system, use it and record
exceptions; otherwise define the foundations below before drawing screens.
Values are starting points, not requirements; keep the **structure**, adjust
values to the product. Color roles and contrast are in [color-palette.md](color-palette.md).
Source IDs resolve in [sources.md](sources.md).

### Token layers

| Layer | Example | Purpose |
|---|---|---|
| Primitive | `teal-700: #0f6e64` | Raw palette and scales, no meaning |
| Semantic | `color-accent: {teal-700}`, `space-section: {space-8}` | Meaning; the layer themes swap |
| Component (optional) | `button-primary-bg: {color-accent}` | Only where a component needs separate control |

Screens and components use semantic tokens, never raw values. Name by role:
`color-text-muted`, not `color-grey-500`. When tokens must move between tools,
the Design Tokens Format Module is a stable Community Group format. [S58]

### Categories to define

| # | Category | Define | Starting point |
|---|---|---|---|
| 1 | Color | Roles, light/dark values, semantic + data palettes | [color-palette.md](color-palette.md) |
| 2 | Typography | Families, scale, weights, line-heights, composed styles | Below |
| 3 | Spacing | One scale for padding, gap, margin | 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px; marketing sections add 96, 128, 160 |
| 4 | Sizing | Control heights, icon sizes, content widths | Controls 32/40/48 px; icons 16/20/24/32; prose ~65ch Latin, ~40em Thai ("Content widths") |
| 5 | Border | Widths and state colors | 1 default, 2 focus/emphasis |
| 6 | Radius | Per component class | 0 / 4 / 8 / 12 / 16 / full; controls one value, containers one value |
| 7 | Elevation | Levels mapped to roles | 0 flat · 1 card · 2 popover/menu · 3 dialog · 4 toast |
| 8 | Opacity | Disabled, scrim | Disabled 0.4–0.5 (one value); scrim 0.5–0.6 |
| 9 | Layering | z-order ladder | dropdown < sticky < drawer/dialog < popover < toast < tooltip |
| 10 | Motion | Durations, easing, named animations | Durations, easing and token names: [motion.md](motion.md) §2 |
| 11 | Breakpoints | Content-driven widths | e.g. compact < 600, medium 600–1023, expanded ≥ 1024 px; tablet band 768–1024 (Part B "Tablet"); set by content, not devices |
| 12 | Density | Comfortable / compact modes | Row heights e.g. 48 / 36 px; same type scale; rules in "Density" below |
| 13 | Focus | One focus ring contract | Value lives in [component-states.md](component-states.md) "Focus" (single owner; do not restate it here) [S04] |

Record which categories are deferred or N/A for the current scope.

### Typography

- **Families:** one UI family that covers Thai and Latin well (e.g. IBM Plex Sans
  Thai, Noto Sans Thai, Sarabun, Anuphan) plus an optional display family and an
  optional mono for IDs/code. Check matched x-height and that every weight used
  exists in the font files.
- **Scale (owner of the rule):** 6–9 steps defined, e.g. 12, 14, 16, 18, 20, 24, 30, 36 px;
  a public page uses only 3–5 of them, with a decisive body-to-headline jump.
  Marketing may extend upward (48–128). Product UIs need fewer large steps.
- **Minimum text size:** body 16 px on public pages at phone width, 14 px in product UI
  (13 only in dense tables); meta, captions and labels 12 px, 13 on public phone pages;
  nothing below 12. WCAG sets no text-size floor; this is a project default.
- **Composed styles:** `display`, `h1`–`h4`, `body-lg/md/sm`, `label-md/sm`,
  `caption`, `numeric` (tabular figures), `code`. Screens use styles, not raw sizes.
- **Line height:** headings ~1.25–1.3 (Latin display ≥48px is set tighter, 0.85–1.15 — see [visual-system.md](visual-system.md) §1); body ~1.5; Thai body 1.55–1.7, and ≤1.35 is a defect (rules below) —
  verify stacked tone marks and vowels with real fonts and zoom (see [visual-system.md](visual-system.md#thai-and-mixed-language-interfaces)).
- **Letter spacing:** only for Latin uppercase labels; don't track Thai by default.
- **Numbers:** tabular figures in tables, amounts and timers.

#### Thai with Latin display faces

Most display faces in a direction ([direction library](direction-library.md))
have no Thai glyphs; the browser then falls back to a system Thai font that does
not match. Choose the Thai pair deliberately and write it in the design context.

| Latin display voice | Thai display pair | Thai body pair | Notes |
|---|---|---|---|
| Condensed caps (League Gothic, Anton, Six Caps) | Kanit 500, or Noto Sans Thai 700 | IBM Plex Sans Thai, Noto Serif Thai | Thai has no case: drop `text-transform: uppercase`; Kanit is the closest in weight |
| Grotesk or geometric sans (Schibsted, Jost, Outfit) | Noto Sans Thai 700, IBM Plex Sans Thai 600 | IBM Plex Sans Thai 400/500 | The safest pair |
| Rounded sans | Noto Sans Thai Looped, Sarabun | IBM Plex Sans Thai | Check the loops against the Latin shapes at display size |
| Heavy slab or serif display | Noto Serif Thai 600–700, Mitr | Noto Serif Thai | Mitr is heavy and rounded; compare before choosing |
| Light high-contrast serif | Noto Serif Thai 400–500, Pridi, Taviraj | Noto Serif Thai | Thai has no hairline-contrast equivalent; expect less contrast |
| Mono for times and codes (DM Mono) | none | the Thai body font | Keep mono for numerals and Latin codes only; never for Thai words |

Verified in rendering: Kanit 500, Noto Sans Thai 700, IBM Plex Sans Thai 400–600
and Noto Serif Thai 400–600 paired with League Gothic, Schibsted Grotesk,
Instrument Sans and Newsreader. The others are suggestions; render a headline
and a paragraph before committing.

Rules:

- Put the Latin family first and the Thai family second in the stack, and switch
  the whole family per language: `html[lang=th] h1 { font-family: "Kanit", sans-serif; }`,
  so a toggle does not leave Latin metrics on Thai text. `slop_check.py` skips
  `:lang`/`[lang]` rules, so this pair does not count toward its two-typeface flag.
- Thai display: `letter-spacing: 0`, line-height 1.15–1.25 (Latin display: the 0.85–1.15 range above,
  by size band in [visual-system.md](visual-system.md) §1); body 1.55–1.7. Never track or uppercase Thai.
- Thai has no spaces between words, so a narrow heading breaks in the middle of
  a word. Wrap phrases that must stay together in an inline-block chunk
  (`<span class="nb">…</span>` with `display:inline-block`) with a real space
  between chunks; `word-break: keep-all` does not help for Thai.
- **Headline length (owner of this rule).** Latin headlines fit ≤ 2 lines at every
  width. Thai headlines may take ≤ 3 lines at 1440 and ≤ 4 at 390, breaking only
  at the chunks above; past that, cut words — never shrink the type to force 2.
- Match optical size, not font-size: set the Thai display about 0.85–0.95× the
  Latin clamp so a Thai headline and its English version fill a similar width.

### Spacing and layout

- One spacing scale for everything; larger gaps between sections than inside
  groups so grouping reads by proximity. [S30]
- **Layout grid:** define columns and gutters per breakpoint (e.g. 4/8/12
  columns), page max width, and side gutters (≥16 px on phones).
- **Content widths (owner of the measure):** reading text 60–75 characters, ~65ch default (Latin);
  WCAG 1.4.8 (AAA) caps lines at 80 characters (40 for CJK) [S114]. **Thai:** no published study
  sets a Thai measure (searched 2026-11-08), so the value is measured: Thai body runs 55–80
  graphemes per line on desktop (median ~70) and 35–43 on a 390px phone, at ~1.75 graphemes per em
  (Part C §9). Set Thai prose with `max-width: 40em` (≈ 70 graphemes; range 34–45em), not `ch`:
  `ch` is the width of a Latin "0" in the first font and drifts with the stack. Count Thai
  per grapheme (`Intl.Segmenter`), never per code point: tone marks and upper/lower vowels
  are code points with no width. Tables and dashboards may use full width.
- **App shell:** sidebar width, header height, page header structure and
  content padding are tokens too, so every page aligns.
- **Reflow:** content must work at 320 CSS px width without two-dimensional
  scrolling except for data tables, maps and similar. [S05]

### Density (owner of comfortable / compact)

Density is how much content one view holds. Two separate questions:

- **Screen density** (spacing and control size). Comfortable is the default and
  always available; compact is an opt-in the user switches, for data-heavy views
  (tables, resource lists, dashboards). Apply one density to the whole app, not
  page by page; a component may offer its own compact prop (a table's row size).
  **Row and control heights: comfortable 48px, compact 36px** (Part A row 12);
  two levels by default. A third level (expanded) is optional for back-office
  roles ([back-office.md](back-office.md)); never go below 36px for rows or invent
  in-between steps without a measured need. Admins may not switch everyone to compact;
  it stays the user's choice.
  Compact shrinks component height and inner/outer spacing; type scale,
  padding alignment and the touch-target floor ([accessibility.md](accessibility.md))
  stay. Alerts, validation messages and small-target controls (select, date picker)
  do not take the full compact step. [S110, S111]
- **Text density** (how much text and how tightly packed). Keep overall density as
  low as the task allows while still showing the data the task needs; use white
  space to lower local density; group related items so the eye reads groups, not
  items. [S112] "There was too much text" is one of the five items that predict
  perceived clutter, which in turn lowers perceived usability and appearance. [S113]
  To test whether a page is too dense with users, ask the five items in
  [measurement.md](measurement.md) "Perceived clutter" before and after the fix.
- **Signals to inspect** (`render_check.js` reports them as NOTEs, never fails):
  a reading paragraph longer than the measure above; a paragraph taller than
  ~8 lines on a phone with no subhead, list or break; text covering more than about
  half the first viewport on a marketing or onboarding page; table rows of
  different heights in one table (mixed density). These are prompts to look, not
  thresholds proven by research.
- Back-office density by role and frequency: [back-office.md](back-office.md) "Density".

### Elevation and surfaces

- Use elevation for things that float (menus, popovers, dialogs, toasts, sticky
  bars); use borders or background contrast for sections.
- In dark themes, show elevation with lighter surfaces rather than shadows alone.
- Layering: the sidebar uses the canvas colour plus a hairline, never its own colour;
  a popover or menu sits one step above its parent; inputs are inset (a touch darker than
  their surround, never lighter). Each step is a few % of lightness; one step alone is
  barely visible, the stack shows it.
- Controls get their own tokens (`--control-bg`, `--control-border`, `--control-focus`);
  never reuse surface tokens for inputs, selects and checkboxes.

### Motion

- Motion explains change: where something came from, what updated, what opened.
- Durations, easing and token names: [motion.md](motion.md) §2.
- One named set of animations (spin, skeleton shimmer or pulse, enter/exit,
  slide from edge); no ad-hoc animations per screen.
- Reduced motion and the 5 s pause rule: [motion.md](motion.md) §4. [S16] [S92]
- Full guidance (levels, types, choreography, spec, checks): [motion](motion.md).

### Theming

- Themes (light/dark, brand variants, high contrast) redefine semantic tokens only.
- Every theme is checked: contrast pairs, focus visibility, charts, images.
- Forced-colors / high-contrast modes drop backgrounds and shadows; state must
  survive as borders, outlines or text.

### Foundations checklist

1. Token layers defined; screens use semantic tokens only.
2. Type scale and composed styles exist; Thai rendering checked.
3. Spacing scale used everywhere; no one-off values without a note.
4. Control heights, icon sizes and radii assigned by component class.
5. Elevation ladder and layering order defined.
6. Breakpoints and grid defined from content; reflow checked at 320 px.
7. Focus ring contract defined and visible on every surface.
8. Motion set defined with reduced-motion behavior.
9. Every theme passes contrast checks ([color-palette.md](color-palette.md)).
10. Decisions recorded in the design context.

## Part B — Composition and localization

Use this reference when hierarchy, typography, color, layout, responsive
behavior, Thai/mixed-language text or charts affect comprehension or task
execution. Preserve an established visual system unless the requested change
includes it.

### Hierarchy and grouping

Start with content order and relationships. Give the critical task a readable
sequence: purpose, decision information, action, feedback, then supporting
detail. Use size, weight, contrast, spacing, and position to express priority;
use emphasis deliberately rather than making everything larger or putting
everything in cards. A decorative card around every element can obscure the
real relationships. [S23]

Nearby elements are read as related; common containers strengthen grouping.
Keep visual grouping consistent with semantic grouping. Use a consistent
alignment system and spacing relationships: related controls belong closer
together than unrelated sections. Reuse the project's tokens, grid and scale; a
4px or 8px scale is a project convention, not evidence that another scale is
unusable, so do not force a new base-4 system onto a working design merely to
follow a rule.

Judge empty space by whether it clarifies relationships and scanning. A dense
operations table and a focused onboarding screen have different needs. Neither
"more whitespace" nor "less scrolling" is a universal goal.

Project checks:
- Can a new user identify the page purpose and next action without reading all copy?
- Does prominence match task importance rather than marketing preference?
- Do headings, labels, hints, and controls form understandable groups?
- Does visual reading order agree with DOM and keyboard order?
- Are destructive and primary actions distinguishable without color alone?

These questions are inspection prompts, not proof of user comprehension.

### Typography and content

Use a small set of text roles: title, section heading, body, label, hint/supporting
text, numerical data. Prefer a few coherent roles over arbitrary sizes in each
component. Use tabular numerals where repeated numerical comparison benefits
from alignment.

Choose font size, weight, line-height and line length using realistic content,
language, viewport and font metrics. Body size around 16 CSS px and generous
line-height can be starting recommendations; WCAG has no universal 16px floor.
Avoid thin small text, low-contrast secondary information and truncated critical
labels. Check loaded fonts and fallback fonts. Line length and density: "Content
widths" and "Density" above; microcopy length caps: [content-design.md](content-design.md).

Test realistic content: long names and titles, wrapped labels, unbroken
identifiers, missing/empty values, translated text, and user-entered strings.
Truncation needs a usable path to the complete value; a hover tooltip alone
excludes touch and keyboard users.

Write action labels that predict an effect. Distinguish "Save draft", "Submit",
and "Publish" when these are separate operations. Avoid internal error codes as
the sole explanation of a recoverable problem.

### Thai and mixed-language interfaces

Thai text includes combining marks above/below base characters and requires
language-aware line breaking. Inspect actual Thai strings, glyph rendering,
stacked marks, wrapping and fallback fonts for clipping, broken clusters and
unnatural breaks. [S24]

Project recommendations: use Thai-capable fonts; avoid forced or decorative
letter spacing that separates Thai characters or clips marks, unless a need is
demonstrated; begin with roomy line-height then inspect tone marks at small
sizes and in controls. No single line-height guarantees correctness; do not
impose a universal value without checking the actual text, font, and density.

Test Thai/Latin names, long addresses, dates, currency, phone formats and search.
Choose Buddhist/Gregorian calendar display and storage rules explicitly from
product needs; label them clearly rather than assuming the locale decides all
business rules. Preserve original user input where normalization changes meaning.

### Color and surface roles

Use semantic roles for action, selection, status (success, warning, error),
emphasis, surface, text, and borders. Do not reuse a warning color as decoration
where it confuses the status meaning. Keep text or shape cues alongside status
color: red/green, saturation and icons without text are insufficient for
critical state distinctions. Verify the actual foreground and background
combinations in each relevant theme and state. Contrast and text override checks
are in [accessibility.md](accessibility.md).

Borders, elevation, and containers should communicate grouping or layering.
Avoid stacking shadows and backgrounds merely to make a page look finished.
Do not flatten meaningful controls until their affordance disappears.

### Responsive transformation

Choose transformations from the task: stack related content, reprioritize
secondary metadata, move actions into reachable positions, or contain an
essential two-dimensional view. Shrinking every element is not a mobile design.
Let breakpoints respond to content failure rather than device names alone.

Specify how navigation, actions, tables, filters and dialogs adapt; preserve
the user's task when rearranging. Avoid horizontal page scrolling; give genuine
two-dimensional tables a bounded, discoverable region. Do not turn every table
into cards if row comparison is the user's task.

Keep reading order and keyboard order coherent after reflow. Test long titles,
translated strings, empty values, zoom, orientation, sticky headers, footers,
dialogs, and mobile keyboards for overlap with controls and messages. Do not
remove required information or recovery actions to make the layout fit.

### Tablet (768–1024px)
- Navigation: a side nav collapses to an icon rail (tooltips on hover/focus); top navs keep working or fold into a menu.
- Tables: hide secondary columns (account, dates) before shrinking text; row details open in a drawer. Never shrink below the minimum text size in Part A Typography (14px in tablet tables).
- Cards: KPI rows go to 2 columns; two-pane layouts stack, list first.
- Filter bars wrap onto two lines; bulk actions stay visible.
- Touch targets: project default in [accessibility.md](accessibility.md); support both portrait and landscape; no hover-only actions.
- Test at 768, 820 and 1024; both orientations.
- Picture: back-office `previews/tablet/` (820 × 1366).

### Mobile web composition (≤ 480px) — design it, don't shrink it

| Area | Rule |
|---|---|
| Gutters | 16–20px side padding; nothing touches the edge except full-bleed images |
| Header | Logo + one primary action or a menu button; ≤ 56–64px tall; menu opens as a full-height sheet with large targets, not a squeezed desktop bar |
| Hero | Headline `clamp()` ≈ 32–40px (Thai 28–36px, line-height per [visual-system.md](visual-system.md)), ≤ 2 lines at every width (Thai ≤ 3/4: [visual-system.md](visual-system.md) "Headline length"); supporting line ≤ 3 lines; primary CTA visible in the first screen, full-width or ≥ 48px tall; the visual goes **after** the text or is cropped to a purposeful detail |
| Type | Body ≥ 16px (inputs ≥ 16px or iOS zooms), meta ≥ 13px (minimum text size: [visual-system.md](visual-system.md)); display sizes scale down, body does not |
| Sections | Vertical padding 48–72px (desktop 96–160px); one column; neighbouring sections still vary (image/text order, full-bleed band) |
| Grids | 3–4 card rows → stacked list or a horizontal scroller with a visible peek of the next card; never 2 tiny columns of text |
| Tables / comparison | Becomes cards per row or a scroll container with the first column sticky (keep rows when row comparison is the task, see Responsive transformation); pricing tiers stack with the recommended one first |
| Targets | Project default for web mobile: tap targets ≥ 44×44px with ≥ 8px between neighbours (WCAG AA floor is 24×24, see [accessibility.md](accessibility.md); form controls 48px); links in text have generous line-height |
| Sticky | At most one sticky element (header or a bottom CTA bar), never covering inputs when the keyboard is open |
| Imagery | Art-directed crops (`<picture>`/`object-position`), not desktop images scaled to 30% |
| Hover-only | Anything shown on hover is visible or tap-reachable |

Check at 390px and 320px (`render_check.js --zoom`), then look at the phone
screenshot as its own design: one focal point per screen, clear reading order,
the action reachable with the thumb.

### Charts and evidence

Choose a chart from the question: trend, category comparison, distribution, or
relationship. Show meaningful units and time range. Label missing, estimated,
or stale values instead of treating them as zero. Make axis changes and truncated
scales clear when they alter interpretation.

Provide an accessible way to obtain the same information, such as an appropriately
structured table or textual interpretation. A decorative chart must not invent
business data. Color should support comparison, not be its only carrier.

### Motion and layout stability

Motion rules live in [motion.md](motion.md). Layout stability: reserve space for
asynchronously loaded media and avoid moving a target just as the user activates it.

### Aesthetic quality

Coherent rhythm, alignment, density and restrained decoration support reading.
Brand expression may vary widely. Explain an aesthetic choice as a proposal
and evaluate it with users when consequential; do not claim a favorite style,
font pairing or palette is a universal principle.

### Review questions

- Can the intended actor find the task, its prerequisites, and the next action?
- Do typography and spacing express consistent roles and relationships?
- Does realistic content survive narrow widths, zoom, and localization?
- Do charts and statuses communicate actual data without hiding uncertainty?
- Does distinctive styling support the product rather than obscure its controls?

Record a concrete location and consequence for a finding. "Looks bland" or
"needs more whitespace" is insufficient without describing the task it harms.

### Page rhythm and flourish (from the OpenDesign template study)

- Section types alternate: never two stat rows, two feature triplets or two quote blocks in a row; break a run with a different composition.
- One decisive flourish per page (a pull quote, a striking stat, a real photograph, one hero micro-motion), not three.
- One image style per page: do not mix square headshots, widescreen product shots and vertical phone mockups.
- Accent color: the solid fill (primary CTA) once per view, with a nav CTA outlined or demoted; other uses stay small (link, focus ring, one true-fact label). A third strong use is demoted to ink or muted.
- Replace one generic feature cell with something specific to the product (a screenshot, a real example, a sample of the output).

## Part C — Measured craft values (benchmarks)

Numbers for the visual decisions that make a correct UI look designed: type
metrics, tone, spacing rhythm, radius, elevation, motion and content realism.
Read with [design-quality.md](design-quality.md) (focal point, containers, signal
budget, feedback diagnosis) and [design-quality.md](design-quality.md) (idea
sentence, competitor test, template devices, render critique). This file gives
the **values**; those files decide **what** to show and **why**.

An existing design system wins. Use these values to fill gaps, critique, or
start a project that has none. They describe observed practice, not standards.

Contents: §1 Typography · §2 Color and tone · §3 Space and rhythm ·
§4 Radius, borders, elevation · §5 Component metrics · §6 Composition (hero
patterns, signature moves, current template look, section order) · §7 Motion ·
§8 Content realism · §9 Thai · §10 Gallery vs shippable · §11 Plain-UI tells ·
§12 Presets · §13 Craft pass · Credits.

### Evidence base (2026-11-04)

| Corpus | N | Method | Detail |
|---|---|---|---|
| Live product, brand, docs and Thai sites | 35 | Computed styles via script, 1456px, logged out | [site-measurements](../assets/evidence.md) |
| curated.design live sites | 18 | Computed styles + 12 screenshots | [gallery-study](../assets/evidence.md) |
| Dribbble trending web-design shots | 18 | Opened each shot, screenshot review (images; values estimated) | [gallery-study](../assets/evidence.md) |
| Behance featured web-design projects | 14 | Opened each case study; 3 live sites measured | [gallery-study](../assets/evidence.md) |
| 21st.dev community website templates | 19 | Live previews measured + 1–3 screenshots each | [gallery-study](../assets/evidence.md) |
| elayadesign/ai-design-skills (MIT) | 2 skills | Rule review; adapted where evidence agrees | Credits below |

Measured values (live CSS) outrank estimated ones (shots). Gallery work is
optimised to be looked at, not used; see §10 before copying from it.

### How this fits the "avoid the generic look" rules

[design-quality.md](design-quality.md) lists template devices: eyebrows, mono
labels, two-tone or italic headline words, hairlines everywhere, dark +
neon accent, cream + serif + terracotta. The galleries show these devices
**everywhere** — which is exactly why they read as template when used by default.

Resolve it this way:

- **Baseline craft** (§1–§5: type metrics, tone steps, gap bands, radius
  discipline, restrained elevation) is never a template device. Apply it always.
- **Signature moves** (§6 list) are allowed **one per page**, only when the idea
  sentence or the subject justifies it. Two or more = template look.
- The palette and imagery come from the subject, not from the presets in §12.

### 1. Typography

**Voices.** One grotesk carries the UI on nearly every measured site. Optional
second voice: a serif for display or emphasis (Anthropic, Cursor, Notion,
6/18 curated, 8/14 Behance). Optional third: mono for code, data or meta labels.
Two families at most plus an optional mono; most strong sites use one or two. The single most
generic curated site used Inter + Poppins + mono with no reason for any of them.

**Faces.** Inter is the most common family among measured product sites, so it
is not banned — but at default weight it reads stock. Curated sites mostly use
foundry grotesks (Suisse, Söhne, ABC Diatype, Neue Montreal, Switzer, Die
Grotesk); Geist is the common free choice. Inter at a variable weight like
550–580 (Inflight) or Inter Display for headings avoids the default look.

**Display weight.** 400–500 on 12/18 curated sites; Stripe 300, Vercel 400,
Linear 510, Figma 400, Ramp 400, Attio 600. 700 on a headline ≥48px appeared on
**zero** curated sites. Labels and buttons 500–550.

**Scale ratio (display ÷ body), choose by intent:**

| Intent | Ratio | Typical display |
|---|---|---|
| Product UI, dashboards, docs | 2–3 | 24–40px over 14px |
| SaaS / product marketing hero | 3–4 | 48–64px over 16px |
| Brand or agency hero | 5–7 | 77–116px |
| Single statement / wordmark | 8–13 | 130–215px |

Keep a small UI band (12–14px dominates text-node counts on product sites) and
use the 20–32px middle band sparingly (card titles only). Few steps, large
jumps: 64 / 48 / 20 / 16 / 14 (PT1), 145 / 26 / 16 / 12 (Mosby's Files).

**Tracking by size (Latin sans display):**

| Size | Tracking |
|---|---|
| ≤20px body/UI | 0 |
| 24–32px | −0.01em |
| 48px | −0.02em |
| 64px | −0.03em |
| 88–100px | −0.04 to −0.05em |
| 120px+ | −0.03 to −0.05em |

Exceptions: fonts already tightly fitted (Die Grotesk, condensed faces) stay
at 0 to +0.01em; uppercase labels and caps serif display go **positive**
(+0.05em caps serif, +0.06–0.12em labels). Never track Thai (§9).

**Line-height by size:** body 1.5 (editorial/luxury 1.6–1.85); headings
24–40px 1.2–1.3; display 48–64px 1.0–1.15; display ≥80px 0.85–1.0. The default
1.5 on a 64px headline is the most common amateur tell.

**Named text styles.** Every text element uses a named style, never a loose
size + weight. A workable set (adapted from elayadesign): `heading-1…6`,
`title-1…5` (card/list/nav titles, weight 500), `body-1…6` (16 and 14px at
600/500/400), `button-lg/md/sm`, `caption-1…5` (12–14px meta). Sizes snap to
one scale (steps and how many are used: [visual-system.md](visual-system.md) Typography;
marketing extends upward, e.g. 48, 60, 72, 96, 128); new
styles extend a group (`body-7`) rather than inventing a size.

**Line breaks.** `text-wrap: balance` on headings, `text-wrap: pretty` on body,
so no single word sits alone on the last line. Hero heading and subline max
~640–680px; break where the thought breaks; headlines fit two lines at every
width ([design-quality.md](design-quality.md) §5).

### 2. Color and tone

- **Ink, not black.** Primary text rgb(23,23,23) Vercel · (20,20,19) Anthropic ·
  (31,35,40) GitHub · navy (12,35,52) PT1 · deep green or burgundy on Behance
  brand work. Dark grounds use near-black #0b0b0b–#1c1c1c or a tinted ink
  (8,9,10 Linear; 13,17,23 Inflight), never pure #000 behind body text.
- **Ground, not white.** Off-white or tinted: (250,250,250) Vercel ·
  (250,249,245) Anthropic · oklch(.982 .002 84) Kobbe; 10/14 Behance projects.
  Keep white for cards/surfaces on top of it.
- **Three text tones.** Primary, secondary (~45–55% L, or ink at 45–60% alpha),
  tertiary meta. 7/18 curated sites use **ink alpha** for secondary text, which
  keeps the hue consistent across surfaces. Verify secondary/tertiary contrast.
- **One accent, ≤2 strong uses per viewport** (rule: [visual-system.md](visual-system.md)). 14/18 Dribbble, 11/14 Behance,
  6/18 curated with exactly one saturated accent; on ~¼ of measured sites the
  primary button is ink, not brand color. Accent goes to the action and one
  data highlight (a grey chart with one accent bar).
- **Color from imagery.** Full color lives in photography, 3D or illustration,
  not UI chrome; sample the accent from the hero image when the brand has none.
- **Body in full ink.** Running text ≈7:1 or more at 16–20px; muted ink only for
  secondary notes. Small grey body text reads as unfinished even when it passes AA.
- **Light on dark** needs slightly more line height, slightly more tracking and one
  weight step up. Separate paragraphs by spacing or indent, never both.
- **Status color only in chips and dots**, as tinted pills (bg ~12% alpha, text
  full) — never on buttons or headings.
- **Dark mode:** elevation by white alpha overlays (.02/.05/.08), borders
  white .06–.12, text off-white (247,248,248) with secondary ≈ (138,143,152),
  inset 1px top highlight instead of drop shadows.

### 3. Space and rhythm

- **Closed spacing scale:** the scale in [visual-system.md](visual-system.md), plus 96, 128, 160
  for marketing sections. Snap stray values to the nearest step.
- **Three gap bands, each ≈2–3× the previous:** inside a component 4–12 · between
  related groups 24–48 · between page sections 48–72 mobile, 96–160 desktop (Linear 128, Attio 152,
  Notion 96, Figma 80). 8px is the most frequent gap on nearly every site.
- **Airy sections, tight clusters.** The contrast between generous section
  padding and dense 8–12px meta clusters is what reads as designed (Dribbble).
- **Containers:** page chrome 1200–1440px; prose 680–800px (≈ the 60–75ch measure in Part A); docs sidebar 240–300px.
- **Shared alignment across siblings:** in side-by-side cards, titles, prices,
  lists and buttons start at the same Y.

**Wide screens and responsive mechanics.**
- At 1920 the gutters grow; measure and column counts hold; `vw`-sized visuals get a max-width.
- Hero height in `dvh`/`svh`, never `vh`; `width: 100%`, never `100vw`; `overflow-x: clip`
  on html and body (`hidden` breaks sticky). Breakpoints in `rem`.
- With `viewport-fit=cover`: `--gutter: max(16px, env(safe-area-inset-left))`.
- A button label that wraps: shorten it, then `nowrap`, then collapse the row into a menu.
- An uppercase head that can wrap keeps line-height ≥ 1.0.
- z-index from tokens (sticky < sticky-nav < modal < toast < tooltip); a second
  `position: sticky; top: 0` element offsets by the nav height.

### 4. Radius, borders, elevation

- **Pick a radius camp** — it is a brand decision, and no curated site mixes them:
  - *Tool / SaaS:* pill buttons and tags + 12–24px cards + 6–8px controls.
  - *Editorial / luxury / agency:* 0–4px everywhere.
  - *Middle:* 8–10px everywhere (Kobbe, UX Folio).
  Don't default to 8px on everything without choosing.
- **Nested radius:** inner = outer − gap, when the gap is under 32px and the
  result is above 2px; otherwise leave the inner shape square.
- **Hairlines over shadows, used for meaning.** 1px (Linear 0.5px) at
  rgba(0,0,0,.05–.10) light or white .06–.12 dark, or a 1px ring shadow
  (`0 0 0 1px rgba(0,0,0,.16)`). Borders go all the way around a card or not at all.
  Per design-quality, don't put hairlines on everything — separate with space first.
- **Shadows only on floating layers** (menus, popovers, dialogs, product mockups),
  layered and faint: `0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04)` (Airbnb);
  Notion alpha .01–.02.
- **No decorative background gradients.** Gradient is acceptable as subject
  imagery (sky, material) or texture, not as section fill.

### 5. Component metrics (measured)

| Element | Range | Default |
|---|---|---|
| Body (marketing) | 16–18 / 1.5 | 16/24 |
| Body (product UI, docs chrome) | 14 / 1.4–1.5 (13 only in dense tables) | 14/20 |
| Prose | 16 / 1.6–1.75, 680–800px | 16/28 |
| Meta, labels | 12px minimum (floor: Part A); caps +0.06–0.12em | 12px |
| Compact control | h 28–36, pad 0 10–16, 14px/500 | h32 |
| Primary CTA | h 40–48, pad 0 20–24, 14–16px/500 | h44 |
| Input | h 32–44, 1px border, control radius | h40 |
| Card | pad 16–32, hairline **or** tint (not both + shadow) | pad 24 |
| Code | mono 12–14 / 1.4–1.6 | 13px |

Primary on dark grounds: inverted white pill + ghost pill secondary. A trailing
glyph (→ ↗) on the CTA is common; it is also listed as a template device — use
only when the link genuinely navigates onward.

Every interactive component ships hover, active (`scale(.98)` or 1px down),
focus ring, disabled, loading (skeleton shaped like the content) and error.

### 6. Composition

**Hero patterns observed:** centered stack (statement products); headline
anchored bottom-left/right over full-bleed media (brand/editorial); 50/50 split
(commerce); asymmetric offset column (calm SaaS); app-shell (tools, docs).
Choose by subject; avoid the default centered stack when nothing calls for it.

**Every strong hero has one bespoke visual** — product UI working at real size,
product UI composited over photography, real photography, illustration or 3D
made for the subject. Zero curated sites used gradient blobs + icon grids.
**Test: remove the imagery.** If the layout collapses into plain, the craft was
in the image, not the system.

**Signature moves (pick at most one per page, with a reason).** They overlap
the devices in [design-quality.md](design-quality.md) §2 (italic word, glow):
they are Reflex rules, so one needs the waiver line from
[gate-tiers.md](gate-tiers.md) §1.


- headline interacts with an object (selection box around a word, icon replacing
  a letter, product overlapping the type)
- one phrase in a different tone or face (ink + grey continuation; italic serif word)
- microtype as ornament (local time, coordinates, counts in nav, status dot)
- texture (grain, glow behind a product frame)
- radical restraint (one weight or one size across the site; small type in a corner)
- deliberate asymmetry once (offset column, 1-wide + 2-narrow split, index rail)

**Current template look (2026 SaaS kits, seen near-identically on 5/19 templates)** —
the device list is owned by [design-quality.md](design-quality.md) §2; this is the observed
kit. Treat as defaults to avoid unless the idea demands one piece:
eyebrow pill → two-line headline with a grey or accent second line (9/19) →
grey subhead → ink + ghost buttons → "no credit card" micro-line → product mock
fading into a pastel aurora; Tiempos/Instrument Serif headline over Geist;
blueprint frames (dashed rails, "+" corner marks, hatch bands, dot-grid cards);
library effects (orbiting integration icons, shimmer/star-border buttons, dual
marquees, container-scroll hero); avatar stack + "Rated 4.8" pills; dark + neon
shader blob; particle vortex.

**Moves that read as designed (best-rated templates):**
- bottom-anchored photo hero: real full-bleed photo/video, h1 bottom-left, offer
  and CTA bottom-right (6/19)
- domain artifacts instead of generic cards: pricing as membership cards,
  a class schedule with "2 spots left" and Book/Waitlist, real team portraits,
  kanban column totals, stickers for a taco bar
- coded micro-UIs with believable data (event stream, workflow graph, inbox
  with AI draft) instead of screenshots; mask-fade their edges
- tactile button: inset 1px top highlight `inset 0 1px 0 rgb(255 255 255 / .9)`
  (light) or `/ .28` (dark)
- hairline depth `0 0 0 1px rgb(0 0 0 / .04), 0 1px 2px rgb(0 0 0 / .05)`
- one light→dark section shift mid-page for rhythm without decoration
- text-link CTA with underline and arrow on brand sites instead of a filled button

**Section order observed by page type** — a description of what templates do,
not a recipe. Build the order from the section argument in
[design-quality.md](design-quality.md) §1; use these only to check nothing
the visitor needs is missing.
- SaaS: hero → proof → features → how it works → testimonials → pricing → FAQ → CTA.
  This is the default skeleton design-quality warns against; 11 sections (SalesHook) is too long.
- Local service: hero + offer → why → services → schedule → pricing → people →
  reviews → location → FAQ → offer again (people before reviews).
- Brand / agency: wordmark or photo hero → selected work → manifesto → stats → contact.

**Data and dashboards:** card titles as plain-language sentences plus a one-line
subtitle saying what the chart shows; direct labels instead of legends; status
pills that state the consequence ("$2.9M short at commit"). The most
production-ready Dribbble shot was the least flashy one built this way.

### 7. Motion

Durations, easing, token names, reduced motion and the reveal-must-not-hide
rule live in [motion.md](motion.md) (§2, §4, §7); this section keeps only
what the sites showed.

- Observed: scroll reveals rise 24–32px and fade, once; staggered lists ~60ms
  per item.
- Reveal-on-scroll left whole viewports blank on two templates when landing
  mid-page (anchor link, refresh, print); see motion.md §7.
- Motion that earned its place: hero image growing with scroll, statements
  filling with ink, letter-rise on a wordmark, physics on playful brand stickers.
- Operational screens: motion only to explain change ([motion.md](motion.md) §1).

### 8. Content realism

- Real draft copy in the product's voice; no lorem or "Your headline here".
- Sample data for prototypes uses believable, non-round numbers, varied dates,
  region-appropriate names; never stock "Acme".
- **Never invent proof** on a real product's page: prices, customer counts,
  testimonials, logos come from the user; otherwise a marked placeholder `{{price}}`.
- Avoid filler: "revolutionize", "supercharge", "cutting edge", "effortless",
  "seamless", "next level", "harness the power", "world class"; Thai equivalents
  such as "ยกระดับ", "ไร้รอยต่อ", "ครบจบในที่เดียว" without a concrete claim.
- Sentence case for headings and buttons (Latin).
- System messages are calm and specific: "ส่งใบแจ้งหนี้ถึง Dana แล้ว";
  "อัปโหลดไม่สำเร็จ ไฟล์เกิน 20 MB".

### 9. Thai and mixed-script typography

Measured on Wongnai, LINE MAN Wongnai, SCB, Agoda, Nike TH, Apple TH.

- Observed: Thai display faces with small x-height (DB Heavent, Sukhumvit) are set 2–4px
  larger than the Latin equivalent. For other faces follow the 0.85–0.95× rule in
  [visual-system.md](visual-system.md) "Thai with Latin display faces".
- Thai body line-height as observed (rule: [visual-system.md](visual-system.md) Typography; LMWN 16/26, Wongnai 16/24 and 18/28, SCB
  14/25.2, Nike TH 16/28). Agoda's 14/18 (≈1.3) crowds stacked marks — treat
  ≤1.35 on Thai body as a defect to inspect.
- **Thai body measure (measured 2026-11-08, 10 Thai news, bank and reference sites,
  article pages, 1440 and 390 px):** desktop 53–95 graphemes per line, median ~70,
  in containers of 29–52em (median ~44em); phone 30–43. Density 1.64–1.84 graphemes
  per em across Tahoma, Thongterm, Prompt, Kanit, Sukhumvit, SF Pro TH. Body
  line-height 1.4–1.75 (median ~1.65; Thairath 2.25). Rule: Part A "Content widths".
  Detail: [evidence.md](../assets/evidence.md) "Thai line length".
- Thai display line-height follows Part A (never the 0.85–1.0 Latin
  display values; check marks don't clip). Set `:lang(th)` overrides.
- No negative tracking on Thai; none of the Thai sites tighten Thai text.
- For product UI choose one family covering both scripts (IBM Plex Sans Thai,
  Noto Sans Thai, LINE Seed Sans TH, Anuphan); pair a looped body face with a
  loopless display face only for brand voice.

### 10. Gallery work vs shippable UI

Learn the restraint and scale contrast; don't copy:

- device mockups, tilt, motion blur, scenes (12/14 Behance, 7/18 Dribbble)
- body or UI text at 8–10px; scattered micro-copy over busy images
- text on photos without contrast checks; dimmed half-paragraphs below 4.5:1
- fake or impossible data, placeholder logos, invented social proof
- single-viewport compositions with no mobile reflow (ghost wordmarks, 160px text)
- justified narrow columns, long all-caps body text
- AI hero art as the whole design idea

Only 4/14 Behance projects showed interaction or error states; galleries are
evidence of visual direction, never of usability.

### 11. Correct-but-plain tells

| Tell | Fix |
|---|---|
| 1.5 line-height and 0 tracking on big headlines | §1 tables (Latin only) |
| Bold 700 on headlines and every label | display 400–500, labels 500 |
| #000 on #fff | ink on off-white ground |
| Many sizes in the 13–24px band | named styles on one scale; drop the middle band |
| Many greys | three tones or ink alpha |
| Brand color on every button, icon, heading | ink primary; accent ≤2 strong uses per viewport |
| Equal 16px gaps everywhere | three gap bands |
| Mixed radii; 8px on everything by default | choose a radius camp; nested formula |
| Bordered + shadowed card for every block | space first; hairline or tint; shadows only on floats |
| Gradient blob / icon-in-tinted-square grids | one bespoke visual from the subject |
| Two or more signature moves at once | keep one |
| Orphan word on headline last line | `text-wrap: balance`, manual meaningful breaks |
| Round fake numbers, "Acme", filler verbs | §8 |
| Thai at 1.3 line-height with tracking | §9 |

### 12. Starter presets

Only when no design system exists, after the idea sentence. Swap palette and
face for the subject; a preset is a metric bundle, not a look to ship as-is.

**A. Neutral product (light)**
```css
--font: "Geist", "IBM Plex Sans Thai", system-ui; --mono: "Geist Mono", ui-monospace;
--ground: #fafafa; --surface: #fff; --surface-2: #f4f4f5;
--ink: #171717; --ink-2: rgb(23 23 23 / .62); --ink-3: rgb(23 23 23 / .45);
--line: rgb(0 0 0 / .08); --accent: oklch(.58 .2 258);
--r-control: 8px; --r-card: 16px; --r-pill: 9999px;
--shadow-float: 0 0 0 1px rgb(0 0 0 / .04), 0 8px 24px -6px rgb(0 0 0 / .10);
--ease: cubic-bezier(.22,1,.36,1);
/* 12/16 · 14/20 · 16/24 · 20/28 −.01em · 30/36 −.015em · 48/52 −.02em · 64/66 −.03em; 400/500/600 */
```

**B. Dark technical**
```css
--ground: #0b0b0c; --surface: rgb(255 255 255 / .03); --surface-2: rgb(255 255 255 / .06);
--ink: #f4f4f2; --ink-2: rgb(244 244 242 / .6); --ink-3: rgb(244 244 242 / .4);
--line: rgb(255 255 255 / .08); --highlight: inset 0 1px 0 rgb(255 255 255 / .06);
```

**C. Editorial / brand**
```css
--display: a text serif or foundry grotesk at 400; --ui: grotesk;
--ground: tinted off-white from the subject; --ink: dark tint of the brand hue;
--r-*: 0–4px; shadows: none; labels caps 12px +.08em; body 17/28.
```

**D. Thai-first** — add to any preset
```css
:lang(th) { letter-spacing: 0; line-height: 1.6; }            /* body 1.55–1.7 */
:lang(th) :is(h1, h2, h3) { line-height: 1.25; }             /* display 1.15–1.25 */
```

### 13. Craft pass

After UX decisions and the idea sentence are settled:

1. Map project tokens (or a preset) onto §1–§4 roles; define named text styles.
2. Reduce: one radius camp, three text tones, one accent, few type steps.
3. Set display type: weight, tracking, line-height by size; balance line breaks. A
   print or poster direction puts the hero headline at poster scale (about 6–6.5rem on
   desktop, Thai included); 5rem in a half column reads as a heading, not a poster.
   One hero picture may break out of its band edge into the next section (one per page).
4. Apply the gap bands; replace containers that spacing can do.
5. Shadows only on floats; hairlines only where they carry meaning.
6. One bespoke hero visual plus a visual anchor in most sections
   ([visual-assets.md](visual-assets.md)); at most one signature move.
7. Content realism pass (§8).
8. Render desktop + 390px; run the design-quality critique and
   `scripts/contrast.py`; compare side by side with one benchmark site of the
   same category from the evidence files.

Ship checks (marketing pages): skip link, focus rings, current nav item, no `#`
links, 404, legal links, favicon, title/meta/OG, alt text, form validation,
no horizontal overflow at 390px with the primary action in the first screen.

### Credits

Content realism, nested-radius threshold, named text-style groups, motion
easing and ship checklist adapted from
[elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills)
(MIT, © 2026 Elaya; parts derived from Leonxlnx/taste-skill, MIT). Not adopted
as rules, because the measurements contradict them or they conflict with
design-quality: banning Inter/Helvetica, banning italics, gradient-filled hero
headings, a mandatory word-by-word tagline reveal section, a fixed list of
dark backgrounds.

Do not cite these measurements as proof that a design converts or is accessible.
