# Criteria & edge-case library by domain

Use these as a starting point and adapt them to the real system — never paste a block
unchanged, because criteria that don't match the system make QA report failures for correct
behaviour.

## Contents

1. Form / CRUD
2. List / search / filter
3. File upload / download
4. Money / payment
5. Notification / email
6. Report / export
7. Realtime
7b. Authentication
7c. Security baseline (OWASP WSTG / API Top 10 / LLM Top 10)
8. RBAC / permissions
9. Cron / batch job
9b. Personal data / privacy (PDPA · GDPR)
9c. Analytics / tracking events
10. NFR checklist (re-run per module)

---

## 1. Form / CRUD

```markdown
- [ ] creating succeeds and the row appears in the list without a refresh
- [ ] a required empty field shows an error under that field and focus moves to the first invalid one
- [ ] the save button stays disabled until everything is filled and no error remains
- [ ] hammering save fires one request and creates no duplicate
- [ ] editing then saving updates what changed and leaves untouched fields alone
- [ ] cancelling mid-edit saves nothing, and warns if data would be lost
- [ ] delete asks for confirmation — one click never deletes
- [ ] deleting a row someone else already deleted says "already removed", not a 500
- [ ] editing a row someone else edited concurrently behaves per spec — never a silent overwrite
- [ ] a duplicate name/code is rejected with a clear message
- [ ] a user without permission sees no button, and calling the API directly gets 403
- [ ] values with special characters / emoji / non-Latin scripts save and render back correctly
```

## 2. List / search / filter

```markdown
- [ ] the empty state shows a message and a create-first-item action, not a bare table
- [ ] paging: first page, a middle page, last page, and the total count are correct
- [ ] a page number beyond the end (typed into the URL) does not crash
- [ ] every sortable column sorts both ways, and sorting survives paging
- [ ] several filters at once combine correctly (not "last one wins")
- [ ] a filter with no results shows a different empty state than "no data at all"
- [ ] searching with non-Latin scripts / special characters / spaces / mixed case behaves per spec
- [ ] a very long search string does not hang the query
- [ ] 10,000 rows load within the agreed time and scrolling stays smooth
- [ ] filter + search + sort + paging used together stay correct
- [ ] only data the user may see is listed (verify with two accounts of different permission)
- [ ] refreshing keeps filter and page state (when the spec says it should live in the URL)
```

## 3. File upload / download

```markdown
- [ ] uploading an allowed type succeeds and shows a preview / filename
- [ ] a disallowed type is rejected, stating what is supported
- [ ] renaming a file's extension to look allowed still fails — the check uses real content type
- [ ] a file over the size limit is rejected before the upload completes
- [ ] a 0-byte file and a corrupted file are rejected gracefully
- [ ] filenames with non-Latin scripts / special characters / extreme length save and download back
- [ ] progress is shown during upload and can be cancelled mid-way
- [ ] a dropped connection shows an error and allows a retry, leaving no half file in the system
- [ ] uploading a duplicate filename renames or prompts, per spec
- [ ] someone else's file cannot be fetched with a direct URL (403/404)
- [ ] file URLs expire on schedule (when signed URLs are used)
```

## 4. Money / payment

```markdown
- [ ] amount 0 and negative amounts are rejected
- [ ] more decimals than the currency supports are rounded or rejected, per spec
- [ ] total = line items + shipping + tax − discount, identical on every screen and on the receipt
- [ ] hammering pay charges once (the idempotency key works)
- [ ] payment succeeds at the gateway but the webhook never arrives — reconciliation resolves it and no status is left hanging
- [ ] the same webhook arriving twice does not book the amount twice
- [ ] a webhook arriving before the redirect still renders the right result
- [ ] cancelling at the gateway returns a pending/cancelled state, never paid
- [ ] a price change while the user sits on checkout is surfaced before charging
- [ ] refund in full / in part / above the paid amount (must fail) / twice (must fail)
- [ ] an expired, over-quota, or already-used coupon is rejected
- [ ] two concurrent requests for the last remaining coupon — only one succeeds
- [ ] another customer's order cannot be read or modified by passing its id
- [ ] every transaction has an audit record of who, when, and how much
```

