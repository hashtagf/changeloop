import { existsSync, readFileSync, readdirSync } from "node:fs";
import { delimiter, extname, join, relative } from "node:path";
import {
  capabilityNamesForProfiles, languagesForProfiles, markerNames, profileDefinition, profilesForInventory
} from "./language-profiles.mjs";
import {
  requiredControlsForProfiles, semanticFaultsForProfiles
} from "./semantic-fault-catalog.mjs";
import { proposeModuleBoundaries } from "./module-boundary-proposal.mjs";
import { moduleLanes } from "./module-lanes-discovery.mjs";
import {
  installedRunnerCommand, knownTestFileCount, testCommandProposals, testSetupProposal
} from "./test-gap-discovery.mjs";
import { gitIgnored, nestedRepository } from "./source-scan.mjs";

const EXCLUDED = new Set([
  ".git", ".claude", ".foundation", "node_modules", "vendor", "target", "dist", "build",
  "coverage", "test-results", ".venv", "venv", "__pycache__"
]);
const EXCLUDED_PATHS = new Set(["openspec/changes/archive"]);
const BASE_MARKERS = ["phpunit.xml", "phpunit.xml.dist"];

export function inventoryRepository(root, { maximumFiles = 10000, projectPacks = [] } = {}) {
  const MARKERS = new Set([...BASE_MARKERS, ...markerNames(projectPacks)]);
  const files = [];
  const extensions = new Set();
  const markers = new Set();
  let truncated = false;
  // Build output the repository ignores (.nuxt/, .next/) is not its source.
  const ignored = gitIgnored(root);
  const walk = (directory) => {
    if (truncated) return;
    let entries = [];
    try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (EXCLUDED.has(entry.name)) continue;
      const absolute = join(directory, entry.name);
      const path = relative(root, absolute).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        // Another repository (sibling or submodule) is discovered on its own.
        if (!EXCLUDED_PATHS.has(path) && !nestedRepository(absolute) && !ignored(path, true)) walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      if (files.length >= maximumFiles) { truncated = true; return; }
      files.push(path);
      const extension = extname(entry.name).toLowerCase();
      if (extension) extensions.add(extension);
      if (MARKERS.has(entry.name)) markers.add(path);
    }
  };
  walk(root);
  return { files, extensions: [...extensions].sort(), markers: [...markers].sort(), truncated };
}

