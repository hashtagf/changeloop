---
title: Principles
description: Proof-Driven Development, Spec-Driven Development, isolation, fail-closed evidence, and the other principles behind Change Loop for AI coding agents — what each guarantees and where its rules live.
---

<!-- docs-audience: users -->
**Audience:** project users. Read this after [What is Change Loop?](/docs/) to understand why the harness behaves as it does. Each principle summarizes a contract; the linked page holds the exact rules.

Change Loop is built on eight principles. Together they answer one question:
*when an AI coding agent says a change is done, what makes that statement
trustworthy?*

| Principle | In one line |
|---|---|
| [Proof-Driven Development](#proof-driven-development) | A change is done only when current, executable evidence says so |
| [Spec-Driven Development](#spec-driven-development) | The approved agreement, not the code, defines correct behavior |
| [Clear ownership](#clear-ownership) | You decide, the agent builds, the harness automates |
| [Isolation until Land](#isolation-until-land) | Work happens away from your checkout until you authorize it |
| [Fail closed](#fail-closed) | Missing or unknown evidence is never reported as a pass |
| [Risk sets the rigor](#risk-sets-the-rigor) | Assurance follows risk; size only sets budget and slicing |
| [Reuse before rerun](#reuse-before-rerun) | Valid results are reused; only invalidated checks run again |
| [Recoverable by design](#recoverable-by-design) | Every stop preserves the work and names the way forward |

## Proof-Driven Development

A change is not done until current, executable evidence shows that it does what
was agreed. An agent's report of success is never evidence.

- **The proof is defined first.** The agreement states each claim and how it
  will be checked before Build starts.
- **Tools prove, not the agent.** Only receipts produced by running your
  project's own tools count.
- **Proof must be current.** A receipt binds to the exact code and agreement it
  checked. Change either one and the receipt goes stale.
- **Proven is not delivered.** `proven` means the evidence is good. A delivery
  flow is complete only when Land reaches `archived`.

Unlike test-driven development, evidence is not limited to tests: browser runs,
accessibility checks, review, and human acceptance can all be required.
Details: [Claims](/docs/evidence/claims/), [Receipts](/docs/evidence/receipts/),
[Prove](/docs/loop/prove/).

## Spec-Driven Development

The approved OpenSpec agreement is the behavioral source of truth. Code and
tests are evidence that the agreement holds; they do not redefine it.

- Intent is settled in Change, before any product code is written.
- When Build uncovers behavior the agreement does not cover, the agent proposes
  an **amendment** under the same change ID, and only the affected proof is
  redone.
- The agreement stays readable by people: scenarios, not implementation notes.

Details: [Change](/docs/loop/change/).

## Clear ownership

Every step has one owner, and you are interrupted only for decisions that are
genuinely yours.

| Owner | Responsibility |
|---|---|
| **You** | Intent, product meaning, material trade-offs, acceptance, and authority for Land or any external side effect |
| **AI coding agent** | Investigation, the agreement, implementation, tests, and repairs |
| **Harness** | Lifecycle state, isolation, evidence execution, budgets, recovery, and Land guards |

Before Land, the flow stops only for a user decision. Setup, tool preparation,
sandbox repair, and repeated repair stay with the agent or the harness. Land is
the single hard gate. The harness is deterministic software, not an AI: it
never guesses and never infers your authority.
Details: [Your decisions](/docs/approval/).

## Isolation until Land

The agent builds and proves in an isolated sandbox. Your working tree, index,
and branch are untouched until you explicitly authorize Land.

- Land checks the target before applying and stops on a conflict instead of
  overwriting unrelated edits.
- The sandbox remains the proof subject until archive finishes.

Isolation protects the integrity of your workspace. It is not a security
boundary: it does not contain processes, network access, or host secrets.
Details: [Build](/docs/loop/build/#isolation-and-concurrency).

## Fail closed

When the harness cannot establish that something passed, it does not treat it
as passing.

- Zero discovered tests, or missing expected evidence, cannot silently pass.
- A check that could not run is an `error`; one that ran without a verdict for
  the claim is `inconclusive`. Both block, whatever the exit code.
- Failed, stale, or waived proof stays visible at Land. A waiver is your
  recorded decision and is never shown as a pass.
- Unknown measurements, such as cost or token usage, stay unknown rather than
  becoming zero.

Details: [Receipts](/docs/evidence/receipts/#the-four-statuses).

## Risk sets the rigor

The amount of assurance a change receives follows its risk and evidence needs,
not its size. A one-line change that crosses an authentication boundary is not
treated as trivial. Size controls only budget and slicing, and required
assurance is never dropped to fit a budget.
Details: [The change loop](/docs/loop/#rigor-comes-from-risk-not-size).

## Reuse before rerun

Each receipt records the inputs it depends on. While those inputs are unchanged
the result is reused; when one changes, only the dependent checks run again.
This keeps repeated proving fast without accepting stale results.
Details: [Receipts](/docs/evidence/receipts/#declared-inputs-and-safe-reuse).

## Recoverable by design

Long-running work is interrupted: by a failure, a missing credential, or a
decision. Change Loop treats that as normal.

- Every stop preserves the change and returns a clear next step: who owns it,
  why, and the exact way to resume.
- When a decision is yours, it comes with concrete options and a recommendation.
- Repeated failure without progress returns to its owner with a request for a
  different approach, rather than looping.
- Land is journaled. An interrupted or multi-repository Land resumes from its
  journal, and a failed apply rolls back.

Details: [Land](/docs/loop/land/).
