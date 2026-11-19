# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For 3.5.30 and earlier releases, see [docs/changelog-history.md](docs/changelog-history.md).

## [Unreleased]

### Fixed

- Test discrimination waited the whole ten-minute provider timeout when the
  change's tests failed on the base code but left a server open (paid lane
  `project-tracker-api` on main took 15 minutes instead of 8). A base run is now
  bounded at 120 s (`discriminationTimeoutMs` raises it), and a run stopped at
  that bound whose output already reports a failing test is a fails-on-base
  verdict.
- After `proven`, an agent reworked the change for a non-blocking review
  advisory, which re-opened review and stopped at the review-exhausted user
  question (paid lane 43). `reviewAdvisories` now carries
  `handling: "report-only: ..."` and `/prove` says not to edit for one.
- The built-in accessibility check read test files as pages: a test asserting
  `/<button>Save<\/button>/` was reported as a button without a name. Test
  files and fixtures are no longer judged. Found by paid lane 43, where it cost
  a repair round.
- Prove refused the visual wiring the start template shows ("provider
  'browser' has no declared claims"): a browser provider whose screenshots
  feed the visual review now covers the prototype-bound claims. Found by paid
  lane 43, which then spent every review wave repairing it.
- Test discrimination returned no verdict in every project without Git (the
  copy workspace, and every paid benchmark lane): it now builds the base from
  the copy's baseline and captured base bytes.
- After an amendment, the proposal's handoff coverage table still listed the
  rows the amendment removed; every amendment now rebuilds it.

- The built-in accessibility check read no file in a copied workspace that is
  not a Git repository and passed with "0 changed markup files"; it now walks
  the workspace and compares it with the project copy.
- `cloop outcomes` and the readiness row "Most changes pass proof on the first
  run" counted the finalized proof manifest as a second run, so every change
  proven through `advance` read as a repeat (0% first-proof pass). A run is
  now an execution root that holds provider artifacts, and first-proof pass is
  read from that first execution's exit statuses; re-proving after a later
  amendment no longer counts against it. Change Loop's own store now measures
  82% over 39 archived changes.
- A draft that authors `execution` (for example only the screenshot and
  `visual` providers a prototype needs) keeps the test provider derived from
  its task verifies when it wires none, so Prove no longer asks the user for
  outside test-count (discovery) evidence.
- A required provider now brings the configured providers it `dependsOn`:
  a strict prototype's `visual` provider no longer stops Build with "depends on
  unknown node provider:browser" when no claim declares `browser` itself.

### Changed

- The landing page meets WCAG AA contrast: a darker orange for small labels,
  a slightly deeper orange for the headline accent, and dark text on the
  Install button. Maintainers: `scripts/ui/rendered-check.mjs` checks the
  repository's own pages in Chrome with axe-core.
- Maintainers: paid scenario `interactive-ui-states` (task 44) covers an
  interactive UI with loading, empty, error/retry, and loaded states, a
  validated add form, and phone width, without a prototype or wiring in the
  prompt; its oracle drives the screen in happy-dom. Not yet run.

- Maintainers: no harness runtime file exceeds 800 lines (the lint ratchet's
  ceiling, down from 1,000); `foundation.mjs` keeps only composition, with
  the running command's record in `runtime/composition/operation-state.mjs`.

- The website, docs site, demo, dashboard, and Pi team web UI use one type
  and corner-radius scale (`DESIGN.md`); sizes and radii moved to the nearest
  step, so some text is slightly larger or smaller and 8px labels are now 9px.

- Review packets give the root and contract inspection rows `pathCount` and
  `truncated`, like every other inspection row.

- `duplication` ignores bare name lists (import, export, and dependency
  lists repeat names, not logic).
- `workaround-comments` counts a marker only when it opens the comment or is
  followed by `:` or `(`; a marker named in prose or inside a regular
  expression is no longer a finding.

- `change start --template` states exactly when the approval lines and
  `scratch.undo` are required (the work types, paths, and risk signals the
  harness derives impact and risk from), so a first draft no longer returns for
  them; the repair names the derivation that required them.
- `change start --template` and `change amend --template` print compact JSON
  (about a third smaller); a size-budget test keeps the start template under
  22,000 characters.
- `change start --template` also states one case per scenario line (no `;`)
  and how to name an existing requirement for `operation: "modified"`.
- `boundaries` accepts `"none: <reason>"` for an API that calls no other
  service, queue, or store; a bare `none` asks for the reason.
- `change amend --template` adds a `revisedRequirement` form with its evidence,
  and an amendment without evidence gets the exact `evidence` block to add.

### Added

- Post-release measurement: a PRD's success metrics are `KPI-nn` rows with a
  target; `cloop product measure` records an observed value with its source,
  and `cloop product status` shows each metric met, missed, or unmeasured with
  its value before and after the feature's release. A hotfix's incident is
  shown on the product items it owes. The `prd` checker requires `KPI-nn` in
  section 1.
- `cloop product status` shows every item of the project's PRD and uxui
  documents as not started, in a change, proven, or archived (grouped by
  feature, with deferrals and their reasons), and names changes compiled
  against an earlier revision; `--strict` fails while any item is in no change.
- A built-in running-app check for UI work: work type `ui` now owes
  `browser`, and a web project without a browser provider gets one that starts
  the app (its `dev`/`start`/`serve`/`preview` script, or a static folder with
  `index.html`), opens the home page and the pages it links to in headless
  Chrome at desktop and phone width, and fails on load failures, uncaught
  errors, console errors, failed requests, and phone-width overflow, saving
  screenshots under `test-results/app-smoke/`. Dependency-free (Chrome over its
  debugging pipe); without a servable app or Chrome it stays an advisory.
- Product handoff accepts a PM's own layout: IDs are read wherever a line,
  row, list item, bold run, or heading starts with them, with features and
  stories related by mapping rows, mentions, and heading nesting, and the
  glossary and screen table found by section name; product documents are also
  found by content (a `requirements.md` with stories and criteria), skipping
  templates, examples, and dot-folders.
- Product handoff is enforced end to end: a project with `PRD.md` or
  `uxui.md` makes every new draft declare `productHandoff` (or why not);
  coverage now also owes dependencies (`DEP-nn`), data (`DATA-nn`), PRD and
  uxui permissions (`PERM-nn`, `UP-nn`, as scenarios), microcopy (`MC-nn`),
  and every glossary term the owed items use (in `domainLanguage`); the packet
  records each document's digest and owed IDs in `handoff.json`, and
  validation stops when a document changed after approval or an amendment
  dropped an owed ID. The `prd` skill's `import-check.mjs` proves a document
  converted into the template kept every statement.
- `productHandoff` in the change draft names the `PRD.md` and `uxui.md` a
  change comes from, with a feature scope. Intake refuses the draft until every
  in-scope story, acceptance criterion (as a scenario, so it becomes a test),
  business rule, NFR, error case, ADR, open question, and screen state is cited
  in its section or excluded with a reason; the proposal gains a "Handoff
  coverage" section that lists each item under the PRD headings. The `prd`
  template now gives NFR and error rows IDs (`NFR-nn`, `ERR-nn`) and maps them
  per feature.
- Skill `prd`: writes `PRD.md` in an 18-section template (goal, problem,
  stories, Given/When/Then acceptance, glossary, rules, Mermaid flows,
  functional spec, NFR, ADRs and review rounds, scope, dependencies, data and
  permissions, feature mapping, errors, open questions) with `[Data]` /
  `[Assumption]` labels; `prd-check.mjs` enforces the sections and the links
  between stories, criteria, features, and ADRs, and `prd-html.mjs` renders
  `prd.html` with no dependencies.
- Skill `ux-design`: UX/UI in confirmed phases (brief, `uxui.md`, a
  `design-system.html` with every base component, copyable snippets, and a
  versioned Token Block, then page or feature artifacts with Design QA);
  `uxui-check.mjs` enforces the sections, labels, base components, verbatim
  Token Blocks, and Changelog and Artifact Index entries. `quality readiness`
  counts `uxui.md` as the design document.
- Built-in accessibility check: a project with no accessibility command gets
  a static read of the markup a change touched (images without alt text,
  unlabelled controls, unnamed buttons and links, missing `lang`, positive
  `tabindex`, click handlers without keyboard support), judged on added or
  edited lines only. Work type `ui` now requires `accessibility`, so this check
  gates proof instead of becoming an advisory nobody runs; a UI path changed
  without that work type stays advisory. A project-owned `test:accessibility`
  or `test:a11y` script replaces the built-in. Hand-recorded accessibility
  evidence (a manual audit) now needs `accessibility: {"adapter": "external"}`
  declared in `execution.yaml`.
- `prototypeSelection.excludes` lists prototype elements the agreement does not
  adopt, each with its reason. design.md shows them for approval, Build opens
  them beside the prototype, and the visual reviewer never asks for them and
  reports one the real UI shows as a blocker. The reviewer also receives the
  approved scenario of each bound claim, and the agreement wins where it and
  the picture disagree; before, a forbidden element was judged only from the
  picture.
- `change start --template` shows how to bind a prototype (`prototypeSelection`
  with `excludes`) and the screenshot and `visual` providers it needs, and a
  strict selection without that wiring is a draft issue carrying the snippet,
  instead of an `inconclusive` visual check at Prove.
- `quality readiness` adds five UI rows for a project with a user interface:
  design tokens, an accessibility lint, a rendered browser check, an
  accessibility check on rendered pages, and one `DESIGN.md`; `onboard`
  proposes what each unmet row needs. Projects without a UI see none. The
  tokens row counts color literals written outside a custom-property
  definition in every stylesheet and is met only at zero.
- `quality readiness`: per-layer pyramid readiness of the project (codebase,
  static, verification, prose, review) with the next step for the weakest
  layer; `doctor` shows it as the `pyramid` setup row, `onboard` drafts
  `quality/rule-enforcement.json`, and Change Loop's own scorecard uses the
  same criteria. Unmeasured criteria are never scored.
- Readiness also requires a registry row for every imperative sentence in
  `CLAUDE.md`/`AGENTS.md`, and a regression file that exists for every closed
  incident in `openspec/incidents/`.
- A draft's `enforces` names recurring lesson codes it adds a check for; a
  task must change a file that is not prose, so a lesson cannot be closed by a
  reminder alone.
- Tool-free findings ratchet lanes `workaround-comments` (`TODO`/`FIXME`/`HACK`/`XXX`
  and workaround comments) and `duplication` (copied blocks of at least 8
  significant lines), and `nesting-depth` (files nesting more than 5 levels,
  carrying the depth); discovery adds them to every application profile.
- `lessons` reports each recurring lesson's status (`enforced`, `judgment`,
  `prose-only`, `open`) and a starting draft for the change that adds its
  check; an "Enforced by" cell counts only a project file, `quality:<capability>`,
  or `judgment: <why>`. `doctor` warns (setup row `lessons-enforcement`)
  while a recurring lesson lacks a check.
- The session start digest of an installed project names missing setup (quality
  lanes, findings baseline, feature map) and offers the `onboard` skill once.

- `doctor` lists project setup rows (quality config, findings baselines,
  feature map, lessons, agent guide), each naming its next command and never
  failing `doctor`; `doctor --json` carries them under `setup`.
- `onboard` skill: runs the setup commands `doctor` names, drafts the feature
  map and module boundaries from the code, and asks the user to confirm them
  and to adopt today's findings as the ratchet baseline.

- Consumer findings ratchet: `lint`, `type-check`, `file-size`, and
  `module-boundaries` quality lanes record findings per file and rule against a
  baseline that may only shrink (`foundation-findings-v1`). Discovery adds
  `file-size` to every application profile, `type-check` for TypeScript, and
  `lint` for ESLint; a lane without a baseline passes with reduced assurance
  until `cloop quality baseline --write`.
