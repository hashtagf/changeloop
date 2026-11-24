# Releasing

How to cut a new version of cloop and update the Homebrew formula.

For the current backend simplification, start with the concise
[release status](docs/reports/user-scenario-release-status.md) and
[scenario test plan](docs/reports/user-scenario-test-plan.md). The status page
separates implementation completion from paid and production evidence; the test
plan defines the executable portfolio without repeating implementation history.

The formula (`Formula/cloop.rb`) ships **two** install paths:

- **Stable** — `url` + `sha256` pinned to a tagged release tarball. `brew install hashtagf/changeloop/cloop` and `brew upgrade hashtagf/changeloop/cloop` use this. This is what the steps below bump.
- **HEAD** — `head "…git", branch: "main"`. `brew install --HEAD hashtagf/changeloop/cloop` tracks `main` and never needs a release.

We follow [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/). Tags are `vMAJOR.MINOR.PATCH` (e.g. `v1.3.0`).

## Required scenario checkpoint before every new version

Before dispatching a publishing release or manually creating a tag, run the
candidate's complete deterministic gate and the zero-cost benchmark sentinel
(`run-all.sh --release` is `--full`, slow tier included, plus the sentinel; the
release workflow uses the same form, and CI must already show a green full run
for the candidate commit; the default local gate alone is not enough), then
complete a budget-authorized smoke of **all paid scenarios** (currently ten) in the
[scenario test plan](docs/reports/user-scenario-test-plan.md). The default smoke
is one independent disposable consumer per scenario. Record the exact clean
candidate commit, requested/actual model, toolchain, budgets, concurrency,
fixture/oracle digests and runner instrumentation. A release-only version
rewrite must retain the mapping from tested preparation commit to tagged
source; behavior changes invalidate the affected candidate evidence.

Compare against the previous stable release with matching workload and
measurement conditions. Reuse its retained evidence only when those conditions
match; disclose non-interleaved batches, missing measurements, and unmatched
scenarios. A single repeat is a smoke check, not a stable speedup claim or the
repeated assurance gate. The portfolio's existing repeat requirements still
apply to assurance promotion.

Each release's lane results are kept so the next release pays only for the new
version. After a checkpoint, `node scripts/release/lane-results.mjs record
<version> <result-dir>` writes `docs/reports/benchmarks/<version>.json`: one
row per lane with its fixture and prompt digest, commit, outcome, oracle score,
wall time, cost (null when unmeasured) and model requests. Before the next
checkpoint, `lane-results.mjs plan <previous-version>` lists the lanes to run:
a lane whose fixture and prompt are unchanged and that the previous record
holds runs on the candidate only; a changed or missing one runs on both. Then
`lane-results.mjs compare <previous> <candidate> --markdown` totals the lanes
with the same task for the dated report.

Required delivery checks must pass: pre-Land hidden oracle, `archived`, measured
quality, ordinary project command, clean install and post-install tests. Preserve
failed runs and unknown measurements. Missing/failed candidate evidence is a
checkpoint blocker; do not publish by treating an old result, `proven`, a zero
placeholder, or a smaller oracle as a pass. Record unresolved regression and
measurement findings in the dated report before repair and selective reruns.

Retain a curated dated report in `docs/reports/`, link it from the report index
and current scenario status, and archive the raw run bundles with a SHA-256
checksum outside Git and outside disposable `.foundation` state. Keep the
source pins, denominators, budgets, measurement gaps, failures and resume route
reviewable. The retained
[v3.6.0–v3.6.2 cohort](docs/reports/scenario-benchmark-v3.6.0-v3.6.2-2026-10-08.md)
is the historical starting reference; its tracker failure remains unresolved.

This is a maintainer checkpoint before the publication workflow, not a scheduled
paid CI job. Execute paid runs only within explicit user-authorized scope and
budget; a release request alone does not supply an unlimited spending allowance.
Operator commands and assurance semantics remain in the
[benchmark protocol](.claude/tests/bench/openspec-native/README.md).

