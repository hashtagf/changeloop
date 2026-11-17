import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { worktreeOwnedByTarget } from "../../core/repository-binding.mjs";

// A commit read, not executed. Inspection must not resolve a program through
// PATH, so ref files are the authority for both ordinary and linked worktrees.
export function headOfRepository(start) {
  let gitPath = join(start, ".git");
  if (!existsSync(gitPath)) return null;
  try {
    if (statSync(gitPath).isFile()) {
      const pointer = readFileSync(gitPath, "utf8").match(/^gitdir:\s*(.+?)\s*$/m);
      if (!pointer) return null;
      gitPath = resolve(start, pointer[1]);
    }
    const head = readFileSync(join(gitPath, "HEAD"), "utf8").trim();
    if (/^[0-9a-f]{40}$/i.test(head)) return head;
    const ref = head.match(/^ref:\s*(.+)$/)?.[1]?.trim();
    if (!ref) return null;
    const loose = join(gitPath, ...ref.split("/"));
    if (existsSync(loose)) {
      const value = readFileSync(loose, "utf8").trim();
      return /^[0-9a-f]{40}$/i.test(value) ? value : null;
    }
    // A ref that has been packed away has no loose file, and a repository
    // that has ever been gc'd keeps most of its refs that way.
    const packed = join(gitPath, "packed-refs");
    if (!existsSync(packed)) return null;
    for (const line of readFileSync(packed, "utf8").split("\n")) {
      const match = line.match(/^([0-9a-f]{40})\s+(.+)$/);
      if (match && match[2].trim() === ref) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function workspaceIsolationKind(mode) {
  if (mode === "worktree") return "git-worktree";
  if (mode === "copy") return "filesystem-copy";
  return "none";
}

export function unusedCopyResolveMessage(paths) {
  return `--resolve names ${paths.map((path) => `'${path}'`).join(", ")
  }, which ${paths.length === 1 ? "is" : "are"} not in conflict; drop ${
    paths.length === 1 ? "it" : "them"} and sync again`;
}

export function workspaceIdentityValid(kind, path, { gitMetadataPresent, directoryExists }) {
  if (kind === "git-worktree") return gitMetadataPresent(path);
  if (kind === "filesystem-copy") return directoryExists(path);
  return true;
}

export function repositoryInspectionRows(repositories, selected = [], context = {}) {
  const records = repositories || {};
  const expected = new Set(selected.map((repository) => repository.id));
  const ids = new Set([...Object.keys(records), ...expected]);
  const directoryExists = context.directoryExists || existsSync;
  const gitMetadataPresent = context.gitMetadataPresent || directoryExists;
  const ownsWorktree = context.worktreeOwnedByTarget || worktreeOwnedByTarget;
  return [...ids].map((repositoryId) => {
    const runtime = records[repositoryId];
    const selectedRepository = selected.find((row) => row.id === repositoryId);
    if (!runtime) return {
      id: repositoryId, access: selectedRepository?.mode || null,
      kind: "none", status: "missing-record", path: null, baseHead: null, targetPath: null
    };
    const kind = runtime.mode === "worktree" ? "git-worktree" :
      runtime.mode === "copy" ? "filesystem-copy" :
        runtime.mode === "reference" ? "reference" : "none";
    const present = Boolean(runtime.path && directoryExists(runtime.path));
    const identityValid = present && (runtime.mode !== "worktree" ||
      gitMetadataPresent(runtime.path));
    const ownershipValid = identityValid && (runtime.mode !== "worktree" ||
      !selectedRepository?.path || ownsWorktree(runtime.path, selectedRepository.path));
    const unexpected = expected.size > 0 && !expected.has(repositoryId);
    return {
      id: repositoryId,
      access: runtime.access || "write",
      kind,
      status: unexpected ? "unexpected-record" :
        !present ? "missing" : !identityValid || !ownershipValid ? "invalid" : "active",
      path: runtime.path || null,
      baseHead: runtime.baseHead || null,
      targetPath: runtime.targetPath || null
    };
  }).sort((left, right) => left.id.localeCompare(right.id));
}

export function workspaceTargetDrift(kind, baseHead, targetHead) {
  return kind === "git-worktree" && baseHead && targetHead && baseHead !== targetHead
    ? "target-moved"
    : "none";
}

export function workspaceInspectionValue({
  root,
  gitMetadataPresent,
  directoryExists,
  headOfRepository,
  worktreeOwnedByTarget
}, state, selected = []) {
  const workspace = state.workspace || {};
  const kind = workspaceIsolationKind(workspace.mode);
  const identityValid = workspaceIdentityValid(kind, workspace.path, {
    gitMetadataPresent,
    directoryExists
  });
  const status = kind === "none" ? "current" : identityValid ? "active" : "missing";
  const targetHead = headOfRepository(root);
  const baseHead = workspace.baseHead || null;
  return {
    kind,
    status,
    path: workspace.path || root,
    baseHead,
    targetHead,
    drift: workspaceTargetDrift(kind, baseHead, targetHead),
    repositories: repositoryInspectionRows(state.repositories, selected, {
      gitMetadataPresent, directoryExists, worktreeOwnedByTarget
    })
  };
}

export function workspaceInspectionFor(context) {
  return (id, state = context.loadRuntime(id)) => {
    let selected = [];
    let selectionError = null;
    try {
      selected = context.selectedRepositories?.(id, state,
        (message) => { throw new Error(message); },
        { useTargetPaths: true, withoutGit: true }) || [];
    } catch (error) {
      selectionError = error.message;
    }
    return {
      ...workspaceInspectionValue(context, state, selected),
      ...(selectionError ? { selectionError } : {})
    };
  };
}

export function inspectSandbox(context, id, flags = {}) {
  const workspaceIsolation = context.workspaceInspection(id);
  const preflight = context.hostAttestation.preflight(id, flags);
  return {
    version: 1,
    changeId: id,
    workspaceIsolation,
    securityBoundary: preflight.securityBoundary,
    attestation: preflight.attestation,
    execution: {
      mode: flags.unattended ? "unattended" : "interactive",
      boundaryDetected: preflight.boundaryDetected,
      safeForUnattended: preflight.safeForUnattended,
      decision: !flags.unattended || preflight.safeForUnattended ? "allow" : "block",
      reasons: preflight.reasons
    }
  };
}

export function showSandboxInspection(context, id, flags = {}) {
  const result = context.inspect(id, flags);
  if (flags.json) context.output.log(JSON.stringify(result, null, 2));
  else {
    context.output.log(`ISOLATION ${id}`);
    context.output.log(`  workspace isolation: ${result.workspaceIsolation.kind} (${result.workspaceIsolation.status})`);
    if (result.workspaceIsolation.drift === "target-moved")
      context.output.log(`  target drift: base ${
        String(result.workspaceIsolation.baseHead).slice(0, 8)} -> target ${
        String(result.workspaceIsolation.targetHead).slice(0, 8)}; run 'cloop sandbox sync ${id}' to replay onto it`);
    if (result.workspaceIsolation.selectionError)
      context.output.log(`  repository selection: invalid (${result.workspaceIsolation.selectionError})`);
    for (const repository of result.workspaceIsolation.repositories || [])
      context.output.log(`  repository ${repository.id}: ${repository.kind} (${repository.status})${
        repository.path ? ` ${repository.path}` : ""}`);
    context.output.log(`  security boundary: ${result.securityBoundary.kind} (${result.securityBoundary.status})`);
    context.output.log(`  safe for unattended: ${result.execution.safeForUnattended ? "yes" : "no"}`);
    for (const reason of result.execution.reasons) context.output.log(`  reason: ${reason}`);
  }
  if (flags.unattended && !result.execution.safeForUnattended) {
    context.markBlocked({
      code: "workspace-boundary",
      reason: `unsafe for unattended execution: ${result.execution.reasons.join("; ") || "unspecified"}`
    });
    context.runtimeProcess.exitCode = 1;
  }
}
