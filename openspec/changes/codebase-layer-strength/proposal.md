# Change: ชั้น Codebase วัดจาก data domain ถึงฟังก์ชัน และโกงไม่ได้

- **Change:** `codebase-layer-strength` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-28

## สรุป

คะแนนชั้น Codebase ของ quality readiness จะเชื่อได้: วัดตั้งแต่ data domain, ทิศทางสถาปัตยกรรม, เจ้าของฟีเจอร์ จนถึงฟังก์ชัน และตั้งเกณฑ์หลวมเพื่อเอาคะแนนไม่ได้อีก

## เหตุผล

[Data] ตอนนี้ชั้น Codebase นับผ่านเมื่อไม่แย่กว่า baseline: ทดลองแล้วได้ 100% โดยไม่ดูเพดานเลย และวัดแค่ระดับไฟล์ ไม่มี data domain และขอบเขตโมดูลที่ร่างให้ผู้ใช้อนุญาตทุกทิศรวมทั้งวงจร
[Data] งานวิจัย: โค้ดสุขภาพต่ำมี defect 15 เท่าและใช้เวลาแก้ +124% (Code Red); AI refactor โค้ดสุขภาพต่ำพังบ่อยกว่า 8.6–15 จุดใน 5/7 โมเดล; วงจร dependency เพิ่มการเปลี่ยนแปลงรอบข้าง; 44–58% ของความผิดพลาดของ agent คือเจอไฟล์ถูกแต่เลือกฟังก์ชันผิด
[Assumption] ประโยชน์ต่อความเร็วและความถูกของ agent ใน Change Loop จะวัดหลังส่งมอบด้วย cloop outcomes

## User story

- **P1** ในฐานะ ผู้ดูแลโปรเจกต์ ฉันต้องการ คะแนนชั้น Codebase ที่ตั้งค่าหลวมเพื่อเอาคะแนนไม่ได้ เพื่อ เชื่อคะแนนได้ Requirement: codebase-floors, golden-fixture.
- **P1** ในฐานะ coding agent ฉันต้องการ รู้ว่าข้อมูลและโค้ดของฟีเจอร์อยู่ domain ไหน เพื่อ แก้ถูกที่และไม่แตะข้อมูลข้าม domain Requirement: data-domains, feature-ownership, ordered-codebase-layer, domain-invariants, api-contracts, reference-implementations, shared-sdk.
- **P2** ในฐานะ coding agent ฉันต้องการ เห็นวงจร import ฟังก์ชันที่ยาวหรือซับซ้อน dead code และโค้ดซ้ำ เพื่อ โค้ดใหม่ไม่เพิ่มหนี้ Requirement: directed-architecture, function-metrics, dead-code, type2-duplication, approximate-languages.
- **P3** ในฐานะ ผู้ดูแล Change Loop ฉันต้องการ repo นี้ใช้มาตรฐานเดียวกับผู้ใช้ เพื่อ เครื่องมือพิสูจน์ตัวเอง Requirement: repository-scope.

## เกณฑ์ความสำเร็จ

- golden fixture: ใส่ข้อบกพร่องทีละชั้นย่อยแล้วคะแนนลดเฉพาะข้อของชั้นนั้น ครบทุกข้อของชั้น Codebase
- ตั้งเพดานหลวมกว่า floor ข้อใดข้อหนึ่ง readiness รายงานข้อนั้นเป็น unmet
- repo นี้ผ่าน default gate และ readiness ชั้น Codebase แสดงค่าจริงหลังขยายขอบเขต โดยหนี้เดิมอยู่ใน baseline
- หลังส่งมอบ cloop outcomes เทียบ first-proof pass และ repair rounds เมื่อมีงานฝั่งละ ≥3 งาน

## ขอบเขต

- ร่างนี้ครอบ 5 ช่องว่างที่ผู้ใช้เลือก และ data domain, architecture, code architecture
- หนี้เดิมเข้า baseline ไม่บล็อกงาน; โค้ดใหม่ที่แย่ลงทำให้ Prove ไม่ผ่านแบบ ratchet เดิม

