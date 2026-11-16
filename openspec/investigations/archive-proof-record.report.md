<!-- change-loop:generated-investigation-report:v1 -->
# รายงานการสำรวจปัญหา: archive-proof-record

**สถานะ:** ข้อสรุปปัจจุบัน

อัปเดต: 2026-11-16T13:50:44.341Z · 1bf4c72e1493b2799b7bb26fea19436881a7471aafd66c2000c70f83c7189786

## ปัญหา

change ที่ archive แล้วใน openspec/changes/archive มีผล review แต่ไม่มีผล test/proof ที่อ่านได้ หลักฐานจริงอยู่ใน .foundation/evidence ซึ่ง gitignore จึงหายเมื่อ clone ไปเครื่องอื่น ต้องออกแบบให้ Land บันทึกผลพิสูจน์ลง archive

## ความต้องการและบริบทที่บันทึกไว้

**เป้าหมาย:** change ที่ archive แล้วมีหลักฐาน review และ test ที่อ่านได้และติดไปกับ Git

**ผลลัพธ์ที่ต้องการ:** เปิด proposal.md ของ change ที่ archive แล้วเห็นว่า proof run ไหนผ่าน provider ใดพิสูจน์ claim ใด ด้วยคำสั่งอะไร ผลเป็นอย่างไร และ hash ของ receipt ที่ใช้ตรวจย้อนได้


### ผู้เกี่ยวข้อง

- ผู้ดูแล repo
- reviewer ของ PR
- ผู้ตรวจ audit ภายหลัง

### ขอบเขต

- archive appendix ตอน Land
- Deliver PR body อ่านข้อมูลเดิมได้

### ข้อกำหนดล่าสุด

- **r-proof-in-archive@1** [behavior / stated] Land เขียนสรุปผล proof run ที่ Land ยอมรับลงใน change ที่ archive; ที่มา: user (u-ask, u-investigate)
- **r-no-machine-state-commit@2** [constraint / proposed] ไม่ commit .foundation หรือ log ดิบ และไม่แก้ proof JSON ที่เครื่องสร้าง (invariant เดิมของ repo ตาม AGENTS.md และกลไก appendix); ที่มา: agent (u-investigate)
- **r-resume-idempotent@2** [constraint / proposed] Land ที่ resume ต้องเขียนข้อความเดิมครั้งเดียวเหมือน appendix เดิม และอยู่ก่อน delivery integrity bind (invariant เดิมของ repo ตาม AGENTS.md และกลไก appendix); ที่มา: agent (u-investigate)

### ประวัติข้อกำหนด

- **r-no-machine-state-commit@1** [constraint / superseded] ไม่ commit .foundation หรือ log ดิบ และไม่แก้ proof JSON ที่เครื่องสร้าง; ที่มา: agent (u-investigate); เหตุผล: เป็น invariant เดิมของ repo ไม่ต้องให้ผู้ใช้ตัดสิน; → r-no-machine-state-commit@2
- **r-resume-idempotent@1** [constraint / superseded] Land ที่ resume ต้องเขียนข้อความเดิมครั้งเดียวเหมือน appendix เดิม และอยู่ก่อน delivery integrity bind; ที่มา: agent (u-investigate); เหตุผล: เป็น invariant เดิมของ repo ไม่ต้องให้ผู้ใช้ตัดสิน; → r-resume-idempotent@2

### คำถามและคำตอบ

- **q-shape** [answered]: รูปแบบหลักฐาน test ใน archive: appendix ตารางสรุปใน proposal.md (แนะนำ) / ไฟล์ verification.md แยก / คัดลอก receipt JSON เต็ม → ไฟล์ verification.md แยกใน archive folder (u-shape)

### งานอิสระที่ทำต่อได้

- w-change: draft change สำหรับ proof record appendix

### สาระจากบทสนทนา

- **u-ask** [user]: changeloop มีหลักฐานการ review and test ลงใน change spec หรือยัง และมีสร้าง REVIEW.md ให้ repo ที่ติดตั้งหรือยัง (session message 1)
- **a-answer** [agent]: REVIEW.md ถูก seed แล้ว หลักฐาน review/test ยังไม่อยู่ใน change spec (คำตอบแรกพลาดเรื่อง review — ภายหลังพบว่ามี Appendix: Review record แล้ว) (session message 2)
- **u-investigate** [user]: investigate design to land (session message 3)
- **u-shape** [user]: เลือก: ไฟล์ verification.md แยก (/questions answer d6c3f412)

