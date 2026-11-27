// A configured reviewer's result: the JSON schema it must return and the
// checks that bind each finding to the packet's scope, lines, and workspace
// before a verdict is accepted.
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { SCENARIO_COVERAGE_STATUSES } from "./review-diff.mjs";
import { relativeInside } from "../core/paths.mjs";

// No `uniqueItems` anywhere in this schema: OpenAI structured output rejects
// the keyword, failing every dispatch as an infrastructure error. `validReview`
// enforces uniqueness of all ID lists after parse.
export const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  // Structured-output providers require every property in `required`; a
  // reviewer with no scenario checklist returns an empty scenarioCoverage, and
  // one with no advisory gap an empty specGaps.
  required: ["status", "summary", "findings", "verifiedFindingIds", "scenarioCoverage", "specGaps"],
  properties: {
    status: { type: "string", enum: ["pass", "fail", "inconclusive"] },
    summary: { type: "string", minLength: 1 },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id", "severity", "path", "line", "message",
          "claimIds", "verificationCaseIds"
        ],
        properties: {
          id: { type: "string", minLength: 1 },
          severity: { type: "string", enum: ["blocker", "major", "minor"] },
          path: { type: "string" },
          line: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
          message: { type: "string", minLength: 1 },
          claimIds: {
            type: "array", items: { type: "string", minLength: 1 }
          },
          verificationCaseIds: {
            type: "array", items: { type: "string", minLength: 1 }
          }
        }
      }
    },
    verifiedFindingIds: {
      type: "array", items: { type: "string", minLength: 1 }
    },
    scenarioCoverage: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "status", "evidence"],
        properties: {
          id: { type: "string", minLength: 1 },
          status: { type: "string", enum: [...SCENARIO_COVERAGE_STATUSES] },
          evidence: { anyOf: [{ type: "string" }, { type: "null" }] }
        }
      }
    },
    specGaps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["scenario", "reason"],
        properties: {
          scenario: { type: "string", minLength: 1 },
          reason: { type: "string" }
        }
      }
    }
  }
};

export function text(value) {
  return String(value || "").trim();
}

export function claudeResultEnvelope(stdout) {
  const source = String(stdout || "").trim();
  if (!source) return null;
  const parsed = parseJson(source);
  const events = Array.isArray(parsed) ? parsed
    : parsed && typeof parsed === "object" ? [parsed]
      : source.split(/\r?\n/).filter(Boolean).map(parseJson);
  if (!events.length || events.some((event) => !event || typeof event !== "object"))
    return null;
  const result = [...events].reverse().find((event) => event.type === "result") || null;
  if (!result) return { envelopeError: "missing-result" };
  const sessions = [...new Set(events.map((event) => text(event.session_id)).filter(Boolean))];
  if (sessions.length > 1)
    return { ...result, session_id: text(result.session_id) || null,
      envelopeError: "conflicting-session-ids" };
  return { ...result, session_id: sessions[0] || null };
}

export function diagnostic(result) {
  return text(result?.stderr || result?.error?.message) ||
    `process exited with status ${result?.status ?? "unknown"}`;
}

function validStringList(value) {
  // Uniqueness over trimmed values: the attempt store trims IDs before its
  // own duplicate check, so "F1" and " F1" passing here as distinct would
  // throw after dispatch and leave the request indeterminate.
  if (!Array.isArray(value)) return false;
  const trimmed = value.map((item) => typeof item === "string" ? item.trim() : "");
  return trimmed.every((item) => item.length > 0) &&
    new Set(trimmed).size === trimmed.length;
}

export function validReviewFinding(finding, ids) {
  if (!finding || typeof finding !== "object" || Array.isArray(finding) ||
      !text(finding.id) || ids.has(text(finding.id)) ||
      !["blocker", "major", "minor"].includes(finding.severity) ||
      typeof finding.path !== "string" ||
      !(finding.line === null || Number.isInteger(finding.line) && finding.line >= 1) ||
      !text(finding.message) || !validStringList(finding.claimIds) ||
      !validStringList(finding.verificationCaseIds)) return false;
  ids.add(text(finding.id));
  return true;
}

export function validReview(review) {
  if (!review || typeof review !== "object" || Array.isArray(review) ||
      !["pass", "fail", "inconclusive"].includes(review.status) ||
      !text(review.summary) || !Array.isArray(review.findings) ||
      !validStringList(review.verifiedFindingIds)) return false;
  const ids = new Set();
  for (const finding of review.findings)
    if (!validReviewFinding(finding, ids)) return false;
  return true;
}

