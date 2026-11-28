import {
  existsSync, mkdirSync, readFileSync, writeFileSync
} from "node:fs";
import { delimiter, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { discoverConsumerQuality } from "./quality-discovery.mjs";
import {
  capabilityRequirement, defaultConsumerQualityConfig, profileCapabilities,
  validateConsumerQualityConfig
} from "./quality-policy.mjs";
import {
  configDigest, normalizeCrapReport, normalizeMutationReport, validateCapabilityReport
} from "./quality-protocol.mjs";
import { runBuiltinQualityAdapter } from "./adapter-registry.mjs";
import { forceExitCommand, lingeringTestRun } from "../core/node-test-exit.mjs";
import { providerCommandHints, slowLaneHint } from "./quality-doctor-hints.mjs";
import { durationPatterns } from "./language-profiles.mjs";
import { laneDirectory, laneFile, laneLabel, lanesOf } from "./quality-lanes.mjs";
import {
  FINDINGS_CAPABILITIES, FINDINGS_PROTOCOL, evaluateFindingsRatchet, normalizeFindingsReport
} from "./findings-ratchet.mjs";
import {
  aggregateQualityLanes, classifyMutationSurfaces, evaluateCrapRatchet,
  evaluateMutationRatchet, pathMatches
} from "./quality-evaluator.mjs";

export const QUALITY_CONFIG_RELATIVE = "quality/foundation-quality.json";
export const QUALITY_RESULT_RELATIVE = ".foundation/quality/results";

function laneShard(repository, capability, count) {
  let hash = 2166136261;
  for (const character of `${repository}\0${capability}`) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % count;
}

function executableExists(command, cwd) {
  if (!command) return false;
  if (command.includes("/") || command.includes("\\"))
    return existsSync(resolve(cwd, command));
  return String(process.env.PATH || "").split(delimiter)
    .some((directory) => existsSync(join(directory, command)));
}

function readJsonFile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function cleanStatus(git, cwd) {
  const result = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"], cwd);
  return result.status === 0 ? result.stdout : null;
}

function safeOutputPath(repository, output, pathInside) {
  const absolute = resolve(repository.path, output);
  if (isAbsolute(output) || !pathInside(repository.path, absolute))
    throw new Error(`quality provider output escapes repository '${repository.id}': ${output}`);
  return absolute;
}

function normalizeProviderResult(protocol, value, repository) {
  if (!protocol) return value;
  if (protocol === "foundation-quality-capabilities-v1") return validateCapabilityReport(value);
  const bound = { ...value, repository: repository.id,
    repositoryCommit: repository.head || null, workspaceDigest: repository.workspaceDigest };
  if (protocol === "foundation-crap-v1") return normalizeCrapReport(bound);
  if (protocol === "foundation-automated-mutation-v1") return normalizeMutationReport(bound);
  if (protocol === "foundation-mutation-v2") return value;
  if (protocol === FINDINGS_PROTOCOL) return normalizeFindingsReport(bound);
  throw new Error(`unsupported quality provider protocol '${protocol}'`);
}

export function runQualityProvider({
  repository, capability, provider, git, pathInside, environment = {}, policy = null, durations = [],
  clock = () => performance.now()
}) {
  const command = provider.command || [];
  // A module lane runs in its own directory of the repository.
  const cwd = provider.cwd ? laneDirectory(repository.path, provider.cwd) : repository.path;
  if (!cwd) return {
    repository: repository.id, capability, status: "fail", assurance: "missing",
    reason: existsSync(join(repository.path, provider.cwd))
      ? `lane directory '${provider.cwd}' resolves outside the repository`
      : `lane directory '${provider.cwd}' does not exist`,
    required: provider.required !== false
  };
  if (command.length && !executableExists(command[0], cwd)) return {
    repository: repository.id, capability, status: "unavailable", assurance: "missing",
    reason: `executable '${command[0]}' is unavailable`, required: provider.required !== false
  };
  if (capability === "automated-mutation" &&
      !["tool", "harness-sandbox"].includes(provider.isolation)) return {
    repository: repository.id, capability, status: "fail", assurance: "missing",
    reason: "automated mutation provider requires isolation tool|harness-sandbox",
    required: provider.required !== false
  };
  if (capability === "automated-mutation" && provider.isolation === "harness-sandbox" &&
      !repository.isSandbox) return {
    repository: repository.id, capability, status: "unavailable", assurance: "missing",
    reason: "harness-sandbox mutation requires --change and a selected isolated workspace",
    required: provider.required !== false
  };
  const before = cleanStatus(git, repository.path);
  const started = clock();
  const elapsed = () => clock() - started;
  // The same runner exit Prove uses: a passing suite that leaves a server
  // open must not keep onboarding's quality run waiting for it.
  const run = command.length ? forceExitCommand(command[0], command.slice(1)) : null;
  const result = run ? spawnSync(run.command, run.args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, ...environment,
        FOUNDATION_QUALITY_REPOSITORY: repository.id,
        FOUNDATION_QUALITY_CAPABILITY: capability }
    }) : { status: 0, stdout: "", stderr: "" };
  const after = cleanStatus(git, repository.path);
  // A suite whose own tests ended long before the run did: readiness names the cause.
  const lingering = capability === "test" && run
    ? lingeringTestRun(`${result.stdout || ""}${result.stderr || ""}`, elapsed(),
      { patterns: durationPatterns(durations) }) : null;
  if (before !== null && after !== null && before !== after) return {
    repository: repository.id, capability, status: "fail", assurance: "missing",
    reason: "provider changed repository state and did not restore it", durationMs: elapsed(),
    required: provider.required !== false
  };
  // Linters and type checkers exit 1 when they report findings; the findings
  // ratchet, not the exit code, decides those lanes.
  const findingsExit = FINDINGS_CAPABILITIES.has(capability) && result.status === 1;
  if (result.status !== 0 && !findingsExit) return {
    repository: repository.id, capability, status: "fail", assurance: "missing",
    reason: `provider exited ${result.status ?? "without status"}`,
    stderr: String(result.stderr || "").slice(-4000), durationMs: elapsed(), lingering,
    required: provider.required !== false
  };
  let value = null;
  if (provider.kind === "builtin") {
    try {
      value = runBuiltinQualityAdapter({ repository, capability, provider, pathInside,
        repositoryCommit: repository.head || null, workspaceDigest: repository.workspaceDigest,
        stdout: result.stdout, policy });
    } catch (error) {
      return { repository: repository.id, capability, status: "fail", assurance: "missing",
        reason: `built-in adapter failed: ${error.message}`, durationMs: elapsed(),
        required: provider.required !== false };
    }
  } else if (provider.protocol) {
    try {
      const source = provider.output
        ? readFileSync(safeOutputPath(repository, provider.output, pathInside), "utf8")
        : result.stdout;
      value = normalizeProviderResult(provider.protocol, JSON.parse(source), repository);
    } catch (error) {
      return {
        repository: repository.id, capability, status: "fail", assurance: "missing",
        reason: `invalid ${provider.protocol} result: ${error.message}`, durationMs: elapsed(),
        required: provider.required !== false
      };
    }
  }
  return {
    repository: repository.id, capability, status: "pass", assurance: "full",
    durationMs: elapsed(), lingering, required: provider.required !== false, result: value,
    stdout: provider.protocol ? undefined : String(result.stdout || "").slice(-4000)
  };
}

