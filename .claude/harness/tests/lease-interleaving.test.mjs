// Property: lease acquisition across real processes grants a shared resource
// to one holder at a time, never reuses a fencing generation, and lets an
// expired lease left by a dead holder be taken over only after it expires.
// Hold times come from a seeded generator, so a failing interleaving
// reproduces from its seed.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const RUNTIME = join(dirname(fileURLToPath(import.meta.url)), "..", "runtime");
const LEASES = pathToFileURL(join(RUNTIME, "workflow", "authority", "lease-runtime.mjs")).href;
const TIMING = pathToFileURL(join(RUNTIME, "core", "timing.mjs")).href;

const WORKER = `
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
const [leasesUrl, timingUrl, dir, id, rounds, seed, leaseMinutes, releaseLease] = process.argv.slice(2);
const { createLeaseRuntime } = await import(leasesUrl);
const { retrySync } = await import(timingUrl);
let state = Number(seed);
const random = () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
const readJson = (path, fallback = null) => {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { if (fallback !== null) return fallback; throw error; }
};
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = \`\${path}.tmp-\${process.pid}\`;
  writeFileSync(temporary, \`\${JSON.stringify(value)}\\n\`);
  renameSync(temporary, path);
};
const plan = {
  dispatchable: true, planDigest: "p", graphRevision: "g", graphIdentity: "gi",
  contractRevision: 1, workspaceHash: "w", graph: { nodes: [] },
  tasks: [{ id: "T001", dependsOn: [], leaseKeys: ["path:shared:src"], paths: ["src/**"],
    claims: [], repository: "root" }]
};
const runtime = createLeaseRuntime({
  leases: join(dir, "leases"),
  stableHash: (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex"),
  agentPlanValue: () => plan,
  policy: () => ({ execution: { leaseMinutes: Number(leaseMinutes) } }),
  readJson, writeJson, now: () => new Date().toISOString(),
  fail: (message) => { throw new Error(message); },
  lockWaitMs: 30000
});
const change = \`c\${id}\`;
for (let round = 0; round < Number(rounds); round += 1) {
  const granted = retrySync(() => {
    try { return { acquired: true, lease: runtime.acquire(change, "T001", { owner: \`w\${id}\` }, { quiet: true }) }; }
    catch (error) { if (/conflicts with/.test(error.message)) return { acquired: false }; throw error; }
  }, { deadlineMs: 30000, intervalMs: 2 });
  if (!granted.acquired) process.exit(3);
  const acquiredMs = Date.now();
  if (existsSync(join(dir, "inside"))) writeFileSync(join(dir, \`overlap-\${id}-\${round}\`), "");
  writeFileSync(join(dir, "inside"), id);
  const busyUntil = Date.now() + Math.floor(random() * 3);
  while (Date.now() < busyUntil) { /* hold the resource for a seeded moment */ }
  writeFileSync(join(dir, \`grant-\${id}-\${round}.json\`), JSON.stringify({
    generation: granted.lease.fencingGeneration, acquiredMs,
    expiresMs: Date.parse(granted.lease.expiresAt)
  }));
  if (releaseLease !== "release") process.exit(0);
  rmSync(join(dir, "inside"));
  runtime.release(change, "T001", { owner: \`w\${id}\`, "lease-id": granted.lease.leaseId }, { quiet: true });
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

for (const seed of [7, 3141, 271828]) {
  test(`one lease holder at a time, unique fencing, dead holder expires (seed ${seed})`, async (t) => {
    const dir = mkdtempSync(join(tmpdir(), "lease-interleave-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const worker = join(dir, "worker.mjs");
    writeFileSync(worker, WORKER);
    // A holder that exits without releasing a 0.4s lease.
    const victim = await run(worker, [LEASES, TIMING, dir, "victim", "1", String(seed), "0.0067", "keep"]);
    assert.equal(victim.code, 0, victim.stderr);
    rmSync(join(dir, "inside"));
    const results = await Promise.all([0, 1, 2, 3].map((id) =>
      run(worker, [LEASES, TIMING, dir, String(id), "8", String(seed + id), "45", "release"])));
    for (const result of results) assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(readdirSync(dir).filter((name) => name.startsWith("overlap-")), []);
    const grants = readdirSync(dir).filter((name) => name.startsWith("grant-"))
      .map((name) => ({ name, ...JSON.parse(readFileSync(join(dir, name), "utf8")) }));
    assert.equal(grants.length, 4 * 8 + 1);
    assert.equal(new Set(grants.map((grant) => grant.generation)).size, grants.length);
    const dead = grants.find((grant) => grant.name === "grant-victim-0.json");
    for (const grant of grants.filter((row) => row !== dead))
      assert.ok(grant.acquiredMs >= dead.expiresMs, `${grant.name} acquired before the dead lease expired`);
  });
}
