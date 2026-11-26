---
title: Install
description: Requirements and the two supported ways to install Change Loop into an existing repository.
---

<!-- docs-audience: project-maintainers -->
**Audience:** project maintainers and authorized agents configuring an installation. For the everyday workflow, start with [Quickstart](/docs/quickstart/).

Install the `cloop` CLI once on your machine, then initialize Change Loop in
each project. `cloop` is the command for you and the agent. Running `init` again upgrades the managed files. It is
safe for brownfield repositories: it seeds what is missing, refreshes what it
owns, and leaves project-owned files alone.

## Requirements and recommended tools

| Tool | Status | Why |
|---|---|---|
| **Node.js 20.19 or later** | Required | The runtime is plain ESM Node with no compile step |
| **OpenSpec CLI 1.7** | Required, prepared automatically | Spec synchronization and archive |
| **Git** | Recommended | Enables worktree isolation; a dirty or non-Git project falls back to an isolated copy |

You normally do not install OpenSpec yourself: the installer uses a compatible
`openspec` already in the project or on `PATH`, and otherwise downloads the
pinned version into `.foundation/tools` (this needs npm registry access). If
that fails, installation still finishes with a warning, and the harness tries
again before Build, Prove, and Land. On a machine without registry access,
install it yourself:

```bash
npm install -g @fission-ai/openspec@1.7.0
```

`jq` is recommended for merging hooks into an existing
`.claude/settings.json`. Without it, installation continues, preserves the
existing file, and writes `.claude/settings.foundation.json` for manual review.

## Install from source

```bash
git clone https://github.com/hashtagf/changeloop.git
cd changeloop
./install.sh /path/to/your-project
```

## Install with Homebrew

```bash
brew tap hashtagf/changeloop \
  https://github.com/hashtagf/changeloop
brew install hashtagf/changeloop/cloop
cloop init /path/to/your-project --yes
```

`cloop init` is the same installer; `--yes` skips the confirmation prompt.
Later upgrades use `brew upgrade hashtagf/changeloop/cloop`, followed by `init` for each
project you want to refresh.

:::tip
Open a **new** agent session in the target project after installing, so the slash commands are registered.
:::

## Upgrade from claude-foundation

