# `/change <intent>`

Part of the Change Loop lifecycle contract; the overview, ownership, blocking policy, and cross-cutting rules are in [WORKFLOW.md](../../../WORKFLOW.md).


Change authors one semantic draft (draft v5 for new work; v4 JSON remains
accepted) with compact bookkeeping and enough
behavioral detail to understand scope and acceptance without chat history.
Reconcile the relevant available conversation, latest corrections, and retained
decisions before drafting, then check their coverage in the compiled packet.
Use diagrams and affected folder mapping when boundaries, flow, or structure
need explanation; preserve that context for Build and session restart.
Agent-authored document prose follows the user's requested document language,
or the language of their current request; machine syntax and canonical
identities stay stable. See the [Change authoring workflow](../../../.claude/skills/change/references/workflow.md)
for the detail, language, and compiled-packet inspection rules.
The transactional compiler creates
`openspec/changes/<id>/`, assigns stable cross-ledger IDs, validates the complete
agreement, and installs it. `change start` creates no sandbox: the first
`advance` creates the isolated workspace and moves the change from `change` to
`building`. The draft records:

- optional discovery coverage (required for high impact or typed risk), ambiguity, impact, coupling, and size;
- semantic requirements and task outcomes, rendered for people: one case per
  scenario with a short name, optional GIVEN/AND lines, and a titled overview
  per capability;
- claim-to-task coverage and required evidence capabilities;
- semantic security and review triggers;
- typed extensions only when the change needs them.

## Draft v5 folder and outline

A draft v5 is a folder, started with `cloop change start <folder>`
(`new --draft` accepts it too). `change.json` declares `version: 5` and holds every typed field;
`proposal.md` and `design.md` hold the author's prose under `## ` headings from
the outline, in English or Thai. One versioned outline contract
(`validation/outline-contract.mjs`) fixes every section's document, order,
owner, feeding fields, and condition, so a section renders once in one place.
The compiler keeps authored prose byte-for-byte and merges it with the derived
sections in outline order. One EDIT names, per file, a missing `change.json`, a
heading the outline does not have (with the accepted headings), a heading the
harness derives (such as Change, Capabilities, Acceptance traceability,
Definition of done, Work type, File map, Test map), a heading out of outline order
(with the right order), an empty section, and a section containing `TODO` or
`TBD`. v5 passes the same semantic intake gate and discovery coverage as v4.
`nfr` and `observability` live only in `change.json`; the harness derives
grounding's NFR and observability rows from them. `revise` and `amend` of a v5
change keep the folder's prose; an amendment may replace one authored outline
section of `proposal.md` or `design.md` in place (`sections: [{document, key,
body | value}]`), and a section key the outline does not have is refused with
the packet unchanged. Volatile data (status, approvers, evidence freshness,
review record) never renders in the packet before Land, because the approval
identity covers every packet file; read it with `cloop changes`.

Proposal order: header, Summary, Why, User stories, Success criteria, Scope,
Capabilities (derived, more than one capability), Impact and risk, Decisions to
ratify and open questions, Decision log, Communication/support/release note, How
to verify, Acceptance traceability and Definition of done (derived), then the
appendices (Investigation, Discovery coverage, Derived by the harness,
Provenance, Amendment history; Review record and Compliance change record only
at archive). Design order: Overview, Current state, Domain language,
Assumptions, Work type (derived), Architecture, Tenancy, User flow, Runtime
behavior, Domain model and modules, the contract sections (API, event and job,
data model and migration, UI, config, integration), the work-type sections
(public interface, migration plan, performance analysis, dependency change,
deprecation plan, infrastructure plan, privacy assessment, experiment design,
client release plan, model card, bugfix analysis, refactor invariants),
Decisions, Quality attributes, Threat model, Failure matrix, Observability and
usage, Compatibility and rollout, Capacity and cost, Backup and recovery, Test
strategy, Dependencies, Risks, then the derived File map and Test map. Only
sections whose fields are present render. Every new typed field is also
optional in draft v4. Field shapes and one example block per
work type are in `change start --template` (`workTypeExamples`,
`draftFolderV5`); the harness guide lists the field modules.

## Work types and required sections

`workType` takes any of: feature, bugfix, refactor, api, library, ui, data,
migration, async, integration, config, performance, dependency, deprecation,
infra, observability, privacy, experiment, client-release, ml, data-fix,
security, cicd, docs, test, chore. Undeclared, it is inferred from task paths. A declared `workType` must
include the type its typed signals require: `integrations` or `riskSignals`
`external-integration` require `integration`, and `performance-slo` requires
`performance`; otherwise intake returns an `EDIT` naming the missing type.
Prose is never read for this. Light work (docs, test,
chore) owes only a summary. Every other type owes a failure matrix, except
behavior-neutral work (refactor, config, dependency, docs, test, chore), which
tells its failure story in its own section. Each type adds:

| Work type | Required sections |
|---|---|
| feature | userFlow |
| bugfix | bugfix (`variant: security` adds `bugfix.disclosure`; `hotfix` adds `bugfix.incident`, `bugfix.backport`) |
| refactor | refactor, componentMap |
| api | apiContracts, boundaries |
| library | libraryContract |
| ui | userFlow, uiStates (or `ui`), componentMap |
| data | dataModel |
| migration | migrationPlan, rollout |
| async | jobContract (or `eventContracts`), diagrams |
| integration | integrations |
| config | configContract |
| performance | nfr, performanceAnalysis |
| dependency | dependencyChange |
| deprecation | deprecationPlan |
| infra | infraPlan, rollout |
| observability | observability |
| privacy | privacyAssessment, threatModel |
| experiment | experimentDesign, rollout |
| client-release | releasePlan |
| ml | modelCard |
| data-fix | dataFix |
| security | threatModel, hardening |
| cicd | pipelinePlan |

User-visible work (feature, api, library, ui, deprecation, client-release) also
owes a `releaseNote`. A missing section is one agent EDIT naming the field's
shape and an example, never a user question.

A hotfix also owes a regression for its incident: at least one scenario must set
`regressionOf` to `bugfix.incident.link`, in a requirement with an executable
capability (anything beyond `review`, `acceptance`, or `semantic-acceptance`
alone; the default `test` qualifies). Otherwise `change start` returns an agent
EDIT naming the missing regression. The created change records
`regressionRequired: true`, and `change revise` enforces the rule only for a
change carrying that marker, so a hotfix created before the upgrade is never
blocked. The compiled spec shows the scenario's incident ("Regression of:
<link>"); evidence claims and protocol pins are unchanged. Other bugfix variants
are unaffected.

