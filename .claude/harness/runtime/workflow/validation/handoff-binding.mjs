// What keeps a product handoff honest after intake: the project's PRD and
// uxui documents are found so no change can ignore them, the change packet
// records each document's digest and the IDs it owes, and validation fails when
// a document changed after the agreement was compiled or when an owed ID left
// the compiled agreement (an amendment that dropped a scenario, say).
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parsePrd, parseUxui, productHandoffCoverage, renderProductHandoff } from "./product-handoff.mjs";

export const HANDOFF_RECORD = "handoff.json";
const DOCUMENT = /^(?:prd|uxui)\.md$|\.(?:prd|uxui)\.md$/i;
const SKIPPED = new Set([".git", "node_modules", ".foundation", ".claude", "dist", "build", "vendor", "coverage",
  "test-results", ".next", ".venv"]);

const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

// Product documents within four levels of the project, outside tool and
// harness directories, dot-directories, and openspec/: PRD.md, uxui.md, *.prd.md, *.uxui.md by
// name, and any other Markdown file whose content is one, so a PM's
// "requirements.md" is found too: at least three stories, criteria, rules, or
// features in two kinds, or uxui permission or microcopy rows. Templates,
// examples, and samples are never product documents by content.
const MARKDOWN = /\.(?:md|markdown)$/i;
const NOT_PRODUCT = /^(?:readme|changelog|contributing|license|security|agents|claude|design)\.md$|template|example|sample/i;
export function productDocuments(root, { maxDepth = 4, limit = 20000, maxReads = 300, maxBytes = 1_000_000 } = {}) {
  const found = [];
  let budget = limit;
  let reads = maxReads;
  const walk = (dir, depth) => {
    if (depth > maxDepth || budget <= 0) return;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (budget-- <= 0) return;
      const path = join(dir, entry.name);
      const rel = relative(root, path).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        if (!SKIPPED.has(entry.name) && !entry.name.startsWith(".") && rel !== "openspec") walk(path, depth + 1);
      } else if (entry.isFile() && DOCUMENT.test(entry.name)) found.push(rel);
      else if (entry.isFile() && MARKDOWN.test(entry.name) && !NOT_PRODUCT.test(entry.name) && reads-- > 0 &&
        isProductDocument(path, maxBytes)) found.push(rel);
    }
  };
  walk(root, 0);
  return found.sort();
}

export function isProductDocument(path, maxBytes = 1_000_000) {
  let content;
  try {
    if (statSync(path).size > maxBytes) return false;
    content = readFileSync(path, "utf8");
  } catch { return false; }
  const { items } = parsePrd(content);
  const core = [...items.values()].filter((item) => ["US", "AC", "BR", "F"].includes(item.kind));
  if (core.length >= 3 && new Set(core.map((item) => item.kind)).size >= 2) return true;
  const { permissions, microcopy } = parseUxui(content);
  return permissions.length + microcopy.length >= 2;
}

// A draft in a project with product documents must say which it comes from,
// or why it comes from none of them.
export function undeclaredHandoffIssues(root, handoff) {
  if (handoff !== undefined) return [];
  const documents = productDocuments(root);
  if (!documents.length) return [];
  const named = documents.length > 5 ? `${documents.slice(0, 5).join(", ")}, and ${documents.length - 5} more` : documents.join(", ");
  return [`the project has product documents (${named}); name the ones this change comes from in ` +
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
  const record = handoffRecordValue(root, handoff, rows);
  // A hotfix names the incident it answers, so the product view can show
  // which handed-over items an incident touched.
  const incident = draft?.bugfix?.incident?.link;
  return typeof incident === "string" && incident.trim() ? { ...record, incident: incident.trim() } : record;
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

const COVERAGE_SECTION = /^(## (?:Handoff coverage|ความครอบคลุมเอกสาร)[^\n]*\n)[\s\S]*?(?=^## |(?![\s\S]))/m;

// After an amendment the proposal's coverage table is rebuilt from the record
// and the amended packet, so the approver never reads a row the amendment
// removed: each owed item shows where the agreement now cites it.
export function refreshHandoffSection(root, basePath) {
  const recordPath = join(basePath, HANDOFF_RECORD);
  const proposalPath = join(basePath, "proposal.md");
  if (!existsSync(recordPath) || !existsSync(proposalPath)) return false;
  const record = JSON.parse(readFileSync(recordPath, "utf8"));
  const handoff = { scope: record.scope, excluded: record.excluded || [] };
  for (const document of record.documents || []) handoff[document.field] = document.path;
  const read = (field) => handoff[field] && existsSync(join(root, handoff[field]))
    ? readFileSync(join(root, handoff[field]), "utf8") : null;
  const { rows } = productHandoffCoverage({}, handoff, { prdText: read("prd"), uxuiText: read("uxui") });
  const text = packetText(basePath);
  const places = [["specs", "specs"], ["tasks.md", "tasks"], ["design.md", "design"]];
  for (const row of rows) if (row.excluded === null) {
    row.coveredBy = places.filter(([file]) => {
      const part = file === "specs" ? readAll(join(basePath, "specs"), /\.md$/).join("\n")
        : existsSync(join(basePath, file)) ? readFileSync(join(basePath, file), "utf8") : "";
      return present(part.toLowerCase(), row.id);
    }).map(([, label]) => label);
    if (!row.coveredBy.length && present(text.all, row.id)) row.coveredBy = ["proposal"];
  }
  const proposal = readFileSync(proposalPath, "utf8");
  const match = proposal.match(COVERAGE_SECTION);
  if (!match) return false;
  const language = /ความครอบคลุม/.test(match[1]) ? "th" : "en";
  const body = renderProductHandoff({ rows, documents: (record.documents || []).map((doc) => `\`${doc.path}\``).join(", ") },
    { language });
  writeFileSync(proposalPath, proposal.replace(COVERAGE_SECTION, `${match[1]}\n${body}\n\n`));
  return true;
}

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
