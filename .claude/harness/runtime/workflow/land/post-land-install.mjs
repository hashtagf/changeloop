import { join } from "node:path";
import { DEPENDENCY_LOCKFILES, workspaceSetupPlan } from "../sandbox/sandbox-runtime.mjs";

// The root files whose change means the target's installed dependencies no
// longer match: the manifest and every lockfile the sandbox setup knows.
export const DEPENDENCY_FILES = Object.freeze(["package.json", ...DEPENDENCY_LOCKFILES.map(([file]) => file)]);

export function dependencySnapshot(workspace, identity) {
  return Object.fromEntries(DEPENDENCY_FILES.map((file) => {
    try { return [file, identity(join(workspace, file)) ?? null]; } catch { return [file, null]; }
  }));
}

// After Land wrote the target, a changed manifest or lockfile leaves the user's
// checkout without the dependencies the sandbox installed. Install them with
// the same command the sandbox setup used. A failure never rolls Land back; it
// is recorded with the exact command to run.
export function postLandInstall({ before, after, sandbox = {}, workspace, pathExists, run }) {
  if (DEPENDENCY_FILES.every((file) => (before?.[file] ?? null) === (after?.[file] ?? null))) return null;
  const plan = workspaceSetupPlan({ sandbox, workspace, pathExists });
  if (!plan) return null;
  const result = run(plan.command, workspace) || {};
  return {
    command: plan.command, source: plan.source, workspace,
    status: result.status === 0 ? "ok" : "failed",
    exitCode: result.status ?? null,
    ...(result.status === 0 ? {} : { detail: String(result.stderr || result.error?.message || "").trim().slice(-400) })
  };
}
