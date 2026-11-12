# Iconography — using icons correctly

Icons speed recognition only when people already know their meaning. Most
icons are ambiguous without a label. Source IDs resolve in [sources.md](sources.md).

## When to use an icon

| Situation | Use |
|---|---|
| Universally recognized action in context (search, close, menu on mobile, print, home) | Icon may stand alone if it also has an accessible name; still test with your users [S81] |
| Any other action or navigation item | Icon **with** visible text label, or text only |
| Status (success, warning, error) | Icon + text; icon reinforces meaning, color is never the only cue [S67] |
| Decoration next to a heading | Usually unnecessary; if used, hide from assistive technology [S63] |
| Dense toolbars for expert users | Icon-only acceptable when labels appear on hover **and** focus, the set is small and consistent, and users use it daily |

Default to icon + label. Icons without labels make people guess, and different
icon sets use the same glyph for different meanings. [S81]

## Choosing glyphs

- Use **one icon family** across the product (same grid, stroke width, corner
  radius, fill style). Mixing outline and filled sets reads as inconsistent.
- One meaning per glyph, one glyph per meaning. Record them in the design
  context (e.g. "trash = delete permanently; archive box = archive").
- Prefer established metaphors over clever ones. A metaphor nobody shares is a
  puzzle.
- Avoid culture-specific gestures, text inside icons, currency symbols that
  assume one market, and flags for languages.
- Filled vs outline can show selected vs unselected state (e.g. bottom tab bar),
  but pair it with another cue such as a label color or indicator.
- On native platforms, prefer the platform's symbol set (SF Symbols on Apple
  platforms, Material Symbols on Android). Apple asks for recognizable,
  highly simplified icons with accessibility labels, and suggests text when a
  short label communicates more clearly than an icon. [S75]

## Icon libraries: Lucide for UI, Simple Icons for brands

Two open libraries cover most web work. They do different jobs; never use one for the other's job.
`python3 scripts/icons.py search|lucide|brand …` finds, pastes and checks both (versions pinned in the script).

| | Lucide | Simple Icons |
|---|---|---|
| What | UI glyphs: actions, objects, status (calendar, phone, map pin, shield check). 2,029 icons in 1.70 (2026-11), community fork of Feather | Brand marks: 3,467 single-path logos of companies and services (LINE, WhatsApp, Messenger, Facebook, Instagram, TikTok, Shopee, Grab, Google Maps, Visa, Mastercard …) in 16.36 (2026-10) |
| Style | Outline, 24×24 grid, 2 px stroke, round caps and joins, 1 px padding [S108] | Filled single path on a 24×24 viewBox, the brand's own shape and one hex colour |
| Licence | ISC: free for any use; keep the copyright notice with the source (one comment line or a third-party notice) | Project CC0, **but each logo stays its owner's trademark**; only 224 entries list a licence, 839 link brand guidelines. Missing licence data proves nothing [S109] |
| Use for | Feature lists, nav, contact rows, process steps, status pills, buttons | Contact via (LINE, WhatsApp), pay with, integrations, "find us on", app-store and social links |
| Never for | Brand logos: Lucide does not accept them and points to Simple Icons [S108] | Decoration, proof ("trusted by" rows of logos the client has no relationship with), anything the brand did not make |

**Lucide rules.**
- Deliver per icon, not the whole set: inline SVG (`icons.py lucide <names>`), a sprite of the icons you use
  (`--sprite icons.svg`, then `<use href="icons.svg#phone">`), or per-icon imports (`import { Phone } from "lucide-react"`)
  so the bundle carries only those. The UMD script plus `createIcons()` and the icon font load all 2,000; prototypes only.
- Pin a version at least two weeks old (`lucide@1.58.0`, `lucide-static@1.58.0`); names change between majors.
- One stroke width per page: 2 at 16–24 px; 1.5 only for icons drawn at 32 px and up, set on all of them (React:
  `absoluteStrokeWidth` keeps 2 px at any size). Colour is `currentColor`; size follows the table below.
- Search by meaning, not name: `icons.py search booking` searches Lucide's tags (`calendar-check` is tagged "confirm").
- **No glyph fits** (Lucide has no tooth, no Thai-specific objects): draw one to Lucide's rules and keep it in the
  project's icon file: 24×24, 1 px padding, 2 px centred stroke, round caps and joins, 2 px radius on corners of shapes
  at least 8 px (1 px below), at least 2 px between elements, weight matching `circle` and `square` in a blur test
  [S108]. Never borrow one glyph from another family; Phosphor, Tabler and Heroicons differ in stroke and corners.

**Simple Icons rules.**
- Use a mark only to name or link to that brand, unaltered: no recolouring into your palette, no outline version, no
  cropping, no combining with your own logo. Open the guidelines link `icons.py brand` prints; some brands require
  their own badge or button instead (app-store badges, "Sign in with Google/Apple", payment acceptance marks):
  use the brand's official asset there, not the Simple Icons glyph.
