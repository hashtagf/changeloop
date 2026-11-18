// Recovery routes for evidence the harness cannot produce itself: review and
// acceptance receipts, other external evidence, and repository
// infrastructure (missing, unpinned, or unreadable repositories).
import { resolve } from "node:path";
import { worktreeOwnedByTarget } from "../core/repository-binding.mjs";

export function reviewEvidenceRecovery(id, provider) {
  return {
    provider,
    kind: "user-decision",
    request: {
      command: `cloop authority request ${id} --type review`,
      packet: `cloop packet ${id} --phase review`
    },
    decision: {
      kind: "independent-review",
      summary: "Automated evidence is ready, but an independent reviewer must inspect the current implementation before proof can finish.",
      options: [
        { id: "prepare-for-user", outcome: "Prepare a bounded review packet for the user to inspect." },
        { id: "prepare-for-reviewer", outcome: "Run the configured fresh reviewer. A Codex-only or Claude-Code-only project may commit review.diversity='single-model' while keeping identity/session independence required." },
        { id: "waive-independence", outcome: "Only if the project deliberately accepts the same reviewer identity/session, set review.independence='self'; the receipt records that independence was not observed." },
        { id: "pause", outcome: "Keep the change pending without recording a review result." }
      ],
      recommended: "prepare-for-reviewer",
      responseStatuses: ["pass", "fail", "inconclusive", "error"]
    }
  };
}

export function acceptanceEvidenceRecovery(id, provider, acceptance = {}) {
  const claimIds = acceptance.claimIds || [];
  const origin = acceptance.scopeOrigin || "explicit";
  const withdrawal = origin === "claim-capability"
    ? `Drop capability 'acceptance' from claim(s) ${claimIds.join(", ") || "in evidence.yaml"}, then re-run 'cloop change validate ${id}'. Clearing the resolve flag alone will not lift this gate while the claim declares it.`
    : `Withdraw the requirement: cloop change resolve ${id} --acceptance-not-required`;
  return {
    provider,
    kind: "user-decision",
    request: { command: `cloop authority request ${id} --type acceptance` },
    decision: {
      kind: "human-acceptance",
      summary: `A named person must inspect the final result and decide whether the declared acceptance criteria are satisfied${
        claimIds.length ? ` for claim(s) ${claimIds.join(", ")}` : ""}.`,
      scope: {
        claims: claimIds,
        origin,
        reason: acceptance.reason || null,
        detail: origin === "claim-capability"
          ? "These claims declare capability 'acceptance' in evidence.yaml; that declaration, not the resolve flag, is what requires a human here."
          : "This gate was recorded by an explicit --acceptance-required decision."
      },
      options: [
        { id: "inspect", outcome: "Inspect the final result and then accept, reject, or report uncertainty." },
        { id: "request-changes", outcome: "Reject the current result and describe what must change." },
        { id: "withdraw-requirement", outcome: withdrawal },
        { id: "pause", outcome: "Keep the change pending without an acceptance decision." }
      ],
      recommended: "inspect",
      responseStatuses: ["pass", "fail", "inconclusive", "error"]
    }
  };
}

// `aliasOf` names the test provider whose command this provider only
// repeated; that run cannot stand in for the capability, so the summary says
// why the provider is unwired rather than implying it never had a command.
export function genericExternalEvidenceRecovery(provider, wiring, aliasOf = null) {
  const repeated = aliasOf
    ? ` Its configured command only repeats test provider '${aliasOf}', which observes nothing beyond those tests.`
    : "";
  return {
    provider,
    kind: "user-decision",
    ...(wiring ? { wiring } : {}),
    ...(aliasOf ? { aliasOf } : {}),
    decision: {
      kind: "external-evidence",
      summary: (wiring
        ? `Provider '${provider}' has no adapter yet, but this project already owns a command that can prove it (${wiring.source}).`
        : `Provider '${provider}' needs verifiable evidence from outside the local harness.`) + repeated,
      options: [
        ...(wiring ? [{ id: "wire-provider", outcome: `Wire the project-owned command detected at ${wiring.source}.` }] : []),
        { id: "provide-evidence", outcome: "Provide a real external result and durable reference." },
        { id: "configure-provider", outcome: "Configure an equivalent project-owned executable provider." },
        { id: "pause", outcome: "Keep the change pending without claiming a result." }
      ],
      recommended: wiring ? "wire-provider" : "provide-evidence",
      responseStatuses: ["pass", "fail", "inconclusive", "error"]
    }
  };
}

