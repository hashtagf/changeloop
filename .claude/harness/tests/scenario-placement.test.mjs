// A scenario must be provable where it is placed. In a paid ten-repository
// run the agent put "Orders wired to real payments and inventory" under a task
// in the orders repository: its test could only fake them, the review sent it
// back, and the repair imported '../payments' across repositories.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { scenarioPlacement } from "../runtime/workflow/validation/scenario-placement.mjs";
import { escapingImportIssue, escapingImports } from "../runtime/workflow/change/repository-escape.mjs";

const repositories = ["contracts", "payments", "inventory", "orders", "web"]
  .map((id) => ({ id, path: id }));
const draft = (scenario, task = { key: "t", covers: ["cancel"], repository: "orders" }) => ({
  requirements: [{ key: "cancel", scenarios: [scenario] }], tasks: [task]
});

test("a scenario needing another repository for real is a draft issue", () => {
  const { issues, warnings } = scenarioPlacement(draft({ name: "Production wiring",
    given: "Orders wired to real payments and inventory", when: "An order is cancelled",
    then: "The charge is refunded and the stock restored" }), { repositories });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /needs the real payments, inventory but only repository 'orders' covers it/);
  assert.match(issues[0], /task where the repositories are composed \(the root/);
  assert.deepEqual(warnings, []);
});

test("unclear placements are warnings the agent decides on", () => {
  const named = scenarioPlacement(draft({ name: "Refund failure",
    when: "payments.refund throws", then: "the order stays placed" }), { repositories });
  assert.deepEqual(named.issues, []);
  assert.match(named.warnings[0], /names payments but only repository 'orders' covers it/);
  const external = scenarioPlacement(draft({ name: "Survives restart",
    when: "the server restarts", then: "the order is still cancelled" }), { repositories });
  assert.deepEqual(external.issues, []);
  assert.match(external.warnings[0], /describes restarts?; prove it with a test that runs it for real/);
});

test("a scenario placed where it can be proved is not reported", () => {
  const scenario = { name: "Production wiring", given: "Orders wired to real payments",
    then: "the charge is refunded" };
  const atRoot = scenarioPlacement(draft(scenario, { key: "t", covers: ["cancel"] }), { repositories });
  assert.deepEqual(atRoot, { issues: [], warnings: [] }, "the root composes every repository");
  const own = scenarioPlacement(draft({ name: "Cancel", given: "a placed order in orders",
    then: "it is cancelled" }), { repositories });
  assert.deepEqual(own, { issues: [], warnings: [] }, "naming its own repository is fine");
  const single = scenarioPlacement(draft(scenario), { repositories: [] });
  assert.deepEqual(single, { issues: [], warnings: [] }, "a single-repository project has nothing to place");
  const spread = scenarioPlacement({ requirements: [{ key: "cancel", scenarios: [scenario] }],
    tasks: [{ key: "a", covers: ["cancel"], repository: "orders" },
      { key: "b", covers: ["cancel"], repository: "payments" }] }, { repositories });
  assert.deepEqual(spread.issues, [], "tasks in several repositories already compose it");
});

test("a repository's changed files may not import another repository", (t) => {
  const root = mkdtempSync(join(tmpdir(), "repository-escape-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const orders = join(root, "orders");
  mkdirSync(join(orders, "lib"), { recursive: true });
  writeFileSync(join(orders, "index.test.mjs"),
    'import { createOrders } from "./index.mjs";\nimport { createPayments } from "../payments/index.mjs";\n' +
    'const inventory = await import("../inventory/index.mjs");\nconst x = require("./lib/x.cjs");\n');
  writeFileSync(join(orders, "lib", "util.mjs"), 'export * from "../index.mjs";\nimport "node:fs";\n');
  writeFileSync(join(orders, "notes.md"), 'see "../payments/index.mjs"');
  const found = escapingImports(orders, ["index.test.mjs", "lib/util.mjs", "notes.md", "missing.mjs"]);
  assert.deepEqual(found.map((row) => row.specifier), ["../payments/index.mjs", "../inventory/index.mjs"]);
  const issue = escapingImportIssue("T002", "orders", found);
  assert.match(issue, /task T002 reaches outside repository 'orders': index\.test\.mjs imports '\.\.\/payments\/index\.mjs'/);
  assert.match(issue, /prove it where the repositories are composed/);
  assert.equal(escapingImportIssue("T002", "orders", []), null);
});
