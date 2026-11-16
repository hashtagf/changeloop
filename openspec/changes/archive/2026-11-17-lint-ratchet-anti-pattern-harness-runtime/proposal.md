# Change: เพิ่ม lint ratchet ที่กัน anti-pattern ใหม่ใน harness runtime

- **Change:** `lint-ratchet-anti-pattern-harness-runtime` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

โค้ด harness คือ input ก้อนใหญ่ของ agent แต่ตอนนี้ยังไม่มี lint gate และกฎอย่าง "foundation.mjs เป็น composition root" ก็มีแค่ prose ทำให้ workaround กับ pattern เก่าถูก copy ต่อได้เรื่อย ๆ การเพิ่ม lint ratchet ที่มีข้อความบอกวิธีแก้ที่ต้นเหตุจะกัน anti-pattern ใหม่แบบ deterministic โดยไม่ต้องเก็บกวาดของเดิมก่อน และเป็นที่ที่ใช้แปลงข้อผิดพลาดซ้ำของ agent เป็น check แทน prose

## ขอบเขต

- **In scope (`lint-ratchet`):** ESLint plugin เฉพาะ repo ใต้ scripts/lint พร้อมข้อความแก้ที่ต้นเหตุ; runner ratchet และ baseline quality/baselines/lint-ratchet-v1.json; size ratchet สำหรับไฟล์ใหญ่และ foundation.mjs; suite ใหม่ใน run-all และ affected selector; เอกสาร maintainer: agent พลาดซ้ำให้เพิ่มกฎ แทนการเขียน prose
- **Out of scope:** edits outside `scripts/lint/**`, `scripts/lint/test/rules.test.mjs`, `scripts/lint/test/ratchet.test.mjs`, `quality/baselines/lint-ratchet-v1.json`, `.claude/tests/run-all.sh`, `.claude/tests/affected-suite-selector.mjs`, … +4 more; the authored Non-goals below

## Non-goals

- แก้ violation เดิมใน runtime
- type checking
- lint ไฟล์ที่ติดตั้งให้ผู้ใช้หรือแก้ install.sh
- lint dashboard, website, pi-extensions และ tests

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

repo มี lint ratchet (scripts/lint) ใน run-all: กฎเฉพาะ repo บอกวิธีแก้ที่ต้นเหตุ ของเดิมอยู่ใน baseline ที่ลดได้อย่างเดียว ไฟล์ใหญ่และ foundation.mjs ห้ามโตเกิน baseline; ไม่กระทบไฟล์ที่ติดตั้งให้ผู้ใช้

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| กฎเฉพาะ repo บอกวิธีแก้ที่ต้นเหตุ | โค้ดปกติไม่ถูกรายงาน | boundary | T001 | test: `scripts/lint/test/rules.test.mjs` | — |
|  | timer เป็นทางรอ | failure | T001 |  |  |
|  | comment workaround | failure | T001 |  |  |
|  | catch ว่าง | failure | T001 |  |  |
|  | disable ไม่มีเหตุผล | failure | T001 |  |  |
| จำนวน violation ลดได้อย่างเดียว | ไม่มีการเปลี่ยน | success | T002 | test: `scripts/lint/test/ratchet.test.mjs` | — |
|  | เก็บกวาดแล้วแต่ baseline ค้าง | boundary | T002 |  |  |
|  | tighten ลดได้อย่างเดียว | boundary | T002 |  |  |
|  | violation ใหม่ | failure | T002 |  |  |
|  | baseline เสียหรือหาย | failure | T002 |  |  |
| ไฟล์ใหญ่และ composition root ห้ามโต | ไฟล์ใหญ่หดลง | boundary | T002 | test: `scripts/lint/test/ratchet.test.mjs` | — |
|  | composition root โต | failure | T002 |  |  |
|  | ไฟล์ใหม่เกินเพดาน | failure | T002 |  |  |
| lint ratchet อยู่ใน gate ก่อน commit | affected เลือกเสมอ | success | T003 | test: `.claude/tests/run-all.sh`, `.claude/tests/affected-suite-selector.mjs`, `.claude/tests/harness/affected-suite-selector.test.mjs` | — |
|  | แก้ test ของกฎ | boundary | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (15).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (8); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for root-cause-rules, violation-ratchet, size-ratchet, gate-wiring.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: The new `lint rules` suite runs `node --test "$ROOT"/scripts/lint/test/*.test.mjs`, which names no test file. `.claude/tests/harness/test-registration.test.mjs` builds its runner text from `.claude/tests/` and `.claude/harness/tests/` and checks that each `scripts/**/*.test.mjs` basename appears there. Its only exemption is `scripts/quality/test/` (the `globbed` helper). So `scripts/lint/test/ratchet.test.mjs` and `scripts/lint/test/rules.test.mjs` are reported as orphans, and the registered `harness/test-registration` suite fails the default gate. The change needs either an explicit list of the two test files in the run-all line or an equivalent glob exemption for `scripts/lint/test/` in the registration test. (root/.claude/tests/run-all.sh:379) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | f2: `globals` is imported directly but is not in `package.json` devDependencies. It only resolves because eslint pulls in `globals@14` as a hoisted transitive dependency, so the ratchet can break when the dependency tree changes. Declare it, or use a small inline Node globals map. (root/scripts/lint/eslint.config.mjs:6) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f3: `no-timer-wait` only matches a literal first argument that starts with `sleep`. `spawnSync("/bin/sleep", ...)` and `spawnSync("sh", ["-c", "sleep 1"])` are not reported. This is a narrower reading of the 'spawn คำสั่ง sleep' requirement. It does not block the scenarios. (root/scripts/lint/plugin.mjs:43) | minor | แก้แล้วในรอบ 2 | claude-opus |
