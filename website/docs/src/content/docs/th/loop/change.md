---
title: /change
description: Compile semantic draft หนึ่งชุดเป็นข้อตกลง OpenSpec ที่ validate แล้ว
---

<!-- docs-audience: agents-integrators -->
**ผู้อ่าน:** Coding agent และผู้ดูแล integration คำสั่ง CLI และ schema ด้านล่างเป็นเอกสารระบบ ไม่ใช่รายการที่ผู้ใช้ต้องทำเอง ผู้ใช้เริ่มที่ [เริ่มใช้งาน](/docs/th/quickstart/)

**พูดง่าย ๆ:** Change เปลี่ยนสิ่งที่คุณต้องการให้เป็นข้อตกลงที่เขียนไว้ก่อนมีการเขียนโค้ด
คุณบอกผลลัพธ์ด้วยคำของคุณเอง agent อ่านโค้ดแล้วร่างข้อตกลง (พฤติกรรมอะไรจะเปลี่ยน
แต่ละข้อสัญญาจะตรวจอย่างไร ไฟล์ไหนแก้ได้) harness ตรวจสอบแล้วสร้างโฟลเดอร์
`openspec/changes/<id>/` ผลที่ได้คือ proposal ให้คุณอ่านและอนุมัติ จะไม่มีการ build
จนกว่าคุณจะอนุมัติ

## สิ่งที่คุณทำ

1. **บอกสิ่งที่ต้องการ** รวมถึงข้อจำกัดและสิ่งที่ไม่ต้องการ
2. **ตอบเฉพาะคำถามที่มีแต่คุณตอบได้** agent ถามได้ไม่เกินสามการตัดสินใจที่เกี่ยวโยงกันต่อรอบ
   และไม่ถามเรื่องที่อ่านจากโค้ดได้เอง
3. **อ่านสรุปการอนุมัติ** (ดู [การอนุมัติ](/docs/th/approval/)) แล้วอนุมัติด้วยคำของคุณเอง
   เช่น "ลุยเลย" การเงียบหรือความเร่งด่วนอย่างเดียวไม่นับเป็นการอนุมัติ
4. **เปลี่ยนใจได้ตั้งแต่เนิ่น ๆ** ก่อน Build agent แก้ change เดิมได้เลย การแก้แบบเพิ่มยังคง
   การอนุมัติไว้ ส่วนการลบพฤติกรรมที่ตกลงไว้แล้วจะถามคุณอีกครั้ง หลัง Build เริ่ม
   พฤติกรรมใหม่ผ่าน amendment หนึ่งครั้ง

ขั้นถัดไป: `advance <change> --through build` (agent เป็นคนรัน)

## สิ่งที่ agent compile

ส่วนต่อจากนี้สำหรับ agent และผู้ดูแล integration คุณไม่ต้องเขียนไฟล์เหล่านี้เอง

```text
/change <intent | existing-change> [--prototype-selection <path>]
```

`/change` เปลี่ยน intent ให้เป็นข้อตกลงถาวรที่ทุก phase ถัดไปอ่าน Agent ตีความ
source และเขียน semantic draft ส่วน Change Loop derive มิติการค้น requirement
ตามความเสี่ยง ตรวจ decision frontier สร้าง bookkeeping และติดตั้งผลลัพธ์แบบ
transaction

## Draft แบบขั้นต่ำ

งานทั่วไป agent เขียนแค่ intent, ประเภทงาน, พฤติกรรมที่ต้องการ และ task
คำสั่ง `change start --template` แสดงรูปแบบนี้เป็นอันดับแรกในชื่อ `minimalDraft`
โดยมี field `save` นำหน้า: agent เขียน folder ของ draft v5 `.foundation/drafts/<id>/`
(ดูด้านล่าง) ด้วย Write tool เพราะ host ปฏิเสธ shell heredoc และ `.foundation/drafts/`
เป็น path ที่อนุญาตไว้ล่วงหน้า จากนั้นรัน `cloop change start .foundation/drafts/<id>`
`change.json` ประกาศ `version: 5` และ `workType` ซึ่งเป็นตัวเลือกหัวข้อบังคับ ส่วน
`proposal.md` เก็บเหตุผลเป็นเนื้อความ

