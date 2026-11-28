# ผลการพิสูจน์

ผ่านครบทั้ง 3 ด่าน

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 3 discovered; minimum 1 | 6.1 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 148234ms; readiness observed | 148.2 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 6061ms; readiness observed; critical cases not declared | 6.1 s |

## Advisory

ไม่มี

## Review

change นี้ไม่มีผล review ที่เสร็จแล้ว

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795880301595` | pass | 41f26f7de922c0a225f6c5b45a9b1dc36a870fca65b8d4fbc9fb61219501ae49 | 51f6f8357bcf07e493e7245121de1ab330b279b859600ce4e11e8a55b1f7eb1a |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | union-merge-landed-replay-sync-replay-a, union-merge-landed-replay-sync-replay, union-merge-landed-replay-sync-replay-2, union-merge-landed-replay-sync-replay-3, change-id-from-draft-name-change-start, change-id-from-draft-name-change-start-2, change-id-from-draft-name-change-start-3, change-id-from-draft-name-change-start-4 | pass | 3 discovered; minimum 1 | sh -c (node --test .claude/harness/tests/landed-union-merge.test.mjs) && (node --test .claude/harness/tests/change-id-from-draft.test.mjs) | 6.1 s | 54ba843597a9e413c9912948c044b8c414e9d6fee003e604ed5af3ab93e968e0 |
| static-analysis | union-merge-landed-replay-sync-replay-a, union-merge-landed-replay-sync-replay, union-merge-landed-replay-sync-replay-2, union-merge-landed-replay-sync-replay-3, change-id-from-draft-name-change-start, change-id-from-draft-name-change-start-2, change-id-from-draft-name-change-start-3, change-id-from-draft-name-change-start-4 | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 5; exit 0; 148234ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 148.2 s | 2e1da9cb6142af54373a616e5af42d6dd12785d53f4d8f5714cd4bfbb8bb81d9 |
| test | union-merge-landed-replay-sync-replay-a, union-merge-landed-replay-sync-replay, union-merge-landed-replay-sync-replay-2, union-merge-landed-replay-sync-replay-3, change-id-from-draft-name-change-start, change-id-from-draft-name-change-start-2, change-id-from-draft-name-change-start-3, change-id-from-draft-name-change-start-4 | pass | exit 0; 6061ms; readiness observed; critical cases not declared | sh -c (node --test .claude/harness/tests/landed-union-merge.test.mjs) && (node --test .claude/harness/tests/change-id-from-draft.test.mjs) | 6.1 s | ad0e0ae2ff8ce050f186888a59d200b8a290c73ce422cc863ff07d28db28a0ad |
