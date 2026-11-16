# Change: ย้ายรายการ Unreleased ของ CHANGELOG กลับใต้ Unreleased

- **Change:** `unreleased-changelog-unreleased` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

Land ของ default-execution-maxparallelagents-64-pi วางหัวข้อ 3.7.4 ไว้เหนือรายการ Unreleased ทำให้รายการใหม่ดูเหมือนออกไปแล้วใน 3.7.4

## ขอบเขต

- **In scope (`parallel-agent-limit`):** แสดงรายการ maxParallelAgents 64 และ Pi background_bash guard ใต้หัวข้อ Unreleased ก่อนหัวข้อ 3.7.4
- **Out of scope:** edits outside `CHANGELOG.md`

## Work type

docs

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Specs:** none; docs-only work modifies no living spec

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| changelog-unreleased | รายการอยู่ใต้ Unreleased | success | T001 | static-analysis | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
