---
title: /change
description: Compile one semantic draft into a validated OpenSpec agreement.
---

<!-- docs-audience: agents-integrators -->
**Audience:** coding agents and integration operators. CLI commands and schemas below are system reference, not a user checklist. Users can follow [Quickstart](/docs/quickstart/).

**In plain words:** Change turns what you want into a written agreement before
any code is written. You describe the outcome in your own words; the agent reads
the code and drafts the agreement (what will behave differently, how each promise
will be checked, which files may change); the harness validates it and creates
the change folder `openspec/changes/<id>/`. You get a proposal to read and
approve. Nothing is built until you do.

## What you do

1. **Say what you want**, including constraints and things you do not want.
2. **Answer questions only you can answer.** The agent asks at most three linked
   decisions at a time, and never asks about things it can read from the code.
3. **Read the approval summary** (see [Approval](/docs/approval/)) and approve in
   your own words, for example "go ahead". Silence or urgency alone is not
   approval.
4. **Change your mind early.** Before Build, the agent revises the same change; an
   additive revision keeps your approval, and removing agreed behavior asks you
   again. After Build starts, new behavior goes through one amendment.

Next step: `advance <change> --through build` (the agent runs it).

## What the agent compiles

Everything below is for agents and integrators. You never write these files by hand.

```text
/change <intent | existing-change> [--prototype-selection <path>]
```

`/change` turns intent into the durable agreement that every later phase reads.
The agent interprets sources and writes one semantic draft; Change Loop derives
the required discovery dimensions, validates the decision frontier, generates
the bookkeeping, and installs the result transactionally.

## Minimal draft

For an ordinary change, the agent writes only the intent, the work type, the
behavior, and the tasks. `change start --template` prints this form first as
`minimalDraft`, preceded by a `save` field: the agent writes a draft v5 folder,
`.foundation/drafts/<id>/` (see below), with its Write tool, because the host
refuses a shell heredoc and `.foundation/drafts/` is a pre-allowed path. Then it
runs `cloop change start .foundation/drafts/<id>`. `change.json`
declares `version: 5` and `workType`, which selects the required sections;
`proposal.md` holds the reason as prose:

```json
{
  "version": 5,
  "language": "en",
  "intent": "Reject empty note titles",
  "workType": ["bugfix"],
  "requirements": [{
    "description": "The system SHALL reject a note whose title is empty",
    "scenarios": [{ "when": "a user submits an empty title", "then": "the note is not created" }]
  }],
  "tasks": [{ "outcome": "Validate note titles", "verify": "npm test", "paths": ["src/note.js"] }]
}
```

A one-file JSON draft without `version`, `.foundation/drafts/<id>.json`, still
starts as draft v4 with the same defaults.

The compiler fills in everything else: version, stable requirement and task
keys, the capability (an explicit `capability`, else the matching existing spec,
else one `EDIT` listing the choices), the operation (`modified` when a canonical
requirement matches), readable requirement and scenario titles, `covers` (one
`EDIT` when several tasks and requirements make it ambiguous), rapid defaults,
and test evidence from `verify`. Add `decisions: [{ "key", "choice", "reason"? }]`
for each default chosen without asking; they are listed as `decidedBy: agent`.
A draft that declares risk uses the full form below.

## The full semantic draft

The full core stays small:

```json
{
  "version": 4,
  "intent": "Prevent orphaned rows from blocking mutations",
  "impact": "medium",
  "coupling": "isolated",
  "requirements": [{
    "key": "orphan-row-does-not-lock",
    "capability": "mutation-control",
    "operation": "added",
    "description": "The mutation guard SHALL ignore phase rows of inactive changes.",
    "outcome": "Unrelated mutations remain available",
    "scenarios": [{
      "name": "Orphaned row",
      "kind": "success",
      "given": "a phase row belongs to an archived change",
      "when": "another change edits a product file",
      "then": "the edit is allowed"
    }]
  }],
  "tasks": [{
    "key": "filter-orphan-rows",
    "outcome": "Exclude orphaned rows from active locks",
    "covers": ["orphan-row-does-not-lock"],
    "paths": ["src/**"],
    "verify": "npm test"
  }],
  "evidence": {
    "orphan-row-does-not-lock": { "capabilities": ["test"] }
  },
  "discovery": {
    "coverage": [
      { "dimension": "current-behavior", "status": "covered", "sources": ["src/mutations.js"] },
      { "dimension": "compatibility", "status": "not-applicable", "rationale": "No public contract changes." }
    ],
    "decisions": []
  }
}
```

Discovery coverage is optional for an ordinary change. `impact: high` and typed
risk declarations (`riskSignals`, security triggers, integrations, external
operations) add required dimensions; a dimension the draft already states
(current state, scenarios by `kind`, compatibility, contracts, data model, UI
states, and similar) is derived as covered, and an authored row always wins.
Use `riskSignals` rather than prose keywords; with `access-control`, tag one
scenario `access: allow` and one `access: deny`.

