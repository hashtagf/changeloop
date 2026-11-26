# Design

## สถานะปัจจุบัน

.claude/settings.json ship permissions.allow 22 กฎ ไม่มี permissions.deny และ install.sh merge เฉพาะ allow

## Work type

bugfix

## Bugfix analysis

| ส่วน | รายละเอียด |
|---|---|
| วิธีทำให้เกิดซ้ำ | ใน Claude Code ที่ติดตั้ง Change Loop รัน find . -delete หรือ git diff --output=x ไม่ถูกถามสิทธิ์ |
| สาเหตุที่แท้จริง | กฎ allow แบบ prefix ไม่แยก flag ที่เขียนหรือลบไฟล์ และไม่มีกฎ deny ที่ ship |
| หลักฐาน regression | installer test ตรวจว่าชุด deny ที่ ship ครบ, ถูก merge ทั้ง fresh/upgrade/rerun, opt-out ไม่แตะ และ matcher แบบ glob ปฏิเสธคำสั่งอันตรายแต่ไม่ปฏิเสธคำสั่งอ่านปกติ |

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** ship permissions.deny แทนการลบ Bash(find *) จาก allow
  - **Why:** upgrade ต่อท้ายกฎเท่านั้น กฎ allow เก่ายังอยู่ในโปรเจกต์ที่ติดตั้งแล้ว ส่วน deny ชนะ allow
  - **Rejected:** none
  - **Consequences:** ปิดช่องทั้งโปรเจกต์ใหม่และเดิมเมื่อ upgrade
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** ใช้ * ติดกับ flag เช่น find *-delete*
  - **Why:** จับทั้งกรณีมีและไม่มี path
  - **Rejected:** none
  - **Consequences:** ชื่อไฟล์ที่มีคำว่า -delete ถูกปฏิเสธจาก allowlist ผู้ใช้ยังรันได้โดยอนุมัติเอง

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| find ลบไฟล์ถูกปฏิเสธ | แต่ละคำสั่งตรงกับกฎใน permissions.deny | No separate step; the outcome is the handling | headless-read-deny |
| git เขียนไฟล์ถูกปฏิเสธ | แต่ละคำสั่งตรงกับกฎใน permissions.deny | No separate step; the outcome is the handling | headless-read-deny |

## ความเสี่ยง

- การจับรูปแบบเป็นของ host ไม่ได้ทดสอบกับ Claude Code จริง test ใช้ matcher แบบ glob ที่ให้ * ตรงกับข้อความใดก็ได้

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `.claude/settings.json`, `install.sh`, `.claude/tests/harness/run-installer-tests.sh`, `website/docs/src/content/docs/install.md`, `website/docs/src/content/docs/th/install.md`, `CHANGELOG.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   ├── ~ settings.json
│   └── tests/
│       └── harness/
│           └── ~ run-installer-tests.sh
├── ~ CHANGELOG.md
├── ~ install.sh
└── website/
    └── docs/
        └── src/
            └── content/
                └── docs/
                    ├── ~ install.md
                    └── th/
                        └── ~ install.md
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| find ลบไฟล์ถูกปฏิเสธ; git เขียนไฟล์ถูกปฏิเสธ; คำสั่งอ่านยังผ่าน; upgrade ใส่ deny ให้โปรเจกต์เดิม; opt-out ไม่แตะ deny; คำสั่ง headless ที่พิมพ์ออกมา | task check | `sh .claude/tests/harness/run-installer-tests.sh` | T001 |
