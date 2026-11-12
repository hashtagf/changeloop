# Marketing copy — headline, subheadline, CTA, proof, sections

Copy for landing pages, marketing sites, pricing and app-store-style pages.
Interface microcopy (buttons inside the product, errors, empty states, glossary)
is in [content-design.md](content-design.md); the page argument and idea
sentence are in [design-quality.md](design-quality.md) §1; the visitor's
question order is in [customer-ui.md](customer-ui.md).

Evidence: hero and section copy extracted from 32 public pages (22 English,
10 Thai) on 2026-11-04 — see [copy study](../assets/evidence.md). Counts are
manual classification. These are project recommendations, not conversion
findings; only a test on the real audience shows what converts
([measurement.md](measurement.md)).

## 0. Before writing

Collect, in one batch, and write nothing until the facts exist:

| Input | Why |
|---|---|
| One offer, one audience, one primary action | Every line serves that action |
| Fact inventory: numbers, prices, limits, mechanisms, integrations, named customers (with permission) | Specific copy is built from facts, not adjectives |
| The old way it replaces (tool, step, wait, cost) | The strongest Thai and English lines name it |
| Top 3 objections | Become proof placement, FAQ and risk-reducers |
| Traffic source and what visitors already know | Ad copy and hero must make the same promise |

**Never invent proof.** Customer counts, ratings, testimonials, logos, savings
and awards come from the client. Missing facts become marked placeholders
(`{{จำนวนลูกค้า}}`) in draft copy and the hand-off only, never rendered on the
page; leave that proof out instead ("Pages with no proof yet" below). Claims hanging on an asterisk
("ถูกสุดทุกวัน*") are a trust and legal risk: state the condition in words.

## 1. Headline

**Types observed (English n=22, Thai n=9 of 10 pages; counts in [copy study](../assets/evidence.md)):**

| Type | Count | Use when | Example |
|---|---|---|---|
| Category definition ("[Category] for [audience]", "Where [audience] [job]") | EN 11 · TH 5 | Visitors don't yet know what it is | "Email for developers" (Resend); "Where people find the time to meet" (Cal.com) |
| Outcome claim | EN 4 · TH 3 | The outcome is concrete and believable | "Save 4+ hours each week…" (Superhuman); "Build in a weekend / Scale to millions" (Supabase) |
| Short provocative statement | EN 4 | Brand is known or the category is obvious | "Time is money. Save both." (Ramp) |
| "[Name] is your [category] for [ambition]" | EN 2 | New name in a crowded category | "Cursor is your coding agent for building ambitious software." |
| Contrast with the category | EN 1 | Real difference you can prove below | "Radically different banking" (Mercury) |
| Adjective stack | TH 1 | Never — rewrite (§8) | "ใช้งานง่าย สะดวก ปลอดภัย…" |

- **Length:** English 2–11 words, median 6. Thai ~20–50 characters, median ~40.
  Must fit two lines at every width ([design-quality.md](design-quality.md)).
