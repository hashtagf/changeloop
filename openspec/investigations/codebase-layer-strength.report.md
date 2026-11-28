<!-- change-loop:generated-investigation-report:v1 -->
# รายงานการสำรวจปัญหา: codebase-layer-strength

**สถานะ:** ข้อสรุปปัจจุบัน

อัปเดต: 2026-11-28T16:16:07.598Z · 6a53a83ef39425c644f93f5e97b970f5385b1db84a4da95722e8ebaf48217ba1

## ปัญหา

ชั้น Codebase ของ pyramid readiness ได้ 100% แต่ยังเชื่อไม่ได้: เกณฑ์โกงได้ วัดแค่ระดับไฟล์ ไม่มีแนวคิด data domain และ architecture ไม่ได้ถูกวัดตามลำดับ ต้องการยกระดับให้ตรวจจริง ให้คะแนนตรง และช่วยให้ agent ทำงานเร็วและถูกขึ้น ทั้งใน repo นี้และ repo ผู้ใช้

## ความต้องการและบริบทที่บันทึกไว้

**เป้าหมาย:** ชั้น Codebase วัดจากบนลงล่าง: data domain → architecture → code architecture → โค้ดระดับไฟล์/ฟังก์ชัน ด้วยเกณฑ์ที่มีหลักฐานวิจัยรองรับ และโกงด้วยการตั้งค่าหลวมไม่ได้

**ผลลัพธ์ที่ต้องการ:** ข้อเสนองานเดียว (change) ที่ครอบ 5 ช่องว่างเดิม + data domain + architecture พร้อม repo ตัวอย่างที่รู้คำตอบล่วงหน้าเป็นตัวพิสูจน์


### ผู้เกี่ยวข้อง

- maintainer
- consumer agent
- consumer project owner

### ขอบเขต

- pyramid readiness codebase criteria
- findings ratchet lanes
- module-boundaries lane
- feature map
- onboard skill
- repository-findings scope
- golden fixture repository

### ข้อกำหนดล่าสุด

- **r1@1** [behavior / stated] เกณฑ์ codebase ต้องมีค่าขั้นต่ำ (floor) ที่โปรเจกต์ตั้งหลวมกว่าไม่ได้ ถ้าหลวมกว่า ข้อนั้นเป็น unmet ไม่ใช่ met; ที่มา: user (u-scope)
- **r2@1** [behavior / stated] วัดระดับฟังก์ชัน (ความยาว, cognitive complexity), วงจร import ระหว่างโมดูล และโค้ดที่ไม่มีใครใช้; ที่มา: user (u-scope)
- **r3@1** [behavior / stated] ทุกไฟล์ source ต้องมี feature เป็นเจ้าของใน feature map; ที่มา: user (u-scope)
- **r4@1** [behavior / stated] repo นี้ตรวจ scripts/ และไฟล์เทสต์ด้วย หนี้เดิมเข้า baseline; ที่มา: user (u-scope)
- **r5@1** [behavior / stated] หาโค้ดซ้ำแบบ Type-2 (เปลี่ยนชื่อตัวแปร/ค่าคงที่) และมี golden fixture repo ที่ใส่ข้อบกพร่องทีละชั้นแล้วคะแนนต้องลดตรงชั้นนั้น; ที่มา: user (u-scope)
- **r6@1** [behavior / stated] มีแนวคิด data domain: แต่ละ domain เป็นเจ้าของข้อมูล (entity/table/collection/schema) ของตัวเอง โมดูลอื่นเข้าผ่าน API ของ domain นั้นเท่านั้น และตรวจได้; ที่มา: user (u-scope)
- **r7@1** [behavior / stated] architecture ถูกวัดก่อน code architecture: มี module boundary ที่มีทิศทาง (ไม่ใช่ allow ทุกทิศ) และไม่มีวงจรระหว่างโมดูล; ที่มา: user (u-scope)

### สาระจากบทสนทนา

- **u-scope** [user]: ทำครบทั้ง 5 ข้อ; ต้องมี concept ของ data domain ที่ดี มี architecture ที่ดี ตามด้วย code architecture ที่ดี และหา research เพิ่มในการพัฒนา software (answer to question 3e9d8a2d)
- **u-design** [user]: data domain เพิ่มใน feature map; ทุกภาษาแบบประมาณ + ใช้เครื่องมือถ้ามี; floor ชุดมาตรฐาน (ไฟล์ ≤1000, ฟังก์ชัน ≤80, cognitive ≤15, nesting ≤5, duplication window ≤8, ไม่มีวงจร); บังคับแบบ ratchet เหมือน lane เดิม (answer to question 291faa27)

## ข้อสรุปปัจจุบัน

