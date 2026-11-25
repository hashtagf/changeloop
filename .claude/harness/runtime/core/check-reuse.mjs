// No wait spent twice on the same answer. A task's verify command that already
// passed on the exact same workspace content (run by `advance`, or by the agent
// through `cloop exec --task`) is not run again: advance reuses the pass. Only
// passes are kept, keyed by repository and command, and bound to the change's
// workspace hash, so any edit, amendment, or sync runs the check again.
//
// A check that runs long also raises a `slow-check` signal naming why waiting
// on it is avoidable, so the agent fixes the cause instead of waiting again.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Past this, a per-task check is slow enough to name in the envelope.
export const SLOW_CHECK_MS = 30000;
const VERSION = 1;

export function checkKey(repository, command) {
  return `${repository || "root"}\u0000${String(command || "").trim()}`;
}

// `sh -c '<command>'` and the bare argv both name the same check.
export function commandOfArgv(argv = []) {
  return argv[0] === "sh" && argv[1] === "-c" && argv.length === 3 ? argv[2] : argv.join(" ");
}

export function slowCheckMessage(command, durationMs) {
  return `check \`${String(command).slice(0, 160)}\` took ${Math.round(durationMs / 1000)}s. ` +
    "A task's verify should run only the tests for its own paths; the whole suite runs once in Prove. " +
    "If it already reported its results and kept running, a test leaves a server or timer open: " +
    "close it, or let the runner exit when tests finish (node --test --test-force-exit, jest --forceExit). " +
    "While a long check runs, independent ready tasks can proceed in parallel.";
}

export function createCheckReuse({ logs, workspaceHash, now = () => new Date().toISOString() }) {
  const path = (id) => join(logs, id, "check-results.json");
  const read = (id) => {
    try {
      const value = existsSync(path(id)) ? JSON.parse(readFileSync(path(id), "utf8")) : null;
      return value?.version === VERSION && value.passes && typeof value.passes === "object" ? value : null;
    } catch { return null; }
  };
  const hash = (id) => {
    try { return workspaceHash(id) || null; } catch { return null; }
  };

  // The recorded pass for this check on the current workspace, or null.
  function reusable(id, repository, command) {
    const current = hash(id);
    const pass = current ? read(id)?.passes?.[checkKey(repository, command)] : null;
    return pass && pass.workspaceHash === current ? pass : null;
  }

  // Keeps a pass on the workspace it ran against; a failure forgets any pass.
  function record(id, repository, command, { status, durationMs, source }) {
    const current = hash(id);
    if (!current) return;
    const value = read(id) || { version: VERSION, passes: {} };
    const key = checkKey(repository, command);
    if (status === "pass")
      value.passes[key] = { repository: repository || "root", command, workspaceHash: current,
        durationMs: Math.round(durationMs || 0), source, at: now() };
    else delete value.passes[key];
    mkdirSync(dirname(path(id)), { recursive: true });
    writeFileSync(path(id), `${JSON.stringify(value, null, 2)}\n`);
  }

  return { reusable, record };
}
