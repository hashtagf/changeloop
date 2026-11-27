# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | change review-closure-pass-waves-do-not-consume-budget: reviewer รายงาน f1 major ที่ .claude/harness/runtime/evidence/proof-execution-runtime.mjs ซึ่งอยู่นอก task paths ได้ REPAIR ให้ใช้ authority reset-infra พร้อม decision ref ของผู้ใช้ |
| สาเหตุที่แท้จริง | findingScopeBinding คืน issue เมื่อ path ไม่ตรงกับ review scope และ configured reviewer ถือทุก issue ของ finding เป็นผลรีวิวที่ bind ไม่ได้ |
| หลักฐาน regression | เทสต์ใน configured-reviewer.test.mjs ที่ finding ชี้ไฟล์จริงนอก scope ได้ผล fail ปกติพร้อม outsideScope และไฟล์ที่ไม่มีอยู่หรือกำกวมยังถูกปฏิเสธ |

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ไฟล์จริงนอก scope | ผลรีวิวเป็น fail ปกติ finding มี path root/b.js และ outsideScope true | No separate step; the outcome is the handling | outside-scope-finding-is-repairable |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/evidence/review-result-validation.mjs`, `.claude/harness/tests/configured-reviewer.test.mjs`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   └── evidence/
│       │       └── ~ review-result-validation.mjs
│       └── tests/
│           └── ~ configured-reviewer.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| ไฟล์จริงนอก scope; ไฟล์ที่ไม่มีอยู่; ชื่อกำกวม | task check | `node --test .claude/harness/tests/configured-reviewer.test.mjs` | T001 |
