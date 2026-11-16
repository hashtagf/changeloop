# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | root เป็น git ที่ .gitignore ignore ทุกอย่างยกเว้น openspec/ และประกาศ repo app ที่ services/app; change start (impact medium) ได้ candidate เฉพาะไฟล์ใน openspec/ ไม่มีไฟล์ของ services/app |
| สาเหตุที่แท้จริง | repositoryGitPaths ใน change-lifecycle.mjs คืนผล git ls-files ของ root ทันทีเมื่อ root เป็น git และรวม repo ที่ประกาศเฉพาะเมื่อ root ไม่ใช่ git |
| หลักฐาน regression | test สร้าง root ที่เป็น git ซึ่ง ignore services/ และประกาศ repo app แล้วตรวจว่าชุดที่สแกนมีไฟล์ของ services/app |

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| repo ที่ประกาศไม่มีอยู่ | การสแกนได้ผล ready จากไฟล์ของ root โดยข้าม repo นั้น | clone repo ไปยัง path ที่ประกาศแล้วรัน change start ซ้ำ | git-root-declared-repo-scan |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/workflow/change-lifecycle.mjs`, `.claude/harness/tests/repository-intelligence.test.mjs` |
| T002 | `website/docs/src/content/docs/multi-repository.md`, `website/docs/src/content/docs/th/multi-repository.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   └── workflow/
│       │       └── ~ change-lifecycle.mjs
│       └── tests/
│           └── ~ repository-intelligence.test.mjs
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
| repo ที่ root ignore ถูกสแกน; draft เลือก repo บางตัว; ไฟล์ที่ repo ignore ไม่ถูกสแกน; repo ที่ประกาศไม่มีอยู่; root เป็น git ที่ไม่มี repo ประกาศ | task check | `node --test .claude/harness/tests/repository-intelligence.test.mjs` | T001 |
| repo ที่ root ignore ถูกสแกน; draft เลือก repo บางตัว; ไฟล์ที่ repo ignore ไม่ถูกสแกน; repo ที่ประกาศไม่มีอยู่; root เป็น git ที่ไม่มี repo ประกาศ | task check | `bash .claude/tests/docs/run-doc-consistency.sh` | T002 |
