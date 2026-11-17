import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  createTestDiscriminationRuntime, inconclusiveLine
} from "../runtime/evidence/test-discrimination.mjs";
import { configuredCommand } from "../runtime/evidence/evidence-results.mjs";
import { lightKind } from "../runtime/workflow/validation/dev-document.mjs";
import { landAdvisoryLines } from "../runtime/workflow/land/land-runtime.mjs";

// A behavior change whose base check gives no verdict is named to the user
// (Prove outcome, Land report); a repository with changed product code and no
// test provider is a repair.

const stableHash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const fileDigest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture(t, { slowTest = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "discrimination-verdict-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, "repo");
  const write = (files) => {
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(dirname(join(path, file)), { recursive: true });
      writeFileSync(join(path, file), content);
    }
  };
  mkdirSync(path);
  git(path, "init", "-q");
  git(path, "config", "user.email", "fixture@example.invalid");
  git(path, "config", "user.name", "fixture");
  write({ "package.json": "{\"type\":\"module\"}\n", "src/greet.js": "export const greet = (n) => `Hello ${n}`;\n" });
  git(path, "add", "-A");
  git(path, "commit", "-qm", "base");
  const baseHead = git(path, "rev-parse", "HEAD");
  write({
    "src/greet.js": "export const greet = (n) => `Hello, ${n}!`;\n",
    "test/greet.test.mjs": "import test from 'node:test';\nimport assert from 'node:assert/strict';\n" +
      "import { greet } from '../src/greet.js';\n" +
      (slowTest ? "await new Promise((r) => setTimeout(r, 5000));\n" : "") +
      "test('formats', () => assert.equal(greet('Ada'), 'Hello, Ada!'));\n"
  });
  return { root, repo: { id: "root", mode: "write", workspacePath: path, baseHead } };
}

function runtime(repo, logs, { providers, timeoutMs, baseHead = repo.baseHead, config = {},
  binding = null } = {}) {
  const state = { repositories: { root: { baseHead } },
    ...(binding ? { scenarioTestBinding: { version: 1, rows: binding } } : {}) };
  return createTestDiscriminationRuntime({
    LOGS: logs,
    requiredProviders: () => providers ?? ["test-root"],
    providerConfig: () => ({ adapter: "command", command: ["node", "--test"],
      ...(timeoutMs ? { timeoutMs } : {}), ...config }),
    providerCapability: () => "test",
    providerRepository: () => repo,
    selectedRepositories: () => [repo],
    repositoryBaseHead: () => baseHead,
    changedSurface: () => {
      const tracked = git(repo.workspacePath, "diff", "--name-only", repo.baseHead);
      const untracked = git(repo.workspacePath, "ls-files", "--others", "--exclude-standard");
      return [...tracked.split("\n"), ...untracked.split("\n")].filter(Boolean)
        .map((path) => ({ repositoryId: "root", path }));
    },
    pathKind: lightKind,
    changeWorkTypes: () => ["feature"],
    receiptValidity: () => ({ validity: "valid" }),
    configuredCommand, fileDigest, stableHash,
    loadRuntime: () => state,
    environment: Object.fromEntries(Object.entries(process.env)
      .filter(([name]) => name !== "NODE_TEST_CONTEXT"))
  });
}

test("discrimination-no-verdict-visible-no-provider: changed product code without a test provider is a repair", (t) => {
  const { root, repo } = fixture(t);
  const result = runtime(repo, join(root, "logs"), { providers: [] }).evaluate("change-a", "hash-a");
  assert.equal(result.repositories[0].outcome, "no-test-provider");
  assert.equal(result.status, "fail");
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].rootCause, "no-test-provider");
  assert.match(result.findings[0].message, /repository 'root'.*no test provider.*change amend/);
});

test("discrimination-no-verdict-visible-no-provider: a test provider that cannot run on base is no verdict, not a repair", (t) => {
  const { root, repo } = fixture(t);
  for (const config of [{ service: "db" }, { readiness: { url: "http://localhost" } },
    { repositories: ["root", "web"] }, { adapter: "playwright" }]) {
    const result = runtime(repo, join(root, "logs"), { config }).evaluate("change-a", "hash-a");
    assert.equal(result.repositories[0].outcome, "test-provider-not-runnable-on-base", JSON.stringify(config));
    assert.equal(result.status, "not-applicable");
    assert.deepEqual(result.findings, []);
    assert.deepEqual(result.inconclusive, [{ repositoryId: "root",
      reason: "test-provider-not-runnable-on-base", provider: "test-root" }]);
  }
});

test("discrimination-no-verdict-visible-timed-out: a timed-out bound file stays visible beside a file that fails on base", (t) => {
  const { root, repo } = fixture(t);
  writeFileSync(join(repo.workspacePath, "test/slow.test.mjs"),
    "import test from 'node:test';\nawait new Promise((r) => setTimeout(r, 5000));\ntest('slow', () => {});\n");
  const result = runtime(repo, join(root, "logs"), { timeoutMs: 1500, binding: [
    { claimId: "formats", requirementKey: "greet", scenario: "formats", regression: false, files: ["test/greet.test.mjs"] },
    { claimId: "slow", requirementKey: "greet", scenario: "slow", regression: false, files: ["test/slow.test.mjs"] }
  ] }).evaluate("change-a", "hash-a");
  assert.equal(result.repositories[0].outcome, "fails-on-base");
  assert.equal(result.status, "pass");
  assert.deepEqual(result.inconclusive, [{ repositoryId: "root", reason: "timed-out",
    file: "test/slow.test.mjs", provider: "test-root" }]);
  assert.match(inconclusiveLine(result.inconclusive[0]), /'root' for test\/slow\.test\.mjs: timed-out/);
});

test("discrimination-no-verdict-visible-timed-out: a base run past its timeout is reported, not blocked", (t) => {
  const { root, repo } = fixture(t, { slowTest: true });
  const result = runtime(repo, join(root, "logs"), { timeoutMs: 300 }).evaluate("change-a", "hash-a");
  assert.equal(result.repositories[0].outcome, "timed-out");
  assert.equal(result.status, "not-applicable");
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.inconclusive, [{ repositoryId: "root", reason: "timed-out", provider: "test-root" }]);
  const line = inconclusiveLine(result.inconclusive[0]);
  assert.match(line, /no verdict.*'root': timed-out/);
  // The Land report names the same row from the stored change state.
  assert.deepEqual(landAdvisoryLines({ testDiscrimination: { inconclusive: result.inconclusive } }), [line]);
});

test("discrimination-no-verdict-visible-unavailable: a base that cannot be prepared is reported", (t) => {
  const { root, repo } = fixture(t);
  const result = runtime(repo, join(root, "logs"), { baseHead: "0".repeat(40) })
    .evaluate("change-a", "hash-a");
  assert.equal(result.repositories[0].outcome, "unavailable");
  assert.equal(result.status, "not-applicable");
  assert.equal(result.inconclusive[0].reason, "unavailable");
  assert.match(landAdvisoryLines({ testDiscrimination: { inconclusive: result.inconclusive } })[0],
    /no verdict.*unavailable/);
});

test("discrimination-no-verdict-visible-verdict: a verdict leaves no no-verdict row", (t) => {
  const { root, repo } = fixture(t);
  const result = runtime(repo, join(root, "logs")).evaluate("change-a", "hash-a");
  assert.equal(result.repositories[0].outcome, "fails-on-base");
  assert.equal(result.status, "pass");
  assert.deepEqual(result.inconclusive, []);
  assert.deepEqual(landAdvisoryLines({}), []);
});
