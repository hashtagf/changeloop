<!-- change-loop:generated-investigation-report:v1 -->
# รายงานการสำรวจปัญหา: implementation-plan-strictness

**สถานะ:** ข้อสรุปปัจจุบัน

อัปเดต: 2026-11-16T11:17:07.281Z · 1abdcd721125413956781daaf31b19b2ad4a67f7cfe94e74cb2ee801ec80edc6

## ปัญหา

implementation plan (tasks.md + verify + Prove) เข้มพอให้ agent ทำงานไม่พลาดหรือยัง และควรปรับตรงไหน

## ความต้องการและบริบทที่บันทึกไว้

**เป้าหมาย:** ให้ทุก scenario ที่ตกลงใน Change ถูกพิสูจน์ด้วย test ที่แยกโค้ดใหม่ออกจากโค้ดเดิมได้จริง ก่อนถึง proven

**ผลลัพธ์ที่ต้องการ:** รู้ช่องที่ agent ผ่าน Build/Prove ได้ทั้งที่งานไม่ครบ พร้อมทางแก้ที่จัดลำดับแล้ว


### ผู้เกี่ยวข้อง

- user
- agent
- harness

### ขอบเขต

- semantic draft tasks (outcome, verify, paths, covers)
- Build task tick (advance)
- Prove test discrimination
- acceptance traceability

### ข้อกำหนดล่าสุด

- **find-gaps@1** [behavior / stated] หาช่องที่ทำให้ task หรือ scenario ผ่าน proven ได้โดยไม่มี test ที่พิสูจน์พฤติกรรมนั้น และเสนอทางแก้; ที่มา: user (u-strict, u-investigate)

### สาระจากบทสนทนา

- **u-strict** [user]: implement plan เราเข้ม พอให้ agent ทำงานไม่พลาดหรือยัง (session message)
- **u-investigate** [user]: investigate และหา solution ปรับปรุง (session message)
- **u-choose** [user]: ทำครบสามข้อ (question answer f895356b)

### ช่องว่างของประวัติที่เข้าถึงไม่ได้

- ยังไม่ได้เปิด raw run ของ project-tracker-api เพื่อยืนยันว่า CASE\_TESTS\_EXIST fail เพราะ scenario ไม่มี test (raw bench ไม่อยู่ใน git) ข้อเชื่อมโยงนี้ยังเป็นการอนุมาน
- ยังไม่ได้วัดว่า discrimination รายไฟล์ทำให้ Prove ช้าขึ้นเท่าไร

## ข้อสรุปปัจจุบัน

Plan เข้มเรื่องโครงสร้าง (ทุก requirement มี task, harness ติ๊กงานเอง, กัน task กลวง, test ต้อง fail บนโค้ดเดิม) แต่หลักฐานพฤติกรรมยังหยาบ: scenario ไม่ได้ผูกกับ test รายตัว verify ระดับ task exit 0 ก็ถือว่า claim ผ่าน และ discrimination ผ่านได้ถ้ามี test ตัวเดียว fail บนโค้ดเดิม ซึ่งตรงกับความพลาดจริงจาก paid run (CASE\_TESTS\_EXIST, config-flag) ข้อเสนอหลักคือผูก scenario กับ test และทำ discrimination รายไฟล์ ร่วมกับตรวจรูปแบบ verify และไม่ปล่อยผลไม่มีคำตัดสินผ่านเงียบ

## ข้อเสนอแนะและเหตุผล

ผูก scenario ของงานที่เปลี่ยนพฤติกรรมกับไฟล์ test และรัน test discrimination รายไฟล์; ตรวจรูปแบบ verify ของ task ตอน compile; ไม่ปล่อยผล discrimination ที่ไม่มีคำตัดสินผ่านเงียบ

## ข้อเท็จจริงที่มีแหล่งอ้างอิง

