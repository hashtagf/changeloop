# Copy-paste templates

Every template sits in a ```markdown``` block so it can be pasted straight into a task
description. Write the filled content in **the team's language** — the examples here are
English, but a Thai-speaking team should get Thai (mixed with English technical terms is
normal and reads fastest for them).

## Contents

1. Module task
2. Scenario spec
3. Test case checklist
4. Bug report
5. API-only scenario spec
6. L1 smoke checklist
7. Banned words in acceptance criteria

---

## 0. Where these fit

Four tiers in the tracker. Produce the Module task even for a single module — it is the only
place the overview, shared rules, and scenario table live, and without it the scenarios have no
parent to hang from.

```
[Module] <module name>                 ← §1 below
└─ SC-<CODE>-NN · <scenario name>      ← §2
   └─ Test Scenario : <scenario name>  ← §3 (what QA ticks)
└─ Issue [SC-<CODE>-NN] : <symptom>    ← §4, filed under the Module
```

Field conventions and push order are in `clickup.md`; you only need that file when you are
actually creating the tasks.

## 1. Module task

```markdown
## <Name> Module

## Overview

<what this module does> — covers N main flows:

*   flow 1
*   flow 2
*   flow 3

## Shared Rules

Rules that apply to every scenario in this module. Scenarios reference them by number instead
of repeating them.

*   SR-1 — <e.g. every state-changing endpoint requires a CSRF token>
*   SR-2 — <e.g. all amounts are THB with 2 decimals>

## Scenarios

| ID | Scenario | Type | Priority |
| ---| ---| ---| --- |
| SC-XXX-01 | <scenario name> | Happy Path | P0 |
| SC-XXX-02 | <scenario name> | Error Path | P2 |
| SC-XXX-03 | <scenario name> | Security Path | P1 |
```

**Priority (P0–P3) sets the running order** when time is short and decides which regression
tier a scenario lands in — definitions and derivation from the risk matrix are in
`execution.md` §1. Set it when the list is confirmed; keep P0 to roughly 10–15% of scenarios.

**Shared Rules is what keeps a large module from bloating.** Anything true for every scenario —
token lifetimes, currency handling, audit logging, rate limits — goes here once, and each
scenario's Business Logic section says "SR-1, SR-3 apply" plus only what is specific to it.
Without this, the same five rules get retyped in every scenario, which is most of the volume in
a 40-scenario set and makes the rules drift apart as they're edited.

**IDs:** `SC-<CODE>-<two digits>` where CODE abbreviates the module (LOGIN, PWD, ORDER, PAY).
Numbers must not change once the list is confirmed, because bugs and the traceability matrix
cite them. To add scenarios, append — never insert in the middle.

## 2. Scenario spec

```markdown
## SC-XXX-01 · <scenario name>

**Type:** Happy Path · **Priority:** P0
**Persona:** <who acts + their context>
**Pre-condition:** <the starting state, stated so anyone can reproduce it>

## Scenario Steps
1. <a reproducible step, written from the user's point of view>
2. ...

## Acceptance Criteria
*   <something observable on screen or in an API response>

## Business Logic / Rules
*   <rules, config values, security requirements that aren't visible on screen>

## UX/UI
<Figma link including the node-id of that screen>
```

**Personas need context**, not just "User" — write "Registered User — has an account, email
already verified", because half the pre-condition hides inside the persona. For Security paths
write the persona as "Attacker — has a proxy pool across many IPs" so whoever runs it knows
what to prepare.

**Given / When / Then is fine** if the team writes BDD (ATDD): keep one observable outcome
per `Then` / `And` line and put each line as a criterion bullet — the 1:1 checklist and
`checklist.py` work the same. The rules about checkable criteria don't change with the syntax.

**Aim for 5–10 criteria.** Fewer than 5 usually means the thinking isn't finished; more than
10 usually means the scenario should be split.

## 3. Test case checklist

One scenario = one tracker task named `Test Scenario : <scenario name>`, containing the
acceptance criteria 1:1.

```markdown
- [ ] <criterion 1, copied verbatim>
- [ ] <criterion 2, copied verbatim>
```

It must be 1:1 so that a failing item identifies exactly one criterion, and traceability back
to the requirement needs no interpretation.
The only allowed edit: dropping a long parenthetical reference so the line reads well on a
phone. Never drop a condition that has to be checked.

## 4. Bug report

Title: `Issue [SC-XXX-NN] : <short symptom>`, filed under the **Module**, not under the
scenario (one bug usually spans several scenarios, and scenarios should stay specs rather than
becoming bug archives).

