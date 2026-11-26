# Change Loop maintainer guide

## What this repository is

**Audience:** agents and maintainers developing Change Loop itself. This file
is the upstream repository's instruction manual, not a template that replaces
a consumer project's `CLAUDE.md`. Installed file ownership and writer rules
live in [the harness reference](.claude/harness/README.md#file-ownership-and-writers).

This is the upstream source of Change Loop (`cloop`), an installable,
OpenSpec-native control plane for AI-assisted changes
(`Investigate? → Change → Build → Prove → Land`); see
[WORKFLOW.md](WORKFLOW.md) for the lifecycle and ownership.

New changes use semantic draft v4: the harness owns risk-derived discovery
coverage and decision-frontier validation, while the compiler owns stable
cross-ledger links and creates optional artifacts only for real concerns. Drafts
v4 and v5 are accepted. The normal host path
after Change is `advance --through build|proven|archived`; low-level commands
remain supported operator and integration primitives. OpenSpec stays canonical.

Work here changes the harness shipped to real consumer repositories. A broken
command, skill, hook, or runtime rule is this project's bug to fix—not a rule to
work around. Public command names and arguments are compatibility contracts.

## Why it exists

Change Loop makes completion content-bound and resumable:

- Build occurs in a declared isolated workspace.
- Every phase uses one compiled execution contract and lifecycle reducer.
- Gates evaluate independent findings once, repair one ordered batch, and rerun
  only invalidated checks.
- Product repair has no fixed retry count while progress changes.
- The harness prepares required tools and retries failed repository setup before
  execution; host permission or harness bookkeeping never becomes a user-run
  recovery command.
- Real authority, resource, budget, conflict, or repeated no-progress boundaries
  preserve state and return an exact resume route.
- The normal code-delivery flow succeeds at `archived`, never merely `proven`.
- Land leaves an uncommitted target diff and never commits, pushes, or opens a
  pull request; only the optional `/deliver` command may, under its own explicit
  authority. `.claude/harness/lifecycle/land.md` and `deliver.md` own the full
  Land and Deliver contracts.

## Sources of truth

| Question | Source |
|---|---|
| User entrypoints and first-change summaries | `README.md`, `README.th.md` |
| Detailed lifecycle contract | `WORKFLOW.md` |
| Runtime structure and operator commands | `.claude/harness/README.md` |
| Providers, receipts, and proof semantics | `.claude/harness/EVIDENCE.md` |
| Public CLI registry | `.claude/harness/commands.json` |
| Wire-visible versions | `.claude/harness/protocol.json` |
| Installed-file ownership | `install.sh` `MANAGED` array |
| Skill routing and skill catalog rules | `.claude/rules/fundamentals.md`, `openspec/specs/skill-guidance/spec.md` |
| Deterministic suite ownership | `.claude/tests/README.md` |
| Current scenario/release status | `docs/reports/user-scenario-release-status.md` |
| Scenario acceptance portfolio | `docs/reports/user-scenario-test-plan.md` |
| Release procedure | `RELEASING.md` |
| Advisory review rules and severity | `REVIEW.md` |
| Visual rules for the repository's own interfaces | `DESIGN.md` |
| Documentation ownership and editing rules | [docs/documentation-ownership.md](docs/documentation-ownership.md) |
| Installed versus repository-only files | [docs/shipping-boundary.md](docs/shipping-boundary.md) |
| Code and policy owners | `.github/CODEOWNERS` |
| Incidents and durable lessons | `openspec/incidents/`, `openspec/lessons.md` |

Do not copy a detailed contract into several documents. Update its canonical
source and link to it from summaries. Dated reports are historical evidence and
must not be rewritten as current status.

## Documentation ownership

The author changing a contract updates its documentation in the same change;
a reviewer checks meaning and English/Thai parity. File responsibilities,
website page owners, and the editing and review rules live in
[docs/documentation-ownership.md](docs/documentation-ownership.md). The
guardrails run in `.claude/tests/docs/run-doc-consistency.sh`.

## Repository map

See [docs/repository-map.md](docs/repository-map.md) for the shipped and
repository-only folders and the focused checks per kind of change.

## Shipping boundary

`install.sh` `MANAGED` is authoritative for overwritten product files;
`CLAUDE.md`, `AGENTS.md`, consumer configuration, OpenSpec changes, and
`.foundation` state are project-owned and preserved. Vendored skills,
unshipped harness tests, and repository-only dependencies are covered in
[docs/shipping-boundary.md](docs/shipping-boundary.md).

## Development workflow

1. Classify the change before editing: runtime, instruction, shipping,
   repository-only, or release.
2. Read the smallest canonical source and nearest tests. Preserve unrelated
   dirty-worktree changes.
3. For ordinary product work, dogfood the same Change → Build → Prove → Land
   loop. For bootstrap-breaking runtime pins, installer ownership, or release
   mechanics, edit at root and use deterministic verification directly.
4. Put runtime code in the appropriate `.claude/harness/runtime/` domain and
   keep `foundation.mjs` as the composition root.
5. When an agent repeats a mistake, encode the fix as a lint rule in
   `scripts/lint/plugin.mjs` (message names the root-cause fix), a test, or an
   API change, not another line of prose. `scripts/lint/ratchet.mjs` keeps
   harness lint and `tsc --checkJs` type findings (`types/TS<code>`) and large-file sizes, including `foundation.mjs`, from
   growing; run `--tighten` after cleanup and commit the lowered baseline.
   Timers go through `runtime/core/timing.mjs` and deliberately ignored
   failures through `runtime/core/best-effort.mjs`; lint allows neither
   anywhere else.
   Guidance that restates a validation rule (templates, repair hints) is
   generated from the validator's own constants and tested against it, never
   retyped. A required free-text field accepts `none: <reason>` rather than
   forcing an invented value, and every repair names the derived cause and a copyable fix.
   A rule added to this file or `AGENTS.md` gets a row in
   `quality/rule-enforcement.json` naming the check that enforces it, or a
   judgment call; `scripts/quality/scorecard.mjs --check` fails on a stale
   quote and when prose-only rules exceed their ceiling.
   A new or changed skill needs `.claude/skills/<name>/contract.json`
   (trigger, inputs, action, outputs, handoff, and who does or decides
   what); `scripts/lint/skill-contracts.mjs` checks it.
6. Add the lowest-level regression that would have caught the defect. A new
   suite requires its script, registration in `.claude/tests/run-all.sh`, and a
   row in `.claude/tests/README.md`. A new user-facing command, user state, or
   runtime group needs its feature in `docs/feature-map.json`; regenerate the
   page with `node scripts/docs/feature-map.mjs --write`. A test that fails
   only under machine load is a timing defect: fix its window or seam, never
   rerun it until green.
7. Update canonical documentation and English/Thai public mirrors together.
   Change `.claude/harness/protocol.json` only for a wire-visible contract.
8. Run affected checks while iterating, then the default gate before commit;
   a passing Prove `static-analysis` receipt for the landed change counts as the
   default gate, but if files were edited after Land, run the default gate again.
   CI runs the complete `--full` set on every push. The default gate also runs
   a slow suite that alone checks a changed file (printed CLI output promotes
   the installer smoke; `PROMOTED` in `affected-suite-selector.mjs`). Review `git diff --check` and the final status; do not commit generated
   benchmark output or temporary consumers.

## Verification commands

Prefix shell commands with `rtk`; in a command chain, prefix every segment.

```bash
rtk test bash .claude/tests/run-all.sh --affected
rtk test bash .claude/tests/run-all.sh
rtk test bash .claude/tests/run-all.sh --full   # CI runs this on every push
rtk test bash .claude/tests/docs/run-doc-consistency.sh
rtk npm run build                         # from website/docs
rtk npm run bench:openspec-native:sentinel
rtk npm run release:preflight
rtk git diff --check
rtk npm run quality:scorecard            # code health, rule enforcement, pyramid readiness
rtk node scripts/quality/coverage-ratchet.mjs  # harness coverage (slow tier, about 3 minutes)
```

The default `run-all.sh` (fast tier, about two minutes) is the local gate
before commit. `run-all.sh --full` adds the slow tier; CI runs it on every push
and pull request, and a green full run is required before merge or release. A
changed shipped file needs both. Paid scenario
runs are separate release evidence: they require explicit spend authority,
must use disposable consumers, and must finish at `archived` with oracle and
clean-install verification. A release-report exit code 2 is a truthful promotion
blocker, not a deterministic test failure.

Before every new version, complete the scenario checkpoint in
[RELEASING.md](RELEASING.md). Retain a dated curated comparison in `docs/reports/`
and the raw evidence outside Git. Historical results never satisfy a new
candidate's checkpoint; paid execution remains explicitly budget-authorized.

## Change-specific gates

Focused checks per kind of change: [docs/repository-map.md](docs/repository-map.md#change-specific-gates).
The runtime API has four pins and all must agree: `cli.sh
EXPECTED_RUNTIME_API`, `.claude/harness/foundation.mjs RUNTIME_API_VERSION`,
`.claude/harness/runtime/version.mjs RUNTIME_MODULE_API`, and
`.claude/harness/protocol.json runtimeApi`.

## Working rules

- Use `tasks.md` as the sole implementation ledger; do not create shadow status
  files.
- Treat risk and evidence—not diff size—as the assurance selector. Size controls
  budget and slicing only.
- Do not inspect or patch generated receipts, proof, or Land journal JSON.
- Keep user interaction to intent, consequential semantics, explicit Land, or
  external-side-effect authority. Agent work stays with the agent and
  deterministic workflow/setup/permission/recovery work stays with the harness.
- Before Land, only user decisions stop the flow; Land is the single hard gate
  ([WORKFLOW.md § Blocking policy](WORKFLOW.md#blocking-policy)). Live guards
  advise rather than refuse; only secret redaction is enforced by default.
- Optimize for delivery: reuse identity-valid work and run only dependency-
  invalidated Build, Review, and Prove work across all selected repositories.
- Preserve fail-closed isolation and unknown-as-unavailable measurement semantics.
- Do not weaken evidence, silently widen scope, infer user authority, or report
  `proven` as completion for a delivery flow.
- Do not commit, push, publish, or start paid execution without the corresponding
  user authority.
