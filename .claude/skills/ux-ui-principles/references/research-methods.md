# Research methods toolkit

Practical templates for running research: choosing a method, interview guides, surveys, personas
and JTBD, journey maps and blueprints, diary studies, recruiting with PDPA consent, synthesis and
reporting. Problem framing and role profiles live in [product-discovery.md](product-discovery.md);
method limits, usability protocol and severity live in [validation.md](validation.md); card sort and
tree test analysis in [navigation-grouping.md](navigation-grouping.md). Source IDs resolve in
[sources.md](sources.md); external sources are listed at the end.

## Method chooser

Sample sizes are planning starting points, not guarantees; scale to user diversity and risk [S35].

| Question | Method | Sample guidance | Time (prep → report) |
|---|---|---|---|
| What are people trying to do, and how today? | Semi-structured interviews | 5–8 per distinct role/segment, stop at saturation | 1–2 weeks |
| What really happens at the desk/counter? | Contextual inquiry | 3–6 sites or shifts | 1–2 weeks |
| How does behavior unfold over days? | Diary study | 8–15 participants, 1–4 weeks | 3–6 weeks |
| Where does the flow break, and why? | Moderated usability test | ~5 per round per segment, iterate [R1] | 1 week per round |
| How do people group our content? | Open card sort | ~15+ participants [R2], [S31] | 1–2 weeks |
| Can they find things in this hierarchy? | Tree test | ~50+ participants per tree [S32] | 1 week |
| How common is an attitude or need? | Survey | Size for margin of error; ~400 gives about ±5% at 95% for a large population | 2–3 weeks |
| What do users do in production? | Analytics, funnels, session data | All traffic; segment before concluding | Days |
| Did the change cause the difference? | A/B experiment | Power calculation first [S56] | 2–6 weeks |
| Which concept is clearer? | Concept/first-click test | 20–40 unmoderated | Days |

Mixed rule: qualitative explains *why*, quantitative tells *how many*. Don't report percentages from
qualitative rounds; report counts ("3 of 6").

## Interview guide

Template (45–60 min):

| Block | Time | Content |
|---|---|---|
| Intro and consent | 5 min | Who we are, purpose, recording consent, "ไม่มีคำตอบถูกหรือผิด" |
| Context | 10 min | Role, typical day, tools used |
| Last-time story | 20 min | "เล่าครั้งล่าสุดที่คุณ … ให้ฟังหน่อย" — walk through step by step |
| Pain and workarounds | 10 min | What went wrong, what they did, what it cost |
| Wrap-up | 5 min | Anything we missed, who else to talk to, incentive |

Question rules:

| Rule | Don't ask | Ask |
|---|---|---|
| Past behavior, not future intent | "คุณจะใช้ฟีเจอร์นี้ไหม?" | "ครั้งล่าสุดที่ต้องทำแบบนี้ ทำยังไง?" |
| Neutral, not leading | "การอนุมัติช้าน่ารำคาญใช่ไหม?" | "ช่วงอนุมัติเป็นยังไงบ้าง?" |
| One question at a time | "ใช้บ่อยไหม แล้วชอบไหม?" | Two separate questions |
| Open before closed | "ใช้ Excel ไหม?" | "ใช้อะไรช่วยบ้าง?" |
| Specifics over generalities | "ปกติทำยังไง?" | "เมื่อวานทำยังไง?" |
| Don't pitch the solution | Show the mockup first | Show it only in a separate test block |

Follow-ups: "ทำไมถึงเป็นแบบนั้น?", "แล้วหลังจากนั้นล่ะ?", "ช่วยเปิดให้ดูได้ไหม?". Silence for a few
seconds is a valid probe.

## Survey design

