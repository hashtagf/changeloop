import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compare, compareMarkdown, laneRow, plan, taskIdentity } from "../lane-results.mjs";

const scenario = (id, extra = {}) => ({ id, execution: "paid", status: "ready", fixture_digest: `sha256:${id}`, prompt: `/dev ${id}`, ...extra });
const card = (lane, { wallMs = 60000, cost = 0.5, requests = 10, workflow = "archived", verdict = "pass", costMeasurement = "measured", at = "2026-11-19T10:00:00Z" } = {}) => ({
  scenario: lane, arm: "change-loop", runId: `${lane}-1`, provenance: { commit: "abc", finishedAt: at },
  outcome: { workflowStatus: workflow, failureClass: workflow === "archived" ? null : "land-not-archived" },
  oracle: { verdict, score: verdict === "pass" ? 5 : 4, max: 5 },
  timing: { wallMs }, usage: { costUsd: cost, costMeasurement, modelRequests: requests, modelRequestsMeasurement: "measured" }
});
const matrix = (...rows) => new Map(rows.map((row) => [row.id, row]));

test("a lane row keeps the task identity and never turns an unmeasured cost into a number", () => {
  const row = laneRow(card("notes-api", { costMeasurement: "unavailable" }), matrix(scenario("notes-api")));
  assert.deepEqual({ ...row, promptDigest: undefined }, { lane: "notes-api", fixtureDigest: "sha256:notes-api", promptDigest: undefined,
    commit: "abc", runId: "notes-api-1", at: "2026-11-19T10:00:00Z", passed: true, workflow: "archived", failure: null,
    decision: null, oracleScore: 5, oracleMax: 5, wallMin: 1, costUsd: null, costMeasurement: "unavailable", modelRequests: 10 });
  assert.equal(row.promptDigest, taskIdentity(scenario("notes-api")).promptDigest);
});

test("a release runs an old lane again only when its task changed or no old result exists", () => {
  const old = { version: "v1", lanes: [laneRow(card("same"), matrix(scenario("same"))), laneRow(card("fixture"), matrix(scenario("fixture"))),
    laneRow(card("prompt"), matrix(scenario("prompt")))] };
  const next = matrix(scenario("same"), scenario("fixture", { fixture_digest: "sha256:new" }), scenario("prompt", { prompt: "/dev changed" }),
    scenario("added"), scenario("free", { execution: "deterministic" }));
  assert.deepEqual(plan(old, next, new Set(["same", "fixture", "prompt"])).map(({ lane, runOld, reason }) => [lane, runOld, reason]), [
    ["same", false, null], ["fixture", true, "fixture changed since the old run"], ["prompt", true, "prompt changed since the old run"],
    ["added", false, "a new lane; the old version has none"]]);
});

test("a comparison totals only lanes with the same task and names the rest", () => {
  const m = matrix(scenario("a"), scenario("b"));
  const old = { version: "v1", lanes: [laneRow(card("a", { wallMs: 120000, cost: 1, requests: 10 }), m), laneRow(card("b"), m)] };
  const changed = matrix(scenario("a"), scenario("b", { prompt: "/dev other" }), scenario("c"));
  const next = { version: "v2", lanes: [laneRow(card("a", { wallMs: 60000, cost: 0.8, requests: 8 }), changed),
    laneRow(card("b"), changed), laneRow(card("c", { workflow: "proven" }), changed)] };
  const value = compare(old, next);
  assert.equal(value.compared, 1);
  assert.deepEqual(value.totals.new, { passed: 1, wallMin: 1, costUsd: 0.8, modelRequests: 8, costUnmeasured: 0 });
  assert.deepEqual(value.onlyNew, ["c"]);
  const markdown = compareMarkdown(value);
  assert.match(markdown, /\| Wall time \| 2 min \| 1 min \| −50% \|/);
  assert.match(markdown, /\| b \(task changed\) \|/);
});

test("record writes one row per lane and keeps the latest run of a lane", async (t) => {
  const { record, readRecord } = await import("../lane-results.mjs");
  const root = mkdtempSync(join(tmpdir(), "lane-results-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const results = join(root, "runs");
  for (const [dir, value] of [["1", card("a", { at: "2026-11-19T10:00:00Z", cost: 1 })], ["2", card("a", { at: "2026-11-19T11:00:00Z", cost: 0.4 })],
    ["3", { ...card("a"), arm: "baseline" }]]) {
    mkdirSync(join(results, dir), { recursive: true });
    writeFileSync(join(results, dir, "scorecard.json"), JSON.stringify(value));
  }
  const matrixAt = () => matrix(scenario("a"));
  const value = record("v9", results, root, { matrixAt });
  assert.deepEqual(value.lanes.map((row) => [row.lane, row.costUsd]), [["a", 0.4]], "the baseline arm is not release evidence");
  assert.equal(readRecord("v9", root).lanes.length, 1);
});