- `lessons` proposes the strongest workable enforcement for each recurring
  code, the past changes a new check must fail on, and the check already
  named in `openspec/lessons.md`.
- Project feature map: `openspec/feature-map.json` (seeded empty, never
  overwritten) names the project's features and their paths. Intake reads it
  as grounding, `cloop features [--change <id>]` checks it and names the
  features a change touches, and the approval data lists them.

### Changed

- Harness runtime modules under `.claude/harness/runtime/workflow/` now live in
  feature groups (`land/`, `sandbox/`, `delivery/`, `advance/`, `change/`,
  `authority/`, `draft/`, `packet/`, `investigation/`, `prototype/`,
  `repository/`, `transaction/`, `validation/`), and large modules are split
  into focused files. Behavior and public commands are unchanged; the
  installer removes the old paths on upgrade. Code that imported runtime
  modules by path must import from the owning module; only `change-lifecycle`
  and `sandbox-runtime`'s sandbox-setup functions keep their re-exports.
- Timers and deliberately ignored failures go through
  `runtime/core/timing.mjs` and `runtime/core/best-effort.mjs`.

### Added

- Repository checks (not shipped): workflow group layering and no
  re-exports in the architecture suite, `tsc --checkJs` findings in the lint
  ratchet, a 1000-line ceiling for new runtime files, repository hygiene,
  multi-process lock and lease interleaving properties, and a golden for the
  user-facing lifecycle projection.

## [3.7.5] - 2026-11-16

### Changed

- Guards advise instead of refuse. On Pi the adapter runs guards in `auto`
  mode (or the user's `FOUNDATION_GUARDRAIL_MODE`): Land and Deliver without
  explicit consent, edits outside a change, shell shapes, and a background
  `authority run` proceed with a warning on the tool result. In every host,
  an uninstructed main-checkout commit/push during Build or Prove and a
  Deliver outside `/deliver` run with a warning instead of becoming a
  question; `shell-route-guard` and `no-detached-authority` advise unless a
  block mode is set. agent-team starts a worker above the project's
  `maxParallelAgents` with a `warning`; `maxActiveWorkers` still caps.
  Secret redaction is unchanged, and `FOUNDATION_GUARDRAIL_MODE=block`
  restores every refusal.

### Added

- `execution.maxParallelAgents` defaults to 64, matching Pi's
  `maxActiveWorkers`, and accepts 1 to 64; `maxParallelProviders` and
  `maxParallelSetups` keep 1 to 16. Existing `foundation.json` values are
  unchanged.
- Pi guards `background_bash` like bash (secrets, phase, shell route,
  Land/Deliver, detached authority) and starts it in the Build workspace;
  `authority run` through it is refused. Other custom/MCP tools stay outside
  the live boundary but are named once per session while a change phase is
  enforced. Pi now injects the session digest at start and after compaction
  (`sessionDigest: live`), refuses detached `authority run` in bash, and
  warns when `/dev` settles before proof passes.

## [3.7.4] - 2026-11-16

### Added

- Every scenario of behavior-changing work must name the test file that
  proves it (a `testMap` row or a test path in its task), and a product task's
  `verify` must run tests, not only a no-op, lint, format, or typecheck
  command. `change start`, `revise`, and `amend` return one EDIT naming each
  gap. Prove then judges test discrimination per bound test file, so a test
  that passes on the original code cannot hide behind another file that
  fails; `regression: true` scenarios may pass on base, and a bound file that
  does not exist is a repair.
- A base-source check with no verdict (timed out or unavailable) is named in
  the Prove outcome and the Land report instead of passing silently, and a
  repository whose product code changed with no test provider is a repair.
- Land writes `verification.md` beside the archived proposal: the proof run
  Land accepted and one row per receipt (provider, claims, status, observed
  result, command, duration, receipt SHA-256), advisories, and whether a
  review record exists, so the evidence summary travels with Git. Log paths,
  environment values, and `.foundation/` paths are left out, and an
  unreadable receipt is listed as `unavailable`. Land refuses a packet that
  already contains `verification.md`; a resumed Land writes the same file
  once and stops on an edited one, keeping it.

### Changed

- **Breaking:** the CLI is `cloop` only. Homebrew installs `bin/cloop` and no
  longer a `claude-foundation` command; commands, next steps, recovery routes,
  guard messages, Pi, and docs name `cloop`. `init` writes the
  `.foundation/bin/cloop` shim and the `Bash(cloop *)` and
  `Bash(.foundation/bin/cloop *)` allowlist rules (earlier rules stay until you
  remove them). Rerun `cloop init` in projects installed from a source checkout.
  Guards still treat a leftover `claude-foundation` binary as the same CLI, so
  it is never an unguarded route. The Homebrew formula keeps its name
  (`brew upgrade claude-foundation`).
- `WORKFLOW.md` keeps the lifecycle overview, ownership, the blocking policy,
  and the rules shared by every phase (about 5.7k words, from 21.5k). Each
  phase's full contract moved unchanged to
  `.claude/harness/lifecycle/<phase>.md` (`investigate`, `change`, `build`,
  `prove`, `land`, `deliver`), which installs with the harness. The phase
  headings in `WORKFLOW.md` stay, so links such as `WORKFLOW.md#land-change`
  still open a summary that links on.

### Fixed

- A control root that is not a Git repository but gathers many repositories
  (for example a folder of 821 service checkouts) works without workarounds.
  Change intake scans only the declared repositories (narrowed to the draft's
  selection) instead of exhausting the scan limit on the whole folder. The
  root copy sandbox and its manifests skip every nested Git checkout: a
  declared one has its own sandbox, and Land refuses a file written into an
  undeclared one and asks you to declare it. Copying and hashing those
  checkouts had produced a 17 GB root sandbox and a 115 MB runtime state file
  in one such folder.
- A Git root that ignores its gathered checkouts, or tracks them as gitlinks,
  also scans the declared repositories' files at change intake.
- Before a change starts and during Change, the phase guard lets Write and
  Edit create the v5 draft folder (`.foundation/drafts/<id>/`) and
  `openspec/repositories.yaml`, so agents no longer fall back to shell writes
  that bypass the guard. Its refusal names the draft folder route.

## [3.7.3] - 2026-11-16

### Added

- `/dev` now runs from Investigate (only when the cause or feasibility is
  unknown) through Change, Build, Prove, Land, and Deliver, stopping at
  `--through proven|archived|delivered` or the request's words ("ทำจนจบ",
  "เปิด PR"). When the target is unstated, the agent asks with the spec
  approval instead of assuming. `/dev --through delivered` is Deliver
  authority for that `/dev` run's change only, in Claude Code and Pi.
- Pi routes plain-language requests into Change Loop. `investigate <topic>`
  runs `/investigate`, and short requests such as `เปิด PR ให้เลย`,
  `deliver ได้เลย`, or `open a PR` run `/deliver` for the session's change,
  as does `/deliver` without an ID. Questions and refusals are not requests.
- Pi follows the machine's Change Loop. After `brew upgrade`, reopening or
  reloading Pi installs the new runtime through the new
  `claude-foundation host pi-runtime` endpoint; a missing or failing CLI keeps
  the existing runtime and shows a warning. New shared projects follow the
  machine version (`"follow": "machine"` in `.changeloop.json`); projects that
  pin a bundle keep it until `/changeloop follow` (`/changeloop pin` pins again).
- Change Loop works in Pi without per-repository setup. In a trusted
  repository without Change Loop settings, the first `/change`,
  `/investigate`, `/dev`, or `/feature` creates follow-machine settings at the
  project root, reloads Pi, and continues the command. Opening a folder or
  chatting writes nothing; untrusted folders, the home directory, and projects
  with a local installation are refused.

### Changed

- Model-tier routing is on in new installations. The shipped `foundation.json`
  sets `models.routing: true`, so Build tasks use the `fast`, `standard`, or
  `deep` tier by kind and risk. Upgrades keep each project's existing value:
  an explicit `false` is no longer replaced, and a project that never set the
  key gets `false`, the behavior it already had.

### Fixed

- Several changes can run at once. A copy sandbox no longer claims files it
  copied from another session's uncommitted work and never edited: such a
  file is not part of the change's surface, and sandbox sync fast-forwards it
  instead of reporting a conflict. An edited copy still conflicts.
- A Land that stops before applying anything returns the session to the
  prove phase, so the main checkout is no longer held under Land rules for the
  12-hour phase window and a user-instructed `git commit` runs again.
- `change resolve --accept-target-edits` is checked per path and bytes: an
  accepted, unchanged blocking path clears the stop even when other sessions'
  dirty files come and go. A later edit to an accepted path is a new question.
- Pi treats a command as Land only when the Change Loop CLI runs a Land
  subcommand (`claude-foundation` or `foundation.mjs`), so `git add
  openspec/changes/archive/...` and other commands that mention archive run.
- Pi natural Land consent also accepts short affirmatives such as `land ได้`,
  `ลง land ได้`, and `land ได้ครับ`; questions and refusals (`land ได้ไหม`,
  `ยังไม่ต้อง land`, `don't land`) still grant nothing.
- Pi Build shell calls start in the change workspace. Every Pi bash call used
  to start in the project root, so a relative shell write during Build landed
  in the main checkout and Land refused the change. Agent bash calls now start
  in the recorded Build workspace, as Claude Code does after its single `cd`,
  and the phase guard's shell-mutation warning, previously dropped by the Pi
  adapter, is appended to the tool result.
- Pi parallel Build workers. A Pi worker session is separate from its
  coordinator, so the phase guard refused every worker write into the change
  workspace. A worker started with `FOUNDATION_PARENT_SESSION_ID` now resolves
  the coordinating session's phase and may write only inside that workspace.
  Worker sessions refuse `/land`, `/deliver`, and natural Land consent.

### Internal

- Behavior-preserving refactors of the largest runtime files: packet
  rendering, amendment record shaping, sandbox setup, and delta-review scope
  now live in their own modules (`draft-packet-render.mjs`,
  `amendment-record.mjs`, `sandbox-setup.mjs`, `review-delta-scope.mjs`), with
  every moved symbol still exported from its original module.

## [3.7.2] - 2026-11-15

### Added

- Opt-in merge for Deliver. With `deliver.merge: "after-checks"` in
  `foundation.json`, `/deliver` merges its single-repository pull request after
  every reported check passed, bound to the delivered head commit
  (`deliver.mergeMethod`: `squash` default, `merge`, or `rebase`), and records
  the merge commit in the delivery receipt. Pending checks return a resumable
  WAIT; failing or missing checks, drafts, and branch protection stop without
  merging; Deliver never uses an admin override. Without the setting Deliver
  still stops at the open pull request.

## [3.7.1] - 2026-11-15

This is release **3.7.1**. Although numbered as a patch by owner decision, it
drops state and commands from before 3.7 and changes 3.7.0 behavior (review
routing, CLI surface); read Changed and Removed before upgrading. A v3.7.0
project upgrades in place.

### Added

- Pi host adapter. `cloop init --host pi` (or `install-pi.sh`) installs
  the project-local `.pi/extensions/changeloop.ts` for Pi >=1.5.2. It registers
  the canonical commands, loads the package-owned agent contract, and bridges
  built-in tool secret/phase guards, lint feedback, session identity, and
  `!`/`!!` shell execution. `/land <change>` grants Land for that change only
  until reload or new user input. Guard coverage is partial: custom/MCP tools
  and other extensions are outside the live boundary, session-digest import is
  unavailable, and no OS sandbox attestation is issued.
- Shared Pi runtime. `cloop init <target> --host pi --shared-runtime` keeps
  the runtime, hooks, skills, commands, and OpenSpec schemas in a
  content-addressed bundle under Pi's agent directory. The project holds only
  its `.changeloop.json` pin, `foundation.json`, OpenSpec settings and
  artifacts, and `.foundation` state. A missing or mismatched pin fails closed.
  After the global extension is installed, `/changeloop init` then `/reload`
  configures another trusted project. Existing local installations are not
  migrated and remain supported; project settings survive re-initialization.
