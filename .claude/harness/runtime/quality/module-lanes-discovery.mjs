// A monorepo's modules: each directory below the repository root holding a
// language marker (services/wallet/go.mod, packages/web/package.json) gets
// its own test and static-analysis lanes, run in that directory and skipped
// by a change that touches nothing there. A module inside another module of
// the same language belongs to it; another git repository was already left
// out of the inventory. The root keeps a capability when its own marker of
// that language already gives it a lane.
import { join } from "node:path";

export const MAX_MODULES = 40;
const LANE_CAPABILITIES = ["test", "static-analysis"];

function directoryOf(path) {
  const at = path.lastIndexOf("/");
  return at < 0 ? "." : path.slice(0, at);
}

/**
 * `{ providers, modules, modulesTruncated }` for the module lanes to propose.
 * `profilesFor(names)` maps marker file names to profiles; `detect(path, profiles)`
 * proposes a directory's providers the way the root's are proposed.
 */
export function moduleLanes({ root, markers, rootProviders, profilesFor, detect }) {
  const byDirectory = new Map();
  for (const path of markers) {
    const directory = directoryOf(path);
    if (directory === ".") continue;
    byDirectory.set(directory, [...(byDirectory.get(directory) || []), path.split("/").at(-1)]);
  }
  const rootProfiles = new Set(profilesFor(markers.filter((path) => !path.includes("/"))));
  const chosen = [];
  const providers = {};
  let truncated = 0;
  // Shallow first, so a nested module of the same language joins its parent.
  const directories = [...byDirectory.keys()].sort((a, b) =>
    a.split("/").length - b.split("/").length || a.localeCompare(b));
  for (const directory of directories) {
    const profiles = profilesFor(byDirectory.get(directory));
    if (!profiles.length) continue;
    const parent = chosen.find((row) => directory.startsWith(`${row.directory}/`) &&
      row.profiles.some((profile) => profiles.includes(profile)));
    if (parent) continue;
    const detected = detect(join(root, directory), profiles);
    const lanes = LANE_CAPABILITIES.filter((capability) => detected[capability]?.command &&
      !(rootProviders[capability] && profiles.some((profile) => rootProfiles.has(profile))));
    if (!lanes.length) continue;
    if (chosen.length >= MAX_MODULES) { truncated += 1; continue; }
    chosen.push({ directory, profiles });
    for (const capability of lanes)
      providers[`${capability}:${directory}`] = { ...detected[capability], cwd: directory, paths: [`${directory}/**`] };
  }
  return { providers, modules: chosen.map((row) => row.directory), modulesTruncated: truncated };
}
