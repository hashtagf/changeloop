import { spawnSync } from "node:child_process";
import {
  copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync,
  symlinkSync, writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { providerExecutionEnvironment } from "./adapter-runtime.mjs";
import { providerTimeoutMs } from "./provider-catalog.mjs";
import { environmentIdentity, taskCheckArgv } from "./task-check-evidence.mjs";
import { spawnCapturedAsync } from "./configured-reviewer.mjs";
import { scopeAllowsPath } from "../core/graph-execution.mjs";
import { buildCopyScratch, copyBaseIdentity, copyChangedPaths } from "./copy-base-tree.mjs";
// Work whose tests should pass before and after the change.
import { BEHAVIOR_NEUTRAL_WORK } from "../contracts/work-types.mjs";

// Test discrimination: a passing test suite proves a behavior change only when
// at least one of the change's tests fails without it. For behavior-changing
// work, each repository with changed product code runs its test provider's
// command once against the base (pre-change) source with the change's test
// files laid over it, in a private scratch directory outside the sandbox and
// the user's target. A test that imports a module the change adds fails on
// base and therefore counts. A clean pass on base means the new tests do not
// verify the change: the agent repairs them. The base run is cached by the
// digest of everything it read, so an unchanged rerun repeats nothing.
export const TEST_DISCRIMINATION_VERSION = 1;


export function behaviorChangingWork(workTypes) {
  const types = (workTypes || []).map((type) => String(type || "").trim().toLowerCase())
    .filter(Boolean);
  return types.length > 0 && types.some((type) => !BEHAVIOR_NEUTRAL_WORK.has(type));
}

// Installed dependencies are ignored by Git, so the base archive lacks them.
// They are linked (never copied or written) from the sandbox.
const DEPENDENCY_DIRECTORIES = ["node_modules", ".venv", "venv"];

const NODE_VALUE_FLAGS = new Set([
  "--test-reporter", "--test-reporter-destination", "--test-name-pattern",
  "--test-skip-pattern", "--test-concurrency", "--test-timeout", "--import", "--require",
  "-r", "--loader", "--experimental-loader", "--conditions", "-C", "--env-file"
]);
const PYTEST_VALUE_FLAGS = new Set([
  "-k", "-m", "-p", "-c", "-o", "-W", "--rootdir", "--tb", "--maxfail", "--confcutdir",
  "--junitxml", "--junit-xml", "--basetemp", "--override-ini"
]);
const GO_VALUE_FLAGS = new Set([
  "-run", "-skip", "-count", "-timeout", "-tags", "-p", "-parallel", "-bench", "-cpu",
  "-coverprofile", "-covermode", "-coverpkg", "-exec", "-ldflags", "-gcflags", "-mod", "-o"
]);

// The options of a test command without its positional targets.
function optionTokens(args, valueFlags) {
  const kept = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("-")) continue;
    kept.push(arg);
    if (!arg.includes("=") && valueFlags.has(arg) && index + 1 < args.length)
      kept.push(args[(index += 1)]);
  }
  return kept;
}

// A compiled provider's own task verifies (`segments`) from the first through
// the last one that names a changed test file, as one command. Earlier
// segments stay because one may be setup (a build or codegen) a later test
// needs; only segments after the last named test are dropped. Every changed
// test must be named within that prefix; otherwise (or with no segments) this
// returns null and the whole provider command runs. A prefix of one segment
// is narrowed only to the files it names itself.
export function segmentTestCommand(config, files) {
  const segments = Array.isArray(config?.segments) ? config.segments.map(String) : [];
  if (!segments.length || !files?.length) return null;
  const names = (segment, file) => segment.includes(file);
  let last = -1;
  segments.forEach((segment, index) => {
    if (files.some((file) => names(segment, file))) last = index;
  });
  const chosen = segments.slice(0, last + 1);
  if (!chosen.length || files.some((file) => !chosen.some((segment) => names(segment, file))))
    return null;
  if (chosen.length === 1) {
    const own = files.filter((file) => names(chosen[0], file));
    return scopedTestCommand({ command: "sh", args: ["-c", chosen[0]] }, own) ||
      { command: "sh", args: ["-c", chosen[0]] };
  }
  return { command: "sh", args: ["-c", chosen.map((segment) => `(${segment})`).join(" && ")] };
}

