# Do / Don't — flows and screens

These are project recommendations synthesized from the existing interaction,
patterns, visual, accessibility and validation references. They are examples,
not user-study findings or tested layouts. Consult those references and the
source register for standards and research claims. Component usage and state
contracts are in components-usage.md and component-states.md.

## Core pairs (UX decisions)

Apply the relevant pairs; do not turn recommendations into universal layout rules.
Use them when producing design guidance or reviewing misuse: give each relevant
pair with its reason and an observable check, and scale the detail to the request
rather than attaching the whole list to every answer.

| Do | Don't |
|---|---|
| Start with the user's task, context and consequence of failure. | Choose a layout solely for its appearance or invent research to justify it. |
| Connect observed evidence to a concrete behavior and verification step. | List UX laws without showing how they apply to this screen. |
| Specify relevant loading, empty, error, success and recovery behavior. | Deliver only the happy path or represent an unknown operation outcome as success. |
| Preserve entered work where appropriate and explain how to recover. | Clear valid inputs on a recoverable error or invite duplicate submission while the outcome is unknown. |
| Expose important costs, scope and consequences before the user commits. | Hide required fees, ambiguous bulk-action scope or cancellation behind misleading choices. |
| Adapt templates to real content, permissions, devices and existing conventions. | Copy a public landing page as evidence of a private app's workflow or treat a blueprint as a validated screen. |
| Verify the critical journey with appropriate keyboard, zoom and language checks. | Infer interactive usability or accessibility conformance from screenshots alone. |
| Separate observed results, assumptions and proposed research. | Claim conversion lift or usability success without suitable measurements. |
| Order each page by the role's reason for arriving; one focal point per view. | Give operators, managers and auditors one identical layout, or give every element equal weight. |
| Match friction to consequence: undo for small actions, check-and-confirm for money, permissions and deletion. | Confirm every click, or let an irreversible payout go through on one unlabeled "OK". |
| Write real copy with one glossary of object and status names. | Ship lorem ipsum, "Submit" buttons or different names for the same status. |
| Name a success metric and guardrail for Standard and Critical work. | Decide after launch which metric proves the design worked. |

## How to use a pair

Select a likely failure in the requested journey. Show the intended behavior,
the concrete misuse, the consequence and a check that could distinguish them.
State contextual exceptions and label execution as passed, failed or untested.
Use the layout IDs below as starting points, not required shells.

| Context | Do — intended behavior | Don't — misuse | Why | Verify |
|---|---|---|---|---|
| Checkout review, [C03/C04](../assets/layouts/commerce.md) | Show known required charges and the payable total before commitment; disclose estimates and unresolved charges clearly. | Label a subtotal as the final total and reveal a mandatory fee after payment confirmation. | The user needs an informed decision and an accurate understanding of cost. | With shipping and tax fixtures, compare review and confirmed totals; check that uncertainties are visible before commitment. |
| Payment or booking timeout, [C04/C05](../assets/layouts/commerce.md) | Retain permitted inputs; say the outcome is being checked and provide status reconciliation before a new attempt. | Display success without confirmation, or immediately invite a second payment while the first outcome is unknown. | A timeout is not evidence of failure or success; a repeat action can create duplicates. | Simulate a response lost after server acceptance; confirm status reconciliation and duplicate protection match the actual backend contract. A static prototype cannot prove this. |
| Form validation, [C05](../assets/layouts/commerce.md) | Keep valid entered data; explain the field-specific correction and link error messages to fields where applicable. | Clear the form and show only “ข้อมูลไม่ถูกต้อง”. | Recovery should let users correct the problem without repeating completed work. | Submit a form with one invalid field; check retained values, error association and the chosen failed-submit focus destination. Protect sensitive fields according to product requirements. |
| Empty results, [E03](../assets/layouts/content.md) | Distinguish first use, no matches and a service failure; show an appropriate action, such as changing filters. | Use “ไม่มีข้อมูล” for every empty-looking screen, including failed requests. | The next action depends on why content is absent. | Test empty storage, zero matching results and a failed request; each has an accurate explanation and usable recovery. |
| Bulk management, [A01/A03](../assets/layouts/admin.md) | State whether selection covers this page or all matches; show counts, consequences and recovery for partial failure. | Make “Select all” ambiguous or silently discard selection when filters change. | Users must understand which records will be affected. | Select records across pages, change filters and run a partial-failure fixture; compare the disclosed scope with affected record IDs. |
| Operational dashboard, [D01/D04](../assets/layouts/dashboards.md) | Choose metrics that support decisions; show units, time window and freshness; distinguish zero, missing and stale. | Fill the screen with unrelated KPIs or show missing data as zero. | Apparent precision can lead to incorrect prioritization. | Ask a representative user to choose the next action; inspect data fixtures for zero, unavailable and stale states separately. Task success remains unverified until observed. |
| Mobile detail/action, [B02](../assets/layouts/mobile.md) | Adapt content order and sticky actions to compact screens, virtual keyboard and zoom. | Shrink the desktop layout while a sticky action covers the focused field or its error. | The action and necessary information must remain reachable together. | Open the virtual keyboard and zoom/reflow the relevant screen; navigate focus and inspect the field, error and action at the supported viewport sizes. |
| Sign-in and recovery, [U01](../assets/layouts/accounts.md) | Support the product's accessible authentication/recovery contract, including password-manager and paste workflows where relevant. | Block paste or make users retype credentials solely to force memorization. | Input restrictions can obstruct assistive workflows and recovery. | Exercise supported password-manager, paste and recovery paths; evaluate accessibility against the detailed criteria/exceptions in accessibility.md. |
| Subscription management, [U05](../assets/layouts/accounts.md) | Explain renewal, cancellation and end-of-access consequences at the relevant choice; make the cancellation path understandable. | Hide cancellation or use invented scarcity to pressure continuation. | Users should control an informed decision. | Trace subscription → cancellation → confirmation; check recurrence and access dates against the product's actual contract. |
| Layout reference selection, [library index](../assets/layouts/index.md) | Explain the chosen task match and tradeoff, then replace sample content and specify real states. | Treat an attractive external screenshot as proof that the same layout will work for this product. | Visual inspiration does not establish usability or the behavior of unseen screens. | Compare the proposed layout with the user's tasks, permissions and content; record which external surfaces were actually inspected. |

## Worked pair — filtered records

**Context:** A01 record management; a staff member applies a status filter and
finds no matching records. Assume the request completed successfully.

**Do:** “ไม่พบคำขอที่ตรงกับตัวกรอง ‘รอตรวจสอบ’” with a visible active filter and
an action to clear it. Preserve the query and other relevant state.

**Don't:** Show “ยังไม่มีคำขอ” with a primary “สร้างคำขอ” action while concealing
the active filter.

**Why:** The latter suggests that the dataset is empty and encourages an action
that does not solve the search task. Creating a record may still be offered if
authorized and useful, but should not misrepresent the cause of emptiness.

**Check:** Seed records outside the selected status; apply the filter, clear it
and confirm the records reappear. Separately fail the request and confirm it
shows a service error rather than this no-matches message. These are proposed
checks until a runnable artifact is inspected.

## Evidence and exceptions

A screenshot can support a finding that a total or active filter is not visible
in that captured state. It cannot prove payment reconciliation, keyboard behavior
or conversion lift. Use the [validation guide](validation.md) to choose evidence
for those claims. Recommendations may vary by task: retaining sensitive values,
optimistic updates or irreversible actions need an explicit product contract.
Do not impose extra confirmations or screens solely because an example includes them.
