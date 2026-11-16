# Change: ใน Pi คำสั่งภาษาธรรมดาที่ขึ้นต้นด้วย investigate และคำขอ deliver หรือเปิด PR แบบสั้น ๆ เข้าขั้นตอน Change Loop เดียวกับ /investigate และ /deliver โดยไม่ต้องพิมพ์ทับ

- **Change:** `pi-investigate-deliver-pr-change-loop-investigate-deliver` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ตอนนี้ Pi adapter ส่งงานเข้า Change Loop เฉพาะเมื่อผู้ใช้พิมพ์ slash command หรือพูดว่า land ได้เลย เท่านั้น ถ้าผู้ใช้พิมพ์ 'investigate ทำไม X พัง' หรือ 'เปิด PR ให้เลย' เป็นภาษาธรรมดา การจะทำตาม workflow ขึ้นอยู่กับว่าโมเดลเลือกใช้ skill หรือไม่ และไม่มี skill ชื่อ deliver ทำให้การ investigate อาจแก้โค้ดโดยไม่ผ่าน phase investigate และคำขอ deliver ถูกตัวกันบล็อกพร้อมบอกให้ผู้ใช้พิมพ์ /deliver <change-id> เอง ผู้ใช้ต้องการให้ Pi บังคับให้คำขอเหล่านี้เข้าขั้นตอน Change Loop เหมือนคำสั่ง slash

## ขอบเขต

- **In scope (`pi-host-adapter`):** ข้อความ interactive ที่ขึ้นต้นด้วย investigate (หรือ ช่วย investigate) ตามด้วยหัวข้อ ถูกส่งเข้า workflow ของ /investigate โดยใช้หัวข้อเป็นอาร์กิวเมนต์; ข้อความสั้นทั้งประโยค เช่น deliver, deliver ได้เลย, deliver <change-id>, เปิด PR ให้เลย, open a PR ถูกส่งเข้า /deliver ของ change ที่ผูกกับ session นี้; /deliver ที่ไม่ใส่ change-id เลือก change ของ session ให้เอง เหมือน /land
- **Out of scope:** edits outside `.claude/harness/adapters/pi-extension.mjs`, `.claude/harness/runtime/core/pi-land-context.mjs`, `.claude/harness/tests/pi-extension.test.mjs`, `WORKFLOW.md`, `.claude/harness/README.md`, `CHANGELOG.md`; the authored Non-goals below

## Non-goals

- ไม่เปลี่ยนกติกา Land: คำว่า แล้ว land เลย ในคำขอ investigate ยังไม่ให้สิทธิ์ Land ล่วงหน้าใน Pi ต้องยืนยันหลัง proven เหมือนเดิม
- ไม่บล็อก git commit, git push หรือ gh pr ที่ผู้ใช้สั่งโดยตรง
- ไม่ตีความคำทั่วไปอื่น ๆ เช่น change หรือ build ที่ขึ้นต้นประโยคเป็นคำสั่ง

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

ใน Pi พิมพ์ investigate <เรื่อง> หรือ เปิด PR ให้เลย ได้โดยไม่ต้องพิมพ์ slash command ระบบจะเข้าขั้นตอน Change Loop และเลือก change ของ session ให้เอง และ /deliver ที่ไม่ใส่ change-id ก็เลือกให้เองเช่นกัน

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| natural-investigate-routing | Investigate ภาษาธรรมดาเข้า workflow | success | T001, T003 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | ไม่ใช่คำขอ investigate | boundary | T001, T003 |  |  |
|  | ข้อความที่ไม่ได้มาจากผู้ใช้ | failure | T001, T003 |  |  |
| natural-deliver-consent | เปิด PR ให้เลย เลือก change ของ session | success | T001, T003 | test: `.claude/harness/tests/pi-extension.test.mjs` | — |
|  | /deliver ไม่ใส่ change-id | success | T001, T003 |  |  |
|  | ไม่มี change ใน session | boundary | T001, T003 |  |  |
|  | คำถามหรือคำปฏิเสธไม่ใช่คำสั่ง | failure | T001, T003 |  |  |
|  | Worker ส่งต่อไม่ได้ | failure | T001, T003 |  |  |
| natural-intent-docs | เอกสารครบ | success | T002 | test | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (9).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for natural-investigate-routing, natural-deliver-consent, natural-intent-docs.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f-worker-investigate: The requirement says text from a worker is not forwarded for investigate. The worker refusal covers only land and deliver (`parent && (land \|\| deliver)`), so an interactive-source `investigate <topic>` in a worker session is still transformed. Workers normally don't receive interactive input, and no scenario names this case, so it is non-blocking. Either skip routing when `parent` is set, or document that workers may investigate. (root/.claude/harness/adapters/pi-extension.mjs:212) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f-phase-assert: The natural-investigate test checks only the transformed text. It does not check that the shell then runs in the investigate phase (for example a write being blocked with a reason matching /investigate/ after the natural input). The phase is covered only through the `/investigate` command test at line 232. The natural path sets the same `invocation`, so the behaviour is implemented, but the 'AND shell ... phase investigate' clause is not asserted on this route. (root/.claude/harness/tests/pi-extension.test.mjs:362) | minor | ยังเปิดอยู่ | claude-opus |
