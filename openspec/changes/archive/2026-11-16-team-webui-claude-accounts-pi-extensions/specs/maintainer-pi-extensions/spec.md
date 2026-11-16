# maintainer-pi-extensions

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: extensions-in-repo

The repository SHALL contain the agent-team, ask-user, background-bash, nine-router, session-title, team-webui and claude-accounts Pi extensions under pi-extensions/ as sibling folders, without generated reports or machine-specific absolute paths.

#### Scenario: Extensions are present without personal paths

- **WHEN** a maintainer lists pi-extensions/ and searches it for /Users/
- **THEN** each of agent-team, ask-user, background-bash, nine-router, session-title, team-webui and claude-accounts has an index.ts, and no file contains a /Users/ path

#### Scenario: Generated reports stay out

- **WHEN** a maintainer lists pi-extensions/team-webui
- **THEN** there is no reports/, node_modules/ or __pycache__/ folder

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
