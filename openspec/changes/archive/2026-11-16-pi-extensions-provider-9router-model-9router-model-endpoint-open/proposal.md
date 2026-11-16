# Change: pi-extensions มี provider 9router ที่ดึงรายชื่อ model จาก 9router เองและใช้คุยกับ model ผ่าน endpoint แบบ OpenAI ได้

- **Change:** `pi-extensions-provider-9router-model-9router-model-endpoint-open` · **Lane:** standard (carries design content)
- **Review:** low tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

ผู้ใช้มี 9router รันอยู่บนเครื่องอื่นและอยากเลือก model ทุกตัวของ 9router จาก /model ใน Pi ได้โดยไม่ต้องเขียนรายชื่อ model เองใน models.json ซึ่งต้องแก้ตามทุกครั้งที่บัญชีหรือ combo ใน 9router เปลี่ยน

## ขอบเขต

- **In scope (`maintainer-pi-extensions`):** เพิ่ม extension nine-router ที่ลงทะเบียน provider ชื่อ 9router แบบ openai-completions; ดึงรายชื่อ model จาก GET {baseUrl}/models ของ 9router แล้วแปลง context_length, max_completion_tokens, capabilities และ thinking_levels เป็น metadata ของ Pi; อ่าน baseUrl จาก env NINEROUTER_BASE_URL หรือ nineRouter.baseUrl ในไฟล์ config ของแพ็กเกจ และอ่าน API key จาก NINEROUTER_API_KEY หรือ key ที่เก็บด้วย /login; เพิ่ม nine-router ใน package.json, tsconfig, install.sh, test.sh, pack-check, docs และ CHANGELOG 0.2.0
- **Out of scope:** edits outside `pi-extensions/nine-router/**`, `pi-extensions/package.json`, `pi-extensions/package-lock.json`, `pi-extensions/tsconfig.json`, `pi-extensions/install.sh`, `pi-extensions/test.sh`, … +6 more; the authored Non-goals below

## Non-goals

- ไม่ทำคำสั่ง /9router สำหรับดูสถานะ provider หรือโควตา
- ไม่เก็บรายชื่อ model ไว้ใช้ตอน 9router ติดต่อไม่ได้ (ไม่ persist catalog)
- ไม่รองรับ model ชนิด image, tts, embedding หรือ web search ของ 9router มีแค่ chat model จาก /v1/models
- ไม่ติดตั้งหรือตั้งค่า 9router เอง และไม่เก็บ API key ไว้ในไฟล์ของ repo
- ไม่ publish ขึ้น npm และไม่ commit

## ผลกระทบและความเสี่ยง

- **Impact:** low
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| provider-registration | ใช้ URL จาก env | success | T001 | test | — |
|  | ใช้ URL จากไฟล์ config | success | T001 |  |  |
|  | ไม่มีการตั้งค่าเลย | boundary | T001 |  |  |
|  | ค่าใน config ไม่ใช่ URL | failure | T001 |  |  |
| model-discovery | ดึงรายชื่อสำเร็จ | success | T001 | test | — |
|  | ไม่อนุญาต network | boundary | T001 |  |  |
|  | ยกเลิกระหว่างดึง | boundary | T001 |  |  |
|  | key ผิด | failure | T001 |  |  |
|  | router ติดต่อไม่ได้หรือตอบผิดรูปแบบ | failure | T001 |  |  |
| chat-through-router | คุยผ่าน server จำลอง | success | T003 | test: `pi-extensions/nine-router/test/**` | — |
| package-wiring | ตรวจแพ็กเกจครบ | success | T002 | test: `pi-extensions/scripts/pack-check.test.cjs` | — |
|  | install dry-run | success | T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (12).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (low tier, fast model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (3); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for provider-registration, model-discovery, chat-through-router, package-wiring.

## Appendix: Amendment history

- Revision 1 (2026-11-16): Build พบว่า Pi ดึงรายชื่อ model ผ่าน network เฉพาะตอนเปิดแบบ interactive, ตอนเปิด /model, หลัง /login และ pi update --models ส่วน pi -p และ RPC ใช้รายชื่อที่บันทึกไว้เท่านั้น (docs/providers.md แบบเดียวกับ OpenRouter) ถ้าไม่บันทึกรายชื่อ model ของ 9router จะใช้ใน pi -p ไม่ได้เลย จึงต้องบันทึกรายชื่อล่าสุดและคืนรายชื่อนั้นเมื่อไม่อนุญาต network แทนการคืนรายการว่าง ซึ่งแทน non-goal เดิมเรื่องไม่ persist catalog

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | F1-readme-key-precedence: The README says the API key comes from `NINEROUTER_API_KEY`, else a key saved with `/login 9router`. The code does the opposite. `resolveKey` (models.ts:84-89) uses a stored `/login` api_key first and only then the env key, and its own doc comment says so. If a user sets both, discovery sends the /login key, while the README says the env key wins. Fix the README row so it matches the code (or the code so it matches the README), and say which key the chat request uses. (root/pi-extensions/nine-router/README.md:13) | minor | แก้แล้วในรอบ 2 | claude-opus |
| 1 | F2-unused-fetch-option: `FetchModelsOptions.fetch` (an injectable fetch implementation) is an option nothing uses: the tests use a real HTTP server and index.ts never passes it. The agreement does not ask for it. Consider removing it. Likewise, the `capabilities.contextWindow`/`capabilities.maxOutput` fallbacks in toModelConfig (lines 40-41) go beyond the spec's `context_length`/`max_completion_tokens` mapping. (root/pi-extensions/nine-router/models.ts:95) | minor | แก้แล้วในรอบ 2 | claude-opus |
