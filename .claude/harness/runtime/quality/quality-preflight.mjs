// Before Prove runs every provider, the change's findings lanes (lint, types,
// file sizes, nesting, copies, stopgap comments, module boundaries) run on
// their own: they take seconds, while the full quality gate takes minutes. A
// regression comes back as a repair before Prove starts. A pass is remembered
// for the change's content, so a resumed Prove never repeats it. Prove still
// runs the complete gate; nothing is skipped there.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { FINDINGS_CAPABILITIES } from "./findings-ratchet.mjs";
import { lanesOf } from "./quality-lanes.mjs";
import { QUALITY_CONFIG_FILE, qualitySourceRoot } from "./quality-source.mjs";

const readJson = (path) => { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; } };

/** The findings capabilities the change's quality configuration declares. */
export function findingsCapabilities(config) {
  const found = new Set();
  for (const repository of config?.repositories || [])
    for (const { capability } of lanesOf(repository))
      if (FINDINGS_CAPABILITIES.has(capability)) found.add(capability);
  return [...found].sort();
}

/** One line per failing findings lane, with its first regressions. */
export function preflightFailures(summaries) {
  return summaries.flatMap((summary) => (summary?.lanes || [])
    .filter((lane) => lane.status === "fail")
    .map((lane) => {
      const regressions = (lane.evaluation?.regressions || []).slice(0, 5)
        .map((row) => `${row.path || "?"}${row.rule ? ` ${row.rule}` : ""}${row.value !== undefined ? ` (${row.value})` : ""}`);
      return `${lane.repository}/${lane.capability}: ${lane.reason || "failed"}` +
        (regressions.length ? ` — ${regressions.join("; ")}` : "");
    }));
}

/**
 * @param {{ root: string, loadRuntime: (id: string) => any, contentHash: (id: string) => string,
 *   run: (options: any) => any, markerPath: (id: string) => string }} deps
 * @returns {(id: string) => { status: "skipped" | "reused" | "pass" | "fail", failures?: string[] }}
 */
export function createQualityPreflight({ root, loadRuntime, contentHash, run, markerPath }) {
  return function preflight(id) {
    const source = qualitySourceRoot({ root, change: id, loadRuntime });
    const config = readJson(join(source, QUALITY_CONFIG_FILE));
    const capabilities = config ? findingsCapabilities(config) : [];
    if (!capabilities.length) return { status: "skipped" };
    const hash = contentHash(id);
    const marker = readJson(markerPath(id));
    if (marker?.hash === hash && marker.status === "pass") return { status: "reused" };
    // Report-only: an enforce-mode policy must not turn the summary into a bare stop.
    const failures = preflightFailures(capabilities.map((capability) =>
      run({ change: id, capability, reportOnly: true })));
    const status = failures.length ? "fail" : "pass";
    mkdirSync(dirname(markerPath(id)), { recursive: true });
    writeFileSync(markerPath(id), `${JSON.stringify({ hash, status, capabilities, failures,
      at: new Date().toISOString() }, null, 2)}\n`);
    return failures.length ? { status, failures } : { status };
  };
}

// The repair message advance returns when the preflight fails.
export function preflightRepairMessage(failures) {
  return `quality preflight failed before Prove: ${failures.join(" | ")}; ` +
    "fix these regressions (or record a reviewed baseline), then resume advance --through proven";
}

