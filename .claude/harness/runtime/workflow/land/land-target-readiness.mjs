// Whether a Land target is ready: the target repositories, their drift, and
// the conditions that must hold before Apply mutates them.
import { MANUAL_APPLY_STATUS, targetHeadMovedDecision } from "../transaction/apply-recovery.mjs";
import { outOfBandDeliveryDriftValue } from "../../core/authority-policy.mjs";
import { compositeRepositorySelection } from "../../core/repository-binding.mjs";

export function createLandTargetReadiness({
  assertNoDroppedScenarios,
  assertOpenSpecCli,
  blockWithDecision,
  deliveryObservation,
  fail,
  gitHead,
  pendingApplyTransactions,
  recordedDeliveryReferences,
  root,
  selectedRepositories
}) {
  function assertLandTargetReady(id, state) {
    // Kept target content must reach the sandbox and be proven again. That is
    // the harness's own sync, never a command handed to the agent.
    if (state.workspace?.recovery?.requiresSync)
      blockWithDecision(id, "recovery-sync-required", {
        kind: "recovery-sync-required",
        summary: "The target was preserved during manual recovery; the sandbox is synchronized " +
          "onto it and proved again before Land continues.",
        automaticRecovery: "sync",
        options: [
          { id: "sync", outcome: "Synchronize the sandbox onto the preserved target and prove it again." },
          { id: "pause", outcome: "Leave both workspaces as they are." }
        ],
        recommended: "sync"
      });
    const pending = pendingApplyTransactions(id);
    if (pending.length) {
      // Both automatic resolutions are non-destructive: settle only finishes
      // or reverses bytes Land itself wrote (divergent content turns the
      // journal into a manual recovery instead), and keep-current overwrites
      // nothing. `advance --through archived` applies them itself; restoring
      // a backup over divergent content stays the user's explicit choice.
      const manual = pending.some((transaction) => MANUAL_APPLY_STATUS.includes(transaction.status));
      const resolution = manual ? "keep-current" : "settle";
      blockWithDecision(id, "apply-pending-recovery", {
        kind: "apply-pending-recovery",
        summary: `An earlier apply for '${id}' is unresolved. Land check changes nothing while it is pending.`,
        transactions: pending.map((transaction) => ({
          transactionId: transaction.transactionId,
          status: transaction.status,
          appliedPaths: transaction.appliedPaths,
          update: transaction.counts.update,
          create: transaction.counts.create,
          delete: transaction.counts.delete
        })),
        divergentPaths: [...new Set(pending.flatMap((transaction) =>
          transaction.divergentPaths || []))].slice(0, 50),
        options: manual ? [
          { id: "keep-current", outcome: "Keep the current target files (nothing is overwritten), " +
            "then synchronize the sandbox onto them and prove again before Land continues." },
          { id: "restore-backup", outcome: "Replace the divergent target files with the recorded " +
            `pre-apply backup: 'cloop advance ${id} --through archived --recover-apply ` +
            "restore-backup --decision-ref <user-decision>'." },
          { id: "pause", outcome: "Leave the transaction pending and make no change." }
        ] : [
          { id: "settle", outcome: "Finish or reverse the interrupted apply from its journal, touching " +
            "only bytes Land itself wrote, then continue Land." },
          { id: "pause", outcome: "Leave the transaction pending and make no change." }
        ],
        recommended: resolution,
        automaticRecovery: resolution
      });
    }
    assertNoDroppedScenarios(id);
    assertOpenSpecCli(root, fail);
    if (state.workspace?.mode === "worktree" && !state.workspace.applied &&
        gitHead(root) !== state.workspace.baseHead) {
      const baseDecision = targetHeadMovedDecision({
          changeId: id,
          recordedBase: state.workspace.baseHead,
          currentHead: gitHead(root),
          multiRepository: compositeRepositorySelection(selectedRepositories(id, state)),
          action: "Landing"
        });
      const projection = deliveryObservation?.(id, state) ||
        { observed: false, paths: [], reason: "observation-unavailable" };
      const references = recordedDeliveryReferences(state);
      const decision = projection.observed || references.length
        ? outOfBandDeliveryDriftValue({
          changeId: id, state,
          recordedHead: state.workspace.baseHead,
          currentHead: gitHead(root), baseDecision,
          observation: { projection, references }
        })
        : baseDecision;
      blockWithDecision(id, "control-head-moved", decision);
    }
  }

  return { assertLandTargetReady };
}
