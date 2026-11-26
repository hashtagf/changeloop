# Change: allowlist อ่านอย่างเดียวไม่ปล่อย find ลบไฟล์หรือ git เขียนไฟล์

- **Change:** `allowlist-find-git` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** high tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

คำสั่งอ่านที่ Change Loop อนุญาตให้ agent รันโดยไม่ถาม จะไม่ครอบคลุมคำสั่งที่ลบหรือเขียนไฟล์อีกต่อไป

## เหตุผล

[Data] AI review ของ spec-drift พบว่า Bash(find *) และ Bash(git diff *) ปล่อย find . -delete, find -exec rm และ git diff --output=<file> ผ่านโดยไม่ถามผู้ใช้ ทั้งที่สเปก headless-read-allowlist ห้ามกฎที่เขียนหรือลบ

## ขอบเขต

- **อยู่ในขอบเขต (`host-adapter`):** find -delete/-exec/-ok/-fprint/-fls และ git diff/log/show --output ไม่ผ่าน allowlist
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ลบกฎ Bash(find *) ออกจาก allowlist
- ปิดช่องทางรันคำสั่งผ่าน git config เช่น diff.external ที่ผู้ใช้ตั้งเอง

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/settings.json`, `install.sh`, `.claude/tests/harness/run-installer-tests.sh`, `website/docs/src/content/docs/install.md`, `website/docs/src/content/docs/th/install.md`, `CHANGELOG.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| headless-read-deny | คำสั่งอ่านยังผ่าน | success (allow) | T001 | test: `.claude/tests/harness/run-installer-tests.sh` | — |
|  | upgrade ใส่ deny ให้โปรเจกต์เดิม | success | T001 |  |  |
|  | opt-out ไม่แตะ deny | boundary | T001 |  |  |
|  | คำสั่ง headless ที่พิมพ์ออกมา | boundary | T001 |  |  |
|  | find ลบไฟล์ถูกปฏิเสธ | failure (deny) | T001 |  |  |
|  | git เขียนไฟล์ถูกปฏิเสธ | failure (deny) | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (high tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ความครอบคลุมของการสำรวจ

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| security-privacy | covered | headless-read-deny |  |  |
| permission-rejection | covered | headless-read-deny |  |  |

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.

## Appendix: Amendment history

- Revision 1 (2026-11-26): permission-allowlist.test.mjs checks that the documented headless run grants exactly the seeded allow rules; with the new --disallowedTools list it must read allow and deny separately, so the test joins the task's paths. No behavior changes.
- Revision 2 (2026-11-26): Prove's full suite failed once on app-smoke.test.mjs: its stop check saw ECONNRESET from a server socket closing under load, which (like ECONNREFUSED) means nothing is listening. The test passes 5/5 alone; Prove records an unchanged pass as a flake, so the test needs a deterministic repair. No product behavior changes.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: The scenario 'คำสั่ง headless ที่พิมพ์ออกมา' says the claude -p command must carry --disallowedTools with ALL deny rules. The assertion only checks that the install.sh source, from the Headless printf onward, contains '--disallowedTools "Bash(find *-delete*)"'. It never checks the other 7 rules (find -exec/-ok/-fprint/-fls, git diff/log/show --output) and never looks at what the installer prints. Concrete failure: deleting or mistyping "Bash(git show *--output*)" in the printf at install.sh:723 still passes, so headless users would run without that deny. The install.sh printf is correct today, but the claim is not proven. Fix: capture the installer's stdout (e.g. from the fresh ONLINE_TARGET install) and loop over SHIPPED_DENY, checking that each rule appears after --disallowedTools. (root/.claude/tests/harness/run-installer-tests.sh:592) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2: In deny_matches, the escape step is gsub("[.^$+?()\\[\\]{}\|\\\\]"; "\\\\\(.)"). Inside a jq sub/gsub replacement, `.` is the named-capture object ({}), not the matched character, so every regex metacharacter becomes `\{}` instead of being escaped. None of today's 8 rules contain a metacharacter, so the results are correct for now. A future rule with `.`, `(` or `\|` would silently produce a wrong regex or a jq error. Use a named capture, e.g. gsub("(?<c>[...])"; "\\\(.c)"). (root/.claude/tests/harness/run-installer-tests.sh:579) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F3: The docs say 'a path that merely contains `-delete` then asks for approval' (the TH page says the same, and design.md DEC-002 says the user can still run it by approving). In Claude Code, a matching permissions.deny rule refuses the call outright; it does not fall back to a prompt. Because *-ok* and *-exec* are substring globs, ordinary reads such as `find . -name '*-okhttp*'` or `find scripts -name 'pre-exec*'` are refused with no prompt. Describe the actual behavior. (root/website/docs/src/content/docs/install.md:201) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F4: The paragraph's last sentence (EN and TH) still says --no-permission-allowlist leaves only `permissions.allow` untouched. After this change the opt-out also skips the shipped permissions.deny rules (install.sh:450), so the sentence should name both. (root/website/docs/src/content/docs/install.md:201) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 5 | F1: DEC-002 says the implementation uses `find *-delete*` and therefore rejects filenames containing `-delete`, while the shipped rules use `find * -delete*` plus a separate no-path rule and intentionally allow names such as `pre-delete.md`. This leaves the design record inconsistent with the implementation and documentation. (contract/design.md:29) | minor | แก้แล้วในรอบ 6 | codex-sol |
