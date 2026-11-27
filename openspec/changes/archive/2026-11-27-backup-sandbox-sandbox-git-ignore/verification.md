# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 29 discovered; minimum 1 | 15.8 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 129754ms; readiness observed | 129.8 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 15805ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 15.8 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795746532703` | pass | 196e9f816099b92d6dfe085add1b59cf75e39f9fa17447baea79269bf4a6845e | 4c2672e9246c9faf4fb82c48807a3956b1cd9b363bd4642a72d8e976447a3ec7 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | backup-ignored-exclude-backup-sandbox, backup-ignored-exclude-backup-sandbox-2 | pass | 29 discovered; minimum 1 | sh -c node --test .claude/harness/tests/sandbox-data-loss.test.mjs | 15.8 s | 37b66296652effc46d28f0f655e52766862b6e52d0552e36f62f01750042e46f |
| static-analysis | backup-ignored-exclude-backup-sandbox, backup-ignored-exclude-backup-sandbox-2 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 129754ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 129.8 s | 0ae068076ee047c708e34f69ccf1c2454951ea136107937433bc8f9835f91a71 |
| test | backup-ignored-exclude-backup-sandbox, backup-ignored-exclude-backup-sandbox-2 | pass | exit 0; 15805ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/sandbox-data-loss.test.mjs | 15.8 s | 27ca99bcc604dcc7a23454ff13aff66798209b7444d78c34819c5df544d8ae66 |
