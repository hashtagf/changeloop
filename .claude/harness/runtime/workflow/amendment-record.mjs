// Pure shaping for an applied semantic amendment: which claims each coverage
// change invalidates, the history row kept on the change, and the AMENDED
// report. amendChangeUnlocked in change-lifecycle.mjs owns the transaction.

export function invalidatedWaivers(waivers, contractRevision) {
  return (Array.isArray(waivers) ? waivers : [])
    .filter((row) => row?.binding &&
      Number(row.binding.contractRevision) !== Number(contractRevision || 0))
    .map((row) => row.capability).filter(Boolean).sort();
}

export function formatInvalidatedWaivers(id, waivers, contractRevision) {
  const capabilities = invalidatedWaivers(waivers, contractRevision);
  return capabilities.length
    ? `  waivers no longer apply: ${capabilities.join(", ")} (bound to an earlier contract ` +
      `revision; now ${Number(contractRevision || 0)}); if still intended, ask the user and ` +
      `record each again: claude-foundation change waive ${id} --capability <capability> ` +
      "--reason <why> --decision-ref <user-decision>\n"
    : "";
}

export function formatApprovalDelta(delta) {
  const list = (values) => values?.length ? values.join(", ") : "none";
  return `  added: ${list(delta.added)}\n  revised: ${list(delta.revised)}\n` +
    `  removed: ${list(delta.removed)}`;
}

export function amendmentCoverageChanges(compiled) {
  return [...(compiled.discovery?.coverage || []).map((row) => ({
    dimension: row.dimension,
    claimIds: compiled.claims.filter((claim) =>
      (row.covers || []).includes(claim.requirementKey)).map((claim) => claim.id)
  })),
  // A changed task verify command invalidates the evidence for that task's
  // claims (every claim when the task binds none), so Prove reruns it.
  ...(compiled.taskContractChanges.length
    ? [{ dimension: "task-verify", claimIds: compiled.taskContractClaimIds }] : []),
  // A withdrawn task's claims are now proven by the tasks that keep them.
  ...(compiled.removedTasks?.length
    ? [{ dimension: "task-removal", claimIds: compiled.removedTaskClaimIds }] : []),
  // An added task's claims are proven again with it, even for a requirement
  // the agreement already had.
  ...(compiled.addedTaskClaimIds?.length
    ? [{ dimension: "task-addition", claimIds: compiled.addedTaskClaimIds }] : [])];
}

export function amendmentHistoryRow({
  revision, amendedPacket, amendment, compiled, invalidation, proofRecovery, rebindAudits,
  intakeEffectiveness, appliedAt
}) {
  return {
    version: 1,
    revision,
    ...amendedPacket,
    reason: String(amendment.reason || "Agreement expanded during Build"),
    requirementKeys: compiled.addedRequirementKeys,
    revisedRequirementKeys: compiled.revisedRequirementKeys,
    removedRequirementKeys: compiled.removedRequirementKeys,
    removedClaims: compiled.removedClaimIds,
    invalidatedClaims: compiled.invalidatedClaims,
    ...(compiled.taskContractChanges.length
      ? { taskContractChanges: compiled.taskContractChanges } : {}),
    ...(compiled.removedTasks?.length ? { removedTasks: compiled.removedTasks } : {}),
    invalidation: {
      affectedTasks: invalidation.affectedTasks,
      affectedProviders: invalidation.affectedProviders,
      preservedProviders: invalidation.preservedProviders,
      approval: invalidation.approval,
      proof: invalidation.proof,
      proofRecovery,
      rebindAudits
    },
    ...(intakeEffectiveness ? { semanticIntakeEffectiveness: intakeEffectiveness } : {}),
    appliedAt
  };
}

export function amendedReport(id, amended, compiled, gate) {
  return `AMENDED ${id}\n  revision: ${amended.contractRevision}\n` +
    `  invalidated claims: ${[...compiled.invalidatedClaims, ...compiled.removedClaimIds.map((claim) =>
      `${claim} (removed)`)].join(", ") || "none"}\n` +
    (compiled.removedTasks?.length ? `  removed tasks: ${compiled.removedTasks.map((task) =>
      task.key ? `${task.id} (${task.key})` : task.id).join(", ")}\n` : "") +
    (compiled.taskContractChanges.some((task) => task.reopened)
      ? `  reopened tasks: ${compiled.taskContractChanges.filter((task) => task.reopened)
        .map((task) => task.id).join(", ")} (verified again before they count as done)\n` : "") +
    `  proof: ${compiled.invalidation.proofRecovery?.recovery?.instruction ||
      "re-enter Prove so receipt bindings are recomputed"}\n` +
    formatInvalidatedWaivers(id, amended.waivers, amended.contractRevision) +
    (amended.pendingApprovalDelta
      ? `  requirement delta awaiting approval:\n${formatApprovalDelta(amended.pendingApprovalDelta)}\n`
      : `  requirement delta (covered by the current approval):\n${formatApprovalDelta({
        added: compiled.addedRequirementKeys, revised: compiled.revisedRequirementKeys,
        removed: compiled.removedRequirementKeys })}\n`) +
    (gate ? `  decision required: the final AI review failed before this amendment, so Land needs a locked Decision Sheet revision first: ${gate.command}\n` : "") +
    `  proof command: ${compiled.invalidation.proofRecovery?.recovery?.command ||
      `claude-foundation advance ${id} --through proven`}\n` +
    `  next: claude-foundation advance ${id}`;
}