- Hotfix regression for its incident. A new hotfix draft must include a
  scenario whose `regressionOf` equals `bugfix.incident.link`, in a requirement
  with an executable capability; otherwise `change start` returns an agent
  EDIT. The change records `regressionRequired: true` and `change revise`
  enforces it only for marked changes, so hotfixes created before the upgrade
  are never blocked. The compiled spec shows "Regression of: <link>"; evidence
  claims and protocol pins are unchanged.
- Project incident records and lessons. Install and upgrade seed
  `openspec/incidents/README.md`, `openspec/incidents/_template.md`, and
  `openspec/lessons.md` only when missing, and never overwrite them.
- Lessons as grounding. When `openspec/lessons.md` exists, investigation and
  change intake read it as a grounding source.
- Advisory project review rules. The AI reviewer packet (review packet schema
  7) now carries the project's `REVIEW.md` as `reviewRules`, shown to the
  reviewer as advisory guidance that never changes pass or fail. Review receipts
  record `review.reviewRulesHash`; editing, deleting, or creating `REVIEW.md`
  after a review makes it stale (`review-rules-changed`), while receipts recorded
  before this release stay valid. A missing or empty `REVIEW.md` keeps the
  previous behavior. Install and upgrade seed a starter `REVIEW.md` only when
  the project has none, and never overwrite one.
- `test-design` skill, vendored unchanged from `hashtagf/skills` 0.16.0. It
  designs and documents what to verify: test cases, test plans, UAT, coverage
  audits, bug reports, and release go/no-go. `testing-fundamentals` still owns
  writing automated tests; the router splits the two.

### Changed

- Internal: the advance, change-lifecycle, proof-readiness, and agent-planner
  runtime factories now require the collaborators the composition root always
  supplies and fail at construction naming a missing one; the null guards for
  those impossible states are gone. Never-passed parameters became constants,
  and target-edit and atomic-start rollback logic moved out of `foundation.mjs`
  into their workflow modules. No output, CLI, or protocol change.
- **Breaking (CLI surface):** primitives that `advance` already performs are
  now `internal`: `proof readiness`, `proof advance`, `proof run`,
  `proof collect`, `evidence detect`, `evidence init`, `evidence doctor`, and
  `budget checkpoint`. They are hidden from `help`, the default `describe`
  listing, and the public CLI tables, but still dispatch (and answer
  `--help`/`describe <name>`), so existing scripts keep working. Every runtime
  next/resume/recovery route that named one (receipt validity recovery,
  readiness `verify`/retry choices, wiring actions, waiver output, Build
  completion, verification plans, update advisories, budget and blocker
  recovery, the moved-target Land option) now names
  `advance <change> --through proven|archived` or `advance <change> --inspect`.
  The public command golden fixture drops from 76 to 68 commands.
- The deterministic suite now has two tiers (repository-only). Plain
  `.claude/tests/run-all.sh` is the fast local gate before commit (about three
  minutes): every suite except the `SLOW` tier of real-Git end-to-end,
  mutation, installer, and topology suites and the exclusive benchmark.
  `--quick` is the same gate. New `run-all.sh --full` runs the complete set
  (the former default); CI runs it as `--release` on every push and pull
  request, and it must be green before merge or release. `--affected` still
  selects slow suites whose owned files change.
- Each harness command asks Git less: repeated `git status`, `git ls-files
  -s`, and `git rev-parse HEAD` listings of an unchanged workspace within one
  process are answered from a per-process memo instead of a new spawn. The
  memo is forgotten on any file write the process makes into that workspace
  (or into a `.git` directory), on any child process other than a read-only
  Git query, on a lock wait, and on every `clearSnapshotCache`. In one
  build→prove→land→sync flow, `advance --through proven` went from 22 to 10
  Git spawns, Land from 48 to 29, and the whole flow from 134 to 89.
- Installation copies each managed directory's files in one batch instead of
  forking `dirname`, `mkdir`, and `cp` per file (about 1,450 processes down to
  about 320). A fresh install is roughly twice as fast; the installed tree is
  byte-identical.
- The deterministic test gate is faster and steadier: one pool worker per core,
  the slowest suites start first, the workload suite runs once (inside the
  sentinel), end-to-end fixtures copy one installed consumer instead of
  reinstalling, and `run-all.sh --quick` skips only the slowest suites for the
  inner loop. Six test files that no runner named now run in the gate, and a
  registration check keeps new ones from going unrun.
- `run-all.sh` clears every host-exported `FOUNDATION_*` variable and
  `CLAUDE_FOUNDATION_PROJECT` before running suites, so a run started from an
  agent session (Claude or Pi) tests its fixtures instead of the caller's
  project and guardrail mode. The affected-suite selector also works when the
  checkout sits under a symlinked directory such as macOS `/tmp`.
- The default `run-all.sh` gate no longer runs the release-only `openspec
  native sentinel`, which reran the whole workload suite alone after the pool
  (about six minutes). `run-all.sh --release` runs it with the full gate; the
  release workflow, CI, and `--affected` for benchmark edits still run it, and
  `npm run release:preflight` checks that the release workflow uses
  `--release`. The multi-repository topology contracts and the concurrent
  repositories seam are split into parallel rows and files with every
  assertion kept, so neither holds the tail of the gate.
- The AI reviewer now checks scope discipline in the changed hunks:
  unrequested abstraction, dead or unused code, speculative options, guards or
  retries that hide a symptom, and untraceable or unrelated edits. These are
  minor findings, major only when they leave a scoped claim false or unproven;
  root-cause fixes and behavior-preserving preparatory refactors are not
  flagged. Packet schema, receipts, and protocol pins are unchanged.
- `ux-ui-principles` is now the unchanged upstream `hashtagf/skills` 0.16.0
  copy instead of the adapted bundle, including its runtime `assets/` (about
  13 MB) and `scripts/`; upstream `evals/` is not shipped. Upgrade removes the
  adapted bundle's files, including `references/upstream.md` and
  `references/change-loop-handoff.md`. Each vendored skill records its source
  in `VENDORED.md`.
- Every non-lifecycle skill now works on its own: guidance that needs
  OpenSpec or Change Loop is a conditional "With OpenSpec/Change Loop …
  otherwise …" section, links to other skills are optional reading, and dead
  references are removed; references and scripts follow the rewritten
  `SKILL.md` files. Skill descriptions name sharper English and Thai triggers
  and the neighboring skill to use instead. `coding-discipline` is rewritten:
  fix the root cause where the first wrong state appears, treat a
  behavior-preserving preparatory refactor as its own in-scope slice, record
  unrelated issues as follow-ups instead of fixing them, validate inputs before
  irreversible effects, and verify each outcome on the real artifact. The
  router loads it for a bug fix or Build edit whose scope, assumptions, or diff
  size the always-on digest does not settle.

### Removed

- **Breaking: state from releases before 3.7 is no longer read.** Finish or
  abandon a change with the release that started it before upgrading.
  - `migrate` and the `.workflow/` reader are gone.
  - `evidence upgrade` and evidence schema 1 are gone (protocol pin
    `evidenceSchema` is now `["2"]`); an evidence v1 packet is refused with
    that route.
  - The retired commit-based multi-repository Land saga is gone, with its
    `land record` and `land pointers` commands. Land always delivers uncommitted
    workspaces; `land resume` only reports the current plan. A change 3.7.0 or
    earlier left inside that saga is refused instead of replayed: `advance`
    asks the `legacy-land-saga` decision (finish it with 3.7.0, then upgrade,
    or `change abandon` it), naming `.foundation/runtime/<change>.json` and the
    saga fields; `changes`, `doctor`, and the upgrade report name it too.
  - A single-number `execution.packetBytes` is refused at runtime; the
    installer converts it to the same task/review/repository/global limits.
- The historical phase-orchestrator benchmark runner, its baselines, the
  `.workflow/` scenario fixtures, and the unregistered phase matrix were
  removed from the repository (not shipped).
- **Breaking: only semantic drafts v4 (JSON) and v5 (folder) are accepted.**
  Drafts v1, v2, v3 and unversioned JSON drafts return an EDIT that names the
  v5 template; `change new --draft` now always routes to `change start`.
  `change new` remains as an internal fixture primitive and leaves the public
  command list.
  A change 3.7.0 already started from a v3 draft keeps working and can still
  be amended with `change amend <change> <amendment.json>`.
- **Breaking:** the deprecated CLI aliases are gone. Use the canonical
  commands instead: `validate` → `change validate`, `proof plan` →
  `proof readiness`, `proof finish` → `proof run`, `agents task` →
  `packet <change> --task <task>`, and the `runtime <command>` pass-through →
  the matching public command (`runtime hash` → `hash`, `runtime new` →
  `change new`). Each alias had printed a deprecation warning since it was
  replaced; installed commands, skills, and hooks never call them.
- **Breaking: the legacy review routing is gone; review always routes by risk
  tier.** `workflow.reviewPolicy` accepts only `risk-tiered` and
  `workflow.reviewCircuit` only `full-delta`, which are now also the runtime
  defaults. A `legacy` value is refused with the route to rerun
  `claude-foundation init`, and install/upgrade rewrites both keys to the
  shipped values. Every review receipt now binds to an `authority dispatch`
  attempt, and `RESOLVED` no longer prints `review: required`; it names the
  tier and model class. In a 3.7.0 project that opted into `legacy`, upgrade says
  so, an unrecorded legacy-circuit review request is replaced by a current one
  automatically, and a change proven under it gets one current review on its
  next `advance`.
- Twelve unused internal runtime functions (old proposal renderers and
  helpers replaced in 3.7). No command, output, or file format changes.
- **Breaking (advance protocol 7):** `advance` output no longer carries
  `resumeCommand`, the duplicate of `resume` kept for v2 host adapters. No
  shipped adapter, hook, command, or skill read it; read `resume`. Deliver and
  budget checkpoint outputs keep their own `resumeCommand`.
- **Breaking (grounding schema `["2", "3"]`):** a `grounding.yaml` version 1
  is refused with the accepted versions. No release wrote one: grounding
  shipped at version 2 in 3.2.22, and 3.7.0 writes version 2 or 3. Version 2
  stays; current templates and change creation still write it.
- The pass-through modules `runtime/evidence/codex-reviewer.mjs` (and its
  `createCodexReviewerRuntime` alias) and `hooks/phase-guard-policy.mjs`.
  Import `runtime/evidence/configured-reviewer.mjs` and
  `runtime/core/shell-mutation-policy.mjs`; upgrade removes the old files.

### Fixed

- Path containment is decided by one shared rule (`core/paths.mjs`) in the
  runtime and hooks. Several checks treated a child directory whose name
  starts with `..` (for example `..cache`) as outside its root; it is now
  inside, while `..`, `../x`, and absolute paths elsewhere stay outside.
  Duplicated validation-field, `isObject`/`unique`, realpath, and SHA-256
  helpers now share one implementation each; validation messages are
  byte-identical.
- Test and benchmark tooling (repository only). `run-all.sh` puts stand-in
  `claude`/`codex` first on PATH for every suite and fails a suite that calls a
  model (readiness probes get a deterministic "not logged in"). The benchmark
  lab no longer records an empty baseline `product.patch` when runner coverage
  under `.foundation/` overflowed the diff buffer, isolates the operator's
  user-level Claude Code settings and MCP servers for every arm (recorded in
  `provenance.hostSettings`), fills `requestedModel`/`actualModel` from the host
  stream, and `aggregate.mjs --compare` shows every arm and keeps Change Loop
  sources apart (by commit or `--label`).
