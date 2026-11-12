# A real L4 example — authentication system

This set came from real work: it started as a Login module holding seven mixed-up scenarios and
grew into a full set of 12 modules / 64 scenarios / 18 files.
Use it as a reference for what L4 output looks like — not as something to copy wholesale, since
the business rules (TTLs, attempt counts, policies) differ in every project.

The original deliverables were written in the team's own language; the scenarios below are
translated, and the structure is what transfers.

---

## Module list and type distribution

| # | Module | Code | Scenarios | Happy | Alt | Error | Edge | Sec |
| ---| ---| ---| ---| ---| ---| ---| ---| --- |
| 1 | Register | SC-REG | 6 | 1 | 1 | 3 | — | 1 |
| 2 | Email Verification | SC-VERIFY | 4 | 1 | 1 | 2 | — | — |
| 3 | Login (email + password) | SC-LOGIN | 5 | 1 | 1 | 2 | — | 1 |
| 4 | Google OAuth | SC-OAUTH | 5 | 2 | 1 | 1 | — | 1 |
| 5 | Two-Factor Authentication | SC-MFA | 6 | 2 | 2 | 1 | — | 1 |
| 6 | Forgot / Reset Password | SC-PWD | 6 | 2 | — | 3 | — | 1 |
| 7 | Session & Token | SC-SESSION | 6 | 1 | — | 1 | 2 | 2 |
| 8 | Logout | SC-LOGOUT | 4 | 1 | 1 | — | 1 | 1 |
| 9 | Account Security | SC-ACC | 5 | 2 | 3 | — | — | — |
| 10 | Authorization Guard (RBAC) | SC-AUTHZ | 5 | 1 | — | 1 | 1 | 2 |
| 11 | Security & Abuse Prevention | SC-SEC | 6 | — | — | — | — | 6 |
| 12 | Edge & Resilience | SC-EDGE | 6 | — | — | — | 6 | — |
|  | **Total** | | **64** | **14** | **10** | **14** | **10** | **16** |

Distribution: Happy 22% / Alternate 16% / Error 22% / Edge 16% / Security 25%.
Security runs above the ~15% target deliberately, because authentication is where a miss costs
most — and that reason is written into the document so readers don't think the mix is an accident.

**Structural note:** modules 11 and 12 are *cross-cutting* — they aren't tied to one screen.
Giving Security and Edge their own modules gives a home to the scenarios that span every flow
(brute force, CSRF, injection, boundary values, clock skew) instead of forcing them into a module
where they don't belong.

---

## One full scenario (Happy Path)

````markdown
## SC-LOGIN-01 · Log in with email and password

**Type:** Happy Path · **Priority:** P0
**Persona:** Registered User — already has an account
**Pre-condition:** account exists, email already verified, account not locked

## Scenario Steps
1. User opens the Login page and sees the Email and Password fields
2. Enters a correct email and password
3. Presses "Sign in"
4. The system verifies the credentials — correct
5. Issues a JWT access\_token and refresh\_token
6. Redirects to the Loading page, then automatically on to the Space page

## Acceptance Criteria
*   The form has an Email field and a Password field with a show/hide icon
*   "Sign in" stays disabled until both fields are filled
*   The button shows a loading state while the API call is in flight
*   On success the redirect completes within 1 second
*   A "Forgot password?" link sits under the password field
*   A "Remember me" option is present and extends token expiry
*   If the account has 2FA enabled, the user goes to the 2FA code step instead of straight to Space
*   The new session appears in the device list with the correct device, IP, and timestamp

## Business Logic / Rules
*   Access token lives 15 minutes, refresh token 7 days (30 days with Remember me)
*   Store refresh\_token in an httpOnly cookie only — never localStorage
*   Keep the access token in memory only
*   Validate redirect\_url to the same origin (prevent open redirect)
*   Record last\_login\_at and last\_login\_ip on every login
*   Reset failed\_login\_count to 0 on success

## UX/UI
https://www.figma.com/design/xxx?node-id=163-41619
````

Note how all eight criteria are **observable**, while every rule invisible from the screen (token
lifetimes, where tokens are stored, redirect validation) sits in Business Logic. That split is
what makes the QA checklist tickable without opening the code.

