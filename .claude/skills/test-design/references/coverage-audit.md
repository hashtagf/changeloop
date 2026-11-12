# Answering "is our coverage complete?" with evidence

This question can't be answered by feel. If the answer is "yes, we're covered" without a
table behind it, the answer isn't known yet.
Run these six checks — they work on documents you just wrote and on a team's existing
documents you're reviewing.

## Contents

1. Two-way traceability
2. Path-type distribution
3. Flow × type grid, plus accepted gaps
4. Decision table completeness
5. State transition completeness
6. Document-type check (meta level)

---

## 1. Two-way traceability

One direction isn't enough — each catches a different problem.

**Direction 1: requirement → scenario** (catches what was forgotten)

| Req | Requirement | Covering scenarios | Complete? |
| ---| ---| ---| --- |

Walk every line of the PRD / user story / API spec relevant to this work. A line with no
scenario is a hole.
With no PRD, substitute other sources: every Figma frame, every endpoint in the API spec,
every state in the state machine, every cell in the permission matrix.

**Direction 2: scenario → status** (catches what was written but never run)

| ID | Scenario | Type | Test task | Status | Bug |
| ---| ---| ---| ---| ---| --- |

A row without a status at release time means coverage is incomplete, however good the
documents look. `Blocked` and `Skipped` require a written reason.

## 2. Path-type distribution

Count scenarios by type and compare to target.

| Type | Count | Share | Target (L3–L4) |
| ---| ---| ---| --- |
| Happy | | | ~20% |
| Alternate | | | ~20% |
| Error | | | ~30% |
| Edge | | | ~15% |
| Security | | | ~15% |

**Happy above 40% means coverage is still one-directional** — the single most common symptom
in team-written test docs.
**Security at 0 in a system with a login is a certain hole.**
Deviating from target is fine when you can explain it: the reference auth set runs Security at
25% because it is the highest-risk surface — write the reason into the table rather than
leaving readers to guess.

Quick count from markdown files:
```bash
grep -c 'Happy Path' *.md   # repeat per type and compare
```
Inside a tracker, group by the Type field instead.

## 3. Flow × type grid, plus accepted gaps

This grid surfaces holes the eye slides over.

| Flow | Happy | Alternate | Error | Edge | Security |
| ---| ---| ---| ---| ---| --- |
| <flow 1> | ✓ | ✓ | ✓ | ✓ | ✓ |
| <flow 2> | ✓ | — | ✓ | — | — |

Then immediately write the second table — **gaps accepted on purpose**:

| Cell | Reason |
| ---| --- |
| flow 2 — Alternate | this flow has one route; there is no alternative success path |
| flow 2 — Security | no sensitive data and no permission requirement |

The second table matters more than the first, because it separates "forgot" from "decided not
to". Without it, readers can't tell what a `—` means, and neither will you in two months.

## 4. Decision table completeness

For flows where several states multiply — the technique with the best return at L4.

Method: list the states that change behaviour → build the grid of combinations → attach the
scenario covering each row.

| verified | locked | 2FA | provider | Expected | Scenario |
| ---| ---| ---| ---| ---| --- |
| ✗ | ✗ | ✗ | password | rejected, must verify first | SC-VERIFY-04 |
| ✓ | ✗ | ✗ | password | success | SC-LOGIN-01 |
| ✓ | ✓ | ✗ | password | rejected, countdown shown | SC-LOGIN-03 |
| ✓ | ✗ | ✓ | password | proceeds to the 2FA step | SC-MFA-02 |
| ✓ | ✗ | ✗ | google (no password) | cannot reset a password | SC-PWD-02 |

You don't have to test every arithmetic combination (four states = sixteen rows), but you do
have to **decide consciously** which rows are genuinely impossible. The rest are scenarios you
must have — a possible row with no scenario is the hole nobody imagined.

## 5. State transition completeness

For entities with a lifecycle (order, account, document, payment).

Draw every state → list the legal transitions → test both sides:
1. **legal transitions** all actually work
2. **illegal transitions** are refused (paying a cancelled order, verifying a deleted account)

Side 2 is the one almost everyone forgets, and it is where the hardest-to-repair data
corruption bugs come from.

```
draft → active → suspended → active → deleted
              ↘ deleted
must refuse: deleted → active, suspended → deleted without passing through active (if the spec forbids it)
```

## 6. Document-type check (meta level)

Is the *set* complete, not just the scenarios — compared against ISO/IEC/IEEE 29119-3.

| Document | Present? | Required at |
| ---| ---| --- |
| Test case / design spec | | L2+ |
| Bug / incident report template | | L1+ |
| Test data requirements | | L2+ |
| Test environment spec | | L3+ |
| Test plan | | L4 |
| Test strategy | | L4 |
| Risk assessment | | L4 |
| Traceability matrix | | L3+ |
| Test completion report | | L4 |
| Test log / execution record | | every level (the tracker can serve this) |
| Test data plan (owner + reset) | | L2+ |
| Exploratory charters + debrief | | L2+ |
| UAT scripts + sign-off | | L2+ if user-visible, L3+ |
| Go / No-Go with named signers | | L3+ (short form L2) |
| Rollback plan + prod smoke | | every release |

**Category check for L3–L4** — two quick grids that catch whole families nobody designed for:
- the agile testing quadrants (taxonomy.md): does Q1, Q2, Q3, and Q4 each have an owner?
- the OWASP baseline (checklist-library.md §7c): is each category designed, or named in "not
  tested" with who covers it?

Most teams have the first three and assume that's the set. The release rows are covered in
`release-readiness.md`; a set without them can be complete *as testing* and still not ready
for production. The two that hurt most when missing
are **risk assessment** (testing runs in the wrong order) and **a completion report containing a
"what we did not test" section** (release decisions get made on incomplete information).

---

## Reporting the audit

Always in three parts. Never conclude with a bare "complete" or "incomplete".

```markdown
## Covered
- <flows / requirements with both a scenario and a status>

## Holes to close
| Hole | Risk | What to add |
| ---| ---| --- |

## Gaps accepted on purpose
| Gap | Reason | Approved by |
| ---| ---| --- |
```

The third part is what separates this from complaining — it converts "not complete" into a
decision with an owner.

**When you move an item out of scenarios and into NFR, name the NFR section it lands in** — for
example "browser coverage and screen sizes move to NFR § Compatibility, to be run once per
module". Saying only "that belongs in NFR" reads as dismissal, and the user can't tell whether
the item survived. Naming the destination proves it didn't vanish.
