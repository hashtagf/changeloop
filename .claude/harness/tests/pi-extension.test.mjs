import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import install from "../adapters/pi-extension.mjs";
import { HOST_COMMANDS } from "../runtime/core/host-instruction.mjs";
import { deliverRequest, investigateRequest, isLandConsent } from "../runtime/core/pi-land-context.mjs";

const source = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const temp = realpathSync(mkdtempSync(join(tmpdir(), "pi-adapter-")));
const root = join(temp, "project with spaces");
const update = process.env.FOUNDATION_UPDATE_CHECK;
process.env.FOUNDATION_UPDATE_CHECK = "0";
const hostGuardrailMode = process.env.FOUNDATION_GUARDRAIL_MODE;
delete process.env.FOUNDATION_GUARDRAIL_MODE;
// The suite may itself run inside a Pi session's Change Loop shell; its project
// pin and session identity must not leak into the disposable consumer.
const hostEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
  !/^(?:CLAUDE_FOUNDATION_PROJECT|CLAUDE_PROJECT_DIR|FOUNDATION_(?:SESSION_ID|HOST|HOST_COMMAND|HOST_ARGUMENTS|MAIN_IDENTITY|GUARDRAIL_MODE|PARENT_SESSION_ID|WORKSPACE_ROOT|ACTIVE_PHASE))$/.test(key)));
