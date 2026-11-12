# Components — choosing and using them correctly

Which component fits a task, when not to use it, and the behavior it must have.
States and keyboard contracts for every family are in
[component-states.md](component-states.md); visual tokens in
[visual-system.md](visual-system.md); form controls in depth in
[forms.md](forms.md). Keyboard expectations follow the ARIA Authoring Practices
patterns. [S14, S93] Source IDs resolve in [sources.md](sources.md).

**Use what exists.** Native element → headless primitive → hand-rolled, in that order.
Never put a click handler on a `div`. A hand-rolled control owes the full contract: arrow,
Enter and Escape keys; focus trap and return; ARIA roles and state; click-outside;
background scroll lock.

## Part 1 — choosing between similar components

### Showing extra information or a task over the page

| Need | Use | Not |
|---|---|---|
| Short label for an icon or truncated text, non-interactive | **Tooltip** (hover + focus) | Tooltip with links, buttons or essential instructions |
| Small interactive content tied to a control (filter options, color picker, quick details) | **Popover** (non-modal) | Popover for multi-step tasks |
| Preview of a linked object on hover (person, record) | **Hover card**, with the same content reachable by clicking | Only-on-hover information (fails touch) |
| A decision that blocks continuing ("Discard changes?") or a short focused task | **Dialog (modal)** | Dialog for long forms, or for information that should stay visible |
| View/edit details while keeping the list context | **Drawer / side sheet** | Drawer for complex multi-section work |
| Mobile secondary actions or short choices | **Bottom sheet** | Bottom sheet stacking over bottom sheet |
| Long, focused or multi-step work | **Full page** with its own URL | Modal with internal scrolling and steps |

### Feedback and messages

| Need | Use |
|---|---|
| Result of the user's own action, low importance ("บันทึกแล้ว") | **Toast** — rules in [notifications.md](notifications.md#in-app-notifications) |
| Error tied to a field or section | **Inline message** next to it |
| Page- or system-level state (offline, maintenance, pending approval) | **Banner** — persistent while true |
| Must decide before continuing | **Dialog** |
| Something new happened elsewhere | **Badge / notification center** ([notifications.md](notifications.md)) |

### Navigating long collections

| Situation | Use | Notes |
|---|---|---|
| Users need to reach a specific position, share or return to it (admin lists, search results) | **Pagination** | Show total, page size option; keep page in URL |
| Browsing a feed where position doesn't matter | **Infinite scroll** | Breaks footer access, back position and keyboard users; provide "load more" fallback and preserve position |
| Mobile lists, moderate size | **Load more** button | Predictable, accessible, keeps footer |
| Very large tables | **Virtualized list/grid** + server filtering | Keep row count and position visible |

### Switching views and sections

| Situation | Use |
|---|---|
| Parallel content categories, one visible at a time, no comparison across them | **Tabs** [S21] |
| 2–5 mutually exclusive view modes or filters of the same content (Day/Week/Month) | **Segmented control** |
| Optional details users may skip; many sections on one page | **Accordion / disclosure** |
| Long page with sections users jump between | **Anchor navigation / table of contents** |
| Ordered process | **Stepper** |

### Choosing values

| Situation | Use |
|---|---|
| 2–6 options, one choice, options should be visible | Radio group |
| 2–5 options, one choice, compact and immediate (view switch) | Segmented control |
| ~7–15 known options | Select |
| Long or searchable list | Combobox / autocomplete |
| Several choices from a short list | Checkboxes |
| Several choices from a long list | Multi-select combobox with chips |
| Moving many items between two sets with search (permissions, assignments) | Transfer list |
| On/off that applies immediately | Switch |
| On/off submitted with a form | Checkbox |
| Approximate value in a range, visual | Slider + numeric input |
| Exact number | Number input (with stepper buttons if small ranges) |

### Triggering actions

