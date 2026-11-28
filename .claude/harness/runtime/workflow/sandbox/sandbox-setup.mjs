// Runs and records the project's sandbox setup commands: single commands,
// parallel batches, the setup plan and the dependency digest that decides
// when setup reruns. sandbox-runtime.mjs re-exports every symbol.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { delimiter, join } from "node:path";

export function runSandboxSetupCommand(context, record, command, timeoutMs, cwd, label) {
  const result = context.spawn("sh", ["-c", command], {
    cwd, encoding: "utf8", timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024
  });
  const failed = Boolean(result.error) || result.status !== 0;
  record.setup = {
    command, status: failed ? "failed" : "ok",
    exitCode: typeof result.status === "number" ? result.status : null
  };
  if (failed) {
    const cause = result.error
      ? String(result.error.code || result.error.message)
      : `exit ${result.status}`;
    const lines = `${result.stdout || ""}\n${result.stderr || ""}`
      .trim().split("\n").filter(Boolean);
    // Kept with the record so a failed setup the harness cannot finish is
    // handed to the agent with its command, directory, and output.
    record.setup.cwd = cwd;
    record.setup.logTail = [cause, ...lines.slice(-40)].join("\n").slice(-4000);
    const tail = lines.slice(-5).join("\n    ");
    context.output.error(`WARNING: sandbox setup command failed${
      label ? ` for '${label}'` : ""} (${cause}) in the isolated workspace. ` +
      `Harness preparation will repair or route this failure before Build.${
        tail ? `\n    ${tail}` : ""}`);
  }
  return record.setup;
}

export function runSandboxSetupBatch(records, maxParallel = 1) {
  const results = [];
  const capacity = Math.max(1, Number(maxParallel) || 1);
  const operationStartedAt = Date.now();
  const source = String.raw`
    import { execFile } from "node:child_process";
    import { readFileSync } from "node:fs";
    import { promisify } from "node:util";
    const execute = promisify(execFile);
    const outputTail = (value) => String(value || "").slice(-65536);
    const jobs = JSON.parse(readFileSync(0, "utf8") || "[]");
    const rows = await Promise.all(jobs.map(async (job) => {
      try {
        const value = await execute("sh", ["-c", job.command], {
          cwd: job.cwd, timeout: job.timeoutMs, maxBuffer: 16 * 1024 * 1024
        });
        return { status: 0, stdout: outputTail(value.stdout),
          stderr: outputTail(value.stderr), error: null };
      } catch (error) {
        return { status: Number.isInteger(error.code) ? error.code : null,
          stdout: outputTail(error.stdout), stderr: outputTail(error.stderr),
          error: String(error.code || error.message) };
      }
    }));
    process.stdout.write(JSON.stringify(rows));`;
  for (let index = 0; index < records.length; index += capacity) {
    const batch = records.slice(index, index + capacity);
    const queuedMs = Date.now() - operationStartedAt;
    const batchStartedAt = Date.now();
    const rows = executeSandboxSetupBatch({
      spawn: spawnSync, executable: process.execPath
    }, source, batch);
    const durationMs = Date.now() - batchStartedAt;
    for (let offset = 0; offset < batch.length; offset += 1)
      results.push(sandboxSetupResult(batch[offset], rows[offset], queuedMs,
        durationMs, Math.floor(index / capacity) + 1));
  }
  return results;
}

export function executeSandboxSetupBatch(context, source, batch) {
  const child = context.spawn(context.executable, ["--input-type=module", "-e", source], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    input: JSON.stringify(batch.map(sandboxSetupInput))
  });
  if (child.status !== 0)
    throw new Error(`parallel sandbox setup runner failed: ${child.stderr.trim()}`);
  return JSON.parse(child.stdout);
}

function sandboxSetupInput(row) {
  return { command: row.command, cwd: row.cwd, timeoutMs: row.timeoutMs };
}

