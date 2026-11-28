# Change: quality run ของ change ที่อยู่ใน sandbox อ่านไฟล์ตั้งค่าคุณภาพและ baseline จาก sandbox ของ change นั้น

- **Change:** `quality-config-from-sandbox` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

change ที่แก้การตั้งค่าคุณภาพของโปรเจกต์ถูกตรวจด้วยการตั้งค่าใหม่ของตัวเอง ไม่ใช่ค่าเก่าในโปรเจกต์หลัก

## เหตุผล

[Data] ตอนเพิ่มชั้นตรวจ mutation ให้ repo นี้ คำสั่งตรวจของงานอ่านการตั้งค่าจากโปรเจกต์หลักซึ่งยังไม่มีชั้นนั้น ผลจึงออกมาว่าไม่รองรับ agent ต้องแก้ข้อตกลงกลางทางและสร้าง baseline ใน clone ชั่วคราวแทน

[Data] change ที่ลดหรือเพิ่ม baseline คุณภาพก็ถูกเทียบกับ baseline เก่าในโปรเจกต์หลักเช่นกัน ผลตรวจจึงไม่ตรงกับสิ่งที่ change จะนำเข้า

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** change ที่แก้ quality lane หรือ baseline ถูกวัดด้วยค่าของตัวเอง
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ย้ายผลรันและ history ของ lane ออกจาก .foundation ของ project root
- quality init, discover และ readiness (อ่านจาก project root เหมือนเดิม)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

During a change's Build and Prove, `quality run` and `quality doctor` read `quality/foundation-quality.json` and the quality baselines from the change's sandbox, so a change that edits its quality lanes or baselines is measured against them rather than the target checkout's copy. Without an active change, or once the sandbox is applied, they read the project root as before.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/quality-source.mjs`, `.claude/harness/runtime/quality/quality-runtime.mjs`, `.claude/harness/tests/quality-source-sandbox.test.mjs`, `.claude/harness/CONSUMER-QUALITY.md`, `.claude/tests/run-all.sh`, `.claude/tests/README.md`, … +1 more

## Work type

bugfix

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| baseline ใน sandbox ถดถอย | lane lint fail เทียบกับ baseline ของ sandbox | No separate step; the outcome is the handling | quality-source-sandbox |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| quality-source-sandbox | lane ใหม่ใน sandbox | success | T001 | test: `.claude/harness/tests/quality-source-sandbox.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | ไม่มี change | boundary | T001 |  |  |
|  | sandbox ไม่มีไฟล์ตั้งค่า | boundary | T001 |  |  |
|  | baseline ใน sandbox ถดถอย | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-28): Agreement expanded during Build
