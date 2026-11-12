# Design tokens to code

Turns a chosen direction into files a project can use, with the contrast already checked.
Use it in phase 5 (Implement) after the direction is chosen, or to start `DESIGN.md` colors.

```
python3 scripts/export_tokens.py <direction-id> --out src/styles
python3 scripts/export_tokens.py --list
python3 scripts/export_tokens.py --json my-brand.json     # same keys as a directions.json entry
python3 scripts/export_tokens.py <direction-id> --only css,tailwind,shadcn   # subset of files
python3 scripts/export_tokens.py <direction-id> --shape soft     # soft | mixed | sharp; same radius rule as DESIGN.md
```

`--shape` applies the radius rule `design_md.py` uses (one function, `shape_radii()`): `soft` turns a 0px
direction into 24px cards and pill buttons (what DESIGN.md writes when the subject is round; its Decision log
then prints the command with `--shape soft`), `sharp` forces 0px and square buttons, `mixed` or no flag keeps the
direction. A `round` button uses the input radius (`max(6px, 0.6 × card)`), so `--radius-button` and DESIGN.md's
`rounded.md` agree.

Without `--out` nothing is written: `tokens.css` goes to stdout (the contrast report to stderr), so a run from the skill folder leaves no files;
with `--only` it prints each selected file after a `/* ===== name ===== */` line. Exit codes: 1 when a
color pair cannot pass, 2 for a usage or input error (unknown direction, bad flag value, unreadable `--json`).

| File | For | Notes |
|---|---|---|
| `tokens.css` | any stack | `--color-*`, fonts, `--radius-*`, shadow, space, type, motion (`--dur-fast/base/slow`, `--ease-out/in/in-out`; names and meaning owned by [motion.md](motion.md) §2). Light and dark; `data-theme` or `prefers-color-scheme` switches. Reduced motion zeroes the durations. |
| `tailwind-theme.css` | Tailwind v4 (see [Tailwind](tailwind.md)) | `@theme inline` onto `tokens.css`: `bg-paper`, `text-ink`, `bg-accent`, `rounded-card`, `font-display`. |
| `shadcn-globals.css` | shadcn/ui | `:root`, `.dark`, chart 1–5, sidebar, `--radius`, `@theme inline`. Replace the default blocks in `globals.css`. |

## One brand, one token set

A direction is the single source for a brand's public pages **and** its product UI. Do not
pick a separate back-office look for the same product: `scripts/brand.js` derives the
product style from the direction (same ground, ink, accent, faces and radius; quieter
ground for long sessions) and borrows only structure and density (navigation, table style,
row height) from the closest look in `assets/backoffice/styles.json` (`product.base` in the
direction overrides the choice). Picture it with
`node scripts/backoffice_preview.js --direction <id> --screens overview,records`. Export
the tokens once with `export_tokens.py <id> --out <project styles dir>`; the admin uses the same `tokens.css` with its
own density variables.

## Rules the script applies

- Dark theme is **derived** (or light, for a dark direction) and every pair is checked for
  WCAG AA; colors move in lightness until they pass. It exits 1 if one cannot.
- **Fill and text accents are separate**: `--color-accent` keeps the brand color for fills and
  buttons; `--color-accent-text` is the darker or lighter step for links and small text.
- Text on the accent fill is picked for contrast (`--color-accent-ink`). The script prints a
  `note` when it changes the direction's own value (many bright accents need dark text).
- Text roles are checked on the page **and on cards**, light and dark: ink, muted and accent-text at 4.5:1,
  the focus ring at 3:1, on `--color-paper` and on `--color-surface`. Accent-text and focus move until they pass on both.
