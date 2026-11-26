# Change: รายงานสเปกที่ archive แล้วซึ่งไม่ตรงกับโค้ดปัจจุบัน

- **Change:** `spec-drift-deterministic-drift` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

ผู้ดูแลสั่งคำสั่งเดียวเพื่อดูว่าสเปกข้อไหนที่ archive แล้วไม่ตรงกับโค้ดตอนนี้ แล้วตัดสินว่าจะแก้สเปกหรือโค้ด

## เหตุผล

[Data] openspec/specs มี 61 ความสามารถ ราว 500 requirement แต่ไม่มีอะไรตรวจว่ายังตรงกับโค้ด แนวคิด drift report ของ Elephant-Goldfish Model ของ Google แก้ปัญหาเอกสารเก่าไม่ตรงโค้ด

## ขอบเขต

- **อยู่ในขอบเขต (`spec-drift`):** รายงานต่อ requirement: ok, missing-file, no-origin หรือ unreadable; ข้อสังเกต drift ต่อความสามารถ ระดับ blocker, major, nit; รายงาน JSON ล่าสุดและสรุปบนจอ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แก้สเปกหรือโค้ดอัตโนมัติ: รายงานอย่างเดียว ผู้ใช้ตัดสินเอง
- รันอัตโนมัติตามรอบเวลา
- ตรวจ change ที่ยังไม่ archive
- จำกัดขนาด: ไฟล์ที่ผูกไว้ถูกตรวจแค่ว่ามีอยู่ไม่ได้อ่านเนื้อหาในส่วนตายตัว ส่วน AI อ่านเองแบบเดียวกับ spec-review

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

คำสั่งใหม่ spec-drift รายงานสเปกที่ archive แล้วซึ่งไม่ตรงกับโค้ดปัจจุบัน

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/change/spec-drift.mjs`, `.claude/harness/tests/spec-drift.test.mjs`, `.claude/harness/runtime/core/cli-router.mjs`, `.claude/harness/commands.json`, `.claude/harness/runtime/composition/**`, `.claude/harness/foundation.mjs`, … +12 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| deterministic-drift | ทุกไฟล์ยังอยู่ | success | T001, T002 | test: `.claude/harness/tests/spec-drift.test.mjs`, `.claude/harness/tests/public-command-golden.test.mjs`, `.claude/harness/tests/spec-drift-command.test.mjs`, `.claude/tests/harness/run-installer-tests.sh` | — |
|  | หาที่มาไม่เจอ | boundary | T001, T002 |  |  |
|  | ระบุความสามารถ | boundary | T001, T002 |  |  |
|  | ความสามารถที่ไม่มี requirement | boundary | T001, T002 |  |  |
|  | ไฟล์ที่ผูกไว้หายไป | failure | T001, T002 |  |  |
|  | path ในข้อความสเปกหาย | failure | T001, T002 |  |  |
|  | ความสามารถไม่มีอยู่ | failure | T001, T002 |  |  |
|  | ไฟล์ archive เสียหรือรูปแบบเก่า | failure | T001, T002 |  |  |
| ai-drift-review | รีวิวความสามารถที่เลือก | success | T001, T002 | test: `.claude/harness/tests/spec-drift.test.mjs`, `.claude/harness/tests/public-command-golden.test.mjs`, `.claude/harness/tests/spec-drift-command.test.mjs`, `.claude/tests/harness/run-installer-tests.sh` | — |
|  | ไม่มี --review ไม่เรียก AI | boundary | T001, T002 |  |  |
|  | --review ไม่ระบุความสามารถ | failure | T001, T002 |  |  |
|  | reviewer ล้มเหลว | failure | T001, T002 |  |  |
| read-only-report | ไม่แตะไฟล์โปรเจกต์ | success | T001, T002, T003 | test: `.claude/harness/tests/spec-drift.test.mjs`, `.claude/harness/tests/public-command-golden.test.mjs`, `.claude/harness/tests/spec-drift-command.test.mjs`, `.claude/tests/harness/run-installer-tests.sh`, `.claude/tests/run-all.sh` | — |
|  | exit code | boundary | T001, T002, T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (14).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (6); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: Old-shaped archives are treated as readable. The scenario says an archive whose evidence.yaml has no claim is `unreadable` and never `ok`. In `linkedFiles`, `Array.isArray(evidence?.claims) ? evidence.claims : []` turns missing or empty claims into an empty set. `owned` is then empty, so `chosen = tasks` and every task's paths and verify files become the requirement's links. With `{version:1}` or `claims:[]` and a valid tasks.md whose files all exist, the requirement is reported `ok` for the wrong reason. The same fallback also hides a requirementKey that no claim in evidence.yaml names. The test at spec-drift.test.mjs:104-108 only reaches `unreadable` because its tasks.md has no task lines, so the missing-claims branch is untested. (root/.claude/harness/runtime/workflow/change/spec-drift.mjs:78) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | f2: `pathExists` handles only `*` globs. A path with `[`, `?` or `{` but no `*` has those segments dropped from `fixed`, so `src/[id]/page.mjs` is checked as `src/page.mjs` and reported falsely missing. A path containing `..` or an absolute path is checked and sent to the reviewer outside the project root, because `join(root, file)` is not contained. (root/.claude/harness/runtime/workflow/change/spec-drift.mjs:43) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f3: `origin()` skips an unreadable archived spec.md with `catch { continue; }`, so the requirement can end up `no-origin` instead of `unreadable`. Archive ordering is a plain name sort, so two same-date archives are ordered alphabetically rather than chronologically. (root/.claude/harness/runtime/workflow/change/spec-drift.mjs:60) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f4: A capability whose spec.md cannot be read returns `status:'unreadable'` with `requirements:[]`. It is missing from `counts` and from the `--pretty` output. The `reportDir` option and the returned `capabilities` function are unused. `--capability ,` selects nothing and silently becomes the all-capabilities run. (root/.claude/harness/runtime/workflow/change/spec-drift.mjs:96) | minor | แก้แล้วในรอบ 2 | claude-opus |
