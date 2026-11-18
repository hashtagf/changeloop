import { carryApprovalAcrossBookkeeping, currentWaivers } from "../../core/user-decisions.mjs";
import { builtInCovers, builtInOwedCapabilities, inferredAdvisoryNext } from "./built-in-capabilities.mjs";
import { spawnSync } from "node:child_process";
import { openSpecEnvironment } from '../../core/project-installation.mjs';
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { auditTraceability } from "../../evidence/traceability.mjs";
import { detectEvidenceWiring } from "../../evidence/evidence-bootstrap.mjs";
import { nextAfterValidate } from "../../core/next-step.mjs";
import { gateRepairPlan } from "../../core/convergent-gate.mjs";
import { compiledExecutionSurfaceValue } from "../../core/authority-policy.mjs";
import {
  taskBlocks, taskMetadata
} from "../../contracts/change-artifacts.mjs";
import { createSpecDeltaValidator } from "../validation/spec-delta.mjs";
import {
  probeOpenSpecVersion, recordStrictLintPass, strictLintMemoKey, strictLintPassed
} from "../../core/tool-identity.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import { waiveGateOperation } from "./gate-waivers.mjs";
import { durableDecisionMetadataIssues } from "./durable-decisions.mjs";
import {
  missingHighRiskQualityCapabilities, requiredProvidersOperation, reviewCoveredAdvisories
} from "./required-providers.mjs";
import { createGroundingValidation } from "./grounding-validation.mjs";

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

export function validationDocumentBudgets(state) {
  return ["xs", "s"].includes(String(state.size || "").toLowerCase()) ||
    state.impact === "low"
    ? { "proposal.md": 1200, "design.md": 2000, "tasks.md": 1200 }
    : { "proposal.md": 2400, "design.md": 3600, "tasks.md": 2400 };
}

export function lockValidatedGrounding(state, grounding, fingerprint, timestamp) {
  if (!grounding?.firstLock) return;
  state.groundingDigest = grounding.digest;
  state.groundingLockedAt = grounding.lockedAt;
  if (!state.groundingReopenPending) return;
  state.groundingReopens = [...(state.groundingReopens || []), {
    ...state.groundingReopenPending,
    newDigest: grounding.digest,
    newLockedAt: grounding.lockedAt,
    contractFingerprint: fingerprint,
    completedAt: timestamp
  }];
  delete state.groundingReopenPending;
}

export function warnValidationDocumentBudgets(dir, state,
  exists = existsSync, read = readFileSync, warn = console.error) {
  for (const [name, limit] of Object.entries(validationDocumentBudgets(state))) {
    const path = join(dir, name);
    if (!exists(path)) continue;
    const words = read(path, "utf8").trim().split(/\s+/).filter(Boolean).length;
    if (words > limit)
      warn(`WARNING: ${name} is ${words} words (soft budget ${limit}); ` +
        "move duplicated or machine-only content into an appendix instead of trimming content the reader needs");
  }
}

export function reportDeclaredSurfaceForecast(id, state, quiet, covered,
  forecast, warn = console.error) {
  if (!state.declaredSurface?.length || quiet) return;
  const missing = forecast(state.declaredSurface).capabilities
    .filter((capability) => !covered.has(capability));
  if (!missing.length) return;
  warn(`WARNING: declared surface forecasts ${missing.join(", ")} with no provider`);
  warn("  advance wires detected project-owned commands at Prove: cloop advance " + id + " --through proven");
  warn("  inspect first: cloop doctor --stage prove --change " + id);
  if (missing.includes("review"))
    warn("  review needs a configured fresh reviewer at Prove; a one-family project selects codex-sol or claude-opus and commits review.diversity='single-model' while keeping independence required");
  warn("  anything left unwired is carried as a non-blocking advisory, not a gate");
}

export function reportValidationReviewAssurance(quiet, resolvable, policy,
  assurance, note = console.error) {
  if (quiet || !resolvable) return null;
  // A change no review runs on has no reviewer posture worth announcing.
  if (assurance && policy.required)
    note(`NOTE: review assurance posture: ${assurance.summary}`);
  if (policy.required && !policy.independenceWaived) {
    note("NOTE: this change requires review evidence; an independent reviewer must exist by Prove");
    note("  one-family project: select codex-sol or claude-opus and set review.diversity='single-model'; the reviewer still uses a distinct identity and fresh session");
  }
  return assurance;
}