- **task-compile-checks:** ตอน compile แต่ละ task ต้องมี outcome, verify, covers (requirement อย่างน้อย 1) ไม่มี placeholder ไม่มีวงวน dependency และทุก requirement ต้องมี task ครอบ แต่ไม่มีการตรวจว่า verify เป็นคำสั่ง test จริง คำสั่งอย่าง \`true\` หรือ \`npm run lint\` ผ่านการ compile ได้ ([.claude/harness/runtime/workflow/semantic-draft.mjs](<../../.claude/harness/runtime/workflow/semantic-draft.mjs>))
- **claims-by-covers:** claim ของ scenario ผูกกับ task ระดับ requirement: task.claims = claim ทุกตัวของ requirement ที่ task covers ไม่มีการผูก scenario กับ test ตัวใดตัวหนึ่ง ([.claude/harness/runtime/workflow/semantic-draft.mjs](<../../.claude/harness/runtime/workflow/semantic-draft.mjs>))
- **declared-claims:** provider test ที่ derive จาก verify ของ task ใช้ claims: declared คือถ้าคำสั่ง exit 0 ทุก claim ที่ประกาศไว้ถือว่าผ่าน ไม่มีการจับคู่ผล test รายตัวกับ scenario ([.claude/harness/runtime/workflow/semantic-draft.mjs](<../../.claude/harness/runtime/workflow/semantic-draft.mjs>), [.claude/harness/EVIDENCE.md](<../../.claude/harness/EVIDENCE.md>))
- **traceability-display-only:** คอลัมน์ test files ในตาราง acceptance traceability มาจาก testMap ที่ agent เขียนเอง หรือไฟล์ test ใน paths ของ task เป็นการแสดงผลอย่างเดียว ไม่มี gate ใดตรวจว่าทุก scenario มี test ([.claude/harness/runtime/workflow/validation/packet-overview.mjs](<../../.claude/harness/runtime/workflow/validation/packet-overview.mjs>))
- **discrimination-per-repo:** test discrimination รันไฟล์ test ที่เปลี่ยนทั้งหมดรวมกันในคำสั่งเดียวบนโค้ดเดิมต่อ repository ถ้าคำสั่งนั้น exit ไม่เป็น 0 (มี test ตัวใดตัวหนึ่ง fail) ถือว่า fails-on-base แล้วผ่าน test อื่นที่ไม่ได้ทดสอบอะไรจึงซ่อนอยู่หลัง test ตัวเดียวที่ fail ได้ ([.claude/harness/runtime/evidence/test-discrimination.mjs](<../../.claude/harness/runtime/evidence/test-discrimination.mjs>))
- **discrimination-silent:** ผล no-test-provider, test-evidence-pending, unavailable และ timed-out ทำให้สถานะเป็น not-applicable และ gate block เฉพาะสถานะ fail งานที่เปลี่ยนพฤติกรรมจึงผ่าน Prove ได้โดยไม่มีคำตัดสิน discrimination และงาน refactor/docs ได้รับการยกเว้นทั้งหมด ([.claude/harness/runtime/evidence/test-discrimination.mjs](<../../.claude/harness/runtime/evidence/test-discrimination.mjs>), [.claude/harness/runtime/evidence/proof-execution-runtime.mjs](<../../.claude/harness/runtime/evidence/proof-execution-runtime.mjs>))
- **combined-provider:** provider test ที่ derive ได้เอา verify ของทุก task มาต่อกันเป็นคำสั่งเดียว (sh -c ... && ...) ด้วย minimum: 1 ถ้าทุก verify ไม่ได้รัน test เลย discovery จะจับได้ แต่ถ้ามี task อื่นที่รัน test อย่างน้อย 1 ตัว verify ที่ไม่ใช่ test ของอีก task ก็ผ่านได้ ([.claude/harness/runtime/workflow/semantic-draft.mjs](<../../.claude/harness/runtime/workflow/semantic-draft.mjs>), [.claude/harness/EVIDENCE.md](<../../.claude/harness/EVIDENCE.md>))
- **hollow-task-tick:** task ที่เปลี่ยนพฤติกรรมซึ่ง verify ผ่านแต่ไม่มีไฟล์ไหนใน paths เปลี่ยน จะไม่ถูกติ๊ก แต่การเปลี่ยนเล็กน้อยใดก็ได้ใน paths ผ่านเงื่อนไขนี้ ([WORKFLOW.md](<../../WORKFLOW.md>))
- **out-of-paths:** การแก้ไฟล์นอก paths ของทุก task ไม่ block Build หรือ Prove ระบบบันทึกเป็น surfaceAdditions และแสดงตอน Land ตาม blocking policy ([WORKFLOW.md](<../../WORKFLOW.md>))
- **oracle-tests-exist:** lane project-tracker-api ถึง proven ด้วย proof ผ่าน แต่ hidden oracle fail CASE\_TESTS\_EXIST (32/33) ซ้ำใน v3.6.0–v3.6.3, v3.6.8, v3.6.9 และ candidate ca200a3 ส่วน baseline ที่ไม่มี harness ผ่าน รายงานระบุว่ายังไม่ได้สืบสาเหตุ ([docs/reports/scenario-paid-e2e-v3.6.8-v3.6.9-baseline-review-2026-11-02.md](<../../docs/reports/scenario-paid-e2e-v3.6.8-v3.6.9-baseline-review-2026-11-02.md>), [docs/reports/scenario-pstack-gates-2026-10-15.md](<../../docs/reports/scenario-pstack-gates-2026-10-15.md>), [docs/reports/user-scenario-test-plan.md](<../../docs/reports/user-scenario-test-plan.md>))
- **oracle-config-flag:** lane config-flag บน 0660d1329 ถึง proven และผ่าน delta review แต่ hidden oracle fail CASE\_DEFAULT และ CASE\_ENV\_BEATS\_FILE คือ scenario ค่า default และลำดับความสำคัญ env เหนือไฟล์ ไม่มี test ที่จับได้ ([docs/reports/scenario-repeat-rapid-2026-10-19.md](<../../docs/reports/scenario-repeat-rapid-2026-10-19.md>))

## สมมติฐานและหลักฐาน

- **h-scenario-unbound — มีหลักฐานสนับสนุน:** สาเหตุหลักที่ agent พลาดแล้วยังถึง proven คือ scenario ไม่ได้ผูกกับ test รายตัว verify ระดับ task ที่ exit 0 และ discrimination ระดับ repository ที่ test ตัวเดียว fail ก็พอ ทำให้ scenario ที่ไม่มี test ผ่านได้; หลักฐาน: claims-by-covers, declared-claims, traceability-display-only, discrimination-per-repo, oracle-tests-exist, oracle-config-flag
- **h-weak-verify — มีหลักฐานสนับสนุน:** verify ที่ไม่ใช่ test (lint, typecheck, true) ทำให้ task ถูกติ๊กได้โดยไม่มีหลักฐานพฤติกรรม; หลักฐาน: task-compile-checks, hollow-task-tick, combined-provider

## ทางเลือกและข้อแลกเปลี่ยน

### o-scenario-test-binding

ผูก scenario กับ test: scenario ของงานที่เปลี่ยนพฤติกรรมต้องมีไฟล์ test (ผ่าน testMap หรือ task paths) ถ้าไม่มี change start ส่ง EDIT และตอน Prove รัน discrimination ทีละไฟล์ test ที่ผูกกับ scenario ไฟล์ที่ผ่านบนโค้ดเดิมต้องเสริม test เว้นแต่ประกาศเป็น regression guard แก้ตรงสาเหตุของ CASE\_TESTS\_EXIST และ config-flag แต่ทำให้ Prove ช้าขึ้นตามจำนวนไฟล์ (มี cache อยู่แล้ว)

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### o-verify-shape

ตรวจรูปแบบ verify ตอน compile: task ที่เปลี่ยนพฤติกรรมต้องมี verify ที่รัน test runner หรืออ้างไฟล์ test ส่วนคำสั่งไม่มีผลอย่าง true, exit 0, echo เป็น EDIT ทำได้ถูกและเร็ว แต่ไม่ได้พิสูจน์ว่า test ตรงกับ scenario

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### o-discrimination-visible

เลิกปล่อยผลไม่มีคำตัดสินผ่านเงียบ: ถ้างานเปลี่ยนพฤติกรรมได้ discrimination เป็น unavailable, timed-out หรือ no-test-provider ให้แสดงเป็น finding ใน proof และรายงาน Land และกรณีไม่มี test provider ให้เป็น REPAIR

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### o-keep-out-of-paths

คงพฤติกรรมเดิมของการแก้ไฟล์นอก paths (บันทึกและแสดงตอน Land) เพราะเป็นการตัดสินใจตาม blocking policy การ block จะเพิ่มรอบ repair โดยไม่มีหลักฐานว่าเคยทำให้งานพลาด

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

## การตัดสินใจ

- **d-scope — ตัดสินใจแล้ว:** จะนำทางแก้ข้อไหนเข้า Change
  ตัวเลือก: ทำครบสามข้อใน change เดียว: ผูก scenario กับ test + discrimination รายไฟล์, ตรวจรูปแบบ verify, แสดงผลไม่มีคำตัดสิน (คงเรื่องไฟล์นอก paths) / ทำเฉพาะข้อถูกและเร็วก่อน: ตรวจรูปแบบ verify + แสดงผลไม่มีคำตัดสิน ส่วนการผูก scenario กับ test ทำทีหลัง / ทำเฉพาะการผูก scenario กับ test + discrimination รายไฟล์; ข้อเสนอแนะและเหตุผล: ทำครบสามข้อใน change เดียว: ผูก scenario กับ test + discrimination รายไฟล์, ตรวจรูปแบบ verify, แสดงผลไม่มีคำตัดสิน (คงเรื่องไฟล์นอก paths); หลักฐาน: oracle-tests-exist, oracle-config-flag, discrimination-per-repo, combined-provider, discrimination-silent

## สิ่งที่ยังไม่รู้และงานที่เหลือ

ยังไม่ได้บันทึก

## แหล่งอ้างอิง

- [.claude/harness/EVIDENCE.md](<../../.claude/harness/EVIDENCE.md>)
- [.claude/harness/runtime/evidence/proof-execution-runtime.mjs](<../../.claude/harness/runtime/evidence/proof-execution-runtime.mjs>)
- [.claude/harness/runtime/evidence/test-discrimination.mjs](<../../.claude/harness/runtime/evidence/test-discrimination.mjs>)
- [.claude/harness/runtime/workflow/semantic-amendment.mjs](<../../.claude/harness/runtime/workflow/semantic-amendment.mjs>)
- [.claude/harness/runtime/workflow/semantic-draft.mjs](<../../.claude/harness/runtime/workflow/semantic-draft.mjs>)
- [.claude/harness/runtime/workflow/validation/packet-overview.mjs](<../../.claude/harness/runtime/workflow/validation/packet-overview.mjs>)
- [WORKFLOW.md](<../../WORKFLOW.md>)
- [docs/reports/agent-harness-simplification-plan-2026-09-03.md](<../../docs/reports/agent-harness-simplification-plan-2026-09-03.md>)
- [docs/reports/ai-native-sdlc-playbook-2026-11-09.md](<../../docs/reports/ai-native-sdlc-playbook-2026-11-09.md>)
- [docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md](<../../docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md>)
- [docs/reports/consumer-quality-framework-plan.md](<../../docs/reports/consumer-quality-framework-plan.md>)
- [docs/reports/harness-behavior-plan-2026-09-05.md](<../../docs/reports/harness-behavior-plan-2026-09-05.md>)
- [docs/reports/harness-core-path-simplification-plan-2026-09-30.md](<../../docs/reports/harness-core-path-simplification-plan-2026-09-30.md>)
- [docs/reports/harness-rapid-speed-plan-2026-09-30.md](<../../docs/reports/harness-rapid-speed-plan-2026-09-30.md>)
- [docs/reports/scenario-benchmark-no-harness-2026-10-08.th.md](<../../docs/reports/scenario-benchmark-no-harness-2026-10-08.th.md>)
- [docs/reports/scenario-paid-e2e-v3.6.8-v3.6.9-baseline-review-2026-11-02.md](<../../docs/reports/scenario-paid-e2e-v3.6.8-v3.6.9-baseline-review-2026-11-02.md>)
- [docs/reports/scenario-pstack-gates-2026-10-15.md](<../../docs/reports/scenario-pstack-gates-2026-10-15.md>)
- [docs/reports/scenario-pstack-gates-2026-10-15.th.md](<../../docs/reports/scenario-pstack-gates-2026-10-15.th.md>)
- [docs/reports/scenario-repeat-rapid-2026-10-19.md](<../../docs/reports/scenario-repeat-rapid-2026-10-19.md>)
- [docs/reports/scenario-smoke-candidate-8913c2da9-2026-10-30.th.md](<../../docs/reports/scenario-smoke-candidate-8913c2da9-2026-10-30.th.md>)
- [docs/reports/user-scenario-test-plan.md](<../../docs/reports/user-scenario-test-plan.md>)
- [docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md](<../../docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md>)
- [openspec/changes/archive/2026-10-15-change-pstack-agent/proposal.md](<../changes/archive/2026-10-15-change-pstack-agent/proposal.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/design.md](<../changes/archive/2026-10-16-complete-change-packets/design.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/proposal.md](<../changes/archive/2026-10-16-complete-change-packets/proposal.md>)
- [openspec/specs/change/spec.md](<../specs/change/spec.md>)
- [openspec/specs/skill-guidance/spec.md](<../specs/skill-guidance/spec.md>)
- [website/docs/src/content/docs/th/approval.md](<../../website/docs/src/content/docs/th/approval.md>)
- [website/docs/src/content/docs/th/artifacts.md](<../../website/docs/src/content/docs/th/artifacts.md>)
- [website/docs/src/content/docs/th/cli.md](<../../website/docs/src/content/docs/th/cli.md>)
- [website/docs/src/content/docs/th/evidence/adapters.md](<../../website/docs/src/content/docs/th/evidence/adapters.md>)
- [website/docs/src/content/docs/th/evidence/claims.md](<../../website/docs/src/content/docs/th/evidence/claims.md>)
- [website/docs/src/content/docs/th/foundation-config.md](<../../website/docs/src/content/docs/th/foundation-config.md>)
- [website/docs/src/content/docs/th/loop/change.md](<../../website/docs/src/content/docs/th/loop/change.md>)
- [website/docs/src/content/docs/th/multi-repository.md](<../../website/docs/src/content/docs/th/multi-repository.md>)

## แหล่งที่ค้นพบแต่ยังไม่มีข้อเท็จจริงอ้างอิง (hash แล้ว ยังไม่ได้อ่าน)

- [docs/reports/agent-harness-simplification-plan-2026-09-03.md](<../../docs/reports/agent-harness-simplification-plan-2026-09-03.md>)
- [docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md](<../../docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md>)
- [website/docs/src/content/docs/th/approval.md](<../../website/docs/src/content/docs/th/approval.md>)
- [website/docs/src/content/docs/th/loop/change.md](<../../website/docs/src/content/docs/th/loop/change.md>)
- [docs/reports/ai-native-sdlc-playbook-2026-11-09.md](<../../docs/reports/ai-native-sdlc-playbook-2026-11-09.md>)
- [openspec/specs/skill-guidance/spec.md](<../specs/skill-guidance/spec.md>)
- [docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md](<../../docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md>)
- [openspec/specs/change/spec.md](<../specs/change/spec.md>)
- [website/docs/src/content/docs/th/artifacts.md](<../../website/docs/src/content/docs/th/artifacts.md>)
- [website/docs/src/content/docs/th/cli.md](<../../website/docs/src/content/docs/th/cli.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/design.md](<../changes/archive/2026-10-16-complete-change-packets/design.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/proposal.md](<../changes/archive/2026-10-16-complete-change-packets/proposal.md>)
- [website/docs/src/content/docs/th/foundation-config.md](<../../website/docs/src/content/docs/th/foundation-config.md>)
- [website/docs/src/content/docs/th/evidence/claims.md](<../../website/docs/src/content/docs/th/evidence/claims.md>)
- [docs/reports/harness-core-path-simplification-plan-2026-09-30.md](<../../docs/reports/harness-core-path-simplification-plan-2026-09-30.md>)
- [docs/reports/harness-rapid-speed-plan-2026-09-30.md](<../../docs/reports/harness-rapid-speed-plan-2026-09-30.md>)
- [docs/reports/scenario-benchmark-no-harness-2026-10-08.th.md](<../../docs/reports/scenario-benchmark-no-harness-2026-10-08.th.md>)
- [docs/reports/scenario-pstack-gates-2026-10-15.th.md](<../../docs/reports/scenario-pstack-gates-2026-10-15.th.md>)
- [openspec/changes/archive/2026-10-15-change-pstack-agent/proposal.md](<../changes/archive/2026-10-15-change-pstack-agent/proposal.md>)
- [docs/reports/harness-behavior-plan-2026-09-05.md](<../../docs/reports/harness-behavior-plan-2026-09-05.md>)
- [docs/reports/scenario-smoke-candidate-8913c2da9-2026-10-30.th.md](<../../docs/reports/scenario-smoke-candidate-8913c2da9-2026-10-30.th.md>)
- [website/docs/src/content/docs/th/evidence/adapters.md](<../../website/docs/src/content/docs/th/evidence/adapters.md>)
- [website/docs/src/content/docs/th/multi-repository.md](<../../website/docs/src/content/docs/th/multi-repository.md>)
- [docs/reports/consumer-quality-framework-plan.md](<../../docs/reports/consumer-quality-framework-plan.md>)

## ขั้นตอนถัดไป

พร้อมเสนอ Change โดยยังต้องมีเจตนาของผู้ใช้

The investigation is source-grounded and has a terminal conclusion.

คำสั่งที่ agent ใช้ทำต่อ:

```text
claude-foundation investigate openspec/investigations/implementation-plan-strictness.json
```

