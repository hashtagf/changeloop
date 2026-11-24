// Which repositories to onboard first in a large topology. Onboarding is per
// repository: the agent proposes a short ranked list and the user picks, so
// nobody is asked to choose among hundreds of names. Read-only and cheap: it
// looks at marker files and top-level directory names, never a full scan.
//
// Signals, strongest first:
//   changed   how many recorded changes selected the repository (work happens here)
//   risk      a name that suggests auth, payments, or personal data
//   tooling   a lint or type checker is already declared (onboarding pays off at once)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RISK = /(^|[-_/])(auth|login|session|token|payment|payments|billing|checkout|invoice|wallet|security|permission|permissions|acl|admin|account|accounts|user|users|profile|privacy|pii)([-_/]|$)/i;
const SHOWN = 5;

function text(path) {
  try { return readFileSync(path, "utf8"); } catch { return ""; }
}

function names(path) {
  try { return readdirSync(path); } catch { return []; }
}

export function repositoryTooling(path) {
  const found = [];
  const manifest = text(join(path, "package.json"));
  if (/"eslint"/.test(manifest)) found.push("eslint");
  if (/"typescript"/.test(manifest) && existsSync(join(path, "tsconfig.json"))) found.push("typescript");
  const python = ["pyproject.toml", "setup.cfg", "ruff.toml", "mypy.ini"].map((name) => text(join(path, name))).join("\n");
  if (/\[tool\.ruff|ruff/.test(python) || existsSync(join(path, "ruff.toml"))) found.push("ruff");
  if (/\[tool\.mypy|\[mypy\]/.test(python) || existsSync(join(path, "mypy.ini"))) found.push("mypy");
  if ([".golangci.yml", ".golangci.yaml", ".golangci.toml", ".golangci.json"].some((name) => existsSync(join(path, name))))
    found.push("golangci-lint");
  if (existsSync(join(path, "go.mod"))) found.push("go vet");
  return found;
}

function riskHints(repository) {
  const candidates = [repository.id, ...names(repository.path), ...names(join(repository.path, "src"))];
  return [...new Set(candidates.filter((name) => RISK.test(name)))].slice(0, 3);
}

/**
 * @param {{ repositories: Array<{ id: string, path: string, mode?: string, type?: string }>,
 *   onboarded: Set<string>, changed?: Map<string, number>, limit?: number }} input
 */
export function onboardingCandidates({ repositories, onboarded, changed = new Map(), limit = SHOWN }) {
  // The control root of a multi-repository topology only gathers repositories.
  const writable = repositories.filter((repository) => repository.mode !== "read" &&
    repository.type !== "external" && !(repository.type === "root" && repositories.length > 1));
  const rows = writable.filter((repository) => !onboarded.has(repository.id)).map((repository) => {
    const changes = changed.get(repository.id) || 0;
    const risk = riskHints(repository);
    const tooling = repositoryTooling(repository.path);
    const reasons = [
      ...(changes ? [`${changes} change(s) worked here`] : []),
      ...(risk.length ? [`sensitive area: ${risk.join(", ")}`] : []),
      ...(tooling.length ? [`checks ready: ${tooling.join(", ")}`] : [])
    ];
    return { id: repository.id, score: changes * 100 + (risk.length ? 10 : 0) + tooling.length, reasons };
  }).sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
  return {
    total: writable.length,
    onboarded: writable.filter((repository) => onboarded.has(repository.id)).length,
    candidates: rows.slice(0, limit).map(({ id, reasons }) => ({ id, reasons: reasons.length ? reasons : ["no signal yet"] })),
    remaining: Math.max(0, rows.length - limit)
  };
}

// How many recorded changes selected each repository, from runtime states.
export function changesPerRepository(states) {
  const counts = new Map();
  for (const state of states)
    for (const id of Object.keys(state?.repositories || {})) counts.set(id, (counts.get(id) || 0) + 1);
  return counts;
}
