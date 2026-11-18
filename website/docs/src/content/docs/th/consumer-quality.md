---
title: Quality gate ของโปรเจกต์
description: เพิ่ม changed-code CRAP, mutation testing, language profile, baseline และ quality debt ให้ repository เดียวหรือหลายตัว
---

<!-- docs-audience: project-maintainers -->
**ผู้อ่าน:** ผู้ดูแลโปรเจกต์และ agent ที่ได้รับอนุญาตให้ตั้งค่า หากต้องการใช้งานตามปกติ เริ่มที่ [เริ่มใช้งาน](/docs/th/quickstart/)

## ทำไมควรเปิดใช้

test ที่ผ่านไม่ได้บอกว่า code ที่ change แตะนั้นดูแลยากหรือไม่ และ test จะจับ bug จริงได้หรือเปล่า
Quality gate เพิ่มสองการตรวจเฉพาะ code ที่เปลี่ยน: **complexity เทียบกับ coverage** และ
**mutation testing** ซึ่งถามว่า test จะ fail หรือไม่เมื่อจงใจทำ code ให้พัง
ถ้าไม่มี change หนึ่งอาจ "proven" ได้ด้วย test ที่อ่อน

**ควรเปิดเมื่อ** โปรเจกต์มี test suite ที่ใช้งานได้ กำลังจะอนุมัติ change ที่เสี่ยงสูง
(security, data, logic ที่ใช้ร่วมกัน) หรืออยากได้บันทึก quality debt ที่ตรวจสอบได้
ไม่จำเป็นสำหรับ prototype ที่ทิ้งได้

**สิ่งที่คุณจะเห็น:** ตอนแรกไม่มีอะไรบล็อกคุณ Feature นี้เป็น opt-in และเริ่มต้นแบบ
**report-only** agent รัน check และ [receipt](/docs/th/glossary/) แต่ละใบบันทึกผลกับ assurance
ที่ลดลง คุณตัดสินใจเองว่าเมื่อไรจะอนุมัติ baseline และเมื่อไรจะ enforce

Change Loop orchestrate quality tool ที่โปรเจกต์เป็นเจ้าของ โดยไม่สมมติว่า metric เดียวเหมาะกับทุกภาษา
คุณตัดสินใจแค่สองเรื่อง: จะเปิดหรือไม่ และเมื่อไรจะเปลี่ยนจาก report เป็น enforce

```text
discover → preview config → ตรวจ tool → pilot report → อนุมัติ baseline → enforce
```

Quality finding เป็นหลักฐาน ไม่ใช่อำนาจแก้ code หากคะแนนสูงอยู่นอก Change ที่อนุมัติ ให้บันทึกเป็น debt โดยไม่ขยาย task หรือ repository scope

## สำหรับ agent และ integrator: check และ command

ส่วนที่เหลืออธิบายสิ่งที่ gate วัดและ command ที่ใช้รัน change ใดต้องมีหลักฐานคุณภาพ
กำหนดด้วย `quality.changeGate` ใน [`foundation.json`](/docs/th/foundation-config/)
ส่วนแต่ละ repository สร้างหลักฐานอย่างไร กำหนดใน `quality/foundation-quality.json`

## Gate วัดอะไร

**CRAP Score** รวม cyclomatic complexity กับ coverage ระดับ function:

```text
CRAP = complexity² × (1 − coverage/100)³ + complexity
```

Change Loop คำนวณคะแนนใหม่เอง ไม่เชื่อค่าที่ provider ส่งมาโดยตรง ค่าเริ่มต้นกำหนด coverage ของ changed unit code ที่ 80%, integration 70% และ critical journey 50% Function ใหม่ fail เมื่อ CRAP ตั้งแต่ 30 ขึ้นไป Function เดิม fail เมื่อแย่กว่า compatible baseline และ changed complexity เกิน 30 จะ fail เช่นกัน

