# Engagement: onboarding, habits, gamification, loyalty

How to design retention and motivation that serves the user's own goal: first value, habit loops,
progress, streaks, points and loyalty, reminders, and the bans that keep it honest. First-launch
screens are in [mobile-native.md](mobile-native.md) and [customer-ui.md](customer-ui.md); reminder
channels in [notifications.md](notifications.md); deceptive patterns in
[trust-security-privacy.md](trust-security-privacy.md); metrics in [measurement.md](measurement.md).
Source IDs resolve in [sources.md](sources.md); external sources are listed at the end.

## Start with the fit test

Engagement features are a means. Run this test before adding any game-like mechanic.

| Question | If yes | If no |
|---|---|---|
| Does the user already want the outcome (learn, save, exercise, finish setup)? | Mechanics can support an existing goal | Fix value first; points won't create it |
| Is the activity repeated and does it benefit from regularity? | Streaks/progress can help | One-off task: use a checklist, not a streak |
| Does more usage mean more user value (not just more sessions)? | Measure and reward the valuable action | Don't reward opening the app |
| Can the reward be earned without paying or sharing data? | OK | It's a sales funnel; label it as such |
| Would the feature still feel fair if the user saw your internal metric? | OK | Drop it |
| Is the context serious (money, health, work queues, debt)? | Prefer progress and feedback; avoid competition and luck | — |

Intrinsic motivation (autonomy, competence, relatedness) outlasts extrinsic rewards; external
rewards for an activity people already enjoy can reduce their interest [E1]. Default to **feedback
and progress** (intrinsic support); add **points and prizes** (extrinsic) only for tasks that are
not enjoyable on their own and have a real payoff.

## Onboarding to first value

| Step | Rule | Example (Thai e-wallet) |
|---|---|---|
| Define first value | One observable action that proves the product works | First top-up and first QR payment |
| Shorten the path | Ask only what that action needs; defer profile, avatar, preferences | KYC level 1 only; address later |
| Show, then ask | Let users explore before sign-up when possible | Browse merchants before registering |
| Setup checklist | 3–5 items, each with value stated, dismissible, progress shown | "ผูกบัญชีธนาคาร · เติมเงินครั้งแรก · สแกนจ่าย" |
| Empty states | Teach the next action in place, not a tour | "ยังไม่มีรายการ — สแกน QR ที่ร้านเพื่อจ่ายครั้งแรก" |
| Measure | Time to first value, % reaching it in 7 days | See [measurement.md](measurement.md) |

## Habit loops

A loop is **cue → action → feedback → investment**. Behavior happens when motivation, ability and
a prompt meet at the same moment [E2]; when it fails, raise ability (make it easier) before raising
prompts.

| Part | Design for the user | Don't |
|---|---|---|
| Cue | User-chosen time or a real event ("ก่อนนัด 1 วัน", salary day) | Random pings to lift DAU |
| Action | The smallest useful unit (one lesson, one log entry) | Gate the action behind ads or upsell |
| Feedback | Immediate, specific, factual ("ออมแล้ว ฿3,200 จาก ฿10,000") | Variable random rewards as the main driver |
| Investment | Saved data that makes next time better (history, preferences) | Lock data in to raise switching cost |

## Progress, streaks, badges, levels, leaderboards

| Mechanic | Use when | Design rules | Avoid |
|---|---|---|---|
| Progress bar / checklist | Finite goal (setup, course, savings target) | Show real denominator; start with earned progress only if it is real | Fake head starts, bars that slow near the end |
| Goal ring / weekly target | Health, learning, saving | User sets the target; weekly beats daily for flexibility | Daily target the user can't change |
| Streak | Daily practice the user chose | Freeze/repair days, rest days, weekly streak option; reset quietly; show "best streak" too | Loss-framed alerts ("ไฟจะดับ!"), selling streak repairs |
| Badge | Mark real milestones or skills | Few, meaningful, explained criteria; private by default | Badges for opening the app |
| Level / tier | Unlocks real capability or benefits | Criteria and benefits public; no losing earned tier without notice | Opaque tiers, decay designed to cause anxiety |
| Leaderboard | Opt-in, peer group of similar level, friends or team | Relative bands ("ท็อป 20% ของสาขา"), weekly reset, opt-out | Global boards where most users are near the bottom; ranking staff in back office without consent |

Back-office rule: do not gamify operator throughput (approvals, tickets) with points or rankings;
it rewards speed over correctness. Show personal queue progress and quality instead.

## Rewards and loyalty (Thai market)

Thai shoppers are used to points programmes (convenience stores, department stores, banks, coffee
chains) and stamp cards; trust depends on clear value and expiry.

