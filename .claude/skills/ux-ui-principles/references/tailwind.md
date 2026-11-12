# Building with Tailwind CSS

Tested 2026-11-05 with Tailwind v4.3 (`@tailwindcss/cli`): tokens from `scripts/export_tokens.py` build to utilities,
colors and radii resolve in the browser, the dark theme switches with `data-theme`, and `render_check.js` and
`contrast.py` pass on the built page. This is v4 only; v3 uses `tailwind.config.js` and is not generated here.

## Set up

```
python3 scripts/export_tokens.py <direction-id> --out src/styles      # tokens.css, tailwind-theme.css, shadcn-globals.css
```
`src/styles/app.css`:
```css
@import "tailwindcss";
@import "./tokens.css";          /* :root color roles, type, radius, motion; [data-theme] dark */
@import "./tailwind-theme.css";  /* @theme inline: exposes them as utilities */
```
Add the Google Fonts links for the two families. With shadcn/ui use `shadcn-globals.css` instead of the default
`:root` and `.dark` blocks ([shadcn rules](shadcn-rules.md)).

## Utilities you get

| Need | Classes |
|---|---|
| Page and text | `bg-paper text-ink`, secondary `text-muted`, hairlines `border-rule`, subtle fill `bg-subtle` |
| Cards | `bg-surface text-surface-ink rounded-card shadow-card`, muted text `text-surface-muted` |
| Primary action | `bg-accent text-accent-ink rounded-button` |
| Accent as text or link | `text-accent-text` (never `text-accent` for small text) |
| Tints | `bg-tint-1 text-on-tint-1` (each tint has its own readable ink) |
| Status | `text-ok`, `text-warn`, `text-bad`, `text-info` (success / warning / error / info roles: [color palette](color-palette.md) role-name table) plus a word or icon |
| Type | `font-display` for headings, `font-sans` for body, `font-mono` |
| Focus | `focus-visible:outline-3 focus-visible:outline-focus` |
| Targets | `min-h-11` (44px) on buttons and links; inputs `h-10` on desktop, `h-12` at phone width |

## Rules

1. **Tokens only.** No `bg-[#...]` or `text-[oklch(...)]`; add a token first. `slop_check.py` notes arbitrary color classes.
2. **Fill is not text.** `bg-accent` for fills, `text-accent-text` for links and small text; text on a tint uses its `on-tint-N`.
3. **Dark mode via `data-theme`**, not `dark:` variants scattered on elements: the tokens already switch. Use `dark:` only for a real structural difference.
4. **Compose, then extract.** Repeated utility strings (button, card, field) become a component or `@apply`-free class in one place, so the recipe ([direction recipes](direction-recipes.md)) is applied once.
5. **Shape comes from the direction.** Use `rounded-card`, `rounded-button`, `rounded-input`; do not mix `rounded-xl`, `rounded-2xl` and `rounded-lg` by eye.
6. **Responsive is designed.** Check 390, 768 and 1024+; collapse grids with `md:grid-cols-*`; hide furniture below `md`.
7. **Motion**: `motion-safe:` for animation, and the tokens zero the durations under reduced motion.
8. **Thai**: `font-sans` already falls back to Noto Sans Thai; avoid `tracking-tight` and `uppercase` on Thai text; use `leading-relaxed` or more for Thai body; let headlines wrap by characters.
9. **Content scanning**: make sure the build sees every file that holds class names (v4 scans the project by default; add `@source` for external packages).

## Check

```
npx @tailwindcss/cli -i src/styles/app.css -o dist/out.css
node scripts/render_check.js dist/index.html --toggle "<language switch>"   # when the page has one
python3 scripts/contrast.py --css dist/index.html
python3 scripts/slop_check.py dist/index.html
```
Limits: the exported theme does not set `--spacing`, breakpoints or a type scale beyond the `text-*` defaults of Tailwind; the dark
theme is derived, not designed; existing Tailwind projects should be read first with `scripts/code_extract.py`.
