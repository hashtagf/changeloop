// Recovery for proof readiness blocked by work still running: active proof
// runs, leases, and workers, and how to resume after them.

export function activeWorkRecovery(id, leases, repositoryConflicts = []) {
  return [{
    kind: "wait-for-active-work",
    instruction: "The host must wait for active workers or release stale leases; do not spend model budget while ownership is unresolved.",
    leases: leases.map((lease) => ({
      taskId: lease.taskId, owner: lease.owner, expiresAt: lease.expiresAt || null
    })),
    // Another change holding write scope on a repository this proof would
    // execute in. Naming it is the difference between "wait" and "wait for
    // what": nothing else in the output identifies the other change.
    repositoryConflicts: repositoryConflicts.map((conflict) => ({
      changeId: conflict.changeId,
      repository: conflict.repository,
      status: conflict.status,
      note: "Both changes declare the same shared resource; wait for that change's proof run to finish or release the resource before proving this one."
    })),
    // Telling the host to release a stale lease is only actionable if the
    // release it can actually run is named: a crashed worker never comes back
    // to release its own.
    choices: leases.map((lease) => ({
      kind: "release-stale-lease",
      taskId: lease.taskId,
      expiresAt: lease.expiresAt || null,
      command: `cloop agents release ${id} ${lease.taskId} --owner ${lease.owner} --force`,
      note: "A lease that has not expired also requires --decision-ref, because the worker holding it may still be running."
    })),
    verify: `cloop advance ${id} --inspect`
  }];
}
