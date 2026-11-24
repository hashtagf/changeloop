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
import { guideReadiness, projectGuideWords } from "../runtime/quality/guide-readiness.mjs";

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

test("project readiness covers the feature map and lessons", (t) => {
  let rows = byId(projectSetupReadiness(project(t)));
  assert.deepEqual([rows["feature-map"].level, rows.lessons.level], ["info", "info"]);
  rows = byId(projectSetupReadiness(project(t, { "openspec/feature-map.json": { version: 1, features: [] } })));
  assert.equal(rows["feature-map"].level, "warn");
  assert.match(rows["feature-map"].next, /onboard/);
  rows = byId(projectSetupReadiness(project(t, { "openspec/feature-map.json": "{bad" })));
  assert.match(rows["feature-map"].detail, /invalid/);
  rows = byId(projectSetupReadiness(project(t, {
    "openspec/feature-map.json": { version: 1, features: [{ id: "x", name: "X", summary: "S", paths: ["src/gone/**"] }] } })));
  assert.match(rows["feature-map"].detail, /1 issue/);
  rows = byId(projectSetupReadiness(project(t, {
    "src/x/a.js": "", "openspec/lessons.md": "#",
    "openspec/feature-map.json": { version: 1, features: [{ id: "x", name: "X", summary: "S", paths: ["src/x/**"] }] } })));
  assert.deepEqual([rows["feature-map"].level, rows.lessons.level], ["ok", "ok"]);
});

const POINTER = "# AGENTS.md\n\n<!-- claude-foundation:portable-agent:start -->\n## Foundation change loop\n\n" +
  "Read `.claude/harness/AGENT.md` before Foundation workflow work. Use the loop and start each phase from the packet, " +
  "which is plenty of words inside the managed block that must not count as project guidance at all here.\n" +
  "<!-- claude-foundation:portable-agent:end -->\n";
const TEMPLATE = readFileSync(new URL("../templates/REVIEW.md", import.meta.url), "utf8");

test("a seeded agent guide or REVIEW.md template is not project guidance yet", (t) => {
  let rows = byId(guideReadiness(project(t)));
  assert.deepEqual([rows["agent-guide"].level, rows["review-rules"].level], ["info", "info"]);
  assert.match(rows["agent-guide"].next, /claude-md/);
  assert.match(rows["review-rules"].detail, /missing/);

  rows = byId(guideReadiness(project(t, { "AGENTS.md": POINTER, "REVIEW.md": TEMPLATE })));
  assert.match(rows["agent-guide"].detail, /only the Change Loop pointer/, "the managed block does not count");
  assert.equal(rows["review-rules"].level, "info");
  assert.match(rows["review-rules"].detail, /generic template/);
  assert.match(rows["review-rules"].next, /onboard/);

  const rules = `${POINTER}\n## Commands\n\n${"Run npm test before every commit and keep handlers thin. ".repeat(6)}\n`;
  const reviewed = TEMPLATE.replace("<name or team who maintains these rules>", "Payments team")
    .replace("- <add project-specific exclusions>.", "- fixtures under test/data.");
  rows = byId(guideReadiness(project(t, { "CLAUDE.md": rules, "REVIEW.md": reviewed })));
  assert.deepEqual([rows["agent-guide"].level, rows["review-rules"].level], ["ok", "ok"]);
  assert.equal(projectGuideWords(POINTER), 0);
});

test("doctor --json carries a setup section and no setup row is an error", (t) => {
  const root = project(t, { "openspec/config.yaml": "schema: spec-driven\n", ".claude/harness/foundation.mjs": "//\n" });
  spawnSync("git", ["init", "-q"], { cwd: root });
  const run = spawnSync(process.execPath, [FOUNDATION, "doctor", "--json"], { cwd: root, encoding: "utf8",
    env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_TELEMETRY: "0" } });
  const value = JSON.parse(run.stdout);
  assert.deepEqual(value.setup.map((row) => row.id).sort(), ["agent-guide", "feature-map", "lessons", "lessons-enforcement", "pyramid", "quality-config", "review-rules"]);
  // A row that is not ready names its next step; a project with no history has no pending lessons.
  for (const row of value.setup) assert.ok(row.level === "ok" || row.next, row.id);
  assert.equal(value.setup.find((row) => row.id === "lessons-enforcement").level, "ok");
  assert.match(value.setup.find((row) => row.id === "pyramid").detail, /^1 codebase \d+%/);
  const setupChecks = value.checks.filter((check) => check.name.startsWith("setup:"));
  assert.equal(setupChecks.length, value.setup.length);
  assert.ok(setupChecks.every((check) => check.level !== "error"));
});
