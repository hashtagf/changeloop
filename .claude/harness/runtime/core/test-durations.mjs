import { readFileSync } from "node:fs";

// How each shipped toolchain's runner prints the time its tests took (go
// test, pytest, cargo, RSpec). The patterns live in the toolchain pack data
// the quality domain owns; core reads the data file, not that module.
const PACKS = JSON.parse(readFileSync(new URL("../quality/toolchain-packs.json", import.meta.url), "utf8"));

/** One global regular expression per shipped duration pattern: group 1 the number, group 2 its unit. */
export const SHIPPED_DURATION_PATTERNS = Object.freeze(PACKS.packs.flatMap((pack) =>
  (pack.durations || []).map((row) => {
    const flags = row.flags || "gm";
    return new RegExp(row.pattern, flags.includes("g") ? flags : `${flags}g`);
  })));
