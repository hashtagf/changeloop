// Setup readiness: doctor reports which project setup is missing (quality
// config, findings baselines, feature map, lessons, agent guide), each row
// names its next command, and no row is ever an error.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";
import { projectSetupReadiness } from "../runtime/workflow/validation/project-feature-map.mjs";

const FOUNDATION = fileURLToPath(new URL("../foundation.mjs", import.meta.url));

function project(t, files = {}) {
  const root = mkdtempSync(join(tmpdir(), "setup-readiness-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, value] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof value === "string" ? value : JSON.stringify(value));
  }
  return root;
}

function quality(root) {
  const repository = { id: "root", path: root, relativePath: "." };
  return createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [repository], canonicalChangedSurface: () => [],
    declaredSurfaceMatcher: () => () => true, loadRuntime: () => ({}),
    git: (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => null,
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
    writeJson: (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value)); },
    pathInside: (parent, child) => !relative(resolve(parent), resolve(child)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}
  });
}

const byId = (rows) => Object.fromEntries(rows.map((row) => [row.id, row]));

test("quality readiness walks missing config, no run, no baseline, then ratcheting", (t) => {
  const root = project(t, { "src/a.js": "x;\n" });
  const runtime = quality(root);
  let rows = byId(runtime.readiness());
  assert.equal(rows["quality-config"].level, "warn");
  assert.match(rows["quality-config"].next, /quality init --write/);

  const config = runtime.draft();
  config.repositories[0].profiles = [];
  config.repositories[0].providers = { "file-size": { kind: "builtin", adapter: "file-size", isolation: "read-only" } };
  mkdirSync(join(root, "quality"), { recursive: true });
  writeFileSync(join(root, "quality", "foundation-quality.json"), JSON.stringify(config));
  rows = byId(runtime.readiness());
  assert.equal(rows["quality-config"].level, "ok");
  assert.equal(rows["baseline:root:file-size"].level, "info");
  assert.match(rows["baseline:root:file-size"].next, /quality run --capability file-size/);

  runtime.run({});
  rows = byId(runtime.readiness());
  assert.equal(rows["baseline:root:file-size"].level, "warn");
  assert.match(rows["baseline:root:file-size"].next, /--decision-ref/);

  runtime.baseline({ write: true, "decision-ref": "test", reason: "adopt" });
  assert.equal(byId(runtime.readiness())["baseline:root:file-size"].level, "ok");

  config.repositories[0].providers["file-size"].ceiling = 5;
  writeFileSync(join(root, "quality", "foundation-quality.json"), JSON.stringify(config));
  runtime.run({});
  assert.equal(byId(runtime.readiness())["baseline:root:file-size"].level, "warn",
    "a changed configuration is not compared with the old baseline");
});

test("quality readiness reports an invalid config and a repository without findings lanes", (t) => {
  const root = project(t, { "quality/foundation-quality.json": "{not json" });
  assert.equal(byId(quality(root).readiness())["quality-config"].level, "warn");
  const other = project(t);
  const runtime = quality(other);
  const config = runtime.draft();
  config.repositories[0].profiles = [];
  config.repositories[0].providers = {};
  mkdirSync(join(other, "quality"), { recursive: true });
  writeFileSync(join(other, "quality", "foundation-quality.json"), JSON.stringify(config));
  assert.equal(byId(runtime.readiness())["findings:root"].level, "info");
});

test("project readiness covers the feature map, lessons, and agent guide", (t) => {
  let rows = byId(projectSetupReadiness(project(t)));
  assert.deepEqual([rows["feature-map"].level, rows.lessons.level, rows["agent-guide"].level], ["info", "info", "info"]);
  rows = byId(projectSetupReadiness(project(t, { "openspec/feature-map.json": { version: 1, features: [] } })));
  assert.equal(rows["feature-map"].level, "warn");
  assert.match(rows["feature-map"].next, /onboard/);
  rows = byId(projectSetupReadiness(project(t, { "openspec/feature-map.json": "{bad" })));
  assert.match(rows["feature-map"].detail, /invalid/);
  rows = byId(projectSetupReadiness(project(t, {
    "openspec/feature-map.json": { version: 1, features: [{ id: "x", name: "X", summary: "S", paths: ["src/gone/**"] }] } })));
  assert.match(rows["feature-map"].detail, /1 issue/);
  rows = byId(projectSetupReadiness(project(t, {
    "src/x/a.js": "", "openspec/lessons.md": "#", "AGENTS.md": "#",
    "openspec/feature-map.json": { version: 1, features: [{ id: "x", name: "X", summary: "S", paths: ["src/x/**"] }] } })));
  assert.deepEqual([rows["feature-map"].level, rows.lessons.level, rows["agent-guide"].level], ["ok", "ok", "ok"]);
});

test("doctor --json carries a setup section and no setup row is an error", (t) => {
  const root = project(t, { "openspec/config.yaml": "schema: spec-driven\n", ".claude/harness/foundation.mjs": "//\n" });
  spawnSync("git", ["init", "-q"], { cwd: root });
  const run = spawnSync(process.execPath, [FOUNDATION, "doctor", "--json"], { cwd: root, encoding: "utf8",
    env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_TELEMETRY: "0" } });
  const value = JSON.parse(run.stdout);
  assert.deepEqual(value.setup.map((row) => row.id).sort(), ["agent-guide", "feature-map", "lessons", "quality-config"]);
  for (const row of value.setup) assert.ok(row.next, row.id);
  const setupChecks = value.checks.filter((check) => check.name.startsWith("setup:"));
  assert.equal(setupChecks.length, value.setup.length);
  assert.ok(setupChecks.every((check) => check.level !== "error"));
});
