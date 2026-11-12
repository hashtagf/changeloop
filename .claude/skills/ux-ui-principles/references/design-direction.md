# Design direction — dimensions, patterns, compositions, styles, dials

Use when choosing *what kind* of page and look a request needs, before tokens
and values. "Design style" is not one choice: a screen is a stack of separate
decisions, and words from different layers are not substitutes for each other
("Bento" is not an answer to "what style", "Minimal" is not an answer to
"what page").

## 1. Eight dimensions — decide top-down

| # | Dimension | Question it answers | Examples | Detail |
|---|---|---|---|---|
| 1 | Product context | What is being built, for whom, at what risk? | Payment back office, support SaaS, wellness app | [product discovery](product-discovery.md) |
| 2 | UX architecture | How do journeys, IA and roles connect? | Flows, IA map, permissions | [experience architecture](experience-architecture.md) |
| 3 | Page pattern | What job does this page do? | Dashboard, table, master–detail, inbox | §2 |
| 4 | Layout composition | How is content arranged inside it? | Sidebar, three-panel, bento, editorial | §3 |
| 5 | Visual style | What does it look and feel like? | Minimal, soft, editorial, glass accent | §4 |
| 6 | Interaction pattern | How does the user operate it? | Inline edit, wizard, drag & drop, bulk actions | [interaction](interaction.md), [components usage](components-usage.md) |
| 7 | Design system | Which tokens and components realize it? | Semantic tokens, variants | [visual system](visual-system.md) Part A |
| 8 | Quality & validation | How do we know it works? | States, a11y, render checks, metrics | [review loop](review-loop.md) |

Rule: an upper dimension constrains every lower one. Never change a page
pattern (3) to satisfy a visual style (5). Never start from a component
library (7) before 1–3 are known.

Write the stack as one block in the answer:

```
Support inbox — Conversation management
Context: customer-support SaaS · agents, high volume, desktop
Pattern: Inbox / master–detail
Composition: three-panel workspace (queues · list · thread + customer)
Style: clean minimal, one accent
Interaction: real-time thread, assign, tag, search, keyboard triage
System: existing components + semantic tokens
Quality: response time, unread accuracy, keyboard path, reconnect state
```

## 2. Page pattern — choose by the user's primary question

| User asks… | Pattern | Use when | Watch out |
|---|---|---|---|
| "What is happening now?" | Dashboard | Overview to decide or drill in | Not a KPI card per metric; each tile must lead to a decision |
| "Which items are wrong?" | Data table + filters | Compare many records on the same fields | Column order by task, saved filters, bulk scope |
| "How do I inspect this one?" | Master–detail | Repeatedly open items from a list | Keep list position and selection on return |
| "What looks good?" | Card / grid | Visual browsing | Not a substitute for a table when values are compared |
| "Tell me everything about X" | Detail / profile | Deep view of one object | Clear sections, primary action stays reachable |
| "Add or change this" | Form | Create / edit | Fewer fields, validation timing — [forms](forms.md) |
| "What's the next step?" | Wizard / stepper | Ordered, dependent steps | Progress, back without loss, save draft |
| "What stage is each item in?" | Kanban | Work moving through statuses | Density, keyboard alternative to drag |
| "When does it happen?" | Calendar / timeline | Work bound to dates | Time zones, overlaps, Buddhist Era display |
| "Where is it?" | Search / explore | Finding is the goal | Relevance, filters, no-results recovery |
| "How do I answer this person?" | Chat / inbox | Communication queues | Real-time, unread, assignment, handoff |
| "How is the system configured?" | Settings | Change system values | Group by scope and risk — [navigation grouping](navigation-grouping.md) |
| "Why should I use this?" | Landing / editorial | Communicate value, drive one action | Story order, proof, CTA — [marketing copy](marketing-copy.md) |
| "Is this right for me?" | Detail + comparison | Customer choosing an option | Same attributes across options |
| "Am I committing to the right thing?" | Transaction / checkout | Money or binding action | Totals, fees, confirm, unknown outcome — [trust](trust-security-privacy.md) |
| "Is anything broken?" | Monitoring / operations | Watch systems and events | Alert priority, data freshness, stale indicator |