| Decision | Rule |
|---|---|
| Purpose | One decision per survey; every question maps to it; cut the rest |
| Length | 5–10 minutes; show progress |
| Question types | Single choice, multiple choice with "อื่นๆ (ระบุ)", rating scale, one or two open text |
| Scales | 5-point labeled ends and midpoint; same direction throughout; include "ไม่เกี่ยวข้อง / ไม่แน่ใจ" when real |
| Order | General before specific; demographics last; randomize option order where no natural order |
| Bias | Avoid leading wording, double-barreled items, agree-only statements; pilot with 3–5 people |
| Sample | Define who is in and out; report response rate and channel; don't generalize from a LINE OA blast to all customers |
| Thai language | Use plain spoken Thai, not translated English; avoid negative-negative items; politeness can push answers toward agreement (this skill's caution), so prefer behavior questions ("สัปดาห์ที่แล้วใช้กี่ครั้ง") over agreement scales |
| Mobile | Most Thai respondents answer on phone: one question per screen, large tap targets, no matrix grids |
| Privacy | Collect no ID card number or full address unless required; state use and retention (PDPA) |

## Personas vs proto-personas vs JTBD

| Artifact | Honest when | Label |
|---|---|---|
| Role profile | Back office, B2B; built from tasks and permissions | See [product-discovery.md](product-discovery.md) |
| Proto-persona | Workshop of team assumptions before research | "Assumed — not research" on the artifact |
| Persona | Synthesized from ≥ 1 round of research across segments | Cite sessions; date it; retire when stale |
| JTBD statement | Need is stable across demographics | "When [situation], I want to [motivation], so I can [outcome]" |

Never add fake photos, ages or hobbies that the research did not show.

## Journey maps and service blueprints

Journey map rows (one column per stage): stage · user goal · actions · touchpoints/channel ·
thoughts and quotes · emotion (evidence-labelled) · pain points · opportunities.

Service blueprint adds rows below the line of visibility: frontstage staff actions · backstage
staff actions · support processes and systems · data/evidence · time and handoffs. Use blueprints
for omnichannel and back-office services (branch + app + call center) [R3].

## Diary studies

Brief participants in a kickoff call; ask for one short entry per trigger event ("ทุกครั้งที่สั่งอาหาร")
plus an end-of-week reflection; collect via LINE, a form or a diary tool; nudge once a day at most;
pay in tranches to reduce dropout; follow with a debrief interview [R4].

## Card sort and tree test

Run open sort to learn mental models, closed sort or tree test to check a proposed structure. Use
real Thai labels users would see. Analysis and IA decisions: [navigation-grouping.md](navigation-grouping.md).

## Contextual inquiry for back-office users

| Do | Why |
|---|---|
| Sit with operators during real shifts, peak and quiet | Interruptions and volume shape the UI |
| Capture screens, sticky notes, Excel side sheets, LINE groups used for handoff | Workarounds reveal missing features |
| Ask "ทำไมต้องเปิดอีกระบบ?" at each switch | Finds data-integration needs |
| Record time per case and error recovery | Feeds metrics in [product-discovery.md](product-discovery.md) |
| Get manager approval and mask customer data in notes | PDPA and internal policy |

## Recruiting and consent (PDPA)

- Screen by behavior (did the task in the last 30 days), not by demographics alone.
- Recruit channels: existing customers via LINE OA or in-app banner, branch staff, panels, Facebook
  groups. Exclude employees and friends for customer studies.
- Consent form in Thai: purpose, what is recorded (audio, video, screen), who sees it, retention
  period, withdrawal right, contact. Recording consent is separate and explicit; ask again on tape
  at the start [R5].
- Store recordings in access-controlled storage; delete by the stated date; blur personal data in
  clips.
- Incentives: state amount and payment method (PromptPay transfer, voucher) before the session; pay
  even if the session ends early.

## Remote research in Thailand

| Need | Practical choice |
|---|---|
| Recruit and schedule | LINE OA chat or LINE group with a booking link |
| Moderated session | Zoom, Google Meet or Microsoft Teams; LINE video call when the participant can't install anything |
| Mobile screen view | Participant screen-shares from phone; test call 1 day before |
| Unmoderated tests | Maze, Lookback, UserTesting or similar; check Thai input and fonts render |
| Note-taking | Second team member takes timestamped notes; observers off camera, in chat only |

## Synthesis

1. Turn each session into atomic notes: one observation per note with participant ID and timestamp.
2. Label each: **observed**, **reported**, **inferred**, **assumed** (same labels as
   [product-discovery.md](product-discovery.md)).
3. Affinity map: cluster bottom-up, name clusters as user needs or problems, not features.
4. Count participants per cluster ("4 of 6"), keep contrary evidence visible.
5. Write insights: *finding → evidence → implication → confidence*.
6. Prioritize with the severity scale in [validation.md](validation.md).

## Reporting template

For a study run with real users. A synthesis of published sources (RESEARCH mode)
uses Research synthesis in [output templates](../assets/templates.md) instead.

| Section | Content |
|---|---|
| Decision it informs | One sentence |
| Method and sample | Method, n per segment, dates, recruiting, limits |
| Top findings (3–7) | Finding, evidence count, quote or clip, confidence |
| Recommendations | Action, owner, severity |
| Open questions | What this study could not answer and next method |
| Appendix | Guide, raw notes link (access-controlled), consent record |

## Do / Don't

| Do | Don't |
|---|---|
| Ask about the last time it happened. | Ask "would you use…?" and treat yes as demand. |
| Report counts from small qualitative rounds. | Turn 3 of 5 into "60% of users". |
| Label proto-personas as assumptions. | Present invented personas as research. |
| Get separate, explicit consent for recording. | Bury recording consent in general terms. |
| Write Thai surveys in spoken Thai and pilot them. | Machine-translate an English survey. |
| Keep contrary evidence in the synthesis. | Cherry-pick quotes that match the plan. |

## Sources (not yet in sources.md)

- [R1] Nielsen, Why You Only Need to Test with 5 Users (NN/g) —
  https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
- [R2] Nielsen, Card Sorting: How Many Users to Test (NN/g) —
  https://www.nngroup.com/articles/card-sorting-how-many-users-to-test/
- [R3] NN/g, Service Blueprints: Definition — https://www.nngroup.com/articles/service-blueprints-definition/
- [R4] NN/g, Diary Studies — https://www.nngroup.com/articles/diary-studies/
- [R5] Thai PDPA (B.E. 2562), PDPC — https://www.pdpc.or.th/ ; GOV.UK Service Manual, Getting
  consent for research — https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research
