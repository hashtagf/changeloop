# Change: ให้ Homebrew ย้ายชื่อสูตรได้แม้เวอร์ชันตรงกัน

- **Change:** `homebrew-distribution-same-version-brew-migration` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-19

## เหตุผล

การทดสอบ Homebrew จริงพบว่าการย้ายชื่อใน tap เดียวกันสำเร็จ แต่การอัปเกรดที่ใช้ซอร์ส v3.7.5 ตรงกันพยายามเขียนทับ CLI ใน keg เดิม การระบุ revision ให้สูตรชื่อใหม่รักษาเส้นทางอัปเกรดโดยไม่เปลี่ยนเวอร์ชันซอร์สหรือออก release ใหม่

## ขอบเขต

- **In scope (`homebrew-distribution`):** ให้อัปเกรดจากสูตรเดิมใน tap เดียวกันได้แม้ใช้ซอร์สรุ่นเดียวกัน
- **Out of scope:** edits outside `Formula/cloop.rb`, `.claude/tests/harness/local-release-rehearsal.test.mjs`

## Work type

chore

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| same-version-brew-migration | อัปเกรดรุ่นซอร์สเดียวกัน | unclassified | T001 | static-analysis: `.claude/tests/harness/local-release-rehearsal.test.mjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (1).
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.
