// Pi host bridge. The installed runtime owns instructions, phase state and proof.
// This module has no Pi dependency so the host boundary is testable offline.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HOST_COMMANDS } from "../runtime/core/host-instruction.mjs";
import { normalizeHarnessCliInvocations } from "../runtime/core/shell-mutation-policy.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TOOLS = { read: "Read", grep: "Grep", write: "Write", edit: "Edit", bash: "Bash" };
const quote = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;
const ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function execute(command, args, { cwd, env, input, signal, timeout = 10000 } = {}) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, { cwd, env, signal, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "", failure;
    const timer = setTimeout(() => { failure = new Error("Change Loop host operation timed out"); child.kill("SIGKILL"); }, timeout);
    const capture = (key, chunk) => {
      if (key === "stdout") stdout += chunk; else stderr += chunk;
      if (stdout.length + stderr.length > 1024 * 1024) {
        failure = new Error("Change Loop host operation exceeded its output limit");
        child.kill("SIGKILL");
      }
    };
    child.stdout.on("data", (chunk) => capture("stdout", chunk));
    child.stderr.on("data", (chunk) => capture("stderr", chunk));
    child.stdin.on("error", () => {}); // process may refuse before reading stdin
    child.on("error", (error) => {
      clearTimeout(timer);
      if (child.pid) child.kill("SIGKILL");
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (failure) reject(failure); else done({ code, stdout, stderr });
    });
    child.stdin.end(input || "");
  });
}

