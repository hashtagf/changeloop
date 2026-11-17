import {
  coverageRationale, coverageStatus, investigationAppendixBody
} from "../validation/reader-guide.mjs";
import { OUTLINE, outlineRow, sectionHeading } from "../validation/outline-contract.mjs";
import { DESIGN_FIELDS } from "../validation/design-blueprints.mjs";
import { PROCESS_FIELDS } from "../validation/process-fields.mjs";
import { hasField, markdownCell } from "./amendment-tasks.mjs";

// An amendment may replace one author-written outline section of design.md or
// proposal.md in place: `sections: [{ document, key, body? | value?, field? }]`.
// `body` is markdown; `value` is a typed field value rendered by the field's
// own module (`field` names it when the row is fed by several typed fields).
const SECTION_DOCUMENTS = ["design", "proposal"];

const TYPED_SECTION_FIELDS = Object.freeze({ ...DESIGN_FIELDS, ...PROCESS_FIELDS });

const SECTION_ROW_FIELDS = ["document", "key", "body", "value", "field"];

function sectionTypedField(row, section) {
  if (hasField(section, "field")) return String(section.field || "").trim();
  return row.fields.find((field) => TYPED_SECTION_FIELDS[field]) || "";
}

export function amendmentSectionIssues(amendment) {
  if (amendment?.sections === undefined) return [];
  if (!Array.isArray(amendment.sections)) return ["semantic amendment sections must be an array"];
  const issues = [];
  const seen = new Set();
  for (const [index, section] of amendment.sections.entries()) {
    const path = `semantic amendment sections[${index}]`;
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      issues.push(`${path} must be an object {document, key, body | value}`);
      continue;
    }
    for (const field of Object.keys(section))
      if (!SECTION_ROW_FIELDS.includes(field)) issues.push(`${path}.${field} is not a section field`);
    const document = String(section.document || "").trim();
    const key = String(section.key || "").trim();
    if (!SECTION_DOCUMENTS.includes(document)) {
      issues.push(`${path}.document must be one of ${SECTION_DOCUMENTS.join(", ")}`);
      continue;
    }
    const row = key ? outlineRow(document, key) : null;
    if (!row) {
      issues.push(`${path}.key '${key}' is not a ${document} outline section`);
      continue;
    }
    if (row.owner !== "author") {
      issues.push(`${path}.key '${key}' is a ${row.owner} ${document} section the harness ` +
        "builds; only author sections can be replaced");
      continue;
    }
    if (seen.has(`${document}:${key}`)) issues.push(`${path} replaces ${document} '${key}' twice`);
    seen.add(`${document}:${key}`);
    const hasBody = hasField(section, "body");
    const hasValue = hasField(section, "value");
    if (hasBody === hasValue) {
      issues.push(`${path} needs exactly one of body or value`);
      continue;
    }
    if (hasBody && (typeof section.body !== "string" || !section.body.trim()))
      issues.push(`${path}.body must be non-empty markdown`);
    if (hasValue) {
      const field = sectionTypedField(row, section);
      if (!field || !row.fields.includes(field) || !TYPED_SECTION_FIELDS[field])
        issues.push(`${path}.value needs a typed field of ${document} '${key}'` +
          (field ? ` ('${field}' is not one)` : "; use body instead"));
      else {
        const fieldIssues = TYPED_SECTION_FIELDS[field].validate(section.value, field)
          .map((issue) => `${path}.value: ${issue}`);
        issues.push(...fieldIssues);
        let rendered = "";
        try { rendered = TYPED_SECTION_FIELDS[field].render(section.value, { language: "en" }); }
        catch { rendered = ""; }
        if (!fieldIssues.length && !String(rendered || "").trim())
          issues.push(`${path}.value renders an empty ${field} section`);
      }
    }
  }
  return issues;
}