- **อยู่ในขอบเขต (`codebase-quality`):** feature map รับ domains (ข้อมูลที่เป็นเจ้าของ, API สาธารณะ, ฟีเจอร์ในโดเมน); lane ใหม่: data-domains, import-cycles, feature-ownership, function-size, cognitive-complexity, dead-code; duplication จับ Type-2 (เปลี่ยนชื่อตัวแปร/ค่าคงที่); readiness ตรวจเกณฑ์ขั้นต่ำและเรียงชั้น Codebase เป็นลำดับย่อย; repo นี้ตรวจ scripts/ และไฟล์เทสต์ด้วย; golden fixture พิสูจน์คะแนนต่อชั้น; feature map domains รับ invariants, contract, references และ sdks; lane domain-invariants, api-contracts, reference-implementations, shared-sdk
- **นอกขอบเขต:** สิ่งที่ไม่ทำ (Non-goals) ด้านล่าง

## Non-goals

- ไม่เปลี่ยนชั้น static, verification, prose, review
- ไม่บังคับติดตั้งเครื่องมือภายนอก
- ไม่ล้างหนี้เดิมในงานนี้ หนี้เดิมเข้า baseline
- ไม่ใช้ parser เต็มรูปของแต่ละภาษา การวัดในตัวเป็นค่าประมาณ

## ผลกระทบและความเสี่ยง

- โปรเจกต์ที่ตั้งเพดานหลวมกว่า floor จะเห็นคะแนน Codebase ลด นี่คือพฤติกรรมที่ตั้งใจ และ next step บอกวิธีแก้
- ตัววัดในตัวเป็นค่าประมาณ อาจมี false positive; baseline ดูดซับของเดิม และ adapter เครื่องมือภาษาใช้แทนได้

ความเสี่ยงปานกลาง: แตะส่วนที่ฟีเจอร์อื่นใช้ร่วม จึงต้องตรวจส่วนนั้นด้วย

- **Impact:** medium
- **Coupling:** coupled
- **Affected surfaces:** code
- **Security triggers:** none detected

## สิ่งที่ต้องตัดสินใจและคำถามที่ยังเปิด

- **tests-first-stays:** ข้อเทสต์ 4 ข้อ (มีเทสต์, verify, เสถียร, เร็ว) ยังเป็น next step แรกเมื่อยังไม่ผ่าน ส่วนในชั้นอื่นทั้งหมด ชั้น Codebase มาก่อนและเรียงตามลำดับย่อย — หลักฐานเดิมว่าการรันเทสต์ช่วย agent มากที่สุด; Codebase เป็นฐานของทุกชั้นอื่น. ผลที่ตามมา: โปรเจกต์ที่ยังไม่มีเทสต์จะเห็น next เป็นเรื่องเทสต์ก่อนเรื่อง domain

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

quality readiness วัดชั้น Codebase ตามลำดับ data domain → architecture → code architecture → code พร้อมเกณฑ์ขั้นต่ำที่ตั้งหลวมกว่าไม่ได้ และ lane ใหม่: domain, cycles, feature ownership, function size, cognitive complexity, dead code และโค้ดซ้ำแบบเปลี่ยนชื่อ; domains ใน feature map ประกาศกฎธุรกิจ (invariants) ที่ต้องมีเทสต์, สัญญา API, ตัวอย่างอ้างอิง และ SDK กลางที่ห้ามข้าม

## วิธีตรวจด้วยตัวเอง

- รัน npm run quality:scorecard แล้วดูชั้น codebase แสดงเกณฑ์ใหม่ตามลำดับ
- แก้ ceiling ของ lane file-size เป็น 5000 แล้วรัน cloop quality readiness --pretty: ข้อ file-size ต้องไม่ผ่าน

## รายละเอียดทางเทคนิค

ส่วนนี้สำหรับนักพัฒนาและผู้รีวิว: ไฟล์ที่แตะ, การวิเคราะห์ทางเทคนิค, เกณฑ์ผ่าน และนิยามของงานเสร็จ

### ไฟล์และ repository

