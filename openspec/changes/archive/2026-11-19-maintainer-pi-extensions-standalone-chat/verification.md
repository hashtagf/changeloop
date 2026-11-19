# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795104789001` | pass | 8147c2894d9baba6b5078f67d1d22e7e37ea694fe793be95a80c67a1769776b3 | a51278193ccc71768e48cd1c9852e5d685baa9839b68f4da2b6fd94a5b662afb |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | standalone-chat | pass | 2 discovered; minimum 1 | sh -c node --test pi-extensions/nine-router/test/chat.test.cjs | 5.1 s | 663595cd4f9dd47cbe32c569e54a5a569b5ec86bb37fa7e66a80be4c007d484f |
| test | standalone-chat | pass | exit 0; 5124ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test pi-extensions/nine-router/test/chat.test.cjs | 5.1 s | 853cf6a2613d2604090b886efa5e46c26dbce96ee0e053111fa67d6317012816 |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
