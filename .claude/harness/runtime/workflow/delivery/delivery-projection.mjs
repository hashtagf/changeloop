import {
  cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, rmSync,
  symlinkSync
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { environmentCause, errorCodes } from "../advance/advance-recovery.mjs";
import {
  deliveryProjectionEntry, assertLandEntryMode, assertDeliveryEntries
} from "../transaction/delivery-integrity.mjs";
import { clean, resultText, unique } from "./pull-request-body.mjs";

export const DELIVERY_PROTOCOL_VERSION = 2;

export const DELIVERY_RECEIPT_SCHEMA_VERSION = 1;

// Remote and provider operations fail for reasons the repository operator
// owns (credentials, network, remote configuration). They are typed here so
// Deliver waits on that owner only for them, never for an unrelated failure
// whose message happens to mention a remote.
const PROVIDER_GIT_COMMANDS = new Set(["push", "fetch", "ls-remote"]);

export function providerUnavailable(message) {
  const error = /** @type {Error & Record<string, any>} */ (new Error(message));
  error.code = "DELIVERY_PROVIDER_UNAVAILABLE";
  return error;
}

export function runChecked(run, executable, args, options, label) {
  const result = run(executable, args, options);
  if (result.status !== 0) {
    const error = /** @type {Error & Record<string, any>} */ (new Error(`${label}: ${resultText(result) || `exit ${result.status}`}`));
    error.code = executable === "gh" || (executable === "git" && PROVIDER_GIT_COMMANDS.has(args[0]))
      ? "DELIVERY_PROVIDER_UNAVAILABLE" : "DELIVERY_EXTERNAL_COMMAND_FAILED";
    error.command = executable;
    error.result = result;
    throw error;
  }
  return result;
}

export function workspaceDrift(message) {
  const error = /** @type {Error & Record<string, any>} */ (new Error(message));
  error.code = "DELIVERY_PROJECTION_DRIFT";
  error.stage = "delivery-workspace";
  return error;
}

export function copyEntry(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  const stat = lstatSync(source, { throwIfNoEntry: false });
  if (!stat) return;
  mkdirSync(dirname(destination), { recursive: true });
  if (stat.isSymbolicLink()) symlinkSync(readlinkSync(source), destination);
  else cpSync(source, destination, {
    recursive: stat.isDirectory(), dereference: false, verbatimSymlinks: true,
    preserveTimestamps: true
  });
}

function filesUnder(root, rel) {
  const absolute = join(root, rel);
  if (!existsSync(absolute)) return [rel];
  const stat = lstatSync(absolute);
  if (!stat.isDirectory() || stat.isSymbolicLink()) return [rel];
  const rows = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(path);
      else rows.push(relative(root, path).replaceAll("\\", "/"));
    }
  };
  visit(absolute);
  return rows.length ? rows : [rel];
}

function archivedSpecPaths(root, archivedChangePath) {
  const specs = join(root, archivedChangePath, "specs");
  if (!existsSync(specs)) return [];
  return readdirSync(specs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `openspec/specs/${entry.name}/spec.md`);
}

// Land journal entries that changed bytes or mode, each still at its proven
// identity in the target.
function changedLandEntries(base, entries, pathIdentity, where = "") {
  const changed = entries.filter((entry) => !(entry.before === entry.after &&
    (entry.beforeMode === undefined || entry.beforeMode === entry.afterMode)));
  for (const entry of changed) {
    assertLandEntryMode(base, entry, pathIdentity);
    if (pathIdentity(join(base, entry.path)) !== entry.after) {
      const error = /** @type {Error & Record<string, any>} */ (new Error(`proven path changed after Land${where}: ${entry.path}`));
      error.code = "DELIVERY_PROJECTION_DRIFT";
      error.path = entry.path;
      throw error;
    }
  }
  return changed;
}

