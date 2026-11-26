# Change: Build บอก agent เมื่อ Change เขียนไฟล์ product ลงโปรเจกต์จริง

- **Change:** `build-agent-change-product` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-26

## สรุป

เมื่อ agent เขียนโค้ดลงโปรเจกต์จริงก่อนเริ่ม Build ระบบจะบอกตั้งแต่ Build เริ่มว่าไฟล์อยู่ในพื้นที่แยกแล้วและห้ามแตะในโปรเจกต์ งานจึงไม่ค้างตอน Land

## เหตุผล

[Data] paid e2e cart-coupons บน Pi ค้างที่ proven เพราะ agent เขียนไฟล์ระหว่าง Change แล้วลบทิ้งเองใน Build ทำให้ Land เจอ isolated-copy conflict และ lane refactor หยุดขออนุมัติเพราะ prompt ไม่ได้อนุมัติสเปกชัดเจน

## ขอบเขต

- **อยู่ในขอบเขต (`sandbox`):** EDIT แรกของ Build มี signal รายชื่อไฟล์และคำสั่งว่าให้แก้ในพื้นที่แยกเท่านั้น และห้ามลบหรือย้อนไฟล์ในโปรเจกต์; host ไม่หยุดขออนุมัติและไม่อนุมัติเองจากการตีความ /dev
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- บล็อกการเขียนไฟล์ในขั้น Change (guard ยังเตือนตามเดิม)
- เปลี่ยนการตรวจ target edits ของ Prove หรือ Land

## ผลกระทบและความเสี่ยง

ความเสี่ยงปานกลาง: แก้เฉพาะจุด ไม่กระทบส่วนอื่น

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/workflow/sandbox/**`, `.claude/harness/runtime/workflow/change/change-start-values.mjs`, `.claude/harness/runtime/core/state-runtime.mjs`, `.claude/harness/runtime/composition/**`, `.claude/harness/tests/change-phase-target-edits.test.mjs`, `.claude/tests/run-all.sh`, … +4 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| change-phase-edits-signal | ไม่มีการเขียนก่อน Build | success | T001 | test: `.claude/harness/tests/change-phase-target-edits.test.mjs`, `.claude/tests/run-all.sh` | — |
|  | agent ทำตาม signal แล้ว Land ผ่าน | success | T001 |  |  |
|  | ไฟล์ที่แก้อยู่แล้วก่อน change start | boundary | T001 |  |  |
|  | ไฟล์ของ harness | boundary | T001 |  |  |
|  | โปรเจกต์ไม่มี git | failure | T001 |  |  |
|  | โปรเจกต์มี git | failure | T001 |  |  |
| bench-spec-approval | lane ที่อนุญาต self-review | success | T002 | test: `.claude/tests/bench/openspec-native/run.mjs`, `.claude/tests/bench/tests/openspec-native-runner.test.mjs` | — |
|  | ไม่มีสิทธิ์ | boundary | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (8).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (2); recovery is "No separate step; the outcome is the handling" where unstated.

## Appendix: Amendment history

- Revision 1 (2026-11-26): The architecture check forbids workflow/change importing workflow/sandbox, so the change-start file manifest moves to a core module both can import. No behavior changes.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f-import-reflow: The `node:fs` import is collapsed from two lines to one. This edit does not trace to the agreement. It is formatting noise in a file that otherwise changes only by the new import and the `createSingle` wrapper. (root/.claude/harness/runtime/workflow/sandbox/sandbox-runtime.mjs:2) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | f-manifest-scope: In a no-git target, `changeStartManifest` reads and hashes every file outside `EXCLUDED_WORKSPACE_DIRS`, up to 5,000 files. The installed `.claude/` harness tree is not excluded, so it is hashed too. The whole digest map is persisted in the runtime state's `workspace.startManifest` until the sandbox is created. This adds hashing cost at every change start. It also persists an unbounded map. If the harness writes under `.claude/` during Change, that could name a file the agent did not write. A tree over 5,000 files silently returns null, so no signal fires. That limit is documented in a comment but not surfaced to the user. (root/.claude/harness/runtime/workflow/sandbox/change-phase-edits.mjs:28) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 2 | f-unused-injection: `initialChangeState` gains a `startManifest = fileStartManifest` parameter that no caller or test passes. `change-materialize.mjs` and `change-creation.test.mjs` both call it without the parameter. The `withStartManifest` helper is a one-use wrapper. `gitHead(root)` is now called twice. The new comment, 'HEAD is read from files, not git', is confusing. This is speculative indirection, and the code works without it. (root/.claude/harness/runtime/workflow/change/change-start-values.mjs:385) | minor | ยังเปิดอยู่ | claude-opus |
| 2 | f-manifest-silent-null: `startManifest` returns null for the whole tree on any unreadable file, any file that vanishes during the walk, or more than 5,000 files. No signal fires in that case, and nothing tells the user. The later comparison falls back to `start.startManifest` when `manifest(root)` is null, so a failed re-read also silently suppresses the signal. Each file is read fully into memory to hash it, so a large binary can use a lot of memory. Symlink changes are never detected, because only `isFile()` entries are hashed. (root/.claude/harness/runtime/core/start-manifest.mjs:32) | minor | ยังเปิดอยู่ | claude-opus |
