# Change: รีวิว AI ที่ผ่านแล้วแต่ผลหมดอายุเพราะโค้ดถูกแก้ต่อไม่นับเป็นรอบที่ใช้เพดาน ทำให้ Prove รีวิวรอบใหม่ได้เองโดยไม่ต้องหยุดถามผู้ใช้

- **Change:** `review-closure-pass-waves-do-not-consume-budget` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

รีวิว AI ที่ผ่านแล้วจะไม่ถูกนับเป็นรอบที่ใช้เพดาน Prove จึงรีวิวโค้ดที่แก้ต่อได้เองโดยไม่ต้องหยุดถามผู้ใช้

## เหตุผล

[Data] change test-process-server-connection-build-prove-onboard หยุดถามผู้ใช้สองครั้ง: ครั้งแรกหลังรีวิวผ่านแล้วแก้ type error ตามด่านคุณภาพ ครั้งที่สองหลังรีวิวไม่ผ่านแล้วแก้ ทั้งที่รีวิวไม่ผ่านจริงแค่สองรอบ

[Data] mcp-mongodb-apikey หยุดรอผู้ใช้ราว 7 ชั่วโมงที่จุดเดียวกัน (.foundation/logs/gateway-hardening-docker-opt-in)

[Data] ผู้ใช้กำหนดว่า Change Loop ต้องไม่ block agent และผู้ใช้ และต้องไม่เป็นตัวถ่วงการทำงาน

## ขอบเขต

- **อยู่ในขอบเขต (`review-closure`):** ผู้ใช้ถูกถามเฉพาะเมื่อรีวิวไม่ผ่านซ้ำจนครบเพดาน
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนเพดานของรอบที่ไม่ผ่าน
- ข้ามการรีวิวโค้ดที่แก้หลังรีวิวผ่าน
- เปลี่ยนการนับรอบที่ล้มเพราะโครงสร้างพื้นฐาน

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/core/authority-policy.mjs`, `.claude/harness/tests/authority-request-operation.test.mjs`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| pass-waves-do-not-consume-budget | fail สองรอบติด | boundary | T001 | test: `.claude/harness/tests/authority-request-operation.test.mjs` | — |
|  | pass เกินสามรอบ | boundary | T001 |  |  |
|  | fail แล้ว pass แล้วโค้ดเปลี่ยน | failure | T001 |  |  |
|  | fail pass fail แล้วแก้ | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.

## Appendix: Amendment history

- Revision 1 (2026-11-27): Review found the review-exhausted stop in proof-execution-runtime.mjs still computes the cap without the current workspace, so fail/pass/fail then repair still stops the user. The fix lives outside the task's paths.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 2 | f-minor-1: `reviewClosureWaveAvailable(delivered, subject)` is now mostly redundant. It runs on the raw `delivered` list, which includes passes, and `effectiveReviewAttemptLimit` already covers the closure wave through `counted`. The two checks use different inputs, so the intent is harder to follow. The raw call still matters when `base` is not 2. (root/.claude/harness/runtime/evidence/proof-execution-runtime.mjs:475) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 2 | f-minor-2: The moved-past-pass test only asserts that the next command does not match `authority status … --template`. It never asserts that the command is the runnable `authority run`. A different non-runnable route would also pass. The arithmetic itself is covered precisely by the unit test in `authority-request-operation.test.mjs`. (root/.claude/harness/tests/proof-advance.test.mjs:937) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 3 | f-minor-delta-1: `reviewClosureWaveAvailable(delivered, subject)` is still called on the raw `delivered` list, and `effectiveReviewAttemptLimit` already counts the closure wave from the non-pass attempts. The two checks use different inputs. The raw call only adds something when the cap base is not 2, so the intent is unclear. This was reported last round and the delta did not change it, so it does not block. (root/.claude/harness/runtime/evidence/proof-execution-runtime.mjs:473) | minor | ยังเปิดอยู่ | claude-opus |