| Decision | Rule | Example |
|---|---|---|
| Earn rate | Show in baht: "ทุก ฿25 = 1 แต้ม" and value "1 แต้ม = ฿0.25" | — |
| Balance | Points, baht value and nearest expiry together | "1,240 แต้ม (≈ ฿310) · 300 แต้มหมดอายุ 31 ธ.ค." |
| Expiry | Remind 30 and 7 days ahead; never expire silently | Reminder through LINE OA or push, user-controlled |
| Redemption | Points + cash at checkout; show cost before confirm; reversible within the order | "ใช้ 400 แต้ม ลด ฿100" toggle |
| Member ID at POS | Phone number lookup with masking on customer display | 08x-xxx-5678 |
| Tiers | Public criteria and benefits; grace period before downgrade | — |
| Partner points | State conversion rate and fees before transfer | — |
| Data | Membership consent separate from marketing consent (PDPA) | See [trust-security-privacy.md](trust-security-privacy.md) |

## Reminders cadence

Channels, content and quiet hours follow [notifications.md](notifications.md). Engagement specifics
(this skill's recommendation):

| Rule | Value |
|---|---|
| Default | Off or one per day maximum for habit reminders; user picks time |
| Lapsed users | One "welcome back" after inactivity, then stop; no escalating series |
| Back-off | Halve frequency after ignored reminders; stop after 3–4 ignored in a row |
| Content | Specific next step, not guilt ("บทเรียนต่อไป: คำศัพท์ร้านอาหาร 3 นาที") |
| Controls | Snooze, change time, turn off type, in one tap from the reminder |

## Ethical guardrails and banned patterns

Banned in this skill. Several are named by regulators and researchers as dark patterns [E3, E4].

| Pattern | What it looks like | Instead |
|---|---|---|
| Confirmshaming | "ไม่ล่ะ ฉันไม่อยากประหยัด" as decline label | Neutral "ไม่ใช่ตอนนี้" |
| Fake scarcity / urgency | Countdown that resets, "เหลือ 2 ที่" not backed by stock | Real deadlines and stock only |
| Forced continuity | Free trial converts silently to paid | Reminder before charge; cancel as easy as start |
| Roach motel | Sign-up in app, cancel only by phone | Cancel in the same channel, same effort |
| Streak anxiety | Loss-framed late-night alerts, paid streak repair | Freeze days, quiet reset, no paid repair |
| Loot boxes / random paid rewards | Paid chance for rewards | Known rewards; no gambling mechanics, especially for minors |
| Social pressure spam | "เพื่อน 5 คนแซงคุณแล้ว" pushes | Opt-in social features |
| Nagging | Re-asking a declined permission or upsell each session | Respect "no" for a defined period |

Escalate to a human decision (product + legal) before shipping any mechanic tied to money, minors,
health or credit.

## Metrics and guardrails

| Goal metric | Pair with guardrail |
|---|---|
| D7/D30 retention of users reaching first value | Uninstalls, notification opt-outs, complaints |
| Weekly active users doing the valuable action | Task success, error rate, support contacts |
| Streak length / goal completion | Self-reported stress or opt-out of streaks; late-night activity share |
| Points redemption rate | Expired points share, redemption complaints |

Define goals → signals → metrics before launch [S55]; see [measurement.md](measurement.md). Treat a
lift in sessions without a lift in the outcome as a failure, not a win.

## Accessibility of game-like UI

- Celebrations (confetti, bursts, shaking badges) respect reduced motion: replace with a static
  check and text [S16]; never flash more than 3 times per second (WCAG 2.3.1 [S02]); keep them
  under ~1 s and skippable (this skill's recommendation); see [motion.md](motion.md).
- Announce progress and rewards with a status message, not only animation [S13].
- Progress rings and tiers need text values, not color alone [S67].
- No timed challenges without a way to extend or turn off timing [S47].
- Sound off by default; haptics optional.

## Do / Don't

| Do | Don't |
|---|---|
| Reward the action that delivers user value. | Reward app opens or session length. |
| Offer streak freezes and a quiet reset. | Send loss-framed "streak ending" alerts at night. |
| Show points with baht value and expiry. | Let points expire without reminders. |
| Make cancel as easy as sign-up. | Hide cancel behind a phone call. |
| Make leaderboards opt-in and peer-sized. | Rank all users publicly by default. |
| Pair every engagement metric with a guardrail. | Ship a mechanic because DAU went up. |

## Sources (not yet in sources.md)

- [E1] Deci & Ryan, Self-Determination Theory; Deci, Koestner & Ryan (1999) meta-analysis on
  extrinsic rewards — https://selfdeterminationtheory.org/theory/
- [E2] BJ Fogg, Fogg Behavior Model — https://behaviormodel.org/
- [E3] US FTC, Bringing Dark Patterns to Light (2022) —
  https://www.ftc.gov/reports/bringing-dark-patterns-light
- [E4] Harry Brignull, Deceptive Patterns — https://www.deceptive.design/types
- Thai PDPA (Personal Data Protection Act B.E. 2562), PDPC — https://www.pdpc.or.th/
