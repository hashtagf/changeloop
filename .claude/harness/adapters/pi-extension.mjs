// Pi host bridge. The installed runtime owns instructions, phase state and proof.
// This module has no Pi dependency so the host boundary is testable offline.
import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HOST_COMMANDS } from "../runtime/core/host-instruction.mjs";
import { normalizeHarnessCliInvocations } from "../runtime/core/shell-mutation-policy.mjs";
import { assertSharedInstallation, isSharedProject } from '../runtime/core/project-installation.mjs';
import { deliverRequest, investigateRequest, isLandConsent, resolveSessionDeliver,
  resolveSessionLand } from '../runtime/core/pi-land-context.mjs';
import { recordedPhaseContext } from '../../hooks/phase-state.mjs';

const PHASE_FRESHNESS_MS = 12 * 60 * 60 * 1000;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
// background_bash (the maintainer extension) runs a shell command, so it gets
// the same guards as bash; it always detaches, so it never runs authority.
const TOOLS = { read: "Read", grep: "Grep", write: "Write", edit: "Edit", bash: "Bash",
  background_bash: "Bash" };
// Tools that read only names or coordinate sessions. Workers inherit guards
// through FOUNDATION_PARENT_SESSION_ID, so spawning one is not a bypass.
const UNGUARDED_OK = new Set(["ls", "find", "ask_user", "agent_list", "agent_inbox", "agent_send",
  "agent_stop", "agent_spawn", "background_job", "task_board", "tool_guide", "session_title"]);
const GUARD_FILES = ["protect-secrets.sh", "phase-mutation-guard.sh", "lint.sh", "shell-route-guard.sh",
  "no-detached-authority.mjs", "session-context.mjs", "dev-terminal-guard.mjs"];
