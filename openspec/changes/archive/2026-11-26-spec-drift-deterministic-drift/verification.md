# ผลการพิสูจน์

ผ่านครบทั้ง 4 ด่าน · มี AI review ตรวจแล้ว

## ผลแต่ละด่าน

| ด่านตรวจ | ผล | สิ่งที่ตรวจเห็น | เวลา |
|---|---|---|---|
| จำนวนเทสต์ที่พบ (`discovery`) | ผ่าน | 12 discovered; minimum 1 | 34.2 s |
| AI review (`review`) | ผ่าน | f1 is closed. `linkedFiles` now throws `evidence.yaml has no claims (older shape)` when `claims` is missing or empty. It also throws when no claim names the re… | 0.0 s |
| ตรวจคุณภาพโค้ด (`static-analysis`) | ผ่าน | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 220891ms; readiness observed | 220.9 s |
| เทสต์ของโปรเจกต์ (`test`) | ผ่าน | exit 0; 34247ms; readiness observed; critical cases not declared | 34.2 s |

## สิ่งที่ reviewer ฝากไว้ (ยังไม่ได้ทำ ต้องตัดสินใจใน change ใหม่)

- **Linked path containing `..`, an absolute path, or non-`*` glob characters (`[`, `?`, `{`)** — The spec does not say how these are checked. `pathExists` drops those segments from the checked path and does not confine it to the project root.
- **Capability whose spec.md cannot be read** — The row has `requirements:[]` and `status:'unreadable'`. The spec does not say whether it should appear in the counts or in `--pretty` output.
- **Two archives with the same date prefix** — Ordering is alphabetical, not chronological, so which archive counts as the origin is unspecified.

## Advisory

ไม่มี

## Review

ดู ภาคผนวก: ผล review ใน proposal.md

## บันทึกทางเทคนิค

สรุป proof run ที่ Land ยอมรับ receipt ตัวจริงอยู่ใน proof store ของเครื่อง SHA-256 ใช้ระบุแต่ละตัว

| Proof run | สถานะ | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795662323190` | pass | 7d53be8ba82bd0d70f0e7f5b014cc22fe89aafb1069b68593b42e564bc3bf3e2 | b2eebad42223352646584b1fd47282942d985fae7e98270477f3d71baff633ee |

### Provider

| Provider | Claim | สถานะ | ผลที่สังเกต | คำสั่ง | เวลา | SHA-256 ของ receipt |
|---|---|---|---|---|---|---|
| discovery | deterministic-drift-spec-drift, deterministic-drift-spec-drift-2, deterministic-drift-spec-drift-3, deterministic-drift-spec-drift-4, deterministic-drift-spec-drift-capability-spec-review, deterministic-drift-spec-drift-capability-no-such, deterministic-drift-spec-drift-5, deterministic-drift-spec-drift-6, ai-drift-review-spec-drift-review-capability-spec-review, ai-drift-review-spec-drift-review-capability, ai-drift-review-reviewer-reviewer-cli, ai-drift-review-spec-drift-review, read-only-report-spec-drift, read-only-report-drift | pass | 12 discovered; minimum 1 | sh -c (node --test .claude/harness/tests/spec-drift.test.mjs) && (node --test .claude/harness/tests/spec-drift-command.test.mjs .claude/harness/tests/public-command-golden.test.mjs) && (bash .claude/tests/docs/run-doc-consistency.sh) | 34.2 s | 3ed39551b80b819917e233680ca472a8d682a3c6644c83dff4593e0dfe2b89ab |
| review | deterministic-drift-spec-drift, deterministic-drift-spec-drift-2, deterministic-drift-spec-drift-3, deterministic-drift-spec-drift-4, deterministic-drift-spec-drift-capability-spec-review, deterministic-drift-spec-drift-capability-no-such, deterministic-drift-spec-drift-5, deterministic-drift-spec-drift-6, ai-drift-review-spec-drift-review-capability-spec-review, ai-drift-review-spec-drift-review-capability, ai-drift-review-reviewer-reviewer-cli, ai-drift-review-spec-drift-review, read-only-report-spec-drift, read-only-report-drift | pass | f1 is closed. `linkedFiles` now throws `evidence.yaml has no claims (older shape)` when `claims` is missing or empty. It also throws when no claim names the requirement, and when no task covers the claimed ids. `checkCapability` turns each throw into an `unreadable` row with the archive path, so these cases can no longer come out `ok`. The updated test covers `{version:1}`, `claims:[]`, a claims list that never names the requirement, a task that covers none of the claims, and a tasks.md with no task lines. The reason regexes (`/no claim/`, `/no task/`) match the thrown messages. I did not re-verify the unchanged claims from the earlier round. The earlier minor findings (f2–f4) are non-blocking and are not reopened here. | — | 0.0 s | 9b39b09f1326dc9761c1ba8d3161b59dbea18158f87cf42de001d0ea47108829 |
| static-analysis | deterministic-drift-spec-drift, deterministic-drift-spec-drift-2, deterministic-drift-spec-drift-3, deterministic-drift-spec-drift-4, deterministic-drift-spec-drift-capability-spec-review, deterministic-drift-spec-drift-capability-no-such, deterministic-drift-spec-drift-5, deterministic-drift-spec-drift-6, ai-drift-review-spec-drift-review-capability-spec-review, ai-drift-review-spec-drift-review-capability, ai-drift-review-reviewer-reviewer-cli, ai-drift-review-spec-drift-review, read-only-report-spec-drift, read-only-report-drift | pass | consumer quality reduced; lanes 14; failed 0; unavailable 0; reduced assurance 6; exit 0; 220891ms; readiness observed | node .claude/harness/foundation.mjs quality-run --enforce | 220.9 s | 4b672aa3a16f8676217503d0650b975605f39c42af46a13187a165b23c81bc93 |
| test | deterministic-drift-spec-drift, deterministic-drift-spec-drift-2, deterministic-drift-spec-drift-3, deterministic-drift-spec-drift-4, deterministic-drift-spec-drift-capability-spec-review, deterministic-drift-spec-drift-capability-no-such, deterministic-drift-spec-drift-5, deterministic-drift-spec-drift-6, ai-drift-review-spec-drift-review-capability-spec-review, ai-drift-review-spec-drift-review-capability, ai-drift-review-reviewer-reviewer-cli, ai-drift-review-spec-drift-review, read-only-report-spec-drift, read-only-report-drift | pass | exit 0; 34247ms; readiness observed; critical cases not declared | sh -c (node --test .claude/harness/tests/spec-drift.test.mjs) && (node --test .claude/harness/tests/spec-drift-command.test.mjs .claude/harness/tests/public-command-golden.test.mjs) && (bash .claude/tests/docs/run-doc-consistency.sh) | 34.2 s | 16c35b24142c6254dffed662b70e6e15a428a2d2190780c2c15f2d66257f2a50 |
