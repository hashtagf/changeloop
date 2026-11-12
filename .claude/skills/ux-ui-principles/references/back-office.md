# Admin and back-office pages

Design internal and operational tools from the role's task, not from a
component inventory. Ask "why does this person open this page, and what must
they see to finish?" before deciding where cards, tables or buttons go. Complex
applications should reduce clutter without removing capability and keep
important information visible. [S38] Source IDs resolve in [sources.md](sources.md).

The page taxonomy and pattern tables below are **this skill's synthesis** from
Ant Design, IBM Carbon, GOV.UK and NN/g guidance; they are not a joint
classification published by those organizations.

## Eight page questions to settle per page

| # | Dimension | Question |
|---|---|---|
| 1 | Role | Who uses this page: operator, manager, support, auditor, admin? |
| 2 | Goal | What must they accomplish here? |
| 3 | Information priority | What must be visible immediately, what can wait? |
| 4 | Page structure | Table, detail, form, dashboard, split view? |
| 5 | Actions and decisions | What do they click or decide, and what is the risk? |
| 6 | Density | How much data per view lets experts work fast without clutter? |
| 7 | Interaction and states | Search, filter, loading, empty, error, permission, stale data? |
| 8 | Responsive and accessibility | Does the primary task still work when space or input changes? |

Same data, different jobs: for transactions, an **operator** finds and fixes
exceptions, a **manager** watches trends, risk and team throughput, an
**auditor** traces evidence, change history and responsibility. Their pages may
share components but not layout order.

## Page taxonomy

Pick the primary type first. A page can mix patterns, but one task should lead.

| Page type | Primary goal | Layout pattern | Local layout IDs |
|---|---|---|---|
| Overview dashboard | Understand the situation | Summary → trends → exceptions (operators: exceptions first) | D01 |
| Monitoring | Detect problems quickly | Health → alerts → investigation | D04 |
| List / CRUD | Find and manage records | Search → filter → table → bulk actions | A01 |
| Record detail | Understand one record | Header (identity, status) → key facts → sections → history | A02 |
| Create / edit | Enter correct data | Grouped form → validation → save | A01/A02 (no dedicated form blueprint) |
| Approval / review | Decide with confidence | Evidence → decision → confirmation | A03 |
| Inbox / task queue | Work through items continuously | List → detail → actions → next item | P01 |
| Analytics / report | Analyze and compare | Scope → charts → breakdown → drill-down | D02, D03, D05 |
| Workflow | Track a multi-step process | Progress → current step and owner → history | P02 |
| Settings | Configure without mistakes | Categories → controls → save feedback | A07 (U03/U04 as account variants) |
| Access / permissions | Manage rights safely | Subjects → roles → effective access | A04 |
| Audit log | Investigate past events | Search → event timeline → before/after detail | A06 |
| Worklist (queue) | Clear known items assigned to me | Queue tabs → item → decision → next item | A08 |

## Group A — situation and analysis

| Page | Prioritize | Common failure |
|---|---|---|
| Dashboard | Decision KPIs with comparison (target, previous period), change, items needing action | A wall of numbers with no next action |
| Monitoring | Health status, severity, impact, duration, shortcut to investigate | Many charts while the real incident is not prominent |
| Analytics | Time range, segment, comparison, trend, breakdown, drill-down | Attractive charts that do not answer the business question |

Project recommendation: move visualization pages from overview to filtering
and detail, place key information prominently and pick chart types that match
the data's meaning. Every KPI needs units, time window, freshness and a comparison;
distinguish zero, missing and stale data (see [do-and-dont.md](do-and-dont.md)).

Order by role. If people arrive to clear backlog, "requires attention" goes
first; if they arrive to analyze trends, charts lead.

## Group B — managing data

| Page | Prioritize | Common failure |
|---|---|---|
| List / CRUD | Search by real identifiers, useful filters, sort, column priority, bulk actions | Every database column shown regardless of task |
| Detail | Identity, status, key facts, related objects, history | Important facts buried several tabs deep |
| Create / edit | Field grouping, input order, inline validation, save behavior | Unrelated fields side by side or misaligned columns (see [forms.md](forms.md) §2, §9) |

Data-table users typically find records, compare them, view or edit details,
and take actions on rows. [S39] Separate table-level tools (search, filters,
batch actions) from row-level actions, and offer row-size (density) options for expert
use. [S40] Detail pages should show information directly where reasonable and
group it by relationship; use tabs only when content is genuinely complex and
separable. [S41]

Table rules (project recommendations):