## 5. Notification / email

```markdown
- [ ] the message really sends and arrives within the agreed time
- [ ] the template renders correctly in Gmail, Outlook, and Apple Mail (web and app)
- [ ] it does not land in spam (SPF, DKIM, DMARC pass)
- [ ] every template variable is substituted — no {{name}} leaks through
- [ ] names or data with special characters neither break the template nor allow HTML injection
- [ ] links work and reach the right page, with a plain URL fallback
- [ ] when the provider is down the primary action still succeeds and the message is queued for retry
- [ ] retries do not deliver duplicates to the recipient
- [ ] rate limiting on repeated resends applies in the UI and at the API
- [ ] users who disabled notifications or unsubscribed receive nothing
- [ ] messages are sent in the user's configured language
```

## 6. Report / export

```markdown
- [ ] empty data exports a file with headers and no rows, not an error
- [ ] very large data (100,000 rows) exports, or is queued asynchronously with feedback — never a silent timeout
- [ ] CSV opens in Excel with non-Latin text intact (BOM present)
- [ ] leading zeros survive and numbers are not auto-converted to dates
- [ ] totals in the file match the totals on screen exactly
- [ ] the selected date range follows the user's timezone, not UTC
- [ ] only data the user may see is exported
- [ ] the filename carries the date / range so files can be told apart
- [ ] hammering export does not stack jobs and slow the system
```

## 7. Realtime

```markdown
- [ ] messages / updates reach the other side within the agreed time
- [ ] a dropped connection reconnects on its own and back-fills everything missed
- [ ] no duplicates appear after reconnecting
- [ ] ordering stays correct under rapid sends
- [ ] sending while offline queues with a status the user can see, and flushes on reconnect
- [ ] two tabs / two devices show the same thing without duplication
- [ ] a user whose access was revoked stops receiving new messages immediately
- [ ] very long messages / emoji / links / attachments render correctly
- [ ] unread counts stay truthful after reading on another device
- [ ] a server restart mid-session recovers without a manual reload
```

## 7b. Authentication

The highest-frequency critical domain. This is the short list — the full 12-module treatment is
in `examples/auth-l4.md`.

```markdown
- [ ] login with correct credentials succeeds and lands on the intended page
- [ ] wrong password and unknown email return the identical message, status, and response size
- [ ] response time for a known vs unknown email differs by under 100 ms (measure 100 requests)
- [ ] the account locks at exactly the configured attempt count, and a countdown is shown
- [ ] lockout counts attempts across IPs; a separate per-IP limit exists for distributed attempts
- [ ] an unverified account cannot log in, and is offered a resend without exposing that state to wrong-password attempts
- [ ] a password reset link is single-use, expires on schedule, and cannot be replayed
- [ ] an account created via social login cannot request a password reset (no password exists)
- [ ] a completed password change or reset revokes sessions on every other device
- [ ] refresh tokens rotate, and reusing a spent one revokes the whole session family
- [ ] a tampered token (changed role/sub, alg=none, foreign signing key) is refused on every endpoint
- [ ] 2FA cannot be skipped by calling an API directly with the pre-auth token
- [ ] recovery codes are single-use and regenerating invalidates the old set
- [ ] logging out revokes server-side, and the back button reveals no cached user data
- [ ] auth cookies carry HttpOnly + Secure + SameSite; no token sits in localStorage
- [ ] redirect targets are validated (reject `//host`, `/\host`, absolute URLs, double encoding)
- [ ] logs and error pages contain no passwords, tokens, OTPs, or stack traces
- [ ] password managers and paste work in every credential / OTP field; no cognitive puzzle without an alternative (WCAG 2.2 — 3.3.8)
- [ ] session id rotates on login; idle and absolute timeouts match the spec
```

## 7c. Security baseline (OWASP WSTG / API Top 10 / LLM Top 10)

Auth, RBAC and IDOR are only part of the attack surface. This list maps the rest to the OWASP
Web Security Testing Guide (WSTG v4.2) categories and the OWASP API Security Top 10 (2023), so
an L3–L4 set can show which categories it designed for and which it consciously left to a
security team or a scanner. Write the leftovers into "what was not tested".

```markdown
Configuration & transport (WSTG-CONF, WSTG-CRYP)
- [ ] HTTPS only, HSTS set; no mixed content
- [ ] security headers present: Content-Security-Policy, X-Content-Type-Options, frame-ancestors / X-Frame-Options (clickjacking)
- [ ] CORS allows only the listed origins — never `*` with credentials
- [ ] no debug endpoints, stack traces, directory listings, `.git` / `.env`, or admin consoles reachable in production
- [ ] old API versions are either maintained or switched off (API9 improper inventory)

