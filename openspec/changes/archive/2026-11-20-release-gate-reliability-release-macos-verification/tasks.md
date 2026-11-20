# Tasks

> This is the sole implementation ledger.

- [x] **T001** แยกจังหวะ readiness จากเวลาตายตัวและลดการแข่งขันทรัพยากรของ release gate [key:release-checks] [kind:implementation] [paths:.claude/harness/tests/process-runtime.test.mjs,.github/workflows/release.yml] [claims:release-macos-verification-process-runtime-coverage,release-macos-verification-deterministic-gate] — verify: `node --test .claude/harness/tests/process-runtime.test.mjs`