**Automated mutation** ตรวจว่า test ปกติแยกแยะการเปลี่ยน code เล็ก ๆ ได้หรือไม่ เฉพาะ killed mutant ที่นับว่าผ่าน ส่วน survived, no-coverage, timeout, compile error, runtime error และ unavailable ไม่นับเป็น kill ระบบไม่สมมติว่า skipped mutant คือ equivalent การ suppress equivalent ต้องมีเหตุผลชัดเจนหรือ exception แคบที่ได้รับอนุมัติ

**Semantic mutation** ใช้ fault ที่ตรง domain เช่น ลบ tenant filter, ข้าม transaction, ไม่จัดการ returned error หรือทำ keyboard focus พัง โดยมี kill-rate threshold แยกจาก automated mutation รวม

## เริ่มอย่างปลอดภัย

Discovery อ่าน manifest กับชื่อไฟล์ แต่ไม่รัน command ของโปรเจกต์:

```bash
cloop quality discover
cloop quality init
cloop quality init --write --ci github
cloop quality doctor
```

`quality init` เป็น preview จนกว่าจะใส่ `--write` และจะสร้าง `quality/foundation-quality.json` เมื่อใช้ `--ci github` จะติดตั้ง:

- workflow changed-code แบบ reusable/manual;
- nightly inventory แบบสี่ shard; และ
- release workflow ที่ enforce full inventory

สำหรับ JavaScript/TypeScript การ discovery รองรับ package script ที่ project เป็นเจ้าของทั้ง `foundation:quality:crap` และ alias `quality:crap` โดย command ต้องสร้าง `foundation-crap-v1` ที่ `.foundation/quality/crap.json` หากไม่มี script หรือ provider ที่ตั้งค่าไว้ CRAP จะมีสถานะว่ายังไม่ได้วัด

Reusable workflow ไม่ได้มี `pull_request` trigger ในตัว ต้องเรียกจาก PR workflow เดิมของ repository และส่ง Change ID เข้าไป เพิ่มขั้น setup runtime/tool ของแต่ละภาษาก่อน `quality doctor` เพราะ Change Loop ไม่ติดตั้ง runtime หรือ quality tool ให้

รัน pilot ใน isolated workspace ของ Change:

```bash
cloop quality run --change <change-id>
cloop quality report
cloop quality run --change <change-id> --enforce
```

เมื่อ commit quality config แล้ว evidence bootstrap สามารถต่อ enforced run เป็น provider `static-analysis` Receipt จะบันทึก aggregate assurance และเก็บ per-repository report ไว้ใน command log

## โปรเจกต์พร้อมแค่ไหน

`cloop quality readiness --pretty` ให้คะแนนโปรเจกต์ตาม pyramid โดยเริ่มจากชั้นที่แข็งที่สุด: **ตัวโค้ด** (ขนาดไฟล์, การซ้อน, โค้ดที่ copy ซ้ำ, ขอบเขตโมดูล, feature map), **ตัวตรวจอัตโนมัติ** (lint, type, คอมเมนต์แก้ขัด), **เทสต์** (มีเทสต์, CRAP หรือ coverage, mutation), **เอกสาร** (บทเรียนที่เกิดซ้ำและกฎใน `quality/rule-enforcement.json` มีตัวตรวจจริง และทุกประโยค must/never/always ใน `CLAUDE.md`/`AGENTS.md` มีแถวใน registry) และ **คนรีวิว** (incident ที่ปิดแล้วทุกตัวระบุเทสต์ regression ที่มีอยู่จริง และเมื่อมี change ที่ archived แล้วอย่างน้อยสามตัว change ส่วนใหญ่ผ่าน proof รอบแรกและบั๊กหลุดน้อย) แต่ละ lane นับสองครั้ง: ครั้งแรกคือหยุดไม่ให้เพิ่ม ครั้งที่สองคือเคลียร์ของเดิมหมด สิ่งที่ยังวัดไม่ได้จะแสดงว่ายังไม่วัด ไม่นับเป็นศูนย์หรือผ่าน `cloop doctor` แสดงเปอร์เซ็นต์เดียวกันพร้อมขั้นต่อไปของชั้นที่อ่อนที่สุด และ skill `onboard` ร่างส่วนที่ขาดให้ Change Loop ให้คะแนน repo ตัวเองด้วยเกณฑ์เดียวกัน