## ข้อสรุปปัจจุบัน

ออกแบบได้: verification.md แยกใช้จุดเดียวกับ appendix เดิม (render ก่อน archive, เขียนหลัง spec verify, ก่อน delivery integrity) Deliver/undo-land ครอบคลุมเอง งานเพิ่มคือ strip ก่อนตรวจตอนกู้ และจองชื่อไฟล์ พร้อมเข้า Change

## ข้อเสนอแนะและเหตุผล

o-file — ผู้ใช้เลือก

- ไม่เลือก: o-appendix — ผู้ใช้ต้องการไฟล์แยก
- ไม่เลือก: o-copy — มี machine state/ข้อมูลผันผวน

## ข้อเท็จจริงที่มีแหล่งอ้างอิง

- **f-appendix-exists:** archiveAppendixMarkdown (apply-runtime.mjs:823) สร้าง appendix เฉพาะตอน archive: Review record, Compliance change record (ถ้าเปิด), Rollout gates — ไม่มีผล test/proof ([.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>))
- **f-appendix-lifecycle:** prepareArchiveAppendix render ก่อน openspec archive แล้วเก็บใน state.land.archiveAppendix; appendArchiveAppendix ต่อท้าย archived proposal.md หลัง spec sync verify และก่อน recordDeliveryIntegrity; strip/append ด้วย byte offset เพื่อให้ resume เขียนครั้งเดียว ([.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>))
- **f-review-rendered:** renderReviewRecord (process-fields.mjs:253) แสดงรอบ review, finding, severity, การแก้, reviewer เฉพาะเมื่อมี review attempt ที่ completed; change ที่ review ไม่บังคับจะไม่มีส่วนนี้ ([.claude/harness/runtime/workflow/validation/process-fields.mjs](<../../.claude/harness/runtime/workflow/validation/process-fields.mjs>))
- **f-archive-coverage:** 55 จาก 135 archive ใน repo นี้มี Appendix: Review record; change 2026-11-16 ส่วนใหญ่ไม่มีเพราะ reviewRequired=false (rapid lane, low impact) ([.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>))
- **f-dod-text:** proposal.md มี Definition of done และ Acceptance traceability ที่บอกว่าต้องพิสูจน์อะไร (claim, task, คำสั่ง check) แต่ไม่บอกผลจริง ([.claude/harness/runtime/workflow/validation/outline-contract.mjs](<../../.claude/harness/runtime/workflow/validation/outline-contract.mjs>))
- **f-proof-data:** state.land.proofRunId ชี้ proof run ที่ Land ยอมรับ; manifest.json มี status, workspaceHash, contractFingerprint, providers, advisories, rolloutGates, receipts; receipt มี provider, claims, status, observed, command, durationMs, finishedAt, log (path ใน .foundation) ([.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>))
- **f-foundation-ignored:** .foundation/.gitignore ignore ทุกอย่างยกเว้น .gitignore และ README.md ดังนั้น receipt/manifest/log ไม่ติดไปกับ Git ([install.sh](<../../install.sh>))
- **f-pr-evidence:** pullRequestNarrative (pull-request-runtime.mjs:270) ใส่ testEvidence เป็น provider + path + sha256 ของ receipt ใน PR body อยู่แล้ว — Deliver มีหลักฐานแบบ reference แต่ archive ไม่มี ([.claude/harness/runtime/workflow/pull-request-runtime.mjs](<../../.claude/harness/runtime/workflow/pull-request-runtime.mjs>))
- **f-docs-contract:** WORKFLOW.md:1441-1451 กำหนดรายการ appendix ที่ archive เขียน; outline-contract.mjs มี row archiveOnly สำหรับ reviewRecord/complianceRecord; tests อยู่ที่ archive-appendices.test.mjs ([WORKFLOW.md](<../../WORKFLOW.md>), [.claude/harness/runtime/workflow/validation/outline-contract.mjs](<../../.claude/harness/runtime/workflow/validation/outline-contract.mjs>), [.claude/harness/tests/archive-appendices.test.mjs](<../../.claude/harness/tests/archive-appendices.test.mjs>))
- **f-review-md:** install.sh seed REVIEW.md จาก template ถ้ายังไม่มี และ git add เฉพาะที่สร้างในรอบนั้น ([install.sh](<../../install.sh>))
- **f-packet-identity:** packetIdentity (user-decisions.mjs:66) hash ทุกไฟล์ใน packet dir; assertRetainedArchiveIntegrity (apply-runtime.mjs:1451) เทียบ approval identity และ archivePacketEntries กับ archive folder ตอนกู้ archive ที่ค้าง — ไฟล์เพิ่มจะทำให้ไม่ตรง จึงต้องลบ verification.md ก่อนตรวจ เหมือน stripArchiveAppendix ([.claude/harness/runtime/core/user-decisions.mjs](<../../.claude/harness/runtime/core/user-decisions.mjs>), [.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>))
- **f-journal-verify:** verifyLandJournalOperation (land-journal.mjs:218) เทียบ archive path กับ identity after ของ packet ใน journal ตอนกู้ — ต้องลบ verification.md ก่อน assertRecoveredProjection ([.claude/harness/runtime/workflow/land-journal.mjs](<../../.claude/harness/runtime/workflow/land-journal.mjs>))
- **f-integrity-binds-tree:** recordDeliveryIntegrity hash ทั้ง archive tree หลัง append และ land-undo ย้ายทั้ง folder (land-undo.mjs:215) — เขียน verification.md ก่อน recordDeliveryIntegrity ก็ครอบคลุม Deliver และ undo โดยไม่ต้องแก้ ([.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>), [.claude/harness/runtime/workflow/land-undo.mjs](<../../.claude/harness/runtime/workflow/land-undo.mjs>), [.claude/harness/runtime/workflow/delivery-integrity.mjs](<../../.claude/harness/runtime/workflow/delivery-integrity.mjs>))
- **f-extra-files-ok:** archive folder ใน repo มีไฟล์นอก OpenSpec อยู่แล้ว (grounding.yaml 18, handoffs.yaml 18, repositories.yaml 40) — OpenSpec ยอมรับไฟล์เพิ่ม ([install.sh](<../../install.sh>))

