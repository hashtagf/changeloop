#!/usr/bin/env node
// Type sizes and corner radii of the repository's own interfaces go through
// the scale tokens DESIGN.md records: no `font-size`, `font` shorthand size,
// or `border-radius` written as a px/rem literal outside a custom-property
// definition. Relative sizes (em, %), 0, and keywords stay allowed.
//
//   node scripts/lint/ui-scale.mjs
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

// Generated sample apps under examples/ keep their own styles.
export const SCALED_STYLESHEETS = [
  "website/styles.css", "website/demo/styles.css", "website/docs/src/styles/brand.css",
  "dashboard/public/styles.css", "pi-extensions/team-webui/web/style.css",
  "pi-extensions/team-webui/web/tasks.css", "pi-extensions/team-webui/web/render.css"
];

const LENGTH = /(?:^|[\s/(,])(\d*\.?\d+(?:px|rem))/;

export function scaleLiterals(text) {
  const source = String(text).replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
  const found = [];
  let start = 0;
  let depth = 0;
  for (let index = 0; index <= source.length; index++) {
    const char = source[index];
    if (char === "(") depth++;
    else if (char === ")") depth = Math.max(0, depth - 1);
    if (index < source.length && (depth > 0 || !";{}".includes(char))) continue;
    const piece = source.slice(start, index);
    const colon = piece.indexOf(":");
    const name = colon > 0 ? piece.slice(0, colon).trim() : "";
    if (char !== "{" && /^(font-size|font|border(-(top|bottom)-(left|right))?-radius)$/.test(name)) {
      const value = piece.slice(colon + 1).replace(/var\([^)]*\)/g, "");
      const literal = value.match(LENGTH)?.[1];
      if (literal && parseFloat(literal) !== 0 && !(name === "font" && !/\d(px|rem)\s*(\/|\s)/.test(value)))
        found.push({ line: source.slice(0, start).split("\n").length + (piece.match(/^\s*\n/) ? 1 : 0), property: name, literal });
    }
    start = index + 1;
  }
  return found;
}

export function scaleFindings(root = ROOT, files = SCALED_STYLESHEETS) {
  return files.flatMap((file) => scaleLiterals(readFileSync(resolve(root, file), "utf8"))
    .map((row) => ({ file, ...row })));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = scaleFindings();
  for (const row of findings) console.log(`${row.file}:${row.line} ${row.property}: ${row.literal} is outside the scale tokens`);
  console.log(`ui scale: ${findings.length} literal(s)`);
  process.exitCode = findings.length ? 1 : 0;
}
