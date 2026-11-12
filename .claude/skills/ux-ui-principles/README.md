# ux-ui-principles

สกิลที่เปลี่ยนโจทย์ UX/UI เป็นการตัดสินใจที่มีเหตุผลและตรวจได้: ออกแบบหน้า, เลือก component,
วาง state, รีวิว, และตรวจหน้าที่ render แล้ว ทั้งหน้า public และหลังบ้านระดับ enterprise

## ใช้ได้ครบในตัว

สกิลนี้ใช้เดี่ยว ๆ ได้ ไม่ต้องติดตั้งสกิลอื่น ค่าที่หลายไฟล์ใช้ร่วมกันมีที่อยู่เดียว: focus ring →
`references/component-states.md` "Focus"; ชื่อ role ของสี → `references/color-palette.md` "Roles before hues"
ถ้าโปรเจกต์มี design system หรือ DESIGN.md อยู่แล้ว ให้ใช้ของโปรเจกต์ก่อน

## วิธีทำงาน

`SKILL.md` เป็น **router อย่างเดียว**: ตารางบอกว่าคำขอแบบไหนต้องเปิดไฟล์ไหน (ตัวหนา = ต้องเปิดก่อนตอบ)
แล้วเลือกโหมด (ANSWER … REFINE) และเดินตาม phase 0–8 ใน `references/design-workflow.md`
กฎ ค่า และ checklist ทั้งหมดอยู่ใน `references/`; สคริปต์ใน `scripts/` เป็นตัวตรวจที่รันได้จริง
และ `check.py` เป็นทางเข้าเดียวของการตรวจ

## เรียกใช้

```text
/ux-ui-principles ตรวจ UX checkout นี้ จัดลำดับปัญหาและเสนอวิธีตรวจหลังแก้
/ux-ui-principles ออกแบบ flow สมัครสมาชิก ระบุ loading/error/recovery และ keyboard behavior
/ux-ui-principles research หลักการ navigation สำหรับ dashboard ที่ใช้ทุกวัน พร้อมข้อจำกัด
/ux-ui-principles discover ฟีเจอร์คืนเงินอัตโนมัติ: ปัญหา หลักฐาน role และ metric
/ux-ui-principles วาง IA และ permission flow ของระบบหลังบ้านชำระเงิน 3 role
/ux-ui-principles เขียน page spec ระดับ Critical สำหรับหน้าอนุมัติถอนเงิน
/ux-ui-principles design QA หน้านี้เทียบกับ spec และระบุสิ่งที่ยังไม่ได้ทดสอบ
```

## ดัชนีไฟล์: คืออะไร · มีไว้ทำไม · ใช้อย่างไร

ทุกไฟล์ในสกิลต้องมีแถวในตารางนี้ (`python3 evals/index_check.py` ตรวจทั้งสองทาง: ไฟล์ที่ไม่มีแถว
และแถวที่ไม่มีไฟล์ รวมถึงลิงก์ markdown ที่เสีย)

### references/ — กฎและค่า (เปิดตาม router)

