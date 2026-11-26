import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Prove's static-analysis provider in this repository runs the default gate
// on the landed content, so rerunning it before commit only repeats it.
const ROOT = resolve(fileURLToPath(new URL("../../..", import.meta.url)));

for (const file of ["AGENTS.md", "CLAUDE.md"]) {
  test(`${file} counts a passing Prove static-analysis as the gate, unless files changed after Land`, () => {
    const text = readFileSync(join(ROOT, file), "utf8").replace(/\s+/g, " ");
    assert.match(text, /passing Prove `static-analysis` receipt[^.]*counts as the default gate/);
    assert.match(text, /edited after Land[^.]*run the default gate/);
  });
}
