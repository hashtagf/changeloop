# Change: ใช้ Change Loop กับโฟลเดอร์รวม repo ที่ไม่ใช่ git ได้โดยไม่ต้องอ้อม

- **Change:** `change-loop-repo-git` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

เมื่อโฟลเดอร์รวมหลาย repo (เช่น all-repo-ms ที่มี 821 repo) ไม่ใช่ git การสแกนตอน change start เดินทุกโฟลเดอร์จนชนเพดานแล้ว block และใน /dev guard ไม่ยอมให้ Write draft แบบโฟลเดอร์หรือ openspec/repositories.yaml agent จึงต้องลดระดับผลกระทบเพื่อข้ามการสแกนและแก้ config ผ่าน shell ซึ่งเลี่ยง guard change นี้ทำให้เส้นทางปกติใช้งานได้ในโครงสร้างแบบนี้

## ขอบเขต

- **In scope (`change`):** การสแกน repository intelligence ตอน change start เมื่อ root ไม่ใช่ git; รายการไฟล์ที่ phase guard ยอมให้ Write/Edit ก่อนมี phase และใน Change; ข้อความ guard ที่ชี้ทางเขียน draft
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/change-lifecycle.mjs`, `.claude/harness/runtime/workflow/validation/repository-intelligence.mjs`, `.claude/harness/tests/repository-intelligence.test.mjs`, `.claude/hooks/phase-mutation-guard.mjs`, `.claude/hooks/phase-mutation-guard.md`, `.claude/tests/hooks/run-phase-mutation-guard-tests.sh`, … +3 more; the authored Non-goals below

## Non-goals

- คำสั่งใหม่สำหรับลงทะเบียน repo
- เปลี่ยนเพดานการสแกน
- เปลี่ยนพฤติกรรม Build, Prove หรือ Land ของ repo ซ้อน

## ผลกระทบและความเสี่ยง

- guard เปิดให้เขียนไฟล์เพิ่มสองกลุ่มก่อน Build: ไฟล์ระดับเดียวใน .foundation/drafts/<id>/ และ openspec/repositories.yaml; ไฟล์อื่นยังถูก block เหมือนเดิม
- root ที่เป็น git และ root ที่ไม่ได้ประกาศ repo ทำงานเหมือนเดิม

- **Impact:** medium
- **Coupling:** coupled
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

โฟลเดอร์รวมหลาย repo ที่ root ไม่ใช่ git: Change สแกนเฉพาะ repo ที่ประกาศไว้, และ phase guard ยอมให้เขียน draft แบบโฟลเดอร์กับ openspec/repositories.yaml ด้วย Write/Edit

## วิธีตรวจด้วยตัวเอง

รัน `node --test .claude/harness/tests/repository-intelligence.test.mjs` และ `sh .claude/tests/hooks/run-phase-mutation-guard-tests.sh` แล้วรัน `bash .claude/tests/run-all.sh`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| Repository intelligence ของ root ที่ไม่ใช่ git ใช้ repo ที่ประกาศไว้ | สแกนเฉพาะ repo ที่ประกาศ | success | T001, T003 | test: `.claude/harness/tests/repository-intelligence.test.mjs` | — |
|  | draft เลือก repo บางตัว | boundary | T001, T003 |  |  |
|  | ไฟล์ seed ที่ root ยังถูกอ่าน | boundary | T001, T003 |  |  |
|  | ไฟล์ที่ repo ignore ไม่ถูกสแกน | boundary | T001, T003 |  |  |
|  | root เป็น git | boundary | T001, T003 |  |  |
|  | ไม่ได้ประกาศ repo | failure | T001, T003 |  |  |
| Phase guard รับ draft แบบโฟลเดอร์และ repositories.yaml ก่อน Build | Write draft โฟลเดอร์ก่อนมี phase | success | T002, T003 | test: `.claude/tests/hooks/run-phase-mutation-guard-tests.sh` | — |
|  | Write repositories.yaml ก่อนมี phase | success | T002, T003 |  |  |
|  | Write repositories.yaml ใน Change | success | T002, T003 |  |  |
|  | path หลุดออกจากโฟลเดอร์ draft | boundary | T002, T003 |  |  |
|  | repositories.yaml ใน Build | boundary | T002, T003 |  |  |
|  | ไฟล์อื่นก่อนมี phase ยังถูก block | failure | T002, T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (12).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for non-git-root-scan-scope, pre-change-config-writes.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: The test 'a non-Git root scans only its declared repositories and root seeds' calls `gatheringRoot(t)` with the default `siblingEntries: 0`. The undeclared sibling `archive/unrelated` then holds one file, so `scan.entries` never gets near `maxEntries` (12,000). The claim's GIVEN is an undeclared sibling folder with more than 12,000 entries, and the result must still be `ready`. That is the exact defect this change fixes, but `assert.equal(... 'scan-entry-limit' ..., false)` passes trivially here. Example failure: if a later edit moved the `scan.entries > limits.maxEntries` check ahead of the include filter in repository-intelligence.mjs:376-383, or walked unselected directories, every test would still pass and real multi-repo roots would be blocked again. Fix: run this test (or a sibling test) with `gatheringRoot(t, { siblingEntries: 12_050 })` and assert `status === 'ready'` with no `scan-entry-limit` finding. Ideally also assert candidates fall under `services/app/` when only `app` is declared or selected. (root/.claude/harness/tests/repository-intelligence.test.mjs:385) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 2 | N1: `gitInit` ignores the result of `spawnSync('git', ['init', '-q'])`. If `git` is missing from PATH or `init` fails, the fixture still builds. The failure then shows up later as a confusing assertion (no included paths, then a whole-tree scan, then `blocked`) instead of a clear setup error. Asserting `status === 0` in `gitInit` would make fixture failures point to the real cause. This is not blocking. (root/.claude/harness/tests/repository-intelligence.test.mjs:338) | minor | ยังเปิดอยู่ | claude-opus |
| 3 | N1: `gitInit` ignores the result of `spawnSync('git', ['init', '-q'])`. If `git` is missing or `init` fails, the fixture still builds, and the problem shows up later as a confusing assertion failure: the scan falls back to the whole tree and returns `blocked` instead of `ready`. Asserting `status === 0` in `gitInit` would point fixture failures at the real cause. This is not blocking. (root/.claude/harness/tests/repository-intelligence.test.mjs:334) | minor | ยังเปิดอยู่ | claude-opus |
