# pi-host-adapter

## ADDED Requirements

### Requirement: pi-advisory-mode

Pi adapter SHALL รัน guard ในโหมด auto เว้นแต่ผู้ใช้ตั้ง FOUNDATION_GUARDRAIL_MODE ไว้ และ SHALL แนบคำเตือนแทนการบล็อก Land, Deliver และ authority run ผ่าน background_bash

- advance --through archived หรือคำสั่งย่อยของ Land ที่ไม่มีคำอนุมัติในเทิร์นนั้นรันต่อพร้อมคำเตือนว่า Land ควรทำเมื่อผู้ใช้สั่ง
- deliver advance หรือ delivery-advance ที่ไม่มี /deliver รันต่อพร้อมคำเตือน
- authority run ผ่าน background_bash รันต่อพร้อมคำเตือนว่า reviewer ควรรันแบบ foreground
- การแก้ไฟล์โดยไม่มีงานที่เปิดอยู่รันต่อโดยไม่ถูกปฏิเสธ

#### Scenario: Land โดยไม่มีคำอนุมัติรันต่อ

- **GIVEN** มีงาน proven และผู้ใช้ไม่ได้พิมพ์คำอนุมัติ Land ในเทิร์นนี้
- **WHEN** เอเจนต์รัน bash: cloop advance pi-case --through archived
- **THEN** การเรียกไม่ถูกบล็อก
- **AND** ผลของ tool มีคำเตือนเรื่อง Land

#### Scenario: Deliver โดยไม่มี /deliver รันต่อ

- **WHEN** เอเจนต์รัน bash: cloop deliver advance pi-case โดยไม่มี /deliver
- **THEN** การเรียกไม่ถูกบล็อก
- **AND** ผลของ tool มีคำเตือนเรื่อง Deliver

#### Scenario: แก้ไฟล์นอกงานรันต่อ

- **GIVEN** ไม่มีงานที่บันทึก phase ไว้
- **WHEN** เอเจนต์เรียก write src/main.js
- **THEN** การเรียกไม่ถูกบล็อก

#### Scenario: authority run ใน background รันต่อ

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop authority run demo
- **THEN** การเรียกไม่ถูกบล็อก
- **AND** ผลของ tool เตือนให้รันแบบ foreground

#### Scenario: ผู้ใช้เลือกโหมด block เอง

- **GIVEN** environment ของ Pi มี FOUNDATION_GUARDRAIL_MODE=block
- **WHEN** เอเจนต์เรียก write src/main.js โดยไม่มีงาน
- **THEN** การเรียกถูกบล็อกด้วยข้อความ phase guard

## MODIFIED Requirements

### Requirement: worker-phase-inheritance

When the Pi process environment has FOUNDATION_PARENT_SESSION_ID set to a session identifier, the Pi adapter SHALL resolve the recorded phase for Write, Edit and Bash guards through that parent session, so a worker may write inside the parent's active Build workspace and a worker write to the main checkout SHALL be redirected into that workspace with a note.

#### Scenario: Worker writes in the parent's workspace

- **WHEN** the parent session is in Build and a worker session with FOUNDATION_PARENT_SESSION_ID equal to the parent writes a file inside the change workspace
- **THEN** the write is allowed

#### Scenario: Worker stays out of the main checkout

- **WHEN** the same worker writes a file in the main project checkout
- **THEN** the write goes to the same path inside the parent's workspace and the result names the redirect

#### Scenario: Unrelated session gains nothing

- **WHEN** a session without FOUNDATION_PARENT_SESSION_ID writes inside another session's Build workspace
- **THEN** the write runs at its own path without a redirect and the other session's phase is not used

### Requirement: worker-no-land

A Pi session started with FOUNDATION_PARENT_SESSION_ID SHALL NOT turn the /land and /deliver commands or natural Land consent into instructions, and its guards SHALL warn instead of blocking advance --through archived and Deliver primitives.

#### Scenario: Worker cannot land

- **WHEN** a worker session runs /land for a proven change and then advance --through archived
- **THEN** no Land instruction is sent and the advance result carries the Land warning

### Requirement: archive-word-not-land

The Pi adapter SHALL treat a bash command as a Land operation only when a Change Loop CLI invocation (claude-foundation or foundation.mjs) runs a Land subcommand or advance --through archived.

#### Scenario: Git on an archived change path runs

- **WHEN** the agent runs git add openspec/changes/archive/2026-11-16-x/tasks.md without Land authority
- **THEN** the Pi adapter attaches no Land warning to it

