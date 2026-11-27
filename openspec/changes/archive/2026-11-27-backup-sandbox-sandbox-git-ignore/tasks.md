# Tasks

> This is the sole implementation ledger.

- [x] **T001** writeSandboxBackup ตัด exclude ที่ชี้ path ที่ถูก ignore ออกก่อน git add พร้อมเทสต์และ CHANGELOG [key:backup-pathspec] [kind:implementation] [paths:.claude/harness/runtime/workflow/sandbox/sandbox-preservation.mjs,.claude/harness/tests/sandbox-data-loss.test.mjs,CHANGELOG.md] [claims:backup-ignored-exclude-backup-sandbox,backup-ignored-exclude-backup-sandbox-2] — verify: `node --test .claude/harness/tests/sandbox-data-loss.test.mjs`
