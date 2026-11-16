# Tasks

> This is the sole implementation ledger.

- [x] **T001** repositoryGitPaths ของ root ที่เป็น git รวมไฟล์ของ repo ที่ประกาศและที่ draft เลือก [key:merge-declared-repo-paths] [kind:implementation] [paths:.claude/harness/runtime/workflow/change-lifecycle.mjs,.claude/harness/tests/repository-intelligence.test.mjs] [claims:git-root-declared-repo-scan-change-start-repository-intelligence,git-root-declared-repo-scan-draft-repositories-app,git-root-declared-repo-scan-3,git-root-declared-repo-scan-4,git-root-declared-repo-scan-5] — verify: `node --test .claude/harness/tests/repository-intelligence.test.mjs`
- [x] **T002** เอกสาร multi-repository บอกว่า root ที่เป็น git ก็สแกนไฟล์ของ repo ที่ประกาศ ทั้งอังกฤษและไทย [key:document-git-root-scan] [kind:implementation] [paths:website/docs/src/content/docs/multi-repository.md,website/docs/src/content/docs/th/multi-repository.md] [claims:git-root-declared-repo-scan-change-start-repository-intelligence,git-root-declared-repo-scan-draft-repositories-app,git-root-declared-repo-scan-3,git-root-declared-repo-scan-4,git-root-declared-repo-scan-5] — verify: `bash .claude/tests/docs/run-doc-consistency.sh`
