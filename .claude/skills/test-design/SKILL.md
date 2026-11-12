---
name: test-design
description: >-
  SOP for designing and running software tests at the right depth — test scenarios, test
  case checklists, test plans, coverage audits, bug reports, UAT scripts, and release
  go/no-go with production smoke and rollback — via a 4-level system
  (L1 smoke → L4 critical) that adapts to the kind of work (new feature, bugfix, API-only,
  third-party integration, data migration, auth/payment, refactor, report/export, realtime,
  mobile). Use this skill whenever the user mentions test cases, testcase, test scenario,
  QA, test plan, UAT, regression, smoke test, acceptance criteria, coverage, bug report,
  go/no-go, release checklist, sign-off, or says things like "ออกแบบเทสเคส", "เขียน test case", "ทำ test scenario", "วางแผนทดสอบ",
  "ตรวจว่าเทสครบไหม", "ครอบคลุมหรือยัง", "เขียน checklist ให้ QA", "ทำ SOP การเทส",
  "พร้อมขึ้น production ไหม", "ทำ UAT" — even
  when they only ask for "a few test cases" for one small feature, because choosing the
  right level and the right path types (happy / alternate / error / edge / security) is
  exactly what separates a checklist that catches bugs from one that only proves the happy
  path works. Also use it when reviewing existing test docs for gaps, when writing bug
  reports, and when pushing scenarios into ClickUp / Jira as a task tree. This is about
  deciding and documenting *what* to verify — not about writing or debugging automated test
  code (jest / vitest / playwright specs, mocks, flaky CI), which is a different job.
---

# Test Design

Design test documentation at the right depth — not 60 scenarios for a single button, and
not 5 lines for an authentication system — and carry it through to a release someone signed
for and verified on production.

The problem this solves: most teams write happy-path tests because those are the easiest to
imagine, then real bugs show up in error / edge / security paths in production. The 5 path
types and 4 levels here force coverage in every direction without writing more than the
work warrants.

---

## Step 1 — Pick the level

Infer it from the request; ask only when genuinely ambiguous. If you can infer it, say
which level you picked and why.

| Level | Signals | Deliverable | Effort |
| ---| ---| ---| --- |
| **L1 Smoke** | bugfix, hotfix, small change, "just check nothing broke" | one checklist (5–15 items) + 3-line "After deploy" block (not counted in the 15) | 15–30 min |
| **L2 Module** | new feature, one flow / one screen, "write test cases for this" | scenario specs + a checklist per scenario | half a day |
| **L3 System** | epic / release / several screens, "test the whole X system" | several modules + Edge paths + NFR + traceability | 1–2 days |
| **L4 Critical** | auth, payment, permissions, personal data, migration, "is our coverage complete?" | L3 + full Security paths + Test Plan + Completion Report | 3–5 days |

**Auto-escalation rule:** if the work touches **money, permissions, personal data, or
authentication**, use L4 even when the user asked for "just a few test cases". State the
reason briefly and offer the option to scale down — let them decide. Never scale down
silently: the damage from missing something here is not symmetric with the time saved.

"Personal data" here means **sensitive data** (national id, financial, health, biometrics,
precise location, children's data) **or access to other people's data** (admin views, search,
bulk export, sharing with third parties). A user editing their own ordinary profile field —
name, avatar, bio — stays at its normal level: add a Security path for "another user's
record" and the relevant `checklist-library.md` §9b items (e.g. EXIF/GPS stripped from a
photo), and keep L2's 3–8 scenarios. Over-escalating a small feature buries the real risks
in volume as surely as under-escalating misses them.

Per-level deliverables and closing criteria live in `references/levels.md`.

### What each level costs

Measured on the reference runs (one agent, Sonnet, no human in the loop). Use it to set
expectations before starting, and to notice when you're overshooting the level.

