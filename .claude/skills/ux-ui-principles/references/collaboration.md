# Realtime and multi-user collaboration

Presence, concurrent editing, conflicts, comments, sharing, version history and
offline sync for products where several people touch the same record or
document. Audit and permission rules are in
[trust-security-privacy.md](trust-security-privacy.md); approval queues in
[back-office.md](back-office.md); message channels in
[notifications.md](notifications.md). Source IDs resolve in
[sources.md](sources.md); unlisted public sources are at the end.

## Presence

| Need | Pattern | Rules |
|---|---|---|
| Who else has this page open | Avatar stack in the header | Max 3–5 avatars then "+4"; hover/focus shows names and "กำลังดู" vs "กำลังแก้ไข" |
| Who is editing which part | Field or block outline in the person's color + name tag | Name tag, not color alone [S67]; stable color per person per session |
| Live cursors (canvas, whiteboard, docs) | Named cursors | Only where spatial context matters; hide on forms and tables; let users turn cursors off |
| Record locked by another operator (back office) | Banner at top of record | "สมชาย ก. กำลังแก้ไขรายการนี้ตั้งแต่ 10:42" + what you can do |
| Idle / away | Dim avatar after inactivity | Drop presence after a timeout (this skill's recommendation: 2–5 min idle, immediate on tab close) |

Presence is a hint, not a guarantee: the save path must still detect conflicts.
Respect privacy: let admins disable presence where watching colleagues is
inappropriate, and don't expose presence to customers by default.

## Choose a concurrency model

| Model | Fits | How it surfaces in UI |
|---|---|---|
| Pessimistic lock (check-out) | Back-office records with approval, money, legal text; low concurrency | Banner with holder and since-time; read-only fields; "ขอสิทธิ์แก้ไข" request; locks expire (e.g. 15–30 min idle) and admins can break them with an audit entry |
| Optimistic, detect on save (version/ETag, HTTP `If-Match` → 412) [N1] | Forms and records edited occasionally by several people | Save succeeds normally; on mismatch show the conflict dialog below; never overwrite silently |
| Last-write-wins per field with warning | Low-stakes settings, tags, assignees | Field updates live; toast "ปาริชาติ เปลี่ยนสถานะเป็น 'ส่งแล้ว'" with link to history; history keeps the overwritten value |
| Merge: operational transform or CRDT [N2][N3] | Rich text, canvases, spreadsheets with many simultaneous editors | No conflict dialogs for most edits; show others' changes inline; keep undo local to your own changes |

Pick per object, not per product: a CRM may lock the contract, use optimistic
saves for the customer profile and LWW for tags. Figma, for example, describes
server-authoritative, property-level last-writer-wins for its multiplayer
editor rather than a general CRDT. [N4]

## Conflict dialogs

When a save collides with a newer version:

| Element | Rule |
|---|---|
| Title | What happened, plainly: "มีคนแก้ไขรายการนี้ระหว่างที่คุณแก้" |
| Who and when | "วิภา ส. บันทึกเมื่อ 10:47" |
| Diff | Only the conflicting fields, side by side: ของคุณ / ล่าสุดในระบบ; non-conflicting changes merge automatically and are listed |
| Choices | Per field or per block: keep mine / keep theirs / edit merged value; then Save |
| Escape route | "คัดลอกการแก้ไขของฉัน" or save as draft; Cancel keeps the user's edits on screen |
| Consequential data | Re-confirm amounts and recipients after resolution [S48] |

Rules: never discard the user's unsaved input [patterns.md](patterns.md#forms);
dialog follows the APG modal pattern with focus on the title or first choice
[S15]; don't auto-resolve money, permissions or legal text by timestamp.

## Comments, mentions, threads

| Need | Pattern | Rules |
|---|---|---|
| Discuss a specific part | Anchored comment (text range, field, cell, canvas point) | Anchor survives edits; if the anchor is deleted, keep the thread as "ข้อความต้นทางถูกลบ" |
| Discuss the whole record | Record-level thread in a side panel or tab | Newest at bottom; show unread marker |
| Pull someone in | @mention with people picker | Mention only people with access, or prompt to share first ("วิภา ยังไม่มีสิทธิ์ดู — แชร์ให้ไหม?") |
| Close a discussion | Resolve | Resolved threads collapse but stay searchable and reopenable; record who resolved |
| Suggest a change (docs) | Suggestion mode | Accept / reject per suggestion; author and time visible |

Mentions in Thai: the picker matches Thai and English names and nicknames
("@ฝน", "@Fon"); insert the display name, store the user ID.

## Activity feed vs audit log

| | Activity feed | Audit log |
|---|---|---|
| Audience | Collaborators | Admins, auditors, support |
| Content | Human summary: "กิตติ อนุมัติคำขอ #4471" grouped per burst | Every event: actor, role, action, target, before/after, time with zone, reason |
| Editable | Can be filtered, collapsed, muted | Read-only; corrections are new events |
| Location | Record side panel, workspace home | Admin area, exportable |

Don't present the feed as the audit trail. Audit rules:
[trust-security-privacy.md](trust-security-privacy.md#auditability); page
placement: [back-office.md](back-office.md).

## Sharing and permissions

| Need | Pattern | Rules |
|---|---|---|
| Invite people | Share dialog: people picker + role select + optional message | Roles named by ability: ดูได้ / แสดงความคิดเห็นได้ / แก้ไขได้ / เจ้าของ; explain each in one line |
| Link sharing | Separate "general access" row | Default restricted to the organization or invited people; public link states "ทุกคนที่มีลิงก์" in plain words; expiry option for sensitive items |
| See who has access | List in the same dialog | Each person with role and source (direct, via team, via link); remove or change inline |
| No access | Access-request page | "ขอสิทธิ์เข้าถึง" with optional message; don't reveal the title or owner if that is itself sensitive |
| Owner handles requests | Notification + one-click approve with role choice | Request expires; requester is notified of the outcome |
| Transfer ownership | Explicit flow with confirmation | Say what the old owner keeps |

Show effective access before the user acts; explain disabled actions
("คุณมีสิทธิ์ดูเท่านั้น — ขอสิทธิ์แก้ไข"). Hiding a button is not access control.
[trust-security-privacy.md](trust-security-privacy.md#permissions-ux)

## Version history and restore

- Auto-save versions at meaningful intervals plus named versions ("ฉบับส่งลูกค้า 5 พ.ย.").
- List shows author(s), time, and a summary; preview renders read-only with changes highlighted.
- Restore creates a new version on top; it never deletes newer versions. [S48]
- Partial restore (copy a paragraph or field from an old version) where feasible.
- Retention period stated if old versions expire.

## Offline and sync states

| State | Indicator | User action |
|---|---|---|
| Saved / synced | Quiet text "บันทึกแล้ว" or check, near the title | None |
| Saving | "กำลังบันทึก…" only if it takes >~1 s (this skill's recommendation) | Keep editing |
| Offline, changes queued | Persistent banner "ออฟไลน์ — มี 3 การแก้ไขรอซิงก์" | Keep working; warn before closing the tab |
| Sync failed | Banner + per-item marker, reason and Retry | Retry, copy content, contact support |
| Conflict after reconnect | Item marked "ขัดแย้ง" | Opens the conflict dialog |

Never show "บันทึกแล้ว" before the server confirms. Distinguish "saved on this
device" from "synced" in local-first apps. [N3] Queued consequential actions
(payments, approvals) don't execute offline; say they will be sent later or block
them ([patterns.md](patterns.md)).

## Notifying collaborators

- Notify on mentions, assignments, replies to your threads, access requests and
  decisions on your items; not on every edit.
- Batch bursts ("วิภาแก้ไข 12 จุดในสัญญา A") and suppress push while the
  recipient has the item open.
- Per-item follow/mute and per-type channel settings. Channel and anatomy rules:
  [notifications.md](notifications.md).

## Accessibility of live updates

- Never move focus because someone else changed something; status messages
  are meant to be announced without receiving focus. [S13]
- Announce remote changes through a polite status region, batched and terse
  ("วิภาเพิ่มความคิดเห็น 1 รายการ"); reserve assertive alerts for the user's own
  blocked actions (lock taken, conflict on save). [S13]
- Content that auto-updates needs a way to pause or control updates. [S92]
- Don't reflow the text the user is reading or typing; insert remote content
  without shifting the caret.
- Presence colors meet non-text contrast and are paired with names. [S04][S67]
- Comment threads and activity feeds expose author, time and status
  programmatically; feeds may use the APG feed pattern. [S93]

## Do / Don't

| Do | Don't |
|---|---|
| Detect conflicts on save even with presence shown. | Assume "nobody else is editing" because no avatar appears. |
| Show both versions and let the user choose per field. | Silently keep the last save and drop the other person's work. |
| Name the lock holder and the since-time; let locks expire. | Leave records locked forever by a closed browser tab. |
| Say "ออฟไลน์ — รอซิงก์" until the server confirms. | Show "บันทึกแล้ว" for edits still queued on the device. |
| Restore as a new version. | Overwrite history on restore. |
| Announce remote changes politely. | Steal focus or jump the caret when a collaborator types. |

## Sources (not yet in sources.md)

| ID | Source | Use |
|---|---|---|
| N1 | [MDN: If-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match), [412 Precondition Failed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/412) | Optimistic concurrency on save |
| N2 | [Shapiro et al., Conflict-free Replicated Data Types (2011)](https://inria.hal.science/inria-00609399) | CRDT definition |
| N3 | [Ink & Switch: Local-first software (2019)](https://www.inkandswitch.com/local-first/) | Offline-first collaboration, sync visibility |
| N4 | [Figma: How Figma's multiplayer technology works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/) | Property-level LWW, server authority |

IDs N1–N4 are local to this file; assign S-numbers when adding to sources.md.
