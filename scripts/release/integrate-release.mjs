#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

function git(cwd, args, options = {}) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", ...options });
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}

function tryGit(cwd, args) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

// Bring a published release commit into the latest main branch without
// resetting or rewriting commits that landed after the release candidate.
export function integrateReleaseIntoMain({ cwd = process.cwd(), release, main, message }) {
  if (!release || !main) throw new Error("release and main revisions are required");
  const releaseSha = git(cwd, ["rev-parse", `${release}^{commit}`]);
  const mainSha = git(cwd, ["rev-parse", `${main}^{commit}`]);
  const current = git(cwd, ["rev-parse", "HEAD"]);
  git(cwd, ["switch", "--detach", mainSha]);
  const merged = tryGit(cwd, ["merge", "--no-ff", "--no-edit", "-m", message || `Merge ${release} into main`, releaseSha]);
  if (merged.status !== 0) {
    tryGit(cwd, ["merge", "--abort"]);
    git(cwd, ["switch", "--detach", current]);
    throw new Error(`release ${release} conflicts with ${main}; integrate it manually: ${(merged.stderr || merged.stdout).trim()}`);
  }
  const integrated = git(cwd, ["rev-parse", "HEAD"]);
  for (const commit of [releaseSha, mainSha])
    git(cwd, ["merge-base", "--is-ancestor", commit, integrated]);
  return { release: releaseSha, main: mainSha, integrated };
}

function argument(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1] || args[index + 1].startsWith("--"))
    throw new Error(`${name} requires a value`);
  return args[index + 1];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const report = integrateReleaseIntoMain({
      release: argument(args, "--release"), main: argument(args, "--main"),
      message: args.includes("--message") ? argument(args, "--message") : undefined
    });
    process.stdout.write(`${JSON.stringify(report)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
