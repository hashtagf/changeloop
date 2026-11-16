# `/build <change>`

Part of the Change Loop lifecycle contract; the overview, ownership, blocking policy, and cross-cutting rules are in [WORKFLOW.md](../../../WORKFLOW.md).


The normal entrypoint is:

```bash
cloop advance <change> --through proven
```

The coordinator validates the agreement, prepares or synchronizes isolation,
compiles the task graph, and returns one bounded protocol-v7 action:
`WORKING`, `EDIT`, `REPAIR`, `RUN_EXTERNAL`, `WAIT`, `ASK_USER`, or `DONE`.
`WORKING` means harness work is still running (`PROOF_IN_PROGRESS`,
`LAND_IN_PROGRESS`): wait for it instead of starting another run. `/build`
targets `proven` from its first call, because Prove has no external side
effects: proof runs only once Build is complete, in the same coordinator
call, without a separate Build `DONE` round trip. It stops at `proven` and
never Lands. `advance <change> --through build` remains available to stop at
Build. The coordinator records the furthest `--through` target requested
(`requestedThrough`, monotonic; Land stays behind its own grant). Every route
the harness prints afterwards (`changes`, the session digest, `validate`,
approval, scope and workspace errors) continues toward that target, and never
below `proven` once the spec is approved, so a resume cannot walk back to a
Build-only stop. A session `EDIT` carries the whole recipe in `instructions`
(implement inside the workspace, resume once, `checkCommand` only to diagnose),
so a plain `EDIT` needs no Build document read; `/dev` reads only
`commands/change.md` up front and loads Build, Prove, and Land guidance on a
failure or a non-`EDIT` action.
`tasks.md` is the only implementation ledger. `handoffs.yaml` separately owns
AWS, cluster, secret, Terraform, deploy, restart, or other operations that need
external authority.

Build writes only inside the declared isolated workspace. Git projects normally
use detached worktrees; a dirty target or non-Git project uses an isolated copy.
This is workspace integrity, not OS process, network, or secret containment.
The agent runs `cd <workspace>` once as its own shell call and then plain
commands, so no compound command asks the user for approval.

