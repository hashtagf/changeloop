# Consumer quality runtime reference

This guide ships inside every installed Change Loop harness. Consumer quality is opt-in,
project-tool-owned, multi-repository aware, and report-only by default.

## Operator flow

```bash
cloop quality discover [--change <id>]
cloop quality init [--change <id>]
cloop quality init --write [--ci github]
cloop quality doctor [--change <id>] [--enforce]
cloop quality run --change <id> [--enforce]
cloop quality report
```

Discovery is read-only. Initialization previews unless `--write`; it refuses to
overwrite config or workflows unless `--force`. The committed configuration is
`quality/foundation-quality.json`. Generated results live under
`.foundation/quality/results/`.

For JavaScript/TypeScript, discovery recognizes the canonical project-owned
`foundation:quality:crap` package script and the existing `quality:crap` alias.
The command must emit `foundation-crap-v1` at
`.foundation/quality/crap.json`. Without either script or an explicit provider,
CRAP remains unsupported and must be reported as not measured.

`--ci github` installs three templates under `.github/workflows/`: a
reusable/manual changed-code workflow, a four-shard nightly inventory, and a
full enforced release workflow. The consumer must add language setup and call
the reusable workflow from its own PR trigger.

## Protocols and identity

The installed schemas are:

- `runtime/contracts/quality-capabilities.schema.json`
- `runtime/contracts/crap-report.schema.json`
- `runtime/contracts/automated-mutation-report.schema.json`
- `runtime/contracts/consumer-quality-config.schema.json`

CRAP and automated-mutation reports bind repository ID, commit, workspace
digest, language, tool version, adapter version, and config digest. Baselines
with incompatible identity fail rather than being silently reused.

CRAP uses `complexity² × (1 − coverage/100)³ + complexity`. Change Loop owns the
calculation. Missing coverage must be `unmapped`; providers cannot supply a fake
score. New CRAP at or above 30, changed complexity above 30, coverage below its
class floor, and baseline regression fail.

Mutation scoring counts only killed mutants as kills. Skipped, timeout, compile
error, runtime error, no coverage, and unavailable remain non-kills. Equivalent
mutants require an explicit reason or an approved narrow exception. Baseline
score comparisons are scoped to the current affected paths.

## Adapters and profiles

A provider is either `command` (the project command emits
`foundation-crap-v1` or `foundation-automated-mutation-v1` JSON on stdout or at
its `output` path) or `builtin` (a project command whose native reports a
normalizer converts). Report paths are repository-relative. Mutation declares
`tool` or `harness-sandbox` isolation.

Built-in normalizers: `javascript-istanbul`, `go-complexity-cover`,
`python-radon-coverage`, `php-clover`, `canonical-functions`, and
`generic-mutation-json`.

Profiles cover JavaScript/TypeScript, Go, Python, PHP, Bash, SQL, MongoDB, HTML,
CSS, and Sass. CRAP applies only where function complexity and coverage have a
meaningful mapping. Other surfaces use semantic, integration, migration,
browser, accessibility, compatibility, performance, resilience, or
state-identity controls.

## Findings ratchet

The `lint`, `type-check`, `file-size`, and `module-boundaries` capabilities use
`foundation-findings-v1`: findings keyed by file and rule (`file-size` carries
the line count). Existing findings are the baseline under
`quality/baselines/<repository>/<capability>-v1.json`; a new finding, a grown
tracked file, or a new file over `policy.findings.fileSizeCeiling` (default
1000) fails. Without a compatible baseline the lane passes with
`reduced` assurance and names `cloop quality baseline --write`; a changed
tool or configuration digest is never compared against the old baseline.

Built-in adapters: `eslint-json`, `tsc-text`, `generic-findings-json` (read a
report file, or the command's stdout when the input path is `-`),
`file-size` (no tool), and `module-boundaries` (`modules`: name and path
globs; `allow`: which modules each may import; relative JavaScript and
TypeScript imports only). Exit code 1 from a findings tool is accepted as
"findings reported". Discovery adds `file-size` to every application profile,
`type-check` with TypeScript and `tsconfig.json`, and `lint` with ESLint.

## Baseline and debt authority

```bash
cloop quality baseline
cloop quality baseline --write \
  --decision-ref <ref> --reason <why>
cloop quality run --full \
  [--shard-index <zero-based> --shard-count <n>]
cloop quality debt
```

Baseline writes require explicit decision provenance. Exceptions identify one
function or mutant, never a glob, and require compensating evidence, owner,
approver, tracking issue, risk, and expiry within 90 days.

## Fail-closed rules

- A selected repository missing from config fails.
- A required profile capability cannot set `required: false`.
- Unsupported or unavailable capability never becomes pass or zero; reduced
  assurance remains visible in the aggregate.
- Quality does not authorize edits outside the declared Change surface.
- `harness-sandbox` mutation requires a selected Change workspace.
- A provider that does not restore Git status fails.
- Mutation over SQL/MongoDB must use an isolated per-run data store.

When the committed quality config exists, evidence bootstrap may wire
`quality run --enforce` as static-analysis evidence. The generic command adapter
records full/reduced assurance in the receipt observation and preserves the
per-repository summary in the command log.
