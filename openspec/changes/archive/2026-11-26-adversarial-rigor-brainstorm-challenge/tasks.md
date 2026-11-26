# Tasks

> This is the sole implementation ledger.

- [x] **T001** เพิ่มขั้นหาจุดอ่อนใน brainstorming และ assertion ใน context budget test [key:brainstorm-skill] [kind:implementation] [paths:.claude/skills/brainstorming/SKILL.md,.claude/tests/harness/run-context-budget-tests.sh] [claims:brainstorm-challenge-context-budget-test-brainstorming-skill-md,brainstorm-challenge-context-budget-test-brainstorming-skill-m-2,brainstorm-challenge-context-budget-test] — verify: `bash .claude/tests/harness/run-context-budget-tests.sh`
- [x] **T002** เพิ่มคำสั่งไม่คล้อยตามใน prompt ของ code reviewer พร้อม test และเอกสาร [key:reviewer-prompt] [kind:implementation] [paths:.claude/harness/runtime/evidence/review-diff.mjs,.claude/harness/runtime/evidence/configured-reviewer.mjs,.claude/harness/tests/configured-reviewer.test.mjs,.claude/harness/EVIDENCE.md,CHANGELOG.md] [claims:reviewer-skepticism-prompt-packet-full,reviewer-skepticism-prompt-packet-diff-only-delta,reviewer-skepticism-reviewer-pass-finding] — verify: `node --test .claude/harness/tests/configured-reviewer.test.mjs`
