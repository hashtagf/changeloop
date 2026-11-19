#!/usr/bin/env node
// Checks a ux-design project folder against the skill's contracts: uxui.md
// sections and labels, the design system's base components, copy buttons,
// and versioned Token Block, and every artifact's verbatim Token Block and
// Design QA section. Node built-ins only.
//
//   node uxui-check.mjs <project-dir> [--json]     exit 1 on any finding
//
// The folder holds uxui.md, design-system.html, and artifacts (*.html).
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const BASE_COMPONENTS = Object.freeze([
  "button", "icon-button", "link", "input", "textarea", "select", "combobox", "checkbox", "radio", "toggle",
  "date-picker", "file-upload", "badge", "avatar", "tooltip", "dropdown-menu", "tabs", "breadcrumb",
  "pagination", "card", "modal", "drawer", "toast", "alert", "skeleton", "spinner", "progress", "empty-state",
  "stepper", "sidebar", "navbar", "footer"
]);
const BACK_OFFICE = ["Design Objective", "User Persona", "Information Architecture", "Permission Matrix",
  "User Journey", "User Flow", "Screen Inventory", "Content & Microcopy", "Design Rules", "Artifact Index",
  "Changelog", "Open Questions"];
const LANDING = ["Design Objective", "Persona", "Section Structure", "CTA Strategy", "SEO Meta",
  "Content & Microcopy", "Design Rules", "Artifact Index", "Changelog", "Open Questions"];
const STATUSES = /^(not started|in progress|done|ยังไม่เริ่ม|กำลังทำ|เสร็จ)$/i;
const LABEL = /\[(Data|Assumption)\]/;
const BLOCK = /\/\*\s*Design System v(\d+\.\d+)\s+—\s+(\d{4}-\d{2}-\d{2})\s*\*\/[\s\S]*?\/\*\s*end Design System\s*\*\//;

