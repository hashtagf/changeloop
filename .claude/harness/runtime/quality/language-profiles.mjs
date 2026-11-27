import { readFileSync } from "node:fs";

// Languages are data, not code: each toolchain pack names its files
// (markers, extensions), the capabilities it can prove, the commands
// discovery may propose, and how its runner prints test time. The harness
// ships `toolchain-packs.json`; a project declares more, or overrides one by
// id, in `toolchains` of quality/foundation-quality.json, without waiting
// for a harness release.
const SHIPPED = JSON.parse(readFileSync(new URL("./toolchain-packs.json", import.meta.url), "utf8"));

const ID = /^[a-z][a-z0-9-]*$/;
const strings = (value) => Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim());

function packFail(label, message) {
  throw new Error(`quality toolchains: ${label} ${message}`);
}

/** Validates one pack; throws naming the field. */
export function validateToolchainPack(pack, label = "pack") {
  if (!pack || typeof pack !== "object" || Array.isArray(pack)) packFail(label, "must be an object");
  if (typeof pack.id !== "string" || !ID.test(pack.id)) packFail(label, "id must be a lowercase name like toolchain-elixir");
  const at = `'${pack.id}'`;
  if (!strings(pack.capabilities) || !pack.capabilities.length) packFail(at, "capabilities must be a non-empty string array");
  for (const field of ["languages", "extensions", "markers"])
    if (pack[field] !== undefined && !strings(pack[field])) packFail(at, `${field} must be a string array`);
  if (pack.extensions?.some((extension) => !extension.startsWith(".")))
    packFail(at, "extensions must start with a dot");
  if (pack.commands !== undefined) {
    if (!pack.commands || typeof pack.commands !== "object" || Array.isArray(pack.commands))
      packFail(at, "commands must map a capability to a list of candidates");
    for (const [capability, candidates] of Object.entries(pack.commands)) {
      if (!pack.capabilities.includes(capability)) packFail(at, `commands.${capability} is not one of its capabilities`);
      if (!Array.isArray(candidates) || !candidates.length) packFail(at, `commands.${capability} must be a non-empty list`);
      for (const candidate of candidates) {
        if (!strings(candidate?.command) || !candidate.command.length)
          packFail(at, `commands.${capability}[].command must be a non-empty string array`);
        if (candidate.requires !== undefined && !strings(candidate.requires))
          packFail(at, `commands.${capability}[].requires must be a string array`);
      }
    }
  }
  if (pack.durations !== undefined) {
    if (!Array.isArray(pack.durations)) packFail(at, "durations must be an array");
    for (const row of pack.durations) {
      if (typeof row?.pattern !== "string" || !row.pattern) packFail(at, "durations[].pattern must be a non-empty string");
      if (row.flags !== undefined && (typeof row.flags !== "string" || /[^dgimsuyv]/.test(row.flags) ||
          new Set(row.flags).size !== row.flags.length))
        packFail(at, "durations[].flags must be distinct regular expression flags");
      // Validated with the flags it will run with: `\-` is valid alone but not with `u`.
      // Compiled alone first: `(\d+)\\` ends in an escape that only the added `|` would hide.
      let groups = 0;
      try {
        const flags = (row.flags || "gm").replace("g", "");
        new RegExp(row.pattern, flags);
        groups = new RegExp(`${row.pattern}|`, flags).exec("").length - 1;
      } catch { packFail(at, "durations[].pattern must be a valid regular expression with its flags"); }
      if (groups < 1) packFail(at, "durations[].pattern needs a capture group for the number (and optionally one for its unit)");
    }
  }
  return pack;
}

for (const pack of SHIPPED.packs) validateToolchainPack(pack, "shipped pack");

/** The shipped packs plus the project's, a project pack replacing a shipped one by id. */
export function toolchainPacks(projectPacks = []) {
  if (!Array.isArray(projectPacks)) packFail("toolchains", "must be an array");
  const byId = new Map(SHIPPED.packs.map((pack) => [pack.id, pack]));
  projectPacks.forEach((pack, index) => {
    validateToolchainPack(pack, `toolchains[${index}]`);
    byId.set(pack.id, pack);
  });
  return [...byId.values()];
}

/** The test-time patterns of the merged packs, one global expression each. */
export function durationPatterns(projectPacks = []) {
  return toolchainPacks(projectPacks).flatMap((pack) => (pack.durations || []).map((row) => {
    const flags = row.flags || "gm";
    return new RegExp(row.pattern, flags.includes("g") ? flags : `${flags}g`);
  }));
}

function profileTable(packs) {
  return Object.freeze(Object.fromEntries(packs.map((pack) => [pack.id, Object.freeze({
    languages: pack.languages || [], extensions: pack.extensions || [],
    markers: pack.markers || [], capabilities: pack.capabilities, commands: pack.commands || {}
  })])));
}

export const QUALITY_PROFILES = profileTable(toolchainPacks());

const table = (projectPacks) => projectPacks?.length ? profileTable(toolchainPacks(projectPacks)) : QUALITY_PROFILES;

export function profilesForInventory({ files = [], extensions = [] }, projectPacks = []) {
  const profiles = table(projectPacks);
  const detected = new Set();
  const names = new Set(files.map((path) => path.split("/").at(-1)));
  const suffixes = new Set(extensions.map((value) => value.toLowerCase()));
  for (const [name, profile] of Object.entries(profiles))
    if (profile.markers.some((marker) => names.has(marker)) ||
        profile.extensions.some((extension) => suffixes.has(extension))) detected.add(name);
  return [...detected].sort();
}

/** Every marker file name any pack declares, for the inventory walk. */
export function markerNames(projectPacks = []) {
  return new Set(Object.values(table(projectPacks)).flatMap((profile) => profile.markers));
}

export function profileDefinition(name, projectPacks = []) {
  return table(projectPacks)[name] || null;
}

export function languagesForProfiles(profiles, projectPacks = []) {
  const known = table(projectPacks);
  return [...new Set(profiles.flatMap((name) => known[name]?.languages || []))].sort();
}

export function capabilityNamesForProfiles(profiles, projectPacks = []) {
  const known = table(projectPacks);
  return [...new Set(profiles.flatMap((name) => known[name]?.capabilities || []))].sort();
}

export function validateProfiles(profiles, projectPacks = []) {
  if (!Array.isArray(profiles) || profiles.some((name) => typeof name !== "string"))
    throw new Error("quality profiles must be an array of strings");
  const known = table(projectPacks);
  const unknown = profiles.filter((name) => !known[name]);
  if (unknown.length) throw new Error(`unknown quality profile(s): ${unknown.join(", ")}`);
  return profiles;
}