// A closure round verifies the first-round findings the repair closed. All of
// them is the normal answer. A reviewer that still sees a problem may close
// only some, but then the result must be a verdict that says why: not a pass,
// every verified ID a first-round ID, and a blocker or major finding reported.
// The IDs it leaves out stay open. `status` absent keeps the exact rule.
export function deltaClosureIssue({ expected, verified, status, findings }) {
  const want = [...new Set((expected || []).map(String))].sort();
  const got = [...new Set((verified || []).map(String))].sort();
  if (JSON.stringify(want) === JSON.stringify(got)) return null;
  const partial = got.every((id) => want.includes(id)) && Boolean(status) && status !== "pass" &&
    (findings || []).some((finding) => ["blocker", "major"].includes(finding?.severity));
  if (partial) return null;
  return `delta closure must verify exactly: ${want.join(", ") || "<none>"}` +
    " (a result that is not a pass may verify fewer only by also reporting a blocker or major finding)";
}

// A delta packet, or any packet after a human review with open blocker/major
// findings, carries closureFindings the response must verify.
function deltaFindingIssue(review, packet) {
  if (!Array.isArray(packet?.closureFindings?.ids)) return null;
  return deltaClosureIssue({
    expected: packet.closureFindings.ids, verified: review?.verifiedFindingIds,
    status: review?.status, findings: review?.findings
  });
}

function findingLineIssue(finding, binding, candidate) {
  if (finding.line === null) return null;
  let lines;
  try { lines = readFileSync(candidate, "utf8").split(/\r?\n/).length; }
  catch { return `${finding.id}: path '${binding.raw}' cannot be read from the reviewed workspace`; }
  return finding.line > lines
    ? `${finding.id}: line ${finding.line} is outside '${binding.raw}' (${lines} line(s))`
    : null;
}

