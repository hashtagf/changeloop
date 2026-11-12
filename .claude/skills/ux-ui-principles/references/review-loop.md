# Review loop — refinement verbs, scorecards, hard gates

Separate building from reviewing. Name the problem precisely before fixing
it; "make it nicer" is not a fix. Review the **render**, not the code alone
([render verification](render-verification.md)). `scripts/slop_check.py` is this skill's
anti-pattern detector.

## 1. Refinement verbs

When the user (or your own critique) asks for a change, map it to one verb,
change only what that verb covers, and check its result.

| Verb | Use when | Change | Check after |
|---|---|---|---|
| critique | Need to know what's wrong | Nothing — list findings by severity | Each finding has evidence + fix |
| audit | Technical quality unknown | Nothing — run `render_check.js`, `contrast.py --css`, `slop_check.py`, state and perf checks | Pass / fail / not tested per check |
| polish | Near done | Alignment, spacing rhythm, icon weight, borders, optical alignment | Side-by-side render shows no regressions |
| bolder | Page reads flat / generic | Stronger focal point, scale contrast, one brand move | Focal point identifiable in 1 s |
| quieter | Too loud, too many effects | Remove shadows/gradients/colors; signal budget ≤ 2 per element | Fewer competing signals, hierarchy intact |
| distill | Dense, confusing | Cut or defer elements, progressive disclosure | Main task needs the same or fewer steps; nothing required was hidden |
| typeset | Weak type hierarchy | Scale, weight, leading, measure, Thai line-height | Headings vs body distinct; line length 60–75 ch (Latin; [visual system](visual-system.md) Part A) |
| layout | Proportions off | Grid, composition, spacing steps | Edges align; related items grouped |
| colorize | Color decorative or unclear | Map color to roles and statuses | Every color has a role; contrast passes |
| animate | No interaction feedback | Purposeful transitions (durations in [motion](motion.md) §2), reduced-motion path | Motion explains change; nothing blocks input |
| harden | Breaks on real data | Long text, empty, error, overflow, permissions, slow network | Each state rendered once |
| adapt | Mobile/tablet poor | Reflow, touch targets, nav collapse | 320 px and 200% zoom usable |
| optimize | Slow | Image sizes, lazy load, skeletons, bundle | LCP/INP/CLS measured, not guessed |
| clarify | Copy confuses | Labels, errors, empty states, glossary | One name per object/status — [content design](content-design.md) |
| delight | Works but feels flat at a real emotional moment | One small moment tied to success or first value | Skippable; repeat use is not slower; nothing on error, payment or delete |

### 1a. Verb playbooks

**Before any verb.** State the scope in one line: what changes, what must stay. Ask one
question only if the verb lacks an input: bolder/quieter → target section and what stays
untouched; polish → quality bar and deadline; colorize → existing brand colours; animate →
performance budget; clarify → what the audience knows and how they feel at that moment.
Refinement keeps identity, copy and behaviour. If the concept itself is wrong, say
"redesign" and stop; do not polish a look that should be replaced.

**By surface.** Marketing pages: verbs may change voice. App and reading screens: bolder
means precision, quieter means less chrome, animate means feedback only.

- **bolder.** Lift the target to the level its strongest neighbour already reaches, with the
  system's own type scale and motif. No new colour, font, radius or shadow; if one is
  needed, name it and ask. One decisive move, then quiet everything around it; if
  everything got louder, the section got flatter. Skeleton test: strip the copy; the
  structure alone still shows what leads.
- **quieter.** List the intensity sources first (saturation, contrast, weight, motion,
  decoration, scale). Saturation to 70–85 %, weights one step down (900→600, 700→500),
  motion travel 10–20 px with no bounce, glows and stacked shadows removed. Keep 1–2 bold
  anchors. Quiet is not generic: grey text on white, one weight and a grid of equal cards
  is a failure.
- **distill.** Name the one primary goal. Limits: 1–2 colours plus neutrals, one family,
  3–4 sizes, 2–3 weights, one primary action. List each removed item and where users can
  still reach it.
- **polish.** Classify each defect: missing token · one-off (a shared component exists) ·
  concept mismatch (flow differs from sibling screens) · local defect. Fix at the narrowest
  correct level. Order: broken task → missing states → flow and drift → visual → code
  cleanup. End by reading the diff for churn, dead CSS and debug output.
- **animate.** Write a motion plan before code: one focal moment, continuity, feedback,
  budget ([motion](motion.md)).
- **delight.** One thesis tied to a real emotional moment (success, first value). Never on
  error, payment or deletion; skippable; must not slow repeat use.

