import { createHash } from "node:crypto";

// Explicit fakes for runtime-factory collaborators the composition root always
// supplies. Each fake is the no-op a focused test needs; pass an override to
// exercise the collaborator. A null/undefined override keeps the fake.
function withFakes(fakes, overrides = {}) {
  const deps = { ...fakes };
  for (const [name, value] of Object.entries(overrides))
    if (value != null || !(name in fakes)) deps[name] = value;
  return deps;
}

export function advanceRuntimeDeps(overrides) {
  return withFakes({
    inspectSnapshots: (operation) => operation(),
    authorityNext: () => null,
    proofReadinessValue: () => null,
    agentPlanValue: () => null,
    assertApproval: () => {},
    prepareBuild: async () => {},
    recoverReviewBindings: async () => false,
    recoverWorkspace: async () => {},
    recoverArchive: async () => false,
    saveRuntime: () => {},
    settleSessionLeases: () => {},
    issueSessionLease: (id, value) => value,
    reverifyCompletedTasks: () => {},
    synchronizeAgreement: async () => false,
    authorizeLand: async () => {},
    hasLandGrant: () => false,
    recordPhase: () => {},
    capture: (operation) => operation(),
    captureAsync: async (operation) => operation(),
    markBlocked: () => {},
    pendingApprovalDecisions: () => [],
    approvalPackageLink: () => null
  }, overrides);
}

// Without proof collaborators wired, selective proof recovery finds no
// providers and no receipts, as a change with no evidence yet.
export function changeLifecycleDeps(overrides = {}) {
  return withFakes({
    approvalPackageLink: () => null,
    recordPrototypeSync: () => null,
    approvalLanes: () => ({ configured: [], required: [] }),
    activeChangePath: overrides.changePath,
    git: () => ({ status: 1, stdout: "", stderr: "" }),
    receiptPath: (id, provider) => `/nonexistent/foundation-test-receipts/${id}/${provider}.json`,
    receiptValidity: () => ({ validity: "missing" }),
    contractFingerprint: () => null,
    requiredProviders: () => [],
    providerConfig: () => null,
    claimsForProvider: () => [],
    providerWorkspaceHash: () => null,
    providerInputIdentity: () => null,
    relevantHash: () => null,
    stableHash: (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex"),
    trapFailures: (operation) => operation(),
    rollbackStart: () => [],
    repositoryCatalog: () => ({ repositories: [] }),
    decisionGateNotice: () => null
  }, overrides);
}

export function proofReadinessRuntimeDeps(overrides = {}) {
  const { evidence, selectedRepositories, providerConfig } = overrides;
  return withFakes({
    markBlocked: () => {},
    providerRepositories: (id, provider, config = providerConfig(id, provider)) =>
      config?.repository
        ? selectedRepositories(id).filter((repository) => repository.id === config.repository)
        : selectedRepositories(id),
    requiredProviders: (id) => Object.keys(evidence(id).providers || {}),
    git: () => ({ status: 0, stdout: "", stderr: "" }),
    gitHead: () => null,
    handoffReadiness: (id) => ({
      version: 1, changeId: id, status: "COMPLETE",
      operations: [], blocking: [], tracked: []
    }),
    agentPlanValue: () => null,
    authorityPreflight: () => ({ status: "READY", blockers: [], decision: null }),
    executionContract: () => null,
    targetEditIssues: () => [],
    clearSnapshotCache: () => {}
  }, overrides);
}

export function agentPlannerDeps(overrides) {
  return withFakes({
    authorityPreflight: () => ({ status: "READY", blockers: [] }),
    executionContract: () => null,
    taskResult: () => null,
    taskLease: () => null,
    taskPacketWasPrecompleted: () => false
  }, overrides);
}
