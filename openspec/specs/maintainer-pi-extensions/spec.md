# maintainer-pi-extensions Specification

## Purpose
Move the maintainer's own Pi extensions (agent-team, ask-user, background-bash) into a repository-only pi-extensions/ folder with a test runner and an installer that copies them into the Pi agent directory, so they are developed in one place and installed from it.
## Requirements
### Requirement: extensions-in-repo

The repository SHALL contain the agent-team, ask-user, background-bash, nine-router, session-title, team-webui and claude-accounts Pi extensions under pi-extensions/ as sibling folders, without generated reports or machine-specific absolute paths.

#### Scenario: Extensions are present without personal paths

- **WHEN** a maintainer lists pi-extensions/ and searches it for /Users/
- **THEN** each of agent-team, ask-user, background-bash, nine-router, session-title, team-webui and claude-accounts has an index.ts, and no file contains a /Users/ path

#### Scenario: Generated reports stay out

- **WHEN** a maintainer lists pi-extensions/team-webui
- **THEN** there is no reports/, node_modules/ or __pycache__/ folder

### Requirement: not-shipped

pi-extensions/ SHALL be repository-only: install.sh, install-pi.sh and the Homebrew formula SHALL NOT reference or copy it, and CLAUDE.md SHALL list it as a repository-only development surface.

#### Scenario: Shipping surfaces ignore the folder

- **WHEN** install.sh, install-pi.sh and Formula/claude-foundation.rb are searched for pi-extensions
- **THEN** none matches, and CLAUDE.md names pi-extensions/ under repository-only development surfaces

### Requirement: installer

pi-extensions/install.sh SHALL copy each extension into <agent dir>/extensions/<name> (agent dir from PI_CODING_AGENT_DIR, default ~/.pi/agent), SHALL move a differing existing copy into a timestamped backup folder first, SHALL skip identical copies, and with --dry-run SHALL change nothing.

#### Scenario: Fresh install

- **WHEN** install.sh runs with PI_CODING_AGENT_DIR set to an empty temporary directory
- **THEN** extensions/agent-team, extensions/ask-user and extensions/background-bash match the repository copies

#### Scenario: Replaced copy is backed up

- **WHEN** an installed extension differs from the repository and install.sh runs
- **THEN** the previous copy is preserved under extension-backups/<timestamp>/<name> and the installed copy matches the repository

#### Scenario: Dry run changes nothing

- **WHEN** install.sh --dry-run runs against an empty agent directory
- **THEN** no extensions directory is created

### Requirement: test-runner

pi-extensions/test.sh SHALL run the extensions' Node tests and SHALL run the real-terminal smokes only when passed --tui; pi-extensions/README.md SHALL document test, dry-run and install.

#### Scenario: Runner and docs exist

- **WHEN** a maintainer reads pi-extensions/README.md and runs pi-extensions/test.sh
- **THEN** the README documents test.sh, install.sh --dry-run and install.sh, and test.sh is valid shell that runs the smokes only with --tui

### Requirement: team-propagates-parent

agent-team SHALL start every managed worker with FOUNDATION_PARENT_SESSION_ID set to the value it inherited, or otherwise to the spawning Pi session's id.

#### Scenario: Nested workers keep the root session

- **WHEN** a main session spawns a worker and that worker spawns another
- **THEN** both workers receive the main session's id as FOUNDATION_PARENT_SESSION_ID

### Requirement: team-changeloop-task

agent_spawn SHALL accept changeLoopTask {change, task}; agent-team SHALL validate both identifiers, start the worker in the change's recorded workspace with a brief that runs the task packet command first and implements only that task without editing the task ledger or leases, and SHALL refuse a change without a recorded workspace.

#### Scenario: Leased task brief

- **WHEN** a brief is built for change c1 task T002 whose runtime state records a workspace
- **THEN** the worker cwd is that workspace and the brief names 'claude-foundation packet c1 --task T002' and forbids editing tasks.md and leases

#### Scenario: Unknown change is refused

- **WHEN** a brief is requested for a change with no runtime workspace or an invalid id
- **THEN** an error is returned and no worker starts

### Requirement: team-roles

agent_spawn SHALL accept role explorer, executor, reviewer or verifier, mapping each to a Change Loop model tier, read-only tool limits and a structured report prompt.

- Tiers: explorer fast, executor standard, reviewer deep, verifier standard.
- explorer, reviewer and verifier exclude the write and edit tools.
- The role prompt ends the report with SUMMARY, CHANGES, CHECKS and BLOCKERS.
- A tier resolves to a configured model, else an available model of the tier family from foundation.json (haiku, sonnet, opus by default) on the current provider, else the current model.

#### Scenario: Reviewer is read-only and deep

- **WHEN** the reviewer role is resolved in a project whose deep tier family is opus and an opus model is available
- **THEN** the model is that opus model, write and edit are excluded, and the prompt asks for SUMMARY, CHANGES, CHECKS and BLOCKERS

#### Scenario: Unknown role is refused

- **WHEN** agent_spawn is called with role 'admin'
- **THEN** an error names the supported roles

### Requirement: team-limits

agent-team SHALL refuse a spawn when active managed workers reach maxActiveWorkers from its config.json (default 64), and, when the worker cwd is inside a Change Loop project and active managed workers in that project reach execution.maxParallelAgents from foundation.json, SHALL start the worker and warn.

#### Scenario: Project cap

- **WHEN** a project with maxParallelAgents 3 already has 3 active managed workers and another spawn targets it
- **THEN** the worker starts and the spawn result warns with a message naming maxParallelAgents

### Requirement: newest-version

agent-team SHALL resolve a tier family to the available model with the highest numeric version on the current provider.

- The version is the dash-separated numbers after the family name, compared number by number, so 5-5 is newer than 5 and 4-8.
- A trailing 8-digit date is a snapshot of that version and only breaks ties, newest date first, after an undated id of the same version.
- Ids whose remainder is not a version (for example -latest) are used only when no versioned id exists.

#### Scenario: Snapshot date does not outrank a newer version

- **WHEN** claude-opus-4-6 and claude-opus-4-20250514 are available
- **THEN** claude-opus-4-6 is chosen

#### Scenario: Newest version wins over aliases and snapshots

- **WHEN** claude-opus-5-5, claude-opus-5-5-20261001, claude-opus-5, claude-opus-4-8 and claude-opus-latest are available
- **THEN** claude-opus-5-5 is chosen

#### Scenario: Alias only as a last resort

