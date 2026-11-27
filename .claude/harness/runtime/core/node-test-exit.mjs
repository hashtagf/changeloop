import { basename } from "node:path";
import { SLOW_CHECK_MS, slowCheckMessage } from "./check-reuse.mjs";
import { emitSignal } from "./signals.mjs";
import { SHIPPED_DURATION_PATTERNS } from "./test-durations.mjs";

// `node --test` waits for every open handle before it exits. A test that
// passes but leaves a server or a keep-alive connection open (a paid
// project-tracker-api run used fetch against its own server) kept Build and
// Prove waiting until the ten-minute cap, twice. NODE_OPTIONS refuses
// --test-force-exit, so the harness adds it to the argv it runs itself.
// `tsx --test` runs the same runner and takes the same flag, but only before
// the file list: a consumer's `npx tsx --test` official-parity run passed in
// 7s and then waited 360s for its server, on every one of seven runs.
const FLAG = "--test-force-exit";
const NODE = /^node(?:\.exe)?$/;
const TSX = /^tsx(?:\.cmd)?$/;
const NPX = /^npx(?:\.cmd)?$/;
// Options whose value is the next argument (`node --import tsx --test`): that
// value is not the script.
const VALUE_OPTIONS = new Set(["--import", "--require", "-r", "--loader", "--experimental-loader",
  "--env-file", "--env-file-if-exists", "--conditions", "-C", "--tsconfig", "--test-reporter",
  "--test-reporter-destination", "--test-name-pattern", "--test-concurrency", "--input-type",
  "--test-timeout", "--test-shard", "--test-skip-pattern", "--watch-path",
  "--test-coverage-include", "--test-coverage-exclude"]);
const escaped = [...VALUE_OPTIONS].map((option) => option.replace(/[-]/g, "\\-")).join("|");
// `node [options] --test` in a shell line: an option is a flag (`--x`,
// `--x=v`) or a value option and its value, so a script before `--test`
// (`node scripts/x.js --test`) never matches.
const SHELL_TEST = new RegExp(
  `(^|&&|\\|\\||;|\\()(\\s*)((?:npx\\s+(?:-\\S+\\s+)*)?(?:node|tsx)(?:\\s+(?:(?:${escaped})\\s+[^\\s;&|()]+|--?[A-Za-z][\\w-]*(?:=[^\\s;&|()]+)?))*?)(\\s+)--test(?=\\s|\\)|$)`,
  "g");

export function forceExitLine(line) {
  const text = String(line);
  return text.includes(FLAG) ? text : text.replace(SHELL_TEST, (match, start, space, head, gap) =>
    head.split(/\s+/).includes("--test") ? match : `${start}${space}${head}${gap}--test ${FLAG}`);
}

// The index of the first script argument at or after `from`, or -1.
function scriptIndex(args, from) {
  for (let index = from; index < args.length; index += 1) {
    const arg = String(args[index]);
    if (VALUE_OPTIONS.has(arg)) index += 1;
    else if (!arg.startsWith("-")) return index;
  }
  return -1;
}

function withFlag(command, args, from) {
  const at = args.indexOf("--test", from);
  // `--test` after the script (`tsx scripts/x.ts --test`) is the script's own argument.
  const script = scriptIndex(args, from);
  if (at < 0 || (script >= 0 && script < at) || args.includes(FLAG)) return { command, args };
  return { command, args: [...args.slice(0, at + 1), FLAG, ...args.slice(at + 1)] };
}

// The index after `tsx` in `npx [options] tsx ...`, or -1.
function npxTsxStart(args) {
  let at = 0;
  while (at < args.length && String(args[at]).startsWith("-")) at += 1;
  return TSX.test(String(args[at] || "")) ? at + 1 : -1;
}

