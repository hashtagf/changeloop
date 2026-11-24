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

The `lint`, `type-check`, `file-size`, `module-boundaries`,
`workaround-comments`, `duplication`, and `nesting-depth` capabilities use
`foundation-findings-v1`: findings keyed by file and rule (`file-size` carries
the line count). Existing findings are the baseline under
`quality/baselines/<repository>/<capability>-v1.json`; a new finding, a grown
tracked file, or a new file over `policy.findings.fileSizeCeiling` (default
1000) fails. Without a compatible baseline the lane passes with
`reduced` assurance and names `cloop quality baseline --write`; a changed
tool or configuration digest is never compared against the old baseline.

Built-in adapters: `eslint-json`, `tsc-text`, `ruff-json` (`ruff check
--output-format json`), `mypy-text`, `golangci-json` (golangci-lint v1 or v2
JSON), `go-vet-text` (`go vet ./... 2>&1`), `generic-findings-json` (read a
report file, or the command's stdout when the input path is `-`),
`file-size` (no tool; every code language the code-health lanes scan), and `module-boundaries` (`modules`: name and path
globs; `allow`: which modules each may import; relative JavaScript and
TypeScript imports, plus the keys in `aliases`: a prefix such as
`{ "~/": "src/" }`, or a workspace package name such as
`{ "@acme/core": "packages/core/" }` for the package and its subpaths;
`aliases` joins the configuration digest only when set), `workaround-comments` (one `comment/<marker>`
finding per comment line with an upper-case `TODO`, `FIXME`, `HACK`, or `XXX`,
or the word workaround), and `duplication` (one `duplication/block` finding per
run of at least `window` significant lines, default 8, repeated from earlier
in path order; blank lines, lone brackets, and bare name lists do not count), and `nesting-depth` (one `complexity/nesting` finding per file
whose deepest line nests more than `maxDepth` levels, default 5, carrying that
depth: braces with strings and comments removed, indentation for Python and
Ruby, shell and SQL skipped; a rough line scan, not a parser). They scan common
source extensions without a project tool and skip files over 512 KiB;
`extensions`, `window`, and `maxDepth` join the configuration digest only when
set. Exit code 1 from a findings tool is accepted as
"findings reported". Discovery adds `file-size`, `workaround-comments`,
`duplication`, and `nesting-depth` to every application profile, `type-check` with TypeScript and
`tsconfig.json`, and `lint` with ESLint, passing the `--ext` and
`--ignore-path` of the project's own eslint script. The test lane is the
`test` script, else `test:unit`, else a declared Jest or Vitest. Scans skip
what `.gitignore` excludes. Type-check criteria are not applicable to
JavaScript without TypeScript or `checkJs`. For Go it adds `type-check` through
`go vet` and `lint` when a `.golangci.*` config exists; for Python, `pytest`,
`ruff`, and `mypy` only when the project declares them (a config file or
section, or a requirements or `pyproject.toml` dependency), never from a stray
script. Python commands use `python`, or `python3` where only that is installed,
with `-X pycache_prefix=.foundation/quality/pycache` so bytecode does not change
the repository status. Tool paths are mapped to repository paths through the
repository's real path too (macOS reports `/tmp` as `/private/tmp`).

For JavaScript and TypeScript, discovery also returns
`proposals.module-boundaries`: a draft lane read from real imports, relative
ones and path aliases (`~/`, `@/`) from tsconfig/jsconfig `paths`, or, when
the code uses `~/` or `@/` without one, guessed from the layout with
`aliasSource` asking the user to confirm. Vue, Svelte, and Astro components
are scanned when the project has them.
Modules are the directories under the source root (the deepest directory that
alone holds nested source; tests and hidden directories are left out), `allow`
lists every direction the code already has so the lane starts clean and fails
only a new direction, and `cycles` lists each import cycle for the user to
decide. `quality init` never writes a proposal; the `onboard` skill adds it
after the user agrees.

## Per-repository onboarding

A topology of many repositories onboards a few at a time. `quality discover
--repo <id>,...` and `quality init --write --repo <id>,...` touch only the named
repositories: init adds them (with `onboardedAt`) to an existing configuration,
keeps the others, and sets `unlisted: not-onboarded`. Without a change,
`quality run` and `quality doctor` then measure only the onboarded
repositories, and doctor reports the rest as one count. `quality readiness`
adds `onboarding` (`onboarded` of `total` writable repositories and up to five
`candidates` ranked by recorded changes, sensitive names such as auth or
payments, and declared lint or type tools) and `repositories`, each onboarded
repository's codebase, static, and verification layers, and its UI rows read
from that repository's own files (design tokens, accessibility lint, rendered
checks, DESIGN.md); the control root of several repositories carries no UI
rows of its own. Each repository row also lists its own agent guide and
`REVIEW.md` when they are not ready. Scans stop at a nested repository (a
directory with its own `.git`), so a root never counts its repositories' files. `outcomes` adds
`onboardingByRepository`, comparing each repository before and after its own
`onboardedAt` on the changes that selected it. Measured on a synthetic
800-repository topology: readiness, doctor, init, and run of the onboarded
repositories each take under three seconds; discovery of every repository
takes about 20 seconds.

