// A child process that is stopped as soon as its output already answers the
// caller's question, with the spawnSync result shape. A test run whose open
// handle keeps it alive after every test has failed would otherwise hold the
// caller until its timeout. Foreground and non-detached; nothing outlives the
// invoking command.
import { spawn } from "node:child_process";
import { deadline, terminateWithGrace } from "../core/timing.mjs";

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv, timeout?: number, maxBuffer?: number,
 *   settled?: (stdout: string, stderr: string) => number | null }} options
 */
export function spawnUntilSettled(command, args, options = {}) {
  return new Promise((complete) => {
    let stdout = "";
    let stderr = "";
    let bytes = 0;
    let error = null;
    let done = false;
    let cancel = () => {};
    const limit = Number(options.maxBuffer || 64 * 1024 * 1024);
    const child = spawn(command, args, { cwd: options.cwd, env: options.env, stdio: ["ignore", "pipe", "pipe"] });
    const finish = (status, signal, stoppedEarly = false) => {
      if (done) return;
      done = true;
      cancel();
      complete({ status, signal, error, stdout, stderr, stoppedEarly });
    };
    const collect = (append) => (chunk) => {
      bytes += chunk.length;
      if (bytes > limit && !error) {
        error = Object.assign(new Error("spawn ENOBUFS"), { code: "ENOBUFS" });
        child.kill("SIGTERM");
        return;
      }
      append(chunk.toString("utf8"));
      const early = done || error ? null : options.settled?.(stdout, stderr);
      if (early === null || early === undefined) return;
      terminateWithGrace(child);
      finish(early, null, true);
    };
    child.stdout.on("data", collect((value) => { stdout += value; }));
    child.stderr.on("data", collect((value) => { stderr += value; }));
    child.on("error", (spawnError) => {
      error ||= spawnError;
      finish(null, null);
    });
    child.on("close", (status, signal) => finish(error ? null : status, signal));
    if (options.timeout) cancel = deadline(Number(options.timeout), () => {
      error ||= Object.assign(new Error("spawn ETIMEDOUT"), { code: "ETIMEDOUT" });
      terminateWithGrace(child);
    });
  });
}
