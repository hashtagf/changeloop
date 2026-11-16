# `/land <change>`

Part of the Change Loop lifecycle contract; the overview, ownership, blocking policy, and cross-cutting rules are in [WORKFLOW.md](../../../WORKFLOW.md).


`/land` runs the same route `/dev` uses:

```bash
cloop advance <change> --through archived
```

This explicit invocation supplies Land authority. Any other explicit user
instruction to land, in any wording (for example "land it when proven" in a
`/dev` request), supplies it too. Silence never does. `land advance` remains
only as an alias of `advance <change> --through archived`; it issues no grant of
its own, and the phase guard rewrites it to that route.

In the Pi interactive host, `/land` without an ID and direct short consent such
as `land ได้เลย` or `land it` resolve the single `proven` or `applied` change
linked to the current session's phase history. Multiple ready changes open a
selection list; no matching change grants no authority. Users need not copy an
internal change ID. This convenience does not interpret generic agreement,
quoted examples, worker messages, or RPC text as consent. Other explicit wording
can use `/land`; `/land <change>` remains available for a specific target.
The resolved authority stays session-local and change-specific, is revoked by
new user input or reload, and does not authorize `/deliver` or publication.
The same session resolution applies to `/deliver` without an ID and to short
whole requests such as `เปิด PR ให้เลย`, `deliver ได้เลย`, or `open a PR`, over
the session's `proven`, `applied`, or `archived` changes. An interactive
message that starts with `investigate <topic>` runs `/investigate <topic>`.
Neither grants Land beyond the Deliver workflow's own Land of a proven change.

