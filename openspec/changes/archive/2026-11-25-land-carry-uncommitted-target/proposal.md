# Change: ให้ Land พิสูจน์งานบนสภาพเดียวกับ repo หลักหลัง Land โดยนำไฟล์ที่ยังไม่ commit ใน repo หลักทุกไฟล์ที่ change ไม่ได้แตะเข้า workspace ก่อนตรวจ

- **Change:** `land-carry-uncommitted-target` · **Lane:** rapid (low risk)
- **Review:** not required · **Owner:** unassigned · **Created:** 2026-11-25

## เหตุผล

Change Loop ให้หลาย session ทำงานพร้อมกัน และผู้ที่ Land ต้องรักษางานก่อนหน้าและของตนเอง ตอน Land ของ amended-wiring-approval-loop harness merge ไฟล์ที่อีก session แก้ค้างเข้า sandbox แต่ไม่นำไฟล์ใหม่ที่ยังไม่ commit ซึ่งไฟล์นั้น import มาด้วย หลักฐานจึงล้มทั้งที่ target หลัง Land ทำงานได้ ผู้ใช้เลือกให้นำไฟล์ค้างทุกไฟล์ที่ change ไม่ได้แตะเข้ามาก่อนตรวจ

## ขอบเขต

- sandbox sync นำไฟล์ค้างของ target เข้า worktree sandbox และบันทึกว่าไม่ใช่งานของ change
- Land หยุดให้ sync และพิสูจน์ใหม่เมื่อ sandbox ยังไม่มีไฟล์ค้างที่ตรงกับ target

ไม่รวม: การลบไฟล์ที่ยังไม่ commit, sandbox แบบ copy

- **In scope (`land-target-carry`):** หลักฐานก่อน Land ตรวจบนสภาพเดียวกับ target หลัง Land และงานค้างของ session อื่นไม่หาย
- **Out of scope:** edits outside `.claude/harness/runtime/workflow/transaction/target-edits.mjs`, `.claude/harness/runtime/workflow/sandbox/sandbox-sync.mjs`, `.claude/harness/runtime/workflow/land/apply-entries.mjs`, `.claude/harness/tests/landed-carry-sync.test.mjs`; the authored Non-goals below

## Non-goals

- ไม่นำการลบไฟล์ที่ยังไม่ commit ใน target เข้า sandbox
- ไม่ apply ไฟล์ที่นำเข้ามากลับลง target และไม่นับเป็นงานของ change
- ไม่เปลี่ยน sandbox แบบ copy

## Work type

bugfix

## Bugfix analysis

- **Reproduction:** amended-wiring-approval-loop ตอน Land: harness merge delivery-wiring.mjs ที่อีก session แก้ค้างเข้า sandbox แต่ไม่นำ check-reuse.mjs ที่ยังไม่ commit และถูก import อยู่มาด้วย static-analysis ใน sandbox จึงล้มด้วย ERR_MODULE_NOT_FOUND
- **Root cause:** การ carry ของ Land และ sandbox sync ทำเฉพาะ path ที่ change แก้ด้วย ไฟล์ค้างอื่นใน target ไม่ถูกนำมา sandbox จึงไม่ตรงกับ target หลัง Land
- **Regression proof:** landed-carry-sync.test.mjs: อีก session แก้ไฟล์ร่วมคนละบรรทัดและเพิ่มไฟล์ใหม่ที่ test ของ change ต้องใช้ Land ต้อง archived และเก็บงานทั้งสองฝั่ง

## Failure matrix

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| งานของ change ไม่ถูกเขียนทับ | ไฟล์ใน sandbox ไม่ถูกแทนด้วย bytes ของ target | ใช้เส้นทาง merge หรือ conflict เดิมของ Land | carry-uncommitted |

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| proof-sees-post-land-target | ไฟล์ใหม่ที่ถูก import ถูกนำมาด้วย | success | T001 | test: `.claude/harness/tests/landed-carry-sync.test.mjs` | — |
|  | ไฟล์ค้างที่เกิดหลังพิสูจน์ | boundary | T001 |  |  |
|  | ไฟล์ที่นำเข้าไม่ใช่งานของ change | boundary | T001 |  |  |
|  | งานของ change ไม่ถูกเขียนทับ | failure | T001 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Changed tests fail on the original code.
- Review: not required (rapid lane, low tier: deterministic evidence only).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Amendment history

