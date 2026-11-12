---
title: คำสั่ง CLI
description: คำสั่งที่ agent ของคุณรัน จัดกลุ่มตามหน้าที่และระดับอำนาจที่ต้องใช้
---

<!-- docs-audience: agents-integrators -->
**ผู้อ่าน:** Coding agent และผู้ดูแล integration คำสั่ง CLI และ schema ด้านล่างเป็นเอกสารระบบ ไม่ใช่รายการที่ผู้ใช้ต้องทำเอง ผู้ใช้เริ่มที่ [เริ่มใช้งาน](/docs/th/quickstart/)

**พูดง่าย ๆ:** หน้านี้รวบรวมทุกคำสั่งของ `claude-foundation` (คนพิมพ์ชื่อสั้น `cloop` แทนได้) จัดกลุ่มตามว่าอ่านอย่างเดียว แก้ change ที่กำลังทำอยู่ หรือต้องได้รับอนุญาตจากคุณอย่างชัดเจน เหมาะกับ agent ผู้ทำ integration และใครก็ตามที่อยากอ่านออกว่า agent กำลังทำอะไร ต้องติดตั้ง Change Loop แล้ว ([ติดตั้ง](/docs/th/install/)) ผลที่ได้คือคำสั่งที่แน่นอน หน้าที่ของมัน และเวอร์ชัน protocol ที่ใช้ ศัพท์ที่ไม่คุ้น (change, claim, receipt, provider, capability) อยู่ใน [อภิธานศัพท์](/docs/th/glossary/)

agent ของคุณเป็นคนรันคำสั่งเหล่านี้ คุณแทบไม่ต้องรันเอง เอกสารนี้มีไว้ให้คุณอ่านออกว่า agent กำลังทำอะไร และรันเองได้เมื่ออยากรัน

ทุกคำสั่งตอบ `--help` และ `claude-foundation describe [command] [--json]` อธิบายทั้ง surface — รวม `/deliver` แบบ optional พร้อม `/changes` และ alias `/feature` เรียกได้ทั้งชื่อเปล่าและแบบ `/slash` โดยอ่านจากไฟล์คำสั่งที่ ship มาโดยตรง จึงไม่มีสำเนาที่สองให้ drift

## Surface หลักของ agent

ผู้ใช้ปกติสั่ง `/investigate`, `/change`, `/build`, `/prove`, `/land`, `/deliver`
แบบ optional หรือ `/dev` แล้ว agent เป็นเจ้าของรายละเอียด CLI โดย surface หลักมีเพียง:

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `investigate --template \| <record.json>` | ตรวจ fact และ hypothesis ที่ผูก source เก็บ resume state และสร้าง Change handoff |
| `change start --template \| <draft.json> [--inspect] [--consume-draft] [--approve-spec --decision-ref <ref> [--through <target>]]` | ตรวจ draft และถ้าครบจะ compile และเริ่ม agreement แบบ atomic ในคำสั่งเดียว; `--inspect` ตรวจอย่างเดียว; `--approve-spec` บันทึก approval ของผู้ใช้ในคำสั่งเดียวกัน |
| `change amend --template \| <change> <amendment.json> [--inspect] [--consume-amendment] [--approve-spec --decision-ref <ref> [--through <target>]]` | Inspect intake และถ้าครบจะเพิ่ม แก้ หรือลบ requirement หรือแก้ verify command ของ task ที่ยังไม่เสร็จ ระหว่าง Build แบบ transaction ในคำสั่งเดียว |
| `change amend <change> --task <task> --verify <command> [--reopen] [--reason <text>]` | แก้ verify command ที่ผิดของ task ได้ตรง ๆ โดยคง approval ไว้ (ใช้ `--reopen` กับ task ที่เสร็จแล้ว) task จะถูกรับเมื่อคำสั่งใหม่ผ่านเท่านั้น |
| `advance <change> --through build\|proven\|archived` | รัน deterministic lifecycle (evidence wiring, sandbox sync, review ที่ agent รันได้, ติ๊ก task) แล้วคืนหนึ่งในเจ็ด action (`WORKING` ระหว่างที่งานของ harness ยังทำอยู่) ที่ boundary จริง |
| `advance <change> --approve-spec [--role <role>] --decision-ref <ref>` | บันทึกการอนุมัติ spec ของผู้ใช้ (alias ของ `change resolve --approve-spec`); เมื่อตั้ง `approval.roles` ไว้ `--role` อนุมัติหนึ่ง lane และถ้าไม่ระบุจะครอบคลุมทุก lane |
| `exec <change> [--repo <id>] [--task <id>] -- <command…>` | รันและจับเวลาคำสั่ง (`checkCommand` ของ task, build หรือการรันเทสทั้งชุด) ใน sandbox ของ change: repository หรือ task ที่ระบุ ไม่เช่นนั้นใช้ directory ของผู้เรียก แล้วจึงใช้ repository ของ task ที่ค้าง ไม่รันใน checkout หลัก |
| `deliver advance <change>` | หลังสั่ง `/deliver` อย่างชัดเจน ให้ harness ทำ isolated commit, push feature branch, เปิด/ใช้ PR เดิม, ตรวจผ่าน provider และคืน URL |
| `changes` | อ่าน active state และ route ถัดไป |
| `doctor …` | วิเคราะห์เฉพาะเมื่อ coordinator ขอ |

