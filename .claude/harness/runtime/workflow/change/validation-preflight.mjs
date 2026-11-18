// Checks validation runs before the change itself: OpenSpec strict lint,
// claim and task contracts, proposal classification, implementation tasks,
// and normalized acceptance.
import { spawnSync } from "node:child_process";
import { openSpecEnvironment } from "../../core/project-installation.mjs";
import { readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { taskMetadata } from "../../contracts/change-artifacts.mjs";
import { probeOpenSpecVersion, recordStrictLintPass, strictLintMemoKey, strictLintPassed } from "../../core/tool-identity.mjs";
import { bestEffort } from "../../core/best-effort.mjs";

// A legacy rapid change declares skip_specs and has no deltas to lint; a
// compiled rapid change drops the marker, carries concise deltas, and is
// linted like any other.
export function openSpecStrictLintApplies(state, dir, read = readFileSync) {
  if (state?.schema !== "foundation-rapid") return true;
  let marker = "";
  try { marker = String(read(join(dir, ".openspec.yaml"), "utf8")); } catch { return false; }
  return !/^\s*skip_specs:\s*true\s*$/m.test(marker);
}

// Module scope, taking `fail` explicitly: the check has no runtime state and
// the deterministic tests exercise it against a stubbed CLI.
export function assertOpenSpecStrictValid(id, dir, fail, options = {}) {
  // dir is <projectRoot>/openspec/changes/<id> for both the root and the
  // sandbox copy, so the CLI runs against whichever tree is being validated.
  const projectRoot = resolve(dir, "..", "..", "..");
  const probe = probeOpenSpecVersion({ cwd: projectRoot, timeout: 15_000 });
  if (probe.error || probe.status !== 0) {
    // Before Build the harness has not prepared its tools yet, so the lint
    // waits for preparation. Once Prove needs the agreement, a skipped lint
    // would let an invalid delta reach archive after the code landed.
    if (options.requireCli)
      fail(`OpenSpec CLI is required for strict spec validation of '${id}' before Prove; ` +
        "the harness prepares it with the next 'advance' (npm access needed when it is not installed)");
    if (!options.quiet)
      console.error("WARNING: OpenSpec CLI unavailable; strict spec lint deferred to tool preparation");
    return;
  }
  // A pass is reused only for byte-identical lint inputs under the same CLI;
  // failures are never memoized, so a repaired packet always re-lints.
  const memoKey = strictLintMemoKey(projectRoot, id, probe.identity);
  if (strictLintPassed(memoKey, projectRoot)) return;
  const lint = spawnSync("openspec",
    ["validate", id, "--type", "change", "--strict", "--json", "--no-interactive"],
    { cwd: projectRoot, encoding: "utf8", timeout: 60_000, env: openSpecEnvironment(projectRoot) });
  if (lint.error || lint.status !== 0) {
    const raw = `${lint.stdout || ""}\n${lint.stderr || ""}`.trim();
    let detail = raw.slice(0, 4000);
    bestEffort(() => {
      const report = JSON.parse(lint.stdout);
      const issues = (report.items || []).flatMap((item) => item.issues || []);
      if (issues.length) detail = issues.map((issue) =>
        `- ${issue.path || "spec"}: ${issue.message}`).join("\n");
    }); // retain bounded raw CLI output
    fail(`OpenSpec strict validation failed for '${id}'; repair the spec delta ` +
      `wording before Prove:\n${detail}\nRecovery: keep only non-empty delta files; ` +
      "each starts with ## ADDED Requirements, ## MODIFIED Requirements, or " +
      "## REMOVED Requirements.");
  }
  if (memoKey && strictLintMemoKey(projectRoot, id, probe.identity) === memoKey)
    recordStrictLintPass(memoKey, projectRoot);
}

export function claimContractIssues(claims = [], selectedRepositoryIds = new Set()) {
  return claims.flatMap((claim) => {
    const issues = [];
    if (!["low", "medium", "high"].includes(claim.impact || ""))
      issues.push(`claim '${claim.id}' requires impact low|medium|high`);
    if (claim.repositories !== undefined &&
        (!Array.isArray(claim.repositories) || claim.repositories.length === 0 ||
         claim.repositories.some((repository) => !selectedRepositoryIds.has(repository))))
      issues.push(`claim '${claim.id}' repositories must reference selected repositories`);
    if ((claim.repositories || []).length > 1 &&
        !claim.capabilities.includes("cross-repo-contract"))
      issues.push(`claim '${claim.id}' spans repositories and requires cross-repo-contract`);
    return issues;
  });
}

export function taskContractIssues(tasks = [], claims = [],
  selectedRepositoryIds = new Set(), multiRepository = false) {
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));
  const issues = [];
  for (const task of tasks) {
    const metadata = taskMetadata(task);
    if (metadata.claims.length > 50)
      issues.push(`task '${task.id}' references more than 50 claims`);
    const unknownClaims = metadata.claims.filter((claim) => !claimById.has(claim));
    if (unknownClaims.length)
      issues.push(`task '${task.id}' references unknown claim(s): ${unknownClaims.join(", ")}`);
    const outOfScopeClaims = metadata.claims.filter((claimId) => {
      const repositories = claimById.get(claimId)?.repositories || [];
      return repositories.length > 0 && !repositories.includes(metadata.repository);
    });
    if (outOfScopeClaims.length)
      issues.push(`task '${task.id}' references claim(s) outside repository '${metadata.repository}': ${outOfScopeClaims.join(", ")}`);
  }
  if (!multiRepository) return issues;
  const unscopedTasks = tasks.filter((task) =>
    !/\[repo:[a-z0-9-]+\]/i.test(task.text));
  if (unscopedTasks.length)
    issues.push(`multi-repository tasks require [repo:<id>] scope (${unscopedTasks.map((task) => task.id).join(", ")})`);
  for (const task of tasks) {
    const metadata = taskMetadata(task);
    if (metadata.repository && !selectedRepositoryIds.has(metadata.repository))
      issues.push(`task '${task.id}' references unselected repository '${metadata.repository}'`);
    if (metadata.paths.some((path) =>
      isAbsolute(path) || path === ".." || path.startsWith("../") || path.includes("/../")))
      issues.push(`task '${task.id}' contains an unsafe path scope`);
    if (["implementation", "migration"].includes(metadata.kind) && metadata.paths.length === 0)
      issues.push(`multi-repository task '${task.id}' requires [paths:<repo-relative-paths>]`);
  }
  return issues;
}

