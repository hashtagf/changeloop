import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  forceExitCommand, forceExitLine, lingeringMessage, lingeringTestRun,
  noticeLingeringProvider, noticeSlowTaskCheck
} from "../runtime/core/node-test-exit.mjs";
import { drainSignals } from "../runtime/core/signals.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runQualityProvider } from "../runtime/quality/quality-runtime.mjs";
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
  assert.equal(forceExitLine("node --test-reporter=tap --test"), "node --test-reporter=tap --test --test-force-exit",
    "node options before --test are still a test run");
  assert.equal(forceExitLine("node --test --test-force-exit"), "node --test --test-force-exit");
});

// A consumer's `npx tsx --test` official-parity run passed in 7s and then
// waited 360s for its server, on every one of seven runs.
test("a tsx --test run gains the flag right after --test, before its files", () => {
  assert.deepEqual(forceExitCommand("tsx", ["--test", "tests/a.test.ts"]).args,
    ["--test", "--test-force-exit", "tests/a.test.ts"]);
  assert.deepEqual(forceExitCommand("/repo/node_modules/.bin/tsx", ["--test"]).args, ["--test", "--test-force-exit"]);
  assert.deepEqual(forceExitCommand("npx", ["tsx", "--test", "tests/a.test.ts"]).args,
    ["tsx", "--test", "--test-force-exit", "tests/a.test.ts"]);
  assert.deepEqual(forceExitCommand("npx", ["--no-install", "tsx", "--test"]).args,
    ["--no-install", "tsx", "--test", "--test-force-exit"]);
  assert.deepEqual(forceExitCommand("npx", ["tsx", "--test", "--test-force-exit"]).args,
    ["tsx", "--test", "--test-force-exit"], "never twice");
  assert.deepEqual(forceExitCommand("npx", ["vitest", "--test"]).args, ["vitest", "--test"], "another npx tool is left alone");
  assert.deepEqual(forceExitCommand("tsx", ["server.ts"]).args, ["server.ts"], "a tsx run without --test is left alone");
  assert.deepEqual(forceExitCommand("tsx", ["scripts/x.ts", "--test"]).args, ["scripts/x.ts", "--test"],
    "--test after the script is the script's own argument");
  assert.deepEqual(forceExitCommand("node", ["script.js", "--test"]).args, ["script.js", "--test"]);
  assert.deepEqual(forceExitCommand("node", ["--import", "tsx", "--test", "tests/a.test.ts"]).args,
    ["--import", "tsx", "--test", "--test-force-exit", "tests/a.test.ts"], "an option's value is not the script");
  assert.deepEqual(forceExitCommand("node", ["--require", "./setup.js", "--test"]).args,
    ["--require", "./setup.js", "--test", "--test-force-exit"]);
  assert.deepEqual(forceExitCommand("node", ["-r", "x", "--env-file", ".env", "--test"]).args,
    ["-r", "x", "--env-file", ".env", "--test", "--test-force-exit"]);
  assert.deepEqual(forceExitCommand("tsx", ["--tsconfig", "tsconfig.test.json", "--test"]).args,
    ["--tsconfig", "tsconfig.test.json", "--test", "--test-force-exit"]);
  assert.deepEqual(forceExitCommand("npx", ["-p", "pkg", "tsx", "--test"]).args, ["-p", "pkg", "tsx", "--test"],
    "an npx option with a value is not guessed at");
  assert.equal(forceExitLine("npx tsx --test tests/hardening.test.ts tests/official-parity.test.ts"),
    "npx tsx --test --test-force-exit tests/hardening.test.ts tests/official-parity.test.ts");
  assert.equal(forceExitLine("npx --no-install tsx --test"), "npx --no-install tsx --test --test-force-exit");
  assert.equal(forceExitLine("npm run build && tsx --test"), "npm run build && tsx --test --test-force-exit");
  assert.equal(forceExitLine("npm test"), "npm test");
});

test("a quality test lane ends when its tests do, and passes", (t) => {
  const root = project(t, KEEP_ALIVE);
  const saved = process.env.NODE_TEST_CONTEXT;
  delete process.env.NODE_TEST_CONTEXT;
  t.after(() => { if (saved !== undefined) process.env.NODE_TEST_CONTEXT = saved; });
  const started = Date.now();
  const lane = runQualityProvider({
    repository: { id: "root", path: root }, capability: "test",
    provider: { kind: "command", command: [process.execPath, "--test"], isolation: "read-only" },
    git: () => ({ status: 1, stdout: "" }), pathInside: () => true
  });
  assert.equal(lane.status, "pass", lane.reason || lane.stderr);
  assert.ok(Date.now() - started < 15000, `ended in ${Date.now() - started}ms, not when the server closed`);
  assert.equal(lane.lingering, null, "a run that exits with its tests does not linger");
});

