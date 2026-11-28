# Change: ชุดเทสต์พา consumer ที่เป็น repo Go, Rust, Python และ Ruby จริงจาก change start ถึง archived ด้วยเทสต์ของภาษานั้น

- **Change:** `consumer-repo-go-rust-python-ruby-change-start-archived` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

มีเทสต์ที่พาโปรเจกต์ Go, Rust, Python และ Ruby จริงผ่านทุกขั้นของ Change Loop จนจบ เพื่อยืนยันว่าการรองรับหลายภาษาใช้ได้กับเครื่องมือจริง

## เหตุผล

[Data] ชุดงานทดสอบ 49 ชุดและ paid smoke 10 lane เป็น JavaScript เกือบทั้งหมด มี Python lane เดียว ยังไม่เคยมีอะไรยืนยันว่าโปรเจกต์ Go, Rust หรือ Ruby ผ่านทุกขั้นได้จริง

## ขอบเขต

- **อยู่ในขอบเขต (`polyglot-lifecycle`):** ยืนยันกับ toolchain จริงว่า lifecycle ทำงานนอก JavaScript
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- Java, PHP, .NET, Dart, Swift และ Elixir (เครื่องที่รันชุดเทสต์ไม่มีเครื่องมือครบ ครอบด้วย unit test ของตัวอ่านผลแทน)
- รันในชุดเทสต์เริ่มต้น (อยู่ในชั้น SLOW ที่ CI รัน)

## ผลกระทบและความเสี่ยง

ความเสี่ยงต่ำ: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** low
- **Coupling:** isolated

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/tests/polyglot-lifecycle-seam.test.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/README.md`, `.claude/tests/affected-suite-selector.mjs`

## Work type

test

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| เทสต์ล้ม | ไม่ถึง archived | No separate step; the outcome is the handling | polyglot-lifecycle-seam |

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| polyglot-lifecycle-seam | Go | success | T001 | test: `.claude/harness/tests/polyglot-lifecycle-seam.test.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/affected-suite-selector.mjs` | — |
|  | Rust | success | T001 |  |  |
|  | Python | success | T001 |  |  |
|  | Ruby | success | T001 |  |  |
|  | ไม่มี toolchain | boundary | T001 |  |  |
|  | เทสต์ล้ม | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
