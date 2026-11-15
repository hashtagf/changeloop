# แผนที่เครื่องมือ agent เมื่อใช้ Change Loop ในโปรเจกต์ผู้ใช้

ตรวจ source revision `197bd9c5` แบบอ่านอย่างเดียว ไม่ติดตั้งหรือรันเครื่องมือเหล่านี้จริง และไม่แก้ product/spec ใช้เพียง record และบันทึก Investigate นี้ รายงานสถานะปัจจุบันอยู่ที่ [รายงานที่ harness สร้าง](consumer-agent-tools.report.md)

## 1. คำว่า tool มีหลายชั้น ไม่ควรนับรวมเป็นอย่างเดียว

| ชั้น | ได้จากใคร | ใช้ทำอะไร |
|---|---|---|
| Read/Edit/Write/Bash และการค้นไฟล์ | Host เช่น Claude Code, Pi, Codex | อ่านและแก้โค้ด รันคำสั่ง |
| Subagent, background job, LSP, browser, MCP | Host หรือ extension ที่ผู้ใช้ติดตั้ง | ความสามารถเสริม ขึ้นกับ session ไม่ได้การันตีโดย Change Loop |
| Slash commands | Change Loop + adapter ของ host | แปลงเจตนาผู้ใช้เป็นขั้นตอน workflow |
| `claude-foundation` CLI | Change Loop | agreement, isolation, proof, review, authority, recovery และ archive |
| Skills | Change Loop | วิธีคิด/วิธีทำตามงาน โหลดเมื่อเกี่ยวข้อง ไม่ใช่ proof และไม่เพิ่มอำนาจ |
| Scripts ใน skill | ชุด skill ที่ส่งไปพร้อม install | ค้นข้อมูล ตรวจ สร้างไฟล์ หรือ eval เฉพาะทาง |
| Hooks/guards | Change Loop แต่ต้องมี host wiring | ครอบเครื่องมือของ host เพื่อชี้ route ตรวจ phase/secret และ lint |
| Evidence adapters | Change Loop + tool ของโปรเจกต์ | รัน test/browser/benchmark ฯลฯ แล้วบันทึกหลักฐานที่ผูกกับงาน |

หลักฐาน: `install.sh:80–108`; `.claude/harness/README.md:477–552`; `.claude/hooks/README.md`; `.claude/harness/EVIDENCE.md:335–353`.

## 2. เส้นทางปกติที่ควรจำ

ผู้ใช้: `/investigate? → /change → /build → /prove → /land` แล้ว `/deliver` เฉพาะต้องการ Git/PR

agent: `investigate --template` และ `investigate <record>` → `change start <draft>` → `advance <change> --through build|proven|archived`

- `advance` ทำงาน deterministic และรวม primitive หลายตัวให้ แล้วคืน action/resume เมื่อถึงงานของ agent หรือการตัดสินใจของผู้ใช้
- งานส่วนใหญ่ไม่ควรให้ agent เลือกจากคำสั่ง 94 รายการเอง
- `/changes` อ่านสถานะ; `/feature` เริ่มจาก PRD; `/dev` เป็น composition ของหลาย phase
- `/build` กับ `/prove` ใน source ปัจจุบันเรียก `advance --through proven` เหมือนกัน แต่หน้าที่คนละเรื่อง: อันแรกลงมือ/ซ่อม product อันหลังผลิต/ซ่อมหลักฐาน
- `/land` ใช้ authority ของผู้ใช้และนำ diff กลับแบบยังไม่ commit; `/deliver` เป็นขอบเขต Git/PR แยกต่างหาก ไม่อนุญาต merge/deploy/force-push/default-branch push

หลักฐาน: `.claude/commands/*.md`; `.claude/harness/commands.json`; `.claude/harness/README.md:300–376`.

## 3. CLI ทุกกลุ่ม

Registry มี **94 รายการ**: agent 25, conditional 21, host 10, admin 12, internal 26 ตัวเลขนี้รวม runtime diagnostics ที่ไม่ใช่ CLI ด้วย จึงไม่ใช่ 94 executable tools

