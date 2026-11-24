# Documentation ownership

**Audience:** maintainers and agents changing Change Loop's own documentation.
Moved from `CLAUDE.md`, which keeps a one-paragraph summary and links here.

This file owns repository documentation rules. `AGENTS.md`, `CLAUDE.md`, and
contributor guides link here; do not copy this policy into each file. The author changing a
contract owns its documentation update in the same change. A reviewer checks
meaning and English/Thai parity; automated checks cover structure, links, and
the explicit contracts they test, not every claim's truth.

### File responsibilities

| File or family | Purpose | Update when | Keep elsewhere |
|---|---|---|---|
| `README.md`, `README.th.md` | Product entry, install summary, one first change, reading routes | User entry flow, install command, or release version changes | Protocol details, full configuration, internal command chains, experiment results |
| `AGENTS.md` | Short repository-wide constraints and pointers for coding agents | Working rules or canonical source locations change | Detailed lifecycle and duplicated documentation policy |
| `CLAUDE.md` | Maintainer source map, shipping boundary, development and documentation rules | Repository structure, ownership, or development policy changes | Consumer tutorial and full runtime contract |
| `CONTRIBUTING.md` | Contributor setup, check selection, contribution and DCO process | Dependencies, verification entrypoints, or contribution process change | Complete suite inventory and instructions to commit unfinished work to test it |
| `WORKFLOW.md` | Canonical lifecycle overview, ownership, authority, blocking policy, recovery, invalidation, and cross-cutting contracts | Cross-cutting lifecycle semantics change | Release anecdotes, repository-only dependencies, and one phase's full rules |
| `.claude/harness/lifecycle/<phase>.md` | One phase's full contract (`investigate`, `change`, `build`, `prove`, `land`, `deliver`), linked from WORKFLOW.md | That phase's semantics change | Rules shared by several phases (keep them in WORKFLOW.md) |
| `.claude/harness/README.md` | Runtime structure, operator commands, state locations, troubleshooting | Operator surface or runtime layout changes | A second copy of provider semantics |
| `.claude/harness/EVIDENCE.md` | Canonical provider, receipt, proof, and reviewer semantics | Evidence or review contracts change | Product onboarding and historical benchmark claims |
| `.claude/harness/CONSUMER-QUALITY.md` | Installed consumer quality operation and policy | Quality discovery, enforcement, or reports change | Repository-only performance experiments |
| `.claude/tests/README.md` | Check selection, suite ownership, fixtures, execution controls | Suite registration, ownership, or runner behavior changes | Another lifecycle specification |
| `RELEASING.md` | Release preparation, verification, publication and recovery procedure | Release machinery or authority requirements change | A claim that an old candidate proves the current source |
| `CHANGELOG.md`, `docs/changelog-history.md` | Release notes from 3.6.0 on (`[Unreleased]` is the release workflow's input); notes for 3.5.30 and earlier, unchanged | Every user-visible change adds to `[Unreleased]`; the history file changes only to fix a link | Design rationale and investigation detail |
| `docs/feature-map.json`, `docs/feature-map.md` | User-facing features tied to their commands, user states, runtime groups, code, tests, and docs; the page is rendered from the JSON | A user-facing command, slash command, user state, or runtime group is added, renamed, moved, or removed | Lifecycle semantics (keep them in `WORKFLOW.md`) and user term definitions (keep them in the glossary) |
| `docs/reports/README.md` | Index of current operating documents and dated evidence | A report is added or a document's current/historical status changes | Full report content or user tutorials |
| `docs/reports/user-scenario-release-status.md` | Current release assurance and known gaps | New candidate or release evidence is available | Fabricated pass, cost, or completion claims |
| `docs/reports/user-scenario-test-plan.md` | Scenario portfolio and acceptance requirements | Scenario scope or acceptance contract changes | Results presented as requirements |
| Other `docs/reports/*.md` | Dated observation, proposal, or implementation record with explicit status | New evidence needs a new record; corrections must be labeled | Silent rewriting of historical results as current facts |
| `website/docs/src/content/docs/index.md` and `th/index.md` | Product orientation and routes into the guides | Product positioning or navigation changes | Internal skill inventories and migration history |
| `website/docs/src/content/docs/quickstart.md` and `th/quickstart.md` | One task from intent through archive, with expected outcomes | The first-change journey changes | Advanced configuration and low-level recovery recipes |
| Other `website/docs/src/content/docs/**/*.md` | Task-specific explanations derived from canonical contracts; every page has an EN/TH counterpart | Its documented command, configuration, or behavior changes | Independent definitions that contradict the canonical contract |
| `website/docs/astro.config.mjs` | Navigation and locale routing | Pages are added, moved, or regrouped | Links to nonexistent or untranslated pages |
| `openspec/changes/**` | Change-specific agreement and implementation ledger | That change is approved, amended, implemented, or archived | General product manuals or a second implementation ledger |
| `openspec/investigations/**` | Source-bound findings and unresolved questions | Investigation evidence or the question changes | Treating recommendations as approved implementation |
| `REVIEW.md` | Advisory review passes, severity, nit cap, exclusions for reviewers of this repository | Review expectations change | Pass/fail semantics (owned by `EVIDENCE.md`) |
| `openspec/incidents/**` | One record per defect that reached a user, `main`, or a release candidate, with its owner decision | An incident is detected, decided, fixed, or corrected | Rewriting closed records; secrets or consumer source |
| `openspec/lessons.md` | Durable one-line lessons read before investigating, each linked to its incident | An incident's fix lands | Incident narrative or a second rule set that contradicts shipped rules |

For other documentation, identify its reader, purpose, canonical source, and
update trigger before adding it. Extend the nearest family above or add a row
only when its responsibility differs. Do not create a new guide merely to
repeat an existing one.

Website page responsibilities below apply to both the English path under
`website/docs/src/content/docs/` and its `th/` counterpart:

| Page | Reader's question | Source to check when updating |
|---|---|---|
| `install.md` | How do I install, prepare a host, or upgrade? | Installer/CLI behavior and host adapters |
| `loop.md`, `loop/*.md` | What happens in each lifecycle step? | The matching `.claude/harness/lifecycle/<phase>.md` |
| `artifacts.md` | What files appear, who owns them, and what may I edit? | `install.sh` ownership and the harness README's state inventory |
| `foundation-config.md` | What policy can I configure? | Runtime config validation/defaults and `foundation.json` |
| `multi-repository.md` | How do I scope and deliver across repositories? | `WORKFLOW.md` repository safety and harness repository execution |
| `approval.md` | Which decisions and permissions are mine? | `WORKFLOW.md` authority, review, acceptance, and external-operation contracts |
| `consumer-quality.md` | How do I enable and operate optional quality checks? | `.claude/harness/CONSUMER-QUALITY.md` |
| `evidence/claims.md` | How does a promised behavior become a check? | `.claude/harness/EVIDENCE.md` claim/capability contracts |
| `evidence/adapters.md` | How do I connect project tools? | `.claude/harness/EVIDENCE.md` and the runtime provider catalog |
| `evidence/receipts.md` | What does a result mean and when is it stale? | `.claude/harness/EVIDENCE.md` receipt and freshness contracts |
| `cli.md` | Which commands and protocol versions are supported? | `.claude/harness/commands.json`, `protocol.json`, and operator reference |

### Editing and review rules

1. Change the canonical contract first, then only the summaries and examples
   affected by it. If code and contract disagree, report and resolve the mismatch;
   copying the current code's behavior into prose is not sufficient validation.
2. Keep each root README at **300 lines or fewer** and each website quickstart
   at **160 lines or fewer**, excluding blank lines and compatibility anchors.
   These are reading budgets, not correctness scores. Move detail to the existing
   reference instead of compressing paragraphs into unreadable long lines.
3. Keep English and Thai pages aligned in behavior, authority, examples, and
   next steps in the same change. Preserve command names and identifiers;
   translate explanations naturally. File pairing alone does not prove parity.
4. Link to the canonical section for details. Preserve existing public anchors
   or redirects when moving sections, and repair inbound links when moving files.
5. Examples must use supported commands and state what the reader should see.
   Keep routine agent-owned commands out of the user's required action list.
6. Distinguish intended behavior, executed evidence, and historical observation.
   A report states its source/version, environment, and verification limits;
   unknown measurements stay unknown. Never refresh a date to imply revalidation.
7. Run the docs consistency suite for documentation changes and build the website
   when its pages or navigation change. Inspect changed pages for readability;
   passing checks do not establish semantic accuracy or usability.
8. Label every website page with one `docs-audience` category: `users`,
   `project-maintainers`, or `agents-integrators`, and a visible reader note.
   English and Thai counterparts use the same category. Audience describes who
   reads the page, not who owns or writes the files it discusses. The harness
   ownership reference owns that separate contract. Never describe generated
   records as disposable or project-owned packets as freely hand-editable.

The documentation guardrails run inside
`.claude/tests/docs/run-doc-consistency.sh`, which is already in the default gate.
They check reading budgets, bilingual page presence, and local links in the
repository entry guides. Existing checks cover protocol pins, public commands,
selected lifecycle semantics, and sidebar locales. Use focused checks while
editing; the full-suite policy under Verification commands remains unchanged.
