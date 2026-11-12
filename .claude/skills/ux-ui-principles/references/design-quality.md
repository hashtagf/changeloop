# Design quality — avoiding the generic look

UX correctness does not make a page look designed. Pages produced quickly
(by people or by AI) tend to converge on the same defaults, and visitors read
those defaults as "template". This file is the skill's own checklist for
distinctive, intentional visual work, especially public pages (landing,
marketing, product). It complements [design-quality.md](design-quality.md) (focal
point, signal budget, feedback diagnosis) and [customer-ui.md](customer-ui.md)
(page structure and content).

It was written after a landing page went through three rounds: a "blueprint"
version full of template devices, a cleaner version that still had them, and
a final version built around working product fragments. The lessons below are
project recommendations; they are taste guidance, not research findings.

**Reading order for "make it beautiful / ทำให้สวยขึ้น" and every public page:**
this file first (what to avoid), then [visual assets](visual-assets.md) (what to
show in each section), [visual system](visual-system.md) Part C (values), and
[design quality](design-quality.md) §7's critique. Inspect the screenshots before calling
the page done.

## 1. Plan before code, then review the plan

Write a short plan first, then compare it with what you would produce for any
similar brief. Change every part that would come out the same.

| Plan item | Write |
|---|---|
| Subject, audience, the one action | One line each |
| Subject inventory | 8–12 things that belong to this client and no competitor: name and its meaning, place, numbers, constraints, materials, rituals, printed artefacts of its world |
| The idea | "On this page, **[something from the inventory]** becomes **[the main visual device]**." |
| Competitor test | Put the nearest competitor's name in the sentence. If it still works, the idea is the category, not the client; strengthen it or record that the brief lacks the information |
| Subject shapes | Name 3–5 physical objects from the client's world (a coffee roaster: bean, cup, kraft bag, rubber roast stamp, cupping bowl) and their shapes. Buttons, cards, photo crops and the one signature element take their shape from these objects. A direction recipe's radius is a default: keep it only when the objects agree (print, poster, architecture and data subjects often are square). A user who says "เหลี่ยมอีกแล้ว" is telling you this step was skipped |
| Subject edges | One edge shape from the same objects for the hero's bottom edge, repeated once at the closing band: a café awning scallop, a receipt perforation, a torn ticket, a folded bag top. Straight edges everywhere else. It is the cheapest way to make flat colour bands look made for this client |
| One live thing | One thing the visitor can do with real content (pick their problem and operate a fragment, choose an option and see the result), works on a phone and without script |
| Tokens | Ground, ink, one accent (plus at most one field colour); one typeface, two at most (plus an optional mono for code/data); 3–5 type sizes used ([visual-system.md](visual-system.md)) with a decisive jump from body to headline |
| Section argument | One line per section: the claim and its proof. Delete sections with no claim; don't default to hero → logos → three features → testimonial → pricing → CTA |

