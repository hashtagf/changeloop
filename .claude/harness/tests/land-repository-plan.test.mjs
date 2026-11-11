import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  ciRepositoryLandStatus,
  createLandRuntime,
  landPreparationBindings,
  landPreparationRepositoryValue,
  landRepositoryPlanRow,
  readRepositoryLandStatus,
  writeRepositoryLandStatus
} from "../runtime/workflow/land-runtime.mjs";

const fail = (message) => { throw new Error(message); };

test("read repository status covers isolation, dirt, drift, and readiness", () => {
  const repository = { baseHead: "base" };
  assert.equal(readRepositoryLandStatus(repository, {}, "base", ""),
    "read-not-isolated");
  assert.equal(readRepositoryLandStatus(repository, { mode: "worktree" }, "base", " M file"),
    "read-sandbox-dirty");
  assert.equal(readRepositoryLandStatus(repository, {
    mode: "worktree", baseHead: "runtime-base"
  }, "other", ""), "read-dependency-drift");
  assert.equal(readRepositoryLandStatus(repository, {
    mode: "worktree", baseHead: "runtime-base"
  }, "runtime-base", ""), "read-only");
});

test("write repository status covers every saga milestone", () => {
  const child = { id: "api", type: "repository" };
  assert.equal(writeRepositoryLandStatus({ id: "root" }, {}, null, false),
    "control-plane-last");
  assert.equal(writeRepositoryLandStatus(child, {}, null, false), "sandbox-missing");
  assert.equal(writeRepositoryLandStatus(child, { path: "/box" }, null, false),
    "awaiting-explicit-commit");
  assert.equal(writeRepositoryLandStatus(child, { path: "/box" }, "commit", false),
    "awaiting-explicit-branch-land");
  const submodule = { ...child, type: "submodule" };
  assert.equal(writeRepositoryLandStatus(
    submodule, { path: "/box" }, "commit", true, "other", "commit"),
  "awaiting-root-pointer");
  assert.equal(writeRepositoryLandStatus(
    submodule, { path: "/box" }, "commit", true, "commit", "other"),
  "awaiting-root-pointer");
  assert.equal(writeRepositoryLandStatus(
    submodule, { path: "/box" }, "commit", true, "commit", "commit"),
  "child-landed");
  assert.equal(writeRepositoryLandStatus(
    child, { path: "/box" }, "commit", true, null, null), "child-landed");
});

test("CI status preserves required-wait precedence over explicit failure", () => {
  assert.equal(ciRepositoryLandStatus("child-landed", { land: { ci: "fail" } }),
    "ci-failed");
  assert.equal(ciRepositoryLandStatus("child-landed", {
    land: { ci: "fail", ciRequired: true }
  }), "awaiting-ci");
  assert.equal(ciRepositoryLandStatus("child-landed", {
    land: { ci: "pass", ciRequired: true }
  }), "child-landed");
  assert.equal(ciRepositoryLandStatus("child-landed", {}), "child-landed");
});

function rowContext(overrides = {}) {
  return {
    root: "/target",
    git: () => ({ stdout: "" }),
    gitHead: (path) => `head:${path}`,
    rootGitlink: (_workspace, repository) => repository.type === "submodule"
      ? "commit" : null,
    repositoryCommitLanded: () => true,
    ...overrides
  };
}

test("land repository row preserves complete child projection", () => {
  const repository = {
    id: "api", type: "submodule", mode: "write", dependsOn: ["db"],
    path: "/target/api", workspacePath: "/workspace/api", baseHead: "repo-base"
  };
  const state = {
    workspace: { path: "/workspace", applied: true },
    repositories: { api: {
      path: "/box/api", baseHead: "runtime-base",
      land: { commit: "commit", ci: "pass", ciRequired: true }
    } }
  };
  assert.deepEqual(landRepositoryPlanRow(rowContext(), state, repository), {
    id: "api", type: "submodule", mode: "write", dependsOn: ["db"],
    targetPath: "/target/api", sandboxPath: "/box/api",
    baseHead: "runtime-base", targetHead: "head:/target/api",
    sandboxHead: "head:/box/api", commit: "commit", ci: "pass",
    rootGitlink: "commit", targetRootGitlink: "commit", status: "child-landed"
  });
});