### Product-UI polish pass

Mandatory once for BUILD/IMPROVE of dashboards, admin and ERP screens (public pages use the
[craft pass](visual-system.md)). Bounded: one round over this list, then stop; no new features, copy or
structure changes (those are other verbs). Keep before/after renders at 1440 and 390.

| # | Check | Done when |
|---|---|---|
| 1 | Spacing rhythm | Paddings and gaps come from the token scale; related items closer than unrelated ones |
| 2 | Alignment | Card edges, table columns and baselines line up; cards in a row share a bottom edge; no block stretched to emptiness |
| 3 | Type | Three text tones, tabular figures for numbers, Thai line-height intact, no orphaned labels |
| 4 | Icons | One family, same size per context, optically centered with text, same stroke |
| 5 | Control states | Hover, active, focus, disabled, selected on every control and row; same treatment everywhere |
| 6 | Surfaces | One border-or-shadow strategy; no doubled borders; quiet chrome ([app-screen rules](app-screen-rules.md)) |
| 7 | Motion | 120–150 ms on hover/focus/drawer/toast only; `prefers-reduced-motion` branch |
| 8 | Realistic fill | Real-length Thai names, long values, large numbers, empty and first-run states look intended |

Report the changes made per number and anything left (with reason). A pass that finds nothing says so.

Thai shorthand mapping: "ดูธรรมดา / ไม่มีอะไรเด่น" → bolder; "รก / ลายตา" →
quieter or distill; "อ่านยาก" → typeset; "ไม่ลงตัว" → layout; "สีมั่ว" →
colorize; "พังบนมือถือ" → adapt. Diagnosis detail: [design quality](design-quality.md) §7.

## 2. Critique format

```
[severity] where — what is observed (evidence: screenshot/state/viewport)
  impact: which task or user is affected
  fix: verb + concrete change
  verify: how to see it is fixed
```

Severity: **blocker** (hard gate, §5) · **major** (task slowed or error-prone)
· **minor** (polish) · **note** (taste, optional). Fix blockers and majors before polish.

Mapping to the scale in [validation](validation.md) and
[templates](../assets/templates.md): blocker → Critical or High; major →
Medium; minor → Low; note → Low (taste). In the HTML report, P0 = blocker and P1 = major. "Critical" here is a severity, not the
Critical rigor tier ([framework](framework.md)).
Use this line format while critiquing and fixing; when the deliverable is the audit
itself (AUDIT mode), convert the lines into the Audit finding table in
[templates](../assets/templates.md).

**Persona walk.** Walk the main task as 2–3 of: impatient power user (shortcuts, bulk
actions) · first-timer (jargon, no undo) · keyboard / screen-reader user · stress tester
(long, empty, rapid input, back button) · distracted one-thumb mobile user. Each red flag is
a finding. Also check cognitive load: more than ~7 unordered choices at once, data the user
must remember from an earlier screen, hidden navigation, two tasks demanded at once.

## 3. Visual scorecard (final score, internal rubric)

| Criterion | Weight |
|---|---|
| Typography | 20 |
| Spacing & alignment | 20 |
| Visual hierarchy | 20 |
| Color & contrast | 15 |
| Component consistency | 15 |
| Responsive polish | 10 |

## 4. UX scorecard (internal rubric)

| Criterion | Weight |
|---|---|
| Task & goal alignment | 25 |
| Workflow efficiency | 20 |
| Information clarity | 20 |
| Interaction & feedback | 15 |
| Accessibility & error recovery | 20 |

Score each criterion 0–10, multiply by weight/10, sum to 100. Score visual and
UX separately — a beautiful page can fail its task and a usable page can look
unfinished. Bands: 90+ excellent · 85–89 ready for review · 70–84 refine · < 70 rework.
These two scores (visual, UX) are the final scores to report; apply the caps and the real-site
calibration in §8 (strong real sites sit near
75–80, so 85+ is rare and needs evidence).

These are this skill's own rubric, not an industry standard. A score is a
reviewer's judgment, not evidence of usability; it never replaces testing with
representative users ([validation](validation.md)). Report the score with the
two or three findings that cost the most points.

## 5. Hard gates — block delivery regardless of score

| Gate | Failure class |
|---|---|
| A primary action cannot be activated | Functional |
| Success shown before the backend confirms (money, approval, submit) | Incorrect state |
| A role without permission sees sensitive data | Security / privacy |
| The main action is unusable on the supported mobile width | Responsive |
| A critical function is unreachable by keyboard or has no visible focus | Accessibility |
| An error state has no recovery path | Workflow |
| A form submits with no validation, shows no field messages, or clears input on error | Workflow |
| A financial amount, fee or total is wrong or misleading | High-risk information |
| A check is reported as passed without having been run | Verification |