## สมมติฐานและหลักฐาน

- **h-reuse-appendix — มีหลักฐานสนับสนุน:** เพิ่ม Proof record เป็น appendix ใหม่ใน archiveAppendixMarkdown ได้โดยไม่ต้องเปลี่ยนกลไก Land/resume/integrity; หลักฐาน: f-appendix-exists, f-appendix-lifecycle, f-proof-data

## ทางเลือกและข้อแลกเปลี่ยน

### o-appendix

Appendix: Proof record ใน archived proposal.md: proof run id + status + workspace hash, ตาราง provider | claims | status | observed | command | receipt sha256, advisory/waiver, และบรรทัด review not-required พร้อมเหตุผลเมื่อไม่มี review

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### o-file

ไฟล์ verification.md แยกใน archive folder

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

### o-copy

คัดลอก manifest/receipt JSON ลง archive

ข้อค้นพบ:

ยังไม่ได้บันทึก

ข้อแลกเปลี่ยน:

ยังไม่ได้บันทึก

แหล่งอ้างอิง: 

ต้นแบบ (ไม่ใช่หลักฐานพิสูจน์): ยังไม่ได้บันทึก

## การตัดสินใจ

- **d-shape — ตัดสินใจแล้ว:** รูปแบบหลักฐาน test ใน archive: appendix ตารางสรุปใน proposal.md (แนะนำ) / ไฟล์ verification.md แยก / คัดลอก receipt JSON เต็ม
  ตัวเลือก: ไฟล์ verification.md แยก; ข้อเสนอแนะและเหตุผล: ผู้ใช้เลือก; หลักฐาน: ยังไม่ได้บันทึก

## สิ่งที่ยังไม่รู้และงานที่เหลือ

ยังไม่ได้บันทึก

## แหล่งอ้างอิง

