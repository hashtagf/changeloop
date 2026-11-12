# Design workflow — phases, references, ask points, exit criteria

The spine of this skill. Each phase lists what to do, what to read, whether
to stop and ask the user, and when the phase is done. Run only the phases the
mode needs (SKILL.md, "Route by mode"). Carry one **design context card**
([design context](../assets/design-context.md)) through every phase and update
it as facts replace assumptions.

Ask-point legend: **ASK** = stop and ask before continuing (unless the user
said to proceed without them — then pick the recommended option and log it as
an assumption). **ASK-IF** = ask only when the condition holds. **NO** = never
stop here; decide, label assumptions, continue.

---

## Phase 0 — Inspect

**Do.** Read what already exists before forming an opinion:
- Supplied artifacts: brief, screenshots, URLs, prototype, code.
- Project files: `DESIGN.md`, `PRODUCT.md`, `IDEA.md`, design context, PRDs.
- System: tokens (CSS vars, Tailwind theme), component library
  (`components.json`, `package.json`), existing screens of the same pattern.
- Available tools: browser/Playwright, Figma.

For each artifact record location, viewport, state and observed behavior. A
screenshot supports visual observations only, not keyboard, screen-reader,
server or conversion claims; a prototype supports only what it implements.

**Read.** [design memory](design-memory.md) §1–2 (what to look for, precedence).

**Ask.** ASK-IF docs and code disagree on a value that the task will touch
system-wide (report both, recommend one). Otherwise NO.

**Exit.** One line per source found/missing; conflicts listed; tools available.

## Phase 1 — Understand

**Do.** Fill the context card: product type, roles, primary job, main
action, entry context, device/input, language, data volume, risk, success
metric + guardrail. Set the **rigor tier** (Light / Standard / Critical) from
the worst plausible consequence of an error. Place the request on the
[framework](framework.md) level.

**Read.** [product discovery](product-discovery.md); [framework](framework.md)
for multi-level work; [back office](back-office.md) or
[customer UI](customer-ui.md) for role context; [sources](sources.md) when a
claim needs an external citation.

**Ask.**
- ASK if the **primary role or primary job** cannot be inferred from the
  artifacts and the tier is Standard or Critical — everything downstream depends on it.
- ASK for **business rules on Critical work** that must not be guessed: who
  may approve, limits and fees, what is reversible, legal/compliance text,
  data that roles may or may not see.
- ASK-IF the success metric changes the design (e.g. speed vs error rate
  trade-off) and none is given.
- NO for device, language, density, copy tone — infer from context and label *assumed*.

**Exit.** Context card filled; each field *evidence* or *assumed*; tier stated.

## Phase 2 — Architect

**Do.** Map the journey: entry → understand → act → feedback → recover →
finish, with the user's decision and required information at each step and at
least one failure/recovery path for the critical task. For multi-page work:
IA, page inventory with page types, navigation, URLs, deep links, role
handoffs and permissions across pages. Choose the **page pattern** for each
screen from the role's primary question; for admin pages classify the page
type first ([back office](back-office.md)).

**Read.** [experience architecture](experience-architecture.md),
[navigation grouping](navigation-grouping.md),
[design direction](design-direction.md) §1–2, [interaction](interaction.md);
[mobile native](mobile-native.md) and [notifications](notifications.md) when relevant.

**Ask.**
- ASK-IF the flow implies a **scope change**: extra pages, new roles, changed
  permissions, or removing a step the user described.
- ASK-IF two page patterns are equally plausible and they lead to different
  builds (e.g. table vs kanban for the same job) — show both in one line each.
- NO for IA labels, ordering, URL shapes — propose them.

**Exit.** Flow with failure path; page pattern per screen with a reason.

## Phase 3 — Explore

**Do.** Choose composition and direction.
- **Composition:** for complex pages sketch ≥ 2 compositions and choose by task
  success (scan path, steps to main action, what stays visible). Pick a
  [layout library](../assets/layouts/index.md) ID when one fits; adapt it to
  real content, states, permissions and widths.
