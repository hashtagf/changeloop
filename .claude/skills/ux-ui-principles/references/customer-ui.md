# Customer-facing UI

Customer products differ from back-office tools: users are occasional, not
trained, often on phones, comparing alternatives, and free to leave. Design for
first-time comprehension, trust and completion. This file is the customer
counterpart to [back-office.md](back-office.md). The taxonomy and tables are
this skill's synthesis (project recommendations); source IDs resolve in
[sources.md](sources.md).

## How customer work differs

| Dimension | Back office | Customer UI |
|---|---|---|
| Frequency and training | Daily, trained | Occasional, untrained |
| Density | Compact, many items per view | Comfortable, one decision at a time |
| Device | Mostly desktop | Often phone first |
| Motivation | Required by the job | Optional; can abandon |
| Key risk | Wrong decision, inefficiency | Abandonment, mistrust, mistakes with money or personal data |
| Language | Domain terms are fine | Plain language; explain terms once |
| Success metric | Throughput, accuracy, SLA | Completion, activation, retention, satisfaction |

## Page taxonomy

| Page type | Primary goal | Pattern | Local layout IDs |
|---|---|---|---|
| Landing / product | Understand the offer and decide to try | Value → proof → how it works → price → action | M01, M02, M04 |
| Pricing / plans | Choose the right plan | Comparable plans → differences → total cost → action | M03 |
| Browse / search | Find options | Search + filters → results → compare | C01, E03 |
| Product / item detail | Decide on one option | Key facts → media → price/availability → action → details | C02 |
| Cart / review | Check before committing | Items → costs → changes → proceed | C03 |
| Checkout / booking | Complete a transaction | Few steps → review → pay/confirm → confirmation | C04, C05 |
| Sign-up / sign-in | Get access | Minimal fields → verify → continue where you were | U01 |
| Onboarding / setup | Reach first value | One task at a time → skip/resume → first success | U02 |
| Home / dashboard | See status, continue tasks | What needs attention → recent → shortcuts | B01 |
| Account / settings | Manage profile, privacy, payment | Categories → controls → saved feedback | U03, U04 |
| Subscription / billing | Understand and change plan | Current plan → renewal → change/cancel | U05 |
| Help / support | Solve a problem | Search help → top tasks → contact with context | M05, E02 |
| Status / tracking | Know what is happening | Current state → timeline → next step → contact | B02 |

Copy for these pages — headline, CTA, proof placement — is in
[marketing-copy.md](marketing-copy.md).

## Principles for customer pages

1. **Answer the visitor's questions in order:** what is it, is it for me,
   what does it cost, can I trust it, how do I start.
2. **One primary action per screen**, named by outcome ("ดูแพ็กเกจ",
   "จองเวลา", "ชำระ ฿1,250").
3. **Show total cost and commitments before the final step** — fees, renewal,
   cancellation. [S48] Hidden costs and forced continuity are dark patterns
   ([trust-security-privacy.md](trust-security-privacy.md)).
4. **Let people explore before sign-up** where possible; ask for an account at
   the moment it adds value (saving, paying, tracking).
5. **Forms are short and forgiving** ([forms.md](forms.md)); guest checkout when
   accounts aren't essential.
6. **Recover gracefully:** keep carts, drafts and progress; return users to
   where they left off after sign-in or interruptions.
7. **Confirm outcomes** with a reference, what happens next, and how to change
   or get help. [S44]
8. **Trust from accuracy:** correct prices, real availability, honest delivery
   dates, visible contact and policies — not badges or fake urgency.
9. **Mobile first:** thumb-reachable primary actions, native inputs, no
   hover-only information, fast on slow networks ([i18n-performance.md](i18n-performance.md)).
10. **Accessible by default:** the same WCAG 2.2 AA bar as everywhere
    ([accessibility.md](accessibility.md)).

## Onboarding and first value

- Identify the "first value" moment (first booking made, first report seen)
  and remove steps before it.
- Prefer empty states that teach and offer a first action over multi-screen
  tours ([components-usage.md](components-usage.md)).
- Ask for permissions and preferences in context, after value is visible
  ([mobile-native.md](mobile-native.md)).
- Let users skip and resume; save progress automatically.

## Brand and emotion

- Brand expression lives in type, color, imagery, motion and voice; keep it
  out of the way of the task on transactional steps.
- Tone adapts to context: warm on marketing, precise on payment, calm and
  helpful on errors ([content-design.md](content-design.md)).
- Celebrate real achievements sparingly (first booking), never with
  manipulative streaks or guilt.

## Metrics

| Page type | Outcome metric | Guardrail |
|---|---|---|
| Landing | Click-through to the next meaningful step | Bounce from the next step; refund/cancel rate |
| Checkout | Completion rate; payment errors | Refunds, support contacts, chargebacks |
| Onboarding | Activation (first value within N days) | Early churn |
| Help | Self-service resolution | Repeat contacts |

See [measurement.md](measurement.md) for instrumentation and experiments.

## Review checklist

1. A first-time visitor can say what this is and what it costs.
2. One clear primary action per screen, named by outcome.
3. Total cost and commitments visible before the final step.
4. No account required before it adds value (where the business allows).
5. Progress and input survive errors, sign-in and interruptions.
6. Confirmation gives reference, next steps and help.
7. Works one-handed on a phone and on slow networks.
8. No dark patterns: hidden costs, confirmshaming, pre-ticked add-ons, fake urgency.

## Do / Don't

| Do | Don't |
|---|---|
| Show the full price including fees before payment. | Add a service fee on the last screen. |
| Offer guest checkout when an account isn't required. | Force sign-up before showing prices. |
| Return users to their cart after sign-in. | Drop users on the home page after sign-in. |
| Explain why you need each personal detail. | Ask for birth date and address to read an article. |
| Make cancellation as easy as sign-up. | Hide cancellation behind a phone call. |
