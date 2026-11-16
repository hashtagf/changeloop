# `/prove <change>`

Part of the Change Loop lifecycle contract; the overview, ownership, blocking policy, and cross-cutting rules are in [WORKFLOW.md](../../../WORKFLOW.md).


The normal resumable entrypoint is:

```bash
cloop advance <change> --through proven
```

Proof validates the agreement, hashes relevant inputs, resolves claims to
providers, reuses valid receipts, runs missing or stale project-owned evidence,
routes review before acceptance, and writes a proof bound to the workspace.
A derived `test` provider runs the tasks' own `verify` commands, not the
project's whole suite; a project that wants its full suite as release evidence
runs it as a separate gate before release (this repository: `run-all.sh`), or
declares it as a provider in the change's `execution`.
Failed, missing, stale, erroneous, or inconclusive evidence remains visible as
assurance status. It blocks a `PROVEN` result, and Land refuses it: an explicit
`/land` proves the current workspace first and lands only once that proof
passes.

Composite identity binds repository content and agreement revision rather than
Git commit identity. Recorded base heads remain explicit recovery and Land
state: an unsynchronized target still stops, while moving to a history-only
commit with byte-identical content does not charge another review.

A provider that executed and failed has three honest exits:

- fix the cause and rerun;
- rewire the provider in `execution.yaml`;
- withdraw the capability under a recorded decision with `change waive`.

A waiver withdraws the whole capability. `change waive` refuses a waiver that
would leave no required provider, since a proof without receipts reports
`missing-receipt-manifest` and Land refuses it; Prove likewise never finalizes
such a proof and names that cause instead of reporting `PROVEN`.

Resuming unchanged is not one of them. A harness-executed provider that failed
and then passes on byte-identical inputs is recorded as a flake: the receipt
stays `fail` with `flake` evidence (the first failure and the observed pass), so
the claim needs a repair, and only a pass on changed content is proof again.

A waiver removes the capability from the required set while the claim continues
to declare it. It remains visible as `user-waived`, preserves receipts already
earned, and can be revoked. There is no route that turns failed evidence into a
pass or lands it silently. Review may use the same explicit waiver route;
acceptance retains its explicit withdrawal route. New waivers bind the current
workspace and contract revision. Changed content expires them, while
bookkeeping that moves the revision without changing the agreement carries
them; original failed receipts remain available and proof names the accepted
exceptions.

When executable wiring is absent, `advance` detects project-owned candidates
from manifests without executing scripts and writes only high-confidence
wiring; ambiguity or external authority stays a typed blocker. The
`evidence detect|init|doctor` primitives behind it are internal.
Detection never installs tools, creates receipts, overwrites configured
providers, or weakens claims.

`change audit` checks scenario → claim → task → provider traceability, including
negative security paths and migration rollback/integrity. Tasks link claims
explicitly with `[claims:<claim-id>]`.

Every phase gate follows the same convergence rule: collect independent
findings, repair one dependency-ordered in-contract batch, and selectively
rerun invalidated checks. Product repair has no fixed cycle ceiling while its
semantic progress identity changes; the only exception is the two-round
[visual repair budget](change.md#prototype-bound-visual-check). A coding gate that returns the same
findings for unchanged inputs returns an `AUTO_REPAIR` whose next step is a
`change-strategy` repair carrying those findings, not a user question. Two
unchanged automated transitions hand the stuck step to the agent as a
no-progress repair carrying what the step returned. Repeated rounds follow the
[recovery ladder](../../../WORKFLOW.md#recovery-and-user-decisions).

Harness automation that cannot finish is handed to the agent rather than
stopping the flow: a failed sandbox setup or OpenSpec preparation returns an
agent `REPAIR` with `recovery.type: HANDOFF` and a `handoff` naming the step,
its exact command, working directory, and output. The agent finishes the step
(or fixes its declared setup) and resumes. Thrown Build, Prove, or Land
dependencies are captured in the same action envelope with their original
reason and exact recovery route. User decisions
([blocking policy](../../../WORKFLOW.md#blocking-policy)), external waits, resource waits,
conflicts, and repeated no-progress preserve state.
`proof readiness`, `proof advance`, `proof run`, and `proof collect` are
internal primitives behind `advance`; `advance <change> --inspect` reads the
next action. Direct authority commands remain integration surfaces.