รายการครบและหน้าที่ของแต่ละกลุ่มบันทึกอยู่ในข้อเท็จจริงของ [รายงานหลัก](consumer-agent-tools.report.md) แหล่ง authoritative คือ `.claude/harness/commands.json` ไม่ควรคัดลอก command usage ยาวทั้งหมดซ้ำที่นี่

### กลุ่มที่มักต้องอ่านเมื่อเกิดเหตุ

- สถานะ/บริบท: `changes`, `current`, `packet`, `feedback`
- ตรวจสาเหตุ: `doctor`, `describe`, `providers`, `repos`, `models`
- Review/acceptance: `authority request/status/dispatch/run/record` และ recovery ที่คืนมา
- Isolation: `sandbox create/sync` เมื่อ coordinator หรือ recovery route ต้องการ
- หลักฐานภายนอก: `evidence record`, `evidence verify-ci`, `hash`
- งบ: `metrics`, `budget continue` ภายใต้อำนาจที่บันทึก ไม่ใช่เพิ่มงบเอง
- Quality: `quality discover/init/doctor/baseline/run/report/debt`
- งาน operator: `handoff list/status/packet/record`
- สรุปย้อนหลัง: `outcomes`, `lessons`
- ก่อนอนุมัติ: `package`, `preview` โดย preview ไม่ใช่ proof ของ Prove
- ส่งมอบ: `deliver advance` เท่านั้นเมื่ออนุญาต

## 4. Skills ทั้ง 41 ตัวใน checkout ที่ตรวจ

จำนวนนี้มาจากไฟล์ `.claude/skills/*/SKILL.md` ไม่ใช่ skill ส่วนตัวทั้งหมดที่ host ของผู้ใช้มี วิธีเรียกตามงานอยู่ใน `.claude/rules/fundamentals.md`

| กลุ่ม | รายชื่อและหน้าที่ |
|---|---|
| Lifecycle | `investigate` สำรวจ; `change` agreement; `build` implementation; `prove` evidence; `land` apply/archive; `changes` สถานะ; `dev` composition; `feature` จาก PRD |
| เตรียมงาน | `brainstorming` ทางเลือกที่ยังเปิด; `plan-writing` ออกแบบ/ลำดับงาน; `change-impact-analysis` หา consumer และ blast radius; `coding-discipline` scope/โค้ดน้อยแต่ครบ/ต้นเหตุ; `grill-task-gu` PRD เป็น Decision Sheet/backlog; `grill-task-gu-please` alias |
| Logic/domain | `programming-fundamentals` types/state/module; `ddd-strategic` คำและขอบเขตธุรกิจ; `hexagonal-backend` ports/adapters; `architecture-fundamentals` การแยก/สื่อสารบริการ |
| Data/API/async | `database-fundamentals` schema/query/transaction; `api-design-fundamentals` public contract; `concurrency-fundamentals` งานพร้อมกันใน process; `queue-fundamentals` message/job ข้าม process |
| ซ่อมและตรวจ | `debug-fundamentals` bug ไม่รู้ต้นเหตุ; `performance-investigation` ช้า/หน่วยความจำ/benchmark; `refactoring-fundamentals` เปลี่ยนโครงไม่เปลี่ยน behavior; `testing-fundamentals` เขียน/ซ่อม automated tests; `test-design` QA cases/plans/UAT/go-no-go; `security-fundamentals` trust boundary; `observability-fundamentals` logs/metrics/traces |
| UI | `ux-ui-principles` flow/state/accessibility/design workflow; `ui-ux-pro-max` ค้น style/palette/typography; `frontend-design` implementation/visual polish; `tailwind-design-system` tokens/themes/variants |
| ส่งมอบ | `git-workflow` branch/commit/push/PR เมื่ออนุญาต; `delivery-engineering` CI/build/container/deploy plan |
| เอกสาร | `claude-md` agent guide; `init-project-docs` เอกสารมนุษย์; `harness-html-report` รายงานจาก state ของ Change Loop |
| ดูแล skill | `skill-creator` สร้าง/แก้ skill; `skill-evaluation` เปรียบเทียบ model จริง; `skill-suite-auditor` ตรวจ catalog/ลิงก์/trigger |

