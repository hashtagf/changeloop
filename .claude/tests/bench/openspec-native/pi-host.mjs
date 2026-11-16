#!/usr/bin/env node
// Claude-CLI-compatible Pi host for the scenario lab (`run.mjs --claude-bin`).
// It accepts the arguments run.mjs passes to `claude -p`, drives Pi in RPC mode
// (JSON print mode exits before an extension command's turn runs), and writes
// the Claude stream-json rows the runner already measures. Repository-only.
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const TOOL_NAMES = Object.freeze({ bash: "Bash", read: "Read", edit: "Edit", write: "Write",
  grep: "Grep", find: "Glob", ls: "LS" });
// Ignored: Pi has no settings sources, MCP strictness flag or permission prompts.
const IGNORED_WITH_VALUE = new Set(["--output-format", "--setting-sources", "--permission-mode"]);
const IGNORED_FLAGS = new Set(["--verbose", "--strict-mcp-config"]);
const STRIPPED_ENV = /^(?:FOUNDATION_|PI_TEAM_|ORCA_)|^(?:CLAUDE_FOUNDATION_PROJECT|CLAUDE_PROJECT_DIR)$/;

export function parseClaudeArgs(argv) {
  const parsed = { prompt: null, model: null, maxBudgetUsd: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const next = () => {
      if (index + 1 >= argv.length) throw new Error(`${value} requires a value`);
      return argv[++index];
    };
    if (value === "-p" || value === "--print") parsed.prompt = next();
    else if (value === "--model") parsed.model = next();
    else if (value === "--max-budget-usd") parsed.maxBudgetUsd = Number(next());
    else if (value === "--allowedTools" || value === "--allowed-tools")
      while (index + 1 < argv.length && !argv[index + 1].startsWith("--")) index += 1;
    else if (IGNORED_WITH_VALUE.has(value)) next();
    else if (!IGNORED_FLAGS.has(value)) throw new Error(`unsupported host argument: ${value}`);
  }
  if (!parsed.prompt) throw new Error("-p <prompt> is required");
  if (parsed.maxBudgetUsd !== null && !(parsed.maxBudgetUsd > 0)) throw new Error("--max-budget-usd must be positive");
  return parsed;
}

export function defaultPiCli(home = homedir()) {
  const install = join(home, ".pi/agent/install");
  const version = readFileSync(join(install, "current-version"), "utf8").trim();
  return join(install, "releases", version, "node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js");
}

// A temporary agent directory with only the selected credential: no user
// extensions, skills, context files, settings or other accounts reach the lab.
// The credential is copied, never written back, so a run must not refresh it.
export function isolatedAgentDir({ authSource, provider, minLifetimeMs, now = Date.now(), parent = tmpdir() }) {
  const credentials = JSON.parse(readFileSync(authSource, "utf8"));
  const credential = credentials[provider];
  if (!credential) throw new Error(`no stored credential for provider ${provider}`);
  if (Number.isFinite(credential.expires) && credential.expires - now < minLifetimeMs)
    throw new Error(`credential for ${provider} expires in ${Math.round((credential.expires - now) / 60000)} min; ` +
      `the run needs ${Math.round(minLifetimeMs / 60000)} min. Refresh it in the operator's Pi first.`);
  const dir = mkdtempSync(join(parent, "pi-bench-agent-"));
  writeFileSync(join(dir, "auth.json"), JSON.stringify({ [provider]: credential }), { mode: 0o600 });
  writeFileSync(join(dir, "settings.json"), JSON.stringify({ defaultProvider: provider }));
  return dir;
}

export function piEnvironment(base, agentDir) {
  const env = Object.fromEntries(Object.entries(base).filter(([key]) => !STRIPPED_ENV.test(key)));
  return { ...env, PI_CODING_AGENT_DIR: agentDir, PI_SKIP_VERSION_CHECK: "1" };
}

function toolInput(name, args = {}) {
  if (["read", "edit", "write"].includes(name) && args.path !== undefined) {
    const { path, ...rest } = args;
    return { file_path: path, ...rest };
  }
  return args;
}

const text = (content) => Array.isArray(content)
  ? content.map((part) => part?.type === "text" ? part.text : "").join("\n") : String(content ?? "");