// The lane a change skips because it touches none of the lane's paths, or null.
function notAffectedLane(repository, capability, provider, changed, statusPath) {
  if (!provider.paths || [...(changed || [])].some((path) => pathMatches(path, provider.paths))) return null;
  let lastStatus = null;
  try { lastStatus = existsSync(statusPath) ? readJsonFile(statusPath).status || null : null; } catch { lastStatus = null; }
  return { repository, capability, status: "pass", assurance: "not-affected", required: false, lastStatus,
    reason: `the change touches none of this lane's paths (${provider.paths.join(", ")})` };
}

function providerResultPath(root, repository, capability) {
  return join(root, QUALITY_RESULT_RELATIVE, repository, `${capability}.json`);
}

const LANE_HISTORY = 10;

function laneStatusPath(root, repository, capability) {
  return join(root, QUALITY_RESULT_RELATIVE, repository, `${capability}.status.json`);
}

function baselinePath(root, repository, capability) {
  return join(root, "quality", "baselines", repository, `${capability}-v1.json`);
}

export function createQualityRuntime({
  root, repositoryCatalog, selectedRepositories, canonicalChangedSurface,
  declaredSurfaceMatcher, loadRuntime, git, gitHead, readJson, writeJson,
  pathInside, workspaceManifest = null, fail, log = console.log,
  // The lane clock, injectable so a test can measure a lingering run without waiting it out.
  clock = () => performance.now()
}) {
  const configPath = join(root, QUALITY_CONFIG_RELATIVE);
  // `only` filters before each repository's head and workspace digest are
  // computed: in a topology of hundreds that work dominates every command.
  const repositoriesFor = (change = null, only = null) => {
    const state = change ? loadRuntime(change) : null;
    const rows = (change ? selectedRepositories(change, state) : repositoryCatalog().repositories)
      .filter((repository) => !only || only.has(repository.id));
    return rows.map((repository) => {
      // Runtime state is the source of truth once a change has entered a sandbox.
      // Do not let a stale/cached selector row silently measure the target checkout.
      const runtimePath = state?.repositories?.[repository.id]?.path ||
        (repository.id === "root" ? state?.workspace?.path : null);
      const workspacePath = runtimePath || repository.workspacePath || repository.path;
      return {
      id: repository.id,
      path: workspacePath,
      targetPath: repository.path,
      relativePath: repository.relativePath || relative(root, repository.path) || ".",
      head: gitHead(workspacePath),
      workspaceDigest: configDigest(workspaceManifest
        ? workspaceManifest(workspacePath, change || "consumer-quality", false)
        : { path: workspacePath, head: gitHead(workspacePath) }),
      isSandbox: Boolean(change)
    };
    });
  };

  // `--repo a,b` limits discovery and init to the repositories being onboarded:
  // a large topology onboards a few at a time instead of all at once.
  const repoFilter = (options) => {
    const ids = String(options.repo || "").split(",").map((id) => id.trim()).filter(Boolean);
    return ids.length ? new Set(ids) : null;
  };

  // The project's own toolchain packs, so discovery and init know its languages.
  // A config that cannot be read stops discovery: dropping its packs would
  // report its languages as unknown instead of naming the cause.
  const declaredToolchains = () => {
    if (!existsSync(configPath)) return [];
    try { return readJsonFile(configPath).toolchains || []; }
    catch (error) { return fail(`${QUALITY_CONFIG_RELATIVE} cannot be read: ${error.message}`); }
  };

  function discovery(options = {}) {
    const only = repoFilter(options);
    const repositories = repositoriesFor(options.change || process.env.FOUNDATION_CHANGE_ID || null, only);
    if (only) for (const id of only)
      if (!repositories.some((repository) => repository.id === id)) fail(`unknown repository '${id}'`);
    return discoverConsumerQuality(repositories, declaredToolchains());
  }

  function showDiscovery(options = {}) {
    const report = discovery(options);
    log(JSON.stringify(report, null, 2));
    return report;
  }

  function draft(options = {}) {
    const report = discovery(options);
    const toolchains = declaredToolchains();
    const value = defaultConsumerQualityConfig(report.repositories.map((repository) => ({
      id: repository.repository,
      profiles: repository.profiles,
      providers: repository.providers
    })));
    return toolchains.length ? { ...value, toolchains } : value;
  }

  // With --repo the drafted repositories join the existing configuration (or
  // start one) and every other repository counts as not onboarded yet.
  function repositoryDraft(options) {
    const value = draft(options);
    const at = new Date().toISOString();
    for (const repository of value.repositories) repository.onboardedAt = at;
    value.unlisted = "not-onboarded";
    if (!existsSync(configPath)) return value;
    const current = readJsonFile(configPath);
    const added = new Set(value.repositories.map((repository) => repository.id));
    return { ...current, unlisted: current.unlisted || "not-onboarded",
      repositories: [...current.repositories.filter((repository) => !added.has(repository.id)), ...value.repositories] };
  }

  function initialize(options = {}) {
    if (options.ci && options.ci !== "github") fail("quality init --ci currently supports only 'github'");
    const perRepository = Boolean(repoFilter(options));
    const value = perRepository ? repositoryDraft(options) : draft(options);
    if (options.write) {
      if (existsSync(configPath) && !options.force && !perRepository)
        fail(`${QUALITY_CONFIG_RELATIVE} already exists; inspect it, pass --force, or add repositories with --repo`);
      const workflowTemplates = options.ci === "github" ? [
        ["github-actions.yml", "foundation-quality.yml"],
        ["github-actions-nightly.yml", "foundation-quality-nightly.yml"],
        ["github-actions-release.yml", "foundation-quality-release.yml"]
      ] : [];
      for (const [, name] of workflowTemplates) {
        const target = join(root, ".github", "workflows", name);
        if (existsSync(target) && !options.force)
          fail(`.github/workflows/${name} already exists; inspect it or pass --force`);
      }
      writeJson(configPath, value);
      log(`quality configuration written: ${QUALITY_CONFIG_RELATIVE}`);
      if (options.ci === "github") {
        const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..",
          "templates", "quality");
        for (const [source, name] of workflowTemplates) {
          const target = join(root, ".github", "workflows", name);
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, readFileSync(join(templateRoot, source)));
          log(`quality CI template written: .github/workflows/${name}`);
        }
      }
    } else {
      log(JSON.stringify(value, null, 2));
      log(`preview only; pass --write to create ${QUALITY_CONFIG_RELATIVE}`);
      if (options.ci === "github")
        log("preview only; --write would also create PR, nightly, and release GitHub workflows");
    }
    return value;
  }

  function configured() {
    if (!existsSync(configPath))
      fail(`missing ${QUALITY_CONFIG_RELATIVE}; run 'cloop quality init --write'`);
    const value = readJson(configPath);
    validateConsumerQualityConfig(value, new Set(repositoryCatalog().repositories.map((row) => row.id)));
    return value;
  }

  function doctor(options = {}) {
    const activeChange = options.change || process.env.FOUNDATION_CHANGE_ID || null;
    const issues = [];
    let config = null;
    if (!existsSync(configPath)) issues.push({ level: "error", code: "missing-config",
      message: `missing ${QUALITY_CONFIG_RELATIVE}` });
    else {
      try { config = configured(); }
      catch (error) { issues.push({ level: "error", code: "invalid-config", message: error.message }); }
    }
    // A per-repository configuration without a change checks what is onboarded.
    const onboardedOnly = !activeChange && !options.repo && config?.unlisted === "not-onboarded"
      ? new Set(config.repositories.map((row) => row.id)) : null;
    const discovered = onboardedOnly ? discoverConsumerQuality(repositoriesFor(null, onboardedOnly), config.toolchains || []) : discovery(options);
    const actualRepositories = config ? new Map(repositoriesFor(activeChange, onboardedOnly).map((row) => [row.id, row])) : new Map();
    if (config) for (const repository of config.repositories) {
      const actual = actualRepositories.get(repository.id);
      if (!actual) { issues.push({ level: "error", code: "repository-not-selected",
        repository: repository.id, message: "configured repository is not selected" }); continue; }
      const lanes = lanesOf(repository);
      for (const capability of profileCapabilities(repository.profiles, config.toolchains || []))
        if (!lanes.some((lane) => lane.capability === capability)) issues.push({ level: "warning",
          code: "provider-unsupported", repository: repository.id, capability,
          message: `no ${capability} provider; risk fallback policy applies` });
      for (const { key, capability, provider } of [...lanes].sort((a, b) => a.key.localeCompare(b.key))) {
        issues.push(...slowLaneHint(repository.id, capability, key, laneRecord(repository.id, key)));
        if (provider.command?.length && !executableExists(provider.command[0],
            provider.cwd ? join(actual.path, provider.cwd) : actual.path))
          issues.push({ level: "error", code: "tool-unavailable", repository: repository.id,
            capability, message: `executable '${provider.command[0]}' is unavailable` });
        issues.push(...providerCommandHints(repository.id, capability, provider));
        if (capability === "automated-mutation" &&
            !["tool", "harness-sandbox"].includes(provider.isolation))
          issues.push({ level: "error", code: "mutation-not-isolated", repository: repository.id,
            capability, message: "mutation provider requires isolation tool|harness-sandbox" });
      }
    }
    if (config) {
      const configuredIds = new Set(config.repositories.map((repository) => repository.id));
      const pending = [...actualRepositories.values()].filter((repository) => !configuredIds.has(repository.id));
      if (config.unlisted === "not-onboarded") {
        const total = onboardedOnly ? repositoryCatalog().repositories.filter((row) => !configuredIds.has(row.id)).length : pending.length;
        if (total) issues.push({ level: "info", code: "repositories-not-onboarded", count: total,
          repositories: (onboardedOnly ? [] : pending.map((row) => row.id)).slice(0, 20),
          message: `${total} repositor${total === 1 ? "y is" : "ies are"} not onboarded yet` });
      } else for (const repository of pending) issues.push({ level: "error",
        code: "repository-unconfigured", repository: repository.id,
        message: "selected repository has no consumer quality configuration" });
    }
    const report = {
      protocol: "foundation-quality-doctor-v1", status: issues.some((issue) => issue.level === "error") ? "fail" : "pass",
      config: existsSync(configPath) ? QUALITY_CONFIG_RELATIVE : null, discovery: discovered, issues
    };
    log(JSON.stringify(report, null, 2));
    if (report.status === "fail" && options.enforce) fail("quality doctor failed");
    return report;
  }

  function laneRecord(repositoryId, key) {
    const path = laneStatusPath(root, repositoryId, laneFile(key));
    try { return existsSync(path) ? readJsonFile(path) : null; } catch { return null; }
  }

  function changedByRepository(change, repositories) {
    const result = new Map(repositories.map((repository) => [repository.id, new Set()]));
    if (!change) return result;
    for (const row of canonicalChangedSurface(change, loadRuntime(change)))
      result.get(row.repositoryId)?.add(row.path);
    return result;
  }

  function scopeIssues(change) {
    if (!change) return [];
    const state = loadRuntime(change);
    const matchers = new Map();
    const matcher = (repositoryId) => {
      if (!matchers.has(repositoryId))
        matchers.set(repositoryId, declaredSurfaceMatcher(change, state, repositoryId));
      return matchers.get(repositoryId);
    };
    return canonicalChangedSurface(change, state)
      .filter((row) => !matcher(row.repositoryId)(row.path))
      .map((row) => ({ repository: row.repositoryId, path: row.path,
        reason: "changed path is outside the declared change surface" }));
  }

  // Compare a lane's fresh result with its baseline: CRAP and mutation on the
  // changed surface (every path with --full), findings across the repository.
  function evaluateLane(lane, { repository, capability, key = capability, full, configuredChanged, config }) {
    const file = laneFile(key);
    writeJson(providerResultPath(root, repository.id, file), lane.result);
    const basePath = baselinePath(root, repository.id, file);
    const baseline = existsSync(basePath) ? readJsonFile(basePath) : null;
    if (capability === "crap") lane.evaluation = evaluateCrapRatchet({
      current: lane.result, baseline, changedPaths: full
        ? new Set(lane.result.functions.map((fn) => fn.path)) : configuredChanged,
      policy: config.policy, exceptions: config.exceptions
    });
    if (capability === "automated-mutation") {
      const mutationPaths = full
        ? new Set(lane.result.mutants.map((mutant) => mutant.path))
        : configuredChanged;
      lane.result = classifyMutationSurfaces(lane.result, mutationPaths);
      writeJson(providerResultPath(root, repository.id, file), lane.result);
      lane.evaluation = evaluateMutationRatchet({ current: lane.result, baseline,
        policy: config.policy, exceptions: config.exceptions });
    }
    if (FINDINGS_CAPABILITIES.has(capability) && lane.result.findings) {
      lane.evaluation = evaluateFindingsRatchet({ current: lane.result, baseline });
      if (lane.evaluation.assurance === "reduced") {
        lane.assurance = "reduced";
        lane.reason = lane.evaluation.reason;
      }
    }
    if (lane.evaluation?.status === "fail" || lane.evaluation?.summary?.fail > 0) {
      lane.status = "fail";
      lane.reason = lane.evaluation?.reason || "quality ratchet failed";
    }
  }

  function run(options = {}) {
    const config = configured();
    const shardCount = options["shard-count"] === undefined ? 1 : Number(options["shard-count"]);
    const shardIndex = options["shard-index"] === undefined ? 0 : Number(options["shard-index"]);
    if (!Number.isInteger(shardCount) || shardCount < 1 || !Number.isInteger(shardIndex) ||
        shardIndex < 0 || shardIndex >= shardCount)
      fail("quality run requires integer --shard-count >= 1 and 0 <= --shard-index < count");
    const selectedLane = (repository, capability) =>
      shardCount === 1 || laneShard(repository, capability, shardCount) === shardIndex;
    const activeChange = options.change || process.env.FOUNDATION_CHANGE_ID || null;
    const impact = activeChange ? loadRuntime(activeChange).impact || "medium" : "medium";
    // Without a change, a per-repository configuration measures what is
    // onboarded; a change still reports each selected repository.
    const only = options.repository ? new Set([options.repository])
      : !activeChange && config.unlisted === "not-onboarded" ? new Set(config.repositories.map((row) => row.id)) : null;
    const repositories = repositoriesFor(activeChange, only);
    if (options.repository && !repositories.length) fail(`unknown or unselected repository '${options.repository}'`);
    const changed = changedByRepository(activeChange, repositories);
    const lanes = [];
    for (const repository of repositories) {
      const repositoryConfig = config.repositories.find((row) => row.id === repository.id);
      if (!repositoryConfig && config.unlisted === "not-onboarded") {
        if (selectedLane(repository.id, "configuration")) lanes.push({
          repository: repository.id, capability: "configuration", status: "pass",
          assurance: "reduced", required: false,
          reason: "repository is not onboarded yet; its quality ratchets are not set up"
        });
        continue;
      }
      if (!repositoryConfig) {
        if (selectedLane(repository.id, "configuration")) lanes.push({
          repository: repository.id, capability: "configuration", status: "fail",
          assurance: "missing", required: true,
          reason: "selected repository has no consumer quality configuration"
        });
        continue;
      }
      const configuredChanged = new Set([...(changed.get(repository.id) || [])].filter((path) =>
        (!repositoryConfig.include?.length || pathMatches(path, repositoryConfig.include)) &&
        !pathMatches(path, repositoryConfig.exclude || [])));
      for (const { key, capability, provider } of lanesOf(repositoryConfig)) {
        if (options.capability && capability !== options.capability) continue;
        // The test lane runs inside a change too: a passing full test lane is the
        // compensating evidence for unsupported reduced capabilities below.
        if (!selectedLane(repository.id, key)) continue;
        const statusPath = laneStatusPath(root, repository.id, laneFile(key));
        // A lane that declares its paths measures only those: a change that
        // touches none of them does not wait for it (a 4.5-minute backend
        // mutation run on every frontend-only Prove). Without a change or with
        // --full every lane runs.
        const skipped = activeChange && !options.full
          ? notAffectedLane(repository.id, capability, provider, changed.get(repository.id), statusPath) : null;
        if (skipped) { lanes.push({ ...skipped, ...laneLabel(key, capability) }); continue; }
        const laneStarted = performance.now();
        const lane = { ...runQualityProvider({ repository, capability, provider, git, pathInside,
          environment: { FOUNDATION_QUALITY_CHANGE: activeChange || "" }, policy: config.policy,
          durations: config.toolchains, clock }), ...laneLabel(key, capability) };
        if (lane.result)
          evaluateLane(lane, { repository, capability, key, full: options.full, configuredChanged, config });
        lane.durationMs = performance.now() - laneStarted;
        lanes.push(lane);
        // The latest verdict per lane: readiness counts a test lane only while it passes.
        // The latest verdict plus a short history: readiness judges whether the
        // test lane is fast enough to run every turn and stable on unchanged code.
        let previous = [];
        try { previous = existsSync(statusPath) ? readJsonFile(statusPath).history || [] : []; } catch { previous = []; }
        const entry = { status: lane.status, durationMs: Math.round(lane.durationMs),
          ...("lingering" in lane && lane.lingering ? { lingering: lane.lingering } : {}),
          workspaceDigest: repository.workspaceDigest || null, at: new Date().toISOString() };
        writeJson(statusPath, { ...entry, history: [...previous, entry].slice(-LANE_HISTORY) });
      }
      for (const capability of profileCapabilities(repositoryConfig.profiles, config.toolchains || [])) {
        if (lanesOf(repositoryConfig).some((lane) => lane.capability === capability) ||
            (options.capability && capability !== options.capability)) continue;
        if (!selectedLane(repository.id, capability)) continue;
        const requirement = capabilityRequirement({
          status: "unsupported", capability, impact, policy: config.policy
        });
        lanes.push({ repository: repository.id, capability,
          status: requirement.blocking ? "unavailable" : "pass",
          assurance: requirement.assurance, reason: requirement.reason,
          required: requirement.blocking });
      }
    }
    for (const lane of lanes.filter((item) => item.assurance === "reduced-requires-evidence")) {
      const compensating = lanes.some((item) => item.repository === lane.repository &&
        item.status === "pass" &&
        (item.assurance === "full" || (item.assurance === "not-affected" && item.lastStatus === "pass")) &&
        ["test", "static-analysis", "coverage", "semantic-mutation", "integration"]
          .includes(item.capability));
      if (!compensating) {
        lane.status = "unavailable";
        lane.required = true;
        lane.reason = `${lane.reason}; compensating evidence is missing`;
      }
    }
    for (const issue of scopeIssues(activeChange)) lanes.push({
      ...issue, capability: "scope", status: "fail", assurance: "missing", required: true
    });
    const summary = aggregateQualityLanes(lanes);
    summary.generatedAt = new Date().toISOString();
    summary.change = activeChange;
    summary.shard = { index: shardIndex, count: shardCount };
    writeJson(join(root, QUALITY_RESULT_RELATIVE, "summary.json"), summary);
    log(JSON.stringify(summary, null, 2));
    if ((options.enforce || process.env.FOUNDATION_QUALITY_ENFORCE === "1" ||
        config.policy.mode === "enforce") && ["fail", "unavailable"].includes(summary.status))
      fail(`consumer quality gate ${summary.status}`);
    return summary;
  }

  function report() {
    const path = join(root, QUALITY_RESULT_RELATIVE, "summary.json");
    if (!existsSync(path)) fail("no consumer quality result; run 'cloop quality run'");
    const value = readJson(path);
    log(JSON.stringify(value, null, 2));
    return value;
  }

  function baseline(options = {}) {
    const config = configured();
    const changes = [];
    for (const repository of config.repositories) {
      if (options.repository && repository.id !== options.repository) continue;
      const ratcheted = new Set(["crap", "automated-mutation", ...FINDINGS_CAPABILITIES]);
      for (const { key, capability } of lanesOf(repository)) {
        if (!ratcheted.has(capability) || (options.capability && capability !== options.capability)) continue;
        const source = providerResultPath(root, repository.id, laneFile(key));
        if (!existsSync(source)) continue;
        const target = baselinePath(root, repository.id, laneFile(key));
        changes.push({ repository: repository.id, capability,
          source: relative(root, source), target: relative(root, target), value: readJsonFile(source) });
      }
    }
    if (!changes.length) fail("no quality reports are available to baseline");
    if (options.write) {
      if (!options["decision-ref"] || !options.reason)
        fail("quality baseline --write requires --decision-ref and --reason");
      for (const change of changes) writeJson(join(root, change.target), change.value);
      const manifestPath = join(root, "quality", "baselines", "manifest.json");
      const manifest = existsSync(manifestPath) ? readJson(manifestPath) : {
        protocol: "foundation-quality-baseline-manifest-v1", entries: []
      };
      manifest.entries.push({
        updatedAt: new Date().toISOString(),
        decisionRef: options["decision-ref"],
        reason: options.reason,
        reports: changes.map(({ repository, capability, target, value }) => ({
          repository, capability, target,
          tool: value.tool || null,
          repositoryCommit: value.repositoryCommit || null
        }))
      });
      writeJson(manifestPath, manifest);
      log(`quality baseline written: ${changes.length} report(s)`);
    } else {
      log(JSON.stringify(changes.map(({ value: _value, ...change }) => change), null, 2));
      log("preview only; pass --write to update versioned baselines");
    }
    return changes;
  }

  function debt() {
    const summaryPath = join(root, QUALITY_RESULT_RELATIVE, "summary.json");
    if (!existsSync(summaryPath)) fail("no consumer quality result; run 'cloop quality run'");
    const summary = readJson(summaryPath);
    const changedFindings = summary.lanes.flatMap((lane) => {
      const functions = lane.evaluation?.changedFunctions || [];
      return functions.filter((fn) => fn.status === "fail").map((fn) => ({
        id: `${lane.repository}:changed:${fn.path}:${fn.id}`,
        repository: lane.repository, capability: lane.capability,
        target: `${fn.path}:${fn.id}`, reasons: fn.reasons, blocksCurrentChange: true
      }));
    });
    const inventoryFindings = summary.lanes.flatMap((lane) => {
      const functions = lane.result?.functions || [];
      const mutants = lane.result?.mutants || [];
      return [
        ...functions.filter((fn) => fn.crap !== null && fn.crap >= 30)
          .map((fn) => ({ id: `${lane.repository}:crap:${fn.path}:${fn.id}`,
            repository: lane.repository, capability: "crap", target: `${fn.path}:${fn.id}`,
            reasons: [`CRAP ${fn.crap}`], blocksCurrentChange: false })),
        ...mutants.filter((mutant) => ["survived", "no-coverage"].includes(mutant.status))
          .map((mutant) => ({ id: `${lane.repository}:mutation:${mutant.id}`,
            repository: lane.repository, capability: "automated-mutation", target: mutant.id,
            reasons: [mutant.status], blocksCurrentChange:
              mutant.changedSurface !== "legacy-unrelated" }))
      ];
    });
    const capabilityFindings = summary.lanes
      .filter((lane) => lane.assurance?.startsWith("reduced") || lane.status === "unavailable")
      .map((lane) => ({ id: `${lane.repository}:capability:${lane.capability}`,
        repository: lane.repository, capability: lane.capability,
        target: lane.capability, reasons: [lane.reason || lane.status],
        blocksCurrentChange: lane.status === "unavailable" }));
    const ratchetFindings = summary.lanes.flatMap((lane) => (lane.evaluation?.regressions || [])
      .filter(() => FINDINGS_CAPABILITIES.has(lane.capability))
      .map((row) => ({ id: `${lane.repository}:${lane.capability}:${row.path}:${row.rule}`,
        repository: lane.repository, capability: lane.capability, target: `${row.path}:${row.rule}`,
        reasons: [`${row.baseline ?? 0} -> ${row.current}`], blocksCurrentChange: true })));
    const findings = [...new Map([...changedFindings, ...inventoryFindings, ...capabilityFindings, ...ratchetFindings]
      .map((finding) => [finding.id, finding])).values()]
      .sort((left, right) => left.id.localeCompare(right.id));
    const value = { protocol: "foundation-quality-debt-v1", generatedAt: new Date().toISOString(), findings };
    writeJson(join(root, QUALITY_RESULT_RELATIVE, "debt.json"), value);
    const markdown = [
      "# Consumer Quality Debt", "", `Generated: ${value.generatedAt}`, "",
      "| Repository | Capability | Target | Blocking | Reasons |",
      "|---|---|---|---:|---|",
      ...findings.map((finding) => `| ${finding.repository} | ${finding.capability} | \`${finding.target}\` | ${
        finding.blocksCurrentChange ? "yes" : "no"} | ${finding.reasons.join("; ").replaceAll("|", "\\|")} |`),
      ""
    ].join("\n");
    const markdownPath = join(root, QUALITY_RESULT_RELATIVE, "debt.md");
    mkdirSync(dirname(markdownPath), { recursive: true });
    writeFileSync(markdownPath, markdown);
    log(JSON.stringify(value, null, 2));
    return value;
  }

  // Setup readiness rows for `doctor`: whether quality is configured and each
  // findings ratchet has a baseline it can compare against. Never an error and
  // never exits; each row names its next step.
  function readiness() {
    if (!existsSync(configPath)) return [{ id: "quality-config", level: "warn",
      detail: `${QUALITY_CONFIG_RELATIVE} is missing; lint, type-check, file-size, duplication, nesting, and CRAP are not measured`,
      next: "run the onboard skill: it runs cloop quality discover, then cloop quality init --write, and asks the user only to confirm baselines" }];
    let config;
    try {
      config = readJsonFile(configPath);
      validateConsumerQualityConfig(config, new Set(repositoryCatalog().repositories.map((row) => row.id)));
    } catch (error) {
      return [{ id: "quality-config", level: "warn", detail: `invalid ${QUALITY_CONFIG_RELATIVE}: ${error.message}`,
        next: "cloop quality doctor" }];
    }
    const rows = [{ id: "quality-config", level: "ok", detail: QUALITY_CONFIG_RELATIVE, next: null }];
    const baselineNext = (capability) =>
      `cloop quality baseline --write --capability ${capability} --decision-ref <ref> --reason <why>`;
    const ROW = {
      "not-run": (capability) => ({ level: "info", detail: `${capability} has not run`,
        next: `cloop quality run --capability ${capability}` }),
      "no-baseline": (capability) => ({ level: "warn",
        detail: `${capability} has no baseline, so it measures but cannot fail on new findings`, next: baselineNext(capability) }),
      unreadable: (capability, error) => ({ level: "warn", detail: `${capability} result or baseline is unreadable: ${error}`,
        next: `cloop quality run --capability ${capability}` }),
      ratcheting: (capability) => ({ level: "ok", detail: `${capability} ratchets against its baseline`, next: null }),
      incompatible: (capability) => ({ level: "warn",
        detail: `${capability} baseline no longer matches the tool or configuration`, next: baselineNext(capability) })
    };
    for (const repository of config.repositories) {
      const lanes = repositoryLaneStates(repository).filter((row) => FINDINGS_CAPABILITIES.has(row.capability));
      if (!lanes.length) rows.push({ id: `findings:${repository.id}`, level: "info",
        detail: `repository '${repository.id}' has no findings ratchet lane (lint, type-check, file-size, module-boundaries, workaround-comments, duplication, or nesting-depth)`,
        next: "add one in quality/foundation-quality.json (see CONSUMER-QUALITY.md, Findings ratchet)" });
      for (const { capability, state, error } of lanes)
        rows.push({ id: `baseline:${repository.id}:${capability}`, ...ROW[state](capability, error) });
    }
    return rows;
  }

  // Each configured lane of one repository: whether it has run, has a
  // baseline, and (for findings) still compares against it.
  function repositoryLaneStates(repository) {
    return lanesOf(repository).map(({ key, capability }) => {
      const resultPath = providerResultPath(root, repository.id, laneFile(key));
      const basePath = baselinePath(root, repository.id, laneFile(key));
      if (!existsSync(resultPath)) return { capability, state: "not-run" };
      let current = null;
      try { current = readJsonFile(resultPath); } catch (error) {
        return { capability, state: "unreadable", error: error.message };
      }
      const findings = FINDINGS_CAPABILITIES.has(capability) && Array.isArray(current?.findings)
        ? current.findings.length : null;
      if (!existsSync(basePath)) return { capability, state: "no-baseline", findings };
      if (findings === null) return { capability, state: "ratcheting", findings };
      try {
        const evaluation = evaluateFindingsRatchet({ current, baseline: readJsonFile(basePath) });
        return { capability, state: evaluation.baselineCompatible ? "ratcheting" : "incompatible", findings };
      } catch (error) {
        return { capability, state: "unreadable", error: error.message, findings };
      }
    });
  }

  // One state per capability across repositories: the least ready repository
  // decides, so a lane counts only where every configured repository ratchets.
  // Findings add up across repositories. Null when quality is not configured.
  function laneStates() {
    if (!existsSync(configPath)) return null;
    let config;
    try { config = readJsonFile(configPath); } catch { return null; }
    const order = ["unreadable", "not-run", "no-baseline", "incompatible", "ratcheting"];
    const lanes = {};
    const findings = {};
    // Latest run verdict per capability; one failing repository makes it fail.
    const statuses = {};
    const histories = {};
    // The same facts per repository, so a large topology reports each
    // onboarded repository instead of only the least ready one.
    const repositories = {};
    for (const repository of config.repositories || []) {
      const own = { lanes: {}, findings: {}, statuses: {}, histories: {}, onboardedAt: repository.onboardedAt || null };
      for (const { key, capability } of lanesOf(repository)) {
        const path = laneStatusPath(root, repository.id, laneFile(key));
        const record = existsSync(path) ? readJsonFile(path) : null;
        const status = record?.status;
        if (typeof status !== "string") continue;
        // Module lanes of one capability share its verdict and history.
        own.statuses[capability] = own.statuses[capability] && own.statuses[capability] !== "pass" ? own.statuses[capability] : status;
        const history = Array.isArray(record.history) ? record.history : [record];
        (own.histories[capability] ||= []).push(...history);
        (histories[capability] ||= []).push(...history);
        statuses[capability] = statuses[capability] && statuses[capability] !== "pass" ? statuses[capability] : status;
      }
      for (const { capability, state, findings: count } of repositoryLaneStates(repository)) {
        own.lanes[capability] = state;
        const current = lanes[capability];
        lanes[capability] = current === undefined || order.indexOf(state) < order.indexOf(current) ? state : current;
        if (!Number.isInteger(count)) continue;
        own.findings[capability] = count;
        findings[capability] = (findings[capability] || 0) + count;
      }
      repositories[repository.id] = own;
    }
    return { lanes, findings, statuses, histories, repositories, unlisted: config.unlisted || "fail" };
  }

  return { discovery, showDiscovery, draft, initialize, configured, doctor, run, report, baseline, debt, readiness,
    laneStates };
}
