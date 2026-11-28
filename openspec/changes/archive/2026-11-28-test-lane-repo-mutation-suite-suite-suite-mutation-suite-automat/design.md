# Design

## Work type

chore

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** รายชื่อ mutation suite อยู่ที่ run-all.sh (MUTATION) และสคริปต์ lane อ่านคำสั่งจากตารางของ run-all.sh ผ่าน --mutation-commands
  - **Why:** suite ใหม่ที่เพิ่มเข้า MUTATION ย้ายเข้า lane เองโดยไม่มีรายชื่อสองที่
  - **Rejected:** none
  - **Consequences:** ชื่อใน MUTATION ที่ไม่อยู่ในตารางทำให้ control test fail

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| รายชื่อผิด | control test fail พร้อมชื่อนั้น | No separate step; the outcome is the handling | run-all-skip-mutation |
| ฆ่าผิดตัว | status Survived และ killedBy ว่าง | No separate step; the outcome is the handling | repository-mutation-report |
| suite ไม่มีรายงาน | exit 1 และ stderr มีชื่อ suite | No separate step; the outcome is the handling | repository-mutation-report |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/tests/run-all.sh`, `.claude/tests/harness/run-run-all-control-tests.sh`, `.claude/tests/README.md` |
| T002 | `scripts/quality/repository-mutation.mjs` (add), `scripts/quality/test/repository-mutation.test.mjs` (add) |
| T003 | `quality/foundation-quality.json`, `quality/baselines/root/automated-mutation-v1.json` (add), `quality/baselines/manifest.json`, `quality/README.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── tests/
│       ├── harness/
│       │   └── ~ run-run-all-control-tests.sh
│       ├── ~ README.md
│       └── ~ run-all.sh
├── quality/
│   ├── baselines/
│   │   ├── ~ manifest.json
│   │   └── root/
│   │       └── + automated-mutation-v1.json
│   ├── ~ foundation-quality.json
│   └── ~ README.md
└── scripts/
    └── quality/
        ├── + repository-mutation.mjs
        └── test/
            └── + repository-mutation.test.mjs
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| ตัดเฉพาะ mutation; รายชื่อผิด; child ไม่คำนวณซ้ำ | task check | `sh .claude/tests/harness/run-run-all-control-tests.sh` | T001 |
| mutant ถูกฆ่า; ฆ่าผิดตัว; ไม่ได้ใส่ fault; suite ไม่มีรายงาน | task check | `node --test scripts/quality/test/repository-mutation.test.mjs` | T002 |
| lane ผ่าน | task check | `node .claude/harness/foundation.mjs quality-run --capability automated-mutation --enforce` | T003 |
