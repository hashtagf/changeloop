import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  SETUP_DEPENDENCY_FILES, dependencyDigest, workspaceSetupPlan
} from "../runtime/workflow/sandbox/sandbox-setup.mjs";
import {
  retryFailedSandboxSetups, setupSelectedRepositories
} from "../runtime/workflow/sandbox/sandbox-repositories.mjs";

function workspace(t, files) {
  const root = mkdtempSync(join(tmpdir(), "polyglot-setup-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(root, name, ".."), { recursive: true });
    writeFileSync(join(root, name), text);
  }
  return root;
}

const plan = (root, { tools = null, sandbox = {} } = {}) => workspaceSetupPlan({
  sandbox, workspace: root, pathExists: existsSync,
  commandExists: (name) => tools === null || tools.includes(name)
});

test("a PHP workspace installs from composer.lock", (t) => {
  const root = workspace(t, { "composer.json": "{}", "composer.lock": "{}" });
  assert.deepEqual(plan(root), { command: "composer install --no-interaction --no-progress",
    source: "lockfile", lockfile: "composer.lock" });
});

test("every locked ecosystem installs in order after JavaScript", (t) => {
  const root = workspace(t, { "package.json": "{}", "package-lock.json": "{}", "go.mod": "module x", "go.sum": "" });
  assert.deepEqual(plan(root), { command: "npm ci && go mod download", source: "lockfile",
    lockfile: "package-lock.json, go.sum" });
  for (const [files, command] of [
    [{ Gemfile: "", "Gemfile.lock": "" }, "bundle install"],
    [{ "pyproject.toml": "", "uv.lock": "" }, "uv sync --frozen"],
    [{ "pyproject.toml": "", "poetry.lock": "" }, "poetry install --no-interaction"],
    [{ Pipfile: "", "Pipfile.lock": "" }, "pipenv sync --dev"],
    [{ "Cargo.toml": "", "Cargo.lock": "" }, "cargo fetch --locked"],
    [{ "pubspec.yaml": "name: app\n", "pubspec.lock": "" }, "dart pub get"],
    [{ "mix.exs": "", "mix.lock": "" }, "mix deps.get"]
  ]) assert.equal(plan(workspace(t, files))?.command, command, command);
});

test("a Flutter package installs with flutter", (t) => {
  const root = workspace(t, { "pubspec.yaml": "name: app\ndependencies:\n  flutter:\n    sdk: flutter\n", "pubspec.lock": "" });
  assert.equal(plan(root).command, "flutter pub get");
  assert.equal(plan(root, { tools: ["dart"] }), null, "flutter itself is required");
});

test("a missing tool, a manifest without its lockfile, and an opt-out install nothing", (t) => {
  assert.equal(plan(workspace(t, { Gemfile: "", "Gemfile.lock": "" }), { tools: [] }), null);
  assert.equal(plan(workspace(t, { "pyproject.toml": "" })), null);
  assert.equal(plan(workspace(t, { "Cargo.toml": "", "Cargo.lock": "" }),
    { sandbox: { installDependencies: false } }), null);
  // A configured command always wins.
  assert.deepEqual(plan(workspace(t, { "Cargo.toml": "", "Cargo.lock": "" }),
    { sandbox: { setupCommand: "make deps" } }), { command: "make deps", source: "configured" });
  // An uninstalled uv falls through to Poetry's lock for the same manifest.
  assert.equal(plan(workspace(t, { "pyproject.toml": "", "uv.lock": "", "poetry.lock": "" }),
    { tools: ["poetry"] }).command, "poetry install --no-interaction");
});

test("the dependency digest covers every ecosystem's manifest and lockfile", (t) => {
  for (const file of ["Cargo.lock", "composer.lock", "go.sum", "Gemfile.lock", "pubspec.lock", "mix.lock", "uv.lock"])
    assert.ok(SETUP_DEPENDENCY_FILES.includes(file), file);
  const root = workspace(t, { "Cargo.toml": "", "Cargo.lock": "a" });
  const before = dependencyDigest(root);
  writeFileSync(join(root, "Cargo.lock"), "b");
  assert.notEqual(dependencyDigest(root), before);
});

function topology(t, { access = "write", setupCommand = undefined, files = { "package.json": "{}", "package-lock.json": "{}" } } = {}) {
  const path = workspace(t, files);
  const repository = { id: "web", mode: access, ...(setupCommand ? { setupCommand } : {}) };
  const state = { repositories: { web: { id: "web", mode: "worktree", access, path } } };
  const runs = [];
  const context = {
    policy: () => ({ sandbox: {} }),
    runSetupCommand: (record, command, _timeout, cwd) => {
      runs.push({ command, cwd });
      record.setup = { command, status: "ok", exitCode: 0 };
    },
    output: { error: () => {} },
    git: () => ({ status: 0, stdout: "", stderr: "" })
  };
  return { path, repository, state, runs, context };
}

test("a writable sibling repository installs from its lockfile", (t) => {
  const value = topology(t);
  setupSelectedRepositories(value.context, value.state, [value.repository]);
  assert.deepEqual(value.runs, [{ command: "npm ci", cwd: value.path }]);
  const configured = topology(t, { setupCommand: "make deps" });
  setupSelectedRepositories(configured.context, configured.state, [configured.repository]);
  assert.deepEqual(configured.runs.map((row) => row.command), ["make deps"]);
});

test("a read-only sibling repository is never installed into", (t) => {
  const value = topology(t, { access: "read", files: { "go.mod": "module x", "go.sum": "" } });
  setupSelectedRepositories(value.context, value.state, [value.repository]);
  assert.deepEqual(value.runs, []);
});

test("a failed detected sibling install retries its recorded command", (t) => {
  const value = topology(t);
  value.state.repositories.web.setup = { command: "npm ci", status: "failed", exitCode: 1 };
  value.state.workspace = { path: value.path };
  const saved = [];
  Object.assign(value.context, {
    selectedRepositories: () => [value.repository], loadRuntime: () => value.state,
    saveRuntime: (state) => saved.push(state), dependencyDigest
  });
  assert.deepEqual(retryFailedSandboxSetups(value.context, "change", value.state), ["web"]);
  assert.deepEqual(value.runs, [{ command: "npm ci", cwd: value.path }]);
  assert.equal(saved.length, 1);
});
