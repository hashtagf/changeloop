# Release readiness — from "tests passed" to "safe in production"

Passing every scenario on staging answers *does the build behave as specified*. It does not
answer *can we put it in front of users, see whether it works there, and get out if it
doesn't*. This file covers that second question: requirement readiness before design, UAT and
sign-off, the go/no-go decision, the deploy itself, verification in production, rollback, and
the watch window afterwards.

Read it when the work is going to production (almost always), when a PM or lead asks "can we
ship?", or when the user asks for UAT, a release checklist, go/no-go, or sign-off.

## Contents

1. Requirement readiness (before test design starts)
2. UAT script + sign-off
3. Go / No-Go checklist
4. Deploy plan: flags, migrations, staged rollout
5. Production smoke (post-deploy verification)
6. Rollback plan + drill
7. Watch window + success signals
8. Hotfix path
9. What each level needs

---

## 1. Requirement readiness (before test design starts)

Most "bugs" found late are requirements nobody wrote down. Spend ten minutes on this before
step 3 of the workflow — it is the cheapest point in the whole lifecycle to fix a gap.

**Definition of Ready for testing**

```markdown
- [ ] every user story has acceptance criteria someone other than the author can check
- [ ] the error behaviour is specified, not only the success (what does the user see when X fails?)
- [ ] the permission matrix exists for any feature with more than one role
- [ ] limits are numbers (max size, max rows, timeout, rate limit), not "reasonable"
- [ ] Figma covers loading / empty / error / disabled states, not only the filled screen
- [ ] the analytics events the PM will judge the feature by are named (see §7)
- [ ] the rollout strategy is known: flag? percentage? which users first?
- [ ] the owner who can answer questions during testing is named
```

**Product questions list.** Anything you can't answer from the inputs goes back to the PM as
a numbered question, not into an assumption you quietly encode:

```markdown
| # | Question | Why it matters for testing | Blocking? | Answer | Answered by |
| ---| ---| ---| ---| ---| --- |
| Q1 | Can a refunded order be refunded again partially? | decides whether SC-REF-04 is Error or Happy | yes | | |
```

`Blocking? = yes` means the affected scenarios stay in the list but are marked `Blocked —
waiting Q1` in the traceability matrix. This is the PM-facing twin of the numbered
assumptions (A1, A2…) in SKILL.md rule 10: assumptions are what you decided so you could
proceed; questions are what only the owner can decide.

**Three-amigos pass (PM + Dev + QA, 15–30 min).** Walk the scenario table from step 3 —
not the full specs — and ask each other three things per flow: *what should happen when this
fails? who must not be able to do this? what number makes this "too slow / too big"?* The
answers become criteria. Without this pass the scenario list reflects only QA's reading of
the PRD.

---

## 2. UAT script + sign-off

UAT is not QA re-running the system test. It is **the business owner confirming the feature
solves their problem**, in their words, on realistic data. Different reader, different
document.

**Rules for a UAT script**
- written in business language — no endpoints, status codes, or selectors
- one script per business outcome ("a customer can return an item and get money back"),
  not per screen
- uses realistic data (real-looking product names, real price ranges, real roles) on a
  production-like environment
- every step has an expected outcome a non-technical person can judge
- short: at most ~12 steps — a simple outcome may need only 3–4. UAT testers are busy people
  doing this on top of their job; past 12, split the outcome
- covers Happy + the Alternates the business cares about. Error/Edge/Security stay with QA —
  don't ask business users to hunt for injection bugs

```markdown
## UAT-<NN> · <business outcome in the user's words>

**Who runs it:** <role, e.g. Customer Service Lead>
**Covers scenarios:** SC-RET-01, SC-RET-03
**Environment / login:** <UAT URL> · user `cs.lead@uat` (password in the vault)
**Data prepared:** order #UAT-1042 delivered 3 days ago, 2 items, paid by card

| # | Do this | You should see | OK? | Notes |
| ---| ---| ---| ---| --- |
| 1 | Open order #UAT-1042 and press "Return item" | a list of the 2 items with checkboxes | ☐ | |
| 2 | Tick one item, choose reason "Damaged", submit | "Return requested" and a return number | ☐ | |
| 3 | ... | ... | ☐ | |

**Result:** ☐ Accepted ☐ Accepted with conditions ☐ Rejected
**Conditions / feedback:**
**Signed off by:** <name> · <role> · <date>
```

**Classify UAT feedback before acting on it.** Business users report three different things
in the same voice; mixing them derails the release.

| Feedback kind | Example | Goes to |
| ---| ---| --- |
| Defect | "Return number doesn't appear" | bug ticket, cite UAT step + scenario |
| Change request | "Could we also allow exchanges?" | PM backlog — not a blocker unless the PM says so |
| Misunderstanding | "I expected the refund instantly" (spec says 3–5 days) | clarify; consider UI copy |

