# Change: Land เขียน verification.md สรุปผลพิสูจน์ลงใน change ที่ archive

- **Change:** `land-verification-md-change-archive` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ตอนนี้ change ที่ archive แล้วบอกว่าต้องพิสูจน์อะไร แต่ไม่บอกผลจริง เพราะ receipt และ proof อยู่ใน `.foundation` ซึ่งไม่เข้า Git และหายเมื่อ clone ไปเครื่องอื่น ผู้ดูแล reviewer และผู้ตรวจ audit จึงต้องการสรุปผลพิสูจน์ที่อ่านได้และติดไปกับ change ที่ archive

## ขอบเขต

- **In scope (`land`):** เปิดโฟลเดอร์ archive แล้วเห็น proof run, provider, claim, ผล, คำสั่ง และ sha256 ของ receipt; Land ที่ทำต่อได้ไฟล์ byte เดียวกับรอบแรก และไม่ลบไฟล์ที่ถูกแก้; ไฟล์ที่ผู้เขียนใส่เองไม่ถูกเขียนทับ
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/apply-runtime.mjs`, `.claude/harness/runtime/workflow/validation/process-fields.mjs`, `.claude/harness/tests/archive-verification-record.test.mjs`, `.claude/harness/tests/archive-appendices.test.mjs`, `.claude/harness/lifecycle/land.md`, `website/docs/src/content/docs/loop/change.md`, … +1 more; the authored Non-goals below

## Non-goals

- ไม่คัดลอก receipt JSON, log ดิบ, path ในเครื่อง หรือ environment
- ไม่ย้าย Appendix: Review record ออกจาก proposal.md
- ไม่สร้างไฟล์ย้อนหลังให้ change ที่ archive ไปแล้ว
- ไม่เปลี่ยน PR body ของ Deliver

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Land เขียน verification.md สรุปผล proof run ที่ยอมรับไว้ในโฟลเดอร์ change ที่ archive

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| verification-record-written | Proof ผ่านมี receipt test | success | T001, T002, T003 | test: `.claude/harness/tests/archive-verification-record.test.mjs`, `.claude/harness/tests/archive-appendices.test.mjs` | — |
|  | Review มีผล | success | T001, T002, T003 |  |  |
|  | Delivery integrity ครอบไฟล์ | success | T001, T002, T003 |  |  |
|  | ไม่มีข้อมูลเครื่อง | boundary | T001, T002, T003 |  |  |
|  | Review ไม่บังคับ | boundary | T001, T002, T003 |  |  |
|  | Packet ภาษาไทย | boundary | T001, T002, T003 |  |  |
|  | Packet ที่ active ไม่มีไฟล์ | boundary | T001, T002, T003 |  |  |
|  | Receipt อ่านไม่ได้ | failure | T001, T002, T003 |  |  |
| verification-record-resume | ทำต่อหลังเขียนไฟล์ | success | T001, T003 | test: `.claude/harness/tests/archive-verification-record.test.mjs`, `.claude/harness/tests/archive-appendices.test.mjs` | — |
|  | ไฟล์ถูกแก้ระหว่างค้าง | failure | T001, T003 |  |  |
| verification-name-reserved | Packet มีไฟล์ชื่อซ้ำ | failure | T001, T003 | test: `.claude/harness/tests/archive-verification-record.test.mjs`, `.claude/harness/tests/archive-appendices.test.mjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (11).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: การสืบค้น

- **ID:** archive-proof-record
- **ผลลัพธ์:** ready-for-change
- **สรุป:** ออกแบบได้: verification.md แยกใช้จุดเดียวกับ appendix เดิม (render ก่อน archive, เขียนหลัง spec verify, ก่อน delivery integrity) Deliver/undo-land ครอบคลุมเอง งานเพิ่มคือ strip ก่อนตรวจตอนกู้ และจองชื่อไฟล์ พร้อมเข้า Change
- **เจตนาของ change:** Land เขียน openspec/changes/archive/<date>-<id>/verification.md (ภาษาเดียวกับ draft) หลัง spec sync verify ก่อน recordDeliveryIntegrity: proof run ที่ Land ยอมรับ (id, status, workspace hash, contract fingerprint), ตาราง provider·claims·status·observed·command·duration·receipt sha256, waiver/advisory, rollout gates, สถานะ review (ลิงก์ Appendix: Review record หรือเหตุผลที่ไม่บังคับ); render ก่อน openspec archive เก็บใน state.land; กู้ Land ที่ค้างลบไฟล์ที่ตรงกับข้อความที่บันทึกก่อนตรวจ approval/projection แล้วเขียนใหม่ครั้งเดียว; ไม่ลบไฟล์ที่ไม่ตรง; Land check ปฏิเสธ packet ที่มี verification.md อยู่แล้ว; ไม่ใส่ log ดิบ path เครื่อง หรือ environment; Review record คงอยู่ใน proposal.md
- **State:** .foundation/investigations/archive-proof-record.json @ 1bf4c72e1493b2799b7bb26fea19436881a7471aafd66c2000c70f83c7189786
- **Sources:** sha256:c033e832a0ab87db51cc9d2b4fe1f29ff5438e0f887afac53ac83a9ef45791e4

เป้าหมาย: change ที่ archive แล้วมีหลักฐาน review และ test ที่อ่านได้และติดไปกับ Git