ชั้น Codebase ตอนนี้วัดแค่ 'ไม่แย่ลง' ระดับไฟล์ ไม่มี data domain และ module boundary ที่ร่างให้ผู้ใช้อนุญาตทุกทิศรวมถึงวงจร งานวิจัยรองรับว่าโค้ดสุขภาพดีลด defect ~15 เท่าและทำให้ AI แก้ได้ถูกกว่า วงจร dependency เพิ่มการเปลี่ยนแปลงรอบข้าง และ agent พลาดบ่อยที่การเลือกฟังก์ชัน แนะนำทางเลือก A: จัดชั้น codebase ใหม่เป็นลำดับ data domain → architecture → code architecture → code พร้อม floor ที่โกงไม่ได้ และ golden fixture เป็นตัวพิสูจน์ ประโยชน์ต่อความเร็ว/ความถูกของ agent ยังพิสูจน์ล่วงหน้าไม่ได้ ต้องวัดหลังส่งมอบด้วย cloop outcomes (first-proof pass, repair rounds) อย่างน้อย 3 งานต่อฝั่ง

## ข้อเสนอแนะและเหตุผล

ชั้น Codebase ของ pyramid readiness วัดตามลำดับ data domain → architecture → code architecture → code: โปรเจกต์ประกาศ data domain และข้อมูลที่แต่ละ domain เป็นเจ้าของ, module boundary ต้องมีทิศทางและไม่มีวงจร, ทุกไฟล์ source มี feature เป็นเจ้าของ, วัดความยาวและ cognitive complexity ระดับฟังก์ชัน, dead code และ Type-2 duplication, เกณฑ์ทุกข้อมี floor ที่ตั้งหลวมกว่าไม่ได้, repo นี้ขยายการตรวจไป scripts/ และไฟล์เทสต์ และมี golden fixture repo ที่ใส่ข้อบกพร่องทีละชั้นแล้วคะแนนลดตรงชั้นนั้น

## ข้อเท็จจริงที่มีแหล่งอ้างอิง

