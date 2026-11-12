# Component states and keyboard contracts

A component is designed only when every applicable state is designed and its
keyboard behavior is specified. Mark states N/A with a reason rather than
leaving them blank. Source IDs resolve in [sources.md](sources.md).

## State checklist

```
default → hover → focus-visible → pressed → selected/checked → disabled
→ read-only → loading/busy → error/invalid → empty → skeleton
(+ open/closed, expanded/collapsed, indeterminate, dragged for compound components)
```

| Group | States | Design notes |
|---|---|---|
| Interactive | Default, hover, focus-visible, pressed, disabled | Hover only on devices that hover; focus visible on every surface; disabled still looks like the control, and explain why when not obvious |
| Selection | Selected, checked, indeterminate, current ("you are here"), activated | Selected ≠ focused; both can occur together and must look different |
| Value | Empty, filled, read-only, placeholder shown, out of range | Read-only stays readable and copyable; placeholder is never the label |
| Validation | Error, warning, success, info | Message + icon + border; never color alone [S67] |
| Content | Loading, skeleton, empty (first use / no results / filtered), error, stale, partial | Distinguish why content is absent |
| Structural | Open/closed, expanded/collapsed, dragging, drop target | Expose state programmatically (e.g. `aria-expanded`) [S91] |
| Permission | Hidden, visible but not allowed (with reason), allowed with limit | See [experience-architecture.md](experience-architecture.md) |

Rules:
- Disabled wins over hover/pressed; a disabled control shows no hover.
- Every state change that matters to the user is perceivable without color and,
  when it happens without focus moving, announced (status messages). [S13]
- Focus: visible on every control, never removed, shown for keyboard focus only (`:focus-visible`), at least 3:1 against what it sits on. **House value (the one focus-ring value in this skill):** a 2px ring with 2px offset on buttons and links; 3px, or a two-tone ring, where the surface behind varies or the kit targets high contrast. Other quiet forms that pass: an inset ring plus a tint on items inside a list or bar (nav, tabs, rows); on text inputs a border change to the accent plus a soft halo, with no stacked border and outline. Avoid a thick ring plus a border on the same control, and focus rings on headings or containers focused by script. Hover is a hint, never the only way to see something; pressed is darker or shifts 1px; touch has no hover, so the same information must be reachable by tap.
- State must survive forced-colors/high-contrast modes (borders and outlines,
  not only background tints).

**Hover and timing discipline.** One hover signal per element, on the container; never
scale the image. Nothing non-interactive reacts. Tooltip delay 800–1000 ms on hover, 0 on
focus. Focus rings never transition. No overshoot easing on UI state.

## Feedback timing (wait states)

One table so every screen waits the same way (S103; thresholds follow Nielsen's 0.1 / 1 / 10 s limits):

| Expected wait | Show |
|---|---|
| < 1 s | Nothing new; keep the old content, disable the trigger against double submit |
| 1–10 s | Skeleton in the final layout (first load) or an inline spinner on the trigger (actions); never a full-page overlay |
| > 10 s | Progress with counts ("312 / 1,200 แถว"), allow leaving; finish in the background with a notification |
| May exceed ~2 s | Offer Cancel |
| No answer by the timeout (default 30 s) | Error with Retry; for money or submit, the *unknown outcome* state in [patterns](patterns.md), never a silent retry |

Empty is five different states, each with its own copy and action: **loading** (not
empty yet) · **no records** (first use → create/import) · **no matches** (filters →
clear filters) · **insufficient access** (→ request access, without revealing what is
hidden) · **service unavailable** (→ retry, status). [S104]

## Interaction-color strategy

Pick one for the whole product:
- **State layer:** a translucent overlay for hover/pressed/focus on any base
  color; fewer tokens, consistent across colors.
- **Explicit per-state tokens:** hand-tuned hover/pressed colors per component;
  more control, more maintenance.

## Keyboard contracts (web)

All functionality must work from a keyboard (WCAG 2.1.1), and focus order must
preserve meaning (2.4.3). [S89, S90] Custom widgets follow the ARIA Authoring
Practices patterns [S14, S93], which are recommended conventions (a non-normative
W3C note), not WCAG requirements; many keys are marked optional there. Prefer
native HTML elements, which provide these behaviors already.

| Component family | Conventional keys and behavior |
|---|---|
| Button / toggle button | Enter and Space activate; toggle exposes pressed state |
| Link | Enter activates |
| Checkbox / switch | Space toggles |
| Radio group | Tab enters the group at the checked option; arrow keys move and select |
| Tabs | Tab reaches the tab list; arrows move between tabs; Home/End to first/last; activation automatic only if panels load instantly, otherwise Enter/Space |
| Accordion / disclosure | Enter/Space toggles the focused header (no arrow keys required); header is a button inside a heading with expanded state |
| Menu button / menu | Enter, Space or Down Arrow opens; arrows move; Escape closes and returns focus to the button; type-ahead optional. For site navigation APG examples use disclosure navigation instead of menus |
| Listbox / select | Arrows move; selection follows the pattern; type-ahead |
| Combobox | Typing filters; Down Arrow opens/moves in the popup; Enter selects; Escape closes; DOM focus stays in the input (active option via aria-activedescendant) |
| Dialog (modal) | Focus moves into the dialog; Tab cycles inside; Escape closes; focus returns to the trigger |
| Drawer / bottom sheet (modal) | Same as dialog |
| Tooltip | Appears on hover and focus; Escape dismisses; never holds interactive content (APG pattern is still provisional; rely on WCAG 1.4.13) |
| Popover (non-modal) | Opens on click/Enter; Escape closes; focus returns to trigger |
| Slider | Arrows step; Page Up/Down larger steps; Home/End min/max; value exposed |
| Data grid | Arrows move between cells; Home/End row edges; edit and commit keys: [advanced-components.md](advanced-components.md#editable-grid-cell) |
| Tree view | Up/Down move; Right expands/enters; Left collapses/goes to parent |
| Toolbar | One Tab stop; arrows move between controls |
| Carousel | Rotation pauses on focus/hover and has a pause control; previous/next are buttons [S92] |
| Toast / status | See [notifications.md](notifications.md#in-app-notifications) (no focus steal, live region, reachable actions) |

Content that appears on hover or focus (tooltips, hover cards) must be
dismissible without moving the pointer or focus, hoverable, and persistent until
dismissed or no longer relevant (WCAG 1.4.13). [S88]

Every custom control exposes name, role and state/value to assistive technology
(WCAG 4.1.2). [S91]

## Touch and native

- Touch targets: web minimum 24×24 CSS px with exceptions [S07]; iOS default 44×44 pt [S74]; Android ≥48×48 dp [S78].
- Extend small controls with a pseudo-element hit area; two hit areas never overlap.
- Choose the input mode with `@media (pointer: coarse)` / `(hover: none)`, not viewport
  width. Drag surfaces set `touch-action` and clear drag state on cancel and blur.
- Native platform controls bring screen-reader and keyboard behavior; custom
  controls must replicate VoiceOver/TalkBack labels, traits and actions
  (see [mobile-native.md](mobile-native.md)).
- Every gesture-only action has a visible alternative.

## Specifying a component (template)

```markdown
## <Component>
Purpose / use when / don't use when:
Anatomy (parts):
Variants and sizes:
States (each: visual + behavior; N/A with reason):
Keyboard and focus:
Screen-reader name, role, state:
Content rules (label length, truncation, Thai):
Responsive / touch behavior:
Do / Don't (with check):
```