#### Scenario: CLI archive still needs Land

- **WHEN** the agent runs node .claude/harness/foundation.mjs archive pi-case or claude-foundation sandbox apply pi-case without Land authority
- **THEN** the result carries the Land warning and the call is not blocked

### Requirement: background-bash-guarded

Pi adapter SHALL ตรวจคำสั่งของ tool background_bash ด้วย guard ชุดเดียวกับ bash ก่อนเริ่มงาน

- guard ที่ใช้: protect-secrets, phase-mutation-guard, shell-route-guard, no-detached-authority และคำเตือน Land/Deliver ของ adapter
- คำสั่ง authority run ผ่าน background_bash รันต่อพร้อมคำเตือนให้รันแบบ foreground
- ถ้า guard ใช้ไม่ได้ (startup ล้มเหลว) background_bash ถูกปฏิเสธเหมือน bash

#### Scenario: อ่านไฟล์ลับถูกกัน

- **GIVEN** โปรเจกต์มีไฟล์ .env
- **WHEN** เอเจนต์เรียก background_bash ด้วยคำสั่ง cat .env
- **THEN** คำสั่งถูกเขียนใหม่ให้อ่านสำเนาที่ปิดค่าลับ หรือถูกปฏิเสธ และค่าลับเดิมไม่ปรากฏ

#### Scenario: Land โดยไม่ได้รับสิทธิ์ถูกปฏิเสธ

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop advance <id> --through archived โดยผู้ใช้ไม่ได้สั่ง Land
- **THEN** การเรียกถูกบล็อกพร้อมข้อความว่าต้องได้สิทธิ์ Land

#### Scenario: authority run แบบ background ถูกปฏิเสธ

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop authority run <id>
- **THEN** การเรียกถูกบล็อกพร้อมบอกให้รันใน bash แบบ foreground

#### Scenario: เขียนนอก workspace ตอน Build ถูกกัน

- **GIVEN** session อยู่ใน Build
- **WHEN** background_bash เขียนไฟล์ลง main checkout ด้วย path เต็ม
- **THEN** phase guard ปฏิเสธหรือแนบคำเตือนเหมือนกับ bash

#### Scenario: Build เริ่มใน workspace

- **GIVEN** session อยู่ใน Build และไม่ได้ระบุ cwd
- **WHEN** เอเจนต์เรียก background_bash
- **THEN** input.cwd ถูกตั้งเป็น workspace ของงาน และคำสั่งปกติได้รันต่อ

#### Scenario: guard ใช้ไม่ได้ปิดตาย

- **GIVEN** startup ของ Change Loop ล้มเหลว
- **WHEN** เอเจนต์เรียก background_bash
- **THEN** การเรียกถูกบล็อกพร้อมข้อความว่า guard ใช้ไม่ได้

#### Scenario: Land โดยไม่ได้รับสิทธิ์ได้คำเตือน

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop advance <id> --through archived โดยผู้ใช้ไม่ได้สั่ง Land
- **THEN** การเรียกรันต่อและผลมีคำเตือนเรื่อง Land

#### Scenario: authority run แบบ background ได้คำเตือน

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop authority run <id>
- **THEN** การเรียกรันต่อและผลเตือนให้รันใน bash แบบ foreground

#### Scenario: เขียนนอก workspace ตอน Build ได้คำเตือน

- **GIVEN** session อยู่ใน Build
- **WHEN** background_bash เขียนไฟล์ลง main checkout ด้วย path เต็ม
- **THEN** phase guard แนบคำเตือนเหมือนกับ bash และไม่บล็อก

### Requirement: detached-authority-bash

Pi adapter SHALL รัน no-detached-authority กับทุกคำสั่ง bash ของเอเจนต์และ !/!! ของผู้ใช้

#### Scenario: authority run แบบ detach ถูกปฏิเสธ

- **WHEN** เอเจนต์รัน bash: cloop authority run demo &
- **THEN** การเรียกถูกบล็อกพร้อมบอกให้รันแบบ foreground

#### Scenario: authority run ปกติผ่าน

- **WHEN** เอเจนต์รัน bash: cloop authority run demo --help โดยไม่ detach
- **THEN** no-detached-authority ไม่บล็อกคำสั่ง

#### Scenario: authority run แบบ detach ถูกรันแบบ foreground

- **WHEN** เอเจนต์รัน bash: cloop authority run demo &
- **THEN** คำสั่งถูกเขียนใหม่ให้รันแบบ foreground และผลบอกเหตุผล
