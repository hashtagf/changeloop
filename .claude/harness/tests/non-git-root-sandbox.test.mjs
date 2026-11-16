// A root that is no Git repository but gathers checkouts (for example a folder
// of 821 service repositories). Its root copy sandbox and manifests must not
// carry the nested repositories: a declared one has its own sandbox, and an
// undeclared one cannot Land.
import assert from "node:assert/strict";
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { createStateRuntime } from "../runtime/core/state-runtime.mjs";
import { EXCLUDED_WORKSPACE_DIRS } from "../runtime/core/workspace-policy.mjs";
import { copyApplyCodePaths } from "../runtime/workflow/apply-runtime.mjs";
import { copySandboxEntries, sandboxCopyPlan } from "../runtime/workflow/sandbox-runtime.mjs";

const ID = "demo";
const noGit = () => ({ status: 128, stdout: "", stderr: "not a git repository" });

function write(path, text = "x\n") {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

function gathering(t) {
  const base = mkdtempSync(join(tmpdir(), "non-git-root-sandbox-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const root = join(base, "root");
  write(join(root, "README.md"), "gathering root\n");
  write(join(root, "openspec", "repositories.yaml"), "{}\n");
  // Declared repository with its own Git checkout.
  write(join(root, "services", "app", "src", "login.ts"));
  mkdirSync(join(root, "services", "app", ".git"), { recursive: true });
  // Undeclared repository; a worktree-style `.git` file counts too.
  write(join(root, "archive", "other", "index.js"));
  write(join(root, "archive", "other", ".git"), "gitdir: elsewhere\n");
  // A plain folder beside them is root content.
  write(join(root, "notes", "plan.md"));
  return { base, root };
}

function copy(root, destination, nestedPaths = ["services/app"]) {
  mkdirSync(destination, { recursive: true });
  copySandboxEntries({
    root, requestedPath: destination, fail: (message) => { throw new Error(message); },
    plan: sandboxCopyPlan({
      root, carriesGit: false, git: noGit,
      sandboxCopyExcludedDirs: new Set(), excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS,
      nestedPaths
    })
  });
}

function manifests(base, root) {
  const state = createStateRuntime({
    root, runtime: join(base, "runtime"), changes: join(root, "openspec", "changes"),
    snapshots: join(base, "snapshots"), excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS,
    readJson: (path, fallback) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback,
    writeJson: () => {}, canonicalPath: (path) => path, now: () => "now",
    fail: (message) => { throw new Error(message); }
  });
  return (workspace) => Object.keys(state.workspaceManifest(workspace, ID, true)).sort();
}

test("a gathering root's copy sandbox leaves out its declared repository", (t) => {
  const { base, root } = gathering(t);
  const sandbox = join(base, "sandbox");
  copy(root, sandbox);
  assert.equal(existsSync(join(sandbox, "services", "app")), false);
  const manifest = manifests(base, root);
  assert.equal(manifest(root).some((path) => path.startsWith("services/app/")), false);
  assert.equal(manifest(sandbox).some((path) => path.startsWith("services/app/")), false);
});

test("a gathering root's copy sandbox leaves out an undeclared nested repository", (t) => {
  const { base, root } = gathering(t);
  const sandbox = join(base, "sandbox");
  copy(root, sandbox);
  assert.equal(existsSync(join(sandbox, "archive", "other")), false);
  assert.equal(manifests(base, root)(root).some((path) => path.startsWith("archive/other/")), false);
});

test("a gathering root keeps its own control-plane files", (t) => {
  const { base, root } = gathering(t);
  const sandbox = join(base, "sandbox");
  copy(root, sandbox);
  for (const path of ["README.md", "openspec/repositories.yaml", "notes/plan.md"])
    assert.equal(existsSync(join(sandbox, path)), true, path);
  const manifest = manifests(base, root);
  assert.deepEqual(manifest(root), ["README.md", "notes/plan.md", "openspec/repositories.yaml"]);
  assert.deepEqual(manifest(sandbox), manifest(root));
});

test("a Git root copies its tracked files and undeclared nested folders as before", (t) => {
  const { base, root } = gathering(t);
  mkdirSync(join(root, ".git"));
  const git = (args) => args.includes("--others") ? { status: 0, stdout: "" }
    : { status: 0, stdout: "README.md\0archive/other/index.js\0notes/plan.md\0" };
  const plan = sandboxCopyPlan({
    root, carriesGit: true, git, sandboxCopyExcludedDirs: new Set(),
    excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS, nestedPaths: ["services/app"]
  });
  assert.equal(plan.excludes("archive/other"), false);
  assert.equal(plan.excludes("archive/other/index.js"), false);
  assert.equal(plan.excludes("services/app"), false, "the projection placeholder stays");
  assert.equal(plan.excludes("services/app/src/login.ts"), true);
  // A preview copy of a Git root (no carried .git) is unchanged too.
  const preview = sandboxCopyPlan({
    root, carriesGit: false, git: noGit, sandboxCopyExcludedDirs: new Set(),
    excludedWorkspaceDirs: EXCLUDED_WORKSPACE_DIRS, nestedPaths: ["services/app"]
  });
  assert.equal(preview.excludes("archive/other"), false);
  assert.equal(preview.excludes("services/app/src/login.ts"), false);
});

test("Land refuses a file written into an undeclared nested repository", (t) => {
  const { base, root } = gathering(t);
  const sandbox = join(base, "sandbox");
  copy(root, sandbox);
  write(join(sandbox, "archive", "other", "added.js"));
  const manifest = manifests(base, root);
  const context = {
    root,
    workspaceManifest: (workspace) => Object.fromEntries(manifest(workspace).map((p) => [p, p])),
    copyCodePaths: () => ["archive/other/added.js"],
    pathMode: () => 0o644,
    fail: (message) => { throw new Error(message); }
  };
  assert.throws(() => copyApplyCodePaths(context, ID, { workspace: { baseline: {} } }, sandbox),
    /nested repository path\(s\): archive\/other\/added\.js; register nested repositories in openspec\/repositories\.yaml/);
  // Root-owned content still lands.
  context.copyCodePaths = () => ["notes/plan.md"];
  assert.deepEqual(copyApplyCodePaths(context, ID,
    { workspace: { baseline: { "notes/plan.md": "notes/plan.md" } } }, sandbox), ["notes/plan.md"]);
});
