# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | change test-process-server-connection-build-prove-onboard: wave 1 fail, wave 2 pass, แก้ type error หลังรีวิว ได้ ASK_USER All 2/2 AI review waves; หลังแก้ข้อตกลง wave 3 fail, แก้แล้วได้ ASK_USER อีกครั้ง |
| สาเหตุที่แท้จริง | effectiveReviewAttemptLimit นับทุกรอบที่ส่งผลแล้วรวมรอบที่ผ่าน และ reviewClosureWaveAvailable ต้องการรอบส่งผลพอดีสองรอบ |
| หลักฐาน regression | เทสต์ใน authority-request-operation.test.mjs สำหรับ fail-pass, fail-pass-fail, pass ซ้ำเกินเพดาน และ fail-fail ที่ยังต้องถามผู้ใช้ |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** รอบรีวิว AI ที่ผลเป็น pass ไม่นับในเพดาน สูงสุด 3 รอบต่อ change เกินจากนั้นนับตามปกติ
  - **Why:** เพดานมีไว้หยุดวงที่รีวิวไม่ผ่านซ้ำ รีวิวที่ผ่านแล้วหมดอายุเพราะโค้ดเปลี่ยนตามด่านอื่นไม่ใช่วงแบบนั้น จึงไม่ควรหยุดผู้ใช้
  - **Rejected:** none
  - **Consequences:** change หนึ่งใช้รีวิว AI ได้มากขึ้นสูงสุด 3 รอบเมื่อรอบเหล่านั้นผ่าน

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| fail แล้ว pass แล้วโค้ดเปลี่ยน | เพดานเป็น 3 จึงรีวิวรอบ 3 ได้เอง | No separate step; the outcome is the handling | pass-waves-do-not-consume-budget |
| fail pass fail แล้วแก้ | เพดานเป็น 4 (closure wave จากรอบที่ไม่ผ่านสองรอบ บวกรอบ pass หนึ่งรอบ) | No separate step; the outcome is the handling | pass-waves-do-not-consume-budget |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/core/authority-policy.mjs`, `.claude/harness/tests/authority-request-operation.test.mjs`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   └── core/
│       │       └── ~ authority-policy.mjs
│       └── tests/
│           └── ~ authority-request-operation.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| fail แล้ว pass แล้วโค้ดเปลี่ยน; fail pass fail แล้วแก้; fail สองรอบติด; pass เกินสามรอบ | task check | `node --test .claude/harness/tests/authority-request-operation.test.mjs` | T001 |
