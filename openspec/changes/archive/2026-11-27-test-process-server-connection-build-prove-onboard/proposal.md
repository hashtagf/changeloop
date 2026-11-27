# Change: test ที่ผ่านครบแล้วแต่ process ไม่จบเพราะมี server หรือ connection ค้าง ไม่ทำให้ Build, Prove และ onboard รอเปล่าโดยไม่รู้สาเหตุ

- **Change:** `test-process-server-connection-build-prove-onboard` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-27

## สรุป

เทสต์ที่ผ่านครบแล้วแต่คำสั่งไม่จบ จะไม่ทำให้ agent รอเปล่าซ้ำหลายรอบอีก harness ให้ tsx จบเองเหมือน node และบอกวิธีแก้เมื่อแก้ให้เองไม่ได้

## เหตุผล

[Data] โปรเจกต์ mcp-mongodb-apikey: test ใน official-parity ผ่านภายในราว 7 วินาที แต่คำสั่งใช้ 360.5 วินาทีเท่ากันทุกรอบ change แรกรันแบบนี้ 7 รอบ เสียไปราว 41 นาทีจากเวลาทำงานราว 1 ชั่วโมง (.foundation/logs/gateway-hardening-docker-opt-in)

[Data] harness เพิ่ม --test-force-exit ให้เฉพาะคำสั่งที่ขึ้นต้นด้วย node --test โปรเจกต์นี้ใช้ npx tsx --test และ npm test จึงไม่ได้ผล และ cloop quality run ตอน onboard ไม่ใส่ flag เลย

[Data] readiness tests-fast บอกได้แค่ว่าช้า จึงชวนให้แยกชุดเร็ว ทั้งที่สาเหตุจริงคือ handle ค้าง

## ขอบเขต

