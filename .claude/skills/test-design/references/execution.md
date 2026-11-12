# Running the set — priority, regression, test data, exploratory, bugs, metrics

Writing scenarios is half the job. This file covers running them release after release:
which ones to run when time is short, how the set becomes a regression pack, what data it
needs, how unscripted testing fits in, how bugs move from found to closed, and the numbers
that tell a lead whether the process is working.

## Contents

1. Scenario priority (P0–P3)
2. Regression pack — tiers and selection
3. Test data
4. Exploratory sessions
5. Bug lifecycle + priority vs severity
6. Retest, flaky results, and environments
7. Metrics that matter

---

## 1. Scenario priority (P0–P3)

Severity (templates.md §4) rates a **bug's** consequence. Priority rates a **scenario's**
place in the running order. Every scenario gets one, set when the list is confirmed (step 3).

| Priority | Meaning | Typical content | Runs |
| ---| ---| ---| --- |
| **P0** | if this fails, nobody can use the product or money/data is wrong | Happy path of each core flow, login, checkout, the Critical risks | every build, every deploy, prod smoke |
| **P1** | a main flow or a High risk | Alternates of core flows, Security paths, Error paths with money/data impact | every release candidate |
| **P2** | secondary flows, common errors | most Error paths, Edge paths on main flows | releases touching that module |
| **P3** | rare edges, cosmetic | rare Edge, UI polish | when the module changes substantially, or exploratory time allows |

Derivation: start from the risk matrix — scenarios covering a Critical risk are P0/P1,
High → P1/P2, Medium → P2, Low → P3. Then bump every Security path to at least P1.

**Keep P0 small.** It is the set that runs on every deploy. A rule of thumb: P0 ≈ 10–15% of
scenarios, runnable by hand in under 30 minutes (or a few minutes automated). A P0 of 80
items doesn't get run.

---

## 2. Regression pack — tiers and selection

The scenario set *is* the regression suite; there's no second document. What changes per
release is **which slice** you run.

| Tier | Contents | When |
| ---| ---| --- |
| Smoke | all P0 | every build / deploy, prod smoke (subset) |
| Core regression | P0 + P1 | every release candidate |
| Targeted | P0 + P1 + every P2/P3 of the modules the change touched (impact analysis below) | normal release |
| Full | everything | major release, framework/infra upgrade, before an audit |

**Impact analysis — choosing the targeted slice.** Don't pick modules from the release title.
For each change in the release:

```markdown
| Change (PR / ticket) | Code touched | Modules affected | Why | Scenarios added to the run |
| ---| ---| ---| ---| --- |
| PR #412 discount rounding | pricing/calc.ts | Checkout, Invoice, Refund | all three call calc() | SC-CHK-*, SC-INV-03, SC-REF-02 |
```

Walk call sites, shared components, shared tables, and cron jobs that read the same data.
State what you deliberately didn't run in the completion report §5.

**Keeping the pack healthy**
- a scenario that hasn't failed in a long time is not useless — it may be guarding the most
  stable, most important flow. Retire scenarios only when the feature is removed.
- a bug that escaped → add or tighten a criterion (rule 8), and consider raising the
  scenario's priority
- when a feature is removed, mark its scenarios `Retired — <release>` instead of deleting
  them; bugs and old reports still cite those ids
- automate P0 first, then P1 Security, then P1 Error (planning-docs.md §3)

---

## 3. Test data

Unprepared data is the biggest cause of `Blocked`. Plan it in the INDEX at L2+ and as part
of entry criteria at L3+.

```markdown
## Test data

| ID | What | State required | Used by | How to create / reset | Owner |
| ---| ---| ---| ---| ---| --- |
| TD-01 | customer, verified, 2FA off | active, 0 orders | SC-CHK-01..05 | seed script `seed:checkout` | Dev |
| TD-02 | customer with a delivered order 3 days old | order delivered, paid by card | SC-RET-01..04, UAT-01 | SQL in `qa/fixtures/returns.sql` | QA |
| TD-03 | admin role | — | SC-RBAC-* | created once, never deleted | QA |
| TD-04 | product priced 0.01 / 99,999,999.99 | boundary prices | SC-CHK-07 Edge | admin panel | QA |
```

