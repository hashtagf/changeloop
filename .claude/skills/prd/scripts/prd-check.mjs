#!/usr/bin/env node
// Checks a PRD.md against the PRD template: the 18 numbered sections in
// order, evidence labels, and the links between stories, criteria, features,
// and ADRs. Node built-ins only.
//
//   node prd-check.mjs PRD.md [--json]     exit 1 on any finding
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";

export const SECTION_COUNT = 18;
const LABEL = /\[(Data|Assumption|Decision)\]/;

// `## <n>. Title` headings, in document order.
export function sections(text) {
  const out = [];
  const heading = /^##\s+(\d{1,2})\.\s+(.+)$/gm;
  let match;
  while ((match = heading.exec(text))) out.push({ number: Number(match[1]), title: match[2].trim(), at: match.index });
  return out.map((row, index) => ({ ...row, body: text.slice(row.at, out[index + 1]?.at ?? text.length) }));
}

const ids = (text, prefix) => new Set([...text.matchAll(new RegExp(`\\b${prefix}-\\d+\\b`, "g"))].map((m) => m[0]));

export function prdFindings(text) {
  const findings = [];
  const found = sections(text);
  const numbers = found.map((row) => row.number);
  for (let number = 1; number <= SECTION_COUNT; number += 1)
    if (!numbers.includes(number)) findings.push(`missing section ${number}`);
  if (numbers.join(",") !== [...numbers].sort((a, b) => a - b).join(","))
    findings.push(`sections are out of order: ${numbers.join(", ")}`);
  const body = (number) => found.find((row) => row.number === number)?.body || "";

  const empty = found.filter((row) => row.body.replace(/^##[^\n]*\n/, "").trim().length < 20);
  for (const row of empty) findings.push(`section ${row.number} (${row.title}) is empty`);

  const stories = ids(body(5), "US");
  if (!stories.size) findings.push("section 5 names no user story (US-nn)");
  const criteriaText = body(6);
  if (!/\bGiven\b[\s\S]*?\bWhen\b[\s\S]*?\bThen\b/.test(criteriaText))
    findings.push("section 6 has no Given/When/Then criterion");
  const covered = new Set([...criteriaText.matchAll(/\bAC-\d+\s*\(([^)]*)\)/g)]
    .flatMap((match) => [...match[1].matchAll(/US-\d+/g)].map((m) => m[0])));
  for (const story of stories)
    if (!covered.has(story) && !new RegExp(`${story}\\b`).test(criteriaText))
      findings.push(`${story} has no acceptance criterion in section 6`);

  if (!/```mermaid/.test(body(9))) findings.push("section 9 has no Mermaid diagram");

  const features = ids(body(10), "F");
  if (!features.size) findings.push("section 10 names no feature (F-nn)");
  const mapping = body(16);
  for (const feature of features)
    if (!new RegExp(`\\b${feature}\\b`).test(mapping)) {
      const range = [...mapping.matchAll(/\bF-(\d+)\s*[–-]\s*F-(\d+)/g)]
        .some((m) => Number(feature.slice(2)) >= Number(m[1]) && Number(feature.slice(2)) <= Number(m[2]));
      if (!range) findings.push(`${feature} is missing from the feature mapping (section 16)`);
    }

  for (const row of body(12).split("\n").filter((line) => /^\|\s*ADR-\d+/.test(line)))
    if (!/\b(Proposed|Accepted|Rejected|Superseded|Open|Decided)\b/i.test(row))
      findings.push(`${row.match(/ADR-\d+/)[0]} has no status`);
  if (!ids(body(12), "ADR").size) findings.push("section 12 has no ADR (ADR-nn)");

  if (body(11) && !ids(body(11), "NFR").size) findings.push("section 11 names no requirement (NFR-nn)");
  if (body(17) && !ids(body(17), "ERR").size) findings.push("section 17 names no error case (ERR-nn)");
  if (body(14) && !ids(body(14), "DEP").size) findings.push("section 14 names no dependency (DEP-nn)");
  if (body(15) && !ids(body(15), "PERM").size) findings.push("section 15 names no permission row (PERM-nn)");
  if (body(15) && !ids(body(15), "DATA").size) findings.push("section 15 names no data entity (DATA-nn)");
  if (!/^\s*-\s*\[[ x]\]/m.test(body(4))) findings.push("section 4 has no Definition of Done checklist (- [ ])");
  if (!/\|/.test(body(15)) || !/permission|สิทธิ์|role/i.test(body(15)))
    findings.push("section 15 has no permission matrix");
  if (!/\|/.test(body(18))) findings.push("section 18 has no open-question table");

  for (const number of [1, 3, 5, 8])
    if (body(number) && !LABEL.test(body(number)))
      findings.push(`section ${number} carries no [Data]/[Assumption]/[Decision] label`);
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const file = process.argv[2];
  if (!file) { console.error("usage: prd-check.mjs PRD.md [--json]"); process.exit(2); }
  const findings = prdFindings(readFileSync(file, "utf8"));
  if (process.argv.includes("--json")) console.log(JSON.stringify({ file, findings }, null, 2));
  else {
    for (const finding of findings) console.log(`- ${finding}`);
    console.log(`prd check: ${findings.length} finding(s)`);
  }
  process.exitCode = findings.length ? 1 : 0;
}
