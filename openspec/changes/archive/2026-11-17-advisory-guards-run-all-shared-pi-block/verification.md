# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1794853633984` | pass | 9cd1a8ee92f58dfbeb1bd97b2ac874770d7154c3c673efdf2573bd76846140d3 | 2d6d4d8c466524bb5c46224ee87317d3cc59fd8f476c34d9ababe92ddafe9e22 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | advisory-tests-gated | pass | 16 discovered; minimum 1 | sh -c FOUNDATION_UPDATE_CHECK=0 node --test .claude/tests/harness/test-registration.test.mjs .claude/harness/tests/pi-shared.test.mjs | 11.2 s | ed788b5d6e378428fb3e8393d1f35579fd0bcb49db2a1bbc689e6cf70268624f |
| static-analysis | release-status-exception | pass | exit 0; 11696ms; readiness observed; critical cases not declared | sh -c (FOUNDATION_UPDATE_CHECK=0 node --test .claude/tests/harness/test-registration.test.mjs .claude/harness/tests/pi-shared.test.mjs) && (grep -q 'v3.7.5 candidate.*no paid smoke' docs/reports/user-scenario-release-status.md) | 11.7 s | 37c8b010cae11b4f7522f111f5cecfd786712d5d110fb9cab3f834bab84a1eda |
| test | advisory-tests-gated | pass | exit 0; 11240ms; readiness observed; critical cases not declared | sh -c FOUNDATION_UPDATE_CHECK=0 node --test .claude/tests/harness/test-registration.test.mjs .claude/harness/tests/pi-shared.test.mjs | 11.2 s | 08ddc7e7c2accc58fe8364472e8002b96addc594275cf435ceb8c25f752fac3f |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
