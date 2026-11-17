# maintainer-pi-extensions

## ADDED Requirements

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
