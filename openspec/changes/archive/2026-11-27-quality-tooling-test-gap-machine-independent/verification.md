# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 11 discovered; minimum 1 | 0.6 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 208566ms; readiness observed | 208.6 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 638ms; readiness observed; critical cases not declared | 0.6 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795747601695` | pass | 0e906e194921c0075a4afe1948eedc6149f5e365ab35668c2d1466aa62ddbdc9 | 5d790a3464def6c4fd12bafee536ce8c32c65d652855e918816caba7e7580959 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | test-gap-machine-independent-quality-discover, test-gap-machine-independent-quality-discover-2 | pass | 11 discovered; minimum 1 | sh -c node --test .claude/harness/tests/test-gap-discovery.test.mjs | 0.6 s | 979d42133f424a898779c68693488230835b463de71d65f4c682432fac3751af |
| static-analysis | test-gap-machine-independent-quality-discover, test-gap-machine-independent-quality-discover-2 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 208566ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 208.6 s | ab391784adb057d26c7ff347263120ab08dd4d97f613bac1e7d0dc60d8f724e5 |
| test | test-gap-machine-independent-quality-discover, test-gap-machine-independent-quality-discover-2 | pass | exit 0; 638ms; readiness observed; critical cases not declared | sh -c node --test .claude/harness/tests/test-gap-discovery.test.mjs | 0.6 s | f424cfd509c87a2d7e52561151eaa43b7599cc7ee9674b77d0f5a12a46f1f0b5 |
