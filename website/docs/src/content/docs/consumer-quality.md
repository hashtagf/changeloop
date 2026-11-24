---
title: Consumer quality gates
description: Add changed-code CRAP, mutation testing, language profiles, baselines, and quality debt to one or many repositories.
---

<!-- docs-audience: project-maintainers -->
**Audience:** project maintainers and authorized agents configuring an installation. For the everyday workflow, start with [Quickstart](/docs/quickstart/).

## Why turn it on

Passing tests do not tell you whether the code a change touched is hard to
maintain or whether the tests would notice a real bug. Quality gates add two
checks on changed code only: **complexity against coverage**, and **mutation
testing**, which asks whether the tests fail when the code is deliberately
broken. Without them, a change can be "proven" with weak tests.

**Enable it when** your project has a working test suite, you are about to
approve higher-risk changes (security, data, shared logic), or you want
a reviewable record of quality debt. Skip it for throwaway prototypes.

**What you will see:** nothing blocks you at first. The feature is opt-in and
starts in **report-only** mode: the agent runs the checks and each
[receipt](/docs/glossary/) records the result and any reduced assurance. You
decide when to approve a baseline and when to enforce.

Change Loop orchestrates project-owned quality tools without pretending one
metric fits every language. You need to decide only two things: whether to turn
it on, and when to move from report to enforcement.

```text
discover → preview config → diagnose tools → pilot reports → approve baseline → enforce
```

Quality findings are evidence, not permission to edit. A high score outside the approved Change becomes debt; it does not expand task or repository scope.

## For agents and integrators: the checks and commands

The rest of this page documents what the gates measure and the commands that
run them. Which Changes require quality evidence is set by `quality.changeGate`
in [`foundation.json`](/docs/foundation-config/); how each repository produces
it is set in `quality/foundation-quality.json`.

## What the gates measure

**CRAP Score** combines cyclomatic complexity with function coverage:

```text
CRAP = complexity² × (1 − coverage/100)³ + complexity
```

Change Loop recomputes the score rather than trusting a provider-supplied value. By default, changed unit code needs 80% coverage, changed integration code 70%, and a critical journey 50%. A new function fails at CRAP 30 or above; an existing function fails when it regresses from a compatible baseline. Changed complexity above 30 also fails.

**Automated mutation** checks whether ordinary tests distinguish small code changes. Killed mutants count; survived, no-coverage, timeout, compile error, runtime error, and unavailable results do not. A skipped mutant is not assumed equivalent. Equivalent suppression needs an explicit reason or a narrow approved exception.

**Semantic mutation** targets domain faults—removing a tenant filter, skipping a transaction, ignoring a returned error, or breaking keyboard focus. Its kill-rate threshold is independent of aggregate automated mutation.

## Start safely

Discovery reads manifests and filenames but executes no project command:

```bash
cloop quality discover
cloop quality init
cloop quality init --write --ci github
cloop quality doctor
```

`quality init` only previews until `--write`. It creates `quality/foundation-quality.json`. With `--ci github`, it also installs:

- a reusable/manual changed-code workflow;
- a four-shard nightly inventory workflow; and
- a full enforced release workflow.

For JavaScript/TypeScript, discovery recognizes the project-owned package scripts `foundation:quality:crap` and `quality:crap`. The command must emit `foundation-crap-v1` at `.foundation/quality/crap.json`; without either script or an explicit provider, CRAP is not measured.

The reusable workflow is not a `pull_request` trigger by itself. Call it from the repository's existing PR workflow and pass the Change ID. Add each project's language setup before `quality doctor`; Change Loop does not install runtimes or quality tools.

Run a pilot against the isolated workspace for a Change:

```bash
cloop quality run --change <change-id>
cloop quality report
cloop quality run --change <change-id> --enforce
```

Once the committed quality config exists, evidence bootstrap can wire the enforced run as a `static-analysis` provider. Its receipt records the aggregate assurance and retains the per-repository report in the command log.

## How ready is the project