- `advance` no longer stops with "ran RUN_INVALIDATED_EVIDENCE twice without
  changing delivery state" on a proven change whose receipts were re-earned on
  an unchanged workspace (for example a 3.7.0 change re-reviewed after
  upgrade). Proof advance reused the old proof, which no longer bound the new
  receipts; it now finalizes a new one.
- `change start --inspect` on a v1–v3 draft returned `DONE` although
  `change start` then refused it; it now returns the draft repair with the
  supported formats.
- A review policy with no named reviewer and `fallbackReviewers:
  ["main-session"]` (the fix the missing-CLI error recommends) now reviews in
  the main session. Before, validation accepted it but `advance` repeated a
  "without a recorded configured reviewer failure" repair forever. A named,
  installed reviewer still runs first; the main session is reached only after
  its recorded failure.
- Blocker or major findings from a human review now must be closed. The next
  review, human or AI, full or delta, carries them as `closureFindings` and
  must list them in `verifiedFindingIds` (or fail with a blocker or major
  finding for what remains). Before, closure was owed only to AI findings, so
  a later review could pass without checking the human blocker, and a
  deterministic repair closure could pass over it. AI-only review chains are
  unchanged.
- A review receipt whose finding counts were edited after it was recorded
  (for example `review.findings.verified` raised to 99) no longer reads valid:
  the counts must match the finding rows and verified IDs the dispatched
  attempt binds, as they always do when the harness records the receipt.
- After the harness rebuilt a corrupt review attempt chain, every later
  review dispatch, a human review included, failed with "a completed AI
  response has no matching recorded receipt". The rebuilt placeholders carry
  no response, so they no longer count as one that owes a receipt.
- Hooks now work for a project reached through a symlinked path (macOS
  `/tmp`, a symlinked home directory). Node entry points compared the
  logical script path against their resolved module URL, so the secrets guard
  refused secret reads instead of showing a redacted copy, and the
  detached-authority, shell-route, and dev-terminal hooks silently did nothing.
- An AI review whose cheaper first round (fast or standard model) was
  interrupted while its receipt was recorded now recovers instead of failing
  "configured review result integrity or reviewer provenance does not match";
  recovery compares against the reviewer the request was dispatched to.
  `authority abort` now refuses a request whose AI result completed without a
  receipt, which previously blocked every later review of the change.
- A harness command run inside one project no longer changes another project
  pinned by the host session's `CLAUDE_FOUNDATION_PROJECT` (the Pi adapter
  exports it to every shell). The runtime and CLI refuse with a clear message
  unless the cwd or the runtime belongs to the pinned project or its sandbox;
  `--project` still selects a project. Shell suites run alone also drop the
  host session's project, identity, and guardrail variables.
- `skill-creator` helper scripts (`run_eval.py`, `run_loop.py`,
  `improve_description.py`, `package_skill.py`) run by path as well as with
  `python -m`, `package_skill.py` prints its real location in usage text, and
  `quick_validate.py` names the missing PyYAML dependency instead of a
  traceback. `ui-ux-pro-max` shows `search.py` relative to the skill's own
  directory instead of a `skills/...` path that did not exist in installed
  projects.

## [3.7.0] - 2026-11-10

### Added

- `cloop` command. Homebrew installs `cloop` as the short command next to
  `claude-foundation`, and the tap resolves `brew install cloop`. Both names
  run the same program; agents, permission allowlists, runtime routes, and the
  `.foundation/bin/claude-foundation` shim keep the original name.
- Principles page and SEO metadata. The docs gain a Principles page (English
  and Thai) naming Proof-Driven Development and seven related principles; the
  landing page gains canonical, social, and structured metadata plus
  `robots.txt`.

### Changed

- Project home moved to `https://github.com/hashtagf/changeloop` and the site to
  `https://changeloop.ai`. The update advisory reads releases from the new
  repository, and the release workflow rewrites the formula's full source URL.
  Installed state paths and file names are unchanged.

## [3.6.11] - 2026-11-09

### Added

- Prototype-bound visual check. `prototypeSelection` takes `covers` (requirement
  keys) and `mode` (`strict` by default, or `advisory`); the compiler copies the
  prototype into the packet so spec approval binds it. Build tasks for bound
  requirements open it as read-only context. In `strict` mode Prove requires the
  new `visual` capability: an agent reviewer compares the project's screenshots
  with the prototype and lists each difference. Blocker and major differences
  get two repair rounds; what remains is asked once when every other gate is
  done (repair more, accept with a reason, or amend), and accepted differences
  are shown as accepted by the user, never as a pass. A packet prototype copy
  that is edited or missing keeps its check: `visual` stays required and
  reports the drift with its recovery instead of silently dropping out. A
  strict binding with no claims or with unknown claims binds every claim instead.

### Changed

- Docs no longer say a `prototype` skill writes the approval page. It is written
  by hand, by the agent when asked or by the user; the page contract in
  `WORKFLOW.md` and the harness `package` data are unchanged.

### Fixed

- Several visual providers failing in the same Prove pass now get one repair
  round and one batch; the second provider is no longer recorded as drift
  before it was ever repaired.
- A visual repair the agent declines (for example, one the agreement forbids)
  no longer reissues the same batch forever. Resuming without editing records
  visual drift at once, and the user decides.
- A draft folder's `execution.yaml` (JSON, like the packet's) is read as the
  draft's provider wiring, so browser and visual providers can be wired before
  `change start`. A browser provider without `inputMode` now names the provider,
  the accepted values, and where to set it; a draft `execution` without
  `version: 1` names the required form.
- A sandbox created after another change landed no longer loops on a landed
  conflict. The carry now records where the sandbox copy started
  (`landedCarriedFrom`); while the target still holds those landed bytes, the
  change's own edits next to the landed lines are not merged with the landed
  edit again, and Land accepts the path. A target that moved since the carry is
  replayed as before.

## [3.6.10] - 2026-11-02

### Removed

- The `prototype` skill. It did not work in practice. Installed consumers lose
  `.claude/skills/prototype/` on upgrade through the install manifest. The
  harness approval-data command and drift checks are unchanged, so the approval
  page is no longer written by any skill until a replacement ships.

## [3.6.9] - 2026-10-31

### Changed

- The approval page is now written by the `prototype` skill, not the harness.
  `claude-foundation package <change>` prints the change's data as JSON (risk
  with reasons, proof labels, role lanes, scratch lines, required sections, the
  surfaces the page must show and which the prototype declares covered, and
  drift and facts-digest status) and writes no file; `change start` and
  `advance` no longer write `.foundation/packages/`. The approval question names
  the page at `.foundation/previews/<change>/prototype.html`, or gives the
  summary as text when there is none. The harness HTML renderer, the A-G
  decision cards, and their tests are removed; `vendor/mermaid.min.js` stays.
- A `prototype` example may declare `covers`; a key outside the change's surfaces
  is an intake `EDIT`. All 26 work types have prototype surfaces, and a test fails
  when a work type is added without them.

### Added

- Advisory drift warnings: the harness records the page's digest and a facts
  digest at start, revise, and amend, and warns (never blocks) when the page was
  edited after the recorded revision or lacks the current facts digest.
- `prototype` skill guidance for all 26 work types, the page contract, design
  tokens and a design canvas when the host has one, and keeping the change in
  step with page edits.

### Fixed

- `run-all.sh` no longer kills the installer suite at the default 300 seconds on
  a loaded CI runner: `installer smoke` now has the same ten-minute watchdog as
  the other long suites. A suite the watchdog does kill always counts as failed
  and is reported as `(timed out after Ns)` in the failure list and tail header,
  instead of leaving its last assertions to look like a bug in the code under
  test.
- `harness contracts (topology planning)` now has a twenty-minute watchdog
  (other long suites keep ten): it takes about 100 seconds alone but made only
  110 of its 163 assertions in 600 seconds on the macOS CI runner, so both
  release gates killed it.
- `package` lists each preview with its kept artifact (only when the file stays
  inside the change's preview folder).
- A child-only Land (no writable root) of a change amended during Build now
  replaces the root packet with the sandbox packet before archive instead of
  merging only task checkboxes, so the archive and synced specs carry the
  amended tasks, requirements, and amendment history.
- `advance` settles a harness-issued session lease whose graph or contract
  moved since it was issued (an amendment reopened or reshaped tasks) before
  dispatching: a lease whose task now waits on a pending dependency is parked
  (resources released, index and write baseline kept for the re-issued lease),
  any other is renewed in place. A reopened dependency no longer waits on a
  resource its dependent's stale lease holds while that dependent waits on it.

- A sandbox sync whose own clean replay of uncommitted work changes the
  change's diff identity (landed replay or carried target edit, no conflict
  left, no base move in the same sync) records the identity before and after
  as a bridge. Review and acceptance receipts rebind across recorded bridges,
  so a stacked change no longer spends an AI review wave on work an earlier
  change landed; an author edit still expires the verdict, and a moved base
  keeps its expire-and-release contract.
- The shipped `permissions.allow` adds read-only exploration rules (`find`,
  `grep`, `ls`, `head`, `wc`, the `rtk ls`/`grep` forms, and
  `git status`/`diff`/`log`/`show`) so a headless agent reads code without a
  prompt. `cat` gets no rule because a prefix rule would also pre-allow
  `cat > file`; no rule grants a write, a delete, or state-moving Git.

- Land of a stacked change accepts a file the harness's own sandbox sync merged
  cleanly with landed work while neither side changed since, in the root
  workspace and in repository sandboxes, instead of re-merging and refusing it
  as an overwrite. A conflict the sync left on the current bytes is returned
  with its `sandbox sync --resolve` route (`REPAIR_SYNC_CONFLICT`) rather than
  a bare refusal, and a target edited after the sync routes to the sync again.
- A sandbox sync that invalidates proof also removes the proof-advance
  checkpoint, so `advance --through proven` runs proof again instead of
  reporting current proof while `--through archived` refuses the building
  lifecycle.

- User authority now binds the agreement's content, not the revision counter.
  A grounding reopen, the validate that re-locks it, a sandbox sync, or an
  authority grant no longer voids the spec approval, its lanes, revision-bound
  waivers, the compiled draft, or task leases when the packet bytes are
  unchanged; each carry leaves an `approvalCarries` audit row.
- `authority extend-review` no longer changes the contract fingerprint, so the
  wave the user granted runs instead of returning `CONTRACT_DECISION_REQUIRED`.
- A semantic amendment records the identity of the packet it left and a
  snapshot under `.foundation/agreement-amended/`; `advance --approve-spec`
  and every later gate recognise that packet as the agreement after bookkeeping
  bumps instead of restoring the stale target packet over it. A hand edit after
  the amendment is restored from the amended text, and the restore notice names
  the files it put back.

## [3.6.8] - 2026-10-25

### Added

- Work types `data-fix` (`dataFix`), `security` (`threatModel` + `hardening`) and
  `cicd` (`pipelinePlan`, inferred from workflow and pipeline paths), each with
  required sections. `ml` evaluation, experiment guardrails/stop rules and infra
  `costDelta` are now required instead of advised.
- High and Critical drafts must say how to undo them (`scratch.undo` or an
  existing rollback field). Every new required field accepts `none: <reason>` or
  `unknown: <reason>`, so no gate is a dead end; rules apply only to drafts
  being started or revised.
- Decision-first approval page: type cards with the checklist, diagrams and the
  prototype placed on the card they explain, a quiet status line in place of the
  decision section, and a risk meter coloured by level.
- `change start --template` carries test-adequacy guidance (one scenario per
  stated rule, with its failure and boundary cases).
- Benchmark aggregate reports `skillToolCalls`, `skillRuns` and `skillsLoaded`
  per scenario.

### Fixed