Each scenario is one case: a short `name`, optional `given`, one `when`, one
`then`, optional `and`. A `when` or `then` joined with `;` is refused, and long
requirement statements move constraints into `details`. `language` sets the
document language; `SHALL`, `GIVEN`, `WHEN`, `THEN`, and `AND` stay English for
the OpenSpec parser.

`change start <draft>` inspects, compiles, and starts in one call and lists the
packet files and tasks. Otherwise it returns agent repairs or at most three
linked user decisions with a resume route, and creates nothing; every
independent problem is reported together and a failed compile leaves no partial
change. `--inspect` inspects only; `--consume-draft` removes the draft after a
start. Spec approval is recorded with `advance <change> --approve-spec
--decision-ref <ref>`, or the same flags on `change start`, `revise`, or
`amend`. Full intake rules: `.claude/harness/lifecycle/change.md`.

## Draft v5 folder

New work uses draft v5; v4 JSON drafts remain accepted. A v5 draft is a
folder that `change start <folder>` accepts like a JSON draft:

```text
.foundation/drafts/<id>/
├── change.json   # "version": 5 and every typed field
├── proposal.md   # authored prose under outline headings
└── design.md     # authored prose under outline headings
```

`proposal.md` and `design.md` use only `## ` headings from one versioned
outline, in outline order, in English or Thai. The harness writes the derived
sections itself (Change header, Capabilities, Acceptance traceability,
Definition of done, Work type, File map, Test map) and merges them with your
prose, kept byte for byte, in outline order. The proposal reads from why,
user stories, success criteria, and scope through impact and risk, decisions to
ratify, and how to verify, then appendices; the design reads from current state
and architecture through contracts, work-type sections, decisions, quality,
rollout, and tests. One `EDIT` names any unknown, derived, out-of-order, empty,
or `TODO`/`TBD` section. `change start --template` prints the accepted headings
as `draftFolderV5`. Status, approvers, evidence freshness, and the review
record never render before Land; read them with `cloop changes`.
The full order and rules live in `.claude/harness/lifecycle/change.md` under "Draft v5 folder and
outline".

## Work types

`workType` (declared, or inferred from task paths) selects the design sections a
standard change must carry. A missing one is an agent `EDIT` naming the field's
shape and an example, never a user question. Some examples:

| Work type | Required sections |
|---|---|
| feature | `userFlow` |
| bugfix | `bugfix` |
| api | `apiContracts`, `boundaries` |
| data | `dataModel` |
| migration | `migrationPlan`, `rollout` |
| ui | `userFlow`, `uiStates`, `componentMap` |

An API that calls no other service, queue, or store answers `boundaries` with
`"none: <reason>"` instead of inventing a row.

Docs, test, and chore work owes only a summary; user-visible work also owes a
`releaseNote`. A new hotfix (`bugfix.variant: "hotfix"`) also owes a regression
for its incident: a scenario with `regressionOf` set to `bugfix.incident.link`,
in a requirement that runs an executable check such as `test`. Without it the
agent gets an `EDIT` and repairs the draft; a hotfix created before the upgrade
is not blocked.

Behavior-changing work (every type except refactor, config, dependency, docs,
test, and chore) also binds each scenario to a test file: a `testMap` row whose
`scenario` names it, or a test path in a task that covers its requirement. A
task with product `paths` must `verify` by running tests, not only a no-op,
lint, format, or typecheck command. `change start`, `revise`, and `amend` return
one `EDIT` naming every unbound scenario and test-less task; Prove then checks
each bound file fails on the original code ([/prove](/docs/loop/prove/)). A
scenario marked `regression: true` guards existing behavior and may already
pass. Work types also select evidence capabilities; work type `ui` requires
accessibility, which a built-in static read of the changed markup proves when
the project has no accessibility check of its own. Agents choose
skills themselves from skill descriptions that name `workType`, `riskSignals`,
requirements, and scenarios.
The full catalog of 23 types is in `.claude/harness/lifecycle/change.md` under "Work types and
required sections"; capabilities are in `.claude/harness/EVIDENCE.md` under "Work-type
capabilities".

## Decisions

A decision may carry `status` (`proposed`, `accepted`, `superseded`; absent
means accepted), drivers, options, and the requirements it explains. A proposed
decision appears only under the proposal's Decisions to ratify, so you ratify
or change it with approval; `design.md` records accepted and superseded ones.
An accepted `durable: true` decision adds a `Rationale` line under each named
requirement, so the reason survives archive into the living spec. See
`.claude/harness/lifecycle/change.md` under "Decisions".

## Typed extensions

Add complexity only when the work needs it:

- multiple requirements with separate `capability` and `operation` values
- dev document sections: `summary`, `userFlow` (Mermaid), `failureMatrix`,
  `componentMap`, `apiContracts`, `dataModel`, `uiStates`, `configContract`,
  `jobContract`, `bugfix`, or `refactor`. The harness infers `workType` from
  task paths (declare it to override) and derives the folder tree, file
  map, and test map. A standard change must carry the sections its work type
  needs; a missing one is a draft repair for the agent, never a user question.
  Each fact is written once: `why` satisfies the summary (add `summary` only
  for more), and without an authored `failureMatrix` the scenarios with
  `"kind": "failure"` become its rows, with an optional scenario `recovery`
  for the recovery column.
  A task whose own tests sit outside its `paths` is a design warning
