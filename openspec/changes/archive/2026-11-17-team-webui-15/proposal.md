# Change: แก้ปัญหาการใช้งาน team-webui 15 ข้อจากการทดสอบผู้ใช้จำลอง

- **Change:** `team-webui-15` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** high tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

การทดสอบด้วยผู้ใช้จำลอง 7 แบบบน preview fixture ของ team-webui พบ 15 ปัญหา ตั้งแต่บอร์ดงานใช้บนมือถือไม่ได้ ลิงก์เชิญเดียวให้สิทธิ์เต็มโดยไม่มีวันหมดอายุ ไปจนถึงภาษาปนและช่องโหว่ด้านการเข้าถึง ผู้ใช้เลือกให้แก้ทั้งหมด เพื่อให้หัวหน้าทีม PM และผู้ใช้คีย์บอร์ดใช้งานได้จริงและเชิญคนดูได้อย่างปลอดภัย

## User story

- **P1** ในฐานะ หัวหน้าทีมที่เปิดดูจากมือถือ ฉันต้องการ เห็นสถานะ session และบอร์ดงานโดยไม่ต้องเลื่อนข้างหาการ์ด เพื่อ ตรวจงานได้ระหว่างเดินทาง Requirement: webui-task-stage-navigation, webui-mobile-header.
- **P1** ในฐานะ ผู้ดูแลที่เชิญคนอื่นเข้ามาดู ฉันต้องการ ให้ลิงก์ที่ดูได้อย่างเดียวและเพิกถอนได้ เพื่อ PM ดูความคืบหน้าได้โดยไม่แก้ไฟล์หรือ commit Requirement: webui-viewer-role, webui-invite-lifecycle, webui-audit-log.
- **P2** ในฐานะ PM ชาวไทยที่ไม่ใช่สายเทคนิค ฉันต้องการ ใช้หน้าเว็บเป็นภาษาไทยและเข้าใจชื่อขั้นงาน เพื่อ อ่านสถานะงานได้เอง Requirement: webui-locale, webui-help, webui-task-stage-navigation.
- **P2** ในฐานะ ผู้ใช้คีย์บอร์ดหรือโปรแกรมอ่านหน้าจอ ฉันต้องการ ข้ามไปที่แชทได้ทันทีและได้ยินคำตอบใหม่ เพื่อ ใช้งานได้เท่าผู้ใช้เมาส์ Requirement: webui-accessibility.

## เกณฑ์ความสำเร็จ

- บอร์ดงานบนจอ 390px ไม่มีการเลื่อนแนวนอนเกินจอ และแสดงการ์ดของขั้นที่เลือก
- ผู้ชมแบบ viewer ถูกปฏิเสธ 403 ทุกคำขอ POST ยกเว้น logout
- เพิกถอนลิงก์เชิญแล้ว session ที่เข้าด้วยลิงก์นั้นถูกตัดทันที (401 ในคำขอถัดไป)
- เมื่อเลือกภาษาไทย หน้า Tasks มีป้ายหลักเป็นภาษาไทยและ html lang เป็น th

## ขอบเขต

- บอร์ด Tasks: ชื่อโปรเจกต์ย่อ ปุ่มเลือกขั้นพร้อมจำนวน คำอธิบายขั้น
- แถบหัวและเมนูข้างบนมือถือ
- ข้อความรหัสผิด คำแนะนำครั้งแรก หน้า Help
- ตัวเลือกภาษาอังกฤษ/ไทย
- บทบาท viewer/member ลิงก์เชิญหมดอายุ/เพิกถอน audit log
- การเข้าถึง: skip link, live region, aria-controls, หัวข้อ, เป้าสัมผัส
- ไฟล์แนบบางส่วน ปุ่ม Send ว่าง กล่องสร้าง branch/worktree
- จำนวนใน 3D City และ HTML/คอนทราสต์

ไม่รวม: เก็บลิงก์เชิญลงดิสก์, TLS, แปลข้อความแชทหรือเนื้อหาไฟล์, การทดสอบกับโมเดลจริงหรือโปรแกรมอ่านหน้าจอจริง