- The design document's file tree and derived file map group paths by
  repository and mark a file missing at its own repository's base as an addition
  (`+`); a repository whose root is unknown stays `~`. Single-repository output
  is unchanged.
- Context budgets: `change.md` returns to its 250-word limit by moving `scratch`
  and approval-question detail into the Change workflow reference, and the
  large-change fixture declares the required `scratch` block.

## [3.6.7] - 2026-10-21

### Added

- `claude-foundation current` prints the one active change. `advance`,
  `packet`, `metrics`, `feedback`, `package`, `change audit`, `authority status`,
  `handoff status` and `evidence detect|doctor` may omit `<change>` when exactly
  one change is active; destructive or Land-authority forms still need the id.
- Gemini CLI host row and guidance file; the OpenCode plugin exports
  `FOUNDATION_SESSION_ID`. The main-session identity variables are documented in
  `EVIDENCE.md`.
- Reviewers accept `auth: "skip"`, and the Codex login probe is skipped when an
  API key or non-OpenAI `model_provider` is configured.

### Changed

- A reviewer whose CLI is not installed is recorded as an infrastructure failure,
  so the `main-session` fallback is reachable instead of stalling the review gate.
- Blocked review results carry a concrete `next.command` instead of placeholders.
- `install.sh` no longer ships `.claude/harness/tests` or `.claude/harness/fixtures`
  to consumers (a root `node --test` ran the harness's own tests); upgrades remove
  copies a previous release recorded.
- `evidence` detection reports a project with no `scripts.test` instead of staying
  silent; `change.json` `workType`/`apiContracts` errors include a valid example.
- `/dev` no longer runs a separate Prove step after Build reaches `proven`.

## [3.6.6] - 2026-10-19

### Added

- **Approval package, pre-Build preview, and role lanes.** `package <change>`
  writes a read-only HTML package for approvers before Build:
  - The change is routed by intent, 28 technical domains, and risk level, all
    taken from the existing `workType` and `riskSignals`.
  - The package shows proof and preview labels, Mermaid diagrams (vendored
    mermaid 11.4.1, with a text fallback), and suggested previews.
  - The page text follows the draft's language.

  `preview <change>` runs one provider in `.foundation/previews`. Its receipts
  never satisfy Prove or Land, and an external provider needs a per-run
  `--decision-ref`.

  Opt-in `approval.roles` lanes require per-role approval with `--role`. Every
  carried revision or amendment reroutes the lanes.

  Drafts gain optional `scratch` (get/asIs/toBe/ifFail) and typed `examples`.
  The package shows a plain-language summary and the examples before Build,
  and the real result beside each example after Prove. `change start` prints a
  non-blocking `NOTE: scratch` when a medium- or high-impact draft has no
  examples, target number, or affected count.

  Runtime API is now 42.

### Fixed

- **Build reinstalls dependencies after a manifest or lockfile edit.**
  - Problem: setup ran only when the sandbox was created. After a Build edited
    `package.json` or a lockfile, checks ran against stale `node_modules`. In
    the paid dependency-upgrade scenario, the guard then refused the agent's
    relink, and the Build stopped to ask the user.
  - Fix: setup now records a digest of the manifest and lockfiles. Every
    `exec`, task check, and proof run reruns the same setup when that digest
    changes.
  - The refusal for borrowing the checkout's dependencies now names a manifest
    or lockfile edit as the route, not a `foundation.json` edit.
- **A process lock is never taken from a live holder during dead-holder
  recovery.**
  - Problem: a contender could read a holder's descriptor, then see that pid
    dead after the holder had already released and a third process had
    acquired. It then deleted the live lock and let two writers in.
  - Fix: recovery now removes only the descriptor it judged dead.
- **A derived outcome is no longer refused as a placeholder.**
  - Problem: when a requirement had no `outcome`, the harness copied the
    first scenario's `then`. Text like `<the path given>` in that sentence
    then failed the placeholder check, and the agent was asked to repair a
    field it never wrote.
  - Fix: the derived outcome now skips placeholder-shaped text, falling back
    to the requirement clause. Outcomes the author writes are still checked.
- **An unnamed `modified` requirement finds the canonical one it means.**
  - When a `modified` requirement names no `requirement`, the harness now
    matches a restated description, the key's slug (`loyalty-tiers` →
    "Loyalty tiers"), or the capability's only requirement.
  - If nothing matches, the repair lists the requirement names to choose from.
  - Paid regression-fix runs had repaired the draft up to three times for
    this.
- **`--through` without `--approve-spec` names the call that works.**
  - The refusal now prints the full command for when the user approved the
    spec, and it still approves nothing.
  - `change.md` step 3 and the template's `save` text now put the approval
    flags on the same `change start` call.
- **The start line names the review an input-domain change will get.** Risk
  signals are now stored before the change is resolved. Previously the
  `review:` line printed "not required" for these changes even though Prove
  then ran a medium-tier review.
- **Preview and package work on real projects.**
  - `preview` runs before Build while the workspace is still the target. It
    refuses once a Build sandbox exists, and it rejects path-like provider
    names.
  - `package` warns instead of exiting on invalid evidence wiring. It now shows
    the agreement content under each artifact and each preview's status,
    output, and artifact.

### Changed

- **Only user decisions stop work before Land; Land is the single hard gate.**
  `WORKFLOW.md` gains a *Blocking policy* section listing the only pre-Land
  stops (spec approval, product meaning, acceptance, waivers, exhausted review,
  Land and external side effects, budget, and causes only the user can clear).
  Land now refuses without a current passing proof and a still-valid spec
  approval; the unproven and risk-accepted Land routes are gone, and
  `land advance` is only an alias of `advance <change> --through archived`.
  Prove records protected-path edits and sandbox deletions and Land lists them
  instead of refusing them. The third unchanged recovery round returns a
  `REPAIR` to its original agent or harness owner instead of a user question,
  and a shared `[resources:]` token another change holds is a harness
  `WAIT_RESOURCE`. A new `blocking policy` suite enforces the rule.

## [3.6.5] - 2026-10-17

### Fixed

- **Faster small changes.** The start template recommended the `input-domain`
  risk for almost any task, so small changes got an AI review and repeated
  draft repairs. It now recommends `input-domain` only when values from
  outside the program (an HTTP request, uploaded file, CLI argument or message
  payload) must be validated or rejected. It also lists the coverage rows each
  risk requires, in the format the check expects. In a six-scenario test this
  cut time by 30% and cost by 14% with the same results. Review rules are
  unchanged.
- **Regression fixes cover nearby boundaries.** A change that declares
  `fixes` must now also cover the input boundaries next to the reported one,
  so a fix for one threshold is checked at the analogous thresholds too. This
  adds no review.

## [3.6.4] - 2026-10-17

### Added

- **Fuller change documents.** A change can now carry a complete dev document:
  a `change.json` folder with readable `proposal.md` and `design.md`, whose
  required sections follow the kind of work (for example, a migration needs a
  rollout plan). `change start --template` starts from this format. Older
  JSON drafts still work.
- **Checks for risky work.** When a change declares a risk such as access
  control, money handling or a performance target, it must also show matching
  evidence (allow/deny tests, a benchmark, a reproduced bug) before it can be
  proven. Changes that declare no risk behave as before.
- **Investigations carry over.** Requirements and decisions found in
  `/investigate` are kept and handed to Change in detail, so they are not lost
  between sessions.
- **Proof progress.** Prove shows which checks are running and skips work that
  the base run already covers.
- **Evidence for more work types.** Performance, async, integration and
  deprecation work now ask for evidence that fits them, including a new
  concurrency check.

### Changed

- **Less review for ordinary work.** The kind of work alone (for example "api")
  no longer raises the AI review to the high tier; real risk signals still do.
- **Agents pick skills themselves.** Build no longer lists skills to load.
  Skill descriptions now name the spec terms (`workType`, `riskSignals`,
  requirements, scenarios) that should lead an agent to them. No hooks force a
  skill.

### Fixed

- **New dependencies work after Land.** When a change adds or updates packages
  (`package.json` or a lockfile), Land now installs them in your project with
  the same command the sandbox used, so `npm test` and similar commands work
  right away. If the install fails, Land is kept and the command to run is
  shown. Set `sandbox.installDependencies: false` to turn this off.
- **Correct task list after multi-repository Land.** A change that edits only
  child repositories (for example backend, SDK and web, without the root) now
  archives with its finished tasks checked. Before, the archived `tasks.md`
  showed every task unfinished.
- **Faster first draft.** New changes no longer spend an extra repair round
  filling in defaults.
- **Fewer stuck changes.** Prove and Land no longer stop for stacked changes,
  for a review that used up its rounds, or for repository-scoped changes after
  an amendment or waiver. Overlapping `advance` runs no longer report a false
  "no progress" or lock problem.
- **Clearer errors.** A test-provider timeout now names the provider, and
  provider settings no longer leak between test suites.
- `go test -json` results are counted, `addTasks` works for existing
  requirements, and landed specs are trimmed.

## [3.6.3] - 2026-10-11

### Added

- A pinned, portable `ux-ui-principles` skill from hashtagf/skills with
  experience, accessibility, interaction, and visual guides, a 40-layout
  blueprint library, and recorded upstream provenance.

### Changed

- Routed experience decisions and usability reviews to `ux-ui-principles`,
  searchable design intelligence to `ui-ux-pro-max`, settled visual work to
  `frontend-design`, and shared tokens/components to `tailwind-design-system`.
  Detailed UX guidance loads selectively within the existing context budget.

### Removed

- The shipped `gridgeist` skill and its style assets. Upgrades remove its
  previously managed files while preserving consumer-owned notes and skills.

### Fixed

- Linked contents for long skill references and corrected hexagonal architecture
  guidance and stale references, with deterministic catalog regressions.
- Normalized imported layout file endings for clean whitespace checks.

### Known limitations

- The maintainer explicitly authorized artifact publication after reviewing the
  candidate's 9/10 scenario checkpoint. Tracker remains at `proven`, failing
  `CASE_TESTS_EXIST` at 32/33; its oracle-repair continuation made no edits.
  This publication exception does not turn failed evidence into a pass or
  establish production assurance. [Checkpoint report](docs/reports/scenario-checkpoint-v3.6.3-2026-10-11.md).
- The benchmark's merged-session scorecard retains only the final session cost.
  The retained audit sums all session envelopes, including repairs, to
  US$4.6064739 across eleven attempts. A tiny-feature spec-approval stop and
  its successful selective retry are both retained; no stable speedup is claimed.

## [3.6.2] - 2026-10-08

### Added

- Four shipped skills for change-impact analysis, performance investigation,
  skill evaluation, and read-only skill-suite auditing. A pinned pstack concept
  map records coverage of its 58 skills without importing its runtime or hooks.
- Operational guides for tracing code and historical rationale, scoped recall,
  comparing options, preserving intent during cleanup, repairing CI and review
  findings, and creating and maintaining real-surface verification drivers.

### Changed

- Refined routing descriptions across the existing skill catalog and integrated
  practical principles into their owning skills. Detailed guides load on demand
  within the existing context budgets.
- Aligned authoring, planning, refactoring, debugging, proof, reporting, and Git
  instructions with Change Loop ownership: OpenSpec remains the agreement,
  the harness owns proof and recovery, and Git/PR actions retain separate user
  authority. Instructions no longer impose competing ledgers, mandatory agent
  fanout, automatic commits, or proof bypasses.

### Fixed

- Evaluation helpers preserve unavailable measurements as unknown, retain real
  zero values, use observed token usage instead of output characters, report
  actual run counts, and compare matched candidate/baseline runs.
- Description optimization selects on training results and evaluates held-out
  cases once after selection. Missing execution results and runner failures
  cannot produce passing negative cases or select a description.
- Benchmark reports display unknown measurements faithfully. Portable catalog
  auditing resolves linked skills' references correctly and rejects directory
  references and symlinks into unshipped state.

