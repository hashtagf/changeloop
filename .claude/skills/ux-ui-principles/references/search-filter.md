# Search and filtering

Search boxes, query handling, results pages, facets, sort, list state and
no-results recovery for back-office lists and commerce catalogs. Table layout
and bulk actions are in [back-office.md](back-office.md); empty/stale state
rules in [patterns.md](patterns.md); Thai collation in
[i18n-performance.md](i18n-performance.md). Source IDs resolve in
[sources.md](sources.md); unlisted public sources are at the end.

## Choose the search model

| Need | Pattern | Rules |
|---|---|---|
| Find one known record (order, member, ticket) | Single box over identifiers | Match exact ID, phone, email, name; exact ID match opens the record or pins it first |
| Narrow a large list by attributes | Search + facets/filters | Search text and filters combine (AND); both visible at once |
| Browse a catalog by intent ("รองเท้าวิ่งผู้หญิง") | Search with suggestions + facets + sort | Category suggestions in autocomplete; facets follow the category |
| Jump anywhere / run a command (staff tools) | Command palette (Cmd/Ctrl-K) | Separate from list search; mixes pages, records, actions; label each result type |
| Repeated query by the same team | Saved view / segment | Name, owner, shared or private; see "Saved views" |

Scope must be visible: placeholder or label says what is searched
("ค้นหาด้วยเลขออเดอร์ ชื่อ หรือเบอร์โทร"). Global site search sits in the header;
list search sits directly above the list it filters, never in the header. NN/g
recommends an open text field over a search icon that must be clicked first. [N1]

## Instant vs submit

