# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795176078502` | pass | 93e1a4fbf7218a23f499b67c8e93619e8b73c6c93f38a2e4ca7e951b8a7078ee | 825682e3da02210f0f3f727f0ae240f3a0288456e01956fddbd44b27388eca82 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | compact-repository-scope-proposal, compact-repository-scope-proposal-2, compact-repository-scope-proposal-3 | pass | 29 discovered; minimum 1 | sh -c node --test .claude/harness/tests/reader-guide.test.mjs | 0.4 s | b4e455a094cbce4999feaa2176229dc7a8d531a7484919ba9b3192a8cc939922 |
| test | compact-repository-scope-proposal, compact-repository-scope-proposal-2, compact-repository-scope-proposal-3 | pass | exit 0; 376ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/reader-guide.test.mjs | 0.4 s | a9fe3af02294c71f23eb26dd084f70b137f933b1b88555bc76d73bd0bce3d515 |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