- **lane-met-is-ratchet-only:** เกณฑ์ codebase แบบ lane นับ met เมื่อ lane ถูกตั้งค่า รัน และเทียบ baseline ได้ (ratcheting) ไม่ตรวจว่าเพดานที่โปรเจกต์ตั้ง (file-size ceiling, maxDepth, duplication window) เข้มพอ; ค่าที่ตั้งได้มีแค่ขั้นต่ำทางเทคนิค (maxDepth ≥ 2, window ≥ 4, ceiling ≥ 1) ([.claude/harness/runtime/quality/pyramid-readiness.mjs](<../../.claude/harness/runtime/quality/pyramid-readiness.mjs>), [.claude/harness/runtime/quality/code-health-findings.mjs](<../../.claude/harness/runtime/quality/code-health-findings.mjs>), [.claude/harness/runtime/quality/findings-ratchet.mjs](<../../.claude/harness/runtime/quality/findings-ratchet.mjs>))
- **ceilings-differ:** เพดานขนาดไฟล์ไม่ตรงกัน: policy ผู้ใช้ 1000 บรรทัด, lint ratchet ของ repo นี้ 1500 (baseline ปัจจุบันใช้ sizeCeiling ของตัวเอง) ([.claude/harness/runtime/quality/quality-policy.mjs](<../../.claude/harness/runtime/quality/quality-policy.mjs>), [scripts/lint/ratchet.mjs](<../../scripts/lint/ratchet.mjs>))
- **file-level-only:** nesting เป็นค่าระดับไฟล์ (บรรทัดที่ลึกที่สุด) จากการสแกนวงเล็บ/ย่อหน้า ไม่มีการวัดความยาวหรือความซับซ้อนต่อฟังก์ชัน, ไม่มีการตรวจ dead code ([.claude/harness/runtime/quality/code-health-findings.mjs](<../../.claude/harness/runtime/quality/code-health-findings.mjs>))
- **duplication-type1:** duplication เทียบหน้าต่าง 8 บรรทัดที่ตัดช่องว่างแล้ว = Type-1 เท่านั้น คัดลอกแล้วเปลี่ยนชื่อตัวแปร (Type-2) ตรวจไม่เจอ ([.claude/harness/runtime/quality/code-health-findings.mjs](<../../.claude/harness/runtime/quality/code-health-findings.mjs>), [openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **boundary-draft-allows-all:** module-boundaries lane ของผู้ใช้รองรับเฉพาะ JS/TS; ร่างจาก onboard อนุญาตทุกทิศที่โค้ดมีอยู่แล้ว รวมถึงวงจร (วงจรถูกแสดงเป็นคำถามแต่ไม่บังคับ) จึงนับ met ได้ทั้งที่ไม่มีทิศทางสถาปัตยกรรม ([.claude/harness/runtime/quality/module-boundary-proposal.mjs](<../../.claude/harness/runtime/quality/module-boundary-proposal.mjs>), [.claude/harness/runtime/quality/findings-ratchet.mjs](<../../.claude/harness/runtime/quality/findings-ratchet.mjs>), [.claude/harness/runtime/quality/source-scan.mjs](<../../.claude/harness/runtime/quality/source-scan.mjs>))
- **repo-architecture-strong:** repo นี้มี architecture check ที่มีทิศทางจริง: 7 domain (composition, contracts, core, evidence, observability, quality, workflow) และตาราง ALLOWED ชั้นบนลงล่าง พร้อมตรวจ workflow layer, re-export และ domain ที่ไม่ได้ประกาศ ([.claude/tests/harness/architecture-check.mjs](<../../.claude/tests/harness/architecture-check.mjs>), [scripts/quality/repository-findings.mjs](<../../scripts/quality/repository-findings.mjs>))
- **repo-scope-narrow:** lint ratchet ของ repo นี้สแกนแค่ .claude/harness (ไม่ recursive), runtime, adapters, hooks และข้าม tests/test/fixtures; scripts/ และไฟล์เทสต์ไม่ถูกวัดขนาด/ซ้ำ/nesting ([scripts/lint/ratchet.mjs](<../../scripts/lint/ratchet.mjs>))
- **feature-map-no-coverage:** การตรวจ feature map ดู id, name, summary, paths มีอยู่จริง แต่ไม่ตรวจว่าไฟล์ source ทุกไฟล์ถูก feature ใดอ้างถึง และไม่มีฟิลด์ domain/ข้อมูลที่ feature เป็นเจ้าของ ([.claude/harness/runtime/workflow/validation/project-feature-map.mjs](<../../.claude/harness/runtime/workflow/validation/project-feature-map.mjs>))
- **no-data-domain:** ไม่มีแนวคิด data domain ใน quality runtime, feature map หรือ onboard skill: ไม่มีที่ประกาศว่า entity/table/collection ใดเป็นของ domain ใด และไม่มีการตรวจว่าโมดูลอื่นเข้าถึงข้อมูลตรง ([.claude/harness/runtime/quality/pyramid-readiness.mjs](<../../.claude/harness/runtime/quality/pyramid-readiness.mjs>), [.claude/harness/runtime/workflow/validation/project-feature-map.mjs](<../../.claude/harness/runtime/workflow/validation/project-feature-map.mjs>))
- **research-code-health-defects:** Code Red (39 codebase, 30,737 ไฟล์): โค้ดคุณภาพต่ำมี defect มากกว่า 15 เท่า ใช้เวลาแก้ issue มากกว่า 124% และ cycle time สูงสุดยาวกว่า 9 เท่า ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-ai-friendly:** Borg et al. 2026 (5,000 ไฟล์ Python): AI refactor โค้ด unhealthy แล้วเทสต์พังมากกว่า healthy อย่างมีนัยสำคัญใน 5 จาก 7 โมเดล (ต่างกัน 8.6–15.1 จุด) ส่วน Sonnet และ Claude agent ต่างไม่มีนัยสำคัญ (2.7 และ 1.4 จุด) ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-cycles:** Oyetoyan et al. 2015: class ในวงจรและเพื่อนบ้านตรงของวงจรมีโอกาสเปลี่ยนสูงขึ้น; ใน 75% ของระบบเพื่อนบ้านของวงจรเปลี่ยนบ่อยอย่างมีนัยสำคัญ และใน Ant คิดเป็น 94% ของปริมาณการเปลี่ยนแปลงทั้งหมด ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-clone-types:** Type-2 clone ตรวจได้โดย tokenize แล้วแทน identifier และ literal ด้วย token กลาง ก่อนเทียบลำดับ token ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-cognitive-complexity:** Cognitive Complexity (SonarSource) วัดความยากในการเข้าใจระดับฟังก์ชัน ต่างจาก cyclomatic ที่วัดจำนวน test path และไม่มีประโยชน์เหนือระดับ method ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-dead-code:** knip หา dead code โดยเดินกราฟ import จาก entry file; ไฟล์/export/dependency ที่ไม่ถูกเข้าถึงคือไม่ได้ใช้ ต้องรู้ entry point จึงจะแม่น ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-data-isolation:** modular monolith: แต่ละโมดูลเข้าถึงเฉพาะ table ของตัวเอง ไม่แชร์ table, join ได้เฉพาะภายในโมดูล, โมดูลอื่นใช้ public API; ตรวจได้ด้วย architecture test (เป็นแหล่งรอง ควรเสริมด้วย Evans DDD) ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **research-agent-localization:** RepoNav 2026 (LocBench 560 ตัวอย่าง): 44–58% ของความผิดพลาดระดับฟังก์ชันเกิดหลัง agent เจอไฟล์ถูกแล้วแต่เลือกฟังก์ชันผิด; การให้ดูโครงสร้างไฟล์ช่วยเพิ่ม accuracy ([openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>))
- **readiness-ignores-thresholds:** pyramidReadiness รับแค่สถานะ lane (ratcheting) และจำนวน findings ไม่รับค่าเพดาน: ทดลองส่ง lane 4 ตัว ratcheting + findings 0 + feature map 1 feature ได้ codebase 100% (9/9) ไม่ว่าโปรเจกต์ตั้งเพดานเท่าใด ([.claude/harness/runtime/quality/pyramid-readiness.mjs](<../../.claude/harness/runtime/quality/pyramid-readiness.mjs>))

## สมมติฐานและหลักฐาน

- **floors-stop-gaming — มีหลักฐานสนับสนุน:** คะแนน codebase ปัจจุบันโกงได้ด้วยเกณฑ์หลวม เพราะ readiness ไม่รับค่าเพดานเป็น input เลย; หลักฐาน: readiness-ignores-thresholds, lane-met-is-ratchet-only

## ทางเลือกและข้อแลกเปลี่ยน

### A-ordered-codebase

แบ่งชั้น codebase เป็น 4 ลำดับย่อย (data domain → architecture → code architecture → code) ใน readiness, เก็บทุกอย่างใน policy/feature map เดิม, ใช้ตัววิเคราะห์ภายในที่ไม่ต้องติดตั้งอะไร (token-based) และใช้เครื่องมือภาษา (knip, vulture, staticcheck) เมื่อโปรเจกต์มีอยู่แล้ว

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### B-tools-only

ให้โปรเจกต์ติดตั้งเครื่องมือภายนอก (dependency-cruiser, jscpd, knip, sonar) แล้ว Change Loop อ่านผล

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### C-split-changes

แยกเป็นหลาย change ตามลำดับ: floors+repo scope ก่อน แล้ว data domain/architecture แล้ว function-level/dead code/Type-2

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

## การตัดสินใจ

- **scope — ตัดสินใจแล้ว:** งานยกระดับชั้น Codebase ครอบคลุมอะไร
  ตัวเลือก: ครบ 5 ข้อ + data domain + architecture + code architecture ที่มีงานวิจัยรองรับ; ข้อเสนอแนะและเหตุผล: ผู้ใช้เลือกเอง; หลักฐาน: ยังไม่ได้บันทึก
- **design — ตัดสินใจแล้ว:** รูปแบบ data domain, ภาษา, floor และการบังคับ
  ตัวเลือก: feature map domains; ทุกภาษาแบบ token + เครื่องมือภาษาถ้ามี; ชุดมาตรฐาน; ratchet; ข้อเสนอแนะและเหตุผล: ผู้ใช้เลือกตามคำแนะนำทั้ง 4 ข้อ; หลักฐาน: ยังไม่ได้บันทึก

## สิ่งที่ยังไม่รู้และงานที่เหลือ

ยังไม่ได้บันทึก

## แหล่งอ้างอิง

- [.claude/harness/runtime/quality/code-health-findings.mjs](<../../.claude/harness/runtime/quality/code-health-findings.mjs>)
- [.claude/harness/runtime/quality/findings-ratchet.mjs](<../../.claude/harness/runtime/quality/findings-ratchet.mjs>)
- [.claude/harness/runtime/quality/module-boundary-proposal.mjs](<../../.claude/harness/runtime/quality/module-boundary-proposal.mjs>)
- [.claude/harness/runtime/quality/pyramid-readiness.mjs](<../../.claude/harness/runtime/quality/pyramid-readiness.mjs>)
- [.claude/harness/runtime/quality/quality-policy.mjs](<../../.claude/harness/runtime/quality/quality-policy.mjs>)
- [.claude/harness/runtime/quality/source-scan.mjs](<../../.claude/harness/runtime/quality/source-scan.mjs>)
- [.claude/harness/runtime/workflow/validation/project-feature-map.mjs](<../../.claude/harness/runtime/workflow/validation/project-feature-map.mjs>)
- [.claude/tests/harness/architecture-check.mjs](<../../.claude/tests/harness/architecture-check.mjs>)
- [openspec/investigations/codebase-layer-strength.md](<codebase-layer-strength.md>)
- [scripts/lint/ratchet.mjs](<../../scripts/lint/ratchet.mjs>)
- [scripts/quality/repository-findings.mjs](<../../scripts/quality/repository-findings.mjs>)

## ขั้นตอนถัดไป

พร้อมเสนอ Change โดยยังต้องมีเจตนาของผู้ใช้

The investigation is source-grounded and has a terminal conclusion.

คำสั่งที่ agent ใช้ทำต่อ:

```text
cloop investigate openspec/investigations/codebase-layer-strength.json
```

