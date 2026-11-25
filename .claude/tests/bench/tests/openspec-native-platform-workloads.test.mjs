// The two ten-repository platform lanes: each frozen seed fails its hidden
// oracle, the calibration answer passes every critical case, and the
// mistakes a large multi-repository change invites are caught: a vendored
// contract copy left behind, a tenant taken from the request, an untouched
// or read-only repository edited, an over-refund, a second cancellation.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { runBenchmarkOracle } from "../openspec-native/run.mjs";
import { repairPlatformRefund } from "./fixtures/platform-refund-repair.mjs";
import { repairPlatformTenant } from "./fixtures/platform-tenant-repair.mjs";

const TASKS = fileURLToPath(new URL("../tasks", import.meta.url));
const MATRIX = JSON.parse(readFileSync(
  fileURLToPath(new URL("../config/openspec-native-matrix.json", import.meta.url)), "utf8"));
const LANES = [
  ["platform-tenant-contract", "46-platform-tenant-contract", repairPlatformTenant],
  ["platform-refund-slice", "47-platform-refund-slice", repairPlatformRefund]
];

function project(task, repair) {
  const dir = mkdtempSync(join(tmpdir(), "platform-lane-"));
  cpSync(join(TASKS, task, "seed"), dir, { recursive: true });
  if (repair) repair(dir);
  return dir;
}

function oracleCase(task, dir, id) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(process.execPath, [join(TASKS, task, "oracle/check.mjs"), dir, id],
    { encoding: "utf8", env, timeout: 120000 });
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

for (const [id, task, repair] of LANES) {
  test(`${id}: ten repositories, the seed fails and the calibration answer passes every critical case`, (t) => {
    const scenario = MATRIX.scenarios.find((row) => row.id === id);
    assert.equal(scenario.repository_catalog.repositories.length, 10);
    const seeded = project(task);
    const repaired = project(task, repair);
    t.after(() => { rmSync(seeded, { recursive: true, force: true }); rmSync(repaired, { recursive: true, force: true }); });
    const before = runBenchmarkOracle({ project: seeded, oraclePath: join(TASKS, task, "oracle/run.sh") });
    assert.equal(before.verdict, "fail", "the frozen seed must not already pass");
    const after = runBenchmarkOracle({ project: repaired, oraclePath: join(TASKS, task, "oracle/run.sh") });
    assert.equal(after.verdict, "pass", JSON.stringify(after.diagnostics));
    assert.equal(after.score, after.max);
    assert.deepEqual(Object.keys(after.results).sort(), [...scenario.critical_case_ids].sort());
  });
}

test("platform-tenant-contract catches a stale vendored copy, a request-chosen tenant and an edited untouched repository", (t) => {
  const task = "46-platform-tenant-contract";
  const mutants = [
    ["CASE_VENDORED_COPIES", (dir) => cpSync(join(TASKS, task, "seed/orders/event.mjs"), join(dir, "orders/event.mjs"))],
    ["CASE_TENANT_FROM_TOKEN_ONLY", (dir) => {
      const path = join(dir, "gateway/index.mjs");
      writeFileSync(path, readFileSync(path, "utf8").replace(
        "const context = auth.authenticate(request.headers?.authorization);",
        "const context = { ...auth.authenticate(request.headers?.authorization), ...(request.headers?.[\"x-tenant-id\"] ? { tenantId: request.headers[\"x-tenant-id\"] } : {}) };"));
    }],
    ["CASE_UNTOUCHED", (dir) => appendFileSync(join(dir, "web/state.mjs"), "\n// tenant aware\n")]
  ];
  for (const [id, mutate] of mutants) {
    const dir = project(task, repairPlatformTenant);
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    mutate(dir);
    const result = oracleCase(task, dir, id);
    assert.equal(result.max, 1);
    assert.equal(result.results[id], "fail", `${id}: mutant escaped the oracle`);
  }
});

test("platform-refund-slice catches an over-refund, a second cancellation and an edited read-only repository", (t) => {
  const task = "47-platform-refund-slice";
  const edit = (path, before, after) => (dir) => {
    const file = join(dir, path);
    const text = readFileSync(file, "utf8");
    assert.ok(text.includes(before), `mutation anchor missing in ${path}`);
    writeFileSync(file, text.replace(before, after));
  };
  const mutants = [
    ["CASE_REFUND_LIMITS", edit("payments/index.mjs", "value > remaining", "value > charge.amount")],
    ["CASE_CANCEL_ONCE", edit("orders/index.mjs",
      "if (order.status === \"cancelled\") throw fail(\"ALREADY_CANCELLED\");", "")],
    ["CASE_READ_ONLY_UNCHANGED", (dir) => appendFileSync(join(dir, "gateway/index.mjs"), "\n// cancel route later\n")]
  ];
  for (const [id, mutate] of mutants) {
    const dir = project(task, repairPlatformRefund);
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    mutate(dir);
    const result = oracleCase(task, dir, id);
    assert.equal(result.max, 1);
    assert.equal(result.results[id], "fail", `${id}: mutant escaped the oracle`);
  }
});
