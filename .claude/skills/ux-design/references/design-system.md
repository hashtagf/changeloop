# Design system file, Token Block, and Design QA

`design-system.html` is one self-contained file. The values come from
`ux-ui-principles` (visual system, accessibility, components usage, motion);
this file fixes the shape the checker reads.

## Contents

- Tokens
- Base components
- Component sections
- Patterns
- Accessibility, validation, motion
- Token Block
- Versioning
- Design QA

## Tokens

Colour (primary, secondary, neutral, success, warning, error, info), type
scale, spacing, radius, shadow, z-index, grid, breakpoints, motion duration
and easing. Dark mode, when chosen, defines every colour token for both modes
and the page has a mode switch. Thai body text uses line-height ≥ 1.6; name the
Thai and Latin fonts with fallbacks and show mixed Thai/English samples.

## Base components

Always present, even when no screen uses one yet (the checker reads
`data-component` values):

`button`, `icon-button`, `link`, `input`, `textarea`, `select`, `combobox`,
`checkbox`, `radio`, `toggle`, `date-picker`, `file-upload`, `badge`,
`avatar`, `tooltip`, `dropdown-menu`, `tabs`, `breadcrumb`, `pagination`,
`card`, `modal`, `drawer`, `toast`, `alert`, `skeleton`, `spinner`,
`progress`, `empty-state`, `stepper`, `sidebar`, `navbar`, `footer`.

Add every component the Screen Inventory names beyond these.

## Component sections

Each component is a `<section data-component="<name>">` that shows:

- Every relevant state: default, hover, focus, active, disabled, loading,
  error, success.
- Variants and sizes (primary / secondary / ghost / danger; sm / md / lg).
- An HTML snippet in `<pre><code>` with a copy button
  (`<button type="button" data-copy>`).
- When to use it and when not to.

## Patterns

- Back office: a data table with filter, sort, search, pagination, bulk
  action, export, truncation with a full value on hover or focus, selected and
  disabled rows, sticky header, right-aligned numbers.
- Landing: hero, feature grid, testimonial, pricing, FAQ, CTA banner,
  registration form.

## Accessibility, validation, motion

- WCAG 2.2 AA: text contrast ≥ 4.5:1, visible focus ring, touch targets
  ≥ 44px, full keyboard use, accessible names, meaning never by colour alone.
- Validation: when it runs (on blur, on submit), where errors appear, helper
  text, the required indicator.
- Motion: duration and easing tokens, one micro-interaction per component,
  `prefers-reduced-motion` honoured.

## Token Block

The end of the file holds every CSS variable and component class in one
`<pre id="token-block">` with a "copy all" button. Its first and last lines are
fixed:

```css
/* Design System v1.0 — 2026-11-19 */
:root { /* … every token … */ }
/* … every component class … */
/* end Design System */
```

Every artifact embeds this block verbatim in a `<style>` element and writes no
other style rules except page layout under a `/* page layout */` comment that
uses tokens only.

## Versioning

A token or component change happens in `design-system.html` first: raise the
version (minor for additions, major for a changed or removed token), add a
uxui.md Changelog row naming the change and the artifacts that must copy the
new Token Block, then update those artifacts.

## Design QA

Every artifact ends with `<section id="design-qa">` holding:

- `Design System vX.Y` — the version its Token Block carries.
- Screens and states covered against the Screen Inventory (✓ / ✗).
- Components used, and any new ones.
- Accessibility check results: contrast, focus, keyboard, accessible names.
- What is still open or needs the user's answer.