- Colour: the brand hex, or monochrome in ink (`--mono`). The brand colour must reach 3:1 against its ground
  (WCAG 1.4.11): LINE `#00C300` is 2.2:1 on a warm cream ground, so it goes mono or onto a solid chip of its colour with
  a white glyph, as the brand itself does. `icons.py brand line --ground "#faf7ef"` checks it.
- Not in the set (PromptPay, Thai banks such as KBank and SCB, Lazada, Agoda, Wongnai, LINE MAN as of 16.36): take the
  official file from the brand's media kit, or write the name in text. Never redraw or approximate a logo.
- The link or button carries the accessible name ("แชทกับเราทาง LINE"); the mark is `aria-hidden`.

**Mixing the two in one row** (a contact row: Lucide `phone` beside the LINE mark) is fine because the roles differ.
Match optical size, not box size: a filled brand mark reads larger, so draw it at about 0.85–0.9× the Lucide size
(20 px Lucide, 17–18 px brand), on one baseline, in ink unless the brand colour passes. Brand marks never enter
the UI icon family (no LINE glyph in the nav as "chat").

## Size, alignment and contrast

| Rule | Detail |
|---|---|
| Size from the type scale | Common pairs: 16 px icon with 14–16 px text, 20 px with 16–18 px, 24 px for standalone controls, 32 px for large markers (sizes: [visual-system.md](visual-system.md)) |
| Optical alignment | Center the icon on the text's x-height or cap height, not the line box; check Thai text with ascenders/descenders |
| Spacing | Consistent gap between icon and label (e.g. 6–8 px) from spacing tokens |
| Hit target | The **target** meets minimums even if the glyph is small: WCAG 2.5.8 24×24 CSS px (AA, with exceptions), iOS default 44×44 pt (HIG minimum 28×28 pt), Android at least 48×48 dp [S07, S74, S78] |
| Contrast | Icons that convey information or are the only identifier of a control need 3:1 against adjacent colors (WCAG 1.4.11) [S04] |
| Color | Inherit text color (`currentColor`) by default; use semantic colors only for status |

## Accessibility implementation

| Case | Markup |
|---|---|
| Decorative icon next to visible text | `aria-hidden="true"` on the SVG; text provides the name [S63] |
| Icon-only button | `<button aria-label="ลบรายการ">` with `aria-hidden` SVG inside; accessible name describes the action, not the picture ("ลบ" not "ถังขยะ") |
| Icon that conveys status alone | Give it a text alternative (`role="img"` + `aria-label`, or visually hidden text) |
| Icon + visible label | Accessible name must include the visible label text (WCAG 2.5.3) [S64] |
| Tooltip on icon-only button | Shows on hover **and** keyboard focus, is dismissible, and does not replace the accessible name |

## Icon inventory in the design system

Keep an icon list with: name, glyph, meaning, allowed contexts, sizes, and
whether it may appear without a label. Add new icons through review so
meanings don't drift. Record the inventory in the design context; component
states are in [component-states.md](component-states.md).

## Build checklist (product UI)

1. Every navigation item has an icon and a visible label, from one family.
2. Icon-only controls are limited to bell, search, close, menu and similar, each with `aria-label` and `title`.
3. Status pills pair an icon with text; trend uses an icon plus hidden text, never the characters ▲▼.
4. Delivered as one sprite or one package; the glyph → meaning table lives in DESIGN.md.
5. Run `scripts/slop_check.py <page>`: `nav-without-icons` and `mixed-icon-families` must be clear; `mixed-icon-strokes`
   and `mixed-icon-fill` are cleared or waived in one sentence (filled for a selected tab is a valid reason).

## Review checklist

1. Every icon-only control is from the "universally recognized" list or has a visible label.
2. One family, one stroke style, consistent sizes from the scale (`slop_check.py` reports `mixed-icon-families`,
   `mixed-icon-strokes`, `mixed-icon-fill`; brand marks and logos do not count).
3. Each glyph has one meaning across the product.
4. Decorative icons are hidden from assistive technology; meaningful ones are named.
5. Targets meet the platform minimum; informative icons meet 3:1 contrast.
6. Status icons are paired with text; color is not the only cue.
7. Icons align optically with Thai and Latin text.

## Do / Don't

| Do | Don't |
|---|---|
| Pair icons with text labels by default. | Ship a toolbar of unlabeled icons for occasional users. |
| Name icon buttons by action ("แก้ไขที่อยู่"). | Name them by picture ("ดินสอ"). |
| Use one icon family and one meaning per glyph. | Use a star for "favorite" on one page and "rating" on another. |
| Keep the hit area large even when the glyph is small. | Make a 16 px icon the whole tap target. |
| Use icons to reinforce status alongside text. | Show a red dot as the only signal of an error. |
