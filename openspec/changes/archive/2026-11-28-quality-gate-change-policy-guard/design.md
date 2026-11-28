# Design

## Work type

bugfix

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** บทเรียน quality-gate นับเป็น enforced โดย consumer quality gate เอง
  - **Why:** การหยุดนั้นคือ check ที่จับข้อผิดพลาดได้แล้ว ความถี่ที่ agent มาถึง Prove พร้อมของเสียวัดแยกด้วย first-proof pass rate ในชั้น review
  - **Rejected:** none
  - **Consequences:** lessons ไม่เสนอ adoption draft ให้ quality-gate

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/observability/command-telemetry.mjs`, `.claude/harness/tests/telemetry-append.test.mjs` |
| T001; T002 | `CHANGELOG.md` |
| T002 | `.claude/harness/runtime/observability/lessons-runtime.mjs`, `.claude/harness/tests/outcomes-lessons.test.mjs` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   └── observability/
│       │       ├── ~ command-telemetry.mjs
│       │       └── ~ lessons-runtime.mjs
│       └── tests/
│           ├── ~ outcomes-lessons.test.mjs
│           └── ~ telemetry-append.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| quality gate ไม่ผ่าน; change ที่ยังไม่เริ่ม; ข้อความไม่เข้าคลาสไหน | task check | `node --test .claude/harness/tests/telemetry-append.test.mjs` | T001 |
| ประวัติ gate เดิม; ประวัติ unknown change เดิม; รหัสอื่นไม่ถูกแตะ | task check | `node --test .claude/harness/tests/outcomes-lessons.test.mjs` | T002 |