| Situation | Use |
|---|---|
| The main action of a region | Primary button (one per region) |
| Other actions | Secondary / tertiary buttons |
| Navigation to another page | Link (not a button) |
| Several related actions, one most common | Split button |
| Many secondary actions on a row or card | Overflow menu (⋯) with labeled items |
| Actions on a selection | Bulk action bar that appears with selection |
| Context-specific actions on right-click | Context menu **plus** a visible alternative |
| Frequent creation action on mobile | FAB (one per screen) |
| Power users jumping anywhere | Command palette (⌘K / Ctrl K) in addition to normal navigation |

## Part 2 — component guidance

Each entry: **Use when · Avoid when · Must have · Notes**.

### Actions

**Button** — Use: performing an action. Avoid: navigation (use link). Must have: verb label naming the result; one primary per region; loading state that prevents double submit; disabled only with a visible reason or prefer enabled + validation message. Notes: destructive buttons name the consequence ([content-design.md](content-design.md)).

**Icon button** — Use: universally understood actions in tight space. Avoid: anything ambiguous. Must have: accessible name by action, tooltip on hover and focus, target size ([iconography.md](iconography.md)).

**Link** — Use: going somewhere. Must have: descriptive text out of context; distinguishable from body text without color alone (underline or other cue). [S67]

**Split button / dropdown button** — Use: one common action plus related variants ("ส่งออก CSV ▾ PDF, Excel"). Avoid: unrelated actions. Must have: main part and arrow part as separate targets with separate names.

**FAB** — Use: the single most common creation action on a mobile screen. Avoid: multiple FABs; actions that aren't creation. Must have: label or accessible name; doesn't cover content or the last list item.

**Command palette** — Use: large apps with frequent expert users. Avoid: as the only way to reach features. Must have: discoverable trigger in UI, fuzzy search, recent items, keyboard navigation.

### Navigation

**Sidebar / navigation drawer** — Use: apps with 5+ sections used daily. Must have: current page indicated visually and programmatically (`aria-current`), collapsible on medium widths, becomes a drawer or top/bottom nav on phones.

**Top navigation bar** — Use: few sections, content sites. Avoid: deep hierarchies.

**Bottom navigation (mobile)** — Use: 3–5 top-level destinations. Must have: icons with labels; preserve each tab's state.

**Breadcrumb** — Use: hierarchies 3+ levels deep. Must have: shows hierarchy (not history), current page last and not a link. [S57]

**Tabs** — See Part 1. Must have: visible selected state beyond color; tab content loads without layout jump; deep link to a tab when users share it.

**Stepper / wizard** — Use: ordered steps with validation per step. Must have: step names, current position, Back without data loss, review step before commit for consequential tasks. Avoid: for short forms.

**Pagination** — Must have: previous/next, current page, total results, page size; keyboard reachable; URL reflects page.

**Anchor nav / TOC** — Use: long documents and settings pages. Must have: highlights current section; works with keyboard; sticky only if it doesn't cover content.

**Menu (dropdown, context, overflow)** — Use: lists of actions. Avoid: site navigation (use navigation links or disclosure navigation, as APG examples advise). Must have: labeled items, destructive items separated and styled, keyboard pattern, Escape returns focus. [S93]

### Inputs and selection (summary; full guide in [forms.md](forms.md))

**Select** — native when possible; ~7–15 options; avoid for 2–3 options (use radios).

**Combobox / autocomplete** — Use: long lists (banks, provinces, customers). Must have: filtering as you type, "no results" message, keyboard pattern, selected value visible, handles slow results with a loading state. [S93]

**Multi-select with chips** — Must have: chips removable by keyboard and pointer, count when many selected, clear all.

**Chips / tags** — Two different things: **filter chips** (toggle filters, selected state visible) and **display tags** (non-interactive labels). Don't make display tags look clickable.

**Checkbox / radio / switch** — See forms; switches only for immediate effect.

**Segmented control** — 2–5 short options; exactly one selected; behaves like a radio group.

