import { behaviorChangingWork } from "../../evidence/test-discrimination.mjs";
import { shellDisplayArgument } from "../../core/shell-mutation-policy.mjs";
import { pathInside } from "../../core/process-runtime.mjs";
import { drainSignals } from "../../core/signals.mjs";
import { readPrototypeBinding } from "../prototype/prototype-binding.mjs";
import {
  lifecycleOutcome, lifecycleUserProjection, lifecycleUserState
} from "../../core/lifecycle-outcome.mjs";
import { legacyLandSagaDecision, legacyLandSagaMarkers } from "../../core/legacy-land-saga.mjs";
import {
  actionableGuidance, automaticRecoveryAction, errorCodes, userEnvironmentAction,
  userEnvironmentCause
} from "./advance-recovery.mjs";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";

export const ADVANCE_PROTOCOL_VERSION = 7;

export const command = (value) => `cloop ${value}`;

export const resume = (id, through = null) => command(
  `advance ${id}${through ? ` --through ${through}` : ""}`);

export function envelope(id, action, values = {}) {
  const {
    legacyAction = null, boundary = null, actor = "harness", reason = null,
    resumeCommand = resume(id), recoveryType = null, alternatives = [], ...rest
  } = values;
  const value = lifecycleOutcome(actionableGuidance({
    protocol: ADVANCE_PROTOCOL_VERSION,
    version: ADVANCE_PROTOCOL_VERSION,
    action,
    changeId: id,
    actor,
    boundary,
    reason,
    ...(legacyAction ? { legacyAction } : {}),
    ...rest,
    recovery: recoveryType ? {
      type: recoveryType,
      alternatives,
      statePreserved: true
    } : null,
    resume: resumeCommand
  }));
  return {
    ...value,
    userState: lifecycleUserState(value),
    user: lifecycleUserProjection(value)
  };
}

// A change left mid-way through the retired commit-based Land saga is
// refused on every route with the user's choice of recovery; nothing runs.
export function legacyLandSagaAction(id, state, through = null) {
  const markers = legacyLandSagaMarkers(state);
  if (!markers.length) return null;
  const decision = legacyLandSagaDecision(id, markers);
  return envelope(id, "ASK_USER", {
    legacyAction: "LEGACY_LAND_SAGA", actor: "user", boundary: "user-authority",
    reason: decision.summary, decision, files: decision.files, recoveryType: "ASK_USER",
    alternatives: decision.options.map((option) => option.outcome),
    resumeCommand: resume(id, through)
  });
}

// What an unchanged automated step reported, as one bounded line the agent can
// act on: its reason, issues, and next steps with their commands.
export function noProgressOutput(output) {
  if (!output) return "";
  const parts = [];
  if (typeof output.reason === "string" && output.reason.trim()) parts.push(output.reason.trim());
  for (const issue of Array.isArray(output.issues) ? output.issues.slice(0, 5) : [])
    parts.push(typeof issue === "string" ? issue : issue?.message || issue?.reason || JSON.stringify(issue));
  for (const row of Array.isArray(output.next) ? output.next.slice(0, 5) : []) {
    const reason = typeof row?.reason === "string" ? row.reason : "";
    const commandText = typeof row?.command === "string" ? row.command : "";
    if (reason || commandText) parts.push(commandText ? `${reason || "next"} (${commandText})` : reason);
  }
  return parts.filter(Boolean).join("; ").slice(0, 2000);
}

// Scenarios a task owns: its ledger line links one claim per scenario.
function taskScenarioCount(task) {
  const linked = String(task?.instruction ?? task?.text ?? "").match(/\[claims:([^\]]*)\]/);
  return linked ? linked[1].split(",").filter((claim) => claim.trim()).length : 0;
}