## One-action release (recommended)

After the required scenario checkpoint, `.github/workflows/release.yml` does the mechanical release on a current-Xcode macOS runner. Complete the release notes and dispatch it:

1. **Write the changelog.** Add the release's entries under `## [Unreleased]` in `CHANGELOG.md` and push to `main`. (This is the only hand-written part; everything below is automated.)
2. **Trigger the release.** Actions tab → **Release** → *Run workflow* → enter the new version (e.g. `2.5.11`). Or: `gh workflow run release.yml -f version=2.5.11`.

The workflow pins the dispatched `main` commit and validates it in a fast first job. The expensive evidence then runs in parallel: the pull-request CI suites, the `run-all.sh --release` gate in four macOS shards, dashboard mutation, and the upgrade matrix in four shards against the candidate rewritten by `scripts/release/rewrite-version.sh`. The release job on macOS starts only after all of them pass. It then rewrites the version and changelog with that same script, verifies upgrades to that version, and checks that the release can merge into the latest `main` before it tags anything. It then tags the release commit, publishes GitHub and Homebrew artifacts from that tag, and merges the release and formula commits into `main`. Later `main` commits are preserved but are not part of the release. A conflict found before tagging stops the release; if `main` changes after publication, the workflow retries the merge and, if needed, reports the exact commit to merge.

It refuses to run if the dispatched commit is no longer on `main`, the
version is malformed, the tag already exists, or `## [Unreleased]` is empty.

> **Rehearse when the release machinery changed.** Run with **`dry_run: true`**
> (`gh workflow run release.yml -f version=2.5.11 -f dry_run=true`) to do the
> edits, deterministic and mutation gates, and bottle build **without** pushing,
> tagging, or publishing anything. An ordinary product release does not need a
> second rehearsal when the release machinery is unchanged.

A successful rehearsal on `main` uploads a seven-day, source-bound evidence manifest. To
publish the exact same proposed version and source commit without repeating the
expensive gates, pass that rehearsal's Actions run id:

```bash
gh workflow run release.yml \
  -f version=2.5.11 \
  -f rehearsal_run_id=<successful-dry-run-id>
```

The publishing run verifies that the referenced run succeeded and that its
version, source commit, release workflow, dependency lock, candidate rewrite,
semantic/deterministic checks, automated mutation check, and bottle rehearsal
all match. Omitting `rehearsal_run_id` keeps the self-contained path and runs
fresh evidence. Input, tag, changelog, checkout, and structural checks always
run first, before dependency installation.

> **Coverage.** The bottle is built on one pinned arm64 macOS runner (`macos-15` → `arm64_sequoia`, which also pours on `arm64_tahoe`/macOS 26 via forward-compat). Intel macOS, Linux, and macOS older than Sequoia fall back to build-from-source. To widen coverage, build on a CI matrix and add one `sha256 … <tag>:` line per platform. `bottle.yml` remains the manual tool for retro-fixing/rebuilding the bottle for an already-tagged release.

The release workflow runs the upgrade matrix on the version-rewritten candidate. You can still run `npm run release:upgrade-matrix` locally before rehearsal. The
versioned policy in `scripts/release/supported-upgrades.json` selects every tag
from v3.2.19 through the current `VERSION` and tests all four host adapters with
a bounded concurrent worker pool. The default is up to eight workers; use
`--jobs <n>` to reduce concurrency on a constrained machine.
The report is source-bound and may be retained with `--output <path>`; a dirty
source report is useful rehearsal evidence but cannot be assurance sign-off.

Artifact publication and production assurance are separate contracts. Complete
the required scenario checkpoint above before invoking publication. The release
workflow and `npm run release:preflight` still enforce the deterministic
publication boundary; they do not execute or attest to that manual paid
checkpoint. Repeated benchmark assurance, dogfood, and pilot evidence remain
separate from a smoke check. Missing repeat or rollout evidence remains visible
as an advisory, and the release must not be described as `production-observed`
until the corresponding reports pass.

