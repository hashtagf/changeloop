// A draft `module-boundaries` lane read from a project's real imports, so an
// agent onboarding the project proposes boundaries the user only confirms
// instead of declaring them from memory. Read-only and JavaScript/TypeScript
// only (with Vue, Svelte, and Astro components), like the lane it drafts:
// relative imports plus path aliases such as `~/` and `@/`, read from
// tsconfig/jsconfig `paths` or, when a project uses them without one,
// guessed from its layout and marked for the user to confirm.
//
// Modules are the directories directly under the source root: descend while
// a single directory holds every nested non-test source file (loose files such
// as root configs do not count). Hidden directories are tooling or generated
// output, not modules. The draft allows
// every dependency direction the code already has, so adopting it starts with
// no violations and stops new directions; each import cycle is listed as a
// decision for the user, never resolved silently.
import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { moduleBoundaryFindings } from "./findings-ratchet.mjs";
import { SOURCE_EXTENSIONS, sourceFiles } from "./source-scan.mjs";

const COMPONENT_EXTENSIONS = Object.freeze([".vue", ".svelte", ".astro"]);
const GUESSED_PREFIXES = Object.freeze(["~/", "@/"]);

const TEST_PATH = /(^|\/)(test|tests|__tests__|spec|specs|e2e|fixtures|__mocks__)\/|\.(test|spec)\.[^/]+$/;
const MAXIMUM_MODULES = 30;
// Tests may import any module they exercise; the drafted lane does not judge them.
const TEST_GLOBS = Object.freeze(["**/test/**", "**/tests/**", "**/__tests__/**", "**/spec/**", "**/e2e/**",
  "**/fixtures/**", "**/__mocks__/**", "**/*.test.*", "**/*.spec.*"]);

function moduleName(directory) {
  return directory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function subdirectories(files, base) {
  return [...new Set(files.filter((path) => path.startsWith(base))
    .map((path) => path.slice(base.length).split("/")).filter((parts) => parts.length > 1)
    .map((parts) => parts[0]))].sort();
}

// The source root as "a/b/" or "".
function sourceRoot(files) {
  let base = "";
  for (let directories = subdirectories(files, base); directories.length === 1; directories = subdirectories(files, base))
    base += `${directories[0]}/`;
  return base;
}

// Strongly connected groups of more than one module: each is a cycle the user
// decides how to break.
function cycles(names, edges) {
  const next = new Map(names.map((name) => [name, edges.filter((edge) => edge.from === name).map((edge) => edge.to)]));
  const reaches = (from, to) => {
    const seen = new Set([from]);
    const queue = [from];
    while (queue.length) {
      const current = queue.shift();
      for (const target of next.get(current) || []) {
        if (target === to) return true;
        if (!seen.has(target)) { seen.add(target); queue.push(target); }
      }
    }
    return false;
  };
  const groups = [];
  const placed = new Set();
  for (const name of names) {
    if (placed.has(name)) continue;
    const group = names.filter((other) => other === name || (reaches(name, other) && reaches(other, name)));
    group.forEach((member) => placed.add(member));
    if (group.length > 1) groups.push(group);
  }
  return groups;
}

function jsonc(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\/|(^|[^:"'])\/\/.*$/gm, "$1")
      .replace(/,\s*([}\]])/g, "$1"));
  } catch { return null; }
}

// Wildcard `paths` ("~/*": ["./src/*"]) as prefix -> repository path.
export function configuredAliases(root) {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const options = jsonc(join(root, name))?.compilerOptions;
    if (!options?.paths) continue;
    const base = options.baseUrl || ".";
    const aliases = {};
    for (const [key, targets] of Object.entries(options.paths)) {
      const target = Array.isArray(targets) ? targets[0] : null;
      if (!key.endsWith("/*") || typeof target !== "string" || !target.endsWith("*")) continue;
      const path = posix.normalize(posix.join(base, target.slice(0, -1)));
      if (path.startsWith("..")) continue;
      aliases[key.slice(0, -1)] = path === "." || path === "./" ? "" : path.replace(/\/?$/, "/");
    }
    if (Object.keys(aliases).length) return { aliases, source: name };
  }
  return null;
}