Land is the single hard gate ([blocking policy](../../../WORKFLOW.md#blocking-policy)). It refuses
until the spec approval is still valid (checked again even when a grant
exists), the lifecycle is `proven` (or `applied` during recovery), assurance
passed, and the proof's workspace hash equals the current workspace hash.
There is no unproven or risk-accepted Land: on a refusal, `advance <change>
--through archived` proves the current workspace and returns to Land. A change
still in `change` or `building` never moves to `applied` or `archived`
directly; a legacy `landing` status reads as `proven` with every gate in force.
When Prove recorded protected-path edits or deletions, the Land output lists
`protected paths changed` and `paths deleted` (paths only), and the grant
carries the same `surface`.
Tests and checks run only inside the returned workspace, never in the main
checkout. If Land's apply conflicts with target files that are regenerable
artifacts (for example `__pycache__/*.pyc`) and were clean at isolation,
Land restores them to the sandbox base itself and continues. Any other
conflicting target edit is kept and carried into the change (below); discarding
it instead is the user's decision, recorded with `advance <change> --through
archived --restore-target <paths> --decision-ref <user-decision>`, and a file
changed after the restore was recorded is never overwritten.
Land has one user-visible
goal: place the exact current workspace projection in the declared main
workspace. The Harness binds a resumable grant to the exact change and its
agreement, contract, and execution revisions, the current workspace hash, the
passing proof run and its workspace hash, the repository graph, the target
roots and base heads, and the issuing session, then owns
checking, Apply, verification, semantic spec
synchronization, archival, recovery, and cleanup as internal checkpoints. It
finishes only at `archived`; `proven` is not completion.

After the merged specs verify, archive appends the volatile records to the
archived `proposal.md` only: Appendix: Review record (review rounds and
findings), Appendix: Compliance change record (the draft's `compliance`
requester, approver, implementer, approval before Build or emergency with
retrospective approval, plus the spec-approval decision; only when
`openspec/config.yaml` sets `compliance: change-record`), and Appendix: Rollout
gates (deferred post-release capabilities). A draft's `compliance` block is
validated at Change (approver differs from implementer; `approvedBefore:
"build"` unless `emergency: true` with a `retrospectiveApproval`). A
resumed Land restores the archived proposal to its pre-append bytes and appends
the same text, so the record is written once.

Apply is a journaled transaction over the target. An interruption is recovered
and resumed by the Harness through the same `/land` invocation. Restore,
keep-current, journal, check, resume, and archive mechanics are not separate
user operations. The Harness settles an interrupted apply itself when doing so
cannot lose bytes: it finishes or reverses only content Land wrote, and when the
target holds other content it keeps the current target, synchronizes the sandbox
onto it, and proves again. The agent receives the divergent paths as a notice;
if automatic recovery cannot finish, the agent gets a repair with the transaction
location, not the user. Restoring the recorded backup over divergent content is
never automatic; a user who wants it records it through the same route,
`advance <change> --through archived --recover-apply restore-backup
--decision-ref <user-decision>`, which settles the journal and continues Land.

Uncommitted target edits that Land would overwrite are kept, never committed or
discarded automatically. An edit on other lines than the change is merged by the
harness (`target-edit-sync`, automatic): a 3-way merge into the sandbox copy,
Prove again for what it invalidated, then Apply; the target keeps the user's
bytes until then. Only an edit of the same lines is a `target-edit-conflict`:
the agent merges it into the sandbox copy, and Land applies the merged file once
merging the target edit into it changes nothing. The same holds when sandbox
work proven after an earlier apply re-applies: a path that apply never wrote
must still be at the sandbox base or already hold the sandbox bytes, and its
executable mode must match too (a user `chmod` is an edit), otherwise
its target edit takes this merge or decision route instead of being
overwritten. For an isolated copy the base is the copy's recorded baseline
(content and executable bit) and the base bytes it stored for that path; the
merge, the carried check, and `--restore-target` use those bytes. A path the
baseline does not record counts as edited, and a path whose base bytes were
never stored stays a `target-edit-conflict` that cannot be restored. Edits made outside the sandbox
stop Land only on paths in this change's Land projection; others are reported.
Git-ignored files are no change's content: under each selected repository's own
ignore rules they are never compared, projected, or reported as target edits or
unlanded sandbox work. A tracked file stays content even when it matches an
ignore pattern.

When a single-repository Land changes the root `package.json` or a known
lockfile, the harness then installs dependencies in the target with the same
command the sandbox setup uses (`sandbox.setupCommand`, else the lockfile's
pinned install; `sandbox.installDependencies: false` without a setup command
opts out), so project commands in the checkout find the new dependencies. The
result is recorded in the Land journal. A failed install never rolls Land back:
it is recorded as `failed` and Land prints the command to run in the target.
Selected child repositories of a multi-repository change are not installed.

A multi-repository change whose selection has no writable root has no root
projection, so Land merges the tasks Build checked in the sandbox ledger into
the root `tasks.md` before archive. Only those checkboxes change; every other
line of the root packet stays the agreement as approved. When the change was
amended during Build and the sandbox packet still matches the recorded
amendment, the agreement lives in the sandbox packet, so Land replaces the root
packet with the sandbox packet whole (removing root-only files) before archive;
the archive then carries the amended tasks, specs, and amendment history. A
sandbox packet that drifted after the amendment is not projected and Land stops
on drift as usual.

An archived Land whose diff is still uncommitted is undone, on the user's
decision, with `advance <change> --undo-land --decision-ref <user-decision>`.
The harness returns every path Land wrote (code, synchronized specs, archived
packet) to its pre-Land bytes from the Land journal, retires the change, and
keeps the landed bytes and records under `.foundation/recovery/land-undone/`.
Undo retires rather than reopens the change (its runtime state and packet
leave the live stores), so it quarantines the same per-change bookkeeping
abandon does: review requests and reports, instruction manifests, the open
attestation challenge, and any delivery record, which is moved, never deleted.
`undo.json` lists what moved, an earlier undo's copy is set aside, and a later
change can reuse the id fresh.
It refuses without writing when HEAD moved since Land, a path Land wrote is
staged, or any such path changed after Land.

Land is always allowed for stacked changes. Because Land leaves its diff
uncommitted, a change that branched before another change landed meets that
landed diff in the target; nobody has to commit the first change before the
second one lands. A worktree sandbox, which starts from HEAD, carries every
file another change landed and left uncommitted when it is created and after
each sync, so Build and Prove run with that work; `sandbox create` and
`sandbox sync` name each carried path. Only bytes a Land journal still vouches
for are carried; a target file the user edited is not. While unchanged, carried
files are not the later change's contribution: they stay out of its task
paths, review, diff identity, replay, and Apply. When a sync's own clean
replay of uncommitted work changes the change's diff identity (a landed edit
merged into a file both changes edited, or a carried target edit, with no
conflict left behind and no base move in the same sync), the sync records the
identity before and after it as one bridge in the runtime state. A review or
acceptance verdict bound to any identity the bridges join to the current one
still binds the same contribution, so it rebinds instead of costing another
review wave; an author's own edit never records a bridge and expires the
verdict as before, and a moved base keeps its own contract below. The harness treats the earlier landed bytes as part of the
target: paths the later change left alone land beside it untouched, and for a
path both changed it replays the landed edit into the later change's sandbox
copy (a 3-way merge), proves again only what that invalidated, and applies.
When both rewrote the same lines, the later change's agent merges them in its
sandbox copy, keeping the landed content; that edit is the resolution unless it drops
landed edits, which keeps the conflict with the agent. Earlier
landed bytes are never restored over or offered for discard, and the user is
asked only when the two changes' intents genuinely contradict. Each change
archives in Land order, so OpenSpec merges each change's spec delta onto the
specs the earlier Land already synchronized.

A multi-repository change follows the same rules in every writable repository,
against that repository's own target and Land journals. `sandbox sync` replays
an earlier change's landed, uncommitted edit into the repository sandbox copy of
each file both changes edited: a clean merge is written and invalidates proof
like any sync; a conflict names the repository, the path and the landing change
(`CONFLICT backend:src/a.txt`) and leaves the sandbox file untouched. The agent
merges the two edits in the sandbox copy, and the next sync records that
resolution bound to the exact target and sandbox bytes it was made against.
Repository Land then accepts the sandbox file when it holds the target's edit
(merging the base-to-target edit into it changes nothing, and the file mode
matches), when the harness's own sync merged the landed edit into it cleanly
and neither the target nor the sandbox file changed since (the replay produced
those bytes from the target, so applying them drops nothing landed, even where
merging the same hunks again would report a conflict), or when a recorded
resolution still matches both files and keeps every landed edit outside the
lines both changes rewrote; those conflicting lines are the agent's to decide.
The same clean-replay rule applies to the root workspace. A stop on a path an
earlier change landed routes to the harness's own sync first, as for the root;
a target edited after that sync routes to it again. When the sync left a
conflict on exactly the current bytes, Land returns the conflict with its
`sandbox sync --resolve` route instead of a bare overwrite refusal. Any other
uncommitted target edit, including one made after the landing or one whose
resolution a later edit voided, stops Land naming the repository and path. A
landed file the repository sandbox did not edit is neither replayed nor copied
into it. A sync that invalidates proof also removes the proof-advance
checkpoint, so `advance` runs proof again instead of reporting current proof
while the lifecycle is back in Build.

The projection is confined to Git-tracked files plus paths declared in
`tasks.md`. An untracked path no task names is neither evidence surface nor a
Land deletion. A target path is deleted only when the authorized sandbox removed
it. Conflicts never overwrite unrelated target edits.

Every writable selected repository is prepared before the first target write
and then applied in dependency order with durable per-repository checkpoints.
Each target finishes `applied-uncommitted`: its intended diff is visible for
the user to inspect, while Git HEAD and index remain unchanged. Read-only
repositories remain unchanged. Re-entering `/land` resumes the same grant and
skips already verified nodes; it never requires the user to assemble a journal,
grant, commit, recovery command, or archive command. A node counts as verified
only while its sandbox projection is unchanged: work committed or edited in a
repository sandbox or in the root sandbox after an earlier delivery is delivered
again on resume. A path that earlier delivery did not write is applied only
while the target still holds its base content (or already the sandbox's bytes),
so a target edit made since is never overwritten.

A declared nested repository's pointer (its gitlink) is never root content.
When the root sandbox moves one (committed or staged), Land stops before any
target write; the move is never dropped silently. For a repository the change
selects, this is an agent repair (`ROOT_POINTER_MOVED`): the agent brings the
commit into that repository's sandbox, restores the root pointer to its base,
and resumes; `/deliver` then sets the root pointer to the delivered commit. For
a repository the change does not select, selecting it widens scope, so the user
gets the `repository-pointer-change` decision: land the pointer through that
repository, restore the pointer and land the rest, or pause.

A change that 3.7.0 or earlier left inside the retired commit-based Land saga
(child commits bound by `land record`, pointers staged by `land pointers`) is
not carried forward: `advance` returns the `legacy-land-saga` decision naming
`.foundation/runtime/<change>.json` and its saga fields, `changes` lists it as
`legacy-land-saga`, and `doctor` reports it. The user either finishes the
change with 3.7.0 and then upgrades again, or retires it with `change abandon`;
the state stays unchanged until then.

Before a multi-repository change is archived, Land reads each writable selected
repository's target checkout, not its own records: every path the repository
sandbox changed since its base (committed, uncommitted, or untracked) must hold
the sandbox's bytes in the target, the target must be a Git repository of its own
(an uninitialized submodule is not), and nothing may sit in the shared sandbox's
placeholder for a nested repository. Otherwise Land stops with
`LAND_PROJECTION_MISSING`, naming each repository and path; nothing is archived
and no sandbox is removed. A wrong target binding or placeholder work already
stops Land before Apply. Archive cleanup likewise keeps any sandbox whose bytes
the target does not hold, and backs up commits the target cannot reach, as for
abandon, before it removes a sandbox.

Before its first write, Land runs one preflight: readiness, then every refusal
Apply and repository delivery can already decide (moved target, target edits
to sync or reconcile, undeclared deletions, a broken repository binding), and
the spec-sync violations the current specs and the change delta already decide
(`SPEC_SYNC_VIOLATION`). The internal `land check` diagnostic runs that same
preflight without writing or recording anything, so it reports the code and
route Land would stop on instead of a readiness that Land then refuses.

Land never commits, and never implies permission to commit, push, publish,
deploy, or open a pull request. Commit and push happen only through `/deliver`
or the user's direct instruction
([authority from the user's words](../../../WORKFLOW.md#authority-from-the-users-words)).