const AUTHORITY_RUN = /\b(?:cloop|foundation\.mjs)\s+authority(?:-|\s+)run\b/;
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
  runtimeRoot = projectRoot, hostExecutable = "cloop", hostPrefixArgs = [],
  parentSessionId = process.env.FOUNDATION_PARENT_SESSION_ID }) {
  const root = projectRoot;
  // A worker started by a coordinating Pi session resolves that session's
  // phase (as a native subagent shares its parent's session) but never holds
  // Land or Deliver authority of its own.
  const parent = /^[A-Za-z0-9._:-]{1,200}$/.test(String(parentSessionId || "")) ? String(parentSessionId) : "";
  const workerRefusal = "This Pi session is a worker; only the coordinating session can land or deliver.";
  let invocation = null;
  let contract;
  let ready = false;
  const touched = new Map();
  const guardNotes = new Map();
  const warnedTools = new Set();
  let digest = "";
  let devStartMs = 0;

  // Claude Code keeps the agent's cwd after the contract's single `cd` into the
  // Build workspace; every Pi bash call starts fresh in the session cwd. During
  // Build start agent shell calls in the recorded workspace instead, so a
  // relative write lands there and the guard judges containment from there.
  const buildWorkspace = (ctx) => {
    if (invocation?.command === "investigate") return null;
    try {
      const recorded = recordedPhaseContext({ projectRoot: root,
        sessionId: parent || ctx.sessionManager.getSessionId(), freshnessMs: PHASE_FRESHNESS_MS,
        pathExists: existsSync, readDirectory: (path) => readdirSync(path, { withFileTypes: true }),
        readText: readFileSync, nowMs: Date.now });
      if (recorded?.phase !== "build" || !ID.test(recorded.changeId || "")) return null;
      const state = JSON.parse(readFileSync(join(root, ".foundation/runtime", `${recorded.changeId}.json`), "utf8"));
      const path = state?.workspace?.path;
      return typeof path === "string" && statSync(path).isDirectory() ? path : null;
    } catch { return null; }
  };

  const environment = (ctx, base = process.env) => {
    const env = { ...base, CLAUDE_PROJECT_DIR: root,
      CLAUDE_FOUNDATION_PROJECT: root, FOUNDATION_HOST: "pi",
      FOUNDATION_SESSION_ID: ctx.sessionManager.getSessionId(),
      FOUNDATION_MAIN_IDENTITY: "pi-main-session",
      // Guards advise by default; a user who wants refusals exports block.
      FOUNDATION_GUARDRAIL_MODE: base.FOUNDATION_GUARDRAIL_MODE || "auto",
      FOUNDATION_HOST_COMMAND: invocation?.command || "",
      FOUNDATION_HOST_ARGUMENTS: invocation?.args || "" };
    if (isSharedProject(root)) env.PATH = `${join(runtimeRoot, 'bin')}${process.platform === 'win32' ? ';' : ':'}${env.PATH || ''}`;
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
    const installed = JSON.parse(readFileSync(join(runtimeRoot, ".claude/harness/protocol.json"), "utf8"));
    if (value.foundationVersion !== installed.runtime) throw new Error("Change Loop CLI and project versions differ; refresh the project with --host pi, then /reload.");
    return value;
  };

  const hook = async (script, event, ctx, timeout = 10000) => {
    if (!ready) throw new Error("Change Loop guards unavailable; reinstall with --host pi and /reload.");
    // .mjs hooks run directly: their .sh wrappers resolve CLAUDE_PROJECT_DIR,
    // which a shared-runtime project does not contain.
    const result = await execute(script.endsWith(".mjs") ? process.execPath : "bash",
      [join(runtimeRoot, ".claude/hooks", script)],
      { cwd: event.cwd || ctx.cwd, env: environment(ctx), input: JSON.stringify(event),
        signal: ctx.signal, timeout });
    if (script === "lint.sh" && result.code === 2)
      return { diagnostics: result.stderr.trim() || "Lint failed" };
    if (result.code !== 0) throw new Error(`Change Loop ${script} failed; no tool operation ran.`);
    const output = result.stdout.trim();
    if (!output) return {};
    const value = JSON.parse(output);
    if (value.decision === "block") throw new Error(value.reason || "Blocked by Change Loop");
    return value.hookSpecificOutput || (typeof value.systemMessage === "string"
      ? { systemMessage: value.systemMessage } : {});
  };

  const guard = async (name, input, ctx, cwd = ctx.cwd) => {
    const tool = TOOLS[name];
    if (!tool) return;
    const notes = [];
    // Unset means auto; an unknown value fails closed, like the phase guard.
    const strict = !["", "auto", "audit", "off"].includes(String(process.env.FOUNDATION_GUARDRAIL_MODE || "").toLowerCase());
    // Advice by default: the call runs and the note explains the preferred route.
    const advise = (message) => { if (strict) throw new Error(`BLOCKED: ${message}`); notes.push(`WARNING: ${message}`); };
    if (name === "background_bash" && AUTHORITY_RUN.test(normalizeHarnessCliInvocations(String(input.command))))
      advise("authority run owns a synchronous reviewer and should stay in the foreground. Run it with bash, not background_bash, and wait for its completion.");
    const toolInput = () => tool === "Bash" ? { command: input.command }
      : tool === "Grep" ? { pattern: input.pattern, path: input.path ? resolve(cwd, input.path) : cwd,
        glob: input.glob || "", output_mode: "content" }
      : { file_path: resolve(cwd, String(input.path || "").replace(/^@/, "")) };
    if (tool === "Bash") {
      const normalized = normalizeHarnessCliInvocations(String(input.command))
        .replace(/(['"])([a-z0-9-]+)\1/g, "$2");
      // Public advance grants Land; it is not a harmless Build continuation.
      // Land subcommands exist only on the Change Loop CLI, so they count only
      // after `cloop` or `foundation.mjs`; the word archive in a
      // path or message (git add openspec/changes/archive/...) is data.
      const cli = String.raw`(?:\bcloop|foundation\.mjs)\s+`;
      const landWords = String.raw`(?:land(?:-|\s+)(?:advance|archive|resume|recover|record|pointers|plan)|archive|sandbox(?:-|\s+)apply)`;
      const grants = [...normalized.matchAll(/\badvance\s+([a-z0-9-]+)[^;&|\n]*?--through(?:=|\s+)archived\b/g),
        ...normalized.matchAll(new RegExp(`${cli}${landWords}\\s+([a-z0-9-]+)`, "g"))];
      const landOperation = grants.length || /--through(?:=|\s+)archived\b/.test(normalized) ||
        new RegExp(`${cli}${landWords}\\b`).test(normalized);
      if (landOperation && !(grants.length && invocation?.command === "land" &&
          grants.every((grant) => invocation.args === grant[1])))
        advise('Land applies proven work to the main checkout; run it when the user asked to land ("land ได้เลย" or /land).');
      const deliveries = [...normalized.matchAll(/\b(?:deliver\s+advance|delivery-advance)\s+([a-z0-9-]+)/g)];
      if (/\b(?:deliver\s+advance|delivery-advance)\b/.test(normalized) &&
          !(deliveries.length && invocation?.command === "deliver" &&
            deliveries.every((delivery) => invocation.args === delivery[1])))
        advise(`Deliver commits, pushes and opens a pull request; run it when the user asked for /deliver ${deliveries[0]?.[1] || "<change>"}.`);
    }
    const event = () => ({ tool_name: tool, tool_input: toolInput(), cwd,
      session_id: parent || ctx.sessionManager.getSessionId() });
    const apply = (output) => {
      if (typeof output.additionalContext === "string" && output.additionalContext.trim())
        notes.push(output.additionalContext.trim());
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
    // Skip an interpreter start for the common command that cannot match.
    if (tool === "Bash" && /authority/.test(String(input.command)))
      apply(await hook("no-detached-authority.mjs", event(), ctx));
    return notes;
  };

  // The session digest names active changes and their next step. It is
  // best-effort: a failing digest never blocks the session.
  const refreshDigest = async (ctx) => {
    digest = "";
    try {
      const output = await hook("session-context.mjs", { session_id: parent || ctx.sessionManager.getSessionId() }, ctx);
      if (typeof output.additionalContext === "string") digest = output.additionalContext.trim();
    } catch { /* best-effort */ }
  };

  pi.on("session_start", async (_event, ctx) => {
    invocation = null; contract = undefined; ready = false; touched.clear(); guardNotes.clear();
    warnedTools.clear(); digest = "";
    try {
      assertSharedInstallation(root, runtimeRoot);
      for (const file of GUARD_FILES)
        if (!existsSync(join(runtimeRoot, ".claude/hooks", file))) throw new Error(`Missing Change Loop guard: ${file}`);
      const jq = await execute("jq", ["--version"], { cwd: root, env: environment(ctx) });
      if (jq.code !== 0) throw new Error("Change Loop guards require jq.");
      contract = await hostJson("agent-contract", ["--protocol", "1", "--format", "json"], ctx);
      if (typeof contract.contract !== "string" || !contract.contract.trim()) throw new Error("Empty Change Loop agent contract");
      ready = true;
      status(ctx, "ready");
    } catch (error) {
      status(ctx, "unavailable"); ctx.ui.notify(error.message, "error");
      return;
    }
    await refreshDigest(ctx);
  });
  pi.on("session_compact", async (_event, ctx) => { if (ready) await refreshDigest(ctx); });

  // /dev must reach proven (or a real boundary) before it stops. Like Claude
  // Code's Stop hook this only records the verdict and warns; it never loops.
  pi.on("agent_settled", async (event, ctx) => {
    if (!ready || event?.aborted || invocation?.command !== "dev") return;
    try {
      const output = await hook("dev-terminal-guard.mjs", { session_id: parent || ctx.sessionManager.getSessionId(),
        host_prompt: `/dev ${invocation.args}`.trim(), host_session_start_ms: devStartMs }, ctx);
      if (output.systemMessage) ctx.ui.notify(output.systemMessage, "warning");
    } catch { /* terminal truth stays with runtime proof; the warning is advisory */ }
  });

  // Only whole interactive user utterances route: extension, RPC and worker
  // text never become a workflow or an authority grant.
  pi.on("input", async (event, ctx) => {
    if (event.source !== "extension") invocation = null;
    if (event.source !== "interactive") return;
    const land = isLandConsent(event.text);
    const deliver = land ? null : deliverRequest(event.text);
    const topic = land || deliver ? null : investigateRequest(event.text);
    if (!land && !deliver && topic === null) return;
    if (parent && (land || deliver)) { ctx.ui.notify(workerRefusal, "warning"); return { action: "handled" }; }
    if (!ready) { ctx.ui.notify("Change Loop unavailable; fix the startup error and /reload.", "error"); return { action: "handled" }; }
    try {
      const command = land ? "land" : deliver ? "deliver" : "investigate";
      const args = land ? await resolveSessionLand(root, ctx)
        : deliver ? deliver.id || await resolveSessionDeliver(root, ctx) : topic;
      if (!args) return { action: "handled" };
      const value = await hostJson("instruction", [command, "--protocol", "1", "--format", "json", "--arguments", args], ctx);
      if (typeof value.instruction !== "string" || !value.instruction.trim() ||
          value.foundationVersion !== contract.foundationVersion) throw new Error("Change Loop changed; /reload before continuing.");
      invocation = { command, args };
      status(ctx, `${command} · ${args.slice(0, 80)}`);
      return { action: "transform", text: isSharedProject(root) ? value.instruction.replaceAll('.claude/', `${runtimeRoot}/.claude/`) : value.instruction,
        images: event.images };
    } catch (error) { ctx.ui.notify(error.message, "error"); return { action: "handled" }; }
  });
  pi.on("before_agent_start", async (event) => {
    if (!contract) return;
    const message = digest ? { customType: "changeloop-digest", content: digest, display: false } : undefined;
    digest = "";
    const instructions = isSharedProject(root) ? contract.contract.replaceAll('.claude/', `${runtimeRoot}/.claude/`) : contract.contract;
    return { systemPrompt: `${event.systemPrompt}\n\n${instructions}\n\n` +
      "Pi host: during Build every bash call starts in the change workspace, as if you had run cd there once; never cd to the project root to write files. " +
      "Outside Build each bash call starts in the session cwd. Use absolute sandbox paths for Write and Edit. " +
      "Follow runtime resume routes; /build and /prove never authorize Land. " +
      'For the single ready change in this session, explicit user consent such as "land ได้เลย" or /land resolves the change automatically; "เปิด PR ให้เลย" or /deliver does the same for Deliver, and "investigate <topic>" runs /investigate. ' +
      "Do not ask users to copy change IDs when session context resolves them. /deliver <change> separately authorizes publication. " +
      "Guards advise rather than refuse (except secret redaction): a warning on a tool result names the preferred route; follow it. " +
      "Guard coverage is partial: built-in tools and background_bash are guarded; other custom/MCP tools are outside this adapter's live boundary and only warned about. " +
      "Do not claim OS sandboxing or unattended authority.", ...(message ? { message } : {}) };
  });

  for (const command of HOST_COMMANDS) pi.registerCommand(command, {
    description: `Change Loop: ${command}`,
    handler: async (args, ctx) => {
      await ctx.waitForIdle();
      invocation = null;
      if (!ready) { ctx.ui.notify("Change Loop unavailable; fix the startup error and /reload.", "error"); return; }
      if (parent && ["land", "deliver"].includes(command)) { ctx.ui.notify(workerRefusal, "error"); return; }
      if (["land", "deliver"].includes(command) && !args.trim()) {
        args = await (command === "land" ? resolveSessionLand : resolveSessionDeliver)(root, ctx);
        if (!args) return;
      }
      if (["land", "deliver"].includes(command) && !ID.test(args.trim())) {
        ctx.ui.notify(`Use /${command} <change-id>`, "error"); return;
      }
      try {
        const value = await hostJson("instruction",
          [command, "--protocol", "1", "--format", "json", "--arguments", args], ctx);
        if (typeof value.instruction !== "string" || !value.instruction.trim() ||
            value.foundationVersion !== contract.foundationVersion) throw new Error("Change Loop changed; /reload before continuing.");
        invocation = { command, args: args.trim() };
        if (command === "dev") devStartMs = Date.now();
        status(ctx, `${command}${args.trim() ? ` · ${args.trim().slice(0, 80)}` : ""}`);
        pi.sendUserMessage(isSharedProject(root) ? value.instruction.replaceAll('.claude/', `${runtimeRoot}/.claude/`) : value.instruction);
      } catch (error) { ctx.ui.notify(error.message, "error"); }
    }
  });

  pi.on("tool_call", async (event, ctx) => {
    try {
      if (event.toolName === "powershell") throw new Error("Change Loop Pi guards support bash; use bash for this workflow.");
      if (!TOOLS[event.toolName]) {
        // Outside the live boundary: never blocked, named once per session
        // while a phase is being enforced.
        if (!UNGUARDED_OK.has(event.toolName) && !warnedTools.has(event.toolName) &&
            (invocation?.command === "investigate" || buildWorkspace(ctx))) {
          warnedTools.add(event.toolName);
          guardNotes.set(event.toolCallId, `Change Loop: ${event.toolName} is outside the Pi live guard boundary; ` +
            "phase, secret and Land checks did not run for it. Prefer built-in tools for project files during this change.");
        }
        return;
      }
      let cwd = ctx.cwd;
      if (event.toolName === "bash") cwd = buildWorkspace(ctx) || ctx.cwd;
      if (event.toolName === "background_bash") {
        const workspace = buildWorkspace(ctx);
        if (workspace && !event.input.cwd) event.input.cwd = workspace;
        cwd = event.input.cwd ? resolve(ctx.cwd, String(event.input.cwd)) : ctx.cwd;
      }
      const notes = await guard(event.toolName, event.input, ctx, cwd);
      // Claude Code shows a guard's additional context to the model; Pi has no
      // pre-call channel, so the note rides on the tool's result.
      if (notes?.length) guardNotes.set(event.toolCallId, notes.join("\n"));
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
    const note = guardNotes.get(event.toolCallId); guardNotes.delete(event.toolCallId);
    const content = note ? [...event.content, { type: "text", text: note }] : event.content;
    const noted = note ? { content } : undefined;
    const path = touched.get(event.toolCallId); touched.delete(event.toolCallId);
    if (!path || event.isError) return noted;
    try {
      const result = await hook("lint.sh", { tool_name: "Write", tool_input: { file_path: path } }, ctx, 30000);
      if (result.diagnostics) return { content: [...content, { type: "text", text: result.diagnostics }], isError: true };
    } catch (error) { return { content: [...content, { type: "text", text: error.message }], isError: true }; }
    return noted;
  });

  // The native bash implementation preserves streaming, cancellation and Pi's
  // result shape. Only its child environment changes; process.env stays intact.
  const bash = createBashTool(root);
  pi.registerTool({ ...bash,
    async execute(id, args, signal, onUpdate, ctx) {
      return createBashTool(buildWorkspace(ctx) || ctx.cwd, { spawnHook: ({ command, cwd, env }) => ({ command, cwd,
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
          .filter(([key]) => key.startsWith("FOUNDATION_") || ["CLAUDE_PROJECT_DIR", "CLAUDE_FOUNDATION_PROJECT"].includes(key) || (isSharedProject(root) && key === 'PATH'))
          .map(([key, value]) => `export ${key}=${quote(value)}`).join("\n");
        const clear = "unset FOUNDATION_CLAUDE_SESSION_ID CLAUDE_SESSION_ID CODEX_THREAD_ID FOUNDATION_CLAUDE_TRANSCRIPT_PATH FOUNDATION_ACTIVE_PHASE FOUNDATION_WORKSPACE_ROOT FOUNDATION_ALLOWED_PATHS_JSON";
        return local.exec(`${clear}\n${exports}\n${input.command}`, cwd, options);
      } } };
    } catch (error) { return { result: { output: error.message, exitCode: 1, cancelled: false, truncated: false } }; }
  });
}