const sections = (text) => {
  const found = [...text.matchAll(/^##\s+(?:\d+\.\s*)?(.+)$/gm)];
  return found.map((match, index) => ({ title: match[1].trim(),
    body: text.slice(match.index, found[index + 1]?.index ?? text.length) }));
};
const section = (list, name) => list.find((row) => row.title.toLowerCase().startsWith(name.toLowerCase()));

export function uxuiFindings(text) {
  const findings = [];
  const type = (text.match(/^Work type:\s*(.+)$/mi)?.[1] || "").toLowerCase();
  if (!/back-office|landing|both/.test(type)) findings.push("uxui.md: no 'Work type: back-office | landing | both' line");
  const list = sections(text);
  const required = type.includes("landing") && !type.includes("both") ? LANDING : BACK_OFFICE;
  for (const name of required)
    if (!section(list, name)) findings.push(`uxui.md: missing section "${name}"`);
  for (const name of ["User Persona", "Persona", "User Journey"]) {
    const row = section(list, name);
    if (!row) continue;
    const items = row.body.split("\n").filter((line) => /^\s*(-|\|)/.test(line) && !/^\s*\|[\s:-]+\|/.test(line) &&
      !/^\|\s*(Persona|Stage|ขั้น|ชื่อ)\b/i.test(line) && line.replace(/[|\s-]/g, "").length > 3);
    const unlabelled = items.filter((line) => !LABEL.test(line));
    if (unlabelled.length) findings.push(`uxui.md: ${unlabelled.length} ${row.title} item(s) without [Data] or [Assumption]`);
  }
  const inventory = section(list, "Screen Inventory");
  if (inventory) {
    const rows = inventory.body.split("\n").filter((line) => /^\|/.test(line) && !/^\|[\s:-]+\|/.test(line)).slice(1);
    for (const row of rows) {
      const status = row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()).at(-1);
      if (!STATUSES.test(status)) findings.push(`uxui.md: Screen Inventory status "${status}" is not not started | in progress | done`);
    }
  }
  return findings;
}

export function tokenBlock(html) {
  const match = html.match(BLOCK);
  return match ? { text: match[0].trim(), version: match[1], date: match[2] } : null;
}

export function designSystemFindings(html) {
  const findings = [];
  const block = tokenBlock(html);
  if (!block) findings.push("design-system.html: no Token Block from '/* Design System vX.Y — YYYY-MM-DD */' to '/* end Design System */'");
  const components = new Set([...html.matchAll(/data-component=["']([a-z-]+)["']/g)].map((match) => match[1]));
  const missing = BASE_COMPONENTS.filter((name) => !components.has(name));
  if (missing.length) findings.push(`design-system.html: missing base component(s): ${missing.join(", ")}`);
  const copyButtons = (html.match(/data-copy\b/g) || []).length;
  if (copyButtons < components.size) findings.push(`design-system.html: ${copyButtons} copy button(s) for ${components.size} component(s)`);
  if (!/prefers-reduced-motion/.test(html)) findings.push("design-system.html: no prefers-reduced-motion rule");
  return { findings, block, components };
}

export function artifactFindings(name, html, designBlock, components) {
  const findings = [];
  const block = tokenBlock(html);
  if (!block) findings.push(`${name}: no Token Block`);
  else if (designBlock && block.text !== designBlock.text)
    findings.push(block.version === designBlock.version
      ? `${name}: Token Block v${block.version} differs from the design system's; copy it verbatim`
      : `${name}: Token Block v${block.version} is not the current v${designBlock.version}`);
  const qa = html.match(/<section[^>]*id=["']design-qa["'][\s\S]*?<\/section>/i)?.[0];
  if (!qa) findings.push(`${name}: no Design QA section (id="design-qa")`);
  else if (designBlock && !qa.includes(`v${designBlock.version}`))
    findings.push(`${name}: Design QA does not name Design System v${designBlock.version}`);
  const used = new Set([...html.matchAll(/data-component=["']([a-z-]+)["']/g)].map((match) => match[1]));
  const unknown = [...used].filter((component) => components && !components.has(component));
  if (unknown.length) findings.push(`${name}: uses component(s) not in the design system: ${unknown.join(", ")}`);
  return findings;
}

export function projectFindings(dir) {
  const findings = [];
  const uxui = join(dir, "uxui.md");
  const system = join(dir, "design-system.html");
  if (existsSync(uxui)) findings.push(...uxuiFindings(readFileSync(uxui, "utf8")));
  else findings.push("uxui.md is missing");
  let design = { block: null, components: null };
  if (existsSync(system)) {
    design = designSystemFindings(readFileSync(system, "utf8"));
    findings.push(...design.findings);
  }
  const artifacts = readdirSync(dir).filter((file) => file.endsWith(".html") && file !== "design-system.html").sort();
  for (const file of artifacts)
    findings.push(...artifactFindings(file, readFileSync(join(dir, file), "utf8"), design.block, design.components));
  if (existsSync(uxui) && design.block) {
    const text = readFileSync(uxui, "utf8");
    if (!new RegExp(`v${design.block.version.replace(".", "\\.")}\\b`).test(section(sections(text), "Changelog")?.body || ""))
      findings.push(`uxui.md: Changelog has no row for Design System v${design.block.version}`);
    for (const file of artifacts)
      if (!(section(sections(text), "Artifact Index")?.body || "").includes(file))
        findings.push(`uxui.md: Artifact Index does not list ${file}`);
  }
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const dir = process.argv[2];
  if (!dir) { console.error("usage: uxui-check.mjs <project-dir> [--json]"); process.exit(2); }
  const findings = projectFindings(dir);
  if (process.argv.includes("--json")) console.log(JSON.stringify({ dir, findings }, null, 2));
  else {
    for (const finding of findings) console.log(`- ${finding}`);
    console.log(`uxui check: ${findings.length} finding(s)`);
  }
  process.exitCode = findings.length ? 1 : 0;
}
