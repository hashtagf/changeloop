<!-- change-loop:generated-investigation-report:v1 -->
# รายงานการสำรวจปัญหา: consumer-agent-tools

**สถานะ:** ข้อสรุปปัจจุบัน

อัปเดต: 2026-11-12T23:07:15.101Z · 28d7178df1134900ff460a92bc6894273e0eac1fcb3dde00a9337f595c0c5617

## ปัญหา

agent ได้เครื่องมืออะไรบ้างเมื่อเอา Change Loop ไปติดตั้ง แต่ละอย่างใช้ทำอะไร และส่วนไหนซับซ้อนหรือซ้ำซ้อน

## ความต้องการและบริบทที่บันทึกไว้

**เป้าหมาย:** สำรวจเครื่องมือทั้งหมดที่ agent มีเมื่อใช้ Change Loop ในโปรเจกต์ผู้ใช้

**ผลลัพธ์ที่ต้องการ:** รายการเครื่องมือ หน้าที่ เส้นทางใช้งานหลัก และส่วนที่ซับซ้อนหรือซ้ำซ้อน โดยแยกเครื่องมือจาก host และเครื่องมือเฉพาะผู้ดูแล upstream


### ผู้เกี่ยวข้อง

- ผู้ใช้
- coding agent
- harness
- host

### ขอบเขต

- สิ่งที่ installer ส่งให้ consumer
- CLI และ slash commands
- skills และ scripts
- hooks และ host adapters
- evidence providers และเครื่องมือโปรเจกต์
- ความซับซ้อนและขอบเขตอำนาจ

## ข้อสรุปปัจจุบัน

สำรวจ source 197bd9c5 เสร็จตามขอบเขตงานอ่านอย่างเดียว ไม่ได้เสนอเปลี่ยน product: Change Loop ส่ง CLI registry 94 รายการ (26 internal), slash command 9 ตัว, skill 41 ตัว, ไฟล์ตรงใต้ scripts ของ skill 54 ไฟล์ (รวม helper), hooks และ evidence adapters 6 แบบ เส้นทางปกติสั้นกว่ารายการทั้งหมดมาก: investigate ตามต้องการ → change start → advance อ่าน inventory และหน้าที่โดยละเอียดได้ที่ \[แผนที่เครื่องมือ\](consumer-agent-tools.md) ความซับซ้อนหลักคือ wrapper หลายชั้น, authority/recovery เฉพาะสถานการณ์, ชุด UX หลายเครื่องมือ และ guard coverage ต่างกันตาม host การมี Change Loop ไม่ได้ทำให้มี browser/LSP/MCP/subagent เพิ่มเอง และไม่ได้หมายความว่าทุก script พร้อมรันหรือทุก host ถูก sandbox แบบ OS นี่เป็นข้อสรุปจาก source ไม่ใช่ผลทดสอบ consumer/host จริง

## ข้อเสนอแนะและเหตุผล

สำรวจ source 197bd9c5 เสร็จตามขอบเขตงานอ่านอย่างเดียว ไม่ได้เสนอเปลี่ยน product: Change Loop ส่ง CLI registry 94 รายการ (26 internal), slash command 9 ตัว, skill 41 ตัว, ไฟล์ตรงใต้ scripts ของ skill 54 ไฟล์ (รวม helper), hooks และ evidence adapters 6 แบบ เส้นทางปกติสั้นกว่ารายการทั้งหมดมาก: investigate ตามต้องการ → change start → advance อ่าน inventory และหน้าที่โดยละเอียดได้ที่ \[แผนที่เครื่องมือ\](consumer-agent-tools.md) ความซับซ้อนหลักคือ wrapper หลายชั้น, authority/recovery เฉพาะสถานการณ์, ชุด UX หลายเครื่องมือ และ guard coverage ต่างกันตาม host การมี Change Loop ไม่ได้ทำให้มี browser/LSP/MCP/subagent เพิ่มเอง และไม่ได้หมายความว่าทุก script พร้อมรันหรือทุก host ถูก sandbox แบบ OS นี่เป็นข้อสรุปจาก source ไม่ใช่ผลทดสอบ consumer/host จริง

## ข้อเท็จจริงที่มีแหล่งอ้างอิง

