import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { forbiddenSpecReviewSessions, runSpecReviewLens, specReviewers } from "./spec-review.mjs";

// Spec drift (Elephant-Goldfish "drift report"): a read-only report of living
// specs whose linked files no longer exist. Requirements are linked to files
// through the latest archived change that wrote them (its claims and task
// paths). `--review` adds a fresh reviewer per selected capability.

export const SPEC_DRIFT_VERSION = 1;
const REQUIREMENT = /^### Requirement:\s*(.+?)\s*$/gm;
const BACKTICK_PATH = /`([\w.-]+(?:\/[\w.*-]+)+\.[a-z]{1,5})`/g;
const VERIFY_PATH = /(?:^|\s)((?:\.?[\w-]+\/)+[\w.-]+\.(?:mjs|js|ts|sh|py|json|md))(?=\s|$)/g;

export function specRequirements(text) {
  const rows = [];
  const matches = [...String(text).matchAll(REQUIREMENT)];
  matches.forEach((match, index) => {
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
    rows.push({ name: match[1], body: text.slice(match.index, end) });
  });
  return rows;
}

// Tasks in tasks.md: claims, paths, and verify command per task line.
export function archivedTasks(text) {
  return String(text).split("\n").filter((line) => /^- \[[ x]\] \*\*T\d+/.test(line)).map((line) => ({
    claims: (line.match(/\[claims:([^\]]*)\]/)?.[1] || "").split(",").map((v) => v.trim()).filter(Boolean),
    paths: (line.match(/\[paths:([^\]]*)\]/)?.[1] || "").split(",").map((v) => v.trim()).filter(Boolean),
    verify: line.match(/verify: `([^`]*)`/)?.[1] || ""
  }));
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/^-|-$/g, "");
}

// Existence of a linked path; a glob checks its fixed prefix directory.
function pathExists(root, path) {
  const fixed = path.split("/").filter((part) => !/[*?[\]{}]/.test(part));
  const prefix = path.includes("*") ? fixed.slice(0, path.split("/").findIndex((part) => /[*?]/.test(part))) : fixed;
  return existsSync(join(root, ...prefix));
}

export function createSpecDriftRuntime({
  root, reportDir = join(root, ".foundation", "spec-drift"), foundationPolicy = () => ({}),
  reviewerInstalled = (_name) => true, runPromptReview = null, environment = process.env,
  now = () => new Date().toISOString(), fail, log = (line) => console.log(line)
}) {
  const specsDir = join(root, "openspec", "specs");
  const archiveDir = join(root, "openspec", "changes", "archive");

  function capabilities() {
    return existsSync(specsDir) ? readdirSync(specsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(specsDir, entry.name, "spec.md")))
      .map((entry) => entry.name).sort() : [];
  }

  // Latest first: archive folders start with their date.
  const archives = () => existsSync(archiveDir)
    ? readdirSync(archiveDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
      .map((entry) => entry.name).sort().reverse() : [];

  function origin(capability, name, archiveNames) {
    for (const archive of archiveNames) {
      const spec = join(archiveDir, archive, "specs", capability, "spec.md");
      if (!existsSync(spec)) continue;
      let text = "";
      try { text = readFileSync(spec, "utf8"); } catch { continue; }
      const row = specRequirements(text).find((entry) => entry.name === name);
      if (row) return { archive, scenarios: [...row.body.matchAll(/^#### Scenario:\s*(.+?)\s*$/gm)].map((m) => m[1]) };
    }
    return null;
  }

  // A claim belongs to the requirement by its key, or (keys are slugs that
  // differ from titled requirements) by naming one of its scenarios.
  function linkedFiles(archive, name, scenarios = []) {
    const base = join(archiveDir, archive);
    const evidence = JSON.parse(readFileSync(join(base, "evidence.yaml"), "utf8"));
    if (!Array.isArray(evidence?.claims) || !evidence.claims.length)
      throw new Error("evidence.yaml has no claims (older shape)");
    const tasks = archivedTasks(readFileSync(join(base, "tasks.md"), "utf8"));
    if (!tasks.length) throw new Error("tasks.md lists no tasks");
    // Claims before requirement keys existed cannot name a requirement: the
    // whole change's tasks are its links, labelled `link: "change"`.
    const keyed = evidence.claims.some((claim) => claim?.requirementKey);
    let owned = tasks;
    if (keyed) {
      const claims = new Set(evidence.claims
        .filter((claim) => [name, slug(name)].includes(String(claim?.requirementKey || "")) ||
          scenarios.includes(String(claim?.scenario || "")))
        .map((claim) => String(claim.id)));
      if (!claims.size) throw new Error(`evidence.yaml names no claim for requirement '${name}'`);
      owned = tasks.filter((task) => task.claims.some((claim) => claims.has(claim)));
      if (!owned.length) throw new Error(`no task in tasks.md covers requirement '${name}'`);
    }
    const files = new Set();
    for (const task of owned) {
      task.paths.forEach((path) => files.add(path));
      for (const match of task.verify.matchAll(VERIFY_PATH)) files.add(match[1].replace(/^\.\//, ""));
    }
    return { files: [...files].sort(), link: keyed ? "requirement" : "change" };
  }

  function checkCapability(capability, archiveNames) {
    const path = join(specsDir, capability, "spec.md");
    let text;
    try { text = readFileSync(path, "utf8"); }
    catch (error) {
      return { capability, requirements: [], status: "unreadable", reason: String(error?.code || error) };
    }
    const requirements = specRequirements(text).map(({ name, body }) => {
      const quoted = [...body.matchAll(BACKTICK_PATH)].map((match) => match[1]);
      const found = origin(capability, name, archiveNames);
      const archive = found?.archive || null;
      let linked = [];
      let link = null;
      if (archive) {
        try { ({ files: linked, link } = linkedFiles(archive, name, found.scenarios)); }
        catch (error) {
          return { requirement: name, status: "unreadable", origin: archive,
            path: relative(root, join(archiveDir, archive)).replaceAll("\\", "/"),
            reason: String(error?.message || error).slice(0, 200) };
        }
      }
      const files = [...new Set([...quoted, ...linked])].sort();
      const missing = files.filter((file) => !pathExists(root, file));
      if (missing.length) return { requirement: name, status: "missing-file", origin: archive, link, files, missing };
      if (!archive) return { requirement: name, status: "no-origin", origin: null, files };
      return { requirement: name, status: "ok", origin: archive, link, files };
    });
    return { capability, requirements };
  }

  function runSpecDrift({ capabilities: selected = [], review = false } = {}) {
    const known = capabilities();
    const unknown = selected.filter((name) => !known.includes(name));
    if (unknown.length) fail(`spec-drift: unknown capability '${unknown.join("', '")}'; choose from openspec/specs`);
    if (review && !selected.length)
      fail("spec-drift --review requires --capability <name> (one or more) to bound reviewer cost");
    const archiveNames = archives();
    const rows = (selected.length ? selected : known).map((capability) => checkCapability(capability, archiveNames));
    if (review) {
      const forbidden = forbiddenSpecReviewSessions(environment);
      const [reviewer] = specReviewers(foundationPolicy() || {}, reviewerInstalled);
      for (const row of rows) {
        const files = [`openspec/specs/${row.capability}/spec.md`,
          ...new Set(row.requirements.flatMap((req) => (req.files || []).filter((file) => !file.includes("*") &&
            existsSync(join(root, file)))))];
        const lens = { id: row.capability, title: `Spec drift for capability ${row.capability}`, criteria: [
          "Compare each requirement and scenario in the spec with what the listed code and tests actually do now.",
          "Report behavior the spec states that the code no longer does, and behavior the code has that contradicts the spec.",
          "Do not report style or missing tests unless the spec's behavior is no longer implemented or verified."
        ] };
        row.review = reviewer && runPromptReview
          ? runSpecReviewLens({ lens, files, reviewer, modelTier: null, workspace: root,
            forbiddenSessionIds: forbidden, runPromptReview })
          : { lens: row.capability, status: "not-run", attempts: 0, findings: [],
            reason: "no configured reviewer CLI is installed; install or log in to a configured reviewer (main-session is never used)" };
      }
    }
    const counts = {};
    for (const req of rows.flatMap((row) => row.requirements)) counts[req.status] = (counts[req.status] || 0) + 1;
    const report = { version: SPEC_DRIFT_VERSION, generatedAt: now(), advisory: true,
      scope: selected.length ? selected : "all", review, counts, capabilities: rows };
    mkdirSync(reportDir, { recursive: true });
    const path = join(reportDir, "latest.json");
    writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
    return { report, path: relative(root, path).replaceAll("\\", "/") };
  }

  function showSpecDrift(flags = {}) {
    const selected = [].concat(flags.capability ?? []).flatMap((value) => String(value).split(","))
      .map((value) => value.trim()).filter(Boolean);
    const result = runSpecDrift({ capabilities: selected, review: Boolean(flags.review) });
    if (!flags.pretty) {
      log(JSON.stringify({ path: result.path, ...result.report }, null, 2));
      return result;
    }
    const { report } = result;
    log(`SPEC DRIFT (advisory; nothing was changed) ${Object.entries(report.counts).map(([k, v]) => `${v} ${k}`).join(", ") || "no requirements"}`);
    for (const row of report.capabilities) {
      for (const req of row.requirements.filter((req) => req.status !== "ok"))
        log(`  [${req.status}] ${row.capability} · ${req.requirement}${req.missing ? `: ${req.missing.join(", ")}` : ""}`);
      if (row.review) log(`  review ${row.capability}: ${row.review.status}${row.review.reason ? ` (${row.review.reason})` : ""}` +
        `${row.review.findings?.length ? `, ${row.review.findings.length} finding(s)` : ""}`);
    }
    log(`  report: ${result.path}`);
    return result;
  }

  return { runSpecDrift, showSpecDrift, capabilities };
}
