import { createHash } from "node:crypto";
import { isAbsolute } from "node:path";

export function changeDiffCandidates(root, state) {
  if (!state.repositories || Object.keys(state.repositories).length === 0)
    return [{ repository: "root", record: state.workspace, targetPath: root }];
  return Object.entries(state.repositories)
    .map(([repository, record]) => ({
      repository, record,
      targetPath: record?.targetPath || (repository === "root" ? root : null)
    }));
}

export function normalizedDiffDigest(buffer) {
  const digest = createHash("sha256");
  // latin1 round-trips bytes 1:1, so `GIT binary patch` sections pass
  // through the line-level normalization untouched.
  for (const line of buffer.toString("latin1").split("\n")) {
    if (line.startsWith("index ")) continue;
    digest.update(line.replace(/^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/, "@@"));
    digest.update("\n");
  }
  return digest.digest("hex");
}

export function changeDiffCandidatePlan(context, id, state, candidate) {
  const { repository, record } = candidate;
  if (record?.access === "read")
    return { status: "skip" };
  if (!record || !["worktree", "copy"].includes(record.mode) ||
      !record.path || !context.pathExists(record.path))
    return { status: "invalid" };
  // The same nested set replay and Apply exclude: a root sandbox projects
  // every declared nested repository, and none of them is root's diff.
  const nested = repository === "root"
    ? [...new Set([...context.selectedRepositories(id, state)
      .filter((entry) => entry.type === "submodule")
      .map((entry) => entry.relativePath),
    ...(context.declaredRepositoryPaths?.() || [])])]
    : [];
  if (record.mode === "copy") {
    if (!record.baseline || typeof record.baseline !== "object" ||
        Array.isArray(record.baseline))
      return { status: "invalid" };
    return { status: "ready", repository, record, id, nested };
  }
  if (!record.baseHead) return { status: "invalid" };
  const indexFile = `${record.path}.diff-identity-index.${context.pid}`;
  return {
    status: "ready", repository, record,
    pathspec: [...context.codePathspec(id, nested),
      ...(repository === "root" && context.carriedExcludes
        ? context.carriedExcludes(state?.workspace) : [])],
    indexFile,
    env: { ...context.environment, GIT_INDEX_FILE: indexFile }
  };
}

// A sync that merged landed work, carried a target edit, or replayed onto a
// moved base rewrites sandbox bytes the change's author never touched. The
// diff identity before and after such a harness-only rewrite are recorded as
// one bridge, so a review verdict bound to the earlier identity still binds
// the later one: the change's own contribution did not move, the harness
// attests exactly which identities it joined, and nothing else can forge the
// pair. A sync that left a conflict, or one that changed nothing, records no
// bridge. Bounded so a long-lived sandbox never grows the state unboundedly.
const IDENTITY_BRIDGE_LIMIT = 32;

export function recordIdentityBridge({ state, preDiffIdentity, postDiffIdentity, kinds, now }) {
  if (!state?.workspace || !preDiffIdentity || !postDiffIdentity ||
      preDiffIdentity === postDiffIdentity || !kinds?.length) return null;
  const row = { from: preDiffIdentity, to: postDiffIdentity, kinds: [...kinds].sort(), at: now() };
  const prior = Array.isArray(state.workspace.identityBridges) ? state.workspace.identityBridges : [];
  state.workspace.identityBridges = [...prior, row].slice(-IDENTITY_BRIDGE_LIMIT);
  return row;
}

// Copy baselines already carry the exact entry identities used by Apply.
// Hash only the contribution: forwarding an untouched target path advances
// both manifests equally. Whole-file before/after identities deliberately
// expire after same-file reconciliation, even if a smaller hunk looks equal.
export function copyDiffIdentity(baseline, current, nested = []) {
  const manifest = (value) => value && typeof value === "object" && !Array.isArray(value);
  if (!manifest(baseline) || !manifest(current)) return null;
  const rows = [];
  const validEntry = (value) => typeof value === "string" &&
    (/^(?:file:(?:regular|executable):)?[a-f0-9]{64}$/.test(value) ||
      value.startsWith("symlink:"));
  for (const path of [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort()) {
    if (nested.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) continue;
    if (!path || isAbsolute(path) || path.split(/[\\/]/).includes("..")) return null;
    const before = baseline[path] ?? null;
    const after = current[path] ?? null;
    if ((before !== null && !validEntry(before)) || (after !== null && !validEntry(after)))
      return null;
    if (before !== after) rows.push([path, before, after]);
  }
  return createHash("sha256").update("foundation-copy-diff:1\0")
    .update(JSON.stringify(rows)).digest("hex");
}

export function changeDiffCandidateRow(context, plan) {
  const { repository, record, pathspec, indexFile, env } = plan;
  if (record.mode === "copy") {
    const identity = copyDiffIdentity(record.baseline,
      context.workspaceManifest(record.path, plan.id, true), plan.nested);
    return identity ? `${repository}\0copy:1:${identity}` : null;
  }
  try {
    // Keep the scratch index beside the worktree so it can never stage itself.
    context.remove(indexFile, { force: true });
    // Seed from the base before add -A: tracked-but-ignored files must remain
    // known to the index, while real deletions must still enter the patch.
    const seeded = context.spawn("git", ["read-tree", record.baseHead],
      { cwd: record.path, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (seeded.status !== 0) return null;
    const staged = context.spawn("git", ["-c", "core.quotepath=false", "add", "-A"],
      { cwd: record.path, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (staged.status !== 0) return null;
    // No encoding: binary patch bytes, same rationale as gitBuffer.
    const diff = context.spawn("git", [
      "-c", "diff.algorithm=myers", "-c", "core.quotepath=false",
      "-c", "diff.noprefix=false", "-c", "diff.mnemonicPrefix=false",
      "-c", "diff.renames=true",
      "diff", "--binary", "--cached", record.baseHead, "--", ...pathspec
    ], { cwd: record.path, env, maxBuffer: 64 * 1024 * 1024 });
    if (diff.status !== 0) return null;
    return `${repository}\0${context.diffDigest(diff.stdout)}`;
  } finally {
    context.remove(indexFile, { force: true });
  }
}

export function combinedDiffIdentity(rows) {
  const digest = createHash("sha256");
  // :3 — the representation changed again (base-seeded index); a verdict
  // stamped under an earlier form must read as stale, never as
  // accidentally equal.
  digest.update("foundation-diff-identity:3\0");
  for (const row of [...rows].sort()) {
    digest.update(row);
    digest.update("\0");
  }
  return digest.digest("hex");
}

export function changeDiffIdentityOperation(context, id, state) {
  const rows = [];
  for (const candidate of context.candidates(state)) {
    const plan = context.plan(id, state, candidate);
    if (plan.status === "skip") continue;
    if (plan.status !== "ready") return null;
    const row = context.row(plan);
    if (!row) return null;
    rows.push(row);
  }
  return rows.length ? context.combine(rows) : null;
}
