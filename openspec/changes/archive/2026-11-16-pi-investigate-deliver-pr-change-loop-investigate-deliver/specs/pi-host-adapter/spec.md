# Pi host adapter

การเชื่อม Pi เข้ากับ Change Loop: คำสั่ง, ตัวกัน, สิทธิ์ Land และ Deliver ใน session

## ADDED Requirements

### Requirement: natural-investigate-routing

Pi adapter SHALL ส่งข้อความ interactive ที่ขึ้นต้นด้วย investigate หรือ ช่วย investigate และมีหัวข้อตามมา เข้า workflow เดียวกับ /investigate โดยใช้หัวข้อเป็นอาร์กิวเมนต์

- ข้อความจาก extension, rpc หรือ worker ไม่ถูกส่งต่อ
- investigate ที่ไม่มีหัวข้อ หรือคำว่า investigate กลางประโยค ไม่ถูกส่งต่อ

#### Scenario: Investigate ภาษาธรรมดาเข้า workflow

- **GIVEN** Pi session ที่ Change Loop พร้อมใช้งาน
- **WHEN** ผู้ใช้พิมพ์ investigate ทำไม build ช้า
- **THEN** ข้อความถูกแทนด้วยคำสั่ง investigate ของ Change Loop ที่มีหัวข้อ ทำไม build ช้า
- **AND** shell ของ agent ทำงานใน phase investigate

#### Scenario: ไม่ใช่คำขอ investigate

- **WHEN** ผู้ใช้พิมพ์ investigate เปล่า ๆ หรือ ควร investigate ไหม
- **THEN** ข้อความผ่านไปตามปกติโดยไม่ถูกแทน

#### Scenario: ข้อความที่ไม่ได้มาจากผู้ใช้

- **WHEN** extension หรือ rpc ส่งข้อความ investigate ทำไม build ช้า
- **THEN** ข้อความไม่ถูกแทน

### Requirement: natural-deliver-consent

Pi adapter SHALL ถือว่าข้อความ interactive ทั้งประโยคที่เป็นคำขอ deliver หรือเปิด PR แบบยืนยัน เท่ากับ /deliver ของ change สถานะ proven, applied หรือ archived ที่ผูกกับ session นี้

- รูปแบบที่รับ: deliver, deliver ได้เลย, deliver <change-id>, เปิด PR ให้เลย, เปิด PR ได้เลย, open a PR, open a pull request พร้อมคำลงท้าย ครับ ค่ะ นะ please ได้
- คำถาม คำปฏิเสธ ข้อความที่มีคำอื่นต่อท้าย และข้อความจาก extension, rpc หรือ worker ไม่นับ
- มี change เดียวเลือกให้เอง หลาย change ให้ผู้ใช้เลือก ไม่มีเลยแจ้งเตือนและไม่ให้สิทธิ์
- สิทธิ์ที่ได้ผูกกับ change นั้นใน session นี้ และหายเมื่อมีข้อความใหม่หรือ reload เหมือน /deliver

#### Scenario: เปิด PR ให้เลย เลือก change ของ session

- **GIVEN** session มี change สถานะ archived หนึ่งรายการ
- **WHEN** ผู้ใช้พิมพ์ เปิด PR ให้เลย
- **THEN** ข้อความถูกแทนด้วยคำสั่ง deliver ของ change นั้น
- **AND** deliver advance ของ change นั้นไม่ถูกบล็อก ส่วน change อื่นยังถูกบล็อก

#### Scenario: คำถามหรือคำปฏิเสธไม่ใช่คำสั่ง

- **WHEN** ผู้ใช้พิมพ์ เปิด PR ได้ไหม หรือ อย่าเพิ่ง deliver
- **THEN** ข้อความไม่ถูกแทนและ deliver advance ยังถูกบล็อก

#### Scenario: ไม่มี change ใน session

- **GIVEN** session ไม่มี change ที่ proven, applied หรือ archived
- **WHEN** ผู้ใช้พิมพ์ deliver ได้เลย
- **THEN** Pi แจ้งว่าไม่มี change ที่พร้อม deliver และไม่ให้สิทธิ์

#### Scenario: Worker ส่งต่อไม่ได้

- **GIVEN** Pi session เป็น worker ของ session อื่น
- **WHEN** ผู้ใช้พิมพ์ เปิด PR ให้เลย
- **THEN** Pi ปฏิเสธด้วยข้อความว่า worker deliver ไม่ได้

#### Scenario: /deliver ไม่ใส่ change-id

- **GIVEN** session มี change ที่พร้อม deliver หนึ่งรายการ
- **WHEN** ผู้ใช้พิมพ์ /deliver
- **THEN** Pi เลือก change นั้นและส่งคำสั่ง deliver ของ change นั้น

### Requirement: natural-intent-docs

ส่วน Pi ใน WORKFLOW.md, harness README และ changelog SHALL อธิบายการส่ง investigate และ deliver แบบภาษาธรรมดา

#### Scenario: เอกสารครบ

- **WHEN** maintainer อ่านส่วน Pi ใน WORKFLOW.md, harness README และ Unreleased changelog
- **THEN** ทั้งสามที่ระบุ investigate ภาษาธรรมดาและ เปิด PR ให้เลย
