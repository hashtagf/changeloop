# Design

## Work type

docs

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** รวมช่วง 3 และ 4 เป็น change เดียว
  - **Why:** ทั้งคู่แก้แค่ข้อความคำสั่ง และแยกกันจะชนกันที่ CHANGELOG ตอน Land
  - **Rejected:** none
  - **Consequences:** อนุมัติและ Land พร้อมกัน

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/skills/brainstorming/SKILL.md`, `.claude/tests/harness/run-context-budget-tests.sh` |
| T002 | `.claude/harness/runtime/evidence/review-diff.mjs`, `.claude/harness/runtime/evidence/configured-reviewer.mjs`, `.claude/harness/tests/configured-reviewer.test.mjs`, `.claude/harness/EVIDENCE.md`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── harness/
│   │   ├── ~ EVIDENCE.md
│   │   ├── runtime/
│   │   │   └── evidence/
│   │   │       ├── ~ configured-reviewer.mjs
│   │   │       └── ~ review-diff.mjs
│   │   └── tests/
│   │       └── ~ configured-reviewer.test.mjs
│   ├── skills/
│   │   └── brainstorming/
│   │       └── ~ SKILL.md
│   └── tests/
│       └── harness/
│           └── ~ run-context-budget-tests.sh
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| มีขั้นหาจุดอ่อน; ไม่ชมไอเดียผู้ใช้; อยู่ในงบคำ | task check | `bash .claude/tests/harness/run-context-budget-tests.sh` | T001 |
| รีวิวเต็มมีคำสั่ง; diff-only และ delta มีคำสั่ง; ไม่เปลี่ยนเกณฑ์ผ่าน | task check | `node --test .claude/harness/tests/configured-reviewer.test.mjs` | T002 |
