# Change: นำ team-webui และ claude-accounts เข้า pi-extensions

- **Change:** `team-webui-claude-accounts-pi-extensions` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

Pi โหลด pi-team-webui (web UI, task_board, tool_guide) จากโฟลเดอร์ที่ไม่มี git และโหลด claude-accounts จาก ~/.pi/agent/extensions โดยตรง ถ้าเครื่องเสียโค้ดหายและแก้หรือทดสอบร่วมกับ extension อื่นไม่ได้ งานนี้นำทั้งสองเข้า pi-extensions ให้ใช้มาตรฐาน การตรวจ และ install.sh ชุดเดียวกัน

## ขอบเขต

- **In scope (`maintainer-pi-extensions`):** คัดลอก pi-team-webui เป็น pi-extensions/team-webui (ไม่รวม reports/, node_modules, __pycache__); คัดลอก claude-accounts เป็น pi-extensions/claude-accounts; claude-accounts หา pi-claude-subscription จาก agent dir ตอนโหลดแทน path สัมพัทธ์; team-webui ใช้ background-bash ที่อยู่ข้างกันแทน path ใน home; typecheck ครอบคลุมทุก extension รวม session-title; ลงทะเบียนใน manifest, install.sh, test.sh, docs และ CHANGELOG
- **Out of scope:** edits outside `pi-extensions/team-webui/**`, `pi-extensions/claude-accounts/**`, `pi-extensions/package.json`, `pi-extensions/package-lock.json`, `pi-extensions/tsconfig.json`, `pi-extensions/install.sh`, … +10 more; the authored Non-goals below

## Non-goals

- ไม่ลบโฟลเดอร์ ~/Desktop/Work/pi-team-webui เดิม
- ไม่เปลี่ยนพฤติกรรมของ web UI, task board หรือ /accounts
- ไม่นำ reports/ ภาพหน้าจอ หรือผล benchmark เข้า repo
- ไม่ publish npm

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

team-webui (web UI, task board, tool guide) and claude-accounts now ship in @hashtagf/pi-extensions and install with install.sh.

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| extensions-in-repo | Extensions are present without personal paths | success | T001, T002, T003 | test | — |
|  | Generated reports stay out | boundary | T001, T002, T003 |  |  |
| typecheck | โค้ดปัจจุบันผ่าน typecheck | success | T003 | test | — |
|  | ทุก extension อยู่ในขอบเขต typecheck | boundary | T003 |  |  |
|  | เรียก API ที่ไม่มีอยู่ | failure | T003 |  |  |
| team-webui-package | ลงทะเบียนครบ | success | T001, T003 | test | — |
|  | background jobs จาก extension ข้างกัน | success | T001, T003 |  |  |
|  | เทสต์ reload ครบโมดูล | failure | T001, T003 |  |  |
| claude-accounts-package | ใช้แพ็กเกจที่ติดตั้งไว้ | success | T002 | test | — |
|  | ไม่มีแพ็กเกจ subscription | failure | T002 |  |  |
| renderer-build | สร้าง renderer | success | T003 | test | — |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (11).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for extensions-in-repo, typecheck, team-webui-package, claude-accounts-package, renderer-build.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | f1: The default `manager` lookup (`createRequire(import.meta.url)("../background-bash/manager.cjs")`) has no test. `jobs.test.mjs` and `preview.mjs` pass the manager in explicitly, so the "no ~/.pi/agent/extensions/background-bash" scenario is implemented but unproven. The `MODULE_NOT_FOUND` catch also silently degrades to "Background extension is not installed" even though the sibling is now always shipped. (root/pi-extensions/team-webui/jobs.ts:12) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f2: The test links the real `~/.pi/agent/git/github.com/inhumanxd/pi-claude-subscription` into the temp agent dir. It also needs the local patched provider factory that accepts an id and name. On a machine without that package, `npm test` fails instead of skipping. (root/pi-extensions/claude-accounts/accounts.test.cjs:9) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f3: `checkPersonalPaths`, which backs the "no /Users/ path" scenario, has no unit test. It only runs through `npm run pack:check`, which `npm test` does not run. `pack-check.mjs` itself contains the literal '/Users/' search string, so a naive search of `pi-extensions/` would still match it. (root/pi-extensions/scripts/pack-check.test.cjs:46) | minor | ยังเปิดอยู่ | claude-opus |
| 1 | f4: When the subscription package is missing but `auth.json` already holds account entries, the `session_start` handler's `sync()` throws the install message. The handler turns it into an error-level notify on every session start. This is not a crash, but it is noisy for a case the spec treats as normal. Reporting it only through `/accounts` would be quieter. (root/pi-extensions/claude-accounts/index.ts:103) | minor | ยังเปิดอยู่ | claude-opus |