Run `npm run release:local-rehearsal` to build a tracked/untracked-nonignored
workspace archive, extract it, install a disposable consumer, verify CLI
version/help, and lint the formula. The retained archive and JSON report live
under ignored `.foundation/test-results/release/local/` by default. This closes
the local source-artifact checks but does not replace the macOS bottle dry run.

## Cutting a release (manual fallback)

Use this if the workflow is unavailable or you're releasing by hand. Replace `X.Y.Z` with the new version throughout.

1. **Bump the version + changelog.**
   - Write the bare version (no `v` prefix) into `VERSION`, e.g. `echo "X.Y.Z" > VERSION`. This is the source of truth for `cloop version`; keep it in lockstep with the tag below.
   - Update every surface that states the release. `run-doc-consistency.sh` derives its expectations from `VERSION`, so a surface left behind fails the suite rather than drifting quietly:
     - `**Version X.Y.Z**` in `WORKFLOW.md`, `README.md`, and `README.th.md`
     - `<b>vX.Y.Z</b>` in `website/index.html`
     - `**vX.Y.Z**` in `website/docs/src/content/docs/index.md` and its `th/` mirror
     - `| Pin | vX.Y.Z |` in `website/docs/src/content/docs/cli.md` and its `th/` mirror

     The runtime and protocol-API numbers alongside them come from `protocol.json` and only move when a wire contract does.
   - In `CHANGELOG.md`, rename the `## [Unreleased]` heading to `## [X.Y.Z] - YYYY-MM-DD`, add a fresh empty `## [Unreleased]` above it, and update the link-reference block at the bottom:
     ```
     [Unreleased]: https://github.com/hashtagf/changeloop/compare/vX.Y.Z...HEAD
     [X.Y.Z]: https://github.com/hashtagf/changeloop/compare/v<prev>...vX.Y.Z
     ```

2. **Tag the source snapshot and push it.** Tag the commit you want to release (usually the tip of `main`):
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z — <one-line summary>"
   git push origin vX.Y.Z
   ```
   Pushing the tag makes GitHub generate the source tarball at
   `https://github.com/hashtagf/changeloop/archive/refs/tags/vX.Y.Z.tar.gz`.

3. **Compute the tarball `sha256`:**
   ```bash
   curl -fsSL https://github.com/hashtagf/changeloop/archive/refs/tags/vX.Y.Z.tar.gz \
     | shasum -a 256
   ```

4. **Update the formula.** In `Formula/cloop.rb`, set the `url` to the new tag tarball and replace `sha256` with the value from step 3. Keep the `head` block. Component order must stay `desc → homepage → url → sha256 → license → head` (Homebrew `brew style` enforces it).

5. **Validate the formula:**
   ```bash
   ruby -c Formula/cloop.rb          # syntax
   brew style Formula/cloop.rb       # lint (must be 0 offenses)
   brew audit --strict --formula Formula/cloop.rb   # run from within the tap; warnings OK for a private tap
   ```

6. **Commit the changelog + formula** (one PR), e.g. `chore(release): vX.Y.Z`, and merge to `main`.