## [3.6.1] - 2026-10-08

### Fixed

- A proven change can accept added or revised requirements until Land starts.
  A successful amendment returns it to Build, retains completed work and
  unaffected valid evidence, and requires a new proof for the amended agreement.
  Rejected amendments restore the prior state; amendments remain blocked during
  Land and applied or archive recovery.
- User-facing summaries and approval requests now describe visible product
  changes in the user's language. Agent guidance keeps approval commands,
  internal identifiers, skill names, and design jargon out of routine replies,
  includes a natural Thai approval example, and explains verification limits
  and actionable warnings in ordinary words.

## [3.6.0] - 2026-10-08

**v3.6.0 at a glance.** Behavior changes you will notice:

- Wall time: rapid changes target at most 1.5x, standard changes at most 1.8x
  the same task without the harness (advisory time gate, lane-aware).
- Medium-risk Prove review now runs its first round on the faster `standard`
  model class by default; pin the old behavior with
  `review.modelByTier.medium: "configured"`. High risk is unchanged.
- Every change opens with a rendered header, scope, acceptance traceability
  table, and definition of done; tasks live only in `tasks.md`. Existing
  changes keep their older layout and still read.
- Multi-repository and submodule work, copy-mode isolation, and the rapid
  fast path are fixed or faster; Prove now requires new tests to fail on the
  original code.
- Data-loss fix: resolving a Land conflict can no longer silently discard work
  that already landed (`resolutionKeepsLanded`).
- A shipped `shell-route-guard` hook redirects shell shapes that would stop on
  a host permission prompt; packet byte budgets are raised
  (20/20/24/32 KiB) and migrated on install.

### Added

- Every change's `proposal.md` now opens with a harness-rendered header (change
  id, lane and why, owner or `unassigned`, created date, status pointer), a
  Scope (in scope, and out of scope derived from the task `paths` allow-list,
  unselected repositories, or authored `nonGoals`), an acceptance traceability
  table (requirement, scenario claim and kind, task, evidence, test files; ids
  and paths only), and a definition of done generated from the enforced
  policy. New optional draft key `successMeasure` (one line); `change start`
  prints one advisory coverage NOTE and never adds an EDIT. Authors write
  nothing extra and no command changes.


- New shipped Bash PreToolUse hook `shell-route-guard.sh` refuses shell shapes
  the host would stop on a permission prompt anyway, and the reason gives the
  exact command to run instead, so an unattended agent can correct in one step:
  `cd <dir> && git …` becomes `git -C <dir> …`. A direct test run (`npm test`,
  `node --test`, `pytest`, `go test`, …, optionally piped to `tail`/`head`)
  while a change is in Build becomes `claude-foundation exec <change> [--repo
  <id>] -- <command>`. A matching Bash allow rule, `bypassPermissions`, or a
  command the hook cannot parse passes through. `FOUNDATION_GUARDRAIL_MODE=audit`
  turns the refusal into advice, and `off` disables it. The installer adds the
  hook to existing settings.

- A draft-validation `EDIT` from `change start`, `change revise`, or `change
  amend` now carries an `instruction`: apply every fix with the Edit tool on the
  pre-allowed `.foundation/drafts/**` file, never a python, `node -e`, `sed -i`,
  `jq`, or heredoc rewrite, which the host refuses as permission prompts.
  `/change` names the same route. The session digest adds one `Agent shell:`
  line naming the refused shell shapes (`cd` chains, `$VAR`/`$(…)`, braces,
  heredocs, `sed -i`, scripts) and, when `openspec/repositories.yaml` declares
  an `allowOutsideRoot` sibling, names it as outside the working directory so
  Change grounds it from in-root sources and reads it in its Build repository
  sandbox. No permission rule is widened.

- Build `EDIT` tasks carry a `checkCommand`: the task's verify wrapped as
  `claude-foundation exec <change> --task <id> -- <verify>` (`sh -c` when the
  text needs a shell). The already-allowed CLI rule covers it, so running a
  focused check no longer stops on a host approval prompt for `node --test`,
  `python3 -m unittest`, or a piped form. The installer also seeds
  `Edit(/.foundation/drafts/**)` for the Change draft; upgrades append it after
  existing rules.

- `change start --template` now leads with a `save` field: write the draft with
  the Write tool to `.foundation/drafts/<id>.json` (pre-allowed), not a shell
  heredoc, which the host refuses as expansion obfuscation. `change amend
  --template` (`.foundation/drafts/<change>-amendment.json`) and `investigate
  --template` (`openspec/investigations/<id>.json`) lead with the same field and
  name the command that reads the file. The installer also seeds
  `Edit(/openspec/investigations/**)`, appended after existing rules on upgrade,
  so saving an investigation record never prompts. `/change` names the
  same route, and the installer's headless hint grants the full seeded
  allowlist instead of only the CLI rule.
- `exec <change> --repo <id>` or `--task <id>` runs a command in that
  repository's sandbox. Without either, `exec` uses the caller's directory
  (mapped into the matching sandbox), then the repository all pending tasks
  share, then the shared sandbox, never the main checkout; an unknown or blank
  repository or task is refused with the known names.
- `foundation.json` `deliver.commitSubject` and `deliver.branchPattern` set the
  Deliver commit subject and branch from `{changeId}`, `{title}`,
  `{commitType}`, `{prType}`, and `{ticket}` (the first `deliver.ticketPattern`
  match). Defaults keep `feat: <title>` and `change/<change-id>`. An invalid
  setting stops Deliver as a `delivery-policy` wait (`DELIVERY_NAMING_INVALID`)
  before any workspace, commit, or push exists.
- The configured reviewer may return advisory `specGaps`, reported as
  `reviewAdvisories.specGaps` on a reached `proven` or `archived` target; they
  never become findings or block.
- The installer prepares the pinned OpenSpec CLI project-locally when no
  compatible CLI resolves; without npm access it warns and still succeeds.
- Thai intents now trigger the same review, security, and migration routing as
  English. Thai terms such as ล็อกอิน, เข้าสู่ระบบ, รหัสผ่าน, สิทธิ์,
  โทเคนเข้าถึง, ชำระเงิน, จ่ายเงิน, ย้ายข้อมูล, ลบข้อมูล, ข้อมูลส่วนตัว, and
  ความปลอดภัย, plus common transliterations, match as substrings because Thai
  has no word spaces. Bare โทเคน stays out, like bare "token", because it also
  names model token budgets.
- `install.sh` appends a narrow `permissions.allow` list to the project's
  `.claude/settings.json` so the harness CLI and Build-workspace edits no
  longer prompt on every change: `Bash(claude-foundation *)`,
  `Bash(.foundation/bin/claude-foundation *)`,
  `Bash(node .claude/harness/foundation.mjs *)`,
  `Edit(/.foundation/sandboxes/**)`,
  `Edit(/.foundation/repository-sandboxes/**)`, and
  `Edit(/.foundation/drafts/**)` for the Change draft. The merge adds only
  missing rules after the user's own, keeps their order (it no longer sorts the list),
  and is idempotent. `--no-permission-allowlist` skips it; the Cursor,
  OpenCode, and Codex adapters pass the flag through.
- `change start`, `change revise`, and `change amend` accept
  `--approve-spec --decision-ref <ref> [--through build|proven|archived]`, so
  the call that applies the user's approving answer also records the approval
  (and may continue); a call that stops at an intake action approves nothing.
