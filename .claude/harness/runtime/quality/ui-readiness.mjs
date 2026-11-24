// UI facts for pyramid readiness: whether a project has a user interface and,
// if so, which layer of the pyramid already guards it — design tokens, an
// accessibility lint, a rendered (browser) check, an accessibility check on
// rendered UI, and one DESIGN.md. Read-only and dependency-free: it reads the
// repository inventory, its stylesheets, and every package.json, never runs a tool.
import { readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { inventoryRepository } from "./quality-discovery.mjs";

const UI_DEPENDENCIES = new Set([
  "react", "react-dom", "preact", "vue", "nuxt", "svelte", "@sveltejs/kit", "@angular/core",
  "solid-js", "next", "astro", "lit", "@remix-run/react", "react-native", "expo"
]);
const UI_EXTENSIONS = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html"]);
const A11Y_LINT = new Set([
  "eslint-plugin-jsx-a11y", "eslint-plugin-vuejs-accessibility", "@angular-eslint/eslint-plugin-template",
  "eslint-plugin-lit-a11y", "eslint-plugin-astro", "svelte-check", "@biomejs/biome", "@html-eslint/eslint-plugin"
]);
const RENDERED = new Set([
  "@playwright/test", "playwright", "playwright-core", "puppeteer", "cypress", "@storybook/test-runner", "webdriverio"
]);
const A11Y_CHECK = new Set([
  "axe-core", "@axe-core/playwright", "@axe-core/puppeteer", "@axe-core/react", "jest-axe", "vitest-axe",
  "cypress-axe", "pa11y", "pa11y-ci", "lighthouse", "@lhci/cli"
]);
const A11Y_SCRIPTS = new Set(["test:accessibility", "test:a11y", "accessibility", "a11y"]);
const RENDERED_SCRIPTS = new Set(["screenshot", "screenshots", "e2e", "test:e2e", "test:browser"]);
const RENDERED_CONFIG = /(^|\/)(playwright|cypress)\.config\.[cm]?[jt]s$/;
const TOKENS = /(^|\/)((design-)?tokens?(\.[a-z]+)?\.(json|css|scss|ts|js|mjs)|tailwind\.config\.[cm]?[jt]s|theme\.(css|json))$/i;
const STYLESHEET = /\.(css|scss|sass|less)$/i;
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g;
// DESIGN.md, or uxui.md as the ux-design skill writes it.
const DESIGN_DOC = /^(docs\/)?(design|uxui)\.md$/i;
const TEST_PATH = /(^|\/)(tests?|__tests__|fixtures?|e2e)\//;

function packages(root, files) {
  return files.filter((path) => basename(path) === "package.json").flatMap((path) => {
    try { return [JSON.parse(readFileSync(join(root, path), "utf8"))]; } catch { return []; }
  });
}

// Color literals written outside a custom-property definition: the values a
// design token should carry. `--accent: #2946e8` defines a token; `color:
// #2946e8` bypasses it. Comments are ignored; declarations are split on `;`,
// `{`, and `}` outside parentheses, so minified stylesheets count the same.
// SCSS, Sass, and Less also comment with `//` to the end of the line; a URL's
// `://` is not a comment.
function withoutComments(text, lineComments = false) {
  const blocks = String(text).replace(/\/\*[\s\S]*?\*\//g, " ");
  return lineComments ? blocks.replace(/(^|[^:\\])\/\/[^\n]*/g, "$1") : blocks;
}

export function rawColorLiterals(text, { lineComments = false } = {}) {
  const source = withoutComments(text, lineComments);
  let count = 0;
  let start = 0;
  let depth = 0;
  for (let index = 0; index <= source.length; index++) {
    const char = source[index];
    if (char === "(") depth++;
    else if (char === ")") depth = Math.max(0, depth - 1);
    if (index < source.length && (depth > 0 || !";{}".includes(char))) continue;
    const piece = source.slice(start, index);
    start = index + 1;
    const colon = piece.indexOf(":");
    if (char === "{" || colon <= 0 || piece.slice(0, colon).trim().startsWith("--")) continue;
    count += (piece.slice(colon + 1).match(COLOR_LITERAL) || []).length;
  }
  return count;
}

function definesTokens(text, lineComments = false) {
  return /(^|[;{\s])--[\w-]+\s*:/.test(withoutComments(text, lineComments));
}

const LINE_COMMENT_STYLES = /\.(scss|sass|less)$/i;

// Where the design tokens live and how many colors bypass them, per stylesheet.
function tokenFacts(root, files) {
  const sheets = files.filter((path) => STYLESHEET.test(path) && !TEST_PATH.test(path)).flatMap((path) => {
    try { return [{ path, text: readFileSync(join(root, path), "utf8") }]; } catch { return []; }
  });
  const source = files.find((path) => TOKENS.test(path) && !TEST_PATH.test(path)) ||
    sheets.find((sheet) => definesTokens(sheet.text, LINE_COMMENT_STYLES.test(sheet.path)))?.path || null;
  const raw = sheets.map((sheet) => ({ path: sheet.path,
    count: rawColorLiterals(sheet.text, { lineComments: LINE_COMMENT_STYLES.test(sheet.path) }) }))
    .filter((row) => row.count > 0).sort((left, right) => right.count - left.count || left.path.localeCompare(right.path));
  return { source, rawColors: raw.reduce((total, row) => total + row.count, 0), rawColorFiles: raw };
}

function firstNamed(names, wanted) {
  return [...names].sort().find((name) => wanted.has(name)) || null;
}

// `null` when the inventory cannot be read; `{ present: false }` for a project
// without a user interface, so its readiness carries no UI criteria.
export function uiReadinessFacts(root) {
  let inventory;
  try { inventory = inventoryRepository(root); } catch { return null; }
  const manifests = packages(root, inventory.files);
  const dependencies = new Set(manifests.flatMap((manifest) => Object.keys({
    ...manifest?.dependencies, ...manifest?.devDependencies, ...manifest?.peerDependencies
  })));
  const scripts = new Set(manifests.flatMap((manifest) => Object.keys(manifest?.scripts || {})));
  const uiFiles = inventory.files.filter((path) =>
    UI_EXTENSIONS.has(extname(path).toLowerCase()) && !TEST_PATH.test(path));
  const framework = firstNamed(dependencies, UI_DEPENDENCIES);
  if (!framework && !uiFiles.length) return { present: false };
  return {
    present: true,
    framework,
    uiFiles: uiFiles.length,
    tokens: tokenFacts(root, inventory.files),
    a11yLint: firstNamed(dependencies, A11Y_LINT),
    rendered: firstNamed(dependencies, RENDERED) || firstNamed(scripts, RENDERED_SCRIPTS) ||
      inventory.files.find((path) => RENDERED_CONFIG.test(path)) || null,
    a11yCheck: firstNamed(dependencies, A11Y_CHECK) || firstNamed(scripts, A11Y_SCRIPTS),
    design: inventory.files.find((path) => DESIGN_DOC.test(path)) || null
  };
}