## One Security Path scenario

````markdown
## SC-MFA-06 · Attempt to skip the 2FA step (bypass)

**Type:** Security Path · **Priority:** P1
**Persona:** Attacker who already knows the password — trying to get past the 2FA step
**Pre-condition:** knows the email + password of an account with 2FA enabled, and is sitting on the 2FA code screen

## Scenario Steps
1. Enter the correct password and reach the 2FA code step
2. Type the URL of a page that requires login directly, without entering a code
3. Call an authenticated API using the pre-auth token issued at step 1
4. Close the tab and reopen it

## Acceptance Criteria
*   Typing an internal URL while stuck at the 2FA step always redirects back to the 2FA step
*   Calling any endpoint with the pre-auth token returns 401
*   No refresh\_token cookie is set before 2FA passes
*   Closing and reopening the tab forces the flow to restart from email + password
*   Back then forward does not slip through to the Space page
*   Every bypass attempt is written to the audit log
````

Note the Persona is an Attacker *with something already in hand* ("already knows the password"),
which tells whoever runs it what state to set up. And the criteria assert that **the system
refuses**, rather than that it works.

---

## Old bugs → criteria (free regression coverage)

Six pre-existing bugs were each promoted into a criterion.

| Old bug | Became a criterion in |
| ---| --- |
| Forgot-password link doesn't work | SC-PWD-04 |
| One email could request more than 3 reset links per hour | SC-PWD-06 |
| Accounts created via Google could request a password reset | SC-PWD-02 |
| Confirm Password show/hide toggle broken | SC-PWD-03 |
| Reset succeeds but login then fails | SC-PWD-03 |
| Sessions on other devices survive a reset | SC-PWD-03 |

Three of them landed on SC-PWD-03 alone, because all three are symptoms of the same scenario
(reset password via link). Merging like that is more correct than creating one scenario per bug,
which would bloat the set and obscure what the actual flow is.

---

## File layout of the full set

```
00-INDEX.md              4-tier structure + module list + coverage map + test data + bug template
01-register.md .. 12-edge-resilience.md
13-non-functional.md     NFR, 8 areas + pass thresholds
14-test-plan.md          scope, strategy, environment, risks R1-R10, entry/exit, roles, schedule
15-traceability-matrix.md  64-row inventory + distribution + flow×type + bug→scenario
16-test-completion-report.md  closing template + sign-off
17-release-readiness.md  UAT, deploy plan, rollback + drill, prod smoke, watch window, go/no-go
```

(The original set predates files 17 and the Priority field; they were added when the skill
gained release readiness, and are shown here so the layout matches what `scaffold.py` emits —
the scaffold numbers files by module count, so exact numbers differ.)

The risk matrix from that set, as an example of what an auth system's risks look like:
R1 auth bypass · R2 data leaking across accounts · R3 account takeover via password reset ·
R4 user permanently locked out · R5 sessions not revoked after a password change ·
R6 successful brute force / email spam · R7 broken token refresh blocking all use ·
R8 email never reaching users · R9 minor UX defects · R10 untranslated strings / wrong times

## Priority and release — how this set maps to production

**P0 (9 of 64, ~14%) — runs on every deploy and as prod smoke:** SC-REG-01, SC-VERIFY-01,
SC-LOGIN-01, SC-OAUTH-01, SC-MFA-01, SC-PWD-01, SC-SESSION-01, SC-LOGOUT-01, SC-AUTHZ-01 — the
Happy path of each user-facing flow. Every Security path is at least P1, so the core regression
tier (P0 + P1) contains all 16 of them.

**Prod smoke after an auth release (internal test account, ~10 min):** register a fresh
`qa+<date>@` address · verify via the real email provider · log in · log in with Google · log
out and confirm the session is revoked · request a reset email and check it arrives from the
production sender · no new error types in the tracker.

**Rollback note specific to auth:** rolling back code does not un-send verification or reset
emails, and tokens issued by the new version must still validate (or be deliberately revoked) on
the old one — test that in the rollback drill, or a rollback logs everyone out.

**Go / no-go signers for this set:** PM, QA lead, engineering lead, and security — L4.
