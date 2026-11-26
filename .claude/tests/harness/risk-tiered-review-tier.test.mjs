import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// The default gate spent 158 of its 166 seconds in this wrapper because it ran
// the SLOW upgrade-compat script that only --full (CI) is meant to run.
const ROOT = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const WRAPPER = join(ROOT, ".claude/tests/harness/run-risk-tiered-review-tests.mjs");

function plan(t, tier) {
  const dir = mkdtempSync(join(tmpdir(), "risk-tiered-tier-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const env = { ...process.env, FOUNDATION_RISK_TIERED_DRY_RUN: "1",
    FOUNDATION_RESULT_REPORT: join(dir, "report.json") };
  delete env.FOUNDATION_RUN_ALL_TIER;
  if (tier) env.FOUNDATION_RUN_ALL_TIER = tier;
  const run = spawnSync(process.execPath, [WRAPPER], { cwd: ROOT, env, encoding: "utf8" });
  return { ...run, report: JSON.parse(readFileSync(join(dir, "report.json"), "utf8")) };
}

for (const tier of ["fast", "affected"]) {
  test(`the ${tier} gate defers upgrade compat and still passes`, (t) => {
    const run = plan(t, tier);
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /^DEFERRED: CASE-UPGRADE-COMPAT/m);
    assert.doesNotMatch(run.stdout, /WOULD RUN: CASE-UPGRADE-COMPAT/);
    assert.equal(run.report.numDeferredTests, 1);
    assert.equal(run.report.numFailedTests, 0);
  });
}

for (const tier of ["full", "release", null]) {
  test(`${tier ? `the ${tier} gate` : "a direct run"} runs upgrade compat`, (t) => {
    const run = plan(t, tier);
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /^WOULD RUN: CASE-UPGRADE-COMPAT/m);
    assert.equal(run.report.numDeferredTests, 0);
  });
}

test("run-all exports its tier to the suites it starts", () => {
  const script = readFileSync(join(ROOT, ".claude/tests/run-all.sh"), "utf8");
  assert.match(script, /^FOUNDATION_RUN_ALL_TIER="\$selection_mode"\nexport FOUNDATION_RUN_ALL_TIER$/m);
  // Each suite runs in a `--suite` re-entry that first unsets FOUNDATION_*
  // variables; without this allowance the tier never reached the wrapper.
  const allowed = script.match(/^\s*(FOUNDATION_TEST_JOBS\|[^)]*)\) ;;$/m)?.[1] || "";
  assert.ok(allowed.split("|").includes("FOUNDATION_RUN_ALL_TIER"), allowed);
});