- **นอกขอบเขต:** การแก้นอกไฟล์ `.claude/harness/runtime/quality/pyramid-readiness.mjs`, `.claude/harness/runtime/quality/quality-policy.mjs`, `.claude/harness/runtime/composition/pyramid-readiness-command.mjs`, `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/codebase-floors.test.mjs`, `.claude/harness/runtime/workflow/validation/project-feature-map.mjs`, … +38 more

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| codebase-floors | เพดานเข้มกว่า floor | success | T001 | test: `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/codebase-floors.test.mjs` | — |
|  | เพดานเท่า floor | boundary | T001 |  |  |
|  | เพดานหลวมกว่า floor | failure | T001 |  |  |
|  | duplication window กว้างกว่า floor | failure | T001 |  |  |
| ordered-codebase-layer | domain ยังไม่ผ่านแต่ไฟล์ใหญ่ด้วย | success | T001, T014 | test: `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/codebase-floors.test.mjs` | — |
|  | ข้อเทสต์ยังไม่ผ่าน | boundary | T001, T014 |  |  |
| data-domains | import ผ่าน API | success | T002, T014 | test: `.claude/harness/tests/data-domains.test.mjs` | — |
|  | ไม่มี domains | boundary | T002, T014 |  |  |
|  | import ส่วนภายใน | failure | T002, T014 |  |  |
|  | อ้างตารางของ domain อื่น | failure | T002, T014 |  |  |
|  | ข้อมูลมีสองเจ้าของ | failure | T002, T014 |  |  |
| directed-architecture | วงจรใน Python | success | T003 | test: `.claude/harness/tests/import-graph.test.mjs` | — |
|  | ภาษาไม่รู้จัก | boundary | T003 |  |  |
|  | โมดูลวนกัน | failure | T003 |  |  |
|  | allow ทุกทิศ | failure | T003 |  |  |
| feature-ownership | ไฟล์เทสต์ | boundary | T004 | test: `.claude/harness/tests/feature-ownership.test.mjs` | — |
|  | ไฟล์ไม่มีเจ้าของ | failure | T004 |  |  |
| function-metrics | ยาวพอดีเกณฑ์ | boundary | T005 | test: `.claude/harness/tests/function-metrics.test.mjs` | — |
|  | object literal ไม่ใช่ฟังก์ชัน | boundary | T005 |  |  |
|  | ฟังก์ชันยาว | failure | T005 |  |  |
|  | ซับซ้อนเกิน | failure | T005 |  |  |
| dead-code | ผลจาก knip | success | T006 | test: `.claude/harness/tests/dead-code.test.mjs` | — |
|  | entry point | boundary | T006 |  |  |
|  | ไฟล์ไม่มีใครใช้ | failure | T006 |  |  |
| type2-duplication | โครงสร้างต่าง | boundary | T007 | test: `.claude/harness/tests/code-health-findings.test.mjs`, `.claude/harness/tests/type2-duplication.test.mjs` | — |
|  | เปลี่ยนชื่อตัวแปร | failure | T007 |  |  |
| approximate-languages | มี knip ใน devDependencies | success | T008 | test: `.claude/harness/tests/codebase-discovery.test.mjs` | — |
|  | ไม่มีเครื่องมือ | boundary | T008 |  |  |
| repository-scope | readiness ของ repo | success | T013 | test: `scripts/quality/test/repository-findings.test.mjs`, `scripts/quality/test/scorecard.test.mjs` | — |
|  | ไฟล์ใน scripts โตเกิน | failure | T013 |  |  |
| golden-fixture | fixture สะอาด | success | T012 | test: `.claude/harness/tests/fixtures/codebase-golden/**`, `.claude/harness/tests/codebase-golden.test.mjs` | — |
|  | ใส่วงจร | failure | T012 |  |  |
|  | ใส่ไฟล์ไม่มีเจ้าของ | failure | T012 |  |  |
| domain-invariants | กฎมีเทสต์ | success | T009 | test: `.claude/harness/tests/domain-declarations.test.mjs` | — |
|  | กฎไม่มีเทสต์ | failure | T009 |  |  |
|  | เทสต์ที่อ้างไม่มีอยู่ | failure | T009 |  |  |
| api-contracts | มี OpenAPI | success | T009 | test: `.claude/harness/tests/domain-declarations.test.mjs` | — |
|  | ไม่มีสัญญา | failure | T009 |  |  |
|  | สัญญาชี้ไฟล์หาย | failure | T009 |  |  |
| reference-implementations | reference สะอาด | success | T010 | test: `.claude/harness/tests/reference-implementations.test.mjs` | — |
|  | reference มีหนี้ | failure | T010 |  |  |
|  | reference หาย | failure | T010 |  |  |
| shared-sdk | เรียกผ่าน SDK | success | T011 | test: `.claude/harness/tests/shared-sdk.test.mjs` | — |
|  | ภายใน SDK | boundary | T011 |  |  |
|  | เรียก driver ตรง | failure | T011 |  |  |
|  | Go import ตรง | failure | T011 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (46).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, configured model).
- Land archives it; Land never commits.
- Success: the Success criteria above hold.