ผลลัพธ์ที่ต้องการ: เปิด proposal.md ของ change ที่ archive แล้วเห็นว่า proof run ไหนผ่าน provider ใดพิสูจน์ claim ใด ด้วยคำสั่งอะไร ผลเป็นอย่างไร และ hash ของ receipt ที่ใช้ตรวจย้อนได้

### ขอบเขตและผู้เกี่ยวข้อง

- archive appendix ตอน Land
- Deliver PR body อ่านข้อมูลเดิมได้
- ผู้ดูแล repo
- reviewer ของ PR
- ผู้ตรวจ audit ภายหลัง

### ความครบของ requirement

| Source | Requirement | สถานะ | Targets | รายละเอียด |
|---|---|---|---|---|
| r-proof-in-archive@1 | Land เขียนสรุปผล proof run ที่ Land ยอมรับลงใน change ที่ archive | behavior / stated / user | requirement: verification-record-written | — |
| r-no-machine-state-commit@1 | ไม่ commit .foundation หรือ log ดิบ และไม่แก้ proof JSON ที่เครื่องสร้าง | constraint / superseded / agent | — | เป็น invariant เดิมของ repo ไม่ต้องให้ผู้ใช้ตัดสิน; → r-no-machine-state-commit@2 |
| r-no-machine-state-commit@2 | ไม่ commit .foundation หรือ log ดิบ และไม่แก้ proof JSON ที่เครื่องสร้าง (invariant เดิมของ repo ตาม AGENTS.md และกลไก appendix) | constraint / proposed / agent | — | — |
| r-resume-idempotent@1 | Land ที่ resume ต้องเขียนข้อความเดิมครั้งเดียวเหมือน appendix เดิม และอยู่ก่อน delivery integrity bind | constraint / superseded / agent | — | เป็น invariant เดิมของ repo ไม่ต้องให้ผู้ใช้ตัดสิน; → r-resume-idempotent@2 |
| r-resume-idempotent@2 | Land ที่ resume ต้องเขียนข้อความเดิมครั้งเดียวเหมือน appendix เดิม และอยู่ก่อน delivery integrity bind (invariant เดิมของ repo ตาม AGENTS.md และกลไก appendix) | constraint / proposed / agent | — | — |

ลิงก์นี้ตรวจความครบเชิงโครงสร้าง Agent ต้องตรวจความหมายกับต้นทางก่อนเสนออนุมัติ spec

### คำถามและคำตอบ

- q-shape [answered]: รูปแบบหลักฐาน test ใน archive: appendix ตารางสรุปใน proposal.md (แนะนำ) / ไฟล์ verification.md แยก / คัดลอก receipt JSON เต็ม → ไฟล์ verification.md แยกใน archive folder

### สาระจากบทสนทนา

- u-ask [user]: changeloop มีหลักฐานการ review and test ลงใน change spec หรือยัง และมีสร้าง REVIEW.md ให้ repo ที่ติดตั้งหรือยัง (session message 1)
- a-answer [agent]: REVIEW.md ถูก seed แล้ว หลักฐาน review/test ยังไม่อยู่ใน change spec (คำตอบแรกพลาดเรื่อง review — ภายหลังพบว่ามี Appendix: Review record แล้ว) (session message 2)
- u-investigate [user]: investigate design to land (session message 3)
- u-shape [user]: เลือก: ไฟล์ verification.md แยก (/questions answer d6c3f412)

## ภาคผนวก: ความครอบคลุมของการสำรวจ

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| current-behavior | covered | verification-record-written | .claude/harness/runtime/workflow/apply-runtime.mjs |  |
| input-boundary | covered | verification-record-written, verification-name-reserved |  |  |
| compatibility | covered | verification-record-resume | .claude/harness/runtime/workflow/land-undo.mjs |  |
| non-goals | covered | verification-record-written |  |  |

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ประวัติการแก้ไข

- Revision 1 (2026-11-16): The default gate requires every new harness test to be registered in .claude/tests/run-all.sh; T003 must touch that file

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: On resume, an edited archived verification.md never reaches the scenario-required stop message. stripArchiveAppendix removes the file only when its text matches the recorded summary, so an edited file stays. assertRetainedArchiveIntegrity runs next, before appendArchiveAppendix → writeVerificationRecord. In production, the archived packet's directory identity covers every file (state-runtime.mjs:266 directoryHash) and was captured before the file existed in state.land.archivePacketEntries, so assertDeliveryEntries throws 'archived delivery input changed after Land: openspec/changes/archive/<dated-id>'. With specApproval.required, approvalMatches/packetIdentity fails even earlier with 'interrupted archive no longer matches the approved agreement'. Neither message says verification.md differs from the recorded summary, and the code that does (writeVerificationRecord, line 1684) is unreachable. recoverInterruptedArchive has the same problem (lines 1415-1417). The test 'a resumed Land stops on an edited verification.md and keeps it' passes only because its pathIdentity returns the fixed 'directory:tree' for every directory. Fix: check for a changed verification.md right after stripping and before the retained-integrity and approval checks, on both paths. Make the test's directory identity depend on the files inside. (root/.claude/harness/runtime/workflow/apply-runtime.mjs:1368) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2: prepareVerificationRecord reads each receipt from .foundation and renders its status, claims and observed values next to the proof's sha256 without checking that the file's digest matches entry.sha256. A receipt changed after proof would show its new content beside the original digest. Treat a mismatched digest as unavailable. (root/.claude/harness/runtime/workflow/apply-runtime.mjs:1632) | minor | แก้แล้วในรอบ 2 | claude-opus |