const run = (args) => spawnSync("bash", [join(source, "cli.sh"), ...args], {
  cwd: source, encoding: "utf8", timeout: 60000,
  env: { ...hostEnv, FOUNDATION_UPDATE_CHECK: "0" }
});
before(() => {
  const result = run(["init", root, "--host", "pi", "--yes"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
after(() => {
  rmSync(temp, { recursive: true, force: true });
  if (update === undefined) delete process.env.FOUNDATION_UPDATE_CHECK;
  else process.env.FOUNDATION_UPDATE_CHECK = update;
  if (hostGuardrailMode !== undefined) process.env.FOUNDATION_GUARDRAIL_MODE = hostGuardrailMode;
});

// FOUNDATION_GUARDRAIL_MODE=block restores the refusals; the default advises.
function strict(t) {
  const previous = process.env.FOUNDATION_GUARDRAIL_MODE;
  process.env.FOUNDATION_GUARDRAIL_MODE = "block";
  t.after(() => {
    if (previous === undefined) delete process.env.FOUNDATION_GUARDRAIL_MODE;
    else process.env.FOUNDATION_GUARDRAIL_MODE = previous;
  });
}

async function bridge(session = "pi-test", { parent = "" } = {}) {
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
    parentSessionId: parent,
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
  assert.match(result.systemPrompt, /during Build every bash call starts in the change workspace/);
  assert.match(result.systemPrompt, /never cd to the project root to write files/);
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

test("block mode: Pi guards refuse main-checkout and symlink writes but permit sandbox writes", async (t) => {
  strict(t);
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

test("block mode: a Pi worker inherits its parent's Build workspace and nothing more", async (t) => {
  strict(t);
  const workspace = building("coordinator", "pi-worker-case");
  const worker = await bridge("worker-session", { parent: "coordinator" });
  assert.equal(await worker.call("write", { path: join(workspace, "src/worker.js"), content: "ok" }), undefined);
  assert.equal((await worker.call("write", { path: "src/main.js", content: "bad" })).block, true);
  const stranger = await bridge("worker-session");
  const refused = await stranger.call("write", { path: join(workspace, "src/worker.js"), content: "bad" });
  assert.equal(refused.block, true);
  assert.match(refused.reason, /phase guard/);
});

test("block mode: a Pi worker never lands or delivers, even for its parent's ready change", async (t) => {
  strict(t);
  readyForLand("coordinator", "pi-worker-ready");
  const worker = await bridge("worker-session", { parent: "coordinator" });
  await worker.command("land", "pi-worker-ready");
  await worker.command("land");
  await worker.command("deliver", "pi-worker-ready");
  assert.equal(worker.messages.length, 0);
  assert.deepEqual(await worker.fire("input", { source: "interactive", text: "land ได้เลย" }), { action: "handled" });
  assert.equal(worker.messages.length, 0);
  assert.equal((await worker.call("bash", { command: "cloop advance pi-worker-ready --through archived" })).block, true);
  assert.equal((await worker.call("bash", { command: "cloop deliver advance pi-worker-ready" })).block, true);
  assert.ok(worker.notices.some((notice) => /worker/.test(notice.text)));
});

test("Build shell calls start in the change workspace; other phases and user shell keep the session cwd", async () => {
  const workspace = building("cwd-session", "pi-cwd-case");
  const b = await bridge("cwd-session");
  const result = await b.bash().execute("t", { command: "mkdir -p src && echo built > src/relative.js" },
    undefined, undefined, b.ctx);
  assert.equal(result.cwd, workspace);
  const ran = spawnSync("bash", ["-c", result.command], { cwd: result.cwd, encoding: "utf8" });
  assert.equal(ran.status, 0, ran.stderr);
  assert.equal(readFileSync(join(workspace, "src/relative.js"), "utf8"), "built\n");
  assert.equal(existsSync(join(root, "src/relative.js")), false);
  const worker = await bridge("cwd-worker", { parent: "cwd-session" });
  assert.equal((await worker.bash().execute("t", { command: "true" }, undefined, undefined, worker.ctx)).cwd, workspace);
  const idle = await bridge("no-build-session");
  assert.equal((await idle.bash().execute("t", { command: "true" }, undefined, undefined, idle.ctx)).cwd, root);
  await b.command("investigate", "why");
  assert.equal((await b.bash().execute("t", { command: "true" }, undefined, undefined, b.ctx)).cwd, root);
});

test("the guard's shell-mutation warning reaches the agent in the tool result", async () => {
  building("note-session", "pi-note-case");
  const b = await bridge("note-session");
  const command = `cd '${root}' && echo bad > src/outside.js`;
  assert.equal(await b.call("bash", { command }, "note-1"), undefined);
  const result = await b.fire("tool_result", { toolName: "bash", toolCallId: "note-1", isError: false,
    content: [{ type: "text", text: "ran" }] });
  assert.equal(result.content[0].text, "ran");
  assert.match(result.content.at(-1).text, /unverified shell mutation/);
  const quiet = await b.fire("tool_result", { toolName: "bash", toolCallId: "note-1", isError: false,
    content: [{ type: "text", text: "again" }] });
  assert.equal(quiet, undefined);
});

test("block mode: Pi guards allow semantic draft v5 before the first runtime phase", async (t) => {
  strict(t);
  const b = await bridge("new-change-session");
  await b.command("change", "new feature");
  assert.equal(await b.call("write", { path: ".foundation/drafts/pi-v5/change.json", content: "{}" }), undefined);
  assert.equal((await b.call("write", { path: "src/main.js", content: "bad" })).block, true);
});

test("block mode: a new Pi investigation stays read-only after an earlier Build", async (t) => {
  strict(t);
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

test("block mode: Land is exact-change, session-local authority and is revoked by user input or reload", async (t) => {
  strict(t);
  const b = await bridge();
  const invoke = (id = "pi-case") => b.call("bash", { command: `cloop advance '${id}' --through 'archived'` });
  assert.equal((await invoke()).block, true);
  await b.command("build", "pi-case");
  assert.equal((await invoke()).block, true);
  await b.command("land", "pi-case");
  assert.equal(await invoke(), undefined);
  assert.equal((await invoke("other-change")).block, true);
  assert.equal((await b.call("bash", { command: "cloop advance pi-case --through archived; cloop advance other-change --through archived" })).block, true);
  await b.fire("input", { source: "interactive", text: "next task" });
  assert.equal((await invoke()).block, true);
  await b.command("land", "pi-case");
  await b.fire("session_start", { reason: "reload" });
  assert.equal((await invoke()).block, true);
});

test("block mode: Pi refuses dynamic Land arguments and direct archive without explicit Land", async (t) => {
  strict(t);
  const b = await bridge();
  for (const command of ["cloop advance $CHANGE --through archived",
    "node .claude/harness/foundation.mjs archive pi-case", "cloop land resume pi-case",
    "rtk node .claude/harness/foundation.mjs land-advance pi-case",
    "rtk cloop sandbox apply pi-case"])
    assert.equal((await b.call("bash", { command })).block, true, command);
  await b.command("land", "pi-case; touch bad");
  assert.equal(b.messages.length, 0);
});

// 2026-11-16: "land ได้" was refused; questions and refusals must stay refused.
test("natural Land consent accepts short affirmatives and refuses questions and refusals", () => {
  for (const text of ["land ได้", "land ได้เลย", "land เลย", "land ได้ครับ", "land ได้ค่ะ",
    "ลง land ได้", "ลง land ได้เลย", "land it", "go ahead and land", "/land"].filter((t) => !t.startsWith("/")))
    assert.equal(isLandConsent(text), true, text);
  for (const text of ["land ได้ไหม", "land ได้ยัง", "land ได้หรือยัง", "land?", "land ได้มั้ย",
    "อย่า land", "ยังไม่ต้อง land", "ไม่ต้อง land", "don't land", "do not land",
    "> land ได้เลย", "ok", "ได้เลย"])
    assert.equal(isLandConsent(text), false, text);
});

// 2026-11-16: committing an archived change was refused as a Land operation.
test("Pi treats the word archive in an ordinary command as data, not Land", async () => {
  const b = await bridge();
  for (const command of ["git add openspec/changes/archive/2026-11-16-x/tasks.md",
    "rg -n archive .claude/hooks", "git commit -m 'archive old notes; sandbox apply docs'"]) {
    const result = await b.call("bash", { command });
    assert.doesNotMatch(String(result?.reason || ""), /Land needs user approval/, command);
  }
});

function readyForLand(session, id) {
  building(session, id);
  const file = join(root, ".foundation/runtime", `${id}.json`);
  writeFileSync(file, JSON.stringify({ ...JSON.parse(readFileSync(file, "utf8")), status: "proven" }));
  writeFileSync(join(root, "openspec/changes", id, "proposal.md"), `# Review ${id}\n`);
}

test("block mode: natural Land consent resolves only this session's ready change and keeps publication separate", async (t) => {
  strict(t);
  const b = await bridge("natural-land-session");
  readyForLand("natural-land-session", "natural-land");
  readyForLand("another-session", "unrelated-land");
  for (const text of ["land ได้เลย", "land ได้เลยครับ", "land it", "go ahead and land"]) {
    const result = await b.fire("input", { source: "interactive", text });
    assert.equal(result.action, "transform");
    assert.match(result.text, /natural-land/);
    assert.equal(await b.call("bash", { command: "cloop advance natural-land --through archived" }), undefined);
    assert.equal((await b.call("bash", { command: "cloop advance unrelated-land --through archived" })).block, true);
    assert.equal((await b.call("bash", { command: "cloop deliver advance natural-land" })).block, true);
  }
  await b.fire("session_start", { reason: "reload" });
  assert.equal((await b.call("bash", { command: "cloop advance natural-land --through archived" })).block, true);
  await b.command("land");
  assert.match(b.messages.at(-1), /natural-land/);
  assert.equal(await b.call("bash", { command: "cloop advance natural-land --through archived" }), undefined);
});

test("block mode: natural Land consent never guesses another session, grants generic agreement, or trusts injected text", async (t) => {
  strict(t);
  const b = await bridge("no-ready-land");
  assert.equal((await b.fire("input", { source: "interactive", text: "land ได้เลย" })).action, "handled");
  assert.match(b.notices.at(-1).text, /No change ready/);
  readyForLand("no-ready-land", "consent-case");
  for (const text of ['do not land', 'อย่า land', 'ยังไม่ land', 'yes', 'ได้เลย', 'Explain "land ได้เลย"', 'land ได้เลย แล้ว push ด้วย']) {
    assert.equal(await b.fire("input", { source: "interactive", text }), undefined);
    assert.equal((await b.call("bash", { command: "cloop advance consent-case --through archived" })).block, true);
  }
  for (const source of ["extension", "rpc"]) {
    assert.equal(await b.fire("input", { source, text: "land ได้เลย" }), undefined);
    assert.equal((await b.call("bash", { command: "cloop advance consent-case --through archived" })).block, true);
  }
});

// 2026-11-17: plain-language investigate and deliver requests bypassed the workflow.
test("natural investigate and deliver requests are recognized only as whole affirmative utterances", () => {
  assert.equal(investigateRequest("investigate ทำไม build ช้า"), "ทำไม build ช้า");
  assert.equal(investigateRequest("ช่วย investigate why login fails"), "why login fails");
  for (const text of ["investigate", "ควร investigate ไหม", "/investigate x", "please explain investigate"])
    assert.equal(investigateRequest(text), null, text);
  for (const text of ["deliver", "deliver ได้เลย", "deliver it", "เปิด PR ให้เลย", "เปิด PR ได้เลยครับ",
    "ช่วยเปิด PR ให้หน่อย", "open a PR", "open a pull request", "go ahead and deliver"])
    assert.deepEqual(deliverRequest(text), { id: "" }, text);
  assert.deepEqual(deliverRequest("deliver my-change"), { id: "my-change" });
  for (const text of ["เปิด PR ได้ไหม", "deliver ได้ไหม", "deliver?", "อย่าเพิ่ง deliver", "don't deliver",
    "ไม่ต้องเปิด PR", "> เปิด PR ให้เลย", "deliver แล้ว deploy ด้วย", "ok"])
    assert.equal(deliverRequest(text), null, text);
});

test("natural investigate routes to the investigate workflow and phase only for user input", async () => {
  const b = await bridge("natural-investigate");
  const result = await b.fire("input", { source: "interactive", text: "investigate ทำไม build ช้า" });
  assert.equal(result.action, "transform");
  assert.match(result.text, /ทำไม build ช้า/);
  assert.match(result.text, /investigate/i);
  for (const text of ["investigate", "ควร investigate ไหม"])
    assert.equal(await b.fire("input", { source: "interactive", text }), undefined, text);
  for (const source of ["extension", "rpc"])
    assert.equal(await b.fire("input", { source, text: "investigate ทำไม build ช้า" }), undefined, source);
});

function delivered(session, id) {
  readyForLand(session, id);
  const file = join(root, ".foundation/runtime", `${id}.json`);
  writeFileSync(file, JSON.stringify({ ...JSON.parse(readFileSync(file, "utf8")), status: "archived" }));
}

test("block mode: natural Deliver request resolves this session's change and grants only that publication", async (t) => {
  strict(t);
  const b = await bridge("natural-deliver");
  delivered("natural-deliver", "deliver-case");
  delivered("another-deliver", "deliver-other");
  for (const text of ["เปิด PR ให้เลย", "deliver ได้เลย", "open a PR"]) {
    const result = await b.fire("input", { source: "interactive", text });
    assert.equal(result.action, "transform", text);
    assert.match(result.text, /deliver-case/);
    assert.equal(await b.call("bash", { command: "cloop deliver advance deliver-case" }), undefined);
    assert.equal((await b.call("bash", { command: "cloop deliver advance deliver-other" })).block, true);
    assert.equal((await b.call("bash", { command: "cloop advance deliver-case --through archived" })).block, true);
  }
  for (const text of ["เปิด PR ได้ไหม", "อย่าเพิ่ง deliver"]) {
    assert.equal(await b.fire("input", { source: "interactive", text }), undefined, text);
    assert.equal((await b.call("bash", { command: "cloop deliver advance deliver-case" })).block, true);
  }
  for (const source of ["extension", "rpc"]) {
    assert.equal(await b.fire("input", { source, text: "เปิด PR ให้เลย" }), undefined);
    assert.equal((await b.call("bash", { command: "cloop deliver advance deliver-case" })).block, true);
  }
  await b.command("deliver");
  assert.match(b.messages.at(-1), /deliver-case/);
  assert.equal(await b.call("bash", { command: "cloop deliver advance deliver-case" }), undefined);
});

test("block mode: natural Deliver without a ready change or in a worker grants nothing", async (t) => {
  strict(t);
  const b = await bridge("no-deliver");
  assert.equal((await b.fire("input", { source: "interactive", text: "deliver ได้เลย" })).action, "handled");
  assert.match(b.notices.at(-1).text, /No change ready for Deliver/);
  delivered("worker-parent", "worker-deliver");
  const w = await bridge("worker-child", { parent: "worker-parent" });
  assert.equal((await w.fire("input", { source: "interactive", text: "เปิด PR ให้เลย" })).action, "handled");
  assert.match(w.notices.at(-1).text, /worker/);
  assert.equal((await w.call("bash", { command: "cloop deliver advance worker-deliver" })).block, true);
});

test("block mode: multiple session Land candidates require selection and cancellation grants nothing", async (t) => {
  strict(t);
  const b = await bridge("multiple-land");
  readyForLand("multiple-land", "land-first"); readyForLand("multiple-land", "land-second");
  b.ctx.ui.select = async (_title, options) => {
    assert.equal(options.length, 2); assert.match(options[0], /Review/); return undefined;
  };
  assert.equal((await b.fire("input", { source: "interactive", text: "land ได้เลย" })).action, "handled");
  assert.equal((await b.call("bash", { command: "cloop advance land-first --through archived" })).block, true);
  b.ctx.ui.select = async (_title, options) => options.find(option => option.includes('land-second'));
  await b.command("land");
  assert.equal(await b.call("bash", { command: "cloop advance land-second --through archived" }), undefined);
  assert.equal((await b.call("bash", { command: "cloop advance land-first --through archived" })).block, true);
});

test("block mode: Deliver primitive requires the matching explicit Pi command", async (t) => {
  strict(t);
  const b = await bridge();
  const call = (id) => b.call("bash", { command: `cloop deliver advance ${id}` });
  assert.equal((await call("pi-case")).block, true);
  assert.equal((await b.call("bash", { command: "rtk cloop deliver advance pi-case" })).block, true);
  assert.equal((await b.call("bash", { command: "node .claude/harness/foundation.mjs delivery-advance pi-case" })).block, true);
  await b.command("deliver", "pi-case");
  assert.equal(await call("pi-case"), undefined);
  assert.equal((await call("other-change")).block, true);
});

test("native bash gets live Pi identity without inheriting other hosts or phase overrides", async () => {
  const b = await bridge();
  const workspace = building();
  await b.command("build", "pi-case");
  const result = await b.bash().execute("t", { command: "true" }, undefined, undefined, b.ctx);
  assert.equal(result.cwd, workspace);
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

test("block mode: !/!! use the same guards, session environment, and native shell backend", async (t) => {
  strict(t);
  const b = await bridge();
  const denied = await b.fire("user_bash", { command: "cloop advance pi-case --through archived", cwd: root });
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

test("block mode: background_bash gets the bash secret, Land and authority guards", async (t) => {
  strict(t);
  // A session outside Build, so the command runs in the project root beside .env.
  const b = await bridge("bg-secret-session");
  writeFileSync(join(root, ".env"), "API_KEY=not-a-real-secret\n");
  const secret = { command: "cat .env" };
  assert.equal(await b.call("background_bash", secret), undefined);
  assert.match(secret.command, /redacted/);
  assert.doesNotMatch(secret.command, /^cat \.env$/);
  const land = await b.call("background_bash", { command: "cloop advance pi-case --through archived" });
  assert.equal(land.block, true);
  assert.match(land.reason, /BLOCKED: Land applies/);
  const authority = await b.call("background_bash", { command: "cloop authority run pi-case" });
  assert.equal(authority.block, true);
  assert.match(authority.reason, /foreground/);
});

test("background_bash starts in the Build workspace and reports outside writes", async () => {
  const workspace = building("bg-session", "pi-bg-case");
  const b = await bridge("bg-session");
  const input = { command: "echo hi" };
  assert.equal(await b.call("background_bash", input), undefined);
  assert.equal(input.cwd, workspace);
  const outside = { command: `cd '${root}' && echo bad > src/outside.js` };
  const result = await b.call("background_bash", outside, "bg-outside");
  if (result?.block) assert.match(result.reason, /phase|workspace|Build/i);
  else {
    const noted = await b.fire("tool_result", { toolName: "background_bash", toolCallId: "bg-outside", isError: false,
      content: [{ type: "text", text: "job started" }] });
    assert.match(noted.content.at(-1).text, /unverified shell mutation/);
  }
});

test("background_bash fails closed when guards are unavailable", async () => {
  const b = await bridge();
  const script = join(root, ".claude/hooks/protect-secrets.sh");
  const original = readFileSync(script, "utf8");
  try {
    rmSync(script);
    await b.fire("session_start", { reason: "reload" });
    const result = await b.call("background_bash", { command: "echo hi" });
    assert.equal(result.block, true);
    assert.match(result.reason, /guards unavailable/);
  } finally { writeFileSync(script, original); }
});

test("block mode: detached authority runs are refused in bash; attached ones pass that guard", async (t) => {
  strict(t);
  const b = await bridge();
  const detached = await b.call("bash", { command: "cloop authority run demo &" });
  assert.equal(detached.block, true);
  assert.match(detached.reason, /foreground/);
  assert.equal(await b.call("bash", { command: "cloop authority run demo --help" }), undefined);
});

test("unguarded tools are warned once per session during a change and never blocked", async () => {
  building("warn-session", "pi-warn-case");
  const b = await bridge("warn-session");
  const result = (id) => b.fire("tool_result", { toolName: "exa_search", toolCallId: id, isError: false,
    content: [{ type: "text", text: "found" }] });
  assert.equal(await b.call("exa_search", { query: "x" }, "w1"), undefined);
  assert.match((await result("w1")).content.at(-1).text, /outside the Pi live guard boundary/);
  assert.equal(await b.call("exa_search", { query: "y" }, "w2"), undefined);
  assert.equal(await result("w2"), undefined);
  assert.equal(await b.call("task_board", { action: "list" }, "w3"), undefined);
  assert.equal(await b.fire("tool_result", { toolName: "task_board", toolCallId: "w3", content: [] }), undefined);
  const idle = await bridge("no-phase-session");
  assert.equal(await idle.call("exa_search", { query: "x" }, "w4"), undefined);
  assert.equal(await idle.fire("tool_result", { toolName: "exa_search", toolCallId: "w4", content: [] }), undefined);
});

test("the session digest reaches the first run after start and after compaction", async () => {
  building("digest-session", "pi-digest-case");
  const b = await bridge("digest-session");
  const first = await b.fire("before_agent_start", { systemPrompt: "rules" });
  assert.equal(first.message.display, false);
  assert.match(first.message.content, /pi-digest-case/);
  assert.match(first.message.content, /next:/);
  assert.equal((await b.fire("before_agent_start", { systemPrompt: "rules" })).message, undefined);
  await b.fire("session_compact");
  assert.match((await b.fire("before_agent_start", { systemPrompt: "rules" })).message.content, /pi-digest-case/);
});

test("a failing session digest never blocks the session", async () => {
  const script = join(root, ".claude/hooks/session-context.mjs");
  const original = readFileSync(script, "utf8");
  try {
    writeFileSync(script, "process.exit(3);\n");
    const b = await bridge("digest-fail-session");
    assert.match(b.statuses.at(-1), /ready/);
    assert.equal((await b.fire("before_agent_start", { systemPrompt: "rules" })).message, undefined);
  } finally { writeFileSync(script, original); }
});

test("/dev that settles before proof passes warns; plan-only and other commands do not", async () => {
  mkdirSync(join(root, "openspec/changes/pi-dev-case"), { recursive: true });
  const b = await bridge("dev-session");
  await b.command("dev", "--resume pi-dev-case");
  await b.fire("agent_settled", { aborted: false });
  const warning = b.notices.at(-1);
  assert.equal(warning?.kind, "warning");
  assert.match(warning.text, /proof-not-passing for pi-dev-case/);
  const count = b.notices.length;
  await b.command("dev", "--plan-only pi-dev-case");
  await b.fire("agent_settled", { aborted: false });
  await b.command("build", "pi-dev-case");
  await b.fire("agent_settled", { aborted: false });
  assert.equal(b.notices.length, count);
});

// 2026-11-16: guards advise instead of refuse; block mode stays opt-in.
async function noted(b, toolName, input, id) {
  assert.equal(await b.call(toolName, input, id), undefined, `${toolName} was refused`);
  const result = await b.fire("tool_result", { toolName, toolCallId: id, isError: false,
    content: [{ type: "text", text: "ran" }] });
  return result?.content?.slice(1).map((part) => part.text).join("\n") || "";
}

test("by default Land, Deliver and archive run with a warning instead of a refusal", async () => {
  const b = await bridge("advice-session");
  assert.match(await noted(b, "bash", { command: "cloop advance pi-case --through archived" }, "a1"), /WARNING: Land/);
  assert.match(await noted(b, "bash", { command: "cloop deliver advance pi-case" }, "a2"), /WARNING: Deliver/);
  const archive = { command: "node .claude/harness/foundation.mjs archive pi-case" };
  assert.match(await noted(b, "bash", archive, "a3"), /WARNING: Land/);
  assert.match(await noted(b, "background_bash", { command: "cloop advance pi-case --through archived" }, "a4"), /WARNING: Land/);
  assert.doesNotMatch(await noted(b, "bash",
    { command: "git add openspec/changes/archive/2026-11-16-x/tasks.md" }, "a5"), /Land/);
  const denied = await b.fire("user_bash", { command: "cloop advance pi-case --through archived", cwd: root });
  assert.ok(denied.operations, "the user's own shell is never refused for Land");
});

test("by default an edit with no change open runs", async () => {
  const b = await bridge("advice-no-phase");
  const input = { path: "src/advice.js", content: "x" };
  await noted(b, "write", input, "e1");
  assert.equal(input.path, "src/advice.js");
});

test("by default authority runs stay in the foreground without refusals", async () => {
  const b = await bridge("advice-authority");
  assert.match(await noted(b, "background_bash", { command: "cloop authority run demo" }, "r1"), /foreground/);
  const detached = { command: "cloop authority run demo &" };
  assert.match(await noted(b, "bash", detached, "r2"), /foreground/);
  assert.equal(detached.command, "cloop authority run demo");
});

test("by default a worker's main-checkout write moves into the parent's workspace", async () => {
  const workspace = building("advice-coordinator", "pi-advice-worker");
  const worker = await bridge("advice-worker", { parent: "advice-coordinator" });
  const input = { path: "src/main.js", content: "x" };
  assert.match(await noted(worker, "write", input, "w1"), /redirected/);
  assert.equal(input.path, join(workspace, "src/main.js"));
  await worker.command("land", "pi-advice-worker");
  assert.equal(worker.messages.length, 0, "a worker still sends no Land instruction");
  assert.match(await noted(worker, "bash", { command: "cloop advance pi-advice-worker --through archived" }, "w2"), /WARNING: Land/);
  const stranger = await bridge("advice-stranger");
  const foreign = { path: join(workspace, "src/other.js"), content: "x" };
  assert.doesNotMatch(await noted(stranger, "write", foreign, "w3"), /redirected/);
  assert.equal(foreign.path, join(workspace, "src/other.js"), "another session's phase is not used");
});

test("a user's FOUNDATION_GUARDRAIL_MODE=block is passed to the guards", async (t) => {
  strict(t);
  const b = await bridge("advice-strict");
  const refused = await b.call("write", { path: "src/strict.js", content: "x" });
  assert.equal(refused.block, true);
  assert.match(refused.reason, /phase guard/);
});

test("Pi prompt states the guarded tools without claiming full coverage", async () => {
  const b = await bridge();
  const { systemPrompt } = await b.fire("before_agent_start", { systemPrompt: "rules" });
  assert.match(systemPrompt, /Guards advise rather than refuse/);
  assert.match(systemPrompt, /built-in tools and background_bash are guarded/);
  assert.match(systemPrompt, /outside this adapter's live boundary and only warned about/);
  assert.match(systemPrompt, /Do not claim OS sandboxing/);
});
