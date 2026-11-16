# Design

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | all-repo-ms (ไม่ใช่ git, 821 repo, ประกาศ lobby-theme): change แก้ 3 ไฟล์ใน lobby-theme ใช้ build รอบละ ~10 นาที (สร้าง sandbox 6 นาที), state file 115 MB ซึ่ง 110 MB เป็นรายการไฟล์, prove เกิน 20 นาทีโดย CPU อยู่ที่ node ตัวเดียวและยังไม่ถึงขั้น test; test ของ lobby-theme เองใช้ 431ms |
| สาเหตุที่แท้จริง | sandboxCopyPlan ตัด declared nested repository เฉพาะเมื่อ copy carries git (`nested = carriesGit ? nestedPaths : []`) จึงคัดลอก repo ทุกตัวรวมทั้งที่มี sandbox แยกแล้ว; workspaceManifest กรองด้วย git ls-files เฉพาะเมื่อ workspace เป็น git จึงเก็บ identity ทุกไฟล์ทั้ง baseline และ sandboxBaseline และทุก advance อ่าน/เขียน state ก้อนนี้และไล่ hash ใหม่ |
| หลักฐาน regression | test สร้าง root ไม่ใช่ git ที่มี repo ประกาศ 1 ตัวและ repo ไม่ประกาศ 1 ตัว แล้วตรวจว่า copy sandbox และ manifest ไม่มีไฟล์ของทั้งสอง repo แต่ยังมีไฟล์ control plane ของ root |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** root ที่ไม่ใช่ git ข้ามทั้ง repo ที่ประกาศและไดเรกทอรีใดก็ตามที่เป็น git repository (มี .git) ทั้งตอนคัดลอกและตอนทำ manifest
  - **Why:** repo ที่ประกาศมี sandbox ของตัวเอง ส่วน repo ที่ไม่ประกาศ Land ไม่ได้อยู่แล้ว (apply ปฏิเสธ nested repository) การคัดลอกจึงไม่มีประโยชน์และทำให้ช้าตามขนาดโฟลเดอร์
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| แก้ไฟล์ใน repo ที่ไม่ได้ประกาศ | Land ปฏิเสธพร้อมบอกให้ประกาศ repo ใน openspec/repositories.yaml | ประกาศ repo แล้วสร้าง sandbox ใหม่ | non-git-root-sandbox-scope |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/runtime/workflow/sandbox-runtime.mjs`, `.claude/harness/runtime/core/state-runtime.mjs`, `.claude/harness/tests/non-git-root-sandbox.test.mjs` (add) |
| T002 | `website/docs/src/content/docs/multi-repository.md`, `website/docs/src/content/docs/th/multi-repository.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── harness/
│       ├── runtime/
│       │   ├── core/
│       │   │   └── ~ state-runtime.mjs
│       │   └── workflow/
│       │       └── ~ sandbox-runtime.mjs
│       └── tests/
│           └── + non-git-root-sandbox.test.mjs
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
| repo ที่ประกาศไม่ถูกคัดลอกเข้า sandbox ของ root; repo ที่ไม่ได้ประกาศไม่ถูกคัดลอก; ไฟล์ control plane ของ root ยังอยู่; root ที่เป็น git ไม่เปลี่ยน; แก้ไฟล์ใน repo ที่ไม่ได้ประกาศ | task check | `node --test .claude/harness/tests/non-git-root-sandbox.test.mjs` | T001 |
| repo ที่ประกาศไม่ถูกคัดลอกเข้า sandbox ของ root; repo ที่ไม่ได้ประกาศไม่ถูกคัดลอก; ไฟล์ control plane ของ root ยังอยู่; root ที่เป็น git ไม่เปลี่ยน; แก้ไฟล์ใน repo ที่ไม่ได้ประกาศ | task check | `bash .claude/tests/docs/run-doc-consistency.sh` | T002 |