Patterns combine (table + master–detail drawer is common). Name the primary
pattern from the role's most frequent job; secondary patterns serve it. Admin
page taxonomy: [back office](back-office.md); customer page types:
[customer UI](customer-ui.md); concrete blueprints: [layout library](../assets/layouts/index.md).

## 3. Layout composition — how content sits inside the page

| Composition | Shape | Fits | Misuse |
|---|---|---|---|
| Sidebar + workspace | Persistent nav, main area | Back office, SaaS | Sidebar for a 3-page product |
| Three-panel | Nav · list · detail | CRM, inbox, email | Narrow screens without a collapse plan |
| Split screen | Two equal-weight panes | Editor + preview, compare | When one side is clearly secondary |
| Dense layout | Tight rows, many values | Operators, trading, ops | Occasional users, customer pages |
| Grid | Regular columns/rows | Catalogs, galleries | Records that need comparison |
| Masonry | Uneven card heights | Discovery, inspiration | Ordered or scannable data |
| Bento | Mixed-size tiles by importance | Feature overview, landing | Turning every app page into cards |
| Editorial | Type-led, magazine rhythm | Brand, content, premium marketing | Task screens |
| Asymmetric | Intentional imbalance | Brand sites, hero sections | Forms, tables, anything repeated daily |
| Timeline | Sequence by time | History, audit, events | Non-temporal content |
| Layered | Drawers, popovers, overlays | Complex workspaces | Stacking modals on modals |
| Full canvas | Free positioning, zoom | Design tools, whiteboards, maps | Content that has a natural order |

For complex pages, sketch at least two compositions and choose by task success
(scan path, clicks to the main action, what stays visible during the job), not
novelty. Record the rejected option in one line.

## 4. Visual style — a treatment, not a page type

Terms: a **direction** is a named customer-page visual system (`assets/directions/directions.json`); a **style** here is an aesthetic treatment from the table below; a **back-office look** is a `styles.json` style (density and tone preset).

The table names the styles, some in combined rows. Some names are full aesthetics, some are design
systems, some are a single treatment. Pick **one base style**, at most **one accent treatment**, and a
reason tied to brand or job.

| Style | Character | Good fit | Risk / avoid when |
|---|---|---|---|
| Minimal / flat | Calm, functional | SaaS, admin, enterprise | Becomes generic without an idea — [design quality](design-quality.md) |
| Material-like systematic | Adaptive, predictable | Android, large web apps | Copying a platform look onto a brand product |
| Soft UI | Gentle surfaces, soft shadow | Consumer, wellness | Low-contrast controls, unclear affordances |
| Glass / translucent | Layered, premium | Selective overlays, marketing hero | Text over busy blur; whole-app glass; contrast fails |
| Liquid glass (platform) | Translucent, fluid, refractive | Apps on platforms that ship it as system material | Recreating it in web CSS for a brand; text over moving content |
| Claymorphism | Rounded, friendly, 3D-ish | Playful consumer, kids | Data-heavy screens |
| Neo-brutalism | Bold borders, flat clash colors | Creative brands, indie tools | Trust-critical flows (finance, health) |
| Editorial | Typographic, sophisticated | Premium brand, content | Dense operational UI |
| Aurora / mesh gradient | Glow, atmosphere | AI products, hero backgrounds | As a content background; behind tables |
| Skeuomorphic | Realistic, familiar | Specialized instruments, audio | Generic apps (dated, heavy) |
| Terminal / developer | Mono, precise | Dev tools, consoles | Non-technical users |
| Retro / Y2K, cyberpunk, maximalism | Nostalgic / high-energy / layered | Campaigns, gaming, entertainment | Anything users must operate daily |
| Biophilic | Natural, calm | Wellness, sustainability | Forced imagery without content |
| Spatial / 3D | Immersive depth | 3D or spatial workspaces | Flat 2D tasks (cost, motion sickness) |

