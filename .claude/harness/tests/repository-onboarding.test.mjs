// Per-repository onboarding in a multi-repository topology: the agent proposes
// a short ranked list, `quality init --repo` adds only the chosen repositories,
// a repository not onboarded yet is reported instead of failing every change
// that selects it, and readiness reports each onboarded repository.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";

import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";
import { createPyramidReadinessCommand } from "../runtime/composition/pyramid-readiness-command.mjs";
import { changesPerRepository, onboardingCandidates } from "../runtime/quality/onboarding-candidates.mjs";
import { readinessText } from "../runtime/quality/pyramid-readiness.mjs";

function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), "repository-onboarding-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, value] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof value === "string" ? value : JSON.stringify(value));
  }
  return root;
}

const TOPOLOGY = {
  "repos/billing/package.json": { name: "billing", scripts: { test: "node -e 0" } },
  "repos/billing/src/payments/charge.js": "export const charge = 1;\n",
  "repos/search/package.json": { name: "search", devDependencies: { eslint: "9" }, scripts: { test: "node -e 0" } },
  "repos/search/src/index.js": "export const find = 1;\n",
  "repos/docs/package.json": { name: "docs", scripts: { test: "node -e 0" } },
  "repos/docs/src/index.js": "export const page = 1;\n",
  "repos/vendor/src/index.js": "export const v = 1;\n"
};

function catalog(root) {
  const row = (id, extra = {}) => ({ id, type: "git", mode: "write", path: join(root, "repos", id), relativePath: `repos/${id}`, ...extra });
  return { repositories: [{ id: "root", type: "root", mode: "write", path: root, relativePath: "." },
    row("billing"), row("search"), row("docs"), row("vendor", { mode: "read" })] };
}

function runtimes(root, selected = null) {
  const all = catalog(root).repositories;
  const quality = createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: all }),
    selectedRepositories: () => all.filter((row) => !selected || selected.includes(row.id)),
    canonicalChangedSurface: () => [], declaredSurfaceMatcher: () => () => true,
    loadRuntime: () => ({}), git: (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => null,
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
    writeJson: (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value)); },
    pathInside: (parent, child) => !relative(resolve(parent), resolve(child)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}
  });
  const readiness = createPyramidReadinessCommand({ root, laneStates: quality.laneStates,
    lessonsValue: () => ({ lessons: [] }), outcomesValue: () => ({ changes: [] }),
    repositoryCatalog: () => catalog(root),
    changeStates: () => [{ repositories: { docs: {} } }, { repositories: { docs: {}, search: {} } }], log: () => {} });
  return { quality, readiness };
}

test("candidates rank recorded work, then sensitive areas, then ready checks; read-only repositories are never proposed", (t) => {
  const root = project(t, TOPOLOGY);
  const value = onboardingCandidates({ repositories: catalog(root).repositories, onboarded: new Set(),
    changed: changesPerRepository([{ repositories: { docs: {} } }, { repositories: { docs: {} } }]) });
  assert.deepEqual(value.candidates.map((row) => row.id), ["docs", "billing", "search"]);
  assert.match(value.candidates[0].reasons[0], /2 change\(s\) worked here/);
  assert.match(value.candidates[1].reasons.join(" "), /sensitive area: .*payments/);
  assert.match(value.candidates[2].reasons.join(" "), /checks ready: eslint/);
  assert.deepEqual([value.total, value.onboarded, value.remaining], [3, 0, 0]);
  const limited = onboardingCandidates({ repositories: catalog(root).repositories, onboarded: new Set(["docs"]), limit: 1 });
  assert.deepEqual([limited.onboarded, limited.candidates.length, limited.remaining], [1, 1, 1]);
});

test("quality init --repo adds only the chosen repositories and keeps earlier ones", (t) => {
  const root = project(t, TOPOLOGY);
  const { quality } = runtimes(root);
  quality.initialize({ write: true, repo: "docs" });
  const read = () => JSON.parse(readFileSync(join(root, "quality/foundation-quality.json"), "utf8"));
  let config = read();
  assert.deepEqual(config.repositories.map((row) => row.id), ["docs"]);
  assert.equal(config.unlisted, "not-onboarded");
  assert.ok(Number.isFinite(Date.parse(config.repositories[0].onboardedAt)));
  quality.initialize({ write: true, repo: "search,billing" });
  config = read();
  assert.deepEqual(config.repositories.map((row) => row.id).sort(), ["billing", "docs", "search"]);
  assert.throws(() => quality.initialize({ write: true }), /already exists.*--repo/);
  assert.throws(() => quality.initialize({ write: true, repo: "missing" }), /unknown repository 'missing'/);
});

test("a repository not onboarded yet is reported, not failed; the legacy config still fails closed", (t) => {
  const root = project(t, TOPOLOGY);
  const { quality } = runtimes(root, ["docs", "billing"]);
  quality.initialize({ write: true, repo: "docs" });
  // A change selecting both repositories reports the one not onboarded.
  const summary = quality.run({ change: "c1", capability: "file-size" });
  const lane = summary.lanes.find((row) => row.repository === "billing");
  assert.deepEqual([lane.capability, lane.status, lane.required], ["configuration", "pass", false]);
  assert.match(lane.reason, /not onboarded/);
  assert.notEqual(summary.status, "fail");

  const path = join(root, "quality/foundation-quality.json");
  const config = JSON.parse(readFileSync(path, "utf8"));
  delete config.unlisted;
  writeFileSync(path, JSON.stringify(config));
  const strict = quality.run({ change: "c1", capability: "file-size" }).lanes.find((row) => row.repository === "billing");
  assert.equal(strict.status, "fail");
});

test("readiness reports each onboarded repository and proposes the next ones", (t) => {
  const root = project(t, TOPOLOGY);
  const { quality, readiness } = runtimes(root, ["docs"]);
  quality.initialize({ write: true, repo: "docs" });
  quality.run({});
  quality.baseline({ write: true, "decision-ref": "test", reason: "adopt" });
  const value = readiness.readinessValue();
  assert.deepEqual([value.onboarding.onboarded, value.onboarding.total], [1, 3]);
  assert.deepEqual(value.onboarding.candidates.map((row) => row.id), ["search", "billing"]);
  assert.deepEqual(value.repositories.map((row) => row.id), ["docs"]);
  const codebase = value.repositories[0].layers.find((layer) => layer.layer === "codebase");
  // file-size, nesting, and duplication ratchet and are clear; one source
  // directory gets no module-boundaries lane.
  assert.deepEqual([codebase.met, codebase.measured], [6, 7]);
  const text = readinessText(value);
  assert.match(text, /Repositories onboarded: 1\/3/);
  assert.match(text, /Onboard next \(ask the user which\):\n  search: 1 change/);
  assert.match(readiness.readinessRow().detail, /onboarded 1\/3 repositories/);
});