// A command the harness cannot rewrite (`npm test` running `tsx --test`)
// still waits. Its output says how long the tests themselves took: the sum of
// the top-level test durations, which over-counts files run in parallel, so a
// run far longer than even that sum waited on something after its tests.
export const LINGERING_IDLE_MS = 30000;
const SPEC_TOP = /^[✔✖] .*\((\d+(?:\.\d+)?)ms\)\s*$/gmu;
const TAP_TOP = /^(?:not )?ok \d+\b.*\n {2}---\n(?: {2}\S.*\n)*? {2}duration_ms: (\d+(?:\.\d+)?)/gm;
// Other runners print one summary time per run; turbo may print several.
// vitest `Duration  5.83s (...)`, jest `Time:  3.2 s`, Playwright `8 passed (1.6m)`.
const RUNNER_TOTALS = [
  /(?:^|\s)Duration\s+(\d+(?:\.\d+)?)(ms|s)\b/gm,
  /(?:^|\s)Time:\s+(\d+(?:\.\d+)?)\s*(ms|s)\b/gm,
  /^\s*\d+ passed \((\d+(?:\.\d+)?)(ms|s|m|h)\)/gm
];
const UNIT_MS = { ms: 1, s: 1000, seconds: 1000, m: 60000, h: 3600000 };
const ANSI = /\u001b\[[0-9;]*m/g;
// go test, pytest, cargo and RSpec times come from the shipped toolchain packs.
const PACK_TOTALS = SHIPPED_DURATION_PATTERNS;

// JUnit XML printed to the output: the top-level `testsuites` time, else the
// sum of its `testsuite` times. Null when there is no JUnit report.
function junitMs(text) {
  const suites = [...text.matchAll(/<testsuites\b[^>]*\btime="(\d+(?:\.\d+)?)"/g)];
  const rows = suites.length ? suites : [...text.matchAll(/<testsuite\b[^>]*\btime="(\d+(?:\.\d+)?)"/g)];
  return rows.length ? rows.reduce((total, row) => total + Number(row[1]) * 1000, 0) : null;
}

/** `{ testsMs, wallMs }` when the run's own tests ended long before it did, else null. */
// `patterns` replaces the shipped toolchain time patterns (a quality lane
// passes the patterns of the project's merged packs).
export function lingeringTestRun(output, wallMs, { patterns = PACK_TOTALS } = {}) {
  const text = String(output || "").replace(ANSI, "");
  const wall = Number(wallMs);
  if (!text || !Number.isFinite(wall)) return null;
  let testsMs = 0;
  let count = 0;
  for (const pattern of [SPEC_TOP, TAP_TOP])
    for (const match of text.matchAll(pattern)) {
      testsMs += Number(match[1]);
      count += 1;
    }
  for (const pattern of [...RUNNER_TOTALS, ...patterns])
    for (const match of text.matchAll(pattern)) {
      testsMs += Number(match[1]) * (UNIT_MS[match[2] || "s"] || 1000);
      count += 1;
    }
  const junit = junitMs(text);
  if (junit !== null) { testsMs += junit; count += 1; }
  // Lingering means the tests took less than half the run.
  if (!count || wall - testsMs < LINGERING_IDLE_MS || testsMs * 2 >= wall) return null;
  return { testsMs: Math.round(testsMs), wallMs: Math.round(wall) };
}

export function lingeringFix() {
  return "a test leaves a server, connection, timer or database client open and the runner waits for it: " +
    `close it in the test's after hook, or put ${FLAG} right after --test in the command or its package.json script ` +
    "(node --test, tsx --test; jest --forceExit)";
}

export function lingeringMessage(command, run) {
  return `check \`${String(command).slice(0, 160)}\`: its tests finished in ${Math.round(run.testsMs / 1000)}s ` +
    `but the run took ${Math.round(run.wallMs / 1000)}s; ${lingeringFix()}.`;
}

// A task check past SLOW_CHECK_MS raises `slow-check`: the lingering cause
// when its output shows one, the general advice otherwise.
export function noticeSlowTaskCheck(command, result, durationMs, emit = emitSignal) {
  if (!(durationMs > SLOW_CHECK_MS)) return;
  const lingering = lingeringTestRun(result?.output, durationMs);
  emit("slow-check", `NOTICE: ${lingering ? lingeringMessage(command, lingering)
    : slowCheckMessage(command, durationMs)}`);
}

// A Prove provider run whose tests ended long before it did raises `slow-check`.
// A reused task check already raised its own notice when it ran.
export function noticeLingeringProvider(execution, emit = emitSignal) {
  const { result, built } = execution || {};
  if (execution?.reusedTaskCheck || !result) return;
  const lingering = lingeringTestRun(`${result.stdout || ""}${result.stderr || ""}`, result.durationMs);
  if (lingering) emit("slow-check",
    `NOTICE: ${lingeringMessage([built?.command, ...(built?.args || [])].join(" "), lingering)}`);
}

/** The same command, with --test-force-exit for a `node --test` or `tsx --test` run. */
export function forceExitCommand(command, args = []) {
  const name = basename(String(command || ""));
  if (NODE.test(name) || TSX.test(name)) return withFlag(command, args, 0);
  if (NPX.test(name)) {
    const start = npxTsxStart(args);
    return start < 0 ? { command, args } : withFlag(command, args, start);
  }
  if (command === "sh" && args[0] === "-c" && args.length === 2)
    return { command, args: ["-c", forceExitLine(args[1])] };
  return { command, args };
}