Good mix: *minimal base + editorial typography + one subtle glass overlay.*
Bad mix: soft UI + neo-brutalism + clay + glass + neon on one page with no brand reason.
Style never overrides contrast, focus visibility or the page pattern.

## 5. Direction dials — set creativity per context

Rate three dials 1–10 and state them in the brief. They keep "make it
distinctive" from becoming the same intensity everywhere.

| Dial | 1 | 10 |
|---|---|---|
| Design variance | Conventional, predictable structure | Experimental, asymmetric |
| Motion intensity | Feedback only | Rich storytelling motion |
| Visual density | Spacious | High-density operations |

Starting presets (adjust with evidence):

| Context | Variance | Motion | Density |
|---|---|---|---|
| Finance / payment back office | 2 | 2 | 8 |
| Ops monitoring | 2 | 2 | 9 |
| Support inbox / CRM | 3 | 3 | 7 |
| AI agent console | 3 | 3 | 6 |
| Consumer app (core flows) | 4 | 4 | 4 |
| Mobile onboarding | 5 | 5 | 3 |
| SaaS marketing site | 6 | 5 | 3 |
| Brand / campaign page | 8 | 7 | 2 |

Variance ≥ 6 on a task screen needs a stated reason. Motion follows
`prefers-reduced-motion` regardless of the dial; what each motion level allows
is in [motion](motion.md) §1. A public page at any motion dial still ships a hero entrance and a once-only section reveal unless the context card states why not ([motion](motion.md) §1 owns this).

## 6. Same principle, different context

| Principle | Finance admin | Marketing site |
|---|---|---|
| Hierarchy leads with | Status, amount, risk | Value proposition, CTA |
| Density | High | Low–medium |
| Variance | Low | Can be high |
| Motion | Feedback only | Storytelling allowed |
| Color | Semantic, restrained | Brand-driven |
| Layout | Structured, predictable | Expressive, flexible |
| Success means | Fewer errors, faster review | Understanding and conversion |

Beauty that fits a back office is precision and calm; beauty that fits a
landing page is an idea and rhythm. Judge each by its own column.

## 7. Direction exploration — art direction before build

A brief → direction → build → render-critique loop with
variance/motion/density dials. Use for new public pages, a new
product look, or "it looks generic"; skip when DESIGN.md already fixes the
direction (then work inside it).

1. **Read the brief** into the context card ([design context](../assets/design-context.md)):
   audience, one action, brand facts, constraints, the subject inventory
   ([design quality](design-quality.md) §1).
2. **Shortlist 2–3 named directions** in the first round (the next 2–3 on request). Each in five lines:

   ```
   Direction B — "Ledger"
   Idea: the payout ledger becomes the page's main visual device
   Dials: variance 4 · motion 2 · density 6
   Moves: tabular serif numerals at display size; one green for "cleared"; ruled rows as section dividers
   Risk: reads as accounting software to non-finance buyers
   ```

   Directions must differ in idea and composition, not only in color.
   Put the safest direction first and say which you recommend and why.
3. **Choose** with the user, or pick the recommended one and state it as an
   assumption when they are away.
4. **Build** with the chosen dials. Product screens (dashboards, apps) keep
   the variance low and spend the direction on type, color roles, density and
   one signature detail, not on layout experiments.
5. **Critique the render** at desktop, tablet and phone widths
   (`node scripts/render_check.js <page> --widths 1440,768,390 --zoom`), using
   [design quality](design-quality.md) §5 and the [review loop](review-loop.md).
   Fix the top three issues; the round budget (≤ 3) is owned by
   [design workflow](design-workflow.md) Phase 8.


**Commit to the chosen direction.** Adopt it whole; do not blend it back toward a default
layout. Swap one slot only for a stated reason (clashes with a brand constraint, needs an
asset that does not exist, cannot hold the real content) and log it. When a section pattern
cannot hold the real content, change the pattern, not the content.