function findingScopeBinding(finding, scopePaths, inspections, manifest) {
  const raw = String(finding.path || "").replace(/\\/g, "/")
    .replace(/^\.\//, "");
  if (!raw || isAbsolute(raw) || raw.split("/").includes(".."))
    return { issue: `${finding.id}: invalid finding path '${finding.path || "<empty>"}'` };
  const aliases = new Set([raw]);
  const contract = inspections.get("contract")?.workspacePath;
  const root = inspections.get("root")?.workspacePath;
  if (contract && root) {
    const prefix = relative(resolve(root), resolve(contract)).replace(/\\/g, "/");
    if (prefix && !prefix.startsWith("../") && !isAbsolute(prefix)) {
      for (const value of [raw, raw.replace(/^root\//, "")])
        if (value.startsWith(`${prefix}/`))
          aliases.add(`contract/${value.slice(prefix.length + 1)}`);
    }
  }
  // A reviewer reading the superproject names submodule files through root
  // (`root/services/x/file.go`); bind them to the repository declared there.
  for (const [repositoryId, entry] of inspections) {
    const prefix = typeof entry?.relativePath === "string"
      ? entry.relativePath.replace(/\\/g, "/").replace(/\/+$/, "") : "";
    if (repositoryId === "root" || !prefix || prefix === "." || prefix.startsWith("../"))
      continue;
    for (const value of [raw, raw.replace(/^root\//, "")])
      if (value.startsWith(`${prefix}/`))
        aliases.add(`${repositoryId}/${value.slice(prefix.length + 1)}`);
  }
  // Canonical packet identities are authoritative; suffix matching is only
  // for shorthand findings and must not make an exact identity ambiguous.
  const matches = scopePaths.includes(raw) ? [raw] : [...new Set(scopePaths.flatMap((candidate) => {
    if ([...aliases].some((alias) => candidate === alias || candidate.endsWith(`/${alias}`)))
      return [candidate];
    // Resume immutable pre-upgrade packets whose contract manifest used a
    // directory identity. New packets dispatch individual files, so a new
    // delta never inherits a broader directory scope through this fallback.
    const row = manifest.get(candidate);
    if (row?.repositoryId !== "contract" || row.kind !== "contract-artifact" || !contract)
      return [];
    try { if (!lstatSync(resolve(contract, row.path)).isDirectory()) return []; }
    catch { return []; }
    return [...aliases, `contract/${raw}`].filter((alias) => alias.startsWith(`${candidate}/`));
  }))];
  if (matches.length === 0) {
    // A real problem in a root file the packet did not send (a caller the
    // change must also fix) is a finding the agent repairs after widening
    // the task's paths, not an unbindable result that stops the user.
    const outside = outsideScopeBinding(raw, inspections);
    if (outside) return outside;
  }
  if (matches.length !== 1)
    return { issue: `${finding.id}: path '${raw}' is outside the dispatched review scope` };
  const scoped = matches[0];
  const separator = scoped.indexOf("/");
  return {
    raw, scoped,
    repositoryId: separator === -1 ? "root" : scoped.slice(0, separator),
    repositoryPath: separator === -1 ? scoped : scoped.slice(separator + 1)
  };
}

// An existing file of the root workspace, named plainly or as `root/<path>`.
function outsideScopeBinding(raw, inspections) {
  const workspace = inspections.get("root")?.workspacePath;
  const repositoryPath = raw.replace(/^root\//, "");
  if (!workspace || [...inspections.keys()].some((id) => id !== "root" && raw.startsWith(`${id}/`)))
    return null;
  const candidate = resolve(workspace, repositoryPath);
  // A file inside another repository's workspace (a submodule, the change's
  // contract) belongs to that repository, not root: still refused.
  for (const [id, entry] of inspections) {
    if (id === "root" || !entry?.workspacePath) continue;
    const inner = relative(resolve(entry.workspacePath), candidate);
    if (inner && relativeInside(inner)) return null;
  }
  try { if (!lstatSync(candidate).isFile()) return null; }
  catch { return null; }
  return { raw, scoped: `root/${repositoryPath}`, repositoryId: "root", repositoryPath, outsideScope: true };
}

export const OUTSIDE_SCOPE_NOTE = "(outside the dispatched review scope: widen the task's paths with " +
  "change amend before repairing it) ";

function findingWorkspaceIssue(finding, binding, inspections, manifest) {
  const inspection = inspections.get(binding.repositoryId);
  if (!inspection?.workspacePath)
    return `${finding.id}: review packet has no workspace for repository '${binding.repositoryId}'`;
  const workspaceRoot = resolve(inspection.workspacePath);
  const candidate = resolve(workspaceRoot, binding.repositoryPath);
  const fromRoot = relative(workspaceRoot, candidate);
  if (!fromRoot || !relativeInside(fromRoot))
    return `${finding.id}: path '${binding.raw}' does not resolve inside repository '${binding.repositoryId}'`;
  if (!existsSync(candidate)) {
    const identity = manifest.get(binding.scoped)?.identity;
    return ["deleted", "reverted-to-base"].includes(identity)
      ? null
      : `${finding.id}: path '${binding.raw}' does not exist in the reviewed workspace`;
  }
  let realRelative;
  try { realRelative = relative(realpathSync(workspaceRoot), realpathSync(candidate)); }
  catch { return `${finding.id}: path '${binding.raw}' cannot be resolved in the reviewed workspace`; }
  if (!realRelative || !relativeInside(realRelative))
    return `${finding.id}: path '${binding.raw}' does not resolve inside repository '${binding.repositoryId}'`;
  return findingLineIssue(finding, binding, candidate);
}

export function reviewFindingIssues(review, packet) {
  const issues = [];
  const deltaIssue = deltaFindingIssue(review, packet);
  if (deltaIssue) issues.push(deltaIssue);
  const scopePaths = Array.isArray(packet?.reviewScope?.paths)
    ? packet.reviewScope.paths.map((value) => String(value).replace(/\\/g, "/"))
    : [];
  // Legacy/manual packets did not carry a scoped manifest. Preserve their
  // schema validation while making every current configured dispatch fail
  // closed against the exact workspace it advertised.
  if (!Array.isArray(packet?.reviewScope?.paths) || !review?.findings?.length) return issues;
  const inspections = new Map((packet.changedSurface?.inspection || [])
    .map((entry) => [String(entry.repositoryId), entry]));
  const manifest = new Map((packet.changedSurface?.manifest || [])
    .map((entry) => [`${entry.repositoryId}/${entry.path}`, entry]));
  for (const finding of review.findings) {
    const binding = findingScopeBinding(finding, scopePaths, inspections, manifest);
    const issue = binding.issue ||
      findingWorkspaceIssue(finding, binding, inspections, manifest);
    if (issue) issues.push(issue);
  }
  return issues;
}

export function reviewPacketIssues(packet) {
  return reviewFindingIssues({ findings:
    (packet?.reviewScope?.paths || []).map((path) => ({ id: "packet", path, line: null })),
    verifiedFindingIds: packet?.closureFindings?.ids || []
  }, packet);
}

export function normalizeReviewFindingPaths(review, packet) {
  const issues = reviewFindingIssues(review, packet);
  if (issues.length) throw new Error(issues.join("; "));
  if (!Array.isArray(packet?.reviewScope?.paths)) return review;
  const inspections = new Map((packet.changedSurface?.inspection || [])
    .map((entry) => [String(entry.repositoryId), entry]));
  const manifest = new Map((packet.changedSurface?.manifest || [])
    .map((entry) => [`${entry.repositoryId}/${entry.path}`, entry]));
  return { ...review, findings: review.findings.map((finding) => {
    const binding = findingScopeBinding(finding, packet.reviewScope.paths, inspections, manifest);
    return binding.outsideScope
      ? { ...finding, path: binding.scoped, outsideScope: true,
        message: String(finding.message).startsWith(OUTSIDE_SCOPE_NOTE)
          ? finding.message : `${OUTSIDE_SCOPE_NOTE}${finding.message}` }
      : { ...finding, path: binding.scoped };
  }) };
}

export function parseJson(value) {
  try { return JSON.parse(String(value)); }
  catch { return null; }
}
