# Design

## Work type

feature

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** ใช้ชื่อ session ของ Pi (pi.setSessionName) แทนการเขียน title เอง
  - **Why:** Orca titlebar อ่านชื่อ session อยู่แล้วและเขียน title ทับทุกวินาที การเขียน title เองจะถูกทับ
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** ให้ agent อัปเดตชื่อผ่าน tool session_title แทนการสรุปด้วย model เพิ่ม
  - **Why:** agent รู้อยู่แล้วว่ากำลังทำอะไร ไม่มีค่า model เพิ่ม
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ข้ามคำสั่งและข้อความว่าง | ไม่มีการตั้งชื่อ และข้อความถัดไปที่มีเนื้อหาจะถูกใช้แทน | No separate step; the outcome is the handling | auto-name |
| ชื่อที่ผู้ใช้ตั้งไม่ถูกทับ | ชื่อยังเป็น "Mine" และ tool ตอบว่าผู้ใช้ตั้งชื่อเอง | No separate step; the outcome is the handling | agent-title-tool |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001; T002 | `pi-extensions/session-title/` (add) |
| T002 | `pi-extensions/package.json`, `pi-extensions/install.sh`, `pi-extensions/test.sh`, `pi-extensions/scripts/`, `pi-extensions/CHANGELOG.md`, `pi-extensions/README.md`, `pi-extensions/docs/` |

`+` add · `~` change · `-` remove

```text
.
└── pi-extensions/
    ├── ~ CHANGELOG.md
    ├── ~ docs/
    ├── ~ install.sh
    ├── ~ package.json
    ├── ~ README.md
    ├── ~ scripts/
    ├── + session-title/
    └── ~ test.sh
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| ตั้งชื่อจากคำสั่งแรก; ข้อความยาวถูกตัด; ไม่ทับชื่อเดิม; ข้ามคำสั่งและข้อความว่าง; agent อัปเดตชื่อ; ชื่อที่ผู้ใช้ตั้งไม่ถูกทับ; title ว่างหรือยาวเกิน; จำว่าชื่อไหน extension ตั้งหลัง reload | task check | `node --test pi-extensions/session-title/*.test.cjs` | T001 |
| ตรวจแพ็กเกจผ่าน | task check | `npm --prefix pi-extensions run check` | T002 |