- [.claude/harness/runtime/core/user-decisions.mjs](<../../.claude/harness/runtime/core/user-decisions.mjs>)
- [.claude/harness/runtime/workflow/apply-runtime.mjs](<../../.claude/harness/runtime/workflow/apply-runtime.mjs>)
- [.claude/harness/runtime/workflow/delivery-integrity.mjs](<../../.claude/harness/runtime/workflow/delivery-integrity.mjs>)
- [.claude/harness/runtime/workflow/land-journal.mjs](<../../.claude/harness/runtime/workflow/land-journal.mjs>)
- [.claude/harness/runtime/workflow/land-undo.mjs](<../../.claude/harness/runtime/workflow/land-undo.mjs>)
- [.claude/harness/runtime/workflow/pull-request-runtime.mjs](<../../.claude/harness/runtime/workflow/pull-request-runtime.mjs>)
- [.claude/harness/runtime/workflow/validation/outline-contract.mjs](<../../.claude/harness/runtime/workflow/validation/outline-contract.mjs>)
- [.claude/harness/runtime/workflow/validation/process-fields.mjs](<../../.claude/harness/runtime/workflow/validation/process-fields.mjs>)
- [.claude/harness/tests/archive-appendices.test.mjs](<../../.claude/harness/tests/archive-appendices.test.mjs>)
- [WORKFLOW.md](<../../WORKFLOW.md>)
- [docs/reports/agent-harness-simplification-plan-2026-09-03.md](<../../docs/reports/agent-harness-simplification-plan-2026-09-03.md>)
- [docs/reports/ai-native-sdlc-playbook-2026-11-09.md](<../../docs/reports/ai-native-sdlc-playbook-2026-11-09.md>)
- [docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md](<../../docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md>)
- [docs/reports/harness-report-aggregate-semantic-validation-failures-and-make-unavailable-host.html](<../../docs/reports/harness-report-aggregate-semantic-validation-failures-and-make-unavailable-host.html>)
- [docs/reports/harness-report-make-foundation-agents-surface-an-available-harness-update-durin.html](<../../docs/reports/harness-report-make-foundation-agents-surface-an-available-harness-update-durin.html>)
- [docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md](<../../docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md>)
- [install.sh](<../../install.sh>)
- [openspec/changes/archive/2026-10-15-change-code-repository-submodule-prove-amend-waive-recovery-issu/proposal.md](<../changes/archive/2026-10-15-change-code-repository-submodule-prove-amend-waive-recovery-issu/proposal.md>)
- [openspec/changes/archive/2026-10-15-change-pstack-agent/proposal.md](<../changes/archive/2026-10-15-change-pstack-agent/proposal.md>)
- [openspec/changes/archive/2026-10-15-skill-pstack-reference-owner-skill-change-loop-context-budget/proposal.md](<../changes/archive/2026-10-15-skill-pstack-reference-owner-skill-change-loop-context-budget/proposal.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/design.md](<../changes/archive/2026-10-16-complete-change-packets/design.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/proposal.md](<../changes/archive/2026-10-16-complete-change-packets/proposal.md>)
- [openspec/changes/archive/2026-10-18-approval-package-route-change/proposal.md](<../changes/archive/2026-10-18-approval-package-route-change/proposal.md>)
- [openspec/changes/archive/2026-10-18-preview-build-package-evidence/proposal.md](<../changes/archive/2026-10-18-preview-build-package-evidence/proposal.md>)
- [openspec/changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md](<../changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md>)
- [openspec/changes/archive/2026-10-29-land-accepts-a-harness-replay-and-agrees-with-proof-after-sync/proposal.md](<../changes/archive/2026-10-29-land-accepts-a-harness-replay-and-agrees-with-proof-after-sync/proposal.md>)
- [openspec/changes/archive/2026-10-29-review-identity-ignores-landed-replay-headless-allowlist-reads/proposal.md](<../changes/archive/2026-10-29-review-identity-ignores-landed-replay-headless-allowlist-reads/proposal.md>)
- [openspec/changes/archive/2026-11-16-change-validation-scenario-test-binding/proposal.md](<../changes/archive/2026-11-16-change-validation-scenario-test-binding/proposal.md>)
- [openspec/specs/change/spec.md](<../specs/change/spec.md>)
- [openspec/specs/skill-guidance/spec.md](<../specs/skill-guidance/spec.md>)
- [website/docs/src/content/docs/th/artifacts.md](<../../website/docs/src/content/docs/th/artifacts.md>)
- [website/docs/src/content/docs/th/cli.md](<../../website/docs/src/content/docs/th/cli.md>)
- [website/docs/src/content/docs/th/foundation-config.md](<../../website/docs/src/content/docs/th/foundation-config.md>)
- [website/docs/src/content/docs/th/loop/change.md](<../../website/docs/src/content/docs/th/loop/change.md>)