## 6. State coverage before review

A default-state-only design is incomplete. For each page, render or specify
the states that apply: default · loading · empty (first use) · no results ·
validation error · request error · partial failure · permission denied ·
timeout / unknown outcome · offline / reconnect · conflict (edited elsewhere) ·
success · disabled / unavailable. Details per state:
[patterns](patterns.md),
[component states](component-states.md).

## 7. Loop

Critique → fix blockers/majors → re-render → audit → polish → re-render →
score → report. Write the visual judgement **before** reading script output, then merge
and note what each caught alone; a clean scan is a floor, not a pass. Stop when gates pass and remaining findings are minor or
notes; list those as known limitations rather than silently dropping them.

## 8. Calibration and caps

Keeps scores comparable and stops them drifting upward. Not a second rubric: apply it to the two §3–4 scores and show which cap applied. The 1–5 pre-emit check in [gate tiers](gate-tiers.md) §2 is plan-only.

### 8a. Caps

Calibrate to strong real sites at about 75–80 on each 100-point scorecard; 85+ is rare.
Caps override the arithmetic:

| Condition | Cap |
|---|---|
| Automated check failed, or a headline runs past its line limit ([visual system](visual-system.md) Part A "Headline length") | Visual and UX 60–65 |
| Fewer than 4 real pictures on a page that needs them | Visual 65 |
| Blank stretches taller than half a screen, or unequal outer margins | Visual 65 |
| Placeholder or invented content shipped as real | UX 50 |
| No primary action on the first screen | UX 70 |
| Anything covers a headline | UX 60 |
| A reveal that never fires leaves a blank band | UX 50 |
| A banned device ([design quality](design-quality.md) §2) visible in a screenshot | Visual 65 |
| A section the brief asked for is missing or reduced to a few words | UX 60 |
| First screen has no title saying what this is | UX 60 |
| A section of running text has no heading | UX 70 |
| Two or more desktop screens mostly empty, or small grey body text | Visual 65 |
| The idea passes the competitor test (any rival could ship it) | Visual 70 |
| Page barely moves, or every block has the same fade | Visual 70 |

Self-scoring: if your first score for your own work is 85+, rescore as a reviewer who did
not build it. Still under 75 after round 3: say so and list what is left. Never round up.

### 8b. Round report (same every round)

One-second view · idea sentence · the one live thing · one layout word per
section · scores · caps applied · top 3 problems, each with the screenshot and
the fix. **Fix in this order:** idea → hierarchy → composition → type → imagery
→ colour → detail → motion. Never refill a gap with an ornament.

### 8c. Layout-word sameness

Write one word per section (split, list, grid, statement, table…). The same
word twice in a row, or three times on the page, means the template is showing.

### 8d. Headline arithmetic

Characters per line ≈ container width ÷ (font size × k): k = 0.40 condensed,
0.50 grotesk/serif, 0.58 wide or all-caps; test Thai separately. A 390px phone
at 36px holds about 40 characters over two lines. Use `max-width` in `ch` and
`text-wrap: balance`; cut words before shrinking type. A statement or quote is
a `<p>` of ≤ 25 words at ≤ 36px.

### 8e. Frame checks

Equal left and right margins; no section keeps its text in one half with the
other half empty; no empty stretch taller than half a screen; a hero that is
only an oversized motif with nothing to read counts as a hole.

### 8f. Evidence for the bans (optional)

Top vs weak sites in the study: icon-topped cards 1% vs 28%, 3+ tracked
uppercase labels 6% vs 43%, gradient fills 22% vs 52%. Hero headlines: median
5 words, 70% fit in two lines.

## Report format (optional)

When the user wants a shareable review, produce the report from your findings with
`python3 scripts/review_report.py findings.json` (writes `review.html` next to findings.json; `--out` elsewhere; `--template` prints an example): one score per
criterion of §3 or §4 (0–10, the same criterion score as the rubric) with its band (0-4 Broken, 5-6 Functional, 7-8 Strong, 9-10 Exceptional; the 90+/85/70 bands above apply to the 100-point totals), evidence that cites elements, a radar
chart, then three lists: **Keep** (do not touch), **Fix** (P0/P1, costly) and **Quick wins** (5 to 15 minutes, big effect).
Do not average dimensions away: a 9 and a 4 stay visible. The score itself comes from the rubric above; the report only
changes the presentation.