| Level | Output | Working time | Fast path |
| ---| ---| ---| --- |
| L1 | ~400 words, 1 file | ~5 min | write it straight from this file — **read no reference files**; end the checklist with the 3-line "After deploy" block (prod smoke of the fixed flow · rollback = redeploy previous version · 30-min watch) |
| L2 | 2–3k words, 2–3 files | ~10 min | read `templates.md`; hand-write rather than scaffold a single module; add `release-readiness.md` §2–3 only if user-visible behaviour changes |
| L3 | 5–8k words | 20–30 min | scaffold, then fill module by module |
| L4 | 14k+ words, 15 files | 25–40 min | see the wave rule below — do not try to fill everything in one pass |

Two habits keep this fast without losing coverage:
- **Never write the same sentence twice.** Criteria go in the spec; checklists are generated
  from them (`scripts/checklist.py`). Rules shared by several scenarios go once in the module
  overview and get referenced by name, not repeated per scenario.
- **At L4, write the tail on demand.** Deliver the full scenario list plus the highest-risk
  modules written out completely; state plainly that the remaining modules are listed but not
  yet specced, and write each one when its turn to be run arrives. A 39-scenario set written in
  one sitting mostly ages on disk — teams rarely run more than a few modules per sprint.

## Step 2 — Pick the work type

The work type determines **which path types are mandatory** and **which template sections
you can drop**.

| Work type | Starting level | Mandatory | Can drop |
| ---| ---| ---| --- |
| New feature (UI + API) | L2–L3 | Happy, Error | — |
| Bugfix / hotfix | L1 | Confirmation + regression of the parent scenario | full specs |
| API / backend only | L2 | Error (every status code), Security (authz) | UX/UI |
| UI / redesign only | L2 | NFR a11y + compatibility | detailed business logic |
| Third-party integration | L3 | Edge (timeout, outage, retry, duplicate webhook) | — |
| Auth / payment / permissions | **L4** | full Security | — |
| Data migration / batch | L3 | Edge (idempotent, partial failure, rollback) | UX/UI |
| Refactor (no behavior change) | L1 | Regression sweep of every Happy path touched | new scenarios |
| Performance | NFR-only | before/after numbers | scenarios |
| Report / export | L2 | Edge (empty, huge, timezone, encoding) | — |
| Realtime / chat | L3 | Edge (reconnect, duplicate, loss, ordering) | — |
| Mobile app | L2–L3 | NFR device matrix, offline, permission dialogs | — |
| Personal data (PDPA / GDPR) — sensitive, or other people's data | **L4** | privacy criteria, Security (other users' data), DPO sign-off | — |
| AI / LLM feature | L3 (L4 if it acts on money/data/permissions) | golden-set pass rate, prompt injection, output encoding, cost limits | — |
| Behind a feature flag | +block on its level | flag off = old behaviour, flag on, kill switch, API enforces flag | — |

Presets per work type — the module list you usually need plus the edge cases teams forget
most often — are in `references/work-types.md`.

## Step 3 — Cover every direction with path types

Five values only. One scenario carries exactly one value: if it feels like two, split it,
because in practice each type is run differently and often by a different person.

| Type | Definition | Deciding signal |
| ---| ---| --- |
| **Happy Path** | the main line, every input correct | at most one per flow |
| **Alternate Path** | also succeeds, but by another route | end state = success |
| **Error Path** | a normal user does something wrong that the system already handles | actor has no bad intent |
| **Edge Path** | boundary values, timing, concurrency, network, multiple tabs | rare conditions, no bad intent |
| **Security Path** | a deliberate attacker | you can write the Persona as an Attacker |

Tie-breakers:
- **Error vs Security** — "does the person doing this mean harm?" Forgot their password =
  Error. Hammering it with a script = Security.
- **Error vs Edge** — "has the system already written an error message for this?" A designed
  message exists = Error. Nobody thought of this state (token expires while the form is
  open) = Edge.

Target mix at L3–L4: Happy ~20% / Alternate ~20% / Error ~30% / Edge ~15% / Security ~15%.
If Happy exceeds 40%, coverage is still one-directional.