export function validationPreflightIssues(id, state, missing = []) {
  const issues = [];
  if (missing.length)
    issues.push(`missing change artifacts: ${missing.join(", ")}`);
  if (state.resolutionRequired === true && !state.resolvedAt)
    issues.push(`resolve decisions for '${id}' before validation: cloop change resolve ${id} --impact <low|medium|high> --coupling <isolated|coupled> --acceptance-required|--acceptance-not-required`);
  if (!["low", "medium", "high"].includes(state.impact || ""))
    issues.push(`resolve impact for '${id}'`);
  if (!["isolated", "coupled"].includes(state.coupling || ""))
    issues.push(`resolve coupling for '${id}'`);
  if (state.acceptance?.decision === "undecided")
    issues.push(`acceptance decision is unresolved for '${id}'; ask the user whether subjective human acceptance is required, then resolve with --acceptance-required or --acceptance-not-required`);
  return issues;
}

export function proposalClassificationIssues(state, proposal = "") {
  // Version-2 changes are created by the runtime with these fields. OpenSpec
  // owns the agreement; the runtime values are only its compiled projection.
  // Grandfather older packets whose free-form proposal had no stable labels.
  if (Number(state.version || 1) < 2) return [];
  const value = String(proposal || "");
  const field = (name) => value.match(
    new RegExp(`^\\s*-\\s*\\*\\*${name}:\\*\\*\\s*([^\\n]+?)\\s*$`, "im"))?.[1]
    ?.trim().toLowerCase() || null;
  const declared = { impact: field("Impact"), coupling: field("Coupling") };
  const issues = [];
  for (const [name, allowed] of Object.entries({
    impact: ["low", "medium", "high"], coupling: ["isolated", "coupled"]
  })) {
    // Packets created before the stable labels remain valid. Current templates
    // are synchronized by resolve; when a concrete label exists, it is part of
    // the agreement and must not drift from the compiled projection.
    if (declared[name] && allowed.includes(declared[name]) && declared[name] !== state[name])
      issues.push(`proposal.md ${name} '${declared[name]}' disagrees with compiled runtime ${name} '${state[name]}'; re-resolve the agreement instead of editing machine state`);
  }
  return issues;
}

