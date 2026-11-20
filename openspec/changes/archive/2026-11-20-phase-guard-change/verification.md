# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795110900086` | pass | 24a7b7f470e7f1f7428d6cec851e4000af1723bcc7bfa24145627da5558353e3 | 15aa7a66d5559e27db5a176a391d9e46d19c9bc9037c294980a313e21d905d42 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | prephase-approval-preview-write-prototype-html-b2b-office-uat-ap, prephase-approval-preview-resolve, approval-page-authored-by-skill-advance, approval-page-authored-by-skill-advance-2, approval-page-authored-by-skill-3, approval-page-authored-by-skill-change-start, approval-page-authored-by-skill-package, prototype-sync-package, prototype-sync-agent-draft-change-revise, prototype-sync-package-2, prototype-sync-advance-prove, prototype-sync-package-3, prototype-sync-prove-land, prototype-sync-prototype-package, prototype-checklist-package, prototype-checklist-package-2, prototype-checklist-package-3, prototype-checklist-4, prototype-checklist-package-4, prototype-checklist-package-5, prototype-checklist-package-6, prototype-checklist-harness, prototype-checklist-change-start | pass | 43 discovered; minimum 1 | sh -c (bash .claude/tests/hooks/run-phase-mutation-guard-tests.sh) && (node --test .claude/harness/tests/approval-package.test.mjs .claude/harness/tests/prototype-checklist.test.mjs) | 14.6 s | c4cad7cd47b022a24f4b828fcef86ba9fd754ee40ca284b07b618f5308258d1a |
| test | prephase-approval-preview-write-prototype-html-b2b-office-uat-ap, prephase-approval-preview-resolve, approval-page-authored-by-skill-advance, approval-page-authored-by-skill-advance-2, approval-page-authored-by-skill-3, approval-page-authored-by-skill-change-start, approval-page-authored-by-skill-package, prototype-sync-package, prototype-sync-agent-draft-change-revise, prototype-sync-package-2, prototype-sync-advance-prove, prototype-sync-package-3, prototype-sync-prove-land, prototype-sync-prototype-package, prototype-checklist-package, prototype-checklist-package-2, prototype-checklist-package-3, prototype-checklist-4, prototype-checklist-package-4, prototype-checklist-package-5, prototype-checklist-package-6, prototype-checklist-harness, prototype-checklist-change-start | pass | exit 0; 14607ms; readiness observed; critical cases not declared | sh -c (bash .claude/tests/hooks/run-phase-mutation-guard-tests.sh) && (node --test .claude/harness/tests/approval-package.test.mjs .claude/harness/tests/prototype-checklist.test.mjs) | 14.6 s | 3ea3c4ac2ccc712fe64fdc4436fbf4c41c1a6db49ad1d1a5b108300e0cfe2e90 |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