- **In scope (`maintainer-pi-extensions`):** ตัวเลือกโปรเจกต์ใน Tasks และ tooltip ของแถว session ไม่แสดงพาธเต็ม; ผู้ใช้หาการ์ดได้โดยไม่ต้องเลื่อนข้างหา และเข้าใจความหมายของขั้น; แถบหัวบนจอ 390px ไม่ตัดชื่อ session เหลือไม่กี่ตัวอักษร และเมนูข้างปิดเมื่อเลือก session; ผู้ใช้ใหม่รู้ว่าต้องขอลิงก์ใหม่จากเจ้าของ; ผู้ใช้ใหม่เข้าใจ Main/Sub, Working/Idle, Queue/Steer, ขั้นงาน และบทบาท; ป้ายหลักของ Chat, Tasks, Git และ City ใช้ภาษาเดียวกันตามที่เลือก; ผู้ชมอ่านแชท ไฟล์ Git และบอร์ดได้ แต่ส่งข้อความ แก้ไฟล์ commit ย้ายงาน หยุดงาน หรือสร้างลิงก์เชิญไม่ได้; ลิงก์เชิญเพิ่มเติมหมดอายุเองและเพิกถอนได้ทันทีพร้อมตัด session; member เห็นกิจกรรมล่าสุดในกล่อง Access; ข้ามไปแชทได้ คำตอบใหม่ถูกประกาศ แท็บผูกกับ panel และเป้าสัมผัสใหญ่พอ; แนบเกินจำนวนหรือมีไฟล์ใหญ่เกินไม่ทำให้ไฟล์อื่นถูกทิ้งทั้งหมด; ผู้ใช้เห็นว่าต้องพิมพ์ก่อนส่ง; ไม่มีกล่อง prompt ของเบราว์เซอร์ และชื่อที่ไม่ถูกต้องถูกบอกทันที; ไม่มีข้อความ 64 agents คงที่ และป้ายย่านบนตึกอ่านได้ที่มุมเริ่มต้น; HTML ถูกต้องและอ่านโค้ดในข้อความได้
- **Out of scope:** edits outside `pi-extensions/team-webui/server.ts`, `pi-extensions/team-webui/test/server.test.mjs`, `pi-extensions/team-webui/web/ui-helpers.js`, `pi-extensions/team-webui/web/i18n.js`, `pi-extensions/team-webui/test/ui-helpers.test.mjs`, `pi-extensions/team-webui/web/**`, … +3 more

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

Pi Workspace: บอร์ดงานใช้บนมือถือได้ เลือกภาษาไทย/อังกฤษ ลิงก์เชิญแบบดูอย่างเดียวที่หมดอายุและเพิกถอนได้ พร้อมบันทึกกิจกรรม

## วิธีตรวจด้วยตัวเอง

