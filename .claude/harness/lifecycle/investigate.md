# `/investigate <problem>`

Part of the Change Loop lifecycle contract; the overview, ownership, blocking policy, and cross-cutting rules are in [WORKFLOW.md](../../../WORKFLOW.md).


Use Investigate only when the problem or direction is unclear. It is bounded
and read-only with respect to product code. `investigate --template` defines a
v2 record retaining requirements and conversation context as well as facts.
Use `purpose: change` for feature, improvement, or bug feasibility and
`research` for facts-only exploration; v1 records and bindings remain supported.
The agent summarizes the user's intended outcome, retains every material
requirement, example, constraint, exception, non-goal, answer, and correction
after each meaningful conversation update, and starts independent research
without waiting for a blanket confirmation. Explicit instructions need no
repeat approval. User intent cites retained conversation events; code facts
cite repository sources. Missing history is disclosed, never fabricated.
Requirement content changes use new revisions and explicit retirement;
unrelated requirements, previous events, answers, and completed experimental
results survive resume. Invalid history edits retain the last validated intake.
The row shapes live in the [runtime record contract](../../../.claude/harness/README.md#investigation-intake-records).

Questions may be open-ended and name their dependent work. The typed action
exposes pending questions and independent work, which the agent continues
while asking for material meaning. Only work depending on an unanswered
material choice waits; record/source/report repairs remain with their agent
or harness owner. Nonmaterial open questions can travel as disclosed context,
and a material question that depends only on them is still asked; one blocked
by another unanswered material question returns an agent repair to answer,
defer, or unlink that dependency.
Material proposals are not user agreement, and silence confirms nothing.
Experiments name their question, requirement revisions, criteria, findings,
and limitations; only affected results need review after requirements change.

The same template defines a versioned fact, hypothesis, option, decision,
and conclusion record. Running
`investigate <record.json>` discovers and hashes repository sources, persists a
machine-owned resumable state with compact metrics, and returns one typed
agent, user, or harness action. Discovered sources are acknowledged
automatically and stay hashed for freshness; facts and options must cite an
inventoried source, and discoveries no fact cites are listed in the report.
Open decisions derive `conclusion.status: needs-user-decision`; a settled
record with `changeIntent` concludes as `ready-for-change` in the same run, and
explicit legacy statuses stay accepted. Three unchanged attempts expose a
no-progress boundary without discarding the exact resume route: it reaches the
user only when the repeated action was a user question, a sandbox or discovery
failure goes to the harness, and any other stall returns to the agent.

Each inspection also generates `openspec/investigations/<id>.report.md` from the
validated state: conclusion, recommendation/reasons, facts and source links,
hypotheses, comparisons, unknowns, decisions, and next action. A hypothesis may
name `experimentKeys`; each must resolve to a current experiment (a superseded
one returns an agent repair naming its replacement), and the unknowns list
shows every open hypothesis's next check or that none is planned. The agent writes
record content in the user's language and returns a short summary with the
current report link. `language: "th"` selects Thai headings; English is the
fallback. JSON stdout and handoff remain machine-readable. Generated reports
are excluded from investigation source binding, and authored `<id>.md` notes
are preserved. A report failure preserves research and returns a regeneration
route with no current report or handoff advertised; the persisted state records
that route, never `DONE`. Reporting never starts Change.

When the project has `openspec/lessons.md` (durable lessons linked to records in
`openspec/incidents/`), investigation and change intake add it to their
grounding seed sources, so the agent reads project lessons first; editing it
while a change is in flight returns the usual `refresh-source-coverage` EDIT.
This file is unrelated to `cloop lessons`, which groups recurring
blocker and review codes.

Set the optional `activeChange` field to an existing change ID when the question
arises during Build or Prove. The harness then reads the active isolated root
and binds its workspace identity and base into state and handoff. If that
sandbox is missing, stale, or unreadable, the first run returns a harness-owned
repair (`repair-harness`) with the same record command; the record itself is
not blamed. Omitting the field preserves standalone Investigate behavior
against the project root.

A comparison is a record with `mode: "compare"`: three to five options, each
with findings, trade-offs, and sources, and, once concluded, a `selection`
naming the chosen option, its reason, and why each other option was rejected.
Under `/investigate <decision> --compare`, the agent may write disposable
alternatives only at the `prototypePaths` such a record declares under
`.foundation/prototypes/<id>/`. Prototype artifacts are never evidence; the
selected one can bind the change's UI through `prototypeSelection`
([visual check](change.md#prototype-bound-visual-check)).

A `ready-for-change` result emits a digest-bound handoff. The agent binds it
in the semantic draft (v4 or later) as `"investigation": "<id>"` (the harness
fills the handoff from the current state; a full copied binding is still
accepted); Change verifies the state and source
digests before compiling and retains the conclusion in the agreement. V2 also
binds retained intent and requires `investigationCoverage` linking each active
material user requirement to an actual requirement/scenario, non-goal, or design
decision. Revise and amend preserve that mapping. The compiled packet retains
examples, answers, corrections, experimental limitations, and provenance.
The agent checks meaning after compilation: reference validity alone is not
semantic completeness. Missing coverage is agent-owned repair, not another
approval request; existing spec approval before Build remains unchanged.