- **installed-boundary:** install.sh:80–108 ส่ง .claude/commands, harness, skills, rules, hooks, openspec/schemas และ WORKFLOW.md ให้ consumer แต่ตัด harness/tests และ harness/fixtures ออก; ไม่ได้ส่ง .claude/tests หรือ release/benchmark tooling ให้ผู้ใช้ ([install.sh](<../../install.sh>))
- **command-counts:** commands.json มี 94 รายการ แบ่ง agent 25, conditional 21, host 10, admin 12 และ internal 26; จำนวนนี้คือรายการ registry ไม่ใช่ 94 เครื่องมือที่ agent ต้องเรียกทุกงาน และบางรายการระบุเองว่าไม่ใช่ CLI command ([.claude/harness/commands.json](<../../.claude/harness/commands.json>))
- **default-path:** เส้นทางปกติคือ investigate ตามต้องการ → change start \<draft\> → advance \<change\> --through build|proven|archived; advance รวมงาน deterministic หลาย primitive และคืนการกระทำที่ต้องทำต่อ ไม่จำเป็นต้องประกอบ proof/sandbox/land primitive เอง ([.claude/harness/commands.json](<../../.claude/harness/commands.json>))
- **slash-commands:** มี slash command 9 ตัว: /investigate สำรวจโดยไม่แก้ product, /change สร้าง agreement, /build ลงมือใน workspace แยก, /prove ผลิตหลักฐาน, /land นำงานกลับและ archive ภายใต้อำนาจผู้ใช้, /deliver ส่งมอบเป็น Git/PR เมื่ออนุญาต, /changes ดูสถานะ, /feature เดินงานจาก PRD, /dev ประกอบหลาย phase; slash เป็นคำสั่ง/คำแนะนำให้ agent ไม่ใช่ editor หรือ shell ตัวใหม่; /build และ /prove ต่างก็ใช้ advance --through proven ในคำสั่งปัจจุบัน แต่มีหน้าที่ต่างกัน ([.claude/harness/README.md](<../../.claude/harness/README.md>), [.claude/commands/build.md](<../../.claude/commands/build.md>), [.claude/commands/prove.md](<../../.claude/commands/prove.md>), [.claude/commands/deliver.md](<../../.claude/commands/deliver.md>))
- **agent-cli-25:** CLI กลุ่ม agent ครบ 25: investigate (บันทึกวิจัย); changes/current (เลือกและดูงาน); doctor (วินิจฉัย); packet (บริบทงานย่อย); metrics/feedback/outcomes/lessons (ต้นทุน เวลา ผลลัพธ์ และบทเรียน); advance (ตัวประสาน lifecycle); package (ข้อมูลอนุมัติ); preview (หลักฐานก่อน Build ซึ่งไม่ใช่ proof); exec (รันคำสั่งโปรเจกต์ใน workspace และจับเวลา); describe (ค้น contract คำสั่ง); change start/resolve/amend/revise/validate/audit (สร้าง ตัดสินใจ แก้ agreement และตรวจ traceability); sandbox create/sync (isolation และ sync); handoff status/list/packet (ติดตามงานของ operator) ต้องเรียกตาม phase และ route ไม่ใช่ preflight ทุกคำสั่งทุกงาน ([.claude/harness/commands.json](<../../.claude/harness/commands.json>))
- **conditional-cli-21:** CLI เฉพาะสถานการณ์ครบ 21: handoff record (operator รับหรือจบงาน); agents plan (วางแผนงานขนาน); evidence verify-ci/hash (ผูก CI กับ hash); authority request/status/dispatch/abort/run/reset-infra/extend-review/reset-base-move/record (review และ acceptance ที่กู้คืนได้); evidence record (รับหลักฐานภายนอก); budget continue (ต่อ allowance ที่อนุญาต); change abandon/waive (หยุดงานหรือถอน capability gate ตามอำนาจที่บันทึก); providers (ดู wiring); quality run/report/debt (รันคุณภาพ รายงาน และหนี้) ไม่ใช่อำนาจให้ agent waive หรือเพิ่มงบเอง ([.claude/harness/commands.json](<../../.claude/harness/commands.json>))
- **host-cli-10:** Host integration ครบ 10: deliver advance (commit/branch/PR เมื่อได้รับอำนาจ); agents dispatch/acquire/release (ส่งงานและ resource leases ไม่ได้เรียก model เอง); host agent-contract/instruction (โหลด contract ที่ package เป็นเจ้าของ); telemetry sync/import/host-import (usage และ provenance จริงจาก host); sandbox challenge (challenge สำหรับ unattended authority) สิ่งเหล่านี้ไม่ใช่คำสั่งผลิตภัณฑ์ของผู้ใช้ ([.claude/harness/commands.json](<../../.claude/harness/commands.json>), [.claude/harness/README.md](<../../.claude/harness/README.md>))
- **admin-cli-12:** Admin/ตั้งค่าครบ 12: init (install/upgrade และ host adapter), repos (topology), models (model policy), quality discover/init/doctor/baseline (ค้นและตั้ง quality), version/update check/help (ข้อมูลและคำสั่ง), dashboard/dashboard snapshot (presence และ read-only projection) คำสั่ง update check ไม่ได้อัปเดต package ให้เอง ([.claude/harness/commands.json](<../../.claude/harness/commands.json>))
- **internal-cli-26:** Internal ครบ 26: change new; proof readiness/collect/advance/run/preflight/execute/finalize/audit; land check/advance/recover/archive/resume/plan; evidence detect/init/doctor/run; budget checkpoint; sandbox inspect/apply; proof-plan; agent-task; event; api-version. ส่วนใหญ่เป็น primitive ที่ coordinator เรียกให้ และ proof-plan/agent-task/event/api-version บางรายการระบุเป็น runtime diagnostic ไม่ใช่ public CLI; ซ่อนจาก help ปกติไม่เท่ากับถูกลบ และบาง recovery ยังต้องใช้ primitive เฉพาะตาม route ([.claude/harness/commands.json](<../../.claude/harness/commands.json>))
- **guard-tools:** hooks/README.md และ settings.json: session-context เติมบริบทเมื่อเริ่ม session; dev-terminal-guard ตรวจการหยุด /dev โดยไม่อ้าง proof ปลอม; no-detached-authority ทำ reviewer แบบ attached; shell-route-guard ชี้คำสั่ง shell ที่ host ยอมรับ; phase-mutation-guard คุม phase/workspace/authority; protect-secrets ส่งการอ่านไปที่สำเนา redacted; lint ส่ง diagnostics หลัง edit; no-direct-main-commit เป็น opt-in Git hook ไม่ใช่เปิดเองทุก host. Hook เป็นตัวครอบเครื่องมือที่ host มี ไม่ได้เพิ่มสิทธิ์ editor/shell; default หลายกรณีเป็น guidance/audit และ strict mode เป็นอีกเงื่อนไข เครื่องมือขาดอาจ fail open ([.claude/hooks/README.md](<../../.claude/hooks/README.md>), [.claude/settings.json](<../../.claude/settings.json>))
- **host-not-included-tools:** README.md:496–552 และ host-capabilities.json: Change Loop ไม่ได้สร้าง Read/Write/Edit/Bash, native subagent, browser, LSP หรือ MCP ให้เอง สิ่งเหล่านี้ขึ้นกับ host/extension ที่ติดตั้ง; Claude Code มี live phase/secrets/lint/session guards เต็มตาม declared capability, Pi และ OpenCode partial, Cursor/Codex ไม่มี live tool guard ใน adapter ที่ส่ง, Gemini ยังประกาศ native dispatch unavailable; ทุก host ยังมี runtime Land gates. Pi custom/MCP tools และ extension อื่นอยู่นอก live boundary และไม่ใช่ OS sandbox ([.claude/harness/README.md](<../../.claude/harness/README.md>), [.claude/hooks/README.md](<../../.claude/hooks/README.md>), [.claude/harness/adapters/host-capabilities.json](<../../.claude/harness/adapters/host-capabilities.json>))
- **skill-script-functions:** UX README:95–140 แบ่ง scripts เป็น check.py ทางเข้าตรวจ, static checks (contrast/placeholders/slop/state/design\_md/script), browser checks (render/fold/flow/admin), design/tokens/preview, lookup/assets/network และ helpers; test-design/SKILL.md:267–316 มี scaffold.py สร้างเอกสารกับ checklist.py ตรวจ criteria; ui-ux-pro-max/search-tool.md:30–118 ใช้ search.py ค้น data/design system ไม่ใช่ browser แบบทั่วไป รายชื่อทุกตัวกับหน้าที่และ skill catalog ครบอยู่ใน authored note consumer-agent-tools.md ([.claude/skills/ux-ui-principles/README.md](<../../.claude/skills/ux-ui-principles/README.md>), [.claude/skills/test-design/SKILL.md](<../../.claude/skills/test-design/SKILL.md>), [.claude/skills/ui-ux-pro-max/references/search-tool.md](<../../.claude/skills/ui-ux-pro-max/references/search-tool.md>), [.claude/rules/fundamentals.md](<../../.claude/rules/fundamentals.md>))
- **complexity-assessment:** ข้อประเมินจากรายการ source: wrapper ซ้ำชื่อระหว่าง slash/skill/CLI และ registry ที่แบ่งหลาย audience เพิ่มภาระการเลือก แต่ normal path ใช้ coordinator เดียว; /build กับ /prove มีคำสั่ง advance เป้าหมายเดียวแต่ภารกิจต่างกัน; testing-fundamentals (โค้ด test) กับ test-design (QA cases/plans) และ UX 4 skill มีจุดต่อที่ต้องเลือกให้ถูก ส่วน authority reset หลายชนิดมีเงื่อนไขต่างกัน ไม่ใช่หลักฐานว่าเป็นโค้ดตายหรือควรถูกลบ ต้องตาม action/resume ไม่เดา primitive เอง ([.claude/harness/commands.json](<../../.claude/harness/commands.json>), [.claude/rules/fundamentals.md](<../../.claude/rules/fundamentals.md>), [.claude/commands/build.md](<../../.claude/commands/build.md>), [.claude/commands/prove.md](<../../.claude/commands/prove.md>))
- **evidence-tools:** EVIDENCE.md:335–353 มี adapter 6 แบบ: command รันคำสั่งโปรเจกต์; test-discovery รัน test พร้อม discovery receipts; playwright รัน browser test ของโปรเจกต์; contract-digest เปรียบ bytes ข้าม repo; benchmark เทียบ base/head; external รอระบบอื่นยืนยัน. Adapter ไม่เท่ากับติดตั้ง npm/pytest/Playwright/knip ให้แล้ว: executable และ reports ต้องมีจริง การ detect wiring ไม่ใช่ proof; tool-preparation.mjs:24–36 เติม PATH ของ .foundation/tools/node\_modules/.bin และ node\_modules/.bin เมื่อมี ([.claude/harness/EVIDENCE.md](<../../.claude/harness/EVIDENCE.md>), [.claude/harness/runtime/core/tool-preparation.mjs](<../../.claude/harness/runtime/core/tool-preparation.mjs>))

