// A repository's quality lanes. A provider key is a capability (`test`) or a
// capability and a name (`test:services/wallet`), so a monorepo holds one lane
// per module; `capability` on the provider overrides the prefix. `cwd` runs
// the lane in a directory of the repository. Results, history, and baselines
// are filed per lane key.
import { realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

export function laneCapability(key, provider) {
  return provider?.capability || String(key).split(":")[0];
}

/** The file stem of a lane's result, status, and baseline; a plain capability key is unchanged. */
export function laneFile(key) {
  return String(key).replace(/[^A-Za-z0-9.-]/g, "_");
}

export function lanesOf(repositoryConfig) {
  return Object.entries(repositoryConfig?.providers || {}).map(([key, provider]) =>
    ({ key, capability: laneCapability(key, provider), provider }));
}

/** Validates a lane's key and cwd; `failAt` throws with the message. */
export function validateLane(key, provider, label, failAt) {
  if (!laneCapability(key, provider)) failAt(`${label} needs a capability before ':' or a capability field`);
  if (provider.capability !== undefined && (typeof provider.capability !== "string" || !provider.capability))
    failAt(`${label}.capability must be a non-empty string`);
  if (provider.cwd === undefined) return;
  const cwd = provider.cwd;
  if (typeof cwd !== "string" || !cwd.trim() || isAbsolute(cwd) || cwd.split(/[\\/]/).includes(".."))
    failAt(`${label}.cwd must be a directory inside the repository (relative, without '..')`);
}

/** Refuses two lanes of one repository whose keys map to the same result file. */
export function validateLaneFiles(keys, label, failAt) {
  const seen = new Map();
  for (const key of keys) {
    const file = laneFile(key);
    if (seen.has(file)) failAt(`${label} lanes '${seen.get(file)}' and '${key}' would share result file '${file}'; rename one`);
    seen.set(file, key);
  }
}

/** The lane's real directory when it stays inside the repository (symlinks resolved), else null. */
export function laneDirectory(repositoryPath, cwd) {
  try {
    const base = realpathSync(repositoryPath);
    const real = realpathSync(resolve(repositoryPath, cwd));
    const rel = relative(base, real);
    return rel.startsWith("..") || isAbsolute(rel) ? null : real;
  } catch { return null; }
}

/** The lane fields a result carries: its key when it is not just the capability. */
export function laneLabel(key, capability) {
  return key === capability ? {} : { lane: key };
}
