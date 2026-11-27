# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | mcp-mongodb-apikey change gateway-hardening-docker-opt-in: npx tsx --test tests/hardening.test.ts tests/official-parity.test.ts test ระดับบนสุดรวมราว 7 วินาที แต่ duration ของคำสั่ง 360.5 วินาที ซ้ำทุกรอบ (prove.execute 5 ครั้ง, build.task-check 2 ครั้ง) |
| สาเหตุที่แท้จริง | forceExitCommand/forceExitLine จับเฉพาะ argv หรือบรรทัดที่ขึ้นต้นด้วย node --test, quality run ไม่ใส่ force-exit เลย และไม่มีการเทียบเวลาของ test กับเวลาของคำสั่ง |
| หลักฐาน regression | test ของ node-test-exit ที่รัน tsx --test กับ server ที่ไม่ปิดแล้วต้องจบเร็ว และ test ของ lingering detection ที่ใช้ output แบบ spec และ TAP |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** เมื่อ test จบแต่คำสั่งค้าง harness ไม่ kill process เอง แต่ส่ง signal และ readiness ที่บอกเวลาและวิธีแก้
  - **Why:** การตัด process แล้วถือผลจาก output เป็นการสร้างหลักฐานที่ runner ไม่ได้ยืนยัน ส่วน --test-force-exit เป็นพฤติกรรมของ runner เอง
  - **Rejected:** none
  - **Consequences:** คำสั่งแบบ npm test ยังรอจนจบครั้งแรก แต่ agent และผู้ใช้รู้วิธีแก้ทันที

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| connection keep-alive ค้าง | คำสั่งจบภายในไม่กี่วินาทีและ task ผ่าน | No separate step; the outcome is the handling | node-test-force-exit |
| test ล้ม | คำสั่งจบเร็วและ task ล้ม | No separate step; the outcome is the handling | node-test-force-exit |
| tsx --test | --test-force-exit อยู่ถัดจาก --test | No separate step; the outcome is the handling | node-test-force-exit |
| quality lane | lane จบเร็วและผ่าน | No separate step; the outcome is the handling | node-test-force-exit |
| npm test ค้างหลัง test จบ | signal slow-check บอก 7s กับ 360s และให้เพิ่ม --test-force-exit ถัดจาก --test ใน script หรือปิด handle | No separate step; the outcome is the handling | lingering-test-run |
| readiness ของ lane ที่ค้าง | tests-fast เป็น unmet และ next บอกวิธีแก้ handle ที่ค้าง | No separate step; the outcome is the handling | lingering-test-run |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001; T002 | `.claude/harness/runtime/core/node-test-exit.mjs`, `.claude/harness/runtime/quality/quality-runtime.mjs`, `.claude/harness/tests/node-test-force-exit.test.mjs` |
| T002 | `.claude/harness/runtime/composition/delivery-wiring.mjs`, `.claude/harness/runtime/evidence/adapter-runtime.mjs`, `.claude/harness/runtime/quality/pyramid-readiness.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   ├── composition/
│       │   │   └── ~ delivery-wiring.mjs
│       │   ├── core/
│       │   │   └── ~ node-test-exit.mjs
│       │   ├── evidence/
│       │   │   └── ~ adapter-runtime.mjs
│       │   └── quality/
│       │       ├── ~ pyramid-readiness.mjs
│       │       └── ~ quality-runtime.mjs
│       └── tests/
│           ├── ~ node-test-force-exit.test.mjs
│           └── ~ pyramid-readiness.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| connection keep-alive ค้าง; test ล้ม; คำสั่งอื่น; tsx --test; quality lane | task check | `node --test .claude/harness/tests/node-test-force-exit.test.mjs` | T001 |
| npm test ค้างหลัง test จบ; test ช้าจริง; อ่านเวลา test ไม่ได้; readiness ของ lane ที่ค้าง | task check | `node --test .claude/harness/tests/node-test-force-exit.test.mjs .claude/harness/tests/pyramid-readiness.test.mjs` | T002 |