**Rules**
- **one owner per data set and a reset path.** Data that only one person can recreate gets
  "borrowed" and silently mutated by other testers; a reset makes reruns comparable.
- **no real personal data outside production.** Production copies used for testing must be
  masked (names, emails, phones, national ids, addresses, card data) before they leave
  production. Masked data keeps format and distribution — a Thai phone number stays a valid
  10-digit format — or Edge paths go untested.
- **boundary data is data too.** BVA values (max length name, 0.01 amount, 1-day-before-expiry
  coupon) need to exist before the run, not be invented mid-test.
- **time-dependent data** (expiring tokens, "3 days ago" orders, subscription renewals) needs
  either a controllable clock on the test environment or a script that creates it relative to
  now. Note which in the environment spec.
- **third-party sandboxes**: list the sandbox test cards / accounts / webhook simulators per
  provider — e.g. a gateway's "card declined" and "3DS required" test numbers.

---

## 4. Exploratory sessions

Scripted scenarios find what you thought of. Exploratory testing finds what you didn't — and
the bugs it finds become new scenarios. Budget one session per module at L2+, more on new or
high-risk modules.

**Session-based: a charter, a time box, a debrief.**

```markdown
## Charter EX-<NN>

**Explore** <area / feature>
**With** <resources, data, tools, personas — e.g. two browsers logged in as the same user, slow 3G>
**To discover** <the kind of information sought — e.g. what happens to the cart when stock changes mid-checkout>
**Time box:** 60–90 min · **Tester:** <name> · **Build:** <version>

### Notes (while testing)
- <what you tried, what you saw — terse>

### Debrief
| Found | Kind | Action |
| ---| ---| --- |
| total doesn't refresh when coupon expires mid-session | bug | Issue [SC-CHK-04] … |
| no limit on cart quantity | question for PM | Q7 in product questions |
| refund flow with partial shipment untested | coverage gap | new scenario SC-REF-09 |

**Time split:** setup __% · testing __% · bug investigation/reporting __%
**Areas not reached:** <so the next charter can pick them up>
```

