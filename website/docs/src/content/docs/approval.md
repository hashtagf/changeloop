---
title: Human approval
description: The few decisions that are yours, when each one comes up, and what happens if you stay silent; agent and host mechanics follow.
---

<!-- docs-audience: users -->
**Audience:** project users. Read this to learn which decisions are yours and what happens if you skip them; the agent handles routine system operations. Command-level detail is collected under [For agents and integrators](#for-agents-and-integrators).

Change Loop never decides for you what you wanted. You approve the agreement
before anything is built, make a call when a real trade-off appears, say
whether the result is the one you wanted when that is required, and give
Land authority. The agent and harness record those decisions and carry out
everything routine; reviewers and trusted hosts produce their own evidence.
Come here when you are asked a question and want to know what it means, or
when you want to know what the system will never ask of you.

![Where your decisions fall across Change, Build, Prove, Land and after Land, and what never asks you.](/docs/diagrams/approval-en.svg)

## Your decisions at a glance

| Decision | When it happens | What you say or do | If you do not decide |
|---|---|---|---|
| **Approve the agreement** | End of Change, and again after an amendment that removes approved behavior | Read the approval page; reply "go ahead" or "approve", or correct it | Build does not start. Silence and urgency never count as approval |
| **Settle a product trade-off** | Whenever the agreement cannot settle a meaning, a trade-off, or a wider scope | Answer the question in plain words | The flow waits on that one question; nothing is guessed |
| **Accept the outcome** | After Prove, only if the change requires human acceptance | Say whether the outcome is the one you wanted, with your name | Required acceptance stays open and the change waits. An undecided standard change blocks validation |
| **Waive a failed gate** | A check ran and failed, and you choose not to fix it | Give an explicit reason | The failure stays a failure and Land refuses it |
| **Decide after exhausted review** | The allowed review rounds are used and a verdict is still open | Choose: a human verdict, one more AI attempt, or pause | The change stays paused; exhausted review is never waived |
| **Decide on UI that differs from the prototype** | The change binds a prototype, two repair rounds are used, differences remain, and every other gate is done | Choose: repair more, accept the differences with a reason, or amend the agreement | Land refuses; accepted differences are shown as accepted by you, never as a pass |
| **Authorize Land** | Once the change is `proven` | `/land <change>`, or "finish it" said up front | Nothing is applied to your project. `proven` is not delivered |
| **Authorize a side effect** | Commit, push, open a PR, run an external provider, spend beyond budget | Say so directly (`/deliver`, "push it", "yes") | The action does not run; it is asked, not assumed |
| **Clear what only you can clear** | A login, the network, or a full disk blocks progress | Fix it in your own environment | The change keeps its state and resumes when you are done |

Everything else stays with the agent or the harness: setup, tool preparation,
sandbox repair, sync conflicts, shared-resource waits, and repeated repair.

:::caution[What Land actually enforces]
An exact `/land <change>` supplies one internal, session-bound grant for that
recoverable transaction. Land is the single hard gate: it refuses unless your
spec approval is still valid, the change is proven, assurance passed, and the
proof matches the current workspace. Missing, stale, failed, inconclusive, or
invalid evidence is never landed; a stale proof is proved again first.
Land still fails closed on target conflicts, unsafe paths, ambiguous repository
identity, and transaction corruption, and lists any control-plane, CI, or
secret paths and deletions the change makes before it applies.

Before Land, nothing waits on you except your own decisions: approving the
spec, product meaning or a trade-off, an acceptance verdict, a waiver,
exhausted review, UI that still differs from a bound prototype, Land, a
commit, push, or other side effect, budget, or a
cause only you can clear (a login, the network, a full disk). Setup, sync
conflicts, shared-resource waits, and repeated repair stay with the agent or
the harness.
:::

## Approval in your own words

Your chat reply is the decision. Answering the spec-approval or amendment
question with "ลุยเลย", "ทำเลย", "ทำไปเลย", "go ahead", or "approve" approves it;
the agent records it and does not ask again. Saying "ทำจนจบ" or "finish it" up
front also authorizes Land for that change. Urgency alone ("ด่วน", "รีบ demo")
and silence never approve, and a negated request ("don't push yet") is never
authority.

Commit and push happen only through `/deliver` or your direct instruction
("commit this", "push it"). During Build or Prove an uninstructed `git commit`
or `git push` from the main checkout does not run; it becomes a question, and
your yes lets it run. "เปิด PR ให้เลย" or "open a PR" counts as `/deliver`. The
full rule lives in `WORKFLOW.md` under "Authority from the user's words".

<a id="approval-package-previews-and-role-lanes"></a>

## Approval page, previews, and role lanes

When a change starts, and again when `advance` asks for spec approval, you are
pointed to the **approval page**, `.foundation/previews/<change>/prototype.html`.
The agent writes it when you ask (or you write it yourself). It leads with a
clickable prototype in your project's look, then the facts, the before and
after, the user path including the failing one, failure cases with recovery,
how to undo the change, and who it affects. Anything the agreement does not say
reads **unknown**. There is no approve button: you decide by replying in chat.

The harness computes the facts the page copies and checks the page against
them: the risk level (Low to Critical), the technical domains, and the approval
artifacts per role, each labeled **proof** only when a passing receipt backs
it. Each kind of work owes its own surface (what users see, how a bug is shown
fixed, what must stay the same, who uses a contract, whether data can be
undone, what happens when it breaks, whose data is used). An answer may be
`none: <reason>` or `unknown: <reason>`; nothing blocks on it, and a High or
Critical change must say how to undo it or why it cannot be undone. A stale or
edited page only adds a warning to the approval question. Full contract:
[WORKFLOW.md § Approval page](https://github.com/hashtagf/changeloop/blob/main/WORKFLOW.md#approval-package-preview-and-role-lanes).

**Previews are optional.** Before Build the agent may run one declared provider
against a throwaway copy to show early behavior. A preview is never proof and
never blocks; a provider marked `external: true` runs only after you authorize
that run.

**Role lanes are opt-in.** By default one approval covers the change. If
`approval.roles` is set in `foundation.json` (see
[`approval`](/docs/foundation-config/#approval-role-approval-lanes)), each
selected role approves the current revision and Build waits for every required
lane. An approval without a role covers every lane; removing a requirement
resets every lane.

## Acceptance

Acceptance is a named person saying the outcome is the one they wanted. It is
the only boundary about the *product* rather than the *work*.

A standard change starts **undecided, and undecided blocks** (`change validate`
fails until it is decided): someone decides
either that the deterministic checks are the whole story, or that a person must
look and say yes, with a reason. A rapid change starts at `not-required`; a
claim with the `acceptance` capability makes it required. A passing acceptance
needs a named human, an explicit `accept`, at least one criterion, and an
observation, and it goes invalid if the workspace, claims, or reason move
afterward.

## Independent review

Review asks whether the implementation is sound. The reviewer may be a human
**or** a different AI; independence matters, not species.

Every change is reviewed by risk tier, except a low-tier rapid change with no
security keyword, risk signal, or `--review`, which its own tests prove:

- **low:** one full AI review; a material correction promotes it to medium
- **medium:** one full review, one correction batch, then at most one delta
  review that closes the original findings
- **high:** material risks are decided up front; one full review and at most
  one post-correction delta

After two delivered AI waves Change Loop opens no further review on its own.
When a verdict is still open you choose: a human verdict from a named person,
exactly one more AI attempt, or pause. Exhausted review is never waived. The
review cap does not cap repair: the agent keeps fixing while the work makes
progress. The reviewer also flags scope creep in the changed lines (unrequested
abstraction, dead code, a guard that hides a symptom) as minor unless it leaves
a promise false. Details:
[EVIDENCE.md § Review](https://github.com/hashtagf/changeloop/blob/main/.claude/harness/EVIDENCE.md#review-scope-discipline).

### Project review rules (REVIEW.md)

Write your team's review expectations once in `REVIEW.md` at the project root.
The AI reviewer reads it on every review as **advisory** guidance; it never
turns a review into a pass or a fail by itself. Editing it expires earlier
reviews; installing or upgrading adds a starter file only when you have none.
Details: [project review rules](https://github.com/hashtagf/changeloop/blob/main/.claude/harness/EVIDENCE.md#project-review-rules).

## Where decisions get recorded

Decisions belong in the change packet, not in a chat transcript. An acceptance
reason lives in the contract, a review verdict lives in a receipt, and a
continuation decision is named by its `--decision-ref`. The rule underneath all
four boundaries is the same one: **approval is never inferred from silence, and
a command being available is never approval to run it.**

## For agents and integrators

Everything from here down is mechanism the agent runs for you; nothing here
asks a user to run a command.

| Boundary | Owner | Question it answers |
|---|---|---|
| **Acceptance** | User; agent records the decision | Is this the outcome we wanted, and is acceptance required? |
| **Review** | Configured reviewer; project sets assurance policy | Does implementation meet the review criteria? |
| **Authority bridge** | Agent/harness integration | How does a decision or verdict become a validated receipt? |
| **Host attestation** | Trusted host operator | Is the environment safe for unattended sandboxes? |

### Recording the acceptance decision

```bash
cloop change resolve <change> --acceptance-not-required
cloop change resolve <change> \
  --acceptance-required --acceptance-reason "<why a person must judge this>"
```

### Review independence and diversity

Both are policy keys in the committed `foundation.json`, never command flags.
The shipped `"review": { "independence": "self" }` lets the reviewer share the
implementer's identity and session (receipts record `independenceWaived:
true`); `required` demands a different identity and session. The shipped
`"review": { "diversity": "single-model" }` lets a Claude-only install review in
a fresh Claude session; `required` demands a different provider and model
family. Each waiver relaxes only its own axis, and withdrawing one invalidates
the receipts it allowed. Exhausted review maps to `authority dispatch
--reviewer-type human` then `authority record`, `authority extend-review
<change> --decision-ref <user-decision>` (one more AI wave), or pause.

### Gate waivers and advanced continuations

`budget continue`, `change abandon`, `change waive`, and `agents release
--force` record the decision that authorized them. `change waive` withdraws one
failed capability on an explicit decision (`--revoke` restores it), travels as
a `user-waived` advisory into the archive, and refuses to leave no required
provider; acceptance is withdrawn with `change resolve
--acceptance-not-required` instead.

## The authority bridge

`advance --through proven` creates or reuses the authority request and never
polls an unchanged wait. Configured Codex or Claude Code review uses `authority
run`; a named human review uses `authority dispatch` then `authority record`;
human acceptance uses request, status, and record. A request opens only when
tasks are complete and the authority is required; it binds the workspace hash,
expires after 24 hours, and is single-use. `authority record` validates the
response against the request and runs the receipt validator; a pass that would
not yield a valid receipt restores the previous receipt and fails. A workspace
change makes the request stale. `authority status --template` shows the
response shape; users never write receipt JSON.

## Host attestation

**Not** human approval: a trusted host's Ed25519-signed statement (`sandbox
challenge` plus `doctor --unattended --attestation <file>`, ten-minute nonce,
no replay) that the sandbox is safe to run unattended. Trust roots are
root-owned system files, and Change Loop still refuses unattended execution
with a writable container socket, a mounted Kubernetes service-account token,
or a mounted SSH agent socket. Detection is never permission.
