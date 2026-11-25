// An exec child whose output is passed through unchanged and watched, so no
// wait is silent and none is wasted:
// - a test runner that printed its final summary but keeps running (a server,
//   timer, or connection a test left open) is stopped after a short grace,
//   with the summary's verdict as its exit status, and the cause is named;
// - a long silence raises one notice saying what usually causes it.
// Recognized final summaries: TAP or Node's runner (`# duration_ms`,
// `ℹ duration_ms`) with its `fail N` count, and Jest (`Ran all test suites`)
// with `Tests: … failed`. Node's runner prints its summary only once the file's
// process exits, so a handle left open there shows as silence after the test
// lines: the quiet notice names `--test-force-exit` for it.
import { spawn } from "node:child_process";
import { deadline, terminateWithGrace } from "../core/timing.mjs";

export const LINGER_AFTER_SUMMARY_MS = 10000;
export const QUIET_NOTICE_MS = 60000;
const TAIL = 64 * 1024;
const NODE_SUMMARY = /^(?:ℹ|#) duration_ms \d/m;
const NODE_FAILS = /^(?:ℹ|#) fail (\d+)/m;
const JEST_SUMMARY = /^Ran all test suites/m;
const JEST_FAILS = /^Tests:\s+(\d+) failed/m;

export function summaryVerdict(text) {
  if (NODE_SUMMARY.test(text)) return Number(NODE_FAILS.exec(text)?.[1] ?? 0) > 0 ? 1 : 0;
  if (JEST_SUMMARY.test(text)) return Number(JEST_FAILS.exec(text)?.[1] ?? 0) > 0 ? 1 : 0;
  return null;
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv, lingerMs?: number, quietMs?: number,
 *   stdout?: { write: (chunk: any) => any }, stderr?: { write: (chunk: any) => any },
 *   notice?: (code: string, message: string) => void }} options
 * @returns {Promise<{ status: number | null, signal: string | null, error: Error | null,
 *   lingeredMs: number | null, quietNotices: number, lastOutputAt: number | null }>}
 */
export function watchedExec(command, args, options = {}) {
  const lingerMs = options.lingerMs ?? LINGER_AFTER_SUMMARY_MS;
  const quietMs = options.quietMs ?? QUIET_NOTICE_MS;
  const out = options.stdout || process.stdout;
  const err = options.stderr || process.stderr;
  const notice = options.notice || ((_code, message) => err.write(`NOTICE: ${message}\n`));
  const label = [command, ...args].join(" ").slice(0, 160);
  return new Promise((complete) => {
    let tail = "";
    let settled = false;
    let verdict = null;
    let lingeredMs = null;
    let quietNotices = 0;
    let lastOutputAt = null;
    let cancelLinger = () => {};
    let cancelQuiet = () => {};
    const child = spawn(command, args, { cwd: options.cwd, env: options.env, stdio: ["inherit", "pipe", "pipe"] });
    const finish = (value) => {
      if (settled) return;
      settled = true;
      cancelLinger();
      cancelQuiet();
      complete({ lingeredMs, quietNotices, lastOutputAt, ...value });
    };
    const quiet = () => {
      cancelQuiet();
      cancelQuiet = deadline(quietMs, () => {
        quietNotices += 1;
        notice("exec-quiet", `\`${label}\` printed nothing for ${Math.round(quietMs / 1000)}s. ` +
          "If it already printed its test results, a test is holding the process open (a server, timer, " +
          "or connection it never closes): close it in the test, or let the runner exit when tests " +
          "finish (node --test --test-force-exit, jest --forceExit).");
        quiet();
      });
    };
    const watch = (stream) => (chunk) => {
      stream.write(chunk);
      lastOutputAt = Date.now();
      tail = (tail + chunk.toString("utf8")).slice(-TAIL);
      quiet();
      if (verdict !== null) return;
      verdict = summaryVerdict(tail);
      if (verdict === null) return;
      const reportedAt = Date.now();
      cancelLinger = deadline(lingerMs, () => {
        lingeredMs = Date.now() - reportedAt;
        notice("exec-lingering", `\`${label}\` reported its results but kept running for ` +
          `${Math.round(lingerMs / 1000)}s: a test leaves a server, timer, or connection open. ` +
          "Stopped it and kept the reported verdict; close the handle in the test, or let the runner " +
          "exit when tests finish (node --test --test-force-exit, jest --forceExit).");
        terminateWithGrace(child);
        finish({ status: verdict, signal: null, error: null });
      });
    };
    child.stdout.on("data", watch(out));
    child.stderr.on("data", watch(err));
    child.on("error", (error) => finish({ status: null, signal: null, error }));
    child.on("close", (status, signal) => finish({ status, signal, error: null }));
    quiet();
  });
}
