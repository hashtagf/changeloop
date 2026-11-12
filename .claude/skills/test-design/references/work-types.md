# Presets per work type

Each preset gives three things: the **module list you usually need**, the **mandatory path
types**, and the **edge cases teams forget most often**.
Treat it as a starting point, not a required list — drop what the system doesn't have, add
what it does.

## Contents

1. New feature (UI + API)
2. Bugfix / hotfix
3. API / backend only
4. UI / redesign only
5. Third-party integration
6. Auth / payment / permissions (critical)
7. Data migration / batch job
8. Refactor
9. Performance
10. Report / export
11. Realtime / chat / notification
12. Mobile app
13. Personal data / privacy (PDPA · GDPR)
14. Feature-flagged / staged release
15. AI / LLM feature

---

## 1. New feature (UI + API) — L2–L3

**Modules:** one per flow the user recognises (not one per endpoint).

**Mandatory:** 1 Happy · Error for every validation the form has · Alternate if more than one
route succeeds.

**Forgotten often**
- the empty state, before any data exists
- the submit button while a request is still in flight (double submit)
- back / refresh mid-flow
- permissions: can a user who shouldn't see this feature see it, and can they call the API directly?
- whether entered data survives an error

## 2. Bugfix / hotfix — L1

**Mandatory:** confirmation test following the steps in the original bug ticket (never
rewritten from memory) · regression of the parent scenario.

**Forgotten often**
- testing only the case in the ticket, not the neighbouring cases sharing that code
- not promoting the symptom into a permanent criterion → the bug returns next release
- not checking what the fix does to rows already corrupted in the database
- never checking the fix on production after the deploy (L1 "After deploy" block)

## 3. API / backend only — L2

**Modules:** grouped by resource (User, Order, Payment), not by endpoint.

**Mandatory:** Error for every status code the spec declares · Security (authn + authz + IDOR).

**Template change:** drop UX/UI, add a `Request / Response` section stating method, path,
body, status codes, and error codes.

