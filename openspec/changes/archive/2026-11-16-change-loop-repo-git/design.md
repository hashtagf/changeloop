# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | ใน /dev (guard mode block) ก่อนมี phase: Write .foundation/drafts/fix/change.json หรือ openspec/repositories.yaml ได้ BLOCKED 'active phase is unavailable'; ใน root ที่ไม่ใช่ git ที่มี 821 repo การสแกน repository intelligence ได้ scan-entry-limit |
| สาเหตุที่แท้จริง | repositoryGitPaths() คืน includedPaths null เมื่อ git ls-files ที่ root ล้ม ทำให้เดินทั้งต้นไม้ไม่สนใจ repositories.yaml; prePhaseDraftMutationAllowed รับเฉพาะ .foundation/drafts/<id>.json (v4) ไม่รับโฟลเดอร์ v5 และไม่รับ openspec/repositories.yaml ซึ่งต้องแก้ก่อน change start; Change phase อนุญาตแค่ openspec/changes |
| หลักฐาน regression | test ของ repository intelligence สร้าง root ไม่ใช่ git ที่มี repo ประกาศ 1 ตัวกับโฟลเดอร์พี่น้องเกินเพดาน; test ของ phase guard เขียนไฟล์ draft โฟลเดอร์และ repositories.yaml ก่อนมี phase และใน Change |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** root ที่ไม่ใช่ git ใช้ไฟล์จาก git ls-files ของแต่ละ repo ที่ประกาศ (เฉพาะที่ draft เลือก ถ้าเลือกไว้) แทนการเดินทั้งโฟลเดอร์
  - **Why:** ใช้ขอบเขตเดียวกับที่ Build และ Land ใช้อยู่แล้ว และไม่ต้องเพิ่มเพดาน
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** อนุญาต Write/Edit openspec/repositories.yaml ก่อนมี phase และใน Change แต่ไม่ใช่ใน Build, Prove, Land
  - **Why:** draft อ้าง repo ได้เฉพาะที่ประกาศแล้ว จึงต้องแก้ไฟล์นี้ก่อน change start; sandbox ตรวจ topology ซ้ำอยู่แล้ว
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ไม่ได้ประกาศ repo | ผลการสแกนเป็น blocked ด้วย scan-entry-limit เหมือนเดิม | ประกาศ repo ใน openspec/repositories.yaml แล้วรัน change start ซ้ำ | non-git-root-scan-scope |
| ไฟล์อื่นก่อนมี phase ยังถูก block | guard block | เขียน draft แล้วเริ่ม change ตามข้อความ | pre-change-config-writes |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/workflow/change-lifecycle.mjs`, `.claude/harness/runtime/workflow/validation/repository-intelligence.mjs`, `.claude/harness/tests/repository-intelligence.test.mjs` |
| T002 | `.claude/hooks/phase-mutation-guard.mjs`, `.claude/hooks/phase-mutation-guard.md`, `.claude/tests/hooks/run-phase-mutation-guard-tests.sh` |
| T003 | `.claude/harness/README.md`, `website/docs/src/content/docs/multi-repository.md`, `website/docs/src/content/docs/th/multi-repository.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── harness/
│   │   ├── ~ README.md
│   │   ├── runtime/
│   │   │   └── workflow/
│   │   │       ├── ~ change-lifecycle.mjs
│   │   │       └── validation/
│   │   │           └── ~ repository-intelligence.mjs
│   │   └── tests/
│   │       └── ~ repository-intelligence.test.mjs
│   ├── hooks/
│   │   ├── ~ phase-mutation-guard.md
│   │   └── ~ phase-mutation-guard.mjs
│   └── tests/
│       └── hooks/
│           └── ~ run-phase-mutation-guard-tests.sh
└── website/
    └── docs/
        └── src/
            └── content/
                └── docs/
                    ├── ~ multi-repository.md
                    └── th/
                        └── ~ multi-repository.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| สแกนเฉพาะ repo ที่ประกาศ; draft เลือก repo บางตัว; ไฟล์ seed ที่ root ยังถูกอ่าน; ไฟล์ที่ repo ignore ไม่ถูกสแกน; ไม่ได้ประกาศ repo; root เป็น git | task check | `node --test .claude/harness/tests/repository-intelligence.test.mjs` | T001 |
| Write draft โฟลเดอร์ก่อนมี phase; Write repositories.yaml ก่อนมี phase; Write repositories.yaml ใน Change; ไฟล์อื่นก่อนมี phase ยังถูก block; path หลุดออกจากโฟลเดอร์ draft; repositories.yaml ใน Build | task check | `sh .claude/tests/hooks/run-phase-mutation-guard-tests.sh` | T002 |
| สแกนเฉพาะ repo ที่ประกาศ; draft เลือก repo บางตัว; ไฟล์ seed ที่ root ยังถูกอ่าน; ไฟล์ที่ repo ignore ไม่ถูกสแกน; ไม่ได้ประกาศ repo; root เป็น git; Write draft โฟลเดอร์ก่อนมี phase; Write repositories.yaml ก่อนมี phase; Write repositories.yaml ใน Change; ไฟล์อื่นก่อนมี phase ยังถูก block; path หลุดออกจากโฟลเดอร์ draft; repositories.yaml ใน Build | task check | `bash .claude/tests/docs/run-doc-consistency.sh` | T003 |