**Slider / range slider** — Use: approximate values where visual position helps (price range filter). Avoid: precise values. APG warns touch screen readers may not operate custom sliders, so test on devices. [S93] Must have: numeric input alongside, visible value, keyboard steps, adequate thumb size.

**Date picker / date range picker** — Must have: typed entry plus calendar; presets for common ranges ("7 วันที่ผ่านมา", "เดือนนี้"); disabled dates explained; time zone stated when relevant; locale formats and Buddhist/Gregorian year policy ([i18n-performance.md](i18n-performance.md)).

**Time picker** — Typed entry or list of valid slots; 24-hour format for Thai UI unless users expect otherwise.

**File upload / dropzone** — Must have: button to choose files (drag-drop is extra), allowed types and size up front, per-file progress, cancel/remove/replace, specific errors per file ("ไฟล์ใหญ่เกิน 10 MB"), retry, preview for images.

**Search input** — Must have: label (visible or accessible), clear button, submit on Enter, scope indicator if scoped, recent searches and suggestions where useful, "no results" with next steps, query kept in URL.

**Inline edit** — Use: quick edits of single values in tables or detail pages for frequent users. Must have: clear edit affordance, Enter saves, Escape cancels, saving/saved/error states per field, conflict handling. Avoid: for consequential values (limits, amounts) — use a form with review.

**Rich text / markdown editor** — Must have: toolbar with labeled controls, keyboard shortcuts listed, paste handling, autosave status, character limits if any.

**Rating** — Must have: radio-group semantics, labels for values ("1 = แย่มาก"), allow clearing if optional.

**Transfer list** — Must have: search in both lists, counts, move selected/all, keyboard support.

### Data display

**Table** — See [back-office.md](back-office.md): identifier first, numeric right-aligned with tabular figures, sortable headers announce sort state, sticky header for long tables, row actions consistent, empty/filtered/loading states. Use real `<table>` semantics for static tables.

**Data grid (editable)** — Use: spreadsheet-like editing by experts. Must have: grid keyboard pattern, cell edit mode, validation per cell, undo, frozen identifier column, column resize/hide with persistence. [S93]

**List** — Use: single-dimension items (messages, tasks). Must have: consistent row anatomy, primary text first, secondary metadata muted.

**Description list (key–value)** — Use: record details. Must have: labels muted and aligned, values selectable/copyable, empty values shown as "—" with meaning ("ไม่มีข้อมูล" vs "ไม่ได้ระบุ").

**Card** — Use: browsable, heterogeneous items with an image or summary. Avoid: for data users must compare (use table) and as decoration around every section ([design-quality.md](design-quality.md)). Must have: one primary click target; nested interactive elements reachable separately.

**Stat / KPI** — Must have: value, unit, comparison, time window, freshness; abnormal state with text, not color only.

**Badge / count** — Use: unread or pending counts, short status. Must have: cap (99+), accessible text ("3 รายการรอตรวจ"), clears when handled.

**Status pill** — Must have: text from the status glossary plus color; consistent across pages.

**Avatar** — Must have: fallback initials, alt/name, consistent size; don't rely on photos for identity in security-sensitive contexts.

**Timeline / activity feed** — Must have: time with time zone, actor, action, target; grouped by day; newest-first unless process order matters.

**Tree view** — Use: real hierarchies users navigate (folders, org structure). Must have: expand/collapse state, tree keyboard pattern, lazy loading state, search for large trees. [S93]

**Calendar (display)** — Must have: list/agenda alternative for screen readers and small screens; today indicator; time zone.

**Kanban board** — Must have: keyboard/menu alternative to drag ("ย้ายไปคอลัมน์…"), WIP counts, card anatomy consistent. [S10]

**Carousel** — Usually avoid: later slides are rarely seen. If used: user-controlled, previous/next buttons, slide position, pause for auto-rotation, no auto-advance on mobile. [S92]

**Chart** — See [data-visualization.md](data-visualization.md).

**Code block / ID display** — Monospace only for code/IDs; copy button with confirmation.

### Feedback and status

