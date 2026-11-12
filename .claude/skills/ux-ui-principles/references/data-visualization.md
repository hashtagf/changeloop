# Data visualization

Charts exist to answer a question someone will act on. Start from the question,
then choose the form. Values in tables, cards and detail pages (empties,
numbers, deltas, dates, truncation) are covered in "Displaying values". Source IDs resolve in [sources.md](sources.md). Dashboard
page structure is in [back-office.md](back-office.md); color in [color-palette.md](color-palette.md).

## Start from the question

| Question type | Chart forms that usually fit | Avoid |
|---|---|---|
| Change over time | Line, area (single series), column for few periods | Pie; many overlapping lines |
| Magnitude / comparison | Bar (horizontal for long labels), dot plot | 3D bars, radial bars |
| Ranking | Ordered bar, lollipop | Unordered bars |
| Part-to-whole | Stacked bar (few parts), 100% bar, treemap; pie only for 2–3 parts | Pie with many slices; donut with a big number hiding the parts (a donut is allowed for 2–5 parts with a legend carrying label, value and percent) |
| Deviation from target | Diverging bar, line with target band | Separate charts for actual and target |
| Distribution | Histogram, box plot, strip plot | Averages alone |
| Correlation | Scatter, connected scatter | Dual-axis lines implying causation |
| Flow | Sankey, funnel (ordered steps) | Funnel for non-sequential categories |
| Spatial | Map only when location matters | Maps for data that is really a ranking |

These categories follow established chart vocabularies that classify charts by
the relationship they show. [S85]

Often a **number with context** or a **table** is better than a chart: one KPI
with target and trend, or exact values users must copy.

## Make it readable

- Title states the finding or question ("Success rate fell below target after 13:00"),
  subtitle states the metric, unit, scope and time window.
- Label directly on lines/bars instead of a distant legend where possible.
- Axes start at zero for bars; lines may use a focused range but must show the scale.
- One axis per unit; avoid dual axes unless users are trained on them.
- Show targets, thresholds and comparison periods as reference lines/bands.
- Emphasize the data that matters (latest value, anomaly); mute the rest.
- Round sensibly; use tabular figures; include units and currency.
- Annotate events that explain changes (deploy, outage, campaign).

## Color in charts

- Categorical palette with distinct hues and similar lightness; limit to ~6
  categories, group the rest as "อื่น ๆ".
- Sequential palette (light → dark) for ordered magnitude; diverging palette
  around a meaningful midpoint (target, zero).
- Don't reuse semantic colors (success/error) for ordinary categories.
- Don't rely on color alone: direct labels, patterns or shapes. [S67]
- Graphical objects needed to understand the chart need 3:1 contrast against
  adjacent colors (WCAG 1.4.11). [S04]
- Check both light and dark themes.

## Heatmaps and matrices (people × skills, risk grids, schedules)

A matrix packs many values into small cells, so every extra signal costs
legibility. These rules come from a skill-matrix prototype that users found
"very hard to read" until the cell encoding was simplified.

| Rule | Why | Check |
|---|---|---|
| **One text color across the whole ramp** (dark on a light ramp, light on a dark-theme ramp) | Flipping text between black and white by level makes the eye re-adjust every cell | Every ramp step passes 4.5:1 with that single text color (`scripts/contrast.py`) |
| **Light, low-saturation ramp**; reserve the darkest step for the top level only | Dark, saturated cells dominate and hide the exceptions users came to find | The exception marker is the most prominent thing on screen |
| **"None" is empty**, not a colored cell | Filled zeros add noise and make real values harder to spot | Scan a row: filled cells = has skill |
| **At most two signals per cell**: the value plus one status (e.g. "−1 below target") | Rings, corner triangles, dots, dashed borders and fading together become unreadable | Count encodings per cell in the legend; more than two → move one elsewhere |
| **Status as text inside the cell**, not an overlapping corner mark | Text ("−1") is readable and explicit; small corner glyphs collide with neighbors | Zoom to 200%: markers don't overlap adjacent cells |
| **Row- or column-level facts go on the header**, not on every cell (stale data, role, risk) | Repeating a row property in each cell multiplies noise | Stale data shown once next to the person's name |
| **Never use opacity to mean a state** | Faded cells fail contrast and look disabled | No `opacity` on informative cells; state uses text or a badge |
| **Semantic colors only for exceptions** | Red/amber should mean "look here", not decorate categories | Remove all red: is anything important lost? Only the exceptions |
| **Sticky row and column headers; table semantics; full accessible label per cell** | Users must know which person/skill a cell belongs to while scrolling; screen readers need the same | Scroll diagonally; tab to a cell and hear "name · skill: level, target, status" |
| **Summary row/column for the decision** (e.g. people at level ≥3 per skill, gaps per person) | The matrix answers "where are we thin?"; totals make it explicit | Decision visible without reading every cell |
| **Compact screens get a list view** (per person or per skill, exceptions first) | A 2-D grid is unusable at phone width | 390 px shows a list, not a tiny grid |

