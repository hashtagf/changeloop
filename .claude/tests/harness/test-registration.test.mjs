// Every test file must be run by the deterministic gate. A file that no runner
// names passes silently forever: six such files (shipped hook and policy
// contracts among them) once went unrun because nothing listed them.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const files = (globs) => execFileSync("rg", ["--files", "--hidden", ...globs.flatMap((g) => ["-g", g])],
  { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);

test("every test file is named by run-all.sh or by a runner it calls", () => {
  const tests = files(["*.test.mjs", "!**/node_modules/**", "!.git/**",
    "!.claude/tests/bench/tasks/**", "!.claude/tests/e2e/loop/fixture/**"])
    .filter((path) => path.startsWith(".claude/") || path.startsWith("scripts/"));
  const runners = files(["*.sh", "*.mjs", "!**/node_modules/**", "!.git/**", "!*.test.mjs"])
    .filter((path) => path.startsWith(".claude/tests/") || path.startsWith(".claude/harness/tests/"))
    .map((path) => readFileSync(join(ROOT, path), "utf8")).join("\n");
  const runAll = readFileSync(join(ROOT, ".claude/tests/run-all.sh"), "utf8");
  const globbed = (path) => path.startsWith("scripts/quality/test/") && runAll.includes('"$ROOT"/scripts/quality/test/*.test.mjs');
  const orphans = tests.filter((path) => !globbed(path) && !runners.includes(basename(path)));
  assert.deepEqual(orphans, [], "register these in .claude/tests/run-all.sh");
});
