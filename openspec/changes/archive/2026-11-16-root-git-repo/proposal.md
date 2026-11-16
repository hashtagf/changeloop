# Change: การสแกนของ root ที่เป็น git รวมไฟล์ของ repo ที่ประกาศ

- **Change:** `root-git-repo` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ถ้าตั้ง git ที่ root ของโฟลเดอร์รวม repo โดย ignore repo ย่อยไว้ (ทางเร่ง sandbox ของ all-repo-ms) การสแกนตอนเริ่ม change จะเห็นเฉพาะไฟล์ control ของ root ไม่เห็นไฟล์ของ repo ที่จะแก้ ปัญหาเดียวกันเกิดกับ submodule ที่ root track เป็นแค่ gitlink change นี้ให้ root ที่เป็น git รวมไฟล์ของ repo ที่ประกาศเข้าในการสแกนด้วย

## ขอบเขต

- **In scope (`change`):** ชุดไฟล์ที่ repository intelligence สแกนเมื่อ root เป็น git และมี repo ย่อยที่ประกาศ
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/change-lifecycle.mjs`, `.claude/harness/tests/repository-intelligence.test.mjs`, `website/docs/src/content/docs/multi-repository.md`, `website/docs/src/content/docs/th/multi-repository.md`; the authored Non-goals below

## Non-goals

- เปลี่ยนการสแกนของ root ที่ไม่ใช่ git
- เปลี่ยนเพดานการสแกน

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** coupled
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Change intake ของ root ที่เป็น git สแกนไฟล์ของ repo ย่อยที่ประกาศ (และที่ draft เลือก) ด้วย ไม่ใช่เฉพาะไฟล์ที่ root track

## วิธีตรวจด้วยตัวเอง

รัน `node --test .claude/harness/tests/repository-intelligence.test.mjs` แล้วรัน `bash .claude/tests/run-all.sh`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| Repository intelligence ของ root ที่เป็น git รวม repo ที่ประกาศ | repo ที่ root ignore ถูกสแกน | success | T001, T002 | test: `.claude/harness/tests/repository-intelligence.test.mjs` | — |
|  | draft เลือก repo บางตัว | boundary | T001, T002 |  |  |
|  | ไฟล์ที่ repo ignore ไม่ถูกสแกน | boundary | T001, T002 |  |  |
|  | root เป็น git ที่ไม่มี repo ประกาศ | boundary | T001, T002 |  |  |
|  | repo ที่ประกาศไม่มีอยู่ | failure | T001, T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (5).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for git-root-declared-repo-scan.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | docs-unscoped-sandbox-sentence: The docs hunk adds a sentence that is not part of this change: that the root's sandbox and file manifests skip every nested repository, and that Land refuses a file written into an undeclared one. That behavior lives in `sandbox-runtime.mjs` and `apply-runtime.mjs`, which are outside this change's surface, and it does not trace to any claim in the agreement. The same sentence is mirrored in `th/multi-repository.md:108-110`. Move it into the change that ships that behavior, or confirm that behavior is already on the base. Non-blocking. (root/website/docs/src/content/docs/multi-repository.md:110) | minor | ยังเปิดอยู่ | claude-opus |
