// Consumer findings ratchet: lint, type-check, file-size, and module-boundary
// findings may shrink but never grow; adoption starts with a baseline.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";

import {
  evaluateFindingsRatchet, fileSizeFindings, moduleBoundaryFindings, normalizeFindingsReport,
  parseEslintJson, parseTscText
} from "../runtime/quality/findings-ratchet.mjs";
import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";
import { detectedProviders } from "../runtime/quality/quality-discovery.mjs";

function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), "findings-ratchet-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const report = (findings, tool = { name: "x", adapterVersion: "1", configDigest: "d" }) =>
  normalizeFindingsReport({ repository: "root", tool, findings });

test("ESLint JSON and tsc output become findings keyed by path and rule", () => {
  const eslint = JSON.stringify([{ filePath: "/repo/src/a.js", messages: [
    { ruleId: "no-unused-vars", line: 3, message: "x unused" }, { fatal: true, line: 1, message: "parse" }] }]);
  assert.deepEqual(parseEslintJson(eslint, "/repo").map(({ path, rule, line }) => [path, rule, line]),
    [["src/a.js", "eslint/no-unused-vars", 3], ["src/a.js", "eslint/parse-error", 1]]);
  assert.deepEqual(parseTscText("src/b.ts(7,2): error TS2339: Property 'x' does not exist.\nnoise\n"),
    [{ path: "src/b.ts", rule: "types/TS2339", line: 7, message: "Property 'x' does not exist." }]);
});

test("without a baseline the lane passes with reduced assurance and names how to start", () => {
  const value = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }]) });
  assert.equal(value.status, "pass");
  assert.equal(value.assurance, "reduced");
  assert.match(value.reason, /quality baseline --write/);
});

test("a new finding fails, an existing one passes, and a fixed one is an improvement", () => {
  const baseline = report([{ path: "a.js", rule: "lint/x" }, { path: "b.js", rule: "lint/y" }]);
  const same = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }, { path: "b.js", rule: "lint/y" }]), baseline });
  assert.equal(same.status, "pass");
  const grown = evaluateFindingsRatchet({ current: report([
    { path: "a.js", rule: "lint/x" }, { path: "a.js", rule: "lint/x", line: 9 }, { path: "b.js", rule: "lint/y" }]), baseline });
  assert.equal(grown.status, "fail");
  assert.deepEqual(grown.regressions.map(({ path, baseline: was, current }) => [path, was, current]), [["a.js", 1, 2]]);
  const fixed = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }]), baseline });
  assert.equal(fixed.status, "pass");
  assert.deepEqual(fixed.improvements.map(({ path }) => path), ["b.js"]);
});

test("a changed tool or configuration is not compared against the old baseline", () => {
  const baseline = report([], { name: "x", adapterVersion: "1", configDigest: "old" });
  const value = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }]), baseline });
  assert.equal(value.assurance, "reduced");
  assert.match(value.reason, /changed/);
});

test("file-size records files over the ceiling and fails when one grows or a new one appears", (t) => {
  const lines = (count) => "x;\n".repeat(count);
  const root = project(t, { "src/big.js": lines(12), "src/small.js": lines(3), "node_modules/dep.js": lines(50),
    ".claude/harness/runtime/installed.mjs": lines(50) });
  const first = fileSizeFindings(root, { ceiling: 10 });
  assert.deepEqual(first.map(({ path, value }) => [path, value]), [["src/big.js", 12]]);
  const baseline = report(first);
  writeFileSync(join(root, "src/big.js"), lines(13));
  writeFileSync(join(root, "src/new.js"), lines(11));
  const value = evaluateFindingsRatchet({ current: report(fileSizeFindings(root, { ceiling: 10 })), baseline });
  assert.equal(value.status, "fail");
  assert.deepEqual(value.regressions.map(({ path, message }) => [path, message]),
    [["src/big.js", "grew from 12 to 13"], ["src/new.js", "new: 11"]]);
});

