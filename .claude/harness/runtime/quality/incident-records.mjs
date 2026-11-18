// Incident records under openspec/incidents/: each one is a defect a person or
// a later run caught after the checks above it passed. For the review layer of
// the pyramid, every closed incident must name a regression that exists, so
// the escape becomes a check instead of a memory.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const INCIDENTS_DIRECTORY = "openspec/incidents";
const NOT_RECORDS = new Set(["README.md", "_template.md"]);

function field(markdown, name) {
  const row = String(markdown).split("\n").find((line) => new RegExp(`^\\|\\s*${name}\\s*\\|`, "i").test(line));
  return row ? row.split("|")[2]?.trim() || "" : "";
}

// Paths in backticks that name a file in the project.
function regressionFiles(root, cell) {
  return [...cell.matchAll(/`([^`\s]+)`/g)].map((match) => match[1]).filter((path) => existsSync(join(root, path)));
}

// { total, closed, closedWithRegression, open: [id], missing: [id] } or null
// when the project keeps no incident records.
export function incidentSummary(root) {
  const directory = join(root, INCIDENTS_DIRECTORY);
  if (!existsSync(directory)) return null;
  const records = readdirSync(directory).filter((name) => name.endsWith(".md") && !NOT_RECORDS.has(name)).sort();
  const summary = { total: records.length, closed: 0, closedWithRegression: 0, open: [], missing: [] };
  for (const name of records) {
    const markdown = readFileSync(join(directory, name), "utf8");
    const id = name.replace(/\.md$/, "");
    const status = field(markdown, "Status").toLowerCase();
    if (status === "dismissed") continue;
    if (status !== "closed") { summary.open.push(id); continue; }
    summary.closed += 1;
    if (regressionFiles(root, field(markdown, "Regression")).length) summary.closedWithRegression += 1;
    else summary.missing.push(id);
  }
  return summary;
}
