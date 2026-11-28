import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, readJson } from "../lib.mjs";
import { suiteRows } from "../repository-mutation.mjs";

// The repository's own quality config: the test lane leaves the mutation
// suites to the automated-mutation lane, whose baseline covers those suites.
// Static on purpose: running the suites here would put them back in the test lane.
const config = readJson(join(ROOT, "quality/foundation-quality.json"));
const providers = config.repositories.find((repository) => repository.id === "root").providers;

test("the test lane runs the default gate without the mutation suites", () => {
  assert.deepEqual(providers.test.command, ["sh", ".claude/tests/run-all.sh", "--skip-mutation"]);
});

test("the automated-mutation lane runs the repository mutation report through the generic adapter", () => {
  const lane = providers["automated-mutation"];
  assert.equal(lane.kind, "builtin");
  assert.equal(lane.adapter, "generic-mutation-json");
  assert.equal(lane.isolation, "tool");
  assert.deepEqual(lane.command, ["node", "scripts/quality/repository-mutation.mjs"]);
  assert.deepEqual(lane.inputs, { mutation: "-" });
});

test("the mutation baseline kills every mutant of exactly the MUTATION suites", () => {
  const baseline = readJson(join(ROOT, "quality/baselines/root/automated-mutation-v1.json"));
  assert.equal(baseline.protocol, "foundation-automated-mutation-v1");
  assert.ok(baseline.mutants.length > 0);
  assert.deepEqual(baseline.mutants.filter((mutant) => mutant.status !== "killed"), []);
  const listed = spawnSync("sh", [join(ROOT, ".claude/tests/run-all.sh"), "--mutation-commands"],
    { cwd: ROOT, encoding: "utf8" });
  const suites = suiteRows(listed.stdout).map((row) => row.label).sort();
  const covered = [...new Set(baseline.mutants.map((mutant) => mutant.id.split(":")[0]))].sort();
  assert.deepEqual(covered, suites);
  const manifest = readJson(join(ROOT, "quality/baselines/manifest.json"));
  assert.ok(manifest.entries.some((entry) => entry.reports.some((report) =>
    report.capability === "automated-mutation" &&
    report.target === "quality/baselines/root/automated-mutation-v1.json")));
});
