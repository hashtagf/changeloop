# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795170602727` | pass | 73acdef87c91ce2970d1a42df6cca1819816d6ffc353892ae4d12ee2575dd86a | 293909b049b9e7001044f06cffe9e8619c63f9fbb07a6ca98f9dc60db0cffda9 |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | legacy-prototype-sync-package, legacy-prototype-sync-package-2, legacy-prototype-sync-package-3 | pass | 28 discovered; minimum 1 | sh -c node --test .claude/harness/tests/approval-package.test.mjs | 1.3 s | 2ffc868172c57a8ddc9a29f14f93feb61241d5c458d629dd19228968d646a314 |
| review | legacy-prototype-sync-package, legacy-prototype-sync-package-2, legacy-prototype-sync-package-3 | pass | All three compatibility scenarios are implemented and covered by changed tests. Two unrelated release-qualification documentation edits are minor scope-discipline issues. | — | 0.0 s | e1153db940b44d4807912665a36e9c69d8695c0f19febe4d952de79ff395443c |
| test | legacy-prototype-sync-package, legacy-prototype-sync-package-2, legacy-prototype-sync-package-3 | pass | exit 0; 1261ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/approval-package.test.mjs | 1.3 s | b5e122d3d79cd9b627c32caeec52bf01123d7f0316d9c470016dcd6845283f11 |

## Advisory

ไม่มี

## Review

ดู ภาคผนวก: ผล review ใน proposal.md