// Pure Pi-event → Claude-row translator; `finish` builds the result envelope.
export function createTranslator({ sessionId, model, cwd, startedMs = Date.now() }) {
  let messages = 0, turns = 0, cost = 0, priced = false, lastText = "";
  const usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
  const modelUsage = {};
  return {
    init: () => ({ type: "system", subtype: "init", session_id: sessionId, model, cwd, host: "pi" }),
    translate(event) {
      if (event?.type === "turn_end") { turns += 1; return []; }
      if (event?.type === "tool_execution_end") return [{ type: "user", session_id: sessionId,
        message: { role: "user", content: [{ type: "tool_result", tool_use_id: event.toolCallId,
          content: text(event.result?.content), is_error: event.isError === true }] } }];
      if (event?.type !== "message_end" || event.message?.role !== "assistant") return [];
      const message = event.message;
      messages += 1;
      const content = (message.content || []).flatMap((part) => part?.type === "text"
        ? [{ type: "text", text: part.text }]
        : part?.type === "toolCall" ? [{ type: "tool_use", id: part.id,
          name: TOOL_NAMES[part.name] || part.name, input: toolInput(part.name, part.arguments) }] : []);
      const rowUsage = { input_tokens: message.usage?.input || 0, output_tokens: message.usage?.output || 0,
        cache_read_input_tokens: message.usage?.cacheRead || 0,
        cache_creation_input_tokens: message.usage?.cacheWrite || 0 };
      for (const key of Object.keys(usage)) usage[key] += rowUsage[key];
      const total = message.usage?.cost?.total;
      if (Number.isFinite(total)) {
        cost += total;
        if (total > 0) priced = true;
        const entry = modelUsage[message.model] ||= { costUSD: 0 };
        entry.costUSD += total;
      }
      const said = content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
      if (said) lastText = said;
      return [{ type: "assistant", session_id: sessionId,
        message: { id: `pi-${sessionId}-${messages}`, model: message.model, role: "assistant",
          content, usage: rowUsage, stop_reason: message.stopReason ?? null } }];
    },
    cost: () => priced ? cost : null,
    finish: (subtype, extra = {}) => ({ type: "result", subtype,
      is_error: !["success", "terminated"].includes(subtype), host: "pi", session_id: sessionId,
      duration_ms: Date.now() - startedMs, num_turns: turns, total_cost_usd: priced ? cost : null,
      usage, modelUsage, model, result: lastText, ...extra })
  };
}

export async function main({ argv = process.argv.slice(2), env = process.env, cwd = process.cwd(),
  stdout = process.stdout, signals = process } = {}) {
  const write = (row) => stdout.write(`${JSON.stringify(row)}\n`);
  let parsed, agentDir;
  const provider = env.PI_BENCH_PROVIDER || "claude-subscription";
  try {
    parsed = parseClaudeArgs(argv);
    agentDir = isolatedAgentDir({ authSource: env.PI_BENCH_AUTH_SOURCE || join(homedir(), ".pi/agent/auth.json"),
      provider, minLifetimeMs: Number(env.PI_BENCH_MIN_CREDENTIAL_MS || 45 * 60 * 1000) });
  } catch (error) {
    write({ type: "result", subtype: "error_during_execution", is_error: true, host: "pi",
      total_cost_usd: null, result: error.message });
    return 2;
  }
  const sessionId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const translator = createTranslator({ sessionId, model: parsed.model, cwd });
  const piArgs = [env.PI_BENCH_PI_CLI || defaultPiCli(), "--mode", "rpc", "--approve", "--no-session",
    "--provider", provider, ...(parsed.model ? ["--model", parsed.model] : []),
    ...(env.PI_BENCH_THINKING ? ["--thinking", env.PI_BENCH_THINKING] : []),
    ...String(env.PI_BENCH_EXTENSIONS || "").split(":").filter(Boolean).flatMap((path) => ["-e", path])];
  write(translator.init());
  const child = spawn(process.execPath, piArgs, { cwd, env: piEnvironment(env, agentDir),
    stdio: ["pipe", "pipe", "inherit"] });
  return await new Promise((resolveRun) => {
    let buffer = "", started = false, finished = false;
    const finish = (subtype, code, extra) => {
      if (finished) return;
      finished = true;
      write(translator.finish(subtype, extra));
      if (child.exitCode === null) child.kill("SIGTERM");
      rmSync(agentDir, { recursive: true, force: true });
      resolveRun(code);
    };
    const send = (command) => { if (child.stdin.writable) child.stdin.write(`${JSON.stringify(command)}\n`); };
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      for (let index = buffer.indexOf("\n"); index >= 0; index = buffer.indexOf("\n")) {
        const line = buffer.slice(0, index).replace(/\r$/, "");
        buffer = buffer.slice(index + 1);
        let event;
        try { event = JSON.parse(line); } catch { continue; }
        if (event.type === "response" && event.command === "prompt" && event.success === false)
          return finish("error_during_execution", 1, { error: event.error || "prompt rejected" });
        if (event.type === "extension_ui_request" && ["select", "confirm", "input", "editor"].includes(event.method))
          send({ type: "extension_ui_response", id: event.id, cancelled: true });
        for (const row of translator.translate(event)) write(row);
        if (event.type === "agent_start") started = true;
        const spent = translator.cost();
        if (parsed.maxBudgetUsd !== null && spent !== null && spent >= parsed.maxBudgetUsd) {
          send({ type: "abort" });
          return finish("error_max_budget_usd", 1);
        }
        if (event.type === "agent_settled" && started) return finish(event.aborted ? "error_during_execution" : "success",
          event.aborted ? 1 : 0);
      }
    });
    child.on("error", (error) => finish("error_during_execution", 127, { error: error.message }));
    // The runner stops the whole process group, so Pi may close just before
    // this process handles its own SIGTERM; let the signal win that race.
    child.on("close", (code) => setTimeout(() => finish("error_during_execution", code || 1,
      { error: `pi exited (${code}) before the turn settled` }), 250));
    for (const signal of ["SIGTERM", "SIGINT"])
      signals.once?.(signal, () => finish("terminated", 143, { terminatedBy: signal }));
    send({ id: "bench-prompt", type: "prompt", message: parsed.prompt });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  main().then((code) => { process.exitCode = code; });