`claude-foundation help` แสดง surface ขนาดเล็กนี้ ส่วน `help --all` เพิ่มคำสั่ง
recovery, administration และ host integration ด้านล่าง

## อ่านอย่างเดียว

รันได้ทุกเมื่ออย่างปลอดภัย ไม่แก้อะไรทั้งสิ้น ยกเว้น `package` ที่เขียนไฟล์ HTML
แบบอ่านอย่างเดียวของตัวเอง

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `changes` | แสดง change ที่ active สถานะ lifecycle และ action ถัดไปของแต่ละตัว |
| `current` | แสดง change ที่ active เพียงตัวเดียวพร้อมสถานะและคำสั่งถัดไป ถ้าไม่มีหรือมีหลายตัวจะแสดงรายการตัวเลือกแล้วจบด้วย exit code ไม่ใช่ศูนย์ ขณะที่มี change active เพียงตัวเดียว `advance`, `packet`, `metrics`, `feedback` และ `package` เว้น `<change>` ได้ ส่วน flag ของ Land และการอนุมัติต้องระบุ id ชัดเจนเสมอ |
| `doctor [--stage change\|build\|prove] [--change <id>]` | วินิจฉัยความพร้อมของโปรเจกต์ provider และ lifecycle |
| `packet <change> [--phase <phase>] [--repo <id>] [--task <id>]` | อ่าน handoff ของ operation ปัจจุบัน |
| `metrics <change>` | ดูการใช้งาน ประสิทธิผล semantic intake งบ ต้นทุน และเวลาการรันที่วัดได้ |
| `package <change> [--pretty]` | พิมพ์ข้อมูลอนุมัติของ change เป็น JSON (ระดับความเสี่ยงพร้อมเหตุผล technical domain, artifact แยกตามบทบาทผู้อนุมัติพร้อมป้าย proof/preview/none, บรรทัดสรุป, สิ่งที่หน้าอนุมัติต้องแสดงและ prototype ครอบคลุมข้อไหน, หน้าถูกแก้หรือข้อเท็จจริงล้าสมัยหรือไม่ และ suggested preview สำหรับ High/Critical) ไม่เขียนไฟล์และไม่เปลี่ยนสถานะ lifecycle ตัวหน้าอนุมัติ agent หรือผู้ใช้เขียนเอง ไม่มี skill ส่งมาให้ |
| `feedback <change>` | อธิบายเวลา reviewer, repair ที่มีหลักฐาน, human wait และเวลาที่ยังระบุไม่ได้ พร้อม reuse และ action ถัดไป |
| `change audit <change>` | ตรวจความเชื่อมโยงของ scenario claim task และ provider |
| `handoff status <change>` | ดู operation ที่ต้องสิทธิ์ภายนอกและผลต่อ Land |
| `handoff list [--open] [--owner <team>] [--environment <env>] [--json]` | ดู operational obligation ข้าม active และ archived change |
| `handoff packet <change> [--id <H00n>]` | อ่าน packet ที่ไม่มี credential สำหรับ DevOps/SRE owner |
| `repos [change]` | ดู topology และการเลือกรีโป |
| `models` | ดูนโยบาย model tier |
| `providers` | ดูการต่อสายหลักฐานระหว่างนิยาม change contract |
| `version` | พิมพ์เวอร์ชันแพ็กเกจที่ติดตั้งอยู่ |
| `describe [command] [--json]` | อธิบาย slash command และคำสั่ง CLI ทุกคำสั่งตอบ `--help` ได้ด้วย |
| `outcomes [--pretty]` | สรุป change ที่ archive แล้ว: จำนวนรอบ proof, ผ่านตั้งแต่ proof แรกไหม, การตัดสินใจของผู้ใช้, ค่าใช้จ่ายที่รู้ และ defect ที่หลุดตามที่แจ้งไว้ |
| `lessons [--min-changes <n>] [--pretty]` | รวม code ของ blocker และ review ที่เกิดซ้ำในอย่างน้อย `n` change (ค่าเริ่มต้น 3) เป็นข้อเสนอ check ถาวรแบบแนะนำสำหรับ `/change` |