// The provider command narrowed to the given test files, or null when its
// runner does not take file arguments (the whole command then runs once).
export function scopedTestCommand(built, files) {
  if (!built?.command || !files?.length) return null;
  const program = basename(String(built.command)).replace(/\.exe$/i, "");
  const args = (built.args || []).map(String);
  if (program === "sh" && args.length === 2 && args[0] === "-c") {
    // Compiled task providers use sh -c even for a plain runner. Reuse the
    // conservative parser: expansions, pipes, redirects and assignments keep
    // their full command rather than silently changing its meaning.
    const argv = taskCheckArgv(args[1]);
    return argv ? scopedTestCommand({ command: argv[0], args: argv.slice(1) }, files) : null;
  }
  if (program === "node" && args.includes("--test"))
    return { command: built.command, args: [...optionTokens(args, NODE_VALUE_FLAGS), ...files] };
  if (program === "pytest" || program === "py.test")
    return { command: built.command, args: [...optionTokens(args, PYTEST_VALUE_FLAGS), ...files] };
  if (/^python[\d.]*$/.test(program) && args[0] === "-m" && args[1] === "pytest")
    return { command: built.command,
      args: ["-m", "pytest", ...optionTokens(args.slice(2), PYTEST_VALUE_FLAGS), ...files] };
  if (program === "go" && args[0] === "test") {
    const packages = [...new Set(files.map((file) => {
      const directory = dirname(file);
      return directory === "." ? "." : `./${directory}`;
    }))].sort();
    return { command: built.command,
      args: ["test", ...optionTokens(args.slice(1), GO_VALUE_FLAGS), ...packages] };
  }
  return null;
}

// A base run is the change's tests against code that lacks the change, so a
// server or handle the change would close can keep it alive after every test
// has failed (paid lane project-tracker-api waited the full ten-minute
// provider timeout). Bound this advisory check independently. Output before
// a timeout is diagnostic only: it cannot establish the runner's verdict.
export const BASE_RUN_TIMEOUT_MS = 120000;

export function baseRunTimeoutMs(config) {
  return Math.min(providerTimeoutMs(config), BASE_RUN_TIMEOUT_MS);
}

export function baseRunOutcome(result) {
  if (result?.error?.code === "ETIMEDOUT") return "timed-out";
  if (result?.error || result?.status === null || result?.status === undefined) return "unavailable";
  return result.status === 0 ? "passes-on-base" : "fails-on-base";
}

// ---- Scenario binding ---------------------------------------------------------
// Change records which test files prove each scenario (scenarioTestBinding on
// the runtime state). A change compiled before the binding has none and keeps
// the per-repository judgment.

const GLOB = /[*?{}[\]]/;

export function bindingRows(state) {
  const record = state?.scenarioTestBinding;
  return record?.version === 1 && Array.isArray(record.rows) ? record.rows : null;
}

/** Binding rows whose files name or match `file`. */
export function boundScenarios(binding, file) {
  return (binding || []).filter((row) => (row.files || []).some((pattern) =>
    pattern === file || scopeAllowsPath(pattern, file)));
}

/** Literal bound test files that are not files in the workspace, with their scenarios. */
export function missingBoundFiles(binding, workspace) {
  const missing = new Map();
  for (const row of binding || []) for (const path of row.files || []) {
    if (GLOB.test(path) || lstatSync(join(workspace, path), { throwIfNoEntry: false })?.isFile()) continue;
    missing.set(path, [...(missing.get(path) || []), row.scenario]);
  }
  return [...missing].map(([path, scenarios]) => ({ path, scenarios }));
}

const NO_VERDICT = new Set(["timed-out", "unavailable", "test-provider-not-runnable-on-base"]);

/**
 * One repository outcome from its base runs. Aggregated: the single run's
 * outcome. Per file: a passing file bound to a non-regression scenario is a
 * finding even when another file fails on base; files bound only to
 * regression scenarios may pass on base.
 */
export function combineBaseRuns(row, jobs, binding) {
  const files = jobs.flatMap((job) => job.files.map((file) => ({ file, outcome: job.outcome })));
  if (!row.perFile) return { ...row, outcome: jobs[0]?.outcome || "unavailable" };
  const judged = [], undecided = [];
  let fails = false, guard = false, noVerdict = null;
  for (const { file, outcome } of files) {
    if (outcome === "fails-on-base") fails = true;
    else if (NO_VERDICT.has(outcome)) {
      noVerdict ||= outcome;
      undecided.push({ file, reason: outcome });
    }
    else if (outcome === "passes-on-base") {
      const scenarios = boundScenarios(binding, file);
      if (scenarios.length && scenarios.every((scenario) => scenario.regression)) guard = true;
      else if (scenarios.length) judged.push({ file, scenarios: scenarios
        .filter((scenario) => !scenario.regression).map((scenario) => scenario.scenario) });
    }
  }
  if (judged.length) return { ...row, files, outcome: "passes-on-base",
    testFiles: judged.map((entry) => entry.file),
    scenarios: [...new Set(judged.flatMap((entry) => entry.scenarios))] };
  const outcome = fails ? "fails-on-base" : noVerdict || (guard ? "regression-guard" : "passes-on-base");
  // A file without a verdict stays visible even when a sibling fails on base.
  return { ...row, files, outcome, ...(undecided.length ? { undecided } : {}) };
}

export function discriminationFinding(row) {
  const files = row.testFiles || [];
  const base = String(row.baseHead || "").slice(0, 12);
  const scenarios = row.scenarios?.length ? ` (scenario: ${row.scenarios.join("; ")})` : "";
  const message = files.length
    ? `test file(s) ${files.join(", ")}${scenarios} in repository '${row.repositoryId}' pass on the original code (base ${base}), so they do not verify the change; add or strengthen a test that fails without the change and passes with it`
    : `no test in repository '${row.repositoryId}' fails on the original code (base ${base}), so the passing suite does not verify the change; add a test that fails without the change and passes with it`;
  return {
    id: `test-discrimination:${row.repositoryId}`,
    provider: row.provider,
    classification: "product",
    severity: "error",
    rootCause: "tests-pass-on-base",
    message,
    paths: files,
    repositoryId: row.repositoryId
  };
}

export function missingBoundFinding(row) {
  return {
    id: `test-discrimination-missing:${row.repositoryId}`,
    provider: row.provider,
    classification: "product",
    severity: "error",
    rootCause: "bound-test-missing",
    message: `test file(s) bound to scenarios do not exist in repository '${row.repositoryId}': ` +
      row.missingBound.map((entry) => `${entry.path} (scenario: ${entry.scenarios.join("; ")})`).join(", ") +
      "; create each test so it fails without the change and passes with it",
    paths: row.missingBound.map((entry) => entry.path),
    repositoryId: row.repositoryId
  };
}

export function missingProviderFinding(row) {
  return {
    id: `test-discrimination-provider:${row.repositoryId}`,
    provider: null,
    classification: "product",
    severity: "error",
    rootCause: "no-test-provider",
    message: `repository '${row.repositoryId}' changes product code but has no test provider, so no test can show the change differs from the original code; add the test evidence capability for it through a change amendment (cloop change amend --template)`,
    paths: [],
    repositoryId: row.repositoryId
  };
}

export function discriminationFindings(rows) {
  return [
    ...rows.filter((row) => row.outcome === "passes-on-base").map(discriminationFinding),
    ...rows.filter((row) => row.missingBound?.length).map(missingBoundFinding),
    ...rows.filter((row) => row.outcome === "no-test-provider").map(missingProviderFinding)
  ];
}

/** Repositories without a verdict: reported to the user, never a block. */
export function inconclusiveRows(rows) {
  return rows.flatMap((row) => {
    const provider = row.provider ? { provider: row.provider } : {};
    if (row.undecided?.length)
      return row.undecided.map((entry) => ({ repositoryId: row.repositoryId, reason: entry.reason,
        file: entry.file, ...provider }));
    return NO_VERDICT.has(row.outcome)
      ? [{ repositoryId: row.repositoryId, reason: row.outcome, ...provider }] : [];
  });
}

export function inconclusiveLine(row) {
  return `test discrimination (no verdict) in repository '${row.repositoryId}'${
    row.file ? ` for ${row.file}` : ""}: ${row.reason}; ` +
    "the tests were not shown to fail on the original code";
}

export function discriminationStatus(rows) {
  if (rows.some((row) => row.outcome === "passes-on-base" || row.outcome === "no-test-provider" ||
    row.missingBound?.length)) return "fail";
  if (rows.some((row) => ["fails-on-base", "regression-guard"].includes(row.outcome))) return "pass";
  return "not-applicable";
}

function git(args, cwd) {
  return spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

// Paths in the sandbox that differ from base: committed, staged, unstaged,
// and untracked (not ignored).
function dirtyPaths(workspace, baseHead) {
  const tracked = git(["diff", "--name-only", "-z", "--no-renames", baseHead], workspace);
  const untracked = git(["ls-files", "--others", "--exclude-standard", "-z"], workspace);
  if (tracked.status !== 0 || untracked.status !== 0) return null;
  return [...new Set([...tracked.stdout.split("\0"), ...untracked.stdout.split("\0")]
    .filter(Boolean))].sort();
}

// Everything from the sandbox except the change's product code: the base
// tree, plus the change's tests, fixtures, manifests, and carried-in files.
function overlayRows(workspace, dirty, productPaths, fileDigest) {
  const product = new Set(productPaths);
  return dirty.filter((path) => !product.has(path) &&
    !/^(?:\.foundation|openspec\/changes)\//.test(path)).map((path) => {
    const absolute = join(workspace, path);
    const entry = lstatSync(absolute, { throwIfNoEntry: false });
    return { path, digest: entry?.isFile() ? fileDigest(absolute) : entry ? "non-file" : "deleted" };
  });
}

export function buildScratch(workspace, baseHead, overlay) {
  const scratch = mkdtempSync(join(tmpdir(), "foundation-discrimination-"));
  const tree = join(scratch, "base");
  mkdirSync(tree);
  const archive = join(scratch, "base.tar");
  const archived = git(["archive", "--format=tar", "-o", archive, baseHead], workspace);
  const extracted = archived.status === 0
    ? spawnSync("tar", ["-xf", archive, "-C", tree], { encoding: "utf8" }) : archived;
  rmSync(archive, { force: true });
  if (extracted.status !== 0) {
    rmSync(scratch, { recursive: true, force: true });
    return null;
  }
  for (const row of overlay) {
    const target = join(tree, row.path);
    if (row.digest === "deleted") { rmSync(target, { recursive: true, force: true }); continue; }
    if (row.digest === "non-file") continue;
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(workspace, row.path), target);
  }
  for (const name of DEPENDENCY_DIRECTORIES) {
    const source = join(workspace, name);
    if (existsSync(source) && !existsSync(join(tree, name))) symlinkSync(source, join(tree, name));
  }
  return { scratch, tree };
}

// The base source with every non-product sandbox path laid over it (tests,
// fixtures, manifests), in a private scratch directory; null when Git cannot
// describe or archive the base. `isProduct(path)` classifies a changed path.
export function prepareBaseTree(workspace, baseHead, isProduct, fileDigest) {
  const dirty = baseHead && workspace ? dirtyPaths(workspace, baseHead) : null;
  if (!dirty) return null;
  return buildScratch(workspace, baseHead,
    overlayRows(workspace, dirty, dirty.filter(isProduct), fileDigest));
}

