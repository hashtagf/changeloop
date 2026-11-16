// Property: under real multi-process contention, acquireProcessLock admits one
// holder at a time and loses no update, including when a holder exits without
// releasing. Hold times come from a seeded generator, so a failing interleaving
// reproduces from its seed.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const RUNTIME = join(dirname(fileURLToPath(import.meta.url)), "..", "runtime", "core");
const LOCK = pathToFileURL(join(RUNTIME, "process-lock.mjs")).href;
const TIMING = pathToFileURL(join(RUNTIME, "timing.mjs")).href;

const WORKER = `
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [lockUrl, timingUrl, dir, id, rounds, seed, dieAfter] = process.argv.slice(2);
const { acquireProcessLock } = await import(lockUrl);
const { retrySync } = await import(timingUrl);
let state = Number(seed);
const random = () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let round = 0; round < Number(rounds); round += 1) {
  const lock = retrySync(() => acquireProcessLock(join(dir, "state.lock")),
    { deadlineMs: 30000, intervalMs: 1 });
  if (!lock.acquired) process.exit(3);
  if (existsSync(join(dir, "inside"))) writeFileSync(join(dir, \`overlap-\${id}-\${round}\`), "");
  writeFileSync(join(dir, "inside"), id);
  const count = Number(readFileSync(join(dir, "counter"), "utf8"));
  const busyUntil = Date.now() + Math.floor(random() * 3);
  while (Date.now() < busyUntil) { /* hold the section for a seeded moment */ }
  writeFileSync(join(dir, "counter"), String(count + 1));
  rmSync(join(dir, "inside"));
  if (dieAfter !== "" && round === Number(dieAfter)) process.exit(0);
  lock.release();
}
`;

function run(worker, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [worker, ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

for (const seed of [11, 4242, 90001]) {
  test(`one holder at a time and no lost update under contention (seed ${seed})`, async (t) => {
    const dir = mkdtempSync(join(tmpdir(), "process-lock-interleave-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const worker = join(dir, "worker.mjs");
    writeFileSync(worker, WORKER);
    writeFileSync(join(dir, "counter"), "0");
    const contenders = [0, 1, 2, 3].map((id) =>
      run(worker, [LOCK, TIMING, dir, String(id), "20", String(seed + id), ""]));
    // A holder that exits inside its third round without releasing: the
    // others must recover its descriptor instead of waiting forever.
    const victim = run(worker, [LOCK, TIMING, dir, "victim", "10", String(seed * 7), "2"]);
    const results = await Promise.all([...contenders, victim]);
    for (const result of results) assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(readdirSync(dir).filter((name) => name.startsWith("overlap-")), []);
    assert.equal(Number(readFileSync(join(dir, "counter"), "utf8")), 4 * 20 + 3);
  });
}