- Cards of the opposite tone (light cards on a dark page) get `--color-surface-ink` and `--color-surface-muted`
  (the direction's `cardInk` / `cardMuted` when set and passing), plus `--color-surface-accent-text` and
  `--color-surface-focus`, emitted only for such directions. In DESIGN.md these are `on-card`, `card-muted`,
  `card-primary-text`, `card-focus`; `design_md_check.py` checks them on `surface` instead of the page roles and
  exits 1 on any failed AA pair.
- Status colors (ok, warn, bad, info) are derived per theme to 4.5:1. Never rely on color alone.
- Thai falls back to Noto Sans Thai in every font stack.

## After exporting

1. Add the Google Fonts links for the two families (Latin faces here are approximations).
2. Run `python3 scripts/contrast.py --css <page>` on the built page, not only on the tokens.
3. Read each `note`: they are the places where the direction was bent to pass.
4. Record the result in `DESIGN.md` (colors, dark theme, radius, why); see
   [design memory](design-memory.md).

Limits: tints are decorative, not text colors; shadows are one preset per surface rule;
one brand per run (multi-brand: see "Multi-brand and white-label theming" below), no density tokens; check the dark theme by eye, it is derived, not designed.

## Multi-brand and white-label theming

`export_tokens.py` emits one brand per run; this section is the guidance for serving many tenants
from one product (this skill's recommendation unless cited). Token naming and tiers follow the
Design Tokens Format [S58]; Figma modes map to tenants and themes [S59].

| Tier | Example | Who owns it |
|---|---|---|
| Core (raw) | `--blue-600`, `--space-4`, `--radius-2` | Design system |
| Semantic | `--color-accent`, `--color-bad`, `--color-surface` | Design system; components use only these |
| Brand override | `[data-brand="acme"] { --color-accent: … }` | Tenant config, validated |

| Tenants may change | Locked |
|---|---|
| Accent fill + its generated text/ink steps (after contrast check) | Status meanings and hues: error, warning, success, info |
| Logo (light + dark versions), favicon, app name | Type scale, spacing, focus ring visibility |
| Display font from an approved list (must cover Thai) | Body font fallback to Noto Sans Thai |
| Radius preset (sharp / default / round) | Component structure, layout, density |
| Email/PDF header color and sender name | Legal footer, security copy, PDPA notices |

**Validation per tenant.** Run every brand × theme through the same rules as the script: accent
text ≥ 4.5:1 on paper and surface, accent fill vs its ink ≥ 4.5:1, focus ring ≥ 3:1 [S03, S04].
Reject or auto-adjust lightness on upload and show the tenant admin the adjusted swatch and why
("ปรับสีให้อ่านได้ตามมาตรฐาน WCAG"). Block an accent too close to `--color-bad` so brand buttons
don't read as errors.

**Runtime.** One stylesheet; tenants switch with attributes on `<html>`:
`<html data-brand="acme" data-theme="dark">`. Overrides touch semantic variables only; no tenant
CSS files with selectors. Load the brand block server-side to avoid a flash of default brand; cache
per tenant.

**Dark mode × brand.** Each tenant supplies or derives a dark accent; the matrix is
brands × {light, dark} × {high-contrast if supported}. A tenant without dark-mode approval still
gets a derived, validated dark theme, never the light accent on dark ground.

**Logo slots.**

| Slot | Size (CSS px) | Format |
|---|---|---|
| Header / sidebar | max height 32, max width 160 | SVG preferred; light + dark versions |
| Collapsed nav / app icon | 32×32 square mark | SVG / PNG 2× |
| Login / splash | max height 64 | SVG |
| Email header | width 160–200, hosted PNG 2× | PNG (many mail clients block SVG) |
| PDF / receipt | vector, monochrome fallback for thermal printers | SVG / PDF |

**Propagation.** Emails, PDFs, receipts, push icons and LINE OA rich messages read the same tenant
token JSON at render time; don't hand-copy hex values into templates.

**Testing the matrix.** Keep a fixture list of real tenants plus two stress brands (very light
yellow accent, very dark navy accent). Screenshot key screens for every brand × theme in CI, run
`contrast.py --css` on each, and fail the build on any pair below AA.
