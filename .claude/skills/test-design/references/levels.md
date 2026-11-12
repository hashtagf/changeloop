# The four testing levels

Each level is a **set of deliverables**, not an intention — if you didn't ship the list, you
didn't reach the level.

---

## L1 Smoke — prove nothing broke

**Use for:** bugfixes, hotfixes, config changes, refactors, dependency bumps, any small
change that introduces no new flow.

**Deliver**

```markdown
- [ ] one checklist of 5–15 pre-deploy items (no separate scenario specs)
- [ ] it must include: the happy path of the flow you touched + the original bug symptom (for a bugfix)
- [ ] 3–5 regression items for neighbouring flows that share the same code
- [ ] after deploy (separate 3-line block, outside the 5–15): prod smoke of the fixed flow + rollback path named + 30-min watch
```

**Closing criterion:** 100% pass. L1 has no room for accepted failures — if you can accept
one at smoke level, the change shouldn't ship.

**Shape:** one tracker task named `Test : <work item>` with the checklist in its description.

**Skip entirely:** scenario specs, test plan, NFR, traceability.

---

## L2 Module — one new flow

**Use for:** a new feature on one screen / one flow, a new endpoint group, any change to
behaviour the user can see.

**Deliver**

```markdown
- [ ] one Module task: overview + scenario table (ID / name / type)
- [ ] a spec for every scenario: Type, Persona, Pre-condition, Steps, Criteria, Business Logic, UX/UI
- [ ] one test-case checklist per scenario (the criteria, 1:1)
- [ ] at least one Happy and one Error path
- [ ] a Priority (P0–P3) on every scenario
- [ ] test data table (what, state, owner, reset) — execution.md §3
- [ ] one exploratory charter for the module
- [ ] the bug template, ready to use
- [ ] if user-visible behaviour changes: a UAT script; short-form go/no-go; prod smoke
```

**Reasonable size:** 3–8 scenarios. More than 10 usually means this is two modules.

**Closing criteria:** Happy + Alternate 100% · Error ≥ 95%, with any failures explicitly
accepted by the work's owner.

---

## L3 System — epic / release

**Use for:** several modules working together, a release with multiple features, integration
with an external system, a migration.

**Deliver** (on top of L2)

```markdown
- [ ] INDEX: module list + coverage map (system capability → covering scenarios) + test data needed
- [ ] at least one Edge path per module that involves timing, concurrency, or the network
- [ ] a Non-Functional checklist that gets re-run per module
- [ ] traceability matrix: scenario → priority → test task → build → status → bug
- [ ] an explicit out-of-scope list
- [ ] regression tier + impact analysis for this release (execution.md §2)
- [ ] release readiness: UAT scripts, go/no-go with named signers, deploy plan, rollback
      plan + drill, prod smoke, watch-window signals (release-readiness.md)
```

**Closing criteria:** on top of L2 — Edge ≥ 95% · NFR meets the thresholds you set · no row
in the matrix left without a status.

---

## L4 Critical — where mistakes are not affordable

**Use for:** authentication, authorization, payment, sensitive personal data or access to other people's data, irreversible data
migration, any system where downtime has a clear cost — or whenever the user asks "is our
coverage actually complete?"

**Deliver** (on top of L3)

```markdown
- [ ] Security paths in every module + a cross-cutting module for attacks that span flows
      (brute force, CSRF, enumeration, injection, IDOR, token tampering)
- [ ] OWASP baseline (checklist-library.md §7c): each category designed, or named in
      "not tested" with who covers it (security team, scanner, pentest)
- [ ] Test Plan: scope + out-of-scope, strategy (levels/types/techniques), environment spec,
      risk matrix, entry/exit criteria, roles, schedule
- [ ] decision table + state transitions covering every meaningful combination of states
- [ ] Test Completion Report at close, including a complete "what we did not test" section
- [ ] two-way coverage audit: every requirement has a scenario / every scenario has a status
- [ ] personal data in scope → privacy criteria (checklist-library.md §9b) + DPO in the sign-off
- [ ] go/no-go signed by PM, QA lead, engineering lead, and security/compliance
```

**Closing criteria:** Security paths 100% with no waiver · all critical/high bugs closed ·
completion report approved · go/no-go signed · prod smoke passed after deploy.

**Real effort:** the reference authentication set is 12 modules / 64 scenarios / 18 files —
budget 3–5 days to write and another 3–5 to run.

**Delivery discipline at this size:** fill the highest-risk modules to 100% before touching
the rest, and report per-file completeness. A single pass over ~45 scenarios reliably runs
out of room partway, and a scaffold full of placeholders reads as finished work.

---

## Quick comparison

| | L1 | L2 | L3 | L4 |
| ---| ---| ---| ---| --- |
| Scenario specs | ✗ | ✓ | ✓ | ✓ |
| Happy / Error | ✓ (inside the checklist) | ✓ | ✓ | ✓ |
| Edge paths | ✗ | if you spot one | ✓ | ✓ |
| Security paths | ✗ | if permissions are involved | ✓ | ✓ full |
| NFR checklist | ✗ | ✗ | ✓ | ✓ |
| Test Plan | ✗ | ✗ | ✗ | ✓ |
| Traceability | ✗ | ✗ | ✓ | ✓ |
| Completion Report | ✗ | ✗ | if a report is expected | ✓ |
| Risk matrix | ✗ | ✗ | ✗ | ✓ |
| Priority P0–P3 | ✗ | ✓ | ✓ | ✓ |
| Test data plan | ✗ | ✓ | ✓ | ✓ |
| Exploratory charter | ✗ | ✓ 1 | ✓ per module | ✓ per module |
| UAT + sign-off | ✗ | if user-visible | ✓ | ✓ |
| Go / No-Go | ✗ | short form | ✓ | ✓ + security |
| Rollback | one line | ✓ | ✓ + drill | ✓ + drill |
| Prod smoke + watch | ✓ 30 min | ✓ | ✓ 24 h | ✓ 24–72 h |

---

## Changing level mid-task

**Escalating** is common and fine: you start at L2 and discover the feature touches user
permissions → raise it to L4, tell the owner why and what it adds in time. Don't silently do
the extra work — they may know that part is already covered by a security team.

**De-escalating** needs someone to approve it and needs the risk written down: "dropping the
Security paths for module X because of the deadline — the accepted risk is that IDOR on
endpoint Y goes untested." A sentence like that puts the decision back with the owner instead
of hiding it in QA's silence.
