import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { forceExitCommand, forceExitLine } from "../runtime/core/node-test-exit.mjs";
import { runTaskCheck } from "../runtime/workflow/authority/session-lease.mjs";

// A paid project-tracker-api run: every test passed, but fetch left a
// keep-alive connection to the test's own server open, so `node --test`
// never exited and Build waited out its ten-minute cap twice.
const KEEP_ALIVE = "const t = require('node:test');\nconst http = require('node:http');\n" +
  "t('serves', async () => {\n  const s = http.createServer((q, r) => r.end('ok'));\n" +
  "  await new Promise((r) => s.listen(0, '127.0.0.1', r));\n" +
  "  await fetch(`http://127.0.0.1:${s.address().port}`);\n" +
  "  assert.ok(true);\n});\nconst assert = require('node:assert');\n";

function project(t, body) {
  const root = mkdtempSync(join(tmpdir(), "node-test-force-exit-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "test"));
  writeFileSync(join(root, "package.json"), "{}\n");
  writeFileSync(join(root, "test/a.test.js"), body);
  return root;
}

function check(root, command, timeoutMs = 20000) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== "NODE_TEST_CONTEXT"));
  const started = Date.now();
  const result = runTaskCheck({ loadRuntime: () => ({ workspace: { path: root } }), env, timeoutMs },
    "demo", { command, repository: "root" });
  return { ...result, ms: Date.now() - started };
}

test("a keep-alive connection left open: the task check ends when the tests do, and passes", (t) => {
  const result = check(project(t, KEEP_ALIVE), "node --test");
  assert.equal(result.status, "pass", result.output);
  assert.ok(result.ms < 15000, `ended in ${result.ms}ms, not at the cap`);
});

test("a failing test beside an open server ends quickly and fails", (t) => {
  const body = KEEP_ALIVE.replace("assert.ok(true)", "assert.equal(1, 2)");
  const result = check(project(t, body), "node --test");
  assert.equal(result.status, "fail");
  assert.ok(result.ms < 15000, `ended in ${result.ms}ms, not at the cap`);
});

test("only a node --test run gains the flag, once", () => {
  assert.deepEqual(forceExitCommand("node", ["--test"]), { command: "node", args: ["--test", "--test-force-exit"] });
  assert.deepEqual(forceExitCommand("/usr/bin/node", ["--test", "a.test.js"]).args,
    ["--test", "--test-force-exit", "a.test.js"]);
  assert.deepEqual(forceExitCommand("node", ["--test", "--test-force-exit"]).args, ["--test", "--test-force-exit"]);
  assert.deepEqual(forceExitCommand("npm", ["test"]), { command: "npm", args: ["test"] });
  assert.deepEqual(forceExitCommand("node", ["script.js"]).args, ["script.js"]);
  assert.deepEqual(forceExitCommand("sh", ["-c", "node --test test/a.js"]).args,
    ["-c", "node --test --test-force-exit test/a.js"]);
  assert.equal(forceExitLine("(npm run build) && (node --test)"), "(npm run build) && (node --test --test-force-exit)");
  assert.equal(forceExitLine("npm test"), "npm test");
  assert.equal(forceExitLine("node --test-reporter=tap --test"), "node --test-reporter=tap --test",
    "a line that does not start the run with --test is left alone");
  assert.equal(forceExitLine("node --test --test-force-exit"), "node --test --test-force-exit");
});