## Consumer quality

ดูการตั้งค่า language profile, baseline และ rollout policy ที่
[Quality gate ของโปรเจกต์](/docs/th/consumer-quality/)

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `quality discover [--change <id>]` | อ่าน manifest แล้วรายงานภาษา profile provider และ capability ที่ไม่รองรับ โดยไม่รัน command ของโปรเจกต์ |
| `quality init [--change <id>] [--write] [--force] [--ci github]` | preview consumer quality config แล้วเขียน config/ตัวอย่าง GitHub workflow เมื่อสั่งชัดเจน |
| `quality doctor [--change <id>] [--enforce]` | ตรวจ repository ที่เลือก, provider config, executable ที่พร้อมใช้ และ mutation isolation |
| `quality run [--change <id>] [--repo <id>] [--capability <name>] [--full] [--shard-index <n> --shard-count <n>] [--enforce]` | รัน lane แยก repository และใช้ changed-code หรือ full-inventory ratchet |
| `quality report` | อ่าน summary ล่าสุดแบบไม่เฉลี่ยกลบ repository |
| `quality baseline [--repo <id>] [--capability <name>] [--write --decision-ref <ref> --reason <why>]` | preview หรืออนุมัติ versioned CRAP/mutation baseline อย่างชัดเจน |
| `quality debt` | สร้าง debt แบบ JSON/Markdown จากรอบล่าสุดโดยไม่ขยาย Change scope |

## วงจรชีวิตของ change

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `investigate --template \| <record.json>` | พิมพ์หรือตรวจ investigation record แล้วคืน typed action หนึ่งรายการ |
| `change start --template \| <draft.json> [--inspect] [--consume-draft] [--approve-spec --decision-ref <ref> [--through <target>]]` | ตรวจและถ้าครบจะ compile และเริ่ม agreement จาก semantic draft (ไฟล์ JSON หรือ folder ของ draft v5) ในคำสั่งเดียว โดยพื้นที่แยกจะสร้างภายหลังใน Build; `--approve-spec` บันทึก approval ของผู้ใช้ในคำสั่งเดียวกัน |
| `change amend --template \| <change> <amendment.json> [--inspect] [--consume-amendment] [--approve-spec --decision-ref <ref> [--through <target>]]` | Inspect intake และถ้าครบจะเพิ่ม แก้ หรือลบ semantic requirement หรือแก้ verify command ของ task ที่ยังไม่เสร็จ แบบ transaction และรักษางานที่เสร็จแล้ว ในคำสั่งเดียว |
| `change amend <change> --task <task> --verify <command> [--reopen] [--reason <text>]` | แก้ verify command ของ task ที่ยังไม่เสร็จหนึ่งตัวโดยไม่ต้องเขียน amendment JSON claim, capability และ approval คงเดิม คำสั่งที่ผ่านเสมอจะถูกปฏิเสธ และ `--reopen` เอาเครื่องหมายเสร็จของ task ที่เสร็จแล้วออกเพื่อให้ต้องผ่านใหม่ |
| `change revise <change> <draft.json> [--merge] [--inspect] [--consume-draft] [--approve-spec --decision-ref <ref> [--through <target>]]` | ก่อน Build ตรวจและถ้าครบจะคอมไพล์ semantic draft ฉบับแก้ทับ change id เดิมในคำสั่งเดียว พร้อม rollback และแสดง requirement delta (ใช้ approval เดิมต่อ เว้นแต่มีการลบ requirement) `--merge` รับเฉพาะ key และ entry ที่มี key ซึ่งเปลี่ยน |
| `change resolve <change> …` | บันทึกการตัดสินใจเรื่อง impact coupling security และ review |
| `change validate <change>` | ตรวจ change และ evidence contract ที่รันได้ |
| `preview <change> --provider <name> [--decision-ref <ref>] [--pretty]` | ทางเลือก ใช้ได้เฉพาะก่อน Build: คัดลอก target ไปที่ `.foundation/previews/<change>/workspace` (ไม่มี Git และ harness state) รัน provider ที่ประกาศไว้หนึ่งตัวในนั้น แล้วบันทึก receipt `kind: "preview"` ซึ่งไม่นับเป็นหลักฐานของ Prove หรือ Land และไม่บล็อก approval หรือ Build; provider ที่เป็น `external: true` ต้องมี `--decision-ref` ของผู้ใช้ ไม่เช่นนั้นถูกปฏิเสธด้วย `PREVIEW_AUTHORITY_REQUIRED` |
| `sandbox create <change> [--all]` | สร้างพื้นที่ Build ที่แยกออกมา |
| `sandbox sync <change>` | ซิงก์การแก้ข้อตกลงที่ตั้งใจเข้าไปใน Build |
| `advance <change> [--through build\|proven\|archived] [--host-result <result.json>]` | Coordinator ปกติของ model รัน deterministic step ที่ปลอดภัยแล้วคืน bounded action หนึ่งตัว |
| `handoff record <change> --id <H00n> …` | บันทึก accepted/completed/rejected/cancelled/superseded พร้อม durable reference |