| Data | Behavior | Values (this skill's recommendation) |
|---|---|---|
| Client-side list ≤ ~1,000 rows | Filter as you type | No debounce needed; keep input responsive (INP good ≤200 ms [S54]) |
| Server search, typical list | Search as you type with debounce | 250–300 ms debounce; min 2 chars Latin, 1 char Thai or digits; cancel in-flight requests |
| Expensive query (reports, full-text over millions) | Submit on Enter / button | Show "กำลังค้นหา…" after ~300 ms; never block typing |
| Autocomplete suggestions | Debounced dropdown | 150–250 ms; 5–8 suggestions; ignore responses older than the latest query |

Discard out-of-order responses: tag each request with the query and render only
the latest. Typing must never be lost or reset by a re-render.

## Query understanding (Thai market)

| Problem | Handling |
|---|---|
| Thai has no spaces between words | Segment the index with a Thai-aware tokenizer (ICU word break, Elasticsearch `thai` tokenizer) [N2][N3]; also index character n-grams so partial words ("ทุเรียน" inside "ทุเรียนหมอนทอง") match |
| Mixed Thai/English ("ไอโฟน 15", "iphone เคส") | Index brand synonyms both ways: ไอโฟน ↔ iPhone, ซัมซุง ↔ Samsung; match regardless of script order |
| Wrong keyboard layout (typed English keys while Thai layout active, or reverse) | If zero results, retry the query re-mapped through the Kedmanee ↔ QWERTY key map and offer "หมายถึง …?" |
| Typos, tone-mark slips | Fuzzy match (edit distance 1 for ≤5 chars, 2 above); suggest, don't silently replace, unless the original has zero results |
| Unicode variants (ำ as U+0E33 vs ํ+า U+0E4D U+0E32; stray zero-width spaces) | Normalize at index and query time; strip ZWSP pasted from LINE/Word |
| Thai numerals (๐–๙) | Map to 0–9 before matching IDs, prices, phone numbers |
| Phone numbers | Strip spaces, dashes, brackets; treat +66 8x and 08x as equal; accept any typed format [S71] |
| Citizen ID / tax ID (13 digits) | Strip dashes ("1-2345-67890-12-3"); mask in results unless the role may see it ([trust-security-privacy.md](trust-security-privacy.md)) |
| Buddhist vs Gregorian year ("2568" vs "2025") | Date filters accept both; display in the user's locale |
| Order/ticket prefixes ("RN-2612-0471", "rn26120471") | Case-insensitive, ignore separators |

Test with production-like Thai and mixed-script data; English-only fixtures hide
most of these failures.

## Results anatomy

| Element | Rules |
|---|---|
| Count | "พบ 128 รายการ" near the top; approximate ("มากกว่า 10,000") when exact count is costly |
| Applied state | Query + active filters as removable chips, with "ล้างทั้งหมด" |
| Sort | Visible control; default stated ("เรียงตาม: เกี่ยวข้องที่สุด") |
| Result item | Identifier first, status as text, the field that matched; back office shows the same columns as the unfiltered list |
| Highlight | Bold or mark the matched span; highlight on segmented Thai words, not mid-syllable; never rely on color alone [S67] |
| Exact match | Pin to the top and label it; for a unique ID in back office, offer Enter to open |

## Faceted filters

| Need | Pattern | Rules |
|---|---|---|
| Few filters, desktop list (≤ ~5) | Inline toolbar dropdowns above the table | Each shows current value in its label ("สถานะ: รออนุมัติ") |
| Many facets, catalog | Left sidebar, collapsible groups | Most-used groups expanded; long value lists get "ดูเพิ่ม" + in-facet search beyond ~10 values |
| Mobile | Full-screen sheet or tray from a "ตัวกรอง (3)" button | Sticky footer "แสดง 42 รายการ"; preview count updates as filters change [N4] |
| Desktop live apply | Apply on each change | Only when results return fast; keep scroll position and focus in the facet |
| Slow queries or mobile sheet | Batch apply with Apply button | Show pending count; Cancel restores previous state |

Facet rules (this skill's recommendation unless cited):

- Show counts per value when cheap and accurate; hide counts rather than show wrong ones.
- Zero-count values: disable with "(0)" or hide; never let a click lead to zero results without warning.
- Within a facet values OR; across facets AND. Say so if it differs.
- Ranges (price, date) take typed input plus presets ("7 วันล่าสุด", "เดือนนี้").
- Filters vs facets differ: filters are fixed criteria, facets derive from the result set. [N5]

**Data type → filter control → cell display** (decide per column in the page spec; S105):

| Column type | Filter control | Cell |
|---|---|---|
| Enum / status (≤ ~12 values) | Checkbox facet with counts | Status label: text + tone + shape |
| Free text (name, title) | Search input (debounced) | Text, truncated with full value on hover/focus |
| Number / money | Range: two inputs + presets; slider only for coarse ranges | Right-aligned, tabular figures, unit |
| Date / timestamp | Range with presets (วันนี้, 7 วัน, เดือนนี้) + custom; time zone stated | Relative ("2 ชม.ที่แล้ว") with absolute on hover; absolute in exports |
| Person / owner | Combobox with "ฉัน" first | Avatar + name |
| ID / reference | Exact match in search, not a facet | Monospace, copy button |
| Nested record / JSON | Not filterable | Opens in the detail sheet only |

Log and event tables: a time histogram above the table where dragging a range sets the
time filter, and a command-palette filter (`status:error service:pay`) with history.

## URL state, back button, saved views

- Encode query, filters, sort, page/cursor in the URL; a copied link reproduces the view.
- Use `replaceState` while typing, `pushState` on committed changes (submit, filter
  apply, page change) so Back undoes one meaningful step, not one keystroke.
- Returning from a detail page restores filters, sort, scroll and selection
  ([back-office.md](back-office.md), [patterns.md](patterns.md)).

Saved views (back office):

| Element | Rule |
|---|---|
| Name | User-defined ("ออเดอร์ค้างส่งเกิน 2 วัน"); show owner and sharing (ส่วนตัว / ทั้งทีม) |
| Modified state | When the user changes a saved view, show "แก้ไขแล้ว" with Save / Save as new / Reset |
| Default view | Per user; system default can't be deleted |
| Relative dates | Store "last 7 days", not fixed dates, unless the user picks fixed |
| Counts | Optional badge per view; refresh on open, not by polling every view |

## No results and recovery

| Cause | Response |
|---|---|
| Typo / layout slip | "ไม่พบ 'ไอโฟร' — หมายถึง ไอโฟน?" with one-click correction |
| Filters too narrow | Name the constraints; offer removing the most restrictive filter with its count ("ลบ 'สีแดง' จะพบ 12 รายการ") |
| Query in wrong scope | "ค้นในทุกหมวด" or search other entity types |
| Truly nothing | Say so plainly; offer browse categories, contact, or (back office) create the record |
| Permission-limited | Don't reveal hidden records exist; say results reflect your access if relevant |

Keep the query in the box on a no-results page so it can be edited. Baymard
documents no-results pages as a recovery point, not a dead end. [N6]

## Loading, stale results, pagination

- Keep old results visible, dimmed or with a top progress bar, while new ones
  load; skeleton only on first load. Don't flash empty states between queries.
- If the data changed since load (queues), show "มีรายการใหม่ 5 รายการ — โหลด"
  rather than reshuffling rows under the cursor. [S92]

| Need | Pattern | Use when |
|---|---|---|
| Back office, compare, jump, share position | Numbered pagination with page size (25/50/100) | Tables, audit lists, anything users return to |
| Catalog browsing on mobile | Load more button | Keeps footer reachable and position restorable |
| Feeds with no "end" goal | Infinite scroll | Only with restorable position and an accessible feed pattern [S93]; NN/g cautions against it for goal-oriented finding [N7] |
| Very large sets | Cursor pagination, "ถัดไป / ก่อนหน้า" without total pages | When counts are expensive |

## Keyboard and accessibility

- `/` focuses list search when focus isn't in a text field; Cmd/Ctrl-K opens the
  command palette; Esc clears the field, then closes the dropdown. Show shortcuts
  in tooltips and a help sheet (this skill's recommendation). All of it works
  without a mouse. [S89]
- Autocomplete follows the APG combobox pattern: `role="combobox"`,
  `aria-expanded`, `aria-controls`, `aria-activedescendant`; Down Arrow opens and
  moves; Enter selects; Esc closes. [S93]
- Announce result counts through a polite status region ("พบ 42 รายการ"),
  without moving focus. [S13] Debounce announcements so each keystroke doesn't speak.
- Facet checkboxes are real checkboxes with labels including counts; removing a
  chip moves focus to the next chip or the search field, never to `<body>`.
- Search input has an accessible name (visible label, or `aria-label` when a
  search icon/button makes the purpose visible); placeholder text alone is not a
  label. [S68] If a visible label exists, the accessible name contains it. [S64]

## Measure

| Metric | Why |
|---|---|
| Zero-result rate and top zero-result queries | Reveals missing synonyms, Thai segmentation gaps, catalog holes; review weekly |
| Search refinement / reformulation rate | Users retyping means the first results failed |
| Click position and exit-after-search | Ranking quality |
| Filter usage per facet | Remove or demote facets nobody uses |
| Time to open record (back office) | Task speed for known-item search |

Log queries without personal data: hash or drop phone numbers and IDs
([measurement.md](measurement.md), [trust-security-privacy.md](trust-security-privacy.md)).

## Do / Don't

| Do | Don't |
|---|---|
| Say what the box searches and accept real identifiers in any format. | Require exact "0812345678" when the user pastes "081-234-5678". |
| Segment Thai text and index synonyms across scripts. | Rely on whitespace tokenization for Thai. |
| Show applied filters as chips with counts and one-click removal. | Hide active filters inside a closed panel. |
| Put view state in the URL and restore it on Back. | Reset filters when users return from a detail page. |
| Keep the query and offer a correction on no results. | Show a blank "ไม่พบข้อมูล" with no way forward. |
| Announce result counts politely. | Move focus to results on every keystroke. |

## Sources (not yet in sources.md)

| ID | Source | Use |
|---|---|---|
| N1 | [NN/g: Search: Visible and Simple](https://www.nngroup.com/articles/search-visible-and-simple/) | Open search field over icon-only search |
| N2 | [ICU Boundary Analysis](https://unicode-org.github.io/icu/userguide/boundaryanalysis/) | Dictionary-based word break for Thai |
| N3 | [Elasticsearch Thai tokenizer](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-thai-tokenizer.html) | Thai word segmentation in search indexes |
| N4 | [NN/g: Mobile Faceted Search with a Tray](https://www.nngroup.com/articles/mobile-faceted-search/) | Mobile filter tray, batch apply, result count |
| N5 | [NN/g: Filters vs. Facets](https://www.nngroup.com/articles/filters-vs-facets/) | Definitions |
| N6 | [Baymard: No Results Page](https://baymard.com/blog/no-results-page) | No-results recovery in e-commerce |
| N7 | [NN/g: Infinite Scrolling Is Not for Every Website](https://www.nngroup.com/articles/infinite-scrolling/) | When infinite scroll hurts |

IDs N1–N7 are local to this file; assign S-numbers when adding to sources.md.