const spec = (...ms) => ms.map((value, index) => `\u2714 test ${index} (${value}ms)\n  \u2714 nested (${value}ms)\n`).join("") +
  "\u2139 tests 2\n\u2139 duration_ms 360591.8\n";

test("a run whose tests ended long before it did is named, with its fix", () => {
  const run = lingeringTestRun(spec(5286.2, 2000), 360591);
  assert.deepEqual(run, { testsMs: 7286, wallMs: 360591 }, "top-level rows only; the summary's own duration is not a test");
  const message = lingeringMessage("npm test", run);
  assert.match(message, /finished in 7s but the run took 361s/);
  assert.match(message, /--test-force-exit right after --test/);
  const tap = "TAP version 13\nok 1 - serves\n  ---\n  duration_ms: 4000.5\n  type: 'test'\n  ...\n" +
    "# Subtest: x\n    ok 1 - inner\n      ---\n      duration_ms: 3999\n      ...\n1..1\n# duration_ms 95000\n";
  assert.deepEqual(lingeringTestRun(tap, 95000), { testsMs: 4001, wallMs: 95000 });
});

// The two call sites: advance's task check and the Prove provider run.
function captured(run) {
  drainSignals();
  const lines = [];
  run((code, line) => lines.push({ code, line }));
  return lines;
}