## สมมติฐานและหลักฐาน

ยังไม่ได้บันทึก

## การตัดสินใจ

ยังไม่ได้บันทึก

## สิ่งที่ยังไม่รู้และงานที่เหลือ

ยังไม่ได้บันทึก

## แหล่งอ้างอิง

- [.claude/commands/build.md](<../../.claude/commands/build.md>)
- [.claude/commands/deliver.md](<../../.claude/commands/deliver.md>)
- [.claude/commands/prove.md](<../../.claude/commands/prove.md>)
- [.claude/harness/EVIDENCE.md](<../../.claude/harness/EVIDENCE.md>)
- [.claude/harness/README.md](<../../.claude/harness/README.md>)
- [.claude/harness/adapters/host-capabilities.json](<../../.claude/harness/adapters/host-capabilities.json>)
- [.claude/harness/commands.json](<../../.claude/harness/commands.json>)
- [.claude/harness/runtime/core/tool-preparation.mjs](<../../.claude/harness/runtime/core/tool-preparation.mjs>)
- [.claude/hooks/README.md](<../../.claude/hooks/README.md>)
- [.claude/rules/fundamentals.md](<../../.claude/rules/fundamentals.md>)
- [.claude/settings.json](<../../.claude/settings.json>)
- [.claude/skills/test-design/SKILL.md](<../../.claude/skills/test-design/SKILL.md>)
- [.claude/skills/ui-ux-pro-max/references/search-tool.md](<../../.claude/skills/ui-ux-pro-max/references/search-tool.md>)
- [.claude/skills/ux-ui-principles/README.md](<../../.claude/skills/ux-ui-principles/README.md>)
- [.claude/skills/ux-ui-principles/scripts/backoffice\_preview.js](<../../.claude/skills/ux-ui-principles/scripts/backoffice_preview.js>)
- [.claude/tests/README.md](<../../.claude/tests/README.md>)
- [WORKFLOW.md](<../../WORKFLOW.md>)
- [docs/reports/agent-harness-simplification-plan-2026-09-03.md](<../../docs/reports/agent-harness-simplification-plan-2026-09-03.md>)
- [docs/reports/ai-native-sdlc-playbook-2026-11-09.md](<../../docs/reports/ai-native-sdlc-playbook-2026-11-09.md>)
- [docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md](<../../docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md>)
- [docs/reports/consumer-quality-framework-plan.md](<../../docs/reports/consumer-quality-framework-plan.md>)
- [docs/reports/development-roadmap-2026-09-05.md](<../../docs/reports/development-roadmap-2026-09-05.md>)
- [docs/reports/harness-behavior-plan-2026-09-05.md](<../../docs/reports/harness-behavior-plan-2026-09-05.md>)
- [docs/reports/harness-core-path-simplification-plan-2026-09-30.md](<../../docs/reports/harness-core-path-simplification-plan-2026-09-30.md>)
- [docs/reports/harness-report-make-harness-feedback-version-aware-upgrade-safe-actionable-and-.html](<../../docs/reports/harness-report-make-harness-feedback-version-aware-upgrade-safe-actionable-and-.html>)
- [docs/reports/harness-report-maximize-harness-guidance-and-automation.html](<../../docs/reports/harness-report-maximize-harness-guidance-and-automation.html>)
- [docs/reports/related-projects-research-2026-09-05.md](<../../docs/reports/related-projects-research-2026-09-05.md>)
- [docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md](<../../docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md>)
- [install.sh](<../../install.sh>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/design.md](<../changes/archive/2026-10-16-complete-change-packets/design.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/proposal.md](<../changes/archive/2026-10-16-complete-change-packets/proposal.md>)
- [openspec/changes/archive/2026-10-18-approval-package-route-change/proposal.md](<../changes/archive/2026-10-18-approval-package-route-change/proposal.md>)
- [openspec/changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md](<../changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md>)
- [openspec/specs/change/spec.md](<../specs/change/spec.md>)
- [openspec/specs/skill-guidance/spec.md](<../specs/skill-guidance/spec.md>)
- [website/docs/src/content/docs/th/approval.md](<../../website/docs/src/content/docs/th/approval.md>)
- [website/docs/src/content/docs/th/cli.md](<../../website/docs/src/content/docs/th/cli.md>)

