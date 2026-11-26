# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | paid e2e project-tracker-api ที่ f046bbc0 ทั้ง Pi และ Claude Code: agent แยก test/helpers.js และ test/support/harness.js แล้ว Prove สั่ง REPAIR tests-pass-on-base ระบุไฟล์ helper พร้อม scenario ทุกข้อ agent ต้องรวมไฟล์และรัน Prove ซ้ำ |
| สาเหตุที่แท้จริง | การรันรายไฟล์ตัดสินจาก exit code อย่างเดียว ไฟล์ที่ไม่มี test ออก exit 0 และ node --test รายงานตัวไฟล์เป็น test ที่ผ่าน จึงถูกนับว่าผ่านบนโค้ดเดิม |
| หลักฐาน regression | test รันรายไฟล์บนโค้ดเดิมที่มีไฟล์ test ล้มบนโค้ดเดิมคู่กับไฟล์ helper ใต้ test/ ที่ไม่มี test แล้วตรวจว่าไม่มี finding |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** อ่านผลของ runner: node spec/TAP ที่มีแค่บรรทัดของตัวไฟล์เอง หรือจำนวน test เป็น 0 ถือว่าไม่มี test
  - **Why:** ไฟล์ helper อยู่ใต้ test/ ได้ตามปกติ และ node --test รันทุกไฟล์ในนั้น การตัดสินจากชื่อไฟล์จะพลาดกับโปรเจกต์ที่ตั้งชื่อต่างกัน
  - **Rejected:** none
  - **Consequences:** runner อื่นที่อ่านผลไม่ออกยังใช้ exit code เหมือนเดิม

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| helper คู่กับ test ที่ดี | ไม่มี finding ของ test discrimination | No separate step; the outcome is the handling | no-test-file-not-judged |
| test จริงที่ผ่านบนโค้ดเดิม | ได้ REPAIR ที่ระบุ test/b.test.js เหมือนเดิม | No separate step; the outcome is the handling | no-test-file-not-judged |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/evidence/test-discrimination.mjs`, `.claude/harness/tests/test-discrimination-verdict.test.mjs`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   └── evidence/
│       │       └── ~ test-discrimination.mjs
│       └── tests/
│           └── ~ test-discrimination-verdict.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| helper คู่กับ test ที่ดี; test จริงที่ผ่านบนโค้ดเดิม; ผลของ runner | task check | `node --test .claude/harness/tests/test-discrimination-verdict.test.mjs` | T001 |
