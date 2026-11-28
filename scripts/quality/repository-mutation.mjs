#!/usr/bin/env node
// The repository's automated-mutation quality lane. Runs the semantic mutation
// suites that `.claude/tests/run-all.sh --mutation-commands` names, all at
// once, and prints one mutant report the `generic-mutation-json` adapter reads.
// The test lane runs `run-all.sh --skip-mutation`, so each suite runs once.
//
//   node scripts/quality/repository-mutation.mjs
//
// Exits 1, naming the suite, when a suite wrote no report; a surviving mutant
// is reported, and the lane's ratchet against its baseline decides.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT, isMain } from "./lib.mjs";

/** `label|command` rows, as run-all.sh prints them. */
export function suiteRows(text) {
  return String(text || "").split("\n").filter((line) => line.includes("|")).map((line) => {
    const at = line.indexOf("|");
    return { label: line.slice(0, at).replace(/^!/, ""), command: line.slice(at + 1) };
  });
}

/** One foundation-mutation-v2 row as a generic mutation row. */
export function mutantRecord(suite, row) {
  const killed = row.result === "killed" && Boolean(row.killedBy) && row.killedBy === row.expectedKiller;
  const status = row.applied === false ? "Ignored"
    : row.compiled === false ? "CompileError"
      : killed ? "Killed" : "Survived";
  return {
    id: `${suite}:${row.id}`,
    path: row.sourcePath || "unknown",
    mutatorName: "semantic-fault",
    status,
    killedBy: status === "Killed" ? [row.killedBy] : []
  };
}

function runSuite({ label, command }, report, root) {
  return new Promise((done) => {
    const child = spawn("sh", ["-c", command], {
      cwd: root, stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, HERE: join(root, ".claude/tests"), ROOT: root, FOUNDATION_RESULT_REPORT: report }
    });
    let output = "";
    child.stdout.on("data", (chunk) => { output = (output + chunk).slice(-4000); });
    child.stderr.on("data", (chunk) => { output = (output + chunk).slice(-4000); });
    child.on("close", (code) => done({ label, code, output }));
  });
}

/** Runs every suite at once; returns the combined report or the suites without one. */
export async function repositoryMutation(rows, root = ROOT) {
  const work = mkdtempSync(join(tmpdir(), "repository-mutation-"));
  try {
    const runs = await Promise.all(rows.map((row, index) => {
      const report = join(work, `${index}.json`);
      return runSuite(row, report, root).then((run) => ({ ...run, report }));
    }));
    const missing = runs.filter((run) => !existsSync(run.report));
    if (missing.length) return { missing };
    const mutants = runs.flatMap((run) =>
      (JSON.parse(readFileSync(run.report, "utf8")).mutants || []).map((row) => mutantRecord(run.label, row)));
    return { report: { mutants } };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

async function main() {
  const listed = spawnSync("sh", [join(ROOT, ".claude/tests/run-all.sh"), "--mutation-commands"],
    { cwd: ROOT, encoding: "utf8" });
  const rows = suiteRows(listed.stdout);
  if (listed.status !== 0 || !rows.length) {
    process.stderr.write("repository mutation: run-all.sh --mutation-commands listed no suites\n");
    process.exitCode = 1;
    return;
  }
  const result = await repositoryMutation(rows);
  if (result.missing) {
    for (const run of result.missing)
      process.stderr.write(`repository mutation: suite '${run.label}' wrote no report (exit ${run.code})\n${run.output}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`${JSON.stringify(result.report)}\n`);
}

if (isMain(import.meta.url)) await main();