```json
{
  "version": 5,
  "language": "en",
  "intent": "Reject empty note titles",
  "workType": ["bugfix"],
  "requirements": [{
    "description": "The system SHALL reject a note whose title is empty",
    "scenarios": [{ "when": "a user submits an empty title", "then": "the note is not created" }]
  }],
  "tasks": [{ "outcome": "Validate note titles", "verify": "npm test", "paths": ["src/note.js"] }]
}
```

Draft JSON ไฟล์เดียวที่ไม่มี `version` (`.foundation/drafts/<id>.json`) ยังเริ่มได้ในฐานะ
draft v4 พร้อมค่า default เดียวกัน

Compiler เติมที่เหลือให้เอง ได้แก่ version, key ของ requirement และ task ที่ stable,
capability (ตามที่ระบุใน `capability` ไม่เช่นนั้นเลือก spec เดิมที่ตรง หรือคืน `EDIT` เดียว
พร้อมตัวเลือก), operation (`modified` เมื่อตรงกับ requirement เดิม), หัวข้อ requirement และ
ชื่อ scenario ที่อ่านง่าย, `covers` (คืน `EDIT` เดียวเมื่อมีหลาย task และหลาย requirement
จนกำกวม), ค่า default ของ rapid และ evidence แบบ test จาก `verify` ใส่
`decisions: [{ "key", "choice", "reason"? }]` สำหรับค่า default ที่เลือกเองโดยไม่ได้ถาม
ระบบบันทึกเป็น `decidedBy: agent` draft ที่ประกาศความเสี่ยงใช้รูปแบบเต็มด้านล่าง

## Semantic draft แบบเต็ม

แกนใช้ `version: 4` (หรือ 5), `intent`, `requirements`, `tasks` ที่ระบุ `covers` และ
`evidence` ที่ใช้ requirement key เดียวกัน `discovery.coverage` เป็น optional สำหรับ change
ทั่วไป ส่วน `impact: high` และ typed risk (`riskSignals`, security trigger, integration,
external operation) เพิ่มมิติที่บังคับ มิติที่ draft เขียนไว้แล้ว (สถานะปัจจุบัน, scenario ตาม
`kind`, compatibility, contract, data model, UI state เป็นต้น) จะ derive เป็น covered ให้
และ row ที่ agent เขียนเองชนะเสมอ ใช้ `riskSignals` แทน keyword ใน prose เมื่อมี
`access-control` ให้ติด `access: allow` และ `access: deny` ใน scenario อย่างละหนึ่ง
ตัวอย่างโครงสร้างเต็มดูได้จาก `cloop change start --template`

แต่ละ scenario คือหนึ่งกรณี มี `name` สั้น ๆ, `given` (ไม่บังคับ), `when` หนึ่งเหตุการณ์,
`then` หนึ่งผลลัพธ์ และ `and` (ไม่บังคับ) `when` หรือ `then` ที่รวมหลายกรณีด้วย `;` จะถูก
ปฏิเสธ และประโยค requirement ที่ยาวให้ย้ายข้อจำกัดไปไว้ใน `details` `language` กำหนดภาษาของ
เอกสาร แต่ `SHALL`, `GIVEN`, `WHEN`, `THEN` และ `AND` คงเป็นภาษาอังกฤษเพื่อให้ OpenSpec parse ได้

