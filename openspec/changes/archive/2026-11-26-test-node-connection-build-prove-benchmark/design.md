# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | paid e2e project-tracker-api บน Claude Code ที่ e9ee244c: test ใช้ fetch กับ server ใน test ทุกตัวผ่าน แต่ node --test ไม่จบ advance ถูกตัดสองครั้ง รวม 56 นาที; หลังรอบซ่อม oracle รันบนผลงานสุดท้ายได้ 33/33 แต่ scorecard รายงาน 32/33 จากผลก่อนซ่อม เหมือน Pi ที่ f046bbc0 |
| สาเหตุที่แท้จริง | node --test รอ handle ที่ยังเปิดอยู่ และ NODE_OPTIONS ไม่รับ --test-force-exit; ส่วน runner ของ benchmark ออกจาก loop ซ่อมโดยไม่รัน oracle ซ้ำเมื่อ envelope ของรอบซ่อมไม่ได้ระบุ proven |
| หลักฐาน regression | test รัน task verify node --test ที่มี keep-alive connection ค้างแล้วจบภายในไม่กี่วินาทีพร้อมผลผ่าน และ test ของ runner ที่รอบซ่อมไม่มี envelope proven แล้ว oracle ถูกรันซ้ำ |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** แทรก --test-force-exit ใน argv ของคำสั่งที่ขึ้นต้นด้วย node และมี --test ทั้ง task verify, provider และ base run ของ test discrimination
  - **Why:** NODE_OPTIONS ไม่รับ flag นี้ และ test ที่ผ่านแล้วไม่ควรรอ handle ที่ไม่เกี่ยวกับผล
  - **Rejected:** none
  - **Consequences:** handle ที่ test ลืมปิดไม่ทำให้ค้างอีก แต่ระบบก็ไม่ได้เตือนเรื่องนี้
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** runner ของ benchmark รัน oracle ซ้ำหลังทุกรอบซ่อมก่อนออกจาก loop
  - **Why:** ผลที่รายงานต้องเป็นของงานล่าสุด
  - **Rejected:** none
  - **Consequences:** รอบซ่อมที่จบโดยไม่มี envelope proven ยังได้คะแนนจริง

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| connection keep-alive ค้าง | คำสั่งจบภายในไม่กี่วินาทีและ task ผ่าน | No separate step; the outcome is the handling | node-test-force-exit |
| test ล้ม | คำสั่งจบเร็วและ task ล้ม | No separate step; the outcome is the handling | node-test-force-exit |
| รอบซ่อมไม่มี envelope proven | oracle ถูกรันซ้ำ และผลนั้นคือผลที่รายงาน | No separate step; the outcome is the handling | bench-oracle-after-repair |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/evidence/`, `.claude/harness/runtime/workflow/`, `.claude/harness/tests/node-test-force-exit.test.mjs` (add), `.claude/tests/run-all.sh`, `.claude/tests/README.md`, `CHANGELOG.md` |
| T002 | `.claude/tests/bench/openspec-native/run.mjs`, `.claude/tests/bench/tests/openspec-native-runner.test.mjs` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── harness/
│   │   ├── runtime/
│   │   │   ├── ~ evidence/
│   │   │   └── ~ workflow/
│   │   └── tests/
│   │       └── + node-test-force-exit.test.mjs
│   └── tests/
│       ├── bench/
│       │   ├── openspec-native/
│       │   │   └── ~ run.mjs
│       │   └── tests/
│       │       └── ~ openspec-native-runner.test.mjs
│       ├── ~ README.md
│       └── ~ run-all.sh
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| connection keep-alive ค้าง; test ล้ม; คำสั่งอื่น | task check | `node --test .claude/harness/tests/node-test-force-exit.test.mjs` | T001 |
| รอบซ่อมไม่มี envelope proven | task check | `node --test .claude/tests/bench/tests/openspec-native-runner.test.mjs` | T002 |
