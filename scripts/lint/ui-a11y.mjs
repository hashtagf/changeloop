#!/usr/bin/env node
// Accessibility lint for the repository's own user interfaces: the landing
// page, docs-site components, demo, dashboard, Pi team web UI, and examples.
// It reads markup statically (html-eslint) and must stay at zero findings;
// a rendered check (contrast, focus order) is a separate layer.
//
//   node scripts/lint/ui-a11y.mjs
import { ESLint } from "eslint";
import html from "@html-eslint/eslint-plugin";
import parser from "@html-eslint/parser";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

// Markup the repository ships or demonstrates. Generated reports
// (docs/reports/*.html) and vendored skill assets are outside it.
export const UI_FILES = [
  "website/index.html", "website/demo/index.html", "website/docs/src/components/*.astro",
  "dashboard/public/index.html", "pi-extensions/team-webui/web/index.html", "examples/*/index.html"
];

export const A11Y_RULES = Object.fromEntries([
  "require-lang", "require-img-alt", "require-title", "require-meta-viewport", "no-non-scalable-viewport",
  "require-input-label", "require-frame-title", "require-details-summary", "no-positive-tabindex",
  // no-redundant-role is left out: `role="list"` on a styled <ul> is deliberate,
  // since Safari drops list semantics when list-style is none.
  "no-accesskey-attrs", "no-abstract-roles", "no-invalid-role", "no-aria-hidden-body",
  "no-aria-hidden-on-focusable", "no-nested-interactive", "no-heading-inside-button", "no-empty-headings",
  "no-skip-heading-levels", "no-duplicate-id"
].map((rule) => [`@html-eslint/${rule}`, "error"]));

// An Astro component starts with a `---` script fence; its comments may name
// tags, so it is blanked (line numbers kept) and only the markup is read.
const astroMarkup = {
  preprocess: (text) => [text.replace(/^---\r?\n[\s\S]*?\r?\n---/, (fence) => fence.replace(/[^\n]/g, " "))],
  postprocess: (messages) => messages.flat(),
  supportsAutofix: false
};

export async function lintUi(root = ROOT, files = UI_FILES) {
  const eslint = new ESLint({
    cwd: root, overrideConfigFile: true, errorOnUnmatchedPattern: false,
    overrideConfig: [
      { files: ["**/*.html", "**/*.astro"], plugins: { "@html-eslint": html },
        languageOptions: { parser }, rules: A11Y_RULES },
      { files: ["**/*.astro"], processor: astroMarkup }
    ]
  });
  return (await eslint.lintFiles(files)).flatMap((result) => result.messages.map((message) => ({
    file: result.filePath.slice(root.length + 1), line: message.line, rule: message.ruleId, message: message.message
  })));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = await lintUi();
  for (const row of findings) console.log(`${row.file}:${row.line} [${row.rule}] ${row.message}`);
  console.log(`ui accessibility lint: ${findings.length} finding(s)`);
  process.exitCode = findings.length ? 1 : 0;
}
