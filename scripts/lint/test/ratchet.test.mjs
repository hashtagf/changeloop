import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  COMPOSITION_ROOT, DEFAULT_BASELINE, collect, compare, initialBaseline, main, tighten
} from "../ratchet.mjs";

const RUNTIME = ".claude/harness/runtime/core/sample.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "lint-ratchet-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  mkdirSync(join(root, "quality/baselines"), { recursive: true });
  write(COMPOSITION_ROOT, "export const wire = 1;\n");
  write(RUNTIME, "export function run(load) {\n  try { return load(); } catch {}\n}\n");
  return { root, write, baselinePath: join(root, DEFAULT_BASELINE) };
}

function capture() {
  const lines = [];
  const sink = (...args) => lines.push(args.join(" "));
  return { out: { log: sink, error: sink }, text: () => lines.join("\n") };
}

async function initialize(root) {
  assert.equal(await main(["--root", root, "--init"], capture().out), 0);
}

function lines(count) {
  return Array.from({ length: count }, (_, index) => `export const v${index} = ${index};`).join("\n") + "\n";
}

test("unchanged code exits 0 against its own baseline", async (t) => {
  const { root } = fixture(t);
  await initialize(root);
  const log = capture();
  assert.equal(await main(["--root", root], log.out), 0);
  assert.match(log.text(), /at or below the baseline/);
});

test("a new violation in a tracked file or a new file fails with file, rule, counts, line, and fix", async (t) => {
  const { root, write } = fixture(t);
  await initialize(root);
  write(RUNTIME, "export function run(load) {\n  try { return load(); } catch {}\n  try { return load(); } catch {}\n}\n");
  write(".claude/hooks/new-hook.mjs", "// TODO: handle later\nexport const hook = 1;\n");
  const log = capture();
  assert.equal(await main(["--root", root], log.out), 1);
  const text = log.text();
  assert.match(text, /core\/sample\.mjs: changeloop\/no-silent-catch 2 \(baseline 1\)/);
  assert.match(text, /line 3: An empty catch swallows every failure/);
  assert.match(text, /new-hook\.mjs: changeloop\/no-workaround-comment 1 \(baseline 0\)/);
  assert.match(text, /line 1: .*Fix the root cause now/);
});

test("fewer violations than the baseline fails and asks for --tighten", async (t) => {
  const { root, write } = fixture(t);
  await initialize(root);
  write(RUNTIME, "export function run(load) {\n  return load();\n}\n");
  const log = capture();
  assert.equal(await main(["--root", root], log.out), 1);
  assert.match(log.text(), /below the baseline\. Run `node scripts\/lint\/ratchet\.mjs --tighten`/);
});

test("--tighten lowers improved entries, never raises regressions, and still fails on them", async (t) => {
  const { root, write, baselinePath } = fixture(t);
  write(".claude/harness/runtime/core/other.mjs", "// HACK one\n// HACK two\nexport const x = 1;\n");
  await initialize(root);
  write(".claude/harness/runtime/core/other.mjs", "// HACK one\nexport const x = 1;\n");
  write(RUNTIME, "export function run(load) {\n  try { load(); } catch {}\n  try { load(); } catch {}\n}\n");
  const log = capture();
  assert.equal(await main(["--root", root, "--tighten"], log.out), 1);
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  assert.equal(baseline.violations[".claude/harness/runtime/core/other.mjs"]["changeloop/no-workaround-comment"], 1);
  assert.equal(baseline.violations[RUNTIME]["changeloop/no-silent-catch"], 1);
  assert.match(log.text(), /lowered 1 baseline entry/);
});

test("tighten drops cleared entries and never adds new ones", () => {
  const baseline = { version: 1, violations: { "a.mjs": { r: 2 }, "b.mjs": { r: 1 } }, sizes: { "big.mjs": 2000 } };
  const current = { violations: { "a.mjs": { r: 1, s: 4 }, "c.mjs": { r: 3 } }, sizes: { "big.mjs": 1900 } };
  assert.deepEqual(tighten(baseline, current), {
    version: 1, violations: { "a.mjs": { r: 1 } }, sizes: { "big.mjs": 1900 }
  });
});