- `decisions` for load-bearing choices, each with its consequences
- Mermaid or referenced SVG/PNG `diagrams`
- `productHandoff` naming the `PRD.md` and `uxui.md` the work came from, with a
  `scope`; intake refuses the draft until every in-scope story, acceptance
  criterion, rule, NFR, error case, decision, and screen state is cited in its
  section or excluded with a reason, and the proposal lists the coverage
- `prototypeSelection` pointing at an existing selection note, with optional
  `excludes` for prototype elements the agreement does not adopt (each with its
  reason), so the visual check never asks for them
- `integrations` with documentation source/version, linked requirements, and
  security/resilience/compatibility concerns; related scenarios explicitly use
  `"kind": "success"` and `"kind": "failure"`
- `repositories` for multi-repository scope, with each task's `repository`; its
  paths and verify are relative to that repository's root, where verify runs
- external operations for permission-bound work
- Grounding v3 for non-derived material decisions

Prototype output is never proof. Missing or unversioned integration
documentation is a research/user-decision boundary, not permission to guess.
For `MODIFIED`, the compiler reads the canonical spec and merges its complete
scenario set before adding or changing scenarios; `REMOVED` requires a
migration consequence. A local diagram, prototype selection, or integration
document must resolve to a regular file inside the project; directories and
symlinks that escape it are refused. A remote integration source must use HTTPS
and a fixed version rather than `latest` or a branch.

## Conditional artifacts and source of truth

Every change has `proposal.md`, `tasks.md`, `evidence.yaml`, and a delta
`specs/<capability>/spec.md` that Land merges into `openspec/specs` (declared
docs-only work skips the delta). The proposal opens with a header, scope, an
acceptance traceability table, and a definition of done generated from the
enforced policy. Tasks live only in `tasks.md`. A standard change also adds
`design.md` with the full dev document; execution, repository, handoff, and
grounding files appear only for real overrides. Quote flowchart labels holding
`(`, `)`, or `"`, as in `A["mean(values)"]`.

Two optional draft fields exist only for the approval page: `scratch` (four
plain lines: `get`, `asIs`, `toBe`, `ifFail`) and `examples` (typed blocks
with real values, such as `api`, `examples`, `dataDiff`, `permission`, or a
`prototype` file under `.foundation/previews/<change>/`). They never change the
lane or the packet, a malformed block is an intake `EDIT`, and `change start`
only advises (`NOTE: scratch`) when a medium or high change has none. See
[Approval page, previews, and role lanes](/docs/approval/#approval-package-previews-and-role-lanes)
for what approvers see; `.claude/harness/lifecycle/change.md` lists all 29 example types.

At archive, Land appends the volatile records to the archived `proposal.md`
only: Appendix: Review record, Appendix: Compliance change record (only when
`openspec/config.yaml` sets `compliance: change-record`), and Appendix: Rollout
gates. It also writes `verification.md` beside the archived proposal: the proof
run Land accepted and one row per receipt with its claims, result, command, and
SHA-256, so the evidence summary travels with Git.

After compilation, `openspec/changes/<id>/` is the source of truth. The draft is
temporary and `.foundation/` is derived runtime state.

## Revising before Build

To change an agreed change before Build starts, revise the same change instead
of abandoning it:

```bash
cloop change revise <change> <draft.json>
```

The revised draft keeps the change id and passes the same intake gate as
`change start` in the same call: an incomplete intake prints its action and
changes nothing. With `--merge` the file holds only the keys and keyed entries
it changes, adds, or removes (`"$remove": true`). The whole packet is recompiled transactionally, the contract
revision increments, and any failure restores the prior packet and runtime
state. Once Build has a workspace, a receipt, or a completed task, the command
routes to `change amend`. The result lists the added, revised, and removed
requirements. An approved change keeps its approval for additive deltas; only
a delta that removes a requirement needs approval.

## Revising during Build

If Build discovers a new or changed observable requirement, use one semantic
amendment. `reviseRequirements` replaces an existing requirement (an open task
must cover it) and `removeRequirements` drops one with a `migration`:

```bash
cloop change amend <change> <amendment.json> --consume-amendment
```

It preserves completed tasks and unrelated prose, increments the revision,
validates, and rolls back on failure. Replacing a task's outcome needs a new
task; a completed task's `verify` changes only with `reopen: true`. To fix an
unfinished task's verify command, send only `updateTasks: [{"key", "verify",
"paths"?}]`. `change amend --template` prints both forms. Passing receipts the
amendment does not affect are kept; affected ones rerun through Prove.

A successful `/change` is already validated and isolated. Continue with
`cloop advance <change> --through build`.
