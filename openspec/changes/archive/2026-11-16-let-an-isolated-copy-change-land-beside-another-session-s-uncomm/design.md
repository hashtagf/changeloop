# Design

## Work type

bugfix

## Bugfix analysis

| Part | Detail |
|---|---|
| Reproduction | Start change A; another session lands untracked files; create A's copy sandbox; the other session edits and commits those files; sync or Land A. |
| Expected | Only files the change edited in its sandbox are claimed; untouched copies of another session's uncommitted files follow the target. |
| Root cause | Copy sandboxes copy the target's untracked files, but the copy baseline and the carried-in check (preexisting, sandboxPreexisting) only know files present at change start; workspace.targetDirty, recorded at isolation, is never consulted. |

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| Edited copy still conflicts | the path is reported as a conflict and the sandbox copy is not overwritten | No separate step; the outcome is the handling | untouched-copy-forwards-on-sync |

## File map

| Tasks | Paths |
|---|---|
| T001; T003 | `.claude/harness/runtime/workflow/change-policy.mjs` |
| T001 | `.claude/harness/tests/change-policy-surface.test.mjs` |
| T002; T003 | `.claude/harness/runtime/workflow/sandbox-runtime.mjs` |
| T002 | `.claude/harness/tests/sandbox-runtime-sync.test.mjs` |

`+` add · `~` change · `-` remove

```text
.
└── .claude/
    └── harness/
        ├── runtime/
        │   └── workflow/
        │       ├── ~ change-policy.mjs
        │       └── ~ sandbox-runtime.mjs
        └── tests/
            ├── ~ change-policy-surface.test.mjs
            └── ~ sandbox-runtime-sync.test.mjs
```

## Test map

| Scenario | Level | Check | Task |
|---|---|---|---|
| Untouched foreign file is not claimed; Edited foreign file is still claimed | task check | `node --test .claude/harness/tests/change-policy-surface.test.mjs` | T001 |
| Untouched copy fast-forwards; Edited copy still conflicts | task check | `node --test .claude/harness/tests/sandbox-runtime-sync.test.mjs` | T002 |
| Untouched foreign file is not claimed; Edited foreign file is still claimed; Untouched copy fast-forwards; Edited copy still conflicts | task check | `env -u CLAUDE_FOUNDATION_PROJECT -u CLAUDE_PROJECT_DIR bash .claude/tests/run-all.sh` | T003 |