If the brief lacks subject facts (as with a company whose site can't be read),
say so; a page built on category ideas will look like the category.

## 2. Template devices to avoid by default

This section owns the device list; other files link here. The devices are Reflex
rules ([gate-tiers.md](gate-tiers.md) §1): use one only when the brief asks for it
or you can defend it in one sentence, which is the waiver line. This list removes
defaults; it does not remove visuals. Every device you drop must be replaced by
a visual anchor from [visual-assets.md](visual-assets.md), not by empty space.
Tells date: every published "use X instead" becomes the next tell. Replace a device
with a procedure (derive it from the subject), never with a named font, colour or
component. A page with every tell removed and nothing added is a tell too.

| Device | Use instead |
|---|---|
| Small uppercase or monospace label above every heading ("eyebrow") | Put the information in the heading or first sentence; a single label that carries a true fact (date, version) is allowed ([recipes](direction-recipes.md)) |
| Monospace for captions, labels and numbers outside code | The text face with tabular figures; exception: micro labels that carry true facts in print-led directions |
| Index numbering (01 / 02 / 03) on content that is not a sequence | Position, size and words; a real ordered list only for real sequences |
| One word in the headline in a different color, italic or weight | Let the words carry emphasis; one face, one colour |
| Rows of identical rounded cards with an icon in a tinted square | Varied compositions: bento with one large fragment, icon-led lists, splits. Icons themselves are fine with labels in one family ([visual-assets.md](visual-assets.md) §3) |
| Hero-metric template (big number + label + supporting stat); sparkline or progress-ring filler | The one number that matters, in its sentence or a real chart |
| Icons from two sets on one page (Lucide beside Font Awesome or Phosphor), two stroke widths, outline beside filled | One family with one stroke ([iconography.md](iconography.md) "Icon libraries"); draw a missing glyph in its style. Brand logos are a separate role (`slop_check.py` mixed-icon-*) |
| Coloured `border-left/right` over 1px on cards or alerts; hard offset shadows (outside neobrutalism); gradient text; emoji or Unicode glyphs as icons | A tone step, a leading icon from one family, plain text |
| Hairline borders and grid lines everywhere | Space and tone steps between surfaces |
| Gradients as decoration; glows; soft grey shadows on resting elements | Flat colour; shadows only on things that float (menus, dialogs) |
| Dark navy or near-black with one neon accent, blueprint grids | A palette taken from the subject; a light or mid ground is fine |
| Warm cream background with serif display and terracotta accent | Same: choose from the subject |
| Middle-dot meta strings ("A · B · C") and "→" appended to links | Plain sentences and labels |
| Fake interfaces made of grey bars, browser/laptop frames | Real, working interface fragments with real labels and numbers, composed into a scene; a simple phone outline is fine on app pages ([visual-assets.md](visual-assets.md) §5) |
| The same photograph used twice on one page (hero and a later section), even recropped | One picture per job; with only one usable photo, use type, a fragment or a marked slot (`[รูปหน้าร้าน]`) for the second section (`slop_check.py` duplicate-image) |
| A badge, stamp or ornament overlapping a headline or button text | Move the decoration onto the picture or the panel edge; text stays clear at every width (`render_check.js` reports decoration-over-text) |
| Headlines of three or more lines | Cut words to fit two lines at every width (roughly 25–35 Thai/Latin characters at display size); Thai limits in [visual-system.md](visual-system.md) "Headline length" |
| `mix-blend-mode: difference` text over colour (random hues) | A solid ink chosen for the ground |
| A display line bleeding a few px off one edge (reads as a mistake) | Fit it, or bleed by a clear, deliberate amount |
| Agency micro-meta: local time, coordinates, weather, version stamps, "© — Scroll" | Remove, unless it is the subject's real data |
| Video with no poster frame (blank box while loading) | One honest muted loop with a poster |
| Structural hacks: negative margins undoing parent padding, escape-hatch `calc()`, absolute positioning to dodge flow | Fix the container |

## 2b. Structural slop — beyond surface devices

Surface devices (§2) are styling; structural slop is the *shape* of
the page coming out the same whatever the brief.

| Structural slop | Sign | Fix |
|---|---|---|
| Same skeleton for every brief | Hero → logo strip → 3 features → testimonial → pricing → CTA, regardless of subject | Section argument (§1): order sections by what this audience must believe, in what order |
| Every section the same composition | Centered heading + grid of N, repeated | Neighbouring sections use different compositions (§4) |
| Every heading decorated the same way | Eyebrow + heading + subline on all sections | Decorate none, or only the one that carries the idea |
| Forms with no behavior | Inputs and a button, no submit, validation, error, success | Specify the whole loop or show it as non-interactive |
| Components without states | Only default shown; no hover, focus, loading, empty | [component states](component-states.md) |
| Interchangeable dashboards | KPI tiles + one line chart + a table for every product | Start from the role's question — [design direction](design-direction.md) §2 |

**One strong idea.** One idea sentence per page (§1), not a collection of
trends. If two ideas compete, pick one and drop the other.

**Variety across products, consistency within one.** Two different products
should not share a skeleton. Pages inside one product must share tokens,
navigation, components and patterns; variety there is a defect.

**Respect an existing design.** If the product already has a recognizable
language, work inside it. Do not redesign unrequested pages or swap the style
to look "fresh"; propose it separately if you think it is warranted.

**Detect, then look.** `python3 scripts/slop_check.py page.html` flags §2 and
§2b patterns deterministically (eyebrow labels, accent-word headlines,
gradient text, identical icon-card rows, too many typefaces or radii, filler
copy, inert forms, removed focus, motion without reduced-motion). Each hit is
a prompt to inspect the render, not a verdict.

## 3. Substance — don't trade it for restraint

Removing ornaments leaves space. Fill it with **scale** (make the main thing
larger), **full content** (every section delivers its information), **real
pictures** of the subject's world or **working fragments** of the product, or
a **field of flat colour**. A clean but thin page loses to a richer page.

For software companies and apps, the strongest picture is the product doing its
job: small, believable, working fragments at real interface size (an approval
card you can approve, a table whose total updates, a booking slot you can pick),
not screenshots shrunk until unreadable.

## 4. Frame and rhythm

- Equal outer margins at every width; text blocks share two or three left edges.
- Gaps between sections clearly larger than any gap inside one.
- No section leaves half the width empty; close every void with its picture,
  list or figure.
- Neighbouring sections use different compositions.
- Carry the idea past the first screen: process, pricing, FAQ and footer too.
- The footer is a designed close (for example the name at full width), not a sitemap.
- Read each desktop screen as a poster: one dominant thing plus the content it carries.
  At most one deliberate rest per page, and it is a placed picture or colour field,
  never nothing.

## 5. Look at the render and critique it

Use screenshots at desktop and phone width, not the code. Make each pass on its own:

1. One second: is there exactly one thing you remember? Five seconds: what is
   it, for whom, what to do?
2. Squint: two or three masses with clear size differences?
3. Cover the logo: could this belong to a competitor?
4. Edges: how many distinct left edges? (Two or three is composed.)
5. Space: accidental holes, empty half-widths, sections that look the same?
6. Type: decisive headline jump, ≤5 sizes, headlines ≤2 lines (Thai ≤3 at 1440, ≤4 at 390: [visual-system.md](visual-system.md) "Headline length"), no orphan word?
   No gap before punctuation ("address .") from letter-spacing or a fallback font?
7. Shape: do corners, buttons and crops come from the subject's objects (§1 Subject shapes), or from the recipe by habit?
8. Colour: where is the accent? Only on the action and perhaps one detail?
9. Pictures: real and doing a job, or decoration and placeholders? Does every
   content section have a visual anchor? More than a third text-only fails
   ([visual-assets.md](visual-assets.md) §1).
10. Phone: its own composition, or the desktop squeezed? Is the primary action above the 390×844 fold and the offer on the first screen (`scripts/fold_check.js`)?
11. Template devices from §2 still visible?

Score with the visual and UX scorecards in [review-loop.md](review-loop.md) (the final visual and UX scores); fix the top three
problems; look again. Three rounds at most. Report what still falls short.

## 6. Honest content

- Sample interface data and sample details are fine for showing density;
  list them for the client to confirm.
- Never invent proof: customers, logos, quotes, reviews, statistics or awards.
- Placeholders that must be replaced belong in a short note and the hand-off,
  not as decorative badges all over the page.

## Do / Don't

| Do | Don't |
|---|---|
| Write the idea sentence and run the competitor test before code. | Start from a hero-features-testimonial template. |
| Show the product working at real size. | Draw a dashboard of grey bars in a laptop frame. |
| Use one accent on the action. | Colour headings, icons, borders and one headline word with the accent. |
| Fit headlines in two lines at every width (Thai: see visual-system "Headline length"). | Let a 40-character headline wrap to four lines on a phone. |
| Fill space with scale, content or real pictures. | Fill space with labels, rules, gradients or blobs. |
| Replace each removed device with a visual anchor. | Answer the avoid-list with a page of text. |

## 7. Craft — from correct to well-made (focal point, containers, signal budget)

Formerly design-quality.md: start from the existing system, one focal point per screen, containers by role, the signal budget and how to diagnose "ดูยาก / รก / ไม่สวย" feedback.

A screen can satisfy every UX rule and still look unfinished: every section in
an identical box, every element the same weight, generic color, no focal
point. This file covers the composition decisions that separate a correct
wireframe from a credible product UI. It complements [visual-system.md](visual-system.md)
(hierarchy, type, grouping, task-led layout); token structure is in [visual-system.md](visual-system.md)
and component choice in [components-usage.md](components-usage.md).

These are project recommendations for craft quality, not research findings.
Visual polish never overrides task evidence, accessibility or the project's
existing design system; within those, it is part of the job.

### Start from the existing system

1. Use the project's tokens, components and patterns when they exist.
2. If none exist, define a compact token set first (4–6 color roles, 2 type
   roles + optional data face, spacing scale, radius, elevation) and build only
   from it. Record it in DESIGN.md ([design memory](design-memory.md)); the context card only links it.
3. A new aesthetic needs a reason tied to the product, brand or audience.
4. When tokens move between tools, the Design Tokens Format Module 2025.10 is a
   stable Community Group report (not a W3C Standard) [S58]; Figma variable
   modes can hold theme, language or device values [S59]. Token structure is in
   [visual-system.md](visual-system.md).

### One focal point per screen

Decide the single most important thing on each screen (the decision, the
amount, the next action) and give it the strongest contrast of size, weight or
color. Everything else steps down. If three elements compete equally, the
hierarchy is undecided. [S23]

Examples: the appointment time on a booking ticket; the amount and decision on
an approval; the exception list for an operator dashboard.

### Containers by role, not by habit

| Problem | Fix |
|---|---|
| Every section wrapped in an identical bordered card | Use whitespace and a heading to separate sections; reserve a container for an object users act on or compare |
| Cards inside cards inside cards | One level of containment per region; use dividers or spacing inside |
| Same radius, shadow and border on everything | Elevation marks what floats (menus, drawers, sticky bars); borders mark selectable or separate objects |
| Accent stripe on every card | Use color stripes only to encode state (severity, selection) |

### Color roles

- **Neutral base** with a slight hue bias toward the brand; avoid pure mid-grey
  everywhere.
- **One accent** for primary actions, selection and focus links. Use it
  sparingly so it signals "act here".
- **Semantic colors** (success, warning, critical, info) are separate from the
  accent and always paired with text or icon. [S03, S04]
- **Data colors** for charts come from a validated categorical/sequential set,
  not the accent repeated.
- Design light and dark themes deliberately; don't simply invert.

### Typography

- Two families at most (display/heading + body), plus a monospace or tabular
  face for IDs and numbers if useful. For Thai, choose fonts with good Thai
  glyph design and test real copy (see [visual-system.md](visual-system.md)).
- A small type scale used consistently (step count and sizes:
  [visual-system.md](visual-system.md)). Large size jumps for
  the focal element, small steps elsewhere.
- Labels quieter than values in data displays; numbers in tabular figures.
- Line length: measure in [visual-system.md](visual-system.md); test
  Thai with real paragraphs.

### Space and alignment

- Use a spacing scale from tokens; larger gaps between sections than within
  groups so grouping is visible (proximity). [S30]
- Align to a small number of vertical edges. Ragged starts make even simple
  forms look careless.
- Repeated items (cards, rows, KPI tiles) share identical padding, internal
  alignment and baseline positions.
- Fill the layout with real content; sparse placeholder data hides density
  problems and makes layouts look emptier than they will be.

### Density

| Mode | Use for | Notes |
|---|---|---|
| Comfortable | Customer UI, infrequent tasks, touch | Larger targets and spacing |
| Compact | Expert back-office lists and queues | Smaller row height, still meeting target-size and contrast criteria [S07] |
| Expanded | Reading detail, onboarding | More explanation, larger type |

Back-office screens usually need more information per view than marketing
pages. Increase density by removing decoration, not by shrinking text below
legibility.

### Selection and state styling

Selected, hover, focus, disabled and error must be visually distinct and not
rely on color alone. Selected options in a choice group should look clearly
chosen (filled or strongly outlined), not just slightly tinted. Focus
indicators remain visible on every surface.

### Data display

- Charts: one scale per axis, labels that name values the chart reaches, target
  or comparison lines where they help decisions, emphasized latest value.
- KPI tiles: value + unit + comparison + time window; highlight only abnormal ones.
- Status: pill or text label with consistent vocabulary; severity stripes for
  queues and alerts.

### Motion

Use motion to explain change, avoid decorative motion on operational screens;
durations, reduced motion and all other rules: [motion.md](motion.md). [S16]

### Avoid the generic look

See [design-quality.md](design-quality.md) for the full plan-review process,
template-device list and critique loop. In short, unconsidered defaults make
products look templated: identical rounded boxes,
centered everything, a purple-to-blue gradient hero, emoji as section markers,
one stock font for everything, numbered markers on content that is not a
sequence. Choose deliberately from the product's own world (its units,
documents, vocabulary) and keep boldness in one place per screen.

