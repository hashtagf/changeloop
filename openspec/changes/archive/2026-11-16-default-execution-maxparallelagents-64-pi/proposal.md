# Change: ค่า default ของ execution.maxParallelAgents เป็น 64 เท่ากับ Pi

- **Change:** `default-execution-maxparallelagents-64-pi` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ค่า default ของ execution.maxParallelAgents คือ 3 (สูงสุด 16) ทำให้ agent-team ของ Pi ปฏิเสธ worker ตัวที่ 4 ในโปรเจกต์ Change Loop ขณะที่ Pi เองรับได้ 64 ตัว ผู้ใช้ต้องการให้ค่า default เท่ากับ Pi

## ขอบเขต

- **In scope (`parallel-agent-limit`):** โปรเจกต์ที่ไม่ได้กำหนดค่าหรือติดตั้งใหม่รัน agent พร้อมกันได้ 64 ตัวเท่ากับค่า maxActiveWorkers ของ Pi
- **Out of scope:** edits outside `.claude/harness/runtime/core/runtime-environment.mjs`, `foundation.json`, `.claude/tests/harness/run-runtime-environment-policy-tests.mjs`, `website/docs/src/content/docs/foundation-config.md`, `website/docs/src/content/docs/th/foundation-config.md`, `CHANGELOG.md`; the authored Non-goals below

## Non-goals

- เปลี่ยนช่วงหรือค่า default ของ maxParallelProviders และ maxParallelSetups
- แก้ foundation.json ของโปรเจกต์ consumer ที่ติดตั้งแล้ว

## Work type

feature

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ค่า 65 ถูกปฏิเสธ | harness ปฏิเสธพร้อมข้อความที่ระบุ maxParallelAgents | No separate step; the outcome is the handling | agents-default-64 |
| provider ยังจำกัด 16 | harness ปฏิเสธพร้อมข้อความที่ระบุ maxParallelProviders | No separate step; the outcome is the handling | agents-default-64 |

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

execution.maxParallelAgents now defaults to 64 (matching Pi's maxActiveWorkers) and accepts 1 to 64; maxParallelProviders and maxParallelSetups keep 1 to 16.

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| agents-default-64 | ไม่กำหนดค่าได้ 64 | success | T001 | test: `.claude/tests/harness/run-runtime-environment-policy-tests.mjs` | — |
|  | ค่า 64 ผ่าน | boundary | T001 |  |  |
|  | ค่า 65 ถูกปฏิเสธ | failure | T001 |  |  |
|  | provider ยังจำกัด 16 | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