**Forgotten often**
- extra / missing fields, wrong types (string where a number is expected)
- empty arrays, null, values longer than the limit
- two concurrent requests mutating the same resource
- the last page of pagination, and a page number beyond the end
- idempotency for POSTs that create data
- 404 vs 403: does the endpoint reveal that someone else's record exists?
- mass assignment (extra `role` / `price` fields accepted) and over-exposed response fields — `checklist-library.md` §7c
- missing limits: page size, payload size, rate (API4) — exceeding them must return 413/429
- **contract / compatibility:** when other services or apps call this API, a breaking change
  (renamed field, new required field, changed enum, changed error shape) is caught before
  release — by consumer-driven contract tests (e.g. Pact) or a schema diff against the
  published spec; old clients (the mobile app version still in users' hands) keep working
- deprecated versions: still answering as documented, or switched off on purpose

## 4. UI / redesign only — L2

**Mandatory:** NFR accessibility + compatibility (see `checklist-library.md` §NFR).

**Template change:** lighter business logic, compare against Figma state by state.

**Forgotten often**
- long text / long names / many digits breaking the layout
- states missing from Figma: loading, empty, error, disabled, hover, focus, active
- a longer language breaking buttons
- 200% zoom and a 375px viewport
- dark mode, if it exists

## 5. Third-party integration — L3

**Modules:** one per provider + one for the flow that combines them.

**Mandatory:** all five Edge cases — provider slow, timeout, 500, malformed response, full outage.

**Forgotten often**
- duplicate webhooks (must be idempotent) and a webhook arriving before the original response
- webhooks arriving out of order
- provider credentials expiring
- retries causing duplicate actions (two emails, two charges)
- circuit breaking: does their outage take your system down?
- sandbox vs production config swapped
- the provider changing its response shape — pin it with a contract test or a recorded schema
  check, so drift fails a build instead of a customer's payment

## 6. Auth / payment / permissions — L4, always

**Auth module list** (the real reference set is 12 modules / 64 scenarios — see `examples/auth-l4.md`)
Register · Email verification · Login · OAuth/social · 2FA · Forgot/Reset password ·
Session & token · Logout · Account security · Authorization guard (RBAC) · Security & abuse ·
Edge & resilience

**Payment module list**
Checkout · Payment method (card/transfer/wallet) · Gateway callback & webhook · Refund/void ·
Reconciliation · Invoice/receipt · Fraud & rate limit · Authorization guard · Edge & resilience

**Mandatory:** Security paths in every module plus a cross-cutting module (brute force, CSRF,
enumeration, injection, IDOR, token tampering) · risk matrix · decision table over the
meaningful states.

**Forgotten often (auth)**
- sessions not revoked after a password change or reset
- accounts created via social login able to request a password reset
- rate limits enforced only in the UI while the API stays open
- refresh-token reuse detection
- skipping the 2FA step by calling the API directly
- enumeration: different error text for an existing vs non-existing email

**Forgotten often (payment)**
- charge succeeds at the gateway but your system never records it (webhook lost) → needs reconciliation
- double charge from a repeated click or a retry
- amount 0, negative, too many decimals, wrong currency
- refund exceeding the paid amount / refunding twice
- price changing while the user sits on the checkout page

## 7. Data migration / batch job — L3

**Modules:** Pre-check (count before) · Migration run · Post-verify (count after + reconcile) ·
Rollback · Edge.

**Mandatory:** Edge — idempotent (re-running gives the same result), partial failure, data
corrupted mid-run, rollback.

**Forgotten often**
- no before/after counts, so nobody knows how many rows vanished
- rows that don't fit the new schema (null, encoding, timezone, over-length values)
- re-running produces duplicates
- the job dies partway and can't resume
- users are using the system while it migrates
- a rollback plan that was never actually tested

## 8. Refactor (no behaviour change) — L1

**Mandatory:** regression sweep of every Happy path that reaches the changed code.

**How to scope it:** walk the call sites of what you changed, don't guess from filenames.

**Forgotten often**
- flows that share the code but live on a different screen
- background jobs / crons calling the same function
- default values that quietly changed during the refactor
- performance regressions even when the output is identical

## 9. Performance — NFR only

**No scenarios needed**, but you do need before/after numbers measured the same way.

**Mandatory:** a baseline before the change · pass thresholds agreed in advance · p95, not the mean.

**Forgotten often**
- measuring on a dev machine and drawing conclusions
- measuring response time but ignoring error rate under load
- not checking whether a resource (CPU, memory, connection pool) hit its ceiling
- making it faster while changing the result — pair it with a correctness check

## 10. Report / export — L2

**Mandatory:** Edge — empty data, very large data, timezone, encoding.

**Forgotten often**
- Thai text mangled when the CSV opens in Excel (needs a BOM)
- numbers auto-converted to dates / leading zeros dropped
- a date range straddling timezones so the total disagrees with the screen
- exporting 100,000 rows and timing out
- permissions: export only what the user may see
- the report total not matching the on-screen total

## 11. Realtime / chat / notification — L3

**Mandatory:** Edge — reconnect, duplicates, loss, ordering.

**Forgotten often**
- after a dropped connection, do the missed messages arrive?
- no duplicates after reconnect
- ordering under rapid sends
- sending while offline — queued with a status the user can see
- duplicate notifications (both push and in-app)
- a user whose access was revoked still receiving messages in an old room
- very long messages / emoji / links / attachments
- unread counts after reading on another device
- a server restart mid-session — does the client reconnect on its own?

## 12. Mobile app — L2–L3

**Mandatory:** NFR device matrix (at least one real iOS and one real Android device) ·
offline · permission dialogs.

**Forgotten often**
- denying a permission (camera, notifications, location) — does the flow still work?
- the app killed from the background — is state restored?
- deep links / universal links while logged out
- the keyboard covering the submit button
- the smallest supported screen and the largest system font
- upgrading the app — is the old local storage still readable?
- rotation / configuration change (dark mode, font size, language) mid-flow — no lost input
- interruptions: incoming call, notification, switching apps, low-battery dialog
- process death (OS reclaims memory while in background) vs user force-close — both restore sensibly
- network switching Wi-Fi ↔ mobile data, airplane mode mid-request, captive portal
- system back gesture / back button on every screen — no exit from mid-flow without warning
- battery saver / Doze: background sync and scheduled notifications still arrive when promised
- forced upgrade: an unsupported old version is told to update instead of failing silently
- release: store review notes, staged rollout percentage, and the crash-free / ANR rate watched
  per version (see `release-readiness.md` §7)

## 13. Personal data / privacy (PDPA · GDPR) — L4

Sensitive personal data (national id, financial, health, biometrics, precise location,
children's data) or any access to *other people's* personal data (admin views, search, bulk
export, third-party sharing). A user editing their own ordinary profile field (name, avatar)
stays at its normal level with a few §9b items added — see SKILL.md step 1. Criteria in
`checklist-library.md` §9b; confirm obligations with the DPO / legal before the scenario list
is final.

**Modules:** Consent · Collection (forms) · Access & masking (UI, admin, export) · Data subject
requests (view / export / delete) · Sharing with third parties · Retention job · Logs & analytics.

**Mandatory:** Security (another user's data, admin over-reach) · Edge (deletion while a job is
processing the user, restore from backup) · DPO in the sign-off.

**Forgotten often**
- personal data in logs, URLs, analytics events, crash reports, and bug tickets
- "deleted" users still in the search index, cache, data warehouse, or email tool
- consent recorded without the version of the text the user agreed to
- staging seeded with an unmasked production dump
- CSV export of customers available to a role that can't see them on screen

## 14. Feature-flagged / staged release — add to the work's own level

Not a separate set — a block added to whichever level the feature is at. Criteria in
`release-readiness.md` §4.

**Mandatory:** flag-off regression of the parent module's Happy paths · flag-on Happy paths ·
kill switch · API enforcing the flag.

**Forgotten often**
- the API stays open while only the UI is hidden behind the flag
- a user flipping between variants on refresh (non-sticky percentage)
- data written under flag-on breaking screens when the flag goes off
- flags never removed — stale flag paths become untested code; add "remove flag" to the backlog

## 15. AI / LLM feature — L3 (L4 if it acts on money, data, or permissions)

Features whose output comes from a model (chat, summarise, classify, extract, generate, agents
calling tools). The test oracle problem is the core difficulty: the same input can give
different valid outputs, so "expected result = this exact text" doesn't work.

**Modules:** Golden-set quality · Guardrails & safety · Prompt injection / security ·
Tool actions (if any) · Failure & cost · Feedback loop.

**How criteria change**
- write criteria as **properties** the output must have, not exact text: "cites the order
  number", "answers in Thai", "never states a refund amount not in the order", "≤ 120 words"
- quality is measured on a **golden set** (30–200 representative inputs with what a good answer
  must contain), run on every prompt/model change, with a pass-rate threshold agreed in
  advance (e.g. ≥ 90% of cases meet every property) — a single manual check proves nothing
- record the model name/version and prompt version with each run; a model update is a release

**Mandatory:** Security (prompt injection direct + indirect, data leakage between users,
system-prompt extraction — `checklist-library.md` §7c) · Edge (empty / huge / other-language /
adversarial input, model timeout, rate limit from the provider) · Error (the provider is down:
the feature degrades with a clear message).

**Forgotten often**
- hallucinated facts presented as data from the system (prices, policies, order status)
- one user's data appearing in another user's answer (shared context, cached prompts)
- output rendered as HTML / markdown without encoding (XSS through the model)
- tool calls with side effects executed without confirmation, or retried twice
- cost: a long conversation or a loop running up tokens without a cap
- refusing too much: legitimate requests blocked by over-strict guardrails — measure it
- regression after a provider silently updates the model behind the same name
- users' feedback (thumbs down) not feeding back into the golden set