function sandboxSetupResult(job, result, queuedMs, durationMs, wave) {
  return { ...job, result, queuedMs, durationMs, wave };
}

export function runMeasuredSandboxSetupBatch(context, records) {
  const capacity = context.policy().execution?.maxParallelSetups;
  const rows = runSandboxSetupBatch(records, capacity);
  for (const wave of [...new Set(rows.map((row) => row.wave))]) {
    const batch = rows.filter((row) => row.wave === wave);
    context.recordScheduler({
      scheduler: "setup", wave,
      readyNodes: records.length - rows.filter((row) => row.wave < wave).length,
      executedNodes: batch.length, reusedNodes: 0,
      queueingMs: batch.reduce((total, row) => total + row.queuedMs, 0),
      peakConcurrency: batch.length
    });
  }
  return rows;
}

// A worktree is a bare checkout and the copy path excludes installed
// dependencies, so a project that installs them at its root starts every Build
// without them. Three consumer Builds rediscovered that by linking the
// checkout's node_modules — which the phase guard refuses — before falling back
// to an install. The harness therefore runs the pinned lockfile install itself
// when no setup command is configured. Lockfile first: the install must match
// the package manager the project actually pins.
export const DEPENDENCY_LOCKFILES = [
  ["package-lock.json", "npm ci"],
  ["npm-shrinkwrap.json", "npm ci"],
  ["pnpm-lock.yaml", "pnpm install --frozen-lockfile"],
  ["yarn.lock", "yarn install --frozen-lockfile"],
  ["bun.lock", "bun install --frozen-lockfile"],
  ["bun.lockb", "bun install --frozen-lockfile"]
];

// Other ecosystems' locked installs, in run order: [manifest, lockfile,
// command, executable]. Maven, Gradle, and dotnet resolve dependencies when
// they test, and requirements.txt pins no lock, so none of them is here.
export const ECOSYSTEM_LOCKFILES = Object.freeze([
  ["composer.json", "composer.lock", "composer install --no-interaction --no-progress", "composer"],
  ["Gemfile", "Gemfile.lock", "bundle install", "bundle"],
  ["pyproject.toml", "uv.lock", "uv sync --frozen", "uv"],
  ["pyproject.toml", "poetry.lock", "poetry install --no-interaction", "poetry"],
  ["Pipfile", "Pipfile.lock", "pipenv sync --dev", "pipenv"],
  ["go.mod", "go.sum", "go mod download", "go"],
  ["Cargo.toml", "Cargo.lock", "cargo fetch --locked", "cargo"],
  ["pubspec.yaml", "pubspec.lock", "dart pub get", "dart"],
  ["mix.exs", "mix.lock", "mix deps.get", "mix"]
]);

const onPath = (name) => String(process.env.PATH || "").split(delimiter)
  .some((directory) => directory && existsSync(join(directory, name)));
const readText = (path) => { try { return readFileSync(path, "utf8"); } catch { return ""; } };

// The workspace's detected installs: the JavaScript lockfile first, then each
// ecosystem whose manifest and lockfile are both present and whose tool is on
// PATH (a missing tool is skipped: its tests would name it). A Flutter package
// (`sdk: flutter`) installs with flutter instead of dart.
function detectedInstalls(workspace, pathExists, commandExists) {
  const installs = [];
  const javascript = pathExists(join(workspace, "package.json")) &&
    DEPENDENCY_LOCKFILES.find(([file]) => pathExists(join(workspace, file)));
  if (javascript) installs.push({ command: javascript[1], lockfile: javascript[0] });
  const seen = new Set();
  for (const [manifest, lockfile, command, executable] of ECOSYSTEM_LOCKFILES) {
    if (seen.has(manifest) || !pathExists(join(workspace, manifest)) ||
        !pathExists(join(workspace, lockfile))) continue;
    const flutter = manifest === "pubspec.yaml" &&
      /\bsdk:\s*flutter\b/.test(readText(join(workspace, manifest)));
    const tool = flutter ? "flutter" : executable;
    if (!commandExists(tool)) continue;
    seen.add(manifest);
    installs.push({ command: flutter ? "flutter pub get" : command, lockfile });
  }
  return installs;
}

