# Kinds of testing — the four axes people conflate

Read this when the user asks "how many kinds of testing are there", or when you must explain
to a standards-trained team what the `Type` field in these documents actually is.

**The key point:** the `Type` field in this SOP sits on **axis 4 (Path/Flow)**, which is *not*
an ISTQB "test type". It is industry vocabulary rooted in use case analysis. Explaining it on
the wrong axis starts an argument you can't win with a team that studied ISTQB.

---

## Axis 1 — Test Level

ISTQB CTFL v4.0 names five.

| Level | What it tests | Who |
| ---| ---| --- |
| Component (unit) | a single function, class, or module in isolation | Dev |
| Component integration | components inside one system talking to each other | Dev |
| System | the whole system end to end, functional and non-functional | QA |
| System integration | your system talking to other systems and external services (gateways, partner APIs) | QA / Dev |
| Acceptance | fitness for use: user acceptance (UAT), operational (backup, restore, rollback, monitoring), contractual, regulatory (e.g. PDPA), alpha / beta | business owner, ops, QA |

The scenario documents this SOP produces sit at **System + System integration + Acceptance**.
Operational acceptance is what `release-readiness.md` covers (rollback drill, prod smoke,
monitoring); user acceptance is its UAT section.

## Axis 2 — Test Type (the standards' meaning)

ISTQB CTFL v4.0 names four test types: **Functional · Non-functional · Black-box ·
White-box** (black-box and white-box describe the *basis* of the test — specification vs
structure). Confirmation and regression testing are treated separately as change-related
testing.

Non-functional refers to the quality characteristics in ISO/IEC 25010:

| Characteristic | The question it answers |
| ---| --- |
| Functional suitability | does it behave as specified? |
| Performance efficiency | what is p95, and how much load does it take? |
| Security | is there a way to reach something you shouldn't? |
| Reliability | does it keep working when a dependency fails? |
| Interaction capability (usability) | keyboard, screen reader, contrast |
| Compatibility | do the supported browsers / devices / OSes actually work? |
| Maintainability · Flexibility (portability) · Safety | architecture level, not screen scenarios |

Confirmation and regression (v4 §2.2.3) = **confirmation testing** (did the reported bug really go away?) plus
**regression testing** (did the fix break something else?). In these documents both live in
the last section of the NFR checklist and in the bugfix work-type preset; which scenarios form
the regression run for a given release (priority tiers + impact analysis) is in
`execution.md` §1–2.

## Axis 3 — Test Design Technique

Not a kind of test — a way to choose which data covers the most with the fewest cases.

| Group | Technique | When |
| ---| ---| --- |
| Black-box | Equivalence partitioning | group inputs the system treats identically, test one per group |
| Black-box | **Boundary value analysis** | 7/8, 64/65, attempt 4/5/6, 59:59/60:01 — the source of half of all Edge paths |
| Black-box | Decision table | several states multiplying together (verified × locked × 2FA × provider) |
| Black-box | State transition | an entity's lifecycle (draft → active → suspended → deleted) |
| Combinatorial (ISO 29119-4; not in the CTFL v4 core list) | Pairwise | browser × device × viewport, when the product is too large to test fully |
| White-box | Statement / branch coverage | developer side |
| Experience-based | Error guessing, exploratory, checklists | finds bugs the spec never described — reserve one session per module |

**Decision tables and state transition give the best return at L3–L4**, because they force
combinations nobody would think of. How to use them: write the states × actions grid and
check that every cell has a scenario. Empty cells are the untested ones.

## Where a check runs — pyramid and quadrants

Two models every team trained on the standards will reach for. Neither replaces the Type
field; they decide **who owns a check and at which layer it runs**.

**Test pyramid** (Fowler, *The Practical Test Pyramid*): many fast component tests, fewer
integration / contract tests, few end-to-end tests. Consequence for these documents: a
criterion that can be proven at a lower layer (a validation rule, a calculation) should be
asserted there, and the scenario keeps only what needs the whole system. Don't let an E2E
suite re-test every boundary value — it's slow and duplicates the unit layer.

