# Change: เทสต์ของการนับไฟล์เทสต์ภาษา Java ให้ผลเดียวกันทุกเครื่อง ไม่ขึ้นกับว่าเครื่องติดตั้ง gradle หรือไม่

- **Change:** `quality-tooling-test-gap-machine-independent` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

แก้เทสต์ที่ทำให้ CI ของ commit ล่าสุดล้ม เทสต์จะให้ผลเดียวกันทุกเครื่อง

## เหตุผล

[Data] CI run 45929036138 ของ commit 003d86e2 ล้มที่ test-gap-discovery.test.mjs:109 เพราะ GitHub runner ติดตั้ง gradle ไว้ ส่วนเครื่อง local ไม่มี ผลจึงต่างกัน

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** CI ผ่านบนเครื่องที่มี gradle
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- เปลี่ยนพฤติกรรมของ discovery

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/tests/test-gap-discovery.test.mjs`

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** CI run 45929036138 ของ commit 003d86e2: test-gap-discovery.test.mjs:109 ได้ testFiles undefined แทน 1 เพราะ GitHub runner มี gradle บน PATH ทำให้ discovery เสนอ lane test ให้ repo Gradle
- **Root cause:** เทสต์เรียก discovery ด้วย PATH ของเครื่อง ผลจึงขึ้นกับเครื่องมือที่ติดตั้ง
- **Regression proof:** เทสต์เดิมรันด้วย PATH ว่างสำหรับกรณี Java และเพิ่มกรณีที่มี gradle บน PATH แล้วได้ lane test

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| test-gap-machine-independent | มี gradle | success | T001 | test: `.claude/harness/tests/test-gap-discovery.test.mjs` | — |
|  | ไม่มี gradle | boundary | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (2).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
