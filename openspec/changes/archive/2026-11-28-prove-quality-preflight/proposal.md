# Change: ก่อน Prove รันชุดตรวจทั้งหมด advance ตรวจ findings lane ที่รันเร็วก่อนและส่งกลับให้ agent แก้ทันทีเมื่อถดถอย และ quality run ส่งรายชื่อไฟล์ที่ change แก้ให้ทุก lane

- **Change:** `prove-quality-preflight` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

agent รู้ว่าโค้ดทำให้ตัวตรวจราคาถูกถดถอย เช่นไฟล์โตเกินเพดานหรือ lint ใหม่ ภายในไม่กี่วินาที แทนการรอขั้นพิสูจน์เต็มรอบ

## เหตุผล

[Data] ในงานรองรับหลายภาษา ขั้นพิสูจน์รอบหนึ่งใช้ราว 150 วินาทีแล้วจึงบอกว่าไฟล์สามไฟล์โตเกินเพดาน ทั้งที่ตัวตรวจนี้รันเองได้ในราว 2 วินาที

[Data] ตัวตรวจคุณภาพของโปรเจกต์ไม่รู้ว่า change แก้ไฟล์ไหน จึงเลือกรันเฉพาะส่วนที่กระทบไม่ได้

## ขอบเขต

- **อยู่ในขอบเขต (`quality-tooling`):** การถดถอยราคาถูกถูกจับก่อน Prove เต็มรอบ; สคริปต์เทสต์ของโปรเจกต์เลือกรันเฉพาะส่วนที่กระทบได้
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ตัดหรือข้าม lane ใดใน quality gate ของ Prove
- เปลี่ยน test lane ของ repo นี้ให้รันเฉพาะส่วนที่กระทบ

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Before Prove runs its providers, `advance` runs the change's findings lanes (lint, type-check, file-size, nesting-depth, duplication, workaround-comments, module-boundaries) once per workspace content; a regression returns a repair with the findings in seconds instead of after a full Prove. Prove still runs the complete quality gate. `quality run` passes each lane the paths the change touched in `FOUNDATION_QUALITY_CHANGED_FILES`.

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/quality-preflight.mjs`, `.claude/harness/runtime/composition/delivery-wiring.mjs`, `.claude/harness/runtime/composition/lifecycle-wiring.mjs`, `.claude/harness/foundation.mjs`, `.claude/harness/tests/quality-preflight.test.mjs`, `.claude/harness/CONSUMER-QUALITY.md`, … +5 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| findings-preflight | ผ่านแล้วเข้า Prove | success | T001 | test: `.claude/harness/tests/quality-preflight.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | เนื้อหาเดิม | boundary | T001 |  |  |
|  | ไม่มี quality config | boundary | T001 |  |  |
|  | ไฟล์โตเกิน ratchet | failure | T001 |  |  |
| lane-changed-files | มี change | success | T002 | test: `.claude/harness/tests/quality-preflight.test.mjs` | — |
|  | ไม่มี change | boundary | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (6).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | preflight-enforce-mode-generic-error: The preflight calls `run({change, capability})` and expects a summary back. When the project's quality policy has `mode: "enforce"` (or `FOUNDATION_QUALITY_ENFORCE=1`), `run()` calls `fail("consumer quality gate fail")` at quality-runtime.mjs:561-563 once any findings lane fails. Inside `trapFailures` the wired `die` also runs `markBlocked(message)`, then throws. So `preflightFailures` never sees the summary. The agent gets a generic `consumer quality gate fail`, with no lane or finding named. The change is marked blocked, and no marker is written. This breaks "REPAIR names the lane and finding that regressed" for enforce-mode projects, which is the strictest and most likely consumer configuration. The only integration test uses `mode: report`. The fix is to run the preflight non-enforcing, or catch the thrown summary and build the repair from it. (root/.claude/harness/runtime/quality/quality-preflight.mjs:52) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | preflight-quality-log-stdout-noise: `createQualityRuntime` defaults `log = console.log`, evaluated when the runtime is constructed. `evidence-state-wiring.mjs:96-110` passes no `log`, so it holds the original `console.log`. `runAdvanceQuietly` only swaps `console.log` temporarily, so it cannot silence it. The preflight is called from the `proofAdvance` wrapper, which the `runQuietly` wrapper encloses, so each `runQuality` call still prints its full summary JSON (`log(JSON.stringify(summary, null, 2))`, quality-runtime.mjs:560) to real stdout. There is one such print per findings capability. The cli-router comment says `advance --through` stdout must be "the JSON envelope alone". Preflight noise ahead of the envelope can break host parsing of the `REPAIR`, on a pass as well as a fail. The integration test only regex-matches stdout, so it cannot catch this. The preflight needs to pass a no-op `log` or call a quiet entry point. (root/.claude/harness/runtime/composition/delivery-wiring.mjs:49) | major | แก้แล้วในรอบ 2 | claude-opus |
| 1 | preflight-overwrites-gate-state: Each preflight `run()` call rewrites the shared `summary.json` with a one-capability summary. It also appends an entry to each lane's status history, which readiness uses to judge stability. A later report-only read of the quality result can see the partial preflight summary until the full gate reruns. This is a side effect the agreement does not mention. (root/.claude/harness/runtime/quality/quality-preflight.mjs:52) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | preflight-test-fakes-run-collaborator: Four of the five preflight tests replace `run` with a fake. The marker, reuse and skip scenarios therefore never touch the real quality runtime. Only the failing path runs end to end, and only with a lint lane in report mode. The scenarios "file-size over its ratchet" and "passes, then Prove runs" have no real-collaborator coverage. The two defects above show this gap. (root/.claude/harness/tests/quality-preflight.test.mjs) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | preflight-quality-log-stdout-noise-open: The repair did not stop the preflight's quality runs from printing to stdout. `log(JSON.stringify(summary, null, 2))` still runs unconditionally, before the new `reportOnly` check. `evidence-state-wiring.mjs:96-110` builds the runtime with the default `log = console.log`, which is bound to the original function. `runAdvanceQuietly` only swaps `console.log`, so the preflight call inside the proofAdvance wrapper (`delivery-wiring.mjs:246-249`) still prints one full summary JSON per findings capability to real stdout, ahead of the `advance --through proven` envelope. That contradicts the cli-router rule that this stdout is the envelope alone, and can break host parsing of the REPAIR on pass and fail. To fix it, make `reportOnly` skip that log, or pass a no-op logger from the preflight. Add a test that parses the whole stdout of `advance --through proven` as one JSON envelope. (root/.claude/harness/runtime/quality/quality-runtime.mjs:560) | major | ยืนยันการแก้ในรอบ 3 | claude-opus |
| 2 | preflight-test-no-envelope-assertion: The installed-consumer test only regex-matches `proving.stdout`. It never asserts that stdout parses as a single JSON envelope, so extra output from the quality runtime goes unnoticed. (root/.claude/harness/tests/quality-preflight.test.mjs:152) | minor | แก้แล้วในรอบ 3 | claude-opus |
