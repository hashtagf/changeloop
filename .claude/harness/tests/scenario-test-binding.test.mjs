import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { createChangeLifecycle } from "../runtime/workflow/change/change-lifecycle.mjs";
import { normalizeSemanticDraft } from "../runtime/workflow/draft/semantic-draft.mjs";
import {
  amendedScenarioTestBinding, amendmentScenarioBindingIssues, scenarioBindingIssues, scenarioTestBinding
} from "../runtime/workflow/validation/scenario-test-binding.mjs";
import { changeLifecycleDeps } from "./fixtures/runtime-deps.mjs";

// Every scenario of behavior-changing work names the test file that proves
// it; the binding is stored on the change for Prove.

const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function configDraft(overrides = {}) {
  return {
    version: 4,
    id: "config-change",
    intent: "Read config with defaults",
    impact: "low",
    coupling: "isolated",
    workType: ["feature"],
    requirements: [{
      key: "config-default", capability: "config-change", operation: "added",
      outcome: "Missing values use defaults",
      scenarios: [
        { key: "default", name: "Default applies", kind: "success", when: "the value is missing", then: "the default is used" },
        { key: "env-wins", name: "Env beats file", kind: "success", when: "env and file both set it", then: "the env value is used" }
      ]
    }],
    tasks: [{
      key: "implement-config", outcome: "Read config", covers: ["config-default"],
      paths: ["src/**", "tests/config.test.mjs"], verify: "node --test tests/config.test.mjs"
    }],
    evidence: { "config-default": { capabilities: ["test"] } },
    ...overrides
  };
}

const compiled = (source) => normalizeSemanticDraft(source, slugify).draft;

function lifecycleFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "scenario-binding-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const changes = join(root, "openspec", "changes");
  const runtime = join(root, ".foundation", "runtime");
  for (const schema of ["foundation-rapid", "foundation-standard"]) {
    const templates = join(root, "openspec", "schemas", schema, "templates");
    mkdirSync(templates, { recursive: true });
    writeFileSync(join(templates, "proposal.md"), "# <title>\n");
    writeFileSync(join(templates, "tasks.md"), "- [ ] **T001** replace-with-task\n");
    writeJson(join(templates, "evidence.yaml"), { version: 2, claims: [{
      id: "replace-with-stable-claim-id", scenario: "replace-with", impact: "low", capabilities: ["test"] }] });
    writeJson(join(templates, "execution.yaml"), { version: 1, providers: {}, services: {} });
    writeJson(join(templates, "repositories.yaml"), { version: 1, repositories: [{ id: "root", mode: "write", dependsOn: [] }] });
    writeJson(join(templates, "handoffs.yaml"), { version: 1, operations: [] });
    writeFileSync(join(templates, "design.md"), "# Design for <title>\n");
    writeFileSync(join(templates, "spec.md"), "## ADDED Requirements\n");
  }
  const draftPath = join(root, "draft.json");
  const lifecycle = createChangeLifecycle(changeLifecycleDeps({
    root,
    policy: () => ({ workflow: { grounding: "optional" }, land: {} }),
    securityTerms: [],
    fail: (message) => { throw new Error(message); },
    pathInside: () => true,
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
    writeJson,
    slugify,
    changePath: (id) => join(changes, id),
    loadRuntime: (id) => JSON.parse(readFileSync(join(runtime, `${id}.json`), "utf8")),
    saveRuntime: (state) => writeJson(join(runtime, `${state.id}.json`), state),
    setOperationChangeId: () => {},
    initialBudget: () => ({}),
    gitHead: () => "head",
    preexistingDirty: () => ({}),
    now: () => "2026-11-16T00:00:00.000Z",
    bindClaudeSession: () => {},
    validate: () => {},
    createSandbox: () => {},
    showPacket: () => {},
    measureStage: (_stage, operation) => operation(),
    trapFailures: (operation) => operation(),
    rollbackStart: () => []
  }));
  return { root, runtime, draftPath, lifecycle };
}

test("scenario-test-binding-bound: bound scenarios start and the binding is stored on the change", (t) => {
  const draft = compiled(configDraft());
  const binding = scenarioTestBinding(draft);
  assert.deepEqual(binding.map((row) => [row.scenario, row.files]), [
    ["Default applies", ["tests/config.test.mjs"]], ["Env beats file", ["tests/config.test.mjs"]]]);
  assert.deepEqual(scenarioBindingIssues(binding, { behaviorChanging: true }), []);
  // A testMap row bound by claim id also counts.
  const mapped = compiled(configDraft({
    tasks: [{ key: "implement-config", outcome: "Read config", covers: ["config-default"],
      paths: ["src/**", "test/**"], verify: "npm test" }],
    testMap: [{ scenario: "config-default-default", level: "unit", file: "test/default.test.mjs", task: "implement-config" }]
  }));
  assert.ok(scenarioTestBinding(mapped)[0].files.includes("test/default.test.mjs"));

  const value = lifecycleFixture(t);
  writeJson(value.draftPath, configDraft());
  value.lifecycle.startAtomic(value.draftPath);
  const state = JSON.parse(readFileSync(join(value.runtime, "config-change.json"), "utf8"));
  assert.equal(state.scenarioTestBinding.version, 1);
  assert.deepEqual(state.scenarioTestBinding.rows.map((row) => row.claimId),
    ["config-default-default", "config-default-env-wins"]);
  assert.deepEqual(state.scenarioTestBinding.rows[0].files, ["tests/config.test.mjs"]);
});

