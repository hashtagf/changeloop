---
title: การอนุมัติโดยคน
description: การตัดสินใจไม่กี่อย่างที่เป็นของคุณ เกิดเมื่อไร และจะเกิดอะไรถ้าไม่ตัดสิน ตามด้วยกลไกของ agent และ host
---

<!-- docs-audience: users -->
**ผู้อ่าน:** ผู้ใช้โปรเจกต์ อ่านหน้านี้เพื่อรู้ว่าการตัดสินใจใดเป็นของคุณ และจะเกิดอะไรถ้าไม่ตัดสิน ส่วน agent ดูแลขั้นตอนระบบตามปกติ รายละเอียดระดับคำสั่งรวมอยู่ใน [For agents and integrators](#for-agents-and-integrators)

Change Loop ไม่เคยตัดสินแทนคุณว่าคุณต้องการอะไร คุณอนุมัติ agreement ก่อนมีการสร้างอะไร
ตัดสินใจเมื่อมี trade-off จริง บอกว่าผลลัพธ์ใช่สิ่งที่ต้องการหรือไม่เมื่อกำหนดให้ต้องมี
และให้อำนาจ Land ส่วน agent และ harness บันทึกการตัดสินใจเหล่านั้นและทำงานประจำที่เหลือทั้งหมด
reviewer และ trusted host สร้างหลักฐานของตนเอง
มาที่หน้านี้เมื่อมีคำถามมาถึงคุณแล้วอยากรู้ว่ามันแปลว่าอะไร
หรืออยากรู้ว่าระบบจะไม่ขออะไรจากคุณเลย

![จุดที่การตัดสินใจของคุณอยู่ตลอด Change, Build, Prove, Land และหลัง Land และสิ่งที่ไม่ถามคุณ](/docs/diagrams/approval-th.svg)

## การตัดสินใจของคุณโดยสรุป

| การตัดสินใจ | เกิดเมื่อไร | สิ่งที่คุณพูดหรือทำ | ถ้าคุณไม่ตัดสิน |
|---|---|---|---|
| **อนุมัติ agreement** | ท้าย Change และอีกครั้งหลัง amendment ที่ลบพฤติกรรมที่เคยอนุมัติ | อ่านหน้าอนุมัติแล้วตอบ "ลุยเลย", "go ahead" หรือ "approve" หรือแก้ไข | Build ไม่เริ่ม ความเงียบและความเร่งด่วนไม่นับเป็นการอนุมัติ |
| **ตัดสิน trade-off ของ product** | เมื่อ agreement ไม่สามารถระบุความหมาย trade-off หรือขอบเขตที่กว้างขึ้นได้ | ตอบคำถามด้วยภาษาปกติ | Flow รอคำถามข้อนั้นข้อเดียว ไม่มีการเดา |
| **ยอมรับผลลัพธ์ (acceptance)** | หลัง Prove เฉพาะเมื่อ change กำหนดให้ต้องมีคนยอมรับ | บอกพร้อมชื่อของคุณว่าผลลัพธ์ใช่สิ่งที่ต้องการหรือไม่ | acceptance ที่จำเป็นยังเปิดค้างและ change รออยู่ standard change ที่ยังไม่ตัดสินจะบล็อก validation |
| **Waive gate ที่ไม่ผ่าน** | check รันแล้วไม่ผ่าน และคุณเลือกไม่แก้ | ให้เหตุผลที่ชัดเจน | ความล้มเหลวยังเป็นความล้มเหลว และ Land จะปฏิเสธ |
| **ตัดสินหลัง review ใช้รอบหมด** | รอบ review ที่อนุญาตใช้หมดแล้วแต่ยังไม่มี verdict | เลือก: human verdict, AI อีกหนึ่งรอบ หรือพัก | change หยุดรอ review ที่ใช้รอบหมดแล้วไม่เคยถูก waive |
| **ตัดสินเมื่อ UI ยังไม่ตรง prototype** | change ผูก prototype ไว้ ซ่อมครบ 2 รอบแล้วยังมีจุดที่ต่าง และ gate อื่นจบหมดแล้ว | เลือก: ซ่อมต่อ, ยอมรับความต่างพร้อมเหตุผล หรือแก้ agreement | Land ปฏิเสธ ความต่างที่ยอมรับแล้วแสดงว่าคุณยอมรับ ไม่ใช่ผ่าน |
| **อนุญาต Land** | เมื่อ change เป็น `proven` | `/land <change>` หรือบอกตั้งแต่ต้นว่า "ทำจนจบ" | ไม่มีอะไรถูก apply เข้าโปรเจกต์ `proven` ไม่ใช่ delivered |
| **อนุญาต side effect** | commit, push, เปิด PR, รัน external provider, ใช้เกิน budget | บอกตรง ๆ (`/deliver`, "push ด้วย", "ตกลง") | การกระทำนั้นไม่รัน ระบบถามไม่ได้สันนิษฐาน |
| **แก้สิ่งที่มีแต่คุณแก้ได้** | login, network หรือ disk เต็มขวางความคืบหน้า | แก้ใน environment ของคุณเอง | change คงสถานะไว้และทำต่อเมื่อคุณแก้เสร็จ |

ที่เหลือทั้งหมดเป็นของ agent หรือ harness: setup, เตรียมเครื่องมือ, ซ่อม sandbox,
sync conflict, การรอ resource ร่วม และการแก้ที่วนซ้ำ

:::caution[Land บังคับอะไรจริง ๆ]
คำสั่ง `/land <change>` ที่ตรง change ให้อำนาจสำหรับ transaction ที่กู้คืนได้
และสร้าง grant ภายในที่ผูกกับ session Land เป็นด่านบังคับเพียงด่านเดียว: จะปฏิเสธ
เว้นแต่การอนุมัติ spec ของคุณยังใช้ได้ change ถูก prove แล้ว assurance ผ่าน และ proof
ตรงกับ workspace ปัจจุบัน หลักฐานที่ขาด, stale, fail, inconclusive หรือ invalid
จะไม่ถูก Land เลย ส่วน proof ที่เก่าแล้วจะถูก prove ใหม่ก่อน Land ยังปฏิเสธเมื่อมี
target conflict, path ไม่ปลอดภัย, repository identity กำกวม หรือ transaction เสียหาย
และจะแสดง path ของ control-plane, CI หรือ secret และไฟล์ที่ change ลบก่อน apply

ก่อนถึง Land ไม่มีอะไรรอคุณนอกจากการตัดสินใจของคุณเอง: อนุมัติ spec, ความหมายของ
product หรือ trade-off, ผล acceptance, waiver, review ที่ใช้รอบหมด, UI ที่ยังไม่ตรง
prototype ที่ผูกไว้, Land, การ commit,
push หรือ side effect อื่น, budget หรือสาเหตุที่มีแต่คุณแก้ได้ (login, network, disk เต็ม)
ส่วน setup, sync conflict, การรอ resource ร่วม และการแก้ที่วนซ้ำเป็นงานของ agent หรือ harness
:::

## อนุมัติด้วยคำพูดของคุณเอง

คำตอบในแชทคือการตัดสินใจ การตอบคำถามขออนุมัติ spec หรือ amendment ว่า "ลุยเลย",
"ทำเลย", "ทำไปเลย", "go ahead" หรือ "approve" ถือเป็นการอนุมัติ agent จะบันทึกไว้และ
ไม่ถามซ้ำ การบอกตั้งแต่ต้นว่า "ทำจนจบ" หรือ "ทำให้เสร็จ" ให้สิทธิ์ Land สำหรับ change
นั้นด้วย คำเร่งอย่างเดียว ("ด่วน", "รีบ demo") และความเงียบไม่ใช่การอนุมัติ และคำขอที่
ปฏิเสธ ("อย่าเพิ่ง push") ไม่ใช่อำนาจ

Commit และ push เกิดได้เฉพาะผ่าน `/deliver` หรือคำสั่งตรงของคุณ ("commit ให้เลย",
"push ด้วย") ระหว่าง Build หรือ Prove `git commit` หรือ `git push` จาก main checkout
ที่ไม่ได้สั่งจะไม่รัน แต่กลายเป็นคำถาม และเมื่อคุณตอบตกลงจึงรันได้ "เปิด PR ให้เลย"
หรือ "open a PR" ถือเป็น `/deliver` กฎฉบับเต็มอยู่ใน `WORKFLOW.md` หัวข้อ
"Authority from the user's words"

<a id="approval-package-preview-และ-role-lane"></a>

## หน้าอนุมัติ, preview และ role lane

เมื่อเริ่ม change และอีกครั้งเมื่อ `advance` ถามขออนุมัติ spec คุณจะได้รับ path ของ
**หน้าอนุมัติ** `.foundation/previews/<change>/prototype.html` ที่ agent เขียนให้เมื่อคุณขอ
(หรือคุณเขียนเอง) หน้านี้เปิดด้วย prototype ที่คลิกได้ในหน้าตาของโปรเจกต์ แล้วตามด้วย
ข้อเท็จจริง ก่อนและหลัง เส้นทางผู้ใช้รวมทางที่พลาด กรณีพลาดพร้อมวิธีกู้คืน วิธีย้อนกลับ
และใครได้รับผลกระทบ สิ่งที่ agreement ไม่ได้ระบุเขียนว่า **ไม่ทราบ** หน้านี้ไม่มีปุ่มอนุมัติ
คุณตัดสินใจด้วยการตอบในแชท

harness คำนวณข้อเท็จจริงที่หน้าคัดลอกไปใช้และตรวจหน้ากับข้อเท็จจริงนั้น ได้แก่ ระดับความเสี่ยง
(Low ถึง Critical) technical domain และ artifact สำหรับอนุมัติแยกตามบทบาท ซึ่งมีป้าย
**proof** เฉพาะเมื่อมี receipt ที่ผ่านรองรับ งานแต่ละชนิดมีสิ่งที่ต้องแสดงของตัวเอง (ผู้ใช้เห็น
อะไร รู้ได้อย่างไรว่า bug หาย อะไรต้องคงเดิม ใครใช้สัญญานี้ ข้อมูลย้อนกลับได้ไหม พังแล้วเป็น
อย่างไร ข้อมูลของใครถูกใช้) คำตอบเป็น `none: <เหตุผล>` หรือ `unknown: <เหตุผล>` ได้เสมอ
และไม่บล็อก ส่วน change ระดับ High หรือ Critical ต้องบอกวิธีย้อนกลับ หรือบอกว่าทำไมย้อนไม่ได้
หน้าที่เก่าหรือถูกแก้แค่เพิ่มคำเตือนในคำถามอนุมัติ รายละเอียดเต็ม:
[WORKFLOW.md § Approval page](https://github.com/hashtagf/changeloop/blob/main/WORKFLOW.md#approval-package-preview-and-role-lanes)

**Preview เป็นทางเลือก** ก่อน Build agent อาจรัน provider ที่ประกาศไว้หนึ่งตัวกับสำเนาที่
ทิ้งได้ เพื่อให้เห็นพฤติกรรมเบื้องต้น preview ไม่ใช่ proof และไม่บล็อก ส่วน provider ที่ระบุ
`external: true` รันได้เฉพาะหลังคุณอนุญาตการรันครั้งนั้น

**Role lane ต้องเปิดใช้เอง** ค่าเริ่มต้นคือการอนุมัติครั้งเดียวครอบคลุมทั้ง change ถ้าตั้ง
`approval.roles` ใน `foundation.json` (ดูหัวข้อ `approval` ใน
[ตั้งค่า foundation.json](/docs/th/foundation-config/)) แต่ละ role ที่เลือกต้องอนุมัติ
revision ปัจจุบัน และ Build รอจนครบทุก lane ที่ต้องมี การอนุมัติที่ไม่ระบุ role ครอบคลุมทุก
lane และการลบ requirement จะรีเซ็ตทุก lane

## Acceptance

Acceptance คือการที่คนที่ระบุชื่อได้บอกว่าผลลัพธ์นี้คือสิ่งที่ต้องการ เป็นจุดเดียวที่พูดถึง
*ตัวผลิตภัณฑ์* ไม่ใช่ *ตัวงาน*

standard change เริ่มที่ **ยังไม่ตัดสิน และการยังไม่ตัดสินคือการบล็อก** ต้องมีคนตัดสินว่า
การตรวจแบบ deterministic คือทั้งหมดแล้ว หรือต้องมีคนดูแล้วบอกว่าใช่พร้อมเหตุผล rapid change
เริ่มที่ `not-required` และ claim ที่มี capability `acceptance` ทำให้ต้องมี acceptance
acceptance ที่ผ่านต้องมีชื่อคนจริง การตัดสิน `accept` ที่ชัดเจน เกณฑ์อย่างน้อยหนึ่งข้อ และสิ่งที่
สังเกตเห็น และจะใช้ไม่ได้ถ้า workspace, claim หรือเหตุผลเปลี่ยนทีหลัง

## Review อิสระ

Review ถามว่าการ implement นี้ดีพอไหม ผู้รีวิวเป็นคน **หรือ** AI ตัวอื่นก็ได้ สิ่งสำคัญคือ
ความเป็นอิสระ

ทุก change ได้รับ review ตาม risk tier ยกเว้น rapid change ระดับ low ที่ไม่มี security
keyword, risk signal หรือ `--review` ซึ่งพิสูจน์ด้วย test ของตัวเอง

- **low:** full review หนึ่งรอบ ถ้าต้องแก้สาระสำคัญจะเลื่อนเป็น medium
- **medium:** full review หนึ่งรอบ แก้หนึ่ง batch แล้ว delta review ได้ไม่เกินหนึ่งรอบเพื่อปิด
  finding เดิม
- **high:** ตัดสินความเสี่ยงสำคัญตั้งแต่ต้น full review หนึ่งรอบ และ delta หลังแก้ได้ไม่เกิน
  หนึ่งรอบ

หลัง AI ส่งผลครบสองรอบ Change Loop จะไม่เปิด review เพิ่มเอง ถ้ายังไม่มี verdict คุณเลือก
ได้: human verdict จากคนที่ระบุชื่อ AI อีกหนึ่งรอบพอดี หรือพัก review ที่ใช้รอบหมดไม่เคยถูก
waive เพดานนี้ไม่ได้จำกัดการแก้: agent แก้ต่อได้ตราบใดที่งานคืบหน้า reviewer ยังชี้ scope
ที่เกินมาในบรรทัดที่เปลี่ยน (abstraction ที่ไม่มีใครขอ, code ที่ตาย, guard ที่กลบอาการ) เป็น
minor เว้นแต่ทำให้สิ่งที่สัญญาไว้ผิด รายละเอียด:
[EVIDENCE.md § Review](https://github.com/hashtagf/changeloop/blob/main/.claude/harness/EVIDENCE.md#review-scope-discipline)

### เกณฑ์รีวิวของโปรเจกต์ (REVIEW.md)

เขียนความคาดหวังในการรีวิวของทีมไว้ครั้งเดียวใน `REVIEW.md` ที่ root ของโปรเจกต์
AI reviewer อ่านทุกครั้งในฐานะ **คำแนะนำ** และไม่เคยทำให้รีวิวผ่านหรือไม่ผ่านด้วยตัวเอง
การแก้ไฟล์ทำให้รีวิวเดิมหมดอายุ และการติดตั้งหรืออัปเกรดจะใส่ไฟล์ตั้งต้นเฉพาะเมื่อยังไม่มี
รายละเอียด: [เกณฑ์รีวิวของโปรเจกต์](https://github.com/hashtagf/changeloop/blob/main/.claude/harness/EVIDENCE.md#project-review-rules)

## การตัดสินใจถูกบันทึกไว้ที่ไหน

การตัดสินใจอยู่ใน change packet ไม่ใช่ใน transcript ของแชท
เหตุผลของ acceptance อยู่ในสัญญา คำตัดสินของ review อยู่ใน receipt
และการตัดสินใจให้ทำต่อถูกระบุด้วย `--decision-ref` ของมัน
กฎที่อยู่ใต้ทั้งสี่จุดคือกฎเดียวกัน **การอนุมัติไม่เคยถูกอนุมานจากความเงียบ
และการที่คำสั่งใช้ได้ ไม่เคยแปลว่าได้รับอนุญาตให้รันมัน**

## For agents and integrators

ทุกอย่างจากตรงนี้ลงไปคือกลไกที่ agent รันแทนคุณ ไม่มีส่วนไหนขอให้ผู้ใช้รันคำสั่ง

| ส่วน | เจ้าของ | ตอบคำถามอะไร |
|---|---|---|
| **Acceptance** | ผู้ใช้ตัดสินใจ; agent บันทึก | ได้ผลลัพธ์ที่ต้องการหรือไม่ และต้องให้คนยอมรับผลหรือไม่? |
| **Review** | Reviewer ที่ตั้งค่าไว้; โปรเจกต์กำหนดนโยบาย | Implementation ผ่านเกณฑ์ review หรือไม่? |
| **Authority bridge** | Agent/harness integration | คำตัดสินกลายเป็น receipt ที่ตรวจแล้วอย่างไร? |
| **Host attestation** | ผู้ดูแล trusted host | Environment ปลอดภัยพอสำหรับ sandbox ที่ไม่มีคนเฝ้าหรือไม่? |

### Recording the acceptance decision

```bash
cloop change resolve <change> --acceptance-not-required
cloop change resolve <change> \
  --acceptance-required --acceptance-reason "<ทำไมต้องให้คนตัดสิน>"
```

### Review independence and diversity

ทั้งสองเป็นคีย์นโยบายใน `foundation.json` ที่ commit ไว้ ไม่ใช่ flag บนคำสั่ง ค่าที่ให้มา
`"review": { "independence": "self" }` ให้ reviewer ใช้ identity และ session เดียวกับ
ผู้ implement ได้ (receipt บันทึก `independenceWaived: true`) ส่วน `required` บังคับให้
ต่าง identity และ session ค่าที่ให้มา `"review": { "diversity": "single-model" }` ให้
ผู้ใช้ Claude อย่างเดียวรีวิวผ่าน Claude session ใหม่ได้ ส่วน `required` บังคับให้ต่าง
provider และตระกูลโมเดล การยกเว้นแต่ละอันผ่อนเฉพาะแกนของตัวเอง และการถอนออกทำให้ receipt
ที่มันเคยอนุญาตใช้ไม่ได้ เมื่อ review ใช้รอบหมด ตัวเลือกแมปกับ `authority dispatch
--reviewer-type human` ตามด้วย `authority record`, `authority extend-review <change>
--decision-ref <user-decision>` (AI อีกหนึ่งรอบ) หรือพัก

### Gate waivers and advanced continuations

`budget continue`, `change abandon`, `change waive` และ `agents release --force`
บันทึกการตัดสินใจที่ให้อำนาจไว้ `change waive` ถอน capability ที่ fail หนึ่งตัวตามการ
ตัดสินใจที่ชัดเจน (`--revoke` คืนกลับ) ติดไปเป็น advisory `user-waived` จนถึง archive และ
ปฏิเสธถ้าจะไม่เหลือ provider ที่จำเป็น ส่วน acceptance ให้ถอนด้วย `change resolve
--acceptance-not-required` แทน

## Authority bridge

`advance --through proven` สร้างหรือ reuse authority request และไม่ poll wait ที่ไม่เปลี่ยน
review ของ Codex หรือ Claude Code ที่ตั้งค่าไว้ใช้ `authority run` named-human review ใช้
`authority dispatch` ตามด้วย `authority record` ส่วน human acceptance ใช้ request, status
และ record คำขอเปิดได้เมื่อ task เสร็จและ authority นั้นจำเป็นจริง ผูกกับ workspace hash
หมดอายุใน 24 ชั่วโมง และใช้ได้ครั้งเดียว `authority record` ตรวจคำตอบเทียบกับคำขอและรัน
validator ของ receipt ถ้าบอกว่าผ่านแต่ receipt ไม่ถูกต้อง จะคืน receipt เดิมและล้มเหลว
workspace ที่เปลี่ยนทำให้คำขอ stale `authority status --template` แสดงรูปแบบคำตอบ ผู้ใช้ไม่
ต้องเขียน receipt JSON

## Host attestation

**ไม่ใช่** การอนุมัติโดยคน แต่เป็นคำแถลงที่เซ็นด้วย Ed25519 จาก host ที่เชื่อถือได้
(`sandbox challenge` คู่กับ `doctor --unattended --attestation <file>`, nonce อายุ 10 นาที,
เล่นซ้ำไม่ได้) ว่า sandbox ปลอดภัยพอจะรันโดยไม่มีคนเฝ้า trust root เป็นไฟล์ระบบที่ root
เป็นเจ้าของ และ Change Loop ยังปฏิเสธการรันแบบไม่มีคนดูเมื่อพบ container socket ที่เขียนได้
token ของ Kubernetes service account ที่ mount ไว้ หรือ SSH agent socket ที่ mount ไว้
การตรวจพบไม่ใช่การอนุญาต