- Change inspection reports, in the first `EDIT` batch, a task `verify` that
  names a test file which neither exists nor falls inside any task's `paths`
  (also for an amendment's added or updated tasks), and an `apiContracts`
  error listed without a status or code. `AGREED` and `REVISED` list the
  design's open questions with the approval packet.

### Changed

- Document layout changed, existing changes still read. Each fact now has one
  home: the proposal no longer renders Plan, What changes, or Folder tree
  (tasks live in `tasks.md`; `design.md` renders the derived folder tree inside
  its File map and no Plan), a one-capability proposal omits the Capabilities
  table (Scope names the capability), and a rapid proposal omits default
  Impact lines (code surface, no security trigger). Six small rapid fixtures
  render in 14% fewer lines (203 vs 237) but 23% more bytes (6250 vs 5076)
  because the new blocks carry ids and policy text. Changes agreed earlier keep their old
  sections; pull-request narratives read either layout.
- Prove model review speed (W9-1, user decision). Paid w7 standard runs spent
  28-91 s of 65-100 s harness-active time in one `claude-opus` review. Medium-tier
  review now runs its first round on the faster `standard` model class by
  default (`standardModelId`, else `models.standard.family`, at the configured
  effort), a deliberate speed/depth trade-off. High tier, every delta/closure
  round, a medium change with a security or required-review trigger
  (`access-control`, `authorization-or-secrets`, `risk-semantics`,
  `risk-capability`, `covered-by-review:*`, `multi-repository-claim`, ...), and a
  declared review keep the configured model; a `standard` round escalates once
  to it on an unsure scenario like a `fast` one. `review.modelByTier` (`low` and
  `medium` to `fast|standard|configured`) overrides the defaults; `high` is
  rejected and an unknown class fails closed to the configured model. Tier
  assignment is unchanged, public commands are unchanged, and the receipt now
  records `review.reviewer.modelTier`.
- The review that `advance` runs beside the providers now overlaps the base-source
  test discrimination run too, and joins before any stop returns. In w7, three of
  four standard scenarios ran the review after Prove instead of beside it.
- Change reaches AGREED in one `change start` call. Paid w5 lab runs needed a
  second call in 5 of 10 scenarios (api-keys: four) for fields the harness
  can derive: standard-lane drafts were sent back for `why` (4/4), evidence
  capabilities for every requirement (5/5), and `failureMatrix` (3/4).
  Now the intent stands in for an absent `why`, omitted evidence capabilities
  default to `test` (`static-analysis` for docs/chore) in either lane unless
  the draft declares security triggers, and unclassified scenarios that state
  a rejection or error fill the failure matrix when no scenario is marked
  `kind: "failure"`. Authored values are never replaced; the proposal lists
  each filled value under "Derived by harness" and `change start` prints one
  NOTE. When an EDIT is unavoidable it now carries every issue: preflight
  checks such as an invalid `coupling` were hidden until the compiler issues
  were fixed, and the `riskSignals` and coverage messages name the valid
  values. Public commands and draft shapes are unchanged.
- Agent read surface and request count (W7-3): `/dev` reads only `change.md`
  up front (Build, Prove, and Land commands load for a failure, a non-`EDIT`
  action, or a Land boundary), and the draft template is no longer a required
  step. `change.md` tells the agent to put `--approve-spec --decision-ref
  <ref>` (plus `/dev`'s `--through`) on `change start` when the request approved
  the spec, so one call starts, approves, and reaches Build's first action.
  A single-task session `EDIT` now carries the same `instructions` recipe as a
  multi-task one. Rapid-lane instructions (AGENT + dev + change) shrink to 669
  words and the full `/dev` bundle from 1143 to 1122; a structural test guards
  the rapid read surface. `advance` records the furthest `--through` target
  requested (`requestedThrough`), and the `next:` routes of `changes`, the
  session digest, `validate`, `change resolve`, `change revise`, and the scope,
  grounding, and `exec` workspace errors continue toward it (never below
  `proven` once the spec is approved) instead of repeating `--through build`.
  Printed approval commands now say `--through proven`.

- Harness own time: a rapid change in a non-Git directory spent ~12 s of its
  ~27 s harness-active time in 1,626 `git rev-parse HEAD` processes (plus ~90
  failing `git ls-files`/`status` ones), ~7 s re-reading and re-parsing the
  runtime state, and ~4 s in five OpenSpec lints and three version probes. HEAD and "not a repository" are now read from the
  repository files (any layout the reader does not model still asks Git),
  settled state and file digests are reused while their identity is unchanged,
  OpenSpec version and strict-lint passes persist by content in
  `.foundation/cache/` (checkbox ticks and the checkout location are not
  lint inputs; every other byte is), and a Build task check whose `verify` is the
  provider's `sh -c` line is now reused by Prove, so the project suite runs once
  between Build and Prove. Measured on one tiny change: 249 -> 81 spawns and
  9.8 -> 5.2 s in a repository, 1,752 -> 5 spawns and 26.9 -> 6.4 s in a plain
  directory. No evidence, isolation, freshness, or Land guard changed.
- Packet budgets (user decision: raise the defaults so large work fits): task
  and review packets 8 KiB -> 20 KiB, repository 12 KiB -> 24 KiB, global
  16 KiB -> 32 KiB. A paid three-repository API-keys run (3 tasks, 10/4/20
  claims, ~22 changed paths) was blocked at `packet --task` (9,951 bytes) and
  `packet --phase build` (19,623 bytes); a deterministic replay measured task
  packets up to 11.7 KB, repository 14.3 KB, review 12.2 KB, and global
  18.0 KB, so the new defaults give about 1.5x headroom. The `2048..65536`
  hard ceiling, `foundation.json` overrides, and the largest-fields BLOCKED
  diagnostic are unchanged. The installer replaces only the exact former
  seeded defaults (`8192/8192/12288/16384`) and keeps tuned budgets.
- Rapid fast path: under `workflow.reviewPolicy: "risk-tiered"`, a low-tier
  `foundation-rapid` change that nothing asks to review (no declared or keyword
  security trigger, `--review`, `riskSignals`, review capability, or
  required/diversity trigger) no longer runs an AI review; the project's
  deterministic evidence proves it. `RESOLVED` prints
  `review: not required (rapid lane, low tier: deterministic evidence only)`
  and the review-assurance note is omitted. Standard changes, any higher tier,
  and capabilities inferred from the built diff keep review. Paid w4 runs spent
  18-24 s of each rapid Prove in review. The contract fingerprint keeps its
  pre-exemption review shape, so upgrading never re-verifies an in-flight
  change.
- `/dev` with Land authority passes `--through archived` to every `advance`,
  so a resume route never stops at `build` or `proven` first. Build no longer
  asks the agent to run each `checkCommand` before resuming (`advance` already
  runs every task check and returns failures with output), and `cd
  <workspace>` is needed only before a plain shell command. The `/dev`
  instruction bundle shrinks by three words.


- A security-static, resilience, compatibility, data-migration, or
  cross-repo-contract provider that only re-runs a test provider's command is
  never run or credited as passed. The required review covers it
  (`covered-by-review`, with `aliasOf`, in readiness, proof plan, and the
  proof): review is required and raised (high for security-static and the
  contract and data capabilities, at least medium for resilience), and Prove
  continues without a user decision. A waived review leaves it uncovered, and
  a real command in execution.yaml replaces the alias.
- Docs- or chore-only drafts default omitted evidence to `static-analysis`
  (exit-code command) instead of test discovery.
- Draft `riskSignals` are kept on the change: `access-control` makes review
  required and selects the high tier, and `input-domain` at least the medium
  tier.
- `change start --template` shows the `repositories` selection and per-task
  `repository` when the project declares repositories besides root.
  Compilation rejects a root task whose paths reach into a declared
  repository, repository-task paths written from the control root, unselected
  or undeclared task repositories, and verify commands that `cd` (or
  `-C`/`--prefix`/`--cwd`) outside the task repository or into another one.
- Amendments can withdraw unfinished tasks with `removeTasks`; completed or
  depended-on tasks and removals that would orphan a claim are refused unless
  dependencies and coverage move in the same amendment, and removed task IDs
  are never reused. A completed task's verify, paths, or `dependsOn` change
  only with `reopen: true` (`change amend … --verify <cmd> --reopen`), which
  unticks it so the harness verifies it again.
- Change inspection and start print an advisory when a verify runs `go test`
  without `-v`, whose default output Prove cannot count.
- Land merges a user's uncommitted target edit on lines the change did not
  touch into the sandbox copy itself (`target-edit-sync`, automatic) and
  proves again before Apply; only same-line edits remain a
  `target-edit-conflict`, which the agent merges into the sandbox copy.
- `advance <change> --undo-land --decision-ref <ref>` undoes an archived Land
  whose diff is still uncommitted: it restores the pre-Land bytes of code,
  synced specs, and the archived packet, retires the change, and keeps the
  landed bytes under `.foundation/recovery/land-undone/`. It refuses without
  writing if HEAD moved, a landed path is staged, or a landed path changed
  after Land. The Land journal now keeps its pre-Land backup and the
  pre-archive spec text so undo can restore them.
- `change revise <change> <patch.json> --merge` applies a partial draft over
  the draft the change was compiled from (keyed list merge, `null` deletes,
  `"$remove": true` drops); it refuses after an amendment and for changes
  started before this release.
- Refactor-, config-, docs-, chore-, and test-only changes no longer require a
  failure matrix, and a `bugfix` section no longer moves a low-risk draft to
  standard.
- Declared docs-only rapid changes (`workType: ["docs"]`, added requirements
  only) write no delta spec, so README wording never becomes a living
  requirement.
- `advance` envelopes carry optional `signals[]` (`{code, message}`) for
  restored agreement drift, budget warnings, archive recovery that found the
  change already archived, and settled interrupted applies; the stderr and
  stdout lines are unchanged.
- Causes only the user can clear are typed as `resource`, `credential`, or
  `network` (`decision.category`) and classified where the failure is raised:
  a full disk asks the user to free space instead of telling the agent to edit
  foundation.json, and a push rejected for credentials (403) is a new
  `remote-permission` cause. `deliver advance` asks the user for these; other
  provider failures stay a `WAIT` that names its condition and check command.
  A local `spawn ETIMEDOUT` is no longer reported as a network problem, and a
  reviewer login failure goes to the user.
- Repository-internal quality tooling that no workflow runs anymore is
  removed: coverage, CRAP, trend, debt, and refactoring-plan scripts; the
  runtime, examples, and website mutation configs and baselines; the
  semantic-mutant catalog; 32 `quality:*` / `test:mutation:*` npm scripts; and
  the root `vitest` devDependencies. The release gate keeps only the dashboard
  mutation run with coverage normalization and baseline delta. The
  `claude-foundation quality …` consumer feature is unchanged.
- Pull requests run only `workflow-tests` (`minimum-runtime` and
  `deterministic`). The `code-quality` and `mutation-nightly` workflows are
  removed: their coverage, CRAP, and mutation reports ran out of memory on
  every run and nothing consumed them. `release.yml` still requires fresh
  suite and dashboard mutation evidence before publishing.
- Removed unused repository files: the v2 HTML release notes, the
  unreferenced `examples/solar-system`, and this repository's own legacy
  `.workflow/` index. Consumer `.workflow/` migration is unchanged. Unrun test
  wrappers (`run-host-adapter`, `run-review-assurance`, `run-root-source-validation`,
  `run-feedback-diagnostics`), the ledger test for the removed `ledger-prune.sh`,
  and the retired `.workflow` e2e runner with its judge and prompts are removed.
- Investigate acknowledges discovered sources automatically and still hashes
  them for freshness; the `inspect-sources` round is gone. Facts and options
  must cite an inventoried source, and the report lists discoveries no fact
  cites. Open decisions derive `conclusion.status: needs-user-decision`, and a
  settled record with `changeIntent` concludes in one run; explicit statuses
  stay accepted. Repeated no-progress asks the user only when the repeated
  action was a user question; sandbox or discovery failures go to the harness
  and other stalls to the agent.
- Bare `change revise <change> <draft.json>` and `change amend <change>
  <amendment.json>` inspect in the same call: a missing or stale intake is
  re-inspected, `DONE` applies the edit, and any other action is printed and
  changes nothing. A separate `--inspect` call is no longer needed; every
  existing form keeps working.
- Land is always allowed for stacked changes. A change whose worktree
  branched before another change landed no longer needs that landed,
  uncommitted diff committed first. Land treats the earlier landed bytes, read
  from that change's verified apply journal, as part of the target. When this
  change touched the same file, Land stops with `landed-change-sync`, an
  automatic sync. The sync replays the landed edit into the sandbox copy with
  a 3-way `git merge-file`, proves again what that invalidated, and applies.
  Same-line edits go to the agent as a sync conflict. The agent merges them in
  the sandbox copy, and that edit, bound to the exact target and sandbox
  bytes, is the resolution. Earlier landed bytes are never offered for
  `--restore-target` or restored by it. They no longer appear as "changed
  outside the sandbox" notices or stops. Each change archives in Land order.
- Review follow-up delivery updates the existing pull request. A follow-up
  change that cites a PR another change delivered (its URL in the proposal or
  design) makes `deliver advance` build on that PR's current head, push a
  fast-forward to the same branch, and return `reached: pr-updated`. A closed
  or merged PR, a moved branch or base, or more than one cited delivery opens
  a new PR with a `followUp.notice` saying why.
- A natural request to open a PR ("เปิด PR ให้เลย", "open a PR"), or a yes to
  the guard's delivery question, now runs `deliver advance` as `/deliver`
  instead of turning it into a question.
- One authority rule for the user's chat words (`AGENT.md`, WORKFLOW.md
  "Authority from the user's words"). A reply such as "ลุยเลย", "ทำเลย",
  "ทำไปเลย", or "go ahead" to the spec or amendment question is approval and is
  recorded without asking again; "ทำจนจบ" up front also authorizes Land.
  Urgency alone ("ด่วน", "รีบ demo") and negated requests never authorize.
  Commit and push happen only through `/deliver` or the user's direct
  instruction, which removes the contradiction between `AGENT.md` and the
  git-workflow skill; Land never commits.
- During Build or Prove, `git commit` or `git push` from the main checkout no
  longer runs as an audited shell mutation. Unless the user's latest prompt
  asked for it, the phase guard replaces it with a question for the user
  (block mode refuses it); a yes reply lets the same command run. Commits
  inside the isolated workspace are unchanged.
- `advance` asks the user on the first observation of a cause only the user can
  clear (missing or expired credential or token, VPN/proxy/network denial, a
  reviewer CLI that is not logged in, a full disk, private registry
  authentication) with the fix and the resume command, instead of letting the
  agent resume unchanged three or four times.
- A harness-executed provider that failed and then passes on unchanged content
  is recorded as a flake (`status: fail`, `flake` evidence) and needs a repair;
  resuming unchanged no longer turns it into proof.
- The recovery ladder asks after three unchanged rounds (agent repair,
  `TRY_ALTERNATE_APPROACH`, then a decision with `repetition` evidence). A
  Build verify that keeps failing with identical output now counts, and budget
  windows that reopen three times without delivery progress return a
  `budget-no-progress` decision; changed output or content resets the count.
- No `advance` route hands the agent a lifecycle primitive: `proof run`,
  `proof advance`, `land check`, `land advance`, `sandbox sync|create`, and
  `evidence init` routes are rewritten to `advance <change> --through <target>`.
  An indeterminate provider run and an amended-agreement conflict are answered
  through `advance --decision` instead of `proof advance --retry-indeterminate`
  and `sandbox sync --resolve`.
- OpenSpec is required only from Prove onward: a missing CLI no longer stops or
  installs during Build; Prove prepares it with the existing handoff. From
  Prove on, the strict OpenSpec lint is required and an absent CLI fails
  closed instead of letting an unlinted agreement reach archive.
- A grounding readSet that cites an untracked `openspec/investigations/` record
  no longer blocks sandbox creation, and no portability refusal asks for a
  commit.
- Change produces a dev document that Build executes and a reviewer reads.
  A rapid proposal carries the compact summary, user flow, failure matrix,
  and authored descriptive sections. Tasks, dependencies, and verify commands
  live in `tasks.md`. A standard v4 change always writes `design.md`, adds the
  sections its work type needs, and derives the file map, folder tree, and
  test map from tasks. The harness infers `workType` from task paths; `why`
  supplies the lead and `summary` is optional. A standard v4 draft
  missing a section its work type needs (`failureMatrix`,
  `userFlow`, `uiStates`, `componentMap`, `apiContracts`, `dataModel`, and so
  on) gets a draft issue the agent repairs.
- Dev document fixes from dogfooding. Task paths absent from the main checkout
  show `+` in the design's folder tree (rooted at `.`) and `add` in the derived
  file map. Descriptive sections (`fileMap`, `failureMatrix`, `testMap`,
  `componentMap`, `userFlow`, `configContract`, `refactor`) no longer move a
  small low-risk draft to standard; the rapid proposal renders authored
  sections. Scope comes from the requirement outcome or statement, not the
  first scenario's `then`, and a code-shaped
  trigger names its scenario after the requirement. The derived test map
  lists scenario names and a Check column. Optional columns and API lines
  (Covers, Idempotency, Compatibility) render only when supplied. `design.md`
  states an inferred work type and reads flow, components, contracts,
  failures, file map, and test map; tasks live only in `tasks.md`.
  Repair messages say to declare
  `workType` to override. Inference treats `.tsx`/`.jsx` under routes as UI,
  matches `config.*` files, and treats test-, docs-, or manifest-only
  changes as light work. The template adds `workTypeExamples` and quoted
  flowchart labels.
- Mermaid flowchart node labels with an unquoted `(`, `)`, or `"` are a draft
  shape issue that names the quoted fix (`A["mean(values)"]`).
- A consumer's source inventory skips install-managed paths
  (`.claude/harness`, skills, rules, hooks, `WORKFLOW.md`, ...) unless a
  draft names one as a source.
- Low-risk fast-tier review runs at medium reasoning effort; the configured
  model and any escalation keep high effort.
- Change derives discovery coverage from the draft. A required dimension with
  no authored row becomes `covered` when draft content states it:
  `currentState`, `userStories`, requirements, scenario `kind`
  (`success`, `failure`, and the new `boundary`), `compatibility`, `nonGoals`,
  tasks with `verify` and evidence, `failureMatrix`, `apiContracts`,
  `dataModel`, `uiStates`, `jobContract`, and documented `integrations`. The
  proposal appendix marks these rows `covered (derived)` and names the source
  fields. Without backing content the dimension stays missing, an authored row
  always wins, and `needs-user-decision` rows are still asked. The template no
  longer asks for derivable rows. Draft v3 is unchanged.
- Each fact is written once. Without an authored `failureMatrix`, scenarios of
  `kind: "failure"` become its rows (an optional scenario `recovery` fills the
  recovery column), so the draft no longer has to repeat them. `why` now
  satisfies the dev document's lead; `summary` stays optional, and the template
  asks only for `why`.

### Fixed

- Closure review availability now compares the review provider's subject hash
  with the failed delta's subject, so a repaired provider is not incorrectly
  sent to the exhausted-review user gate by the global workspace hash.
- Prove overlaps configured review with the asynchronous base-source test
  check even when every executable provider reuses Build evidence. A failed
  base-source check also joins the reviewer before returning recovery.
- Base-source test discrimination recognizes plain `sh -c` runner commands
  emitted by compiled drafts and narrows them to changed test files when
  supported; shell expressions retain their full configured command. Its
  verdict cache binds the effective execution environment by digest.

- A configured review whose reviewer finished after the content it judged had
  changed (a provider writing tracked files beside the concurrent review, or an
  edit) could be recorded and rebound to the new bytes, because the post-review
  hash came from the process-local snapshot cache. The hash is now re-read from
  disk before recording; a superseded verdict is dropped (attempt closed as an
  error, request `aborted`, no receipt) and the current content is reviewed
  again. A readiness hash read from a stale cached snapshot also disabled the
  concurrent review for the single-process Build-to-Prove route; `advance`
  now re-derives it from the forced snapshot.
- `packet <change> --task <id>` for an already-completed task prints that
  task's read-only packet (`executionAuthority.status: "completed"`,
  `readOnly: true`) instead of `BLOCKED: unknown pending task`; `agents task`
  still dispatches only pending tasks and unknown ids still block.