export default function install(pi, { createBashTool, createLocalBashOperations, projectRoot = ROOT,
  hostExecutable = "claude-foundation", hostPrefixArgs = [] }) {
  const root = projectRoot;
  let invocation = null;
  let contract;
  let ready = false;
  const touched = new Map();

  const environment = (ctx, base = process.env) => {
    const env = { ...base, CLAUDE_PROJECT_DIR: root,
      CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_HOST: "pi",
      FOUNDATION_SESSION_ID: ctx.sessionManager.getSessionId(),
      FOUNDATION_MAIN_IDENTITY: "pi-main-session",
      FOUNDATION_GUARDRAIL_MODE: "block",
      FOUNDATION_HOST_COMMAND: invocation?.command || "",
      FOUNDATION_HOST_ARGUMENTS: invocation?.args || "" };
    // Do not inherit another coding host's session/transcript or phase override.
    for (const key of ["FOUNDATION_CLAUDE_SESSION_ID", "CLAUDE_SESSION_ID",
      "CODEX_THREAD_ID", "FOUNDATION_CLAUDE_TRANSCRIPT_PATH", "FOUNDATION_ACTIVE_PHASE",
      "FOUNDATION_WORKSPACE_ROOT", "FOUNDATION_ALLOWED_PATHS_JSON"])
      delete env[key];
    // A new read-only investigation must not inherit a previous Build phase.
    if (invocation?.command === "investigate") env.FOUNDATION_ACTIVE_PHASE = "investigate";
    if (ctx.model) {
      env.FOUNDATION_MODEL_ID = ctx.model.id;
      env.FOUNDATION_MAIN_PROVIDER_FAMILY = ctx.model.provider;
    }
    return env;
  };

  const status = (ctx, text) => ctx.ui.setStatus("changeloop", `Change Loop · ${text}`);
  const hostJson = async (endpoint, args, ctx) => {
    const result = await execute(hostExecutable,
      [...hostPrefixArgs, "host", endpoint, ...args],
      { cwd: root, env: environment(ctx), signal: ctx.signal });
    if (result.code !== 0) throw new Error("Change Loop instruction unavailable; reinstall with --host pi.");
    const value = JSON.parse(result.stdout);
    if (value.protocol !== 1 || !value.foundationVersion) throw new Error("Unsupported Change Loop host protocol.");
    const installed = JSON.parse(readFileSync(join(root, ".claude/harness/protocol.json"), "utf8"));
    if (value.foundationVersion !== installed.runtime) throw new Error("Change Loop CLI and project versions differ; refresh the project with --host pi, then /reload.");
    return value;
  };

  const hook = async (script, event, ctx, timeout = 10000) => {
    if (!ready) throw new Error("Change Loop guards unavailable; reinstall with --host pi and /reload.");
    const result = await execute("bash", [join(root, ".claude/hooks", script)],
      { cwd: event.cwd || ctx.cwd, env: environment(ctx), input: JSON.stringify(event),
        signal: ctx.signal, timeout });
    if (script === "lint.sh" && result.code === 2)
      return { diagnostics: result.stderr.trim() || "Lint failed" };
    if (result.code !== 0) throw new Error(`Change Loop ${script} failed; no tool operation ran.`);
    const output = result.stdout.trim();
    if (!output) return {};
    const value = JSON.parse(output);
    if (value.decision === "block") throw new Error(value.reason || "Blocked by Change Loop");
    return value.hookSpecificOutput || {};
  };

  const guard = async (name, input, ctx, cwd = ctx.cwd) => {
    const tool = TOOLS[name];
    if (!tool) return;
    const toolInput = () => tool === "Bash" ? { command: input.command }
      : tool === "Grep" ? { pattern: input.pattern, path: input.path ? resolve(cwd, input.path) : cwd,
        glob: input.glob || "", output_mode: "content" }
      : { file_path: resolve(cwd, String(input.path || "").replace(/^@/, "")) };
    if (tool === "Bash") {
      const normalized = normalizeHarnessCliInvocations(String(input.command))
        .replace(/(['"])([a-z0-9-]+)\1/g, "$2");
      // Public advance grants Land; it is not a harmless Build continuation.
      const grants = [...normalized.matchAll(/\badvance\s+([a-z0-9-]+)[^;&|\n]*?--through(?:=|\s+)archived\b/g),
        ...normalized.matchAll(/\b(?:land(?:-|\s+)(?:advance|archive|resume|recover|record|pointers|plan)|archive|sandbox(?:-|\s+)apply)\s+([a-z0-9-]+)/g)];
      const landOperation = grants.length || /--through(?:=|\s+)archived\b|\b(?:land(?:-|\s+)(?:advance|archive|resume|recover|record|pointers|plan)|archive|sandbox(?:-|\s+)apply)\b/.test(normalized);
      if (landOperation && !(grants.length && invocation?.command === "land" &&
          grants.every((grant) => invocation.args === grant[1])))
        throw new Error(`Land requires an explicit /land ${grants[0]?.[1] || "<change>"} in this Pi session.`);
      const deliveries = [...normalized.matchAll(/\b(?:deliver\s+advance|delivery-advance)\s+([a-z0-9-]+)/g)];
      if (/\b(?:deliver\s+advance|delivery-advance)\b/.test(normalized) &&
          !(deliveries.length && invocation?.command === "deliver" &&
            deliveries.every((delivery) => invocation.args === delivery[1])))
        throw new Error(`Publication requires an explicit /deliver ${deliveries[0]?.[1] || "<change>"} in this Pi session.`);
    }
    const event = () => ({ tool_name: tool, tool_input: toolInput(), cwd,
      session_id: ctx.sessionManager.getSessionId() });
    const apply = (output) => {
      const updated = output.updatedInput;
      if (!updated) return;
      if (updated.command !== undefined) input.command = updated.command;
      if (updated.file_path !== undefined) input.path = updated.file_path;
      if (tool === "Grep") {
        // Pi grep has no files_with_matches mode. Refuse an unrepresentable
        // rewrite rather than silently exposing the original secret lines.
        if (updated.output_mode && updated.output_mode !== "content")
          throw new Error(output.additionalContext || "Narrow the grep to non-secret source files.");
        if (updated.path !== undefined) input.path = updated.path;
        if (updated.glob !== undefined) input.glob = updated.glob;
      }
    };
    if (["Read", "Grep", "Bash"].includes(tool)) apply(await hook("protect-secrets.sh", event(), ctx));
    if (["Write", "Edit", "Bash"].includes(tool)) apply(await hook("phase-mutation-guard.sh", event(), ctx));
    if (tool === "Bash") apply(await hook("shell-route-guard.sh", event(), ctx));
  };

  pi.on("session_start", async (_event, ctx) => {
    invocation = null; contract = undefined; ready = false; touched.clear();
    try {
      for (const file of ["protect-secrets.sh", "phase-mutation-guard.sh", "lint.sh", "shell-route-guard.sh"])
        if (!existsSync(join(root, ".claude/hooks", file))) throw new Error(`Missing Change Loop guard: ${file}`);
      const jq = await execute("jq", ["--version"], { cwd: root, env: environment(ctx) });
      if (jq.code !== 0) throw new Error("Change Loop guards require jq.");
      contract = await hostJson("agent-contract", ["--protocol", "1", "--format", "json"], ctx);
      if (typeof contract.contract !== "string" || !contract.contract.trim()) throw new Error("Empty Change Loop agent contract");
      ready = true;
      status(ctx, "ready");
    } catch (error) {
      status(ctx, "unavailable"); ctx.ui.notify(error.message, "error");
    }
  });

  pi.on("input", (event) => {
    if (event.source !== "extension") invocation = null;
  });
  pi.on("before_agent_start", async (event) => {
    if (!contract) return;
    return { systemPrompt: `${event.systemPrompt}\n\n${contract.contract}\n\n` +
      "Pi host: each bash call starts in the session cwd; use an absolute cd to the returned workspace in EACH call. " +
      "Use absolute sandbox file paths. Follow runtime resume routes; /build and /prove never authorize Land. " +
      "Land requires /land <change>; /deliver <change> separately authorizes publication. " +
      "Guard coverage is partial: custom/MCP tools and other extensions are outside this adapter's live boundary. " +
      "Do not claim OS sandboxing or unattended authority." };
  });

  for (const command of HOST_COMMANDS) pi.registerCommand(command, {
    description: `Change Loop: ${command}`,
    handler: async (args, ctx) => {
      await ctx.waitForIdle();
      invocation = null;
      if (!ready) { ctx.ui.notify("Change Loop unavailable; fix the startup error and /reload.", "error"); return; }
      if (["land", "deliver"].includes(command) && !ID.test(args.trim())) {
        ctx.ui.notify(`Use /${command} <change-id>`, "error"); return;
      }
      try {
        const value = await hostJson("instruction",
          [command, "--protocol", "1", "--format", "json", "--arguments", args], ctx);
        if (typeof value.instruction !== "string" || !value.instruction.trim() ||
            value.foundationVersion !== contract.foundationVersion) throw new Error("Change Loop changed; /reload before continuing.");
        invocation = { command, args: args.trim() };
        status(ctx, `${command}${args.trim() ? ` · ${args.trim().slice(0, 80)}` : ""}`);
        pi.sendUserMessage(value.instruction);
      } catch (error) { ctx.ui.notify(error.message, "error"); }
    }
  });

  pi.on("tool_call", async (event, ctx) => {
    try {
      if (event.toolName === "powershell") throw new Error("Change Loop Pi guards support bash; use bash for this workflow.");
      await guard(event.toolName, event.input, ctx);
      if (["write", "edit"].includes(event.toolName)) touched.set(event.toolCallId,
        resolve(ctx.cwd, String(event.input.path).replace(/^@/, "")));
    } catch (error) { return { block: true, reason: error.message }; }
  });
  pi.on("tool_result", async (event, ctx) => {
    if (event.toolName === "bash" && !event.isError) {
      for (const part of event.content) {
        if (part.type !== "text") continue;
        try {
          const result = JSON.parse(part.text);
          if (typeof result.action === "string") status(ctx,
            [result.changeId || result.change, result.phase, result.action].filter((v) => typeof v === "string").join(" · "));
        } catch { /* ordinary shell output is not a lifecycle envelope */ }
      }
    }
    const path = touched.get(event.toolCallId); touched.delete(event.toolCallId);
    if (!path || event.isError) return;
    try {
      const result = await hook("lint.sh", { tool_name: "Write", tool_input: { file_path: path } }, ctx, 30000);
      if (result.diagnostics) return { content: [...event.content, { type: "text", text: result.diagnostics }], isError: true };
    } catch (error) { return { content: [...event.content, { type: "text", text: error.message }], isError: true }; }
  });

  // The native bash implementation preserves streaming, cancellation and Pi's
  // result shape. Only its child environment changes; process.env stays intact.
  const bash = createBashTool(root);
  pi.registerTool({ ...bash,
    async execute(id, args, signal, onUpdate, ctx) {
      return createBashTool(ctx.cwd, { spawnHook: ({ command, cwd, env }) => ({ command, cwd,
        env: environment(ctx, env) }) }).execute(id, args, signal, onUpdate);
    }
  });
  pi.on("user_bash", async (event, ctx) => {
    try {
      const input = { command: event.command };
      await guard("bash", input, ctx, event.cwd);
      const local = createLocalBashOperations();
      return { operations: { exec(_command, cwd, options) {
        const exports = Object.entries(environment(ctx))
          .filter(([key]) => key.startsWith("FOUNDATION_") || ["CLAUDE_PROJECT_DIR", "CLAUDE_FOUNDATION_PROJECT"].includes(key))
          .map(([key, value]) => `export ${key}=${quote(value)}`).join("\n");
        const clear = "unset FOUNDATION_CLAUDE_SESSION_ID CLAUDE_SESSION_ID CODEX_THREAD_ID FOUNDATION_CLAUDE_TRANSCRIPT_PATH FOUNDATION_ACTIVE_PHASE FOUNDATION_WORKSPACE_ROOT FOUNDATION_ALLOWED_PATHS_JSON";
        return local.exec(`${clear}\n${exports}\n${input.command}`, cwd, options);
      } } };
    } catch (error) { return { result: { output: error.message, exitCode: 1, cancelled: false, truncated: false } }; }
  });
}
