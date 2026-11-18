// UI facts for pyramid readiness: whether a project has a user interface and,
// if so, which layer of the pyramid already guards it — design tokens, an
// accessibility lint, a rendered (browser) check, an accessibility check on
// rendered UI, and one DESIGN.md. Read-only and dependency-free: it reads the
// repository inventory and every package.json, never runs a tool.
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
  "eslint-plugin-lit-a11y", "eslint-plugin-astro", "svelte-check", "@biomejs/biome"
]);
const RENDERED = new Set([
  "@playwright/test", "playwright", "puppeteer", "cypress", "@storybook/test-runner", "webdriverio"
]);
const A11Y_CHECK = new Set([
  "axe-core", "@axe-core/playwright", "@axe-core/puppeteer", "@axe-core/react", "jest-axe", "vitest-axe",
  "cypress-axe", "pa11y", "pa11y-ci", "lighthouse", "@lhci/cli"
]);
const A11Y_SCRIPTS = new Set(["test:accessibility", "test:a11y", "accessibility", "a11y"]);
const RENDERED_SCRIPTS = new Set(["screenshot", "screenshots", "e2e", "test:e2e", "test:browser"]);
const RENDERED_CONFIG = /(^|\/)(playwright|cypress)\.config\.[cm]?[jt]s$/;
const TOKENS = /(^|\/)((design-)?tokens?(\.[a-z]+)?\.(json|css|scss|ts|js|mjs)|tailwind\.config\.[cm]?[jt]s|theme\.(css|json))$/i;
const DESIGN_DOC = /^(docs\/)?design\.md$/i;
const TEST_PATH = /(^|\/)(tests?|__tests__|fixtures?|e2e)\//;

function packages(root, files) {
  return files.filter((path) => basename(path) === "package.json").flatMap((path) => {
    try { return [JSON.parse(readFileSync(join(root, path), "utf8"))]; } catch { return []; }
  });
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
    tokens: inventory.files.find((path) => TOKENS.test(path) && !TEST_PATH.test(path)) || null,
    a11yLint: firstNamed(dependencies, A11Y_LINT),
    rendered: firstNamed(dependencies, RENDERED) || firstNamed(scripts, RENDERED_SCRIPTS) ||
      inventory.files.find((path) => RENDERED_CONFIG.test(path)) || null,
    a11yCheck: firstNamed(dependencies, A11Y_CHECK) || firstNamed(scripts, A11Y_SCRIPTS),
    design: inventory.files.find((path) => DESIGN_DOC.test(path)) || null
  };
}