test("a missing or malformed baseline fails instead of passing", async (t) => {
  const { root, baselinePath } = fixture(t);
  const missing = capture();
  assert.equal(await main(["--root", root], missing.out), 2);
  assert.match(missing.text(), /baseline is missing: .*lint-ratchet-v1\.json/);
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, "{ not json");
  const malformed = capture();
  assert.equal(await main(["--root", root], malformed.out), 2);
  assert.match(malformed.text(), /not valid JSON: .*lint-ratchet-v1\.json/);
  writeFileSync(baselinePath, "{\"version\": 1}");
  const shape = capture();
  assert.equal(await main(["--root", root], shape.out), 2);
  assert.match(shape.text(), /wrong shape/);
});

test("growth of the composition root fails with a move-to-domain message", async (t) => {
  const { root, write } = fixture(t);
  await initialize(root);
  write(COMPOSITION_ROOT, "export const wire = 1;\nexport const behavior = 2;\n");
  const log = capture();
  assert.equal(await main(["--root", root], log.out), 1);
  assert.match(log.text(), /foundation\.mjs: 2 lines \(allowed 1 lines\)/);
  assert.match(log.text(), /composition root.*runtime\//s);
});

test("an untracked composition root is a regression", () => {
  const result = compare({ version: 1, violations: {}, sizes: {} },
    { violations: {}, sizes: { [COMPOSITION_ROOT]: 10 } });
  assert.equal(result.regressions[0].message, "The composition root must stay tracked in the size baseline.");
});

test("a new file over the 1500-line ceiling fails; one at the ceiling passes", async (t) => {
  const { root, write } = fixture(t);
  await initialize(root);
  write(".claude/harness/runtime/workflow/at-limit.mjs", lines(1500));
  assert.equal(await main(["--root", root], capture().out), 0);
  write(".claude/harness/runtime/workflow/huge.mjs", lines(1501));
  const log = capture();
  assert.equal(await main(["--root", root], log.out), 1);
  assert.match(log.text(), /huge\.mjs: 1501 lines \(allowed 1500 lines\)\n\s+File exceeds 1500 lines\. Split it/);
});

test("a shrunk tracked large file fails until --tighten lowers its size", async (t) => {
  const { root, write, baselinePath } = fixture(t);
  write(".claude/harness/runtime/workflow/big.mjs", lines(1600));
  await initialize(root);
  write(".claude/harness/runtime/workflow/big.mjs", lines(1550));
  const before = capture();
  assert.equal(await main(["--root", root], before.out), 1);
  assert.match(before.text(), /big\.mjs lines: 1600 -> 1550/);
  assert.equal(await main(["--root", root, "--tighten"], capture().out), 0);
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  assert.equal(baseline.sizes[".claude/harness/runtime/workflow/big.mjs"], 1550);
  assert.equal(await main(["--root", root], capture().out), 0);
});

test("initial baseline tracks the composition root and only files over the ceiling", async (t) => {
  const { root, write } = fixture(t);
  write(".claude/harness/runtime/workflow/big.mjs", lines(1501));
  const baseline = initialBaseline(await collect(root));
  assert.deepEqual(Object.keys(baseline.sizes).sort(),
    [COMPOSITION_ROOT, ".claude/harness/runtime/workflow/big.mjs"].sort());
  assert.equal(await main(["--root", root, "--init"], capture().out), 0);
  const again = capture();
  assert.equal(await main(["--root", root, "--init"], again.out), 2);
  assert.match(again.text(), /already exists/);
});

test("the repository is at or below its committed baseline", async () => {
  const log = capture();
  assert.equal(await main([], log.out), 0, log.text());
});