**Where test ideas come from — SFDIPOT** (product elements from Bach's Heuristic Test
Strategy Model). Walk the feature through each and write one charter per letter that turns up
something: **S**tructure (what it's made of — files, components, dependencies) · **F**unction
(what it does, including error handling) · **D**ata (input, output, stored, boundaries,
lifecycle) · **I**nterfaces (UI, API, import/export, integrations) · **P**latform (browser, OS,
device, infrastructure it depends on) · **O**perations (how real users actually use it, including
misuse and heavy use) · **T**ime (timeouts, concurrency, time zones, expiry, order of events).

**How to tell it's a bug when no spec says so — oracles (FEW HICCUPPS, Bolton).** A behaviour
is suspect if it's inconsistent with: **F**amiliar problems · **E**xplainability · the
**W**orld · **H**istory (previous version) · **I**mage (the brand) · **C**omparable products ·
**C**laims (docs, marketing, PRD) · **U**ser expectations · the **P**roduct itself (elsewhere in
the app) · **P**urpose · **S**tatutes and standards. Name the oracle in the bug report's
Expected Result when no criterion covers it ("inconsistent with History: v2.3 kept the filter
after refresh") — then add the criterion, per templates.md §4.

Useful charter seeds: interrupt the flow (back, refresh, close tab, lose network) · two
actors on the same record · the same user on two devices · extreme data (empty, huge,
unicode, RTL, emoji) · out-of-order actions · the oldest supported browser/device · role
switching mid-session.

---

## 5. Bug lifecycle + priority vs severity

**Severity** = consequence (templates.md §4 rubric) — set by QA, rarely changes.
**Priority** = fix order — set by the PM/lead, depends on the release plan.

| | High priority | Low priority |
| ---| ---| --- |
| **High severity** | fix now (double charge on a live flow) | serious but not reachable yet (crash in a flagged-off feature) |
| **Low severity** | cheap but visible (typo in the logo, wrong company name on invoice) | backlog |

Keep both fields. A bug list sorted by one field hides half the decisions.

**Lifecycle**

```
New → Triaged (severity + priority + owner set)
    → In progress → Fixed (dev, with build/version)
    → Verifying (QA: original steps + regression of the parent scenario)
        → Closed            (fixed, criterion added if missing)
        → Reopened          (still reproduces → back to In progress, keep the same ticket)
    → Won't fix / Accepted risk (PM writes the reason; listed in completion report §4)
    → Duplicate (link the original) · Cannot reproduce (needs env + build + 2 attempts noted)
```

Rules:
- **only QA (or the reporter) closes a bug**, after verifying on a build that contains the
  fix. A developer marking "Fixed" is a claim, not a result.
- **verification = original steps + the parent scenario's checklist**, not just the steps.
  Fixes break their neighbours.
- **reopen the same ticket** when the same symptom returns; a new ticket loses the history.
  A different symptom caused by the fix is a new ticket linking the old one.
- **"Cannot reproduce" needs evidence**: environment, build, data, number of attempts. Then
  it can be closed — not before.
- **triage cadence**: daily during a test cycle; new Critical bugs are triaged within the hour.

---

## 6. Retest, flaky results, and environments

- **A result is only evidence for the build it ran on.** Record build/version in every test
  task; a Pass on build 41 says nothing about build 43 if the module changed.
- **Intermittent failure is a bug until proven otherwise.** Run 5 times, record the rate
  ("fails 2/5"), attach logs, file it — race conditions in production look exactly like
  "flaky" on staging. Never mark Pass on the retry that happened to succeed.
- **Environment failures are `Blocked`, not `Fail`** — staging down, seed data missing,
  sandbox outage. Write the reason; it goes into the environment section of the summary
  report, and a pattern of them is a process finding.
- **Freeze the build for the final regression run.** Re-running while new commits land means
  no single build has a complete result.

---

## 7. Metrics that matter

Report a handful, consistently, release over release. Each one answers a question someone
actually asks.

| Metric | Formula | Question it answers | Watch for |
| ---| ---| ---| --- |
| **Execution progress** | run / planned, by priority | are we going to finish? | P0/P1 not 100% near the deadline |
| **Pass rate** | pass / run, by type and priority | is the build healthy? | P0 < 100% = not shippable |
| **Open bugs by severity** | count, trend per day | can we ship? | Critical > 0, High not trending down |
| **Defect escape rate** | bugs found in prod ÷ (found before + in prod), per release | is our testing catching what matters? | rising trend; each escape gets a post-incident line (release-readiness.md §8) |
| **Requirement coverage** | requirements with ≥1 scenario ÷ all | did we forget anything? | < 100% without accepted gaps |
| **Blocked ratio** | blocked / planned | is the environment / data hurting us? | > 10% = fix the environment, not the testers |
| **Reopen rate** | reopened ÷ fixed | are fixes verified properly? | > 15% |

Avoid as targets: number of test cases written, number of bugs found per tester. Both reward
the wrong behaviour.

**One-line status for stakeholders** (daily during a cycle, top of the completion report):

```markdown
**<release> · day 3/5 · 🟡 at risk** — P0 100% pass · P1 82% run (91% pass) · 1 Critical open
(double refund, fix ETA tomorrow) · UAT starts Thu · blocker: payment sandbox down since 10:00.
```

Colour rule: 🟢 on track · 🟡 a P0/P1 risk or a slipping date with a plan · 🔴 a Critical open
without a fix plan, or exit criteria can't be met by the date.
