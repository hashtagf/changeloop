import {
  appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { repositoryDeliveryOrder } from "./repository-delivery-saga.mjs";
import { createDeliveryMerge } from "./delivery-merge.mjs";
import { createDeliveryIntegrity } from "../transaction/delivery-integrity.mjs";
import {
  clean, containsSecretMaterial, deliveryEvidenceAssessment,
  followUpDeliveryCandidates, parseGitHubRemote, pullRequestNarrative,
  pullRequestUrlKey, renderPullRequestBody, resultText
} from "./pull-request-body.mjs";
import {
  deliveryBranchName, deliveryCommitSubject, deliveryNamingValues, deliveryPolicy,
  namingInvalid
} from "./delivery-naming.mjs";
import {
  DELIVERY_PROTOCOL_VERSION, DELIVERY_RECEIPT_SCHEMA_VERSION, LANDABLE_STATUSES, copyEntry,
  deliveryDecision, deliveryEnvelope, deliveryProjection, followUpNotice, gitOutput,
  providerUnavailable, repositoryDeliveryProjection, runChecked, safeRepositoryId,
  userEnvironmentDecision, workspaceDrift
} from "./delivery-projection.mjs";

export function createPullRequestRuntime({
  root,
  deliveriesRoot,
  loadRuntime,
  activeChangePath,
  proofPath,
  transactionJournalPath,
  pathIdentity,
  readJson,
  writeJson,
  stableHash,
  git,
  transactions = null,
  selectedRepositories = null,
  foundationPolicy = () => ({}),
  // `advance --through archived` for a proven change Deliver was invoked on.
  landChange = null,
  now = () => new Date().toISOString(),
  run = spawnSync,
  fail = (message, _code = 1, _details = null) => { throw new Error(message); }
}) {
  const integrity = createDeliveryIntegrity({ git, run, runChecked, gitOutput });
  const merger = createDeliveryMerge({ run, root });
  const statePath = (id) => join(deliveriesRoot, id, "state.json");
  const receiptPath = (id) => join(deliveriesRoot, id, "receipt.json");
  const bodyPath = (id) => join(deliveriesRoot, id, "pull-request.md");
  const eventsPath = (id) => join(deliveriesRoot, id, "events.jsonl");
  const workspacePath = (id) => join(deliveriesRoot, id, "workspace");
  const repositoryWorkspacePath = (id, repositoryId) => repositoryId === "root"
    ? workspacePath(id)
    : join(deliveriesRoot, id, "repositories", safeRepositoryId(repositoryId), "workspace");
  const repositoryBodyPath = (id, repositoryId) => repositoryId === "root"
    ? bodyPath(id)
    : join(deliveriesRoot, id, "repositories", safeRepositoryId(repositoryId), "pull-request.md");

  function saveDelivery(value) {
    value.updatedAt = now();
    writeJson(statePath(value.changeId), value);
    return value;
  }

  function loadDelivery(id) {
    return readJson(statePath(id), {
      version: DELIVERY_PROTOCOL_VERSION,
      changeId: id,
      status: "new",
      history: []
    });
  }

  function checkpoint(state, status, details = {}) {
    state.status = status;
    Object.assign(state, details);
    state.history = [...(state.history || []), { status, at: now() }].slice(-50);
    const saved = saveDelivery(state);
    appendEvent(state.changeId, { status, at: saved.updatedAt });
    return saved;
  }

  function appendEvent(changeId, fields) {
    mkdirSync(dirname(eventsPath(changeId)), { recursive: true });
    appendFileSync(eventsPath(changeId), `${JSON.stringify({ version: 1, changeId, ...fields })}\n`);
  }

  // The delivery workspace is harness-owned scratch until its branch is
  // pushed. Drift there (an interrupted attempt, a stray edit) is repaired by
  // rebuilding it once from the Land-bound projection, never by a new change.
  const UNPUBLISHED = ["binding-verified", "workspace-prepared", "commit-created"];
  function rebuildWorkspace(delivery, reason) {
    const workspace = delivery.workspace;
    if (workspace && existsSync(workspace)) {
      if (git(["worktree", "remove", "--force", workspace], root).status !== 0)
        rmSync(workspace, { recursive: true, force: true });
      git(["worktree", "prune"], root);
    }
    if (delivery.branch) git(["branch", "-D", delivery.branch], root);
    for (const key of ["workspace", "commit", "stagedPaths", "recovered"]) delete delivery[key];
    if (delivery.followUp) delete delivery.followUp.parent;
    return checkpoint(delivery, "binding-verified", {
      workspaceRebuilt: { at: now(), reason }
    });
  }

  function archivedSources(id, lifecycle) {
    const changeRoot = activeChangePath(id, lifecycle);
    const read = (name) => existsSync(join(changeRoot, name))
      ? readFileSync(join(changeRoot, name), "utf8") : "";
    return { proposal: read("proposal.md"), design: read("design.md"), tasks: read("tasks.md") };
  }

  function providerGitOutput(args, cwd, label) {
    try { return gitOutput(git, args, cwd, label); }
    catch (error) { throw providerUnavailable(error.message); }
  }

  function providerContext(policy, repositoryRoot = root) {
    const remoteUrl = providerGitOutput(["remote", "get-url", policy.remote], repositoryRoot,
      `cannot resolve Git remote '${policy.remote}'`);
    const remote = parseGitHubRemote(remoteUrl);
    if (!remote || (policy.provider !== "auto" && policy.provider !== "github"))
      throw providerUnavailable(`Deliver currently requires a GitHub remote; found '${remoteUrl}'`);
    if (!policy.allowedHosts.includes(remote.host))
      throw providerUnavailable(`Git remote host '${remote.host}' is not allowed by delivery policy`);
    const pushUrls = providerGitOutput(["remote", "get-url", "--push", "--all", policy.remote],
      repositoryRoot, "cannot resolve effective push remote").split("\n").filter(Boolean);
    if (!pushUrls.length || pushUrls.some((url) => {
      const destination = parseGitHubRemote(url);
      return !destination || destination.host !== remote.host ||
        destination.slug.toLowerCase() !== remote.slug.toLowerCase();
    })) throw providerUnavailable("Git push remote does not match the approved GitHub repository; correct the push URLs or URL rewrite rules and retry Deliver");
    // Query the remote: a cached origin/HEAD may be stale, and a configured PR
    // base is not authority to publish to the actual default branch.
    const heads = runChecked(run, "git", ["ls-remote", "--symref", policy.remote, "HEAD"],
      { cwd: repositoryRoot, encoding: "utf8", timeout: 60_000, maxBuffer: 1024 * 1024 },
      "cannot determine remote default branch");
    const defaultBranch = String(heads.stdout).match(/^ref: refs\/heads\/(.+)\tHEAD$/m)?.[1];
    if (!defaultBranch) throw providerUnavailable("Git remote default branch is unavailable; restore remote access and retry Deliver");
    return { remote, remoteName: policy.remote, pushUrls: [...new Set(pushUrls)].sort(),
      defaultBranch, baseBranch: policy.defaultBaseBranch || defaultBranch };
  }

  function assertProviderBinding(expected, observed) {
    const identity = (value) => ({ remote: value.remote,
      remoteName: value.remoteName, baseBranch: value.baseBranch,
      ...(expected?.pushUrls ? { pushUrls: value.pushUrls } : {}) });
    if (expected && stableHash(identity(expected)) !== stableHash(identity(observed)))
      throw providerUnavailable("Git remote delivery binding changed; restore the approved remote, push URLs and base branch before retrying Deliver");
  }

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

  function findPullRequest(provider, branch, baseBranch) {
    const rows = githubJson(["pr", "list", "--repo", provider.remote.slug,
      "--head", branch, "--base", baseBranch, "--state", "open",
      "--json", "number,url,state,isDraft,headRefOid", "--limit", "10"],
    "cannot query pull requests", "GitHub returned invalid pull-request JSON", "[]");
    return Array.isArray(rows) ? rows[0] || null : null;
  }

  function openPullRequest(provider, branch, narrative, body, draft,
    pullRequestBodyPath = bodyPath(narrative.changeId)) {
    mkdirSync(dirname(pullRequestBodyPath), { recursive: true });
    writeFileSync(pullRequestBodyPath, body);
    const args = ["pr", "create", "--repo", provider.remote.slug,
      "--head", branch, "--base", provider.baseBranch,
      "--title", narrative.title, "--body-file", pullRequestBodyPath];
    if (draft) args.push("--draft");
    const result = runChecked(run, "gh", args,
      { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }, "cannot open pull request");
    return clean(result.stdout).split(/\s+/).find((value) => /^https:\/\//.test(value)) || null;
  }

  // `successors` are later commits this project's own follow-up deliveries
  // pushed onto the same pull request; a head at one of them still counts as
  // this delivery when the delivered commit remains in its history.
  function verifyPullRequest(provider, url, commit, successors = []) {
    if (!url) throw providerUnavailable("GitHub did not return a pull-request URL");
    const value = githubJson(["pr", "view", url, "--repo", provider.remote.slug,
      "--json", "number,url,state,isDraft,headRefName,baseRefName,headRefOid"],
    "cannot verify pull request", "GitHub returned invalid pull-request verification JSON", "{}");
    const followedUp = value.headRefOid !== commit && successors.includes(value.headRefOid) &&
      git(["merge-base", "--is-ancestor", commit, value.headRefOid], root).status === 0;
    if (value.state !== "OPEN" || (value.headRefOid !== commit && !followedUp) ||
        value.baseRefName !== provider.baseBranch)
      throw new Error("pull-request read-back does not match the delivered commit and base branch");
    if (!clean(value.url).startsWith(`https://${provider.remote.host}/`))
      throw new Error("pull-request URL is outside the approved Git host");
    return value;
  }

  function priorReceipts(id) {
    if (!existsSync(deliveriesRoot)) return [];
    return readdirSync(deliveriesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== id &&
        existsSync(receiptPath(entry.name)))
      .map((entry) => readJson(receiptPath(entry.name), null))
      .filter((receipt) => receipt?.version === DELIVERY_RECEIPT_SCHEMA_VERSION);
  }

  // Review follow-up: when the change cites exactly one pull request this
  // project delivered and that pull request is still open on the same base,
  // Deliver pushes to its branch (fast-forward only) and updates it instead
  // of opening a second one. Anything else opens a new pull request and says
  // why. The binding is checkpointed so a resumed delivery never re-decides.
  function bindFollowUp(id, provider, sources) {
    // A pull request carries its original delivery and every follow-up that
    // updated it; bind to the newest receipt in that chain, once per PR.
    const byPullRequest = new Map();
    for (const row of followUpDeliveryCandidates({
      changeId: id, ...sources, receipts: priorReceipts(id)
    })) {
      const key = pullRequestUrlKey(row.pullRequest?.url);
      byPullRequest.set(key, [...(byPullRequest.get(key) || []), row]);
    }
    const candidates = [...byPullRequest.values()].map((rows) => {
      const origin = rows.find((row) => row.followUp?.mode !== "update-existing") || rows[0];
      return followUpSuccessors(origin).at(-1) || origin;
    });
    if (candidates.length === 0) return null;
    if (candidates.length > 1) return {
      mode: "new-pull-request", of: candidates.map((row) => row.changeId).sort(),
      notice: "The change cites more than one delivered pull request; a new pull request was opened instead of guessing which to update."
    };
    const [original] = candidates;
    const current = githubJson(["pr", "view", original.pullRequest.url, "--repo", provider.remote.slug,
      "--json", "number,url,state,headRefName,baseRefName,headRefOid"],
    "cannot read the pull request this change follows up", "GitHub returned invalid pull-request JSON", "{}");
    const reusable = current.state === "OPEN" && current.headRefName === original.branch &&
      current.baseRefName === provider.baseBranch &&
      ![provider.baseBranch, provider.defaultBranch].includes(original.branch);
    if (!reusable) return {
      mode: "new-pull-request", of: original.changeId, url: original.pullRequest.url,
      notice: `The pull request ${original.pullRequest.url} is ${
        current.state === "OPEN" ? "no longer on its delivered branch and base"
          : String(current.state || "unavailable").toLowerCase()
      }; a new pull request was opened for this follow-up.`
    };
    return {
      mode: "update-existing", of: original.changeId, url: current.url || original.pullRequest.url,
      number: current.number ?? original.pullRequest.number, branch: original.branch
    };
  }

  function fetchFollowUpHead(workspace, provider, branch) {
    runChecked(run, "git", ["fetch", "--no-tags", provider.remoteName, `refs/heads/${branch}`],
      { cwd: workspace, encoding: "utf8", maxBuffer: 8 * 1024 * 1024, timeout: 60_000 },
      "cannot fetch the pull-request branch this change follows up");
    return gitOutput(git, ["rev-parse", "FETCH_HEAD^{commit}"], workspace,
      "cannot resolve the pull-request branch this change follows up");
  }

  function existingReceipt(id, lifecycle) {
    if (!existsSync(receiptPath(id))) return null;
    const receipt = readJson(receiptPath(id));
    if (!receipt) return null;
    if (receipt.version !== DELIVERY_RECEIPT_SCHEMA_VERSION ||
        receipt.changeId !== id || receipt.archivedAt !== lifecycle.archivedAt)
      return null;
    return receipt;
  }

  function archivedRepositories(id, lifecycle) {
    if (!selectedRepositories) return [{
      id: "root", path: root, mode: "write", dependsOn: [], relativePath: "."
    }];
    return selectedRepositories(id, lifecycle, fail, {
      changeDir: join(root, lifecycle.archivedChangePath), useTargetPaths: true
    }).filter((repository) => repository.mode === "write");
  }

  // Steps shared by single- and multi-repository delivery. Each path keeps its
  // own checkpoint and receipt shape; these helpers only do the work.
  function requestDelivery(delivery) {
    if (delivery.status === "new") checkpoint(delivery, "requested", {
      requestedAt: now(), authority: {
        kind: "explicit-deliver-command",
        allowed: ["create-feature-branch", "stage-proven-projection", "commit",
          "push-feature-branch", "open-or-update-pr"],
        forbidden: ["force-push", "push-default-branch", "merge", "deploy", "publish"]
      }
    });
  }

  function boundProjection(repository, lifecycle, saved) {
    return integrity.bindProjection(repository.path,
      (saved?.version === 2 ? saved : null) || (repository.id === "root"
        ? deliveryProjection({ root, state: lifecycle, readJson, transactionJournalPath, pathIdentity })
        : repositoryDeliveryProjection({ repository, lifecycle, transactions, readJson, pathIdentity })));
  }

  function presentation({ id, lifecycle, sources, proof, policy, narrative, paths }) {
    narrative ||= pullRequestNarrative({ changeId: id, state: lifecycle, ...sources, proof, paths });
    const evidence = deliveryEvidenceAssessment({ root, lifecycle, proof, narrative, readJson });
    if (!evidence.requiredComplete && policy.missingRequiredEvidence === "block") {
      const error = /** @type {Error & Record<string, any>} */ (new Error(`required delivery evidence is incomplete: ${
        evidence.requiredIssues.join("; ")}`));
      error.code = "DELIVERY_EVIDENCE_BLOCKED";
      throw error;
    }
    narrative.quality = evidence.quality;
    narrative.presentationEvidence = {
      complete: evidence.presentationComplete, issue: evidence.presentationIssue
    };
    const draft = !evidence.presentationComplete &&
      policy.missingPresentationEvidence === "draft";
    const body = renderPullRequestBody(narrative, { draft });
    if (containsSecretMaterial(body))
      throw new Error("generated pull-request body appears to contain secret material");
    return { narrative, evidence, draft, body };
  }

  // Verifies a checkpointed commit (returning null) or recovers or creates it.
  function ensureCommit(workspace, projection, subject, existing, gitlinks, drift) {
    if (existing) {
      if (gitOutput(git, ["rev-parse", "HEAD"], workspace,
        "cannot verify delivery commit") !== existing) throw drift();
      return null;
    }
    const recovered = recoverCommit(workspace, projection, gitlinks);
    if (recovered) return recovered;
    const stagedPaths = stageProjection(workspace, projection, gitlinks);
    return { commit: createCommit(workspace, subject), stagedPaths };
  }

  // Never forced: a branch that moved after its head was fetched is refused
  // by the remote instead of overwritten.
  function pushCommit(policy, provider, workspace, commit, branch, label) {
    const currentProvider = providerContext(policy, workspace);
    assertProviderBinding(provider, currentProvider);
    assertDeliveryBranch(branch, currentProvider);
    runChecked(run, "git", ["push", "--set-upstream", provider.remoteName,
      `${commit}:refs/heads/${branch}`],
    { cwd: workspace, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }, label);
  }

  function publishedPullRequest(provider, branch, previousUrl, commit, open) {
    const found = findPullRequest(provider, branch, provider.baseBranch);
    return verifyPullRequest(provider,
      found ? found.url || previousUrl || null : open(), commit);
  }

  // The chain of verified follow-up deliveries that updated this delivery's
  // pull request, each built directly on the commit before it.
  function followUpSuccessors(receipt) {
    const key = pullRequestUrlKey(receipt.pullRequest?.url);
    const updates = priorReceipts(receipt.changeId).filter((row) =>
      row.followUp?.mode === "update-existing" && !row.multiRepository && row.commit &&
      row.branch === receipt.branch && pullRequestUrlKey(row.pullRequest?.url) === key);
    const chain = [];
    for (let current = receipt; ;) {
      const next = updates.find((row) => row.followUp.of === current.changeId &&
        row.followUp.parent === current.commit && !chain.includes(row));
      if (!next) return chain;
      chain.push(next);
      current = next;
    }
  }

  function reusedPullRequests(policy, priorReceipt, repositories, delivery) {
    if (!priorReceipt.multiRepository) {
      const provider = providerContext(policy);
      assertProviderBinding(delivery.provider, provider);
      const successors = followUpSuccessors(priorReceipt);
      const verified = verifyPullRequest(provider, priorReceipt.pullRequest.url,
        priorReceipt.commit, successors.map((row) => row.commit));
      const index = successors.findIndex((row) => row.commit === verified.headRefOid);
      return [{ ...priorReceipt.pullRequest, ...verified,
        ...(index >= 0 ? { followedUpBy: successors.slice(0, index + 1).map((row) => row.changeId) } : {}) }];
    }
    const byId = new Map(repositories.map((repository) => [repository.id, repository]));
    return Object.entries(priorReceipt.repositories || {}).map(([repositoryId, record]) => {
      const repository = byId.get(repositoryId);
      if (!repository)
        throw new Error(`delivered repository '${repositoryId}' is no longer selected`);
      const provider = providerContext(policy, repository.path);
      const verified = verifyPullRequest(provider, record.pullRequest.url, record.commit);
      return { ...record.pullRequest, ...verified, repositoryId };
    });
  }

  async function advanceMulti(id, lifecycle, delivery, policy, repositories) {
    if (!transactions) throw new Error("multi-repository Deliver has no transaction store");
    requestDelivery(delivery);
    const ordered = repositoryDeliveryOrder(repositories);
    const rootRepository = ordered.find((row) => row.id === "root");
    const execution = [
      ...ordered.filter((row) => row.id !== "root"),
      ...(rootRepository ? [rootRepository] : [])
    ];
    const proof = readJson(proofPath(id), {});
    const sources = archivedSources(id, lifecycle);
    const completed = new Map();
    delivery.repositories ||= {};
    // Validate every selected projection and destination before any repository
    // publishes. A later invalid root must not leave earlier child PRs behind.
    const prepared = new Map();
    const repositoryPaths = (repository, projection) => projection.entries.map((entry) =>
      repository.id === "root" ? entry.path : `${repository.id}:${entry.path}`);
    for (const repository of execution) {
      const node = delivery.repositories[repository.id] || { status: "new" };
      const projection = boundProjection(repository, lifecycle, node.projection);
      const noChange = repository.id !== "root" && projection.roots.length === 0;
      const provider = noChange ? null : providerContext(policy, repository.path);
      // The same narrative presentation() settles below, so naming is
      // validated for every repository before any of them publishes.
      const naming = noChange ? null : node.narrative || pullRequestNarrative({
        changeId: id, state: lifecycle, ...sources, proof, paths: repositoryPaths(repository, projection)
      });
      const branch = node.branch || (noChange ? null : deliveryBranch(policy, id, naming, repository.path));
      const subject = noChange || node.commit ? null : commitSubject(policy, id, naming);
      if (provider) {
        assertProviderBinding(node.provider, provider);
        assertDeliveryBranch(branch, provider);
      }
      prepared.set(repository.id, { projection, provider, branch, subject });
    }

    for (const repository of execution) {
      let node = delivery.repositories[repository.id] || { status: "new" };
      const { projection, provider, branch, subject } = prepared.get(repository.id);
      if (repository.id !== "root" && projection.roots.length === 0) {
        delivery.repositories[repository.id] = {
          ...node, status: "no-change", projection,
          repository: { id: repository.id, path: repository.path }
        };
        checkpoint(delivery, "repositories-delivering");
        continue;
      }
      const { narrative, draft, body } = presentation({
        id, lifecycle, sources, proof, policy, narrative: node.narrative,
        paths: repositoryPaths(repository, projection)
      });
      const workspace = node.workspace || repositoryWorkspacePath(id, repository.id);
      const gitlinks = repository.id === "root" ? repositories
        .filter((row) => row.type === "submodule" && row.id !== "root" &&
          row.relativePath && completed.has(row.id))
        .map((row) => ({ path: row.relativePath, commit: completed.get(row.id).commit })) : [];

      if (!existsSync(workspace))
        prepareWorkspace(id, node, projection, branch, repository.path, workspace);
      node = { ...node, status: node.status === "new" ? "workspace-prepared" : node.status,
        workspace, branch, projection, narrative, draft, provider, repository: {
          id: repository.id, path: repository.path, relativePath: repository.relativePath || null
        } };
      delivery.repositories[repository.id] = node;
      checkpoint(delivery, "repositories-delivering");

      const made = ensureCommit(workspace, projection, subject, node.commit, gitlinks,
        () => new Error(`delivery workspace commit changed for repository '${repository.id}'`));
      if (made) {
        if (!made.recovered) node.stagedPaths = made.stagedPaths;
        node.commit = made.commit;
        node.status = "commit-created";
        checkpoint(delivery, "repositories-delivering");
      }
      const { commit } = node;
      integrity.assertTree(workspace, projection, commit, gitlinks);
      integrity.assertPullRequestBase(workspace, provider, projection);
      if (node.status === "commit-created") {
        pushCommit(policy, provider, workspace, commit, branch,
          `cannot push delivery branch for '${repository.id}'`);
        node.status = "branch-pushed";
        node.provider = provider;
        checkpoint(delivery, "repositories-delivering");
      }
      const pullRequest = publishedPullRequest(provider, branch, node.pullRequest?.url, commit,
        () => openPullRequest(provider, branch, narrative, body, draft,
          repositoryBodyPath(id, repository.id)));
      node.status = "verified";
      node.pullRequest = {
        provider: "github", repositoryId: repository.id, number: pullRequest.number,
        url: pullRequest.url, state: pullRequest.state, draft: Boolean(pullRequest.isDraft),
        headCommit: pullRequest.headRefOid, baseBranch: provider.baseBranch
      };
      checkpoint(delivery, "repositories-delivering");
      completed.set(repository.id, node);
    }

    const delivered = execution.filter((repository) =>
      delivery.repositories[repository.id]?.pullRequest);
    const pullRequests = delivered.map((repository) =>
      delivery.repositories[repository.id].pullRequest);
    const receipt = {
      version: DELIVERY_RECEIPT_SCHEMA_VERSION,
      changeId: id,
      archivedAt: lifecycle.archivedAt,
      multiRepository: true,
      pullRequests,
      repositories: Object.fromEntries(delivered.map((repository) => {
        const node = delivery.repositories[repository.id];
        return [repository.id, {
          commit: node.commit, branch: node.branch,
          projectionHash: stableHash(node.projection.entries),
          pullRequest: node.pullRequest
        }];
      })),
      verifiedAt: now()
    };
    writeJson(receiptPath(id), receipt);
    checkpoint(delivery, "verified", { receiptDigest: stableHash(receipt) });
    return deliveryEnvelope(id, "DONE", {
      completed: true, reached: "pr-opened", reused: false, pullRequests
    });
  }

  // Invoking Deliver on a proven change is the user's authority to Land it
  // first: the normal `advance --through archived` route lands (issuing its
  // grant under this invocation), then delivery continues in the same call.
  // Opt-in merge of a verified single-repository delivery. The receipt keeps
  // the read-back merge so a repeated Deliver never merges twice.
  function mergeDelivered(id, delivery, receipt, provider, policy, reused) {
    const merge = receipt.merge || merger.mergeStage({ slug: provider.remote.slug,
      url: receipt.pullRequest.url, commit: receipt.commit, method: policy.merge.method });
    if (!receipt.merge) {
      receipt.merge = merge;
      writeJson(receiptPath(id), receipt);
      checkpoint(delivery, "merged", { merge, receiptDigest: stableHash(receipt) });
    }
    return deliveryEnvelope(id, "DONE", {
      completed: true, reached: "merged", reused, pullRequests: [receipt.pullRequest], merge
    });
  }

  async function landThenDeliver(id) {
    saveDelivery({ ...loadDelivery(id), landAuthority: {
      kind: "explicit-deliver-command", requestedAt: now()
    } });
    const landed = await landChange(id);
    if (loadRuntime(id).status !== "archived")
      return deliveryEnvelope(id, landed?.action && landed.action !== "DONE" ? landed.action : "WAIT", {
        completed: false, boundary: landed?.boundary || "land",
        reason: landed?.reason || "Land has not reached archived yet.",
        land: landed || null, resumeCommand: `cloop deliver advance ${id}`
      });
    const delivered = await advance(id);
    return { ...delivered, land: { reached: "archived", authority: "explicit-deliver-command" } };
  }

  async function advance(id) {
    const lifecycle = loadRuntime(id);
    if (lifecycle.status !== "archived") {
      if (landChange && LANDABLE_STATUSES.has(lifecycle.status)) return landThenDeliver(id);
      return deliveryDecision(id, {
        boundary: "change-not-proven",
        reason: `Deliver needs a proven change; '${id}' is ${lifecycle.status || "not started"}.`,
        options: [["finish-build-and-prove-then-deliver",
          `Finish Build and Prove with 'cloop advance ${id} --through archived', then run Deliver again.`]],
        resumeCommand: `cloop deliver advance ${id}`
      });
    }
    let delivery = loadDelivery(id);
    try {
      const policy = deliveryPolicy(foundationPolicy());
      const repositories = archivedRepositories(id, lifecycle);
      const priorReceipt = existingReceipt(id, lifecycle);
      // A receipt written before multi-repository support has no
      // `multiRepository` flag and stays readable for idempotent reuse.
      const multi = repositories.length > 1 || repositories.some((row) => row.id !== "root");
      const mergeEnabled = policy.merge.mode === "after-checks";
      const singleRepositoryNotice = mergeEnabled && multi
        ? { notice: "deliver.merge applies only to single-repository changes; these pull requests stay open." } : {};
      if (priorReceipt && !multi && !priorReceipt.multiRepository && mergeEnabled)
        return mergeDelivered(id, delivery, priorReceipt, providerContext(policy), policy, true);
      if (priorReceipt?.multiRepository || (priorReceipt && !multi))
        return deliveryEnvelope(id, "DONE", {
          completed: true, reached: "pr-opened", reused: true,
          pullRequests: reusedPullRequests(policy, priorReceipt, repositories, delivery),
          ...singleRepositoryNotice
        });
      if (multi) return { ...await advanceMulti(id, lifecycle, delivery, policy, repositories), ...singleRepositoryNotice };
      const provider = providerContext(policy);
      assertProviderBinding(delivery.provider, provider);
      requestDelivery(delivery);
      const projection = boundProjection({ id: "root", path: root }, lifecycle, delivery.projection);
      const binding = {
        archivedAt: lifecycle.archivedAt,
        proofRunId: lifecycle.land?.proofRunId || null,
        preArchiveWorkspaceHash: lifecycle.preArchiveWorkspaceHash || null,
        sourceProjectionHash: projection.sourceProjectionHash,
        targetHead: projection.baseHead
      };
      const bindingDigest = stableHash(binding);
      if (delivery.bindingDigest && delivery.bindingDigest !== bindingDigest)
        throw new Error("delivery binding changed after preparation");
      if (!["workspace-prepared", "commit-created", "branch-pushed", "pr-opened"].includes(delivery.status))
        delivery = checkpoint(delivery, "binding-verified", { binding, bindingDigest, projection });
      const sources = archivedSources(id, lifecycle);
      const proof = readJson(proofPath(id), {});
      const { narrative, evidence, draft, body } = presentation({
        id, lifecycle, sources, proof, policy, narrative: delivery.narrative,
        paths: projection.entries.map((entry) => entry.path)
      });
      const branch = delivery.branch || deliveryBranch(policy, id, narrative);
      // A follow-up's commit uses the same subject template as any delivery.
      const subject = delivery.commit ? null : commitSubject(policy, id, narrative);
      assertDeliveryBranch(branch, provider);
      if (!delivery.provider) delivery = checkpoint(delivery, delivery.status, { provider });
      if (delivery.followUp === undefined)
        delivery = checkpoint(delivery, delivery.status, {
          // A delivery already under way keeps the branch it started on.
          followUp: delivery.workspace || delivery.commit ? null : bindFollowUp(id, provider, sources)
        });
      const followUp = delivery.followUp?.mode === "update-existing" ? delivery.followUp : null;
      // The remote branch receiving the commit. A follow-up publishes onto the
      // pull request it continues; its local branch keeps this change's name.
      const pushBranch = followUp ? followUp.branch : branch;
      assertDeliveryBranch(pushBranch, provider);
      let workspace = delivery.workspace;
      if (!workspace || !existsSync(workspace)) {
        if (followUp && !followUp.parent) {
          followUp.parent = fetchFollowUpHead(root, provider, followUp.branch);
          delivery = checkpoint(delivery, delivery.status);
        }
        workspace = prepareWorkspace(id, delivery, projection, branch, root, workspacePath(id),
          followUp ? followUp.parent : projection.baseHead);
        delivery = checkpoint(delivery, "workspace-prepared", { workspace, branch, narrative, draft });
      }
      // Tree and history checks compare against the commit the delivery
      // builds on: the Land base, or the followed pull request's head.
      const parentProjection = followUp ? { ...projection, baseHead: followUp.parent } : projection;
      const made = ensureCommit(workspace, parentProjection, subject, delivery.commit, [],
        () => workspaceDrift("delivery workspace commit changed after checkpoint"));
      if (made) delivery = checkpoint(delivery, "commit-created", made);
      const { commit } = delivery;
      integrity.assertTree(workspace, parentProjection, commit);
      integrity.assertPullRequestBase(workspace, provider, projection);
      if (delivery.status === "commit-created") {
        pushCommit(policy, provider, workspace, commit, pushBranch, "cannot push delivery branch");
        delivery = checkpoint(delivery, "branch-pushed", { pushedAt: now(), provider });
      }
      const pullRequest = publishedPullRequest(provider, pushBranch, delivery.pullRequest?.url, commit,
        () => openPullRequest(provider, pushBranch, narrative, body, draft));
      delivery = checkpoint(delivery, "pr-opened", { pullRequest });
      const receipt = {
        version: DELIVERY_RECEIPT_SCHEMA_VERSION,
        changeId: id,
        archivedAt: lifecycle.archivedAt,
        bindingDigest,
        projectionHash: stableHash(projection.entries),
        commit,
        branch: pushBranch,
        baseBranch: provider.baseBranch,
        ...(delivery.followUp ? { followUp: delivery.followUp } : {}),
        pullRequest: {
          provider: "github",
          number: pullRequest.number,
          url: pullRequest.url,
          state: pullRequest.state,
          draft: Boolean(pullRequest.isDraft),
          headCommit: pullRequest.headRefOid
        },
        evidence: {
          requiredComplete: evidence.requiredComplete,
          presentationComplete: evidence.presentationComplete
        },
        quality: evidence.quality,
        verifiedAt: now()
      };
      writeJson(receiptPath(id), receipt);
      delivery = checkpoint(delivery, "verified", { receiptDigest: stableHash(receipt) });
      if (mergeEnabled) return mergeDelivered(id, delivery, receipt, provider, policy, false);
      return deliveryEnvelope(id, "DONE", {
        completed: true, reached: followUp ? "pr-updated" : "pr-opened", reused: false,
        pullRequests: [receipt.pullRequest],
        ...(delivery.followUp ? { followUp: followUpNotice(delivery.followUp) } : {})
      });
    } catch (error) {
      delivery.lastError = { message: error.message, code: error.code || "DELIVERY_FAILED", at: now() };
      saveDelivery(delivery);
      appendEvent(id, { status: "failed", code: delivery.lastError.code, at: delivery.lastError.at });
      const resumeCommand = `cloop deliver advance ${id}`;
      if (error.stage === "delivery-workspace" && !delivery.repositories &&
          UNPUBLISHED.includes(delivery.status) && !delivery.workspaceRebuilt) {
        rebuildWorkspace(delivery, error.message);
        return advance(id);
      }
      if (error.stage === "delivery-workspace")
        return deliveryDecision(id, {
          boundary: "delivery-workspace", owner: "repository-operator",
          reason: `${error.message}; a rebuilt delivery workspace still differs from the proven ` +
            "content, usually because a repository commit hook rewrites staged files",
          options: [
            ["fix-the-repository-hook-and-retry-deliver", "Stop the hook from rewriting staged files, then retry Deliver."],
            ["leave-archived-without-deliver", "Keep the change archived and open no pull request."]
          ],
          resumeCommand
        });
      if (["DELIVERY_PROJECTION_DRIFT", "DELIVERY_TARGET_MOVED", "DELIVERY_PR_BASE_DRIFT"].includes(error.code))
        return deliveryDecision(id, {
          boundary: "content-identity", reason: error.message,
          options: [
            ["restore-the-proven-content-and-retry-deliver", "Restore the proven content or Land base, then retry Deliver."],
            ["leave-archived-without-deliver", "Keep the change archived and open no pull request."]
          ],
          resumeCommand
        });
      if (error.code === "DELIVERY_EVIDENCE_BLOCKED")
        return deliveryDecision(id, {
          boundary: "required-evidence", reason: error.message,
          options: [
            ["create-a-follow-up-change-with-required-evidence", "Produce the missing required evidence in a follow-up change, then deliver."],
            ["cancel-delivery", "Keep the change archived and open no pull request."]
          ]
        });
      if (error.code === "DELIVERY_MODE_EVIDENCE_UNAVAILABLE")
        return deliveryDecision(id, {
          boundary: "legacy-mode-evidence", reason: error.message,
          options: [
            ["review-current-diff-for-separate-git-publication", "Review the current diff for a separately authorized Git publication."],
            ["leave-archived-without-deliver", "Keep the change archived and open no pull request."]
          ]
        });
      if (error.code === "DELIVERY_CONVERSION_UNSUPPORTED")
        return deliveryDecision(id, {
          boundary: "git-conversion", owner: "repository-operator", reason: error.message,
          options: [
            ["review-converted-content-for-separate-git-publication", "Review the converted content for a separately authorized Git publication."],
            ["leave-archived-without-deliver", "Keep the change archived and open no pull request."]
          ]
        });
      if (error.code === "DELIVERY_CONVERSION_CHANGED")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "git-conversion", owner: "repository-operator",
          reason: error.message, resumeCommand
        });
      if (error.code === "DELIVERY_MERGE_POLICY_INVALID")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "delivery-policy", owner: "repository-operator",
          reason: error.message, resumeCommand
        });
      if (error.code === "DELIVERY_CHECKS_PENDING")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "ci-checks", owner: "ci", reason: error.message, resumeCommand,
          wait: { owner: "ci", checkCommand: resumeCommand,
            condition: "Every reported pull-request check finishes; Deliver merges only when all passed." }
        });
      if (error.code === "DELIVERY_MERGE_REFUSED")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "branch-protection", owner: "repository-reviewer",
          reason: error.message, resumeCommand,
          wait: { owner: "repository-reviewer", checkCommand: resumeCommand,
            condition: `The repository's merge requirements are met: ${error.message}` }
        });
      if (error.code === "DELIVERY_MERGE_BLOCKED")
        return deliveryDecision(id, {
          boundary: "merge-gate", reason: error.message,
          options: [
            ["fix-in-a-follow-up-change-then-deliver", "Fix the cause in a follow-up change or pull request, then run Deliver again."],
            ["leave-pull-request-open", "Keep the pull request open and merge it outside Deliver."]
          ],
          resumeCommand
        });
      if (error.code === "DELIVERY_NAMING_INVALID")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "delivery-policy", owner: "repository-operator",
          reason: error.message, resumeCommand
        });
      if (error.code === "DELIVERY_DEFAULT_BRANCH_FORBIDDEN")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "delivery-policy", owner: "repository-operator",
          reason: error.message
        });
      const userEnvironment = userEnvironmentDecision(id, error, resumeCommand);
      if (userEnvironment) return userEnvironment;
      if (error.code === "DELIVERY_PROVIDER_UNAVAILABLE")
        return deliveryEnvelope(id, "WAIT", {
          completed: false, boundary: "external-owner", owner: "repository-operator",
          reason: error.message, resumeCommand,
          wait: { owner: "repository-operator", checkCommand: resumeCommand,
            condition: `The repository operator makes the remote or provider available: ${error.message}` }
        });
      fail(error.message);
    }
  }

  async function showAdvance(id) {
    const value = await advance(id);
    console.log(JSON.stringify(value, null, 2));
    return value;
  }

  return { advance, showAdvance, statePath, receiptPath, bodyPath, eventsPath, workspacePath };
}