7. **Publish the GitHub release** (human-facing notes from the changelog section):
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <(sed -n '/## \[X.Y.Z\]/,/## \[/p' CHANGELOG.md)
   ```

8. **Ship the bottle** (skips Homebrew's Xcode/CLT check — see below). Publishing the release in step 7 fires `.github/workflows/bottle.yml` on a `macos-latest` runner. It checks out the formula from `main` for its *shape* but **rewrites `url`/`sha256` to the tag being bottled** before building (so release order can't produce a wrong-payload bottle — the v2.8.1 lesson), builds a per-platform bottle, uploads it to the `vX.Y.Z` release, and prints a `bottle do` block in the job summary. Copy/merge that block into `Formula/cloop.rb` **right after the `head` line**, then commit + merge (a formula-only commit — no re-tag needed; `root_url` points at the already-published release):
   ```ruby
   bottle do
     root_url "https://github.com/hashtagf/changeloop/releases/download/vX.Y.Z"
     sha256 cellar: :any_skip_relocation, arm64_tahoe: "<sha256 from the bottle job summary>"
   end
   ```
   The job runs per platform you build on — add a `sha256 … <tag>:` line per platform; tags with no line fall back to build-from-source. Re-run `brew style` after pasting (component order: `… → license → head → bottle → def install`).

9. **Verify the upgrade path** on a machine that has the tap:
   ```bash
   brew update
   brew upgrade hashtagf/changeloop/cloop          # pours the bottle on a matching platform — no toolchain check
   brew info hashtagf/changeloop/cloop             # confirm it reports the new version
   ```

## Why the bottle (skips the Xcode/CLT check)

The formula compiles nothing — `install` only copies files. But Homebrew runs its fatal *"Your Xcode/Command Line Tools are too outdated"* check on every **build-from-source** install:

```ruby
# Homebrew/formula_installer.rb
if !pour_bottle? && DevelopmentTools.installed?
  Homebrew::Install.perform_build_from_source_checks   # raises the outdated-Xcode error
end
```

The gate is purely `pour_bottle?` — it never inspects whether a compiler is actually used. With **no bottle**, every stable `brew install` is build-from-source, so a user on a newer macOS (e.g. Tahoe 26) with an older Xcode is blocked for a toolchain the formula never needs. Publishing a bottle (`cellar: :any_skip_relocation`) makes `pour_bottle?` true **on a matching platform** and skips the check. The formula's `bin` wrapper bakes an absolute prefix, so it is **not** `:all`-eligible — brew emits a per-platform bottle (e.g. `arm64_tahoe`); platforms without a `sha256 … <tag>:` line keep building from source. `brew install --HEAD` always builds from source (HEAD ignores bottles), which is expected.

**The bottle must be built where Xcode is current** — building a bottle is itself a build-from-source op, so it can't be produced on the very machine that hits the error. That's why the workflow runs on `macos-latest`. To cover more platforms, build the bottle on each (a CI matrix) and add one `sha256 … <tag>:` line per platform.

> **Asset filename gotcha.** `brew bottle` writes the file as `name--version.<tag>.bottle.tar.gz` (**double** dash), but with a custom `root_url` brew *downloads* via `url_encode` = `name-version.<tag>.bottle.tar.gz` (**single** dash). The asset uploaded to the release must use the **single-dash** name or `brew install` 404s. The workflow renames it automatically before upload; if you ever upload by hand, rename `--` → `-` first. (Content is identical, so the `sha256` is unchanged.)

**Retro-fixing an already-released version**: trigger the workflow by hand — `gh workflow run bottle.yml -f tag=vX.Y.Z` (or the Actions tab → *Build Homebrew bottle* → Run workflow → enter the tag). It uploads the bottle to that existing release and prints the block; paste it into the formula and push a formula-only commit. No re-tag.

> **Note on tarball hashes.** GitHub's `archive/refs/tags/*.tar.gz` checksums are stable, so the `sha256` you compute once stays valid. If you ever re-tag the same version (don't), the hash changes and the formula must be re-bumped.

## Branch protection (recommended, not yet enabled)

Because `brew install --HEAD` and the tap clone both track `main`, a force-push to `main` would ship rewritten history to everyone tracking HEAD. Enabling branch protection on `main` is recommended:

```bash
gh api -X PUT repos/hashtagf/changeloop/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "enforce_admins=false" \
  -F "required_status_checks=null" \
  -F "restrictions=null" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false"
```

This was intentionally **left disabled** for now (it would block the current direct-push workflow); enable it when the team is ready to require PRs into `main`.
