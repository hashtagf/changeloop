# Design

## Work type

feature, ui

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** ไม่บันทึกคำถาม-คำตอบของ /btw ลง session
  - **Why:** ตรงกับ /btw ของ Claude และไม่ทำให้ไฟล์ session ใหญ่ขึ้น
  - **Rejected:** none
  - **Consequences:** ปิดกล่องแล้วย้อนดูคำตอบไม่ได้

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| ไม่ใส่คำถาม | แจ้งวิธีใช้ /btw <คำถาม> และไม่เรียกโมเดล | พิมพ์ /btw ตามด้วยคำถาม | btw-command |
| ไม่มีโมเดล | แจ้งว่าต้องเลือกโมเดลก่อน และไม่เรียกโมเดล | เลือกโมเดลด้วย /model | btw-command |
| โมเดลล้มเหลว | แจ้งข้อผิดพลาดและงานหลักทำต่อ | ถามใหม่อีกครั้ง | btw-isolation |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `pi-extensions/btw/index.ts` (add), `pi-extensions/btw/context.ts` (add), `pi-extensions/btw/README.md` (add), `pi-extensions/btw/btw.test.cjs` (add) |
| T002 | `pi-extensions/package.json`, `pi-extensions/install.sh`, `pi-extensions/test.sh`, `pi-extensions/README.md`, `pi-extensions/CHANGELOG.md`, `pi-extensions/docs/tools.md` |

`+` add · `~` change · `-` remove

```text
.
└── pi-extensions/
    ├── btw/
    │   ├── + btw.test.cjs
    │   ├── + context.ts
    │   ├── + index.ts
    │   └── + README.md
    ├── ~ CHANGELOG.md
    ├── docs/
    │   └── ~ tools.md
    ├── ~ install.sh
    ├── ~ package.json
    ├── ~ README.md
    └── ~ test.sh
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| ถามตอนเอเจนต์ว่าง; บริบทยาวเกิน; ไม่ใส่คำถาม; ไม่มีโมเดล; ไม่เขียนลง session; ยกเลิกระหว่างรอ; โมเดลล้มเหลว | task check | `cd pi-extensions && node --test btw/btw.test.cjs` | T001 |
| ถามตอนเอเจนต์ว่าง; บริบทยาวเกิน; ไม่ใส่คำถาม; ไม่มีโมเดล | task check | `cd pi-extensions && npm test` | T002 |
