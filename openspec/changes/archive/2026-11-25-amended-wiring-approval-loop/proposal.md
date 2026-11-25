# Change: หยุดวงวนขออนุมัติสเปกซ้ำ เมื่อ harness เขียน provider wiring ระหว่าง Build ของ change ที่ถูก amend แล้ว

- **Change:** `amended-wiring-approval-loop` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-25

## เหตุผล

ระหว่าง Build ของ pi-btw-side-question มีการ amend ขอบเขตไฟล์ของ task สองครั้ง หลังจากนั้น harness เขียน execution.yaml จาก evidence wiring เอง แต่ snapshot ของ amendment ไม่มีไฟล์นี้ การตรวจอนุมัติจึงมองว่าเป็น drift ลบไฟล์ทิ้ง และขออนุมัติสเปกใหม่ทุกครั้ง ส่วน target ที่ wiring เขียนก็ถูกมองเป็นการแก้ที่ขัดกับ amendment ผู้ใช้จึงเดินงานต่อไม่ได้ทั้งที่สเปกไม่ได้เปลี่ยน

## ขอบเขต

- นับ wiring ที่ harness เขียนเองเป็นส่วนของข้อตกลงที่ amend ล่าสุด
- เลื่อน source hash เฉพาะเมื่อการเขียนของ harness เป็นการเปลี่ยน target เพียงอย่างเดียว

ไม่รวม: ผ่อนการตรวจ drift ที่ agent หรือคนแก้, change ที่ไม่ได้ amend

- **In scope (`spec-approval`):** advance หลัง wiring ไม่ลบ execution.yaml และไม่ขออนุมัติสเปกซ้ำ
- **Out of scope:** edits outside `.claude/harness/runtime/core/user-decisions.mjs`, `.claude/harness/runtime/composition/delivery-wiring.mjs`, `.claude/harness/runtime/composition/lifecycle-wiring.mjs`, `.claude/harness/tests/user-decisions.test.mjs`; the authored Non-goals below

## Non-goals

- ไม่ผ่อนการตรวจ drift ของข้อตกลงที่แก้โดย agent หรือคน
- ไม่เปลี่ยนพฤติกรรม wiring ของ change ที่ยังไม่ถูก amend
- ไม่เปลี่ยนรูปแบบไฟล์ใน packet หรือคำสั่งสาธารณะ

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** change pi-btw-side-question: amend task paths ระหว่าง Build สองครั้ง แล้ว advance --through proven วนขอ spec approval และ amended-agreement-conflict ไม่จบ
- **Root cause:** evidence wiring เขียน execution.yaml ลง target และ mirror ลง sandbox แต่ไม่อัปเดต snapshot ของ amendment ล่าสุดและ changeSourceHash จึงถูกมองเป็น drift และเป็น target edit ที่ขัดกัน
- **Regression proof:** user-decisions.test.mjs จำลอง change ที่ amend แล้วและ wiring เขียน execution.yaml แล้วตรวจว่าการอนุมัติยังผ่านและไฟล์ไม่ถูกลบ

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| การแก้ข้อตกลงจริงยังถูกกู้คืน | snapshot ไม่เปลี่ยนและการแก้ proposal ยังถูกกู้คืน | แสดงการแก้เป็น amendment | amended-wiring-carried |

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| amended-wiring-keeps-consent | wiring หลัง amend | success | T001 | test: `.claude/harness/tests/user-decisions.test.mjs` | — |
|  | target ถูกแก้จากที่อื่นก่อน | boundary | T001 |  |  |
|  | change ที่ไม่ได้ amend | boundary | T001 |  |  |
|  | การแก้ข้อตกลงจริงยังถูกกู้คืน | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