- Default sort matches the task (oldest pending first for queues).
- First column identifies the row in users' terms; numeric columns right-aligned
  with tabular figures; status as text plus color, never color alone.
- Bulk selection states whether it covers this page or all matches and shows
  the count before acting (see [patterns.md](patterns.md#destructive-and-consequential-actions)).
- Preserve filters, sort, page and selection across detail visits and in URL.
- Narrow screens: keep identifier, status and primary value; move the rest to an
  expandable row or detail. Data tables may need two-dimensional scrolling under
  WCAG reflow exceptions. [S05]

## Group C — decisions and continuous work

| Page | Prioritize | Common failure |
|---|---|---|
| Approval / review | Decision evidence, risk with reasons, consequence of approve/reject | Evidence spread across several pages |
| Inbox / queue (**worklist**) | Priority, assignment, SLA, age, current item, next item | Leaving and re-entering detail pages for every item |
| Workflow | Current step, owner, dependencies, status, next action | A progress bar that hides who the work is waiting on |

**Worklist vs list report** (Fiori floorplans; S104). A *worklist* is a queue of known
items the user must clear (My items · Awaiting me · Overdue tabs, age, SLA, one primary
action per row, returning from detail keeps the list position and moves to the next item).
A *list report* searches a large set (filters first, saved views, export). Pick by the
role's question; a queue built as a search page makes people hunt for their own work.
A status shown is a domain fact: "Overdue" needs the SLA it breaches and the timestamp,
"Live" needs a real connection state; never decorative.

Approval pages answer "should I approve?", not just "what is this record?".
Order: amount/subject → evidence (identity, risk reasons, mismatches) →
history → decision. For legal, financial or data-changing submissions, make the
action reversible, checked or confirmed; [S48] a check-answers summary before
commitment lets people review and change details. [S43] Require a reason for
rejection when the reason is communicated or audited. After a decision, move to
the next item. Long multi-part work benefits from a task list with statuses and
dependencies. [S42]

## Group D — configuration and accountability

| Page | Prioritize | Common failure |
|---|---|---|
| Settings | Category, description, default, scope, save state | Unclear whether a change applies instantly or after Save |
| Permissions | Subject/role, effective permissions, scope, risk, history | Role names shown without what the user can actually do |
| Audit log | Actor, action, timestamp with time zone, target, before/after, reason | Many events but no way to trace a cause |

Settings must choose deliberately between **instant effect** (toggle applies
immediately; show confirmation and undo where possible) and **submission
effect** (changes apply on Save; show unsaved state and warn on leave). Ant
Design's form-page settings template asks for one mode per page and submission
effect when settings depend on each other. [S41] Never mix both
behaviors in one group without visual distinction.

Permission pages show **effective access** (what this person can do, from which
role or grant), highlight high-risk rights, and record who changed what. Audit
logs are append-only, filterable by actor, action, target and time, and show
before/after values and the stated reason.

**Permission treatment on every other page** (one rule per action, written in the page
spec; S103 after Fiori/Ant):

| The user… | Treatment |
|---|---|
| Can never have this right in their role | Hide the control; do not hint that it exists |
| Could have it, but not for this record or now (state, limit, SoD) | Show disabled **with the reason** as visible text or `aria-describedby` ("อนุมัติได้ไม่เกิน ฿50,000") |
| The reason needs data the page cannot show up front | Keep enabled; on click explain and offer the route (request access) |
| Waits for someone else | Replace the action with "รอ คุณสมชาย (Finance lead) อนุมัติ" and the time it has waited |

Field level: a field the user may read but not edit is plain text, never a greyed
input; a masked value (national ID, account number) shows the last 4 and a **Reveal**
that is permission-checked and written to the audit log. A disabled control with no
reason is a defect.

**Acting as someone else, tenant and environment.** Impersonation shows a banner that
cannot be dismissed ("คุณกำลังใช้งานในฐานะ … · ออก"), the audit entry reads "Admin X as
Y", and money, password and permission actions are disabled during it. Multi-tenant
admins put the tenant in the header and in `<title>`; non-production environments carry a
coloured environment strip so a test action is never mistaken for a live one. [S103]

## Choosing a structural pattern

| Pattern | Suits | Avoid when |
|---|---|---|
| Table | Comparing many records across several attributes | Records have very different structures |
| Card grid | Exploring or summarizing groups visually | Users must compare numbers across many items quickly |
| List–detail | Stepping through many items continuously | Detail needs most of the screen for long, focused work |
| Side drawer | Short view/edit, then return to the same context | Complex tasks needing several sections or long forms |
| Full page | Focused, data-heavy or multi-step work | Small edits that should not lose context |
| Tabs | Separate categories not needed at the same time [S21] | Users must compare information across tabs |
| Step form | Ordered work validated per step | Short tasks or information best seen together |

List–detail layouts adapt between multiple panes and a single pane depending on
available width. [S46] On narrow screens provide an explicit "back to list" and
preserve list position.

## System-wide consistency for admin products

Consistency means shared interaction rules and vocabulary, not identical
layouts. Record these in [design-context.md](../assets/design-context.md):

| Area | Define |
|---|---|
| Navigation | Sidebar groups, breadcrumbs, page hierarchy, active state |
| Page header | Title, description, status, freshness, primary action placement |
| Content width | Reading pages vs full-width tables |
| Spacing | Section, group and field spacing tokens |
| Typography | Title, label and value hierarchy; tabular numerals |
| Density | Compact / comfortable / expanded and who uses each; comfortable default, compact opt-in for the whole app ([visual-system.md](visual-system.md) "Density"); every look in `assets/backoffice/styles.json` has a `compact` set (`backoffice_preview.js --density compact`) |
| Action hierarchy | One primary per region; secondary; destructive styling and confirmation rules |
| Status vocabulary | One name and tone per status across all pages, from five tones: ok · warn (needs attention) · bad · info (waiting on someone, in progress) · neutral (draft, archived); an entity → status → tone table lives in DESIGN.md |
| Feedback | Success, error, loading, empty, no-permission and stale-data patterns |
| Accessibility | Keyboard model, focus, contrast, zoom/reflow, screen-reader names |

## Page review checklist (10 items)

Use as a review aid, not a certification. Score each pass / partial / fail with
evidence.

1. **Task clarity** — the page's purpose is obvious on arrival.
2. **Information priority** — critical information is seen before secondary.
3. **Pattern fit** — table/form/cards/split view matches the task.
4. **Action visibility** — the primary action is findable and its result clear.
5. **Efficiency** — repeated work needs few clicks and context switches.
6. **Density** — amount of data suits the role and frequency of use.
7. **States** — loading, empty, error, success, permission and stale states exist and open by URL (`?state=`); `python3 scripts/check.py <page> --admin <list|detail|form|dashboard>` renders them and runs the rendered admin rules.
8. **Responsive** — small screens, zoom and long data still work.
9. **Accessibility** — keyboard, readable text, visible focus.
10. **Consistency** — statuses, navigation, components and behavior match other pages.

After review, test real tasks with representative users and measure completion,
time on task, errors and requests for help (see [measurement.md](measurement.md)).

## Choosing density and tone from pictures

For a new back office, show the team pictures before choosing a look. The task
(role, risk, volume) still decides the page pattern and layout first
([layout library](../assets/layouts/index.md) A01–A08, D01–D06); pictures only
help choose **density, tone and edge treatment**.

The skill generates previews of every screen in `SCREENS` (`scripts/backoffice_preview.js`)
in every look in `assets/backoffice/styles.json` into
`assets/backoffice/previews/` (not committed; rebuild with
`node scripts/build_previews.js --only backoffice,mobile`, or call
`node scripts/backoffice_preview.js --styles ... --screens ...` directly; with `--styles`, `--direction` or
`--screens` and no `--out` it writes to a new temp folder it prints, never over the library previews).
Terms: a **look** is one `styles.json` entry (the `--styles` flag picks looks);
a **direction** is a customer-page visual system (`directions.json`).

| Group | Screens (layout IDs) |
|---|---|
| Data | records (A01), record detail (A02), create / edit form, import wizard (A05) |
| Decisions and work | approval workbench (A03), inbox / task queue (P01), workflow board (P02) |
| Analysis | operational overview (D01), analytics (D02), finance report (D03), incidents (D04), period comparison (D05), failure heatmap (D06), service status (uptime, resource, ring and ranked widgets) |
| Governance | audit log (A06), access (A04), settings with a save bar (A07) |
| Entry and errors | sign-in, 403 no access, 404 not found |
| Libraries | `components` (every component with its states), `advanced` (editable grid, drag reorder, color picker, rich text, mention, notification centre, tour, autosave, password recovery, state matrix; see [advanced-components.md](advanced-components.md)) and `states` (loading, empty, error, no permission, bulk partial failure, stale or offline data), one full-page image per look |

`sheet-<screen>.jpg` puts all looks side by side for one screen (the
quickest way to choose); `<look>-components.jpg` and `<look>-states.jpg` are
full-size singles, and `<look>-records.jpg` / `<look>-approval.jpg` are kept as
full-size singles too. `--style-sheets` also writes `sheet-<look>.jpg`. All use
one payments sample so looks compare fairly, fill the viewport with realistic
data (14 to 24 rows, mixed statuses, selection, row actions, a pager, a
breadcrumb) and use one inline icon set, charts with axes, gridlines, a 7-day
average and a labelled peak, sparklines with deltas, and a notification badge
and user block in the shell.

**Component sheet** covers: buttons (default, hover, focus, disabled, loading,
danger, icon), split button and menu, command palette, text input (default,
focus, filled, error with message, disabled, textarea), select and combobox,
multi-select with chips, tags and status tags, checkbox, radio, switch, slider,
segmented control, date picker, file upload with progress, breadcrumb, tabs,
stepper, pagination, table with sort and selection, list, card and key-value,
accordion and tree, avatars and badges, KPI with sparkline, progress,
timeline, banners (info, success, warning, error), toast, skeleton, spinner,
empty and error states, destructive confirm dialog, drawer, popover and tooltip,
filter bar with removable chips, bulk-action bar with selection scope, share
dialog, profile menu, consent banner and a notification-preference matrix.
Not on the component sheet: rich-text editor, inline-editable grid,
drag reorder and color picker (see the `advanced` screen,
[advanced-components.md](advanced-components.md)); still missing: anchor
navigation or table of contents, carousel.

**Phone set** (`--mobile`, 390 x 844; files `<look>-m-<screen>` and
`sheet-m-<screen>.jpg`): records as cards with a filter-chip row and a FAB,
approval with a sticky decision bar, overview with a 2 x 2 KPI grid, inbox with
a swipe action revealed, record detail with scrollable tabs, create form with
sticky actions and an inline error, the navigation drawer open, a filter bottom
sheet, three page states (loading, empty, error) and a mobile component sheet
(app bars, bottom navigation with a badge, FAB, 48px buttons and fields, filter
chips, segmented control, swipe item, bottom sheet, snackbar with undo,
pull to refresh, settings rows, confirm dialog). Tables become cards, key
actions sit in the thumb zone, and every target is 44px or more. Only
`<look>-m-states.jpg` and `<look>-m-components.jpg` are kept as full-size
singles; the rest are in the sheets. Tablet and RTL: run `node scripts/backoffice_preview.js --width 820 --height 1366` and `--rtl`; see [visual system](visual-system.md) Part B "Tablet" and [i18n](i18n-performance.md) "Right-to-left".

Dashboard surfaces follow what the strongest 21st.dev dashboards do
([study](../assets/evidence.md)): quiet cards with a 1px edge and a soft
layered shadow on a faintly glowing ground, one emphasised KPI card, KPI values
with an icon chip, a delta pill and a sparkline with a gradient area, charts
with rounded gradient bars or a gradient area under the line, a donut
(2–5 parts, with legend; see [data-visualization.md](data-visualization.md#dashboard-widgets)), a segmented range control and an avatar stack, a workspace switcher, a
section label and a month-end progress card in the sidebar, and count tabs
above tables. Gradient and glow are part of the chosen look; the high-contrast
look keeps flat, bordered surfaces.

Shapes differ per element, not by one global radius: each look sets separate
radii for cards, buttons (square, rounded or pill), fields, navigation items,
avatars and checkboxes, so Mint reads soft (26px cards, pill buttons and nav,
rounded fields) and Paper or Mono read sharp. Data tables stay rectangular by
nature; softness comes from the surfaces and controls around them.

The looks differ in structure, not only colour: nav (left sidebar, icon rail or
top bar), table style (zebra, lines, card rows, plain), status tag (pill, square
or dot) and edges (tone steps, 1px lines, 2px ink borders), plus density, element
shapes, type and colour. Choose by who works there and for how long, not by taste alone.

| Look | Structure and density | Choose when |
|---|---|---|
| **Calm** | side nav · zebra rows · pill tags · 52px rows · 15px text | Comfortable density, tone steps instead of lines, one blue-green accent. Default for mixed-skill teams. |
| **Dense** | side nav · lines rows · square tags · 36px rows · 13px text | Compact rows, 1px lines, small radius; for operators who scan hundreds of rows a day. |
| **Night** | side nav · zebra rows · pill tags · 44px rows · 14px text | Dark graphite in three steps, amber for what needs a person; for monitoring rooms and long shifts. |
| **High contrast** | side nav · lines rows · pill tags · 56px rows · 16px text | Strong borders, large targets, text on every status; for accessibility-first and shared-screen environments. |
| **Ledger** | top nav · zebra rows · square tags · 44px rows · 15px text | Warm paper, serif headings, zebra rows and a top bar; reads like an accounting book. |
| **Slate** | rail nav · plain rows · pill tags · 48px rows · 14px text | Cool blue-grey SaaS with a slim icon rail and indigo accent. |
| **Forest** | side nav · zebra rows · pill tags · 48px rows · 15px text | Deep green sidebar on cream, amber for the thing to do next. |
| **Harbor** | top nav · lines rows · square tags · 44px rows · 14px text | Navy top bar over white content, teal accent and square status tags. |
| **Paper** | top nav · lines rows · dot tags · 40px rows · 14px text | Newsprint tones, hairlines, mono figures and a terracotta accent; quiet and exact. |
| **Mint** | rail nav · cards rows · pill tags · 52px rows · 15px text | Soft mint, generous radius and pill tags; friendly for customer-facing staff. |
| **Graphite** | rail nav · lines rows · square tags · 40px rows · 13px text | Dark neutral, sharp corners, mono data and one lime signal; for operations. |
| **Sunrise** | side nav · cards rows · pill tags · 52px rows · 15px text | Warm light, peach and orange accent, rounded cards and card rows. |
| **Mono** | top nav · lines rows · dot tags · 40px rows · 14px text | Black on white, no colour accent, typographic and exact; colour only where status needs it. |
| **Plum** | side nav · plain rows · pill tags · 48px rows · 15px text | Deep purple sidebar on lavender with a magenta accent. |
| **Enterprise** | side nav · lines rows · square tags · 40px rows · 14px text | Classic banded header, lined tables and a restrained blue; familiar to large organisations. |
| **Sand** | side nav · zebra rows · pill tags · 46px rows · 15px text | Sand ground, charcoal sidebar and a copper accent; warm but professional. |

What the previews demonstrate, and what to keep in the real screen: status is
text plus a shape (never colour alone), money is right-aligned with tabular
figures, account numbers are masked, a changed account is flagged where the
approver decides, the reason field is required only to reject, the primary
action sits with the decision, and the save bar appears only with unsaved
changes. They do **not** show keyboard order, focus, loading, empty, error or
permission-denied states; those still need a rendered build and the checks in
[render verification](render-verification.md).

Regenerate or extend: edit `assets/backoffice/styles.json` (colours, font,
radius, `rowH`, `fs`, `pad`, `edge` = tone · line · strong, `nav` = side · rail · top, `tbl` = zebra · lines · cards · plain, `chip` = pill · square · dot) and run
`node scripts/backoffice_preview.js [--mobile] [--styles calm,dense] [--screens records,approval] [--thai] [--sheet] [--style-sheets] [--singles records,approval|all|none]`.
Screens are payments sample data labelled "Sample data"; replace the domain
nouns in the script's copy table when the team's domain differs, and keep one
glossary of object and status names ([content design](content-design.md)).

## Do / Don't

| Do | Don't |
|---|---|
| Order the page by the role's reason for arriving. | Copy one dashboard layout for operators, managers and auditors. |
| Put decision evidence and consequences beside approve/reject. | Make reviewers open three systems to find KYC and history. |
| Use list–detail and auto-advance for queues. | Force a full page load and return trip per item. |
| State instant vs submission effect for each settings group. | Leave users guessing whether a toggle already applied. |
| Show effective permissions and their source. | Show only a role name and expect admins to remember what it grants. |

## Widget recipes (from `assets/evidence.md`)

- **Stat tile**: muted label, tabular number 2–3× label size, delta as a tinted pill with base/period, optional sparkline. One tile per row may be dark or accent-tinted to anchor the page.
- **Chart card**: 2px line, soft gradient fill, end-point dot, month ticks only, no vertical grid.
- **Table**: 48–56px rows, hairlines, avatar + two-line name cell, status dot-pill, optional progress column, "⋮" action, total row.
- **Status strip, ring meters, donut, ranked bars, resource card**: chart-widget recipes live in [data-visualization.md](data-visualization.md#dashboard-widgets).
- **Mono numerals** for technical dashboards (infra, logs, API); proportional for finance/marketing.
- Do not stretch cards to fill rows; vary tile sizes (bento) instead of eight equal tiles.