- **Direction:** if DESIGN.md fixes the look, work inside it and skip
  exploration. Otherwise translate the user's words with the keyword table
  ([design direction](design-direction.md) §8), set the three dials and, for a
  new look or a public page, run the interview (§9: rounds A/B/C, user present)
  and propose 2–3 named directions (§7).
- **Motion level:** the motion dial sets what may move ([motion](motion.md) §1).
- Brand from references: [design memory](design-memory.md) §3b.

**Read.** [direction library](direction-library.md) when a new look is needed, [design direction](design-direction.md) §3–9,
[design quality](design-quality.md) §1–2b,
[visual system](visual-system.md) Part B, layout library category +
[specification](../assets/layouts/specification.md); depth in
[worked examples](../assets/layouts/worked-examples.md) and
[back-office worked examples](../assets/layouts/worked-examples-back-office.md);
external [OpenDesign references](../assets/layouts/opendesign.md) (verify before
importing tokens). After brand extraction run
`python3 scripts/design_md_check.py DESIGN.md` on the draft. Generate the first draft with
`python3 scripts/design_md.py <direction-id> --interview interview.json --out . --wire`; it also adds a marked
pointer block to `AGENTS.md` / `CLAUDE.md`.

**Ask.**
- ASK the **interview** (§9 of [design direction](design-direction.md): Round A business,
  Round B taste with pictures, Round C confirm) for every new look / public page
  without DESIGN.md or a stated direction, **before writing code**. Skip only when
  the user said they are away or to use defaults (then take recommended answers and mark them
  *assumed*); a background session is not "away".
- ASK to **pick a direction** when 2–3 are proposed for a new look — this is
  taste and brand, the user's call. Lead with the recommendation. Show
  pictures, not only names ([direction library](direction-library.md) §1); when
  the user asks for more, show the next 2-3 rather than repeating.
- ASK-IF the best direction conflicts with DESIGN.md or the existing product
  language (do not redesign unrequested areas).
- NO when DESIGN.md already decides, or for the composition of an internal
  task screen — choose by task success and state the rejected option.

**Exit.** Composition chosen with rejected option noted; direction + dials set
(user words → interpretation stated in one line).

## Phase 4 — Design (specify)

**Do.** Specify the screen so it can be built and checked: content priority,
real copy, labels, controls, component choices, every applicable state,
keyboard/focus, responsive behavior, error recovery. Answer the
[page spec](../assets/page-spec.md) rows the tier requires. Before building, state the chosen section list or layout in one sentence so the user can redirect it cheaply. Hard components (editable grid, drag reorder, pickers, rich text, mention input,
notification centre, tour, autosave form, password recovery) follow
[advanced components](advanced-components.md); every interactive part defines
default, hover, focus-visible, pressed and disabled. Use project
tokens; a new font, scale or aesthetic needs a reason. Critical work adds
security/privacy rows. External references: name source and inspected
surface, keep attribution, state what is adapted; never infer a private app
from its landing page.

**Read.** By the decision at hand, one or two files:
[components usage](components-usage.md), [component states](component-states.md),
[forms](forms.md), [advanced components](advanced-components.md), [patterns](patterns.md),
[content design](content-design.md) or [marketing copy](marketing-copy.md),
[data visualization](data-visualization.md), [ai features](ai-features.md),
[trust/security/privacy](trust-security-privacy.md);
visual: [visual system](visual-system.md) Part B (hierarchy, grouping, Thai text), [visual system](visual-system.md) Part A, [color palette](color-palette.md),
[design quality](design-quality.md) §7, [visual assets](visual-assets.md),
[visual system](visual-system.md) Part C §13 craft pass, [iconography](iconography.md).
Evidence behind values and wording, open only to justify or check a choice:
[evidence](../assets/evidence.md).

**Ask.**
- ASK-IF real content is required and cannot be drafted honestly: prices,
  legal text, claims, customer logos, statistics (never invent proof).
- ASK-IF the spec needs **new design-system values** (new color role, font,
  radius scale) on a project that has an approved system.