## 8. Style keywords — from the user's words to a direction

Users describe feelings, not styles. Map their words, then confirm the
interpretation in one line ("'premium' → editorial type, restrained color,
variance 5, motion 3"). Ambiguous words (ทันสมัย / modern, สวย / beautiful,
clean) carry no direction: ask for a reference or run the §9 interview.

| User says | Means on screen | Style base (+ accent) | Dials V · M · D |
|---|---|---|---|
| น่าเชื่อถือ, มืออาชีพ, ทางการ / trustworthy, professional | Calm hierarchy, semantic color, no decoration | Minimal | 2 · 2 · 6 |
| หรู, พรีเมียม / premium, luxury | Type-led, generous space, few colors, slow restrained motion | Editorial (+ subtle glass) | 5 · 3 · 2 |
| สนุก, เป็นมิตร, น่ารัก / playful, friendly | Rounded shapes, warm color, bouncy feedback | Soft UI or claymorphism | 5 · 5 · 3 |
| กล้า, ดิบ, แตกต่าง / bold, raw, different | Heavy borders, clashing flat color, big type | Neo-brutalism | 7 · 4 · 4 |
| เทค, AI, ล้ำ / techy, futuristic | Dark or deep ground, glow accents, precise type | Minimal + aurora accent | 5 · 5 · 4 |
| เรียบ, มินิมอล / minimal | Few elements, strong grid, one accent | Minimal / flat | 3 · 2 · 4 |
| ธรรมชาติ, ผ่อนคลาย / natural, calm | Organic shapes, earthy palette, slow motion | Biophilic | 4 · 3 · 3 |
| ย้อนยุค, เรโทร / retro, nostalgic | Period type, textures, saturated palette | Retro / Y2K | 7 · 5 · 4 |
| เกม, มันส์ / gaming, high energy | Neon, angular, fast motion | Cyberpunk | 8 · 7 · 5 |
| สำหรับนักพัฒนา / for developers | Mono accents, code fragments, dense | Terminal / developer | 3 · 2 · 7 |
| ข้อมูลเยอะ, ทำงานเร็ว / data-heavy, fast | Dense rows, keyboard-first, no motion | Minimal (dense) | 2 · 1 · 9 |

Words the user can use to steer later (offer these when they say "ไม่ชอบ แต่บอกไม่ถูก"):
- **Direction:** "bolder", "quieter", "more premium", "more playful", "more like <reference>".
- **Dials:** "แปลกขึ้น/ธรรมดาขึ้น" (variance), "ขยับมากขึ้น/นิ่งขึ้น" (motion), "โล่งขึ้น/แน่นขึ้น" (density).
- **Refinement verbs:** [review loop](review-loop.md) §1 (polish, distill, typeset, colorize, …).

## 9. Interview before code, for every new look

Required in phase 3 when there is no DESIGN.md or stated direction and the work is a
public page, a new product look or a rebrand. Skip for internal task screens (choose
by task). Skip only when the user said they are away or to use defaults; then take
the recommended answer, mark every answer *assumed* in DESIGN.md and the hand-off,
and never present assumed answers as the client's. A background session is not "away".
Use the host's question tool, multiple choice with a recommended option; free text
only where marked.

**Round A: the business (one batch, up to 4 questions, ~2 minutes)**
1. **Goal**: the one action that counts (book a call, buy, sign up, call, visit). Options plus Other.
2. **Audience**: who visits and what they must be able to do in one visit (free text, one line).
3. **Proof you can show today**: real case studies · numbers · testimonials · client logos · photos · none yet.
   "None yet" means no invented logos, numbers or people; plan placeholders honestly.
4. **Constraints**: languages, launch date, existing brand assets, things that must not appear (multi-select).

