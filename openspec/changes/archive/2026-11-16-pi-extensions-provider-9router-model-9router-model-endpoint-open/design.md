# Design

## Work type

feature

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** ใช้ pi.registerProvider แบบ ProviderConfig พร้อม api openai-completions และ refreshModels
  - **Why:** 9router พูด OpenAI Chat Completions อยู่แล้ว จึงใช้ stream ของ Pi เองได้ทั้งหมด ไม่ต้องเขียน stream ใหม่ตามคำแนะนำใน custom-provider.md
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** provider id คือ 9router และ model id คงตามที่ 9router ส่งมา เช่น 9router/kr/claude-sonnet-4.5
  - **Why:** ชื่อ model ตรงกับที่เห็นใน dashboard ของ 9router และส่งต่อถึง router ได้ไม่ต้องแปลง
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-003
  - **Status:** accepted
  - **Decision:** ลำดับ baseUrl: env NINEROUTER_BASE_URL, แล้ว nineRouter.baseUrl ใน ~/.config/pi-extensions/config.json, แล้ว http://localhost:20128/v1
  - **Why:** 9router ของผู้ใช้รันอยู่ที่เครื่องอื่น ต้องตั้ง URL ได้โดยไม่แก้โค้ด และใช้ไฟล์ config เดียวกับ ask-user
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-004
  - **Status:** accepted
  - **Decision:** ถ้ามี env NINEROUTER_API_KEY ใช้ค่านั้น ถ้าไม่มีไม่ตั้ง apiKey เพื่อให้ผู้ใช้เก็บ key ผ่าน /login
  - **Why:** key ไม่ต้องอยู่ในไฟล์ config ที่อ่านได้ทั่วไป และ Pi เก็บ key จาก /login ใน auth.json ให้อยู่แล้ว
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-005
  - **Status:** accepted
  - **Decision:** เมื่อ 9router ไม่ส่ง context_length หรือ max_completion_tokens ใช้ 128000 และ 16384 ตามลำดับ
  - **Why:** เป็นค่าที่ปลอดภัยต่อ compaction ของ Pi ดีกว่าเดาสูงเกินจน request ล้ม
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ค่าใน config ไม่ใช่ URL | baseUrl กลับเป็นค่าเริ่มต้น และมีคำเตือนที่ไม่มี API key อยู่ในข้อความ | No separate step; the outcome is the handling | provider-registration |
| key ผิด | throw error ที่บอกสถานะ 401 และ URL ของ /models โดยไม่มีค่า key อยู่ในข้อความ | ตั้ง NINEROUTER_API_KEY หรือ /login ด้วย key จาก dashboard ของ 9router | model-discovery |
| router ติดต่อไม่ได้หรือตอบผิดรูปแบบ | throw error ที่บอก URL และสาเหตุ ไม่ใช่คืน model ปลอม | No separate step; the outcome is the handling | model-discovery |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `pi-extensions/nine-router/` (add) |
| T002 | `pi-extensions/package.json`, `pi-extensions/package-lock.json`, `pi-extensions/tsconfig.json`, `pi-extensions/install.sh`, `pi-extensions/test.sh`, `pi-extensions/scripts/pack-check.mjs`, `pi-extensions/scripts/pack-check.test.cjs`, `pi-extensions/docs/`, `pi-extensions/README.md`, `pi-extensions/CHANGELOG.md` |
| T003 | `pi-extensions/nine-router/test/` (add) |

`+` add · `~` change · `-` remove

```text
.
└── pi-extensions/
    ├── ~ CHANGELOG.md
    ├── ~ docs/
    ├── ~ install.sh
    ├── + nine-router/
    │   └── + test/
    ├── ~ package-lock.json
    ├── ~ package.json
    ├── ~ README.md
    ├── scripts/
    │   ├── ~ pack-check.mjs
    │   └── ~ pack-check.test.cjs
    ├── ~ test.sh
    └── ~ tsconfig.json
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| ใช้ URL จาก env; ใช้ URL จากไฟล์ config; ไม่มีการตั้งค่าเลย; ค่าใน config ไม่ใช่ URL; ดึงรายชื่อสำเร็จ; ไม่อนุญาต network; key ผิด; router ติดต่อไม่ได้หรือตอบผิดรูปแบบ; ยกเลิกระหว่างดึง | task check | `node --test pi-extensions/nine-router/*.test.cjs` | T001 |
| ตรวจแพ็กเกจครบ; install dry-run | task check | `npm --prefix pi-extensions run check && bash pi-extensions/install.sh --dry-run \| grep -q nine-router` | T002 |
| คุยผ่าน server จำลอง | task check | `node --test pi-extensions/nine-router/test/*.test.cjs` | T003 |
