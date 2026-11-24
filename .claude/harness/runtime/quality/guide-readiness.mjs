// Setup readiness of the project-owned guides agents and reviewers read. The
// installer seeds them so Change Loop works at once, but a seeded guide says
// nothing about this project: an agent guide holding only the Change Loop
// pointer has no project rules, and the template REVIEW.md reviews every
// project the same way. `doctor` reports each as a setup row the onboard skill
// fills; never an error.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Blocks the installer writes into CLAUDE.md and AGENTS.md.
const MANAGED_BLOCK = /<!--\s*claude-foundation:([a-z-]+):start\s*-->[\s\S]*?<!--\s*claude-foundation:\1:end\s*-->/g;
// Placeholders the REVIEW.md template asks the project to fill.
const REVIEW_PLACEHOLDERS = ["<name or team who maintains these rules>", "<add project-specific exclusions>"];
// Words of project guidance an agent guide needs beyond headings and the managed block.
const MINIMUM_GUIDE_WORDS = 40;
// A guide is loaded into every session: past this it crowds out the task and
// rots. Keep it a map that points to docs, not the manual itself.
export const MAXIMUM_GUIDE_LINES = 200;

// Package-script references (`npm run x`, `pnpm x`, `yarn x`, `bun run x`) in
// a guide whose package.json no longer defines that script: an instruction an
// agent follows and fails on.
export function staleScriptReferences(markdown, scripts) {
  if (!scripts) return [];
  const builtins = new Set(["install", "ci", "i", "add", "remove", "exec", "dlx", "run", "init", "create",
    "publish", "pack", "link", "update", "upgrade", "outdated", "audit", "why", "x", "start", "test"]);
  const found = new Set();
  const pattern = /\b(?:npm|pnpm|bun) run ([\w:.-]+)|\b(?:pnpm|yarn|bun) ([\w:.-]+)|\bnpm (start|test)\b/g;
  for (const match of String(markdown).matchAll(pattern)) {
    const name = match[1] || match[2] || match[3];
    if (!name || (!match[1] && !match[3] && builtins.has(name))) continue;
    if (!Object.hasOwn(scripts, name)) found.add(name);
  }
  return [...found].sort();
}

function text(root, name) {
  try { return readFileSync(join(root, name), "utf8"); } catch { return null; }
}

// Words of project-written guidance: managed blocks, headings, and comments removed.
export function projectGuideWords(markdown) {
  return String(markdown || "").replace(MANAGED_BLOCK, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .split("\n").filter((line) => !/^\s*#/.test(line)).join(" ")
    .split(/\s+/).filter((word) => /\w/.test(word)).length;
}

export function guideReadiness(root) {
  const rows = [];
  const guides = ["CLAUDE.md", "AGENTS.md"].filter((name) => existsSync(join(root, name)));
  const words = guides.map((name) => ({ name, words: projectGuideWords(text(root, name)) }));
  const written = words.find((row) => row.words >= MINIMUM_GUIDE_WORDS);
  let scripts = null;
  try { scripts = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts || {}; } catch { scripts = null; }
  const problems = guides.flatMap((name) => {
    const content = text(root, name) || "";
    const lines = content.split("\n").length;
    const stale = staleScriptReferences(content, scripts);
    return [
      ...(lines > MAXIMUM_GUIDE_LINES ? [`${name} is ${lines} lines (keep it under ${MAXIMUM_GUIDE_LINES}: a map that points to docs)`] : []),
      ...(stale.length ? [`${name} names script(s) package.json lacks: ${stale.slice(0, 5).join(", ")}`] : [])
    ];
  });
  rows.push(problems.length && written
    ? { id: "agent-guide", level: "warn", detail: problems.join("; "),
      next: "fix the named commands and move long sections into docs/ the guide links to (skill: claude-md)" }
    : !guides.length
    ? { id: "agent-guide", level: "info", detail: "no CLAUDE.md or AGENTS.md",
      next: "ask the agent to write a short agent guide (skill: claude-md)" }
    : written ? { id: "agent-guide", level: "ok", detail: `${written.name} has project guidance`, next: null }
      : { id: "agent-guide", level: "info",
        detail: `${guides.join(" and ")} hold only the Change Loop pointer; no project rules for agents`,
        next: "onboard hands the guide to skill claude-md, which drafts the project's rules for you to confirm" });

  const review = text(root, "REVIEW.md");
  rows.push(review === null || !review.trim()
    ? { id: "review-rules", level: "info", detail: "REVIEW.md is missing",
      next: "rerun 'cloop init' to seed it, then onboard drafts the project's review rules" }
    : REVIEW_PLACEHOLDERS.some((placeholder) => review.includes(placeholder))
      ? { id: "review-rules", level: "info", detail: "REVIEW.md is the generic template; reviews do not know this project's risks",
        next: "onboard drafts review rules from the project's sensitive areas, lessons, and incidents for you to confirm" }
      : { id: "review-rules", level: "ok", detail: "REVIEW.md has project review rules", next: null });
  return rows;
}
