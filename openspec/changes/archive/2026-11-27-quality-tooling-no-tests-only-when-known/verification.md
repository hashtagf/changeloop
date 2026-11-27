# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 11 discovered; minimum 1 | 0.6 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 134418ms; readiness observed | 134.4 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 613ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.6 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795746077917` | pass | bde5e318c3c3fcf46a03227ba69530b622252b489cabe75bd4bfb269a9683b15 | 111d023b354e619d411a56d358e83410c936d347fdfe3140f12e64f3c519146b |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | no-tests-only-when-known-quality-discover, no-tests-only-when-known-quality-discover-2, no-tests-only-when-known-3, no-tests-only-when-known-quality-discover-3, ci-list-commands-quality-discover, ci-list-commands-quality-discover-2 | pass | 11 discovered; minimum 1 | sh -c node --test .claude/harness/tests/test-gap-discovery.test.mjs | 0.6 s | 02f9a8453b56157631a4f0728bd7c83cac627ead933004e21909660e2c7855bc |
| static-analysis | no-tests-only-when-known-quality-discover, no-tests-only-when-known-quality-discover-2, no-tests-only-when-known-3, no-tests-only-when-known-quality-discover-3, ci-list-commands-quality-discover, ci-list-commands-quality-discover-2 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 134418ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 134.4 s | 03a972b9bc5659578a9984d928d575873c55c819a49a29aa84f976470745f712 |
| test | no-tests-only-when-known-quality-discover, no-tests-only-when-known-quality-discover-2, no-tests-only-when-known-3, no-tests-only-when-known-quality-discover-3, ci-list-commands-quality-discover, ci-list-commands-quality-discover-2 | pass | exit 0; 613ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/test-gap-discovery.test.mjs | 0.6 s | cf7f46c065e64213d6080e9c207d48dc0fc14f068f7254a2a8e2932c9a633315 |