## แหล่งที่ค้นพบแต่ยังไม่มีข้อเท็จจริงอ้างอิง (hash แล้ว ยังไม่ได้อ่าน)

- [docs/reports/agent-harness-simplification-plan-2026-09-03.md](<../../docs/reports/agent-harness-simplification-plan-2026-09-03.md>)
- [docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md](<../../docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md>)
- [openspec/specs/skill-guidance/spec.md](<../specs/skill-guidance/spec.md>)
- [website/docs/src/content/docs/th/cli.md](<../../website/docs/src/content/docs/th/cli.md>)
- [openspec/specs/change/spec.md](<../specs/change/spec.md>)
- [docs/reports/harness-core-path-simplification-plan-2026-09-30.md](<../../docs/reports/harness-core-path-simplification-plan-2026-09-30.md>)
- [docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md](<../../docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md>)
- [docs/reports/ai-native-sdlc-playbook-2026-11-09.md](<../../docs/reports/ai-native-sdlc-playbook-2026-11-09.md>)
- [docs/reports/harness-report-make-harness-feedback-version-aware-upgrade-safe-actionable-and-.html](<../../docs/reports/harness-report-make-harness-feedback-version-aware-upgrade-safe-actionable-and-.html>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/proposal.md](<../changes/archive/2026-10-16-complete-change-packets/proposal.md>)
- [openspec/changes/archive/2026-10-18-approval-package-route-change/proposal.md](<../changes/archive/2026-10-18-approval-package-route-change/proposal.md>)
- [docs/reports/development-roadmap-2026-09-05.md](<../../docs/reports/development-roadmap-2026-09-05.md>)
- [openspec/changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md](<../changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md>)
- [docs/reports/harness-behavior-plan-2026-09-05.md](<../../docs/reports/harness-behavior-plan-2026-09-05.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/design.md](<../changes/archive/2026-10-16-complete-change-packets/design.md>)
- [WORKFLOW.md](<../../WORKFLOW.md>)
- [website/docs/src/content/docs/th/approval.md](<../../website/docs/src/content/docs/th/approval.md>)
- [.claude/skills/ux-ui-principles/scripts/backoffice\_preview.js](<../../.claude/skills/ux-ui-principles/scripts/backoffice_preview.js>)
- [docs/reports/harness-report-maximize-harness-guidance-and-automation.html](<../../docs/reports/harness-report-maximize-harness-guidance-and-automation.html>)
- [docs/reports/consumer-quality-framework-plan.md](<../../docs/reports/consumer-quality-framework-plan.md>)
- [docs/reports/related-projects-research-2026-09-05.md](<../../docs/reports/related-projects-research-2026-09-05.md>)
- [.claude/tests/README.md](<../../.claude/tests/README.md>)

## ขั้นตอนถัดไป

สำรวจเสร็จแล้วและไม่แนะนำให้ทำ Change

Investigation is complete without proposing a change.

คำสั่งที่ agent ใช้ทำต่อ:

```text
claude-foundation investigate openspec/investigations/consumer-agent-tools.json
```

