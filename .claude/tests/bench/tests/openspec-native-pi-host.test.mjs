import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseClaudeArgs } from "../openspec-native/pi-host.mjs";

const SHIM = fileURLToPath(new URL("../openspec-native/pi-host.mjs", import.meta.url));
const FAKE = fileURLToPath(new URL("./fixtures/fake-pi-rpc.mjs", import.meta.url));

function setup({ expiresInMs = 3 * 60 * 60 * 1000 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "pi-host-test-"));
  const auth = join(dir, "auth.json");
  writeFileSync(auth, JSON.stringify({
    "claude-subscription": { type: "oauth", access: "a", refresh: "r", expires: Date.now() + expiresInMs },
    "other-account": { type: "oauth", access: "x", refresh: "y", expires: Date.now() + expiresInMs }
  }));
  return { dir, auth, record: join(dir, "record.json") };
}

function runShim(args, { auth, record, mode = "session", afterFirstAssistant = null }) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [SHIM, ...args], { cwd: tmpdir(), stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PI_BENCH_PI_CLI: FAKE, PI_BENCH_AUTH_SOURCE: auth, FAKE_PI_MODE: mode,
        FAKE_PI_RECORD: record, FOUNDATION_SESSION_ID: "leak", PI_TEAM_AGENT_ID: "leak", CLAUDE_PROJECT_DIR: "/leak" } });
    let out = "", stderr = "", signalled = false;
    child.stdout.on("data", (chunk) => {
      out += chunk;
      if (afterFirstAssistant && !signalled && out.includes('"type":"assistant"')) {
        signalled = true;
        setTimeout(() => afterFirstAssistant(child), 50);
      }
    });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => resolveRun({ code, stderr,
      rows: out.split("\n").filter(Boolean).map((line) => JSON.parse(line)) }));
  });
}

test("Claude CLI arguments map to a prompt, model and budget; unknown flags fail", () => {
  const parsed = parseClaudeArgs(["-p", "/dev x", "--output-format", "stream-json", "--verbose",
    "--setting-sources", "project,local", "--strict-mcp-config", "--permission-mode", "acceptEdits",
    "--allowedTools", "Bash(cloop *)", "Edit(/**)", "--model", "m-1", "--max-budget-usd", "10"]);
  assert.deepEqual(parsed, { prompt: "/dev x", model: "m-1", maxBudgetUsd: 10 });
  assert.throws(() => parseClaudeArgs(["-p", "x", "--dangerously-skip-permissions"]), /unsupported host argument/);
  assert.throws(() => parseClaudeArgs(["--model", "m"]), /-p <prompt> is required/);
});

test("a Pi RPC session becomes the Claude stream the runner measures", async () => {
  const env = setup();
  const { code, rows } = await runShim(["-p", "/dev build it", "--model", "fake-model", "--max-budget-usd", "10"], env);
  assert.equal(code, 0);
  assert.deepEqual(rows.map((row) => row.type), ["system", "assistant", "user", "assistant", "result"]);
  assert.equal(rows[0].subtype, "init");
  const [first, , second] = rows.slice(1);
  assert.notEqual(first.message.id, second.message.id);
  assert.deepEqual(first.message.content, [{ type: "tool_use", id: "call-1", name: "Read", input: { file_path: "a.txt" } }]);
  assert.equal(first.message.model, "fake-model");
  assert.equal(first.message.usage.input_tokens, 10);
  assert.deepEqual(rows[2].message.content[0], { type: "tool_result", tool_use_id: "call-1", content: "file body", is_error: false });
  const result = rows.at(-1);
  assert.equal(result.subtype, "success");
  assert.equal(result.is_error, false);
  assert.equal(result.total_cost_usd, 0.75);
  assert.equal(result.num_turns, 1);
  assert.equal(result.result, "done");
  assert.equal(result.usage.output_tokens, 10);
});

test("the agent directory is isolated, holds one credential and is removed", async () => {
  const env = setup();
  const { code } = await runShim(["-p", "x"], env);
  assert.equal(code, 0);
  const record = JSON.parse(readFileSync(env.record, "utf8"));
  assert.deepEqual(record.files, ["auth.json", "settings.json"]);
  assert.deepEqual(Object.keys(record.auth), ["claude-subscription"]);
  assert.deepEqual(record.foundationEnv, []);
  assert.ok(record.argv.includes("--approve"));
  assert.equal(existsSync(record.agent), false);
  rmSync(env.dir, { recursive: true, force: true });
});

test("a credential expiring too soon starts no Pi process", async () => {
  const env = setup({ expiresInMs: 10 * 60 * 1000 });
  const { code, rows } = await runShim(["-p", "x"], env);
  assert.notEqual(code, 0);
  assert.equal(rows.at(-1).type, "result");
  assert.equal(rows.at(-1).is_error, true);
  assert.match(rows.at(-1).result, /expires in/);
  assert.equal(existsSync(env.record), false);
});

test("reaching the cost cap stops Pi with error_max_budget_usd", async () => {
  const env = setup();
  const { rows } = await runShim(["-p", "x", "--max-budget-usd", "1"], { ...env, mode: "budget" });
  assert.equal(rows.at(-1).subtype, "error_max_budget_usd");
  assert.equal(rows.at(-1).total_cost_usd, 5.25);
});

test("SIGTERM from the runner keeps the measured cost in a terminated result", async () => {
  const env = setup();
  const { rows } = await runShim(["-p", "x"], { ...env, mode: "hang",
    afterFirstAssistant: (child) => child.kill("SIGTERM") });
  const result = rows.at(-1);
  assert.equal(result.type, "result");
  assert.equal(result.subtype, "terminated");
  assert.equal(result.is_error, false);
  assert.equal(result.total_cost_usd, 0.25);
});

test("the runner can spawn the shim directly as its --claude-bin", async () => {
  const env = setup();
  const rows = await new Promise((resolveRun) => {
    const child = spawn(SHIM, ["-p", "x"], { cwd: tmpdir(), stdio: ["ignore", "pipe", "ignore"],
      env: { ...process.env, PI_BENCH_PI_CLI: FAKE, PI_BENCH_AUTH_SOURCE: env.auth } });
    let out = "";
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.on("error", (error) => resolveRun([{ error: error.code }]));
    child.on("close", () => resolveRun(out.split("\n").filter(Boolean).map((line) => JSON.parse(line))));
  });
  assert.equal(rows.at(-1).subtype, "success", JSON.stringify(rows.at(-1)));
});

test("Pi dialogs are answered as cancelled so a headless run never waits", async () => {
  const env = setup();
  const { code, rows } = await runShim(["-p", "/land"], { ...env, mode: "dialog" });
  assert.equal(code, 0);
  assert.equal(rows.at(-1).subtype, "success");
});
