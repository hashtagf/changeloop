# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 3 discovered; minimum 1 | 0.1 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 158366ms; readiness observed | 158.4 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 132ms; readiness observed; critical cases not declared | 0.1 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795882990649` | pass | c2f3ff11b97f19e35c153c7f0103eef1e094c37dc0ce8007d51581d6cd9256c2 | 9e55034a8c13448c6bbdb7450c72b58806dcb0e57c410b80995d5a0d272de713 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | investigation-binding-by-id-draft-investigation-demo, investigation-binding-by-id-draft-investigation-id-demo, investigation-binding-by-id-draft-investigation-demo-2, investigation-binding-by-id-draft | pass | 3 discovered; minimum 1 | sh -c node --test .claude/harness/tests/investigation-bind-by-id.test.mjs | 0.1 s | 7e59d2242d6804e25ad4246873d67b4b25d219ff425ee0268f91c3a4a83ba2c7 |
| static-analysis | investigation-binding-by-id-draft-investigation-demo, investigation-binding-by-id-draft-investigation-id-demo, investigation-binding-by-id-draft-investigation-demo-2, investigation-binding-by-id-draft | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 158366ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 158.4 s | d06861b1b9f2560f3dcc7069cd7e084ac1ba32361777608f7ff17ac3910a5856 |
| test | investigation-binding-by-id-draft-investigation-demo, investigation-binding-by-id-draft-investigation-id-demo, investigation-binding-by-id-draft-investigation-demo-2, investigation-binding-by-id-draft | pass | exit 0; 132ms; readiness observed; critical cases not declared | sh -c node --test .claude/harness/tests/investigation-bind-by-id.test.mjs | 0.1 s | bcd9b98b9782464426909cdd03dcdb349694709d651b4a71343c21ae65364da8 |