## ภาคผนวก: การสืบค้น

- **ID:** codebase-layer-strength
- **ผลลัพธ์:** ready-for-change
- **สรุป:** ชั้น Codebase ตอนนี้วัดแค่ 'ไม่แย่ลง' ระดับไฟล์ ไม่มี data domain และ module boundary ที่ร่างให้ผู้ใช้อนุญาตทุกทิศรวมถึงวงจร งานวิจัยรองรับว่าโค้ดสุขภาพดีลด defect ~15 เท่าและทำให้ AI แก้ได้ถูกกว่า วงจร dependency เพิ่มการเปลี่ยนแปลงรอบข้าง และ agent พลาดบ่อยที่การเลือกฟังก์ชัน แนะนำทางเลือก A: จัดชั้น codebase ใหม่เป็นลำดับ data domain → architecture → code architecture → code พร้อม floor ที่โกงไม่ได้ และ golden fixture เป็นตัวพิสูจน์ ประโยชน์ต่อความเร็ว/ความถูกของ agent ยังพิสูจน์ล่วงหน้าไม่ได้ ต้องวัดหลังส่งมอบด้วย cloop outcomes (first-proof pass, repair rounds) อย่างน้อย 3 งานต่อฝั่ง
- **เจตนาของ change:** ชั้น Codebase ของ pyramid readiness วัดตามลำดับ data domain → architecture → code architecture → code: โปรเจกต์ประกาศ data domain และข้อมูลที่แต่ละ domain เป็นเจ้าของ, module boundary ต้องมีทิศทางและไม่มีวงจร, ทุกไฟล์ source มี feature เป็นเจ้าของ, วัดความยาวและ cognitive complexity ระดับฟังก์ชัน, dead code และ Type-2 duplication, เกณฑ์ทุกข้อมี floor ที่ตั้งหลวมกว่าไม่ได้, repo นี้ขยายการตรวจไป scripts/ และไฟล์เทสต์ และมี golden fixture repo ที่ใส่ข้อบกพร่องทีละชั้นแล้วคะแนนลดตรงชั้นนั้น
- **State:** .foundation/investigations/codebase-layer-strength.json @ 6a53a83ef39425c644f93f5e97b970f5385b1db84a4da95722e8ebaf48217ba1
- **Sources:** sha256:4b3856ab5cc27e50cf714b2058a7213a6ca276b9aabe60a1ca46e39a3631512e

เป้าหมาย: ชั้น Codebase วัดจากบนลงล่าง: data domain → architecture → code architecture → โค้ดระดับไฟล์/ฟังก์ชัน ด้วยเกณฑ์ที่มีหลักฐานวิจัยรองรับ และโกงด้วยการตั้งค่าหลวมไม่ได้

ผลลัพธ์ที่ต้องการ: ข้อเสนองานเดียว (change) ที่ครอบ 5 ช่องว่างเดิม + data domain + architecture พร้อม repo ตัวอย่างที่รู้คำตอบล่วงหน้าเป็นตัวพิสูจน์

