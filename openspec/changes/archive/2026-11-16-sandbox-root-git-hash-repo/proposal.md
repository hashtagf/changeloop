# Change: sandbox ของ root ที่ไม่ใช่ git ไม่คัดลอกและไม่ hash repo ย่อย

- **Change:** `sandbox-root-git-hash-repo` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ในโฟลเดอร์รวมหลาย repo ที่ไม่ใช่ git (all-repo-ms) change ที่แก้ 3 ไฟล์ใน lobby-theme ใช้ build รอบละ ~10 นาทีและ prove เกิน 20 นาทีโดยยังไม่ถึงขั้น test เพราะ sandbox ของ root คัดลอกทั้ง 17 GB รวม repo ที่มี sandbox แยกแล้ว และ manifest เก็บ hash ทุกไฟล์จน state โตเป็น 115 MB change นี้ทำให้ sandbox และ manifest ของ root ข้าม repo ย่อยทั้งหมด

## ขอบเขต

- **In scope (`sandbox`):** การคัดลอก sandbox ของ root ที่ไม่ใช่ git; manifest baseline/sandboxBaseline ของ root ที่ไม่ใช่ git
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/sandbox-runtime.mjs`, `.claude/harness/runtime/core/state-runtime.mjs`, `.claude/harness/tests/non-git-root-sandbox.test.mjs`, `website/docs/src/content/docs/multi-repository.md`, `website/docs/src/content/docs/th/multi-repository.md`; the authored Non-goals below

## Non-goals

- เปลี่ยน sandbox ของ repo ที่ประกาศ
- เปลี่ยนพฤติกรรมของ root ที่เป็น git
- ลดขนาด state file ด้วยการเปลี่ยนรูปแบบเก็บข้อมูล

## ผลกระทบและความเสี่ยง

- root ที่เป็น git ไม่เปลี่ยน
- change ที่กำลังทำอยู่ใน root ที่ไม่ใช่ git ใช้ sandbox เดิมต่อได้ การเร่งความเร็วมีผลกับ sandbox ที่สร้างใหม่

- **Impact:** medium
- **Coupling:** coupled
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

โฟลเดอร์รวมหลาย repo ที่ root ไม่ใช่ git: sandbox ของ root ไม่คัดลอก repo ที่ประกาศ (มี sandbox แยกอยู่แล้ว) และ repo ย่อยที่ไม่ได้ประกาศ และ manifest ของ root ไม่ไล่ hash ไฟล์ในนั้น

## วิธีตรวจด้วยตัวเอง

รัน `node --test .claude/harness/tests/non-git-root-sandbox.test.mjs` แล้วรัน `bash .claude/tests/run-all.sh`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| Sandbox ของ root ที่ไม่ใช่ git ไม่รวม repo ย่อย | repo ที่ประกาศไม่ถูกคัดลอกเข้า sandbox ของ root | success | T001, T002 | test: `.claude/harness/tests/non-git-root-sandbox.test.mjs` | — |
|  | repo ที่ไม่ได้ประกาศไม่ถูกคัดลอก | success | T001, T002 |  |  |
|  | ไฟล์ control plane ของ root ยังอยู่ | boundary | T001, T002 |  |  |
|  | root ที่เป็น git ไม่เปลี่ยน | boundary | T001, T002 |  |  |
|  | แก้ไฟล์ใน repo ที่ไม่ได้ประกาศ | failure | T001, T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (5).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for non-git-root-sandbox-scope.

## Appendix: Amendment history

- Revision 1 (2026-11-16): The Land refusal for files written into an undeclared nested repository lives in the copy apply path, so T001 also owns apply-runtime.mjs

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | reapply-bypasses-nested-guard: The new nested-repository check only runs inside copyApplyCodePaths (line 570). The re-apply path, reapplyCodePaths → copyCodePaths, goes around it. A first apply would already have refused the change, so normally nothing gets through. But re-applying for a sandbox that was applied before this change could still project a file below an undeclared nested checkout into that checkout. Putting the check in copyCodePaths would cover both paths. (root/.claude/harness/runtime/workflow/apply-runtime.mjs:1056) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | land-test-stubs-codepaths: The Land test passes a hand-written copyCodePaths and calls copyApplyCodePaths directly. It never checks that the real copyCodePaths (the diff between the stored baseline and the sandbox file list) produces archive/other/added.js. Today it does, because the sandbox's archive/other has no .git and so is not skipped. A regression in that half of the flow would still pass this test. (root/.claude/harness/tests/non-git-root-sandbox.test.mjs:122) | minor | ยังเปิดอยู่ | claude-opus |
