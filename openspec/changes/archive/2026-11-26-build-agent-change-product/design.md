# Design

## สถานะปัจจุบัน

change start เก็บ preexisting เฉพาะโปรเจกต์ที่มี git; copy sandbox เก็บ baseline ตอนสร้าง; Land copy mode ล้มด้วย isolated-copy conflict เมื่อโปรเจกต์ต่างจาก baseline และจากพื้นที่แยก

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | paid e2e cart-coupons บน Pi: agent เขียน src/coupons.js, src/checkout.js, test/coupons.test.js ลงโปรเจกต์ระหว่าง Change แล้วรัน rm ไฟล์เหล่านั้นหลัง sandbox ถูกสร้าง Land ล้มที่ land.check และ change ค้างที่ proven |
| สาเหตุที่แท้จริง | ไม่มีอะไรบอก agent ตอนเริ่ม Build ว่าไฟล์ที่เขียนใน Change ถูกนำเข้าพื้นที่แยกแล้วและต้องไม่แตะในโปรเจกต์ agent จึงเก็บกวาดเอง ทำให้โปรเจกต์ต่างจาก baseline ของ copy sandbox |
| หลักฐาน regression | test สร้าง change ในโปรเจกต์ที่ไม่มี git และที่มี git เขียนไฟล์ product หลัง change start แล้วสร้าง sandbox และตรวจ signal |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** ส่งเป็น signal ใน EDIT แรกของ Build ไม่บล็อก
  - **Why:** Land เป็นด่านบังคับเดียว และ advance บอก agent ให้ทำตาม signals[]
  - **Rejected:** none
  - **Consequences:** agent ที่ไม่ทำตาม signal ยังอาจทำให้ Land ล้มได้
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** โปรเจกต์ที่ไม่มี git เก็บ digest ของไฟล์ตอน change start; โปรเจกต์ที่มี git ใช้ preexisting เดิม
  - **Why:** โปรเจกต์ไม่มี git ไม่มี snapshot ให้เทียบ
  - **Rejected:** none
  - **Consequences:** change start ในโปรเจกต์ไม่มี git อ่านไฟล์ทั้งโปรเจกต์ครั้งหนึ่ง
- **Decision ID:** DEC-003
  - **Status:** accepted
  - **Decision:** ข้อความสิทธิ์ของ paid benchmark อนุมัติสเปกชัดเจนด้วย decision ref benchmark:spec-approval
  - **Why:** lane refactor หยุดขออนุมัติใน Pi แต่ใน 3.7.8 agent อนุมัติเอง lane จึงวัดงานไม่เท่ากัน
  - **Rejected:** none
  - **Consequences:** ผล paid benchmark ใหม่เทียบกับรอบเก่าได้ตรงขึ้น

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| โปรเจกต์ไม่มี git | envelope มี signal change-phase-target-edits ที่ระบุ src/checkout.js และ src/coupons.js | No separate step; the outcome is the handling | change-phase-edits-signal |
| โปรเจกต์มี git | signal ระบุไฟล์นั้น | No separate step; the outcome is the handling | change-phase-edits-signal |

## ความเสี่ยง

- change start ในโปรเจกต์ไม่มี git อ่านไฟล์ทั้งหมดครั้งหนึ่ง

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/workflow/sandbox/`, `.claude/harness/runtime/workflow/change/change-start-values.mjs`, `.claude/harness/runtime/core/state-runtime.mjs`, `.claude/harness/runtime/composition/`, `.claude/harness/tests/change-phase-target-edits.test.mjs` (add), `.claude/tests/run-all.sh`, `.claude/tests/README.md`, `CHANGELOG.md` |
| T002 | `.claude/tests/bench/openspec-native/run.mjs`, `.claude/tests/bench/tests/openspec-native-runner.test.mjs` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── harness/
│   │   ├── runtime/
│   │   │   ├── ~ composition/
│   │   │   ├── core/
│   │   │   │   └── ~ state-runtime.mjs
│   │   │   └── workflow/
│   │   │       ├── change/
│   │   │       │   └── ~ change-start-values.mjs
│   │   │       └── ~ sandbox/
│   │   └── tests/
│   │       └── + change-phase-target-edits.test.mjs
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
| โปรเจกต์ไม่มี git; โปรเจกต์มี git; ไม่มีการเขียนก่อน Build; ไฟล์ที่แก้อยู่แล้วก่อน change start; ไฟล์ของ harness; agent ทำตาม signal แล้ว Land ผ่าน | task check | `node --test .claude/harness/tests/change-phase-target-edits.test.mjs` | T001 |
| lane ที่อนุญาต self-review; ไม่มีสิทธิ์ | task check | `node --test .claude/tests/bench/tests/openspec-native-runner.test.mjs` | T002 |