## การต่อสายหลักฐาน

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `evidence verify-ci <change> <provider> <signed.json>` | ตรวจ provenance ของ CI ที่เซ็นและผูกกับ workspace ของ provider |
| `hash <change> [provider]` | พิมพ์ workspace hash ที่ CI envelope แบบเซ็นต้องผูกไว้ |

## อำนาจจากภายนอก

การรีวิวและการยอมรับที่ทำต่อข้าม session ได้ ปกติใช้ `advance`; ใช้คำสั่ง
เหล่านี้โดยตรงเมื่อตรวจวิเคราะห์หรือทำ integration ที่ตั้งใจไว้

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `authority request <change> --type review\|acceptance` | สร้างคำขอภายนอกที่ทำต่อได้ |
| `authority status <change> [--request <id>] [--template]` | ดูสถานะ `--template` ออกไฟล์คำตอบให้กรอก |
| `authority dispatch <change> …` | reserve full/delta packet ที่แน่นอนเมื่อส่งให้ AI หรือ named human review |
| `authority run <change> …` | รัน AI reviewer ที่ตั้งค่าไว้แบบ read-only/ephemeral และบันทึก session จริง |
| `authority abort <change> …` | ปิด request ที่ใช้ต่อไม่ได้โดยไม่อ้างว่า dispatched attempt เสร็จแล้ว |
| `authority record <change> --request <id> --response <file>` | ตรวจคำตอบที่ผูกกับ host แล้วบันทึกเป็นหลักฐาน |
| `evidence record <change> <provider> <status> …` | ทางเชื่อมระดับล่างสำหรับหลักฐานที่สังเกตจากภายนอก |

:::caution
`evidence record` เป็นทางเชื่อมระดับล่าง **ไม่ใช่** ขั้นตอนกู้คืนแบบโต้ตอบตามปกติ มันปฏิเสธ receipt ที่ผ่านของ provider ทุกตัวที่ harness เป็นคนรัน
:::

## Primitive ภายใน

`advance` ทำ readiness และการรัน Prove (`proof readiness|advance|run|collect`),
การต่อสายหลักฐาน (`evidence detect|init|doctor`), budget checkpoint และทุกขั้นของ
Land (`land check|advance|archive|recover|resume|plan`, `sandbox apply`) เอง
primitive เหล่านี้เป็นของภายใน: ซ่อนจาก `help` และ `describe` ยัง dispatch ได้สำหรับ
harness และเทส และ runtime จะไม่ส่งเป็น route ให้ agent ใช้
`advance <change> --through proven|archived` เพื่อรัน และ `advance <change> --inspect`
เพื่ออ่าน action ถัดไป

## การส่ง pull request แบบ optional

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `deliver advance <change>` | Composition command เดียวสำหรับ archived change โดย harness เป็นเจ้าของ readiness, isolated worktree, projection guard, PR-standard rendering, commit, push, provider read-back, retry และ resume |

