// What keeps a product handoff honest after intake: the project's PRD and
// uxui documents are found so no change can ignore them, the change packet
// records each document's digest and the IDs it owes, and validation fails when
// a document changed after the agreement was compiled or when an owed ID left
// the compiled agreement (an amendment that dropped a scenario, say).
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { productHandoffCoverage } from "./product-handoff.mjs";

export const HANDOFF_RECORD = "handoff.json";
const DOCUMENT = /^(?:prd|uxui)\.md$|\.(?:prd|uxui)\.md$/i;
const SKIPPED = new Set([".git", "node_modules", ".foundation", ".claude", "dist", "build", "vendor", "coverage",
  "test-results", ".next", ".venv"]);

const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

// PRD.md, uxui.md, or *.prd.md / *.uxui.md within four levels of the project,
// outside tool and harness directories and openspec/changes.
export function productDocuments(root, { maxDepth = 4, limit = 20000 } = {}) {
  const found = [];
  let budget = limit;
  const walk = (dir, depth) => {
    if (depth > maxDepth || budget <= 0) return;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (budget-- <= 0) return;
      const path = join(dir, entry.name);
      const rel = relative(root, path).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        if (!SKIPPED.has(entry.name) && rel !== "openspec/changes") walk(path, depth + 1);
      } else if (entry.isFile() && DOCUMENT.test(entry.name)) found.push(rel);
    }
  };
  walk(root, 0);
  return found.sort();
}

// A draft in a project with product documents must say which it comes from,
// or why it comes from none of them.
export function undeclaredHandoffIssues(root, handoff) {
  if (handoff !== undefined) return [];
  const documents = productDocuments(root);
  if (!documents.length) return [];
  return [`the project has product documents (${documents.join(", ")}); name the ones this change comes from in ` +
    'productHandoff { "prd", "uxui", "scope": "all" | ["F-nn"] } so intake checks the change covers them, or set ' +
    'productHandoff { "none": "<why this change is not from them>" }'];
}

// The packet record: every document's digest, the scope, the owed IDs, and the
// exclusions. Rows come from productHandoffCoverage.
export function handoffRecordValue(root, handoff, rows) {
  const documents = ["prd", "uxui"].filter((field) => typeof handoff?.[field] === "string" && handoff[field].trim())
    .map((field) => ({ field, path: handoff[field].trim(), sha256: digest(join(root, handoff[field].trim())) }));
  return {
    version: 1,
    documents,
    scope: handoff.scope ?? "all",
    owed: rows.filter((row) => row.excluded === null).map((row) => row.id),
    excluded: rows.filter((row) => row.excluded !== null).map((row) => ({ id: row.id, reason: row.excluded }))
  };
}

// The record for a draft (or an amendment, whose draft is the empty object:
// it refreshes the digests and the owed IDs, and validation then checks the
// compiled agreement still cites them). Null without a document handoff.
export function handoffRecordFor(root, draft, handoff) {
  if (!handoff || handoff.none !== undefined || (!handoff.prd && !handoff.uxui)) return null;
  const read = (field) => typeof handoff[field] === "string" && handoff[field].trim()
    ? readFileSync(join(root, handoff[field].trim()), "utf8") : null;
  const { rows } = productHandoffCoverage(draft, handoff, { prdText: read("prd"), uxuiText: read("uxui") });
  return handoffRecordValue(root, handoff, rows);
}

export function writeHandoffRecord(basePath, record) {
  const path = join(basePath, HANDOFF_RECORD);
  if (!record) { if (existsSync(path)) rmSync(path, { force: true }); return; }
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
}

// The compiled agreement's text in two parts. The contract (specs, tasks,
// evidence) is what an amendment rewrites, so stories, criteria, rules,
// features, and permissions must stay there. Design-level items (NFR,
// glossary, decisions, dependencies, data, errors, screen states) may also
// live in design.md or the proposal, without its coverage table.
const CONTRACT_KINDS = /^(?:US|AC|BR|F|PERM|UP)-?\d+$/;
function readAll(dir, pattern) {
  const parts = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return parts; }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) parts.push(...readAll(path, pattern));
    else if (entry.isFile() && pattern.test(entry.name)) parts.push(readFileSync(path, "utf8"));
  }
  return parts;
}
function packetText(basePath) {
  const file = (name) => existsSync(join(basePath, name)) ? readFileSync(join(basePath, name), "utf8") : "";
  const contract = [...readAll(join(basePath, "specs"), /\.md$/), file("tasks.md"), file("evidence.yaml")].join("\n");
  const proposal = file("proposal.md")
    .replace(/^## (?:Handoff coverage|ความครอบคลุมเอกสาร)[^\n]*\n[\s\S]*?(?=^## |(?![\s\S]))/m, "");
  return { contract: contract.toLowerCase(), all: [contract, file("design.md"), proposal].join("\n").toLowerCase() };
}

const present = (haystack, id) => {
  if (id.startsWith("screen:")) {
    const [screen, state] = id.slice(7).split("/");
    return haystack.includes(screen.toLowerCase()) && (!state || haystack.includes(state.toLowerCase()));
  }
  if (id.startsWith("GL:")) return id.slice(3).split(/[()/,]/).map((alias) => alias.trim().toLowerCase())
    .filter((alias) => alias.length >= 2).some((alias) => haystack.includes(alias));
  return new RegExp(`(?<![a-z0-9-])${id.toLowerCase().replace(/[-]/g, "\\-")}(?!\\d)`).test(haystack);
};

export function assertHandoffCovered(root, basePath, fail) {
  const issues = handoffPacketIssues(root, basePath);
  if (issues.length) fail(`product handoff:\n  - ${issues.join("\n  - ")}`);
}

export function handoffPacketIssues(root, basePath) {
  const path = join(basePath, HANDOFF_RECORD);
  if (!existsSync(path)) return [];
  let record;
  try { record = JSON.parse(readFileSync(path, "utf8")); }
  catch { return [`${HANDOFF_RECORD} cannot be read; revise or amend the change with its productHandoff`]; }
  const issues = [];
  for (const document of record.documents || []) {
    const file = join(root, document.path);
    if (!existsSync(file)) issues.push(`productHandoff ${document.field} ${document.path} no longer exists`);
    else if (digest(file) !== document.sha256)
      issues.push(`productHandoff ${document.field} ${document.path} changed after this agreement was compiled: ` +
        "revise the change before Build, or amend it with the same productHandoff and the requirements the new text needs");
  }
  const text = packetText(basePath);
  const missing = (record.owed || []).filter((id) => !present(CONTRACT_KINDS.test(id) ? text.contract : text.all, id));
  if (missing.length)
    issues.push(`the agreement no longer covers ${missing.join(", ")} from its product documents: ` +
      "amend it to cite each again, or exclude it with a reason through an amendment carrying productHandoff");
  return issues;
}
