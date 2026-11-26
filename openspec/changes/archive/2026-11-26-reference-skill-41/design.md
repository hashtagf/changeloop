# Design

## Work type

refactor

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** เก็บ word list และ word set ต่อย่อหน้าครั้งเดียว แล้วใช้ขอบบน Jaccard min(|A|,|B|)/max(|A|,|B|) ตัดคู่ที่ไม่มีทางถึง 0.92
  - **Why:** profile พบเวลาเกือบทั้งหมดอยู่ใน words() และ similarity() ภายในลูปคู่
  - **Rejected:** none
  - **Consequences:** ผลเท่าเดิมทางคณิตศาสตร์ เพราะ Jaccard ไม่เกินอัตราส่วนขนาดชุด

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ย่อหน้าซ้ำและเกือบซ้ำ | รายงาน duplicate และ near-duplicate เหมือนเดิม | No separate step; the outcome is the handling | reference-governance-fast |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/tests/harness/reference-governance.mjs`, `.claude/tests/harness/reference-governance.test.mjs`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── tests/
│       └── harness/
│           ├── ~ reference-governance.mjs
│           └── ~ reference-governance.test.mjs
└── ~ CHANGELOG.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| skill จริงของ repo; ย่อหน้าซ้ำและเกือบซ้ำ; ขนาดชุดคำต่างกันมาก | task check | `node --test .claude/tests/harness/reference-governance.test.mjs` | T001 |
