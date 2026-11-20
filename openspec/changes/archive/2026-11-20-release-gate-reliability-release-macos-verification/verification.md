# ผลการพิสูจน์

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795177993470` | pass | ced403e7204a33495fac688f805b13159b68670f15d2bde194042cac74caab36 | f3084d523f9db44eb6addd907a224d6b1e6e51f36b339f5f5d61e1e9c65b958a |

## Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | release-macos-verification-process-runtime-coverage, release-macos-verification-deterministic-gate | pass | 12 discovered; minimum 1 | sh -c node --test .claude/harness/tests/process-runtime.test.mjs | 0.5 s | a07ca9d138a5e2afa0f6bc27e0d535c107cfa3d3ea9fca99f49e78912cad5d04 |
| test | release-macos-verification-process-runtime-coverage, release-macos-verification-deterministic-gate | pass | exit 0; 497ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/process-runtime.test.mjs | 0.5 s | 4ab86473abcf47351d8f76668165d9b2f9c26df134beedbf2a8804a2bbdcebc7 |

## Advisory

- deployment: policy-inferred-unwired

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว
