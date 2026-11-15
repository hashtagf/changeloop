// Optional merge stage of Deliver. A project opts in with
// `deliver.merge: "after-checks"`; the merge is bound to the exact delivered
// head commit, runs only after every reported check passed, and never uses an
// admin override or auto-merge, so branch protection stays authoritative.

export const MERGE_MODES = ["never", "after-checks"];
export const MERGE_METHODS = ["squash", "merge", "rebase"];

function clean(value) {
  return String(value ?? "").trim();
}

export function mergeError(code, message, fields = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, fields);
  return error;
}

export function mergePolicy(configured = {}) {
  const mode = clean(configured?.merge) || "never";
  const method = clean(configured?.mergeMethod) || "squash";
  if (!MERGE_MODES.includes(mode))
    throw mergeError("DELIVERY_MERGE_POLICY_INVALID",
      `deliver.merge must be one of ${MERGE_MODES.join(", ")}; found '${mode}'`);
  if (!MERGE_METHODS.includes(method))
    throw mergeError("DELIVERY_MERGE_POLICY_INVALID",
      `deliver.mergeMethod must be one of ${MERGE_METHODS.join(", ")}; found '${method}'`);
  return { mode, method };
}

// `gh pr checks --json name,bucket` buckets: pass, fail, pending, skipping, cancel.
export function evaluateChecks(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return { state: "none", failed: [], pending: [] };
  const name = (row) => clean(row?.name) || "unnamed check";
  const bucket = (row) => clean(row?.bucket).toLowerCase();
  const failed = list.filter((row) => ["fail", "cancel"].includes(bucket(row))).map(name);
  const pending = list.filter((row) => !["pass", "skipping", "fail", "cancel"].includes(bucket(row))).map(name);
  return { state: failed.length ? "failed" : pending.length ? "pending" : "passed", failed, pending };
}

function resultText(result) {
  return clean(result?.stderr || result?.stdout || result?.error?.message);
}

export function createDeliveryMerge({ run, root }) {
  const options = { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 };

  function view(slug, url) {
    const result = run("gh", ["pr", "view", url, "--repo", slug,
      "--json", "state,isDraft,headRefOid,mergeCommit,mergedAt"], options);
    if (result.status !== 0)
      throw mergeError("DELIVERY_PROVIDER_UNAVAILABLE", `cannot read pull request before merge: ${resultText(result)}`);
    try { return JSON.parse(result.stdout || "{}"); }
    catch { throw mergeError("DELIVERY_PROVIDER_UNAVAILABLE", "GitHub returned invalid pull-request JSON"); }
  }

  function checks(slug, url) {
    // gh exits non-zero while checks are pending or failing; the JSON body is
    // still authoritative. Only an unparseable answer is a provider failure.
    const result = run("gh", ["pr", "checks", url, "--repo", slug, "--json", "name,bucket"], options);
    if (/no checks reported/i.test(resultText(result))) return [];
    try { return JSON.parse(result.stdout || ""); }
    catch {
      throw mergeError("DELIVERY_PROVIDER_UNAVAILABLE", `cannot read pull-request checks: ${resultText(result)}`);
    }
  }

  function merged(value, method) {
    return { method, commit: clean(value?.mergeCommit?.oid) || null, mergedAt: value?.mergedAt || null };
  }

  function mergeStage({ slug, url, commit, method }) {
    const before = view(slug, url);
    if (before.state === "MERGED") return merged(before, method);
    if (before.state !== "OPEN")
      throw mergeError("DELIVERY_MERGE_BLOCKED", `pull request is ${clean(before.state).toLowerCase() || "not open"}; it cannot be merged`);
    if (before.isDraft)
      throw mergeError("DELIVERY_MERGE_BLOCKED", "pull request is a draft; Deliver does not merge drafts");
    if (before.headRefOid !== commit)
      throw mergeError("DELIVERY_MERGE_BLOCKED", "pull-request head moved away from the delivered commit; Deliver merges only what it delivered");
    const evaluated = evaluateChecks(checks(slug, url));
    if (evaluated.state === "pending")
      throw mergeError("DELIVERY_CHECKS_PENDING", `checks still running: ${evaluated.pending.join(", ")}`, { checks: evaluated });
    if (evaluated.state === "failed")
      throw mergeError("DELIVERY_MERGE_BLOCKED", `checks failed: ${evaluated.failed.join(", ")}`, { checks: evaluated });
    if (evaluated.state === "none")
      throw mergeError("DELIVERY_MERGE_BLOCKED", "the provider reports no checks for this pull request; Deliver merges only after passing checks");
    const result = run("gh", ["pr", "merge", url, "--repo", slug, `--${method}`,
      "--match-head-commit", commit], options);
    const after = view(slug, url);
    if (after.state === "MERGED") return merged(after, method);
    throw mergeError("DELIVERY_MERGE_REFUSED",
      `the provider refused the merge: ${resultText(result) || "pull request is still open"}`);
  }

  return { mergeStage };
}