`cloop quality readiness --pretty` scores the project against the testing pyramid, strongest layer first: **codebase** (file size, nesting, copied blocks, module boundaries, feature map), **static** (lint, types, stopgap comments), **verification** (tests, CRAP or coverage, mutation), **prose** (recurring lessons and the rules in `quality/rule-enforcement.json` have real checks, and every must/never/always sentence in `CLAUDE.md`/`AGENTS.md` has a registry row), and **review** (every closed incident names a regression test that exists; most changes pass proof the first time and few defects escape, once three changes are archived). A lane counts twice: once for stopping growth, once for clearing existing findings. Anything without a measurement is shown as unmeasured, never as zero or a pass. `cloop doctor` shows the same percentages and the next step for the weakest layer, and the `onboard` skill drafts what is missing. Every row also says in plain words why it helps the work. A project with no quality configuration gets a single step: run the `onboard` skill. The agent sets up every check and asks you only to confirm the baselines and drafts. A test lane counts only while its latest run passes, finishes within two minutes, and gives the same result for unchanged code; a project also needs a verify route (a verify skill, an end-to-end or smoke suite) so the agent can run the real thing. When one of these is missing it is the next step, before lint or other static checks. Readiness shows that the checks exist, not that the work improved: `cloop outcomes` compares archived changes before and after onboarding (first-proof pass, repair rounds, your decisions, lead time, cost, escaped defects) and reports a difference only once each side has three changes. In a topology of many repositories, onboard a few at a time: the `onboard` skill reads the ranked `candidates` from `cloop quality readiness` (repositories with recorded work first, then sensitive areas such as auth or payments, then ones whose lint or type tools are already declared), asks you which to onboard, and runs `cloop quality init --write --repo <id>,...`. Repositories not onboarded yet are reported as such instead of failing a change, readiness shows each onboarded repository's layers and its UI rows read from that repository's own files, and `cloop outcomes` compares each repository before and after its own onboarding date. Change Loop scores its own repository with the same criteria. A project with a user interface also gets five UI rows: design tokens (codebase; met only when no stylesheet writes a color outside a token), an accessibility lint (static), a rendered browser check and an accessibility check on rendered pages (verification), and one `DESIGN.md` (prose); a project without one shows none of them.

## Language profiles

| Surface | Profile | Appropriate controls |
|---|---|---|
| JavaScript / TypeScript | `application-js-ts` | tests, static checks, Istanbul + complexity, automated and semantic mutation |
| Go | `application-go` | `go test`, `go vet`, gocyclo + cover, mutation, compatibility and resilience |
| Python | `application-python` | pytest, static checks, Radon + coverage.py, mutation |
| PHP | `application-php` | Composer/PHPUnit, Clover, mutation |
| Bash | `script-bash` | tests, ShellCheck/static, state identity and semantic faults |
| SQL | `database-sql` | isolated integration, compatibility, migration, performance and semantic faults |
| MongoDB | `database-mongodb` | isolated data fixtures, schema/query/migration faults |
| HTML | `web-markup` | validation, browser and accessibility evidence |
| CSS / Sass | `web-style` | lint/build, browser, accessibility and responsive evidence |

Change Loop deliberately does **not** invent CRAP values for Bash, SQL, MongoDB, HTML, CSS, or Sass. Unsupported, unavailable, and unmapped capabilities never become zero or pass.

**Findings ratchet** covers lint, type-check, file size, module boundaries, stopgap comments, duplicated blocks, and nesting depth. Each finding is recorded per file and rule; existing findings become a baseline that may only shrink. A new finding, a tracked file that grows, or a new file longer than `policy.findings.fileSizeCeiling` (default 1000 lines) fails. Before a baseline exists the lane passes with reduced assurance and tells you to run `cloop quality baseline --write`, so turning the ratchet on never fails every existing finding at once. Module boundaries declare which folders may import which; a relative import between modules that `allow` does not list is a finding whose message says where the shared code should go:

```json
"module-boundaries": {
  "kind": "builtin", "adapter": "module-boundaries", "isolation": "read-only",
  "modules": [
    { "name": "ui", "paths": ["src/ui/**"] },
    { "name": "data", "paths": ["src/data/**"] },
    { "name": "shared", "paths": ["src/shared/**"] }
  ],
  "allow": { "ui": ["data", "shared"], "data": ["shared"] }
}
```