ถ้าไม่เรียก `/deliver` จะไม่สร้าง delivery directory, งาน evidence เฉพาะ PR หรือ
gate เพิ่ม ถ้า change prove แล้วแต่ยังไม่ archive การเรียก `/deliver` ถือเป็นอำนาจ
Land ด้วย harness จะ Land ผ่าน `advance --through archived` แล้วส่งต่อ คำสั่งนี้ไม่อนุญาต force-push, push เข้า default branch, merge, deploy,
publish หรือแก้ product และสำเร็จได้เมื่อ provider ยืนยันว่า base, head กับ commit
ของ PR ที่เปิดอยู่ตรงกับ delivery receipt เท่านั้น

## การกู้คืนและทางออกฉุกเฉิน

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `sandbox create <change> --all` | ซ่อม binding แบบหลาย repository ที่หายในจุดเดิม โดยรักษา worktree เดิมที่ยังใช้ได้ |
| `advance <change> --decision <option> --decision-fingerprint <hash> --decision-ref <ref> --reason <approach>` | บันทึกคำตอบของผู้ใช้ต่อ decision ของ `advance` (`retry`, `wait`, `pause`, `merge` หรือ `retain` ตามที่เสนอ) แล้วทำต่อจาก target เดิม |
| `advance <change> --through archived --restore-target <paths> [--decision-ref <ref>]` | คืน path ของ target ที่ชนกันกลับเป็น base ของ sandbox ภายใน Land ถ้าไม่ใช่ artifact ที่สร้างใหม่ได้ต้องมีการตัดสินใจของผู้ใช้ |
| `advance <change> --through archived --recover-apply settle\|keep-current\|restore-backup --decision-ref <ref>` | ปิด apply ของ Land ที่ถูกขัดจังหวะตามการตัดสินใจของผู้ใช้ แล้วทำต่อ |
| `advance <change> --undo-land --decision-ref <ref>` | ย้อน Land ที่ archive แล้วซึ่ง diff ยังไม่ commit โดยปฏิเสธและไม่เขียนอะไรถ้า HEAD ขยับ หรือ path ที่ Land เขียนถูก stage หรือแก้ไขหลัง Land |
| `change abandon <change> --reason <r> --decision-ref <ref>` | กัก change ที่พิสูจน์ไม่ได้ |
| `change waive <change> --capability <c> --reason <r> --decision-ref <ref>` | ถอนการบังคับใช้ capability หนึ่งตัวหลัง provider ของมันรันแล้วล้มเหลว `--revoke` คืนข้อบังคับ |
| `budget continue <change> --reason <r> --decision-ref <ref>` | ขยายหน้าต่างแบบ explicit (optional) เพราะ budget ที่หมดจะต่อให้อัตโนมัติ |
| `authority reset-infra <change> --decision-ref <ref> [--reviewer <id>]` | เปิดให้ส่ง AI review ได้อีกครั้ง หลังใช้สิทธิ์ retry จากปัญหา infrastructure ของ reviewer หมดและ `doctor` ผ่านแล้ว |
| `authority extend-review <change> --decision-ref <ref>` | อนุญาต AI review เพิ่มอีกหนึ่งรอบ หลังส่งครบทุกรอบที่กำหนดแล้ว |
| `authority reset-base-move <change> --decision-ref <ref>` | คืนสิทธิ์ของ review ที่ผ่านแล้วแต่หมดอายุเพราะ base ของ sandbox ขยับ เพื่อให้ review ใหม่ที่บังคับรันไม่ใช้โควตาจนหมด |
| `agents release <change> <task> --owner <id> [--lease-id <id>] [--force]` | ปล่อย lease โดย generation ที่ถูก takeover ต้องใช้ lease id ที่ acquire มา และ `--force` ใช้ยึดคืนจากเจ้าของที่ crash |

คำสั่งที่ต้องใส่ `--decision-ref` ต้องการ **การตัดสินใจของผู้ใช้ที่ host บันทึกไว้อย่างชัดเจน** runtime จะไม่รับดุลพินิจของ agent มาแทน