## Pyramid readiness

`quality readiness [--pretty]` reports the project against the poteto pyramid,
strongest layer first: codebase (size, nesting, duplication, module
boundaries, feature map), static (lint, types, stopgap comments), verification
(a test lane whose latest run passed, that run within two minutes and gives
one result for unchanged code, a verify route the agent can run end to end,
CRAP or coverage, mutation), prose (recurring lessons and
`quality/rule-enforcement.json` rules have checks, and every imperative
sentence in `CLAUDE.md`/`AGENTS.md` has a registry row), and review (every
closed incident in `openspec/incidents/` names a regression file that exists;
first-proof pass at least 70% and escaped defects at most 10% once three
changes are archived). Each findings lane is judged twice: it ratchets, and its debt is
clear. A criterion without a fact is unmeasured and is never scored; a layer's
percent counts measured criteria only. `doctor` carries the same summary as
the `pyramid` setup row with the next step for the weakest layer, and Change
Loop's own repository is scored with the same criteria
(`runtime/quality/pyramid-readiness.mjs`). Every row carries `why`, a plain
reason it helps the work, for the agent to explain a gap. Without
`quality/foundation-quality.json`, `setup` names one step, running the
`onboard` skill, for every lane row instead of one setup command per lane.

An unmet test, verify, stable-test, or fast-test row is the next step before
any other layer: running tests and the real thing helps an agent more than
static checks (in Meta's 2025 ablation, test feedback raised the solve rate
from 28.5% to 43.9%, static analysis alone to 34.1%). Each `quality run`
records a lane's last ten runs (status, duration, workspace digest) next to its
result. The quality configuration, baselines, and `REVIEW.md` are always read
from the project root, never from a change's sandbox, so a change cannot
loosen the checks that judge it.

Readiness measures whether the checks exist, not whether the work got
better. `outcomes` answers that: it splits archived changes at the first
commit of `quality/foundation-quality.json` and compares first-proof pass,
review repairs, user decisions, lead time, known cost, and declared escaped
defects, each with its denominator. A side with fewer than three changes is
`insufficient`, the matched view keeps only work-type cohorts present on both
sides, and a difference is reported as after minus before, never as an
improvement.

A project with a user interface (a UI framework dependency, or `.tsx`, `.jsx`,
`.vue`, `.svelte`, `.astro`, or `.html` files outside tests) also gets five UI
rows, read from its files and every `package.json` (`runtime/quality/ui-readiness.mjs`):
design tokens (codebase), an accessibility lint (static), a rendered browser
check and an accessibility check on rendered pages (verification), and one
`DESIGN.md` or `uxui.md` (prose). A project without a user interface shows none of them;
they are not applicable, never unmet. The tokens row is met only when a token
source exists (a tokens or theme file, the Tailwind config, or CSS custom
properties) and no stylesheet (`.css`, `.scss`, `.sass`, `.less` outside
tests) writes a color literal outside a custom-property definition; its detail
names the count per file.

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

- A selected repository missing from config fails, unless the config sets
  `unlisted: not-onboarded` (written by `quality init --repo`): then it is a
  passing lane with reduced assurance that says it is not onboarded.
- A required profile capability cannot set `required: false`.
- Unsupported or unavailable capability never becomes pass or zero; reduced
  assurance remains visible in the aggregate.
- Quality does not authorize edits outside the declared Change surface.
- `harness-sandbox` mutation requires a selected Change workspace.
- A provider that does not restore Git status fails.
- Mutation over SQL/MongoDB must use an isolated per-run data store.

When the committed quality config exists, it is the project's static-analysis
wiring: a change whose diff makes the policy infer static-analysis requires it
(it is no longer only an advisory), and evidence bootstrap binds it to
`quality run --enforce`. The generic command adapter
records full/reduced assurance in the receipt observation and preserves the
per-repository summary in the command log.