Change Loop moved to [hashtagf/changeloop](https://github.com/hashtagf/changeloop), and the CLI is now `cloop`. Upgrade each existing project in place; installing the new CLI alone does not update your projects.

**If you installed with Homebrew**, use the new tap. Running `brew upgrade` against the old tap will not switch you to Change Loop.

```bash
brew tap hashtagf/changeloop https://github.com/hashtagf/changeloop
brew install hashtagf/changeloop/cloop
cloop init /path/to/existing-project
```

On Homebrew 6 and later, installing by the full formula name trusts only `cloop`; no separate `brew trust` is needed. If you already installed from `hashtagf/changeloop` under the former formula name, run `brew update`, then `brew upgrade hashtagf/changeloop/cloop` instead of installing again. See [Homebrew Tap Trust](https://docs.brew.sh/Tap-Trust).

**If you installed from source**, follow [Install from source](#install-from-source) using the new repository. Point `install.sh` at your existing project, not a new directory.

Repeat the project step for each project you want to upgrade. The installer refreshes managed commands, hooks, and runtime files while preserving OpenSpec specs, active changes, and project state. Save any custom edits to managed files before upgrading. See [file ownership](/docs/artifacts/) for what the installer replaces.

In the upgraded project, run `cloop doctor --stage change` and address any reported problems. Then open a new Claude Code session so it loads the updated slash commands.

## Other agent hosts

Claude Code needs no adapter. For other hosts, `--host` layers one over the same shared install:

```bash
cloop init /path/to/your-project --host cursor    # or opencode, codex, pi
```

| Host | What the adapter adds |
|---|---|
| **Pi ≥1.5.2** | Project-local `.pi/extensions/changeloop.ts` registers the canonical commands, loads the package-owned agent contract, and bridges built-in tool guards, lint feedback, session identity, and `!`/`!!` shell execution. Requires `@earendil-works/pi-coding-agent`, the matching Change Loop CLI, Node.js and jq |
| **Cursor** | Seven primary lifecycle prompts including optional `/deliver`, plus `/changes` and the `/feature` compatibility alias in `.cursor/commands/`, and the always-on skill router as a `.mdc` rule with `alwaysApply: true` |
| **OpenCode** | The same seven primary prompts plus two utility/alias prompts in `.opencode/commands/`, and a guard plugin at `.opencode/plugins/foundation.js` that replays the shipped hooks — the secrets and phase-mutation guards block live, lint feeds back on edit. Skills and the agent contract need no adapter: OpenCode reads `.claude/skills/` and `AGENTS.md` natively |
| **Codex CLI** | The nine prompts in `$CODEX_HOME/prompts` (Codex has no per-project prompt directory), stamped with an ownership marker so re-installs refresh Change Loop prompts without clobbering a same-named user prompt |

Trust the Pi project when Pi asks, then start a new session or run `/reload`.
To keep runtime code out of a Pi consumer repository, add `--shared-runtime` to
`cloop init /path/to/your-project --host pi`. This installs a pinned runtime bundle
in Pi and leaves only `.changeloop.json`, `foundation.json`, OpenSpec settings and
artifacts, and generated `.foundation` state in the project. Later projects can
use `/changeloop init` in Pi and `/reload`. Existing local installations are kept;
shared initialization does not remove or migrate their files.
Use `/land <change>` for explicit Land; `/build` and `/prove` never authorize it.
Pi guards advise by default: Land, Deliver, edits outside a change, shell
shapes, and background `authority run` proceed with a warning on the tool
result instead of a refusal. Secret redaction stays enforced, and exporting
`FOUNDATION_GUARDRAIL_MODE=block` before starting Pi restores the refusals.
An unrecognized mode uses `auto`. In `auto`, ordinary edits do not require an
active change. If an advisory hook is unavailable, Pi warns instead of stopping
ordinary tools; secret checks and Build workspace routing still apply.
Pi guard coverage is partial: built-in tools and `background_bash` are guarded;
other custom/MCP tools are outside the live boundary and get a one-time warning
during a change. The session digest is injected at start and after compaction,
and `/dev` warns when it stops before proof passes. Shell analysis uses
the shared runtime policy (audit by default; `FOUNDATION_SHELL_GUARD=block` enables
strict shell checks). This extension does not provide an OS sandbox or issue
unattended sandbox attestations. Review/model routing stays in `foundation.json`.
The extension pins every shell to the session's project, so a Change Loop
command run inside a different Change Loop project (a test fixture or sibling
checkout) is refused instead of changing the session's project; run it with
`--project <path>` or from that project's own session.

:::caution[Codex has no tool hooks]
Codex cannot run live guards, so the secrets and phase-mutation hooks are inert there. Land gates and the opt-in `no-direct-main-commit.sh` remain the enforcement.
:::

## Verify

```bash
cloop version
cloop doctor --stage change
```

`doctor` is the readiness check you should reach for whenever something looks wrong. It diagnoses project, provider, and lifecycle state, and it reports unresolved apply transactions before Land ever reaches them.

The installer also adds one managed block naming Change Loop's files to an
existing `.prettierignore`, `.eslintignore`, or `.stylelintignore` (and
creates `.prettierignore` when the project configures Prettier), so your own
format and lint checks never judge the installed files. Your entries stay.

## Set up the project for agents

After the first install, `doctor` also lists **setup** rows: whether consumer
quality is configured, whether each lint, type-check, file-size, or
module-boundary lane has a baseline, whether `openspec/feature-map.json` names
your features, whether `openspec/lessons.md` exists, whether `AGENTS.md` or
`CLAUDE.md` holds project rules rather than only the Change Loop pointer, and
whether `REVIEW.md` is still the generic template. Each row names its next
command; none of them fails `doctor`. Onboarding drafts project review rules for
you to confirm and asks once whether to add a `SECURITY.md`.

Ask the agent to onboard the project ("onboard this repo"). The `onboard` skill
runs the commands `doctor` names, drafts the feature map and optional module
boundaries from your code, and asks you to confirm them and to adopt today's
findings as the baseline. You decide; nothing becomes binding silently.

For product work that starts before any change, two skills write the inputs
Change Loop builds from. `prd` writes `PRD.md` and `prd.html` (18 sections:
goal, stories, Given/When/Then acceptance, rules, flows, NFR, ADRs, scope,
data and permissions, errors, open questions) and checks the links between
them; an approved PRD goes to `grill-task-gu` and then `/feature` or
`/change`. `ux-design` runs UX/UI in phases you confirm one at a time:
`uxui.md`, a versioned `design-system.html`, and page or feature artifacts
that share its Token Block; an approved artifact becomes a change's
`prototypeSelection`, which the visual check compares the built UI with.

## Commit the installation

In a Git project, the installer stages the managed setup files but does not
commit them. Review and commit that setup before the first change:

```bash
git status
git commit -m "chore: install Change Loop"
```

This needs your explicit approval. If the files remain uncommitted, Change Loop
correctly treats them as part of the next change surface, which makes the first
change larger and forces copied-workspace isolation.

## Start your first change

Open a new agent session in the initialized project and describe the outcome:

```text
/change allow account owners to edit their display name
```

Review the proposed agreement, then continue with `/build`, `/prove`, and
explicit `/land`. The agent runs the underlying CLI and recovery commands. See
the [Quickstart](/docs/quickstart/) for the complete user journey.

## Advanced setup

Only needed for locked-down or unattended (CI) environments. You can skip this
section for a normal interactive setup.

### Permission allowlist

`.claude/settings.json` stays project-owned. The installer merges the shipped hooks and appends a narrow `permissions.allow` list, so Claude Code does not ask for approval on every harness step: `Bash(cloop *)`, `Bash(.foundation/bin/cloop *)`, `Bash(node .claude/harness/foundation.mjs *)`, `Edit(/.foundation/sandboxes/**)`, `Edit(/.foundation/repository-sandboxes/**)`, `Edit(/.foundation/drafts/**)` (the Change draft), `Edit(/openspec/investigations/**)` (the Investigate record), and read-only exploration: `Bash(find *)`, `Bash(grep *)`, `Bash(ls *)`, `Bash(head *)`, `Bash(wc *)`, the `rtk ls` / `rtk grep` proxied forms, and read-only Git (`Bash(git status)`, `Bash(git status *)`, and the same pair for `diff`, `log`, `show`). `cat` gets no rule (a prefix rule would also pre-allow `cat > file`; read files with the Read tool), and no rule grants a write, a delete, or Git that moves state. Because those read rules match by prefix, the installer also appends `permissions.deny` rules that refuse the forms that would write or run other commands: `find` with `-delete`, `-exec`/`-execdir`, `-ok`/`-okdir`, `-fprint`/`-fprintf`, or `-fls`, and `git diff`/`log`/`show` with `--output`. A flag counts only after a space, so a name such as `*-okhttp*` stays readable. Deny wins over allow and refuses the call outright (no prompt), so an upgraded project that keeps the older rules is covered too. Project test runners get no rule: each Build task returns its verify as a `checkCommand` (`cloop exec <change> --task <id> -- <verify>`) that the CLI rule already covers. It adds only missing rules after your own, never removes or reorders entries, and a rerun adds nothing. The PreToolUse guards still run before these rules. Pass `--no-permission-allowlist` on every install or upgrade to leave `permissions.allow` and `permissions.deny` untouched.

### Headless / CI (`claude -p`)

Claude Code ignores project `permissions.allow` entries until the workspace is trusted. In a fresh checkout, a headless `claude -p` run prints `Ignoring ... permissions.allow entry ... this workspace has not been trusted`, so the installed `Bash(cloop *)` rule does nothing and every harness call is denied. Either run `claude` once interactively in the project and accept the trust prompt, or grant exactly the installed allowlist on each headless run (an `Edit` rule also covers `Write`; edits elsewhere in the project stay denied):

```bash
claude -p "/change <intent>" --allowedTools \
  "Bash(cloop *)" "Bash(.foundation/bin/cloop *)" \
  "Bash(node .claude/harness/foundation.mjs *)" "Edit(/.foundation/drafts/**)" \
  "Edit(/.foundation/sandboxes/**)" "Edit(/.foundation/repository-sandboxes/**)" \
  "Edit(/openspec/investigations/**)" \
  "Bash(find *)" "Bash(grep *)" "Bash(ls *)" "Bash(head *)" "Bash(wc *)" \
  "Bash(rtk ls *)" "Bash(rtk grep *)" \
  "Bash(git status)" "Bash(git status *)" "Bash(git diff)" "Bash(git diff *)" \
  "Bash(git log)" "Bash(git log *)" "Bash(git show)" "Bash(git show *)" \
  --disallowedTools \
  "Bash(find -delete*)" "Bash(find * -delete*)" "Bash(find -exec*)" \
  "Bash(find * -exec*)" "Bash(find -ok*)" "Bash(find * -ok*)" \
  "Bash(find -fprint*)" "Bash(find * -fprint*)" "Bash(find -fls*)" \
  "Bash(find * -fls*)" "Bash(git diff --output*)" "Bash(git diff * --output*)" \
  "Bash(git log --output*)" "Bash(git log * --output*)" "Bash(git show --output*)" \
  "Bash(git show * --output*)"
```

Build checks run through `cloop exec`, so test runners need no grant; add other project tools only when a run needs them. Claude Code treats paths under `~/.claude/` as sensitive, so keep consumer projects outside that directory for unattended runs.

## What the installer owns

This boundary matters, because upgrades act on it. Change Loop-managed paths are **copied on every install** and recorded in `.foundation/install-manifest.txt`:

```text
.claude/orchestrator.md
.claude/commands
.claude/harness
.claude/skills
.claude/rules
.claude/hooks
openspec/schemas
.foundation/.gitignore
.foundation/README.md
WORKFLOW.md
```

Project-owned paths are seeded or merged but **never clobbered**:

```text
.claude/settings.json          # hooks merged with jq; timestamped backup
openspec/config.yaml           # copied only when missing
openspec/repositories.yaml     # copied only when missing
foundation.json                # seeded; supported missing-field/default migrations
CLAUDE.md / AGENTS.md          # only the marked pointer block is rewritten
REVIEW.md                      # copied only when missing
openspec/incidents/, openspec/lessons.md  # copied only when missing
```

Your specs, active changes, runtime state, custom agents, and hooks survive every upgrade. A path dropped from the managed list is removed from your project only if the manifest previously claimed it — so Change Loop never deletes a file it did not install.

Because `foundation.json` belongs to your project, an upgrade preserves custom
policy rather than replacing the file wholesale. It can add missing fields and
migrate recognized historical default budgets. Read
[Configure foundation.json](/docs/foundation-config/) before changing it.

Project-owned does not mean the user must edit the file personally; an
authorized agent can configure it. Installed system instructions are separate
from project preferences. See [files and ownership](/docs/artifacts/).

## Browser proof stays yours

Change Loop does not install test frameworks, browsers, or project dependencies. If a claim needs browser evidence, install and lock `@playwright/test` and its browser binaries **in your application**. Change Loop validates and executes the local tool; it will never download an unpinned browser framework during proof.

The same rule applies everywhere: every executable named by an adapter is owned and version-locked by your repository, not by the harness.
