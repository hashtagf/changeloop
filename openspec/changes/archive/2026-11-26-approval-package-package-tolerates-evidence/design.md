# Design

## Work type

docs

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| Prove requires the OpenSpec CLI | validation fails until the CLI is prepared | No separate step; the outcome is the handling | spec-wording-lint |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/harness/tests/approval-package.test.mjs` |
| T002 | `.claude/harness/tests/verify-shape.test.mjs` |
| T003 | `.claude/harness/tests/advance-runtime.test.mjs` |
| T004 | `.claude/tests/docs/skill-catalog.test.mjs`, `openspec/specs/build-skill-routing/spec.md`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── harness/
│   │   └── tests/
│   │       ├── ~ advance-runtime.test.mjs
│   │       ├── ~ approval-package.test.mjs
│   │       └── ~ verify-shape.test.mjs
│   └── tests/
│       └── docs/
│           └── ~ skill-catalog.test.mjs
├── ~ CHANGELOG.md
└── openspec/
    └── specs/
        └── build-skill-routing/
            └── ~ spec.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| provider ไม่มี adapter; evidence.yaml เป็น JSON ที่เสีย; change ที่ไม่มีอยู่; มี receipt ใช้ได้; มีแต่ preview; preview ของ revision ก่อนหน้า; พิมพ์ข้อมูลครบ; ค่าที่ไม่ทราบ; อ่าน evidence บางส่วนไม่ได้; change ที่ไม่มี draft แบบ typed; หน้าอ้าง proof เอง; preview ไม่ใช่ proof; ค่าความเสี่ยงมาจาก draft; migration ที่ไม่ประกาศ; path ปกติ; lane จาก path; ถามด้วยการ์ด; ใช้ถ้อยคำเดิม | task check | `node --test .claude/harness/tests/approval-package.test.mjs` | T001 |
| verify ไม่มีผล; verify เป็น lint; verify อ้างไฟล์ test; verify เรียก test runner; task เอกสารอย่างเดียว; amendment แก้ verify เป็น echo; Missing SHALL fails validate; Corrected wording passes; Absent CLI degrades to a warning; Prove requires the OpenSpec CLI | task check | `node --test .claude/harness/tests/verify-shape.test.mjs` | T002 |
| Runnable implementation or repair work exists; Configured review is ready; Coordinator reaches an authority boundary; Safe progress continues; A host requests a lifecycle target; A target is reached; The coordinator cannot continue safely; An internal lifecycle dependency throws; A long deterministic chain keeps progressing; Automated continuation repeats unchanged | task check | `node --test .claude/harness/tests/advance-runtime.test.mjs` | T003 |
| ลำดับของหน้า; แถบข้อเท็จจริงคัดลอกจากข้อมูล; ค่าที่ไม่ทราบ; ป้ายไม่ใช่ proof; ไม่พึ่งเครือข่าย; ใช้คีย์บอร์ดและไม่พึ่งสี; description ตรงตามข้อความที่กำหนด; spec-vocabulary ยังอยู่; body ของ lifecycle skill ไม่ถูกแตะ; description ยาวเกิน; ทุก body อยู่ใน budget และใช้โครงเดียวกัน; guardrail ยังถูกจับ; จำนวน assertion ห้ามคำไม่ลดลง; ขนาดรวมลดและ governance ผ่าน; เนื้อหาที่ pin ยังครบ; ไฟล์ที่แผนบอกว่าลบหรือรวมหายไปจริง; ลบไฟล์ที่ยังถูกอ้าง | task check | `node --test .claude/tests/docs/skill-catalog.test.mjs` | T004 |