`workaround-comments` records each comment line with an upper-case `TODO`, `FIXME`, `HACK`, or `XXX` (or the word workaround), and `duplication` records each block of at least 8 significant lines (`window`) copied from earlier code, and `nesting-depth` records each file whose deepest line nests more than 5 levels (`maxDepth`; a rough line scan, not a parser); none needs a project tool, and the baseline absorbs what already exists.

Discovery adds `file-size`, `workaround-comments`, `duplication`, and `nesting-depth` to every application profile, `type-check` (`tsc --noEmit`) when the project has TypeScript and `tsconfig.json`, and `lint` (`eslint -f json`) when it has ESLint. For Go it adds `type-check` through `go vet`, and `lint` (golangci-lint JSON) when a `.golangci.*` config exists. For Python it adds `pytest`, `ruff`, and `mypy` only when the project declares them in a config file or section, or as a dependency; a stray script never becomes a test lane. Python commands use `python`, or `python3` where only that is installed, and write bytecode under `.foundation/`, so a run leaves `git status` unchanged. For JavaScript and TypeScript, discovery also drafts `proposals.module-boundaries` from the project's real imports, including path aliases such as `~/` or `@/` from tsconfig `paths` (guessed from the layout for you to confirm when there is none) and Vue, Svelte, or Astro components: one module per directory under the source root (tests and hidden directories left out), every import direction the code already has allowed so the lane starts clean and fails only a new one, and each import cycle listed for you to decide. `quality init` never writes the draft; the `onboard` skill adds it after you agree. An exit code of 1 from these tools is how they report findings; the ratchet, not the exit code, decides the lane.

## Providers and built-in normalizers

The project owns every command and pinned tool version. A `command` provider emits a Change Loop protocol from stdout or a declared output file. A `builtin` provider runs a project command and normalizes native reports with one of these adapters:

- `javascript-istanbul`
- `go-complexity-cover`
- `python-radon-coverage`
- `php-clover`
- `canonical-functions`
- `generic-mutation-json`
- `eslint-json`, `tsc-text`, `ruff-json`, `mypy-text`, `golangci-json`, `go-vet-text`, `file-size`, `module-boundaries`, `workaround-comments`, `duplication`, `nesting-depth`, and `generic-findings-json` (`foundation-findings-v1`) for the findings ratchet; an input path of `-` reads the command's stdout

CRAP and mutation reports bind the repository ID, commit, workspace digest, language, tool version, adapter version, and configuration digest. A report from another workspace or incompatible tool configuration cannot silently become the baseline for the current run.

## Baselines, debt, and exceptions

Review pilot findings before creating a baseline:

```bash
cloop quality baseline
cloop quality baseline --write \
  --decision-ref ADR-42 --reason "approved pilot baseline"
```

Baselines are versioned per repository and capability. Mutation comparison scopes the baseline to the current affected paths, so a previous Change's mutant set is not compared with an unrelated Change.

Run the inventory and render debt without widening the active Change:

```bash
cloop quality run --full
cloop quality debt
```

Large inventories accept `--shard-index <zero-based>` and `--shard-count <n>`. Each lane is assigned deterministically; failed repositories are never hidden by an average.

An exception names exactly one function or mutant—never a glob—and requires an owner, approver, risk, compensating evidence, tracking issue, and expiry no more than 90 days away.

## Safety and rollout

- Mutation uses tool isolation or a Change sandbox. A `harness-sandbox` provider without `--change` is unavailable.
- Change Loop compares Git status before and after a provider; failure to restore the workspace fails the lane.
- SQL and MongoDB providers must use per-run isolated databases, never a shared or production database.
- A selected repository missing from quality config fails closed.
- Missing capabilities lower assurance and remain visible even when policy permits compensating evidence.

Keep `policy.mode` at `report` for at least three representative runs. Inspect function/path mapping and false positives, approve the initial baselines, then enable enforcement in the PR caller. Nightly owns full debt inventory; release owns the full enforced gate.