**Round B: the taste (show pictures first, then ask; one batch, up to 4 questions)**
Show pictures of 2–3 directions at a time (one picture sheet holds at most 6), at least one soft or round and
at least one square ([direction library](direction-library.md) step 2), never names alone. Render them on the
client's subject and in different layouts (`node scripts/direction_preview.js --ids a,b,c --subject <kind> --sheet --out <project>/previews`;
without `--out` it writes to a temp folder it prints, never over the library previews);
three previews that differ only in colour cannot be compared. The direction question always offers **"Research the
market first"** as an option, and it is the recommended one when `look.py <kind>` lists no market study.

**Market research (when chosen, or before Round C when no study exists for the kind).** Run it before proposing
directions, never after the build has started:
1. `python3 scripts/look.py <kind>`: if a study exists in `assets/market/catalog.json`, open its pictures and use it;
   re-shoot stale pictures with `node scripts/market_fetch.js --kind <kind>`.
2. Otherwise build one (a subagent suits it): about 6 local sites of the category and 6 design-led sites abroad (award
   galleries), `node scripts/market_fetch.js --kind <kind> --urls urls.txt`, open every picture. Exit 1 means a
   site was skipped (WARN skip line: refused, unreachable, timed out twice): say which; exit 2 is a usage error
   (e.g. an `--only` slug not in the study, valid slugs listed).
3. Report in three parts: the **category look** (what local sites converge on), the **designed moves** (what the
   design-led ones do differently), and **three gaps** this client could own, each naming the closest local site.
   Facts of the market (subsidies, licences, regulations) go in only with a source and a check date.
4. Record it in `assets/market/catalog.json` (the script prints a stub) so the next brief of that kind starts there.
5. Use it: drop any direction that matches the category look (competitor test, [design quality](design-quality.md)
   §1), and lead Round C with the direction that fills a gap.
5. **Feel**: up to 3 words (trustworthy, premium, playful, bold, techy, natural, warm, calm).
6. **Shape**: *Soft and round* · *Mixed (round buttons, sharp cards)* · *Sharp and printed*. Do not infer shape from the feel words: "premium + playful" is not "sharp". **Never skip this question**, even when the rounds are compressed into one batch or the user picks a direction straight from the previews: the direction fixes palette and type, not shape. Offer the subject-led option first ("Round like the bean, cup and bag" for a café; see [design quality](design-quality.md) §1 Subject shapes) and record the answer as `shape` and `shape_from_subject` in `interview.json`.
7. **References**: one site or app you like and why, one you dislike and why (free text, optional). Extract principles, not layouts ([design memory](design-memory.md) §3b).
8. **Energy**: *Calm and spacious* (V3 M2 D3) · *Balanced* (V5 M4 D4) · *Expressive* (V7 M6 D3) · *Dense and fast* (V2 M1 D8).

**Round C: confirm.** Propose 2-3 named directions built from the answers and the market study (§7), each shown as a picture,
lead with the recommendation, state what each trades away, and let the user pick. Then play the choice back in
three lines (goal, feel+shape, what you will not do) and ask "right?" once.

**Record it.** Write the answers to `interview.json` and generate DESIGN.md:
`python3 scripts/design_md.py <direction-id> --interview interview.json --out . --wire`
(`--template-interview` prints the empty file). It writes Status: draft, with the interview as the decision log,
and adds a marked block to `AGENTS.md` / `CLAUDE.md` so the next agent reads DESIGN.md first. Ask once, with
the direction pick, whether to save it; the default is yes. Set Status: approved only after the user confirms.


## 10. Domain exploration and token names

Before proposing visuals write: 5+ concepts from the product's world, 5+ colours
that physically exist in it, and 3 default choices you will reject. Name tokens
after domain objects (`--ink`, `--parchment`), not `--gray-700`. Pick **one**
depth strategy (borders only, subtle shadow, layered shadow, or surface-tint
shift) and do not mix. Pre-ship tests: *swap* (replace the typeface or layout
with a default: did anything change?), *token* (do the variable names fit this
product when read aloud?), *signature* (point to five places the signature shows).
Choose light or dark from who uses it, where and under what ambient light, not
from the category ("dev tool, so dark"). See also
[page anatomy by job](../assets/layouts/index.md) and [gate tiers](gate-tiers.md).
