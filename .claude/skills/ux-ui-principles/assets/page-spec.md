# Page design specification

A page is designed when the applicable rows below have answers. Choose the
rigor tier from [framework.md](../references/framework.md); the tier decides
which rows are required. This is a content contract, not a demand for a long
document — a Light-tier spec can be ten lines.

## Tier → required rows

| Tier | Rows |
|---|---|
| Light | 1, 2, 3, 5, 8, 9, 11 |
| Standard | 1–13, 16 |
| Critical | 1–16 |

Rows not required may still be answered briefly. Write "N/A — reason" rather
than leaving a required row blank.

## The 16 rows

| # | Row | Answer | Reference |
|---|---|---|---|
| 1 | Page purpose | Why this page exists; the one task it leads with | product-discovery |
| 2 | User and context | Role(s), frequency, device/input, environment, permissions | product-discovery, back-office |
| 3 | Task and flow | Steps on this page; entry and exit pages; handoffs | experience-architecture |
| 4 | Information | Data shown, priority order, source system, freshness | back-office |
| 5 | Page pattern | Page type, layout ID, structural pattern, and why; tradeoff | back-office, layouts |
| 6 | Navigation | Where users come from, where they go, Back behavior, URL | experience-architecture |
| 7 | Components | Components chosen and why; variants and states; any new ones and why | components-usage, component-states, visual-system |
| 8 | Interaction | What each action does: trigger, feedback, result, focus | patterns |
| 9 | States | Loading, empty (first use / no results), error, success, disabled, permission, stale, offline as applicable | patterns |
| 10 | Validation and recovery | Prevention, field validation, error summary, preserved input, unknown outcomes | patterns, content-design |
| 11 | Responsive | What changes at each supported width; zoom/reflow behavior | visual-system |
| 12 | Visual design | Focal point, hierarchy, density mode, tokens used | design-quality, visual-system |
| 13 | Accessibility and language | Keyboard path, focus, names/roles, contrast, language attributes, Thai copy checks | accessibility, i18n-performance, content-design |
| 14 | Privacy and security | Who sees what, masked data, consequential actions, audit events, session behavior | trust-security-privacy |
| 15 | Performance | Budget and measurement method; large-data strategy | i18n-performance |
| 16 | Success and QA | Outcome metric + guardrail; acceptance scenarios incl. one failure; design QA items; what is untested | measurement, validation |

## Template

```markdown
# Page spec: <page name>
Tier: Light | Standard | Critical — reason: <consequence>
Layout ID / pattern: <e.g. P01 list–detail + A03 approval>

1. Purpose:
2. User & context:
3. Task & flow:   entry → … → exit
4. Information (priority order, source, freshness):
5. Pattern & rationale (tradeoff):
6. Navigation (URL, Back, breadcrumbs):
7. Components:
8. Interaction (action → feedback → result → focus):
9. States:
10. Validation & recovery:
11. Responsive:
12. Visual (focal point, density, tokens):
13. Accessibility & language:
14. Privacy & security:
15. Performance budget:
16. Success metric, guardrail, acceptance, QA, untested:
Assumptions / open questions:
```

## Example — withdrawal approval queue (Critical)

| # | Answer |
|---|---|
| 1 | Let operators decide pending withdrawals correctly within the 30-minute SLA |
| 2 | Operator, ~120 items/shift, desktop with keyboard; approve ≤ ฿500,000; managers handle above |
| 3 | Overview "เกิน SLA" link or nav → queue (oldest first) → item detail → approve/reject/escalate → check answers → next item auto-selected |
| 4 | Amount, destination (masked), customer; evidence: KYC, risk level + reasons, name match, account age, history, balance after; request timeline. Source: payments API, risk engine; freshness shown |
| 5 | Inbox + approval in list–detail (P01 + A03): continuous work without page round trips; tradeoff: less room for detail on 1280px, mitigated by stacking evidence |
| 6 | `/withdrawals?status=pending&sort=age`, `/withdrawals/WD-2048`; Back restores filters and selection; breadcrumb PayOps › คิวตรวจถอนเงิน |
| 7 | Queue row, status pill, evidence list, timeline, decision panel; no new components |
| 8 | Select row → detail + focus on heading; Approve… → check-answers → Confirm → pending → success toast + next item; Reject requires note |
| 9 | Loading list/detail; empty queue; no filter matches; save failed (retry, note kept); above-limit (escalate instead of approve); stale item (already decided by someone else) |
| 10 | Rejection reason required; duplicate submit blocked while pending; "already decided" conflict explains who/when and moves on |
| 11 | ≥1024px two panes; below, list then detail with "back to queue"; tables do not scroll horizontally |
| 12 | Focal point: amount + decision panel; compact density; SLA as colored bar + text |
| 13 | Rows are buttons in a list; decision buttons named with verb; live region announces result; Thai labels tested at 200% zoom |
| 14 | Account masked to last 4; decision recorded with actor, reason; confirmation repeats amount and destination [S53]; reversible/checked/confirmed [S48] |
| 15 | Queue of 200 items renders and filters < 200 ms interaction latency on target hardware (to be measured) |
| 16 | Metric: % decided within SLA; guardrail: decisions reversed in 7 days. Acceptance: reject without note shows field error and keeps focus; save failure keeps note and item. Untested: screen reader, real API latency |
