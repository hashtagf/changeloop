# Change: ให้ proposal แสดงขอบเขตจาก repo ที่เลือกเท่านั้น

- **Change:** `compact-proposal-repository-scope` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-20

## เหตุผล

เมื่อเลือก 1 จาก 821 repo ตัวสร้าง proposal พิมพ์ชื่อ repo ที่ไม่ได้เลือกอีก 820 ตัว ทำให้คนอ่านหา repo ที่อยู่ในขอบเขตยากขึ้น จึงแสดงเฉพาะ repo ที่เลือกและสรุปว่า repo อื่นอยู่นอกขอบเขต

## ขอบเขต

- **In scope (`readable-change-packets`):** ในโปรเจกต์หลาย repo แสดงชื่อ repo ที่เลือกและระบุว่า repo อื่นอยู่นอกขอบเขตโดยไม่ไล่ชื่อ
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/change/change-materialize.mjs`, `.claude/harness/runtime/workflow/validation/packet-overview.mjs`, `.claude/harness/tests/reader-guide.test.mjs`; the authored Non-goals below

## Non-goals

- ไม่เปลี่ยน repositories.yaml หรือกติกาการเลือกและบังคับขอบเขต Build/Land
- ไม่แก้ proposal ที่สร้างไว้ก่อนหน้า

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** สร้าง proposal ที่เลือก 1 จาก 821 repo แล้ว Scope แสดงชื่ออีก 820 repo
- **Root cause:** ตัวสร้าง Scope พิมพ์รายชื่อ repo ที่ไม่ได้เลือกทั้งหมด
- **Regression proof:** ทดสอบการสร้าง proposal เมื่อเลือกบาง repo และเมื่อใช้ repo เดียว

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| Proposals state repository scope from selected repositories | เลือกบาง repo จากหลายร้อย repo | success | T001 | test: `.claude/harness/tests/reader-guide.test.mjs` | — |
|  | เลือกหลาย repo ครบทั้งโปรเจกต์ | boundary | T001 |  |  |
|  | โปรเจกต์ repo เดียว | boundary | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (3).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
