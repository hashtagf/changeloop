# Content design and UX writing

Words are interface. Labels, buttons, help, errors and notifications decide
whether people understand what will happen. Source IDs resolve in
[sources.md](sources.md). Error-recovery behavior is in [patterns.md](patterns.md).

Marketing and landing-page copy (headlines, CTAs, proof) is in
[marketing-copy.md](marketing-copy.md).

## Principles

| Principle | Apply | Example |
|---|---|---|
| Use the user's words | Name things as users recognize them, not as the system stores them [S01, S45] | "การแจ้งเตือน" not "webhook config"; "เลขที่คำสั่งซื้อ" not "order_ref" |
| Front-load meaning | Put the important word first in headings, links and list items (project rule) | "ยกเลิกการสมัครสมาชิก" not "หากคุณต้องการยกเลิก กดที่นี่" |
| Be specific | Say exactly what happens, to what, and how much | "โอน ฿125,000 ไปยัง กสิกรไทย ****4821" |
| One term per concept | Keep a glossary; never alternate synonyms for the same object or status | Choose "ถอนเงิน" or "เบิกเงิน" and use it everywhere |
| Plain, short sentences | Keep interface text clear and short [S45]; explain unavoidable jargon once | Domain terms stay when users use them (KYC, SLA) |
| Active voice, user-centered | Who does what is clear | "ระบบส่ง SMS ยืนยันแล้ว" |

## Component-level rules

| Element | Rule | Do | Don't |
|---|---|---|---|
| Button | Verb + object; matches the result; consistent with the toast that follows | "อนุมัติถอนเงิน" → toast "อนุมัติแล้ว" | "ตกลง", "Submit", "ดำเนินการ" for consequential actions |
| Destructive button | Name the consequence | "ลบผู้ใช้ 3 คน" | "ยืนยัน" |
| Link | Describes destination out of context | "ดูประวัติการทำรายการของลูกค้า" | "คลิกที่นี่" |
| Field label | Short noun phrase; always visible (not placeholder-only) | "เบอร์มือถือ" | Label disappears once typing starts |
| Hint | Why or format, before the user errs | "ใช้ส่ง SMS ยืนยัน เช่น 081 234 5678" | Repeating the label |
| Error message | What went wrong + how to fix, specific to the field [S19, S20] | "เบอร์มือถือต้องมี 10 หลัก" | "ข้อมูลไม่ถูกต้อง", error codes alone |
| Empty state | Why it is empty + next action; distinguish first use, no results and failure | "ยังไม่มีคำขอรอตรวจ" vs "ไม่พบรายการที่ตรงกับตัวกรอง [ล้างตัวกรอง]" | "ไม่มีข้อมูล" for every case |
| Confirmation dialog | Title states the action; body states consequence; buttons repeat the verb [S61] | "ลบโปรเจกต์ 'Q4 Launch'? ไฟล์ 32 ไฟล์จะถูกลบถาวร [ลบโปรเจกต์] [ยกเลิก]" | "คุณแน่ใจหรือไม่? [ใช่] [ไม่]" |
| Confirmation page | Outcome, reference number, what happens next, how to change [S44] | "จองสำเร็จ เลขที่ RN-2612-0471 · เราจะส่ง SMS เตือนก่อน 1 วัน" | "สำเร็จ!" with no reference |
| Status label | Noun/adjective from the glossary; color is secondary | "รอตรวจ", "อนุมัติแล้ว", "ปฏิเสธ" | Different names for the same status on different pages |
| Notification | Who/what/when + direct link to the object | "WD-2048 เกิน SLA 8 นาที [เปิดรายการ]" | "มีรายการที่ต้องตรวจสอบ" |
| Loading/progress | Say what is happening if longer than a moment | "กำลังยืนยันการชำระเงิน… อย่าปิดหน้านี้" | Spinner only during a payment |

## Errors — three layers

1. **Prevent**: constraints, good defaults, format hints, confirmation for
   consequential actions.
2. **Explain**: what happened in plain language, without blame or apology
   padding; keep technical IDs for support as secondary text.
3. **Recover**: the next action, with user input preserved.

For system errors, say whether the action happened. "ยังไม่ได้ทำรายการ" or
"ระบบกำลังตรวจสอบผล" are different promises; never imply success or failure
you cannot confirm (see unknown outcomes in [patterns.md](patterns.md#async-and-interrupted-operations)).

## Thai-language specifics

- **Register:** pick one level of politeness for the product (usually neutral
  polite without ครับ/ค่ะ in UI chrome) and keep it consistent. Particles in
  system text read as a person speaking and vary by gender.
- **Mixed Thai/English:** keep English for terms users actually use (OTP, KYC,
  QR) and established product names; don't translate them into unfamiliar Thai
  coinages. Don't mix both languages for the same concept.
- **Numbers and dates:** choose Buddhist or Gregorian year per audience and
  label it when ambiguous; use Thai month abbreviations consistently
  (พ.ย. not Nov.) in Thai UI. See [i18n-performance.md](i18n-performance.md).
- **No word spaces:** long Thai strings need line-break opportunities
  that respect word boundaries; test with real copy at narrow widths.
- **Length:** Thai labels can be shorter or longer than English; never fix
  button widths from one language.

## Length caps (text density in components)

No standard sets microcopy length; these are starting caps from design-system
content guides, to flag copy for a rewrite, not to truncate it. [S115]

| Slot | Aim | Cap | Thai note |
|---|---|---|---|
| Button / menu item | 1–3 words | 4 words | verb + object, ≤ ~14 graphemes on a phone button |
| Field label | 1–4 words | 6 words | short noun phrase |
| Helper / hint text | 1 sentence | 2 sentences | put constraints here, not only in the error |
| Error message | 1–2 sentences | 3 sentences | what happened + how to fix |
| Empty state body | 1–2 sentences | 3 sentences | one next action |
| Any UI sentence | — | 25 words | Carbon voice guideline |

- Count Thai with `Intl.Segmenter('th', {granularity: 'word'})`; Thai has no
  spaces, so `split(' ')` counts a whole sentence as one word.
- Leave about 30–40% room for translation in buttons and errors; never size a
  control to one language.
- When input is length-limited, show a counter and state the limit in the hint;
  the counter is separate from hint and error text. [S116]
- Copy over the cap is a content problem: cut, split into steps, or move detail
  behind a link; do not shrink the type to fit.

## Terminology glossary

Maintain a glossary in [design-context.md](../assets/design-context.md):
term, definition, synonyms to avoid, status names and their color/semantic.
Agents must reuse glossary terms instead of inventing new ones.

## Review checklist

- Every action label states the action and object; destructive ones state consequence.
- Every error says what happened and how to fix it; input is preserved.
- Empty states differ for first use, no results and failure.
- Status and object names match the glossary on every page.
- Copy was tested in context at narrow width and with the longest real values.

## Do / Don't

| Do | Don't |
|---|---|
| Write the copy while designing the flow; it shapes the layout. | Fill with lorem ipsum and "write text later". |
| Use the same verb on the button, confirmation and success message. | Button says "Submit", toast says "Saved", log says "Updated". |
| Explain errors with a fix. | Show "Error 500" or "ข้อมูลไม่ถูกต้อง" alone. |
| Keep one politeness register and glossary. | Switch between "คุณ", "ท่าน" and English across screens. |