- NO for draft copy, state wording, spacing, component choice — decide and
  mark drafts for confirmation.

Apply principles selectively: for each decision connect evidence → affected
task → principle → proposed behavior → verification; no list of laws
disconnected from the UI. Finish with a visual pass (focal point,
containers, density, color roles — [design quality](design-quality.md) §7) and the
craft pass with measured values ([visual system](visual-system.md) Part C §13).

**Any form on the page** (sign-up, checkout, settings, filters with
input, create/edit) makes [forms](forms.md) mandatory: per-field rules
(required, format, length, range, cross-field), placeholder examples (§3),
messages for each rule, validation timing (§6) and submission states (§7).

**Public pages also need:** a palette from the keyword ([color palette](color-palette.md)
"Making it look good" + starter palettes), the mobile composition
([visual system](visual-system.md) Part B "Mobile web composition") and a motion spec.

**Motion spec** for every page at or above the motion baseline ([motion](motion.md) §1): one table of
element · trigger · motion · duration/easing · reduced-motion behavior within
the dial budget ([motion](motion.md) §7).

**Exit.** Required page-spec rows answered or N/A with reason; states listed.

## Phase 5 — Implement (only when asked to build)

**Do.** Build with the real stack, reusing components and tokens
([design memory](design-memory.md) §5). Include actions, all specified
states, responsive behavior and accessibility. Prototype rules: [prototyping](prototyping.md); page-build practices: [build recipes](build-recipes.md). Turn the chosen direction into tokens with
`scripts/export_tokens.py` ([tokens to code](tokens-export.md)): CSS, Tailwind v4 or shadcn variables, dark derived and contrast-checked.

**Keep the before.** Before changing an existing page, copy the files you will
touch (for example `index.html` → `index.v1.html`, `page.css` → `page.v1.css`)
or confirm the tree is committed, and save before-screenshots at 1440 and 390.
A redesign or direction change must always be reversible and comparable; say in
the hand-off where the previous version is and what changed.

**Ask.**
- ASK before **expanding scope**: touching pages not requested, adding a
  dependency or component library, changing tokens system-wide, migrating a stack.
- ASK before writing project documents (design context, wiring DESIGN.md into
  `AGENTS.md`/`CLAUDE.md`) unless asked or owned by the host workflow. **Exception:** a
  product-UI build (dashboard, admin, ERP) with no DESIGN.md writes the draft DESIGN.md
  first with `design_md.py --backoffice <look-id>` (or `--from-code` for brownfield).
- NO for implementation details inside the agreed scope.

Icons: navigation, primary actions, status and toolbars use icon + label from one
family ([iconography](iconography.md)); record the glyph table in DESIGN.md.

Motion follows the spec with CSS / View Transitions first; a motion library
only if the project has one ([motion](motion.md) §5–6). Reduced-motion is the
first branch written.

Forms implement the [forms](forms.md) §6b contract (rules in markup, own
messages on blur and submit, error summary with focus, pending submit,
server errors mapped, input kept), using the project's form library if any.

**Exit.** Builds and runs; specified states reachable; every form validates.

## Phase 6 — Critique

**Do.** Switch from builder to reviewer. Look at the render, not the code.
Run `slop_check.py`, then critique with severity (blocker/major/minor/note),
evidence, impact, fix and verify. Check UX (task, flow, states, recovery) and
visual (hierarchy, type, spacing, color, consistency) separately; apply the
specific refinement verb for each issue. Report the final visual and UX scores from the
[review loop](review-loop.md) §3–4 rubric, capped and calibrated by
[review loop](review-loop.md) §8 caps; run the fresh-context reviews in
[gate tiers](gate-tiers.md) §3 when subagents exist.