export function externalEvidenceRecoveryOperation({
  providerCapability,
  providerConfig,
  loadRuntime,
  wiringChoice
}, id, provider) {
  const config = providerConfig(id, provider);
  const capability = providerCapability(provider, config);
  if (capability === "review") return reviewEvidenceRecovery(id, provider);
  if (capability === "acceptance")
    return acceptanceEvidenceRecovery(id, provider, loadRuntime(id).acceptance || {});
  return genericExternalEvidenceRecovery(provider, wiringChoice(id, provider),
    config?.aliasOf || null);
}

export function repositoryRuntimeState(state, repository) {
  return state.repositories?.[repository.id] ||
    (repository.id === "root" ? state.workspace : null) || {};
}

export function selectedRepositoryInfrastructureIssueRows({
  repository,
  runtime,
  state,
  pathExists,
  gitHead,
  root = null,
  changeId = null,
  ownsWorktree = worktreeOwnedByTarget
}) {
  if (!["worktree", "copy"].includes(state?.workspace?.mode)) return [];
  if (!runtime.path || !pathExists(runtime.path))
    return [`selected repository '${repository.id}' isolated workspace is missing`];
  if (repository.id !== "root" && root && changeId) {
    if (runtime.mode !== "worktree")
      return [`selected repository '${repository.id}' has invalid isolated mode '${runtime.mode || "missing"}'`];
    for (const field of ["targetPath", "baseHead", "access"])
      if (!runtime[field])
        return [`selected repository '${repository.id}' isolated binding is missing ${field}`];
    if (resolve(runtime.targetPath) !== resolve(repository.path))
      return [`selected repository '${repository.id}' target no longer matches the repository catalog`];
    if (runtime.access !== repository.mode)
      return [`selected repository '${repository.id}' access changed from '${runtime.access}' to '${repository.mode}'`];
    const expected = resolve(root, ".foundation", "repository-sandboxes",
      changeId, repository.id);
    if (resolve(runtime.path) !== expected)
      return [`selected repository '${repository.id}' path is not its canonical sandbox path`];
  }
  if (runtime.mode === "worktree") {
    if (!gitHead(runtime.path))
      return [`selected repository '${repository.id}' path is not a valid Git worktree`];
    const targetPath = repository.path || runtime.targetPath;
    if (targetPath && !ownsWorktree(runtime.path, targetPath))
      return [`selected repository '${repository.id}' worktree is not owned by its selected target`];
  }
  return [];
}

export function repositoryInfrastructureIssueRows({
  provider,
  repository,
  runtime,
  pathExists,
  git
}) {
  if (!pathExists(repository.workspacePath))
    return [`provider '${provider}' repository '${repository.id}' workspace is missing`];
  const issues = [];
  if (repository.mode === "read" && runtime.mode === "reference")
    issues.push(`provider '${provider}' repository '${repository.id}' is a live reference, not an isolated workspace`);
  if (runtime.setup?.status === "failed")
    issues.push(`provider '${provider}' repository '${repository.id}' setup failed`);
  if (repository.mode === "read" && runtime.mode === "worktree") {
    const changed = git(["status", "--porcelain"], repository.workspacePath);
    if (changed.status !== 0 || changed.stdout.trim())
      issues.push(`provider '${provider}' read-only repository '${repository.id}' changed: ${
        changed.stdout.trim() || changed.stderr.trim() || "git status failed"}`);
  }
  return issues;
}

export function repositoryInfrastructureIssuesOperation({
  loadRuntime,
  requiredProviders,
  providerConfig,
  providerRepositories,
  selectedRepositories,
  pathExists,
  git,
  gitHead,
  root = null,
  ownsWorktree = worktreeOwnedByTarget
}, id) {
  const state = loadRuntime(id);
  const issues = [];
  const selected = selectedRepositories(id, state,
    (message) => { throw new Error(message); },
    { useTargetPaths: true, withoutGit: true });
  for (const repository of selected)
    issues.push(...selectedRepositoryInfrastructureIssueRows({
      repository,
      runtime: repositoryRuntimeState(state, repository),
      state,
      pathExists,
      gitHead,
      root,
      changeId: id,
      ownsWorktree
    }));
  // Provider repository resolution consumes the runtime binding checked
  // above. Do not let that dependent read throw and replace the actionable
  // primary infrastructure result.
  if (issues.length) return [...new Set(issues)];
  for (const provider of requiredProviders(id)) {
    const config = providerConfig(id, provider) || {};
    for (const repository of providerRepositories(id, provider, config))
      issues.push(...repositoryInfrastructureIssueRows({
        provider,
        repository,
        runtime: repositoryRuntimeState(state, repository),
        pathExists,
        git
      }));
  }
  return [...new Set(issues)];
}