`data-fix` is a one-off change to production data (`dataFix`: scope, snapshot,
dryRun, rerunSafe, rollback); `security` is hardening with no single bug to
reproduce (`threatModel` plus `hardening`: weakness, control, verification);
`cicd` is a change to a pipeline or build definition (`pipelinePlan`: changes,
permissions, blastRadius, rollback), and is inferred from `.github/workflows/`,
`.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml`, and `.circleci/`. A
pipeline file is `cicd` only, never also `config`. `ml`, `experiment`, and `infra` also
require `modelCard.evaluation`, `experimentDesign.guardrails` and `stopRules`, and
`infraPlan.costDelta`, the fields that used to be advice.

**Every required answer can be given truthfully.** Each field of `dataFix`,
`hardening`, and `pipelinePlan`, and the added `modelCard.evaluation`,
`experimentDesign` `guardrails` and `stopRules`, and `infraPlan.costDelta`, may
be answered `none: <reason>` or `unknown: <reason>` (Thai `ไม่มี:` or `ไม่ทราบ:`)
when the fact does not exist or is not yet known, and that counts as present;
the approval page shows the word and the reason. A bare
`none` or `unknown` with no reason is one agent EDIT asking for the reason.
These rules apply to a draft being started or revised only: a change already
started or approved, `advance`, and `change amend` are never blocked by them, and
none of them asks the user a question or stops Prove or Land. A change at risk
level High or Critical must also say how to undo it: `scratch.undo`, an
existing rollback field (`rollout.rollback`, `dataModel` rollback rows,
`migrationPlan.rollbackWindow`, `dependencyChange` pins, `dataFix.rollback`,
`pipelinePlan.rollback`), or `none: <reason>` when it cannot be undone. At
`change start`, a touched path that points at a risk the draft neither declares
nor covers in discovery (a migration file with no `persisted-data-change`
coverage, for example) prints one advisory `NOTE: path risk` and never blocks. Work types also select Build
skills and evidence capabilities (below and in
[EVIDENCE.md](../../../.claude/harness/EVIDENCE.md)).

## Decisions

A decision may carry `status` (`proposed`, `accepted`, `superseded`; absent
means accepted), `drivers`, `options` with pros and cons, `confirmation`,
`supersedes`, `durable`, and `requirements`. A proposed decision renders only in
the proposal's Decisions to ratify section, so the user ratifies or changes it
with approval; `design.md` records accepted and superseded decisions. An
accepted `durable: true` decision adds a `Rationale` line under each
requirement it names, so the reason survives archive into the living spec; an
unknown requirement key is an agent EDIT. An unknown task field (for example
`depends`) is an advisory warning naming the likely field (`dependsOn`); it
never blocks.

