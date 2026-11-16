# maintainer-pi-extensions

## ADDED Requirements

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