// The Build line that makes a test count: how many scenarios each behavior-
// changing task covers, and the one rule for proving them. Null for work that
// changes no behavior and for tasks with no linked claim. It names no skill.
export function testAdequacyInstruction({ workTypes, tasks }) {
  if (!behaviorChangingWork(workTypes)) return null;
  const owned = (tasks || []).map((task) => ({ id: task.id, count: taskScenarioCount(task) }))
    .filter((row) => row.id && row.count > 0);
  if (!owned.length) return null;
  const covers = owned.map((row) =>
    `${row.id} covers ${row.count} ${row.count === 1 ? "scenario" : "scenarios"}`).join(", ");
  return `${covers}: write at least one test per scenario that fails on the code before ` +
    "your change and passes after it.";
}

function packetSpecFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => entry.isDirectory() ? packetSpecFiles(join(dir, entry.name))
      : entry.isFile() ? [join(dir, entry.name)] : []);
}

// Resolved read set for an EDIT/REPAIR envelope, as absolute paths: the
// packet files that exist, plus declared task paths split into the ones that
// exist in the workspace (`contextFiles`) and the ones the task creates
// (`newFiles`). Globs are scope, not files, and are left to `allowedPaths`.
// A path outside every workspace/repository base (absolute or `../`) is never
// handed to the agent as a file to open. `scopedPaths` are review identities
// (`<repository>/<path>`, as repair-graph nodes carry them) and resolve in
// that repository's own sandbox, never in the shared sandbox's submodule mirror.
export function envelopeContextFiles({
  packetDir, state = {}, tasks = [], paths = [], scopedPaths = [], repairClaims = []
}) {
  const specs = packetSpecFiles(join(packetDir, "specs"));
  // A bound prototype is a read-only design reference for the work it
  // constrains: tasks the binding names, or repair touching its claims.
  // It is never added to the writable scope.
  const binding = readPrototypeBinding(packetDir);
  const boundClaims = new Set(binding?.claims || []);
  const prototype = binding?.present && (
    tasks.some((task) => (binding.tasks || []).includes(task.id)) ||
    repairClaims.some((claim) => boundClaims.has(claim))) ? [binding.path] : [];
  // The harness ticks the isolated workspace's ledger; the main checkout's
  // copy stays unticked until Land, so it would report finished work pending.
  const isolatedLedger = ["worktree", "copy"].includes(state.workspace?.mode) &&
    state.workspace?.path
    ? join(state.workspace.path, "openspec", "changes", basename(packetDir), "tasks.md")
    : null;
  const packet = ["proposal.md", "design.md", "tasks.md"]
    .map((name) => name === "tasks.md" && isolatedLedger && existsSync(isolatedLedger)
      ? isolatedLedger : join(packetDir, name))
    .filter((file) => existsSync(file));
  const root = (repository) => repositoryWorkspace(state, repository);
  const scoped = (path) => {
    const value = String(path || "");
    const separator = value.indexOf("/");
    const repository = separator > 0 ? value.slice(0, separator) : null;
    return repository && (repository === "root" || state.repositories?.[repository]?.path)
      ? [repository, value.slice(separator + 1)] : [null, value];
  };
  const declared = [
    ...tasks.flatMap((task) => (task.allowedPaths || []).map((path) => [task.repository, path])),
    ...paths.map((path) => [null, path]),
    ...scopedPaths.map(scoped)
  ];
  const bases = [state.workspace?.path,
    ...Object.values(state.repositories || {}).map((entry) => entry?.path)]
    .filter((base) => typeof base === "string" && base);
  const existing = [], created = [];
  for (const [repository, path] of declared) {
    const base = root(repository);
    if (typeof path !== "string" || !path || /[*?[\]{}]/.test(path) || !base) continue;
    const file = resolve(base, path);
    if (isAbsolute(path) ? !bases.some((candidate) => pathInside(candidate, file))
      : !pathInside(base, file)) continue;
    const exists = existsSync(file) && (statSync(file).isFile() || statSync(file).isDirectory());
    (exists ? existing : created).push(file);
  }
  return {
    contextFiles: [...new Set([...packet, ...specs, ...prototype, ...existing])],
    newFiles: [...new Set(created)].filter((file) => !existing.includes(file)),
    contextScope: { paths: "absolute", specs: specs.length ? "included" : "none" }
  };
}