- **อยู่ในขอบเขต (`prove`):** test runner ของ Node จบเมื่อ test จบแม้มี handle ค้าง; agent และผู้ใช้รู้ว่าต้องปิด handle หรือเพิ่ม --test-force-exit แทนที่จะรอซ้ำ
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- แก้ script ใน package.json ของโปรเจกต์ผู้ใช้หรือรัน npm script แทนคำสั่ง npm
- เปลี่ยนเกณฑ์ผ่าน/ล้มหรือ receipt ของ provider
- เลือกรันเฉพาะไฟล์ test ใน Prove, การ reuse ผล test เมื่อ base ขยับ, เพดาน review wave และ telemetry ของ host pi (ตรวจแล้วเป็นพฤติกรรมที่ตั้งใจ)

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/core/node-test-exit.mjs`, `.claude/harness/runtime/quality/quality-runtime.mjs`, `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/harness/runtime/composition/delivery-wiring.mjs`, `.claude/harness/runtime/evidence/adapter-runtime.mjs`, `.claude/harness/runtime/quality/pyramid-readiness.mjs`, … +2 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| node-test-force-exit | คำสั่งอื่น | boundary | T001 | test: `.claude/harness/tests/node-test-force-exit.test.mjs` | — |
|  | connection keep-alive ค้าง | failure | T001 |  |  |
|  | test ล้ม | failure | T001 |  |  |
|  | tsx --test | failure | T001 |  |  |
|  | quality lane | failure | T001 |  |  |
| lingering-test-run | test ช้าจริง | boundary | T002 | test: `.claude/harness/tests/node-test-force-exit.test.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs` | — |
|  | อ่านเวลา test ไม่ได้ | boundary | T002 |  |  |
|  | npm test ค้างหลัง test จบ | failure | T002 |  |  |
|  | readiness ของ lane ที่ค้าง | failure | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (9).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (6); recovery is "No separate step; the outcome is the handling" where unstated.

## Appendix: Amendment history

- Revision 1 (2026-11-27): ผู้ใช้เลือกแก้อีก 4 ข้อจาก log ของ 10 repo ผู้ใช้: Prove เสียเวลา 405 จาก 785 นาที ไปกับ lane คุณภาพที่ change ไม่ได้แตะ การรัน provider ที่หมดเวลาซ้ำบนเนื้อหาเดิม และเทสต์ค้างที่ตัวจับเดิมอ่านได้แค่ node:test

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: The scenario requires the harness to raise a slow-check signal naming 7s and 360s when it checks a task verify or a Prove provider. Only the pure helpers are tested: `lingeringTestRun` and `lingeringMessage` in node-test-force-exit.test.mjs. No test runs the advance `runCheck` wrapper, which picks the lingering message over `slowCheckMessage`. No test runs `noticeLingeringRun` in adapter-runtime.mjs:744, which skips reused task checks and rebuilds the command string from `built`. The `result?.output` and `result.durationMs` field wiring is therefore unproven, and so is the 'existing slow-check still runs when output is unreadable' fallback. A regression in either call site, such as a wrong field name or a dropped emit, would pass the whole suite. Add a deterministic test at each call site that captures `emitSignal`. (root/.claude/harness/runtime/composition/delivery-wiring.mjs:127) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2: The path from `runQualityProvider` through `lane.lingering` to the history entry to readiness is never tested end to end. The new quality-lane test covers only the non-lingering case and asserts `lane.lingering === undefined`. The readiness test feeds hand-built history rows. A rename of the `lingering` field on either side would not be caught. (root/.claude/harness/runtime/quality/quality-runtime.mjs:466) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F3: The spec counts a run as lingering only when the tests' time is under half of the command's time. `testsMs * 2 > wall` returns null only when the tests are strictly more than half, so a run with exactly half is reported as lingering. Use `>=`. (root/.claude/harness/runtime/core/node-test-exit.mjs:51) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F4: `const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;` in the quality-lane test is never used. `runQualityProvider` reads `process.env`, so the real isolation is the separate delete and restore of `process.env.NODE_TEST_CONTEXT`. Remove the dead copy. (root/.claude/harness/tests/node-test-force-exit.test.mjs:82) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F5: `executeAdapter` calls `noticeLingeringRun` once per provider. Providers whose command is shared through `commandCache` (same `dedupKey`) reuse one run. Each of them emits the same slow-check notice for that single run, so the user sees duplicates. (root/.claude/harness/runtime/evidence/adapter-runtime.mjs:763) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | G1: The test 'both runtime call sites route through the tested notices' checks the wiring with a regex over the source text of delivery-wiring.mjs and adapter-runtime.mjs. It does not run `runCheck` or `executeAdapter`. Reordering the statements or renaming a local would break it without changing behavior, and a wrong argument that still matches the regex would pass. I verified by reading that the argument names and fields are correct today. The coverage is acceptable but brittle. (root/.claude/harness/tests/node-test-force-exit.test.mjs:151) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 2 | G2: The spec counts a run as lingering only when the tests' time is under half of the command's time. `testsMs * 2 > wall` returns null only when the tests are strictly more than half, so exactly half is still reported as lingering. Use `>=`. (root/.claude/harness/runtime/core/node-test-exit.mjs:51) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 2 | G3: In the quality-lane test, `const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;` is never used. The real isolation is the separate delete and restore of `process.env.NODE_TEST_CONTEXT`. Remove the dead copy. (root/.claude/harness/tests/node-test-force-exit.test.mjs:93) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 2 | G4: `noticeLingeringProvider` runs once per provider. Providers that share a run through `commandCache` (same `dedupKey`) each emit the same slow-check notice for that single run, so the user sees duplicates. (root/.claude/harness/runtime/evidence/adapter-runtime.mjs:753) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 3 | R1: `withFlag` finds `script` as the first argument at or after `from` that does not start with `-`. If that argument sits before `--test`, the function returns the command unchanged. Value-taking node options put such an argument before `--test`. For `node --import tsx --test tests/a.test.ts`, args are [--import, tsx, --test, ...]: `at`=2, `script`=1 (`tsx`), so `script < at` and no flag is added. The same happens with `--require ./setup.js`, `-r x`, `--loader x` and `--env-file .env`. The landed code (`NODE.test(name) && args.includes('--test')`) inserted the flag after `--test` for all of these. `node --import tsx --test` is a common TypeScript test invocation, so a passing suite with a leaked server or keep-alive connection waits the full provider cap again. That breaks the node-test-force-exit claims for task verify and Prove providers. Fix: apply the script-argument guard only to `tsx` and `npx tsx` runs. For `node`, keep the old rule of flagging at the first `--test`. Alternatively, skip known value-taking options. Add test cases for `node --import tsx --test` and `node --require x --test`. (root/.claude/harness/runtime/core/node-test-exit.mjs) | major | ยืนยันการแก้ในรอบ 4 | claude-opus |
| 3 | R2: The test 'both runtime call sites route through the tested notices' still matches the source text of delivery-wiring.mjs and adapter-runtime.mjs with a regex. A harmless reorder breaks it, and a wrong argument that still matches the regex passes. In adapter-runtime.mjs the call sits on one line with `assertReadRepositories(...)`, which the regex now pins. Prefer a behavioral test through `executeAdapter` or `runCheck`. (root/.claude/harness/tests/node-test-force-exit.test.mjs:151) | minor | แก้แล้วในรอบ 4 | claude-opus |
| 3 | R3: An old timed-out receipt on unchanged content stays blocked until `FOUNDATION_RERUN_TIMED_OUT=1` is set. The provider fingerprint does not include the harness version, so a timeout caused by a lingering server stays blocked even after the harness gains `--test-force-exit` for that command. The message does name the escape hatch, so this is non-blocking. (root/.claude/harness/runtime/evidence/provider-timeout-rerun.mjs:13) | minor | แก้แล้วในรอบ 4 | claude-opus |
| 4 | D1: `VALUE_OPTIONS` is a hand-kept list. It omits value-taking node options that can sit before `--test` with a space-separated value, for example `--test-timeout 5000 --test`, `--test-shard`, `--test-skip-pattern` and `--watch-path`. For such a command `5000` is read as the script, `script < at`, and no flag is added. The lingering notice still names the cause, so the failure is visible. It is rare and non-blocking. (root/.claude/harness/runtime/core/node-test-exit.mjs) | minor | ยังเปิดอยู่ | claude-opus |
| 4 | D2: The test 'both runtime call sites route through the tested notices' still checks the source text of delivery-wiring.mjs and adapter-runtime.mjs with a regex. The adapter-runtime regex also pins the unrelated `assertReadRepositories(...)` call. A harmless reorder breaks it, and a wrong argument that still matches would pass. A behavioral test through `executeAdapter` or the advance check path would be sturdier. This carries over from R2 and is non-blocking. (root/.claude/harness/tests/node-test-force-exit.test.mjs:151) | minor | ยังเปิดอยู่ | claude-opus |