Where these five come from, how they differ from ISTQB test levels/types, and the design
techniques behind them (boundary value analysis, decision tables, state transition) are in
`references/taxonomy.md` — read it when the user asks "how many kinds of testing are there"
or when you need to justify this vocabulary to a team trained on the standards.

---

## Rules that make the documents usable

Reasons are in parentheses — understanding the reason tells you when a rule can flex.

1. **Every acceptance criterion must be checkable by eye or by an API response** (Given /
   When / Then is fine if the team uses BDD — same rule, one outcome per line). "The
   system must be fast" belongs in NFR with a number, or becomes "redirects within 1
   second". (Uncheckable criteria force QA to guess, and guessed results aren't evidence.)
2. **Anything not visible from the screen goes in Business Logic / Rules** — e.g. "store
   passwords with bcrypt cost ≥ 12". (It's a requirement for the developer and a review
   checkpoint, not something QA can tick.)
3. **The test checklist is the acceptance criteria 1:1** — nothing added, nothing removed.
   Write the criteria once and **generate** the checklists with `scripts/checklist.py`; verify
   with `--check` before delivering. (A failing item then points at exactly one criterion, and
   traceability needs no interpretation. Copying by hand looks harmless but measurably isn't:
   in the reference payment set, 16 of 25 scenarios had criteria silently shortened in the
   checklist — parenthetical conditions dropped — so the thing QA ticks stopped matching the
   thing the developer agreed to.)
4. **Confirm the scenario list with the work's owner before writing full specs.** Send the
   table of IDs, names, types, and priorities first. (Writing 40 specs and then learning the scope was
   wrong is the most painful way to lose a day on this work.)
