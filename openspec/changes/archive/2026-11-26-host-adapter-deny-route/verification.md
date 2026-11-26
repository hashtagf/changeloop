# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 9 discovered; minimum 1 | 0.8 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 178313ms; readiness observed | 178.3 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 785ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | 0.8 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795680551837` | pass | 0e9cd570988b76219eed9d231eeb711f287182759f4e64e90a1cb480c4693ab8 | 106600bfd9d665c537d06c54182a84e43109a2757b482b4f0f22b9c697b8ed15 |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | deny-route-agent-find-name-md-exec-grep-l-x, deny-route-agent-find-build-name-tmp-delete, deny-route-agent-git-diff-head-1-output-patch-diff, deny-route-agent-find-exec-grep-x, deny-route-agent-find-name-okhttp, deny-route-agent-find-delete | pass | 9 discovered; minimum 1 | sh -c node --test .claude/tests/hooks/shell-route-guard.test.mjs | 0.8 s | cdf06129e798c8b5f8857fc7b4efaa0a13fdda5dd0e22205d398c1cf3ac520b4 |
| static-analysis | deny-route-agent-find-name-md-exec-grep-l-x, deny-route-agent-find-build-name-tmp-delete, deny-route-agent-git-diff-head-1-output-patch-diff, deny-route-agent-find-exec-grep-x, deny-route-agent-find-name-okhttp, deny-route-agent-find-delete | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 178313ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 178.3 s | e8b86583afed055415da5e72fc0031b69be11b39287bb246d3032299c9ac4ad6 |
| test | deny-route-agent-find-name-md-exec-grep-l-x, deny-route-agent-find-build-name-tmp-delete, deny-route-agent-git-diff-head-1-output-patch-diff, deny-route-agent-find-exec-grep-x, deny-route-agent-find-name-okhttp, deny-route-agent-find-delete | pass | exit 0; 785ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test .claude/tests/hooks/shell-route-guard.test.mjs | 0.8 s | ee43462df88dfca7b08b48964105cc1cfb157cb61b96672b9890624f527c9ae8 |
