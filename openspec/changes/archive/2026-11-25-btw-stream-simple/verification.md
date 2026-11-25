# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795587551509` | pass | 6d5b31f3c1af4b7f747e92c6d8b00fcc2719f1c1435419ecc4853140729fc30e | 5f99c76931edfe7d94a20b6976347c27e8acd7131fa638b08c60b9b058f02d21 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | btw-provider-neutral-btw, btw-provider-neutral-esc | pass | 8 discovered; minimum 1 | sh -c cd pi-extensions && node --test btw/btw.test.cjs | 0.5 s | 4a56fc9d161b5742798a0040c867b4a8eebeb8bfbd59c0837ad6dd895b2beead |
| static-analysis | btw-provider-neutral-btw, btw-provider-neutral-esc | pass | consumer quality reduced; lanes 13; failed 0; unavailable 0; reduced assurance 6; exit 0; 11545ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 11.5 s | 2ee4fc6665e60df5659ed420dc5d7703e7ebc462429b95d2ad7b57dc7c021a93 |
| test | btw-provider-neutral-btw, btw-provider-neutral-esc | pass | exit 0; 460ms; readiness observed; critical cases not declared | sh -c cd pi-extensions && node --test btw/btw.test.cjs | 0.5 s | cab28bfec554f4227735444de09b23004de18a84bf19d731cbf387acaf919789 |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
