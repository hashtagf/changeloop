// The delivery commit: the branch it goes on, the workspace and projection it
// stages, its subject and branch names, creating or recovering the commit,
// and the GitHub CLI JSON calls around it.
import { existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { resultText } from "./pull-request-body.mjs";
import { deliveryBranchName, deliveryCommitSubject, deliveryNamingValues, namingInvalid } from "./delivery-naming.mjs";
import { copyEntry, gitOutput, providerUnavailable, runChecked, workspaceDrift } from "./delivery-projection.mjs";

export function createDeliveryCommit({
  git, integrity, root, run, workspacePath
}) {
  function assertDeliveryBranch(branch, provider) {
    if ([provider.baseBranch, provider.defaultBranch].includes(branch)) {
      const error = /** @type {Error & Record<string, any>} */ (new Error(`delivery branch '${branch}' is the remote default or PR base branch; configure a feature branch and retry Deliver`));
      error.code = "DELIVERY_DEFAULT_BRANCH_FORBIDDEN";
      throw error;
    }
  }

  function prepareWorkspace(id, state, projection, branch, repositoryRoot = root,
    workspace = workspacePath(id), start = projection.baseHead) {
    const currentHead = gitOutput(git, ["rev-parse", "HEAD"], repositoryRoot,
      "cannot inspect target HEAD");
    // The delivery branch is built from the Land base and the proven content
    // is verified separately, so commits added on top of that base (the user
    // committing other work) do not change what is delivered. A rewritten
    // history — reset or rebase away from the base — still stops for a choice.
    const descendsFromBase = projection.baseHead && currentHead !== projection.baseHead &&
      git(["merge-base", "--is-ancestor", projection.baseHead, currentHead], repositoryRoot).status === 0;
    if (!projection.baseHead || (currentHead !== projection.baseHead && !descendsFromBase)) {
      const error = /** @type {Error & Record<string, any>} */ (new Error(`target HEAD moved after Land (expected ${projection.baseHead || "unknown"}, observed ${currentHead})`));
      error.code = "DELIVERY_TARGET_MOVED";
      throw error;
    }
    if (!existsSync(workspace)) {
      mkdirSync(dirname(workspace), { recursive: true });
      const branchExists = git(["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], repositoryRoot).status === 0;
      if (branchExists && state.branch === branch) {
        runChecked(run, "git", ["worktree", "add", workspace, branch],
          { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }, "cannot restore delivery worktree");
      } else {
        runChecked(run, "git", ["worktree", "add", "--detach", workspace, start],
          { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }, "cannot create delivery worktree");
        runChecked(run, "git", ["switch", "-c", branch],
          { cwd: workspace, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }, "cannot create delivery branch");
        for (const path of projection.roots)
          copyEntry(join(repositoryRoot, path), join(workspace, path));
        if (repositoryRoot === root)
          rmSync(join(workspace, "openspec", "changes", id), { recursive: true, force: true });
      }
    }
    const observedBranch = gitOutput(git, ["branch", "--show-current"], workspace,
      "cannot inspect delivery branch");
    if (observedBranch !== branch)
      throw new Error(`delivery workspace uses unexpected branch '${observedBranch || "detached"}'`);
    return workspace;
  }

  function stageProjection(workspace, projection, gitlinks = []) {
    integrity.assertConversion(workspace, projection);
    const stageable = projection.roots.filter((path) => {
      if (lstatSync(join(workspace, path), { throwIfNoEntry: false })) return true;
      const tracked = git(["ls-files", "-z", "--", path], workspace);
      return tracked.status === 0 && Boolean(tracked.stdout);
    });
    if (!stageable.length) throw new Error("delivery projection has no stageable paths");
    const result = git(["add", "-A", "--", ...stageable], workspace);
    if (result.status !== 0) throw new Error(`cannot stage delivery projection: ${resultText(result)}`);
    for (const link of gitlinks) {
      const update = git(["update-index", "--add", "--cacheinfo",
        `160000,${link.commit},${link.path}`], workspace);
      if (update.status !== 0)
        throw new Error(`cannot stage delivered gitlink '${link.path}': ${resultText(update)}`);
    }
    const staged = gitOutput(git, ["diff", "--cached", "--name-only", "-z"], workspace,
      "cannot inspect staged projection").split("\0").filter(Boolean).sort();
    const allowedGitlinks = new Set(gitlinks.map((link) => link.path));
    const outside = staged.filter((path) => !allowedGitlinks.has(path) &&
      !projection.roots.some((rootPath) => path === rootPath || path.startsWith(`${rootPath}/`)));
    if (outside.length) throw new Error(`delivery staged paths outside the proven projection: ${outside.join(", ")}`);
    if (!staged.length) throw new Error("delivery projection produces no commit");
    integrity.assertTree(workspace, projection,
      gitOutput(git, ["write-tree"], workspace, "cannot inspect staged delivery tree"), gitlinks);
    return staged;
  }

  // Commit subject and branch from the project's `deliver` naming templates.
  // Both are settled before any workspace exists, so an invalid setting is
  // refused without a commit, push, or pull request.
  function namingValues(policy, id, narrative) {
    return deliveryNamingValues({ changeId: id, narrative, ticketPattern: policy.ticketPattern });
  }

  function commitSubject(policy, id, narrative) {
    return deliveryCommitSubject(policy.commitSubject, namingValues(policy, id, narrative));
  }

  function deliveryBranch(policy, id, narrative, repositoryRoot = root) {
    const branch = deliveryBranchName(policy.branchPattern, id, namingValues(policy, id, narrative));
    if (git(["check-ref-format", `refs/heads/${branch}`], repositoryRoot).status !== 0)
      throw namingInvalid(`deliver.branchPattern produces '${branch}', which git check-ref-format rejects`);
    return branch;
  }

  function createCommit(workspace, message) {
    runChecked(run, "git", ["commit", "-m", message],
      { cwd: workspace, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }, "cannot create delivery commit");
    return gitOutput(git, ["rev-parse", "HEAD"], workspace, "cannot resolve delivery commit");
  }

  function recoverCommit(workspace, projection, gitlinks = []) {
    const head = gitOutput(git, ["rev-parse", "HEAD"], workspace,
      "cannot inspect delivery workspace HEAD");
    if (head === projection.baseHead) return null;
    const count = Number(gitOutput(git,
      ["rev-list", "--count", `${projection.baseHead}..${head}`], workspace,
      "cannot inspect delivery commit history"));
    if (count !== 1) throw workspaceDrift("delivery branch contains an unexpected commit history");
    const changed = gitOutput(git,
      ["diff", "--name-only", "-z", projection.baseHead, head], workspace,
      "cannot inspect recovered delivery commit").split("\0").filter(Boolean);
    const allowedGitlinks = new Set(gitlinks.map((link) => link.path));
    const outside = changed.filter((path) => !allowedGitlinks.has(path) &&
      !projection.roots.some((rootPath) => path === rootPath || path.startsWith(`${rootPath}/`)));
    if (outside.length)
      throw workspaceDrift(`delivery commit contains paths outside the proven projection: ${outside.join(", ")}`);
    const dirty = gitOutput(git, ["status", "--porcelain"], workspace,
      "cannot inspect recovered delivery workspace");
    const unexpectedDirty = dirty.split("\n").filter(Boolean).filter((line) => {
      const path = line.slice(3).split(" -> ").at(-1);
      return !allowedGitlinks.has(path);
    });
    if (unexpectedDirty.length)
      throw workspaceDrift("delivery workspace changed after its commit");
    return { commit: head, stagedPaths: changed, recovered: true };
  }

  function githubJson(args, failure, invalid, empty) {
    const result = run("gh", args, { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    if (result.status !== 0) throw providerUnavailable(`${failure}: ${resultText(result)}`);
    try { return JSON.parse(result.stdout || empty); }
    catch { throw providerUnavailable(invalid); }
  }

  return {
    assertDeliveryBranch, prepareWorkspace, stageProjection, commitSubject, deliveryBranch,
    createCommit, recoverCommit, githubJson
  };
}
