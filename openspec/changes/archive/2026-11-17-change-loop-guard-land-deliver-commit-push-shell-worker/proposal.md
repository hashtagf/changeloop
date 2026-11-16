# Change: Change Loop guard แนะนำแทนการบล็อก: Land, Deliver, commit/push, แก้นอกงาน, shell และจำนวน worker เตือนแล้วให้ทำต่อ

- **Change:** `change-loop-guard-land-deliver-commit-push-shell-worker` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** high tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

บน Pi guard ของ Change Loop ทำงานโหมด block ทำให้เอเจนต์และผู้ใช้ถูกหยุดบ่อย: Land ต้องพิมพ์คำอนุมัติในเทิร์นเดียวกันและการอนุมัติหายเมื่อมีข้อความใหม่, คำตอบใน /questions ไม่นับ, แก้ไฟล์นอกงานไม่ได้, Prove ล็อกไฟล์, shell บางรูปแบบถูกปฏิเสธ และ worker เกินเพดานโปรเจกต์สร้างไม่ได้ ใน Claude Code โหมด auto ยังแทน commit/push และ Deliver ด้วยคำถาม ผู้ใช้ต้องการให้ Change Loop แนะนำเท่านั้น: ทุกกรณีรันต่อพร้อมคำเตือน ยกเว้นการปิดค่าลับที่คงเดิม

## ขอบเขต

- **In scope:** คำสั่งที่เคยถูกบล็อกบน Pi รันต่อ และผลของ tool มีคำเตือนพร้อมเส้นทางที่แนะนำ; Resolve the recorded phase for Write, Edit and Bash guards through that parent session, so a worker may write inside the parent's active Build workspace and a worker write to the main checkout SHALL be redirected into that workspace with a note; NOT turn the /land and /deliver commands or natural Land consent into instructions, and its guards SHALL warn instead of blocking advance --through archived and Deliver primitives; Treat a bash command as a Land operation only when a Change Loop CLI invocation (claude-foundation or foundation.mjs) runs a Land subcommand or advance --through archived; ตรวจคำสั่งของ tool background_bash ด้วย guard ชุดเดียวกับ bash ก่อนเริ่มงาน; รัน no-detached-authority กับทุกคำสั่ง bash ของเอเจนต์และ !/!! ของผู้ใช้; Refuse a spawn when active managed workers reach maxActiveWorkers from its config.json (default 64), and, when the worker cwd is inside a Change Loop project and active managed workers in that project reach execution.maxParallelAgents from foundation.json, SHALL start the worker and warn; guard ไม่แทนคำสั่ง git หรือ Deliver ด้วยข้อความ ASK_USER อีกต่อไป; คำสั่ง shell ที่ไม่ตรงรูปแบบรันต่อพร้อมคำสั่งที่แนะนำ; authority run ไม่ถูกปฏิเสธในโหมดปกติ; ค่าลับไม่ปรากฏในผลของ tool บน Pi เหมือนเดิม; เอกสารไม่อ้างว่า guard บล็อก Land, Deliver หรือ commit/push ในค่าเริ่มต้น
- **Out of scope:** edits outside `.claude/hooks/phase-mutation-guard.mjs`, `.claude/hooks/shell-route-guard.mjs`, `.claude/hooks/no-detached-authority.mjs`, `.claude/tests/hooks/run-phase-mutation-guard-tests.sh`, `.claude/tests/hooks/shell-route-guard.test.mjs`, `.claude/tests/hooks/run-hook-tests.sh`, … +21 more; the authored Non-goals below

## Non-goals

- เปลี่ยนการปิดค่าลับ (protect-secrets) หรือการปฏิเสธ grep ที่จะเผยค่าลับ
- เปลี่ยนเงื่อนไขความพร้อมของ Land ใน runtime (spec approval, proof ที่ผูกกับ workspace hash)
- เปลี่ยน maxActiveWorkers ใน config ของ agent-team ซึ่งผู้ใช้ตั้งเอง
- เปลี่ยน no-direct-main-commit ซึ่งเป็น opt-in อยู่แล้ว
- แก้บั๊ก Land ที่ใช้ไฟล์ค้างใน main แทนไฟล์ใน workspace (ทำเป็นงานแยก)

