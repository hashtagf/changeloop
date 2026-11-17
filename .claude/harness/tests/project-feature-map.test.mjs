// A consumer project's feature map: validated, matched against a change's task
// scopes and changed files, read by the `features` command, and listed on the
// approval page.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  PROJECT_FEATURE_MAP_PATH, createProjectFeaturesCommand, featuresForPaths, projectFeaturesForDraft,
  validateProjectFeatureMap
} from "../runtime/workflow/validation/project-feature-map.mjs";
import { PROJECT_GROUNDING_PATHS } from "../runtime/workflow/validation/repository-intelligence.mjs";

const FOUNDATION = fileURLToPath(new URL("../foundation.mjs", import.meta.url));
const MAP = {
  version: 1,
  features: [
    { id: "checkout", name: "Checkout", summary: "Pay for the cart", paths: ["src/checkout/**"], tests: ["test/checkout.test.js"] },
    { id: "profile", name: "Profile page", summary: "Edit a display name", paths: ["src/profile/**", "src/shared/avatar.js"] }
  ]
};

function project(t, files = {}) {
  const root = mkdtempSync(join(tmpdir(), "project-feature-map-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, value] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof value === "string" ? value : JSON.stringify(value));
  }
  return root;
}

test("a valid map passes; missing names, globs, ids, and paths are reported", (t) => {
  const root = project(t, { "src/checkout/pay.js": "", "src/profile/edit.js": "", "src/shared/avatar.js": "",
    "test/checkout.test.js": "" });
  const exists = (path) => existsSync(join(root, path));
  assert.deepEqual(validateProjectFeatureMap(MAP, { exists }), []);
  const broken = { version: 1, features: [
    { id: "Checkout", name: "", summary: "", paths: [] },
    { id: "profile", name: "P", summary: "S", paths: ["src/gone/**"], docs: ["docs/missing.md"] },
    { id: "profile", name: "P", summary: "S", paths: ["src/profile/**"] }] };
  const issues = validateProjectFeatureMap(broken, { exists });
  for (const pattern of [/id must be kebab-case/, /name is required/, /summary says/, /paths must list/,
    /paths entry does not exist: src\/gone/, /docs path does not exist/, /duplicate id/])
    assert.ok(issues.some((issue) => pattern.test(issue)), String(pattern));
  assert.match(validateProjectFeatureMap({ features: [] })[0], /version": 1/);
});

test("task scopes and changed files map to the features whose paths they overlap", () => {
  assert.deepEqual(featuresForPaths(MAP, ["src/checkout/**"]).map((row) => row.id), ["checkout"]);
  assert.deepEqual(featuresForPaths(MAP, ["src/shared/avatar.js", "README.md"]).map((row) => row.id), ["profile"]);
  assert.deepEqual(featuresForPaths(MAP, ["src/**"]).map((row) => row.id), ["checkout", "profile"]);
  assert.deepEqual(featuresForPaths(MAP, ["docs/**"]), []);
});

test("the approval data lists touched features, and says when the project has no map", (t) => {
  const draft = { tasks: [{ paths: ["src/profile/**"] }] };
  assert.deepEqual(projectFeaturesForDraft(project(t), draft), { available: false, features: [] });
  const root = project(t, { [PROJECT_FEATURE_MAP_PATH]: MAP });
  assert.deepEqual(projectFeaturesForDraft(root, draft),
    { available: true, features: [{ id: "profile", name: "Profile page" }] });
  const invalid = project(t, { [PROJECT_FEATURE_MAP_PATH]: "{not json" });
  assert.match(projectFeaturesForDraft(invalid, draft).error, /invalid openspec\/feature-map.json/);
});

test("the features command names a change's features from its tasks and changed files", (t) => {
  const root = project(t, {
    [PROJECT_FEATURE_MAP_PATH]: MAP, "src/checkout/pay.js": "", "src/profile/edit.js": "",
    "src/shared/avatar.js": "", "test/checkout.test.js": "",
    "openspec/changes/demo/tasks.md": "## 1. Tasks\n\n- [ ] T1 Edit the name [paths:src/profile/**] [verify:npm test]\n"
  });
  const logs = [];
  const command = createProjectFeaturesCommand({
    root, loadRuntime: () => ({}), activeChangePath: (id) => join(root, "openspec", "changes", id),
    canonicalChangedSurface: () => [{ repositoryId: "root", path: "src/checkout/pay.js" },
      { repositoryId: "api", path: "src/profile/x.js" }],
    fail: (message) => { throw new Error(message); }, log: (value) => logs.push(value)
  });
  const value = command.showFeatures({ change: "demo" });
  assert.deepEqual(value.issues, []);
  assert.deepEqual(value.touched.map((row) => row.id), ["checkout", "profile"]);
  command.showFeatures({ change: "demo", pretty: true });
  assert.match(logs.at(-1), /Touched by demo: checkout, profile/);
});

test("intake grounds on the feature map like the lessons file", () => {
  assert.ok(PROJECT_GROUNDING_PATHS.includes(PROJECT_FEATURE_MAP_PATH));
  assert.ok(PROJECT_GROUNDING_PATHS.includes("openspec/lessons.md"));
});

test("cloop features runs read-only from the CLI and fails --strict on map issues", (t) => {
  const root = project(t, {
    "openspec/config.yaml": "schema: spec-driven\n", ".claude/harness/foundation.mjs": "// marker\n",
    [PROJECT_FEATURE_MAP_PATH]: { version: 1, features: [{ id: "x", name: "X", summary: "S", paths: ["src/x/**"] }] }
  });
  const run = (...args) => spawnSync(process.execPath, [FOUNDATION, "features", ...args], {
    cwd: root, encoding: "utf8", env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_TELEMETRY: "0" } });
  const plain = run();
  assert.equal(plain.status, 0, plain.stderr);
  assert.match(JSON.parse(plain.stdout).issues[0], /paths entry does not exist: src\/x/);
  const strict = run("--strict");
  assert.notEqual(strict.status, 0);
  assert.match(strict.stderr + strict.stdout, /has 1 issue/);
});
