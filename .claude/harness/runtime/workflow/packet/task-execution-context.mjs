// The task execution context a packet hands the agent: the claim rows a task
// owns and the files, checks, and scope it runs with.
import { existsSync } from "node:fs";
import { join } from "node:path";

export function createTaskExecutionContext({
  compactList, compactStrings, leasesRoot, readJson, stableHash
}) {
  function packetClaimRows(claims, packetType) {
    const rows = claims.map((claim) => ({
      id: claim.id,
      ...(packetType === "global"
        ? { scenarioDigest: stableHash(String(claim.scenario)) }
        : { scenario: String(claim.scenario).slice(0, packetType === "task" ? 500 : 240) }),
      capabilities: compactStrings(claim.capabilities, 12),
      repositories: claim.repositories ? compactStrings(claim.repositories, 12) : null
    }));
    const limit = packetType === "task" ? 20 : packetType === "repository" ? 25 : 40;
    return compactList(rows, limit);
  }

  function taskExecutionContext(id, selectedTask) {
    if (!selectedTask) return {};
    if (selectedTask.done) return {
      executionAuthority: {
        status: "completed",
        readOnly: true,
        instruction: "Task is complete in tasks.md; use this packet as read-only context and do not re-execute it."
      }
    };
    const leasePath = leasesRoot
      ? join(leasesRoot, "tasks", id, `${selectedTask.id}.json`) : null;
    const leaseValue = leasePath && existsSync(leasePath) ? readJson(leasePath, {}) : null;
    const lease = leaseValue && leaseValue.leaseId ? leaseValue : null;
    const executionAuthority = lease ? {
      status: "leased",
      graphRevision: lease.graphRevision,
      graphIdentity: lease.graphIdentity,
      planDigest: lease.planDigest,
      contractRevision: lease.contractRevision,
      workspaceHash: lease.workspaceHash,
      leaseId: lease.leaseId,
      fencingGeneration: lease.fencingGeneration,
      executionAttempt: lease.executionAttempt,
      repository: lease.repository,
      paths: lease.paths,
      claimIds: lease.claimIds,
      outputSchema: lease.outputSchema,
      expiresAt: lease.expiresAt
    } : {
      status: "unleased",
      instruction: "Acquire the host lease, then regenerate this task packet before execution."
    };
    return {
      workerContract: {
        version: 1,
        role: "leased-task-worker",
        must: [
          "implement-only-the-leased-task",
          "edit-only-authorized-paths",
          "run-focused-checks",
          "report-summary-checks-and-blockers"
        ],
        mustNot: [
          "edit-task-ledger",
          "dispatch-successors",
          "claim-peer-results"
        ],
        parentOwns: ["group-join", "task-ledger", "successor-dispatch"],
        resultAuthority: "observed-workspace-writes-and-lease-authority"
      },
      executionAuthority
    };
  }

  return { packetClaimRows, taskExecutionContext };
}
