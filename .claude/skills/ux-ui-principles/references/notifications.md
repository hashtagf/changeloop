# Notifications and cross-channel communication

Email, SMS, push and in-app messages are part of the product experience. They
start journeys (deep links), confirm outcomes, and recover failures. Design
them with the flow, not after it. Source IDs resolve in [sources.md](sources.md).
Native push specifics are in [mobile-native.md](mobile-native.md); wording rules
are in [content-design.md](content-design.md).

## Choose the channel

| Need | Channel | Notes |
|---|---|---|
| Must act now, user may be away (security alert, OTP, payment failed) | Push or SMS | Keep short; SMS for users without the app; OTP via SMS has known security limits |
| Record the user may need later (receipt, booking confirmation, legal notice) | Email (+ in-app history) | Include reference number and all key details; don't rely only on a link |
| Status change while the user is in the product | In-app (toast, banner, badge) | Don't duplicate with push while they are looking at it |
| Digest of non-urgent updates | Email or in-app inbox | Let users choose frequency |
| Marketing | Email/push with explicit opt-in | Separate from service messages; easy unsubscribe |

Rule: one event, one primary channel; add a second only when the first may
fail or the event is critical.

## Message anatomy

| Element | Rule | Example |
|---|---|---|
| Sender | Recognizable product name; consistent sender ID/number | "PayOps", "ริมน้ำ กายภาพบำบัด" |
| First words | The outcome or required action first (previews truncate) | "นัดของคุณยืนยันแล้ว: พฤ. 5 พ.ย. 12:30" |
| Key facts | Reference number, amount, date/time with time zone, place | "เลขที่ RN-2612-0471" |
| Action | One clear action with a deep link to the exact item | "ดูหรือเลื่อนนัด: rimnam.example/b/RN-2612-0471" |
| Next step | What happens next and when | "เราจะเตือนอีกครั้งก่อนนัด 1 วัน" |
| Help | How to get help without replying to a no-reply address | Phone or help link |

Keep service messages plainly formatted: GOV.UK Notify avoids decorative
formatting in emails and sends text messages as plain text. [S87] Leading with
the outcome is this skill's recommendation.

## Security and trust

- Never send passwords, full account numbers or full ID numbers.
- Make messages hard to imitate: consistent sender, no requests for credentials,
  tell users what you will never ask for.
- Links point to your known domain; avoid link shorteners in security messages.
- OTP messages: code first, purpose, validity time, "อย่าบอกรหัสนี้กับใคร".
- Don't include sensitive details in push previews visible on lock screens.

## Frequency and control

- Users can choose types (security, transactions, reminders, marketing) per
  channel; security and legally required messages may not be switchable —
  say so.
- Respect quiet hours and time zones for non-urgent messages.
- Batch or digest bursts; update one notification instead of sending ten.
- Measure opt-out rates per type as a guardrail (see [measurement.md](measurement.md)).

## In-app notifications

| Pattern | Use | Rules |
|---|---|---|
| Toast | Confirmation of the user's own action | Short, optional single action (e.g. undo); auto-dismiss only success/info, never errors; not the only record of important outcomes; live region, never steals focus; pause on hover/focus; not covering primary actions [S13] |
| Inline message | Result tied to a specific field or section | Stays until resolved |
| Banner | Page or system-wide state (maintenance, degraded service, pending approval) | Persistent while true; explains impact and action |
| Badge / count | Unread or pending items | Clears when items are handled, not just viewed; cap display (99+, per [components-usage.md](components-usage.md)) |
| Notification center | History of events | Each item links to the object; mark read/unread |

## Lifecycle mapping

For each journey, list events and their messages:

| Event | Channel | Content | Deep link | Opt-out? |
|---|---|---|---|---|
| Booking confirmed | Email + in-app | Reference, date/time/place, how to change | Booking detail | No (transactional) |
| Reminder 24 h before | Push or SMS | Time, place, preparation | Booking detail | Yes |
| Payment failed | Email + push | What failed, amount, how to fix | Payment method page | No |
| Withdrawal over SLA (back office) | In-app badge + push to on-shift operators | ID, minutes over SLA | Queue item | Per role setting |

## Review checklist

1. Every event that changes user state has a defined message (or a reason for none).
2. First words carry the outcome; key facts and reference included.
3. Deep link opens the exact item and works when signed out (sign in, then continue).
4. No secrets or full identifiers; lock-screen previews are safe.
5. Users can control non-essential types per channel.
6. Copy and terms match the in-app glossary.
7. Thai and English variants exist where the product is bilingual; dates use the user's locale.

## Do / Don't

| Do | Don't |
|---|---|
| Put the outcome and key details in the first line. | Start with "เรียนลูกค้าผู้มีอุปการคุณ". |
| Link to the exact item. | Link to the home page and make users search. |
| Let users mute reminder types they don't want. | Offer only "all notifications on/off". |
| Keep a record in-app for important events. | Rely on a toast as the only proof a payment succeeded. |