- **WHEN** only claude-opus-latest matches the family
- **THEN** claude-opus-latest is chosen

### Requirement: package-manifest

pi-extensions/package.json SHALL ประกาศแพ็กเกจ Pi ที่ถูกต้อง

- keywords มี pi-package และ pi.extensions ชี้ไปที่ index.ts ของ agent-team, ask-user และ background-bash ซึ่งมีอยู่จริง
- @earendil-works/pi-ai, @earendil-works/pi-coding-agent, @earendil-works/pi-tui และ typebox อยู่ใน peerDependencies ด้วยช่วง * และไม่อยู่ใน dependencies
- มี name, version แบบ semver, license, repository และ engines.node

#### Scenario: Manifest ถูกต้อง

- **WHEN** รัน node pi-extensions/scripts/pack-check.mjs
- **THEN** สคริปต์ผ่านและรายงาน extension ทั้งสามจาก pi.extensions

#### Scenario: แพ็กเกจของ host อยู่ใน dependencies

- **GIVEN** package.json ชุดทดสอบใส่ @earendil-works/pi-tui ไว้ใน dependencies
- **WHEN** รันการตรวจ manifest กับ package.json นั้น
- **THEN** การตรวจล้มและระบุชื่อแพ็กเกจที่ต้องย้ายไป peerDependencies

#### Scenario: ไฟล์ใน pi.extensions หายไป

- **GIVEN** pi.extensions ชี้ไปที่ไฟล์ที่ไม่มีอยู่
- **WHEN** รันการตรวจ manifest
- **THEN** การตรวจล้มและระบุ path ที่หาไม่พบ

### Requirement: pack-contents

tarball จาก npm pack SHALL มีเฉพาะไฟล์ runtime และเอกสารของแพ็กเกจ

- ต้องมี index.ts ของทั้งสาม extension, LICENSE, CHANGELOG.md, README.md และ docs/tools.md
- ต้องไม่มีไฟล์ *.test.cjs, test.cjs, โฟลเดอร์ test/, node_modules หรือ path /Users/

#### Scenario: เนื้อหา tarball ถูกต้อง

- **WHEN** pack-check.mjs รัน npm pack --dry-run --json
- **THEN** ไฟล์ที่ต้องมีครบและไม่มีไฟล์ต้องห้าม

#### Scenario: มีไฟล์เทสต์หลุดเข้า tarball

- **GIVEN** รายการไฟล์ tarball มี ask-user/store.test.cjs
- **WHEN** ตรวจรายการไฟล์
- **THEN** การตรวจล้มและแสดงชื่อไฟล์นั้น

### Requirement: changelog-version

CHANGELOG.md SHALL มีหัวข้อของ version ปัจจุบันใน package.json

#### Scenario: version ตรงกัน

- **GIVEN** package.json version 0.1.0
- **WHEN** รันการตรวจ changelog
- **THEN** พบหัวข้อ ## [0.1.0] และการตรวจผ่าน

#### Scenario: ลืมเพิ่มหัวข้อ version ใหม่

- **GIVEN** package.json version 0.2.0 แต่ CHANGELOG มีแค่ ## [0.1.0]
- **WHEN** รันการตรวจ changelog
- **THEN** การตรวจล้มและบอกให้เพิ่มหัวข้อ ## [0.2.0]

### Requirement: typecheck

npm run typecheck ใน pi-extensions SHALL ผ่าน tsc --noEmit กับโค้ด .ts ของทุก extension ใน pi.extensions

#### Scenario: โค้ดปัจจุบันผ่าน typecheck

- **WHEN** รัน npm --prefix pi-extensions run typecheck
- **THEN** tsc จบด้วยรหัส 0

#### Scenario: เรียก API ที่ไม่มีอยู่

- **GIVEN** ไฟล์ชั่วคราวเรียก pi.registerToolz ซึ่งไม่มีใน ExtensionAPI
- **WHEN** รัน tsc กับไฟล์นั้น
- **THEN** tsc รายงาน error

#### Scenario: ทุก extension อยู่ในขอบเขต typecheck

- **WHEN** เทียบ include ของ tsconfig.json กับ pi.extensions
- **THEN** ทุกโฟลเดอร์ใน pi.extensions อยู่ใน include

### Requirement: tool-docs

pi-extensions/docs/tools.md SHALL สร้างจาก tool, command และ shortcut ที่ extension ลงทะเบียนจริงผ่าน loader ของ Pi

- แต่ละ tool แสดงชื่อ, คำอธิบาย และ parameter schema
- tool-docs.mjs --check ล้มเมื่อไฟล์ไม่ตรงกับที่สร้างได้

#### Scenario: เอกสารตรงกับโค้ด

- **WHEN** รัน node pi-extensions/scripts/tool-docs.mjs --check
- **THEN** การตรวจผ่านและเอกสารมี ask_user, agent_spawn และ background_bash

#### Scenario: เอกสารล้าสมัย

- **GIVEN** docs/tools.md ถูกแก้ด้วยมือให้ต่างจากที่สร้าง
- **WHEN** รัน --check
- **THEN** การตรวจล้มและบอกให้รัน npm run docs

### Requirement: ask-user-config

ask-user SHALL อ่านค่า askUser.bell จากไฟล์ config ของแพ็กเกจ

- ไฟล์คือ $XDG_CONFIG_HOME/pi-extensions/config.json หรือ ~/.config/pi-extensions/config.json เมื่อไม่ได้ตั้ง XDG_CONFIG_HOME
- askUser.bell false ปิดเสียง BEL และ PI_ASK_USER_BELL=0 ยังปิดได้เสมอ
- ไฟล์ที่ไม่มีหรือ JSON เสียใช้ค่าเริ่มต้น (bell เปิด) และไม่ทำให้ extension ล้ม
- extension อ่านไฟล์อย่างเดียว ไม่เขียน

#### Scenario: ปิด bell จาก config

- **GIVEN** config.json มี {"askUser":{"bell":false}}
- **WHEN** โหลด config
- **THEN** ค่า bell เป็น false

#### Scenario: ไม่มีไฟล์ config

- **WHEN** โหลด config ใน XDG_CONFIG_HOME ว่าง
- **THEN** ค่า bell เป็น true

#### Scenario: JSON เสีย

