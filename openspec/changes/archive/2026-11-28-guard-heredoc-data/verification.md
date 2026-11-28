# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 3 discovered; minimum 1 | 0.1 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 154534ms; readiness observed | 154.5 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 120ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.1 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795882362341` | pass | bea0b28e17fd57a207395574a17f904dfdcc55c4a7a9398aff1418b7665735c1 | dc9dc8a626725f7de6d963084356c0f6459964818ee45e44beb0472fad5b6fad |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | heredoc-data-stays-data-cd-tmp-ws-cat-a-mjs-eof-body-sh-c-node-t, heredoc-data-stays-data-cd-tmp-ws-node-eof-body-x-sh-c-true, heredoc-data-stays-data-cd-tmp-ws-cat-out-txt-eof-sh-c-true | pass | 3 discovered; minimum 1 | sh -c node --test .claude/harness/tests/shell-heredoc-data.test.mjs | 0.1 s | b913e9514a4bc7e09a5de5ed35dd87ffe53563b6052984aac12beb2519c736c8 |
| static-analysis | heredoc-data-stays-data-cd-tmp-ws-cat-a-mjs-eof-body-sh-c-node-t, heredoc-data-stays-data-cd-tmp-ws-node-eof-body-x-sh-c-true, heredoc-data-stays-data-cd-tmp-ws-cat-out-txt-eof-sh-c-true | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 154534ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 154.5 s | 4acfe5d8b3210fdc286867b72e2b661aca990e65cf5e88fb0fe1a562ccfbfef6 |
| test | heredoc-data-stays-data-cd-tmp-ws-cat-a-mjs-eof-body-sh-c-node-t, heredoc-data-stays-data-cd-tmp-ws-node-eof-body-x-sh-c-true, heredoc-data-stays-data-cd-tmp-ws-cat-out-txt-eof-sh-c-true | pass | exit 0; 120ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/harness/tests/shell-heredoc-data.test.mjs | 0.1 s | a60331e6d5ba60e5bc9cb804efbbd4ca74e7198652767ddad4f2cf0296087877 |