test("land repository row preserves legacy defaults and read dirty inspection", () => {
  const repository = {
    id: "docs", type: "repository", mode: "read",
    path: "/target/docs", workspacePath: "/workspace/docs", baseHead: "base"
  };
  const legacy = landRepositoryPlanRow(rowContext(), {}, repository);
  assert.equal(legacy.status, "read-not-isolated");
  assert.deepEqual(legacy.dependsOn, []);
  assert.equal(legacy.sandboxPath, "/workspace/docs");
  assert.equal(legacy.baseHead, "base");
  assert.equal(legacy.commit, null);
  assert.equal(legacy.ci, null);

  let gitArgs;
  const dirty = landRepositoryPlanRow(rowContext({
    git: (...args) => { gitArgs = args; return { stdout: " M docs.md " }; }
  }), { repositories: { docs: {
    mode: "worktree", path: "/box/docs", baseHead: "head:/target/docs"
  } } }, repository);
  assert.equal(dirty.status, "read-sandbox-dirty");
  assert.deepEqual(gitArgs, [["status", "--porcelain"], "/box/docs"]);
});

test("land preparation helpers bind repository authority, recovery, proof, and graph identity", () => {
  const state = { land: { recovery: { api: "restore-backup" } } };
  assert.deepEqual(landPreparationRepositoryValue(state, {
    id: "api", mode: "write", dependsOn: ["db"], commit: "child-commit",
    sandboxHead: "sandbox-head", ci: "pass", targetHead: "target-head", status: "child-landed"
  }), {
    id: "api", mode: "write", dependsOn: ["db"], authorizedCommit: "child-commit",
    ci: "pass", targetHead: "target-head", status: "child-landed",
    recoveryDisposition: "restore-backup"
  });
  assert.equal(landPreparationRepositoryValue({}, {
    id: "root", mode: "write", dependsOn: [], sandboxHead: "root-commit"
  }).authorizedCommit, "root-commit");
  assert.equal(landPreparationRepositoryValue({}, {
    id: "docs", mode: "read", dependsOn: [], commit: null
  }).recoveryDisposition, "forward-fix");
  assert.deepEqual(landPreparationBindings({
    proofRunId: "proof-1", aggregateGraphProof: { graphIdentity: "proof-graph" }
  }, { revision: 3, identity: "graph-3" }), {
    graphRevision: 3, graphIdentity: "graph-3",
    aggregateProofRunId: "proof-1", aggregateProofIdentity: "proof-graph"
  });
  assert.deepEqual(landPreparationBindings(null, null), {
    graphRevision: null, graphIdentity: null,
    aggregateProofRunId: null, aggregateProofIdentity: null
  });
});