`change start <draft>` ตรวจ compile และเริ่ม change ในคำสั่งเดียว แล้วแสดงไฟล์ใน packet กับ
task ถ้ายังไม่ครบจะคืนงานซ่อมของ agent หรือ decision ของผู้ใช้ไม่เกินสามข้อพร้อม resume route
โดยไม่สร้างอะไร ปัญหาที่เป็นอิสระทั้งหมดถูกรายงานพร้อมกัน และ compile ที่ล้มไม่ทิ้ง change
ครึ่งชุด `--inspect` ตรวจอย่างเดียว `--consume-draft` ลบ draft หลังเริ่ม บันทึกการอนุมัติ spec
ด้วย `advance <change> --approve-spec --decision-ref <ref>` หรือ flag เดียวกันบน
`change start`, `revise` หรือ `amend` กฎ intake ฉบับเต็มอยู่ใน `.claude/harness/lifecycle/change.md`

```bash
cloop change start .foundation/drafts/<id>.json
cloop change start .foundation/drafts/<id>   # folder ของ draft v5
```

## Folder ของ draft v5

งานใหม่ใช้ draft v5 ส่วน draft v4 แบบ JSON ยังใช้ได้ Draft v5 เป็น folder ที่
`change start <folder>` รับได้เหมือน draft แบบ JSON:

```text
.foundation/drafts/<id>/
├── change.json   # "version": 5 และ field แบบ typed ทั้งหมด
├── proposal.md   # เนื้อความที่เขียนเองใต้หัวข้อของ outline
└── design.md     # เนื้อความที่เขียนเองใต้หัวข้อของ outline
```

`proposal.md` และ `design.md` ใช้เฉพาะหัวข้อ `## ` จาก outline ที่มีเวอร์ชันชุดเดียว
เรียงตามลำดับ outline เป็นภาษาอังกฤษหรือไทยก็ได้ Harness เขียน section ที่ derive
เอง (Change header, Capabilities, Acceptance traceability, Definition of done,
Work type, File map, Test map) แล้วรวมกับเนื้อความของคุณซึ่งคงไว้ทุก byte ตามลำดับ
outline Proposal เรียงจาก why, user story, success criteria และ scope ไปจนถึง
impact และ risk, decision ที่รอ ratify และวิธี verify แล้วตามด้วย appendix ส่วน design
เรียงจาก current state และ architecture ผ่าน contract, section ตามชนิดงาน, decision,
quality, rollout ไปจนถึง test `EDIT` เดียวระบุ section ที่ outline ไม่รู้จัก, ที่ harness
derive เอง, ที่ผิดลำดับ, ที่ว่าง หรือที่มี `TODO`/`TBD` คำสั่ง `change start --template`
แสดงหัวข้อที่รับได้ใน `draftFolderV5` ส่วน status, approver, ความสดของ evidence และ
review record ไม่แสดงก่อน Land ให้อ่านด้วย `cloop changes` ลำดับและกฎ
ฉบับเต็มอยู่ใน `.claude/harness/lifecycle/change.md` หัวข้อ "Draft v5 folder and outline"

## ชนิดงาน

`workType` (ประกาศเอง หรืออนุมานจาก path ของ task) เลือก section ของ design ที่
standard change ต้องมี ถ้าขาดจะเป็น `EDIT` ของ agent ที่ระบุรูปแบบ field พร้อมตัวอย่าง
ไม่ใช่คำถามถึงผู้ใช้ ตัวอย่างบางส่วน:

| ชนิดงาน | Section ที่บังคับ |
|---|---|
| feature | `userFlow` |
| bugfix | `bugfix` |
| api | `apiContracts`, `boundaries` |
| data | `dataModel` |
| migration | `migrationPlan`, `rollout` |
| ui | `userFlow`, `uiStates`, `componentMap` |

API ที่ไม่เรียก service, queue หรือที่เก็บข้อมูลอื่นตอบ `boundaries` ด้วย `"none: <เหตุผล>"` แทนการแต่งแถวขึ้นมา

งาน docs, test และ chore ต้องมีแค่ summary งานที่ผู้ใช้มองเห็นต้องมี `releaseNote` ด้วย
hotfix ที่สร้างใหม่ (`bugfix.variant: "hotfix"`) ต้องมี regression ของ incident นั้นด้วย
คือ scenario ที่ตั้ง `regressionOf` ตรงกับ `bugfix.incident.link` ใน requirement ที่รันการตรวจได้จริง
เช่น `test` ถ้าไม่มี agent จะได้ `EDIT` และแก้ draft เอง ส่วน hotfix ที่สร้างก่อนอัปเกรดจะไม่ถูกบล็อก

