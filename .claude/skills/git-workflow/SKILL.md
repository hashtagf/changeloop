---
name: git-workflow
description: "Use when asked to branch, commit, write a commit message, rebase, merge, push, recover lost work, or open a PR. Skip read-only inspection and CI/deploy (delivery-engineering); Land never grants Git authority."
---

# Git workflow

Git mechanics after authorization; user authority and workflow guards take
precedence over convenience.

## Steps

1. Inspect status, branch, remotes, and upstream before writing. Start from a
   fresh intended base; one purpose per branch.
2. Make each commit one complete logical change that builds and tests on its
   own. Stage deliberately; exclude generated noise and unrelated cleanup.
3. Write an imperative subject naming the outcome; use the body for the reason,
   constraint, or migration the diff cannot show. Follow the repository's convention.
4. Rewrite only private history. On shared history prefer additive fixes; an
   authorized force update uses `--force-with-lease` and never touches a
   protected or default branch.
5. After rebase or merge, rerun the relevant evidence; a text-clean integration
   can still be semantically broken.
6. Before destructive commands, resolve exact targets, inspect reflog, and
   prefer a backup branch, stash, or revert.

## Harness

With Change Loop: Land preserves HEAD/index and creates no commit; Land and /dev grant no commit, push, or PR authority; use `/deliver` or a direct user instruction.
Otherwise: commit, push, or open a PR only on a direct user instruction for that operation.
Bypass hooks only with explicit approval of that risk.

## References

- `references/commit-messages.md` — subject, body, footers, breaking changes.
- `references/branching-and-rebasing.md` — branch lifetime, interactive rebase,
  force-with-lease, stacked branches, conflicts.
- `references/pull-requests.md` — PR description, scope, review feedback.
- `references/recovery.md` — reflog, fsck, recovery recipes.
