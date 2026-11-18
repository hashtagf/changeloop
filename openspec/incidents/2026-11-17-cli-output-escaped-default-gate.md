# A printed-output change passed the local gate and failed CI's installer smoke

| Field | Value |
|---|---|
| Id | 2026-11-17-cli-output-escaped-default-gate |
| Detected | 2026-11-17, by CI on PR #11 (deterministic shard 4, installer smoke) |
| Affected versions | main between 74e4b090's parent and the fix in PR #11 (never released) |
| Severity | minor (see [REVIEW.md](../../REVIEW.md#severity)) |
| Status | closed |
| Decision | Promote the slow suite that alone reads printed CLI output into the default gate for those files |
| Fix change | none (repository maintenance, PR #16) |
| Regression | `.claude/tests/harness/run-run-all-control-tests.sh` (a CLI output edit promotes the installer smoke), `.claude/tests/harness/affected-suite-selector.test.mjs` |

## Symptom

`installer: 3/389 assertion(s) FAILED`: the installer smoke matched spaced JSON
(`"version": 5`) after `change start --template` began printing compact JSON.

## Evidence

The default gate passed locally (254 suites); the slow-tier installer smoke runs
only in `--full`, so CI was the first layer to run it.

## Cause

A shipped output change had no local check: its only reader was a slow-tier suite.

## Resolution

PR #11 fixed the assertions; PR #16 added `PROMOTED` in
`.claude/tests/affected-suite-selector.mjs` so the default gate runs the
installer smoke when a file that prints CLI output changes. Lesson added to
[lessons.md](../lessons.md).
