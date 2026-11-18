// Land preflight and spec sync: the spec text each delta lands on, capturing
// and verifying the synced specs, recording delivery integrity, the checks
// that must pass before Apply mutates any repository, and the sync still owed.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { predictSpecSync, verifySpecSync } from "./spec-sync-verify.mjs";
import { compositeRepositorySelection } from "../../core/repository-binding.mjs";
import { RepositoryDeliveryError } from "../delivery/repository-delivery-saga.mjs";
import { deliveryTreeEntries } from "../transaction/delivery-integrity.mjs";
import { landedWorkStop } from "../transaction/target-edits.mjs";

export function createLandPreflight({
  blockWithDecision,
  changePath,
  currentChangeRelativePath,
  fail,
  loadRuntime,
  now,
  pathIdentity,
  planApplyEntries,
  repositoryDelivery,
  root,
  selectedRepositories,
  specSyncPending
}) {
  function currentSpecText(capability) {
    const path = join(root, "openspec", "specs", capability, "spec.md");
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  }

  function captureSpecSyncInputs(id, packet = changePath(id)) {
    const dir = join(packet, "specs");
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() &&
        existsSync(join(dir, entry.name, "spec.md")))
      .map((entry) => ({
        capability: entry.name,
        delta: readFileSync(join(dir, entry.name, "spec.md"), "utf8"),
        before: currentSpecText(entry.name)
      }));
  }

  // `openspec archive` leaves the merged spec ending in a blank line, which
  // `git diff --check` reports after Land. Trim only the specs this change
  // wrote, before verification and the delivery-integrity record.
  function settleArchivedSpecEndings(captured) {
    for (const { capability } of captured) {
      const path = join(root, "openspec", "specs", capability, "spec.md");
      if (!existsSync(path)) continue;
      const text = readFileSync(path, "utf8");
      const settled = text.replace(/\n+$/, "\n");
      if (settled !== text && settled.trim()) writeFileSync(path, settled);
    }
  }

  function verifyArchivedSpecs(captured) {
    return captured.flatMap(({ capability, delta, before }) =>
      verifySpecSync({ before, after: currentSpecText(capability), delta })
        .violations.map((violation) => ({ capability, ...violation })));
  }

  function recordDeliveryIntegrity(state, archivedPath, captured = [], modeBound = true) {
    if (typeof pathIdentity !== "function" || !archivedPath) return;
    const paths = [archivedPath, ...captured.map(({ capability }) =>
      `openspec/specs/${capability}/spec.md`)];
    state.deliveryIntegrity = {
      version: modeBound ? 2 : 1,
      createdAt: now(),
      entries: deliveryTreeEntries(root, [...new Set(paths)], pathIdentity)
    };
  }

  // Not a dead end: the inputs are retained, so after the agent repairs the
  // listed openspec/specs files, `advance --through archived` re-verifies the
  // merge from them and finishes the archive.
  function failSpecSync(violations) {
    fail(`archived specs do not match the change delta:\n${violations
      .map((violation) => `  ${violation.capability}/${violation.requirement || "-"}: ${
        violation.detail}`).join("\n")}\nRepair each listed openspec/specs/<capability>/spec.md so ` +
      "it carries the change delta; Land re-verifies the merge from the retained inputs.",
    1, { owner: "agent", boundary: "spec-sync", code: "SPEC_SYNC_VIOLATION" });
  }

  // The part of the spec-sync gate the pre-archive spec and the delta already
  // decide. The delta is read where archive will read it: the sandbox packet
  // Apply is about to project, or the active packet once it is applied.
  function assertSpecSyncPreflight(id, state) {
    const workspace = state.workspace;
    const packet = ["worktree", "copy"].includes(workspace?.mode) && workspace.path &&
      !workspace.applied ? join(workspace.path, currentChangeRelativePath(id)) : changePath(id);
    const violations = captureSpecSyncInputs(id, packet).flatMap(({ capability, delta, before }) =>
      predictSpecSync({ before, delta }).violations.map((violation) => ({ capability, ...violation })));
    if (!violations.length) return;
    fail(`archive would not carry the change delta into openspec/specs:\n${violations
      .map((violation) => `  ${violation.capability}/${violation.requirement || "-"}: ${
        violation.detail}`).join("\n")}\nRepair each listed delta in openspec/changes/${id}/specs ` +
      "against the current openspec/specs/<capability>/spec.md, prove again, and resume with " +
      `'cloop advance ${id} --through archived'.`,
    1, { owner: "agent", boundary: "spec-sync", code: "SPEC_SYNC_VIOLATION" });
  }

  // Land's shared pre-mutation preflight: every refusal Apply, the repository
  // delivery saga, and the spec-sync gate can already decide before Land
  // writes anything. `land check` runs it with `inspect` (nothing restored,
  // recorded, or journaled); Land runs it with recording allowed, so a carry
  // the automatic sync needs is recorded exactly as Apply would record it.
  function landPreflight(id, state = loadRuntime(id), { inspect = true } = {}) {
    if (state.status === "archived" || specSyncPending(id, state)) return;
    const sandboxed = ["worktree", "copy"].includes(state.workspace?.mode);
    if (sandboxed && compositeRepositorySelection(selectedRepositories(id, state))) {
      const blocked = repositoryDeliveryPreflight(id, inspect);
      if (blocked) return blocked.result;
    } else if (sandboxed && !state.workspace.applied) {
      planApplyEntries(id, state, null, { inspect });
    }
    assertSpecSyncPreflight(id, state);
  }

  // The saga's typed refusal through the command boundary, so `land check`
  // prints it; `{ result }` when Land stops for a decision, otherwise null.
  function repositoryDeliveryPreflight(id, inspect) {
    try { repositoryDelivery().preflight(id, { inspect }); return null; } catch (error) {
      if (!(error instanceof RepositoryDeliveryError)) throw error;
      const stop = landedWorkStop(id, error.details || {});
      if (stop) return { result: blockWithDecision(id, stop.code, stop.decision) };
      fail(error.message, 1, { code: error.code, owner: error.owner,
        boundary: error.boundary, ...(error.decision ? { decision: error.decision } : {}) });
      return null;
    }
  }

  // The gate can only fire once the change is already recorded archived, so a
  // retry would otherwise take the early return and land the corrupted specs.
  // Re-verifying from the inputs captured before the merge means a repaired spec
  // tree clears the block on its own, with no one hand-editing runtime state.
  function outstandingSpecSync(state) {
    const captured = state.specSyncInputs;
    return Array.isArray(captured) && captured.length
      ? verifyArchivedSpecs(captured) : state.specSyncViolations || [];
  }

  return {
    captureSpecSyncInputs, settleArchivedSpecEndings, verifyArchivedSpecs, recordDeliveryIntegrity,
    failSpecSync, landPreflight, outstandingSpecSync
  };
}
