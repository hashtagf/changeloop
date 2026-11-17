#!/usr/bin/env node

import { accessSync, appendFileSync, constants, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { nextCommand } from "../harness/runtime/core/next-step.mjs";
import { shellDisplayArgument } from "../harness/runtime/core/shell-mutation-policy.mjs";
import { pathInside } from "../harness/runtime/core/paths.mjs";
import { bestEffort } from "../harness/runtime/core/best-effort.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.env.CLAUDE_PROJECT_DIR || join(HOOK_DIR, "..", ".."));
// A digest that grows without bound stops being a digest. Active changes are
// few by design; orphan runtime state is the row that accumulates silently.
const ORPHAN_PREVIEW = 5;

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`;
}

function exportSessionIdentity(input) {
  const envFile = process.env.CLAUDE_ENV_FILE;
  if (!envFile || !input.session_id || !input.transcript_path) return;
  appendFileSync(envFile,
    `export FOUNDATION_CLAUDE_SESSION_ID=${shellQuote(input.session_id)}\n` +
    `export FOUNDATION_CLAUDE_TRANSCRIPT_PATH=${shellQuote(input.transcript_path)}\n`);
}

// A source-checkout install leaves no `cloop` on PATH, yet every
// next step the harness prints names it. The installer writes a project-local
// shim; this puts it on the session's PATH only when nothing already resolves,
// so a Homebrew or other global CLI keeps precedence. A non-executable file
// or directory of that name does not resolve for the shell, so it does not count.
function executableFile(path) {
  try { accessSync(path, constants.X_OK); return statSync(path).isFile(); }
  catch { return false; }
}

function exportCliPath() {
  const envFile = process.env.CLAUDE_ENV_FILE;
  const bin = join(ROOT, ".foundation", "bin");
  if (!envFile || !existsSync(join(bin, "cloop"))) return;
  const resolves = (process.env.PATH || "").split(delimiter)
    .some((dir) => dir && executableFile(join(dir, "cloop")));
  if (!resolves) appendFileSync(envFile, `export PATH=${shellQuote(bin)}:"$PATH"\n`);
}

function readState(runtimeDir, id) {
  const path = join(runtimeDir, `${id}.json`);
  if (!existsSync(path)) return { status: "untracked" };
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { return { status: "invalid-runtime-json" }; }
}

// A declared sibling repository (`allowOutsideRoot`) lies outside the host's
// working directory, so every `ls`, `cat`, or Read aimed there during Change is
// a permission prompt. Name it before the first read; its Build repository
// sandbox lives under `.foundation/` and is readable without one.
function outsideRootRepositories() {
  const path = join(ROOT, "openspec", "repositories.yaml");
  if (!existsSync(path)) return [];
  let value;
  try { value = JSON.parse(readFileSync(path, "utf8")); } catch { return []; }
  return (Array.isArray(value?.repositories) ? value.repositories : [])
    .filter((row) => row?.allowOutsideRoot === true && typeof row.id === "string" &&
      typeof row.path === "string" && row.path)
    .filter((row) => {
      return !pathInside(ROOT, resolve(ROOT, row.path));
    });
}

// An installed project whose tool-free checks were never adopted gets only the
// verification layer: no ratchet catches a new finding and no feature map
// grounds a change. Existence checks only, so the hook stays within its budget;
// `doctor` names each step and the onboard skill asks before anything binds.
function setupGaps() {
  if (!existsSync(join(ROOT, ".foundation", "install-manifest.txt"))) return [];
  const gaps = [];
  if (!existsSync(join(ROOT, "quality", "foundation-quality.json"))) gaps.push("no quality lanes");
  else {
    const baselines = join(ROOT, "quality", "baselines");
    const recorded = existsSync(baselines) && readdirSync(baselines, { withFileTypes: true })
      .some((entry) => entry.isDirectory() && readdirSync(join(baselines, entry.name)).length > 0);
    if (!recorded) gaps.push("no findings baseline");
  }
  const map = bestEffort(() => JSON.parse(readFileSync(join(ROOT, "openspec", "feature-map.json"), "utf8")), null);
  if (!Array.isArray(map?.features) || !map.features.length) gaps.push("no feature map");
  return gaps;
}

// Where the loop stands, stated without being asked.
//
// Deliberately hash-free: `relevantHash` walks the entire workspace, and this
// hook runs under a 5s timeout on every startup, resume, clear, and compact.
// Status is cheap and honest. Proof freshness is the one thing a hash buys,
// so this names `changes` for it rather than implying an answer it did not
// compute — a wrong "ready to land" is worse than an absent one.
function workflowDigest() {
  const changesDir = join(ROOT, "openspec", "changes");
  const runtimeDir = join(ROOT, ".foundation", "runtime");
  if (!existsSync(changesDir)) return null;
  const active = readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => entry.name).sort();

  const lines = [];
  lines.push("Agent note: translate this machine digest into the user's language; never paste it verbatim.");
  if (!active.length)
    lines.push(
      "Foundation: no active change.",
      "  next: /investigate to explore a problem, or /change to commit to an outcome."
    );
  else {
    lines.push(`Foundation: ${active.length} active change(s).`);
    for (const id of active) {
      const state = readState(runtimeDir, id);
      const status = state.status || "unknown";
      lines.push(`  ${id} [${status}] next: ${nextCommand(status, id, state)}`);
      // The rule a Build session breaks most often is a shell write without
      // its workspace anchor, and the refusal arrives one wasted turn later.
      // Name the exact prefix where the session begins, so it is in context
      // before the first command instead of after the first refusal.
      if (status === "building" && typeof state.workspace?.path === "string")
        lines.push(`    Build shell: run \`cd ${
          shellDisplayArgument(state.workspace.path)}\` once, then plain commands; the shell stays there.`);
    }
    lines.push("  Proof freshness is not checked here; run `cloop changes` for readiness.");
  }

  // Shapes the host refuses as permission prompts in every phase, named once
  // here because the refusal otherwise arrives one wasted turn later.
  lines.push("  Agent shell: one plain command per call (no `cd` chains, `$VAR`/`$(…)`, " +
    "braces, or heredocs); view and change files with Read/Grep/Edit/Write, not " +
    "`sed -i`, python, or scripts.");
  const gaps = setupGaps();
  if (gaps.length)
    lines.push(`  Project setup incomplete (${gaps.join(", ")}): offer once, when it fits the user's ` +
      "request, to onboard the project (skill: onboard); `cloop doctor` lists each step.");
  const outside = outsideRootRepositories();
  if (outside.length)
    lines.push(`  Outside the working directory: ${
      outside.map((row) => `${row.id} (${row.path})`).join(", ")}; the host may refuse ` +
      "reads there, so ground them from in-root sources and read their files in their " +
      "Build repository sandbox.");

  const orphans = existsSync(runtimeDir)
    ? readdirSync(runtimeDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name.slice(0, -5))
      .filter((id) => !active.includes(id) &&
        readState(runtimeDir, id).status !== "archived")
      .sort()
    : [];
  if (orphans.length) {
    const preview = orphans.slice(0, ORPHAN_PREVIEW).join(", ");
    const rest = orphans.length > ORPHAN_PREVIEW
      ? ` (+${orphans.length - ORPHAN_PREVIEW} more)` : "";
    lines.push(`  orphan runtime state, no active change: ${preview}${rest}; run \`cloop changes\`.`);
  }
  return lines.join("\n");
}

let input = {};
input = bestEffort(() => JSON.parse(readFileSync(0, "utf8")), input); // stdin shape is the host's contract, not this hook's to enforce
// Each part is best-effort and independently guarded: no telemetry identity,
// PATH entry, or workflow digest is worth blocking a Claude session over, and
// one failing must not take another down with it.
bestEffort(() => exportSessionIdentity(input)); // best-effort
bestEffort(() => exportCliPath()); // best-effort
bestEffort(() => {
  const digest = workflowDigest();
  if (digest) process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: digest }
  }));
}); // best-effort