- Revision 1 (2026-11-25): The sandbox-land contract writes an unrelated uncommitted target file and applies without a sync; under the carry rule Land requires a sync and proof first, so the contract syncs and re-proves after that write

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1-reverted-carry-stale-proof: `stopForUncarriedTarget` only looks at paths that `targetUncommittedPaths` reports now. It never looks back at `workspace.targetUncommitted`, the files the sync carried in earlier. Failure scenario: sync carries an untracked `src/helper.txt` from another session, and proof passes with it present. The other session then deletes `src/helper.txt`, or reverts a carried tracked file to HEAD. When Land starts, the path is no longer uncommitted, so there is no stop. `carriedLandedExcludes` still leaves it out of the change's diff because the sandbox copy still matches the recorded digest. Land applies and archives the change. The proof saw a file the target no longer has, so the code that imports it is broken after Land, and stale proof lands. The sync already has a branch that puts such a file back to the target's bytes (sandbox-sync.mjs:279-285), but Land never sends the change back through sync to reach it. The preflight should also stop when a recorded `targetUncommitted` path's target bytes differ from the sandbox copy, including when the target file is missing. (root/.claude/harness/runtime/workflow/land/apply-entries.mjs:116) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2-uncarriable-paths-block-land: The Land preflight and the sync disagree about which paths can be carried. The preflight treats every listed uncommitted path that is outside the change's diff and whose `pathIdentity` differs as stale. `pathIdentity` covers symlinks and directories too. The sync skips any path whose target is not a regular file (sandbox-sync.mjs:295-296, `identity()` uses `isFile`). It also skips any path whose sandbox copy differs from base (sandbox-sync.mjs:287-293). Paths the change's diff excludes, such as coverage/**, test-results/**, playwright-report/**, openspec/investigations/** and nested repository paths (`sandboxCodePathspec`), are never in the diff's path list, so they are never treated as the change's own. Failure scenarios: (a) an untracked symlink in the target; (b) a nested repository that shows as modified (` M sub`) in the root's status; (c) a non-ignored coverage/ or test-results/ file whose sandbox copy differs. In each case Land raises target-edit-sync, the automatic `cloop sandbox sync` copies nothing, and Land raises the same stop again until the repeated-no-progress boundary. The change can never Land while that file exists. Either `targetUncommittedPaths` or the preflight should use the same rules as the sync: regular files only, and the same exclusions as the change's diff. (root/.claude/harness/runtime/workflow/land/apply-entries.mjs:117) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F3-sync-stop-message: `targetEditSyncStop` is reused for files the change never edited, but its summary still says the edits 'touch other lines than <change>, so the harness merges them into the sandbox copies'. Nothing is merged for these files; they are copied as they are. The message misleads whoever reads the stop. (root/.claude/harness/runtime/workflow/transaction/target-edits.mjs:180) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F4-dropped-logged-as-carried: `carryTargetUncommitted` returns dropped paths together with newly carried ones. Sync then prints 'CARRIED UNCOMMITTED <path>: the sandbox now matches the target checkout's uncommitted bytes' for all of them. That includes a path dropped because the change has since edited it, which no longer matches the target. The log line is wrong for dropped paths. (root/.claude/harness/runtime/workflow/sandbox/sandbox-sync.mjs:311) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F5-weak-assertions: The new contract step only asserts that `sandbox apply` fails. It does not check that the refusal is target-edit-sync, so any other refusal at that point would also pass. Separately, landed-carry-sync.test.mjs asserts that carried files are still unstaged and uncommitted afterwards. It never checks that they are absent from Land's change diff or apply journal. A Land that rewrote identical bytes would still pass, so the 'bytes in the target are not written' part of the carry-uncommitted-land-apply scenario is shown only by the code. (root/.claude/tests/harness/contracts/sandbox-land.sh:266) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | F6-preexisting-dropped-on-landed-handoff: `carryTargetUncommitted` runs after `carryLandedOutput` and deletes `sandboxPreexisting[path]` for every earlier `targetUncommitted` path that is not carried this time. `uncommittedCarryPlan` skips paths in `landed`. So when a path that was carried as uncommitted becomes another change's landed carry in the same sync, the code first removes the digest `carryLandedOutput` just wrote into `sandboxPreexisting`, then drops the path. `landedCarried` still keeps it out of the change's diff. But the task-scope check in change-policy.mjs reads `sandboxPreexisting`, so it may then count the landed bytes as this change's edit. Fix: skip the deletion for paths in `workspace.landedCarried`. (root/.claude/harness/runtime/workflow/sandbox/sandbox-sync.mjs:293) | minor | ยังเปิดอยู่ | claude-opus |
