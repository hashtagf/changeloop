# Change: เมื่อ reviewer เจอปัญหาจริงในไฟล์ของ repository ที่อยู่นอกขอบเขตที่ส่งให้รีวิว finding นั้นถูกรับเป็น finding ปกติที่ agent ซ่อมได้ แทนการถือเป็น error ที่ต้องรอผู้ใช้

- **Change:** `reviewer-repository-finding-finding-agent-error` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

เมื่อ reviewer เจอปัญหาจริงในไฟล์นอกขอบเขตของ task Prove จะไม่หยุดรอผู้ใช้อีก agent ขยาย task แล้วซ่อมต่อได้เอง

## เหตุผล

[Data] change review-closure-pass-waves-do-not-consume-budget: reviewer เจอบั๊กจริงใน proof-execution-runtime.mjs ที่อยู่นอก task paths ระบบถือทั้งรอบเป็น error ของโครงสร้างพื้นฐานและต้องใช้การตัดสินใจของผู้ใช้ผ่าน reset-infra

[Data] หลักการใน AGENTS.md: Change Loop ต้องไม่ block agent และผู้ใช้ และหยุดได้เฉพาะเมื่อต้องให้ผู้ใช้ตัดสินใจจริง

## ขอบเขต

- **อยู่ในขอบเขต (`review-closure`):** Prove ไม่หยุดรอผู้ใช้เมื่อ reviewer เจอปัญหาจริงนอก task
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ขยาย task paths ให้อัตโนมัติ (agent ขยายผ่าน change amend ตามข้อความ)
- รับ finding ที่ชี้ไฟล์ของ repository อื่นที่ไม่ได้อยู่ใน packet

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/evidence/review-result-validation.mjs`, `.claude/harness/tests/configured-reviewer.test.mjs`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| outside-scope-finding-is-repairable | ไฟล์ที่ไม่มีอยู่ | boundary | T001 | test: `.claude/harness/tests/configured-reviewer.test.mjs` | — |
|  | ชื่อกำกวม | boundary | T001 |  |  |
|  | ไฟล์จริงนอก scope | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: `outsideScope: true` is set only on the in-memory review. `normalizeReviewCompletionFindings` in `review-attempt-values.mjs:108-121` rebuilds each finding from a fixed field list (id, severity, path, line, message, claimIds, verificationCaseIds, code) and drops `outsideScope` when the attempt is stored. No code reads the flag. After persistence only the message prefix carries the information, so the spec wording 'finding มี ... outsideScope true' holds at the normalization boundary but not in the durable record. Either carry the flag through the attempt normalizer or state that the message note is the durable signal. (root/.claude/harness/runtime/evidence/review-result-validation.mjs:312) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F2: `outsideScopeBinding` rejects only paths that start with a repository id (`id/`). A submodule file named `root/services/x/file.go`, or a contract file named `openspec/changes/<id>/specs/...`, matches no scope entry and exists on disk in the root workspace. It is then accepted as `root/...` with `outsideScope: true`, so the repair targets root, not the submodule or contract repository. This conflicts with the CHANGELOG line that other-repository paths are still refused. It also lets a delta review reopen an unchanged contract sibling through the `openspec/...` spelling, although the test at `configured-reviewer.test.mjs:215-218` refuses it through `contract/...`. Exclude paths that alias to another inspected repository (the relativePath and contract-prefix aliases already computed in `findingScopeBinding`). (root/.claude/harness/runtime/evidence/review-result-validation.mjs:234) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F3: The new tests call `reviewFindingIssues` and `normalizeReviewFindingPaths` only. They never run `normalizeReview` in `configured-reviewer.mjs`, so the requirement that the result is a normal fail is not exercised. They use only the plain `src/app.mjs` spelling, not the `root/<path>` spelling the spec uses. They do not test an outside-scope finding with a line past the end of the file. They also do not test an `id/`-prefixed path for another repository, although the CHANGELOG claims that is refused. (root/.claude/harness/tests/configured-reviewer.test.mjs:221) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | G1: `outsideScopeBinding` excludes another repository's files only by the `id/` prefix and by that repository's `workspacePath`. It does not use the `relativePath` aliases that `findingScopeBinding` builds at lines 189-199 for submodule files spelled through root, such as `root/services/x/file.go`. If the root workspace has a file at that path and the submodule's workspace is a separate directory, an out-of-scope finding binds to `root/services/x/file.go`. The repair then targets root instead of the submodule. This conflicts with the CHANGELOG line that submodule paths are still refused. The new tests cover only the contract case, not a submodule `relativePath`. Skip paths that fall under another inspection's `relativePath`, and add a test. (root/.claude/harness/runtime/evidence/review-result-validation.mjs:234) | minor | ยังเปิดอยู่ | claude-opus |
