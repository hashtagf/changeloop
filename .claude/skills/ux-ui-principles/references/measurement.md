# Measurement, design QA and continuous improvement — level 6

Decide how a design will be judged before it ships, check that the build
matches the intent, then learn from real use. Research methods and
usability-session protocol are in [validation.md](validation.md). Source IDs
resolve in [sources.md](sources.md).

## Define success per page or flow

Every Standard or Critical page spec names at least one outcome metric and one
guardrail. Use a goals → signals → metrics chain; pick categories that fit the
product (happiness, engagement, adoption, retention, task success). [S55]
Not every category suits every page; choose few and meaningful.

| Page type | Outcome metric examples | Guardrail examples |
|---|---|---|
| Customer checkout / booking | Completion rate; time to complete; payment error rate | Refunds/cancellations; support contacts per order |
| Sign-up / onboarding | Activation within N days; drop-off by step | Fake/duplicate accounts; complaint rate |
| Back-office queue | Items cleared within SLA; median handling time | Decisions reversed later; escalations |
| Search / list | Search success (click or action after search); zero-result rate | Time to first useful result |
| Settings / permissions | Successful change without support; error rate | Unintended changes reverted; access incidents |
| Dashboard | Time to identify the item needing action; follow-through rate | Missed alerts |

Public-service programmes commonly report completion rate, user satisfaction,
cost per transaction and digital take-up; adapt rather than copy. [S62]

## Perceived clutter (when density is the question)

When a page is suspected of being too dense or "too much text", ask the five
Perceived Clutter of Websites items after the task, 5-point agreement
(1 strongly disagree – 5 strongly agree) [S113]:

| Factor | Item |
|---|---|
| Content clutter | These types of content [ads, videos, suggested posts] made up a lot of the clutter. |
| Content clutter | These types of content [ads, videos, suggested posts] took up too much space. |
| Design clutter | The layout was unpleasant. |
| Design clutter | There was too much text. |
| Design clutter | There was too much visual noise. |

Add the overall item "Overall, I thought the website was too cluttered" (0–10).
Content clutter → remove; design clutter → reorganize (group, chunk, add white
space). Validated on consumer websites; treat results on back-office tools as
indicative. Translate the items for Thai participants and keep the bracket
examples relevant to the product.

## Instrumentation spec

Write analytics requirements with the design, not after release.

| Field | Example |
|---|---|
| Event | `withdrawal_decision_submitted` |
| Trigger | Server confirms the decision is stored (not on button click) |
| Properties | decision (approve/reject/escalate), risk_level, sla_state, time_on_item_ms, role |
| Excluded | Customer name, account number, free-text notes (privacy) |
| Question answered | Are high-risk items taking longer? Are SLA breaches concentrated by role/shift? |

Rules: track outcomes, not only clicks; name events consistently; record the
failure and recovery path, not just success; keep personal data out
(see [trust-security-privacy.md](trust-security-privacy.md)).

## Experiments

A/B tests measure immediate behavior on the tested element, not *why* it
happened, and should be paired with qualitative user research. [S56] The
planning rules below are this skill's recommendations.

- Write the hypothesis, primary metric, guardrails, minimum detectable effect
  and duration before starting.
- Don't stop early on a favorable fluctuation; don't test many variants on low
  traffic.
- Back-office tools with few users rarely suit A/B tests; use task-based
  studies and before/after operational data instead.

## Design QA — does the build match the design?

Run before release for Standard and Critical tiers. Required at Standard: Content through Accessibility (the Standard verification in [framework.md](framework.md)). Performance and Analytics are required at Critical, and at Standard where the page spec has a performance row or outcome metric.

| Area | Check |
|---|---|
| Content | Real copy matches the spec and glossary; no placeholder text |
| Layout | Regions, order and hierarchy match at each supported width |
| Tokens | Colors, type, spacing and radii come from tokens; no one-off values |
| Components | Correct variants and states; no forked look-alike components |
| States | Loading, empty, error, success, permission, stale exercised with fixtures |
| Interaction | Keyboard path, focus return, Back behavior, duplicate-submit prevention |
| Responsive | Supported widths, 200%/400% zoom where applicable, long values |
| Accessibility | Automated scan plus manual checks on changed areas; untested items listed |
| Performance | Budget in page spec checked by stated method |
| Analytics | Events fire once with correct properties; no personal data |

Record each as passed / failed / not tested with evidence (screenshot, test
name, recording). A design QA pass is not user validation.

## Continuous improvement loop

1. **Review** metrics, support tickets, feedback and session observations on a
   fixed cadence (e.g. 2 and 6 weeks after launch, then quarterly).
2. **Diagnose** with qualitative evidence before redesigning; analytics show
   where, research shows why.
3. **Prioritize** by task impact and severity (scale in [validation.md](validation.md)).
4. **Change** the smallest thing that addresses the cause; update the page spec,
   design context and glossary.
5. **Re-measure** against the same metric definition.

## Report template — post-launch review

| Item | Content |
|---|---|
| Scope | Page/flow, release, date range |
| Metric vs target | Value, baseline, target, data source, caveats |
| Guardrails | Values and any regression |
| Qualitative evidence | Sessions, tickets, quotes (anonymized) |
| Findings | Severity, confidence, evidence |
| Decisions | Keep / iterate / roll back, owner, date |

## Do / Don't

| Do | Don't |
|---|---|
| Name the metric and guardrail in the page spec. | Pick whichever metric improved after launch. |
| Fire outcome events on confirmed server state. | Count button clicks as completions. |
| Pair analytics with research to explain causes. | Redesign from a funnel chart alone. |
| Run design QA with state fixtures and record untested items. | Approve the release from a default-state screenshot. |
