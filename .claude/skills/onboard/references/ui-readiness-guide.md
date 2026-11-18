# UI readiness

`cloop quality readiness` adds five `ui-` rows when the project has a user
interface (a UI framework dependency, or `.tsx`, `.jsx`, `.vue`, `.svelte`,
`.astro`, or `.html` files outside tests). A project without one shows none.

| Row | Layer | Met by |
|---|---|---|
| `ui-tokens` | codebase | A token source (tokens file, CSS custom properties, or the Tailwind config) and no color literal in a stylesheet outside a custom-property definition |
| `ui-a11y-lint` | static | The framework's accessibility lint: `eslint-plugin-jsx-a11y`, `eslint-plugin-vuejs-accessibility`, `svelte-check`, `@angular-eslint` template rules, `eslint-plugin-astro`, `@html-eslint/eslint-plugin` (plain HTML), or Biome |
| `ui-rendered` | verification | A browser check: Playwright, Cypress, Puppeteer, or a `screenshot`/`e2e` script |
| `ui-accessibility` | verification | An accessibility check on rendered pages: `@axe-core/playwright`, `jest-axe`, `pa11y`, or a `test:accessibility` script |
| `ui-design-doc` | prose | One `DESIGN.md` (root or `docs/`) with the direction, tokens, components, and states |

How to propose each:

- Tokens and DESIGN.md: the `ux-ui-principles` skill extracts them from the
  existing code; propose the extraction, never a redesign.
- A11y lint: add it to the existing lint command so the `lint` lane ratchets it.
- Rendered check: a script that serves the app and saves PNG screenshots. A
  change bound to a prototype feeds them to the `visual` check
  (`change start --template` shows the wiring).
- A11y check: a `test:accessibility` or `test:a11y` script that checks rendered
  pages; Prove runs it as the `accessibility` provider without further wiring.
  Without one, `ui` changes still get the built-in static markup read, which
  cannot see contrast, focus order, or rendered behavior.

Each is product code or project configuration, so it goes through `/change`.