function jsonAt(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function commandProvider(command, extra = {}) {
  return { kind: "command", command, isolation: "read-only", ...extra };
}

function findingsProvider(adapter, command) {
  return { kind: "builtin", adapter, isolation: "read-only", command, inputs: { report: "-" } };
}

function textAt(root, name) {
  try { return readFileSync(join(root, name), "utf8"); } catch { return ""; }
}

// Python tools are proposed only when the project declares them: a config
// section or file, or a dependency line. A stray script is not a test suite.
function pythonDeclares(root, tool, { files = [], sections = [] } = {}) {
  if (files.some((name) => existsSync(join(root, name)))) return true;
  const configs = ["pyproject.toml", "setup.cfg", "tox.ini"].map((name) => textAt(root, name)).join("\n");
  if (sections.some((section) => configs.includes(section))) return true;
  const requirements = readdirSync(root).filter((name) => /^requirements.*\.(txt|in)$/.test(name))
    .map((name) => textAt(root, name)).join("\n");
  const pattern = new RegExp(`(^|[\\s"'\\[,])${tool}([\\s<>=~!;\\["',]|$)`, "m");
  return pattern.test(requirements) || pattern.test(textAt(root, "pyproject.toml"));
}

// `python` where it is installed, else `python3` (macOS and many Linux images
// ship only python3). Bytecode goes under .foundation, which the installer
// ignores, so a test or compile run leaves the repository status unchanged.
function pythonCommand(args, path = process.env.PATH || "") {
  const onPath = (name) => path.split(delimiter).some((directory) => directory && existsSync(join(directory, name)));
  const python = onPath("python") || !onPath("python3") ? "python" : "python3";
  return [python, "-X", "pycache_prefix=.foundation/quality/pycache", ...args];
}

const GOLANGCI_CONFIGS = [".golangci.yml", ".golangci.yaml", ".golangci.toml", ".golangci.json"];

// golangci-lint v2 configs declare version "2" and take a different JSON flag.
function golangciCommand(root) {
  const config = GOLANGCI_CONFIGS.map((name) => textAt(root, name)).find(Boolean) || "";
  return /version\s*[:=]\s*["']?2/.test(config)
    ? ["golangci-lint", "run", "--output.json.path", "stdout", "./..."]
    : ["golangci-lint", "run", "--out-format", "json", "./..."];
}

// The scope flags of the project's own eslint script: ESLint 7 and 8 lint only
// .js unless told `--ext`, so a Vue project's lane would skip every .vue, and
// `--ignore-path` keeps build output out the way the project does.
export function eslintScopeArgs(scripts = {}) {
  for (const script of Object.values(scripts)) {
    const call = /\beslint\b([^&|;]*)/.exec(String(script))?.[1];
    if (!call) continue;
    const flag = (name) => new RegExp(`${name}[ =]("[^"]+"|'[^']+'|\\S+)`).exec(call)?.[1].replace(/^["']|["']$/g, "");
    const args = [];
    for (const name of ["--ext", "--ignore-path"]) if (flag(name)) args.push(name, flag(name));
    if (args.length) return args;
  }
  return [];
}

// A test lane from the project's test script: `test`, else `test:unit`, else
// a declared Jest or Vitest run directly.
function testCommand(scripts, dependencies) {
  if (scripts.test) return ["npm", "test"];
  if (scripts["test:unit"]) return ["npm", "run", "test:unit"];
  if (dependencies.vitest) return ["npx", "--no-install", "vitest", "run"];
  if (dependencies.jest) return ["npx", "--no-install", "jest"];
  return null;
}

// Why a type checker does not apply, or null when it does: a JavaScript
// project without TypeScript, `checkJs`, Go, or Python has no type checker to
// ratchet, so its type-check criteria are not applicable rather than unmet.
export function typeCheckExemption(root) {
  const manifest = jsonAt(join(root, "package.json"));
  if (!manifest) return null;
  const declared = { ...manifest.dependencies, ...manifest.devDependencies };
  const checkJs = ["jsconfig.json", "tsconfig.json"].some((name) =>
    /"checkJs"\s*:\s*true/.test(readFileSafe(join(root, name))));
  const typed = declared.typescript || existsSync(join(root, "tsconfig.json")) || checkJs ||
    ["go.mod", "pyproject.toml", "mypy.ini"].some((name) => existsSync(join(root, name)));
  return typed ? null : "JavaScript without TypeScript or checkJs";
}

function readFileSafe(path) {
  try { return readFileSync(path, "utf8"); } catch { return ""; }
}

function onPath(name, path) {
  return path.split(delimiter).some((directory) => directory && existsSync(join(directory, name)));
}

// A pack's first candidate whose required files are at the root and whose
// executable is installed (a ./wrapper counts when it exists). A pack is
// proposed only for a repository it roots: its marker, or for an
// extension-only pack a matching file, at the top level. Nothing is guessed
// for a tool the machine does not have.
function packProviders(root, profiles, projectPacks, path) {
  let top = [];
  try { top = readdirSync(root); } catch { return {}; }
  const providers = {};
  for (const name of profiles) {
    const pack = profileDefinition(name, projectPacks);
    if (!pack || !Object.keys(pack.commands).length) continue;
    const rooted = pack.markers.length ? pack.markers.some((marker) => top.includes(marker))
      : top.some((file) => pack.extensions.includes(extname(file).toLowerCase()));
    if (!rooted) continue;
    for (const [capability, candidates] of Object.entries(pack.commands)) {
      const chosen = candidates.find((candidate) =>
        (candidate.requires || []).every((file) => existsSync(join(root, file))) &&
        (candidate.command[0].includes("/") ? existsSync(join(root, candidate.command[0])) : onPath(candidate.command[0], path)));
      if (chosen) providers[capability] ||= commandProvider([...chosen.command]);
    }
  }
  return providers;
}

export function detectedProviders(root, profiles, { projectPacks = [], path = process.env.PATH || "" } = {}) {
  const providers = {};
  const packageJson = jsonAt(join(root, "package.json"));
  const scripts = packageJson?.scripts || {};
  if (profiles.includes("application-js-ts")) {
    const declared = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    const test = testCommand(scripts, declared);
    if (test) providers.test = commandProvider(test);
    if (scripts.typecheck) providers["static-analysis"] = commandProvider(["npm", "run", "typecheck"]);
    else if (scripts.lint) providers["static-analysis"] = commandProvider(["npm", "run", "lint"]);
    const crapScript = scripts["foundation:quality:crap"]
      ? "foundation:quality:crap" : scripts["quality:crap"] ? "quality:crap" : null;
    if (crapScript) providers.crap = commandProvider(["npm", "run", crapScript], {
      protocol: "foundation-crap-v1", output: ".foundation/quality/crap.json"
    });
    const dependencies = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    if (dependencies.typescript && existsSync(join(root, "tsconfig.json")))
      providers["type-check"] = { kind: "builtin", adapter: "tsc-text", isolation: "read-only",
        command: ["npx", "--no-install", "tsc", "--noEmit", "--pretty", "false"], inputs: { report: "-" } };
    if (dependencies.eslint) {
      providers.lint = { kind: "builtin", adapter: "eslint-json", isolation: "read-only",
        command: ["npx", "--no-install", "eslint", ".", ...eslintScopeArgs(scripts), "-f", "json"],
        inputs: { report: "-" } };
    }
    if (scripts["foundation:quality:mutation"]) providers["automated-mutation"] = commandProvider(["npm", "run", "foundation:quality:mutation"], {
      protocol: "foundation-automated-mutation-v1", output: ".foundation/quality/mutation.json", isolation: "tool"
    });
  }
  // `go test ./...` needs a module or workspace at the root; a repository of
  // Go modules in subdirectories gets per-module lanes instead.
  if (profiles.includes("application-go") && ["go.mod", "go.work"].some((name) => existsSync(join(root, name)))) {
    providers.test ||= commandProvider(["go", "test", "./..."]);
    providers["static-analysis"] ||= commandProvider(["go", "vet", "./..."]);
    // The compiler is Go's type checker; vet prints compile and vet errors on stderr.
    providers["type-check"] ||= findingsProvider("go-vet-text", ["sh", "-c", "go vet ./... 2>&1"]);
    if (GOLANGCI_CONFIGS.some((name) => existsSync(join(root, name))))
      providers.lint ||= findingsProvider("golangci-json", golangciCommand(root));
  }
  if (profiles.includes("application-python")) {
    if (pythonDeclares(root, "pytest", { files: ["pytest.ini", "conftest.py"], sections: ["[tool.pytest", "[pytest]", "[tool:pytest]"] }))
      providers.test ||= commandProvider(pythonCommand(["-m", "pytest"]));
    const pyproject = existsSync(join(root, "pyproject.toml"));
    if (pyproject) providers["static-analysis"] ||= commandProvider(pythonCommand(["-m", "compileall", "-q", "."]));
    if (pythonDeclares(root, "ruff", { files: ["ruff.toml", ".ruff.toml"], sections: ["[tool.ruff"] }))
      providers.lint ||= findingsProvider("ruff-json", pythonCommand(["-m", "ruff", "check", ".", "--output-format", "json"]));
    if (pythonDeclares(root, "mypy", { files: ["mypy.ini", ".mypy.ini"], sections: ["[tool.mypy", "[mypy]"] }))
      providers["type-check"] ||= findingsProvider("mypy-text",
        pythonCommand(["-m", "mypy", ".", "--no-error-summary", "--no-pretty"]));
  }
  if (profiles.includes("application-php")) {
    const composer = jsonAt(join(root, "composer.json"));
    if (composer?.scripts?.test) providers.test ||= commandProvider(["composer", "test"]);
    if (composer?.scripts?.analyse) providers["static-analysis"] ||= commandProvider(["composer", "analyse"]);
  }
  // Packs fill only what the language-specific discovery above left empty.
  for (const [capability, provider] of Object.entries(packProviders(root, profiles, projectPacks, path)))
    providers[capability] ||= provider;
  // Every application profile gets the tool-free ratchets: an ever-growing
  // file, a stopgap marker comment, and a copied block are what an agent copies first.
  if (profiles.some((profile) => profile.startsWith("application-")))
    for (const adapter of ["file-size", "workaround-comments", "duplication", "nesting-depth"])
      providers[adapter] = { kind: "builtin", adapter, isolation: "read-only" };
  return providers;
}

function mongoProfile(root, inventory, profiles) {
  const manifests = inventory.markers.filter((path) =>
    ["package.json", "go.mod", "pyproject.toml", "requirements.txt", "composer.json"]
      .includes(path.split("/").at(-1)));
  const mentionsMongo = manifests.some((path) => {
    try { return /mongodb|mongoose|pymongo|mongo-driver/i.test(readFileSync(join(root, path), "utf8")); }
    catch { return false; }
  });
  return mentionsMongo && !profiles.includes("database-mongodb")
    ? [...profiles, "database-mongodb"].sort() : profiles;
}

export function discoverRepositoryQuality(repository, projectPacks = []) {
  const inventory = inventoryRepository(repository.path, { projectPacks });
  let profiles = profilesForInventory({ files: inventory.markers, extensions: inventory.extensions }, projectPacks);
  profiles = mongoProfile(repository.path, inventory, profiles);
  const rootProviders = detectedProviders(repository.path, profiles, { projectPacks });
  const modules = moduleLanes({ root: repository.path, markers: inventory.markers, rootProviders,
    profilesFor: (files) => profilesForInventory({ files, extensions: [] }, projectPacks),
    detect: (path, moduleProfiles) => detectedProviders(path, moduleProfiles, { projectPacks }) });
  const providers = { ...rootProviders, ...modules.providers };
  // No test lane: tell "no tests" from "tests discovery missed".
  const hasTestLane = () => Object.keys(providers).some((key) => key === "test" || key.startsWith("test:"));
  const testFiles = hasTestLane() ? null : knownTestFileCount(repository.path, profiles);
  const testGap = {};
  if (testFiles) {
    const runner = profiles.includes("application-js-ts") ? installedRunnerCommand(repository.path) : null;
    if (runner) providers.test = commandProvider(runner);
  }
  if (!hasTestLane()) {
    const commands = testCommandProposals(repository.path);
    if (commands.length) testGap["test-commands"] = commands;
    const setup = testFiles === 0 ? testSetupProposal(profiles) : null;
    if (setup) testGap["test-setup"] = setup;
  }
  const applicable = capabilityNamesForProfiles(profiles, projectPacks);
  const laneFor = (capability) => providers[capability] ||
    Object.entries(providers).find(([key]) => key.startsWith(`${capability}:`))?.[1];
  const capabilities = Object.fromEntries(applicable.map((capability) => [capability,
    laneFor(capability)
      ? { status: "available", adapter: laneFor(capability).kind,
        tool: laneFor(capability).command?.[0] || "builtin" }
      : { status: "unsupported", reason: `no configured or safely detected ${capability} provider` }
  ]));
  return {
    protocol: "foundation-quality-capabilities-v1",
    repository: repository.id,
    root: repository.relativePath || ".",
    languages: languagesForProfiles(profiles, projectPacks), profiles, capabilities, providers,
    requiredControls: requiredControlsForProfiles(profiles),
    recommendedSemanticFaults: semanticFaultsForProfiles(profiles),
    ...(modules.modules.length ? { modules: modules.modules, modulesTruncated: modules.modulesTruncated } : {}),
    // Absent with a test lane; null when the count cannot say "no tests".
    ...(!hasTestLane() || testFiles ? { testFiles } : {}),
    // Drafts that need the user's confirmation, never written by `quality init`.
    ...(profiles.includes("application-js-ts") || Object.keys(testGap).length
      ? { proposals: { ...(profiles.includes("application-js-ts")
        ? { "module-boundaries": proposeBoundaries(repository.path) } : {}), ...testGap } } : {}),
    inventory: { files: inventory.files.length, truncated: inventory.truncated,
      markers: inventory.markers, extensions: inventory.extensions }
  };
}

function proposeBoundaries(root) {
  try { return proposeModuleBoundaries(root); }
  catch (error) { return { status: "unavailable", reason: error.message }; }
}

export function discoverConsumerQuality(repositories, projectPacks = []) {
  return {
    protocol: "foundation-quality-discovery-v1",
    generatedAt: new Date().toISOString(),
    repositories: repositories.map((repository) => discoverRepositoryQuality(repository, projectPacks))
  };
}