| ไฟล์ | คืออะไร | มีไว้ทำไม | ใช้เมื่อไร / อย่างไร |
|---|---|---|---|
| `accessibility.md` | เกณฑ์ WCAG 2.2 + ข้อยกเว้น + แผนหาหลักฐาน | ค่าที่คนจำผิดบ่อย (24px vs 44px, 2.4.11 vs 2.4.13) | SKILL แถว Accessibility; phase 4, 7 |
| `advanced-components.md` | editable grid, drag, picker, rich text, tour | component ที่ library ทั่วไปไม่มี contract ให้ | แถว Which component; phase 4 |
| `ai-features.md` | UX ของ agent/chat/tool call/ผลลัพธ์ AI | สถานะและการควบคุมของคนที่เฉพาะกับ AI | แถว AI features |
| `app-screen-rules.md` | หลักจัดองค์ประกอบหน้าจอข้อมูล (dashboard/admin/CRM) + signature element | ทำให้ product UI ไม่ดูเป็น template | แถว Customer UI, States; phase 3–4 |
| `back-office.md` | ประเภทหน้า admin, permission treatment, worklist, impersonation, look ของหลังบ้าน | คำถาม 8 ข้อต่อหน้า admin และการเลือก look จากภาพ | แถว Admin; คู่กับ `assets/layouts/admin.md`, `check.py --admin` |
| `brownfield.md` | รับโปรดักต์เดิมที่ไม่มี DESIGN.md | ถอดกติกาจากโค้ดก่อนออกแบบเพิ่ม | โหมด ONBOARD; ใช้กับ `code_extract.py` |
| `build-recipes.md` | สูตรลงมือ build (surface, no-JS demo, placeholder) | กันโค้ดที่ render แล้วพัง/ดูไม่เสร็จ | ทุกงาน BUILD/IMPROVE |
| `collaboration.md` | presence, co-edit, conflict, version history | สถานะหลายผู้ใช้ที่หน้าเดี่ยวไม่มี | แถว Realtime |
| `color-palette.md` | role สี, contrast, dark theme, ตารางแปลชื่อ token | **เจ้าของ** ตารางแปลชื่อ role ↔ DESIGN.md ↔ CSS | แถว Colors; phase 4 |
| `component-states.md` | state ของ control, **focus ring (ค่าเดียวของ repo)**, feedback timing, 5 แบบของ empty, keyboard | เจ้าของค่า focus ring และตารางเวลารอ | แถว Which component, Accessibility; phase 4 |
| `components-usage.md` | เลือก component (modal/drawer/page, select/radio, toast/banner) | ตอบ 'ใช้ตัวไหน' พร้อมเหตุผล | แถว Which component |
| `content-design.md` | UX writing, error, empty copy | ถ้อยคำที่ทำให้ผู้ใช้กู้คืนได้ | แถว UX writing |
| `customer-ui.md` | หน้าฝั่งลูกค้า (account, checkout, booking) | ประเภทหน้าลูกค้าและความเสี่ยงของแต่ละแบบ | แถว Customer-facing |
| `data-visualization.md` | เลือกกราฟ, แสดงค่า, KPI governance, เพดานข้อมูล/จุดกราฟ | กราฟที่ตอบคำถามจริงและไม่โกหก | แถว Charts |
| `design-direction.md` | มิติ 8 ด้าน, page pattern, interview §9 | ลำดับการตัดสินใจก่อนเลือกหน้าตา | แถว Landing; ขั้น 1 ของ §3 |
| `design-memory.md` | phase 0, ลำดับความสำคัญเมื่อข้อมูลขัดกัน, DESIGN.md, การส่งต่อให้ skill อื่น | **เจ้าของ** precedence และตาราง fallback ของ skill อื่น | แถว DESIGN.md; ทุกงานที่แก้ของเดิม |
| `design-quality.md` | สิ่งที่ทำให้ดู 'AI-generated', แผนก่อนสร้าง, critique, craft §7 | ด่านกันหน้าตา template | แถว Landing, Review |
| `design-system-benchmarks.md` | ค่าที่พบจริงใน design system สาธารณะ 126 ระบบ | หลักฐานเชิงสถิติ (ไม่ใช่ค่าบ้าน) ของ token/radius/breakpoint | แถว Type/tokens; ค้นต่อด้วย `ds_lookup.py` |
| `design-workflow.md` | phase 0–8, จุดถาม, เกณฑ์ออก, **ดัชนี reference → phase** | แผนที่การทำงานทั้งหมด | เปิดเมื่อไม่แน่ใจว่าอยู่ phase ไหน |
| `direction-library.md` | แคตตาล็อก direction พร้อมภาพ preview | ให้ผู้ใช้เลือกจากภาพ ไม่ใช่จากคำคุณศัพท์ | interview Round B; `look.py` |
| `direction-recipes.md` | สูตร component และน้ำเสียงตัวอักษรตาม direction | แปลง direction เป็นค่าในหน้า | หลังเลือก direction; คู่ `direction_recipe.py` |
| `do-and-dont.md` | วิธีเขียนคู่ Do/Don't | ให้ตัวอย่างตรวจได้ ไม่ใช่ความเห็น | เมื่อเขียน guideline ให้ทีม |
| `email-design.md` | HTML email | ข้อจำกัดของ email client | แถว HTML email |
| `engagement.md` | gamification, streak, loyalty และขอบเขตจริยธรรม | กันเกิด dark pattern | แถว Engagement |
| `experience-architecture.md` | journey, IA, URL, permission model | โครงก่อนหน้าจอ | โหมด ARCHITECT |
| `forms.md` | field, validation, error summary, ข้อมูลไทย, multi-step | **เจ้าของ** เรื่องฟอร์มทั้งหมด (patterns ลิงก์มาที่นี่) | แถว Forms |
| `framework.md` | 6 ศาสตร์, ระดับ, rigor tier | นิยามคำว่า Light/Standard/Critical | phase 1 |
| `gate-tiers.md` | ชั้นกติกา Floor/Reflex/Finish | แยกกฎที่ห้ามพลาดออกจากงานขัดเกลา | phase 6; คำศัพท์ tier ทั้งหมดอธิบายใน design-workflow |
| `i18n-performance.md` | ภาษาไทย/สองภาษา, RTL, Core Web Vitals | layout ที่แปลภาษาได้และเร็ว | แถว Thai/bilingual |
| `iconography.md` | icon label, family, ขนาด, Lucide vs Simple Icons, กติกาโลโก้แบรนด์ | icon ที่ไม่มีชื่อ = ปุ่มที่ใช้ไม่ได้ | phase 4 |
| `interaction.md` | heuristic, mental model, Fitts, Hick | หลักพื้นฐานที่ใช้อธิบายเหตุผล | ANSWER/RESEARCH |
| `marketing-copy.md` | headline, CTA, proof | หน้า public ต้องมีข้อเสนอที่จริง | แถว Landing (Round A) |
| `measurement.md` | metric, experiment, design QA | วัดผลหลังปล่อย | โหมด DISCOVER, phase 8 |
| `mobile-native.md` | iOS/Android conventions | แอปมือถือไม่ใช่เว็บย่อส่วน | แถว phone app |
| `motion.md` | ระดับ motion, reduced motion | motion ที่มีเหตุผลและปิดได้ | แถว Animation; §3 ข้อ 5 |
| `navigation-grouping.md` | จัดกลุ่ม/ลำดับ/ชื่อเมนู | เมนูตามงานของ role | แถว Navigation |
| `notifications.md` | ช่องทางและโครงข้อความแจ้งเตือน | ส่งให้ถูกช่องทาง ไม่รบกวนเกิน | แถว phone app, email |
| `other-platforms.md` | kiosk, POS, TV, watch, voice | ข้อจำกัดของแต่ละอุปกรณ์ | แถว Kiosk |
| `patterns.md` | state ระดับหน้าจอ, async, dialog, destructive action | **เจ้าของ** state ของหน้า/flow (control state อยู่ component-states) | แถว States |
| `print-documents.md` | ใบเสร็จ/ใบกำกับภาษี/PDF | ข้อกำหนดเอกสารพิมพ์ | แถว Printable |
| `product-discovery.md` | ปัญหา, role, metric + guardrail | ก่อนตัดสินใจว่าจะสร้างอะไร | โหมด DISCOVER |
| `prototyping.md` | wireframe, prototype, hand-off | ระดับความละเอียดที่พอดีกับคำถาม | แถว Building UI |
| `render-verification.md` | ลำดับการตรวจ render, state ที่เปิดด้วย URL | ผลตรวจที่ระบุ Ran/Skipped ได้จริง | phase 7 |
| `research-methods.md` | interview, survey, persona, card sort | เลือกวิธีวิจัยให้ตรงคำถาม | แถว Discovery |
| `review-loop.md` | refinement verb, scorecard, hard gate, **§8 caps/calibration** | รีวิวที่เทียบกันได้ข้ามรอบ | แถว Review; phase 6 |
| `search-filter.md` | search, facet, ตาราง type → filter → cell, saved view | **เจ้าของ** search/filter | แถว Search |
| `shadcn-rules.md` | กติกา stack shadcn | ไม่ฝืน component ของ shadcn | เมื่อมี `components.json` |
| `sources.md` | ทะเบียนแหล่งอ้างอิง S01–S107 + evidence discipline | แยกมาตรฐาน/heuristic/ข้อเสนอโครงการ | ทุกคำตอบที่อ้างหลักฐาน |
| `tailwind.md` | กติกา Tailwind v4 | ใช้ token ไม่ใช่ค่าลอย | เมื่อ stack เป็น Tailwind |
| `tokens-export.md` | direction → CSS/Tailwind/shadcn token, multi-brand | แปลงการตัดสินใจเป็นโค้ด | แถว Switch look, Multi-brand |
| `trust-security-privacy.md` | confirmation, masking, audit trail | งาน Critical (เงิน/สิทธิ์/ลบ) | แถว Admin ที่มีเงินหรือสิทธิ์ |
| `validation.md` | usability test, severity, จัดลำดับปัญหา | จัดลำดับ finding อย่างมีหลักฐาน | AUDIT, phase 8 |
| `visual-assets.md` | เลือกภาพต่อ section | ภาพจริงแทน clip-art | แถว Landing; §3 ข้อ 4 |
| `visual-system.md` | A foundations · B composition (รวม tablet) · C ค่าวัดจริง | ค่าตัวเลขด้านภาพที่มีที่มา | แถว Type/spacing, Layout |

