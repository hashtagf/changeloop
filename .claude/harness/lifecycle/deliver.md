# `/deliver <change>` (optional)

Part of the Change Loop lifecycle contract; the overview, ownership, blocking policy, and cross-cutting rules are in [WORKFLOW.md](../../../WORKFLOW.md).


Deliver is an optional post-Land transaction. The normal change lifecycle is
still complete at `archived`; no delivery state, provider work, presentation
evidence, prompt, or gate exists unless the user explicitly invokes
`/deliver <change>` or directly asks to open a PR or deliver ("เปิด PR ให้เลย"),
which is the same invocation.

The agent runs one composition command, `cloop deliver advance
<change>`, and executes its automatic recovery internally. The user never
assembles readiness, preparation, commit, push, provider, or resume commands.
Invoking `/deliver` on a proven change that is not yet archived is also the
user's Land authority: Deliver runs the normal `advance <change> --through
archived` route, which issues the Land grant under this invocation, and continues
delivery in the same call once the change is archived. A Land boundary on the
way (a real decision or an agent repair) is returned with the Deliver resume
route. Deliver lands only from `proven` or `applied`; when the proof has gone
stale since, that route proves the current workspace again before Land. A
change that is not proven yet is not landed; Deliver recommends finishing Build
and Prove first. The invocation grants only the authority to
Land, create an isolated feature branch, commit the proven Land projection,
push that branch, and open or reuse a pull request. It does not authorize
force-push, default-branch push, merge, deploy, publish, evidence disclosure to
a new store, or product edits. Deliver questions use the blocked-decision shape
(options with outcomes, a recommendation, and `pause`); only typed provider
failures (remote, credentials, push, or pull-request service) wait on the
repository operator.

The delivery commit subject and branch follow the project-owned `deliver`
settings in `foundation.json`. `commitSubject` (default `{commitType}: {title}`,
which yields `feat: <title>` or `fix: <title>`) and `branchPattern` (default
`change/{changeId}`) accept the placeholders `{changeId}`, `{title}`,
`{commitType}` (`feat` or `fix`), `{prType}` (the pull-request type, such as
`bug-fix`), and `{ticket}`. `{ticket}` is the first match of the optional
`ticketPattern` regular expression (its first capture group when it has one) in
the change id, then the archived title, why, and summary. For example,
`"commitSubject": "{commitType}({ticket}): {title}"`, `"branchPattern":
"feature/{ticket}-{title}"`, and `"ticketPattern": "[A-Z]+-\\d+"`. A pattern that
uses only `{changeId}` keeps its historical lowercase normalization; with any
other placeholder the literal text is kept as written, placeholder values are
slugged (except `{ticket}`, kept as matched), and the branch must pass `git
check-ref-format`. The subject must be one non-empty line of at most 180
characters. An unknown placeholder, an invalid pattern, a missing ticket, or an
invalid result is refused before any workspace, commit, or push exists, as a
`delivery-policy` wait that names the setting to correct. A review follow-up's
commit uses the same subject template; it still pushes to the branch of the
pull request it updates, and a delivery already under way keeps its checkpointed
branch. Pull-request titles are unchanged.

Deliver reconstructs the projection in a separate Git worktree, leaving the
user's checkout, HEAD, index, and unrelated edits unchanged. It binds durable
checkpoints to the archived change, proof run, target head, and Land projection.
Commits added on top of the Land base after Land do not stop delivery: the
branch is built from that base and the proven content is verified separately.
Only a history that no longer contains the base (reset or rebase) asks the user.
After interruption it reconciles the local commit, remote branch, and provider
state before taking the next missing action. A repeated invocation verifies and
returns the existing pull request rather than creating another.

A review follow-up updates the pull request it answers instead of opening a
second one. The follow-up change records the original delivery by citing that
pull request's URL in its proposal or design (for example "Address the
requested changes on <PR URL>"). Deliver binds only a URL that a verified
delivery receipt of another change in this project produced; an ordinary
related link never redirects publication. When exactly one such pull request is
cited and the provider reports it still open on its delivered branch and base,
Deliver builds the follow-up commit on that branch's current head, pushes it as
a fast-forward (never forced) to the same branch, and returns
`reached: pr-updated` with the updated URL. A closed or merged pull request, a
moved branch or base, or more than one cited delivery opens a new pull request
instead, and the result's `followUp.notice` says why. The binding is
checkpointed, so a resumed delivery never re-decides it. Re-running Deliver for
the original change afterwards still returns its pull request as reused: a head
at a commit that a recorded follow-up delivery built on the original commit
counts, and the result's `followedUpBy` names those changes. Any other head,
even one descending from the delivered commit, still fails verification.
Multi-repository deliveries do not bind follow-ups yet.

Before committing, Deliver verifies staged Git blobs against the retained Land
projection. Before publishing, it verifies the actual commit tree again, including
resumed commits and changes made by Git hooks. Changed bytes, file modes, missing
files, or additional paths block publication rather than inheriting old proof.
Drift inside the unpublished delivery workspace (an interrupted attempt or a
stray edit) is Harness-owned: Deliver rebuilds that workspace once from the Land
projection and resumes. Only drift that survives the rebuild, such as a commit
hook rewriting staged files, asks the user to fix the hook and retry or leave the
work archived. It fetches the proposed remote PR base on each unfinished attempt
and requires that base to contain the proven Land base. Target content, HEAD, or
PR-base drift asks the user to restore the proven content and retry Deliver, or
leave the work archived; it never asks for a new change. Independent sibling repositories
receive their own PRs; only declared submodules produce root gitlink updates.

Delivery protocol 2 binds file modes to Land and archive evidence. Legacy changes
without mode evidence stay archived and cannot use automatic Deliver. The agent
can review the current diff for separately authorized Git publication, or leave
the work archived; a no-op follow-up Change is not a migration route. Current
modes are never substituted for missing proof. Valid dangling symlinks retain
their link text. Built-in Git text/binary
conversion (including CRLF/LF) is bound to the proven bytes and verified as Git
objects; a changed conversion configuration stops with a retry route. Custom
clean filters (including LFS) and working-tree encodings currently return an
explicit unsupported-conversion boundary before staging, without executing the
filter. Keep those project settings intact and choose separately reviewed Git
publication or leave the work archived. For an interrupted supported conversion,
restore the bound configuration to resume.
Effective push URLs, including rewrites and multiple destinations, must all
identify the approved repository. They are checkpoint-bound and rechecked before
push. Multi-repository Deliver validates all selected projections and destinations
before the first publication. The live remote default branch and the selected
PR base are both protected.

The PR body has one core contract—Summary, Why, Related Work, Type, included and
excluded Scope, Test and Evidence, Risk, Rollback, and Monitoring—plus the
applicable Frontend, Backend, Bug, Refactor/Technical Debt, Database/Migration,
Infrastructure/DevOps, Performance, or Security/Hotfix sections. Deliver reuses
content-bound proof receipts and archived OpenSpec sources. It may collect only
read-only presentation evidence; it never invents evidence or changes code. A
missing optional presentation artifact produces a draft according to project
policy, while missing or stale required evidence blocks Deliver without
changing the already-archived lifecycle result.

Success requires provider read-back proving that the open PR's base, head, and
commit match the delivery receipt. The final user-facing result is the verified
PR URL. Decisions remain with the user, semantic implementation and bounded
narrative work with the agent, and deterministic Git/provider orchestration,
retry, and recovery with the Harness.