```markdown
| Field | Value |
| ---| --- |
| Severity | Critical / High / Medium / Low (rubric below) |
| Priority | set at triage by PM/lead — leave blank when filing |
| Scenario / criterion | SC-XXX-NN · criterion #n |
| Environment | staging / UAT / production · URL |
| Build / version | <commit or version shown in the app> |
| Platform | <browser + version / device + OS> |
| Account / role / data | <test account, role, data id — e.g. TD-02, order #1042> |
| Reproducibility | always / 3 of 5 / once (attempts made) |
| Regression? | worked in <version> ☐ yes ☐ no ☐ unknown |

## Pre-condition
<the starting state, stated so anyone can reproduce it>

## Step
1. <reproducible step>
2. ...

## Current Result
<what actually happens> + screenshot / screen recording

## **Expected Result**
<what should happen — cite which criterion or business rule>

## Evidence
<console error, failing request + response, request id / trace id, log line, timestamp>

## Impact
<who hits this, how often, workaround if any>
```

**The expected result must cite a criterion.** If you can't cite one, either the spec doesn't
cover this (add the criterion first) or it's a personal opinion rather than a bug (talk to the
PM before filing).

**Build, environment, and reproducibility are not optional.** A bug without the build can't be
verified as fixed; one without reproducibility gets bounced as "works on my machine". For an
intermittent bug, run it 5 times and write the rate — never file "sometimes".

**Never paste real personal data, passwords, or tokens** into a ticket or screenshot — mask
them. Tickets are read far more widely than the system they describe.

How the bug moves from filed to closed (triage, verify, reopen, accepted risk) is in
`execution.md` §5.

### Severity rubric

The completion report buckets bugs into four severities, so they need one shared definition —
otherwise every ticket becomes a negotiation. Severity is about consequence, not effort to fix.

| Severity | Definition | Examples |
| ---| ---| --- |
| **Critical** | data loss or corruption, money wrong, unauthorized access, or the primary flow is impossible for everyone — and there is no workaround | charged twice; another user's data visible; nobody can log in |
| **High** | a main flow fails or produces a wrong result for a common case; a workaround exists but is unreasonable to ask of users | reset password succeeds but login then fails; totals wrong on one payment method |
| **Medium** | a secondary flow or an uncommon case fails, or the primary flow is unpleasant but completable | validation message missing; a filter combination returns the wrong count |
| **Low** | cosmetic, wording, or an edge case with negligible impact | text overflows at 320px; inconsistent capitalisation |

Two rules that prevent most arguments:
- **Security findings start at High and move up, never down**, unless the attack is impossible in
  the deployed configuration — and then say why in the ticket.
- **Frequency raises severity, it doesn't lower it.** A wrong total that hits 1% of orders is
  still Critical; being rare makes it harder to find, not cheaper to ship.

## 5. API-only scenario spec

Drop UX/UI, add Request/Response.

```markdown
## SC-XXX-01 · <scenario name>

**Type:** Error Path
**Persona:** <the calling client + the permissions it holds>
**Pre-condition:** <required database state + which token is used>

## Request
```
POST /api/v1/orders
Authorization: Bearer <token for role user>
{ "items": [], "coupon": "EXPIRED2020" }
```

## Expected Response
```
422 Unprocessable Entity
{ "error_code": "EMPTY_CART", "message": "..." }
```

## Acceptance Criteria
*   responds 422 with error_code `EMPTY_CART`
*   no order is created in the database
*   no stack trace or table name appears in the response

## Business Logic / Rules
*   validate at the first layer, before touching the database
```

## 6. L1 smoke checklist

L1 has no scenario specs — one task named `Test : <work item>`.

```markdown
## Scope
<what changed + which flows it touches>

## Checklist
- [ ] <happy path of the flow you touched>
- [ ] <the original bug symptom — cite the steps from the bug ticket>
- [ ] <regression, neighbouring flow 1>
- [ ] <regression, neighbouring flow 2>

## Not tested
- <what you deliberately skipped + why>

## After deploy
- [ ] prod smoke: <the fixed flow once on production with the internal test account>
- [ ] rollback: redeploy <previous version> — confirmed possible
- [ ] watch 30 min: error rate for <endpoint / screen> stays at baseline
```

The "After deploy" block is three lines, not a plan — but a fix that was never checked on
production isn't verified. Full release guidance is in `release-readiness.md`.

## 7. Banned words in acceptance criteria

If a criterion contains one of these, rewrite it — they make the result depend on who ran the
test rather than on the system. When writing in another language, translate the left column and
keep the test: could two testers disagree about whether this passed?

| Don't write | Write instead |
| ---| --- |
| the system is fast | redirects within 1 second |
| easy to use | the primary action is visible without scrolling |
| data is secure | calling the API with a `user` role token returns 403 |
| displays correctly | the table total equals the sum of the visible rows |
| works normally | (name the observable behaviour — if you can't, you don't yet know what to test) |
| handles large data | 10,000 rows load within 3 seconds with no frozen frame |
| no errors | no console errors and no 5xx responses across the whole flow |
