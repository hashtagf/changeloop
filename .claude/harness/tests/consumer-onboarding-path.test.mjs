// The consumer onboarding path, end to end on a disposable project: the same
// steps the onboard skill takes (discover, init, run, baseline, accept the
// module-boundary draft) reach a met codebase layer, and the drafted
// boundary lane then fails a new dependency direction. Change Loop's own
// repository is scored by scripts/quality/scorecard.mjs instead, so this test
// is what proves the installed path works.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";

import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";
import { createPyramidReadinessCommand } from "../runtime/composition/pyramid-readiness-command.mjs";
import { proposeModuleBoundaries } from "../runtime/quality/module-boundary-proposal.mjs";

function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), "consumer-onboarding-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, value] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof value === "string" ? value : JSON.stringify(value));
  }
  return root;
}

function runtimes(root) {
  const repository = { id: "root", path: root, relativePath: "." };
  const quality = createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [repository], canonicalChangedSurface: () => [],
    declaredSurfaceMatcher: () => () => true, loadRuntime: () => ({}),
    git: (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => null,
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
    writeJson: (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value)); },
    pathInside: (parent, child) => !relative(resolve(parent), resolve(child)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}
  });
  const readiness = createPyramidReadinessCommand({ root, laneStates: quality.laneStates,
    lessonsValue: () => ({ lessons: [] }), outcomesValue: () => ({ changes: [] }), log: () => {} });
  return { quality, readiness };
}

const APP = {
  "package.json": { name: "app", private: true, scripts: { test: "node -e 0" } },
  "src/core/money.js": "export const add = (a, b) => a + b;\n",
  "src/api/orders.js": "import { add } from \"../core/money.js\";\nexport const total = (a, b) => add(a, b);\n",
  "src/ui/cart.js": "import { total } from \"../api/orders.js\";\nexport const show = () => total(1, 2);\n",
  "src/ui/cart.test.js": "import \"../core/money.js\";\n",
  "vite.config.js": "export default {};\n"
};

const row = (value, id) => value.criteria.find((criterion) => criterion.id === id);

test("before setup, every lane row routes to one onboarding pass with a plain reason", (t) => {
  const { readiness } = runtimes(project(t, APP));
  const value = readiness.readinessValue();
  assert.ok(value.setup, "an unconfigured project reports one setup step");
  assert.match(value.setup.next, /onboard skill/);
  assert.ok(value.setup.criteria.includes("file-size") && value.setup.criteria.includes("tests"));
  for (const id of value.setup.criteria) assert.ok(row(value, id).why, `${id} explains why it helps`);
  assert.match(value.focus.next, /onboard skill/);
});

test("discovery drafts module boundaries from real imports, and tests stay outside every module", (t) => {
  const draft = proposeModuleBoundaries(project(t, APP));
  assert.equal(draft.status, "proposed");
  assert.equal(draft.sourceRoot, "src/");
  assert.deepEqual(draft.provider.modules.map((module) => module.name), ["api", "core", "ui"]);
  assert.deepEqual(draft.provider.allow, { api: ["core"], ui: ["api"] });
  assert.deepEqual(draft.cycles, []);

  const cyclic = proposeModuleBoundaries(project(t, { ...APP,
    "src/core/money.js": "import \"../ui/cart.js\";\nexport const add = (a, b) => a + b;\n" }));
  assert.deepEqual(cyclic.cycles, [["api", "core", "ui"]], "a cycle is a decision for the user, listed not resolved");

  assert.equal(proposeModuleBoundaries(project(t, { "src/only/a.js": "x;\n" })).status, "not-applicable");
});

test("path aliases count as imports: configured in tsconfig, or guessed and marked for the user", (t) => {
  const aliased = {
    "package.json": { name: "app" },
    "tsconfig.json": '{\n  // Nuxt-style alias\n  "compilerOptions": { "paths": { "~/*": ["./src/*"], "@/*": ["./src/*"], },\n  },\n}\n',
    "src/core/money.ts": "export const add = (a: number, b: number) => a + b;\n",
    "src/api/orders.ts": "import { add } from \"~/core/money\";\nexport const total = add;\n",
    "src/ui/Cart.vue": "<script setup lang=\"ts\">\nimport { total } from '@/api/orders';\n</script>\n"
  };
  const draft = proposeModuleBoundaries(project(t, aliased));
  assert.deepEqual(draft.provider.aliases, { "~/": "src/", "@/": "src/" });
  assert.equal(draft.aliasSource, "tsconfig.json");
  assert.ok(draft.provider.extensions.includes(".vue"), "components are scanned when the project has them");
  assert.deepEqual(draft.provider.allow, { api: ["core"], ui: ["api"] });

  const { "tsconfig.json": _, ...bare } = aliased;
  const guessed = proposeModuleBoundaries(project(t, bare));
  assert.deepEqual(guessed.provider.aliases, { "~/": "src/", "@/": "src/" });
  assert.match(guessed.aliasSource, /guessed.*confirm/);
  assert.deepEqual(guessed.provider.allow, { api: ["core"], ui: ["api"] });
  assert.equal(proposeModuleBoundaries(project(t, APP)).aliasSource, null, "relative-only code gets no aliases");
});

test("discover, init, run, baseline, and the accepted boundary draft meet the codebase layer", (t) => {
  const root = project(t, APP);
  const { quality, readiness } = runtimes(root);
  const discovered = quality.discovery().repositories[0];
  assert.equal(discovered.proposals["module-boundaries"].status, "proposed");

  quality.initialize({ write: true });
  const configPath = join(root, "quality", "foundation-quality.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  // The user accepted the draft: the onboard skill adds it as the lane.
  config.repositories[0].providers["module-boundaries"] = discovered.proposals["module-boundaries"].provider;
  writeFileSync(configPath, JSON.stringify(config));

  quality.run({});
  quality.baseline({ write: true, "decision-ref": "onboarding", reason: "adopt today's findings" });
  const value = readiness.readinessValue();
  assert.equal(value.setup, null, "a configured project has no setup step left");
  for (const id of ["file-size", "nesting-depth", "duplication", "module-boundaries",
    "file-size-clear", "nesting-depth-clear", "duplication-clear", "module-boundaries-clear",
    "workaround-comments", "workaround-comments-clear", "tests"])
    assert.equal(row(value, id).status, "met", id);

  // Each run adds to the test lane's history, so readiness can judge speed and stability.
  quality.run({ capability: "test" });
  const history = JSON.parse(readFileSync(join(root, ".foundation/quality/results/root/test.status.json"), "utf8")).history;
  assert.equal(history.length, 2);
  assert.ok(history.every((run) => run.status === "pass" && Number.isFinite(run.durationMs)));
  const again = readiness.readinessValue().criteria;
  assert.equal(again.find((row) => row.id === "tests-fast").status, "met");

  // Inside a change the test lane still runs: it compensates for unsupported
  // capabilities, and skipping it left a paid notes-api run unable to prove.
  assert.equal(quality.run({ change: "c1" }).lanes.some((lane) => lane.capability === "test"), true);

  // A new dependency direction is a boundary finding the ratchet rejects.
  writeFileSync(join(root, "src/core/money.js"), "import \"../ui/cart.js\";\nexport const add = (a, b) => a + b;\n");
  const summary = quality.run({ capability: "module-boundaries" });
  assert.equal(summary.status, "fail");
});