Product-UI builds: run the one-round [polish pass](review-loop.md#product-ui-polish-pass) here, before phase 7.

**Read.** [review loop](review-loop.md) (§8 caps), [gate tiers](gate-tiers.md), [design quality](design-quality.md) §5,
[design quality](design-quality.md) §7, [do and don't](do-and-dont.md); admin pages also
the page review in [back office](back-office.md).

**Ask.** NO — critique is internal. Fix within scope; surface taste-level
notes in the report instead of asking.

**Exit.** Findings ranked; blockers and majors have fixes.

## Phase 7 — Verify

**Order (mandatory).** Follow the run order in [render verification](render-verification.md)
"Run order": `--fast` baseline on all pages → one batch of all fixes → `--fast`
confirm on changed pages + journey once → full `--zoom` run once per page before
delivery. Never re-run a check after a single fix; report the run counts.
`python3 scripts/check.py <page>` runs first on every built page, with or without a browser
(script syntax and `window` clashes such as `const top`, template devices, contrast, state markers).

**Do.** At the depth tools allow: `node scripts/render_check.js <page>`
(`--fast` while iterating, `--zoom` full run once per page at the end; add `--reduced-motion` when the page animates; `--doctor` exit 3 → mark *not tested*, run the static checks,
never install or wait for browsers mid-task) and inspect the screenshots; drive the critical journey plus one failure path — for each form: empty
submit, one invalid value (also Thai typed into email), one request failure,
and look at the error state at desktop and phone width (rows stay aligned); when the brief covers them, also check tablet, right-to-left and dark (rules: [visual system](visual-system.md) Part B "Tablet", [i18n](i18n-performance.md) "Right-to-left", [color palette](color-palette.md) "Dark theme");
judge the 390px screenshot as its own design (header, hero, CTA in first
screen, targets, stacking);
`python3 scripts/contrast.py --css <page>`; keyboard, zoom/reflow, language,
assistive technology as relevant; the design QA list in
[measurement](measurement.md) — each item passed, failed or not tested. Check
every **hard gate** ([review loop](review-loop.md) §5). Icon check: nav and
actions have icon + label, one family, status never color alone (`slop_check.py` flags nav without icons).

**Read.** [render verification](render-verification.md),
[accessibility](accessibility.md), [i18n & performance](i18n-performance.md).

**Ask.**
- ASK-IF a **hard gate fails and cannot be fixed within scope** (e.g. the
  backend can't confirm success, a permission leak in an API) — report and ask
  whether to proceed, block, or change scope.
- ASK-IF verification needs access you don't have (login, test data, device);
  otherwise state "not tested" and continue.

**Exit.** Results recorded as observed, separate from proposed tests.

## Phase 8 — Refine and deliver

**Do.** Fix, re-render, re-check what changed (≤ 3 rounds: the single fix-round budget; [gate tiers](gate-tiers.md) §4 and [design direction](design-direction.md) §7 link here). Report: user
outcome first; decisions with rationale; findings by task impact with
severity, confidence and effort; what was tested vs not; assumptions and
decisions to confirm; success metric, guardrail and when to review after
release. Record approved decisions in DESIGN.md/design context only when asked
or host-owned; re-run `design_md_check.py` after editing DESIGN.md. [Validation](validation.md) before claiming success.
Pick the template by mode from [output templates](../assets/templates.md) "Which
template, when" (AUDIT → Audit finding; DESIGN → Design decision + Validation
plan; BUILD/IMPROVE → Design decision for choices to confirm; RESEARCH → Research
synthesis), at the depth the rigor tier sets.

**Ask.**
- ASK to **approve decisions that become system rules** (new token, pattern
  for all pages, DESIGN.md status draft → approved).
- Publishing, committing, deploying follow host rules; a design or preview
  grants no authority to do them.

**Scope and completion** (moved from SKILL.md; SKILL.md §5 keeps the summary).
- Match the deliverable to the request: do not produce a full audit for a single
  label correction, and supply design decisions and artifacts, not an automatic
  redesign of the whole product.
- Deliver actionable decisions with rationale and a way to verify each. Required
  page-spec rows for the tier are answered or N/A with a reason; no hard gate
  ([review loop](review-loop.md) §5) is failing or untested on built UI without saying so.
- When explaining intended usage or likely misuse, include the relevant
  [Do / Don't](do-and-dont.md) pairs and state contextual exceptions.
- Cover the relevant failure and recovery states; disclose untested behavior and
  assumptions.
- Use the user's output location; otherwise answer in conversation rather than
  creating unsolicited project documents.
- The skill is self-contained (foundations, component choice and states,
  prototypes and their verification). If the project already has a design system
  or tool workflow, follow it and record deviations on the design context card.

**Exit.** The scope and completion list above and SKILL.md §5 are met; open items listed, not dropped.

**Host workflow.** Follow the host's workspace, agreement, and approval rules. Within Change Loop,
record consequential choices and scenarios in the compiled OpenSpec agreement;
project providers and the harness own evidence execution and lifecycle state.
Do not create a parallel implementation ledger or treat a UX checklist as proof.
A design decision or successful preview grants no authority to publish, deploy,
commit, push, or Land.

---

## Asking well

- **One batch per checkpoint**, at most 3 questions (exception: the new-look
  interview, [design direction](design-direction.md) §9, up to 4 per round), each with a recommended
  default and what changes depending on the answer. Use the host's question
  tool when available; otherwise a short numbered list.
- Ask only what changes the design and cannot be read from artifacts, the
  repo or convention. Never ask for something you could inspect.
- Never stop for reversible choices (spacing, draft copy, component choice);
  decide and label.
- **Away / "use defaults" mode:** do not stop. Take the recommended option at
  every ASK, mark it *assumed* on the context card, and end the report with
  "Decisions to confirm" listing each one and its impact.
  Assumed directions must still match the feel the user already chose ("premium +
  playful" means soft or mixed shapes, not a sharp print look) and mix at least two
  shape treatments (e.g. round buttons, rounded cards, one free-form shape); an
  all-square page needs a stated reason on the context card. A low-motion direction
  still ships the hero entrance and once-only reveal ([motion](motion.md) §1).
- Match the user's language; Thai questions keep technical identifiers in English.
- **Shape before code** (work that is not a new look): usually one round of 2–3 questions; state the likely
  reading and invite correction. Ask only what changes the result: purpose,
  people, outcome, what only this product can claim, content ranges
  (min/typical/max), states, constraints, what must stay untouched. Never ask
  for CSS values. Return a brief, not code.

Example (Phase 1, Critical, Thai):

```
ก่อนออกแบบหน้าอนุมัติ payout ขอยืนยัน 2 เรื่องที่เดาไม่ได้:
1. ใครอนุมัติได้ — ผู้อนุมัติคนเดียว หรือ maker-checker 2 คน? (แนะนำ maker-checker สำหรับยอดเกินเกณฑ์) → เปลี่ยน flow และ permission
2. ยอดที่ต้องอนุมัติ 2 ชั้นเริ่มที่เท่าไร? → เปลี่ยนการแสดงสถานะและการยืนยัน
เรื่องอื่น (ความหนาแน่น, ข้อความ, layout) จะเสนอเป็นค่าเริ่มต้นให้ตรวจทีหลัง
```

---

## Reference → phase index

The single catalog: every file in this skill, what it answers, and the phases
that open it. SKILL.md routes requests to the first file; this table is for the
rest. Layout category files are reached through the layout index.

**Terms.** *Direction*: a named customer-page visual system (`assets/directions/directions.json`).
*Back-office look*: a style in `assets/backoffice/styles.json`. *Page*: a URL/route;
*screen*: a state of a page, or the phone/app shell. *Rigor tier* (Light / Standard /
Critical) sets how much to specify and verify; *rule classes* (Floor / Reflex / Finish,
[gate tiers](gate-tiers.md)) set how strict a rule is. *Phase 0–8* is this workflow;
[framework](framework.md)'s steps are *stages*.

| File | Answers | Phases |
|---|---|---|
| **Strategy and research** | | |
| [design workflow](design-workflow.md) | Phases 0–8: steps, ask points, exit criteria, scope and completion (phase 8), asking well, this index | all |
| [framework](framework.md) | Disciplines, levels, rigor tiers, stages; anything beyond one screen | 1 |
| [product discovery](product-discovery.md) | Problem framing, roles, evidence labels, success metrics | 1 |
| [research methods](research-methods.md) | Method chooser, interview guide, survey design, personas vs JTBD, journey maps, diary, recruiting and consent, synthesis | 1, RESEARCH |
| [sources](sources.md) | Source register (S-IDs), dates, authority, evidence discipline (claim labels, browsing, no universal rules, user control) | 1, RESEARCH, any external claim |
| [design memory](design-memory.md) | Phase 0 inspection, precedence, DESIGN.md format and generation, brand extraction (§3b), reuse (§5) | 0 (§1–2), 3 (§3b), 5 (§5), 8 (§3) |
| [brownfield](brownfield.md) | Existing product without DESIGN.md: inventory, extract, drift, baseline audit | ONBOARD, IMPROVE |
| [design direction](design-direction.md) | Eight dimensions, page pattern by question, compositions, styles, dials, named directions (§7), keywords (§8), interview (§9) | 2 (§1–2), 3 (§3–9) |
| [direction library](direction-library.md) | Every direction with fit, risk and previews; how to show and pick | 3 |
| [direction recipes](direction-recipes.md) | Hard rules, bans, required components, pre-flight per direction | 3 (after the pick), 5, 7 |
| [motion](motion.md) | Motion level per dial, motion types, choreography, reduced motion, spec | 3 (§1), 4 (§7), 5 (§5–6), 7 (§8) |
| **Experience architecture** | | |
| [experience architecture](experience-architecture.md) | Journeys, IA, navigation, URLs, permission flows | 2 |
| [navigation grouping](navigation-grouping.md) | Grouping, ordering, labelling menus; settings, mega menus, mobile tabs | 2 |
| [interaction](interaction.md) | Heuristics, mental models, cognition, competing principles | 2 |
| [notifications](notifications.md) | Channel choice, message anatomy, frequency, lifecycle | 2 |
| [mobile native](mobile-native.md) | iOS/Android conventions, permissions, push, offline, gestures | 2 |
| [other platforms](other-platforms.md) | Kiosk/POS, desktop apps, smartwatch, TV, voice, in-car, XR | 2 |
| [collaboration](collaboration.md) | Presence, co-editing and conflicts, comments, sharing, version history, offline sync | 2, 4 |
| **Page and interaction** | | |
| [back office](back-office.md) | Admin page taxonomy, pattern fit, role layout, page review, back-office looks and previews | 1, 2, 6 |
| [customer UI](customer-ui.md) | Customer page types, onboarding, trust, brand tone | 1, 2 |
| [page spec](../assets/page-spec.md) | The 16 rows per rigor tier | 4 |
| [patterns](patterns.md) | States, async and unknown outcomes, dialogs, continuity, destructive actions, dashboards and tables, speed, ethics | 4 |
| [forms](forms.md) | Fields, structure, Thai address/phone/ID, validation timing, §6b build contract | 4, 5 |
| [content design](content-design.md) | UX writing, errors, empty states, Thai register | 4 |
| [marketing copy](marketing-copy.md) | Headline, CTA, proof, section copy, no-proof and waitlist pages | 4 |
| [search & filter](search-filter.md) | Search box, Thai query handling, results, facets, sort, URL state, saved views, no-results | 4 |
| [email design](email-design.md) | HTML email layout, client limits, dark mode, Thai fonts, templates per type, testing | 4, 5 |
| [print documents](print-documents.md) | Invoices/receipts/tax invoices, page sizes, print CSS, PDF generation, Thai fonts and baht text | 4, 5 |
| [engagement](engagement.md) | Habit loops, progress, streaks, points/loyalty, gamification fit test, ethical guardrails | 2, 4 |
| [data visualization](data-visualization.md) | Chart choice, values display, heatmaps, widgets, live data | 4 |
| [AI features](ai-features.md) | When AI fits, human control, AI output states | 4 |
| [trust, security, privacy](trust-security-privacy.md) | Confirmation, masking, sessions, auditability | 4 |
| [do and don't](do-and-dont.md) | Paired usage/misuse examples with reasons and checks | 4, 6 |
| [layout index](../assets/layouts/index.md), [specification](../assets/layouts/specification.md) | 43 blueprints in 8 categories; the shared contract | 3 |
| [worked examples](../assets/layouts/worked-examples.md), [back-office worked examples](../assets/layouts/worked-examples-back-office.md), [OpenDesign](../assets/layouts/opendesign.md) | Deliverable depth; external references | 3, 4 |
| **Visual and design system** | | |
| [visual system](visual-system.md) Part A | Token layers, type scale, Thai + Latin faces, headline length, spacing, radius, elevation, density, focus | 4 |
| [color palette](color-palette.md) | Roles and role names, semantic colors, contrast pairs, dark, OKLCH recipe, starter palettes | 4 |
| [visual system](visual-system.md) Part B | Hierarchy, grouping, responsive, mobile web composition, Thai text, page rhythm | 3, 4, 7 |
| [design quality](design-quality.md) §7 | Focal point, containers, signal budget, "ดูยาก / รก / ไม่สวย" diagnosis | 4, 6 |
| [design quality](design-quality.md) | Reading order for public pages, template devices to avoid, structural slop, render critique | 3 (§1–2b), 6 (§5) |
| [visual assets](visual-assets.md) | What picture goes in each section when there are no photos | 4 |
| [visual system](visual-system.md) Part C | Measured values: type, tone, spacing, radius, motion, presets, craft pass | 4 |
| [reference library](../assets/references/README.md) | 30 rendered pages that look designed (landing, editorial, report, product, mobile), each mapped to a composition | 3, 4, 6 (compare the render) |
| [template library](../assets/LIBRARY.md), `scripts/_library.py` | Every picture collection read as one row shape (kind, tags, template / study, take, origin, local); collections, rights and rebuild commands in one table | 3, 4, 6 |
| `scripts/look.py` | Lists the library pictures to open before building a page of a kind or tag, plus the market study and direction previews | 3, 5 |
| [market studies](../assets/market/README.md), `scripts/market_fetch.js` | Per kind of business: category look, design-led moves, three gaps, checked facts, screenshots of local and design-led sites (local only) | 3 |
| `scripts/icons.py` | Lucide UI glyphs (inline SVG or sprite) and Simple Icons brand marks with contrast, guideline and licence notes | 4, 5 |
| `scripts/photo_search.py` | Open-licensed photographs of the subject's world (Commons, Openverse), licence-filtered, downloads with credits | 4, 5 |
| `scripts/compositions.js`, [content packs](../assets/directions/content-packs.json), [photos](../assets/photos/README.md) | Fourteen first-screen compositions; sample content per kind of business; licensed stand-in photographs | 3, 5 |
| `scripts/brand.js` | One direction → public pages and product UI on one token set (`backoffice_preview.js --direction`) | 3, 5 |
| [design system guides](../assets/design-systems/index.md) | all 126 study guides (14 curated with sector and reading notes) | 2, 4 |
| `scripts/ds_lookup.py` | Outline, one section/table or cross-system search of the 126 guides (stdlib) | 2, 4 |
| [design system benchmarks](design-system-benchmarks.md) | What 126 public design systems agree on: token layers and role ladder, focus ring, radius/breakpoint/density norms, public-sector service flows, identity and provenance | 2, 4 |
| [iconography](iconography.md) | Labels, one family, sizing, accessible names | 4 |
| [components usage](components-usage.md) | Which component for the job; use / avoid / must-have for ~60 | 4 |
| [component states](component-states.md) | State checklist, focus ring, keyboard contracts, spec template | 4 |
| [advanced components](advanced-components.md) | Editable grids, drag, pickers, rich text, mentions, tours, autosave, recovery | 4 |
| [app-screen rules](app-screen-rules.md) | One question per screen, quiet chrome, grid arithmetic, data honesty | 4, 6 |
| [page anatomy by job](../assets/layouts/index.md) | Job → sections, signature, mirror test, screen budget | 2, 3 |
| [prototyping](prototyping.md) | Wireframes, HTML prototypes with states, hand-off | 5 |
| [build recipes](build-recipes.md) | Surface modes, no-JS demos, hero grid, placeholders, headless fallback | 4, 5, 7 |
| [tokens to code](tokens-export.md), [tailwind](tailwind.md), [shadcn rules](shadcn-rules.md) | Direction → CSS / Tailwind v4 / shadcn tokens; stack rules | 5 |
| Evidence: [evidence](../assets/evidence.md) | Where measured values and rules came from | 4 (to justify a value), RESEARCH |
| **Quality, review and verification** | | |
| [gate tiers](gate-tiers.md) | Floor / Reflex / Finish, pre-emit critique, verification budget, refine vs redesign | 6, 7, 8 |
| [review loop](review-loop.md) | Refinement verbs, critique format, visual and UX scorecards, hard gates (§5), report | 6, REFINE |
| [accessibility](accessibility.md) | WCAG criteria and exceptions, keyboard, evidence plan, reporting limits | 4, 7 |
| [render verification](render-verification.md) | `render_check.js` run order, contrast, slop and DESIGN.md checks, failure table | 7 |
| [i18n & performance](i18n-performance.md) | Thai calendar/currency, expansion, two-language checks, Core Web Vitals | 4, 7 |
| [measurement](measurement.md) | Metrics, instrumentation, experiments, design QA | 7 |
| [validation](validation.md), [output templates](../assets/templates.md) | Research methods, severity scale; which output template per mode, depth per tier, map of the other report formats | 8 |
| [design context](../assets/design-context.md) | The context card | all |

| Script | Phase |
|---|---|
| `scripts/design_md_check.py` | 3 (after brand extraction), 8 (after editing DESIGN.md) |
| `scripts/slop_check.py` | 6 |
| `scripts/render_check.js`, `scripts/contrast.py` | 7 |
| `scripts/check.py` | 6, 7: one command for every delivery check (runs script_check.js, slop_check.py, contrast.py, state_check.py, the public-page metadata line, and render_check.js + fold_check.js with `--render`; admin_check.js with `--admin <type>`) |
| `scripts/script_check.js` | called by check.py: syntax and globals that clash with `window` (destructured ones too: `const {top} = …`); no browser needed |
| `scripts/admin_check.js` | 7: back-office pages by type (list, detail, form, dashboard): numeric columns, disabled with reason, sticky bars, one primary action, every `?state=` rendered; via `check.py --admin <type>` |
| `scripts/fold_check.js` | 7: primary action above the 390×844 / 1440×900 fold, offer on the first screen, next section hinted |
| `scripts/flow_check.js` | 7, 8: JSON-driven journey (the live thing, happy + failure path); fails on console errors; a malformed steps file (bad JSON, not an array, unknown `do`/`expect`) exits 2 before a browser starts |
| `scripts/placeholders.py` | 5, 8: lists `.ph` / `[…]` placeholders (text, and attributes: meta og:*, title, alt, aria-label, placeholder) with counts into the hand-off README; warns on proof-like placeholders; `--json` |
| `scripts/direction_preview.js`, `scripts/build_previews.js` | 3 (pictures of directions; build_previews regenerates all preview sets) |
| `scripts/export_tokens.py` | 5 (direction to CSS, Tailwind, shadcn tokens) |
| `scripts/backoffice_preview.js` | 3 (pictures of back-office density and tone) |
| `scripts/design_md.py` | 3 (after the interview: DESIGN.md + `--wire`), ONBOARD (`--from-code`) |
| `scripts/code_extract.py` | 0 / ONBOARD (what existing code ships, drift) |
| `scripts/direction_recipe.py` | 3, 5, 7 (recipe and pre-flight for the chosen direction) |
| `scripts/tweaks_panel.py` | 6 (live tuning during reviews; remove before shipping) |
| `scripts/review_report.py` | 6, 8 (findings → HTML report) |