test("prepared Land rejects missing and stale preparation identities", () => {
  const root = mkdtempSync(join(tmpdir(), "foundation-land-preparation-"));
  const transactions = join(root, "transactions");
  let hash = "hash-a";
  const state = { workspace: { path: root }, repositories: {} };
  const readJson = (path, fallback = null) => {
    try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; }
  };
  const proofFile = join(root, "proof.json");
  const runtime = createLandRuntime({
    assertApproval: () => {},
    root, transactions,
    loadRuntime: () => state,
    proofPath: () => proofFile,
    agentPlanValue: () => ({ graph: { revision: 2, identity: "planned-graph" } }),
    readJson,
    writeJson: (path, value) => {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `${JSON.stringify(value)}\n`);
    },
    selectedRepositories: () => [],
    relevantHash: () => hash,
    stableHash: (value) => JSON.stringify(value),
    now: () => "2026-08-27T00:00:00.000Z",
    fail
  });
  try {
    assert.throws(() => runtime.requirePreparedLand("change-a"), /Land preparation changed/);
    writeFileSync(proofFile, JSON.stringify({
      proofRunId: "stored-proof", aggregateGraphProof: { graphIdentity: "stored-graph" }
    }));
    const prepared = runtime.landPreparationValue("change-a");
    assert.equal(prepared.graphRevision, 2);
    assert.equal(prepared.aggregateProofRunId, "stored-proof");
    const supplied = runtime.landPreparationValue("change-a", state, {
      proofRunId: "supplied-proof", aggregateGraphProof: { graphIdentity: "supplied-proof-graph" }
    }, { revision: 4, identity: "supplied-graph" }, "supplied-hash");
    assert.equal(supplied.graphRevision, 4);
    assert.equal(supplied.aggregateProofRunId, "supplied-proof");
    assert.equal(supplied.workspaceHash, "supplied-hash");
    mkdirSync(join(transactions, "change-a"), { recursive: true });
    writeFileSync(join(transactions, "change-a", "land-preparation.json"),
      `${JSON.stringify(prepared)}\n`);
    assert.deepEqual(runtime.requirePreparedLand("change-a"), prepared);
    hash = "hash-b";
    assert.throws(() => runtime.requirePreparedLand("change-a"), /Land preparation changed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Land resume reports the current plan without changing state", () => {
  const state = {
    status: "archived",
    archivedAt: "2026-08-27T00:00:00.000Z",
    workspace: { path: "/workspace" },
    repositories: {
      root: { path: "/workspace" },
      docs: { mode: "worktree", path: "/workspace/docs", baseHead: "head" }
    }
  };
  const repositories = [
    { id: "docs", type: "repository", mode: "read", path: "/target/docs", workspacePath: "/target/docs", baseHead: "head" },
    { id: "root", type: "repository", mode: "write", path: "/target", workspacePath: "/target" }
  ];
  const saved = [];
  const logs = [];
  const runtime = createLandRuntime({
    assertApproval: () => {},
    root: "/target", transactions: "/transactions",
    loadRuntime: () => state,
    saveRuntime: (value) => saved.push(structuredClone(value)),
    proofAudit: () => ({ valid: true }),
    selectedRepositories: () => repositories,
    gitHead: () => "head",
    git: () => ({ status: 0, stdout: "", stderr: "" }),
    relevantHash: () => "workspace-hash",
    proofPath: () => "/missing-proof.json",
    readJson: () => null,
    writeJson: () => {},
    now: () => "2026-08-27T01:00:00.000Z",
    fail
  });
  const originalLog = console.log;
  console.log = (message) => logs.push(String(message));
  let plan;
  try {
    plan = runtime.resumeLand("change-a");
  } finally {
    console.log = originalLog;
  }
  assert.equal(plan.strategy, "workspace-uncommitted");
  assert.deepEqual(plan.repositories.map((row) => [row.id, row.status]),
    [["docs", "read-only"], ["root", "pending-apply"]]);
  assert.equal(saved.length, 0, "resume never rewrites runtime state");
  assert.ok(logs.some((message) => message.includes("ALREADY ARCHIVED change-a")));
  assert.ok(logs.some((message) => message.includes('"strategy": "workspace-uncommitted"')));
});

test("multi-repository archive readiness accepts settled plans and names blockers", () => {
  const state = {
    workspace: { path: "/workspace", applied: true },
    repositories: {
      root: { path: "/workspace" },
      docs: { mode: "worktree", path: "/workspace/docs", baseHead: "head" }
    }
  };
  const repositories = [
    {
      id: "docs", type: "repository", mode: "read", path: "/target/docs",
      workspacePath: "/target/docs", baseHead: "head"
    },
    {
      id: "root", type: "repository", mode: "write", path: "/target",
      workspacePath: "/target"
    }
  ];
  const runtime = createLandRuntime({
    assertApproval: () => {},
    root: "/target", transactions: "/transactions",
    loadRuntime: () => state,
    selectedRepositories: () => repositories,
    proofPath: () => "/missing-proof.json",
    readJson: () => null,
    relevantHash: () => "workspace-hash",
    git: () => ({ status: 0, stdout: "", stderr: "" }),
    gitHead: () => "head",
    now: () => "2026-08-27T00:00:00.000Z",
    fail
  });

  assert.doesNotThrow(() => runtime.assertMultiRepositoryArchiveReady("change-a", state));
  state.workspace.applied = false;
  assert.throws(() => runtime.assertMultiRepositoryArchiveReady("change-a", state),
    /multi-repository workspace delivery is incomplete: root:pending-apply/);
});
