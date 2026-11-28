import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";
import { qualitySourceRoot } from "../runtime/quality/quality-source.mjs";

// A change in its sandbox is measured against the sandbox's quality config and
// baselines; without a change the project root's apply, as before. The change
// here is always passed explicitly, never inherited from a runner's
// FOUNDATION_CHANGE_ID (cloop exec and Prove set it).
delete process.env.FOUNDATION_CHANGE_ID;
const LINT = {
  kind: "builtin", adapter: "generic-findings-json", isolation: "read-only",
  command: ["node", "-e", "console.log(JSON.stringify({findings: process.env.LINT_FINDING ? " +
    "[{path: 'src.js', rule: 'no-x', message: 'x'}] : []}))"],
  inputs: { report: "-" }
};
const POLICY = JSON.parse(readFileSync(new URL("../../../quality/foundation-quality.json", import.meta.url), "utf8")).policy;
const config = (providers) => ({ version: 1, policy: POLICY,
  exceptions: [], repositories: [{ id: "root", profiles: ["application-js-ts"], include: ["**/*"], exclude: [], providers }] });

function project(t, { sandboxConfig = true, applied = false } = {}) {
  const temp = mkdtempSync(join(tmpdir(), "quality-source-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const root = join(temp, "project");
  const sandbox = join(temp, "sandbox");
  const writeJson = (path, value) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  };
  for (const dir of [root, sandbox]) {
    mkdirSync(join(dir, "openspec"), { recursive: true });
    writeFileSync(join(dir, "src.js"), "export const x = 1;\n");
  }
  // The root knows only a test lane; the change adds a lint lane in its sandbox.
  writeJson(join(root, "quality/foundation-quality.json"),
    config({ test: { kind: "command", command: ["node", "-e", "0"] } }));
  if (sandboxConfig) writeJson(join(sandbox, "quality/foundation-quality.json"), config({ lint: LINT }));
  const repository = { id: "root", path: root, relativePath: "." };
  const runtime = createQualityRuntime({
    root,
    repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [{ ...repository, workspacePath: root }],
    canonicalChangedSurface: () => [], declaredSurfaceMatcher: () => () => true,
    loadRuntime: () => ({ id: "a", impact: "low",
      workspace: { mode: "worktree", path: sandbox, ...(applied ? { applied: true } : {}) },
      repositories: { root: { path: sandbox, targetPath: root } } }),
    git: (args, cwd = root) => spawnSync("git", args, { cwd, encoding: "utf8" }),
    gitHead: () => "abc123",
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
    writeJson,
    pathInside: (parent, candidate) => {
      const value = relative(resolve(parent), resolve(candidate));
      return value === "" || (!value.startsWith("..") && !value.startsWith("/"));
    },
    fail: (message) => { throw Object.assign(new Error(message), { foundationBlocked: true }); },
    log: () => {}
  });
  return { root, sandbox, runtime };
}

const lane = (summary, capability) => summary.lanes.find((row) => row.capability === capability);

test("a change's lint lane and baseline come from its sandbox", (t) => {
  const { root, sandbox, runtime } = project(t);
  const first = runtime.run({ change: "a", capability: "lint" });
  assert.equal(lane(first, "lint")?.status, "pass", JSON.stringify(first.lanes));
  runtime.baseline({ change: "a", capability: "lint", write: true, "decision-ref": "test", reason: "start" });
  assert.ok(existsSync(join(sandbox, "quality/baselines/root/lint-v1.json")), "baseline written into the sandbox");
  assert.equal(existsSync(join(root, "quality/baselines/root/lint-v1.json")), false, "root left untouched");
  const manifest = JSON.parse(readFileSync(join(sandbox, "quality/baselines/manifest.json"), "utf8"));
  assert.equal(manifest.entries[0].reports[0].target, "quality/baselines/root/lint-v1.json");
  const enforced = runtime.run({ change: "a", capability: "lint", enforce: true });
  assert.equal(enforced.status, "pass");
});

test("a regression against the sandbox's baseline fails the lane", (t) => {
  const { runtime } = project(t);
  runtime.run({ change: "a", capability: "lint" });
  runtime.baseline({ change: "a", capability: "lint", write: true, "decision-ref": "test", reason: "start" });
  process.env.LINT_FINDING = "1";
  try {
    const regressed = runtime.run({ change: "a", capability: "lint" });
    assert.equal(lane(regressed, "lint").status, "fail");
  } finally { delete process.env.LINT_FINDING; }
});

test("without a change the project root's configuration applies", (t) => {
  const { runtime } = project(t);
  const summary = runtime.run({});
  assert.equal(lane(summary, "lint"), undefined, "the root has no lint lane");
  assert.equal(lane(summary, "test")?.status, "pass");
});

test("a sandbox without a quality config, or an applied one, reads the root", (t) => {
  const missing = project(t, { sandboxConfig: false });
  assert.equal(lane(missing.runtime.run({ change: "a" }), "lint"), undefined);
  const applied = project(t, { applied: true });
  assert.equal(qualitySourceRoot({ root: applied.root, change: "a",
    loadRuntime: () => ({ workspace: { path: applied.sandbox, applied: true } }) }), applied.root);
  assert.equal(qualitySourceRoot({ root: applied.root, change: "a",
    loadRuntime: () => ({ workspace: { path: applied.sandbox } }) }), applied.sandbox);
  assert.equal(qualitySourceRoot({ root: applied.root, change: null, loadRuntime: () => null }), applied.root);
});