- **Two lines on purpose:** split by idea ("Build in a weekend / Scale to
  millions"); Thai breaks at a phrase space, never mid-word.
- **Trend words blend in.** 6/22 English heroes said "agent/agentic"; a word
  everyone uses no longer differentiates. Run the competitor test: swap in the
  nearest competitor's name; if the headline still works, it says the category.
- Put the audience in only when it qualifies the reader ("for software companies").

**First screen answers the visitor's first question** in large type. Event: what, when,
where; the date goes in the headline or at the second size. Product: what it is and what it
does or costs. Person: who and what they do. A bare-name h1 needs a plain line under it
(≥18px) saying what it is.

## 2. Subheadline

The subheadline does one job the headline didn't. Observed jobs:

| Job | Count | Example |
|---|---|---|
| Mechanism — what it does, often three verbs | ~10 | "Capture context, find answers, and automate tasks…" (Notion) |
| Define, then "That means" consequence | 1 (strongest) | "We're your merchant of record. That means we handle payments, merchant fees, fraud and sales tax…" (Lemon Squeezy) |
| Scope or range | 2 | "from your first transaction to your billionth" (Stripe) |
| Proof | 3 | "Making time for millions of people every month." (Cal.com) |
| Contrast | 1 | "reach humans instead of spam folders" (Resend) |

Length 12–22 English words, one or two sentences. Thai: one line of verb chunks
plus scope ("โอน เติม จ่าย ถอน ฝาก ทำเองได้ทุกที่"); a six-clause Thai sub is a
paragraph, not a subheadline.

## 3. Calls to action

**Primary — verb + what they get:**
- "Get started" family 10/22 (4 add "for free"); product verbs 9/22
  ("Deploy now", "Open account", "Start your project", "Download for macOS",
  "Try for $0"). Product verbs are more specific; prefer them.
- 10/22 put "free" or "$0" in the label when a free plan exists.
- Thai: "สมัครใช้งานฟรี", "ทดลองใช้ฟรี", "เริ่มใช้งานเลย", "ดาวน์โหลดแอป",
  "เปิดบัญชี", "จองเวลา", "ชำระ ฿1,250". Never "เพิ่มเติม", "รายละเอียด",
  "Learn more", "Submit" as the main action.

**Secondary — a different path, not a weaker duplicate:**
- Sales path: "Talk to sales", "Request a demo" / "นัดสาธิตการใช้งาน" (9/22)
- Developer path: "Documentation", "Install via Homebrew" (3/22)
- Returning user: "I already have an account"
- Thai B2B: a phone number with hours works as a secondary CTA
  ("คุยกับนักบัญชีได้ทุกวัน 02-xxx-xxxx").

**Risk-reducer next to the button** — only ~6/22 did it, so it is an easy gain:
"No credit card required", "ไม่ต้องใช้บัตรเครดิต", "ยกเลิกได้ทุกเมื่อ",
trial length ("ทดลองใช้ฟรี 30 วัน"), requirements stated up front
("ต้องใช้ macOS 15 ขึ้นไป"). No Thai homepage studied showed trial length or
"no card" — use them when true.

One primary per view; the final CTA repeats the hero action.

## 4. Proof

**Where:** directly under the hero CTA (9/32), as the first h2 (5/32), or a
mid-page logo band (~8/32). Put each proof beside the claim it supports:
user count beside the free CTA, rating beside sign-up, transaction volume
beside the security claim.

**What reads as proof:**
- specific numbers with units: "Join 85,000…", "4.9 · 3,050 รีวิว",
  "30,000 บริษัท"
- before/after with a case number: "Finding a time took a week of emails.
  Now it's one link." + "Deel spends 35% less time scheduling" (Cal.com)
- honest pricing proof: "97% of users pay us $0" (PostHog)
- named testimonial with role and company (with permission)

**What doesn't:** "trusted by thousands of companies", "the most innovative
organizations", "หลากหลายธุรกิจที่ไว้ใจเรา" (3 sites) — vague proof reads as
no proof. Fake-looking round numbers are worse than none.

## 5. Section copy below the fold

- **Benefit as verb + object:** "Get answers, instantly—with citations.";
  "Set user access on autopilot."; "Integrate tonight".
- **"A, not B" contrast** (5 sites): "Take shortcuts, not detours." — strong,
  but once per page; repeated it becomes a tic.
- **Two-tier heading:** short line, then one plain sentence that explains it
  ("Don't repeat yourself." / "Automate the things you do all the time.").
- **Numbers in section heads** (~10 sites): "ภายใน 1 นาที", "Save 4+ hours".
- **Feature-noun labels** ("Authentication", "Edge Functions") suit developers
  scanning capabilities; elsewhere they read flat — add the benefit.
- **Final CTA:** repeat the hero promise, or add the reassurance
  ("Free for individuals, no credit card, no usage limits."). Avoid
  "Take your business to the next level", "Your next idea starts here".

## 6. Formulas (use as starting points, then make specific)

| Formula | Real example |
|---|---|
| [Category] for [audience] | "Email for developers" — resend.com |
| [Small effort] / [Big scale] | "Build in a weekend / Scale to millions" — supabase.com |
| [Idiom]. [Twist]. | "Time is money. Save both." — ramp.com |
| Where [audience] [job] | "Where teams and agents build together." — notion.com |
| Define. That means [consequence]. | Lemon Squeezy merchant-of-record sub |
| [Old pain]. Now [new state]. + case number | Cal.com scheduling section |
| [A], not [B] | "Reach humans, not spam folders" — resend.com |
| [งาน]ได้ภายใน [เวลา] ไม่ต้อง[เครื่องมือเดิม] | "เปิดบิลง่ายภายใน 1 นาที ไม่ต้องใช้ Excel" — flowaccount.com |
| ไม่รู้ [X] ก็ใช้ได้ | "ไม่รู้บัญชี ก็ใช้งานได้" — flowaccount.com |
| คำกริยาเรียงกัน + ขอบเขต | "โอน เติม จ่าย ถอน ฝาก ทำเองได้ทุกที่" — K PLUS |
| รู้ X รู้ Y รู้ Z | "รู้ต้นทุน รู้กำไร รู้สต็อกสินค้า" — peakaccount.com |
| Price anchor | "เดือนละ 19.- หรือปีละ 99.-" — LINE MAN |

A formula filled with adjectives is still filler; the slot must hold a fact.

## 7. Thai marketing copy

- **Register:** semi-formal; address the reader as "คุณ" or not at all. ครับ/ค่ะ
  appeared 0 times in heroes and sections studied; keep them for chat, support
  and first-person testimonials.
- **Shape:** phrase chunks separated by spaces; verb stacks and short rhyming
  couplets ("ของไม่ขาด โอกาสไม่หาย") are native and memorable — one per page,
  never a page of slogans.
- **Specificity moves used by the stronger Thai pages:** a time unit ("ภายใน
  1 นาที", "ตลอด 24 ชม."); the old tool or step removed ("ไม่ต้องใช้ Excel",
  "ไม่ต้องคีย์ซ้ำ", "ไม่ต้องไปสาขา"); named channels ("Facebook, LINE OA,
  Instagram"); exact prices; the beginner's fear answered; the mechanism named
  ("ยืนยันตัวตนด้วยการสแกนใบหน้า").
- **Loanwords:** keep the term users search for (POS, AI, แดชบอร์ด) and spell it
  one way across the site — "สต็อก" vs "สต๊อก" varied between sites; put it in
  the glossary ([content-design.md](content-design.md)).
- **Don't** ship a /th page in English, or English section labels on a Thai page
  without reason.

**Copy tells.**
- Say each fact once; a price or time repeated in four sections is filler. A section's last
  line never restates its heading.
- Few em/en dashes in page copy; prefer a comma, colon or full stop (Reflex, waivable).
- No "Not X. Y." rebuttal cadence; no "not just X, it's Y".
- No rotated labels, scroll cues, BETA pills or locale/weather strips as decoration.
- A link with no known URL points to the in-page section that does that job; never invent a route.

## 8. Filler → specific

| Filler (observed) | Replace with |
|---|---|
| ครบจบในที่เดียว / ครบวงจร (5+ sites) | list the 3–4 things it covers |
| ตอบโจทย์ทุกความต้องการ | which need, for whom |
| ใช้งานง่าย (4 sites) | time or steps: "เปิดบิลใน 1 นาที" |
| มีประสิทธิภาพ / ยกระดับ | the measurable change |
| ไร้รอยต่อ / seamless | what syncs, when ("ตัดสต็อกทันทีเมื่อขายหน้าร้าน") |
| สะดวก ง่าย ปลอดภัย (stack) | the actions + the security mechanism |
| ระดับมืออาชีพ / สำหรับนักธุรกิจยุคใหม่ | the audience by situation |
| supercharge / revolutionize / next level / powerful / effortless | the action and its result |
| "has never been easier, faster, or more secure" | one proof for one of the three |

## 9. Rewrites (weak copy paraphrased from the study; brands anonymised)

Rewrites reuse only facts each page states elsewhere; confirm with the client.

| Page | Before | After |
|---|---|---|
| Thai POS SaaS h1 | POS หน้าร้านเชื่อมกับระบบขายของออนไลน์แบบไร้รอยต่อ | ขายที่หน้าร้าน สต็อกออนไลน์ตัดตามทันที ไม่ต้องคีย์ซ้ำ |
| Thai accounting SaaS sub | ยกระดับการทำบัญชีของคุณให้มีประสิทธิภาพ ลดภาระงานเอกสาร ประหยัดเวลา… | ดึงยอดจากร้านค้าออนไลน์ลงบัญชีอัตโนมัติ ไม่ต้องคีย์ซ้ำ · 30,000 บริษัทใช้อยู่ |
| Thai super-app section | ครบจบทุกความต้องการด้วย 4 บริการหลัก ระดับมืออาชีพ | สั่งอาหาร ช้อปของใช้ เรียกรถ ส่งเอกสาร 4 บริการในแอปเดียว ตลอด 24 ชม. |
| Thai banking app h1 | ใช้งานง่าย สะดวก ปลอดภัย รู้ใจทุกโมเมนต์ | โอน เติม จ่าย ถอน ฝาก ทำเองได้ทุกที่ / ยืนยันตัวตนด้วยการสแกนใบหน้า |
| Payments SaaS final CTA | Take your business to the next level | We handle payments, fees, fraud and sales tax. You ship software. |

## Review checklist

1. Headline passes the competitor test and fits two lines at every width (Thai: [visual system](visual-system.md) Part A "Headline length").
2. Subheadline adds mechanism, consequence, scope or proof — not more adjectives.
3. Primary CTA is verb + what they get; one per view; secondary is a different path.
4. A risk-reducer sits next to the CTA when one is true.
5. Every proof is specific, sourced, and beside the claim it supports.
6. No filler from §8; every formula slot holds a fact.
7. Thai: semi-formal, consistent loanword spelling, phrase-level line breaks.
8. No invented numbers, names, logos or testimonials; placeholders listed.
9. Ad/source message matches the hero promise.

## Do / Don't

| Do | Don't |
|---|---|
| "เปิดบิลใน 1 นาที ไม่ต้องใช้ Excel" | "ใช้งานง่าย สะดวก รวดเร็ว" |
| "Start your project" + "No credit card required" | "Get started" alone with a hidden card requirement |
| Rating with review count under the sign-up button | "Trusted by thousands" with no number |
| State the condition of a price claim in words | Hang the headline claim on an asterisk |
| One "A, not B" line on the page | Every section as a contrast slogan |

## Pages with no proof yet

When there are no clients, numbers or testimonials, do not fill the proof slot. Replace it with something true: how the
work runs (three steps), what you get and by when, who will do it, an honest "first project" offer, or a plain fact
strip (length of the first call, price of the first step, languages). Say so in the hand-off; add real proof when it exists.

## Placeholder mode (the user asks to build with placeholders)

When the user says "use placeholders for everything" (a real business whose facts are not in yet), the page
renders its **facts** as visible placeholders, which overrides "never rendered" in §0 for facts only:

- Mark each one `<span class="ph">[ชื่อร้าน]</span>` styled as a **dotted underline only**
  (`text-decoration: underline dotted; text-underline-offset: .22em`), no box, tint or outline: forty boxed
  slots make the page read as a wireframe, the underline keeps it designed and every slot is still easy to find. Short Thai labels in square brackets; numbers that drive behaviour (prices in
  a picker) stay numeric in `data-*` and visible inside `.ph`.
- **Proof is never a placeholder.** Reviews, ratings, customer counts, awards and logos stay off the page until
  real ("Pages with no proof yet").
- List them for the hand-off: `python3 scripts/placeholders.py page.html --md README.md` writes the list with
  counts and warns about anything that looks like proof. It also lists attribute placeholders (`[…]` / `{{…}}` in
  `<meta>` og:* / description, `title`, `alt`, `aria-label`, `placeholder`); `--json` gives
  `{placeholder, count, kind: text|attribute, where}` per entry.
- `slop_check.py` ignores `.ph` for the accent-word rule; in the hand-off say how many placeholders remain.

## Waitlist and pre-launch pages

One path only: a single email form. No countdown, no invented scarcity, no fake social proof, no emoji. The email
field is `type="email"` and required; other fields are optional; validate per the [forms](forms.md) §6b contract. The success
message is announced (`role="status"` or `aria-live="polite"`) and says what happens next. Brand colors and fonts come
from DESIGN.md; the page works at 390px and 320px with no horizontal scroll ([render verification](render-verification.md)).
