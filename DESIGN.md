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

## Type and radius scale

Every font size and corner radius in the landing page, docs brand styles,
demo, dashboard, and Pi team web UI is a token from one scale, defined in
each stylesheet's `:root`:

- Type: `--text-<px>` on the steps 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 30,
  36, 42, 48, 56, 64 (the docs site writes them in rem). Fluid headings are
  `--text-display-<n>` (their `clamp()` unchanged).
- Radius: `--radius-<px>` on 2, 4, 6, 8, 12, 16, 20, 24, 32, 48, plus
  `--radius-pill` (999px) and `--radius-round` (50%). Role radii such as
  `--radius` and `--cf-radius` stay.
- A new size or radius picks the nearest step. Relative sizes (`em`, `%`) and
  `0` stay literal. `node scripts/lint/ui-scale.mjs` reports any px/rem literal.

## Accessibility

- Markup of every surface passes `node scripts/lint/ui-a11y.mjs` (headings
  in order, labels, alt text, `lang`, valid roles) with zero findings.
- `role="list"` on a styled list is deliberate (Safari drops list semantics
  without bullets) and allowed.
- `node scripts/ui/rendered-check.mjs` renders the pages in Chrome at desktop
  and phone widths and runs axe-core (contrast, names, roles) with zero
  serious or critical findings, and no sideways scroll on a phone.
- Large display text in the brand orange uses `--signal-strong` (#e64a22,
  3:1 on paper); small text uses `--signal-dark` (#c53a19, 4.5:1). Text on an
  orange button is `--ink`, not white.

## Not yet tokenized (known drift)

Recorded so nobody mistakes it for intent; each moves to tokens when its
surface is next restyled, with the owner's approval:

- The landing and dashboard palettes differ slightly (`--paper` `#f2eee5` vs
  `#f4f1ea`); they are separate products and are not merged here.

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-18 | Landing contrast to WCAG AA: `--signal-dark` #d9401b→#c53a19, headline accent `--signal-strong`, ink text on the orange button, `--muted` #6b6d72→#67696e | The rendered check found them below 4.5:1 (3:1 for large text); owner chose this option from screenshots |
| 2026-11-18 | Font sizes and radii snapped to one scale (nearest step by ratio, ties larger; 8px text became 9px, half-pixel sizes whole) | Up to 28 sizes and 13 radii per surface had no system; the largest shift is about one step |
| 2026-11-18 | Every stylesheet color became a token; near-duplicates within ΔE 6 merged into the most used one (78 colors moved, largest ΔE 5.8) | One token source, as the UI readiness row requires; ΔE ≤ 6 is hard to see side by side |