export function assertValidationPreflight(id, state, missing, fail) {
  if (state.status === "archived") fail(`change '${id}' is already archived`);
  const issues = validationPreflightIssues(id, state, missing);
  if (issues.length)
    fail(`change validation preflight failed:\n  - ${issues.join("\n  - ")}`);
}

export function validationChangeDirectory(id, source, state,
  activeChangePath, changePath) {
  return source === "active" ? activeChangePath(id, state) : changePath(id);
}

export function validateImplementationTasks(tasks, fail) {
  const taskIds = tasks.map((task) => task.id).filter(Boolean);
  if (tasks.length && taskIds.length !== tasks.length)
    fail("every implementation task requires a stable ID such as T001; tasks without one: " +
      tasks.filter((task) => !task.id).map((task) => `'${String(task.text || "").slice(0, 60)}'`).join(", ") +
      ". Set tasks[].id in the semantic draft or amendment; the compiler writes tasks.md");
  if (new Set(taskIds).size !== taskIds.length)
    fail(`tasks.md contains duplicate task IDs: ${[...new Set(taskIds.filter((id, index) =>
      taskIds.indexOf(id) !== index))].join(", ")}; give each task a unique tasks[].id in the semantic draft or amendment`);
  const lifecycleTasks = tasks.filter((task) =>
    !task.done && /(?:^|[\s(`"'])\/(?:prove|land)\b/.test(task.text));
  if (lifecycleTasks.length)
    fail(`tasks.md contains a lifecycle gate (${lifecycleTasks.map((task) => task.id || task.text).join(", ")}); ` +
      "/prove and /land are commands, not implementation tasks; remove those tasks from the draft or amendment");
  return taskIds;
}

export function normalizeValidationAcceptance(id, state, claims, acceptance,
  fail, warn = console.error, timestamp = new Date().toISOString()) {
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));
  const unknown = acceptance.claimIds.filter((claim) => !claimById.has(claim));
  if (unknown.length)
    fail(`acceptance references unknown claim(s): ${unknown.join(", ")}`);
  let resolved = acceptance;
  if (resolved.required && resolved.claimIds.length === 0) {
    if (resolved.version < 2) {
      resolved = {
        ...resolved,
        claimIds: claims.map((claim) => claim.id),
        scopeOrigin: "legacy-all"
      };
      warn("WARNING: migrated legacy acceptance scope to all current claims");
    } else {
      fail(`change '${id}' requires acceptance but nothing is in scope. Either name the ` +
        "claims a person is accepting:\n" +
        `  cloop change resolve ${id} --impact <impact> --coupling <coupling> ` +
        "--acceptance-required --acceptance-reason <why> --acceptance-claims <ids>\n" +
        "or declare capability 'acceptance' on a claim in evidence.yaml. To withdraw the " +
        "requirement instead, re-resolve with --acceptance-not-required.");
    }
  }
  if (!resolved.required) return resolved;
  if (resolved.scopeOrigin === "claim-capability")
    warn(`WARNING: acceptance stays required because claim(s) ${resolved.claimIds.join(", ")} declare capability 'acceptance'; --acceptance-not-required cannot drop a human gate while that capability remains in evidence.yaml`);
  state.acceptance = {
    version: 2,
    decision: "required",
    required: true,
    reason: resolved.reason || "declared evidence capability",
    claimIds: resolved.claimIds,
    scopeOrigin: resolved.scopeOrigin || "explicit",
    declaredAt: state.acceptance?.declaredAt || timestamp
  };
  return resolved;
}