งานที่เปลี่ยนพฤติกรรม (ทุกชนิดยกเว้น refactor, config, dependency, docs, test และ chore)
ต้องผูกทุก scenario กับไฟล์ test ด้วย ผ่านแถว `testMap` ที่ `scenario` ระบุถึงมัน หรือ path
ของ test ใน task ที่ cover requirement ของมัน task ที่มี `paths` เป็นโค้ด product ต้อง `verify`
ด้วยการรัน test ไม่ใช่แค่คำสั่งว่าง lint, format หรือ typecheck `change start`, `revise` และ
`amend` คืน `EDIT` เดียวที่ระบุทุก scenario ที่ยังไม่ผูกและทุก task ที่ไม่รัน test จากนั้น Prove
ตรวจว่าไฟล์ที่ผูกไว้ล้มบนโค้ดเดิม ([/prove](/docs/th/loop/prove/)) scenario ที่ตั้ง
`regression: true` ใช้กันพฤติกรรมเดิม จึงผ่านอยู่แล้วได้

ชนิดงานยังเลือก evidence capability ด้วย งานชนิด `ui` ต้องมี accessibility ซึ่งถ้าโปรเจกต์ไม่มีตัวตรวจ
ของตัวเอง ระบบใช้ตัวตรวจในตัวที่อ่าน markup ส่วนที่แก้ ส่วน skill นั้น agent เลือกเองจากคำอธิบายของ
skill ที่อ้างถึง `workType`, `riskSignals`, requirement และ scenario รายการครบทั้ง 23 ชนิดอยู่ใน
`.claude/harness/lifecycle/change.md` หัวข้อ "Work types and required sections" ส่วน capability อยู่ใน
`.claude/harness/EVIDENCE.md` หัวข้อ "Work-type capabilities"

## Decision

Decision มี `status` ได้ (`proposed`, `accepted`, `superseded` ถ้าไม่ระบุถือว่า accepted)
พร้อม driver, ตัวเลือก และ requirement ที่มันอธิบาย Decision ที่ proposed แสดงเฉพาะใต้
Decisions to ratify ของ proposal เพื่อให้คุณ ratify หรือแก้พร้อมการอนุมัติ ส่วน
`design.md` บันทึก decision ที่ accepted และ superseded Decision ที่ accepted และ
`durable: true` จะเพิ่มบรรทัด `Rationale` ใต้ requirement แต่ละข้อที่ระบุ เหตุผลจึงอยู่รอด
ผ่าน archive เข้า living spec ดู `.claude/harness/lifecycle/change.md` หัวข้อ "Decisions"

## Extension แบบมีชนิด

เพิ่มเฉพาะเมื่อจำเป็น:

- requirement หลายตัว แยก `capability` และ `operation`
- section ของ dev document: `summary`, `userFlow` (Mermaid), `failureMatrix`,
  `componentMap`, `apiContracts`, `dataModel`, `uiStates`, `configContract`,
  `jobContract`, `bugfix` หรือ `refactor` โดย harness อนุมาน `workType` จาก
  `paths` ของ task (ประกาศเองเพื่อ override ได้) และสร้าง folder tree,
  file map และ test map ให้เอง Standard change ต้องมี section ที่ชนิดงานต้องการ
  ถ้าขาดจะเป็นงานแก้ draft ของ agent ไม่ใช่คำถามถึงผู้ใช้ ข้อเท็จจริงแต่ละข้อเขียนครั้งเดียว:
  `why` ใช้แทน summary ได้ (เพิ่ม `summary` เมื่อมีอะไรมากกว่านั้น) และถ้าไม่ได้เขียน
  `failureMatrix` เอง scenario ที่มี `"kind": "failure"` จะกลายเป็นแถวของมัน
  โดย `recovery` ของ scenario (ไม่บังคับ) เติมคอลัมน์ recovery ส่วน task ที่เทสของตัวเอง
  อยู่นอก `paths` เป็น design warning