### scripts/ — ตัวตรวจและตัวสร้าง (ไม่ต้องมีอะไรนอกจาก Python 3 / Node; Playwright ถ้ามี)

| ไฟล์ | คืออะไร | มีไว้ทำไม | ใช้เมื่อไร / อย่างไร |
|---|---|---|---|
| `_pw.js` | ตัวช่วยหา Playwright/browser (ไม่ดาวน์โหลดเอง) | ให้ทุกสคริปต์ render ใช้วิธีหาเดียวกัน | ภายใน: ใช้โดย render/fold/flow/admin/preview scripts |
| `_args.js` | ตัวอ่าน argument กลางของสคริปต์ Node (`--help`, `error:` + exit 2, path ของ output/temp) | ทุกสคริปต์ Node ทำตาม [Script contract](#script-contract) เหมือนกัน | ภายใน: ใช้โดย render/fold/flow/admin/script/market/preview scripts |
| `_color.js` | สูตรสีกลางฝั่ง Node: อ่านสี, luminance, contrast (และโค้ดที่ฉีดเข้าหน้าเว็บ) | ให้สคริปต์ Node และตัวตรวจในหน้าเว็บคำนวณสีตรงกัน | ภายใน: ใช้โดย brand, compositions, render_check, admin_check |
| `_report.js` | ตัวสร้างผล `--json` กลางของตัวตรวจ Node (render/fold/admin/flow/script_check) | ทั้งห้าตัวพิมพ์ JSON รูปแบบเดียวกัน, exit code เดิม | ภายใน: ใช้ผ่าน `_args.js` |
| `_net.py` | ตัวช่วยดึงข้อมูลเน็ตกลาง (ใช้ curl, cache เขียนแบบ atomic) | ไม่มีเน็ต/curl = exit 3 (NOT RUN) เหมือนกันทุกสคริปต์ | ภายใน: ใช้โดย icons, photo_search, showcase_fetch, mobbin_fetch |
| `admin_check.js` | ตรวจหน้า admin ที่ render แล้วตามประเภทหน้า + เปิดทุก `?state=` | จับคอลัมน์เงินชิดซ้าย, ปุ่ม disabled ไม่มีเหตุผล, sticky ที่ไม่ sticky, state ที่ยังไม่ได้สร้าง | `check.py <page> --admin list` |
| `backoffice_preview.js` | render ภาพหน้าหลังบ้านทุก look (`--density compact`, `--thai`, `--mobile`) | ให้ทีมเลือก look จากภาพ | back-office.md 'Choosing density and tone' |
| `brand.js` | direction เดียว → หน้า public และ product UI ด้วย token ชุดเดียว | กันสองหน้าตาในแบรนด์เดียว | ใช้โดย preview scripts |
| `build_previews.js` | สร้างภาพ preview ใหม่ทั้งหมด (`--only` ชุดเดียว; `--dry-run` พิมพ์คำสั่งโดยไม่ render) | ภาพไม่ถูก commit (gitignore) | ครั้งแรกหลังติดตั้ง |
| `check.py` | **ทางเข้าเดียว** ของการตรวจก่อนส่งงาน | ไม่ต้องจำ 7 สคริปต์ | SKILL §3 ข้อ 6 |
| `code_extract.py` | ถอดภาษาออกแบบจากโค้ดเดิม | หลักฐานสำหรับ DESIGN.md ของ brownfield | brownfield.md |
| `compositions.js` | layout หน้าแรกสำเร็จรูป | จุดเริ่มที่ไม่ใช่ hero ซ้ำ ๆ | §3 ข้อ 2 |
| `contrast.py` | คำนวณ contrast จาก token (oklch ได้) | ตรวจคู่สีแทนการเดา | ผ่าน `check.py` |
| `design_md.py` | เขียนและผูก DESIGN.md | บันทึกการตัดสินใจเดียวของโปรเจกต์ | หลัง interview, `--backoffice <look>` |
| `design_md_check.py` | ตรวจ DESIGN.md | กัน DESIGN.md ที่ขาดหรือขัดกัน | phase 0 |
| `direction_preview.js` | ภาพ preview ของ direction | ภาพสำหรับ interview | build_previews.js |
| `direction_recipe.py` | token/ข้อห้าม/component ที่ต้องมีของ direction | แปลง direction เป็นกติกา | §3 ข้อ 2 |
| `ds_lookup.py` | ค้นคู่มือ 126 design system | หาตัวอย่างจริงก่อนตั้งค่า | design-system-benchmarks.md |
| `_composition.js` | ตัวตรวจที่รันในหน้าเว็บให้ render_check (contrast, ขนาดตัวอักษร, การจัดวาง) | แยกโค้ดฝั่ง browser ออกจาก render_check.js | ใช้โดย render_check.js |
| `_color.py` | สูตรสีกลาง: อ่าน hex, luminance, contrast, เลือกสีตัวอักษร | ให้สคริปต์ Python คำนวณสีตรงกัน | ใช้โดย export_tokens, design_md, design_md_check, tweaks_panel |
| `export_tokens.py` | direction → token ในโค้ด (`--out DIR`; ไม่ใส่ = พิมพ์ออก stdout ไม่เขียนไฟล์; `--print-dark`) | ส่งต่อให้โค้ดโดยไม่พิมพ์มือ | tokens-export.md |
| `flow_check.js` | เดิน journey จาก steps.json รวม failure path | ตรวจว่างานหลักทำได้จริง | §3 ข้อ 6 |
| `fold_check.js` | primary action อยู่เหนือ fold | หน้า public ที่ไม่มี CTA ในจอแรก | ผ่าน `check.py --render` |
| `look.py` | รายการภาพจากคลัง template ตามประเภทหน้าหรือ tag (รวม `cover`; tag แอปเช่น crm, finance, ai-chat, auth; คำไทยเช่น คาเฟ่, หลังบ้าน, สไลด์, การเงิน ใช้ได้; `--kinds` ดูทั้งหมด) + market study ถ้ามี | ดูของจริงก่อนสร้าง | §3 ข้อ 2 |
| `_library.py` | อ่านทุกชุดในคลัง template เป็น row รูปแบบเดียว (kind, tags, template/study, take, origin, local) | เพิ่มชุดใหม่ที่เดียว ไม่ต้องแก้ที่อื่น | ภายใน: ใช้โดย `look.py` |
| `market_fetch.js` | แคปเว็บคู่แข่งในตลาด + เว็บที่ออกแบบดี ตามประเภทธุรกิจ | research ตลาดก่อนเลือก direction | interview Round B |
| `icons.py` | ค้น/วาง icon จาก Lucide (UI) และ Simple Icons (โลโก้แบรนด์) พร้อมเช็ก contrast และลิขสิทธิ์ | ได้ icon ชุดเดียว ใช้โลโก้แบรนด์ถูกกติกา | iconography.md |
| `photo_search.py` | ค้นรูปไลเซนส์เปิด (Commons/Openverse) พร้อม credit | ได้รูปจริงโดยไม่ละเมิดลิขสิทธิ์ | ก่อนสร้างหน้า |
| `placeholders.py` | หา placeholder ที่เหลือ | ห้ามส่งของปลอมเป็นของจริง | §3 ข้อ 6 |
| `halftone.py` | ทำรูปฮาล์ฟโทนหมึกเดียวจริงจากรูปถ่าย | สไตล์งานพิมพ์ต้องดูพิมพ์จริง ไม่ใช่ลายจุดโปะทับ | §3 ข้อ 4, visual-assets §2b |
| `render_check.js` | render หลายขนาด light/dark, overflow, JS error, ชื่อปุ่ม | smoke check ทั่วไปของทุกหน้า | ผ่าน `check.py --render` |
| `review_report.py` | finding → รายงาน HTML | รีวิวที่ส่งต่อได้ | review-loop.md 'Report format' |
| `script_check.js` | syntax ของ script และ global ที่ชน window | บั๊กที่ทำให้หน้าเปล่า | ผ่าน `check.py` |
| `showcase_fetch.py`, `mobbin_fetch.py` | ดึงภาพของคลัง template ชุด local มาเก็บในเครื่อง | ภาพมีลิขสิทธิ์ ไม่ commit | ครั้งแรกถ้าต้องการ (ดู `assets/LIBRARY.md`) |
| `slop_check.py` | สแกนหน้าตา template แบบ static | จับ device ที่ทำให้ดูเป็น AI | ผ่าน `check.py` |
| `state_check.py` | หา marker ของ state แบบ static | รู้ว่า state ไหนยังไม่ได้ทำ | ผ่าน `check.py` |
| `tweaks_panel.py` | แผงปรับค่าสดระหว่างรีวิว | ปรับกับผู้ใช้แบบเห็นผลทันที | review session |

### Script contract

ทุกสคริปต์ใช้ exit code ชุดเดียวกัน: **0** ผ่าน · **1** ตรวจไม่ผ่าน · **2** ใช้ผิด/input ผิด (ไม่พบไฟล์, flag ผิด,
JSON เสีย, id ไม่รู้จัก) · **3** ไม่ได้รัน (ไม่มี browser/เน็ต/dependency) — ห้ามรายงาน 3 ว่าผ่าน
คำผลลัพธ์: PASS, FLAG, FAIL, NOTE, WARN, ERROR, N/A, NOT RUN (`check.py` มี MANUAL เพิ่ม)
ตัวตรวจ Python ทุกตัว (และ `check.py`) มี `--json`; ใช้ผิดจะพิมพ์บรรทัด `error:` ไม่มี traceback
ตัวตรวจ Node (`render_check`, `fold_check`, `admin_check`, `flow_check`, `script_check`) มี `--json` ด้วย: stdout มี JSON
เอกสารเดียว (log ไป stderr), exit code เดิม, ใช้ผิด / NOT RUN / ERROR ก็ได้ JSON — รูปแบบ
`{script, target, result, exit, error?, findings: [{level, rule, message, where, details?}], artifacts, …สรุปของแต่ละสคริปต์}`
`check.py` เอาผลแต่ละข้อจาก exit code ของสคริปต์ย่อย และ exit 3 เมื่อไม่มีอะไรตกแต่มีข้อที่ไม่ได้รัน

### assets/ และ evals/

| ไฟล์ | คืออะไร | มีไว้ทำไม | ใช้เมื่อไร / อย่างไร |
|---|---|---|---|
| `assets/design-context.md` | การ์ด context ของโปรเจกต์ | ส่งบริบทเดียวกันข้ามทุก phase  | phase 1 |
| `assets/page-spec.md` | page spec 16 แถว | ข้อกำหนดหน้าที่ทดสอบได้ | DESIGN mode |
| `assets/templates.md` | รูปแบบผลลัพธ์ (decision, audit, research, validation plan) + ตารางเลือก template ตามโหมด/tier และแผนที่ format อื่น | ผลลัพธ์รูปแบบเดียวกันทุกครั้ง | RESEARCH, DESIGN, ARCHITECT, BUILD, IMPROVE, AUDIT (ไม่ใช้กับ ANSWER/REFINE) |
| `assets/evidence.md` | ค่าวัดจาก site/gallery จริง | ที่มาของตัวเลขใน visual-system Part C | อ้างอิง |
| `assets/layouts/` | blueprint หน้า 44 แบบ (A01–A08, D01–D06 …) + worked examples ภาษาไทย | โครงหน้าที่มี state และ acceptance | `layouts/index.md` ก่อน แล้วเปิดหมวดเดียว |
| `assets/backoffice/styles.json` | 17 look ของหลังบ้าน: สี, 5 status tone, density ปกติ + compact, รูปทรง | **template UI หลังบ้าน**: ค่าเดียวที่ preview และ `design_md.py --backoffice` ใช้ | back-office.md |
| `assets/directions/` | direction ของหน้า public (`directions.json`, content packs) | หน้าตาที่ไม่ซ้ำแบบ default | direction-library.md |
| `assets/design-systems/` | คู่มือ 126 design system (Apache-2.0, S102) | ข้อมูลดิบของ benchmarks | `ds_lookup.py` |
| `assets/LIBRARY.md` (references, showcase, mobbin), `assets/photos/`, `assets/market/` | คลัง template ชุดเดียว (อ่านเป็น row รูปแบบเดียวผ่าน `_library.py`), ภาพพร้อม credit, market study ต่อประเภทธุรกิจ | ภาพตัวอย่าง/อ้างอิงที่มีที่มา | `look.py` |
| `evals/` | สถานการณ์ทดสอบ routing/trigger/A-B + `index_check.py` + regression suite ของสคริปต์ (`evals/regress/run.py [checkers\|design\|node\|preview\|py_checkers\|py_tools]`, เขียนแค่ temp folder) | วัดว่า skill เปิดไฟล์ถูก, README ไม่ตกหล่น และสคริปต์ยังทำตาม contract | ก่อน release และหลังแก้สคริปต์ |

## หลักสำคัญที่แปลงเป็นกติกาใน skill

1. เริ่มจากผู้ใช้ งานที่ต้องสำเร็จ และผลเสียหากผิดพลาด ไม่เริ่มจากเลือกสีหรือ style
2. ระบุสิ่งที่สังเกตจริง สมมติฐาน และสิ่งที่ยังไม่ได้ทดสอบแยกกัน
3. เชื่อมปัญหา → ผลต่องาน → หลักการ → behavior ที่เสนอ → วิธีตรวจ
4. ตรวจ failure/recovery และสถานะที่เกี่ยวข้อง ไม่ประเมินเฉพาะหน้าจอปกติ
5. แยกมาตรฐานที่มีข้อกำหนดออกจาก heuristic และข้อเสนอของโครงการ
6. ใช้ข้อจำกัดของงานวิจัยประกอบ ไม่ตั้งกฎว่าเมนูต้องมี 7 รายการหรือไม่เกิน 3 clicks
7. ไม่อ้างว่าภาพหน้าจอรับรอง WCAG ได้ หรือเปลี่ยน UI แล้ว conversion จะเพิ่มเท่าไร

## ตัวอย่างความแตกต่างที่ต้องรักษา

- WCAG 2.5.8 AA ใช้ 24×24 **CSS px** หรือเข้าเงื่อนไขยกเว้น ไม่ใช่บังคับ 44px ทุกกรณี
- 2.4.11 AA ตรวจว่าตำแหน่ง focus ไม่ถูกเนื้อหาที่ผู้พัฒนาสร้างบังทั้งหมด;
  2.4.13 AAA เป็นเกณฑ์ด้าน appearance ของ indicator
- ค่า text-spacing สำหรับ WCAG เป็นเงื่อนไขทดสอบเมื่อผู้ใช้ปรับ ไม่ใช่ default ที่ต้องใช้เสมอ
- Card sorting ช่วยค้น mental model; tree testing ตรวจ hierarchy; ต้องตรวจ UI จริงเพิ่มเติม
- ผู้ใช้กลุ่มเล็กช่วยค้นปัญหา แต่ไม่ใช่ตัวแทนเชิงสถิติของประชากรทั้งหมด

รายละเอียด แหล่งอ้างอิง และข้อยกเว้นอยู่ในเอกสารแต่ละหัวข้อ
เอกสารนี้เป็น snapshot ของการวิจัย ควรตรวจต้นฉบับอีกครั้งเมื่ออ้างเกณฑ์ปัจจุบัน

## แหล่งตัวอย่างจาก OpenDesign

ค้นคว้าวันที่ 9 ตุลาคม 2026 ทั้ง `opendesign.cc` และ `open-design.ai`
เพิ่ม 24 รายการอ้างอิงที่เชื่อมกับ layout IDs ใน skill: 16 site references และ
8 templates เช่น dashboard, pricing, finance report, kanban และ annotated wireframe
ในจำนวนนี้อ่านรายละเอียดได้ 19 รายการ อีก 5 รายการมีเฉพาะ catalog metadata

เก็บลิงก์ต้นทาง วันที่ตรวจ ข้อจำกัด และ attribution ไว้ทั้ง Markdown และ
[JSON catalog](assets/layouts/opendesign-catalog.json) เพื่อให้ agent เลือกเฉพาะรายการที่เกี่ยวข้อง
ยังไม่ได้ตรวจภาพ/การทำงานของเว็บไซต์ต้นฉบับหรือ import template code และ assets
ตัวเลขรายการทั้งหมดของแหล่งภายนอกเป็น snapshot ไม่ใช่จำนวน template ที่ผ่านการทดสอบ

```text
/ux-ui-principles หา reference จาก OpenDesign สำหรับ SaaS landing แล้วจับคู่กับ layout ใน skill
/ux-ui-principles ใช้ ODA05 เป็น reference ของ kanban พร้อมระบุสิ่งที่ต้องตรวจเพิ่ม
```

ประวัติการเปลี่ยนแปลงแต่ละเวอร์ชัน: [CHANGELOG](../../CHANGELOG.md)