// Monorepo workspace packages by name: `@acme/core` imports the package whose
// package.json sits under the repository root, not the root manifest itself.
export function workspaceAliases(root) {
  const aliases = {};
  for (const path of sourceFiles(root, { extensions: [".json"] })) {
    if (posix.basename(path) !== "package.json" || path === "package.json" || TEST_PATH.test(path)) continue;
    const name = jsonc(join(root, path))?.name;
    if (typeof name === "string" && /^(@[\w.-]+\/)?[\w.-]+$/.test(name)) aliases[name] = `${posix.dirname(path)}/`;
  }
  return aliases;
}

// A `~/` or `@/` prefix the code uses with no configured alias: Nuxt's source
// directory, else src/, else app/, else the root.
function guessedAliases(root, files) {
  const texts = files.slice(0, 2000).map((path) => {
    try { return readFileSync(join(root, path), "utf8"); } catch { return ""; }
  });
  const used = GUESSED_PREFIXES.filter((prefix) =>
    texts.some((text) => text.includes(`"${prefix}`) || text.includes(`'${prefix}`)));
  if (!used.length) return null;
  const target = ["src", "app"].find((name) => existsSync(join(root, name))) || "";
  return { aliases: Object.fromEntries(used.map((prefix) => [prefix, target ? `${target}/` : ""])),
    source: "guessed from the layout; confirm with the user" };
}

export function proposeModuleBoundaries(root) {
  const components = sourceFiles(root, { extensions: [...COMPONENT_EXTENSIONS] }).length > 0;
  const extensions = components ? [...SOURCE_EXTENSIONS, ...COMPONENT_EXTENSIONS] : null;
  const files = sourceFiles(root, extensions ? { extensions } : {})
    .filter((path) => !TEST_PATH.test(path) && !/(^|\/)\./.test(path));
  if (!files.length) return { status: "not-applicable", reason: "no JavaScript or TypeScript source outside tests" };
  const base = sourceRoot(files);
  const directories = subdirectories(files, base);
  const modules = [];
  const names = new Set();
  for (const directory of directories) {
    const name = moduleName(directory);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name) || names.has(name)) continue;
    names.add(name);
    modules.push({ name, paths: [`${base}${directory}/**`] });
  }
  if (modules.length < 2) return { status: "not-applicable",
    reason: `source under ${base || "the repository root"} is not split into at least two directories` };
  if (modules.length > MAXIMUM_MODULES) return { status: "not-applicable",
    reason: `${modules.length} directories under ${base || "the root"}; too many to propose as modules, declare them by hand` };
  const resolved = configuredAliases(root) || guessedAliases(root, files);
  const packages = workspaceAliases(root);
  const aliases = { ...packages, ...resolved?.aliases };
  const scope = { exclude: [...TEST_GLOBS], ...(extensions ? { extensions } : {}),
    ...(Object.keys(aliases).length ? { aliases } : {}) };
  const counts = new Map();
  for (const finding of moduleBoundaryFindings(root, { modules, allow: {}, ...scope })) {
    const [from, to] = finding.rule.slice("boundary/".length).split("->");
    const key = `${from}->${to}`;
    counts.set(key, { from, to, imports: (counts.get(key)?.imports || 0) + 1 });
  }
  const edges = [...counts.values()].sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));
  const allow = {};
  for (const edge of edges) (allow[edge.from] ||= []).push(edge.to);
  return {
    status: "proposed",
    sourceRoot: base || ".",
    provider: { kind: "builtin", adapter: "module-boundaries", isolation: "read-only", modules, allow, ...scope },
    aliasSource: [resolved?.source, Object.keys(packages).length ? "workspace package names" : null]
      .filter(Boolean).join("; ") || null,
    edges,
    cycles: cycles(modules.map((module) => module.name), edges),
    note: "allow lists today's import directions, so the lane starts clean and fails only a new direction; " +
      "confirm the modules with the user, and ask which direction of each cycle should go"
  };
}
