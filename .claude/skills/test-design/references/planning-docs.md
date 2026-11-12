# Planning-level documents (L3–L4)

ISO/IEC/IEEE 29119-3 defines a family of test documents — organisational (policy, practices),
management (plan, status report, completion report), and dynamic (design / case / procedure
specs, data and environment requirements, execution log, incident report). Most teams have the
test cases and assume that's the set.
This file templates the four that go missing most often: **Test Plan · Risk Matrix ·
Traceability Matrix · Completion Report**. What happens after the tests pass — UAT, go/no-go,
deploy, production smoke, rollback — is in `release-readiness.md`.

| Document | Required at | Question it answers |
| ---| ---| --- |
| Test Plan | L4 | what gets tested, how, on which environment, and when it starts and ends |
| Risk Matrix | L4 | what to test first when time runs short |
| Environment Spec | L3 | what QA needs before testing can start |
| Traceability Matrix | L3 | is coverage complete — answered with evidence |
| Completion Report | L4 | can we release, and what risk are we accepting |
| Go / No-Go + sign-off | L3 (short form L2) | who decided to ship, on what evidence — `release-readiness.md` §3 |

---

## 1. Test Plan

```markdown
# Test Plan — <system / release>

## 1. Scope
| # | Module | Scenarios |
| ---| ---| --- |
| 1 | <module> | <n> |
|  | **Total** | **<N>** |

### Out of scope
- <what won't be tested + why>

## 2. Test Strategy
| Level | Who | Covers |
| ---| ---| --- |
| Unit | Dev | ... |
| Integration | Dev | ... |
| System (E2E) | QA | all N scenarios |
| Acceptance (UAT) | business owner, PM | one UAT script per business outcome — `release-readiness.md` §2 |
| Production verification | release owner | prod smoke + watch window — `release-readiness.md` §5, §7 |

**Techniques:** EP / BVA / decision table / state transition / pairwise / exploratory
**Quadrants covered** (taxonomy.md): Q1 component tests — <owner> · Q2 scenarios — QA ·
Q3 exploratory + UAT — <owner> · Q4 performance / security / reliability — <owner>. An
unowned quadrant is a gap to name in out-of-scope.
**Layer per check:** criteria provable at component level are asserted there; scenarios keep
what needs the whole system (test pyramid — don't re-test every boundary end to end).
**Estimate:** <scenarios × average run time + bug retest allowance (~30%) + regression tier +
exploratory sessions + UAT support> — state the basis so the number can be challenged.
**Automation split:** <what stays manual, what gets automated>
**Regression:** which tier runs on this release (smoke / core / targeted / full) + the impact
analysis behind it — `execution.md` §2
**Exploratory:** <n> charters, time-boxed — `execution.md` §4

## 3. Test Environment
| Item | Required value |
| ---| --- |
| Environment | staging with a database separate from production |
| URL | ... |
| Test data | per the test-data table (`execution.md` §3) — owner + reset path per set, no unmasked production personal data |
| External dependencies | which providers' sandboxes |
| Config QA must be able to change | TTLs, thresholds, feature flags |
| Access QA needs | read logs, reset seed data, change the config above |
| Tools | Postman, DevTools, real devices, ... |

## 4. Risk Assessment
(format in section 2 of this file)

## 5. Entry Criteria
- [ ] deployed to staging
- [ ] environment ready per section 3
- [ ] test data seeded
- [ ] Figma / API spec / permission matrix delivered
- [ ] smoke test passes (one pass through the main flow)

## 6. Exit Criteria
- [ ] every scenario checklist run to completion
- [ ] Happy + Alternate 100%
- [ ] Security paths 100% (no waiver)
- [ ] Error + Edge ≥ 95%, remainder accepted by the PM
- [ ] all critical/high bugs closed, or each open High accepted in writing by the PM
- [ ] P0 regression pack 100% on the frozen release build
- [ ] UAT accepted for every business outcome in scope
- [ ] no row in the traceability matrix without a status
- [ ] completion report delivered
- [ ] rollback rehearsed, prod smoke checklist ready (`release-readiness.md` §5–6)

## 7. Roles
| Role | Responsibility |
| ---| --- |
| QA Lead | plan, evidence, completion report — signs that the evidence is accurate |
| Product Manager | answers product questions, accepts risk, signs go/no-go for the business |
| Engineering Lead | build quality, deploy, rollback — signs go/no-go for production |
| Business owner | runs and signs UAT |
| (L4) Security / DPO | signs off Security paths / personal-data handling |

## 8. Schedule
| Stage | Owner | Start | End |
| ---| ---| ---| --- |
```

