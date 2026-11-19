#!/usr/bin/env node

// The harness-owned `accessibility` provider for projects that have no
// accessibility check of their own. It reads the markup a change touched
// (HTML, JSX/TSX, Vue, Svelte, Astro, and markup built in JS/TS) and reports the defects a static read
// can establish: images without alt text, form controls without a label,
// buttons and links without a name, a page without a language, positive
// tabindex, and click handlers on elements a keyboard cannot reach. Only
// lines the change added or edited are judged, so a touched legacy file owes
// nothing for its old lines. It never renders the page: contrast, focus
// order, and live behavior need the project's own rendered check, which
// replaces this one when the project has it.
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const ACCESSIBILITY_BUILT_IN = "accessibility-static-v1";
// Script files count too: markup is often built in strings or JSX inside
// `.js`/`.ts` (a render function returning HTML), and only tags are read.
export const MARKUP_EXTENSIONS = Object.freeze([".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro",
  ".js", ".mjs", ".cjs", ".ts", ".mts"]);

// Every change that owes accessibility has a check even when the project has
// none. A project-owned accessibility command replaces it: detection treats
// this provider as unwired and wires the project's command when it finds one.
// It declares no inputs, so it binds the whole workspace: a change may touch
// no markup file at all, and declared inputs that match nothing are refused.
export function accessibilityProviderConfig(scriptPath) {
  return { adapter: "command", capability: "accessibility", version: "2",
    command: ["node", scriptPath], builtIn: ACCESSIBILITY_BUILT_IN };
}

const NON_LABELLED_INPUTS = new Set(["hidden", "submit", "button", "reset", "image"]);
const CLICK = /\s(onClick|@click|v-on:click|on:click)\s*=/;
const KEY = /\s(onKey(Down|Up|Press)|@key(down|up|press)|v-on:key(down|up|press)|on:key(down|up|press))\s*=/;
const NAMED = /\s(aria-label|aria-labelledby|title)\s*=/;

// Opening tags of `name` with their offset and attribute text; JSX attribute
// values in braces may contain `>`, so braces are balanced while scanning.
function openingTags(text, name) {
  const tags = [];
  const pattern = new RegExp(`<${name}(?=[\\s/>])`, "gi");
  let match;
  while ((match = pattern.exec(text))) {
    let depth = 0;
    let quote = null;
    let index = match.index + match[0].length;
    for (; index < text.length; index++) {
      const char = text[index];
      if (quote) { if (char === quote) quote = null; continue; }
      if (char === "\"" || char === "'") quote = char;
      else if (char === "{") depth++;
      else if (char === "}") depth--;
      else if (char === ">" && depth <= 0) break;
    }
    tags.push({ offset: match.index, attributes: text.slice(match.index + match[0].length, index),
      end: index + 1, selfClosing: text[index - 1] === "/" });
  }
  return tags;
}

