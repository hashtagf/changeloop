// Every runner and test file run-all.sh names has a row in .claude/tests/README.md
// (Current suites) saying what it owns, so an agent can find a suite's contract
// before changing it. Files that predate this check are a baseline that may
// only shrink: a newly registered file needs its row, and a documented or
// removed file leaves the baseline.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const BASELINE = "quality/baselines/test-readme-v1.json";
const read = (path) => readFileSync(resolve(ROOT, path), "utf8");

const expand = (text) => {
  const brace = text.match(/\{([^}]*)\}/);
  return brace ? brace[1].split(",").flatMap((part) => expand(text.replace(brace[0], part))) : [text];
};

// Basenames the README names in inline code, brace patterns expanded, with
// and without the extension (a row may name `implied-change` for
// implied-change.test.mjs); fenced command examples are not rows.
const stem = (name) => basename(name).replace(/\.(?:test\.mjs|mjs|sh|js|py)$/, "");
export function documentedNames(readme) {
  const prose = readme.replace(/^```[\s\S]*?^```/gm, "");
  return new Set([...prose.matchAll(/`([^`\n]+)`/g)].flatMap((match) => expand(match[1])).map(stem));
}

// The files run-all.sh rows run by name; a glob row is documented as a group.
export function registeredFiles(runAll) {
  return [...new Set([...runAll.matchAll(/\$(?:HERE|ROOT)"?\/([\w./{}-]+\.(?:mjs|sh|js|py))(?![\w.])/g)]
    .map((match) => match[1]))].sort();
}

export function coverage(readme, runAll, baseline) {
  const names = documentedNames(readme);
  const files = registeredFiles(runAll);
  const undocumented = files.filter((file) => !names.has(stem(file)));
  const allowed = new Set(baseline);
  return {
    missing: undocumented.filter((file) => !allowed.has(file)),
    stale: baseline.filter((file) => !files.includes(file) || names.has(stem(file)))
  };
}

test("every registered suite file has a README row, or is in the shrinking baseline", () => {
  const { missing, stale } = coverage(read(".claude/tests/README.md"), read(".claude/tests/run-all.sh"),
    JSON.parse(read(BASELINE)).undocumented);
  assert.deepEqual(missing, [], "add a row to .claude/tests/README.md (Current suites): `<file>` | the contract it owns");
  assert.deepEqual(stale, [], `remove these from ${BASELINE}: they are documented or no longer registered`);
});

test("coverage matches basenames and brace patterns and ratchets both ways", () => {
  const readme = "| `harness/a-{one,two}.test.mjs`, `short-name` | x |\n```sh\n`not-a-row.test.mjs`\n```\n";
  const runAll = 'a|node "$HERE/harness/a-one.test.mjs" "$HERE/short-name.test.mjs"\nb|node "$ROOT/x/b.test.mjs"\nc|sh "$HERE/not-a-row.test.mjs"\n';
  assert.deepEqual(coverage(readme, runAll, ["x/b.test.mjs"]), { missing: ["not-a-row.test.mjs"], stale: [] });
  assert.deepEqual(coverage(readme, runAll, ["harness/a-one.test.mjs", "gone.mjs", "not-a-row.test.mjs", "x/b.test.mjs"]),
    { missing: [], stale: ["harness/a-one.test.mjs", "gone.mjs"] });
});
