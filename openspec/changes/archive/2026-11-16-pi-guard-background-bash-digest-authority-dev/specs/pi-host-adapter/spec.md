# pi-host-adapter

## ADDED Requirements

### Requirement: background-bash-guarded

Pi adapter SHALL ตรวจคำสั่งของ tool background_bash ด้วย guard ชุดเดียวกับ bash ก่อนเริ่มงาน

- guard ที่ใช้: protect-secrets, phase-mutation-guard, shell-route-guard, no-detached-authority และด่าน Land/Deliver ของ adapter
- คำสั่ง authority run ผ่าน background_bash ถือว่า detach เสมอและถูกปฏิเสธ
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

### Requirement: detached-authority-bash

Pi adapter SHALL รัน no-detached-authority กับทุกคำสั่ง bash ของเอเจนต์และ !/!! ของผู้ใช้

#### Scenario: authority run แบบ detach ถูกปฏิเสธ

- **WHEN** เอเจนต์รัน bash: cloop authority run demo &
- **THEN** การเรียกถูกบล็อกพร้อมบอกให้รันแบบ foreground

#### Scenario: authority run ปกติผ่าน

- **WHEN** เอเจนต์รัน bash: cloop authority run demo --help โดยไม่ detach
- **THEN** no-detached-authority ไม่บล็อกคำสั่ง

### Requirement: unknown-tool-warning

Pi adapter SHALL แนบคำเตือนครั้งเดียวต่อชื่อ tool ต่อ session เมื่อ tool ที่อยู่นอกขอบเขต guard ถูกใช้ระหว่างงานที่มี phase คุมอยู่

- งานที่มี phase คุมคือ session (หรือ parent) มี Build workspace ที่บันทึกไว้ หรือคำสั่งปัจจุบันเป็น investigate
- ไม่เตือน tool ในตัวที่ guard ดักอยู่, ls/find, background_bash และ tool ประสานงานที่ไม่แก้ไฟล์: ask_user, agent_list, agent_inbox, agent_send, agent_stop, agent_spawn, background_job, task_board, tool_guide, session_title
- คำเตือนต่อท้ายผลของ tool และไม่ทำให้ผลเป็น error

#### Scenario: MCP ระหว่าง Build ได้คำเตือน

- **GIVEN** session อยู่ใน Build
- **WHEN** เอเจนต์เรียก tool ชื่อ exa_search สองครั้ง
- **THEN** ผลครั้งแรกมีคำเตือนว่าอยู่นอก live guard
- **AND** ผลครั้งที่สองไม่มีคำเตือนซ้ำ
- **AND** ทั้งสองครั้งไม่ถูกบล็อก

#### Scenario: นอกงานไม่เตือน

- **GIVEN** session ไม่มี phase ที่บันทึกไว้
- **WHEN** เอเจนต์เรียก exa_search
- **THEN** ผลไม่มีคำเตือน

#### Scenario: tool ประสานงานไม่เตือน

- **GIVEN** session อยู่ใน Build
- **WHEN** เอเจนต์เรียก task_board
- **THEN** ผลไม่มีคำเตือน

### Requirement: session-digest

Pi adapter SHALL ส่งสรุปสถานะงานจาก session-context ให้เอเจนต์ในรอบแรกหลังเริ่ม session และหลัง compact

- แนบเป็นข้อความที่ซ่อนจากผู้ใช้ผ่าน before_agent_start ครั้งเดียวต่อ digest
- digest ล้มเหลวหรือว่างไม่บล็อก session

#### Scenario: เริ่ม session ได้ digest

- **GIVEN** มีงาน active หนึ่งงาน
- **WHEN** session เริ่มและเอเจนต์เริ่มรอบแรก
- **THEN** รอบนั้นได้ข้อความที่มีชื่องานและ next
- **AND** รอบถัดไปไม่ได้ข้อความซ้ำ

#### Scenario: หลัง compact ได้ digest ใหม่

- **WHEN** session ถูก compact แล้วเอเจนต์เริ่มรอบใหม่
- **THEN** รอบนั้นได้ digest อีกครั้ง

#### Scenario: digest ล้มเหลวไม่บล็อก

- **GIVEN** hook session-context ล้มเหลว
- **WHEN** session เริ่ม
- **THEN** Change Loop ยังพร้อมใช้และไม่มีข้อความ digest

### Requirement: dev-terminal-warning

Pi adapter SHALL ประเมินสถานะปลายทางของ /dev เมื่อเอเจนต์หยุดทำงาน และ SHALL เตือนผู้ใช้เมื่อหยุดก่อน proof ผ่านโดยไม่มีเหตุที่หยุดได้

- ใช้ตรรกะ evaluateDevTerminal เดียวกับ hook ของ Claude Code และบันทึก verdict ลง .foundation/logs/dev-terminal
- ประเมินที่ agent_settled ที่ไม่ได้ถูก abort และเฉพาะเมื่อคำสั่งปัจจุบันคือ /dev
- เป็นคำเตือนเท่านั้น ไม่สั่งให้เอเจนต์ทำต่อ

#### Scenario: หยุดก่อน proof ผ่านได้คำเตือน

- **GIVEN** /dev มีงาน active หนึ่งงานที่ยังไม่มี proof ผ่าน
- **WHEN** เอเจนต์หยุดทำงาน
- **THEN** ผู้ใช้ได้คำเตือนที่ระบุ proof-not-passing และทางไปต่อ

#### Scenario: คำสั่งอื่นไม่ถูกประเมิน

- **GIVEN** คำสั่งปัจจุบันไม่ใช่ /dev
- **WHEN** เอเจนต์หยุดทำงาน
- **THEN** ไม่มีคำเตือนและไม่มี verdict ใหม่

#### Scenario: plan-only ไม่เตือน

- **GIVEN** /dev --plan-only
- **WHEN** เอเจนต์หยุดทำงาน
- **THEN** ไม่มีคำเตือน

### Requirement: capability-truth

ตาราง capabilities และเอกสารของ Pi SHALL ระบุ sessionDigest เป็น live และ coverage เป็น partial พร้อมอธิบายว่า background_bash อยู่ในขอบเขตแต่ tool อื่นที่ไม่รู้จักได้แค่คำเตือน

#### Scenario: ตารางตรงกับเอกสาร

- **WHEN** รัน doc consistency check
- **THEN** แถว Pi ในตาราง capabilities รายงาน coverage partial และ session digest live
- **AND** hooks README แสดงค่าเดียวกัน

#### Scenario: prompt ไม่อ้างเกินจริง

- **WHEN** อ่าน system prompt ที่ adapter เพิ่ม
- **THEN** ข้อความบอกว่า tool ที่ไม่รู้จักอยู่นอก live guard และไม่อ้าง OS sandbox
