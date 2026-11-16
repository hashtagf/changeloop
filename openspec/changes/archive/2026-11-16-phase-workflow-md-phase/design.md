# Design

## Work type

docs

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** วางไฟล์ไว้ที่ .claude/harness/lifecycle/ ไม่ใช่ root
  - **Why:** .claude/harness เป็น managed directory อยู่แล้ว จึงติดตั้งไปให้ผู้ใช้โดยไม่ต้องแก้ installer เหมือน EVIDENCE.md
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** WORKFLOW.md คงหัวข้อ ### ของแต่ละ phase ไว้พร้อมสรุปและลิงก์
  - **Why:** ลิงก์เดิมแบบ WORKFLOW.md#land-change ในโปรเจกต์ผู้ใช้และเอกสารภายนอกยังเปิดถึงหัวข้อที่ชี้ต่อได้
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ลิงก์ที่ชี้ส่วนที่ย้ายไม่เสีย | documentation test ล้มพร้อมชื่อลิงก์ที่เสีย | แก้ลิงก์ให้ชี้ไฟล์ใน .claude/harness/lifecycle/ | lifecycle-files |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `WORKFLOW.md`, `.claude/harness/lifecycle/` (add), `.claude/harness/README.md` |
| T002 | `.claude/tests/docs/`, `.claude/tests/affected-suite-selector.mjs`, `.claude/tests/harness/affected-suite-selector.test.mjs`, `.claude/tests/README.md`, `.claude/harness/EVIDENCE.md`, `.claude/skills/`, `.claude/commands/`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `README.th.md`, `CONTRIBUTING.md`, `website/docs/src/content/docs/` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── ~ commands/
│   ├── harness/
│   │   ├── ~ EVIDENCE.md
│   │   ├── + lifecycle/
│   │   └── ~ README.md
│   ├── ~ skills/
│   └── tests/
│       ├── ~ affected-suite-selector.mjs
│       ├── ~ docs/
│       ├── harness/
│       │   └── ~ affected-suite-selector.test.mjs
│       └── ~ README.md
├── ~ AGENTS.md
├── ~ CLAUDE.md
├── ~ CONTRIBUTING.md
├── ~ README.md
├── ~ README.th.md
├── website/
│   └── docs/
│       └── src/
│           └── content/
│               └── ~ docs/
└── ~ WORKFLOW.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| ไฟล์ phase ครบและลิงก์จาก WORKFLOW.md; anchor เดิมยังเปิดได้; ไม่มีเนื้อหาหาย; ลิงก์ที่ชี้ส่วนที่ย้ายไม่เสีย | task check | `bash .claude/tests/docs/run-doc-consistency.sh` | T001 |
| ไฟล์ phase ครบและลิงก์จาก WORKFLOW.md; anchor เดิมยังเปิดได้; ไม่มีเนื้อหาหาย; ลิงก์ที่ชี้ส่วนที่ย้ายไม่เสีย | task check | `node --test .claude/tests/docs/documentation-governance.test.mjs .claude/tests/harness/affected-suite-selector.test.mjs` | T002 |
