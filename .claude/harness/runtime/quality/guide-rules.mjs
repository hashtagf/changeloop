// Rule sentences in a project's agent guides: imperative sentences (must,
// never, always, do not, only, requires) outside code blocks, tables, and
// headings. A sentence is registered when a quality/rule-enforcement.json
// quote from the same guide lies inside it or contains it; the rest are rules
// no registry row accounts for yet.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const GUIDE_FILES = Object.freeze(["CLAUDE.md", "AGENTS.md"]);
const IMPERATIVE = /\b(?:must|never|always|do not|don't|only|requires?)\b/i;
const normalize = (text) => String(text).replace(/\s+/g, " ").trim();

export function ruleSentences(markdown) {
  const prose = String(markdown).replace(/```[\s\S]*?```/g, "\n\n");
  return prose.split(/\n\s*\n/)
    .filter((block) => !/^\s*(?:#|\|)/.test(block))
    .flatMap((block) => normalize(block.replace(/^\s*(?:[-*]|\d+\.)\s+/gm, "")).split(/(?<=[.;:])\s+(?=[A-Z`*])/))
    .map(normalize)
    // A sentence ending in ':' introduces a list; the list items carry the rules.
    .filter((sentence) => sentence.length >= 12 && !sentence.endsWith(":") && IMPERATIVE.test(sentence));
}

// Each guide's rule sentences that no registry quote covers.
export function unregisteredRuleSentences(root, registry, files = GUIDE_FILES) {
  const rows = [];
  for (const file of files) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    const quotes = (registry?.rules || []).filter((rule) => rule.source === file)
      .map((rule) => normalize(rule.quote)).filter(Boolean);
    for (const sentence of ruleSentences(readFileSync(path, "utf8")))
      if (!quotes.some((quote) => sentence.includes(quote) || quote.includes(sentence)))
        rows.push({ source: file, sentence });
  }
  return rows;
}
