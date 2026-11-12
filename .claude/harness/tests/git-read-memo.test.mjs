// Real-Git regression for the per-process Git read memo: a repeated listing of
// an unchanged workspace is answered without a new spawn, and every way the
// process can change that workspace — a file write through a named `node:fs`
// import, a child process, a write into `.git`, or the runtime's explicit
// `clearSnapshotCache` signal — makes the next listing re-read Git.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  gitReadMemoStats, invalidateGitReads, memoizedGitRead
} from "../runtime/core/git-read-memo.mjs";

const STATUS = ["status", "--porcelain=v1", "-z", "--untracked-files=all"];
const FOUNDATION_IGNORE = "# machine state\n*\n!.gitignore\n!README.md\n";

function repository(t) {
  const path = realpathSync(mkdtempSync(join(tmpdir(), "foundation-git-read-memo-")));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  spawnSync("git", ["init", "-q"], { cwd: path });
  invalidateGitReads();
  return path;
}

// Counts real spawns so a hit is proven by the absence of one.
function reader(cwd) {
  const counter = { spawns: 0 };
  counter.status = () => memoizedGitRead(STATUS, cwd, () => {
    counter.spawns += 1;
    return spawnSync("git", STATUS, { cwd, encoding: "utf8" });
  });
  return counter;
}

const listed = (result) => result.stdout.split("\0").filter(Boolean).map((row) => row.slice(3));

test("a repeated status of an unchanged workspace is answered from the memo", (t) => {
  const cwd = repository(t);
  writeFileSync(join(cwd, "a.txt"), "a\n");
  const git = reader(cwd);
  const first = git.status();
  const second = git.status();
  assert.equal(git.spawns, 1, "the second listing reused the first");
  assert.deepEqual(listed(second), listed(first));
  assert.deepEqual(listed(second), ["a.txt"]);
});

test("a write into the workspace forgets the listing", (t) => {
  const cwd = repository(t);
  const git = reader(cwd);
  assert.deepEqual(listed(git.status()), []);
  writeFileSync(join(cwd, "new.txt"), "x\n");
  assert.deepEqual(listed(git.status()), ["new.txt"]);
  mkdirSync(join(cwd, "dir"));
  writeFileSync(join(cwd, "dir", "nested.txt"), "y\n");
  renameSync(join(cwd, "new.txt"), join(cwd, "moved.txt"));
  assert.deepEqual(listed(git.status()).sort(), ["dir/nested.txt", "moved.txt"]);
  assert.equal(git.spawns, 3);
});

test("a write elsewhere or into an ignored .foundation keeps the listing", (t) => {
  const cwd = repository(t);
  mkdirSync(join(cwd, ".foundation", "runtime"), { recursive: true });
  writeFileSync(join(cwd, ".foundation", ".gitignore"), FOUNDATION_IGNORE);
  const outside = repository(t);
  const git = reader(cwd);
  const before = listed(git.status());
  writeFileSync(join(outside, "other.txt"), "z\n");
  writeFileSync(join(cwd, ".foundation", "runtime", "state.json"), "{}\n");
  assert.deepEqual(listed(git.status()), before);
  assert.equal(git.spawns, 1, "neither write could change this workspace's listing");
  // Editing the ignore file itself can change what Git reports.
  writeFileSync(join(cwd, ".foundation", ".gitignore"), "runtime/\n");
  assert.deepEqual(listed(git.status()).sort(), [".foundation/.gitignore"]);
  assert.equal(git.spawns, 2);
});

test("a child process, a .git write, or an explicit invalidation forgets the listing", (t) => {
  const cwd = repository(t);
  const git = reader(cwd);
  git.status();
  // A non-Git child may write anywhere.
  execFileSync(process.execPath, ["-e",
    `require("fs").writeFileSync(${JSON.stringify(join(cwd, "child.txt"))}, "c")`]);
  assert.deepEqual(listed(git.status()), ["child.txt"]);
  // A read-only Git query is not a mutation.
  spawnSync("git", ["rev-parse", "--git-dir"], { cwd });
  git.status();
  assert.equal(git.spawns, 2);
  // A mutating Git command is.
  spawnSync("git", ["add", "child.txt"], { cwd });
  assert.equal(git.status().stdout.slice(0, 2), "A ");
  assert.equal(git.spawns, 3);
  writeFileSync(join(cwd, ".git", "info-touch"), "");
  git.status();
  assert.equal(git.spawns, 4, "a write inside .git forgets every listing");
  invalidateGitReads();
  git.status();
  assert.equal(git.spawns, 5, "clearSnapshotCache's signal forgets every listing");
  assert.ok(gitReadMemoStats().hits >= 1);
});

test("only allowlisted queries are remembered", (t) => {
  const cwd = repository(t);
  let spawns = 0;
  const run = () => { spawns += 1; return spawnSync("git", ["status", "--short"], { cwd, encoding: "utf8" }); };
  memoizedGitRead(["status", "--short"], cwd, run);
  memoizedGitRead(["status", "--short"], cwd, run);
  assert.equal(spawns, 2);
});

test("asynchronous children keep the memo off until they exit, promisified or not", async (t) => {
  const cwd = repository(t);
  const git = reader(cwd);
  git.status();
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const pending = run(process.execPath, ["-e",
    `require("fs").writeFileSync(${JSON.stringify(join(cwd, "async.txt"))}, "a")`]);
  assert.ok(pending.child, "the promisified form still exposes its child");
  git.status();
  git.status();
  assert.equal(git.spawns, 3, "nothing is remembered while a child may be writing");
  const { stdout } = await pending;
  assert.equal(stdout, "");
  assert.deepEqual(listed(git.status()), ["async.txt"]);
  git.status();
  assert.equal(git.spawns, 4);
  assert.equal(gitReadMemoStats().inflight, 0);
});