**Entry criteria exist so QA can hand work back.** Testing on an unprepared environment
produces phantom bugs that burn the whole team's time — a failing smoke test is a signal to
stop, not to push on.

## 2. Risk Matrix

Decides what gets tested first, because running short on time is the normal case, not the
exception.

```markdown
| # | Risk | Impact | Likelihood | Level | Covering scenarios |
| ---| ---| ---| ---| ---| --- |
| R1 | <the worst thing that could happen> | very high | medium | Critical | SC-... |
```

Level = impact × likelihood → Critical / High / Medium / Low.

Keep two kinds apart (CTFL v4 §5.2): **product risks** — what could be wrong with the software
(the rows above), which drive *what to test and in what order*; and **project risks** — what
could stop the testing (environment late, sandbox unavailable, key tester away, spec still
changing), which drive *the schedule and the entry criteria*. Put project risks in their own
short table with an owner and a mitigation; mixed into the product table they crowd out the
real priorities.
**Test order:** Critical → High → Medium → Low. When time runs out, cut from the bottom and
record what you cut in the completion report.

Risks that belong on almost every project's list:
- someone reaches data or an account that isn't theirs
- data is lost, or wrong data is written permanently
- users can't perform the primary task at all (the main flow is broken)
- money is calculated wrongly or charged twice (wherever money exists)
- a user locks themselves out with no way back in
- an external dependency fails and takes the system down with it

## 3. Traceability Matrix

```markdown
| ID | Scenario | Type | Priority | Risk | Test task | Build | Status | Bug | Automated |
| ---| ---| ---| ---| ---| ---| ---| ---| ---| --- |
| SC-XXX-01 | ... | Happy | P0 | R1 | <link> | 2.4.0-rc2 | Pass | | `e2e/checkout.spec.ts:14` |
```

Statuses: `Pass` / `Fail` / `Blocked` / `Skipped` — **Blocked and Skipped need a written
reason**, never a blank cell.
Add two tables at the end:
1. **Requirement → Scenario** (every PRD line has at least one scenario)
2. **Bug → Scenario → the criterion that failed** (this is what turns bugs into regression coverage)

The method for using this to judge coverage is in `coverage-audit.md`.

### Handing scenarios to automation

The `Automated` column is what stops the SOP from ending at documentation. Fill it with the
concrete test location (`e2e/checkout.spec.ts:14`, `test_refund.py::test_double_refund`), not a
yes/no — a reviewer must be able to open the test and see whether it really covers the scenario.

Conventions that make the mapping survive:
- **Name the automated test after the scenario id**, e.g. `test('SC-CHK-01 checkout with card', …)`.
  When it fails in CI, the failure names the spec, and anyone can read what the intended behaviour
  was without hunting for it.
- **One automated test per scenario, not per criterion.** The criteria become assertions inside
  it; if a criterion can't be asserted programmatically (a visual state, an email's appearance),
  leave it manual and mark the scenario partially automated rather than pretending.