**Alert / banner** — Must have: severity icon + text, title stating the issue, action, dismiss only if the condition is informational.

**Toast / snackbar** — Rules in [notifications.md](notifications.md#in-app-notifications). Errors that need action are not toasts.

**Progress bar / circle** — Determinate when progress is known; show what is happening and estimated time for long jobs.

**Spinner** — Only for short waits inside a component; use skeletons for page/section loading.

**Skeleton** — Match final layout to prevent shift; don't use for very fast loads (flash).

**Empty state** — Distinguish first use (explain value + first action), no results (adjust filters), and error (retry); include one clear action.

**Result page (success, 404, 403, 500)** — Say what happened, what to do, and give a way forward (home, search, contact); 403 explains access without leaking data; 500 offers retry and a reference ID.

**Onboarding tour / coach marks** — Usually less effective than good empty states and contextual hints; if used, short, skippable, resumable, never blocking.

**Confirmation dialog** — Only for consequential actions; title names the action; buttons repeat the verb ([trust-security-privacy.md](trust-security-privacy.md)).

### Overlays

**Dialog** — Must have: title, focus moved inside, Escape and visible close, focus returned to trigger, scroll lock on background, sized for content; on mobile becomes full-screen or bottom sheet. [S93]

**Drawer** — Must have: same focus rules if modal; preserves underlying context; width for content; unsaved-changes guard.

**Popover** — Must have: anchored to trigger, Escape closes, closes on outside click, focus management appropriate to content.

**Tooltip** — APG tooltip pattern is still provisional; WCAG 1.4.13 is the firm requirement. Must have: short text only, shows on hover and keyboard focus, dismissible with Escape, hoverable, doesn't hide what the user is working on. [S88]

**Bottom sheet** — Must have: drag handle plus close button, snap points, doesn't trap back gesture.

### Layout components

**App shell / page header** — Consistent title, description, status, freshness and primary action placement on every page.

**Accordion** — Must have: header button with expanded state; allow several open unless content truly conflicts; don't hide information users need to compare.

**Split pane / resizable** — Must have: keyboard resizing, sensible minimums, remembered size.

**Sticky elements** — Must not cover focused content, errors or the last list item; account for on-screen keyboard. [S08]

**Toolbar** — Group related controls, one Tab stop with arrow navigation for dense toolbars. [S93]

### Patterns built from components

| Pattern | Key guidance |
|---|---|
| Filter bar | Applied filters visible as removable chips, "clear all", result count, filters in URL |
| Bulk actions | Selection scope (page vs all matches) explicit, count, partial failure report ([patterns.md](patterns.md#dashboards-tables-and-expert-work)) |
| Share dialog | Who has access, role per person, link scope, copy link with confirmation |
| Cookie / consent banner | Accept and reject equally easy; granular settings; no pre-ticked optional categories; remembers choice ([trust-security-privacy.md](trust-security-privacy.md)) |
| Notification preferences | Per type × channel matrix; essential types labeled as not switchable |
| Profile / account menu | Name and account shown; sign-out separated; account switching if supported |

## Component review checklist

1. The component matches the task (Part 1), not just appearance.
2. All applicable states designed; N/A states justified ([component-states.md](component-states.md)).
3. Keyboard pattern and focus behavior specified; native element used where possible.
4. Name, role and state exposed; labels from the glossary.
5. Touch target and responsive behavior defined.
6. Content rules: label length, truncation, Thai text.
7. Same component behaves the same everywhere in the product.

## Do / Don't

| Do | Don't |
|---|---|
| Use a link for navigation and a button for actions. | Make a `<div>` clickable with no role or keyboard support. |
| Use pagination for admin lists users return to. | Use infinite scroll on a table people need to reference. |
| Put essential instructions in visible text. | Hide required information in a tooltip. |
| Use a full page for long, focused work. | Put a 20-field form with steps inside a modal. |
| Offer a menu or button alternative to drag-and-drop. | Make Kanban cards movable only by dragging. |
