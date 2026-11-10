import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import install from "../adapters/pi-extension.mjs";
import { HOST_COMMANDS } from "../runtime/core/host-instruction.mjs";

const source = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const temp = realpathSync(mkdtempSync(join(tmpdir(), "pi-adapter-")));
const root = join(temp, "project with spaces");
const update = process.env.FOUNDATION_UPDATE_CHECK;
process.env.FOUNDATION_UPDATE_CHECK = "0";
const run = (args) => spawnSync("bash", [join(source, "cli.sh"), ...args], {
  cwd: source, encoding: "utf8", timeout: 60000,
  env: { ...process.env, FOUNDATION_UPDATE_CHECK: "0" }
});
before(() => {
  const result = run(["init", root, "--host", "pi", "--yes"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
after(() => {
  rmSync(temp, { recursive: true, force: true });
  if (update === undefined) delete process.env.FOUNDATION_UPDATE_CHECK;
  else process.env.FOUNDATION_UPDATE_CHECK = update;
});

async function bridge(session = "pi-test") {
  const handlers = new Map(), commands = new Map(), messages = [], notices = [], statuses = [];
  let bash;
  const pi = {
    on: (name, handler) => handlers.set(name, handler),
    registerCommand: (name, command) => commands.set(name, command),
    registerTool: (tool) => { bash = tool; },
    sendUserMessage: (message) => messages.push(message)
  };
  const ctx = { cwd: root, signal: undefined, model: { provider: "anthropic", id: "test-model" },
    sessionManager: { getSessionId: () => session }, waitForIdle: async () => {},
    ui: { notify: (text, kind) => notices.push({ text, kind }), setStatus: (_key, value) => statuses.push(value) } };
  let shell;
  install(pi, { projectRoot: root, hostExecutable: "bash", hostPrefixArgs: [join(source, "cli.sh")],
    createBashTool: (cwd, options) => ({ name: "bash", description: "native bash", parameters: {},
      execute: async (_id, args) => options?.spawnHook({ command: args.command, cwd,
        env: { ...process.env, FOUNDATION_CLAUDE_SESSION_ID: "foreign", CODEX_THREAD_ID: "foreign" } }) }),
    createLocalBashOperations: () => ({ exec: async (command, cwd) => { shell = { command, cwd }; return shell; } })
  });
  const fire = (name, event = {}) => handlers.get(name)?.(event, ctx);
  const call = (toolName, input, toolCallId = "t1") => fire("tool_call", { toolName, input, toolCallId });
  const command = (name, args = "") => commands.get(name).handler(args, ctx);
  await fire("session_start");
  assert.equal(notices.length, 0, JSON.stringify(notices));
  return { handlers, commands, messages, notices, statuses, ctx, fire, call, command,
    bash: () => bash, shell: () => shell };
}

function building(session = "pi-test", id = "pi-case") {
  const workspace = join(root, ".foundation/sandboxes", id);
  mkdirSync(workspace, { recursive: true });
  mkdirSync(join(root, "openspec/changes", id), { recursive: true });
  mkdirSync(join(root, ".foundation/logs", id), { recursive: true });
  mkdirSync(join(root, ".foundation/runtime"), { recursive: true });
  writeFileSync(join(root, ".foundation/logs", id, "phase-context.jsonl"), JSON.stringify({
    changeId: id, sessionId: session, phase: "build", timestamp: new Date().toISOString()
  }) + "\n");
  writeFileSync(join(root, ".foundation/runtime", `${id}.json`), JSON.stringify({
    id, status: "building", workspace: { mode: "worktree", path: workspace, targetPath: root }
  }));
  return workspace;
}

test("Pi installer owns only its extension and refreshes it without touching user extensions", () => {
  const path = join(root, ".pi/extensions/changeloop.ts");
  assert.match(readFileSync(path, "utf8"), /@earendil-works\/pi-coding-agent/);
  assert.equal(readFileSync(join(root, ".foundation/adapter-manifests/pi.txt"), "utf8"),
    "project\t.pi/extensions/changeloop.ts\n");
  writeFileSync(join(root, ".pi/extensions/user.ts"), "user content\n");
  writeFileSync(path, "old managed adapter\n");
  const result = run(["init", root, "--host=pi", "--yes"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(readFileSync(path, "utf8"), /createBashTool/);
  assert.equal(readFileSync(join(root, ".pi/extensions/user.ts"), "utf8"), "user content\n");
});

test("installer preserves a same-name user extension on first install", () => {
  const target = join(temp, "user-owned");
  mkdirSync(join(target, ".pi/extensions"), { recursive: true });
  writeFileSync(join(target, ".pi/extensions/changeloop.ts"), "user extension\n");
  const result = run(["init", target, "--host", "pi", "--yes"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /keeping existing user-owned Pi extension/);
  assert.equal(readFileSync(join(target, ".pi/extensions/changeloop.ts"), "utf8"), "user extension\n");
});

test("Pi adapter rejects ownership outside its one extension before shared install", () => {
  const target = join(temp, "bad-manifest");
  mkdirSync(join(target, ".foundation/adapter-manifests"), { recursive: true });
  writeFileSync(join(target, ".foundation/adapter-manifests/pi.txt"), "project\t.pi/extensions/user.ts\n");
  const result = run(["init", target, "--host", "pi", "--yes"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside pi ownership/);
  assert.equal(existsSync(join(target, "WORKFLOW.md")), false);
});

test("Pi commands use the installed canonical registry and keep hostile arguments opaque", async () => {
  const b = await bridge();
  assert.deepEqual([...b.commands.keys()], [...HOST_COMMANDS]);
  const sentinel = join(temp, "must-not-run");
  const args = `fix $(touch '${sentinel}') \`touch '${sentinel}'\`\nsecond line`;
  await b.command("change", args);
  assert.equal(b.notices.length, 0);
  assert.equal(b.messages.length, 1);
  assert.ok(b.messages[0].includes(args));
  assert.equal(existsSync(sentinel), false);
  await b.command("changes", "unexpected");
  assert.equal(b.messages.length, 1, "invalid command request never starts a turn");
  assert.equal(b.notices.at(-1).kind, "error");
});

test("Pi prompt retains existing instructions and explains per-call cwd", async () => {
  const b = await bridge();
  const result = await b.fire("before_agent_start", { systemPrompt: "existing rules" });
  assert.match(result.systemPrompt, /^existing rules/);
  assert.match(result.systemPrompt, /Change Loop agent contract/);
  assert.match(result.systemPrompt, /EACH call/);
  assert.match(result.systemPrompt, /partial/);
});

test("mismatched CLI/project versions and cancellation never start a workflow turn", async () => {
  const b = await bridge();
  const protocol = join(root, ".claude/harness/protocol.json");
  const original = readFileSync(protocol, "utf8");
  try {
    writeFileSync(protocol, JSON.stringify({ ...JSON.parse(original), runtime: "0.0.0" }));
    await b.command("change", "version mismatch");
    assert.equal(b.messages.length, 0);
    assert.match(b.notices.at(-1).text, /versions differ/);
  } finally { writeFileSync(protocol, original); }
  const controller = new AbortController();
  controller.abort();
  b.ctx.signal = controller.signal;
  await b.command("change", "cancelled");
  assert.equal(b.messages.length, 0);
  assert.equal(b.notices.at(-1).kind, "error");
});

test("Pi guards refuse main-checkout and symlink writes but permit sandbox writes", async () => {
  const b = await bridge();
  const workspace = building();
  const blocked = await b.call("write", { path: "src/main.js", content: "bad" });
  assert.equal(blocked.block, true);
  assert.match(blocked.reason, /phase guard/);
  assert.equal(await b.call("write", { path: join(workspace, "src/main.js"), content: "good" }), undefined);
  const link = join(workspace, "escape");
  symlinkSync(root, link);
  const escaped = await b.call("edit", { path: join(link, "src/main.js"), oldText: "a", newText: "b" });
  assert.equal(escaped.block, true);
});

test("Pi guards allow semantic draft v5 before the first runtime phase", async () => {
  const b = await bridge("new-change-session");
  await b.command("change", "new feature");
  assert.equal(await b.call("write", { path: ".foundation/drafts/pi-v5/change.json", content: "{}" }), undefined);
  assert.equal((await b.call("write", { path: "src/main.js", content: "bad" })).block, true);
});

test("a new Pi investigation stays read-only after an earlier Build", async () => {
  const b = await bridge();
  const workspace = building();
  await b.command("investigate", "explain the failure");
  const result = await b.call("write", { path: join(workspace, "src/main.js"), content: "bad" });
  assert.equal(result.block, true);
  assert.match(result.reason, /investigate/);
});

test("Pi secret reads are redacted and unsupported grep rewrites are blocked", async () => {
  const b = await bridge();
  writeFileSync(join(root, ".env"), "API_KEY=not-a-real-secret\n");
  const input = { path: ".env" };
  assert.equal(await b.call("read", input), undefined);
  assert.notEqual(input.path, ".env");
  const redacted = readFileSync(input.path, "utf8");
  assert.match(redacted, /redacted/);
  assert.doesNotMatch(redacted, /not-a-real-secret/);
  const safeSearch = { pattern: "API_KEY", path: "." };
  assert.equal(await b.call("grep", safeSearch), undefined);
  assert.match(safeSearch.glob, /^!\{/);
  const grep = await b.call("grep", { pattern: "API_KEY", path: ".", glob: ".env*" });
  assert.equal(grep.block, true);
});

test("Land is exact-change, session-local authority and is revoked by user input or reload", async () => {
  const b = await bridge();
  const invoke = (id = "pi-case") => b.call("bash", { command: `claude-foundation advance '${id}' --through 'archived'` });
  assert.equal((await invoke()).block, true);
  await b.command("build", "pi-case");
  assert.equal((await invoke()).block, true);
  await b.command("land", "pi-case");
  assert.equal(await invoke(), undefined);
  assert.equal((await invoke("other-change")).block, true);
  assert.equal((await b.call("bash", { command: "claude-foundation advance pi-case --through archived; claude-foundation advance other-change --through archived" })).block, true);
  await b.fire("input", { source: "interactive", text: "next task" });
  assert.equal((await invoke()).block, true);
  await b.command("land", "pi-case");
  await b.fire("session_start", { reason: "reload" });
  assert.equal((await invoke()).block, true);
});

test("Pi refuses dynamic Land arguments and direct archive without explicit Land", async () => {
  const b = await bridge();
  for (const command of ["claude-foundation advance $CHANGE --through archived",
    "node .claude/harness/foundation.mjs archive pi-case", "claude-foundation land resume pi-case",
    "rtk node .claude/harness/foundation.mjs land-advance pi-case",
    "rtk claude-foundation sandbox apply pi-case"])
    assert.equal((await b.call("bash", { command })).block, true, command);
  await b.command("land", "pi-case; touch bad");
  assert.equal(b.messages.length, 0);
});

test("Deliver primitive requires the matching explicit Pi command", async () => {
  const b = await bridge();
  const call = (id) => b.call("bash", { command: `claude-foundation deliver advance ${id}` });
  assert.equal((await call("pi-case")).block, true);
  assert.equal((await b.call("bash", { command: "rtk claude-foundation deliver advance pi-case" })).block, true);
  assert.equal((await b.call("bash", { command: "node .claude/harness/foundation.mjs delivery-advance pi-case" })).block, true);
  await b.command("deliver", "pi-case");
  assert.equal(await call("pi-case"), undefined);
  assert.equal((await call("other-change")).block, true);
});

test("native bash gets live Pi identity without inheriting other hosts or phase overrides", async () => {
  const b = await bridge();
  await b.command("build", "pi-case");
  const result = await b.bash().execute("t", { command: "true" }, undefined, undefined, b.ctx);
  assert.equal(result.cwd, root);
  assert.equal(result.env.FOUNDATION_SESSION_ID, "pi-test");
  assert.equal(result.env.FOUNDATION_MODEL_ID, "test-model");
  assert.equal(result.env.FOUNDATION_HOST_COMMAND, "build");
  assert.equal(result.env.FOUNDATION_CLAUDE_SESSION_ID, undefined);
  assert.equal(result.env.CODEX_THREAD_ID, undefined);
  b.ctx.model = { provider: "openai", id: "another-model" };
  const next = await b.bash().execute("t", { command: "true" }, undefined, undefined, b.ctx);
  assert.equal(next.env.FOUNDATION_MAIN_PROVIDER_FAMILY, "openai");
  assert.equal(next.env.FOUNDATION_MODEL_ID, "another-model");
});

test("!/!! use the same guards, session environment, and native shell backend", async () => {
  const b = await bridge();
  const denied = await b.fire("user_bash", { command: "claude-foundation advance pi-case --through archived", cwd: root });
  assert.equal(denied.result.exitCode, 1);
  const result = await b.fire("user_bash", { command: "pwd", cwd: root, excludeFromContext: true });
  await result.operations.exec("ignored", root, {});
  assert.match(b.shell().command, /export FOUNDATION_SESSION_ID='pi-test'/);
  assert.match(b.shell().command, /unset FOUNDATION_CLAUDE_SESSION_ID/);
  assert.match(b.shell().command, /\npwd$/);
});

test("failed startup and missing guards fail closed for built-in tools", async () => {
  const b = await bridge();
  const script = join(root, ".claude/hooks/protect-secrets.sh");
  const original = readFileSync(script, "utf8");
  try {
    writeFileSync(script, "#!/bin/sh\nexit 1\n");
    assert.equal((await b.call("read", { path: "README.md" })).block, true);
    writeFileSync(script, "#!/bin/sh\nprintf 'invalid json'\n");
    assert.equal((await b.call("read", { path: "README.md" })).block, true);
    rmSync(script);
    await b.fire("session_start", { reason: "reload" });
    assert.match(b.statuses.at(-1), /unavailable/);
    assert.equal((await b.call("read", { path: "README.md" })).block, true);
  } finally { writeFileSync(script, original); }
});

test("post-edit lint errors reach Pi as failed tool results", async () => {
  const b = await bridge();
  const workspace = building();
  const script = join(root, ".claude/hooks/lint.sh");
  const original = readFileSync(script, "utf8");
  try {
    writeFileSync(script, "#!/bin/sh\nprintf 'lint diagnostics' >&2\nexit 2\n");
    await b.call("write", { path: join(workspace, "x.js"), content: "x" }, "lint-call");
    const result = await b.fire("tool_result", { toolName: "write", toolCallId: "lint-call", content: [{ type: "text", text: "written" }] });
    assert.equal(result.isError, true);
    assert.equal(result.content.at(-1).text, "lint diagnostics");
    assert.equal(await b.fire("tool_result", { toolName: "write", toolCallId: "lint-call", content: [] }), undefined);
  } finally { writeFileSync(script, original); }
});

test("Pi status reflects runtime actions without claiming proof from a successful tool call", async () => {
  const b = await bridge();
  await b.fire("tool_result", { toolName: "bash", content: [{ type: "text", text: JSON.stringify({ changeId: "pi-case", phase: "build", action: "ASK_USER" }) }] });
  assert.match(b.statuses.at(-1), /pi-case · build · ASK_USER/);
  await b.fire("tool_result", { toolName: "bash", content: [{ type: "text", text: "test passed" }] });
  assert.match(b.statuses.at(-1), /ASK_USER/);
});