- A writable sibling repository declared outside the root (`../sdk` with
  `allowOutsideRoot: true`) can own draft tasks again. `change start` no longer
  reports it as undeclared, and `change start --template` lists it, with
  `mode: "read"` on a read repository. A task that edits files in a read
  repository is now an agent repair at start. Build, Prove, and Land already
  handled siblings. An outside path needs only `allowOutsideRoot: true`; its
  `type` may stay `git` (the default) or be `external`, which behave the same.

- Isolated-copy sandboxes no longer lose a user's uncommitted target edit.
  Re-applying after an earlier Land holds every newly touched path to the
  copy's recorded baseline, including its executable bit, the same overwrite
  rule as worktrees and root re-delivery. A path the baseline does not record
  is treated as edited. A copy now keeps its base bytes in a content-addressed
  store under `.foundation/copy-base/`. With them, a clean target edit merges
  through the harness (`target-edit-sync`), `keep-target` and `--restore-target`
  work, and regenerated artifacts are restored. A copy sync conflict settles
  through `advance` only when a 3-way check proves the target's edit is in the
  merged copy; a changed copy alone, or a base that was never stored (large,
  binary, or already gone), stays a conflict.
- A semantic draft that omits or understates `impact`/`coupling` no longer
  defaults to the rapid lane. The harness derives them from the draft: tasks
  spanning two `services/`, `packages/`, `apps/`, `libs/`, or `modules/` roots,
  several repositories, integrations, or external operations are coupled;
  persistence paths (`*.sql`, `migrations/`, `db/`, `schema/`), API/async work
  types, and (without a declared `workType`) requirement text naming
  migrations, rollbacks, databases, APIs, endpoints, payloads, or event/message
  contracts are at least medium. A declaration never lowers the derived value;
  the proposal Impact section and the start `NOTE` name the reason, and the
  standard-lane `EDIT` says why the lane is standard. Small single-root
  features, bugfixes, refactors, and docs stay rapid. In the paid benchmark,
  a cross-service event contract, a migration rollback, and two JSON APIs
  compiled as rapid without `design.md`.

- A corrupt review attempt chain no longer stops with a
  `review-history-corrupt` user decision. The harness moves the chain aside as
  `review-attempts.corrupt-<stamp>`, rebuilds it, and reports a
  `review-history-recovered` signal. The rebuild never lowers the evidenced
  attempt count, reuses a verdict only when its whole chain verifies, and
  otherwise counts unverifiable attempts as spent AI waves, so the change
  continues through the ordinary review-exhausted route.
- Land reads each selected repository's target checkout before archiving. A
  repository whose target lacks the proven sandbox bytes, has work stranded in
  a shared-sandbox submodule placeholder, or is an uninitialized submodule
  stops with `LAND_PROJECTION_MISSING`; nothing is archived or deleted.
  Multi-repository Land re-delivers work committed or edited in a repository
  sandbox after an earlier delivery, and isolation refuses an uninitialized
  submodule instead of forking its superproject.
- Multi-repository Land also re-projects work the root sandbox gained after an
  earlier delivery (a repair, a follow-up, a resumed Land or Deliver) instead
  of stopping with `LAND_PROJECTION_MISSING`; a newly touched root path lands
  only while the target still holds its base content. A submodule pointer the
  root sandbox moved now stops Land before any write instead of being dropped
  silently: an agent repair (`ROOT_POINTER_MOVED`) for a selected repository,
  the user's `repository-pointer-change` decision for one the change does not
  select.
- Abandon and archive back up every unreachable sandbox commit
  (`commits.bundle`), the sandbox delta (`changes.patch`), and unlanded files
  to `.foundation/backups/<id>/<timestamp>/` before removing a sandbox.
  Archive keeps unlanded sandboxes, a sandbox that cannot be verified is never
  removed, and abandon prints each backup path. Re-abandoning a change id
  sets the earlier quarantine aside instead of deleting it.
- Submodule repositories use one location end to end. `advance` EDIT
  envelopes name each task's own `workspace` (a submodule task gets
  `.foundation/repository-sandboxes/<change>/<repo>`), add a `workspaces` map,
  and resolve `contextFiles` in the owning repository's sandbox. The phase
  guard treats writable repository sandboxes as in-workspace and redirects or
  refuses writes into the shared sandbox's empty copy of a selected
  repository; read-only repository sandboxes are not writable.
- Review findings named through root (`root/<submodule path>/<file>`) bind to
  the owning repository instead of exhausting the review request.
- A declared repository's directory or gitlink in the root workspace (missing,
  empty, or bumped) is no longer a root change, so there are no false "root
  changed outside task paths" repairs and no gitlink noise in root review.
- Prove no longer passes Build tasks without verification under the legacy
  review circuit. The circuit is the default for a `foundation.json` without a
  `workflow` block, and it used to mark every task node `legacy-policy`. Runtime
  state written before graph execution also used to pass as `legacy-upgrade`.
  Every task node now needs current task execution authority. A ticked task
  without that authority stops Prove and routes to `advance`, which re-verifies
  it by running its check. Review circuit defaults are unchanged.
- `land record` no longer switches a current multi-repository change into the
  legacy commit-based Land saga. It now accepts a child commit only for a
  transaction that the retired flow already started. For any other change it
  refuses and routes to `advance <change> --through archived`, because Land
  never commits.
- Git-ignored files are no change's content: under each selected repository's
  own ignore rules Land never compares, projects, or reports them as target
  edits or unlanded sandbox work. A tracked file stays content.
- `land check` runs Land's own pre-mutation preflight read-only, so it stops on
  the code Land would; `land advance` prints only the `advance --through
  archived` JSON envelope, on its first run as on every later one.
- A single-repository re-apply never overwrites a target edit: a path the
  earlier apply never wrote must still hold its base bytes and executable mode
  (or already the sandbox's), otherwise it takes the target-edit route.
- Abandon also quarantines the change's review requests and reports,
  instruction manifests, open attestation challenge, and delivery record, so a
  reused id starts with a fresh review budget and no inherited state. When an
  older abandon or a Land undo left such bookkeeping behind, creating a change
  with that id moves it into the newest retirement record.

[Unreleased]: https://github.com/hashtagf/changeloop/compare/v3.7.5...HEAD
[3.7.5]: https://github.com/hashtagf/changeloop/compare/v3.7.4...v3.7.5
[3.7.4]: https://github.com/hashtagf/changeloop/compare/v3.7.3...v3.7.4
[3.7.3]: https://github.com/hashtagf/changeloop/compare/v3.7.2...v3.7.3
[3.7.2]: https://github.com/hashtagf/changeloop/compare/v3.7.1...v3.7.2
[3.7.1]: https://github.com/hashtagf/changeloop/compare/v3.7.0...v3.7.1
[3.7.0]: https://github.com/hashtagf/changeloop/compare/v3.6.11...v3.7.0
[3.6.11]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.10...v3.6.11
[3.6.10]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.9...v3.6.10
[3.6.9]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.8...v3.6.9
[3.6.8]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.7...v3.6.8
[3.6.7]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.6...v3.6.7
[3.6.6]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.5...v3.6.6
[3.6.5]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.4...v3.6.5
[3.6.4]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.3...v3.6.4
[3.6.3]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.2...v3.6.3
[3.6.2]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.1...v3.6.2
[3.6.1]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.6.0...v3.6.1
[3.6.0]: https://github.com/Maximumsoft-Co-LTD/claude-foundation/compare/v3.5.30...v3.6.0
