# Design

## Work type

bugfix

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** คงการแยกหน้าอนุมัติ แต่รักษา prototype.sync สำหรับเครื่องมือเดิม
  - **Why:** เจ้าของเลือกเตรียม PR รักษาความเข้ากันได้ก่อนเผยแพร่ v3.7.6
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/workflow/change/approval-package.mjs`, `.claude/harness/runtime/workflow/prototype/prototype-sync.mjs`, `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/lifecycle/change.md`, `CHANGELOG.md`, `docs/reports/user-scenario-release-status.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── lifecycle/
│       │   └── ~ change.md
│       ├── runtime/
│       │   └── workflow/
│       │       ├── change/
│       │       │   └── ~ approval-package.mjs
│       │       └── prototype/
│       │           └── ~ prototype-sync.mjs
│       └── tests/
│           └── ~ approval-package.test.mjs
├── ~ CHANGELOG.md
└── docs/
    └── reports/
        └── ~ user-scenario-release-status.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| เครื่องมือเดิมอ่านสถานะต้นแบบ; ไม่มีต้นแบบ; ต้นแบบเปลี่ยนหลังบันทึก | task check | `node --test .claude/harness/tests/approval-package.test.mjs` | T001 |