export function createChangeValidationRuntime({
  markBlocked = (..._args) => {},
  root,
  activeChangePath,
  relevantHash,
  changePath,
  walk,
  loadRuntime,
  saveRuntime,
  evidence,
  selectedRepositories,
  providerCapability,
  providerConfig,
  resolvedAcceptance,
  reviewPolicy,
  reviewAssurancePosture = (..._args) => null,
  policyCapabilities,
  policyCapabilityTrigger,
  // (id, configuredCapabilities) -> agent-owned configure-provider EDIT rows
  // for work-type capabilities the change has no provider for.
  policyProviderSetupActions = (..._args) => [],
  changedSurfaceResolvable,
  forecastCapabilities,
  rawExecution,
  handoffContract,
  contractFingerprint,
  commandExists,
  stableHash,
  fileDigest,
  pathInside,
  knownProviders,
  writeJson,
  now,
  authorityPreflight = (..._args) => ({ status: "READY", blockers: [], decision: null }),
  executionContract = null,
  foundationPolicy = () => ({ quality: { changeGate: "off" } }),
  fail: terminalFail
}) {
  let activeValidationCapture = null;
  const fail = (message) => {
    if (activeValidationCapture) {
      activeValidationCapture.push(String(message));
      return;
    }
    return terminalFail(message);
  };

  function capturedIssueLines(name, messages) {
    const prefix = `${name} validation failed:\n  - `;
    return messages.flatMap((message) => message.startsWith(prefix)
      ? message.slice(prefix.length).split("\n  - ") : [message]);
  }

  function captureValidationGroup(groups, name, operation) {
    const messages = [];
    activeValidationCapture = messages;
    let value;
    try {
      value = operation();
    } catch (error) {
      // A failed shape check may make its dependent code unreadable. Preserve
      // the explicit finding and skip that dependency instead of inventing a
      // second error from a TypeError. Unexpected failures still surface.
      if (messages.length === 0 || !(error instanceof TypeError)) throw error;
    } finally {
      activeValidationCapture = null;
    }
    const issues = capturedIssueLines(name, messages);
    if (issues.length) groups.push({ name, issues });
    return value;
  }

  function failCollectedValidation(groups) {
    const populated = groups.filter((group) => group.issues?.length);
    if (!populated.length) return;
    // Keep one physical line per group. Agents sometimes pipe this bounded
    // output through head/tail despite the public workflow; line-bounded
    // rendering still exposes every independent group in that failure mode.
    const rendered = populated.map((group) => `[${group.name}] ` +
      group.issues.map((issue) => issue.replace(/\s*\n\s*/g, " ")).join("; "))
      .join("\n");
    const limit = 16_000;
    const bounded = rendered.length > limit
      ? `${rendered.slice(0, limit)}\n  - output truncated; repair these findings and validate again`
      : rendered;
    const repairPlan = gateRepairPlan(populated.map((group, groupIndex) => ({
      id: `change-group-${groupIndex + 1}`,
      phase: "change",
      gate: group.name,
      classification: "contract",
      rootCause: group.name,
      message: `Repair all ${group.issues.length} finding(s) in ${group.name}`
    })), { phase: "change", gate: "change-validation" });
    fail(`change validation failed (${populated.length} groups):\n${bounded}\n` +
      `Repair plan: ${JSON.stringify(repairPlan)}\n` +
      "Recovery: repair only fields named above; do not add planned readSet rows " +
      "unless a finding requires them. Re-run change validate as a standalone " +
      "command without a pipe.");
  }

  // `dir` is an override for the one case where the ledger is no longer at the
  // active path: an archive that moved the change directory and then failed.
  function pendingTasks(id, dir = activeChangePath(id)) {
    const path = join(dir, "tasks.md");
    if (!existsSync(path)) return [];
    return taskBlocks(readFileSync(path, "utf8")).filter((task) => !task.done);
  }

  const {
    assertExistingCapabilityOperations, assertNewCapabilitiesAreAdditive,
    assertNoDroppedScenarios,
    changeSpecScenarios,
    droppedScenarioFindings,
    newCapabilityOperationFindings
  } = createSpecDeltaValidator({ root, activeChangePath, walk, fail });

  function validationRepositories(id, state, dir) {
    const rootSource = resolve(dir) === resolve(changePath(id));
    return selectedRepositories(id, state, fail, {
      changeDir: dir,
      useTargetPaths: rootSource
    });
  }

  function traceabilityAuditValue(id) {
    const state = loadRuntime(id);
    const dir = activeChangePath(id, state);
    const contract = evidence(id, dir);
    const tasks = taskBlocks(readFileSync(join(dir, "tasks.md"), "utf8"))
      .map(taskMetadata);
    const scenarios = state.schema === "foundation-standard"
      ? changeSpecScenarios(id, dir)
      : [];
    const configuredCapabilities = Object.entries(contract.providers || {})
      .map(([provider, config]) => providerCapability(provider, config))
      .filter(Boolean);
    return auditTraceability({
      id,
      state,
      contract,
      tasks,
      scenarios,
      configuredCapabilities
    });
  }

  function showTraceabilityAudit(id, flags = {}) {
    const audit = traceabilityAuditValue(id);
    if (flags.json) console.log(JSON.stringify(audit, null, 2));
    else {
      console.log(`TRACEABILITY ${id}: ${audit.status.toUpperCase()}`);
      console.log(`  scenarios: ${audit.summary.scenarios}; claims: ${audit.summary.claims}; tasks: ${audit.summary.tasks}`);
      console.log(`  linked claims: ${audit.summary.linkedClaims}/${audit.summary.claims}; linked tasks: ${audit.summary.linkedTasks}/${audit.summary.tasks}`);
      for (const finding of audit.findings)
        console.log(`  ${finding.level.toUpperCase().padEnd(7)} ${finding.code}: ${finding.message}`);
    }
    // A failing traceability audit is a refusal, not a crash. It exits without
    // `die` because the findings are already printed above, so it declares the
    // block explicitly instead.
    if (audit.status === "error") {
      const finding = audit.findings.find((item) => item.level === "error");
      markBlocked({
        code: "contract-invalid",
        reason: finding ? `${finding.code}: ${finding.message}` : "traceability audit failed"
      });
      process.exitCode = 1;
    }
  }

  function changeArtifactGaps(state, dir) {
    const conditional = Number(state.artifactDefaultsVersion || 0) >= 2;
    const required = state.schema === "foundation-rapid"
      ? ["proposal.md", "tasks.md", "evidence.yaml"]
      : ["proposal.md", "tasks.md", "evidence.yaml"];
    if (state.schema === "foundation-standard" &&
        (!conditional || state.decisionMetadataRequired))
      required.push("design.md");
    if (state.groundingRequired) required.push("grounding.yaml");
    // `repositories.yaml` sits in both schemas' `apply.requires` and is written
    // by `createChange`, but nothing checked it here: deleting the file passed
    // `change validate` and only failed later, inside Land, where the recovery
    // is expensive. Gated with `execution.yaml` because the two arrived
    // together in the version-2 packet.
    if (Number(state.version || 1) >= 2 && !conditional)
      required.push("execution.yaml", "repositories.yaml");
    if (state.externalOperationsVersion)
      required.push("handoffs.yaml");
    const missing = required.filter((name) => !existsSync(join(dir, name)));
    if (state.schema === "foundation-standard") {
      let specCount = 0;
      walk(join(dir, "specs"), () => { specCount += 1; });
      if (specCount === 0) missing.push("specs/**/*.md");
    }
    return missing;
  }

  /** @type {Array<[string, RegExp]>} */ const scaffoldPatterns = [
    ["replace-with marker", /replace-with/i],
    ["unresolved clarification", /\[NEEDS CLARIFICATION(?::[^\]]*)?\]/i],
    ["unresolved TODO/TBD", /\b(?:TODO|TBD)\b/],
    ["template angle marker", /<(?:Problem|Observable|Only load-bearing|choice|constraint|meaningful alternative|operational, compatibility|Public contracts|risk|mitigation|provider|name|existing name|stable scenario name|every existing stable scenario name|action or event|complete modified observable behavior|behavior being retired|replacement, compatibility consequence|Explicitly excluded|code, API|semantic boundary|path or surface|focused check)[^>]*>/i],
    ["template removal comment", /<!--[\s\S]*?(?:delete (?:this section )?when unused|include the complete modified requirement|name removed behavior|use only when the canonical spec)[\s\S]*?-->/i]
  ];

  function assertNoScaffolds(state, dir) {
    // Strict scaffold rejection is a contract for changes created under the
    // grounding workflow. Grandfathering older ledgers avoids turning a
    // runtime upgrade into unrelated cleanup work across every active change.
    if (!state.groundingRequired) return;
    const files = [
      "proposal.md", "design.md", "tasks.md", "evidence.yaml",
      "execution.yaml", "repositories.yaml", "handoffs.yaml"
    ];
    if (state.groundingRequired) files.push("grounding.yaml");
    const specsRoot = join(dir, "specs");
    walk(specsRoot, (path) => {
      if (path.endsWith(".md")) files.push(relative(dir, path));
    });
    const findings = [];
    for (const name of [...new Set(files)]) {
      const artifact = join(dir, name);
      if (!existsSync(artifact)) continue;
      const content = readFileSync(artifact, "utf8");
      for (const [label, pattern] of scaffoldPatterns) {
        const match = pattern.exec(content);
        if (!match) continue;
        const line = content.slice(0, match.index).split(/\r?\n/).length;
        const excerpt = match[0].split(/\r?\n/)[0].trim().slice(0, 72);
        findings.push(`${name}:${line}: ${label}${excerpt ? ` (${excerpt})` : ""}`);
      }
    }
    if (findings.length)
      fail(`change artifacts still contain scaffold or unresolved content: ${findings.join("; ")}`);
  }

  function assertArchiveSafeArtifacts(id, dir) {
    const runnable = [];
    // OpenSpec archives the complete packet under openspec/changes/archive.
    // Runnable source copied here as "test topology" is then rediscovered by
    // Node, pytest, Jest, and similar default test globs from an invalid cwd.
    // A packet records source paths and digests in grounding.yaml; it never
    // needs an executable copy of the inspected file.
    const executableExtensions = new Set([
      ".c", ".cc", ".cpp", ".cs", ".go", ".java", ".js", ".jsx",
      ".kt", ".mjs", ".cjs", ".php", ".py", ".rb", ".rs", ".sh",
      ".swift", ".ts", ".tsx"
    ]);
    walk(dir, (path) => {
      const rel = relative(dir, path).replaceAll("\\", "/");
      const name = rel.toLowerCase();
      const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
      if (executableExtensions.has(extension)) runnable.push(rel);
    });
    if (runnable.length)
      fail(`${id} contains runnable source inside the change packet: ${runnable.sort().join(", ")}. ` +
        "Record test-topology paths and digests in grounding.yaml; do not copy executable files into openspec/changes because archive test discovery will execute them.");
  }

  function validate(id, source = "root", options = {}) {
    const state = loadRuntime(id);
    const dir = validationChangeDirectory(
      id, source, state, activeChangePath, changePath);
    assertValidationPreflight(id, state, changeArtifactGaps(state, dir), fail);
    const classificationIssues = proposalClassificationIssues(
      state, readFileSync(join(dir, "proposal.md"), "utf8"));
    if (classificationIssues.length)
      fail(`change agreement classification failed:\n  - ${classificationIssues.join("\n  - ")}`);
    assertArchiveSafeArtifacts(id, dir);
    assertNoScaffolds(state, dir);
    const contractDiagnostics = [];
    if (state.decisionMetadataRequired) {
      const design = readFileSync(join(dir, "design.md"), "utf8");
      contractDiagnostics.push(...durableDecisionMetadataIssues(design)
        .map((issue) => `design: ${issue}`));
    }
    const tasks = readFileSync(join(dir, "tasks.md"), "utf8");
    const parsedTasks = taskBlocks(tasks);
    const executableEvidence = evidence(id, dir);
    const claims = executableEvidence.claims;
    const selectedRepositoryIds = new Set(validationRepositories(id, state, dir)
      .map((repository) => repository.id));
    contractDiagnostics.push(...claimContractIssues(claims, selectedRepositoryIds)
      .map((issue) => `claims: ${issue}`));
    const selected = validationRepositories(id, state, dir);
    contractDiagnostics.push(...taskContractIssues(
      parsedTasks, claims, selectedRepositoryIds, selected.length > 1)
      .map((issue) => `tasks: ${issue}`));
    const grounding = groundingValue(id, state, dir, parsedTasks, [{
      name: "cross-artifact contract", issues: contractDiagnostics
    }]);
    assertNewCapabilitiesAreAdditive(id, dir);
    assertExistingCapabilityOperations(id, dir);
    assertNoDroppedScenarios(id, dir);
    // The OpenSpec strict lint used to surface only inside 'openspec archive',
    // after the code had landed, so a pure wording defect forced a re-prove.
    // Same tool, same mode, earlier. Quiet changes presentation only; skipping
    // the subprocess here let an invalid agreement travel all the way to Land.
    if (openSpecStrictLintApplies(state, dir))
      assertOpenSpecStrictValid(id, dir, fail, {
        quiet: options.quiet, requireCli: options.requireOpenSpec === true
      });

    // The gate is about a task that names a lifecycle *command*, so the slash
    // has to start a token. Matching a bare `/land` anywhere also matched the
    // path `runtime/workflow/land/land-runtime.mjs`, which made every change that
    // declares that file's path in `[paths:]` unvalidatable — the guard blocked
    // work on the very code it guards.
    const taskIds = validateImplementationTasks(parsedTasks, fail);

    const claimById = new Map(claims.map((claim) => [claim.id, claim]));
    handoffContract(id, {
      state,
      claimIds: new Set(claimById.keys()),
      taskIds: new Set(taskIds)
    });

    const acceptance = resolvedAcceptance(id, state, { claims });
    normalizeValidationAcceptance(id, state, claims, acceptance,
      fail, console.error, acceptance.required ? now() : null);

    if (claims.some((claim) => claim.impact === "high")) {
      state.reviewRequired = true;
      delete state.reviewKeywordOnly;
    }
    state.evidenceCapabilities = [...new Set(claims.flatMap((claim) => claim.capabilities))];
    const budgetReviewRisk = changedSurfaceResolvable(id, state)
      ? reviewPolicy(id, state, executableEvidence) : null;
    state.executionSurface = compiledExecutionSurfaceValue({
      tasks: parsedTasks,
      claims,
      providers: executableEvidence.providers,
      repositories: selected,
      reviewTier: budgetReviewRisk?.tier || null,
      securityTriggerCount: (state.securityTriggers || []).length
    });
    const missingQuality = missingHighRiskQualityCapabilities(
      state, claims, foundationPolicy());
    if (missingQuality.length)
      fail(`${id}/evidence.yaml high-risk quality policy requires claim capabilities: ${missingQuality.join(", ")}; configure project-owned providers or record a capability waiver`);
    // Case-insensitive and `xs`-aware: this compared against the literal "S",
    // so an atomic start's own "xs" fell through to the wide budget and the
    // check only ever passed via the impact disjunct.
    warnValidationDocumentBudgets(dir, state);
    // Lock only after every validation gate above passes. A malformed task or
    // unresolved acceptance decision must not freeze a grounding ledger that
    // has never represented a valid Change contract.
    if (!options.inspect) {
      if (grounding?.firstLock)
        lockValidatedGrounding(state, grounding, contractFingerprint(id, dir), now());
      else
        lockValidatedGrounding(state, grounding, null, null);
      // Re-locking the ledger after a reopen is bookkeeping: consent given on
      // these same packet bytes follows the revision it moved to.
      carryApprovalAcrossBookkeeping(root, id, state, "validate: grounding re-locked", now);
      saveRuntime(state);
    }
    // A declared surface predicts capabilities that the *changed* surface will
    // only reveal once files exist — by which point this contract is signed and
    // its evidence collected. Warn, never fail: the forecast is a prediction the
    // author owns, and failing here would be routed around by declaring nothing.
    const coveredCapabilities = state.declaredSurface?.length && !options.quiet
      ? new Set(requiredProviders(id).map((provider) =>
        providerCapability(provider, providerConfig(id, provider))))
      : new Set();
    reportDeclaredSurfaceForecast(id, state, options.quiet,
      coveredCapabilities, forecastCapabilities);
    // Review is the one gate a change cannot wire its way out of, and the loop
    // used to reveal it at Prove — after the build is spent, and with the
    // waiver that resolves it named nowhere. A forecast only covers what is not
    // yet required; once it *is* required, saying so here is the last cheap
    // moment to find a reviewer or decide the project reviews itself.
    // Guarded for the same reason as `advisoryCapabilities`: `reviewPolicy`
    // reads the changed surface, which a multi-repository change cannot resolve
    // until its sandboxes exist. A hint must never be able to fail validate.
    const reviewResolvable = !options.quiet && changedSurfaceResolvable(id, state);
    const policy = reviewResolvable
      ? reviewPolicy(id, state, evidence(id, dir))
      : {};
    const assurance = reportValidationReviewAssurance(
      options.quiet, reviewResolvable, policy,
      reviewResolvable ? reviewAssurancePosture(policy) : null);
    const compiled = executionContract?.(id) || null;
    const preflight = compiled?.authority || authorityPreflight(id);
    if (!options.quiet) {
      console.log(`VALID ${id} (${state.schema}, ${claims.length} claims)\n  next: ${nextAfterValidate(state.status, id, state)}`);
      if (preflight.status !== "READY")
        console.log(`  authority: ${preflight.status}; ${preflight.blockers
          .map((blocker) => `${blocker.code}: ${blocker.next}`).join("; ")}`);
    }
    return {
      version: 1, changeId: id, reviewAssurance: assurance,
      authorityPreflight: preflight,
      ...(compiled ? { executionContract: compiled } : {})
    };
  }

  // A capability the policy infers from the *realized* diff is a risk hint, not
  // a contract the author signed. It can only appear once the files exist —
  // after Build — and an inferred capability nobody wired defaults to adapter
  // "external" (`evidence-contract`), so the required set grew past the point
  // where the contract could still be negotiated and Prove stopped on a gate
  // that had no way to pass. Enforce an inferred capability only where the
  // project wired a provider for it, the author declared it on a claim, or the
  // declared work type owes it and a harness-owned provider can produce it;
  // otherwise carry it as an advisory that is reported but does not block.
  //
  // `review` is deliberately unaffected: `reviewPolicy` reads the same inferred
  // set and adds review itself, and it owns a documented waiver
  // (`review.independence`, `review.diversity` in foundation.json). Downgrading
  // it here would drop a gate that has a way out rather than one that does not.
  function policyCapabilitySplit(id, contract = evidence(id)) {
    const configured = new Set(Object.entries(contract.providers || {})
      .map(([provider, config]) => providerCapability(provider, config)));
    const declared = new Set(contract.claims.flatMap((claim) => claim.capabilities || []));
    const enforced = [];
    const advisory = [];
    const state = loadRuntime(id);
    const owed = builtInOwedCapabilities(policyProviderSetupActions(id, []), (name) => providerConfig(id, name));
    for (const capability of policyCapabilities(id)) {
      const trigger = policyCapabilityTrigger(id, capability) || "";
      const npmManifestChanged = capability === "dependency-supply-chain" &&
        /(?:^|\/)package\.json$/.test(trigger) &&
        existsSync(join(state.workspace?.path || root, "package-lock.json"));
      (configured.has(capability) || declared.has(capability) || npmManifestChanged || owed.has(capability)
        ? enforced : advisory)
        .push(capability);
    }
    return { enforced, advisory };
  }

  const requiredProviders = requiredProvidersOperation.bind(null, {
    loadRuntime, relevantHash, evidence, providerCapability, reviewPolicy,
    resolvedAcceptance, policyCapabilitySplit, foundationPolicy
  });

  // Advisories record the downgrade above: dropping one silently would make
  // "the policy saw nothing" and "the policy saw something nobody wired"
  // identical in the evidence, the distinction a later reader needs.
  // Advisories are reporting, never a gate, so they must not be able to fail a
  // command. The changed surface is unresolvable in states that are not errors
  // — a multi-repository change before its sandboxes exist cannot answer "what
  // changed" yet — and that path exits the process rather than throwing, so the
  // precondition is checked instead of caught. `requiredProviders` deliberately
  // does not get this treatment: dropping an inferred capability there would
  // under-require evidence, so it must still stop.
  // The providers review covers right now, decided exactly as
  // requiredProviders does: only while review is required and not waived.
  function reviewCoveredRows(id, active = null) {
    const state = loadRuntime(id);
    const waivers = active || currentWaivers(state,
      state.waivers?.some((row) => row.binding) ? relevantHash(id) : undefined);
    const reviewWaived = waivers.some((row) => row.capability === "review");
    return reviewCoveredAdvisories(evidence(id), !reviewWaived && reviewPolicy(id).required);
  }

  function advisoryCapabilities(id) {
    const state = loadRuntime(id);
    const active = currentWaivers(state, state.waivers?.some((row) => row.binding) ? relevantHash(id) : undefined);
    const waived = (state.waivers || []).map((row) => ({
      capability: row.capability,
      reason: active.includes(row) ? "user-waived" : "waiver-stale",
      detail: row.reason,
      authority: row.authority,
      recordedAt: row.recordedAt,
      ...(Array.isArray(row.acceptedFindings) ? { acceptedFindings: row.acceptedFindings } : {}),
      next: `restore it: cloop change waive ${id} --capability ${
        row.capability} --revoke --decision-ref <ref>`
    }));
    if (!changedSurfaceResolvable(id)) return [...providerSetupRows(id, waived), ...waived];
    const inferred = policyCapabilitySplit(id).advisory.map((capability) => ({
      capability,
      trigger: policyCapabilityTrigger(id, capability),
      reason: "policy-inferred-unwired",
      next: inferredAdvisoryNext(id, capability)
    }));
    return [
      ...reviewCoveredRows(id, active),
      ...inferred,
      ...providerSetupRows(id, [...inferred, ...waived]),
      ...waived
    ];
  }

  // A work type that owes a capability the change has no provider for gets an
  // agent-owned setup step with its resume route: never a user action and
  // never blocking proof.
  function providerSetupRows(id, listed) {
    const seen = new Set(listed.map((row) => row.capability));
    let contract;
    try { contract = evidence(id); } catch { return []; }
    const configured = Object.entries(contract?.providers || {})
      .map(([provider, config]) => providerCapability(provider, config)).filter(Boolean);
    return (policyProviderSetupActions(id, configured) || [])
      .filter((action) => !seen.has(action.capability) && !builtInCovers(providerConfig(id, action.capability)))
      .map((action) => ({
        ...action,
        reason: "work-type-provider-missing",
        next: `${action.instruction} Resume: ${action.resume}`
      }));
  }

  const waiveGate = waiveGateOperation.bind(null, {
    loadRuntime, saveRuntime, relevantHash, requiredProviders, providerCapability,
    providerConfig, now, fail, log: console.log
  });

  function evidenceDetectionValue(id) {
    const state = loadRuntime(id);
    const contract = evidence(id);
    const repositories = selectedRepositories(id, state);
    return detectEvidenceWiring({
      id,
      root,
      contract,
      repositories,
      // Detection wires what Prove will look for *and* what it downgraded to an
      // advisory: an inferred capability with a safe project-owned script is
      // better wired than waived, and `evidence init --write` is the only thing
      // that can promote it back into the enforced set.
      required: [...new Set([
        ...requiredProviders(id),
        ...advisoryCapabilities(id).map((row) => row.capability)
      ])].sort(),
      providerConfig: (provider) => providerConfig(id, provider),
      providerCapability,
      knownProviders,
      commandExists,
      stableHash,
      declaredSurface: state.declaredSurface || []
    });
  }

  function showEvidenceDetection(id) {
    console.log(JSON.stringify(evidenceDetectionValue(id), null, 2));
  }

  function initializeEvidence(id, flags = {}) {
    const detection = evidenceDetectionValue(id);
    // `activeChangePath` points into the sandbox while one is active, which is
    // right for reading a Build packet and fatal for writing contract. `sync`
    // is one-way source → sandbox: it removes the destination, copies the
    // source over it, and merges back only `tasks.md`. Writing detected
    // providers into the sandbox therefore handed them to the next sync to
    // delete — silently, in both trees, after reporting them written. The
    // durable directory is what Land archives and what sync copies forward, so
    // it is the only placement a sync cannot destroy.
    const executionPath = join(changePath(id), "execution.yaml");
    // Build still has to see the wiring without paying for a sync, which would
    // bump `revision` and drop `provenHash`. The mirror is the identical value,
    // and the next sync overwrites it from the same source.
    const activePath = activeChangePath(id);
    const mirrorPath = activePath === changePath(id)
      ? null : join(activePath, "execution.yaml");
    const current = rawExecution(id);
    const additions = {};
    for (const candidate of detection.candidates.filter((row) => row.recommended && row.config)) {
      if (current.providers[candidate.provider] || additions[candidate.provider]) continue;
      additions[candidate.provider] = candidate.config;
    }
    const preview = {
      version: 1,
      changeId: id,
      write: Boolean(flags.write),
      path: relative(root, executionPath).replaceAll("\\", "/"),
      additions,
      skipped: detection.candidates
        .filter((row) => !row.recommended || !row.config)
        .map((row) => ({
          provider: row.provider,
          confidence: row.confidence,
          detail: row.detail
        }))
    };
    if (flags.write && Object.keys(additions).length) {
      const next = {
        ...current,
        providers: { ...current.providers, ...additions }
      };
      writeJson(executionPath, next);
      if (mirrorPath) writeJson(mirrorPath, next);
      preview.written = Object.keys(additions).sort();
    } else {
      preview.written = [];
    }
    console.log(JSON.stringify(preview, null, 2));
  }

  function showEvidenceDoctor(id) {
    const detection = evidenceDetectionValue(id);
    console.log(`EVIDENCE DOCTOR ${id}: ${detection.status}`);
    for (const row of detection.configured)
      console.log(`  OK       ${row.provider}: ${row.adapter} (${row.repository})`);
    for (const row of detection.candidates)
      console.log(`  ${row.recommended ? "CANDIDATE" : "REVIEW   "} ${row.provider}: ${row.source}${row.detail ? `; ${row.detail}` : ""}`);
    // A provider that only repeats a test run is covered only while review
    // covers it; otherwise it stays required and unwired, so it blocks.
    const covered = new Set(reviewCoveredRows(id).map((row) => row.provider));
    for (const row of detection.unresolved)
      console.log(row.aliasOf && covered.has(row.provider)
        ? `  COVERED  ${row.provider}: covered by review; ${row.detail}`
        : `  BLOCKED  ${row.provider}: ${row.reason}; next: ${row.next}`);
    for (const row of detection.unavailable)
      console.log(`  BLOCKED  ${row.provider}: ${row.reason}; next: ${row.next}`);
    for (const row of detection.warnings)
      console.log(`  WARNING  ${row.source}: ${row.reason}; ${row.detail}`);
    if (detection.candidates.some((row) => row.recommended))
      console.log(`  next: cloop advance ${id} --through proven (wires the recommended candidates)`);
  }

  const {
    groundingValue
  } = createGroundingValidation({
    captureValidationGroup, evidence, fail, failCollectedValidation, fileDigest, now,
    pathInside, providerCapability, rawExecution, reviewPolicy, stableHash,
    validationRepositories, walk
  });

  return {
    advisoryCapabilities,
    assertExistingCapabilityOperations,
    assertNoScaffolds,
    assertNewCapabilitiesAreAdditive,
    assertNoDroppedScenarios,
    changeArtifactGaps,
    changeSpecScenarios,
    droppedScenarioFindings,
    groundingValue,
    evidenceDetectionValue,
    initializeEvidence,
    newCapabilityOperationFindings,
    pendingTasks,
    requiredProviders,
    showEvidenceDetection,
    showEvidenceDoctor,
    showTraceabilityAudit,
    taskBlocks,
    taskMetadata,
    traceabilityAuditValue,
    validate,
    waiveGate
  };
}