export function createTestDiscriminationRuntime({
  root = null, copyBaseBytes = null, LOGS, requiredProviders, providerConfig, providerCapability, providerRepository,
  selectedRepositories, repositoryBaseHead, changedSurface, pathKind, changeWorkTypes,
  receiptValidity, configuredCommand, fileDigest, stableHash, loadRuntime,
  spawnCommandSync = spawnSync, spawnCommandAsync = spawnCapturedAsync, environment = process.env
}) {
  // { provider, config }, { pending }, { ineligible } for a test provider this
  // check cannot run on base (a service, readiness probe, several
  // repositories, or another adapter), or null when the repository has none.
  function testProvider(id, repositoryId, hash) {
    let ineligible = null;
    for (const provider of [...requiredProviders(id)].sort()) {
      const config = providerConfig(id, provider);
      if (providerCapability(provider, config) !== "test") continue;
      const repositories = Array.isArray(config?.repositories) ? config.repositories : [];
      const own = (providerRepository(id, provider, config)?.id || "root") === repositoryId;
      if (!own && !repositories.includes(repositoryId)) continue;
      if (!Array.isArray(config?.command) || !["command", "test-discovery"].includes(config.adapter) ||
          config.service || config.readiness || repositories.length) {
        ineligible ||= provider;
        continue;
      }
      if (!own) continue;
      if (receiptValidity(id, provider, hash).validity !== "valid") return { pending: provider };
      return { provider, config };
    }
    return ineligible ? { ineligible } : null;
  }

  function cachePath(id, key) {
    return join(LOGS, id, "test-discrimination", `${key}.json`);
  }

  function cached(path, key) {
    if (!existsSync(path)) return null;
    try {
      const { digest, ...value } = JSON.parse(readFileSync(path, "utf8"));
      return value.version === TEST_DISCRIMINATION_VERSION && value.key === key &&
        digest === stableHash(value) ? value : null;
    } catch { return null; }
  }

  function record(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify({ ...value, digest: stableHash(value) })}\n`, { mode: 0o600 });
    return value;
  }

  function copyWorkspaceBaseline(repository, state, workspace) {
    if (!root || !workspace || repository.id !== "root" || repositoryBaseHead(repository, state)) return null;
    const recorded = state.workspace;
    if (recorded?.mode !== "copy" || !recorded.baseline) return null;
    return { bytes: recorded.baseline, manifest: recorded.sandboxBaseline || recorded.baseline };
  }

  function evaluateRepository(id, repository, rows, hash, state, asynchronous = false) {
    const base = { repositoryId: repository.id };
    const productPaths = rows.filter((row) => !pathKind(row.path)).map((row) => row.path);
    if (!productPaths.length) return { ...base, outcome: "no-product-change" };
    const selected = testProvider(id, repository.id, hash);
    if (!selected) return { ...base, outcome: "no-test-provider" };
    if (selected.ineligible)
      return { ...base, provider: selected.ineligible, outcome: "test-provider-not-runnable-on-base" };
    if (selected.pending) return { ...base, provider: selected.pending, outcome: "test-evidence-pending" };
    const { provider, config } = selected;
    const workspace = repository.workspacePath;
    // An isolated copy of a project without Git has no base head; its baseline
    // manifest and captured base bytes describe the base instead.
    const copy = copyWorkspaceBaseline(repository, state, workspace);
    const baseHead = copy ? copyBaseIdentity(copy.bytes, productPaths) : repositoryBaseHead(repository, state);
    const dirty = copy ? copyChangedPaths(workspace, copy.manifest)
      : baseHead && workspace ? dirtyPaths(workspace, baseHead) : null;
    if (!dirty) return { ...base, provider, outcome: "unavailable" };
    const testFiles = rows.filter((row) => pathKind(row.path) === "test" &&
      lstatSync(join(workspace, row.path), { throwIfNoEntry: false })?.isFile())
      .map((row) => row.path);
    const built = configuredCommand(provider, config);
    const overlay = overlayRows(workspace, dirty, productPaths, fileDigest);
    const envFrom = Object.fromEntries((config.envFrom || [])
      .filter((name) => environment[name] !== undefined).map((name) => [name, environment[name]]));
    const additions = { ...envFrom, ...(config.env || {}), FOUNDATION_CHANGE_ID: id,
      FOUNDATION_REPOSITORY_ID: repository.id };
    const binding = bindingRows(state);
    // A test file the agreement binds to a scenario must exist when Prove runs.
    const missingBound = binding && repository.id === "root"
      ? missingBoundFiles(binding, workspace) : [];
    // With a binding, each changed test file is judged on its own, so a test
    // that verifies nothing cannot hide behind another file that fails on base.
    // Only possible when the runner takes one file at a time.
    const perFile = binding && testFiles.length ? testFiles.map((file) => ({
      files: [file], command: segmentTestCommand(config, [file]) || scopedTestCommand(built, [file])
    })) : null;
    const usePerFile = Boolean(perFile?.every((job) => job.command));
    const aggregated = segmentTestCommand(config, testFiles) || scopedTestCommand(built, testFiles);
    const jobs = usePerFile ? perFile.map((job) => ({ ...job, scoped: true }))
      : [{ files: testFiles, command: aggregated || { command: built.command, args: built.args },
        scoped: Boolean(aggregated) }];
    const describe = (job) => [job.command.command, ...job.command.args].join(" ");
    const row = { ...base, provider, baseHead, testFiles,
      command: jobs.map(describe).join(" ; "), scoped: jobs.every((job) => job.scoped),
      perFile: usePerFile, ...(missingBound.length ? { missingBound } : {}) };
    const keyOf = (job) => stableHash({
      version: TEST_DISCRIMINATION_VERSION, repositoryId: repository.id, baseHead,
      command: [job.command.command, ...job.command.args], env: config.env || {},
      envFrom: [...(config.envFrom || [])].sort(), overlay, productPaths,
      environment: environmentIdentity(
        providerExecutionEnvironment(environment, additions, workspace), stableHash)
    });
    const planned = jobs.map((job) => {
      const key = keyOf(job);
      const prior = cached(cachePath(id, key), key);
      return { ...job, key, outcome: prior?.outcome, cached: Boolean(prior) };
    });
    const settle = () => combineBaseRuns(row, planned, binding);
    if (planned.every((job) => job.cached)) return { ...settle(), cached: true };
    const prepared = copy ? buildCopyScratch(root, workspace, copy.bytes, productPaths, copyBaseBytes)
      : buildScratch(workspace, baseHead, overlay);
    if (!prepared) {
      for (const job of planned) if (!job.cached) job.outcome = "unavailable";
      return settle();
    }
    /** @type {import("node:child_process").SpawnSyncOptionsWithStringEncoding} */
    const options = {
      cwd: prepared.tree, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
      timeout: baseRunTimeoutMs(config),
      env: providerExecutionEnvironment(environment, additions, prepared.tree)
    };
    const finish = (job, result) => {
      const outcome = baseRunOutcome(result);
      const log = join(LOGS, id, "test-discrimination", `${job.key}.log`);
      mkdirSync(dirname(log), { recursive: true });
      writeFileSync(log, `exit=${result?.status ?? "error"}\n${result?.stdout || ""}${result?.stderr || ""}`);
      // Only a verdict is cached; an unavailable or timed-out run is retried.
      if (["passes-on-base", "fails-on-base"].includes(outcome))
        record(cachePath(id, job.key), { version: TEST_DISCRIMINATION_VERSION, key: job.key,
          changeId: id, ...base, provider, baseHead, testFiles: job.files,
          command: describe(job), scoped: job.scoped, outcome });
      job.outcome = outcome;
    };
    const cleanup = () => rmSync(prepared.scratch, { recursive: true, force: true });
    const pending = planned.filter((job) => !job.cached);
    if (asynchronous) {
      return (async () => {
        try {
          for (const job of pending)
            finish(job, await spawnCommandAsync(job.command.command, job.command.args, options));
          return settle();
        } finally { cleanup(); }
      })();
    }
    try {
      for (const job of pending)
        finish(job, spawnCommandSync(job.command.command, job.command.args, options));
      return settle();
    } finally {
      cleanup();
    }
  }

  // { status: pass|fail|not-applicable, repositories, findings }. Evaluated
  // per writable repository; a failure in any repository is a repair.
  function evaluationInput(id) {
    const workTypes = changeWorkTypes(id);
    if (!behaviorChangingWork(workTypes))
      return { skipped: { version: TEST_DISCRIMINATION_VERSION, status: "not-applicable",
        reason: "behavior-neutral-work", workTypes, repositories: [], findings: [] } };
    const state = loadRuntime(id);
    const surface = changedSurface(id, state);
    return { state, surface, workTypes, selected: selectedRepositories(id, state)
      .filter((repository) => repository.mode !== "read") };
  }

  function evaluationResult(workTypes, repositories) {
    const status = discriminationStatus(repositories);
    return {
      version: TEST_DISCRIMINATION_VERSION, status, workTypes, repositories,
      findings: discriminationFindings(repositories),
      inconclusive: inconclusiveRows(repositories)
    };
  }

  function evaluate(id, workspaceHash) {
    const input = evaluationInput(id);
    if (input.skipped) return input.skipped;
    return evaluationResult(input.workTypes, input.selected.map((repository) =>
      evaluateRepository(id, repository,
        input.surface.filter((row) => row.repositoryId === repository.id), workspaceHash, input.state)));
  }

  async function evaluateAsync(id, workspaceHash) {
    const input = evaluationInput(id);
    if (input.skipped) return input.skipped;
    const repositories = [];
    // Preserve repository order and resource use; only the child execution
    // yields so a configured review can progress beside this check.
    for (const repository of input.selected) repositories.push(await evaluateRepository(id, repository,
      input.surface.filter((row) => row.repositoryId === repository.id), workspaceHash, input.state, true));
    return evaluationResult(input.workTypes, repositories);
  }

  return { evaluate, evaluateAsync };
}