5. **Always write down what is out of scope.** Anything you did not test needs a name in
   the document. (A document that doesn't say what was skipped reads as "everything is
   tested", which is more dangerous than having no document.)
6. **Never hand over a file with unfilled placeholders.** Run `grep -rn "TODO" <dir>` before
   delivering. Scenario content — names, criteria, business rules — must be complete. A
   genuinely unknowable value (a staging URL that doesn't exist yet, an unscheduled date) may
   stay as an annotated placeholder in a plan table, but **it must also appear as an open item
   in your reply** — a placeholder nobody is told about is indistinguishable from an oversight.
   (A scaffold full of placeholders looks like finished work at a glance; that's how coverage
   gets over-reported.)
7. **Deliver large sets in risk-ordered waves.** Above roughly 20 scenarios, fill the one or
   two highest-risk modules to 100% first — they double as the format sample for the team —
   then continue outward, and state in your reply which files are complete and which are
   not. (A single pass over 45 scenarios tends to run out of room halfway, and a half-filled
   set presented as done is worse than an honest partial one.)
8. **Every bug links back to a scenario and the criterion it broke.** (That turns the bug
   into permanent regression coverage instead of something that disappears when the ticket
   closes.)
9. **Write the documents in the team's language.** Check the PRD and existing tickets; if
   the team writes Thai mixed with English technical terms, write that. (The readers are QA,
   developers, and PMs — this is a working document, not a showcase.)
10. **With no PRD, write your assumptions down as a numbered list** (A1, A2, …) in the index,
    reference them from the criteria that depend on them, and ask for confirmation before the
    set gets run. (You will have to assume things — token lifetimes, refund policy, who may do
    what. Numbered assumptions are correctable in one message; assumptions buried inside
    criteria get discovered only when QA reports a failure that was never a bug.) What only
    the owner can decide goes to the PM as numbered **product questions** (Q1, Q2…) instead —
    format in `release-readiness.md` §1.
11. **Every scenario carries a Priority (P0–P3) as well as a Type** at L2+. Type says how to
    run it; priority says whether it runs when time is short and which regression tier it
    joins. Keep P0 to ~10–15% — the set that runs on every deploy. (`execution.md` §1–2.
    Without priority, a slipping deadline cuts scenarios at random instead of from the bottom.)
12. **"Tests passed" is not "ready for production".** Anything going live needs, scaled to
    the level: a rollback path, a production smoke run after deploy, and someone watching the
    signals afterwards; from L2 with user-visible change, UAT by the business owner; from L3, a
    go/no-go signed by named people. (`release-readiness.md` §9 has the per-level table. Most
    production incidents happen in the deploy or the hour after — the part a staging-only test
    set never sees.)
13. **QA recommends; the PM and engineering lead decide.** The completion report and go/no-go
    state the evidence and the risk; the business-risk call (shipping with a known High,
    dropping scope) is signed by the PM, the deploy/rollback by engineering. (When QA silently
    owns the ship decision, it either blocks everything or gets blamed for business calls.)
14. **Never put real personal data in test data, tickets, or screenshots.** Masked copies
    only outside production; mask before attaching evidence. (A bug tracker is read by far
    more people than the database it describes.)

---

## Workflow

```
1. Determine level + work type       → tell the user what you picked and why
2. Gather inputs + check readiness   → PRD, Figma, API spec, permission matrix, old bugs;
                                       Definition of Ready + product questions (release-readiness.md §1)
3. Draft the module + scenario list   → ID / name / type / priority → confirm before continuing
4. Write the scenario specs           → templates in references/templates.md
5. Convert criteria → checklists 1:1  → one scenario = one test task
6. Push into the tracker              → references/clickup.md (4 tiers)
7. Audit the coverage                 → references/coverage-audit.md
8. Run                                → priority order, regression tier, test data, exploratory
                                       charters, bug lifecycle (references/execution.md)
9. Release                            → UAT, go/no-go, deploy plan, prod smoke, rollback,
                                       watch window (references/release-readiness.md)
```

Steps 3, 7 and 9 are the ones people skip most often. 3 and 7 separate this from "writing a
checklist off the top of your head"; 9 separates "QA passed" from "safe in production".
At L1 step 9 is the three-line "After deploy" block; it is never zero.

### Old bugs are excellent raw material

If the project has bugs in its tracker, read them before writing scenarios and turn each
symptom into an **acceptance criterion** in the new set. You get regression coverage for
free and can prove the old bug can't return. Real example: the bug "password reset succeeds
but login fails afterwards" became the criterion "logging in with the new password succeeds
immediately, and the old password no longer works".

---

## Short example — criteria that work vs criteria that don't

**Input:** a delete button on a table row.

Doesn't work:
```
- [ ] deletes correctly
- [ ] the system is fast
- [ ] data is secure
```
Nobody knows what ticking these means, so the result isn't evidence of anything.

Works:
```
- [ ] clicking delete opens a confirmation modal — one click never deletes
- [ ] after confirming, the row disappears from the table without a refresh
- [ ] clicking delete 5 times quickly fires one request and shows no error
- [ ] deleting a row someone else already deleted shows "already removed", not a 500
- [ ] a user without delete permission sees no button, and calling the API directly gets 403
```
Five items covering Happy + Edge (double click, already-deleted) + Security (authz) for a
single button — that's the shape of good output.

---

## Scripts

### `scripts/checklist.py` — write criteria once

```bash
python3 scripts/checklist.py 01-checkout.md --write   # generate/refresh the checklist blocks
python3 scripts/checklist.py *.md --check             # verify 1:1 before delivering (exit 1 on drift)
```

`--check` is the review gate: it catches criteria that exist in a spec but never reached the
checklist QA ticks, which is how a criterion silently stops being tested.

### `scripts/scaffold.py` — file skeletons

Generates the file skeleton for the chosen level. Use it once the scenario list is confirmed
(step 3 done) so you don't retype headings:

```bash
python3 scripts/scaffold.py --out ./docs/test --level 3 --project "Zyra" \
  --module "Login:SC-LOGIN:5" --module "Register:SC-REG:6"

# domain presets with a standard module list
python3 scripts/scaffold.py --out ./docs/test --level 4 --preset auth --project "Zyra"
python3 scripts/scaffold.py --out ./docs/test --level 3 --preset payment --project "Shop"

# Thai-language skeletons for a Thai-speaking team
python3 scripts/scaffold.py --out ./docs/test --level 2 --lang th --module "Cart:SC-CART:4"
```

It writes **skeletons only** — the criteria and business rules depend on the real system, so
you still write those. For a single module it is usually faster to hand-write the file than
to scaffold it. Whatever you scaffold, rule 6 applies: no `TODO` may survive into delivery.

---

## Reference map — what to read when

| File | Read it when |
| ---| --- |
| `references/levels.md` | deciding the level, or checking what a level must deliver |
| `references/work-types.md` | you know the work type and want its module list + commonly forgotten edge cases |
| `references/taxonomy.md` | the user asks how many kinds of testing exist, or you must cite ISTQB CTFL v4 / ISO 25010 / ISO 29119; test pyramid + agile testing quadrants |
| `references/templates.md` | writing modules / scenarios / checklists / bugs — copy-paste ready |
| `references/planning-docs.md` | L3–L4: test plan (strategy, quadrants, estimate), product vs project risk, traceability, completion report + completion activities |
| `references/checklist-library.md` | you want ready criteria and edge cases per domain (form, list, upload, money, notification, realtime, export, auth, OWASP security baseline incl. LLM, RBAC, cron, personal data / PDPA, analytics events, NFR: performance, WCAG 2.2 AA, compatibility, localization, reliability, observability, production readiness) |
| `references/coverage-audit.md` | the user asks "is our coverage complete?", or you must review existing test docs |
| `references/clickup.md` | pushing work into ClickUp / Jira as a task tree |
| `references/execution.md` | priority P0–P3, regression tiers + impact analysis, test data, exploratory charters + SFDIPOT / FEW HICCUPPS heuristics, bug lifecycle / priority vs severity, flaky results, QA metrics, one-line status |
| `references/release-readiness.md` | Definition of Ready + product questions, UAT script + sign-off, go/no-go, feature flags, migrations, prod smoke, rollback drill, watch window + analytics, hotfix path |
| `examples/auth-l4.md` | you want a finished L4 set as a reference point |
| `scripts/checklist.py` | generating checklists from criteria, or verifying they're still 1:1 |
| `scripts/scaffold.py` | creating the file skeleton for L2+ (skip it for a single module) |

---

## Common failure modes

| Symptom | Fix |
| ---| --- |
| ten Happy Path items and nothing else | check the mix in step 3 — require Error + Edge before delivering |
| criteria that are feelings ("easy to use") | move to NFR with a number, or restate as something visible on screen |
| one scenario with 30 steps | split it — one scenario carries one intent |
| checklist doesn't match the criteria | build the checklist from the criteria only, never from memory |
| nobody knows what has been tested | traceability matrix per `references/coverage-audit.md` |
| high-risk system tested at L1 | apply the auto-escalation rule in step 1 |
| scaffolded files delivered with placeholders | rule 6 — `grep -rn TODO` before handing over |
| checklist quietly shorter than the criteria | generate it (`checklist.py --write`), then gate on `--check` |
| L4 taking an hour and still unfinished | the wave rule — highest-risk modules complete, tail on demand |
| beautiful docs nobody runs | one scenario = one tickable task in the tracker, not a file nobody opens |
| deadline slips and scenarios get cut at random | rule 11 — priority P0–P3, cut from P3 up |
| bug bounced as "can't reproduce" | bug template fields: build, environment, data, reproducibility rate |
| all green on staging, incident in the first hour | rule 12 — prod smoke, rollback rehearsed, watch window |
| "QA approved it" after a bad release | rule 13 — named PM + engineering sign-off on the go/no-go |
| PM's dashboard shows nonsense after launch | analytics criteria (`checklist-library.md` §9c) verified before go/no-go |
| production dump on staging | rule 14 — masked data only; privacy criteria §9b |
