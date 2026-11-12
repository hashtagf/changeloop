# Accessibility: requirements, checks and verification

This is a scoped aid, not the complete WCAG checklist or a conformance audit.
Source IDs resolve in [sources.md](sources.md). WCAG success criteria are
normative; Understanding documents and APG explain application. AA conformance
includes all applicable A and AA criteria, entire pages, and complete processes.
[S02] A passing automated scan or screenshot does not establish that the whole
product conforms.

Use the product's stated accessibility target. Where no web target exists,
propose WCAG 2.2 AA as the working baseline and make the assumption visible.

## Visual and input checks

| Criterion | Level | Check and important qualification | Source |
|---|---|---|---|
| 1.4.3 Contrast (Minimum) | AA | Text ≥4.5:1; large text ≥3:1. Large means ≥18pt regular or ≥14pt bold (24 or about 18.67 CSS px). Check computed colors; do not round a failing ratio upward. Exceptions include inactive controls, decoration, and logotypes. | S03 |
| 1.4.11 Non-text Contrast | AA | Necessary visual information for controls/states and graphical objects ≥3:1 against adjacent colors, subject to exceptions. This does not require every decorative border to contrast. | S04 |
| 1.4.10 Reflow | AA | For horizontal writing, content works at width equivalent to 320 CSS px without two-dimensional scrolling or loss. Two-dimensional content such as data tables can be excepted; the surrounding page still reflows. | S05 |
| 1.4.12 Text Spacing | AA | No loss when users set line-height 1.5×, paragraph spacing 2× font size, letter spacing .12em, word spacing .16em. These are override tests, not mandatory default design values. Properties unused by a language/script need not apply. | S06 |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets ≥24×24 CSS px, or qualify for exceptions: sufficient spacing, equivalent control, inline, user-agent control, essential. For spacing, test the 24px-diameter circles centered on undersized targets against nearby targets/circles. | S07 |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Author-created content must not entirely hide the component receiving keyboard focus. Test sticky headers, cookie banners, and overlays. Partial obstruction is distinct from complete hiding. | S08 |
| 2.4.13 Focus Appearance | AAA | Focus indicator area and contrast-change requirements apply with specified exceptions. The common 2 CSS px perimeter-equivalent area and 3:1 focused/unfocused change are AAA, not 2.4.11 AA. | S09 |
| 2.5.7 Dragging Movements | AA | Supply a single-pointer action without dragging unless essential or user-agent determined; keyboard-only support is not the same alternative. | S10 |
| 3.3.7 Redundant Entry | A | Reuse or make selectable information already entered during the process, with essential/security/stale-information exceptions. | S11 |
| 3.3.8 Accessible Authentication (Minimum) | AA | Avoid cognitive-function tests unless an allowed alternative, assistance mechanism, or exception applies. Support password managers and paste; inspect the whole login and recovery flow. | S12 |
| 4.1.3 Status Messages | AA | Expose qualifying status messages programmatically without requiring focus to move. Choose appropriate roles/live regions; do not make every update an interrupting alert. | S13 |

**Touch targets:** the WCAG floor is 24px. The project default for web mobile is
≥44px, form controls 48px; render_check's 44px check is a project preference, not
WCAG. Verify platform-specific guidance for native controls rather than
translating units mechanically.

**Exceptions need evidence.** For target size, measure the actual hit area, not
only the visible glyph, and do not accept an arbitrary gap between icons as
proof of the spacing exception. Large-text and inactive-control exceptions need
their actual conditions checked; do not use those exceptions to make essential
help unreadable. Reflow exceptions for tables or maps do not exempt the
surrounding page from adaptation.

## Semantics and keyboard checks

Prefer native buttons, links, form controls, headings, lists, and tables. Give
controls accessible names; expose relevant state and associate field errors.
Inspect accessible name, role, state, and relationship rather than relying on
appearance. Use a custom widget only when the task needs it, then verify its
keyboard and assistive-technology behavior: ARIA does not add missing keyboard
behavior. APG is informative implementation guidance, not a separate
conformance standard. [S14]

Walk the critical task using the keyboard: order, activation, escape, and focus
return after dialogs. Ensure focus remains visible. Sticky UI must not fully
cover a focused control; SC 2.4.11 concerns obscuration, not a focus-ring contrast
ratio. See [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

For modal dialogs, move focus inside appropriately, keep Tab/Shift+Tab within
the dialog while open, provide a visible close mechanism, support Escape in
the modal pattern, and return focus to the invoker or a logical next location.
Only mark a dialog modal when background interaction is actually blocked.
For long or structured content, initial focus may belong on a static heading
rather than the first input. [S15]

Inspect keyboard reachability, focus order, visible focus, labels/instructions,
color-independent meaning, and non-text alternatives against the full standard
when relevant. Do not report these as passed from a still image. [S02]

Check screen-reader names, relationships, state, and important announcements
when the relevant environment is available. Source-level expectations remain
unverified until the actual assistive interaction is checked.

## Motion

Honor reduced-motion preferences for nonessential movement. SC 2.3.3 allows
disabling nonessential interaction-triggered animation and is AAA. Do not
label all reduced-motion support an AA mandate. Separately assess autoplay,
moving content and flashing under applicable criteria. [S16, S02] Verify
reduced-motion behavior when animation is involved.

## Build an evidence plan proportional to the change

| Available surface | Can establish | Cannot establish alone |
|---|---|---|
| Source inspection | Intended markup, event paths, styles, and declared semantics | Actual rendering, focus behavior, usability |
| Screenshot | Visible composition, clipping, labels, and some state cues | Keyboard, screen reader, persistence, timing |
| Browser interaction | Actions, transitions, focus, responsive behavior, persistence checks | Outcomes for every user population |
| Accessibility tooling | Specific detectable violations or inspected properties | Complete WCAG conformance |
| Task-based user observation | Observed comprehension and completion for the tested people/tasks | Universal usability or unmeasured improvement |

Exercise the changed critical action with realistic data. Include a relevant
failure or recovery state when the change affects it. Test representative wide
and narrow layouts, enlarged text/zoom, long labels, and applicable themes.

Describe what was tested, on which surface, and what remains unknown. Do not
invent participant feedback, measurements, pass counts, or a usability score.
When rendered verification is unavailable, deliver a scoped specification or
source review with that limitation; do not fabricate a completed live check.

## Report accurately

Record criterion, scope, environment, procedure, actual result, and remaining
unknowns. Automated checks, manual keyboard checks, and screen-reader tests
cover different failure modes. A measured contrast pass is one criterion
result; it is not a declaration that the product conforms to WCAG.

Use one concrete example per material finding, then state the consequence,
repair, and verification. Separate observed failures from plausible risks.
Fix blockers and lost-work paths before polishing low-impact details.

The normative standard is [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
The linked Understanding pages explain individual criteria and exceptions;
consult the full criterion before making a conformance claim.