test("scenario-test-binding-unbound: a scenario without a test file is an EDIT naming it", (t) => {
  const source = configDraft({ tasks: [{ key: "implement-config", outcome: "Read config",
    covers: ["config-default"], paths: ["src/**"], verify: "npm test" }],
  testMap: [{ scenario: "Env beats file", level: "unit", file: "test/env.test.mjs", task: "implement-config" }] });
  const issues = scenarioBindingIssues(scenarioTestBinding(compiled(source)), { behaviorChanging: true });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /scenario 'Default applies' of requirement 'config-default' has no test file/);
  assert.match(issues[0], /testMap row .*config-default-default.*or a test path/);

  const value = lifecycleFixture(t);
  writeJson(value.draftPath, source);
  const action = value.lifecycle.inspectDraft(value.draftPath);
  assert.equal(action.action, "EDIT");
  assert.ok(JSON.stringify(action).includes("scenario 'Default applies' of requirement 'config-default' has no test file"));
  // Start does not compile it: it returns the same repair and creates no change.
  let started;
  try { started = value.lifecycle.startAtomic(value.draftPath); } catch (error) { started = error; }
  assert.match(started instanceof Error ? started.message : JSON.stringify(started), /Default applies/);
  assert.throws(() => readFileSync(join(value.runtime, "config-change.json")), /ENOENT/);
});

test("scenario-test-binding-neutral: behavior-neutral work needs no test binding", (t) => {
  const source = configDraft({ workType: ["refactor"], tasks: [{ key: "implement-config",
    outcome: "Restructure config", covers: ["config-default"], paths: ["src/**"], verify: "npm test" }] });
  const binding = scenarioTestBinding(compiled(source));
  assert.deepEqual(scenarioBindingIssues(binding, { behaviorChanging: false }), []);
  const value = lifecycleFixture(t);
  writeJson(value.draftPath, source);
  assert.ok(!JSON.stringify(value.lifecycle.inspectDraft(value.draftPath)).includes("has no test file"));
});

test("scenario-test-binding-amend-unbound: an amendment scenario without a test file is an EDIT", () => {
  const amendment = {
    addRequirements: [{ key: "config-file", capability: "config-change", operation: "added",
      outcome: "Reads a file", scenarios: [{ name: "File is read", when: "a file exists", then: "values load" }] }],
    addTasks: [{ key: "read-file", outcome: "Read the file", covers: ["config-file"],
      paths: ["src/file.mjs"], verify: "npm test" }]
  };
  const issues = amendmentScenarioBindingIssues(amendment, { behaviorChanging: true });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /amendment scenario 'File is read' of requirement 'config-file' has no test file/);
  amendment.addTasks[0].paths.push("tests/file.test.mjs");
  assert.deepEqual(amendmentScenarioBindingIssues(amendment, { behaviorChanging: true }), []);
  // The stored binding follows the amendment, so Prove judges the new file.
  const prior = [{ claimId: "config-default-default", requirementKey: "config-default",
    scenario: "Default applies", regression: false, files: ["tests/config.test.mjs"] }];
  const draft = compiled({ version: 4, intent: "Amend", impact: "low", requirements: [{
    ...amendment.addRequirements[0], scenarios: [{ key: "read", ...amendment.addRequirements[0].scenarios[0] }] }],
  tasks: [{ key: "read-file", outcome: "Read the file", covers: ["config-file"],
    paths: ["src/file.mjs", "tests/file.test.mjs"], verify: "npm test" }],
  evidence: { "config-file": { capabilities: ["test"] } } });
  const amended = amendedScenarioTestBinding(prior, { draft, testMap: [],
    ledgerTasks: [{ claims: ["config-default-default"], paths: ["src/**", "tests/extra.test.mjs"] },
      { claims: [draft.claims[0].id], paths: ["src/file.mjs", "tests/file.test.mjs"] }] });
  assert.deepEqual(amended.map((row) => [row.scenario, row.files]), [
    ["Default applies", ["tests/config.test.mjs", "tests/extra.test.mjs"]],
    ["File is read", ["tests/file.test.mjs"]]]);
  assert.deepEqual(amendedScenarioTestBinding(prior, { draft, ledgerTasks: [],
    retiredClaimIds: ["config-default-default"] }).map((row) => row.scenario), ["File is read"]);
  assert.deepEqual(amendmentScenarioBindingIssues({ ...amendment,
    addTasks: [{ ...amendment.addTasks[0], paths: ["src/file.mjs"] }],
    testMap: [{ scenario: "File is read", file: "tests/file.test.mjs" }] }, { behaviorChanging: true }), []);
});
