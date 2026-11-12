# Product discovery — level 1

Decide what to build, for whom and why before designing screens. Source IDs
resolve in [sources.md](sources.md). Research methods and their limits are in
[validation.md](validation.md); this file covers framing and outputs.

## Start from the problem, not the feature

A feature request is a proposed solution. Restate it as a problem with
evidence. Learn user needs before committing to a solution, and treat team
assumptions as hypotheses. [S33, S34]

| Ask | Why | Example (payout back office) |
|---|---|---|
| Who experiences the problem, in which role? | Different roles need different layouts and permissions | Operators reviewing withdrawals; managers approving above limit |
| What are they trying to achieve? | Defines the task the design must support | Clear the queue within SLA without approving fraud |
| What do they do today? | Reveals workarounds and data sources | Copy IDs into three systems to check KYC and history |
| What evidence shows this is a problem? | Separates observed pain from opinion | 31% of reviews exceed SLA (ops report, Oct); 4 support escalations/week |
| What happens if nothing changes? | Sets priority and rigor tier | Missed SLA penalties, fraud loss, staff overtime |
| What constrains the solution? | Prevents designs that cannot ship | Bank cut-off times, audit rules, existing IAM roles, legacy API latency |

Mark each answer as **observed**, **reported**, **inferred** or **assumed**.

## Users and roles

- Prefer **roles with tasks** over decorative personas. A useful role profile
  lists goals, frequency, expertise, device/input, environment, permissions,
  and the consequence of an error.
- In admin systems the same data serves several roles with different goals; do
  not force them into one layout (see [back-office.md](back-office.md)).
- Personas are summaries of research. Without research they are assumptions
  and must be labelled as such.

Role profile template:

| Field | Content |
|---|---|
| Role | e.g. Withdrawal operator |
| Primary goals | … |
| Frequency and volume | e.g. ~120 reviews/shift |
| Expertise | e.g. trained on risk rules, not on bank APIs |
| Context | Desktop, two monitors, interruptions from chat |
| Permissions | Approve ≤ ฿500,000; cannot edit limits |
| Cost of error | Financial loss, regulatory finding |
| Evidence | Interviews (5), shift observation (1), queue logs |

## Problem statement and scope

Write one paragraph: *[role] needs to [goal] when [context], but [obstacle],
which causes [consequence]. We will know it is solved when [measurable outcome].*
List explicit non-goals and the riskiest assumptions with how each will be
tested.

## Success metrics

Define success before designing so later evaluation is not invented after the
fact. A goals → signals → metrics chain keeps metrics tied to user outcomes;
categories such as happiness, engagement, adoption, retention and task success
help choose what to measure. [S55] Service programmes commonly track completion
rate, satisfaction, cost per transaction and digital take-up. [S62]

| Level | Example |
|---|---|
| Goal | Operators clear withdrawals correctly within SLA |
| Signal | Reviews finish sooner; fewer reversed decisions |
| Metric | Median review time; % within 30-min SLA; % decisions reversed in 7 days |
| Guardrail | Fraud loss rate; reject rate does not rise without cause |

See [measurement.md](measurement.md) for instrumentation.

## Constraints register

Capture constraints that shape the design: legal/regulatory, security and
audit, data availability and latency, existing systems and design system,
supported devices/browsers, languages and locales, accessibility target
(e.g. WCAG 2.2 AA), team capacity and timeline.

## Discovery outputs (scale to tier)

| Output | Light | Standard | Critical |
|---|---|---|---|
| Problem statement with evidence labels | ✓ | ✓ | ✓ |
| Role profiles | brief | ✓ | ✓ with evidence |
| Success metric + guardrail | optional | ✓ | ✓ instrumented before launch |
| Constraints register | key items | ✓ | ✓ reviewed by security/compliance |
| Assumptions with test plan | — | ✓ | ✓ |

## Do / Don't

| Do | Don't |
|---|---|
| Restate requests as problems with evidence labels. | Start drawing screens from a feature list alone. |
| Use role profiles tied to tasks and permissions. | Present an invented persona as research. |
| Agree a measurable outcome and guardrail before design. | Define success after launch using whatever metric improved. |
| List non-goals and riskiest assumptions. | Let scope grow silently because "users might want it". |
