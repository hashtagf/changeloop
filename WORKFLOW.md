# Change Loop workflow

**Version 3.7.5**

Change Loop is an OpenSpec-native control plane for safe, economical software
changes in brownfield repositories:

```text
Investigate? → Change → Build → Prove → Land
```

**Audience:** coding agents, integrators, maintainers, and users checking exact
behavior. This is an installed system reference, not a file consumers customize.
For everyday use, follow the [quickstart](https://changeloop.ai/docs/quickstart/).
The [ownership reference](.claude/harness/README.md#file-ownership-and-writers)
separates project agreements, installed instructions, and runtime records.

This document owns the detailed lifecycle contract: what each phase means,
which state transitions are allowed, what blocks progress, and what authority
the harness never infers. In the upstream source repository, `README.md` and
`README.th.md` introduce the product; a consumer project's root README describes
that project, not necessarily Change Loop. Runtime structure and operator commands belong to
`.claude/harness/README.md`; provider, receipt, and proof details belong to
`.claude/harness/EVIDENCE.md`.

## Why this shape

OpenSpec stores the agreement, the native coding agent implements it, and
deterministic project-owned providers prove it. The harness owns state,
isolation, budgets, evidence identity, authority boundaries, and recoverable
Land. Rigor scales with risk and evidence needs, not a task-size phase matrix.

## Ownership and user states

The user owns intent, consequential product decisions, explicit Land authority,
final diff review, and the authority for any later Git or external side effect
(such as an explicit `/deliver`). The coding agent
owns implementation and product repair. The harness owns compilation, tool
preparation, isolation, routing, evidence, permissions integration, recovery,
Apply, and archive. An external owner owns credentials, remote systems, and
human verdicts outside the execution boundary. Harness configuration or host
permission is never turned into a question or command for the user.

Normal output projects internal actions into five user states: `WORKING`,
`NEEDS_DECISION`, `WAITING_EXTERNAL`, `TARGET_REACHED`, and `DELIVERED`.
`DONE` at a requested Build or Prove target projects `TARGET_REACHED`, with
`delivered: false` and the next route preserved. Only `reached: archived`
projects `DELIVERED`. Internal worker and proof-lock waits remain harness-owned
`WORKING`; `WAITING_EXTERNAL` requires a real external owner. Internal commands,
request IDs, journals, repair graphs, and resume tokens remain machine-facing.

### Authority from the user's words

One rule decides what the user's chat words authorize; `AGENT.md` carries it
for every host, and the phase guard enforces its Git and Deliver parts.

- **Approval.** A reply to the spec-approval or amendment question in the
  user's own words—"ลุยเลย", "ทำเลย", "ทำไปเลย", "go ahead", "approve"—is the
  approval. The agent records it through the existing
  `advance <change> --approve-spec --decision-ref <ref>` path and does not ask
  again. Approval stated in the original request counts the same way.
- **Land.** Any explicit instruction to land grants Land. A user who said up
  front "ทำจนจบ", "ทำให้เสร็จ", or "finish it" also authorized Land for that
  change.
- **Not authority.** Silence, and urgency alone ("ด่วน", "รีบ demo"), never
  approve or grant Land. A negated request ("don't push yet") is never
  authority. Authority for an external side effect is never inferred beyond
  what was said.
- **Commit and push.** Only `/deliver` or the user's direct instruction
  ("commit this", "push it") commits or pushes; a push instruction covers the
  commit it publishes. Land never commits. During Build or Prove, a
  `git commit` or `git push` from the main checkout that the user's latest
  prompt did not ask for still runs; the phase guard attaches a warning that
  publication is the user's call. Inside the isolated workspace it is ordinary
  Build work.
- **Pull requests.** A direct request to open a PR or deliver ("เปิด PR ให้เลย",
  "open a PR") is `/deliver` for that one composite command. A Deliver command
  run without it proceeds with a warning.
- **Guards advise.** These authority rules are guidance for the agent. The
  live guards never refuse Land, Deliver, commit, push, edits, or shell shapes
  by default: the call runs, redirected into the workspace where that applies,
  with a warning naming the rule and route. Secret redaction is the exception
  and stays enforced. `FOUNDATION_GUARDRAIL_MODE=block` restores the refusals.

### Blocking policy

The user decides, the agent codes and documents, and the harness automates.
The harness never blocks the user or the agent before Land, and its live guards
advise rather than refuse: it performs a step
itself or routes it to its owner (`EDIT` or `REPAIR` for the agent, `WORKING`
or a harness `WAIT` for its own work, `WAIT` for a named external owner). Land
is the single hard gate: it requires a still-valid spec approval, a `proven`
(or `applied`) lifecycle, passing assurance, and a proof bound to the current
workspace hash ([`/land`](#land-change)).

Before Land, only a user decision stops the flow, as `ASK_USER`:

- spec approval, or an amendment that removes approved behavior;
- product meaning, a material trade-off, or a scope widening the agreement
  does not settle (including an amended-agreement conflict, and two changes
  whose intents contradict);
- an acceptance verdict, a waiver, exhausted review (`review-exhausted`), or
  visual drift left after its repair budget (`visual-drift`, asked once when
  every other gate is done; see the
  [prototype-bound visual check](.claude/harness/lifecycle/change.md#prototype-bound-visual-check));
- Land authority, a commit or push, or another external side effect (including
  rerunning a provider execution whose side effects are indeterminate);
- budget or spend (`budget-no-progress`);
- a cause only the user can clear in their own environment
  (`user-environment`: a credential, the network, or a full disk).

Everything else stays with the agent or the harness: setup and tool
preparation, sandbox repair and sync conflicts, shared-resource waits,
protected-path edits and deletions (recorded by Prove and shown at Land), and
repeated repair, which the [recovery ladder](#recovery-and-user-decisions)
returns to its owner with a changed strategy. The ladder's boundary set
(`USER_AUTHORITY_BOUNDARIES` in the advance recovery runtime) is the runtime
form of this list.

## Lifecycle commands

### `/investigate <problem>`

Investigate researches a cause, feasibility, or how code works before Change, without product edits, and records source-bound findings that `/change` consumes. Full contract: [`.claude/harness/lifecycle/investigate.md`](.claude/harness/lifecycle/investigate.md).

### `/change <intent>`

Change compiles one semantic draft into the validated OpenSpec agreement: the draft v5 folder, work-type sections, decisions, the approval page, revision and amendment, and the prototype-bound visual check. Nothing is built until the user approves it. Full contract: [`.claude/harness/lifecycle/change.md`](.claude/harness/lifecycle/change.md).

### `/build <change>`

Build implements the approved tasks in an isolated sandbox (setup, task leases, repair, and sync with a moving target) and never writes the main checkout. Full contract: [`.claude/harness/lifecycle/build.md`](.claude/harness/lifecycle/build.md).

### `/prove <change>`

Prove reuses and runs content-bound evidence until `proven` or a real boundary. `proven` is not delivered and grants no Land authority. Full contract: [`.claude/harness/lifecycle/prove.md`](.claude/harness/lifecycle/prove.md).

### `/land <change>`

Land is the single hard gate. On explicit Land authority it applies proven work as uncommitted target diffs, leaves every Git HEAD and index unchanged, archives the change, and recovers the same transaction after an interruption. Full contract: [`.claude/harness/lifecycle/land.md`](.claude/harness/lifecycle/land.md).

### `/deliver <change>` (optional)

Optional. On explicit `/deliver` it commits in isolation, pushes a feature branch, opens or reuses a pull request, and verifies provider checks; Land never implies it. Full contract: [`.claude/harness/lifecycle/deliver.md`](.claude/harness/lifecycle/deliver.md).

### `/changes` and `/dev`

`/changes` distinguishes in-progress, proven, stale-proof, and ready-to-land
changes and names the next command for each. Session start may report the same
digest, but a hash-free digest never implies proof freshness. Orphaned runtime
state is reported rather than hidden.

`/dev` is compatibility composition up to a stop target:

```text
/investigate? → /change → /build → /prove → /land? → /deliver?
```

Investigate runs only when the cause, feasibility, or requirement is
unknown. The target is `--through proven|archived|delivered`, else the
request's words ("ทำจนจบ" means `archived`; "เปิด PR" means `delivered`).
When neither states it, the agent asks once together with the spec-approval
question, or at `proven` when that question is already answered; it never
assumes one. `archived` and `delivered` grant Land; `delivered` also grants
the one `/deliver` composite command for that change, which the phase guard
binds to the governing `/dev` invocation (and its `--resume` id). A later
slash command ends that authority. Without a target `/dev` never lands by
implication. `--plan-only` stops after Change and `--resume <id>` resumes an
active OpenSpec change.

## Agreement lanes

### `foundation-rapid`

Rapid is allowed only when all are true:

- impact is low and coupling is isolated;
- no public contract or persistent migration changes;
- the harness derives impact and coupling from the draft and never lowers
  them: tasks spanning two `services/`, `packages/`, `apps/`, `libs/`, or
  `modules/` roots, several repositories, integrations, or external operations
  are coupled; persistence paths (`*.sql`, `migrations/`, `db/`, `schema/`),
  API/async work types, and (without a declared `workType`) requirement text
  naming migrations, rollbacks, databases, APIs, endpoints, payloads, or
  event/message contracts are at least medium. An omitted or lower declaration
  is raised, and the proposal Impact section names the reason;
- no semantic security or irreversible-effect trigger applies;
- unit or static evidence is sufficient;
- a semantic draft authors no design content (file map, UI states, failure
  matrix, user decisions or answered intake choices, assumptions, risks); such a
  draft compiles as standard so that content is kept. Agent defaults
  (`decidedBy: agent`, the minimal-draft default) stay rapid.

### `foundation-standard`

Standard covers every other change. Design records only decisions that
constrain implementation, compatibility, rollout, rollback, or proof. Size
affects budgets and slicing only; it never weakens assurance.

## Evidence contract

`evidence.yaml` is the stable behavioral contract; `execution.yaml` holds
replaceable commands, reports, services, resources, and environment-variable
names. Provider names describe what is proven, not which tool runs. Run
`cloop providers` for the installed catalog and use
`.claude/harness/EVIDENCE.md` for adapters, receipts, resource locks, signed
envelopes, Playwright annotations, and reuse rules.

Execution graph v3 includes setup, service, task, provider, and Land nodes.
The scheduler prioritizes the longest ready dependency path, then fills the
configured capacity with non-conflicting nodes. Valid receipts are reused;
required services and repository setup commands start in bounded independent
batches, and a partial service-start failure stops every session already born.

Test claims automatically require suite-level discovery. Risk-triggered changes
require review. Changed-surface policy may add supply-chain, migration,
accessibility, compatibility, security, review, or deployment obligations after
Build.

Because the real surface exists only after Build, `change resolve --surface`
forecasts those obligations during Change. Forecasts name the triggering glob
but never gate or reduce the requirements derived from actual changed files.
An inferred capability is binding only when a claim declares it or the project
has wired a provider; otherwise it remains a visible advisory. Review stays a
gate and has its own policy.

The change's work types add capabilities that paths cannot reveal (for example
`ml` → `evaluation`, `migration` → `parity`, `infra` → `plan-check` and
`deployment`). Wiring a missing provider for one is agent work (a project-owned
command in `execution.yaml`; `advance` wires a detected one), never
a user question. Post-release capabilities (`release-health`,
`experiment-guardrail`) are deferred rollout gates listed in the archived
proposal; they never block proof or Land. The mapping and adapters are in
[EVIDENCE.md](.claude/harness/EVIDENCE.md#work-type-capabilities).

Consumer quality is opt-in (`quality.changeGate` defaults to `off`) through
`quality/foundation-quality.json`. It is report-only until explicitly enforced,
never expands the Change surface, and never converts unsupported, unavailable,
or unmapped measurements into zero or pass. The installed operational contract
is `.claude/harness/CONSUMER-QUALITY.md`.

Receipts bind provider and protocol versions, claim scope, relevant inputs,
execution configuration, environment identity, artifacts, observations, and
timestamps. Executable receipts record the actual command and log; external
receipts require real provenance and durable references. A provider protocol or
fingerprint change invalidates its prior receipt.

Remote CI and semantic acceptance may return signed, workspace-bound envelopes.
Signatures, issuer, cases, observations, transitions, and artifact digests are
verified before a receipt is written. Hidden oracle content stays external, and
review prose cannot replace a missing or failed required case.

An unavailable configured provider returns `INFRASTRUCTURE_ERROR` with honest
recovery choices: diagnose, retry, record verifiable external evidence, or
configure an available project-owned command proving the same claims. It never
becomes a zero or pass.

Pending implementation returns `NEEDS_CODE_CHANGE`. Agreement or topology
problems return `CONFIGURATION_ERROR`. Subjective acceptance or a contract
contradiction returns `NEEDS_USER_DECISION`. Every non-ready result names an
exact recovery or resume route.

The decision envelope is machine-facing. The agent explains it in the user's
language and owns routine commands and metadata. It
never asks the user to run a safe authorized operation it can perform.
For human review and acceptance, the user decides the concrete verdict; the
agent records that confirmed decision and resumes. Human decision ownership
does not require human CLI execution. Command permission alone is not a review
verdict. The host approval and denial handling procedure is in
`.claude/commands/references/decision-policy.md`.
Genuine decisions present honest
choices, including reject, inconclusive, or pause; they never contain a
preselected passing receipt.

## Review, acceptance, and external authority

Review is bounded by its rounds (one full review, then one changed delta), not
by elapsed time: the agent's repair between rounds and reviewer retries never
spend a user-facing budget. Each dispatch has its own 30-minute timeout, and an
expired dispatch is a reviewer infrastructure failure, not a user question.
`change resolve --continue-review` is still accepted and changes nothing.
Timeout is not a pass. Try repair first; if it cannot progress, explain the
attempted remedies and offer further work before Land. Conflicts, incomplete Apply, and missing side-effect authority
still require their actual resolution, never a claim of successful delivery.

An AI reviewer also reads the project's `REVIEW.md`, when present, as advisory
guidance: it shapes what the reviewer looks at and how it reports, but never
changes pass or fail. Each review receipt binds the file's hash, so editing,
deleting, or creating `REVIEW.md` after a review expires that review
(`review-rules-changed`); receipts recorded before this binding existed are not
expired by it. Details: [project review rules](.claude/harness/EVIDENCE.md#project-review-rules).

Review always routes by risk tier (`workflow.reviewPolicy: "risk-tiered"`, the
only accepted value): every change receives review, with
the correction circuit bounded by risk; `RESOLVED` prints the route, such as
`review: risk-tiered AI review (low tier, fast model)`. The one exception is a
`foundation-rapid` change at the low tier that nothing asks to review (no
declared or keyword security trigger, `--review`, `riskSignals`, review
capability, or required/diversity trigger): it is proven by the project's
deterministic evidence alone, no reviewer runs, and `RESOLVED` prints
`review: not required (rapid lane, low tier: deterministic evidence only)`. The
tier is recomputed from the built diff at every Prove, so an inferred security
or contract capability restores review. Every review is recorded against an
`authority dispatch` attempt (`workflow.reviewCircuit: "full-delta"`). The
retired `legacy` value of either key is refused; rerun `cloop init`
to upgrade it. The review reads the change's diff and
the agreement's requirements, not whole files. Low risk runs one diff-only
review on the fast model tier at medium effort (`review.lowRiskModel:
"configured"` or a reviewer `fastModelId` overrides it). The first medium round
deliberately runs on a faster standard model (a speed/depth trade-off:
the reviewer's `standardModelId`, else the `models.standard.family` alias) at the
configured effort, unless the change carries a security or required-review
trigger or a declared review, which keep the configured model. High and every
later round keep the configured model at high effort. A team pins the strong model
for medium or picks another class with `review.modelByTier` (`low` and `medium`
to `fast|standard|configured`; `high` is not configurable; unknown values fall
back to the configured model). Every full round receives the agreement's scenario checklist and must
report each scenario as covered, missing, or unsure; a missing scenario becomes
a blocking finding that goes straight to repair. If a fast or standard first round is
only unsure of a scenario or its coverage is unreadable, the harness re-runs
that review once on the configured model without consuming a review round. Security triggers are declared (draft `securityTriggers` or
`resolve --security`) or inferred from intent keywords: declared triggers
select the standard lane and security evidence, while an intent keyword alone
only makes review required at the low tier and the change keeps its lane. A
draft's `riskSignals` raise the tier too: `access-control` and `financial` to
high (and they make review required under either policy), `input-domain` to at
least medium. A review finding may carry a kebab-case `code` (at most 64
characters); a malformed code is dropped and the attempt is still recorded.

- **low** — one full AI review; a material correction promotes the route to
  medium;
- **medium** — one full AI review, one correction batch, and at most one fresh
  delta review closing the first-round finding IDs;
- **high** — material risks are settled in the initial Decision Sheet, followed
  by one full AI review and at most one post-correction delta.

A delta review that no longer reports an earlier finding closes it. When a
repaired final finding has no declared critical case to bind and current checks
pass, Prove stops at the review-exhausted user decision (a human verdict, one
more AI wave, a revised agreement, or pause); it never returns an unsatisfiable
repair.

When every routed AI wave is delivered and a review request still needs a
verdict, `advance` returns `ASK_USER` with kind `review-exhausted` instead of a
wait. Its options are `human-verdict` (dispatch the request to a named person
with `authority dispatch --reviewer-type human`, then `authority record` the
verdict that person gave), `one-more-ai-attempt`
(`authority extend-review <change> --decision-ref <user-decision>` allows
exactly one wave beyond those delivered; each decision reference grants one,
and `advance` then runs it), and `pause`. Exhausted review is never waived.
A request that no configured reviewer can start keeps the `WAIT` for an
external verdict.

High risk includes authorization or secrets, public or cross-repository
contracts, migration or destructive state, money, concurrency,
replay/idempotency, brokers or real wire behavior, and activating legacy
behavior. Medium includes other non-low impact/coupling and declared review
risk.

Review begins from a bounded review packet, never Build history. Its changed
surface includes committed and dirty paths from recorded repository bases plus
review contract artifacts. A missing base blocks review instead of appearing
clean. Every receipt records the actual reviewer, session, implementation
subjects, findings, closures, and scope.

Concurrent-change sync reuses identity-valid review evidence through the
[existing proof binding rules](.claude/harness/EVIDENCE.md). No-op sync preserves
proof and lifecycle progress; changed inputs still require a current proof.
This does not reset review waves or grant Land authority.

Critical work requires a different model/provider family or a human unless the
committed project policy explicitly waives diversity. Reviewer independence is
separate and may be waived only through committed policy. Each waiver relaxes
only its own axis and is named in both packet and receipt.

Configured `fallbackReviewers` are tried in order only after an infrastructure
error. `fail` and `inconclusive` are delivered verdicts and never fall through.
Packet inspection and finding/closure binding errors stop the current automatic
retry chain rather than dispatching the unchanged validation failure to another
model. A closure round that closes only some first-round findings is such an
error unless it is not a pass and reports a blocker or major finding for what
remains; then it is a delivered `fail` verdict and the unclosed IDs stay open.
Blocker/major findings from a human review bind the next review, human or AI,
the same way. The backend owns this routing through the existing commands.
The existing `advance --through` route reopens a binding failure only after the
retained packet/result validates again and the reviewer is ready, preserving
scope, attempt history, and infrastructure retry accounting.
A `main-session` fallback requires the explicit self-independence policy and
records observed provenance rather than guessing it.

The risk route is a circuit breaker, not a loop-until-pass rule. After the
allowed delivered AI waves, another open review is refused. A final in-contract
blocker must name affected claims and declared critical cases; current passing
provider evidence may then close those IDs deterministically without a third
AI. A hash chain binds attempts, scope, findings, closure, and receipts.
Deleting or renaming state cannot reset the limit. Neither can moving the
recorded head and count back together to an earlier valid record: an attempt
record above the recorded head marks the chain lowered, except the one
in-flight record at head+1 that links to the head (attempts are written before
the head moves, so a crash can leave it). A corrupt or lowered attempt chain is
harness bookkeeping, not a user decision: the harness moves it aside as
`review-attempts.corrupt-<stamp>` (never deleted, with a recovery manifest),
rebuilds it, and reports a `review-history-recovered` signal. The rebuild is
fail-closed: the attempt count never falls below what the runtime history, any
record or file name, or a legacy receipt evidences; a verdict is reused only
when its whole chain verifies and covers every evidenced attempt; otherwise
the unverifiable attempts count as delivered inconclusive AI waves, which
consumes the budget through the ordinary review-exhausted route.

Human acceptance is separate from review. Every new standard change explicitly
records whether subjective acceptance is required; `undecided` blocks
validation. Required acceptance binds named claims, nonblank criteria, human
identity, observation, provenance, durable evidence, and the final workspace.
The runtime never invokes a human, impersonates one, or manufactures approval.

`handoffs.yaml` owns external operations. Pending handoffs do not block Build or
evidence collection ([blocking policy](#blocking-policy)). Land blocks unresolved pre-Land or activation-coupled
operations. A declared post-Land operation does not require acknowledgement when
a claim proves the merged artifact is safe before activation; the archived
change preserves that operational obligation independently of `tasks.md`.
Acknowledgements, terminal outcomes, tickets, and evidence references are
optional operational records—never credentials. Archive means the code change
was delivered, not that deployment, activation, or production verification ran.

<a id="terminal-stops"></a>

## Recovery and user decisions

Some guards end a run rather than returning another repair action: exhausted AI
review waves, a moved control repository during
multi-repository Land, reset staged submodule pointers, or an apply rollback
that could not complete.

Each stop preserves the change and returns a decision envelope with a typed
code, at least two honest options, a recommendation, and an exact resume route.
When `automaticRecovery` is marked, the known typed recovery is performed by
the harness and explained by the agent without opening a user interview. The
coordinator executes sandbox sync and resumes the original target; a conflicting
sync preserves the work and returns the conflicting paths to the agent as a
repair, and the user is asked only when the intended result is unclear. Other
options are translated into the user's language; the agent never treats a stop as a dead
end or infers authority. A moved target base is replayed, never answered with a
recreated sandbox or a retired change. Retiring with `change abandon` is offered
only where the work itself cannot continue.

Advance protocol 7 retains the existing actions and command routes; `resume`
is the one resume route (the duplicate `resumeCommand` field is gone). Recovery
observations and answers live in `advanceRecovery` on the existing runtime
record. The ladder has three rungs: the first unchanged repair handoff is the
owner's repair, the second returns one agent-owned `REPAIR`
(`TRY_ALTERNATE_APPROACH`) asking for a materially different approach inside the
approved agreement, and the third returns a `REPAIR` (`NO_PROGRESS_BOUNDARY`)
to the original owner, agent or harness, never the user. It carries
`repetition` (rounds, first and last observation, and the output that kept
repeating), `attemptedStrategies`, and an instruction naming the different
approaches to choose from; `repetition.rounds` keeps counting until the
delivery state changes. Only a boundary the user owns
([blocking policy](#blocking-policy): user or Land authority, spec approval,
an external side effect, product meaning, budget or spend) becomes an
`ASK_USER` at the third rung, with that evidence in `decision.repetition`.
Two unchanged internal
automated transitions, a sandbox sync conflict, and a Build task verify that
keeps failing with identical output (durations and timestamps ignored) follow
the same ladder. New process sessions, proof run IDs, diagnostic wording, retry
counters and bookkeeping revisions do not reset progress. Relevant content,
agreement, execution policy, a different verify output, or actual delivery
changes do. Read-only inspection never counts as a repair attempt or records an
answer.

Causes only the user can clear skip the ladder and return `ASK_USER`
(`USER_ENVIRONMENT_REQUIRED`, boundary `user-environment`) on the first
observation: a missing or expired credential or token, VPN, proxy or network
denial, a reviewer CLI that is not logged in, a full disk (`ENOSPC`), private
registry authentication, or a Git remote that rejects the credential (for
example a push `403`). `decision.category` types the boundary as `resource`,
`credential`, or `network`, and `decision.cause` names it. Causes are
classified where the failure is raised, so inspection and every route agree:
typed error codes first, then known signatures in child-process output, on
harness, setup, delivery, and reviewer routes. A full disk is recognized on
every route, while credential or network words inside failing product output
remain a product repair, and a bare local process timeout (`ETIMEDOUT` from a
spawn) is not a network cause. The question names the fix (for example "run
`claude /login`" or "free disk space") and the resume command, and carries no
agent repair instruction; nothing is counted, and an uncleared cause is
reported again the same way. `deliver advance` uses the same classifier and
decision shape; a remaining provider failure is the repository operator's
`WAIT` with an explicit `wait.condition` and `wait.checkCommand`.

Signals the agent must act on that do not change the action ride on the same
envelope as optional `signals[]` entries (`{code, message}`), in addition to
their unchanged stderr or stdout line: `agreement-restored` (an isolated
agreement edit was restored and saved aside for an amendment),
`budget-warning` (spend reached 70% with `execution.budgetWatchdog` on),
`already-archived` (archive recovery found the change already archived),
`apply-recovered` (an interrupted apply was settled), and
`review-history-recovered` (a corrupt review attempt chain was rebuilt). The
field is absent when nothing was signalled.

No agent-facing route names a lifecycle primitive. Any `command`, `next`,
instruction, reason, or decision option that would point at `proof run|advance`,
`land check|advance`, `sandbox sync|create`, or `evidence init` is rewritten to
`advance <change>` with the route's target: proof primitives resume `--through
proven`, Land primitives `--through archived`, and sandbox primitives keep the
current target, so a rewrite never widens a route to Land. Two primitives that
needed a user answer are now advance decisions: an indeterminate provider run
(`DECIDE_INDETERMINATE_EXECUTION`, options `retry|pause`) whose `retry` answer
reaches the next proof run once, and an amended-agreement conflict
(`RESOLVE_AGREEMENT_CONFLICT`, options `merge|retain|pause`) whose answer
performs the resolving synchronization.

Every question offers concrete alternatives, a recommendation and pause, with
the cause and retained repair observations. External waiting is the default,
not a question: `WAIT` names the owner, condition and checking route, and the
agent reports it and resumes when the condition changes.
Live proof workers remain working;
a dead worker returns to harness-owned diagnosis. Resumable internal Land
checkpoints advance automatically while their state progresses.

A stopped configured reviewer returns the existing `authority run` handoff,
not a read-only status command. The agent executes that bounded recovery with the
original implementation provenance and resumes Prove. A valid checkpoint is
reused without another model call; absent results follow the existing attempt
and infrastructure limits. Live reviewer controllers are never dispatched twice.

The agent records an explicit recovery answer using the fingerprint returned
with the decision:

```bash
cloop advance <change> --decision <offered-option> \
  --decision-fingerprint <hash> --decision-ref <user-answer> --reason <approach>
```

The offered options are `retry|wait|pause` for recovery decisions, and the
options listed by an advance decision such as `merge|retain|pause`. A Prove
gate's no-progress decision, raised only for a choice the user owns, is
answered the same way with any option it
offers; any answer but pause resumes that gate as a first observation, so it
returns the repair batch instead of the same question. A gate option that carries its own command
(such as one more AI wave with `authority extend-review`) keeps that command. The answer
retains the prior `--through` target. Retry records the chosen
approach; wait is available only for an external dependency; pause preserves
the work without running setup or providers again. A recorded pause projects
`WAIT` with user state `PAUSED`, not another question or a claim of active work.
Answers are content-bound,
stale fingerprints are refused, and repeated identical references do not grant
another retry allowance. Changed scope requires a new decision. These answers
do not grant Land, waive evidence, extend a model/review budget, or authorize
external side effects. Those decisions keep their existing explicit routes.
Users supply decisions, never flags or runtime JSON.

An unresolved apply transaction blocks a new one. `doctor --change <id>` reports
it before Land and names the recovery operation.

## Invalidation

One relevant workspace snapshot supplies the identity shared by a proof and its
receipts. Runtime state, receipts, sandboxes, dependencies, other active changes,
and archives are excluded. Any relevant product or agreement edit makes the
affected proof material stale.

Executable providers normally bind product inputs rather than the change
packet, so a packet-only edit may re-finalize proof without rerunning them.
Review, acceptance, and semantic acceptance bind the packet because those
authorities read it. A provider may narrow executable inputs explicitly; the
internal `proof-plan` diagnostic shows the binding. Complete rules live in the evidence reference.

## Preflight and telemetry

Run `doctor --stage change|build|prove`. Change and Build permit commands that
are planned but not created yet. Prove requires executable providers and rejects
dependency cycles, report collisions, literal secret-like values, and
status-only readiness probes. Use `--require-archive` when the intended flow
includes Land.

Telemetry records only observed operation and usage metadata. Unknown requests,
tokens, cache, or cost remain unknown rather than zero. A complete token
measurement without price data is truthfully partial and may satisfy a policy
that requires a measured usage dimension; no measured dimension cannot.
Prompts and tool payloads are never copied.
When `advance` executes multiple lifecycle phases, its single operation row
carries disjoint phase intervals. Metrics attribute those intervals without
counting additional command invocations or overlapping parent time. Quality
lane timing includes adapter normalization and ratchet evaluation; structured
quality output is drained even when enforcement returns a failing exit code.

`metrics` and `feedback` expose cost, context, execution, reuse, repair, and wait
signals without counting several receipts from one process as independent
executions. Packet sizes, host imports, transcript cursors, and telemetry schema
belong to the harness operator guide.

Across changes, `outcomes` and `lessons` are read-only, advisory projections:
they write nothing, never gate a change, and keep unknown values `null`.
`outcomes` reports first-proof pass, rework, recorded user decisions, cost, and
escaped defects declared through later changes' `fixes`, grouped by work type,
impact, and risk signals. `lessons` lists blocker and review finding codes that
recur across distinct changes with a suggested permanent check; adopting one is
an ordinary Change.

## Sandbox and repository safety

Change Loop sandboxes protect workspace and apply integrity. They do not contain
processes, networks, host secrets, or system commands by themselves. Never
infer that a worktree or copy makes unrestricted execution safe.

- The target head and selected repository bindings are checked before Apply.
- `git apply --check` or the copy-mode equivalent runs before mutation.
- Apply identity covers only the proven touched-path projection.
- Touched paths and change artifacts are backed up and journaled.
- Failures roll back; an incomplete rollback stops future Apply attempts.
- The sandbox remains the proof subject until archive and proof audit finish.
- Conflicts stop without overwriting unrelated user edits.
- Mutation testing runs only in isolation.

If OpenSpec moves the packet and the archive command is interrupted, an explicit
`advance --through archived` continuation verifies retained proof, the applied
projection at the relocated packet, the approved agreement, captured file modes,
and spec synchronization before completing cleanup. It does not require a new
Change or reconstruct the missing active packet. A recorded `archived` checkpoint
still undergoes the pending archive audit and cleanup before that continuation
reports success. Recovery consumes its Land grant; it does not grant Git or
publication authority. Legacy recovery without captured modes remains explicit
about unavailable mode evidence for optional Deliver.

Copy mode preserves symbolic links verbatim and rejects target paths changed
since its baseline. Generated, tool-owned directories are excluded only when
untracked; a committed fixture remains content regardless of its directory
name.

Multi-repository changes use one OpenSpec agreement and one declared topology.
A path outside the root needs `allowOutsideRoot: true`; its `type` may be `git`
(default) or `external`, which behave the same.
Cross-repository contract evidence must be checked before repositories Land in
dependency order. Writable sibling repositories and submodules receive their
proven bytes in their existing target working trees without staging, committing,
or manufacturing a gitlink SHA. Read-only repositories have no mutation node.
All writable targets are prepared before mutation and use an ordered, resumable
local saga; an unavailable external delivery remains an external-owner wait
rather than a claim of atomic remote mutation. Legacy in-flight commit-oriented
transactions remain readable through their recorded compatibility route.

Git or deployment activity outside Change Loop is observation, not authority.
A moved control target remains `control-head-moved` unless observed bytes match
the change projection or an explicit external delivery reference exists. Even
then, out-of-band delivery does not create proof, grant authority, or complete
the lifecycle. Sync, re-prove when invalidated, and continue to `archived`.

## Budgets and progress

The watchdog evaluates observed requests and token usage against the widest
applicable execution-surface factor. Factors are selected by maximum, never
multiplied. External authority does not inflate model allowance, and unknown
usage is never fabricated.

Budget actions are:

- 70%: batch remaining work and reuse evidence;
- 85%: stop speculative exploration and optional expansion;
- 100%: every exhaustion opens one more window of the same size
  automatically, recorded as a harness decision
  (`harness://auto-extend/budget/1`) that does not use an operator-approved
  continuation. Budget is advisory and never asks the user while delivery
  progresses; three windows reopened without delivery progress (unchanged
  content and lifecycle state) return the `budget-no-progress` decision with
  the window evidence, and an answer starts a new count.

`budget continue` remains an optional, audited explicit widening; it never
deletes usage or lowers assurance.

The internal `budget checkpoint` read reports the measured remaining window,
unfinished work, and exact resume route; `metrics` and `advance --inspect` are
the public reads. It never guesses future model demand.

## Compatibility and operator references

`cloop` is the stable public control surface. It finds the project
from the current directory or `--project <path>` and routes to the installed
runtime so schemas and behavior stay aligned. Use `change start|amend` and
`advance --through build|proven|archived` for normal work. Operator,
integration, host-instruction, and recovery protocols are documented in
`.claude/harness/README.md`. Do not call `foundation.mjs` directly.

Version pins: protocol `semanticDraftSchema` is 5 and the compiler accepts
draft v4 and v5. The runtime API is unchanged, so an installed CLI keeps working with this runtime.

The harness guide also owns requirements and the canonical table of
`.foundation/` runtime records and working inputs. Generated records are
machine-maintained and ignored by Git; drafts, declared sandbox code, and the
optional local policy have explicit writer rules in that guide. This workflow
names them only where their lifecycle meaning matters.

## Quality invariants

- Zero discovered tests cannot silently pass.
- Missing expected evidence cannot silently pass.
- Browser capability mismatch is inconclusive.
- Mutation crash is not a behavioral kill.
- Missing, failed, inconclusive, invalid, or stale proof is preserved as Land
  assurance and cannot be misreported as passing.
- A sandbox diff cannot overwrite a conflicting target.
- OpenSpec performs semantic spec sync before archive; the change is recorded
  `archived` only after the harness verifies the merged specs.
- Required assurance is never dropped because of size or budget.
- A delivery flow is complete only at `archived`.