## การดูแลระบบ

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `init [target-path] [--host claude\|cursor\|opencode\|codex\|pi] [--yes]` | ติดตั้งหรืออัปเกรด Change Loop ในโปรเจกต์ `--host` เพิ่ม adapter ของ host นั้น |
| `help [--all]` | คำสั่งหลัก `--all` รวม route ที่เก็บไว้เพื่อความเข้ากันได้ |
| `dashboard [-up\|-status\|-down]` | จัดการ client แสดงสถานะทีม (ตัวเลือกเสริม) |
| `update check [--refresh] [--json]` | แสดงประกาศรุ่น stable ล่าสุด ไม่อัปเดตให้เอง |
| `dashboard snapshot --json` | พิมพ์ข้อมูล dashboard ของโปรเจกต์นี้แบบอ่านอย่างเดียว |

## การเชื่อมกับ host

ใช้โดย host adapter (Pi, OpenCode และอื่นๆ) และ Build แบบขนาน ผู้ใช้ไม่ต้องเรียกเอง

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `host agent-contract [--protocol 1] [--format json]` | คืน agent contract ที่มากับแพ็กเกจ |
| `host instruction <command> [--protocol 1] [--format json] [--arguments <text>]` | คืนคำสั่ง workflow หนึ่งตัวที่มากับแพ็กเกจ เช่น `/change` |
| `agents plan <change> [--group <n>] [--full]` | วางแผนแจกงานที่ตรวจสอบแยกกันได้ให้ทำขนานกัน |
| `agents dispatch <change>` | คืนงาน Build ถัดไปตาม graph และ lease โดยไม่เรียก model |
| `agents acquire <change> <task> --owner <id>` | จอง lease ของ task |
| `telemetry sync <change> [transcript.jsonl]` | ซิงก์ usage ของ request จาก host |
| `telemetry import <change> <file> [--format <format>]` | นำเข้า usage ที่เชื่อถือได้จาก host |
| `telemetry host-import <change> <result.json>` | นำเข้าผลการรันของ host ที่ตรวจแล้ว พร้อมจำนวนครั้ง, model ที่ใช้จริง และ fallback |
| `sandbox challenge <change>` | สร้าง challenge อายุสั้นสำหรับอำนาจแบบ unattended ที่เซ็นแล้ว |

## เวอร์ชันของ protocol

`advance <change> --inspect` อ่าน action ถัดไปโดยไม่ทำงานต่อ และใช้ร่วมกับ
`--through` หรือ `--host-result` ไม่ได้ ส่วน `packet <change> --resume`
คืน references ของ agreement, task frontier, lease และ evidence ล่าสุดภายใน
ขนาดที่กำหนด ต้องอ่าน references ต่อเมื่อ section ถูกระบุว่า truncated
`feedback <change> --diagnostics` ส่งออก metadata ในเครื่องที่ผ่าน allowlist
และใช้ alias ของ provider โดยไม่รวม path, command หรือ payload แบบข้อความอิสระ
Build/Prove ที่จบแสดง `TARGET_REACHED`; archived แล้วจึงแสดง `DELIVERED`
Feedback ตรวจ validity จาก runtime ปัจจุบัน ส่วน proof ที่ dashboard เคยบันทึกไว้
ยังเป็น unverified หากตรวจ freshness ของ workspace ปัจจุบันไม่ได้

สัญญาที่มองเห็นจากภายนอกถูกตรึงไว้ใน `.claude/harness/protocol.json` การติดตั้งที่ปนกันหลายรุ่นจะล้มเหลวทันทีตอนโหลด แทนที่จะไปพังกลางทาง Land

| Pin | v3.7.0 |
|---|---|
| runtime | 3.7.0 |
| runtime API | 42 |
| semantic draft schema | 5 |
| semantic intake state schema | 2 |
| semantic amendment schema | 1 |
| artifact defaults schema | 2 |
| grounding schema | 1, 2, 3 |
| advance protocol | 6 |
| provider protocol | 13 |
| evidence schema | 2 |
| packet schema | 12 |
| proof protocol | 7 |
| review protocol | 4 |
| acceptance protocol | 2 |
| semantic acceptance protocol | 1 |
| attestation protocol | 1 |
| authority protocol | 2 |
| quality capabilities protocol | 1 |
| CRAP protocol | 1 |
| automated mutation protocol | 1 |

:::note
provider protocol 13 หมายความว่า receipt ที่บันทึกด้วย protocol ก่อนหน้าจะอ่านได้เป็น `provider-version-stale` และต้องพิสูจน์ใหม่ เพราะ receipt เก่าบอกไม่ได้ว่ามันผ่าน semantic-acceptance protocol 1 หรือไม่
:::