**Agile testing quadrants** (Crispin & Gregory, in CTFL v4 §5.1.7):

| | Supports the team | Critiques the product |
| ---| ---| --- |
| **Business-facing** | Q2 — functional tests, examples, story tests (most scenario specs here) | Q3 — exploratory, usability, UAT (`execution.md` §4, `release-readiness.md` §2) |
| **Technology-facing** | Q1 — component and component-integration tests (developers) | Q4 — performance, security, reliability (NFR checklist, security baseline) |

Use it in the test plan's strategy to show every quadrant has an owner; an empty Q4 or Q3 is
the usual hole.

## Axis 4 — Path / Flow (what the Type field uses)

Rooted in use case analysis: **main success scenario / alternate flows / exception flows**.
The words happy path, sad path, edge case, and corner case are industry usage with no
standardised count. The values you meet in practice:

| Name in the wild | Meaning |
| ---| --- |
| Happy Path / Golden Path / Sunny-day | everything correct, no exception — one per use case |
| Alternate Path | also succeeds, by another route |
| Sad Path / Negative / Error / Exception Flow | failures the system anticipated |
| Edge Case | extreme values, rare but genuinely possible |
| Corner Case | several rare conditions coinciding |
| Security / Abuse / Threat Path | someone attacking on purpose |

---

## This SOP's decision: five values

| Type | Working definition | Deciding signal | Target share (L3–L4) |
| ---| ---| ---| --- |
| **Happy Path** | the main line, every input correct | one per flow | ~20% |
| **Alternate Path** | ends in success, different route | end state = success | ~20% |
| **Error Path** | a normal user errs in an anticipated way | actor has no bad intent | ~30% |
| **Edge Path** | boundaries, timing, concurrency, network, multiple tabs | rare, no bad intent | ~15% |
| **Security Path** | a deliberate attacker | Persona can be written as Attacker | ~15% |

### Four tie-breakers

1. **Error vs Security** — "does this person mean harm?" Five wrong passwords because they
   forgot = Error. Twenty emails fired from a script = Security.
2. **Error vs Edge** — "has the system already written an error message for this?" A designed
   message exists = Error. A state nobody considered (token expiring as you press save) = Edge.
3. **Edge vs Corner** — corner cases don't get their own type; keep them under Edge and name
   the colliding conditions in the scenario title. (A sixth value makes people classify
   inconsistently, which costs more than it explains.)
4. **One scenario, one type.** If it feels like two, split it — each type is run with
   different data and often by a different person.

### What never goes in the Type field

Performance, accessibility, compatibility, localization, regression — these are axis-2 test
types that **cut across every scenario**. Putting them in the same field multiplies the
scenario count (10 scenarios × 6 browsers = 60 unreadable rows).
Handle them as a Non-Functional checklist re-run per module — see `checklist-library.md` §NFR.

---

## Sources

- [ISTQB CTFL Syllabus v4.0.1](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) — test levels, types, techniques, quadrants, test completion
- [The Practical Test Pyramid — Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [QA roadmap — roadmap.sh](https://roadmap.sh/qa)

- [A Systematic Guide to Software Testing Types — ISTQB-Based Levels, Types & Techniques](https://codenote.net/en/posts/software-testing-types-istqb-guide/)
- [Happy Path Testing — TechTarget](https://www.techtarget.com/searchsoftwarequality/definition/happy-path-testing)
- [Happy Paths vs Sad Paths Testing](https://medium.com/qualitynexus/happy-paths-vs-sad-paths-testing-why-both-are-essential-3614db1ea89b)
- [Happy Path Testing: What It Covers and What It Misses](https://getautonoma.com/blog/happy-path-testing-beyond-the-happy-path)
- ISO/IEC 25010 (quality characteristics) · ISO/IEC/IEEE 29119-3 (test documentation) · ISO/IEC/IEEE 29119-4 (design techniques)