Input handling (WSTG-INPV)
- [ ] reflected, stored, and DOM XSS: user input shown back (names, comments, filenames, search terms) is encoded
- [ ] SQL / NoSQL / command / template injection on every input that reaches a query, shell, or template
- [ ] SSRF: any feature that fetches a URL the user supplies (webhooks, image-from-URL, import) refuses internal addresses and cloud metadata endpoints (API7)
- [ ] uploaded files: real type checked by content, not extension; malicious content (polyglot, SVG with script, zip bomb) refused or neutralised (WSTG-BUSL-09)

Authorization at property and flow level (API3, API5, API6)
- [ ] mass assignment: sending extra fields (`role`, `is_admin`, `price`, `owner_id`) in a create/update body is ignored or refused
- [ ] responses don't over-expose fields the client doesn't display (password hashes, internal flags, other users' emails)
- [ ] function-level authz: admin-only endpoints refuse non-admin tokens even when the URL is guessed
- [ ] business-flow abuse: the flow can't be automated for profit (bulk coupon redemption, sign-up bonus farming, scalping stock)

Session (WSTG-SESS)
- [ ] session id rotates on login (no session fixation)
- [ ] idle and absolute session timeouts match the spec
- [ ] CSRF protection on every state-changing request using cookies

Resource consumption (API4) & dependencies
- [ ] limits on page size, upload size, request rate, and expensive operations (search, export, report) — exceeding them returns 413/429, not a timeout
- [ ] dependency scan (SCA) shows no known Critical/High CVEs in shipped packages, or each is accepted in writing
- [ ] no secrets in the repo, client bundle, mobile app package, or logs

AI / LLM features (OWASP LLM Top 10 2025) — when the feature calls a model
- [ ] prompt injection, direct and indirect (instructions hidden in a document, web page, or email the model reads), cannot make it break its rules or call tools it shouldn't
- [ ] the model's output is treated as untrusted: encoded before rendering, never executed or used in a query unchecked
- [ ] the system prompt and other users' data can't be extracted by asking
- [ ] tool / agent actions with side effects (send, pay, delete) need confirmation or are limited by permissions (excessive agency)
- [ ] token / cost limits per user and per request stop runaway usage
```

## 8. RBAC / permissions

```markdown
- [ ] every role sees exactly the menus in the permission matrix (test every role)
- [ ] the UI's permissions match the API's — no button that returns 403 when pressed
- [ ] a lower role cannot open a higher role's page by URL, and never glimpses its content before redirecting
- [ ] calling a privileged API with a lower role's token returns 403 on every endpoint
- [ ] editing the role client-side (localStorage/state) and reloading still gets refused by the API
- [ ] another user's data cannot be reached by passing their id (IDOR) — test every endpoint that takes one
- [ ] passing the id in the body or query instead of the path is also refused
- [ ] a permission change during an active session takes effect within the spec's window
- [ ] every unauthorized attempt is recorded in the audit log
- [ ] the permission matrix is exercised in full (every role × resource cell)
```

## 9. Cron / batch job

```markdown
- [ ] the job runs at the scheduled time (verified in logs)
- [ ] re-running with the same input produces the same result and no duplicates (idempotent)
- [ ] a job that dies mid-run can resume or restart safely
- [ ] a few bad rows don't kill the whole run, and get reported
- [ ] two instances starting together are locked so only one works
- [ ] a run that overshoots the next schedule doesn't overlap itself
- [ ] the processed count matches the expected count (compare before and after)
- [ ] there is an alert when the job fails or fails to start
- [ ] the schedule's timezone is right, including across DST changes
```

## 9b. Personal data / privacy (PDPA · GDPR)

Personal data auto-escalates work to L4. Thailand's PDPA and the EU's GDPR share the same
testable core: collect with a lawful basis, show it only to whom it belongs, honour the data
subject's rights, and don't leak it into places nobody audits. Confirm the actual obligations
with the company's DPO / legal — these are the criteria QA can check, not legal advice.

```markdown
- [ ] consent is unticked by default, separate per purpose (marketing ≠ terms), and recorded with timestamp + version of the text
- [ ] withdrawing consent is as easy as giving it, and stops the processing it covered (e.g. no more marketing email)
- [ ] the privacy notice is reachable from every screen that collects personal data
- [ ] only the fields the purpose needs are collected — optional fields are marked optional and work empty
- [ ] a user can view / export their own data in a readable format (access & portability request)
- [ ] a user can request deletion; after the stated period the data is gone or anonymised in the DB, search index, caches, and analytics — backups follow the retention policy
- [ ] deleted / anonymised users don't reappear via a backup restore, a re-sync, or a third-party import
- [ ] personal data is masked where full value isn't needed (card ••••1234, phone 08x-xxx-5678, national id) — in UI, exports, and admin screens
- [ ] admin / support access to personal data is role-limited and every view is audit-logged
- [ ] personal data never appears in logs, error messages, URLs / query strings, analytics events, or crash reports
- [ ] data sent to third parties (email, analytics, payment, CRM) is only what the agreement lists
- [ ] exports containing personal data are permission-checked and the file link expires
- [ ] retention: records past the retention period are deleted / anonymised by the scheduled job
- [ ] non-production environments contain no unmasked production personal data
- [ ] data subject requests are answered within the legal deadline (PDPA: 30 days; GDPR: one month) — the internal workflow is timed end to end
- [ ] breach drill: detecting a leak → notifying the regulator within 72 hours (PDPA → PDPC; GDPR → supervisory authority) and affected people when the risk is high — the runbook exists and has been walked through
- [ ] cross-border transfer: personal data sent to services outside the country (cloud regions, SaaS, analytics) is on the approved list
```

## 9c. Analytics / tracking events

The PM judges the feature by these numbers. If the events are wrong, the release review is
wrong. Test them against the tracking plan, not by eyeballing a dashboard.

```markdown
- [ ] every event in the tracking plan fires exactly once per user action (not on re-render, not on page load)
- [ ] event names and property names match the tracking plan exactly (case, snake/camel)
- [ ] property values have the right type and unit (amount as number in THB, not "฿1,200")
- [ ] the user / session identifier is attached, and identity merges correctly after login
- [ ] failure / cancel events fire when the plan includes them
- [ ] events from internal and test accounts are excluded or tagged
- [ ] events respect consent — nothing fires before consent where consent is required
- [ ] no personal data (email, phone, full name, address) in event properties unless approved
- [ ] the funnel / dashboard the PM will use shows the test events end to end
```

## 10. NFR checklist (re-run per module)

Create a task named `NFR : <module>` and paste the relevant sections.

### Performance
```markdown
- [ ] the primary action's p95 meets the agreed threshold
- [ ] page load (LCP) meets the threshold on 4G
- [ ] under expected load, error rate < 1%
- [ ] the main queries use indexes — no full table scans
```

### Accessibility

Target **WCAG 2.2 level AA** (W3C Recommendation since October 2023) unless a contract says
otherwise. The items below are the ones scenarios most often break; a formal audit checks every
success criterion.

```markdown
- [ ] fully operable with the keyboard alone, tab order matches visual order, no keyboard trap (2.1.1, 2.1.2, 2.4.3)
- [ ] the focus indicator is clearly visible (2.4.7) and the focused element is never hidden behind a sticky header, cookie banner, or chat bubble (2.4.11 Focus Not Obscured)
- [ ] every field has a programmatic label; errors are tied to their field (aria-describedby) and announced (aria-live) (1.3.1, 3.3.1, 4.1.2)
- [ ] a screen reader (VoiceOver / NVDA / TalkBack) reads labels, errors, button states, and status messages (4.1.3)
- [ ] text contrast ≥ 4.5:1, large text ≥ 3:1 (1.4.3); icons, input borders, and focus rings ≥ 3:1 (1.4.11)
- [ ] meaning is never carried by colour alone (1.4.1)
- [ ] 200% text zoom keeps everything usable (1.4.4), and at 320 CSS px wide content reflows with no horizontal scroll (1.4.10)
- [ ] pointer targets are at least 24×24 CSS px or spaced so they don't overlap (2.5.8 Target Size)
- [ ] anything done by dragging also works with a single click/tap (2.5.7 Dragging Movements)
- [ ] login doesn't require a cognitive test — paste and password managers work, no "retype this puzzle" without an alternative (3.3.8 Accessible Authentication)
- [ ] information already entered in the same flow isn't asked for again — it's pre-filled or selectable (3.3.7 Redundant Entry)
- [ ] help (contact, chat, FAQ link) appears in the same place on every page that offers it (3.2.6 Consistent Help)
- [ ] moving / auto-updating content can be paused; nothing flashes more than 3 times per second (2.2.2, 2.3.1)
```

### Compatibility
```markdown
- [ ] Chrome desktop / Safari macOS / Safari iOS (real device) / Chrome Android (real device)
- [ ] Firefox / Edge
- [ ] viewports 375 / 768 / 1440
```

### Localization
```markdown
- [ ] every string is translated — nothing falls back to English unintentionally
- [ ] no text overflows its container in the longest supported language
- [ ] dates, numbers, and currency follow the locale
```

### Reliability (your own infrastructure, not only third parties)

Principles of chaos engineering, scaled to what a release test can do: state the steady state,
break one thing, check the steady state holds.

```markdown
- [ ] database primary failover: the app recovers within the stated time without manual restarts; no writes lost
- [ ] one app instance / pod killed under load: no failed user requests beyond in-flight ones; health checks remove it
- [ ] queue / worker backlog: a burst of jobs drains without duplicates or loss, and the backlog alert fires
- [ ] cache (Redis / CDN) unavailable: the system degrades to slower, not to errors
- [ ] graceful degradation: when a non-critical dependency (recommendations, analytics, chat widget) is down, the primary flow still works
- [ ] backup restore actually tested: restore to a scratch environment, row counts and a sample of records match, time recorded vs the RTO
- [ ] cache invalidation: after a deploy or a content change, users see the new version (CDN purge, service-worker update, cache-busting asset names)
```

### Observability
```markdown
- [ ] success/failure metrics exist for the primary action
- [ ] an alert fires on abnormal failure rate, and it has been test-fired
- [ ] the audit log covers the significant events and is searchable by user id
- [ ] logs contain no secrets (passwords, tokens, OTPs) — verify by grepping
```

### Confirmation & regression
```markdown
- [ ] every bug the developer marked fixed is re-tested using the ticket's original steps
- [ ] every closed bug has a permanent criterion in the related scenario
- [ ] all Happy paths are run before release (smoke)
- [ ] all Security paths are run before any release touching sensitive code
- [ ] the P0 regression pack passes on the frozen release build (execution.md §2)
```

### Production readiness
```markdown
- [ ] behind a feature flag: flag-off keeps old behaviour, flag-on works, kill switch tested
- [ ] database migration is backward-compatible with the previous app version
- [ ] rollback path rehearsed on staging and timed
- [ ] production config / secrets / third-party credentials verified (not sandbox)
- [ ] prod smoke checklist written, with an internal test account
```
Full go/no-go, UAT, and post-deploy guidance: `release-readiness.md`.
