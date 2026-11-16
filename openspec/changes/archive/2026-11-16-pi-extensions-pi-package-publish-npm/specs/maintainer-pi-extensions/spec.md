# maintainer-pi-extensions

## ADDED Requirements

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

npm run typecheck ใน pi-extensions SHALL ผ่าน tsc --noEmit กับโค้ด .ts ของทั้งสาม extension

#### Scenario: โค้ดปัจจุบันผ่าน typecheck

- **WHEN** รัน npm --prefix pi-extensions run typecheck
- **THEN** tsc จบด้วยรหัส 0

#### Scenario: เรียก API ที่ไม่มีอยู่

- **GIVEN** ไฟล์ชั่วคราวเรียก pi.registerToolz ซึ่งไม่มีใน ExtensionAPI
- **WHEN** รัน tsc กับไฟล์นั้น
- **THEN** tsc รายงาน error

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
