# Design

## Work type

feature

## Decisions

- **Decision ID:** DEC-001
  - **Status:** accepted
  - **Decision:** รวมสาม extension เป็นแพ็กเกจเดียว @hashtagf/pi-extensions
  - **Why:** agent-team, ask-user และ background-bash import กันเอง แยกแพ็กเกจต้อง refactor ใหญ่
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-002
  - **Status:** accepted
  - **Decision:** คงไฟล์ .cjs สองบรรทัดที่ re-export .ts ไว้
  - **Why:** worker ที่ spawn ด้วย Node ตรง ๆ, เทสต์ และ pi-team-webui เรียกใช้อยู่ ไม่ใช่โค้ดซ้ำจริง
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-003
  - **Status:** accepted
  - **Decision:** เปลี่ยน event ของ ask-user เป็น pi-extensions:ask-user:*
  - **Why:** ป้องกันชนกับแพ็กเกจอื่นตามแนวทาง rpiv:* และยังไม่มีผู้ใช้ event ชื่อเดิม
  - **Rejected:** none
  - **Consequences:** Not stated in the draft
- **Decision ID:** DEC-004
  - **Status:** accepted
  - **Decision:** ไฟล์ config อยู่ที่ $XDG_CONFIG_HOME/pi-extensions/config.json หรือ ~/.config/pi-extensions/config.json
  - **Why:** ตรงกับแพ็กเกจอื่นใน gallery และ env var เดิมยังใช้ได้
  - **Rejected:** none
  - **Consequences:** Not stated in the draft

## ตารางความล้มเหลว

| Failure | User sees | Recovery | Covers |
|---|---|---|---|
| แพ็กเกจของ host อยู่ใน dependencies | การตรวจล้มและระบุชื่อแพ็กเกจที่ต้องย้ายไป peerDependencies | ย้ายแพ็กเกจไป peerDependencies ด้วยช่วง * | package-manifest |
| ไฟล์ใน pi.extensions หายไป | การตรวจล้มและระบุ path ที่หาไม่พบ | No separate step; the outcome is the handling | package-manifest |
| มีไฟล์เทสต์หลุดเข้า tarball | การตรวจล้มและแสดงชื่อไฟล์นั้น | No separate step; the outcome is the handling | pack-contents |
| ลืมเพิ่มหัวข้อ version ใหม่ | การตรวจล้มและบอกให้เพิ่มหัวข้อ ## [0.2.0] | No separate step; the outcome is the handling | changelog-version |
| เรียก API ที่ไม่มีอยู่ | tsc รายงาน error | No separate step; the outcome is the handling | typecheck |
| เอกสารล้าสมัย | การตรวจล้มและบอกให้รัน npm run docs | รัน npm run docs แล้ว commit ไฟล์ใหม่ | tool-docs |
| JSON เสีย | ได้ค่าเริ่มต้นพร้อมคำเตือน และไม่ throw | No separate step; the outcome is the handling | ask-user-config |

## แผนที่ไฟล์

| Tasks | Paths |
|---|---|
| T001 | `pi-extensions/package.json` (add), `pi-extensions/package-lock.json` (add), `pi-extensions/LICENSE` (add), `pi-extensions/CHANGELOG.md` (add), `pi-extensions/scripts/pack-check.mjs` (add), `pi-extensions/scripts/pack-check.test.cjs` (add) |
| T002 | `pi-extensions/tsconfig.json` (add), `pi-extensions/agent-team/`, `pi-extensions/background-bash/`, `pi-extensions/scripts/typecheck.test.cjs` (add) |
| T002; T003 | `pi-extensions/ask-user/` |
| T004 | `pi-extensions/scripts/tool-docs.mjs` (add), `pi-extensions/scripts/tool-docs.test.cjs` (add), `pi-extensions/docs/` (add), `pi-extensions/README.md`, `pi-extensions/ask-user/README.md` |

`+` add · `~` change · `-` remove

```text
.
└── pi-extensions/
    ├── ~ agent-team/
    ├── ~ ask-user/
    │   └── ~ README.md
    ├── ~ background-bash/
    ├── + CHANGELOG.md
    ├── + docs/
    ├── + LICENSE
    ├── + package-lock.json
    ├── + package.json
    ├── ~ README.md
    ├── scripts/
    │   ├── + pack-check.mjs
    │   ├── + pack-check.test.cjs
    │   ├── + tool-docs.mjs
    │   ├── + tool-docs.test.cjs
    │   └── + typecheck.test.cjs
    └── + tsconfig.json
```

## แผนที่ test

| Scenario | Level | Check | Task |
|---|---|---|---|
| Manifest ถูกต้อง; แพ็กเกจของ host อยู่ใน dependencies; ไฟล์ใน pi.extensions หายไป; เนื้อหา tarball ถูกต้อง; มีไฟล์เทสต์หลุดเข้า tarball; version ตรงกัน; ลืมเพิ่มหัวข้อ version ใหม่ | task check | `node --test pi-extensions/scripts/pack-check.test.cjs && node pi-extensions/scripts/pack-check.mjs` | T001 |
| โค้ดปัจจุบันผ่าน typecheck; เรียก API ที่ไม่มีอยู่ | task check | `npm --prefix pi-extensions run typecheck && node --test pi-extensions/scripts/typecheck.test.cjs && bash pi-extensions/test.sh` | T002 |
| ปิด bell จาก config; ไม่มีไฟล์ config; JSON เสีย; ค่าผิดชนิด; bridge ภายนอกตอบผ่านชื่อใหม่; ชื่อเดิมไม่มีผล | task check | `node --test pi-extensions/ask-user/*.test.cjs` | T003 |
| เอกสารตรงกับโค้ด; เอกสารล้าสมัย | task check | `node --test pi-extensions/scripts/tool-docs.test.cjs && node pi-extensions/scripts/tool-docs.mjs --check` | T004 |