## แหล่งที่ค้นพบแต่ยังไม่มีข้อเท็จจริงอ้างอิง (hash แล้ว ยังไม่ได้อ่าน)

- [openspec/specs/change/spec.md](<../specs/change/spec.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/proposal.md](<../changes/archive/2026-10-16-complete-change-packets/proposal.md>)
- [docs/reports/agent-harness-simplification-plan-2026-09-03.md](<../../docs/reports/agent-harness-simplification-plan-2026-09-03.md>)
- [openspec/specs/skill-guidance/spec.md](<../specs/skill-guidance/spec.md>)
- [openspec/changes/archive/2026-10-18-approval-package-route-change/proposal.md](<../changes/archive/2026-10-18-approval-package-route-change/proposal.md>)
- [openspec/changes/archive/2026-10-16-complete-change-packets/design.md](<../changes/archive/2026-10-16-complete-change-packets/design.md>)
- [docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md](<../../docs/reports/weekly-review-feedback-remediation-plan-2026-09-11.md>)
- [openspec/changes/archive/2026-11-16-change-validation-scenario-test-binding/proposal.md](<../changes/archive/2026-11-16-change-validation-scenario-test-binding/proposal.md>)
- [docs/reports/ai-native-sdlc-playbook-2026-11-09.md](<../../docs/reports/ai-native-sdlc-playbook-2026-11-09.md>)
- [website/docs/src/content/docs/th/cli.md](<../../website/docs/src/content/docs/th/cli.md>)
- [docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md](<../../docs/reports/concurrent-change-review-efficiency-plan-2026-09-08.md>)
- [openspec/changes/archive/2026-10-15-change-pstack-agent/proposal.md](<../changes/archive/2026-10-15-change-pstack-agent/proposal.md>)
- [openspec/changes/archive/2026-10-29-review-identity-ignores-landed-replay-headless-allowlist-reads/proposal.md](<../changes/archive/2026-10-29-review-identity-ignores-landed-replay-headless-allowlist-reads/proposal.md>)
- [website/docs/src/content/docs/th/foundation-config.md](<../../website/docs/src/content/docs/th/foundation-config.md>)
- [docs/reports/harness-report-make-foundation-agents-surface-an-available-harness-update-durin.html](<../../docs/reports/harness-report-make-foundation-agents-surface-an-available-harness-update-durin.html>)
- [openspec/changes/archive/2026-10-15-change-code-repository-submodule-prove-amend-waive-recovery-issu/proposal.md](<../changes/archive/2026-10-15-change-code-repository-submodule-prove-amend-waive-recovery-issu/proposal.md>)
- [openspec/changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md](<../changes/archive/2026-10-28-skill-catalog-agent-skill/specs/skill-guidance/spec.md>)
- [website/docs/src/content/docs/th/artifacts.md](<../../website/docs/src/content/docs/th/artifacts.md>)
- [openspec/changes/archive/2026-10-15-skill-pstack-reference-owner-skill-change-loop-context-budget/proposal.md](<../changes/archive/2026-10-15-skill-pstack-reference-owner-skill-change-loop-context-budget/proposal.md>)
- [openspec/changes/archive/2026-10-18-preview-build-package-evidence/proposal.md](<../changes/archive/2026-10-18-preview-build-package-evidence/proposal.md>)
- [docs/reports/harness-report-aggregate-semantic-validation-failures-and-make-unavailable-host.html](<../../docs/reports/harness-report-aggregate-semantic-validation-failures-and-make-unavailable-host.html>)
- [website/docs/src/content/docs/th/loop/change.md](<../../website/docs/src/content/docs/th/loop/change.md>)
- [openspec/changes/archive/2026-10-29-land-accepts-a-harness-replay-and-agrees-with-proof-after-sync/proposal.md](<../changes/archive/2026-10-29-land-accepts-a-harness-replay-and-agrees-with-proof-after-sync/proposal.md>)

## ขั้นตอนถัดไป

พร้อมเสนอ Change โดยยังต้องมีเจตนาของผู้ใช้

The investigation is source-grounded and has a terminal conclusion.

คำสั่งที่ agent ใช้ทำต่อ:

```text
cloop investigate openspec/investigations/archive-proof-record.json
```

