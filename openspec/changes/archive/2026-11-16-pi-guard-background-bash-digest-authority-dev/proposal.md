# Change: Pi ปิดช่องว่าง guard: background_bash, digest, authority, /dev

- **Change:** `pi-guard-background-bash-digest-authority-dev` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** high tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

guard ของ Pi ดักแค่ tool ในตัว 5 ตัว ทำให้ background_bash อ่านไฟล์ลับหรือสั่ง Land ได้โดยไม่ถูกตรวจ และ Pi ยังไม่มี session digest, hook กัน authority run แบบ detach และตัวเตือน /dev ที่ Claude Code มี การเปลี่ยนนี้ปิดช่องที่มีผลจริงโดยยังให้ MCP และ worker ใช้งานได้ตามเดิม

## ขอบเขต

- **In scope (`pi-host-adapter`):** background_bash ถูกตรวจความลับ, phase, รูปแบบ shell, สิทธิ์ Land/Deliver และ authority run; ระหว่าง Build ที่ไม่ได้ระบุ cwd จะเริ่มใน workspace; authority run ที่ใช้ &, nohup, setsid หรือ disown ถูกปฏิเสธใน Pi (โหมด block); เอเจนต์รู้ว่า tool นั้นไม่ผ่าน live guard โดยไม่มี tool ใดถูกบล็อก; เอเจนต์เห็นงานที่ active, สถานะ และขั้นถัดไปโดยไม่ต้องถาม; /dev ที่หยุดกลางทางใน Pi ถูกบันทึกเป็น incomplete และผู้ใช้ได้คำเตือนพร้อมทางไปต่อ; รายงาน capabilities, prompt ของ adapter, hooks README, harness README และหน้า install ภาษาอังกฤษ/ไทยตรงกัน
- **Out of scope:** edits outside `.claude/harness/adapters/pi-extension.mjs`, `.claude/hooks/dev-terminal-guard.mjs`, `.claude/harness/tests/pi-extension.test.mjs`, `.claude/harness/adapters/host-capabilities.json`, `.claude/tests/docs/run-doc-consistency.sh`, `.claude/hooks/README.md`, … +4 more; the authored Non-goals below

## Non-goals

- บล็อก tool ที่ไม่รู้จักหรือ MCP ทั้งหมดแบบ default-deny
- ประกาศ coverage ของ Pi เป็น full
- OS sandbox หรือ unattended attestation
- guard ให้ tool ซ้อนภายใน codemode

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Pi now guards background_bash like bash, warns once when an unguarded tool runs during a change, injects the session digest at start and after compaction, refuses detached authority runs, and warns when /dev stops before proof passes.

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| background-bash-guarded | Build เริ่มใน workspace | success (allow) | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | guard ใช้ไม่ได้ปิดตาย | boundary (deny) | T001 |  |  |
|  | อ่านไฟล์ลับถูกกัน | failure (deny) | T001 |  |  |
|  | Land โดยไม่ได้รับสิทธิ์ถูกปฏิเสธ | failure (deny) | T001 |  |  |
|  | authority run แบบ background ถูกปฏิเสธ | failure (deny) | T001 |  |  |
|  | เขียนนอก workspace ตอน Build ถูกกัน | failure (deny) | T001 |  |  |
| detached-authority-bash | authority run ปกติผ่าน | success | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | authority run แบบ detach ถูกปฏิเสธ | failure | T001 |  |  |
| unknown-tool-warning | MCP ระหว่าง Build ได้คำเตือน | success | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | นอกงานไม่เตือน | boundary | T001 |  |  |
|  | tool ประสานงานไม่เตือน | boundary | T001 |  |  |
| session-digest | เริ่ม session ได้ digest | success | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | หลัง compact ได้ digest ใหม่ | success | T001 |  |  |
|  | digest ล้มเหลวไม่บล็อก | failure | T001 |  |  |
| dev-terminal-warning | plan-only ไม่เตือน | success | T001 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | คำสั่งอื่นไม่ถูกประเมิน | boundary | T001 |  |  |
|  | หยุดก่อน proof ผ่านได้คำเตือน | failure | T001 |  |  |
| capability-truth | ตารางตรงกับเอกสาร | success | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | prompt ไม่อ้างเกินจริง | boundary | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (19).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (high tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ความครอบคลุมของการสำรวจ

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| security-privacy | covered | background-bash-guarded |  |  |
| permission-rejection | covered | background-bash-guarded |  |  |

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (7); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for background-bash-guarded, detached-authority-bash, unknown-tool-warning, session-digest, dev-terminal-warning, capability-truth.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: The `background_bash` authority-run refusal tests `AUTHORITY_RUN` against `normalizeHarnessCliInvocations(command)` without removing quotes. The Land check a few lines below (160-161) does remove them with `.replace(/(['"])([a-z0-9-]+)\1/g, "$2")`. As a result, `background_bash` with `cloop 'authority' run demo` or `cloop authority "run" demo` is not refused by this check. The no-detached-authority hook does not catch it either, because it turns quoted strings into spaces before matching. The shell runs it as `cloop authority run demo` in a job that is always detached, which is the case the requirement says is always refused. The literal scenario (`cloop authority run <id>`) is still blocked and tested. Fix: apply the same quote normalization as the Land check before testing AUTHORITY_RUN, and add a regression case with a quoted subcommand. (root/.claude/harness/adapters/pi-extension.mjs:153) | minor | ยังเปิดอยู่ | claude-opus |