export function safeRepositoryId(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function repositoryDeliveryProjection({
  repository, lifecycle, transactions, readJson, pathIdentity
}) {
  const runtime = lifecycle.repositories?.[repository.id];
  const transactionId = runtime?.delivery?.transactionId;
  if (!transactionId)
    throw new Error(`repository '${repository.id}' has no Land delivery transaction`);
  const journalPath = join(transactions, "repository-delivery",
    safeRepositoryId(repository.id), lifecycle.id, transactionId, "journal.json");
  const journal = readJson(journalPath, {});
  if (!journal || !["verified", "committed"].includes(journal.status) ||
      !Array.isArray(journal.entries))
    throw new Error(`repository '${repository.id}' has no verified Land journal`);
  const entries = changedLandEntries(repository.path, journal.entries, pathIdentity,
    ` in '${repository.id}'`);
  const roots = unique(entries.map((entry) => entry.path)).sort();
  return {
    version: 2,
    changeId: lifecycle.id,
    repositoryId: repository.id,
    baseHead: runtime.baseHead || journal.baseHead || null,
    sourceProjectionHash: runtime.delivery.projectionHash || journal.projectionHash,
    integrity: "land-bound",
    roots,
    entries: unique(roots.flatMap((path) => filesUnder(repository.path, path))).sort()
      .map((path) => deliveryProjectionEntry(repository.path, path, pathIdentity))
  };
}

export function deliveryProjection({ root, state, readJson, transactionJournalPath, pathIdentity }) {
  if (state.status !== "archived") {
    const error = /** @type {Error & Record<string, any>} */ (new Error(`change '${state.id}' is not archived`));
    error.code = "DELIVERY_REQUIRES_ARCHIVED";
    throw error;
  }
  const transactionId = state.workspace?.apply?.transactionId;
  if (!transactionId) throw new Error(`archived change '${state.id}' has no applied projection`);
  const journal = readJson(transactionJournalPath(state.id, transactionId), {});
  if (!journal || !Array.isArray(journal.entries) || journal.status !== "committed")
    throw new Error(`archived change '${state.id}' has no committed apply journal`);
  const activeChange = `openspec/changes/${state.id}`;
  const productEntries = changedLandEntries(root,
    journal.entries.filter((entry) => entry.path !== activeChange), pathIdentity);
  const archive = clean(state.archivedChangePath);
  if (!archive || !existsSync(join(root, archive)))
    throw new Error(`archived OpenSpec packet for '${state.id}' is unavailable`);
  if (state.deliveryIntegrity?.version !== 2) {
    const error = /** @type {Error & Record<string, any>} */ (new Error("Archived mode evidence is unavailable in this legacy change; automatic Deliver cannot reconstruct historical modes. Preserve the archived work and review the current diff for separately authorized Git publication."));
    error.code = "DELIVERY_MODE_EVIDENCE_UNAVAILABLE";
    throw error;
  }
  assertDeliveryEntries(root, state.deliveryIntegrity.entries, pathIdentity);
  const roots = unique([
    ...productEntries.map((entry) => entry.path),
    activeChange,
    archive,
    ...archivedSpecPaths(root, archive)
  ]).sort();
  const paths = unique(roots.flatMap((path) => filesUnder(root, path))).sort();
  const entries = paths.map((path) => deliveryProjectionEntry(root, path, pathIdentity));
  const projectionHash = state.workspace?.apply?.projectionHash || journal.projectionHash;
  return {
    version: 2,
    changeId: state.id,
    baseHead: state.workspace?.baseHead || journal.baseHead || null,
    sourceProjectionHash: projectionHash,
    integrity: "land-bound",
    roots,
    entries
  };
}

export function gitOutput(git, args, cwd, label) {
  const result = git(args, cwd);
  if (result.status !== 0) throw new Error(`${label}: ${resultText(result)}`);
  return clean(result.stdout);
}

export function deliveryEnvelope(changeId, action, fields = {}) {
  return { version: DELIVERY_PROTOCOL_VERSION, changeId, action, ...fields };
}

// A Deliver question in the blocked-decision shape: typed options with
// outcomes, a recommendation, and a preserved pause. `options` keeps the
// legacy id list for existing hosts.
export function deliveryDecision(changeId, { boundary, reason, options, recommended, ...fields }) {
  const choices = [...options, ["pause", "Keep the current state and deliver nothing for now."]];
  return deliveryEnvelope(changeId, "ASK_USER", {
    completed: false, boundary, reason, ...fields,
    options: options.map(([id]) => id),
    decision: {
      kind: boundary, summary: reason,
      options: choices.map(([id, outcome]) => ({ id, outcome })),
      recommended: recommended || options[0][0]
    }
  });
}

// A remote or local delivery command that failed for a cause only the user
// can clear (a rejected credential such as a push 403, a full disk, a denied
// network) asks the user with that exact cause, through the same classifier
// and decision shape as `advance`. Anything else stays the operator's wait.
export function userEnvironmentDecision(changeId, error, resumeCommand) {
  if (!["DELIVERY_PROVIDER_UNAVAILABLE", "DELIVERY_EXTERNAL_COMMAND_FAILED"].includes(error?.code))
    return null;
  const found = environmentCause({ codes: [...errorCodes(error), error.result?.error?.code],
    text: `${error.message}\n${resultText(error.result)}` });
  if (!found) return null;
  const summary = `${found.fix}. Only the user can clear this (${found.cause}): ${error.message}`;
  const value = deliveryDecision(changeId, {
    boundary: "user-environment", owner: "user", reason: summary, resumeCommand,
    options: [["fixed", `${found.fix}; then the agent runs '${resumeCommand}'.`]],
    recommended: "fixed"
  });
  return { ...value, decision: { ...value.decision, cause: found.cause, category: found.category,
    fix: found.fix, options: value.decision.options.map((option) =>
      option.id === "fixed" ? { ...option, command: resumeCommand } : option) } };
}

export const LANDABLE_STATUSES = new Set(["proven", "applied"]);

export function followUpNotice(followUp) {
  return followUp.mode === "update-existing"
    ? { mode: followUp.mode, of: followUp.of, url: followUp.url,
      notice: `Updated the existing pull request ${followUp.url} instead of opening a new one.` }
    : { mode: followUp.mode, of: followUp.of, ...(followUp.url ? { url: followUp.url } : {}),
      notice: followUp.notice };
}
