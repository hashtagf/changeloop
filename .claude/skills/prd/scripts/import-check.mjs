#!/usr/bin/env node
// Checks that a document converted into the PRD or uxui.md template kept
// everything the original said: each statement of the original (a bullet,
// a table row, a numbered item, or a sentence) must appear in the converted
// file, word for word after normalising spacing and punctuation, or be listed
// under a "## Not carried over" heading with its reason. Node built-ins only.
//
//   node import-check.mjs <original.md|.txt> <converted.md> [--json]   exit 1 on a dropped statement
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Letters and digits only, lower-cased; Thai combining marks are kept.
export const normalise = (value) => String(value).toLowerCase()
  .replace(/[`*_>#|[\](){}"'“”‘’:;,.!?…•·–—\-/\\]+/g, " ").replace(/\s+/g, " ").trim();

// The statements of a document: list items, table cells joined per row
// (header and divider rows skipped), and sentences of prose lines.
export function statements(text) {
  const out = [];
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  let inFence = false;
  let header = true;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence || !line || /^#{1,6}\s/.test(line) || /^-{3,}$/.test(line)) { header = true; continue; }
    if (/^\|/.test(line)) {
      if (/^\|[\s:|-]+\|?$/.test(line)) { header = false; continue; }
      if (header) { header = false; continue; }
      for (const cell of line.replace(/^\||\|$/g, "").split("|")) if (normalise(cell).length >= 4) out.push(cell.trim());
      continue;
    }
    header = true;
    const item = line.replace(/^([-*+]|\d+[.)])\s+(\[[ x]\]\s+)?/i, "");
    for (const sentence of item.split(/(?<=[.!?。])\s+(?=[A-Z"“ก-๙])/)) if (normalise(sentence).length >= 4) out.push(sentence.trim());
  }
  return out;
}

export function droppedStatements(original, converted) {
  const notCarried = (converted.match(/^##\s+Not carried over[\s\S]*?(?=^##\s|(?![\s\S]))/mi) || [""])[0];
  const haystack = normalise(converted);
  return statements(original).filter((statement) => {
    const needle = normalise(statement);
    if (haystack.includes(needle)) return false;
    // A long statement split across cells or lines: every 6-word window must survive.
    const words = needle.split(" ");
    if (words.length > 8) {
      const windows = [];
      for (let index = 0; index + 6 <= words.length; index += 3) windows.push(words.slice(index, index + 6).join(" "));
      if (windows.every((window) => haystack.includes(window))) return false;
    }
    return !normalise(notCarried).includes(needle.slice(0, 40));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const [original, converted] = process.argv.slice(2);
  if (!original || !converted) { console.error("usage: import-check.mjs <original> <converted.md> [--json]"); process.exit(2); }
  const dropped = droppedStatements(readFileSync(original, "utf8"), readFileSync(converted, "utf8"));
  if (process.argv.includes("--json")) console.log(JSON.stringify({ original, converted, dropped }, null, 2));
  else {
    for (const statement of dropped) console.log(`- dropped: ${statement.slice(0, 160)}`);
    console.log(`import check: ${dropped.length} statement(s) of ${original} missing from ${converted}`);
  }
  process.exitCode = dropped.length ? 1 : 0;
}
