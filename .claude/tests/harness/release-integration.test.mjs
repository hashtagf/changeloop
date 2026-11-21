import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { integrateReleaseIntoMain } from "../../../scripts/release/integrate-release.mjs";

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "foundation-release-integration-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, "init", "-q", "-b", "main");
  git(root, "config", "user.email", "test@example.com");
  git(root, "config", "user.name", "Test");
  writeFileSync(join(root, "VERSION"), "1.0.0\n");
  writeFileSync(join(root, "feature.txt"), "candidate\n");
  git(root, "add", ".");
  git(root, "commit", "-q", "-m", "candidate");
  return { root, candidate: git(root, "rev-parse", "HEAD") };
}

test("a release from candidate A is merged after main has advanced to B", (t) => {
  const { root, candidate } = repository(t);
  writeFileSync(join(root, "later.txt"), "B\n");
  git(root, "add", "later.txt");
  git(root, "commit", "-q", "-m", "later work");
  const main = git(root, "rev-parse", "HEAD");
  git(root, "switch", "--detach", candidate);
  writeFileSync(join(root, "VERSION"), "1.0.1\n");
  git(root, "commit", "-qam", "release");
  const release = git(root, "rev-parse", "HEAD");

  const result = integrateReleaseIntoMain({ cwd: root, release, main });

  assert.equal(result.main, main);
  assert.equal(readFileSync(join(root, "later.txt"), "utf8"), "B\n");
  assert.equal(readFileSync(join(root, "VERSION"), "utf8"), "1.0.1\n");
  git(root, "merge-base", "--is-ancestor", main, result.integrated);
  git(root, "merge-base", "--is-ancestor", release, result.integrated);
});

test("a conflicting later main stops before publication can overwrite it", (t) => {
  const { root, candidate } = repository(t);
  writeFileSync(join(root, "VERSION"), "main-edit\n");
  git(root, "commit", "-qam", "later version edit");
  const main = git(root, "rev-parse", "HEAD");
  git(root, "switch", "--detach", candidate);
  writeFileSync(join(root, "VERSION"), "1.0.1\n");
  git(root, "commit", "-qam", "release");
  const release = git(root, "rev-parse", "HEAD");

  assert.throws(() => integrateReleaseIntoMain({ cwd: root, release, main }), /conflicts with/);
  assert.equal(git(root, "rev-parse", "HEAD"), release);
  assert.equal(git(root, "status", "--porcelain"), "");
  assert.equal(git(root, "rev-parse", "main"), main);
});
