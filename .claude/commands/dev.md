---
description: Compose investigate?, change, build, prove, land, deliver.
argument-hint: <intent> [--through proven|archived|delivered] | --resume <change> | --plan-only <intent>
---

Run **$ARGUMENTS** to its target: `--through`, the request's words,
else ask with spec approval (or at `proven`).

1. `.claude/commands/investigate.md` only for an unknown cause or feasibility.
2. `.claude/commands/change.md`: read it once, now.
3. `.claude/commands/build.md`,
   4. `.claude/commands/prove.md`: read each only for a failure, stale proof,
   or a non-`EDIT` action.
5. `.claude/commands/land.md`, only with Land authority, at a Land boundary.
6. `.claude/commands/deliver.md` for `delivered`.

Pause only at user gates or real boundaries. `archived`/`delivered` grant Land
(every `advance --through archived`); else stop at `proven`. `--resume`:
`advance` skips completed Build work and reuses fresh evidence.
`--plan-only`: Change only. Do not reread framework files.
