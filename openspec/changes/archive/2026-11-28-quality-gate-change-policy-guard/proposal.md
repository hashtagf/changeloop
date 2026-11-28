# Change: การหยุดเพราะ quality gate ไม่ผ่านและการเรียก change ที่ยังไม่เริ่มได้รหัสสาเหตุของตัวเองแทน policy-guard และบทเรียนจัดกลุ่มประวัติเดิมตามสาเหตุจริง

- **Change:** `quality-gate-change-policy-guard` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

การหยุดที่เกิดจาก quality gate ไม่ผ่าน และการเรียก change ที่ยังไม่ได้เริ่ม ได้รหัสสาเหตุของตัวเอง บทเรียนที่ค้างจึงชี้สาเหตุจริงแทนกลุ่มรวม policy-guard

## เหตุผล

[Data] `cloop lessons` รายงาน policy-guard 15 ครั้งใน 9 change ทำให้ชั้น prose ของ readiness ค้างที่ 67%

[Data] จาก 15 ครั้ง 11 ครั้งมี reason `consumer quality gate fail` 2 ครั้งเป็น `unknown change` (เรียก advance ก่อน change start) และ 1 ครั้งขาด `--decision` ทุกครั้งตกไปที่ policy-guard เพราะไม่เข้าคลาสใดเลย และ recovery ที่ได้ (`cloop packet`) ไม่ใช่ทางแก้จริง

## ขอบเขต

- **อยู่ในขอบเขต (`runtime-observability`):** สาเหตุการหยุดในประวัติบอกเรื่องจริงและวิธีแก้ที่ถูก; บทเรียนที่ค้างสะท้อนสาเหตุจริงแทนกลุ่มรวม policy-guard
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แก้ข้อความ refusal เดิมหรือเปลี่ยนรหัส exit
- เปลี่ยนวิธีเขียน telemetry row ที่บันทึกไว้แล้ว (อ่านใหม่ตอนจัดกลุ่มบทเรียนเท่านั้น)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Blocked operations caused by a failing consumer quality gate are recorded as `quality-gate`, and calls naming a change that was never started as `unknown-change`, instead of the generic `policy-guard`. `lessons` regroups older generic rows by their recorded reason, and a recurring `quality-gate` lesson counts as enforced by the gate itself.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/observability/command-telemetry.mjs`, `.claude/harness/tests/telemetry-append.test.mjs`, `CHANGELOG.md`, `.claude/harness/runtime/observability/lessons-runtime.mjs`, `.claude/harness/tests/outcomes-lessons.test.mjs`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| typed-gate-and-unknown-change-blockers | quality gate ไม่ผ่าน | success | T001 | test: `.claude/harness/tests/telemetry-append.test.mjs` | — |
|  | change ที่ยังไม่เริ่ม | success | T001 |  |  |
|  | ข้อความไม่เข้าคลาสไหน | boundary | T001 |  |  |
| lessons-regroup-generic-history | ประวัติ gate เดิม | success | T002 | test: `.claude/harness/tests/outcomes-lessons.test.mjs` | — |
|  | ประวัติ unknown change เดิม | success | T002 |  |  |
|  | รหัสอื่นไม่ถูกแตะ | boundary | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: The quality-gate pattern /\bquality gate\b/i is broader than 'the gate failed'. An 'unavailable' gate (an infrastructure problem, not a product defect) gets the summary 'repair the product and prove again'. A telemetry test asserts this. In lessons, such rows would also count as 'enforced'. Narrowing the pattern, or noting that this is intended, would avoid the mislabel. (root/.claude/harness/runtime/observability/command-telemetry.mjs:47) | minor | ยังเปิดอยู่ | claude-opus |
