import assert from "node:assert/strict";
import test from "node:test";
import { TOLERANCE, compareCoverage, summaryValue } from "../coverage-ratchet.mjs";

const baseline = { lines: 90, branches: 80, functions: 85 };

test("coverage within the tolerance passes; a drop beyond it fails and names the fix", () => {
  assert.deepEqual(compareCoverage(baseline, { lines: 90 - TOLERANCE, branches: 80, functions: 85.1 }),
    { regressions: [], gains: [] });
  const { regressions } = compareCoverage(baseline, { lines: 89, branches: 80, functions: 85 });
  assert.equal(regressions.length, 1);
  assert.match(regressions[0], /lines 89% is below the 90% baseline; add tests/);
});

test("a rise beyond the tolerance is reported so the baseline is raised and kept", () => {
  assert.deepEqual(compareCoverage(baseline, { lines: 91, branches: 80, functions: 85 }).gains, ["lines 90% -> 91%"]);
});

test("a c8 json-summary reduces to the three ratcheted percentages", () => {
  const total = { lines: { pct: 1 }, branches: { pct: 2 }, functions: { pct: 3 }, statements: { pct: 4 } };
  assert.deepEqual(summaryValue({ total }), { lines: 1, branches: 2, functions: 3 });
});