- `decisions` สำหรับมติที่มีผลต่อ implementation พร้อมผลที่ตามมา
- diagram แบบ Mermaid หรืออ้าง SVG/PNG
- `prototypeSelection` ที่ชี้ไป selection note ที่มีจริง และใส่ `excludes` ได้ (ไม่บังคับ)
  สำหรับส่วนของ prototype ที่ agreement ไม่รับ พร้อมเหตุผล เพื่อให้การตรวจภาพไม่เรียกหาส่วนนั้น
- `integrations` พร้อมแหล่ง/เวอร์ชันเอกสาร requirement ที่เกี่ยวข้อง และ concern
  ด้าน security, resilience, compatibility โดย scenario ที่เกี่ยวข้องต้องระบุ
  `"kind": "success"` และ `"kind": "failure"`
- `repositories` เมื่อแตะหลาย repo พร้อม `repository` ของแต่ละ task โดย paths และ
  verify อ้างอิงจาก root ของ repository นั้น ซึ่งเป็นที่ที่ verify รัน
- external operation เมื่อต้องใช้อำนาจภายนอก
- Grounding v3 สำหรับมติสำคัญที่ derive ไม่ได้

Prototype ไม่ใช่ proof เอกสาร integration ที่หายหรือไม่ระบุเวอร์ชันเป็น boundary
ให้ค้นคว้าหรือถามผู้ใช้ ไม่ใช่สิทธิ์ให้เดา สำหรับ `MODIFIED` compiler จะอ่าน
canonical spec แล้ว merge scenario เดิมให้ครบก่อนเพิ่มหรือแก้ ส่วน `REMOVED`
ต้องมีผลด้าน migration diagram, prototype selection หรือเอกสาร integration แบบ
local ต้อง resolve เป็นไฟล์ปกติภายใน project; directory และ symlink ที่หนีออกไปจะ
ถูกปฏิเสธ ส่วน remote source ต้องใช้ HTTPS และ version แบบคงที่ ไม่ใช่ `latest`
หรือชื่อ branch

## Artifact แบบ conditional และ source of truth

ทุก change มี `proposal.md`, `tasks.md`, `evidence.yaml` และ delta
`specs/<capability>/spec.md` ที่ Land merge เข้า `openspec/specs` (งานที่ประกาศเป็นเอกสาร
ล้วนไม่มี delta) proposal เริ่มด้วย header, scope, ตาราง acceptance traceability และ
definition of done ที่สร้างจาก policy จริง task อยู่ใน `tasks.md` เท่านั้น standard change
มี `design.md` ที่เป็น dev document เต็มด้วย ไฟล์ execution, repository, handoff และ
grounding เกิดเมื่อมี override จริงเท่านั้น label ใน flowchart ที่มี `(`, `)` หรือ `"` ต้องใส่
เครื่องหมายคำพูด เช่น `A["mean(values)"]`

มีช่องใน draft แบบไม่บังคับ 2 ช่องที่ใช้กับหน้าอนุมัติเท่านั้น: `scratch` (ข้อความ
ภาษาคน 4 บรรทัด: `get`, `asIs`, `toBe`, `ifFail`) และ `examples` (บล็อกตัวอย่าง
แบบมีชนิดที่ใช้ค่าจริง เช่น `api`, `examples`, `dataDiff`, `permission` หรือไฟล์
`prototype` ใต้ `.foundation/previews/<change>/`) ทั้งสองช่องไม่เปลี่ยน lane หรือ
packet บล็อกที่ผิดรูปจะได้ intake `EDIT` และ `change start` แค่เตือน
(`NOTE: scratch`) เมื่อ change ระดับ medium หรือ high ไม่มีตัวอย่าง ดูสิ่งที่ผู้อนุมัติ
เห็นได้ใน [การอนุมัติโดยคน](/docs/th/approval/) ส่วนรายชื่อชนิดตัวอย่างทั้ง 29 ชนิด
อยู่ใน `.claude/harness/lifecycle/change.md`