- **GIVEN** config.json มีข้อความ {not json
- **WHEN** โหลด config
- **THEN** ได้ค่าเริ่มต้นพร้อมคำเตือน และไม่ throw

#### Scenario: ค่าผิดชนิด

- **GIVEN** config.json มี {"askUser":{"bell":"no"}}
- **WHEN** โหลด config
- **THEN** ค่า bell กลับเป็นค่าเริ่มต้น true

### Requirement: event-namespace

ask-user SHALL ใช้ชื่อ event บน pi.events ที่ขึ้นต้นด้วย pi-extensions:ask-user:

- ชื่อคือ pi-extensions:ask-user:prompt, :resolved, :answer และ :answer-result
- ไม่ส่งหรือรับ event ชื่อเดิม ask-user:*

#### Scenario: bridge ภายนอกตอบผ่านชื่อใหม่

- **WHEN** ส่ง pi-extensions:ask-user:answer ที่ถูกต้อง
- **THEN** ได้ pi-extensions:ask-user:answer-result ok true และ :resolved

#### Scenario: ชื่อเดิมไม่มีผล

- **WHEN** ส่ง ask-user:answer
- **THEN** ไม่มีการบันทึกคำตอบและคำถามยังรออยู่

### Requirement: provider-registration

extension nine-router SHALL ลงทะเบียน provider 9router แบบ openai-completions ด้วย baseUrl และ API key จากแหล่งที่กำหนด

- baseUrl มาจาก NINEROUTER_BASE_URL ก่อน แล้ว nineRouter.baseUrl ในไฟล์ config แล้วค่าเริ่มต้น http://localhost:20128/v1 และตัด / ท้ายออก
- เมื่อมี NINEROUTER_API_KEY ค่า apiKey คือ $NINEROUTER_API_KEY เมื่อไม่มีจะไม่ตั้ง apiKey
- ไฟล์ config ที่ไม่มี, JSON เสีย หรือค่าที่ไม่ใช่ URL http/https ใช้ค่าถัดไปและไม่ทำให้ extension ล้ม
- factory ไม่เรียก network และไม่เปิด resource ค้าง

#### Scenario: ใช้ URL จาก env

- **GIVEN** NINEROUTER_BASE_URL=https://router.example.com/v1/ และ NINEROUTER_API_KEY ถูกตั้ง
- **WHEN** โหลด extension ด้วย ExtensionAPI จำลอง
- **THEN** registerProvider ถูกเรียกด้วยชื่อ 9router, api openai-completions, baseUrl https://router.example.com/v1 และ apiKey $NINEROUTER_API_KEY

#### Scenario: ใช้ URL จากไฟล์ config

- **GIVEN** ไม่มี NINEROUTER_BASE_URL และ config.json มี {"nineRouter":{"baseUrl":"http://10.0.0.5:20128/v1"}}
- **WHEN** อ่านค่าการตั้งค่า
- **THEN** baseUrl คือ http://10.0.0.5:20128/v1

#### Scenario: ไม่มีการตั้งค่าเลย

- **GIVEN** ไม่มี env ทั้งสองตัวและไม่มีไฟล์ config
- **WHEN** โหลด extension
- **THEN** baseUrl คือ http://localhost:20128/v1 และไม่มีฟิลด์ apiKey

#### Scenario: ค่าใน config ไม่ใช่ URL

- **GIVEN** config.json มี {"nineRouter":{"baseUrl":"ftp://x"}}
- **WHEN** อ่านค่าการตั้งค่า
- **THEN** baseUrl กลับเป็นค่าเริ่มต้น และมีคำเตือนที่ไม่มี API key อยู่ในข้อความ

### Requirement: model-discovery

refreshModels ของ provider 9router SHALL ดึง GET {baseUrl}/models เมื่อ Pi อนุญาต network บันทึกรายชื่อล่าสุดไว้ และคืนรายชื่อที่บันทึกไว้เมื่อ Pi ไม่อนุญาต network

- ส่ง Authorization: Bearer ด้วย key จาก context.credential เมื่อมี และส่ง context.signal ให้ fetch
- id และ name คือ id จาก 9router, contextWindow จาก context_length, maxTokens จาก max_completion_tokens หรือค่าเริ่มต้น 128000 และ 16384
- input มี image เมื่อ capabilities.vision เป็น true, reasoning เป็น true เมื่อ thinking_levels ไม่ว่างหรือ capabilities.reasoning เป็น true
- cost เป็นศูนย์ทุกช่อง และข้ามรายการที่ไม่มี id หรือ id ซ้ำ
- หลังดึงสำเร็จ บันทึกรายชื่อผ่าน context.publish({ persist }) ของ Pi เป็น model ของ provider 9router
- เมื่อ allowNetwork เป็น false คืน model ของ 9router จาก context.stored โดยไม่เรียก network และคืนรายการว่างเมื่อยังไม่เคยบันทึก
- เมื่อดึงล้ม ไม่แก้รายชื่อที่บันทึกไว้

#### Scenario: ดึงรายชื่อสำเร็จ

- **GIVEN** server จำลองตอบ {object:list, data:[{id:kr/claude-sonnet-4.5, context_length:200000, max_completion_tokens:64000, capabilities:{vision:true}, thinking_levels:[low,high]}, {id:my-combo}]}
- **WHEN** เรียก refreshModels ด้วย credential api_key test-key และ allowNetwork true
- **THEN** server ได้ header Authorization Bearer test-key, ได้ model 2 ตัว ตัวแรก contextWindow 200000, maxTokens 64000, input text และ image, reasoning true ตัวที่สอง contextWindow 128000, maxTokens 16384, input text, reasoning false และ publish persist มี model ทั้งสองของ provider 9router

#### Scenario: ไม่อนุญาต network ใช้รายชื่อที่บันทึกไว้

- **GIVEN** context.stored มี model kr/a ของ provider 9router และ model ของ provider อื่น
- **WHEN** เรียก refreshModels ด้วย allowNetwork false
- **THEN** คืนเฉพาะ kr/a และ server จำลองไม่ได้รับ request

#### Scenario: ไม่อนุญาต network และยังไม่เคยบันทึก

- **WHEN** เรียก refreshModels ด้วย allowNetwork false และไม่มี context.stored
- **THEN** คืนรายการว่างและ server จำลองไม่ได้รับ request

#### Scenario: key ผิด

- **GIVEN** server จำลองตอบ 401
- **WHEN** เรียก refreshModels
- **THEN** throw error ที่บอกสถานะ 401 และ URL ของ /models โดยไม่มีค่า key อยู่ในข้อความ และไม่ publish

#### Scenario: router ติดต่อไม่ได้หรือตอบผิดรูปแบบ

- **GIVEN** baseUrl ชี้ไปที่ port ที่ไม่มี server หรือ server ตอบ {"foo":1}
- **WHEN** เรียก refreshModels
- **THEN** throw error ที่บอก URL และสาเหตุ ไม่ใช่คืน model ปลอม

#### Scenario: ยกเลิกระหว่างดึง

- **GIVEN** server จำลองหน่วงคำตอบ
- **WHEN** abort signal ก่อน server ตอบ
- **THEN** refreshModels จบด้วย AbortError

### Requirement: chat-through-router

model ของ provider 9router SHALL ส่ง chat request แบบ streaming ไปที่ {baseUrl}/chat/completions ผ่าน API openai-completions ของ Pi หลัง Pi ดึงรายชื่อ model จาก router แล้ว

#### Scenario: เปิด Pi แบบ interactive แล้วใช้ pi -p

- **GIVEN** server จำลองตอบ /models และ /chat/completions แบบ SSE ด้วยข้อความ pong
- **WHEN** เปิด Pi แบบ interactive ที่โหลด extension จน server ได้ GET /v1/models แล้วปิด จากนั้นรัน pi -p ping ด้วย model 9router/<id จาก server จำลอง>
- **THEN** ผลลัพธ์มี pong และ server ได้ chat request ที่ model เป็น id นั้นพร้อม Authorization Bearer

#### Scenario: pi -p ก่อนเคยดึงรายชื่อ

- **GIVEN** ยังไม่เคยเปิด Pi แบบ interactive กับ extension นี้
- **WHEN** รัน pi -p ด้วย model 9router/<id>
- **THEN** Pi แจ้งว่าไม่พบ model และ server ไม่ได้รับ chat request

### Requirement: package-wiring

แพ็กเกจ pi-extensions SHALL รวม nine-router ใน manifest, การติดตั้ง, เทสต์ และเอกสาร

- pi.extensions และ files ใน package.json, EXTENSIONS ใน pack-check.mjs, install.sh, test.sh และ tsconfig.json มี nine-router
- version เป็น 0.2.0 และ CHANGELOG มีหัวข้อ ## [0.2.0]
- README ของแพ็กเกจและ nine-router/README.md อธิบายการตั้งค่า URL, key และความปลอดภัยของ key

#### Scenario: ตรวจแพ็กเกจครบ

- **WHEN** รัน npm --prefix pi-extensions run check
- **THEN** typecheck, docs:check, pack:check และเทสต์ผ่าน และ tarball มี nine-router/index.ts แต่ไม่มีไฟล์เทสต์ของ nine-router

#### Scenario: install dry-run

- **WHEN** รัน bash pi-extensions/install.sh --dry-run
- **THEN** รายการที่จะ copy มี nine-router

### Requirement: auto-name

session-title SHALL ตั้งชื่อ session จากข้อความแรกของผู้ใช้เมื่อ session ยังไม่มีชื่อ

- ใช้บรรทัดแรกที่มีเนื้อหา ตัดช่องว่างซ้ำ และตัดให้ยาวไม่เกิน 48 ตัวอักษรแบบไม่ตัดกลาง grapheme พร้อม … เมื่อถูกตัด
- ไม่ตั้งจากข้อความที่ขึ้นต้นด้วย / (คำสั่ง) หรือข้อความที่ไม่มีตัวอักษร
- ไม่ตั้งเมื่อ session มีชื่ออยู่แล้ว

#### Scenario: ตั้งชื่อจากคำสั่งแรก

- **GIVEN** session ยังไม่มีชื่อ
- **WHEN** ผู้ใช้ส่งข้อความ "ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่"
- **THEN** ชื่อ session เป็น "ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่"

#### Scenario: ข้อความยาวถูกตัด

- **WHEN** ข้อความแรกยาว 120 ตัวอักษร
- **THEN** ชื่อยาวไม่เกิน 48 ตัวอักษรและลงท้ายด้วย …

#### Scenario: ไม่ทับชื่อเดิม

- **GIVEN** session ชื่อ "Release prep" อยู่แล้ว
- **WHEN** ผู้ใช้ส่งข้อความ
- **THEN** ชื่อยังเป็น "Release prep"

#### Scenario: ข้ามคำสั่งและข้อความว่าง

- **WHEN** ข้อความแรกเป็น "/reload" หรือมีแค่ "???"
- **THEN** ไม่มีการตั้งชื่อ และข้อความถัดไปที่มีเนื้อหาจะถูกใช้แทน

### Requirement: agent-title-tool

session-title SHALL ให้ agent ตั้งชื่องานปัจจุบันผ่าน tool session_title

- รับ title 1-60 ตัวอักษรหลังตัดช่องว่าง
- เปลี่ยนชื่อได้เฉพาะเมื่อชื่อปัจจุบันว่างหรือเป็นชื่อที่ extension ตั้งเอง
- ถ้าผู้ใช้ตั้งชื่อเองด้วย /name ให้ปฏิเสธพร้อมข้อความว่าเป็นชื่อที่ผู้ใช้ตั้ง
- system prompt แนะนำให้เรียกเมื่องานหลักเปลี่ยน ด้วยชื่อสั้น 2-6 คำ

#### Scenario: agent อัปเดตชื่อ

- **GIVEN** ชื่อปัจจุบันตั้งจากข้อความแรก
- **WHEN** agent เรียก session_title { title: "Tab titles from work" }
- **THEN** ชื่อ session เป็น "Tab titles from work"

#### Scenario: ชื่อที่ผู้ใช้ตั้งไม่ถูกทับ

- **GIVEN** ผู้ใช้ตั้งชื่อ "Mine" ด้วย /name
- **WHEN** agent เรียก session_title
- **THEN** ชื่อยังเป็น "Mine" และ tool ตอบว่าผู้ใช้ตั้งชื่อเอง

#### Scenario: title ว่างหรือยาวเกิน

- **WHEN** agent เรียกด้วย title ว่างหรือยาว 61 ตัวอักษร
- **THEN** tool ปฏิเสธและชื่อไม่เปลี่ยน

#### Scenario: จำว่าชื่อไหน extension ตั้งหลัง reload

- **GIVEN** extension ตั้งชื่อไว้แล้ว Pi ถูก /reload
- **WHEN** agent เรียก session_title
- **THEN** ชื่อเปลี่ยนได้ เพราะยังรู้ว่าเป็นชื่ออัตโนมัติ

### Requirement: title-package-wiring

pi-extensions SHALL รวม session-title ใน manifest, installer, test runner และเอกสาร tool

#### Scenario: ตรวจแพ็กเกจผ่าน

- **WHEN** รัน npm run check ใน pi-extensions
- **THEN** ผ่าน และ docs/tools.md มี session_title

### Requirement: team-webui-package

team-webui SHALL โหลดจาก pi-extensions และลงทะเบียน tool, command และ shortcut ชุดเดิมของ pi-team-webui

- ลงทะเบียน task_board และ tool_guide และ command เดิมเช่น /serve
- ใช้ ../background-bash/manager.cjs ที่อยู่ข้างกัน
- เทสต์ Node ของ team-webui รันใน test.sh และผ่านทั้งหมด
- tarball มี web/ ที่ใช้ตอนรัน แต่ไม่มี test/ และ scripts/ สำหรับ benchmark

#### Scenario: ลงทะเบียนครบ

- **WHEN** โหลด pi-extensions ผ่าน loader ของ Pi
- **THEN** มี tool task_board และ tool_guide และ command serve

#### Scenario: background jobs จาก extension ข้างกัน

- **GIVEN** ไม่มี ~/.pi/agent/extensions/background-bash
- **WHEN** team-webui สร้างตัวจัดการ background jobs
- **THEN** ใช้ manager.cjs จาก pi-extensions/background-bash ได้

#### Scenario: เทสต์ reload ครบโมดูล

- **GIVEN** เทสต์ reload คัดลอกโมดูลไปโฟลเดอร์ชั่วคราว
- **WHEN** รันเทสต์
- **THEN** ทุกโมดูลที่ task-store import ถูกคัดลอกและเทสต์ผ่าน

### Requirement: claude-accounts-package

claude-accounts SHALL หา pi-claude-subscription จาก <agent dir>/git/github.com/inhumanxd/pi-claude-subscription ตอนโหลด

- ใช้ getAgentDir() จึงตาม PI_CODING_AGENT_DIR
- ถ้าไม่พบแพ็กเกจ /accounts ยังลงทะเบียน Pi ไม่ล้ม และคำสั่งตอบข้อความบอกให้ติดตั้ง git:github.com/inhumanxd/pi-claude-subscription
- ไม่มี token หรือ credential ในโค้ดหรือข้อความ

#### Scenario: ใช้แพ็กเกจที่ติดตั้งไว้

- **GIVEN** agent dir มี pi-claude-subscription
- **WHEN** โหลด claude-accounts และมีบัญชี work ใน auth.json
- **THEN** provider claude-subscription-account-work ถูกลงทะเบียน

#### Scenario: ไม่มีแพ็กเกจ subscription

- **GIVEN** agent dir ไม่มี pi-claude-subscription
- **WHEN** โหลดแล้วสั่ง /accounts add work
- **THEN** Pi โหลดสำเร็จ และ /accounts แจ้งให้ติดตั้งแพ็กเกจโดยไม่ลงทะเบียน provider

### Requirement: renderer-build

npm run build:renderers ใน pi-extensions SHALL สร้าง team-webui/web/vendor/markdown.js และ mermaid.js จาก devDependencies ที่ pin ไว้

#### Scenario: สร้าง renderer

- **WHEN** รัน npm --prefix pi-extensions run build:renderers
- **THEN** markdown.js, mermaid.js และ RENDERERS.txt ถูกเขียนใน team-webui/web/vendor

### Requirement: webui-project-labels

Pi Workspace SHALL แสดงชื่อโปรเจกต์และพาธแบบย่อแทนพาธเต็มของเครื่อง

- พาธย่อคือสองส่วนท้ายนำหน้าด้วย …/
- พาธเต็มของโปรเจกต์อยู่ใน title ของตัวเลือก Tasks เท่านั้น

#### Scenario: ตัวเลือกโปรเจกต์อ่านง่าย

- **GIVEN** โปรเจกต์อยู่ที่ /private/var/folders/xv/abc/changeloop
- **WHEN** เปิดหน้า Tasks
- **THEN** ตัวเลือกแสดง changeloop · …/abc/changeloop

#### Scenario: tooltip session ไม่เผยพาธเต็ม

- **GIVEN** session ทำงานใน /Users/me/work/app
- **WHEN** อ่าน title ของแถว session
- **THEN** title มี …/work/app และไม่มี /Users/me

#### Scenario: พาธสั้น

- **WHEN** พาธมีส่วนเดียว เช่น /app
- **THEN** แสดง /app ตามเดิม

### Requirement: webui-task-stage-navigation

บอร์ด Tasks SHALL มีปุ่มเลือกขั้นพร้อมจำนวนงานและคำอธิบายแต่ละขั้น

- จอกว้างไม่เกิน 720px แสดงเฉพาะคอลัมน์ของขั้นที่เลือก
- ขั้นเริ่มต้นบนมือถือคือขั้นแรกที่มีงาน
- จอกว้างกดปุ่มขั้นแล้วเลื่อนคอลัมน์นั้นเข้ามาในจอ
- หัวคอลัมน์มีคำอธิบายสั้นของขั้น

#### Scenario: มือถือเห็นการ์ดทันที

- **GIVEN** จอ 390px มีงาน 1 รายการในขั้น Land
- **WHEN** เปิด Tasks
- **THEN** แสดงคอลัมน์ Land พร้อมการ์ด
- **AND** หน้าไม่ล้นแนวนอน

#### Scenario: เดสก์ท็อปไปยังขั้นที่อยู่นอกจอ

- **GIVEN** จอ 1366px งานอยู่ในขั้น Land
- **WHEN** กดปุ่ม Land · 1
- **THEN** คอลัมน์ Land อยู่ในจอ

#### Scenario: ขั้นที่เลือกว่าง

- **GIVEN** มือถือ
- **WHEN** เลือกขั้นที่ไม่มีงาน
- **THEN** แสดง No tasks in this stage และปุ่มอื่นยังแสดงจำนวน

#### Scenario: คำอธิบายขั้น

- **WHEN** อ่านหัวคอลัมน์ Prove
- **THEN** มีคำอธิบายสั้นว่าเป็นขั้นตรวจหลักฐาน

### Requirement: webui-mobile-header

แถบหัวบนจอแคบ SHALL แสดงชื่อ session และจำนวนงานเบื้องหลังให้อ่านได้

- ชื่อ session มีความกว้างอย่างน้อย 120px บนจอ 390px
- การแตะ session ที่เลือกอยู่แล้วปิดเมนูข้างบนมือถือ

#### Scenario: ชื่อ session อ่านได้

- **GIVEN** จอ 390px
- **WHEN** เลือก session Edge cases · cancellation
- **THEN** ชื่อ session ในแถบหัวกว้างอย่างน้อย 120px
- **AND** จำนวน BG แสดงเป็นตัวเลข

#### Scenario: แตะ session เดิม

- **GIVEN** เมนูข้างบนมือถือเปิดอยู่
- **WHEN** แตะ session ที่เลือกอยู่แล้ว
- **THEN** เมนูข้างปิด

### Requirement: webui-login-feedback

หน้าเข้าใช้ SHALL แสดงสาเหตุที่ชัดเจนเมื่อรหัสเข้าใช้ไม่ถูกต้องหรือหมดอายุ

#### Scenario: รหัสผิด

- **WHEN** ส่งรหัสที่ไม่ถูกต้อง
- **THEN** แสดง Access code is invalid or expired. Ask the host for a new invite.

#### Scenario: session หมดอายุ

- **GIVEN** เข้าใช้อยู่แล้ว cookie หมดอายุ
- **WHEN** เรียก API ใด ๆ
- **THEN** กลับหน้าเข้าใช้พร้อม Your access ended. Sign in again.

### Requirement: webui-help

Pi Workspace SHALL มีคำแนะนำครั้งแรกและหน้าช่วยเหลือที่เปิดได้ตลอด

#### Scenario: เปิดความช่วยเหลือ

- **WHEN** กดปุ่ม Help
- **THEN** กล่องอธิบาย Main/Sub, Working/Idle, Queue after task, Steer next turn, ขั้นงาน และบทบาท viewer

#### Scenario: คำแนะนำครั้งแรก

- **GIVEN** ยังไม่เคยปิดคำแนะนำ
- **WHEN** เข้าใช้ครั้งแรก
- **THEN** หน้า welcome แสดงคำแนะนำสามข้อและปุ่ม Got it
- **AND** กด Got it แล้วไม่แสดงอีกในเบราว์เซอร์นี้

### Requirement: webui-locale

Pi Workspace SHALL ให้ผู้ใช้เลือกภาษาอังกฤษหรือไทยสำหรับป้ายของหน้าจอ

- ค่าเริ่มต้นเป็นไทยเมื่อภาษาเบราว์เซอร์ขึ้นต้นด้วย th มิฉะนั้นอังกฤษ
- เก็บค่าที่เลือกใน localStorage
- html lang ตรงกับภาษาที่เลือก
- ไม่แปลข้อความแชท โค้ด หรือเนื้อหาไฟล์

#### Scenario: เลือกภาษาไทย

- **WHEN** เลือก ไทย ในตัวเลือกภาษา
- **THEN** หัวข้อ Tasks แสดง งานของโปรเจกต์
- **AND** html lang เป็น th

#### Scenario: เลือกภาษาอังกฤษ

- **GIVEN** เลือกไทยอยู่
- **WHEN** เลือก English
- **THEN** หน้า City แสดง Agent city เป็นภาษาอังกฤษ
- **AND** html lang เป็น en

#### Scenario: ไม่แปลข้อความแชท

- **GIVEN** ข้อความ assistant คือ Idle
- **WHEN** เปลี่ยนเป็นไทย
- **THEN** ข้อความในแชทยังเป็น Idle

### Requirement: webui-viewer-role

hub SHALL ปฏิเสธคำขอที่เปลี่ยนสถานะจากผู้เข้าใช้บทบาท viewer

- ผู้เข้าด้วยรหัสหลักจาก /serve มีบทบาท member
- viewer ได้ 403 Read-only access. สำหรับทุก POST ยกเว้น /api/logout
- viewer ได้ 403 สำหรับ /api/invite และ /api/access
- หน้าเว็บของ viewer ปิดช่องส่งข้อความและปุ่มแก้ไข

#### Scenario: viewer อ่านได้

- **GIVEN** เข้าใช้ด้วยลิงก์ viewer
- **WHEN** GET /api/state
- **THEN** ได้ 200 พร้อม role viewer

#### Scenario: viewer ส่ง POST ไม่ได้

- **GIVEN** เข้าใช้ด้วยลิงก์ viewer
- **WHEN** POST /api/sessions/<key>/commit
- **THEN** ได้ 403 Read-only access.

#### Scenario: viewer อ่านรหัสหลักไม่ได้

- **GIVEN** เข้าใช้ด้วยลิงก์ viewer
- **WHEN** GET /api/invite
- **THEN** ได้ 403

#### Scenario: member ส่ง POST ได้

- **GIVEN** เข้าใช้ด้วยรหัสหลัก
- **WHEN** POST /api/sessions/<key>/commit
- **THEN** คำขอถูกส่งต่อตามปกติ

#### Scenario: viewer ออกจากระบบได้

- **GIVEN** เข้าใช้ด้วยลิงก์ viewer
- **WHEN** POST /api/logout
- **THEN** ได้ 200

### Requirement: webui-invite-lifecycle

member SHALL สร้าง ดู และเพิกถอนลิงก์เชิญที่มีบทบาทและวันหมดอายุได้

- บทบาท viewer หรือ member
- อายุ 1, 24 หรือ 168 ชั่วโมง
- สูงสุด 32 ลิงก์ที่ยังใช้ได้
- รหัสหลักจาก /serve ไม่เปลี่ยนและเพิกถอนผ่านหน้าเว็บไม่ได้
- ลิงก์อยู่ในหน่วยความจำ hub และหายเมื่อ /serve stop

#### Scenario: สร้างลิงก์ viewer

- **GIVEN** member
- **WHEN** สร้างลิงก์ viewer อายุ 24 ชั่วโมง
- **THEN** ได้ URL และรายการแสดง viewer พร้อมเวลาหมดอายุ

#### Scenario: ลิงก์หมดอายุ

- **GIVEN** ลิงก์หมดอายุแล้ว
- **WHEN** เข้าใช้ด้วยรหัสนั้น
- **THEN** ได้ 401 Access code is invalid or expired.

#### Scenario: เพิกถอนตัด session

- **GIVEN** มีคนเข้าด้วยลิงก์นั้นอยู่
- **WHEN** member เพิกถอนลิงก์
- **THEN** คำขอถัดไปของผู้นั้นได้ 401

#### Scenario: ค่าที่ไม่รองรับ

- **WHEN** สร้างลิงก์ด้วย role admin หรืออายุ 5 ชั่วโมง
- **THEN** ได้ 400

#### Scenario: viewer สร้างลิงก์ไม่ได้

- **GIVEN** viewer
- **WHEN** POST /api/access
- **THEN** ได้ 403

### Requirement: webui-audit-log

hub SHALL บันทึกคำขอที่เปลี่ยนสถานะพร้อมชื่อผู้ทำ บทบาท การกระทำ ผลลัพธ์ และเวลา

- เก็บล่าสุด 500 รายการในหน่วยความจำ
- ไม่บันทึกเนื้อหาข้อความ ไฟล์ หรือรหัส
- บันทึกคำขอที่ถูกปฏิเสธด้วย

#### Scenario: บันทึก commit

- **GIVEN** member ชื่อ Ann
- **WHEN** POST commit
- **THEN** audit มีรายการ Ann member commit พร้อมสถานะ

#### Scenario: บันทึกการปฏิเสธ

- **GIVEN** viewer ชื่อ Bo
- **WHEN** POST save
- **THEN** audit มีรายการ Bo viewer save 403

#### Scenario: ไม่เก็บความลับ

- **WHEN** สร้างลิงก์เชิญ
- **THEN** audit ไม่มีรหัสเชิญ

### Requirement: webui-accessibility

Pi Workspace SHALL รองรับผู้ใช้คีย์บอร์ด โปรแกรมอ่านหน้าจอ และหน้าจอสัมผัสในเส้นทางหลัก

- skip link Skip to conversation เป็นจุด Tab แรก
- live region แบบ polite ประกาศเมื่อ assistant ตอบเสร็จ
- แท็บ inspector มี aria-controls
- checkbox ใน Markdown มีชื่อจากข้อความรายการ
- หัวข้อ Markdown ในข้อความเริ่มที่ h3
- ปุ่มบนอุปกรณ์ pointer coarse สูงอย่างน้อย 44px

#### Scenario: skip link

- **WHEN** กด Tab ครั้งแรกหลังเข้าใช้
- **THEN** โฟกัสอยู่ที่ Skip to conversation

#### Scenario: ประกาศคำตอบ

- **WHEN** assistant ตอบเสร็จ
- **THEN** live region มีข้อความ New reply

#### Scenario: หัวข้อในข้อความ

- **GIVEN** ข้อความมี # Rich response
- **WHEN** แสดงผล
- **THEN** หน้ามี h1 เพียงตัวเดียว

#### Scenario: เป้าสัมผัส

- **GIVEN** อุปกรณ์สัมผัส จอ 390px
- **WHEN** วัดปุ่มบนแถบหัว
- **THEN** ทุกปุ่มสูงอย่างน้อย 44px

### Requirement: webui-attachment-partial

ช่องแนบไฟล์ SHALL รับไฟล์ที่อยู่ในขีดจำกัดและแจ้งไฟล์ที่ถูกข้าม

#### Scenario: แนบ 12 ไฟล์

- **GIVEN** ยังไม่มีไฟล์แนบ
- **WHEN** เลือก 12 ไฟล์
- **THEN** แนบ 10 ไฟล์แรก
- **AND** แจ้งว่าข้าม 2 ไฟล์เพราะเกิน 10 ไฟล์ต่อข้อความ

#### Scenario: มีไฟล์ใหญ่เกิน

- **WHEN** เลือกไฟล์ 21 MB กับไฟล์ข้อความเล็ก
- **THEN** แนบไฟล์เล็ก และแจ้งว่า big.bin เกิน 20 MB

#### Scenario: ครบ 10 แล้ว

- **GIVEN** แนบ 10 ไฟล์แล้ว
- **WHEN** เลือกอีก 1 ไฟล์
- **THEN** ไม่แนบเพิ่มและแจ้งว่าข้าม 1 ไฟล์

### Requirement: webui-composer-empty

ปุ่ม Send SHALL ถูกปิดเมื่อไม่มีข้อความและไม่มีไฟล์แนบ

#### Scenario: ช่องว่าง

- **GIVEN** session ออนไลน์
- **WHEN** ช่องข้อความว่างและไม่มีไฟล์
- **THEN** ปุ่ม Send ถูกปิด

#### Scenario: พิมพ์แล้ว

- **WHEN** พิมพ์ hello
- **THEN** ปุ่ม Send ใช้ได้

#### Scenario: มีแต่ช่องว่าง

- **WHEN** พิมพ์เพียงช่องว่าง
- **THEN** ปุ่ม Send ยังปิด

### Requirement: webui-git-dialogs

การสร้าง branch และ worktree SHALL ใช้กล่องโต้ตอบในหน้าเว็บที่ตรวจชื่อก่อนส่ง

- ตรวจชื่อเบื้องต้น: ไม่ว่าง ไม่มีช่องว่าง ไม่มี .. ~ ^ : ? * [ \ ไม่ขึ้นต้นด้วย - หรือลงท้ายด้วย / หรือ .lock
- server ยังตรวจด้วย git check-ref-format

#### Scenario: สร้าง worktree

- **WHEN** กด + New worktree แล้วใส่ feature/x
- **THEN** สร้าง worktree และไม่มี window.prompt

#### Scenario: ชื่อไม่ถูกต้อง

- **WHEN** ใส่ bad name..
- **THEN** แสดงข้อความว่าชื่อ branch ไม่ถูกต้องและไม่ส่งคำขอ

#### Scenario: ยกเลิก

- **WHEN** กด Cancel
- **THEN** ไม่มีคำขอถูกส่ง

### Requirement: webui-city-counts

หัวข้อ 3D City SHALL แสดงจำนวน agent ที่ตรงตัวกรองจริง

- หัวข้อแสดง N agents · 10 districts
- ป้ายย่านบนตึกใหญ่ขึ้นอย่างน้อย 1.5 เท่า

#### Scenario: 6 agents

- **GIVEN** มี 6 session ออนไลน์
- **WHEN** เปิด City
- **THEN** หัวข้อขึ้นต้นด้วย 6 agents

#### Scenario: ไม่มี agent

- **GIVEN** ค้นหาไม่พบ
- **WHEN** เปิด City
- **THEN** หัวข้อขึ้นต้นด้วย 0 agents

### Requirement: webui-html-validity

หน้า index SHALL โหลด stylesheet ทั้งหมดภายใน head และโค้ดในบรรทัดมีคอนทราสต์อย่างน้อย 4.5:1

#### Scenario: stylesheet ใน head

- **WHEN** อ่าน index.html
- **THEN** tasks.css อยู่ใน head

#### Scenario: คอนทราสต์ inline code

- **WHEN** วัดสีข้อความกับพื้นของ inline code
- **THEN** อัตราส่วนอย่างน้อย 4.5

### Requirement: configure-from-pi

ส่วนขยาย 9Router SHALL ให้ผู้ใช้ตั้งปลายทางและคีย์ผ่าน /login ของ Pi โดยเก็บทั้งสองค่าด้วยระบบล็อกอินของ Pi

#### Scenario: ตั้งค่าผ่านเมนูเดิม

- **WHEN** ผู้ใช้เลือก 9Router ใน /login แล้วระบุ Base URL และคีย์
- **THEN** Pi เก็บคู่ค่าที่เลือกและแสดงโมเดลจากปลายทางนั้นโดยไม่ต้อง reload

#### Scenario: ปฏิเสธปลายทางผิดรูปแบบ

- **WHEN** ผู้ใช้กรอก URL ผิดรูปแบบหรือ URL มีข้อมูลรับรองฝังอยู่
- **THEN** Pi แจ้งรูปแบบที่ถูกต้อง ให้ลองใหม่ และยังไม่บันทึกหรือส่งคีย์

#### Scenario: ยกเลิกได้

- **WHEN** ผู้ใช้กด Esc ก่อนบันทึก
- **THEN** Pi คงค่าปลายทางและคีย์ที่เคยตั้งไว้

#### Scenario: ค่าที่ตั้งไว้ยังใช้ได้

- **WHEN** ยังไม่มี URL ที่บันทึกผ่านเมนูล็อกอิน
- **THEN** Pi ยังใช้คีย์เดิมและ URL จากตัวแปรสภาพแวดล้อม ไฟล์ตั้งค่า หรือค่าเริ่มต้นตามลำดับเดิม

#### Scenario: ปลายทางที่ผู้ใช้เห็นตรงกับปลายทางจริง

- **WHEN** NINEROUTER_BASE_URL ตั้งไว้และผู้ใช้เปิดขั้นตอนล็อกอิน
- **THEN** Pi แสดงปลายทางที่ตัวแปรสภาพแวดล้อมบังคับใช้ก่อนขอคีย์และไม่ให้บันทึก URL ที่ไม่มีผล

### Requirement: standalone-chat

ส่วนขยาย 9Router SHALL ส่งข้อความได้เมื่อติดตั้งนอก repo โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม

#### Scenario: แชตผ่านส่วนขยายที่ติดตั้ง

- **WHEN** Pi โหลดส่วนขยายจากโฟลเดอร์แยกที่ไม่มี node_modules และส่งข้อความไปยัง 9Router หลังล็อกอิน
- **THEN** Pi รับข้อความตอบกลับจากปลายทางที่บันทึกไว้โดยไม่มีข้อผิดพลาดว่าไม่พบโมดูล

### Requirement: btw-command

extension btw SHALL ลงทะเบียนคำสั่ง /btw ที่ส่งคำถามพร้อมบริบทบทสนทนาปัจจุบันไปให้โมเดลที่ใช้อยู่ตอบ โดยไม่ส่งรายการเครื่องมือ

- บริบทคือข้อความ user/assistant ที่จบแล้วใน branch ปัจจุบันหลังใช้ compaction
- บริบทยาวเกินขีดจำกัดจะถูกตัดเหลือส่วนท้าย
- คำขอใช้ ctx.model และไม่มี tools

#### Scenario: ถามตอนเอเจนต์ว่าง

- **GIVEN** บทสนทนามีข้อความ user และ assistant
- **WHEN** ผู้ใช้พิมพ์ /btw อธิบายอีกที
- **THEN** โมเดลได้รับบริบทบทสนทนาและคำถาม โดยไม่มีรายการเครื่องมือ
- **AND** คำตอบแสดงในกล่องลอย

#### Scenario: บริบทยาวเกิน

- **GIVEN** บทสนทนายาวเกินขีดจำกัดบริบท
- **WHEN** ผู้ใช้พิมพ์ /btw
- **THEN** บริบทที่ส่งมีเฉพาะส่วนท้ายและไม่เกินขีดจำกัด

#### Scenario: ไม่ใส่คำถาม

- **WHEN** ผู้ใช้พิมพ์ /btw โดยไม่มีข้อความ
- **THEN** แจ้งวิธีใช้ /btw <คำถาม> และไม่เรียกโมเดล

#### Scenario: ไม่มีโมเดล

- **GIVEN** ยังไม่ได้เลือกโมเดล
- **WHEN** ผู้ใช้พิมพ์ /btw คำถาม
- **THEN** แจ้งว่าต้องเลือกโมเดลก่อน และไม่เรียกโมเดล

### Requirement: btw-isolation

/btw SHALL ไม่เขียนข้อความ entry หรือ steer ลงบทสนทนาหลัก และ SHALL ไม่หยุดงานหลักที่กำลังทำ

#### Scenario: ไม่เขียนลง session

- **WHEN** /btw ตอบเสร็จ
- **THEN** ไม่มีการเรียก sendMessage sendUserMessage หรือ appendEntry

#### Scenario: ยกเลิกระหว่างรอ

- **GIVEN** โมเดลยังตอบไม่เสร็จ
- **WHEN** ผู้ใช้กด Esc
- **THEN** คำขอของ /btw ถูกยกเลิกผ่าน AbortSignal ของตัวเอง
- **AND** ไม่เรียก ctx.abort ของงานหลัก

#### Scenario: โมเดลล้มเหลว

- **GIVEN** ผู้ให้บริการโมเดลตอบข้อผิดพลาด
- **WHEN** ผู้ใช้พิมพ์ /btw คำถาม
- **THEN** แจ้งข้อผิดพลาดและงานหลักทำต่อ

### Requirement: btw-provider-neutral-call

/btw SHALL เรียกโมเดลผ่าน modelRegistry.streamSimple ด้วย AbortSignal ของตัวเอง ซึ่งเป็นเส้นทางที่ Pi route โมเดลเสมือนสำหรับคำขอนอก agent loop

#### Scenario: ใช้ streamSimple ไม่ใช่ complete

- **GIVEN** โมเดลปัจจุบันถูกเลือกไว้
- **WHEN** ผู้ใช้พิมพ์ /btw คำถาม
- **THEN** คำตอบมาจาก modelRegistry.streamSimple
- **AND** ไม่เรียก modelRegistry.complete

#### Scenario: ยกเลิกยังใช้ signal ของตัวเอง

- **GIVEN** คำตอบยังไม่มา
- **WHEN** ผู้ใช้กด Esc
- **THEN** signal ที่ส่งให้ streamSimple ถูก abort และงานหลักไม่ถูก abort