**UAT sign-off table** (goes into the completion report and the go/no-go):

```markdown
| UAT | Business outcome | Runner | Result | Date | Open defects |
| ---| ---| ---| ---| ---| --- |
| UAT-01 | customer can return an item | CS Lead | Accepted | | — |
```

---

## 3. Go / No-Go checklist

The release decision meeting needs one page. Fill it from the completion report — never from
memory — and get it signed by named people, not "the team".

```markdown
# Go / No-Go — <release / version> · <date>

## Quality
- [ ] exit criteria in the test plan met (or each miss listed below with an owner)
- [ ] no open Critical bugs · open High bugs each accepted in writing by the PM
- [ ] Security paths 100% pass (no waiver) — L4
- [ ] P0 regression pack passed on the release build (see execution.md §2)
- [ ] UAT accepted for every business outcome in scope
- [ ] "what was not tested" section reviewed by the approvers below

## Production readiness
- [ ] deploy plan written: order of steps, flag states, migration steps (§4)
- [ ] rollback plan written **and rehearsed on staging** (§6)
- [ ] database migration is backward-compatible with the previous app version, or downtime is approved
- [ ] feature flag default state agreed; kill switch tested
- [ ] dashboards + alerts exist for the new flow and an alert has been test-fired
- [ ] analytics events verified firing with correct properties (§7)
- [ ] production smoke checklist ready, with a safe test account (§5)
- [ ] config / secrets / third-party production credentials set and verified (not sandbox)

## People
- [ ] release owner on duty for the deploy and the watch window
- [ ] support team briefed: what changed, known issues, how to escalate
- [ ] release notes / changelog written (user-facing + internal)
- [ ] customer comms sent if behaviour visibly changes

## Known issues shipping with this release
| Bug | Severity | User impact | Workaround | Fix target |
| ---| ---| ---| ---| --- |

## Decision
☐ GO ☐ GO with conditions ☐ NO-GO
Conditions:

| Role | Name | Decision | Date |
| ---| ---| ---| --- |
| Product Manager | | | |
| QA Lead | | | |
| Engineering Lead | | | |
| (L4) Security / Compliance | | | |
```

**Who signs what.** QA signs that the evidence is accurate and complete — *not* that the
release is a good idea. The PM owns the business-risk decision (shipping with known issues,
dropping scope). Engineering owns the deploy and rollback. Keeping these separate is what
stops QA from becoming the person blamed for a business call.

**NO-GO is a normal outcome**, not a failure. Record why and what would change the answer.

---

## 4. Deploy plan: flags, migrations, staged rollout

Write the plan as numbered steps someone else could execute. Each step names how you know it
worked.

```markdown
| # | Step | Who | Verify by | If it fails |
| ---| ---| ---| ---| --- |
| 1 | run migration 0042 (additive: new column, nullable) | Dev | row count unchanged, column exists | stop, no rollback needed |
| 2 | deploy app v2.4.0 with flag `returns_v2` = off | Dev | health check green, error rate flat | redeploy v2.3.x |
| 3 | flag on for internal staff | PM | prod smoke §5 passes as staff | flag off |
| 4 | flag on for 10% of users | PM | watch window §7, 1 hour | flag off |
| 5 | flag on for 100% | PM | watch window §7, 24 hours | flag off |
```

**Judge a canary against a control, not against yesterday.** During a percentage rollout,
compare the users on the new version with the users still on the old one *over the same
minutes* (error rate, latency, conversion). Before/after comparisons are confounded by time of
day and traffic mix; a same-time control isn't. Set the pass/fail thresholds from the service's
SLOs before the rollout starts (Google SRE Workbook, *Canarying Releases*).

**Feature-flag test cases** (add to the scenario set when the feature ships behind a flag):

```markdown
- [ ] flag off: the old behaviour is unchanged — run the parent module's Happy paths
- [ ] flag on: the new behaviour works — run the new module's Happy paths
- [ ] flipping the flag on and off while a user is mid-flow leaves no half-written data
- [ ] the API enforces the flag too — calling the new endpoint with the flag off is refused
- [ ] percentage rollout is sticky per user (the same user doesn't flip between versions on refresh)
- [ ] the kill switch takes effect within the stated time without a deploy
```

**Migration compatibility** — the deploy window is the most common moment for data damage:

```markdown
- [ ] the old app version still works against the migrated schema (rollback of app alone is possible)
- [ ] the new app version works against the un-migrated schema, or the order of steps prevents it
- [ ] the migration on a production-size copy finishes within the agreed window
- [ ] row counts before/after match the expected delta
```

---

## 5. Production smoke (post-deploy verification)

Run within minutes of the deploy, on production, by a named person. It proves the deploy
worked — not the feature (staging did that).