ตอน archive Land ต่อท้าย record ที่เปลี่ยนแปลงได้ไว้ใน `proposal.md` ที่ archive แล้วเท่านั้น:
Appendix: Review record, Appendix: Compliance change record (เฉพาะเมื่อ
`openspec/config.yaml` ตั้ง `compliance: change-record`) และ Appendix: Rollout gates
นอกจากนี้ยังเขียน `verification.md` ไว้ข้าง proposal ที่ archive: proof run ที่ Land
ยอมรับ และหนึ่งแถวต่อ receipt พร้อม claim, ผล, คำสั่ง และ SHA-256 สรุปหลักฐานจึงติดไปกับ Git

หลัง compile แล้ว `openspec/changes/<id>/` คือ source of truth Draft เป็นข้อมูล
ชั่วคราว และ `.foundation/` เป็น runtime state ที่ derive ได้

## แก้ข้อตกลงก่อน Build

ถ้าต้องแก้ change ที่ agreed แล้วแต่ยังไม่เริ่ม Build ให้ revise change เดิมแทนการ
abandon:

```bash
cloop change revise <change> <draft.json>
```

Draft ฉบับแก้ใช้ id เดิมและผ่าน intake gate เดียวกับ `change start` ในคำสั่งเดียว
ถ้า intake ยังไม่ครบจะแสดง action และไม่เปลี่ยนอะไร ถ้าใส่ `--merge` ไฟล์จะมีเฉพาะ key
และ entry แบบมี key ที่เปลี่ยน เพิ่ม หรือลบ (`"$remove": true`) Packet ทั้งชุด
ถูกคอมไพล์ใหม่แบบ transaction, contract revision เพิ่มขึ้น และถ้าล้มเหลวจะคืน
packet กับ runtime state เดิม เมื่อ Build มี workspace, receipt หรือ task ที่เสร็จแล้ว
คำสั่งจะชี้ไปที่ `change amend` ผลลัพธ์แสดง requirement ที่ added, revised และ
removed change ที่ approve แล้วใช้ approval เดิมต่อสำหรับ delta ที่เพิ่มหรือแก้
requirement และขอ approve ใหม่เฉพาะ delta ที่ลบ requirement

## แก้ข้อตกลงระหว่าง Build

ถ้า Build พบ observable requirement ใหม่หรือที่เปลี่ยนไป ให้ใช้ semantic amendment
หนึ่งชุด `reviseRequirements` แทน requirement เดิม (ต้องมี task ที่ยังไม่เสร็จครอบคลุม)
และ `removeRequirements` ลบ requirement พร้อม `migration`:

```bash
cloop change amend <change> <amendment.json> --consume-amendment
```

มันรักษา task ที่เสร็จแล้วและ prose ที่ไม่เกี่ยวข้อง เพิ่ม revision แล้ว validate และ rollback
เมื่อล้มเหลว ถ้าจะเปลี่ยน outcome ของ task ต้องเพิ่ม task ใหม่ ส่วน `verify` ของ task ที่เสร็จแล้ว
เปลี่ยนได้เฉพาะด้วย `reopen: true` ถ้าจะแก้ verify ของ task ที่ยังไม่เสร็จ ให้ส่งเฉพาะ
`updateTasks: [{"key", "verify", "paths"?}]` `change amend --template` แสดงทั้งสองรูปแบบ
receipt ที่ผ่านและไม่ได้รับผลจาก amendment ถูกเก็บไว้ ส่วนที่ได้รับผลจะ rerun ผ่าน Prove

`/change` ที่สำเร็จ validate และแยก workspace แล้ว ทำต่อด้วย
`cloop advance <change> --through build`