- **Automate in risk order** — the Happy path of every module first (that's your smoke suite),
  then Security paths, then Error. Edge paths are usually the worst automation value per hour
  because they need contrived state.
- **A scenario spec is the source of truth, not the test.** When behaviour changes, the criteria
  change first and the test follows; a test that drifts from its scenario is a bug in the test.

## 4. Test Completion Report

ISO/IEC/IEEE 29119-3:2021 and the ISTQB CTFL v4 syllabus call this the **Test Completion
Report**; older material (IEEE 829, 29119-3:2013) calls it the *Test Summary Report* — same
document. Its in-cycle sibling is the **Test Status Report**: the one-line status in
`execution.md` §7, sent daily while the cycle runs.

```markdown
# Test Completion Report — <system / release>

| Field | Value |
| ---| --- |
| Cycle / release | |
| Dates | |
| Environment / build | |
| Testers | |

**Status:** <one line — see `execution.md` §7, e.g. "🟡 P0 100% · P1 91% pass · 1 High open, accepted by PM">

## 1. Scenario results
| Type | Total | Pass | Fail | Blocked | Skipped | % pass |
| ---| ---| ---| ---| ---| ---| --- |
| Happy Path | | | | | | |
| Alternate Path | | | | | | |
| Error Path | | | | | | |
| Edge Path | | | | | | |
| Security Path | | | | | | |

## 2. Module results
| Module | Scenarios | Pass | Fail | Bugs open | Assessment |
| ---| ---| ---| ---| ---| --- |

## 3. Non-Functional
| Area | Result | Notes |
| ---| ---| --- |

### By priority
| Priority | Planned | Run | Pass | Fail | Blocked |
| ---| ---| ---| ---| ---| --- |
| P0 | | | | | |
| P1 | | | | | |
| P2 | | | | | |
| P3 | | | | | |

## 4. Bugs
| Severity | Found | Closed | Still open |
| ---| ---| ---| --- |
| Critical | | | |
| High | | | |
| Medium | | | |
| Low | | | |

### Open bugs and why they're being accepted
| Bug | Severity | Scenario | Reason accepted | Approver |
| ---| ---| ---| ---| --- |

### UAT
| UAT | Business outcome | Runner | Result | Open defects |
| ---| ---| ---| ---| --- |

### Metrics
| Metric | This release | Previous |
| ---| ---| --- |
| Defect escape rate (previous release) | | |
| Reopen rate | | |
| Blocked ratio | | |

## 5. What was not tested (never leave this empty)
| Item | Reason | Risk accepted |
| ---| ---| --- |

## 6. Exit criteria — met or not
(copy from test plan section 6 and tick)

## 7. Recommendation
**Ship:** ☐ yes ☐ yes with conditions ☐ no
Conditions / reasoning:
**Process improvements for next cycle (not bugs):**

## 8. Sign-off
| Role | Name | Decision | Date |
| ---| ---| ---| --- |
| QA Lead (evidence is accurate) | | | |
| Product Manager (business risk accepted) | | | |
| Engineering Lead (deploy + rollback ready) | | | |
```

QA recommends; the PM and engineering lead decide. The go/no-go page in
`release-readiness.md` §3 is built from this report.

### Test completion activities (after the report)

ISTQB lists these as part of closing a cycle; they are what makes the next cycle cheaper.

```markdown
- [ ] open bugs moved to the backlog with severity, priority, and owner — none left in "Verifying"
- [ ] accepted risks recorded where the next release will see them
- [ ] lessons learned (15 min): what slowed testing, what escaped, what to change — goes in §7
- [ ] testware archived: final scenario set, data scripts, environment notes, the build tested
- [ ] regression pack updated: new scenarios added, priorities adjusted, retired ones marked
- [ ] test environments / data torn down or reset; temporary access revoked
```

**Section 5 is the heart of the report.** A report listing only what passed leaves readers
believing everything was tested. Writing "did not test Safari on iOS 16 — no device available;
the risk is that its cookie policy differs from iOS 17" puts the release decision on real
information and moves the responsibility to the approver, fairly.
