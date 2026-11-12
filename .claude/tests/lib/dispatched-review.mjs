#!/usr/bin/env node
// Records a review the only way the harness accepts one: through a dispatched
// authority attempt. Fixtures used to write review receipts directly with
// `receipt <change> review <status> ...`; review now always runs the
// full-delta circuit, so a review receipt must bind to an `authority dispatch`
// attempt. This helper keeps those fixtures readable: it takes the same flags
// a direct receipt took, then runs request → dispatch → template → record.
//
// Usage (from the fixture project root):
//   node dispatched-review.mjs <change> <status> [helper options] [receipt flags]
// Helper options (not forwarded as evidence):
//   --provider <id>          forwarded to `authority request`, which currently
//                            refuses it: the request picks the declared review
//                            provider itself
//   --scope full|delta       dispatch scope (default: full, or delta with a base)
//   --base-attempt <digest>  base attempt for a delta dispatch
//   --base-first-ai          use the latest completed AI attempt on the recorded
//                            chain as the delta base (in round two: the first
//                            durable AI review), as dispatch requires
// Receipt flags such as --reviewer-type, --reviewer-identity, --observed,
// --reference, --subject-*, --unresolved-blockers, --findings (JSON array),
// --verified-finding-ids (comma list) become response evidence. Any
// `--scope-path` is ignored: the dispatched packet owns the scope.
//
// Output is the output of the failing step, or of `authority record`; the exit
// status is non-zero when any step fails. Diagnostics (stderr) of earlier
// successful steps — e.g. a history-recovery NOTICE from dispatch — are
// forwarded to stderr so callers can still assert on them.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const cli = process.env.FOUNDATION_CLI || ".claude/harness/foundation.mjs";
const [change, status, ...rest] = process.argv.slice(2);
if (!change || !status) {
  console.error("usage: dispatched-review.mjs <change> <status> [flags]");
  process.exit(2);
}

const helper = {};
const evidence = {};
const MULTI = new Set(["reference", "subject-provenance", "criterion"]);
for (let index = 0; index < rest.length; index += 1) {
  const token = rest[index];
  if (!token.startsWith("--")) continue;
  const key = token.slice(2);
  const next = rest[index + 1];
  const value = next === undefined || next.startsWith("--") ? true : (index += 1, next);
  if (["provider", "scope", "base-attempt", "base-first-ai"].includes(key)) {
    helper[key] = value;
    continue;
  }
  if (key === "scope-path") continue;
  if (key === "findings") { evidence.findings = JSON.parse(value); continue; }
  if (key === "verified-finding-ids") {
    evidence.verifiedFindingIds = String(value).split(",").map((row) => row.trim()).filter(Boolean);
    continue;
  }
  if (MULTI.has(key)) (evidence[key] ||= []).push(value);
  else evidence[key] = value;
}

function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  const code = result.status ?? 1;
  if (code === 0 && result.stderr) process.stderr.write(result.stderr);
  return { code, output: `${result.stdout || ""}${code === 0 ? "" : result.stderr || ""}` };
}
function jsonFrom(output) {
  const start = output.indexOf("{");
  if (start < 0) return null;
  try { return JSON.parse(output.slice(start, output.lastIndexOf("}") + 1)); }
  catch { return null; }
}
function finish(step) {
  process.stdout.write(step.output);
  process.exit(step.code || 1);
}

const requestArgs = ["authority-request", change, "--type", "review"];
if (helper.provider) requestArgs.push("--provider", helper.provider);
const requested = run(requestArgs);
const request = jsonFrom(requested.output);
if (requested.code !== 0 || !request?.requestId) finish(requested);

let baseAttempt = helper["base-attempt"];
if (!baseAttempt && helper["base-first-ai"]) {
  // Walk the recorded chain: each dispatched round leaves a dispatch record
  // and a completed record with the same attempt number, and only the
  // completed one is on the chain. Dispatch expects the latest completed AI
  // attempt (for the second round, the first durable AI review).
  const directory = join(".foundation", "evidence", change, "review-attempts");
  const attempts = new Map((existsSync(directory) ? readdirSync(directory) : [])
    .map((name) => JSON.parse(readFileSync(join(directory, name), "utf8")))
    .map((row) => [row.digest, row]));
  const runtimePath = join(".foundation", "runtime", `${change}.json`);
  let digest = existsSync(runtimePath)
    ? JSON.parse(readFileSync(runtimePath, "utf8")).reviewHistory?.chainHead : null;
  const seen = new Set();
  while (digest && !seen.has(digest) && attempts.has(digest)) {
    seen.add(digest);
    const row = attempts.get(digest);
    if (row.reviewerType === "ai" && row.status === "completed") {
      baseAttempt = row.digest;
      break;
    }
    digest = row.priorChainHead || null;
  }
}
const scope = helper.scope || (baseAttempt ? "delta" : "full");
const dispatchArgs = ["authority-dispatch", change, "--request", request.requestId, "--scope", scope];
if (baseAttempt) dispatchArgs.push("--base-attempt", baseAttempt);
for (const key of ["reviewer-type", "reviewer-identity", "reviewer-provider-family",
  "reviewer-model-family", "reviewer-model", "reviewer-session"])
  if (evidence[key] !== undefined) dispatchArgs.push(`--${key}`, String(evidence[key]));
if (evidence["reviewer-identity"] === undefined && evidence.reviewer !== undefined)
  dispatchArgs.push("--reviewer-identity", String(evidence.reviewer));
if (evidence["reviewer-type"] === undefined && evidence.reviewer !== undefined)
  dispatchArgs.push("--reviewer-type", "human");
const dispatched = run(dispatchArgs);
if (dispatched.code !== 0) finish(dispatched);

const templated = run(["authority-status", change, "--request", request.requestId, "--template"]);
const template = jsonFrom(templated.output);
if (templated.code !== 0 || !template) finish(templated);
template.status = status;
template.evidence = { ...template.evidence, ...evidence };
if (evidence["reviewer-type"] === undefined && evidence.reviewer !== undefined)
  template.evidence["reviewer-type"] = "human";
for (const [key, value] of Object.entries(template.evidence))
  if (typeof value === "string" && /^<.*>$/.test(value)) delete template.evidence[key];
const responsePath = join(mkdtempSync(join(tmpdir(), "dispatched-review-")), "response.json");
writeFileSync(responsePath, JSON.stringify(template, null, 2));
const recorded = run(["authority-record", change, "--request", request.requestId,
  "--response", responsePath]);
process.stdout.write(recorded.output);
process.exit(recorded.code);
