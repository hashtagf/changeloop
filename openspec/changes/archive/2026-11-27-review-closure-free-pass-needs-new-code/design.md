# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | CI run 46008188889 (daabc99c) ชุด feedback review: provider rename, lowered history และ receipt deletion ต้องได้ REVIEW_ROUTE_COMPLETE แต่ได้รีวิวรอบสามบน workspace เดียวกับรอบสอง |
| สาเหตุที่แท้จริง | effectiveReviewAttemptLimit นับรอบ pass ที่ workspace ต่างจากปัจจุบันเป็นรอบฟรี โดยไม่ดูว่ารอบล่าสุดรีวิว workspace ปัจจุบันไปแล้ว |
| หลักฐาน regression | เทสต์ใน authority-request-operation.test.mjs ที่ pass สองรอบแล้วขอรอบสามบน workspace ของรอบล่าสุดต้องได้เพดาน 2 และชุด run-feedback-review-tests.sh ผ่าน |

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| pass สองรอบ แล้วขอรอบสามบนโค้ดเดิม | เพดานเป็น 2 จึงปฏิเสธรอบสาม | No separate step; the outcome is the handling | free-pass-needs-new-code |

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
| pass สองรอบ แล้วขอรอบสามบนโค้ดเดิม; pass แล้วแก้โค้ด | task check | `node --test .claude/harness/tests/authority-request-operation.test.mjs` | T001 |