### ขอบเขตและผู้เกี่ยวข้อง

- pyramid readiness codebase criteria
- findings ratchet lanes
- module-boundaries lane
- feature map
- onboard skill
- repository-findings scope
- golden fixture repository
- maintainer
- consumer agent
- consumer project owner

### ความครบของ requirement

| Source | Requirement | สถานะ | Targets | รายละเอียด |
|---|---|---|---|---|
| r1@1 | เกณฑ์ codebase ต้องมีค่าขั้นต่ำ (floor) ที่โปรเจกต์ตั้งหลวมกว่าไม่ได้ ถ้าหลวมกว่า ข้อนั้นเป็น unmet ไม่ใช่ met | behavior / stated / user | requirement: codebase-floors | — |
| r2@1 | วัดระดับฟังก์ชัน (ความยาว, cognitive complexity), วงจร import ระหว่างโมดูล และโค้ดที่ไม่มีใครใช้ | behavior / stated / user | requirement: function-metrics; requirement: directed-architecture; requirement: dead-code | — |
| r3@1 | ทุกไฟล์ source ต้องมี feature เป็นเจ้าของใน feature map | behavior / stated / user | requirement: feature-ownership | — |
| r4@1 | repo นี้ตรวจ scripts/ และไฟล์เทสต์ด้วย หนี้เดิมเข้า baseline | behavior / stated / user | requirement: repository-scope | — |
| r5@1 | หาโค้ดซ้ำแบบ Type-2 (เปลี่ยนชื่อตัวแปร/ค่าคงที่) และมี golden fixture repo ที่ใส่ข้อบกพร่องทีละชั้นแล้วคะแนนต้องลดตรงชั้นนั้น | behavior / stated / user | requirement: type2-duplication; requirement: golden-fixture | — |
| r6@1 | มีแนวคิด data domain: แต่ละ domain เป็นเจ้าของข้อมูล (entity/table/collection/schema) ของตัวเอง โมดูลอื่นเข้าผ่าน API ของ domain นั้นเท่านั้น และตรวจได้ | behavior / stated / user | requirement: data-domains | — |
| r7@1 | architecture ถูกวัดก่อน code architecture: มี module boundary ที่มีทิศทาง (ไม่ใช่ allow ทุกทิศ) และไม่มีวงจรระหว่างโมดูล | behavior / stated / user | requirement: directed-architecture; requirement: ordered-codebase-layer | — |

ลิงก์นี้ตรวจความครบเชิงโครงสร้าง Agent ต้องตรวจความหมายกับต้นทางก่อนเสนออนุมัติ spec

### สาระจากบทสนทนา

- u-scope [user]: ทำครบทั้ง 5 ข้อ; ต้องมี concept ของ data domain ที่ดี มี architecture ที่ดี ตามด้วย code architecture ที่ดี และหา research เพิ่มในการพัฒนา software (answer to question 3e9d8a2d)
- u-design [user]: data domain เพิ่มใน feature map; ทุกภาษาแบบประมาณ + ใช้เครื่องมือถ้ามี; floor ชุดมาตรฐาน (ไฟล์ ≤1000, ฟังก์ชัน ≤80, cognitive ≤15, nesting ≤5, duplication window ≤8, ไม่มีวงจร); บังคับแบบ ratchet เหมือน lane เดิม (answer to question 291faa27)

## ภาคผนวก: ความครอบคลุมของการสำรวจ

| Dimension | Status | Requirements | Sources | Rationale |
|---|---|---|---|---|
| current-behavior | covered | codebase-floors, ordered-codebase-layer |  |  |
| compatibility | covered | codebase-floors, data-domains |  |  |
| non-goals | covered | approximate-languages |  |  |
| input-boundary | covered | codebase-floors, data-domains |  |  |

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Failure matrix:** read from the failure scenarios (23); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for codebase-floors, ordered-codebase-layer, data-domains, directed-architecture, feature-ownership, function-metrics, dead-code, type2-duplication, approximate-languages, repository-scope, golden-fixture, domain-invariants, api-contracts, reference-implementations, shared-sdk.
