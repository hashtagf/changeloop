# Change: monorepo ที่มีหลาย module ได้ quality lane แยกตาม module ที่รันในโฟลเดอร์ของ module นั้นและถูกข้ามเมื่อ change ไม่แตะ และปิดช่องว่างที่รีวิวของ toolchain pack พบ

- **Change:** `monorepo-module-quality-lane-module-module-change-toolchain-pack` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

monorepo ที่มีหลาย service จะได้ quality lane แยกต่อ service และ change ที่แตะ service เดียวไม่ต้องรอ lane ของ service อื่น

## เหตุผล

[Data] control-pane-indo มี Go 12 module และ Dockerfile 14 ไฟล์ใต้ services/ โดยไม่มี go.mod ที่ราก discovery จึงไม่เสนอ lane ให้เลย และ all-repo-ms มีหลายร้อย repo ที่มี manifest ในโฟลเดอร์ย่อย

[Data] quality config มี provider ได้หนึ่งตัวต่อ capability และรันที่รากของ repository เท่านั้น การข้าม lane ด้วย paths ที่เพิ่งเพิ่มจึงใช้กับ monorepo ไม่ได้เต็มที่

[Data] รีวิวของ toolchain pack พบช่องว่าง 5 ข้อ: durations ตรวจหลวม, durations ของ pack โปรเจกต์ไม่ถูกใช้, config อ่านไม่ได้แล้วเงียบ, doctor เสนอแค่โฟลเดอร์แรก และสเปกไม่บอกกรณีเครื่องไม่มีเครื่องมือหรือ Flutter ไม่มีโฟลเดอร์ test

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** monorepo วัดคุณภาพได้ทีละ module; onboard ตั้ง lane ต่อ service ให้ monorepo ได้เอง; pack ที่ผิดถูกจับตั้งแต่อ่าน config และคำแนะนำไม่ทำให้ lane แคบเกินจริง
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- อ่านไฟล์ workspace (go.work, pnpm-workspace.yaml, settings.gradle) เพื่อหา module (ใช้ marker ในโฟลเดอร์ย่อยแทน)
- ให้ agent ร่างคำสั่งของภาษาที่ไม่รู้จักแล้วรันยืนยัน (change ถัดไป)
- แยก Prove provider ใน execution.yaml ตาม module (quality run เป็นตัวแยกอยู่แล้ว)

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Quality config can hold several lanes per capability, one per module ("test:services/wallet" with "cwd"), and discovery proposes them for monorepos whose modules have their own manifest. Toolchain packs gain stricter validation and project-pack test-time patterns.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/quality-runtime.mjs`, `.claude/harness/runtime/quality/quality-policy.mjs`, `.claude/harness/runtime/quality/quality-lanes.mjs`, `.claude/harness/tests/quality-module-lanes.test.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/README.md`, … +9 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| quality-module-lanes | lane ของ module | success | T001 | test: `.claude/harness/tests/quality-module-lanes.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | สอง lane capability เดียวกัน | success | T001 |  |  |
|  | config เดิม | boundary | T001 |  |  |
|  | cwd ออกนอก repository | failure | T001 |  |  |
|  | cwd ไม่มีอยู่ | failure | T001 |  |  |
| discovery-module-lanes | Go หลาย module ไม่มี go.mod ที่ราก | success | T002 | test: `.claude/harness/tests/quality-module-lanes.test.mjs` | — |
|  | ราก repo ครอบอยู่แล้ว | boundary | T002 |  |  |
|  | module มากเกิน | boundary | T002 |  |  |
|  | module ที่เป็น git repository แยก | boundary | T002 |  |  |
| toolchain-pack-tightening | เวลาเทสต์จาก pack โปรเจกต์ | success | T003 | test: `.claude/harness/tests/toolchain-packs.test.mjs`, `.claude/harness/tests/quality-runtime.test.mjs` | — |
|  | หลายโฟลเดอร์ | success | T003 |  |  |
|  | เครื่องไม่มีเครื่องมือ | boundary | T003 |  |  |
|  | Flutter ไม่มีโฟลเดอร์ test | boundary | T003 |  |  |
|  | duration ไม่มีกลุ่ม | failure | T003 |  |  |
|  | duration ไม่มี pattern | failure | T003 |  |  |
|  | config อ่านไม่ได้ | failure | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (16).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (5); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: The scenario "เวลาเทสต์จาก pack โปรเจกต์" says `quality run` leaves a history entry with lingering testsMs 2000. The only test for it calls `runQualityProvider` directly with a hand-passed `durations` array and a fake clock. Nothing runs `runtime.run()` with a config that has `toolchains`. The link `durations: config.toolchains` (quality-runtime.mjs:494) and the status.json history entry (quality-runtime.mjs:505) are therefore unproven. If that argument were dropped, or `config.toolchains` came from the wrong place, no test would fail and project pack time patterns would silently go unread. Add a run-level test: write a config with a project pack whose duration is `Finished in (\d+)s`, run a lane that prints `Finished in 2s`, and assert `laneStates().histories.test` carries `lingering.testsMs === 2000`. (root/.claude/harness/tests/quality-module-lanes.test.mjs:146) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2: `validateToolchainPack` checks the pattern with `new RegExp(`${row.pattern}\|`)` and no flags, while `durationPatterns` later builds `new RegExp(row.pattern, flags)`. A pattern that is valid without flags but invalid with `u` or `v`, such as `\-` with flag `u`, passes validation and then throws inside `runQualityProvider` at run time. Validate with the declared flags. Also, `/[^dgimsuy]/` accepts duplicate flags like `gg`, which the RegExp constructor rejects. (root/.claude/harness/runtime/quality/language-profiles.mjs:45) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F3: `laneFile` maps every character outside `A-Za-z0-9.-` to `_`. Lanes `test:services/a_b` and `test:services/a/b`, or `test:a b` and `test:a/b`, get the same result, status and baseline files. They then overwrite each other's history and baseline, which breaks the per-lane separation the spec requires. Nothing rejects the collision at config validation. (root/.claude/harness/runtime/quality/quality-lanes.mjs:14) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F4: `cwd` is checked only lexically (relative, no `..`). A directory inside the repository that is a symlink to somewhere outside it passes validation and runs the lane there. The runtime check at quality-runtime.mjs:84 only tests `existsSync`. The spec says the directory must be inside the repository, so resolve the real path or reject symlinks. (root/.claude/harness/runtime/quality/quality-lanes.mjs:30) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | R1: `validateToolchainPack` validates `new RegExp(`${row.pattern}\|`, …)`. A pattern that ends in an odd backslash, such as `(\\d+)\\`, turns into `(\\d+)\\\|`. That is a valid regex with an escaped pipe, so validation passes, but `durationPatterns` builds `new RegExp(row.pattern, flags)` without the `\|` and throws at run time inside `runQualityProvider`. Validate the pattern itself, then count capture groups with the `\|` suffix. (root/.claude/harness/runtime/quality/language-profiles.mjs:50) | minor | ยังเปิดอยู่ | claude-opus |