Rapid changes contain `proposal.md`, `tasks.md`, `evidence.yaml`, and a concise
delta `specs/<capability>/spec.md` (one SHALL statement and its scenarios per
requirement, rendered exactly as in standard), which Land merges into
`openspec/specs` like any other delta; only a legacy rapid packet or declared
docs-only work (`workType: ["docs"]` adding requirements, such as README
wording) declares `skip_specs` and has none, so prose never becomes a living
system requirement; its claims still bind evidence. A delta for a capability with no living spec states a
`## Purpose` (the capability overview, else the intent) that archive carries
into the new spec instead of OpenSpec's TBD placeholder; an existing spec's
Purpose is never replaced. A minimal draft's derived names stay short: the
capability is a top-level `capability` or the intent's noun phrase (such as
`kanban-board`), a requirement key is at most five whole words, and its
heading is the readable SHALL clause. A rapid proposal omits Why when the draft states no
reason, and lists recorded `decisions` (defaults the agent chose without
asking, `decidedBy: agent`) under Decisions. Every packet is a dev document
and each fact has one home. Every proposal, rapid or standard, opens with a
harness-rendered header (change id, lane and why, owner, created date, status
via `cloop changes`; an unknown owner reads `unassigned`) and
states Scope (in scope: the behavior each requirement adds; out of scope:
the task `paths` allow-list, unselected repositories, or the authored
`nonGoals`, and never an empty section), an acceptance traceability table
(requirement, scenario claim and kind, task, evidence, test files; ids and
paths only, scenario text stays in `specs/`), and a definition of done
generated from the policy that is enforced: fresh evidence for every claim,
changed tests that fail on the original code (behavior-changing work only),
the review route, user acceptance when required, Land to `archived` (never a
commit), and the optional one-line `successMeasure` (else the scenarios
passing). `change start` prints one advisory coverage NOTE (no failure scenario,
no edge scenario, no success measure) that never asks the agent for anything.
Tasks and their checks live only in `tasks.md`; the proposal no longer carries
a Plan, What changes, or Folder tree, and `design.md` renders the derived
folder tree inside its File map. A rapid proposal, which has no `design.md`,
also carries the compact form (summary, user flow, failure matrix, and any
authored descriptive section: file map, test map,
component map, config contract, refactor, bugfix) and its Decisions. Changes
agreed before this layout keep their Plan, What changes, and Folder tree
and read, resume, and archive unchanged. Descriptive sections never move a
low-risk draft to standard; impact, coupling, security triggers, review, and
acceptance still do. A standard v4 or v5 change
always has `design.md`, and its draft must author the sections its work type
needs ([work types and required sections](#work-types-and-required-sections)); the harness infers
the work type from task paths (stated in `design.md`; declare `workType` to
override; test-, docs-, or manifest-only paths are light work) and derives the
file map and test map (scenario and check command). Flowchart node
labels holding `(`, `)`, or `"` must be quoted (`A["mean(values)"]`).
Each fact is written once: without an authored `failureMatrix`, scenarios with
`kind: "failure"` become its rows (an optional scenario `recovery` fills the
recovery column; with no explicit kind anywhere, scenarios that state a
rejection or error count), the intent stands in for an absent `why`, and omitted
evidence capabilities default to `test` (`static-analysis` for docs/chore) in
either lane unless the draft declares security triggers. The proposal lists
each value the harness filled under "Derived by harness", and `change start`
prints one NOTE; authored values are never replaced. One EDIT lists every
remaining issue (compiler, dev document, start checks, repository and verify
paths). A missing section is an agent draft repair, never a user question. `execution.yaml`, `repositories.yaml`, `handoffs.yaml`,
and `grounding.yaml` appear only when execution differs from detected defaults,
multiple repositories participate, external authority is required, or a
non-derived material decision must be recorded. Absence has versioned
virtual-default semantics.

The packet is written for a human reviewer first. After the rendered header,
`proposal.md` carries its summary, user stories, scope, acceptance traceability,
and definition of done; a capability index is omitted for a single capability.
Discovery coverage and investigation provenance close it as appendices. `design.md`
records every settled intake answer as a durable decision (context, choice,
rejected options, decided by), adds an optional overview diagram, assumptions,
open questions, the user flow, a component map, and the derived file and test
maps. The folder tree lives inside the File map; task outcomes, verify commands,
and dependencies live only in `tasks.md`. It fills the
file map's task column from task `[paths:]` and omits sections the change
leaves empty. When a task names a `repository`, the folder tree is one titled
tree per repository and the file map gains a Repo column; a path is marked
`+` when it is missing at that repository's own base, and stays `~` when the
repository's root cannot be resolved. A change with no named repository renders
unchanged. While any open question remains, an approval request returns those
questions as one `ASK_USER` decision instead of recording consent; the agent
asks them, records the answers, and asks for approval again.

Before compilation, the harness requires every risk-derived discovery dimension
to be covered, marked not applicable with a rationale, investigated, or resolved
by the user. It validates decision dependencies and exposes only the current
frontier; the agent interprets sources and authors requirements, while the user
owns consequential choices. After compilation, the OpenSpec packet is the
source of truth. The semantic draft is temporary and `.foundation/` is derived
coordination state. Draft v4 compiles unchanged (new optional fields only add
sections). Drafts v1-v3 were retired in 3.7; a draft declaring any other
version returns an EDIT naming the accepted versions 4 and 5.

`change start <draft.json>` inspects before compilation (`--inspect` only
inspects). Inspection returns one typed `EDIT`, `ASK_USER`, or `DONE` action
with an exact resume route. Its `EDIT` batch also names, as agent repairs, a
task `verify` that references a test file which neither exists nor falls inside
any task's `paths`, and an `apiContracts` error listed without a status or code.
For behavior-changing work (any work type except refactor, config, dependency,
docs, test, or chore) the batch also names a task with product `paths` whose
`verify` runs no test (only a no-op such as `true` or `echo`, or only lint,
format, or typecheck commands), and every scenario that names no test file. A
scenario binds through a `testMap` row whose `scenario` is its name, key, or
claim id, or through a test path in a task that covers its requirement; a
scenario marked `regression: true` (or `regressionOf`) guards existing
behavior. `change revise` and `change amend` (added requirements and added or
verify-changing tasks) apply the same checks. The compiled binding is stored on
the change, and Prove judges test discrimination per bound test file
([EVIDENCE.md § Tests that fail without the change](../../../.claude/harness/EVIDENCE.md#tests-that-fail-without-the-change)).
When `openspec/repositories.yaml` (or `.gitmodules`) declares repositories
besides root, nested or trusted `../` siblings, `change start --template` lists
them with the `repositories` selection and per-task `repository`, and the batch
names a task that edits files in a read repository, a root task whose paths or verify
reach into a declared repository (the harness does not rebind it: moving a task
changes where its paths resolve and where verify runs, so the agent rewrites
them), a repository task whose paths are written from the control root, a task
repository the draft does not select, and a verify that `cd`s (or `-C`,
`--prefix`, `--cwd`) into another repository or outside its own; verify runs
from the task repository root. An advisory, never a block, names a known runner
whose default output Prove cannot count (bare `go test`). An
unresolved user-owned coverage row must link to its decisions through
`decisionKeys`; once every linked decision is resolved, the harness treats the
row as covered by those decisions, so recording an answer needs no further
coverage edit. Repository-owned investigation is returned before user
questions. At `DONE` the same call compiles atomically; `--consume-draft` also
removes the draft.
Typed `riskSignals` provide language-neutral triggers for access control,
persisted data, integrations, performance SLOs, UI accessibility, operational
risk, external side effects, financial effects, and input domains
(`input-domain` requires `input-boundary` coverage of the adjacent input
partitions; `financial` requires `timeout-retry-idempotency` and
`recoverability`). A draft declaring `access-control` tags at least one
scenario `access: allow` and one `access: deny`; a missing side or another
value returns an agent `EDIT`, and a deny scenario derives
`permission-rejection` coverage. Prose is never scanned for either decision.
Optional `constraints` (non-empty strings) render as a proposal Constraints
section and are `{kind: constraint}` investigation coverage targets; optional
`fixes` names archived change ids (an `openspec/changes/archive/<date>-<id>`
directory) that this change corrects, is kept on the change, and feeds the
`outcomes` escaped-defect count. Optional `enforces` names recurring lesson
codes from `lessons` that this change adds a check for; at least one task must
change a file that is not prose (Markdown or text), or the agent gets an
`EDIT` that names the check to add or `judgment: <why>` instead.
Inspection persists one machine-owned snapshot bound to the draft and its
grounded-source digests. Before each v4 or v5 inspection the harness performs bounded,
read-only repository discovery and ranks relevant specs, tests, callers,
integrations, persistence, and permission boundaries. Typed size, impact,
coupling, risk, and repository signals choose the intake depth without dropping
mandatory dimensions. Enumeration has fixed hard safety limits; adaptive limits
bound only the selected read-set and question frontier. Questions already answered by source facts, duplicate
alternatives, and unsupported recommendations are rejected. Git-aware discovery
omits ignored output; an oversized undeclared file is reported but cannot poison
the whole scan, and unsupported dependency languages are reported as partial
graph coverage. The harness records the source digest itself;
`discovery.sourceDigest` is optional, and a correct draft completes intake on
its first inspect. Source facts and recommendation evidence must match the
selected inventory. Discovery coverage is optional for an ordinary change;
`impact: high`, `riskSignals`, security triggers, integrations, and external
operations require their mapped dimensions. A required dimension the draft
already states is derived as a `covered` row marked derived in the proposal
appendix: current behavior from `currentState`, affected actor from
`userStories`, desired behavior from requirements, success, failure, and input
boundary from scenario `kind` (`success`, `failure`, `boundary`; failures also
from `failureMatrix`, boundaries also from `apiContracts` with request and
errors), compatibility and non-goals from their fields, verification when every
requirement has a verifying task and evidence, data migration and rollback from
every `dataModel` entry, integration contract from documented `integrations`,
timeout/retry/idempotency from integration concerns or a complete
`jobContract`, and accessibility from `uiStates`. Without backing content the
dimension stays missing; an authored row always wins, so a
`needs-user-decision` row is still asked. Prose is never scanned for risk
keywords, a modified requirement does not imply migration or rollback coverage,
and a risk-derived `not-applicable` row needs only a rationale. Design and
reader-guide warnings are advisory, and small rapid-lane drafts get no
missing-section prompts; sections the agent writes are always checked.
Compact effectiveness counts survive successful compilation in runtime;
conversation context is retained in a bound investigation record when present,
without a separate Change interview ledger. A
changed selected source invalidates readiness and returns agent-owned coverage refresh.

For newly started changes, present the compiled spec, scope, and acceptance
criteria and wait for explicit user approval before Build, including `/dev`.
When the request itself already approves the spec, in any wording (for example
"I approve the spec" in a `/dev` request), that is the approval, as is a reply
such as "ลุยเลย" to the approval question; silence and urgency never are
([authority from the user's words](../../../WORKFLOW.md#authority-from-the-users-words)).
Record it with `advance <change> --approve-spec --decision-ref <ref>` (alias of
`change resolve <change> --approve-spec`); add `--through <target>` to continue
in the same call. The same `--approve-spec --decision-ref <ref> [--through
<target>]` flags on `change start`, `change revise`, or `change amend` record the
approval in the call that applies the approving answer; a call that stops at an
intake action approves nothing. The approval binds the agreement, not provider
wiring: editing a provider's command, timeout, env, or a service in
`execution.yaml` or `evidence.yaml` reruns that provider's evidence but keeps
the approval, while adding or removing a provider or changing any claim needs
approval again. Design open questions print with the approval
packet so the user answers them with the approval. The normal agent path uses only
`change start <draft>`, which inspects and starts a complete draft in one call,
`advance`, and `changes`: `advance` wires detected evidence, synchronizes the
sandbox, runs agent-runnable configured reviewers, and ticks a handed-off task
in `tasks.md` when its verify passes (a failed check returns
`verificationFailures`). Every REPAIR carries a command or instruction, so the
agent never reads harness source to recover. `/dev` runs `/investigate` (only for an unknown cause or
feasibility) → `/change` → `/build` → `/prove` → `/land` → `/deliver` up to
the user's target, exactly as the separate commands: shared agent rules live only in `.claude/harness/AGENT.md`, each phase
command is the single source for its phase, and the full Change, intake, and
Build references load only on their triggers. A minimal draft (`intent`,
`requirements[{description, scenarios[{when, then}]}]`,
`tasks[{outcome, verify, paths}]`, no `version`) is expanded by the compiler.
Every EDIT or REPAIR lists `contextFiles` (absolute paths to open), `newFiles`
(declared paths to create), and `contextScope`. A session Build EDIT may also
carry optional `skills`: at most four skill names chosen only from the change's
work types, risk signals, and security triggers (never prose), limited to skills
installed under `.claude/skills/`, with a matching load instruction as the
first instruction; absent when none applies. Each EDIT task with a verify
also carries `checkCommand`, that verify run through `cloop exec
<change> --task <id>`, which the installed allowlist already permits. Each EDIT task carries its own
`workspace`: a non-root repository's task names
`.foundation/repository-sandboxes/<change>/<repository>`, never the shared
sandbox's path for that submodule, and the top-level `workspace` (plus a
`workspaces` map by repository) is that sandbox whenever every task shares it.
The `tasks.md` in `contextFiles` is the isolated ledger the harness ticks. When
the handed work depends on finished tasks, or other repositories hold finished
tasks, the EDIT lists them in `completed` (`id`, `repository`, `workspace`).
`cloop exec <change> --repo <id>` (or `--task <id>`) runs a check in
that same sandbox; without either, the caller's directory or a single pending
task repository selects it, and nothing runs in the main checkout. Unauthorized external work enters
`handoffs.yaml` only through a semantic amendment, and grounding reads belong in
the draft's `grounding` field.
Runtime approval binds agreement content and revision; task checkboxes and
task `[paths:]` write scope are bookkeeping and do not invalidate it. The user
approves a change once: a later `change revise` or `change amend` that only adds
or revises requirements carries the current approval to the new revision and
packet, with an audit row (`approvalCarries`), and needs no second approval. A
revision or amendment that removes a requirement, or one of a change that was
never approved, still waits for approval. During Build agreement edits go through
`change amend`, and a hand-edited isolated packet is agent-owned drift repair. Legacy
primitive-created/in-flight changes retain their compatibility route.

<a id="approval-package-preview-and-role-lanes"></a>

## Approval page, approval data, and role lanes

The approval question names the **approval page**,
`.foundation/previews/<change>/prototype.html`, which the agent (when asked) or
the user writes by hand and the draft names as its `prototype` example. No
skill ships for it, and `change start`, `advance`, and `package` write no HTML
and no `.foundation/packages/` file (an older package stays readable, not
updated). With no page yet the question gives the four `scratch` lines as text
and never blocks; a Thai draft calls the page `หน้าอนุมัติ`.

`package <change> [--pretty]` prints the change's data as JSON and writes no
file. The scratch router derives from `workType`, `riskSignals`, `impact`,
`coupling`, `integrations`, and `securityTriggers`: a risk level (Critical when
`impact` is high with `financial` or `access-control`; High when `impact` is
high or a weight-3 signal is declared; Medium for any other signal or medium
impact; Low otherwise), up to 28 technical domains, and approval artifacts per
approver role, deduplicated across domains. Every change shows its change
impact and test map; Low shows nothing else, and runnable artifacts appear only
from High upward. A `proof` label requires a valid passing receipt; other
artifacts are `preview` or `none`. The data also carries the `scratch` lines
with undo and who, scope counts (`null`, never 0, when unknown), failure
scenarios with recovery only when stated, required-section status, approval
and missing `approval.roles` lanes, and suggested previews; unreadable evidence
becomes a `warnings` entry.

**What the page must show.** `prototype.checklist` lists the surfaces the change
owes, inferred only from its work types and typed draft fields, each with its
source field and whether the draft specifies it. Each of the 26 catalog work
types owes at least one surface plus before and after, and types that can fail
owe failure cases with recovery; a test fails when a work type is added without
a row. The `prototype` example may declare `covers` (the surfaces the page
shows); each surface reads `covered`, `missing`, `unknown` (no `covers`), or
`none` (no prototype), and a `covers` key outside the change's surfaces is an
intake `EDIT`. `covers` is the agent's claim, never evidence: Prove and Land
never read it, and `change start` only prints an advisory `NOTE: prototype`.

**Keeping the page honest.** Risk level, proof count, and role lanes come only
from the harness's computation, never from the page. At `change start`,
`revise`, and `amend` the harness records the page digest and a `factsDigest`;
`package` and the approval question warn, never block, on `drift` (edited after
the recorded revision), `factsStale` (current `factsDigest` absent), or
`factsChanged`. The page is one file with no network request and no decision
controls (the chat reply is the decision), in the draft's language, keyboard
usable without relying on colour alone, labelled as not proof: a header, the
harness facts copied verbatim with the `factsDigest`, the prototype as the main
view, the checklist, before and after, the path, failures with recovery, undo
and who, and reviewer details closed by default. A host design canvas may hold
one numbered frame per screen or state, but the file is always exported. When
the page is edited the agent revises or amends the change in the same turn.

`preview <change> --provider <name>` is optional at every risk level and never
blocks approval or Build. Before Build only, it copies the target into
`.foundation/previews/<change>/workspace` and runs one declared provider there,
recording a `kind: "preview"` receipt bound to the contract revision;
`package` marks it stale after a revision. A provider marked `external: true`
reaches outside the machine and runs only with the user's `--decision-ref` for
that run (otherwise `PREVIEW_AUTHORITY_REQUIRED`, and nothing runs). Preview
receipts never satisfy Prove or Land ([evidence](../../../.claude/harness/EVIDENCE.md)).
For a High or Critical change `package` suggests the matching provider and
its command, or names the capability to declare. A provider with
`"previewOnly": true` exists only for previews: Prove never selects it, so it
needs only an `adapter` and a `command`. A provider's `previewArtifact` names a
file inside the preview workspace, such as a prototype or screenshot; the
preview keeps a copy under `.foundation/previews/<change>/artifacts/` and
`package` lists it. A path outside the workspace is refused before anything
runs. `package` also reports each preview's status, and for a change already
applied or archived it labels proof from the receipts Land accepted.

The router also reads the paths the change's tasks touch. A migration, schema,
or `.sql` path, an auth or permission path, a payment or billing path, a UI
component path, an infrastructure path, or a webhook path adds the matching
risk signal when the draft did not declare it, and `package` names the path
that raised it. Path signals affect only the risk level, domains, artifacts,
and approval lanes; discovery coverage and review still follow the declared
signals. A `dataModel` whose every row declares `store: "browser"` (for
example `localStorage`) skips the Data Migration domain and does not count
`persisted-data-change` as heavy, unless a task path still looks like a
migration. Reporting needs a `report` or `search` example, or data and UI work
without an API, a feature, or stored-data change. `access-control` also routes
the Security domain and its threat model.

The draft carries two fields for approvers. `scratch` holds four plain
lines (`get`, `asIs`, `toBe`, `ifFail`, each at most 240 characters) that the
approval page shows first, and two optional lines of the same shape, `undo` (how to
undo the change) and `who` (who it affects), which are never required. It is required when the draft declares `impact` medium or
high: `change start` and `change revise` return an intake `EDIT` naming each
missing `scratch.<key>`. A low draft may omit it, and the approval page then shows the
intent with a warning that the summary is missing. The rule applies to a draft
being started or revised only; `advance`, `change amend`, and a change already
started or approved are never blocked by it. `examples`, which stays optional, holds typed blocks with real values from the
request, code, or data, one of 29 types (`prototype`, `examples`, `api`,
`timeline`, `dataDiff`, `lineage`, `mermaid`, `failures`, `permission`, `plan`,
`snapshot`, `repro`, `perf`, `golden`, `adr`, `rollout`, `apiDiff`, `strings`,
`alert`, `privacy`, `coverage`, `consumers`, `messages`, `terminal`, `doc`,
`pipeline`, `search`, `report`, `diffSummary`); an unknown type or a missing
required field is an intake `EDIT` naming the path. The harness validates these
blocks and renders none of them; the skill may draw them on the page. A
`prototype` names the page file the skill wrote under
`.foundation/previews/<change>/`, a relative path without `..`, and may declare
`covers`. `change start` prints `NOTE: scratch (advisory, approval page)` for a
medium or high draft without examples, a performance change without a target
number, or a defect, migration, or deprecation without a count in `scratch.asIs`;
that note never blocks (the missing-`scratch` rule above is the only blocking
check).

With `approval.roles` set in `foundation.json`, spec approval has one lane per
configured role the router selects for the change. Each role records
`advance <change> --approve-spec --role <role> --decision-ref <ref>`; until
every required lane approved this revision and packet, the approval does not
exist and `advance` asks for the missing roles. An approval without `--role`
covers every lane required when it is given, a later `--role` approval adds its
lane without revoking it, and without `approval.roles` the single approval is
unchanged. The harness records the role as stated and does not verify identity.
Lane approvals carry across additive revisions and amendments under the same
rule as the whole approval, and the required lanes are routed again: a role the
revision newly selects must approve before Build. Removing a requirement resets
every lane. A malformed `approval` block or non-array `roles` is refused.

## Revising, amending, and abandoning a change

To change an agreement that has not started Build, revise it in place instead
of abandoning it and writing a new draft:

```bash
cloop change revise <change> <draft.json>
```

The revised semantic draft keeps the change id (a different `id` is refused)
and passes the same intake gate as `change start`, under its own snapshot: the
call inspects first, revises only at `DONE`, and otherwise prints the intake
action and changes nothing. `--inspect` only inspects; `--consume-draft` also
removes the draft. With `--merge` the file is a partial draft applied to the
draft the change was compiled from; a patch that changes `version` (for example
v4 to v5) is refused and needs a whole-draft revision. Objects merge, `null` deletes a key, and an
entry in a list keyed by `key` (or `dimension`, or `name`) merges into the
entry with the identity it names (any of those fields every listed entry
has), `"$remove": true` drops it (an unmatched `$remove` is an error), and
other entries are appended; any other list is replaced. Removing a requirement drops its evidence
entry and task coverage. A change started before partial revision, or one an
amendment changed after its draft was recorded, needs the whole draft instead. The transaction
recompiles the whole packet, increments the contract revision, and restores the
prior packet and runtime state byte-for-byte on any failure. It is refused once
the change has a Build workspace, a receipt, or a completed task, and in
`proven`, `landing`, or `archived` status; the refusal names the amendment or
successor-change route.

Every revision or amendment reports its requirement delta (`added`, `revised`,
`removed` keys). A carried approval prints it as covered by the current
approval. Otherwise the delta waits for the next approval, and unapproved deltas
fold together: a key added and then removed disappears, and a key added and then
revised stays added. Present only that delta for approval; `change resolve
--approve-spec` prints the approved delta and clears it, while approval still
binds the whole agreement.

Referenced diagrams, prototype selections, and local integration documentation
must resolve to regular files inside the project. Remote integration sources
must use HTTPS and a fixed version rather than `latest`, a branch, or another
floating alias. An amendment may extend a task's claim coverage, but changing
its outcome requires a new task so completed work cannot silently change
meaning. A completed task's verify command (or paths, or `dependsOn`) changes
only with `reopen: true` on its `updateTasks` row (`--reopen` on the direct
form below): the task is unticked, its claims are invalidated, and it counts as
done again only after the new command passes; a changed check never keeps a
completed status.

An amendment withdraws unfinished tasks with `removeTasks: ["<key-or-id>"]`
(needing no requirement, evidence, or intake on its own). A completed or proven
task is refused, as is a task another remaining task depends on unless that
dependent is removed too or its `updateTasks` row sets `dependsOn`, and a
removal that would leave a claim with no task unless `updateTasks` `covers`
moves it or `removeRequirements` retires it. The removed lines leave
`tasks.md`, their claims are invalidated, derived provider commands follow the
remaining verify commands, the amendment record keeps what each removed task
promised, and a removed id is never reused.

An amendment never adds a second provider for a capability the agreement
already proves: added claims join the one provider serving that capability (or
the one in the same repository), and an author-written command stays as
written. When several providers serve the capability and none matches, the
amendment is refused and names them; declare which provider proves the new
claims in the change's execution providers, then amend again. The `AMENDED`
output lists waivers bound to the earlier contract revision, which no longer
apply; record each again only with a new user decision.

When the final AI review delta failed and the amendment changes the contract,
deterministic review closure needs an approved decision revision for the new
contract. `AMENDED` then prints `decision required:` with the route, and
`advance` returns the same command in its `ASK_USER` result: `change resolve
<change> --reopen-grounding --decision-ref <ref> --reopen-reason <why>` for a
grounding change, or `advance <change> --approve-spec --decision-ref <ref>`
otherwise. A waiver does not satisfy this gate. Only the agreement moves the
contract fingerprint this gate compares: the review budget a user grants with
`authority extend-review` is authority, not agreement, so granting the wave
never makes that wave itself a contract change.

User authority binds the agreement's content, never the revision counter.
Harness bookkeeping that moves `contractRevision` without changing the packet
bytes the user approved (a grounding reopen and the validate that re-locks it,
a sandbox sync, an authority grant) carries the spec approval, its lanes,
revision-bound waivers, and the compiled draft to the new revision with an
`approvalCarries` audit row; task leases bind the contract fingerprint for the
same reason. Changed content still asks again. An amendment records the
identity of the packet it left and a snapshot under
`.foundation/agreement-amended/<change>/<revision>/`; the isolated packet
matching the latest amendment is the agreement at every later gate, whatever
bookkeeping moved the revision since, and `advance --approve-spec` records
consent on it instead of restoring the target packet over it.

An unfinished task (unchecked, with no valid passing command receipt for its
claims) may change its verify command, and optionally `paths`, through an
amendment with only `updateTasks: [{key, verify, paths?}]` rows. It needs no
requirement, evidence, or version-4 intake; `change amend --template` prints
it. The agent may make that correction directly, without amendment JSON or a
new approval: `change amend <change> --task <task-key|task-id> --verify
<command> [--reopen] [--reason <text>]` (`--reopen` for a completed task).
Derived provider commands follow the new verify,
the task's claims are invalidated so Prove reruns their evidence, and the
revision, validation, and rollback match any amendment. Claims, capabilities,
and the spec approval do not change; a command that always passes (`true`,
`echo`, `|| true`, `; true`) is refused by a best-effort text screen; the prior command is kept in the amendment
record; and the harness accepts the task only after the corrected command
passes in the workspace.

When Build discovers new behavior, or the user adds requirements to a `proven`
candidate before Land starts, amend the same agreement before continuing:

```bash
cloop change amend <change> <amendment.json>
```

A successful amendment of a `proven` candidate returns it to `building` and
discards the old proof-advance checkpoint. Completed tasks and unaffected,
identity-valid receipts remain reusable; added work and invalidated checks run
before a new proof is finalized. A rejected amendment leaves the prior state
and evidence intact. Revision-bound Land grants become stale. Amendments are
refused once Land starts, including applied and archive recovery states; recover
the delivery and use a successor change.

An amendment may add (`addRequirements`), revise (`reviseRequirements`, the
full replacement row for an existing key), or remove (`removeRequirements`,
each with a `migration`) requirements; a key may appear in only one of them. A
revised requirement replaces its spec block and claims in place and needs an
open task, so add one with `addTasks` when only completed work covers it. It
keeps its capability and operation; moving a requirement is a removal plus an
addition. A
removal deletes the block, retires its claims from evidence, tasks, and
provider bindings, records the migration in the proposal, and is refused if a
task would be left without coverage unless `updateTasks` moves it. Only the
claims and providers bound to added, revised, or removed claims are
invalidated; removals are planned from the pre-amendment claims.

`addTasks` may also stand alone when each new task covers a requirement the
agreement already has, such as a dedicated check script; it needs no
requirement, evidence, or version-4 intake, and the covered claims are proven
again with the new task. A refused `updateTasks` row names why its task counts
as completed: ticked in the agreement's `tasks.md`, or its claims already have
a passing command receipt.

A version-4 amendment includes discovery coverage for every added or revised
requirement. The call inspects first and amends only at `DONE`; otherwise it
prints the typed intake action and changes nothing. `--inspect` only inspects;
`--consume-amendment` also removes the amendment file. The returned proof command
is the exact post-amendment recovery route. The transaction validates and
appends that delta to the compiled proposal.
During Build, the amended packet stays in the isolated workspace until Land.
Once that revision is approved (or carries the approval), `advance` resumes from this packet without
importing the older target agreement. `sandbox sync` can replay code onto a moved
base while preserving the amended packet, approval, and contract revision. The
packet is copied and verified in staging before replacing the worktree; an
interrupted replacement retains a verified recovery checkpoint. Restoring that
checkpoint records the base already incorporated in staging, including when the
target has moved again. The aggregate proof is invalidated separately; retained
provider receipts and exact spec approval are rechecked, not silently renewed.

If the target packet changed, Build and sync return an agreement conflict
(`amended-agreement-conflict`). The agent compares both packets and asks for
the intended merge or retained agreement, then records the answer with the
`advance <change> --decision merge|retain|pause` command the chosen option
carries, which performs the resolving sync. This explicitly accepts the
current target packet as the baseline that Land may replace; it does not copy
the target over the amendment. Unknown or stale baselines are never
silently refreshed, and later target edits still block Apply. Code conflicts
continue to use their existing replay or copy-path resolution routes.
Version-3 amendments keep their compatibility shape. The amendment transaction
preserves an unaffected passing receipt only across one explicit revision when
its declared provider, claims, and input fingerprints remain exact. Everything
affected, missing, or ambiguous is rerun through the returned Prove route.

A change that cannot be proven is retired explicitly, never deleted by hand:

```bash
cloop change abandon <change> --reason <reason> --decision-ref <ref>
```

Abandon releases leases, cleans up isolation, and moves the packet, runtime
state, receipts, evidence, transactions, plans, handoffs, logs, review requests,
reviewer reports, instruction manifests, the open attestation challenge, and any
delivery record to `.foundation/recovery/abandoned/<id>/` with an audit record,
so a later change reusing the id starts with a fresh review budget, its own
task attribution, no inherited attestation, and no stale delivery state. A
delivery record is kept there, never deleted; abandon does not close a pull
request it opened. The global attestation nonce ledger, investigation
prototypes, and content-addressed intake state are not per-change and stay. If
an older abandon or a Land undo left such bookkeeping behind, creating a change
with that id moves it into the newest retirement record; other leftover change
state still refuses the id. Abandon requires a real user decision, never
touches Git, refuses archived changes, and asks whether to keep or revert
already-applied files before acting.

Abandon removes only what the change owns: its sandboxes, its own `.foundation`
records and packet (quarantined, never deleted; an earlier quarantine of the same
id is set aside, not replaced), and, only with `--applied revert`, the target
paths its own apply journal recorded writing. It never deletes a target file the
change did not declare and apply. Before a sandbox is removed, any commit the
target repository cannot reach and any sandbox byte the target does not hold are
written to `.foundation/backups/<id>/<timestamp>/<sandbox>/` (`commits.bundle`,
`changes.patch` against the sandbox base, verbatim `files/`, and a
`manifest.json` naming the restore commands); abandon prints each backup path. A
sandbox whose content cannot be inspected, or whose backup cannot be written, is
kept.

<a id="product-handoff"></a>

## Product handoff coverage

Work that a product manager or designer handed over as documents names them in
the draft so nothing in scope is dropped:

```json
"productHandoff": { "prd": "docs/PRD.md", "uxui": "design/uxui.md",
  "scope": ["F-04"], "excluded": [{ "id": "US-07", "reason": "next change" }] }
```

`prd` is a `PRD.md` in the `prd` skill's template; `uxui` is a `uxui.md` from
the `ux-design` skill; both must be regular files inside the project. `scope`
is `"all"` or feature IDs: a feature owes every ID its Feature Mapping row
names, the acceptance criteria of those stories, and the open questions that
mention them; with `uxui`, every Screen Inventory screen of those features owes
each of its states. Intake returns an agent `EDIT` naming every owed item the
draft does not cite in its place:

| PRD item | Cited in |
|---|---|
| `US-nn` story | a requirement's description or outcome, or `userStories` |
| `AC-nn` criterion | a scenario's name, given, when, or then, so it becomes a bound test |
| `BR-nn` rule | a requirement or a scenario |
| `F-nn` feature | a requirement or a task |
| `NFR-nn` | an `nfr` row, a requirement, or a scenario |
| `ERR-nn` | a `"kind": "failure"` scenario or a `failureMatrix` row |
| `ADR-nn`, `Qn` | a decision (open questions may also stay in `openQuestions`) |
| `DEP-nn` | a `dependencies` row, a decision, or a requirement |
| `DATA-nn` | a `dataModel` row or a requirement |
| `PERM-nn` (PRD), `UP-nn` (uxui) | a scenario, so who may and may not becomes a test |
| `MC-nn` microcopy | a scenario or `uiStates` row citing the ID or using its exact text |
| glossary term the owed items use | a `domainLanguage` row |
| screen state | a `uiStates` row for that screen with that state |

An item outside this change goes in `excluded` with its reason; excluding a
story excludes the criteria written only for it, and an exclusion that is not
owed is an `EDIT`. The proposal's "Handoff coverage" section lists every owed
item under the PRD headings with where the change covers it or why it is
excluded, so the approver sees the handoff whole.

The documents need not follow the `prd` or `ux-design` templates. An ID is
read wherever a line, table row, list item, bold run, or heading starts with
it; its prefix names its kind. A feature's items come from a mapping row, from
naming the feature in their own row, or from sitting under the feature's
heading; a criterion's stories come from `AC-03 (US-04)`, its own row, or its
story heading. The glossary and screen table are found by section name. A
document whose items carry no such IDs (none, or the project's own codes) is
converted with the import step first.

Product documents are found within four levels of the project, outside tool,
harness, and dot-folders and `openspec/`: `PRD.md`, `uxui.md`, `*.prd.md`, and
`*.uxui.md` by name, and any other Markdown file (not a template, example, or
sample) whose content defines at least three stories, criteria, rules, or
features of two kinds, or two uxui permission or microcopy rows. In such a
project every new draft
must declare `productHandoff`, or `{ "none": "<why this change is not from
them>" }`; a handed-over change always uses the standard packet. The packet
records each document's digest and the IDs it owes in `handoff.json`.
Validation, which Build, Prove, and every amendment run, then stops when a
document changed after the agreement was compiled, or when an owed ID left the
contract (stories, criteria, rules, features, and permissions must stay in the
specs or tasks). An amendment that carries the same `productHandoff` re-reads
the documents; the amended agreement must cite the new owed IDs or exclude
them. Every amendment rebuilds the proposal's coverage table from the record
and the amended packet, so it names where each owed item is now cited.
`cloop product status` reads every packet's record and shows each item of the
documents as not started, in a change, proven, or archived, so an item no
change picked up stays visible; `--strict` fails while one is left. A document in another shape is converted with the `prd` or `ux-design`
skill's import step first; the PRD's Definition of Done is project-level and
not owed by a single change.

<a id="prototype-bound-visual-check"></a>

## Prototype-bound visual check

A selected prototype can bind the UI a change delivers. The draft's
`prototypeSelection` names the file (`reference`, a regular file inside the
project, for example an investigation prototype under
`.foundation/prototypes/<id>/` or an HTML page or artifact the agent saved into
the project), the requirement keys it shows (`covers`), and a `mode`: `strict`
(the default) or `advisory`. Optional `excludes` lists prototype elements the
agreement does not adopt, each with its reason (`"BETA banner: legal forbids
it"`): design.md shows them for approval, the builder sees them beside the
copy, and the visual reviewer never asks for them and reports one the real UI
shows as a blocker. Use it whenever the issue or the user rejects part of the
picture, instead of leaving it to a drift decision. A `covers` key that names
no requirement, another mode, or an empty exclusion is an intake `EDIT`. The compiler copies the file into the packet
as `openspec/changes/<id>/prototype/<name>` and writes `prototype/binding.json`
with its digest, mode, requirements, and the claims and tasks those requirements
reach. Save an artifact or pasted HTML into the project before naming it; use
`advisory` when the user says the prototype is only a guide. Wire the
screenshot provider (capability `browser`, with an `inputMode`) and the
`visual` provider in the draft's `execution` `{"version": 1, "providers": {...}}`
(an authored `execution` without a test provider keeps the one derived from
the task verifies, so leave test out),
in `change.json` or in `execution.yaml` beside it, never both
([evidence](../../../.claude/harness/EVIDENCE.md#visual)). A `strict` selection
without a visual provider that has `screenshots` and depends on an existing
screenshot provider is an intake `EDIT` carrying that wiring, so the gap
surfaces at Change rather than as an `inconclusive` Prove; `change start
--template` shows the same shape. Because spec approval binds every packet byte, editing the copy after
approval needs approval again; a revision without a prototype removes it. A
copy that no longer matches its bound digest, or is missing, never drops the
check: `visual` stays required and its provider reports the drift with its
recovery (restore the copy, or `change revise` before Build).

- **Build.** An `EDIT` for a task that covers a bound requirement, and a
  `REPAIR` touching a bound claim, lists the copy in `contextFiles`. It is a
  read-only reference: it never enters the task's write scope.
- **Prove.** In `strict` mode every bound claim requires the `visual`
  capability. The harness-owned `visual` provider gives an agent reviewer the
  prototype and the screenshots the project's browser or Playwright provider
  produced, and records a receipt listing each difference by screen, what
  differs, and severity. The reviewer also receives the approved scenario of
  each bound claim and the exclusions; where the agreement and the picture
  disagree, the agreement wins. No screenshot is `inconclusive`, never a pass. The
  receipt binds the prototype and screenshots as inputs, so an unchanged pair
  is reused without asking the reviewer again ([evidence](../../../.claude/harness/EVIDENCE.md#visual)).
  In `advisory` mode the provider reports differences but `visual` is not
  required and never decides `proven`; its differences are listed in the Prove
  outcome and the Land report as advisory, not passing evidence, and an
  advisory provider that throws or lacks a dependency is recorded as `error` or
  `skipped` with its reason without stopping proof. Without a prototype nothing
  is added.
- **Repair budget.** Blocker and major differences become a repair batch, at
  most two rounds. This is the one exception to repair without a fixed cycle
  ceiling. Minor differences are reported and never repaired automatically.
  After two rounds the remaining differences are recorded as visual drift and
  every other gate keeps running and repairing; drift does not stop them. A
  difference the agreement forbids is not the agent's to apply: resuming a
  visual batch without editing records the drift at once instead of reissuing
  the same batch. Several visual providers share one round per Prove pass and
  one two-round budget.
- **Decision.** When every other gate is done and drift remains, `advance`
  asks once, as a product-meaning decision of kind `visual-drift`: repair more
  (two further rounds, recorded with the user's decision reference), accept the
  differences, amend the agreement, or pause. Accepting records a `visual` waiver with its reason, decision
  reference, and the accepted differences; proof and the Land report show the
  mismatch as accepted by the user, never as a pass. The waiver is bound to the
  workspace, so a later UI change makes it stale and the check runs again.
  Amending invalidates the affected `visual` receipts.

The prototype itself is still never evidence: it is the reference the real UI
is compared against.

## Follow-up requests during an active Change

Treat a new user instruction as a product decision, not as a request for the
user to maintain OpenSpec. Before product mutation, the agent compares it with
the approved agreement and owns the resulting amendment, implementation, tests,
and documentation. The harness owns validation, revision state, invalidation,
evidence, recovery, and lifecycle progression. Ask the user only when material
product meaning or a trade-off remains unresolved; never ask them to author
amendment JSON, edit ledgers, or run routine recovery.

| Follow-up | Route |
|---|---|
| Fix the approved color, button position, filter result, validation, API mapping, permission, or failure behavior | Repair in contract; no amendment |
| Choose a new color or location; add a filter, saved search, field, action, responsive state, accessibility outcome, or user-visible copy meaning | Amend before implementation |
| Add or change an API contract, stored-data rule, migration, role, security boundary, performance target, notification, retry, integration, external effect, compatibility, or rollout behavior | Amend before implementation |
| Add a regression test, documentation correction, or internal refactor without changing approved behavior | Implement in contract; no amendment |
| Change a test expectation or public documentation because intended behavior changed | Amend before implementation |
| Request “make it better” or similar wording with materially different valid outcomes | Ask only for the unresolved product choice |
| Add an independently deliverable objective, or request it after archive | Start a successor Change |

A clear instruction supplies the decision input, so do not ask the same question
again. An additive amendment carries the existing approval; only a removal
waits for approval. Report the product delta, not harness commands or machine
inputs. A new outcome
received during Prove returns through amendment and Build before selective proof
resumes. Any relevant product or agreement edit makes the affected proof stale.
A review or acceptance response for a superseded workspace is never recorded;
the harness re-requests that authority bound to the current workspace, spending
no review attempt until dispatch, and `advance` resumes from it.

Several changes may be active at once. Overlapping path or repository scopes
never block Build, Prove, or Land across changes; whichever lands later
synchronizes onto the moved target as above, resolves any double edit, and
re-proves. Only an explicit `[resources:]` token names a resource two changes
cannot use at once; the later change queues behind the holder as a harness
`WAIT` (above) rather than blocking.

Packet artifacts flow from `openspec/changes/<change>/` in the target into the
sandbox. An artifact edited only in the sandbox blocks sync; only `tasks.md`
completion ticks merge back automatically.