function attribute(attributes, name) {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`, "i").exec(` ${attributes}`);
  if (match) return match[1] ?? match[2] ?? `{${match[3]}}`;
  return new RegExp(`\\s${name}(?=[\\s/>]|$)`, "i").test(` ${attributes}`) ? "" : null;
}

function lineAt(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

// The text between an opening tag and its closing tag, without markup.
function innerText(text, tag, name) {
  if (tag.selfClosing) return "";
  const close = text.toLowerCase().indexOf(`</${name}`, tag.end);
  return close === -1 ? "" : text.slice(tag.end, close)
    .replace(/<img\b[^>]*\balt\s*=\s*["'][^"']+["'][^>]*>/gi, " image ")
    .replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim();
}

function insideLabel(text, offset) {
  const before = text.slice(0, offset).toLowerCase();
  return before.lastIndexOf("<label") > before.lastIndexOf("</label");
}

function labelledIds(text) {
  return new Set([...text.matchAll(/<label\b[^>]*\b(?:for|htmlFor)\s*=\s*(?:"([^"]+)"|'([^']+)'|\{["']([^"']+)["']\})/gi)]
    .map((match) => match[1] || match[2] || match[3]));
}

/** @returns {{ line: number, rule: string, message: string }[]} */
export function markupFindings(text, path = "") {
  const findings = [];
  const add = (offset, rule, message) => findings.push({ line: lineAt(text, offset), rule, message });
  for (const tag of openingTags(text, "img"))
    if (attribute(tag.attributes, "alt") === null && !NAMED.test(` ${tag.attributes}`))
      add(tag.offset, "img-alt", "<img> has no alt text; describe it, or use alt=\"\" when it is decorative");
  const labelled = labelledIds(text);
  for (const name of ["input", "select", "textarea"])
    for (const tag of openingTags(text, name)) {
      const type = String(attribute(tag.attributes, "type") || "").toLowerCase();
      if (name === "input" && NON_LABELLED_INPUTS.has(type)) continue;
      const id = attribute(tag.attributes, "id");
      if (NAMED.test(` ${tag.attributes}`) || (id && labelled.has(id.replace(/^\{["']|["']\}$/g, ""))) ||
          insideLabel(text, tag.offset)) continue;
      add(tag.offset, "control-label", `<${name}> has no label; wrap it in <label>, point a <label for> at its id, or add aria-label`);
    }
  for (const [name, rule] of [["button", "button-name"], ["a", "link-name"]])
    for (const tag of openingTags(text, name)) {
      if (name === "a" && attribute(tag.attributes, "href") === null) continue;
      if (NAMED.test(` ${tag.attributes}`) || innerText(text, tag, name)) continue;
      add(tag.offset, rule, `<${name}> has no accessible name; give it text or aria-label`);
    }
  if (/\.html?$/i.test(path))
    for (const tag of openingTags(text, "html"))
      if (!attribute(tag.attributes, "lang")) add(tag.offset, "html-lang", "<html> has no lang attribute");
  for (const match of text.matchAll(/\btab[iI]ndex\s*=\s*(?:"(\d+)"|'(\d+)'|\{(\d+)\})/g))
    if (Number(match[1] || match[2] || match[3]) > 0)
      add(match.index, "positive-tabindex", "a positive tabindex breaks the natural focus order; use 0 or -1");
  for (const name of ["div", "span", "li", "td", "img", "p", "section"])
    for (const tag of openingTags(text, name)) {
      const attributes = ` ${tag.attributes}`;
      if (CLICK.test(attributes) && !(attribute(tag.attributes, "role") !== null && KEY.test(attributes)))
        add(tag.offset, "click-without-keyboard",
          `<${name}> handles clicks but not the keyboard; use a <button>, or add role, tabIndex, and a key handler`);
    }
  return findings;
}

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return result.status === 0 ? result.stdout : null;
}

// Workspace files outside version control, tool, and harness directories.
const SKIPPED = new Set([".git", "node_modules", ".foundation", ".claude", "openspec", "dist", "build",
  "coverage", "test-results"]);
function walkFiles(root, prefix = "") {
  let entries;
  try { entries = readdirSync(join(root, prefix), { withFileTypes: true }); } catch { return []; }
  return entries.flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return SKIPPED.has(entry.name) ? [] : walkFiles(root, rel);
    return entry.isFile() ? [rel] : [];
  });
}

const isMarkup = (path) => MARKUP_EXTENSIONS.includes(extname(path).toLowerCase());

// Changed markup files of one repository with the lines the change added or
// edited (`null` = every line: a new file, or no Git base to diff against).
export function changedMarkup(path, baseHead, controlPath = null) {
  const changed = new Map();
  if (baseHead && git(path, ["rev-parse", "--verify", `${baseHead}^{commit}`]) !== null) {
    let file = null;
    for (const line of (git(path, ["diff", "--unified=0", "--no-color", "--no-renames", baseHead, "--"]) || "").split("\n")) {
      if (line.startsWith("+++ ")) {
        file = line === "+++ /dev/null" ? null : line.slice(6);
        if (file && isMarkup(file)) changed.set(file, new Set());
        continue;
      }
      const hunk = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(line);
      if (hunk && file && changed.has(file)) {
        const start = Number(hunk[1]);
        for (let offset = 0; offset < Number(hunk[2] ?? 1); offset++) changed.get(file).add(start + offset);
      }
    }
    for (const file of (git(path, ["ls-files", "--others", "--exclude-standard"]) || "").split("\n"))
      if (file && isMarkup(file)) changed.set(file, null);
    return changed;
  }
  // No Git base (a copied workspace): a file differs from the project's copy.
  // A workspace that is not a Git repository at all is walked directly, so a
  // copied project is judged instead of passing with nothing read.
  const listed = git(path, ["ls-files", "--cached", "--others", "--exclude-standard"]);
  for (const file of (listed === null ? walkFiles(path) : listed.split("\n"))) {
    if (!file || !isMarkup(file)) continue;
    const original = controlPath && join(controlPath, file);
    if (!original || !existsSync(original) ||
        readFileSync(original, "utf8") !== readFileSync(join(path, file), "utf8")) changed.set(file, null);
  }
  return changed;
}

export function accessibilityReport(repositories, controlRoot = null) {
  const findings = [];
  let files = 0;
  for (const [id, repository] of Object.entries(repositories)) {
    if (repository.access === "read") continue;
    const control = id === "root" ? controlRoot : null;
    for (const [file, lines] of changedMarkup(repository.path, repository.baseHead, control)) {
      const absolute = join(repository.path, file);
      if (!existsSync(absolute)) continue;
      files++;
      for (const finding of markupFindings(readFileSync(absolute, "utf8"), file))
        if (!lines || lines.has(finding.line))
          findings.push({ file: id === "root" ? file : `${id}/${file}`, ...finding });
    }
  }
  return { built: ACCESSIBILITY_BUILT_IN, files, findings,
    status: findings.length ? "fail" : "pass",
    limits: "static markup only: contrast, focus order, and rendered behavior need a rendered accessibility check" };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  let repositories = { root: { path: process.cwd(), access: "write", baseHead: null } };
  try {
    if (process.env.FOUNDATION_REPOSITORIES_FILE)
      repositories = JSON.parse(readFileSync(process.env.FOUNDATION_REPOSITORIES_FILE, "utf8")).repositories;
  } catch (error) {
    console.error(`accessibility: cannot read the repository manifest: ${error.message}`);
    process.exit(2);
  }
  const report = accessibilityReport(repositories, process.env.FOUNDATION_CONTROL_ROOT || null);
  for (const finding of report.findings)
    console.log(`${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`);
  console.log(`accessibility (${report.built}): ${report.findings.length} finding(s) in ${report.files} changed markup file(s); ${report.limits}`);
  process.exitCode = report.findings.length ? 1 : 0;
}