function markdownBlocks(content) {
  const blocks = [{ heading: null, lines: [] }];
  let fence = null;
  for (const line of String(content).split("\n")) {
    const current = blocks[blocks.length - 1];
    if (fence) {
      if (line.trimStart().startsWith(fence)) fence = null;
      current.lines.push(line);
      continue;
    }
    const opening = line.match(/^\s*(```|~~~)/);
    if (opening) {
      fence = opening[1];
      current.lines.push(line);
      continue;
    }
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) blocks.push({ heading: heading[1], lines: [line] });
    else current.lines.push(line);
  }
  return blocks;
}

// Untouched blocks keep their exact text; a new block is separated from its
// neighbours by one blank line.
function joinBlocks(blocks) {
  const kept = blocks.filter((block) => block.lines.length);
  for (const [index, block] of kept.entries())
    if (index < kept.length - 1 && block.lines[block.lines.length - 1].trim() !== "")
      block.lines = [...block.lines, ""];
  return `${kept.map((block) => block.lines.join("\n")).join("\n").replace(/\s+$/, "")}\n`;
}

function sectionBlock(heading, body) {
  return { heading, lines: `## ${heading}\n\n${String(body).trim()}\n`.split("\n") };
}

function sectionLanguage(language) {
  return /^th\b/i.test(String(language || "")) ? "th" : "en";
}

const rowHeadings = (row) => [row.heading.en, row.heading.th];

// Replace every block whose heading is in `headings` with `block` (placed where
// the first one stood), or insert `block` before the first section the outline
// orders after `orderKey`, or at the end. `null` removes the matched blocks.
function upsertBlock(content, document, orderKey, headings, block) {
  const blocks = markdownBlocks(content);
  const matches = new Set(headings);
  const first = blocks.findIndex((entry) => matches.has(entry.heading));
  if (first >= 0) {
    const next = blocks.flatMap((entry, index) =>
      index === first ? (block ? [block] : []) : matches.has(entry.heading) ? [] : [entry]);
    return joinBlocks(next);
  }
  if (!block) return joinBlocks(blocks);
  const rows = OUTLINE[document];
  const position = rows.findIndex((row) => row.key === orderKey);
  const later = new Set(rows.slice(position + 1).flatMap(rowHeadings));
  const before = blocks.findIndex((entry) => entry.heading && later.has(entry.heading));
  if (before < 0) blocks.push(block);
  else blocks.splice(before, 0, block);
  return joinBlocks(blocks);
}

function blockOf(content, headings) {
  const matches = new Set(headings);
  return markdownBlocks(content).find((entry) => matches.has(entry.heading)) || null;
}

// Headings every earlier layout used for the investigation agreement: older
// amendments appended a fresh "Latest amended" copy each time.
const LEGACY_INVESTIGATION_HEADINGS = [
  "Latest amended investigation agreement", "Appendix: investigation provenance",
  "Investigation requirement coverage", "ความครบของ requirement จาก Investigate",
  "Retained investigation context", "บริบทที่รับจาก Investigate"
];

const DISCOVERY_DELTA_HEADING = "Amendment discovery coverage";

const REMOVED_REQUIREMENTS_HEADING = "Amendment removed requirements";

function proposalTitle(content) {
  return String(content).match(/^#\s+(?:Change:\s*)?(.+?)\s*$/m)?.[1] || "";
}

export function replaceInvestigation(content, agreement) {
  const row = outlineRow("proposal", "investigation");
  const body = investigationAppendixBody(agreement, proposalTitle(content));
  const block = body
    ? sectionBlock(sectionHeading(row, sectionLanguage(agreement.language)), body) : null;
  return upsertBlock(content, "proposal", "investigation",
    [...rowHeadings(row), ...LEGACY_INVESTIGATION_HEADINGS], block);
}

export function replaceDiscoveryDelta(content, compiled) {
  const rows = compiled.discovery.coverage.map((row) =>
    `| ${markdownCell(row.dimension)} | ${markdownCell(coverageStatus(row))} | ` +
    `${markdownCell((row.covers || []).join(", ") || "none")} | ` +
    `${markdownCell((row.sources || []).join(", ") || "none")} | ` +
    `${markdownCell(coverageRationale(row) || "none")} |`
  ).join("\n");
  return upsertBlock(content, "proposal", "discovery", [DISCOVERY_DELTA_HEADING],
    sectionBlock(DISCOVERY_DELTA_HEADING, `Reason: ${markdownCell(compiled.amendmentReason)}\n\n` +
      `| Dimension | Status | Requirements | Sources | Rationale |\n|---|---|---|---|---|\n${rows}`));
}

// Removed requirements accumulate across amendments in one table; a key
// removed again keeps only its latest migration.
export function replaceRemovedRequirements(content, compiled) {
  const prior = blockOf(content, [REMOVED_REQUIREMENTS_HEADING]);
  const rows = new Map();
  for (const line of prior?.lines || []) {
    const cells = line.match(/^\|\s*(.+?)\s*\|\s*(.*?)\s*\|\s*$/);
    if (!cells || /^-+$/.test(cells[1]) || cells[1] === "Requirement") continue;
    rows.set(cells[1], line.trim());
  }
  for (const row of compiled.removedRequirements)
    rows.set(markdownCell(row.key), `| ${markdownCell(row.key)} | ${markdownCell(row.migration)} |`);
  return upsertBlock(content, "proposal", "discovery", [REMOVED_REQUIREMENTS_HEADING],
    sectionBlock(REMOVED_REQUIREMENTS_HEADING, `Reason: ${markdownCell(compiled.amendmentReason)}\n\n` +
      `| Requirement | Migration |\n|---|---|\n${[...rows.values()].join("\n")}`));
}

// One history line per amendment: revision, date, and reason.
export function appendAmendmentHistory(content, compiled, { revision, date } = {}) {
  const row = outlineRow("proposal", "amendments");
  const headings = rowHeadings(row);
  const prior = blockOf(content, headings);
  const lines = (prior?.lines.slice(1) || []).filter((line) => /^\s*-\s+\S/.test(line));
  const number = Number.isInteger(revision) && revision > 0 ? revision : lines.length + 1;
  const day = String(date || new Date().toISOString()).slice(0, 10);
  lines.push(`- Revision ${number} (${day}): ${String(compiled.amendmentReason || "")
    .replace(/\s*\r?\n\s*/g, " ").trim()}`);
  const heading = prior?.heading ||
    sectionHeading(row, sectionLanguage(compiled.investigationAgreement?.language));
  return upsertBlock(content, "proposal", "amendments", headings,
    sectionBlock(heading, lines.join("\n")));
}

function renderSectionBody(section, language) {
  if (hasField(section, "body")) return section.body;
  const row = outlineRow(section.document, section.key);
  const field = sectionTypedField(row, section);
  return TYPED_SECTION_FIELDS[field].render(section.value, { language });
}

// design.md renders the marker rows with their English heading whatever the
// language; any heading of the row matches, so the section is replaced in place.
const ENGLISH_DESIGN_HEADINGS = new Set(["workType", "decisions", "bugfix", "refactor"]);

export function replaceOutlineSection(content, section, language) {
  const row = outlineRow(section.document, section.key);
  const body = String(renderSectionBody(section, language) || "").trim();
  if (!body) throw new Error(`amendment section ${section.document} '${section.key}' renders empty`);
  const existing = blockOf(content, rowHeadings(row));
  const heading = existing?.heading || (section.document === "design" &&
    ENGLISH_DESIGN_HEADINGS.has(row.key) ? row.heading.en : sectionHeading(row, language));
  return upsertBlock(content, section.document, row.key, rowHeadings(row),
    sectionBlock(heading, body));
}

export function packetLanguage(content, fallback) {
  if (fallback) return sectionLanguage(fallback);
  return /[฀-๿]/.test(String(content).split("\n").filter((line) => /^##\s/.test(line))
    .join("\n")) ? "th" : "en";
}
