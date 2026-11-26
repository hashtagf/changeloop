# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | /tmp/egm-gate12.log: risk-tiered review contract 158s, suite ถัดไป 74s; gate รวม 166s; 4 change วันนี้รัน gate เต็มสองรอบต่อ change (Prove + ก่อน commit) |
| สาเหตุที่แท้จริง | run-risk-tiered-review-tests.mjs เรียก run-upgrade-compat-tests.sh ตรงๆ โดยไม่ดู tier ของ run-all และ AGENTS.md บังคับ gate ก่อน commit แม้ Prove จะรันชุดเดียวกันแล้ว |
| หลักฐาน regression | test ของ run-all ตรวจว่า tier ค่าเริ่มต้นไม่เรียก run-upgrade-compat-tests.sh ผ่าน wrapper และ --full ยังเรียก |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** wrapper รัน CASE-UPGRADE-COMPAT เฉพาะเมื่อ run-all อยู่ใน tier full หรือ release; tier ค่าเริ่มต้นรายงานเคสนี้ว่า deferred-to-full และไม่นับเป็น fail
  - **Why:** suite upgrade compatibility อยู่ใน SLOW โดยเจตนา และ CI รัน --full ทุก push
  - **Rejected:** none
  - **Consequences:** บั๊ก upgrade จะเจอที่ CI แทน gate local เหมือน suite SLOW อื่น
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** AGENTS.md และ CLAUDE.md ระบุว่า receipt static-analysis ที่ผ่านของ change ที่ Land แล้วโดยไม่มีการแก้ไฟล์หลัง Land นับเป็น gate ค่าเริ่มต้นก่อน commit
  - **Why:** static-analysis ของ repo นี้รัน .claude/tests/run-all.sh ชุดเดียวกันบนโค้ดเดียวกัน
  - **Rejected:** none
  - **Consequences:** ถ้าแก้ไฟล์หลัง Land ต้องรัน gate ใหม่เหมือนเดิม

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| tier ค่าเริ่มต้น | wrapper ไม่เรียก run-upgrade-compat-tests.sh | No separate step; the outcome is the handling | default-gate-skips-slow-upgrade |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/tests/harness/run-risk-tiered-review-tests.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/harness/`, `.claude/tests/README.md`, `CHANGELOG.md`, `.claude/tests/harness/risk-tiered-review-tier.test.mjs` (add) |
| T002 | `AGENTS.md`, `CLAUDE.md`, `.claude/tests/docs/maintainer-gate.test.mjs` (add) |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── tests/
│       ├── docs/
│       │   └── + maintainer-gate.test.mjs
│       ├── ~ harness/
│       │   ├── + risk-tiered-review-tier.test.mjs
│       │   └── ~ run-risk-tiered-review-tests.mjs
│       ├── ~ README.md
│       └── ~ run-all.sh
├── ~ AGENTS.md
├── ~ CHANGELOG.md
└── ~ CLAUDE.md
```

## แผนที่ test

| Scenario | Level | File | Task |
|---|---|---|---|
| prove-counts-as-gate | — | .claude/tests/docs/maintainer-gate.test.mjs | — |
| default-gate-skips-slow-upgrade | — | .claude/tests/harness/risk-tiered-review-tier.test.mjs | — |