## Capability ที่เปลี่ยน

| Capability | Requirements | Tasks |
|---|---|---|
| pi-host-adapter | pi-advisory-mode, worker-phase-inheritance, worker-no-land, archive-word-not-land, background-bash-guarded, detached-authority-bash | T002 |
| maintainer-pi-extensions | team-limits | T003 |
| advisory-guards | guide-mode-runs, shell-route-advice, detached-authority-advice, secrets-still-redacted, advisory-docs | T001, T002, T004 |

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Guards now advise instead of refuse: on Pi the adapter runs guards in auto mode, so Land and Deliver without explicit consent, edits outside a change, shell shapes, detached authority runs and the project worker cap run with a warning. Claude Code guide mode no longer replaces commit/push or Deliver with a question. Secret redaction and FOUNDATION_GUARDRAIL_MODE=block stay available unchanged.

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| pi-advisory-mode | Land โดยไม่มีคำอนุมัติรันต่อ | success (allow) | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | Deliver โดยไม่มี /deliver รันต่อ | success | T002 |  |  |
|  | แก้ไฟล์นอกงานรันต่อ | success | T002 |  |  |
|  | authority run ใน background รันต่อ | boundary | T002 |  |  |
|  | ผู้ใช้เลือกโหมด block เอง | boundary | T002 |  |  |
| worker-phase-inheritance | Worker writes in the parent's workspace | unclassified | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | Worker stays out of the main checkout | unclassified | T002 |  |  |
|  | Unrelated session gains nothing | unclassified | T002 |  |  |
| worker-no-land | Worker cannot land | unclassified | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
| archive-word-not-land | Git on an archived change path runs | unclassified | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | CLI archive still needs Land | unclassified | T002 |  |  |
| background-bash-guarded | อ่านไฟล์ลับถูกกัน | unclassified | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | Land โดยไม่ได้รับสิทธิ์ถูกปฏิเสธ | unclassified | T002 |  |  |
|  | authority run แบบ background ถูกปฏิเสธ | unclassified | T002 |  |  |
|  | เขียนนอก workspace ตอน Build ถูกกัน | unclassified | T002 |  |  |
|  | Build เริ่มใน workspace | unclassified | T002 |  |  |
|  | guard ใช้ไม่ได้ปิดตาย | unclassified | T002 |  |  |
|  | Land โดยไม่ได้รับสิทธิ์ได้คำเตือน | unclassified | T002 |  |  |
|  | authority run แบบ background ได้คำเตือน | unclassified | T002 |  |  |
|  | เขียนนอก workspace ตอน Build ได้คำเตือน | unclassified | T002 |  |  |
| detached-authority-bash | authority run แบบ detach ถูกปฏิเสธ | unclassified | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | authority run ปกติผ่าน | unclassified | T002 |  |  |
|  | authority run แบบ detach ถูกรันแบบ foreground | unclassified | T002 |  |  |
| team-limits | Project cap | unclassified | T003 | test: `pi-extensions/agent-team/roles.test.cjs` | — |
| guide-mode-runs | commit ระหว่าง Build รันได้ | success | T001 | test: `.claude/tests/hooks/run-phase-mutation-guard-tests.sh`, `.claude/tests/hooks/shell-route-guard.test.mjs`, `.claude/tests/hooks/run-hook-tests.sh`, `.claude/tests/hooks/no-detached-authority.test.mjs` | — |
|  | Deliver ไม่มี /deliver รันได้ | success | T001 |  |  |
| shell-route-advice | cd ต่อด้วย git ได้คำแนะนำ | success | T001 | test: `.claude/tests/hooks/run-phase-mutation-guard-tests.sh`, `.claude/tests/hooks/shell-route-guard.test.mjs`, `.claude/tests/hooks/run-hook-tests.sh`, `.claude/tests/hooks/no-detached-authority.test.mjs` | — |
|  | โหมด block ยังปฏิเสธ | boundary | T001 |  |  |
| detached-authority-advice | เขียนใหม่ไม่ได้ได้แค่คำเตือน | boundary | T001 | test: `.claude/tests/hooks/run-phase-mutation-guard-tests.sh`, `.claude/tests/hooks/shell-route-guard.test.mjs`, `.claude/tests/hooks/run-hook-tests.sh`, `.claude/tests/hooks/no-detached-authority.test.mjs` | — |
|  | โหมด block ยังปฏิเสธ | boundary | T001 |  |  |
| secrets-still-redacted | อ่าน .env บน Pi ยังได้สำเนาที่ปิดค่า | failure (deny) | T002 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
| advisory-docs | เอกสารสอดคล้อง | success | T004 | test: `.claude/tests/docs/advisory-guards-docs.test.mjs` | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (32).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (high tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ความครอบคลุมของการสำรวจ

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| security-privacy | covered | secrets-still-redacted |  |  |
| permission-rejection | covered | pi-advisory-mode, shell-route-advice |  |  |

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (1); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for pi-advisory-mode, worker-phase-inheritance, worker-no-land, archive-word-not-land, background-bash-guarded, detached-authority-bash, team-limits, guide-mode-runs, shell-route-advice, detached-authority-advice, secrets-still-redacted, advisory-docs.

## Appendix: Amendment history

- Revision 1 (2026-11-16): Build พบว่า phase guard โหมด auto ไม่แตะ session ที่ไม่มีงาน (adoption-only) จึงไม่มีคำแนะนำให้เปิดงาน การแนบคำแนะนำทุกครั้งที่แก้ไฟล์ในโปรเจกต์ที่ไม่มีงานจะรบกวนเกินไป จึงเหลือแค่ว่าแก้ได้โดยไม่ถูกปฏิเสธ
- Revision 2 (2026-11-16): Review F1: in auto mode a session with no recorded phase gets no phase guard note (adoption-only sessions stay silent), so the unrelated-session scenario cannot promise a note; it promises only that the write runs unredirected and the other session's phase is not used

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 2 | F1-dead-ask-user-paths: The hook no longer produces 'ASK_USER: <op> from the main checkout…' or 'ASK_USER: delivering …', but the code that accepts a yes to those questions is still there: the `answered` check in gitPublicationFromMainCheckout (lines 518-522) and `exchange.previousTurn.includes("ASK_USER: delivering ")` in deliverSession (line 112). After this change, only transcripts written before it (or made up by tests, see run-phase-mutation-guard-tests.sh:603,676) can reach these paths. The comment at line 101 still describes 'a yes to the delivery question the hook asked last turn'. Either remove this code or comment that it exists only for older transcripts. (root/.claude/hooks/phase-mutation-guard.mjs:518) | minor | ยังเปิดอยู่ | claude-opus |
| 2 | F2-workflow-enforces-wording: 'the phase guard enforces its Git and Deliver parts' contradicts the new 'Guards advise' bullet at lines 79-83: by default, commit, push and Deliver run with a warning. The doc test does not check this sentence, so it can stay out of date. Suggested wording: 'the phase guard warns on (and in block mode refuses) its Git and Deliver parts'. (root/WORKFLOW.md:55) | minor | ยังเปิดอยู่ | claude-opus |
| 2 | F3-weak-not-rewritten-assertion: 'Build main-checkout commit is not rewritten' only checks that the output lacks '"command":"git commit'. A regression to the old printf rewrite would still pass this check; only the message check on line 653 would catch it. Checking that the output has no 'updatedInput' would test the scenario's actual claim (the hook returns no updatedInput). (root/.claude/tests/hooks/run-phase-mutation-guard-tests.sh:654) | minor | ยังเปิดอยู่ | claude-opus |