// The workspace's setup: the configured command, otherwise the installs its
// own lockfiles pin, joined with &&. `sandbox.installDependencies: false` opts
// out of the detected install; a configured command always runs. Never links or
// copies the checkout's dependencies — the install happens in the workspace.
export function workspaceSetupPlan({ sandbox = /** @type {Record<string, any>} */ ({}), workspace, pathExists,
  commandExists = onPath }) {
  if (sandbox.setupCommand)
    return { command: sandbox.setupCommand, source: "configured" };
  // A lockfile without its manifest is not an installable project.
  if (sandbox.installDependencies === false || !workspace) return null;
  const installs = detectedInstalls(workspace, pathExists, commandExists);
  return installs.length ? { command: installs.map((row) => row.command).join(" && "),
    source: "lockfile", lockfile: installs.map((row) => row.lockfile).join(", ") } : null;
}

export function sandboxSetupLine(setup) {
  if (!setup) return "";
  return `\n  setup: ${setup.status}${setup.source === "lockfile"
    ? ` (${setup.command}, detected from ${setup.lockfile})` : ""}`;
}

// The manifest and lockfiles whose bytes decide what the setup installs.
export const SETUP_DEPENDENCY_FILES = Object.freeze([...new Set(["package.json",
  ...DEPENDENCY_LOCKFILES.map(([file]) => file),
  ...ECOSYSTEM_LOCKFILES.flatMap(([manifest, lockfile]) => [manifest, lockfile])])]);

export function dependencyDigest(workspace, readFile = readFileSync) {
  const hash = createHash("sha256");
  for (const file of SETUP_DEPENDENCY_FILES) {
    let bytes = null;
    try { bytes = readFile(join(workspace, file)); } catch { bytes = null; }
    hash.update(`${file}\0${bytes === null ? "-" : createHash("sha256").update(bytes).digest("hex")}\n`);
  }
  return `sha256:${hash.digest("hex")}`;
}

// A failed or retried run replaces record.setup; keep where the command came
// from so retries and the preparation plan still treat a detected install
// exactly like a configured one. `digest` records the manifest and lockfile
// the install read, so a later Build edit to them is detectable.
export function runWorkspaceSetupPlan(runSetupCommand, record, plan, timeoutMs, cwd, label,
  digest = null) {
  runSetupCommand(record, plan.command, timeoutMs, cwd, label);
  const setup = record.setup;
  if (setup && plan.source === "lockfile") {
    setup.source = "lockfile";
    setup.lockfile = plan.lockfile;
  }
  if (setup && digest) setup.dependencies = digest(cwd);
  return setup;
}

// Build may change the manifest or lockfile after setup installed from the old
// ones, leaving the installed dependencies stale. The agent's only recourse
// would be an install or link the phase guard can refuse, and a dependency
// upgrade Build stopped to ask the user. Rerun the same setup as Harness work
// before the next check reads the workspace. A failed rerun is recorded like a
// failed creation setup, so the existing retry route owns it.
export function refreshChangedSandboxDependencies(context, id,
  state = context.loadRuntime(id)) {
  const workspace = state.workspace;
  const setup = workspace?.setup;
  if (state.status !== "building" || setup?.status !== "ok" || !setup.dependencies ||
      !workspace.path) return false;
  if (context.dependencyDigest(workspace.path) === setup.dependencies) return false;
  const configured = context.policy().sandbox || {};
  const plan = workspaceSetupPlan({
    sandbox: configured, workspace: workspace.path, pathExists: context.pathExists
  });
  if (!plan) return false;
  runWorkspaceSetupPlan(context.runSetupCommand, workspace, plan,
    configured.setupTimeoutMs, workspace.path, "root", context.dependencyDigest);
  context.saveRuntime(state);
  return true;
}
