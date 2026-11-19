// Product progress: the project-wide view of the product documents. Each
// change records the items it owes in handoff.json; this rollup reads every
// active and archived packet and places each item of every PRD and uxui
// document in one state — not started, in a change, proven, or archived — so
// an item no change picked up is visible instead of silently dropped. Read
// only: nothing here writes state.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HANDOFF_RECORD, productDocuments } from "./handoff-binding.mjs";
import { parsePrd, parseUxui } from "./product-handoff.mjs";

export const PRODUCT_PROGRESS_SCHEMA_VERSION = 1;
// Later states win when several changes owe one item.
export const ITEM_STATES = Object.freeze(["not-started", "in-change", "proven", "archived"]);
const PROVEN = new Set(["proven", "applied", "applying", "archiving"]);

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function directories(path) {
  try { return readdirSync(path, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name); }
  catch { return []; }
}

function readRecord(path) {
  try {
    const record = JSON.parse(readFileSync(path, "utf8"));
    return record && typeof record === "object" && Array.isArray(record.owed) ? record : null;
  } catch { return null; }
}

// Every packet with a handoff record: { change, state, record }. An archived
// packet's directory carries a date prefix; its runtime state may be gone.
export function handoffRecords(root) {
  const changes = join(root, "openspec", "changes");
  const rows = [];
  for (const name of directories(changes).filter((entry) => entry !== "archive")) {
    const record = readRecord(join(changes, name, HANDOFF_RECORD));
    if (!record) continue;
    let status = null;
    try { status = JSON.parse(readFileSync(join(root, ".foundation", "runtime", `${name}.json`), "utf8")).status || null; }
    catch { status = null; }
    rows.push({ change: name, state: status === "archived" ? "archived" : PROVEN.has(status) ? "proven" : "in-change",
      status, record });
  }
  for (const name of directories(join(changes, "archive"))) {
    const record = readRecord(join(changes, "archive", name, HANDOFF_RECORD));
    if (record) rows.push({ change: name.replace(/^\d{4}-\d{2}-\d{2}-/, ""), state: "archived", status: "archived", record });
  }
  return rows;
}

// The items a document defines: PRD IDs, uxui permission and microcopy rows,
// and every screen state, with the feature each belongs to when known.
export function documentItems(text) {
  const items = [];
  const prd = parsePrd(text);
  const featureOf = new Map();
  for (const [feature, ids] of prd.mapping) for (const id of ids) if (!featureOf.has(id)) featureOf.set(id, feature);
  for (const item of prd.items.values())
    items.push({ id: item.id, kind: item.kind, text: item.text, feature: item.kind === "F" ? item.id : featureOf.get(item.id) || null });
  const ux = parseUxui(text);
  for (const row of [...ux.permissions, ...ux.microcopy])
    items.push({ id: row.id, kind: row.id.replace(/-\d+$/, ""), text: row.text, feature: null });
  for (const screen of ux.screens)
    for (const state of screen.states.length ? screen.states : [""])
      items.push({ id: state ? `screen:${screen.screen}/${state}` : `screen:${screen.screen}`, kind: "SCREEN",
        text: state ? `${screen.screen} — ${state}` : screen.screen, feature: null });
  return items;
}

// { version, documents: [{ path, summary, items, changed }], untracked }.
// `document` limits the view to one path.
export function productProgress(root, { document = null } = {}) {
  const records = handoffRecords(root);
  const paths = document ? [document] : [...new Set([...productDocuments(root),
    ...records.flatMap((row) => (row.record.documents || []).map((doc) => doc.path))])].sort();
  const documents = [];
  for (const path of paths) {
    const absolute = join(root, path);
    if (!existsSync(absolute)) { documents.push({ path, missing: true, summary: null, items: [], changed: [] }); continue; }
    const digest = sha256(absolute);
    const citing = records.filter((row) => (row.record.documents || []).some((doc) => doc.path === path));
    const items = documentItems(readFileSync(absolute, "utf8")).map((item) => {
      const owedBy = citing.filter((row) => row.record.owed.includes(item.id))
        .map((row) => ({ change: row.change, state: row.state }));
      const deferredBy = citing.flatMap((row) => (row.record.excluded || []).filter((entry) => entry.id === item.id)
        .map((entry) => ({ change: row.change, reason: entry.reason })));
      const state = owedBy.reduce((best, row) =>
        ITEM_STATES.indexOf(row.state) > ITEM_STATES.indexOf(best) ? row.state : best, "not-started");
      return { ...item, state, owedBy, deferredBy };
    });
    const summary = Object.fromEntries(ITEM_STATES.map((state) => [state, items.filter((item) => item.state === state).length]));
    summary.total = items.length;
    // A change compiled against another revision of the document: its items
    // may have moved on since, so the view names it.
    const changed = citing.filter((row) => (row.record.documents || [])
      .some((doc) => doc.path === path && doc.sha256 !== digest)).map((row) => ({ change: row.change, state: row.state }));
    documents.push({ path, summary, items, changed });
  }
  return { version: PRODUCT_PROGRESS_SCHEMA_VERSION, documents,
    next: documents.length ? null : "no product documents (PRD.md, uxui.md, or a Markdown file with US-/AC- IDs) were found" };
}

const MARK = { "not-started": "[ ]", "in-change": "[~]", proven: "[p]", archived: "[x]" };

function itemLine(item) {
  const where = item.owedBy.length ? ` — ${item.owedBy.map((row) => `${row.change} (${row.state})`).join(", ")}`
    : item.deferredBy.length ? ` — deferred by ${item.deferredBy.map((row) => `${row.change}: ${row.reason}`).join("; ")}` : "";
  return `${MARK[item.state]} ${item.id} ${item.text.slice(0, 70)}${where}`;
}

export function productProgressLines(value) {
  if (!value.documents.length) return [`No product documents: ${value.next}`];
  const lines = [];
  for (const doc of value.documents) {
    if (doc.missing) { lines.push(`${doc.path}: missing`); continue; }
    const s = doc.summary;
    lines.push(`${doc.path}: ${s.archived}/${s.total} archived, ${s.proven} proven, ${s["in-change"]} in a change, ${s["not-started"]} not started`);
    // Grouped under their feature, in document order; items of no feature last.
    const features = doc.items.filter((item) => item.kind === "F");
    const groups = [...features.map((feature) => [feature, doc.items.filter((item) => item.feature === feature.id && item !== feature)]),
      [null, doc.items.filter((item) => item.kind !== "F" && !features.some((feature) => feature.id === item.feature))]];
    for (const [feature, members] of groups) {
      if (feature) lines.push(`  ${MARK[feature.state]} ${feature.id} ${feature.text.slice(0, 70)}`);
      else if (members.length && features.length) lines.push("  (no feature)");
      for (const item of members) lines.push(`    ${itemLine(item)}`);
    }
    for (const row of doc.changed)
      lines.push(`  ! ${row.change} (${row.state}) was compiled against an earlier ${doc.path}; check whether its items still match`);
  }
  return lines;
}

export function createProductProgressCommand({ root, log = console.log, fail }) {
  function showProductProgress(flags = {}) {
    const value = productProgress(root, { document: flags.document || null });
    log(flags.pretty ? productProgressLines(value).join("\n") : JSON.stringify(value, null, 2));
    const open = value.documents.reduce((sum, doc) => sum + (doc.summary?.["not-started"] || 0), 0);
    if (flags.strict && open) fail(`${open} product item(s) are not in any change`);
    return value;
  }
  return { showProductProgress };
}