### Signal budget

Every visual property you use (fill, text color, border, ring, icon, badge,
opacity, dashed line, size, weight) is a signal. Small elements — cells, chips,
list rows, table status columns — can carry **one value and at most one status**.
When more information is needed, move it to the row/column header, a tooltip
plus detail view, or a separate column. Prefer text ("−1", "เกินกำหนด") over
abstract marks. Never use opacity as a state on informative content.

### Diagnosing visual feedback

When people say a screen is hard to read or "not beautiful", diagnose before
repainting:

| Feedback | Likely causes | First fixes |
|---|---|---|
| "ดูยาก / อ่านยาก" (hard to read) | Too many signals per element; text color changes with background; low contrast; faded states; small type | Apply the signal budget; one text color per ramp; check pairs with `scripts/contrast.py`; remove opacity states |
| "สีดูยาก / สีแรง" (colors are hard) | Saturated or dark fills dominate; semantic colors used for decoration; ramp steps too similar or too extreme | Lighter ramp, darkest step reserved; semantic colors only for exceptions; test both themes |
| "รก" (cluttered) | Every section boxed; repeated metadata; equal emphasis everywhere | Containers by role; move repeated facts to headers; choose one focal point |
| "ไม่สวย / ดูเหมือน wireframe" (plain, unfinished) | No focal point; default fonts and greys; placeholder data; identical boxes; template devices (eyebrows, mono labels, card rows, hairlines, gradients) | Write the idea sentence and run the competitor test ([design-quality.md](design-quality.md)); focal point, real content or working fragments, decisive type scale |
| "หาไม่เจอ" (can't find it) | Weak hierarchy, action far from context, unlabeled icons | Move action next to its object, label icons, strengthen heading hierarchy |

Change the cause, re-render, re-run contrast, and show before/after. When the
right direction is unclear, offer 2–3 complete variants side by side
([prototyping.md](prototyping.md)).

### Visual review checklist

1. Is there one clear focal point, and is it the most important thing for the task?
2. Are containers used only where they mean something?
3. Is the accent used sparingly and semantic color paired with text?
4. Do type sizes follow a scale with clear steps?
5. Do repeated elements align and share padding?
6. Is density appropriate to the role and frequency?
7. Are selected/focus/error states unmistakable without color alone?
8. Does it look intentional in both light and dark themes?
9. Does it still look composed at the narrowest supported width?
10. Would a user mistake it for a wireframe? If so, what is missing: hierarchy, real content, or tokens?

### Do / Don't

| Do | Don't |
|---|---|
| Choose the focal element first, then step everything else down. | Give every heading, number and button the same weight. |
| Separate sections with space and headings. | Box every section with identical borders and shadows. |
| Reserve the accent for action and selection. | Color every icon, border and heading with the brand color. |
| Use real content and production-like data volume. | Judge a layout with three placeholder rows. |
| Build from tokens and record new ones. | Introduce one-off colors and spacings per screen. |

### Bans vs refusals, and finish details

**Reflex rules** (waivable on the record, see [gate-tiers.md](gate-tiers.md) §1;
the device list is owned by [design-quality.md](design-quality.md) §2): eyebrow/kicker
above a heading; coloured `border-left/right` over 1px on cards or alerts;
gradient text; hard offset shadows (outside neobrutalism); emoji or Unicode
glyphs as icons; hero-metric template, 01/02/03 section numbers, sparkline
or progress-ring filler, monospace as "technical" costume. The Floor is
only what gate-tiers lists as Floor.

**Finish details:** concentric radius (outer = inner + padding); `tabular-nums` on
dynamic numbers; extend hit areas with a pseudo-element; `text-wrap: balance` on
headings and `pretty` on body; image outlines at 10% black/white; theme the
surfaces you did not draw (`::selection`, `caret-color`, `scrollbar-color`,
`accent-color`, focus rings, `text-underline-offset`) from the palette. Type
scale ratio about 1.2 for dense UI, 1.25 general, 1.33 expressive; build text
levels from weight and opacity at one size.