## 5. Scripts ที่ส่งไปด้วย

พบไฟล์ตรงใต้ `*/scripts/` **54 ไฟล์** รวม library/internal helpers ไม่ใช่ 54 คำสั่งอิสระ ไม่รันทุกตัวในทุกงาน

### กลุ่มทั่วไป

- `test-design/scripts/scaffold.py`: สร้างโครง test docs; `checklist.py`: สร้าง/ตรวจ checklist ให้ตรง criteria (`test-design/SKILL.md:267–316`)
- `init-project-docs/scripts/build_doc_viewer.py`: สร้าง HTML viewer ของเอกสาร
- `skill-suite-auditor/scripts/audit.mjs`: ตรวจ metadata และ reference ของ skill catalog
- `ui-ux-pro-max/scripts/search.py`: ทางเข้าค้น design data และ design system; `core.py`, `design_system.py`: implementation modules (`references/search-tool.md:30–118`)
- `skill-creator/scripts/quick_validate.py`: ตรวจ skill; `package_skill.py`: package; `run_eval.py`: trigger eval; `improve_description.py`: ปรับ description; `run_loop.py`: วน eval/improve; `aggregate_benchmark.py`: รวมผล; `generate_report.py`: HTML report; `utils.py`, `__init__.py`: helper/module support
- กลุ่ม eval/improve เรียก model ได้ มีต้นทุน ไม่ใช่การตรวจ deterministic ฟรี และการมี script ไม่ใช่อนุญาตให้รัน paid activity

### UX scripts ครบ 38 ไฟล์

หน้าที่อ้างจากตารางต้นทาง `.claude/skills/ux-ui-principles/README.md:95–140`:

| กลุ่ม | Script และหน้าที่ |
|---|---|
| ทางเข้าตรวจ | `check.py` ประสาน static/render checks |
| Static checks | `contrast.py` สี; `placeholders.py` ของปลอมค้าง; `slop_check.py` ลักษณะ template; `state_check.py` state markers; `design_md_check.py` ตรวจ DESIGN.md; `script_check.js` syntax/global clash |
| Browser checks | `render_check.js` responsive/overflow/JS errors; `fold_check.js` CTA เหนือ fold; `flow_check.js` journey/failure path; `admin_check.js` ตาราง/admin/states |
| Design record/tokens | `code_extract.py` ถอดของเดิม; `design_md.py` เขียน DESIGN.md; `export_tokens.py` tokens; `direction_recipe.py` กติกา direction; `tweaks_panel.py` ปรับค่าระหว่างรีวิว |
| Preview/composition | `build_previews.js` สร้าง preview; `direction_preview.js` preview direction; `backoffice_preview.js` preview admin; `compositions.js` layout; `brand.js` token ชุดเดียวข้ามหน้า |
| ค้นข้อมูล/asset | `look.py` เลือกคลัง; `ds_lookup.py` design-system guide; `icons.py` icon/logo; `photo_search.py` รูปพร้อม credit; `market_fetch.js` สำรวจ/แคปเว็บ; `showcase_fetch.py`, `mobbin_fetch.py` เก็บภาพคลัง; `halftone.py` แปลงรูป |
| รายงาน | `review_report.py` findings เป็น HTML |
| Internal helpers | `_pw.js`, `_args.js`, `_color.js`, `_report.js`, `_net.py`, `_composition.js`, `_color.py`, `_library.py` |

Browser/เครือข่าย/CLI ที่ script ต้องใช้ต้องมีจริง การค้นภาพ/เว็บมี network และ licensing/privacy considerations; exit 3 ของชุด UX หมายถึง NOT RUN ไม่ใช่ pass (`README.md:140` เป็นต้นไป)

## 6. Hook และ host: ไม่ได้ป้องกันเหมือนกันทุกที่