test("module boundaries report imports a module's allow list does not name", (t) => {
  const root = project(t, {
    "src/ui/view.js": "import { load } from \"../data/store.js\";\nimport { fmt } from \"../shared/fmt\";\n",
    "src/data/store.js": "import { view } from \"../ui/view.js\";\nexport const load = () => view;\n",
    "src/shared/fmt.js": "export const fmt = (x) => x;\n"
  });
  const provider = {
    modules: [{ name: "ui", paths: ["src/ui/**"] }, { name: "data", paths: ["src/data/**"] },
      { name: "shared", paths: ["src/shared/**"] }],
    allow: { ui: ["data", "shared"], data: ["shared"] }
  };
  const findings = moduleBoundaryFindings(root, provider);
  assert.deepEqual(findings.map(({ path, rule, line }) => [path, rule, line]),
    [["src/data/store.js", "boundary/data->ui", 1]]);
  assert.match(findings[0].message, /move the shared code/);
  assert.throws(() => moduleBoundaryFindings(root, { modules: [{ name: "ui", paths: ["src/**"] }], allow: { ui: ["nope"] } }),
    /must list declared modules/);
});

test("discovery offers type-check, lint, and file-size without project scripts", (t) => {
  const root = project(t, { "tsconfig.json": "{}", "package.json": JSON.stringify({
    devDependencies: { typescript: "5", eslint: "9" } }) });
  const providers = detectedProviders(root, ["application-js-ts"]);
  assert.equal(providers["type-check"].adapter, "tsc-text");
  assert.equal(providers["type-check"].inputs.report, "-");
  assert.equal(providers.lint.adapter, "eslint-json");
  assert.equal(providers["file-size"].adapter, "file-size");
  assert.equal(detectedProviders(root, ["web-style"])["file-size"], undefined);
});

test("quality run ratchets a type checker that exits 1 and reads its stdout", (t) => {
  const root = project(t, { "src.ts": "x\n" });
  const script = join(root, "tsc.mjs");
  writeFileSync(script, "process.stdout.write(require('node:fs').readFileSync(process.env.TSC_OUT, 'utf8')); process.exit(1);\n"
    .replace("require('node:fs')", "(await import('node:fs'))"));
  const out = join(tmpdir(), `tsc-out-${process.pid}-${Date.now()}`);
  t.after(() => rmSync(out, { force: true }));
  process.env.TSC_OUT = out;
  t.after(() => { delete process.env.TSC_OUT; });
  const writeJson = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value)); };
  const repository = { id: "root", path: root, relativePath: "." };
  const runtime = createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [repository], canonicalChangedSurface: () => [],
    declaredSurfaceMatcher: () => () => true, loadRuntime: () => ({}),
    git: (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => null,
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")), writeJson,
    pathInside: (parent, child) => !relative(resolve(parent), resolve(child)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}
  });
  const config = runtime.draft();
  config.repositories[0].profiles = [];
  config.repositories[0].providers = { "type-check": { kind: "builtin", adapter: "tsc-text",
    command: [process.execPath, script], inputs: { report: "-" }, isolation: "read-only" } };
  writeJson(join(root, "quality", "foundation-quality.json"), config);
  writeFileSync(out, "src.ts(1,1): error TS2304: Cannot find name 'x'.\n");
  const first = runtime.run({});
  assert.equal(first.lanes[0].status, "pass");
  assert.equal(first.lanes[0].assurance, "reduced");
  runtime.baseline({ write: true, "decision-ref": "test", reason: "adopt" });
  assert.equal(runtime.run({}).status, "pass");
  writeFileSync(out, "src.ts(1,1): error TS2304: Cannot find name 'x'.\nsrc.ts(2,1): error TS2304: Cannot find name 'y'.\n");
  const grown = runtime.run({});
  assert.equal(grown.status, "fail");
  assert.equal(grown.lanes[0].evaluation.regressions[0].rule, "types/TS2304");
  assert.throws(() => runtime.run({ enforce: true }), /consumer quality gate fail/);
});
