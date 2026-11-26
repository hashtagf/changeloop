# Change: test ของ node ที่ผ่านแล้วแต่ทิ้ง connection ค้างไม่ทำให้ Build/Prove ค้างจนหมดเวลา และ benchmark ตรวจผลซ้ำหลังรอบซ่อม

- **Change:** `test-node-connection-build-prove-benchmark` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

test ที่ผ่านแล้วแต่ทิ้ง connection ค้างจะไม่ทำให้งานค้างรอจนหมดเวลาอีก และผล benchmark จะมาจากงานล่าสุดเสมอ

## เหตุผล

[Data] paid e2e project-tracker-api บน Claude Code ใช้ 56 นาที เพราะ test ผ่านหมดแต่ process ไม่จบ ระบบรอจนหมดเวลาสองครั้ง และหลังรอบซ่อม benchmark รายงาน 32/33 จากผลก่อนซ่อม ทั้งที่งานสุดท้ายได้ 33/33 (เกิดเหมือนกันบน Pi)

## ขอบเขต

- **อยู่ในขอบเขต (`prove`):** test ที่ทิ้ง handle ค้างจบทันทีเมื่อ test ครบ ผลผ่านหรือล้มตาม test; scorecard รายงานผล oracle ของงานล่าสุด
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แก้คำสั่ง npm test หรือ script อื่นที่เรียก node --test ข้างใน
- เปลี่ยนเวลารอสูงสุดของ provider

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/evidence/**`, `.claude/harness/runtime/workflow/**`, `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/tests/run-all.sh`, `.claude/tests/README.md`, `CHANGELOG.md`, … +2 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| node-test-force-exit | คำสั่งอื่น | boundary | T001 | test: `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | connection keep-alive ค้าง | failure | T001 |  |  |
|  | test ล้ม | failure | T001 |  |  |
| bench-oracle-after-repair | รอบซ่อมไม่มี envelope proven | failure | T002 | test: `.claude/tests/bench/openspec-native/run.mjs`, `.claude/tests/bench/tests/openspec-native-runner.test.mjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.

## Appendix: Amendment history

- Revision 1 (2026-11-26): The shared rewrite lives in core so evidence and workflow can both import it, and two existing tests change: the time seam counts the forced suite command, and the hung base-run fixture now never settles because --test-force-exit ends one that finished.
- Revision 2 (2026-11-26): The shared rewrite lives in core so evidence and workflow can both import it, and existing tests that record the spawned argv now expect --test-force-exit.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1-discrimination-argv-tests-stale: Test discrimination now calls forceExitCommand before spawnCommandSync/spawnCommandAsync. The harness fake in `.claude/harness/tests/test-discrimination.test.mjs:129-132` records the argv it receives, which is the forced argv. Four existing assertions still expect the unforced argv: `:159` (`["--test","test/greet-more.test.js"]`), `:240`, `:298` (`["--test"]`) and `:397`. Each now receives `--test-force-exit` as the second element, so they should fail. That file is not in the changed paths, so the test suite is left red. The in-scope test `harness-time-seam.test.mjs` was updated for the same reason, and this file was missed. The base-run claim has no passing deterministic proof until these assertions are updated. (root/.claude/harness/runtime/evidence/test-discrimination.mjs:526) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | f2-argv-form-unanchored: `forceExitCommand` fires when `--test` appears anywhere in a `node` argv. For `node script.js --test`, `--test` is a script argument. The flag is inserted after it, so the script receives an extra `--test-force-exit` argument. The shell-line form is anchored to `node --test` and is more precise. The new tests do not cover this case. (root/.claude/harness/runtime/core/node-test-exit.mjs:19) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f3-provider-path-untested-and-drift: The new behavior tests exercise only `runTaskCheck` in session-lease and the pure helpers. The provider paths in `adapter-runtime.mjs` (`cachedAdapterExecution` and `runTaskCheckAsEvidence`) and the base run in `test-discrimination.mjs` have no test that a hanging server ends quickly. In `adapter-runtime.mjs` the import block was also collapsed and `parseLastJsonLine` moved, which does not trace to the agreement. `exitingCommand(job)` is evaluated twice per job at `test-discrimination.mjs:531` and `:538`. (root/.claude/harness/runtime/evidence/adapter-runtime.mjs:430) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f4-repair-loop-test-partial: The `oracleRepairLoop` test covers only the case where the repair ends without `proven` (rerun reported) and the case where the repair is refused. It does not cover `reachedProven()` returning true, where the loop continues and repairs again. The `main()` closure over `execution.terminalReached` is also untested. The reported-result scenario itself is covered. (root/.claude/tests/bench/tests/openspec-native-runner.test.mjs:1646) | minor | แก้แล้วในรอบ 2 | claude-opus |