test("a slow task check names the lingering cause from its output, else the general advice", () => {
  const lingering = captured((emit) => noticeSlowTaskCheck("npm test", { output: spec(5286.2, 2000) }, 360591, emit));
  assert.equal(lingering.length, 1);
  assert.equal(lingering[0].code, "slow-check");
  assert.match(lingering[0].line, /^NOTICE: check `npm test`: its tests finished in 7s but the run took 361s/);
  const unreadable = captured((emit) => noticeSlowTaskCheck("make test", { output: "ok\n" }, 60000, emit));
  assert.equal(unreadable.length, 1, "unreadable output keeps the existing slow-check");
  assert.match(unreadable[0].line, /took 60s\. A task's verify should run only the tests/);
  assert.equal(captured((emit) => noticeSlowTaskCheck("npm test", { output: spec(1) }, 5000, emit)).length, 0,
    "a fast check raises nothing");
  noticeSlowTaskCheck("npm test", { output: spec(5286.2, 2000) }, 360591);
  assert.equal(drainSignals().filter((row) => row.code === "slow-check").length, 1,
    "the default emitter records the signal for the advance envelope");
});

test("a Prove provider run that waited after its tests names it, unless it reused a task check", () => {
  const execution = { built: { command: "npx", args: ["tsx", "--test"] },
    result: { stdout: spec(5286.2), stderr: spec(2000).split("\u2139")[0], durationMs: 360591 } };
  const lines = captured((emit) => noticeLingeringProvider(execution, emit));
  assert.equal(lines.length, 1);
  assert.match(lines[0].line, /check `npx tsx --test`: its tests finished in 7s but the run took 361s/,
    "stdout and stderr both count, and the command comes from the built argv");
  assert.equal(captured((emit) => noticeLingeringProvider({ ...execution, reusedTaskCheck: { id: "x" } }, emit)).length, 0);
  assert.equal(captured((emit) => noticeLingeringProvider({ ...execution, result: { ...execution.result, durationMs: 9000 } }, emit)).length, 0);
  assert.equal(captured((emit) => noticeLingeringProvider({ built: execution.built }, emit)).length, 0);
});

test("both runtime call sites route through the tested notices", () => {
  const source = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
  assert.match(source("../runtime/composition/delivery-wiring.mjs"),
    /const durationMs = Date\.now\(\) - started;[\s\S]{0,200}noticeSlowTaskCheck\(check\.command, result, durationMs\);/);
  assert.match(source("../runtime/evidence/adapter-runtime.mjs"),
    /assertReadRepositories\(provider, execution\.repositoryManifest\.rows\);\s*noticeLingeringProvider\(execution\);/);
});

test("vitest, jest and Playwright summary times count as the tests' own time", () => {
  const vitest = "\u001b[2m   Duration \u001b[22m 5.83s (environment 43%, tests 18%)\n";
  assert.deepEqual(lingeringTestRun(vitest, 120000), { testsMs: 5830, wallMs: 120000 });
  const turbo = "@a:test:    Duration  11.22s (environment 34%)\n@b:test:    Duration  20.14s (transform 55%)\n";
  assert.deepEqual(lingeringTestRun(turbo, 200000), { testsMs: 31360, wallMs: 200000 }, "every package's run counts");
  const mixed = "Tests:       12 passed, 12 total\nTime:        3.2 s\nRunning 8 tests using 7 workers\n  8 passed (1.6m)\n";
  assert.deepEqual(lingeringTestRun(mixed, 400000), { testsMs: 99200, wallMs: 400000 });
  assert.equal(lingeringTestRun("  1415 passed (4.3m)\n", 270000), null, "Playwright that took the time itself");
  assert.deepEqual(lingeringTestRun("  21 passed (500ms)\n", 60000), { testsMs: 500, wallMs: 60000 });
  assert.equal(lingeringTestRun("      Tests  325 passed (325)\n", 300000), null, "a count in parentheses is not a time");
});

test("slow tests, short idle, and unreadable output are not named as lingering", () => {
  assert.equal(lingeringTestRun(spec(30000), 60000), null, "tests at exactly half the run are not lingering");
  assert.equal(lingeringTestRun(spec(100000), 110000), null, "the tests themselves took the time");
  assert.equal(lingeringTestRun(spec(1000), 20000), null, "under thirty seconds of idle");
  assert.equal(lingeringTestRun("PASS src/a.test.js\nTests: 3 passed\n", 360000), null);
  assert.equal(lingeringTestRun("", 360000), null);
  assert.equal(lingeringTestRun(spec(1000), undefined), null);
});

test("go test, pytest, cargo, RSpec and JUnit XML times count as the tests' own time", () => {
  assert.deepEqual(lingeringTestRun("ok  \texample.com/a\t1.2s\nFAIL\texample.com/b\t0.8s\n", 120000),
    { testsMs: 2000, wallMs: 120000 }, "every package line counts");
  assert.equal(lingeringTestRun("ok  \texample.com/a\t(cached)\n", 120000), null, "a cached package has no time");
  assert.equal(lingeringTestRun("============ 12 passed in 95.00s ============\n", 100000), null, "pytest that took the time itself");
  assert.deepEqual(lingeringTestRun("===== 3 passed in 2.50s =====\n", 60000), { testsMs: 2500, wallMs: 60000 });
  assert.deepEqual(lingeringTestRun("test result: ok. 3 passed; 0 failed; finished in 0.01s\n", 60000), { testsMs: 10, wallMs: 60000 });
  assert.deepEqual(lingeringTestRun("Finished in 1.2 seconds (files took 0.3 seconds to load)\n", 60000), { testsMs: 1200, wallMs: 60000 });
  const junit = "<testsuites><testsuite name=\"a\" time=\"3.5\"></testsuite><testsuite name=\"b\" time=\"3.5\"/></testsuites>";
  assert.deepEqual(lingeringTestRun(junit, 90000), { testsMs: 7000, wallMs: 90000 });
  assert.deepEqual(lingeringTestRun("<testsuites time=\"4\"><testsuite time=\"3.5\"/></testsuites>", 90000),
    { testsMs: 4000, wallMs: 90000 }, "the top-level time, not its suites again");
});

test("node options before --test still get the flag, in a shell line and in argv", () => {
  assert.equal(forceExitLine("node --import tsx --test tests/"), "node --import tsx --test --test-force-exit tests/");
  assert.equal(forceExitLine("node -r x --test"), "node -r x --test --test-force-exit");
  assert.equal(forceExitLine("npm run build && node --env-file .env --test-timeout 5000 --test a.js"),
    "npm run build && node --env-file .env --test-timeout 5000 --test --test-force-exit a.js");
  assert.equal(forceExitLine("node scripts/x.js --test"), "node scripts/x.js --test", "the script's own --test");
  assert.equal(forceExitLine("node --inspect scripts/x.js --test"), "node --inspect scripts/x.js --test");
  for (const option of ["--test-timeout", "--test-shard", "--test-skip-pattern", "--watch-path",
    "--test-coverage-include", "--test-coverage-exclude"])
    assert.deepEqual(forceExitCommand("node", [option, "v", "--test"]).args, [option, "v", "--test", "--test-force-exit"], option);
});