**Rules for testing in production**
- use dedicated test accounts flagged as internal, excluded from analytics and billing
- read-only where possible; anything that writes must be reversible or clearly test data
  (e.g. an order on a test account with a 100% coupon, then cancelled)
- never use a real customer's account, and never test with real card payments unless the
  finance owner has agreed a test transaction + refund
- 10 minutes, 5–10 items. If it takes longer, it's a regression run, not a smoke

```markdown
## Prod smoke — <release> · run by <name> at <time>

- [ ] version / build shown in the health endpoint or footer is the expected one
- [ ] log in with the internal test account
- [ ] the new feature's Happy path completes once (flag on for internal users)
- [ ] the most-used existing flow still completes (e.g. search → product → cart)
- [ ] any third-party call in the flow hits the production provider, not sandbox
- [ ] no new error types in the error tracker since the deploy
- [ ] error rate and p95 latency on the dashboard are within normal range
- [ ] test data created above is cleaned up or tagged

Result: ☐ pass → continue rollout ☐ fail → execute rollback (§6)
```

---

## 6. Rollback plan + drill

A rollback plan that has never been executed is a hope. Rehearse it on staging before the
go/no-go.

```markdown
## Rollback — <release>

**Trigger (any one):** prod smoke fails · error rate > <x>% for 5 min · a Critical bug
reported · <business metric> drops below <y>
**Decision owner:** <name> — does not need a meeting to pull the trigger
**Fastest path:** flag `<name>` off (≤ 1 min) → else redeploy <previous version> (≤ <n> min)
**Data:** <what happens to rows written by the new version — kept / migrated back / orphaned>
**Not reversible:** <emails sent, payments captured, webhooks delivered to partners> → how handled

### Drill (on staging, before go/no-go)
- [ ] deploy new version, create data through the new flow
- [ ] roll back by the planned path, timed: ___ min
- [ ] data created by the new version doesn't break the old version (no 500s on those rows)
- [ ] roll forward again works
```

The "not reversible" line is the one PMs most need to see: a rollback restores code, not the
emails that already went out.

---

## 7. Watch window + success signals

Shipping is the start of the measurement, not the end. Define both kinds of signal **before**
release, with numbers.

```markdown
| Signal | Kind | Source | Normal | Alarm | Owner |
| ---| ---| ---| ---| ---| --- |
| checkout error rate | health | APM | < 0.5% | > 2% for 5 min | Dev on duty |
| p95 /api/returns | health | APM | < 400 ms | > 1 s | Dev on duty |
| returns_submitted / day | product | analytics | baseline 0 → target 50 | < 5 after 48 h | PM |
| support tickets tagged "return" | product | helpdesk | ~10/day | > 30/day | Support lead |
```

Where the service has SLOs, express the health alarms as SLO burn (e.g. error budget burning
at more than 10× the normal rate) rather than raw thresholds picked on the day.

**Watch window length:** L1 30 min · L2 a few hours · L3–L4 24–72 hours with the release
owner reachable.

**Analytics verification** — the PM's success metric is worthless if the events are wrong,
and nobody notices until the review meeting two weeks later:

```markdown
- [ ] every event in the tracking plan fires once per action (not twice, not on page load)
- [ ] event properties carry the right values and types (amount as a number, ids not names)
- [ ] events fire for the failure path too, when the plan says so
- [ ] internal / test accounts are excluded or tagged
- [ ] the dashboard the PM will use shows the test events end to end
- [ ] no personal data sent in event properties (email, phone, full name) unless approved
```

---

## 8. Hotfix path

A hotfix skips most of this — not all of it.

```markdown
- [ ] L1 smoke on the fix (original symptom + neighbouring flows)
- [ ] P0 regression pack on the hotfix build
- [ ] rollback = redeploy previous version — confirmed possible
- [ ] prod smoke after deploy
- [ ] the bug's symptom added as a permanent criterion (rule 8)
- [ ] post-incident note: why didn't a scenario catch this? → new scenario or updated criterion
```

The last line is how the set gets better every incident instead of only after audits.

---

## 9. What each level needs

| | L1 | L2 | L3 | L4 |
| ---| ---| ---| ---| --- |
| Definition of Ready / product questions | — | ✓ | ✓ | ✓ |
| Three-amigos pass | — | if more than one role | ✓ | ✓ |
| UAT script + sign-off | — | if user-visible behaviour changes | ✓ | ✓ |
| Go / No-Go with named signers | — | short form (Quality + Decision) | ✓ | ✓ + Security / Compliance |
| Deploy plan | — | if flag or migration | ✓ | ✓ |
| Rollback plan | one line: "redeploy previous" | ✓ | ✓ + drill | ✓ + drill |
| Prod smoke | ✓ (3–5 items) | ✓ | ✓ | ✓ |
| Watch window + signals | 30 min, health only | health + 1 product signal | full table | full table |
| Analytics verification | — | if events added | ✓ | ✓ |