- `cd pi-extensions && npm test`
- `cd pi-extensions && node team-webui/test/browser-run.mjs team-webui/test/usability-browser.py`
- รายงานต้นทาง: `pi-extensions/team-webui/reports/persona-usability-issues.md`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| webui-project-labels | ตัวเลือกโปรเจกต์อ่านง่าย | success | T002, T003 | test: `pi-extensions/team-webui/test/ui-helpers.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | tooltip session ไม่เผยพาธเต็ม | boundary | T002, T003 |  |  |
|  | พาธสั้น | boundary | T002, T003 |  |  |
| webui-task-stage-navigation | มือถือเห็นการ์ดทันที | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | เดสก์ท็อปไปยังขั้นที่อยู่นอกจอ | success | T003 |  |  |
|  | คำอธิบายขั้น | success | T003 |  |  |
|  | ขั้นที่เลือกว่าง | boundary | T003 |  |  |
| webui-mobile-header | ชื่อ session อ่านได้ | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | แตะ session เดิม | boundary | T003 |  |  |
| webui-login-feedback | รหัสผิด | failure | T001, T003 | test: `pi-extensions/team-webui/test/server.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | session หมดอายุ | failure | T001, T003 |  |  |
| webui-help | เปิดความช่วยเหลือ | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | คำแนะนำครั้งแรก | success | T003 |  |  |
| webui-locale | เลือกภาษาไทย | success | T002, T003, T004 | test: `pi-extensions/team-webui/test/ui-helpers.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | เลือกภาษาอังกฤษ | success | T002, T003, T004 |  |  |
|  | ไม่แปลข้อความแชท | boundary | T002, T003, T004 |  |  |
| webui-viewer-role | viewer อ่านได้ | success (allow) | T001, T003, T004 | test: `pi-extensions/team-webui/test/server.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | member ส่ง POST ได้ | success (allow) | T001, T003, T004 |  |  |
|  | viewer ออกจากระบบได้ | boundary (allow) | T001, T003, T004 |  |  |
|  | viewer ส่ง POST ไม่ได้ | failure (deny) | T001, T003, T004 |  |  |
|  | viewer อ่านรหัสหลักไม่ได้ | failure (deny) | T001, T003, T004 |  |  |
| webui-invite-lifecycle | สร้างลิงก์ viewer | success (allow) | T001, T003, T004 | test: `pi-extensions/team-webui/test/server.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | เพิกถอนตัด session | success | T001, T003, T004 |  |  |
|  | ลิงก์หมดอายุ | failure | T001, T003, T004 |  |  |
|  | ค่าที่ไม่รองรับ | failure | T001, T003, T004 |  |  |
|  | viewer สร้างลิงก์ไม่ได้ | failure (deny) | T001, T003, T004 |  |  |
| webui-audit-log | บันทึก commit | success | T001, T003 | test: `pi-extensions/team-webui/test/server.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | ไม่เก็บความลับ | boundary | T001, T003 |  |  |
|  | บันทึกการปฏิเสธ | failure | T001, T003 |  |  |
| webui-accessibility | skip link | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | ประกาศคำตอบ | success | T003 |  |  |
|  | หัวข้อในข้อความ | boundary | T003 |  |  |
|  | เป้าสัมผัส | boundary | T003 |  |  |
| webui-attachment-partial | แนบ 12 ไฟล์ | boundary | T002, T003 | test: `pi-extensions/team-webui/test/ui-helpers.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | ครบ 10 แล้ว | boundary | T002, T003 |  |  |
|  | มีไฟล์ใหญ่เกิน | failure | T002, T003 |  |  |
| webui-composer-empty | พิมพ์แล้ว | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | ช่องว่าง | boundary | T003 |  |  |
|  | มีแต่ช่องว่าง | boundary | T003 |  |  |
| webui-git-dialogs | สร้าง worktree | success | T002, T003 | test: `pi-extensions/team-webui/test/ui-helpers.test.mjs`, `pi-extensions/team-webui/test/**` | — |
|  | ยกเลิก | boundary | T002, T003 |  |  |
|  | ชื่อไม่ถูกต้อง | failure | T002, T003 |  |  |
| webui-city-counts | 6 agents | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | ไม่มี agent | boundary | T003 |  |  |
| webui-html-validity | stylesheet ใน head | success | T003 | test: `pi-extensions/team-webui/test/**` | — |
|  | คอนทราสต์ inline code | boundary | T003 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (46).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (high tier, configured model).
- Land archives it; Land never commits.
- Success: the Success criteria above hold.

## ภาคผนวก: ความครอบคลุมของการสำรวจ

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| current-behavior | covered | webui-task-stage-navigation, webui-viewer-role |  | วัดจากการทดสอบผู้ใช้จำลองบน preview fixture |
| security-privacy | covered | webui-viewer-role, webui-invite-lifecycle, webui-audit-log, webui-project-labels |  |  |
| permission-rejection | covered | webui-viewer-role, webui-invite-lifecycle |  |  |
| accessibility | covered | webui-accessibility, webui-mobile-header |  |  |
| input-boundary | covered | webui-invite-lifecycle, webui-attachment-partial, webui-git-dialogs, webui-composer-empty |  |  |
| compatibility | covered | webui-invite-lifecycle |  | รหัสหลักและ API เดิมไม่เปลี่ยน |
| non-goals | covered | webui-locale |  | ไม่เก็บลิงก์เชิญลงดิสก์ ไม่แปลข้อความแชท ไม่เพิ่ม TLS |

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (10); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for webui-project-labels, webui-task-stage-navigation, webui-mobile-header, webui-login-feedback, webui-help, webui-locale, webui-accessibility, webui-attachment-partial, webui-composer-empty, webui-git-dialogs, webui-city-counts, webui-html-validity.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1: First-run tips are rendered but not reachable in the normal case. `authenticated()` un-hides #welcome-tips (app.js:65), but the tips are inside #welcome (index.html:37). Right after that, connect() runs and its first `state` event calls switchSession(first online session) (app.js:72-74). switchSession sets `$("welcome").hidden=true` (app.js:153). Only emptyWorkspace() (app.js:143) shows #welcome again, and that happens only when there are no live sessions. So when a first-time user joins a room that has any live session, the tips and the Got it button never appear. The scenario requires them on first sign-in. Nothing in usability-browser.py checks #welcome-tips visibility, the three tips, Got it, or that they stay hidden after dismissal: its WEBUI-05 block only opens the Help dialog. Fix: show the tips somewhere that stays visible after a session is auto-selected, or don't auto-select until the tips are dismissed. Add a browser check for show → Got it → reload stays hidden. (root/pi-extensions/team-webui/web/app.js:65) | major | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | F2: A viewer can get trapped in a modal extension dialog. renderExtensionUI() still calls showModal() for viewers, and #dialog-submit and Cancel are not marked `mutates`. Every reply goes through replyDialog() → POST /ui → 403, and the throw happens before `$("extension-dialog").close()`. The dialog's cancel event calls preventDefault, so Escape doesn't close it either. A viewer whose selected session has a pending extension prompt or custom panel is stuck behind the modal until a member answers it in Pi. This conflicts with the requirement that the viewer page hides edit controls. Fix: for viewers, don't open the dialog, or make it close locally without posting. (root/pi-extensions/team-webui/web/app.js:531) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F3: Stage chip counts and the default mobile stage are calculated from `data.tasks`, which holds only the current page (paged by 200 via offset/nextOffset). On a board with more tasks than one page, the chips show page counts, not stage totals. defaultStage can also pick an empty stage even when that stage has work on another page. (root/pi-extensions/team-webui/web/tasks.js:457) | minor | แก้แล้วในรอบ 2 | claude-opus |