- Claude Code: declared full live phase/secrets/lint/session-digest guards
- Pi/OpenCode: partial; Pi ครอบ built-in tools แต่ไม่ครอบ custom/MCP หรือ extension อื่นทุกตัว
- Cursor/Codex: adapter ที่ส่งไม่มี live mutation guards; runtime gates ยังอยู่
- Gemini: native dispatch และ live guards ประกาศ unavailable จนกว่าจะยืนยัน
- ไม่ใช่ OS sandbox และไม่แปลว่า agent อ่าน/เขียนผ่านทุกทางถูก intercept
- บาง hook ใช้ guidance/redirect/audit เป็น default; strict block เป็น configuration อีกชั้น และเมื่อ toolchain ขาด hook อาจ fail open

หลักฐาน: `.claude/harness/adapters/host-capabilities.json`; `.claude/hooks/README.md`; `.claude/settings.json:29–102`; `.claude/harness/README.md:519–552`.

## 7. ส่วนที่ซับซ้อนหรือซ้ำซ้อน — ข้อประเมินจาก source ไม่ใช่ benchmark UX

1. **ชื่อเดียวหลายชั้น:** `/build` เป็น host instruction, `build` เป็น skill และงานจริงไปผ่าน `advance`; อาจทำให้คิดว่าต้องรันทุกตัว แต่จริงเป็น wrapper คนละชั้น
2. **Registry ใหญ่กว่าเส้นทางใช้งานหลักมาก:** 94 entries แต่ 26 internal และที่เหลือหลายกลุ่มเฉพาะเหตุการณ์ เป็นความซับซ้อนสำหรับ implementer/operator มากกว่าผู้ใช้ทั่วไป
3. **Review recovery มีหลาย route:** authority reset-infra/extend-review/reset-base-move มีเหตุและ authority ต่างกัน ห้ามรวมเป็นปุ่ม retry แบบไม่ดูเหตุ ให้ทำ exact resume ที่ runtime คืน
4. **Host ต่างกันจริง:** มี command เหมือนกันไม่ได้หมายความว่ามี guard coverage เหมือนกัน โดยเฉพาะ MCP/custom tools และ unattended use
5. **ชุด UX หนักและทับขอบเขต skill อื่น:** ux-ui-principles มี workflow, คลัง, script ตรวจ, preview, research อยู่แล้ว ขณะเดียวกันมี ui-ux-pro-max/frontend-design/Tailwind อีก ต้องเลือกเจ้าของงาน ไม่โหลดทั้งหมดโดยอัตโนมัติ
6. **ทดสอบสองความหมาย:** test-design คือออกแบบสิ่งที่ QA ต้องตรวจ ส่วน testing-fundamentals คือ implementation ของ automated tests; เป็น complement ไม่ใช่ replacement
7. **Tool output ไม่ใช่ proof ทุกกรณี:** preview, static skill audit, prototype และคำบอกของ model ไม่แทน provider receipt ที่ผูกกับ revision/workspace
8. **Scripts ที่ติดตั้ง ≠ dependency พร้อม:** Python/Node/browser/model CLI/network อาจขาด ต้องแยก unavailable จาก fail/pass

คำแนะนำ: จำเส้นทางหลักสั้น ๆ, ให้ coordinator เลือกขั้น deterministic, ให้ skill router เลือก skill ตามงาน และเปิด diagnostic/authority surface เมื่อ action เรียกจริงเท่านั้น ยังไม่เสนอรื้อหรือเปลี่ยน public contract

## 8. ขอบเขตที่ไม่ได้พิสูจน์

- นี่เป็น source inventory ไม่ได้เปิด consumer lab หรือทดสอบทุก host/ทุก script สด
- ไม่ทราบชุด MCP, browser, LSP และ plugin ส่วนตัวของ consumer แต่ละราย จึงไม่มีรายการ universal ว่า agent ทุกคนมีอะไรครบ
- ไม่ตรวจย้อนหลังว่าเหตุใดแต่ละ primitive ถูกสร้าง จึงไม่อ้างว่าความซับซ้อนทั้งหมดเป็นของเกินจำเป็น
- สถานะ source อาจเปลี่ยนจาก session อื่น ต้องใช้ digest/ความสดใน record เมื่อส่งต่อ
- งานลบ worktree เก่าที่ผู้ใช้อนุญาตเป็นงาน cleanup แยก ไม่ทำปนกับ investigation ที่กำหนดให้อ่านอย่างเดียว