## Language profile

| Surface | Profile | Control ที่เหมาะสม |
|---|---|---|
| JavaScript / TypeScript | `application-js-ts` | test, static, Istanbul + complexity, automated/semantic mutation |
| Go | `application-go` | `go test`, `go vet`, gocyclo + cover, mutation, compatibility, resilience |
| Python | `application-python` | pytest, static, Radon + coverage.py, mutation |
| PHP | `application-php` | Composer/PHPUnit, Clover, mutation |
| Bash | `script-bash` | test, ShellCheck/static, state identity, semantic fault |
| SQL | `database-sql` | isolated integration, compatibility, migration, performance, semantic fault |
| MongoDB | `database-mongodb` | isolated data fixture และ schema/query/migration fault |
| HTML | `web-markup` | validation, browser, accessibility evidence |
| CSS / Sass | `web-style` | lint/build, browser, accessibility, responsive evidence |

Change Loop ตั้งใจ **ไม่สร้าง CRAP ปลอม** ให้ Bash, SQL, MongoDB, HTML, CSS หรือ Sass และสถานะ unsupported, unavailable หรือ unmapped จะไม่กลายเป็นศูนย์หรือ pass

**Findings ratchet** ครอบคลุม lint, type-check, ขนาดไฟล์, ขอบเขตโมดูล, คอมเมนต์แก้ขัด, โค้ดที่ copy ซ้ำ และความลึกของการซ้อนโค้ด ระบบบันทึก finding ต่อไฟล์และต่อกฎ finding ที่มีอยู่เดิมกลายเป็น baseline ที่ลดได้อย่างเดียว finding ใหม่, ไฟล์ที่ติดตามอยู่แล้วโตขึ้น หรือไฟล์ใหม่ที่ยาวเกิน `policy.findings.fileSizeCeiling` (ค่าเริ่มต้น 1000 บรรทัด) จะ fail ก่อนมี baseline lane จะผ่านแบบ reduced assurance และบอกให้รัน `cloop quality baseline --write` การเปิด ratchet จึงไม่ทำให้ finding เดิมทั้งหมด fail พร้อมกัน ขอบเขตโมดูลประกาศว่าโฟลเดอร์ไหน import โฟลเดอร์ไหนได้ import แบบ relative ระหว่างโมดูลที่ `allow` ไม่ได้ระบุจะเป็น finding พร้อมข้อความบอกว่าโค้ดที่ใช้ร่วมกันควรย้ายไปไว้ที่ไหน:

```json
"module-boundaries": {
  "kind": "builtin", "adapter": "module-boundaries", "isolation": "read-only",
  "modules": [
    { "name": "ui", "paths": ["src/ui/**"] },
    { "name": "data", "paths": ["src/data/**"] },
    { "name": "shared", "paths": ["src/shared/**"] }
  ],
  "allow": { "ui": ["data", "shared"], "data": ["shared"] }
}
```

`workaround-comments` บันทึกคอมเมนต์ทุกบรรทัดที่มี `TODO`, `FIXME`, `HACK` หรือ `XXX` ตัวพิมพ์ใหญ่ (หรือคำว่า workaround) และ `duplication` บันทึกทุกช่วงโค้ดอย่างน้อย 8 บรรทัดที่มีเนื้อหา (`window`) ซึ่ง copy มาจากโค้ดก่อนหน้า และ `nesting-depth` บันทึกไฟล์ที่บรรทัดลึกสุดซ้อนเกิน 5 ชั้น (`maxDepth`; สแกนรายบรรทัดแบบหยาบ ไม่ใช่ parser) ทั้งหมดไม่ต้องใช้เครื่องมือของโปรเจกต์ และของที่มีอยู่เดิมเข้า baseline ได้

