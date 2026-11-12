# Trust, security and privacy UX

Security and privacy decisions are design decisions: what is shown, to whom,
what can be undone, and how people confirm consequential actions. Design them
before visual polish, especially for finance, health, identity and back-office
tools. This file gives UX guidance; it is not a security review or legal
advice. Source IDs resolve in [sources.md](sources.md).

## Consequential actions

| Consequence | Pattern | Notes |
|---|---|---|
| Easily reversible | Act immediately; offer undo | Prefer undo over confirmation for frequent low-risk actions |
| Reversible with effort | Inline confirmation or check-answers summary | Show exactly what will change |
| Irreversible, financial, legal or data-destroying | Review → explicit confirm, or reversible window; specific labels | WCAG 3.3.4 requires submissions in these categories to be reversible, checked or confirmed (AA) [S48] |
| Very high risk | Re-authentication or second approver, plus typed confirmation where it adds attention | Use sparingly; frequent confirmations become habitual clicks [S61] |

Confirmation dialogs lose value when shown for routine actions; reserve them
for consequential or irreversible outcomes and name the action and object in
the buttons. [S61]

## Transaction authorization — show what will be signed

When users authorize money movement or similar operations, the confirmation
must display the significant data being authorized (amount, recipient,
account), and the authorized data must match what is executed. [S53]

- Show amount, currency, destination (masked consistently), fees and timing
  on the confirmation, not only on an earlier step.
- If any value changes after confirmation (rate, fee), require a new
  confirmation.
- Prevent duplicate submission; keep a reference for status checks.

## Sensitive data display

| Data | Default | Reveal |
|---|---|---|
| Card / bank numbers | Mask all but last 4 | Only for roles that need it, logged |
| National ID, passport | Mask partially | On demand with reason, logged |
| Contact details in back office | Show as needed for task | Consider masking in lists, full in detail for permitted roles |
| Secrets, tokens, passwords | Never display after creation | Regenerate instead of reveal |

Do not put personal data or secrets in URLs, page titles, analytics events or
client logs. Minimize what each role sees to what its task needs.

## Authentication and sessions

- **Errors:** use generic sign-in failure messages that do not reveal whether an
  account exists; treat registration and password reset similarly. [S52]
- **Session timeouts:** security guidance sets idle and absolute timeouts based
  on risk. [S51] WCAG 2.2.1 (Level A) requires a time limit to be turnable off,
  adjustable, or extendable after a warning with at least 20 seconds to respond,
  with exceptions for real-time events, essential limits and limits over 20
  hours. [S47] OWASP gives typical idle timeouts of 2–5 minutes for high-value
  apps and 15–30 minutes for low-risk ones. [S51] Design pattern:
  1. Warn before expiry with time remaining and a "stay signed in" action.
  2. On expiry, preserve unsaved work where policy permits (draft) and explain
     what happened after re-authentication.
  3. Return the user to where they were.
- **Accessible authentication:** do not require cognitive function tests
  without an alternative; allow paste and password managers. [S12]
- **Step-up authentication:** ask again only for high-risk actions, and explain why.

## Permissions UX

See permission flows in [experience-architecture.md](experience-architecture.md).
Key rules: show limits before effort; explain disabled actions; show effective
access on admin pages; separate duties where policy requires (maker/checker);
never rely on hiding a button as the only access control.

## Auditability

Users and reviewers should be able to answer "who did what, when, why":

- Record actor, role, action, target, timestamp with time zone, before/after
  values and the reason entered.
- Show the actor name on the decision UI ("บันทึกในชื่อ ปาริชาติ ร.") so people
  know actions are attributable.
- Audit logs are read-only in the UI; corrections are new events.

## Privacy by design

Privacy principles emphasize collecting only what is needed, giving people
meaningful control and being transparent about data use. [S60] UX implications:

- Ask only for data the task needs; explain why at the field ("ใช้ส่ง SMS ยืนยัน").
- Consent is specific, separate from terms acceptance, and as easy to withdraw
  as to give; no pre-ticked boxes for optional processing.
- Provide visible access to privacy settings, data download and deletion
  where the law or product promises them. Check applicable law (e.g. Thailand's
  PDPA) with the product's legal team; this skill does not determine compliance.
- Don't use dark patterns: hidden costs, confirmshaming, forced continuity,
  disguised ads, fake urgency, pre-selected add-ons.

## Trust signals that are real

Trust comes from accurate, consistent behavior: correct totals, clear status,
working cancellation, honest errors. Badges and security wording do not
substitute for these, and fake urgency or social proof erodes trust.

## Review checklist (Critical tier)

Standard pages that collect personal data, consent or sessions use this checklist too and answer page-spec row 14.

- Consequential actions are reversible, checked or confirmed, with specific labels.
- Confirmation shows the exact data being authorized.
- Duplicate submission and unknown outcomes are handled.
- Sensitive data masked by default; reveals limited and logged.
- No personal data or secrets in URLs, titles, analytics.
- Session warning/extension and work preservation designed.
- Sign-in and recovery errors do not reveal account existence.
- Effective permissions visible; disabled actions explain why.
- Every consequential action produces an audit event with reason.
- Data requests are minimal and consent is unbundled.

## Do / Don't

| Do | Don't |
|---|---|
| Match friction to consequence: undo for small, confirm for irreversible. | Confirm every click until users stop reading. |
| Repeat amount and recipient on the final confirmation. | Show the amount only on step 1 of 3. |
| Warn before session expiry and keep drafts. | Log users out silently and discard a long form. |
| Mask by default and log reveals. | Show full ID numbers in every list row. |
| Explain why data is requested. | Collect optional data by default "in case". |
