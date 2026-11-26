# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | paid e2e project-tracker-api บน Claude Code ที่ d7f2990f: test 10 ตัว ผ่านบนโค้ดใหม่ ล้ม 9 ตัวบน seed แต่ CASE_TESTS_EXIST fail เพราะ pass < 15 |
| สาเหตุที่แท้จริง | oracle/check.mjs ตั้งเกณฑ์ delivered.pass >= 15 ที่ไม่มีในโจทย์ |
| หลักฐาน regression | test ของ workload รัน oracle กับ reference solution ที่มี test ตัวเดียวที่ล้มบน seed แล้วได้ pass และ test ที่ผ่านบน seed ด้วยได้ fail |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** ตัดเกณฑ์จำนวน test ขั้นต่ำ เหลือ: suite ผ่าน มี test อย่างน้อยหนึ่งตัว และล้มเมื่อใช้ src ของ seed
  - **Why:** โจทย์ไม่ได้บอกจำนวน และการล้มบนโค้ดเดิมคือหลักฐานว่า test ตรวจพฤติกรรมจริง
  - **Rejected:** none
  - **Consequences:** คะแนนรอบใหม่ของข้อนี้เทียบกับ 3.7.8 ไม่ได้ตรงทุกประการ แต่ 3.7.8 ผ่านข้อนี้อยู่แล้ว จึงยังผ่านตามเกณฑ์ใหม่

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| test น้อยตัวที่ตรวจจริง | CASE_TESTS_EXIST เป็น pass | No separate step; the outcome is the handling | tracker-tests-exist-no-count |
| test ที่ไม่ตรวจอะไร | CASE_TESTS_EXIST เป็น fail | No separate step; the outcome is the handling | tracker-tests-exist-no-count |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/tests/bench/tasks/23-project-tracker-api/oracle/check.mjs`, `.claude/tests/bench/tests/openspec-native-workloads.test.mjs`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── tests/
│       └── bench/
│           ├── tasks/
│           │   └── 23-project-tracker-api/
│           │       └── oracle/
│           │           └── ~ check.mjs
│           └── tests/
│               └── ~ openspec-native-workloads.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| test น้อยตัวที่ตรวจจริง; test ที่ไม่ตรวจอะไร; ไม่มี test | task check | `node --test --test-name-pattern=project-tracker .claude/tests/bench/tests/openspec-native-workloads.test.mjs` | T001 |
