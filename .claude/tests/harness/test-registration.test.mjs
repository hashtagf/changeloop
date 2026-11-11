// Every test file must be run by the deterministic gate. A file that no runner
// names passes silently forever: six such files (shipped hook and policy
// contracts among them) once went unrun because nothing listed them.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SKIP = new Set([".git", "node_modules", "tasks", "fixture"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(relative(ROOT, path));
  }
  return out;
}

test("every test file is named by run-all.sh or by a runner it calls", () => {
  const files = [
    ...walk(join(ROOT, ".claude/tests")),
    ...walk(join(ROOT, ".claude/harness/tests")),
    ...walk(join(ROOT, "scripts"))
  ];
  const tests = files.filter((path) => path.endsWith(".test.mjs"));
  const runners = files
    .filter((path) => !path.endsWith(".test.mjs") && /\.(?:sh|mjs)$/.test(path) &&
      (path.startsWith(".claude/tests/") || path.startsWith(".claude/harness/tests/")))
    .map((path) => readFileSync(join(ROOT, path), "utf8")).join("\n");
  const runAll = readFileSync(join(ROOT, ".claude/tests/run-all.sh"), "utf8");
  const globbed = (path) => path.startsWith("scripts/quality/test/") &&
    runAll.includes('"$ROOT"/scripts/quality/test/*.test.mjs');
  const orphans = tests.filter((path) => !globbed(path) && !runners.includes(basename(path)));
  assert.deepEqual(orphans, [], "register these in .claude/tests/run-all.sh");
});