The live guards never refuse the agent by default; they automate or route
([blocking policy](../../../WORKFLOW.md#blocking-policy)). A
product edit aimed at the main checkout while a workspace exists is redirected
to the same path in the workspace. Internal Land commands run as `advance
<change> --through archived` (a raw `land advance` is rewritten to it in every
session, `/land` included), and a delivery outside `/deliver` becomes the
question for the user. Everything else runs with guidance naming the rule and
the route: shell findings (path escapes, copies from outside the workspace),
edits before a change exists, and edits outside the phase's surface. Land
reports target edits made outside the sandbox, and the host still owns process
isolation for indirect or dynamically computed effects. A secret read shows a
redacted copy, and a detached `authority run` runs attached. Hosts that want
refusals set `FOUNDATION_GUARDRAIL_MODE=block` (or `FOUNDATION_SHELL_GUARD=block`,
`FOUNDATION_SECRETS_GUARD=block`).

The harness also absorbs what used to cost a turn: the agent's scratchpad
(`<tmp>/claude-*`) and `~/.claude` are writable in every phase unless they hold
the project or a repository the change writes; after Prove, edits inside the
isolated workspace only make the proof stale; during Land, read-only test
commands may run but script runners still need the runtime transaction; and an
isolated packet edited outside a semantic amendment is
restored to the agreed text by the harness (whitespace in place; any other
edit saved under `.foundation/agreement-drift/<change>/` for an amendment),
not reported as drift for the agent to undo. The agreed text is the latest
amendment's snapshot when one exists, otherwise the target packet, and the
restore notice names the files it put back and where the edit was saved. A
workspace never borrows the checkout's dependencies. When no setup command is
declared, the harness runs the workspace lockfile's pinned install itself
(`npm ci`, `pnpm install --frozen-lockfile`, `yarn install --frozen-lockfile`,
or `bun install --frozen-lockfile`) and records it like a configured setup;
`sandbox.installDependencies: false` opts out. If that install fails or its
tool is missing, Build is not blocked ([blocking policy](../../../WORKFLOW.md#blocking-policy)):
`advance` returns a `REPAIR` handoff with
the command, workspace directory, and log tail for the agent to finish. When a
Build edit changes the workspace manifest or lockfile after a successful setup,
the harness reruns that setup before the next check, task check, or proof run
reads the workspace.

Before Build, the harness compiles and persists an execution-preparation plan
from selected repositories, setup commands, provider wiring, and tool identity.
It reuses ready records, prepares only missing project-local dependencies, and
retries only failed repository setup records. OpenSpec is required only from
Prove onward: Build neither installs nor stops for a missing CLI and records the
tool as `deferred`; the first Prove installs the pinned CLI under
`.foundation/tools` (never globally) and keeps the existing `HANDOFF` when that
fails. Prove and Land re-check the same plan. Before Build, an unavailable
OpenSpec CLI only defers the strict spec lint; from Prove on, the lint is required and an absent
CLI fails closed rather than letting an unlinted agreement reach archive. A setup or
host-integration failure remains Harness-owned repair and is not emitted as a
command for the user.

Unattended Build requires a trusted host-owned attestation:

```bash
cloop sandbox challenge <change>
cloop sandbox create <change> --unattended --attestation <file>
```

`--unattended` is presence-only; valued or duplicate forms are rejected before
telemetry or mutation. An attestation is short-lived, project-, agreement-, and
permission-bound, single-use, and does not turn a worktree or container into a
security boundary. The complete operator contract is in the harness guide.

A Build is confined when it stays in one repository, no claim spans
repositories, and no task declares a `[resources:]` token beyond its own
workspace. A confined single task, or a confined chain whose every scheduling
wave holds one task, runs in the current session without a lease (below). When
planned dispatch selects only one ready task otherwise, the current session
runs it under a harness-held lease. Two or more ready tasks in separate
repository workspaces use native workers. Tasks sharing a workspace stay
serialized because lease release observes the whole repository diff; disjoint
paths alone cannot identify their writer.
The compiler writes cross-repository order into `tasks.md`. A task follows
every same-change task in a repository nested inside its own, as root contains
a submodule. A task without authored edges also follows the tasks of each
repository its selection `dependsOn`. A task a semantic amendment adds gets
the same edges. An edge that would close a cycle, including a multi-task cycle
across the updated, kept, and added tasks of an amendment, is a compile issue. The harness plans dependency and resource scopes,
leases them all-or-none with fencing generations, and accepts only observed
writes inside the granted authority. Load one primary construction skill per
task and only the cross-cutting security or observability skills whose triggers
apply.

An edit inside the sandbox outside every task's `[paths:]` does not block Build
or Prove ([blocking policy](../../../WORKFLOW.md#blocking-policy)). Prove records it in the change
surface (`surfaceAdditions`), so it is proven and lands with the change. A
control-plane, CI, or secret path (for example `.claude/`, `.github/`,
`foundation.json`, `.env`) is recorded with `protected: true` and a path the
sandbox removed with `deleted: true`; Land lists both (paths only, never
contents) before it applies. Two cases remain agent repairs, each with a
concrete command: more than 100 such paths (`ignore-generated-output`, with
the `.gitignore` patterns that cover them, or an amendment if they are intended
work) and child-repository work in the root sandbox
(`move-to-repository-sandbox`). Build refuses a write inside another active
task's scope and names the contested paths and the task that owns them.

Lease recovery is harness work, not a user decision. An owner reacquiring its
own unreleased lease after the graph, contract, or `[paths:]` changed is
re-granted under a new fencing generation and keeps its original write
baseline, so earlier writes are still judged against the widened scope. A
lease past its TTL is released or taken over without `--force` or a decision
reference; only a live lease held by another worker needs one. `advance` settles
the session lease it holds even after its TTL. A session lease whose graph or
contract moved since it was issued (an amendment reopened or reshaped tasks)
is settled before dispatching: when its task now waits on a pending
dependency the lease is parked (its resources released for the reopened
work, its index and write baseline kept, so the re-issued lease still judges
earlier writes from the task's start); otherwise it is renewed in place. A
reopened dependency therefore never waits on a resource its dependent's stale
lease holds. An outside agent's stale lease keeps its re-acquire route. A
shared `[resources:]` token
another active change holds is queued, not a repair or a question: `advance`
returns a harness-owned `WAIT` (`WAIT_RESOURCE`, code `LEASE_RESOURCE_HELD`)
naming the holder, and resumes once it lands, is abandoned, or its lease
expires. These waits never count toward the recovery ladder.

A force-released lease grants no result authority. If its task was already
checked complete, the planner returns it for leased verification without
rewriting the checkbox; only an accepted release clears that recovery.

An accepted task result binds that task's own authority: its node (text,
repository, paths, dependencies, schemas) and the claims it proves. An
amendment that leaves a task unchanged keeps its result; a rewritten task and
its dependants need verification. Results recorded before this binding keep
the whole-graph comparison they were written under. `advance` re-verifies a
checked task with a stale record itself, under a harness lease: its `verify`
check must pass, and work finished outside a lease is never split per task.
Only a task a live worker holds, a failing check, or one behind an unverified
dependency returns as an EDIT, listed under `reverification` with its cause as
implemented work to repair, not to redo.

When every pending Build task must run one at a time (a dependency chain or
overlapping paths) in one repository with no cross-repository claim or
external resource, `advance` hands all of them in one session EDIT, in
dependency order, with no lease. The next `advance` runs each handed task's
`verify`, ticks every passing task, records its result under a harness lease,
and returns an EDIT only for failed tasks (with `verificationFailures`) and
their dependents. A behavior task whose verify passed while nothing changed in
its declared `paths` is not ticked: its failure names the paths and the routes
forward (implement the change there, correct the paths with an `updateTasks`
amendment, or withdraw the task with `removeTasks`). Plans with a parallel wave, several repositories, or shared
external resources use native workers, but the harness still holds every
lease: `advance` acquires the group's leases, the parent only spawns one worker
per `execution.workers` entry and waits, and the next `advance` verifies, ticks,
releases, and scope-checks each task. No agent acquires, releases, or ticks.

Every completed task carries one kind of authority: a result the harness
recorded after the task's `verify` passed, bound to that task's own authority.
Planning records none. Older `single-agent-observed` and graph-v2 records stay
readable for in-flight changes only.

An upgrade from execution graph v2 preserves a completed multi-task
single-session Build only when the persisted plan still binds the same task
authority, claims, contract revision, and contract fingerprint. The current
proof records that compatibility witness without manufacturing lease results.
If the binding is absent, stale, or superseded by a force-released lease, the
planner returns only the affected completed task and its dependency descendants
to current leased verification without rewriting `tasks.md`; a packet already
complete at isolation keeps its independent proof route. This deterministic
recovery never asks the user for a semantic decision.

For multi-repository work, the committed topology selects repositories and
access modes before task, provider, or worker planning. Providers may execute
in one repository while consuming a declared set of other isolated
repositories. Read-selected Git dependencies participate in proof but never
produce a Land mutation node.

The declared selection—not the number of surviving runtime records—decides
whether a lifecycle is composite. Selecting one non-root repository is
multi-repository even when `root` has no product writes. After isolation, every
selected non-root repository must retain a worktree record whose path, target,
access mode, and base head match the catalog. Changed-surface hashing, review
packets, provider manifests, Apply, and Land all use that binding and never
fall back to the live target. Each repository has one location: Build envelopes,
the phase guard, review finding binding (a finding named
`root/<submodule path>/<file>` binds to that repository), and Land all use its
repository sandbox. A declared repository's directory or gitlink in the root
workspace (missing, empty, or pointing at another commit) is that repository's
pointer, never a root change, so it is excluded from root review, proof
readiness, Apply, and replay.

Root code and tests still consume each declared nested repository through its
path under root, so the harness projects it into the root sandbox during Build
and Prove. A selected repository's path is a link to its repository sandbox,
which stays the single source of truth: root checks see its uncommitted work,
and an edit through either path lands in the repository sandbox. Any other
declared nested repository holds a detached checkout of the commit the root
gitlink records (a nested repository Git does not track: its target HEAD),
cloned from local objects only, even when the target never initialized that
submodule. That checkout is read-only: an edit or commit there would let a root
check pass on bytes no Land delivers, so the next check refuses until it is
reverted or the repository is selected through an amendment. The root index
keeps each gitlink at its recorded commit (`skip-worktree`), so projections never
enter root status, proof or review hashes, the changed surface, or Land. Sandbox
creation and repair, resume, sync, `exec`, task checks, and proof runs bring the
projections current; content found where a projection belongs is moved to
`.foundation/backups/<change>/`, never deleted. A copy-mode root sandbox that
carries Git is projected the same way.

`sandbox inspect <change>` reports missing, unexpected, missing-path, and
invalid-worktree records without executing a PATH-resolved Git command.
`sandbox create <change> --all` repairs missing bindings idempotently while
preserving valid worktrees. Repair or retire an incomplete repository selection
before resume; never prove a subset.

An in-contract defect is repaired without asking again. Only evidence that
changes locked behavior, compatibility, security, data, or rollout opens one
audited batched amendment. `advance` synchronizes any amended agreement or
moved target itself; the operator primitive behind it is:

```bash
cloop sandbox sync <change>
```

Sync increments the agreement revision and invalidates proof that no longer
describes it. A worktree replay is prepared against the current target before
replacement; a multi-repository replay prepares every writable repository
before replacing any; a copy fast-forwards files only the target changed.
Double-edited files stop as named `CONFLICT` entries and leave the existing
sandbox intact and return to the agent as a repair: merge the target version
in the sandbox and resume. For a copy, `advance` settles a merged file itself
once a 3-way check against the copy's stored base bytes proves the target's edit
is in the merged copy and no conflict markers remain; a changed copy alone never
settles. `--resolve` remains the explicit operator form.