Discovery เพิ่ม `file-size`, `workaround-comments`, `duplication` และ `nesting-depth` ให้ทุก application profile เพิ่ม `type-check` (`tsc --noEmit`) เมื่อโปรเจกต์มี TypeScript และ `tsconfig.json` และเพิ่ม `lint` (`eslint -f json`) เมื่อมี ESLint exit code 1 ของเครื่องมือเหล่านี้คือการรายงาน finding ตัวที่ตัดสิน lane คือ ratchet ไม่ใช่ exit code

## Provider และ built-in normalizer

โปรเจกต์เป็นเจ้าของทุก command และ tool version ที่ pin ไว้ Provider แบบ `command` ส่ง Change Loop protocol ผ่าน stdout หรือ output file ส่วน `builtin` รัน command ของโปรเจกต์แล้ว normalize native report ด้วย adapter เหล่านี้:

- `javascript-istanbul`
- `go-complexity-cover`
- `python-radon-coverage`
- `php-clover`
- `canonical-functions`
- `generic-mutation-json`
- `eslint-json`, `tsc-text`, `file-size`, `module-boundaries`, `workaround-comments`, `duplication`, `nesting-depth` และ `generic-findings-json` (`foundation-findings-v1`) สำหรับ findings ratchet ถ้าใส่ input path เป็น `-` จะอ่านจาก stdout ของ command

CRAP และ mutation report ผูกกับ repository ID, commit, workspace digest, language, tool version, adapter version และ configuration digest Report จาก workspace อื่นหรือ tool config ที่ไม่ตรงจึงใช้เป็น baseline ของรอบปัจจุบันไม่ได้เงียบ ๆ

## Baseline, debt และ exception

ตรวจ pilot finding ก่อนสร้าง baseline:

```bash
cloop quality baseline
cloop quality baseline --write \
  --decision-ref ADR-42 --reason "approved pilot baseline"
```

Baseline แยก version ตาม repository และ capability การเปรียบเทียบ mutation จะ scope baseline ให้ตรง affected path ปัจจุบัน จึงไม่เอา mutant set จาก Change เก่ามาเทียบกับ Change ที่ไม่เกี่ยวกัน

สร้าง full inventory และ debt โดยไม่ขยาย Change ปัจจุบัน:

```bash
cloop quality run --full
cloop quality debt
```

Inventory ใหญ่แบ่งด้วย `--shard-index <เริ่มจากศูนย์>` และ `--shard-count <n>` Lane ถูกเลือกแบบ deterministic และ failed repository จะไม่ถูกค่าเฉลี่ยกลบ

Exception ต้องระบุ function หรือ mutant เดียว ห้าม glob และต้องมี owner, approver, risk, compensating evidence, tracking issue กับวันหมดอายุไม่เกิน 90 วัน

## ความปลอดภัยและ rollout

- Mutation ใช้ tool isolation หรือ Change sandbox; provider แบบ `harness-sandbox` ที่ไม่มี `--change` จะ unavailable
- Change Loop เปรียบเทียบ Git status ก่อนและหลัง provider หากคืน workspace ไม่เหมือนเดิม lane จะ fail
- SQL/MongoDB provider ต้องใช้ database แยกต่อ run ห้ามใช้ shared หรือ production database
- Repository ที่ถูกเลือกแต่ไม่มี quality config จะ fail closed
- Capability ที่ขาดจะลด assurance และยังแสดงอยู่ แม้ policy อนุญาต compensating evidence

คง `policy.mode` เป็น `report` อย่างน้อยสามรอบที่เป็นตัวแทน ตรวจ function/path mapping กับ false positive อนุมัติ baseline เริ่มต้น แล้วค่อยเปิด enforcement ใน PR caller ให้ nightly ดูแล full debt inventory และ release ดูแล full enforced gate