Data tables and matrices may scroll in two dimensions under the WCAG reflow
exception; keep that scroll inside the table region, not the page. [S05]

## Displaying values (tables, cards, detail pages)

Most data is read as values, not charts. These are project recommendations;
locale formats are in [i18n-performance.md](i18n-performance.md).

**Empty is not one state.** Use distinct, consistent displays and explain them
once (legend, tooltip or help text):

| Situation | Display | Not |
|---|---|---|
| Real zero | `0`, `฿0.00` | `—` |
| Not yet entered / not provided | `—` (with accessible name "ไม่ได้ระบุ") or "ยังไม่ระบุ" | `0`, blank cell |
| Not applicable to this row | "ไม่เกี่ยวข้อง" or `—` with a column note | `0` |
| Unknown / not measured | "ไม่ทราบ" | `0`, `—` silently |
| Still loading | skeleton in the cell size | `0` that later jumps |
| Hidden by permission | "ไม่มีสิทธิ์ดู" or masked `****4821` | an empty cell that looks like no data |
| Failed to load | "โหลดไม่สำเร็จ [ลองใหม่]" | `—` |

**Numbers**
- Precision follows the decision: money to the satang in transactions, whole
  baht in summaries; rates to 1 decimal unless smaller changes matter.
- Same decimals within a column; right-align; tabular figures.
- Units and currency in the column header or label ("ยอด (฿)"), not repeated in
  every cell, unless cells mix units.
- Abbreviate only in summaries and charts, never where users copy or reconcile:
  `12.5K`, `1.2M`; Thai `1.2 ล้าน`. Avoid mixing หมื่น/แสน units in business UI.
  Show the exact value on focus/hover **and** in the detail view.
- Negative numbers with a true minus `−1,250` (or accounting brackets where the
  audience expects them), plus a word or icon when the sign carries meaning.

**Change and comparison**
- A delta states its base and period: `+12.4% เทียบ 7 วันก่อน`.
- Distinguish percent from percentage points: conversion 3.1% → 3.4% is
  `+0.3 pp` (`+9.7%` relative). Say which.
- Color a delta by meaning (good/bad for this metric), not by direction; keep
  the sign and arrow so it reads without color. Rising refunds are bad.
- Small bases make large percentages: show counts beside rates (`50% (2/4)`).

**Dates and times**
- Relative time for recent activity in feeds and queues ("5 นาทีที่แล้ว"), with
  the absolute timestamp available on focus/hover and in detail; switch to
  absolute after ~7 days.
- Absolute timestamps with seconds and time zone for audit logs, payments,
  legal records and anything users quote to support.
- Durations in human units ("2 ชม. 15 นาที"); countdowns for SLAs state the
  deadline too ("เหลือ 8 นาที · ครบกำหนด 14:40").
- Label the era where Buddhist and Gregorian years could be confused.

**Text and identifiers**
- Truncate names and titles at the end; truncate IDs, file names, emails and
  URLs in the middle (`WD-2048…9F3A`, `report…2569.pdf`) so both ends stay readable.
- Every truncated value has a non-hover path to the full value (expand, detail,
  copy button); tooltips alone exclude touch and keyboard users.
- IDs users type or read aloud: monospace or tabular figures, grouped
  (`081 234 5678`, `RN-2612-0471`), with a copy button.
- Thai text has no spaces between words: set `lang="th"` so browsers break lines
  at word boundaries; test line clamps with real Thai copy.

**Booleans and statuses** — words from the glossary ("เปิดใช้งาน",
"ปิดอยู่", "รอตรวจ"), not ✓/✗ alone; color is secondary.

**Detail pages (key–value)**
- Group fields into named sections in the order the role decides; the
  identifying fields and status first, audit metadata last.
- Labels muted and consistent width; values selectable and copyable.
- Show who changed what and when for consequential fields.
- Long records: section anchors or tabs only when sections are independent.

**KPI tiles** — value + unit + comparison + time window + freshness
("อัปเดต 14:32"); emphasize only abnormal ones ([design-quality.md](design-quality.md)).

## Data states

| State | Show |
|---|---|
| Loading | Skeleton in chart dimensions; keep axes stable |
| No data for period | Explain ("ยังไม่มีธุรกรรมในช่วงนี้") — not a flat zero line |
| Zero | A real zero, plotted |
| Missing / partial | Gap in the line, with a note; don't interpolate silently |
| Stale | "อัปเดตล่าสุด 14:44" and a warning when older than expected |
| Error | Message and retry; keep last good data visible if labeled as stale |

