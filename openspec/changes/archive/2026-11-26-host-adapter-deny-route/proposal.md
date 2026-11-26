# Change: คำสั่งที่โดน deny ได้คำสั่งที่รันได้แทน

- **Change:** `host-adapter-deny-route` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

เมื่อ agent ใช้คำสั่งที่ถูกห้าม (find ที่ลบหรือรันคำสั่งอื่น, git ที่เขียนไฟล์) จะได้รับคำสั่งที่รันได้แทน งานจึงไปต่อได้

## เหตุผล

[Data] กฎ deny ที่เพิ่มใน faee994f ทำให้ Claude Code ปฏิเสธทันทีโดยไม่บอกทางออก ผู้ใช้อนุมัติการเปลี่ยนนี้แล้ว (ask_user 71003ca7)

## ขอบเขต

- **อยู่ในขอบเขต (`host-adapter`):** agent ได้ทางไปต่อแทนการถูกปฏิเสธเงียบ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนชุดกฎ deny
- อนุญาตคำสั่งที่ถูก deny

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/hooks/shell-route-guard.mjs`, `.claude/tests/hooks/shell-route-guard.test.mjs`, `CHANGELOG.md`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** agent รัน find . -name '*.md' -exec grep x {} + ใน Claude Code ที่ติดตั้ง deny rules แล้ว ได้แค่ข้อความว่าถูกปฏิเสธ ไม่มีทางไปต่อ
- **Root cause:** permissions.deny ปฏิเสธโดยไม่มีเหตุผลหรือทางเลือก และ shell-route-guard ยังไม่รู้จักรูปแบบเหล่านี้
- **Regression proof:** shell-route-guard.test.mjs ตรวจว่ารูปแบบที่ตรงกับ deny rule ได้ block พร้อมคำสั่งแทน และคำสั่งที่ไม่ตรงไม่ได้รับผลกระทบ

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| find -exec grep | hook block พร้อมเหตุผลที่แนะนำ rg หรือ Grep tool | No separate step; the outcome is the handling | deny-route |
| find -delete | เหตุผลแนะนำให้รัน find build -name '*.tmp' -print ก่อน แล้วลบด้วยคำสั่งแยก | No separate step; the outcome is the handling | deny-route |
| git --output | เหตุผลแนะนำ git diff HEAD~1 > patch.diff | No separate step; the outcome is the handling | deny-route |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| deny-route | คำสั่งอ่านปกติ | success | T001 | test: `.claude/tests/hooks/shell-route-guard.test.mjs` | — |
|  | ไม่มีกฎ deny | boundary | T001 |  |  |
|  | ปิด guard | boundary | T001 |  |  |
|  | find -exec grep | failure | T001 |  |  |
|  | find -delete | failure | T001 |  |  |
|  | git --output | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
