# DESIGN.md — Change Loop interfaces

Status: **approved** by the owner on 2026-11-18. Extracted from the shipped
stylesheets; nothing here is a redesign.

This file is the single source of visual rules for the repository's own user
interfaces. Agents read it before changing any of them. Consumer projects are
not bound by it.

## Surfaces

| Surface | Files | Look |
|---|---|---|
| Landing page | `website/index.html`, `website/styles.css` | Warm paper, ink text, orange signal, editorial serif display |
| Documentation site | `website/docs/src/styles/brand.css`, `website/docs/src/components/*.astro` | The landing palette under `--cf-*` names mapped onto Starlight; light only |
| Demo | `website/demo/` | The landing palette |
| Team dashboard | `dashboard/public/` | Warm paper with a blue signal; a separate product, its own palette |
| Pi team web UI | `pi-extensions/team-webui/web/` | Dark, warm accent |
| Examples | `examples/*/` | Generated sample apps; each keeps its own palette |

## Color tokens

Two layers, defined in each surface's `:root`:

- **Role tokens** say what a color is for. Use these first.
  - Landing and docs: `--paper`, `--paper-deep`, `--card`, `--ink`,
    `--ink-soft`, `--muted`, `--faint`, `--line`, `--line-dark`, `--signal`,
    `--signal-dark`, `--blue`, `--blue-soft`, `--green`, `--green-soft`,
    `--yellow` (docs: the same values as `--cf-*`).
  - Dashboard: `--paper`, `--card`, `--ink`, `--ink-soft`, `--muted`,
    `--faint`, `--line`, `--line-soft`, `--signal`, `--signal-soft`,
    `--marker`, `--ok`, `--ok-soft`.
  - Pi team web UI: `--bg`, `--panel`, `--raised`, `--line`, `--text`,
    `--muted`, `--accent`, `--green`, `--red`.
- **Palette tokens** (`--<hue>-<lightness>`, for example `--gray-400`,
  `--teal-500`, plus `--white` and `--black`) hold the remaining colors the
  surfaces already used, so no stylesheet writes a color literal. The number
  is lightness: 50 is lightest, 950 darkest. Prefer a role token; when a
  palette color gains a clear purpose, give it a role name.

Rules:

1. No color literal outside a custom-property definition in any stylesheet
   (`cloop quality readiness` row `ui-tokens` counts them; the target is 0).
2. A translucent color is a token mixed with transparent:
   `color-mix(in srgb, var(--ink) 8%, transparent)`, not a new `rgba()`.
3. A new color needs a reason a role token cannot serve. Add it as a token
   first; colors within ΔE 6 of an existing token use that token.
4. Pure white and black stay exact (`--white`, `--black`); they are never
   merged with a tinted neighbour.

## Accessibility

- Markup of every surface passes `node scripts/lint/ui-a11y.mjs` (headings
  in order, labels, alt text, `lang`, valid roles) with zero findings.
- `role="list"` on a styled list is deliberate (Safari drops list semantics
  without bullets) and allowed.
- Static lint cannot see contrast or focus order; check them rendered when a
  surface's colors or interaction change.

## Not yet tokenized (known drift)

Recorded so nobody mistakes it for intent; each moves to tokens when its
surface is next restyled, with the owner's approval:

- Font sizes: landing and docs use about 37 distinct sizes, the dashboard 20,
  the Pi web UI 21; no type scale exists.
- Radii: 10–13 distinct values per surface beside `--radius`.
- The landing and dashboard palettes differ slightly (`--paper` `#f2eee5` vs
  `#f4f1ea`); they are separate products and are not merged here.

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-18 | Every stylesheet color became a token; near-duplicates within ΔE 6 merged into the most used one (78 colors moved, largest ΔE 5.8) | One token source, as the UI readiness row requires; ΔE ≤ 6 is hard to see side by side |