// Where a task's repository is edited: its own repository sandbox when the
// change isolated one, otherwise the shared control workspace.
export function repositoryWorkspace(state, repository) {
  return (repository && state.repositories?.[repository]?.path) ||
    state.workspace?.path || null;
}

export function taskVerification(text) {
  return String(text || "").match(/—\s*verify:\s*`([^`]+)`/i)?.[1] || null;
}

// A task's focused check in the harness-owned form the installed allowlist
// already grants (`Bash(cloop *)`). Run bare, the project's test
// runner costs a host approval prompt on every Build; `exec --task` runs the
// same command in that task's sandbox, the way advance's own verify does
// (`sh -c` whenever the text needs a shell), and records its duration. A
// leading `NAME=value` is a shell assignment, never a program to spawn.
export function taskCheckCommand(id, taskId, verify) {
  if (!id || !taskId || !String(verify || "").trim()) return null;
  const words = String(verify).trim().split(/\s+/);
  const argv = !/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0]) &&
    words.every((word) => shellDisplayArgument(word) === word)
    ? words.join(" ") : `sh -c ${shellDisplayArgument(String(verify).trim())}`;
  return command(`exec ${shellDisplayArgument(id)} --task ${shellDisplayArgument(taskId)} -- ${argv}`);
}

export function compactRepairGraph(graph) {
  if (!graph || !Array.isArray(graph.nodes)) return null;
  return {
    nodes: graph.nodes.slice(0, 20).map((node) => ({
      id: node.id,
      findingIds: node.findingIds || [],
      dependsOn: node.dependsOn || [],
      paths: node.paths || node.files || [],
      claimIds: node.claimIds || [],
      verificationCaseIds: node.verificationCaseIds || [],
      sourceAttemptDigest: node.sourceAttemptDigest || null
    })),
    truncated: graph.nodes.length > 20
  };
}

export function compactPreflight(value) {
  if (!value) return null;
  return {
    status: value.status,
    issues: (value.issues || []).slice(0, 20),
    repositoryIssues: (value.repositoryIssues || []).slice(0, 20),
    unavailableProviders: (value.unavailableProviders || []).slice(0, 20),
    activeWorkers: (value.activeWorkers || []).slice(0, 20),
    decision: value.decision || null,
    next: (value.next || []).slice(0, 20),
    truncated: (value.issues || []).length > 20 ||
      (value.repositoryIssues || []).length > 20 ||
      (value.unavailableProviders || []).length > 20 ||
      (value.activeWorkers || []).length > 20
  };
}

function exactRecoveryCommand(message) {
  const text = String(message || "");
  return text.match(/[\'\"`](cloop\s+[^\'\"`\n]+)[\'\"`]/)?.[1] || null;
}

// Without an exact command, name what to change: the offending field, the
// value seen, and the expected shape. Typed error details win over prose.
export function repairTargetFromError(error) {
  const details = error?.details;
  if (details && typeof details === "object" && typeof details.field === "string")
    return { field: details.field, value: details.value ?? null, expected: details.expected ?? null };
  const lines = String(error?.message || error || "").split("\n")
    .map((line) => line.replace(/^\s*-\s+/, "").trim()).filter(Boolean);
  const field = "(-{0,2}[A-Za-z_$][\\w$.\\[\\]-]*)";
  const patterns = [
    [new RegExp(`['\`]?${field}['\`]? must (?:be|equal|use) ([^;\\n]+?)(?:[;.]\\s|[;.]?$)`), (m) => m[2].trim()],
    [new RegExp(`requires (?:a )?non-empty ['\`]${field}['\`]( array)?`), (m) => m[2] ? "a non-empty array" : "a non-empty value"],
    [new RegExp(`['\`]?${field}['\`]? is required`), () => "a value"]
  ];
  for (const line of lines) for (const [pattern, expected] of patterns) {
    const match = line.match(pattern);
    if (match) return {
      field: match[1],
      value: line.match(/(?:got|found) (?:version )?['`]?([^'`\s;,]+)['`]?/)?.[1] || null,
      expected: expected(match)
    };
  }
  return null;
}

// Signals raised while this command ran (see core/signals.mjs) ride on the
// envelope as `signals[]` ({code, message}); absent when there are none.
export function withSignals(value) {
  const raised = drainSignals();
  if (!raised.length || !value || typeof value !== "object") return value;
  const known = Array.isArray(value.signals) ? value.signals : [];
  return { ...value, signals: [...known, ...raised.filter((row) =>
    !known.some((seen) => seen.code === row.code && seen.message === row.message))] };
}

// A failure whose cause only the user can clear (a full disk, a missing or
// rejected credential, a denied network) is typed where it is raised, so every
// route — inspection included — asks the user with the exact cause instead of
// handing the agent a repair it cannot perform. Decisions, harness-owned
// automatic recovery, and product output keep their own routes.
export function advanceFailureAction(id, error, options = {}) {
  const value = failureEnvelope(id, error, options);
  if (value.action === "ASK_USER" || value.automaticRecovery) return value;
  const found = userEnvironmentCause(value, errorCodes(error));
  if (!found) return value;
  const asked = lifecycleOutcome(actionableGuidance(userEnvironmentAction(id, value, found)));
  return { ...asked, userState: lifecycleUserState(asked), user: lifecycleUserProjection(asked) };
}

function failureEnvelope(id, error, { stage = "build", through = null } = {}) {
  const reason = error?.message || String(error);
  const automatic = automaticRecoveryAction(id, error?.decision);
  if (automatic?.kind === "reconcile-target-edits") return envelope(id, "REPAIR", {
    legacyAction: "RECONCILE_TARGET_EDITS", actor: "agent", owner: "agent",
    boundary: "target-conflict", reason, decision: error.decision,
    paths: automatic.paths, command: resume(id, "archived"),
    instruction: "Keep the target checkout's edits at the listed paths: do not revert or commit " +
      "them. Merge each target edit into the sandbox copy of the same path so the sandbox keeps " +
      "both the change and the target edit, then run the resume command; Land proves the merged " +
      "files again and applies them once they carry the target edits.",
    recoveryType: "EDIT", resumeCommand: resume(id, "archived")
  });
  if (automatic?.kind === "resolve-landed-conflict") return envelope(id, "REPAIR", {
    legacyAction: "REPAIR_SYNC_CONFLICT", actor: "agent", owner: "agent",
    boundary: "conflict", reason, decision: error.decision,
    conflicts: automatic.paths.map((path) => ({ repository: automatic.repository, path })),
    resolveCommand: error.decision?.resolveCommand || null,
    command: resume(id, "archived"),
    instruction: "The harness replay left these sandbox copies with conflicts against work an " +
      "earlier change landed. Edit each listed sandbox file to the merge of both changes, keeping " +
      "every landed edit, then record it with the sandbox sync --resolve command named in the " +
      "decision and run the resume command; Land proves the merged files again before applying.",
    recoveryType: "EDIT", resumeCommand: resume(id, "archived")
  });
  if (automatic?.kind === "apply-recovery") return envelope(id, "REPAIR", {
    legacyAction: "RECOVER_APPLY_TRANSACTION", actor: "harness",
    boundary: "internal-recovery", reason,
    automaticRecovery: automatic, decision: error.decision,
    command: automatic.command, recoveryType: "AUTO_RECOVER",
    resumeCommand: resume(id, through)
  });
  if (automatic) return envelope(id, "REPAIR", {
    legacyAction: "RECOVER_SANDBOX_SYNC", actor: "harness",
    boundary: "internal-recovery", reason,
    automaticRecovery: automatic, decision: error.decision,
    command: automatic.command, recoveryType: "AUTO_RECOVER",
    resumeCommand: resume(id, through)
  });
  if (error?.decision) return envelope(id, "ASK_USER", {
    legacyAction: "REQUEST_DECISION",
    actor: "user",
    boundary: error.boundary || "user-authority",
    reason,
    decision: error.decision,
    recoveryType: "ASK_USER",
    alternatives: error.decision.options?.map((option) => option.outcome) || [],
    resumeCommand: resume(id, through)
  });
  if (error?.owner === "user" || error?.boundary === "land-authority")
    return envelope(id, "ASK_USER", {
      legacyAction: error?.code === "LAND_GRANT_REQUIRED"
        ? "LAND_READY" : "REQUEST_DECISION",
      actor: "user",
      boundary: error?.boundary || "user-authority",
      reason,
      recoveryType: "ASK_USER",
      alternatives: error?.boundary === "land-authority"
        ? ["invoke /land for this exact change", "leave the proven change pending"] : [],
      resumeCommand: resume(id, through)
    });
  // A lease resource another task or change holds is queued: the harness
  // waits for the holder and retries on resume. Never a repair or a question.
  if (error?.code === "LEASE_RESOURCE_HELD" && error.wait) return envelope(id, "WAIT", {
    legacyAction: "WAIT_RESOURCE",
    actor: "harness",
    boundary: "resource",
    reason,
    wait: { ...error.wait, owner: "harness", checkCommand: resume(id, through) },
    recoveryType: "PAUSE",
    alternatives: ["wait for the holding lease to be released, then resume"],
    resumeCommand: resume(id, through)
  });
  if (error?.owner === "external") return envelope(id, "WAIT", {
    legacyAction: "WAIT_EXTERNAL",
    actor: "external-authority",
    boundary: error?.boundary || "external-authority",
    reason,
    wait: error?.details?.wait || null,
    recoveryType: "PAUSE",
    alternatives: error?.details?.alternatives || [],
    resumeCommand: resume(id, through)
  });
  // Harness automation that could not finish hands its exact step to the
  // agent — command, directory, and output — instead of a diagnostic loop
  // that ends at the user.
  const handoff = error?.details?.handoff;
  if (handoff?.command) return envelope(id, "REPAIR", {
    legacyAction: `REPAIR_${stage.toUpperCase()}_RUNTIME`,
    actor: "agent",
    boundary: error?.boundary || "resource",
    reason,
    details: error?.details || null,
    errorCode: error?.code || null,
    command: handoff.command,
    handoff,
    instruction: `The harness could not finish ${handoff.step || "this step"}. Run \`${
      handoff.command}\`${handoff.cwd ? ` in ${handoff.cwd}` : ""}, fix what its output reports ` +
      "(inside the workspace or the declared setup in foundation.json), then resume.",
    recoveryType: "HANDOFF",
    alternatives: ["finish the harness step yourself, then resume the same lifecycle route"],
    resumeCommand: resume(id, through)
  });
  // Land's diagnosis is Land itself: resuming the archived route re-runs every
  // Land check and recovery. `land check` is an internal primitive.
  const fallback = stage === "land"
    ? resume(id, "archived")
    : command(`doctor --stage ${stage === "prove" ? "prove" : "build"} --change ${id}`);
  const exact = exactRecoveryCommand(reason);
  const repairTarget = exact ? null : repairTargetFromError(error);
  return envelope(id, "REPAIR", {
    legacyAction: `REPAIR_${stage.toUpperCase()}_RUNTIME`,
    actor: error?.owner === "agent" ? "agent" : "harness",
    boundary: error?.boundary || "resource",
    reason,
    details: error?.details || null,
    errorCode: error?.code || null,
    command: exact || fallback,
    ...(exact ? {} : {
      repairTarget,
      instruction: stage === "land"
        ? `Fix the reported cause: ${reason}. Then run '${fallback}'; it re-runs every Land check ` +
          "and resumes Land from its retained state."
        : repairTarget
        ? `Set '${repairTarget.field}' to ${repairTarget.expected}` +
          `${repairTarget.value ? ` (found '${repairTarget.value}')` : ""}, then resume; ` +
          `'${fallback}' diagnoses the stage if the cause is elsewhere.`
        : `Fix the reported cause: ${reason}. '${fallback}' names the failing stage check; then resume.`
    }),
    recoveryType: "RECONFIGURE",
    alternatives: [exact ? "run the exact recovery command, then resume the same lifecycle route"
      : "apply the named fix, then resume the same lifecycle route"],
    resumeCommand: resume(id, through)
  });
}
