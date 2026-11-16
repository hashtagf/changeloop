# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1794846003622` | pass | f5f6d067a3a6f5e22dc20ab90556d45d0f6d75c5ef4239819c94663d94ea61b6 | 6309e5703bede30b63f7b36b78b2f6eb53d1fc486e70b264fce4656b55f508cb |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | agents-default-64-harness-policy, agents-default-64-foundation-json-maxparallelagents-64, agents-default-64-foundation-json-maxparallelagents-65, agents-default-64-foundation-json-maxparallelproviders-17 | pass | 10 discovered; minimum 1 | sh -c node .claude/tests/harness/run-runtime-environment-policy-tests.mjs | 0.1 s | 98483e649220db5d5026f54b8812a9453facd39aba46904116d44bf483036630 |
| test | agents-default-64-harness-policy, agents-default-64-foundation-json-maxparallelagents-64, agents-default-64-foundation-json-maxparallelagents-65, agents-default-64-foundation-json-maxparallelproviders-17 | pass | exit 0; 75ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node .claude/tests/harness/run-runtime-environment-policy-tests.mjs | 0.1 s | f440d6a0936cb7877f38547a6b4e41bf8f28bdef3729e64033386787042f260f |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