## Interaction

- Tooltips show exact values and are reachable by keyboard; don't hide essential
  information only in tooltips.
- Filters and time ranges show current state and are reflected in the URL.
- Drill-down goes from summary to the records behind the number.
- Provide "view as table" or download for exact values.

## Accessibility

Complex images such as charts need a short text alternative and access to the
full information, e.g. a data table or long description. [S86]

- `role="img"` with an `aria-label` summarizing the key finding for simple charts.
- A data table (visible or toggled) for exact values.
- Keyboard access to interactive points; focus visible.
- Respect reduced motion for animated transitions.

## Dashboards

- Order by the role's decision (see [back-office.md](back-office.md)).
- Every KPI: value, unit, comparison, time window, freshness.
- Few charts that answer different questions beat many charts of the same metric.
- Align chart widths and axes when users compare across charts.
- **Tier sets cadence** (S106): strategic (executives, monthly/quarterly, few KPIs, trend),
  tactical (managers, weekly, targets and breakdowns), operational (operators, live or
  minutes, thresholds and the item to act on). Do not mix tiers on one screen.
- **Every KPI tile has a definition**: formula, source, owner and refresh time in a popover
  or info icon. Two teams reading "active users" differently is a design defect.
- **Thresholds** are stated, not decorative: fixed targets where a business rule exists,
  otherwise a band from history (e.g. ±2σ of the last 30 days); show what the colour means.
- Pair a system metric with the user-perceived one (CPU with checkout latency).
- **Data size and chart caps** (S107): render < ~1k rows client-side; 10k–100k rows
  pre-aggregate on the server; beyond that, query on demand. Per chart: ≤ ~500 points per
  line series, ≤ ~50 bar categories (else top-N + "อื่นๆ"), ≤ ~1k scatter points (else
  bin or density); tables show 100–200 rows then paginate or virtualize.

## Review checklist

1. The question the chart answers is written in its title.
2. Chart form matches the relationship (time, comparison, part-to-whole…).
3. Scales are honest; bars start at zero.
4. Units, time window, source and freshness are visible.
5. Color is not the only cue; contrast meets 3:1 for needed graphics.
6. Zero, missing, stale and error states are distinct.
7. A text summary and table/alternative exist.
8. Zero, not provided, not applicable, unknown, restricted and failed values look different.
9. Deltas state base and period; percent vs percentage points is clear.
10. Truncated values and abbreviated numbers have a non-hover path to the exact value.
11. No part shares a colour with the ground it sits on: a cream layer on a cream section reads as empty space. Give light parts a pattern or outline, use theme tokens for every fill (a fixed dark fill vanishes in dark mode), and look at both themes rendered. `contrast.py` checks text pairs, not graphic parts, so this check is visual.

## Do / Don't

| Do | Don't |
|---|---|
| Title the chart with the finding. | Title it "Chart 1" or with the metric name only. |
| Use a bar chart for comparing categories. | Use a pie chart with eight slices. |
| Show a target line on performance charts. | Make users remember the target. |
| Show missing data as a gap with a note. | Draw missing data as zero. |
| Show `—` for "not provided" and `0` for a real zero. | Use `0` for everything empty. |
| Middle-truncate IDs and file names with a copy button. | Cut `WD-2048-9F3A` to `WD-20…` with the full value only on hover. |
| Write `+0.3 pp (3.1% → 3.4%)`. | Write `+0.3%` when the rate moved 0.3 points. |

## Dashboard widgets

- **Uptime strip**: 60–90 bars per service, green default, amber/red for incidents, % at right, "90 days ago → Today" caption; give incident bars a text label or tooltip.
- **End-dot line**: mark the latest point with a dot and the value; drop gridlines to a whisper.
- **Ring meters**: 3–4 max, % inside, caption below; track at low contrast, value arc in one hue.
- **Ranked bars**: sorted, value at bar end, one hue unless categories differ in meaning.
- **Donut**: 2–5 parts, rounded caps, total in the centre only when the legend carries each part's label, value and percent.
- **Resource card**: host, status chip, CPU/memory/disk as thin bars that change colour at thresholds.

## Live data states (dashboards that refresh)

- A **live pill** in the header shows one of three states: *Live, synced* · *Syncing…* · *Stale, 4 min ago* (amber after a stated threshold). Color is never the only cue.
- Refresh on open and on demand; keep the last good data visible while syncing; on failure say what is stale and since when.
- Show change: tween changed numbers briefly, flash changed rows once, state the diff in a toast ("3 new, 1 updated").
- Footer names the source and time: "Source: <system>, refreshed 12:41". Respect reduced motion for tween and flash.
