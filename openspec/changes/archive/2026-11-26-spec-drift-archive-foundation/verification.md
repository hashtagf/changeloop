# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 23 discovered; minimum 1 | 0.5 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 179160ms; readiness observed | 179.2 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 455ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.5 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795668719770` | pass | 9ff642892a4d5c40d273613bf3bc056f180c3e1f0415ae0329ee7d5e06346b3b | d9a3b8d119d318e016fbc880641b2f7cac710d753d672c4c4d65fdc0dc35c7ee |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | drift-path-accuracy-spec-drift, drift-path-accuracy-spec-drift-2, drift-path-accuracy-spec-drift-3, drift-path-accuracy-spec-drift-4, drift-path-accuracy-spec-drift-5 | pass | 23 discovered; minimum 1 | sh -c node --test .claude/harness/tests/spec-drift.test.mjs | 0.5 s | 40a3b22195a07b2494fb6cbde80338e4929ce8b90ab0e4b79d76f76756d5cf46 |
| static-analysis | drift-path-accuracy-spec-drift, drift-path-accuracy-spec-drift-2, drift-path-accuracy-spec-drift-3, drift-path-accuracy-spec-drift-4, drift-path-accuracy-spec-drift-5 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 179160ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 179.2 s | edd74677e46a47f2f97a6beba12bbfd7d8a4a6d7245b9bcc8a1b3fafe4839251 |
| test | drift-path-accuracy-spec-drift, drift-path-accuracy-spec-drift-2, drift-path-accuracy-spec-drift-3, drift-path-accuracy-spec-drift-4, drift-path-accuracy-spec-drift-5 | pass | exit 0; 455ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/spec-drift.test.mjs | 0.5 s | 8705b26ce57c7b5c66999ded6f46b25c55006e4ce03c7f67f8dd7a520ebe3029 |
