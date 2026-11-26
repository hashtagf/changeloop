# ผลการพิสูจน์

ผ่านครบทั้ง 4 ด่าน · มี AI review ตรวจแล้ว

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 5 discovered; minimum 1 | 197.7 s |
| AI review (`review`) | ผ่าน | Human verdict (hashtagf, ask_user dbf6540d): same approved content as review-1795677310004, re-recorded after the sandbox was rebased from 6b958bbe onto main 5… | 0.0 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 193133ms; readiness observed | 193.1 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 197695ms; readiness observed; critical cases not declared | 197.7 s |

## Advisory

ไม่มี

## Review

ดู ภาคผนวก: ผล review ใน proposal.md

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795679864610` | pass | b2414edf1ec0ba793bfd69127fa5fe04308b3de1bb5a5a3f31bb98f4aeb7daf7 | 25d8c559cdf13a144791ecc9466ab94fb2fd07e1b182194d069786c4c0f36ccb |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | headless-read-deny-find-delete-find-delete-find-exec-rm-find-exe, headless-read-deny-git-diff-output-x-git-log-p-output-x-git-show, headless-read-deny-find-name-md-git-diff-head-1-git-log-oneline, headless-read-deny-install-sh, headless-read-deny-install-sh-2, headless-read-deny-installer-claude-p | pass | 5 discovered; minimum 1 | sh -c (sh .claude/tests/harness/run-installer-tests.sh) && (node --test .claude/harness/tests/app-smoke.test.mjs) | 197.7 s | 42b465ebc1549f3890e4e6812a90ebb9cd3cada101b2dace5c7b35b766aa854b |
| review | headless-read-deny-find-delete-find-delete-find-exec-rm-find-exe, headless-read-deny-git-diff-output-x-git-log-p-output-x-git-show, headless-read-deny-find-name-md-git-diff-head-1-git-log-oneline, headless-read-deny-install-sh, headless-read-deny-install-sh-2, headless-read-deny-installer-claude-p | pass | Human verdict (hashtagf, ask_user dbf6540d): same approved content as review-1795677310004, re-recorded after the sandbox was rebased from 6b958bbe onto main 5baed4bf with no content change beyond the approved CHANGELOG resolution. | — | 0.0 s | f353977873b765af09e544ec108121c93a30f8d04e9710ffbcf1dd66b48f2917 |
| static-analysis | headless-read-deny-find-delete-find-delete-find-exec-rm-find-exe, headless-read-deny-git-diff-output-x-git-log-p-output-x-git-show, headless-read-deny-find-name-md-git-diff-head-1-git-log-oneline, headless-read-deny-install-sh, headless-read-deny-install-sh-2, headless-read-deny-installer-claude-p | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 193133ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 193.1 s | 1b2a2abe9468f634ba4207137768aa591fc3b4d025854c9051944a901eb0813b |
| test | headless-read-deny-find-delete-find-delete-find-exec-rm-find-exe, headless-read-deny-git-diff-output-x-git-log-p-output-x-git-show, headless-read-deny-find-name-md-git-diff-head-1-git-log-oneline, headless-read-deny-install-sh, headless-read-deny-install-sh-2, headless-read-deny-installer-claude-p | pass | exit 0; 197695ms; readiness observed; critical cases not declared | sh -c (sh .claude/tests/harness/run-installer-tests.sh) && (node --test .claude/harness/tests/app-smoke.test.mjs) | 197.7 s | 7a9bc7b935416be47cc0d711bb195015a7ed5590c4c093ec83846c1a51abb300 |
