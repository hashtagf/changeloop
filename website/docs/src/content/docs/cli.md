---
title: CLI reference
description: The commands your agent runs, grouped by what they do and what authority they need.
---

<!-- docs-audience: agents-integrators -->
**Audience:** coding agents and integration operators. CLI commands and schemas below are system reference, not a user checklist. Users can follow [Quickstart](/docs/quickstart/).

**In plain words:** this page lists every `claude-foundation` command (people may type the short alias `cloop`), grouped by whether it only reads, changes a change in progress, or needs your explicit authority. It is for agents, integrators, and anyone who wants to read what the agent is doing. You need Change Loop [installed](/docs/install/); you get the exact command, its purpose, and the protocol versions it speaks. Unfamiliar words (change, claim, receipt, provider, capability) are in the [glossary](/docs/glossary/).

Your agent runs these; you rarely need to. They are documented so you can read what the agent is doing, and drive it yourself when you want to.

Every command answers `--help`, and `claude-foundation describe [command] [--json]` describes the surface — including the optional `/deliver` command, `/changes`, and the `/feature` compatibility alias, resolvable by bare word or `/slash` spelling, read from the shipped command files so there is no second copy to drift.

## Primary agent surface

Normal users issue `/investigate`, `/change`, `/build`, `/prove`, `/land`,
optional `/deliver`, or `/dev`; the agent owns CLI details. Its compact runtime
surface is:

| Command | Purpose |
|---|---|
| `investigate --template \| <record.json>` | Validate source-bound facts and hypotheses, persist resume state, and emit a Change handoff |
| `change start --template \| <draft.json> [--inspect] [--consume-draft] [--approve-spec --decision-ref <ref> [--through <target>]]` | Inspect a draft and, when complete, compile and atomically start it in one call; `--inspect` inspects only; `--approve-spec` records the user's approval in the same call |
| `change amend --template \| <change> <amendment.json> [--inspect] [--consume-amendment] [--approve-spec --decision-ref <ref> [--through <target>]]` | Inspect intake and, when complete, transactionally add, revise, or remove requirements, or fix an unfinished task's verify command, during Build in one call |
| `change amend <change> --task <task> --verify <command> [--reopen] [--reason <text>]` | Correct a task's wrong verify command directly, keeping the approval (`--reopen` for a completed task); the task is accepted only when the new command passes |
| `advance <change> --through build\|proven\|archived` | Run deterministic lifecycle work (evidence wiring, sandbox sync, agent-runnable review, task ticking) and return one of seven bounded actions (`WORKING` while harness work runs) at the next real boundary |
| `advance <change> --approve-spec [--role <role>] --decision-ref <ref>` | Record the user's spec approval (alias of `change resolve --approve-spec`); with `approval.roles` configured, `--role` approves one lane and omitting it covers every lane |
| `exec <change> [--repo <id>] [--task <id>] -- <command…>` | Run and time a command (a task's `checkCommand`, a build, a full test run) in the change's sandbox: the named repository or task, else the caller's directory, else the pending tasks' repository; never the main checkout |
| `deliver advance <change>` | After explicit `/deliver`, automate isolated commit, feature-branch push, PR creation/reuse, provider verification, and return the URL |
| `changes` | Read active state and the next useful route |
| `doctor …` | Diagnose a route only when the coordinator asks for it |

`claude-foundation help` shows this small surface. `help --all` adds the
recovery, administration, and host-integration commands below.

## Read-only

Safe to run at any time. These mutate nothing, except that `package` writes
its own read-only HTML file.

| Command | Purpose |
|---|---|
| `changes` | List active changes, lifecycle status, and each one's next useful action |
| `current` | Print the single active change with its status and next command; with none or several, list the candidates and exit non-zero. While exactly one change is active, `advance`, `packet`, `metrics`, `feedback`, and `package` may omit `<change>`; Land and approval flags always need the explicit id |
| `doctor [--stage change\|build\|prove] [--change <id>]` | Diagnose project, provider, and lifecycle readiness |
| `packet <change> [--phase <phase>] [--repo <id>] [--task <id>]` | Read the bounded machine handoff for the current operation |
| `metrics <change>` | Inspect measured usage, semantic-intake effectiveness, active budget, cost, and execution timing |
| `package <change> [--pretty]` | Print the change's approval data as JSON (risk level with reasons, technical domains, artifacts by approver role with proof/preview/none labels, the summary lines, the surfaces the approval page must show and which the prototype covers, whether the page was edited or its facts are stale, suggested previews for High/Critical); writes no file and never changes lifecycle state. The approval page itself is written by hand by the agent or the user; no skill ships for it |
| `feedback <change>` | Explain reviewer, evidenced repair, human-wait, and unattributed timing; show reuse and the next action |
| `change audit <change>` | Audit scenario, claim, task, and provider traceability |
| `handoff status <change>` | Inspect permission-bound operations and their Land disposition |
| `handoff list [--open] [--owner <team>] [--environment <env>] [--json]` | List operational obligations across active and archived changes |
| `handoff packet <change> [--id <H00n>]` | Read the credential-free packet for a named DevOps/SRE owner |
| `repos [change]` | Inspect repository topology and selection |
| `models` | Inspect model-tier policy |
| `providers` | Inspect evidence wiring while defining a change contract |
| `version` | Print the installed package version |
| `describe [command] [--json]` | Describe the slash commands and CLI commands; every command also answers `--help` |
| `outcomes [--pretty]` | Summarize archived changes: proof runs, first-proof pass, user decisions, known cost, and declared escaped defects |
| `lessons [--min-changes <n>] [--pretty]` | Group blocker and review codes that recur across at least `n` changes (default 3) into advisory check proposals for `/change` |

## Consumer quality

See [Consumer quality gates](/docs/consumer-quality/) for configuration,
language profiles, baselines, and rollout policy.

| Command | Purpose |
|---|---|
| `quality discover [--change <id>]` | Read repository manifests and report detected languages, profiles, providers, and unsupported capabilities without executing project commands |
| `quality init [--change <id>] [--write] [--force] [--ci github]` | Preview consumer quality config; explicitly write it and optional GitHub workflow templates |
| `quality doctor [--change <id>] [--enforce]` | Validate selected repositories, provider configuration, executable availability, and mutation isolation |
| `quality run [--change <id>] [--repo <id>] [--capability <name>] [--full] [--shard-index <n> --shard-count <n>] [--enforce]` | Run per-repository lanes and apply changed-code or full-inventory ratchets |
| `quality report` | Read the latest non-averaged repository-lane summary |
| `quality baseline [--repo <id>] [--capability <name>] [--write --decision-ref <ref> --reason <why>]` | Preview or explicitly approve versioned CRAP/mutation baselines |
| `quality debt` | Render JSON and Markdown debt from the latest run without widening Change scope |

## The change lifecycle

| Command | Purpose |
|---|---|
| `investigate --template \| <record.json>` | Print or validate a versioned investigation record and return one typed action |
| `change start --template \| <draft.json> [--inspect] [--consume-draft] [--approve-spec --decision-ref <ref> [--through <target>]]` | Inspect and, when complete, compile and start an agreement from one semantic draft (a JSON file or a draft v5 folder) in one call; Build creates isolation later; `--approve-spec` records the user's approval in the same call |
| `change amend --template \| <change> <amendment.json> [--inspect] [--consume-amendment] [--approve-spec --decision-ref <ref> [--through <target>]]` | Inspect intake and, when complete, add, revise, or remove semantic requirements, or fix an unfinished task's verify command, transactionally while preserving completed work, in one call |
| `change amend <change> --task <task> --verify <command> [--reopen] [--reason <text>]` | Correct one unfinished task's verify command without amendment JSON; claims, capabilities, and approval stay, an always-passing command is refused, and `--reopen` unticks a completed task so it must pass again |
| `change revise <change> <draft.json> [--merge] [--inspect] [--consume-draft] [--approve-spec --decision-ref <ref> [--through <target>]]` | Before Build, inspect and, when complete, recompile a revised semantic draft over the same change id in one call, with rollback and a requirement delta (approval carries unless a requirement is removed); `--merge` takes only the changed keys and keyed entries |
| `change resolve <change> …` | Persist impact, coupling, security, and review decisions |
| `change validate <change>` | Validate the change and its executable evidence contract |
| `preview <change> --provider <name> [--decision-ref <ref>] [--pretty]` | Optional, before Build only: copy the target into `.foundation/previews/<change>/workspace` (no Git, no harness state), run one declared provider there, and record a `kind: "preview"` receipt; preview receipts never satisfy Prove or Land and never block approval or Build; an `external: true` provider needs the user's `--decision-ref` or is refused with `PREVIEW_AUTHORITY_REQUIRED` |
| `sandbox create <change> [--all]` | Create the isolated Build workspace |
| `sandbox sync <change>` | Synchronize an intentional contract revision into Build |
| `advance <change> [--through build\|proven\|archived] [--host-result <result.json>]` | Normal model-facing coordinator; run safe deterministic steps and return one bounded action |
| `handoff record <change> --id <H00n> …` | Record accepted/completed/rejected/cancelled/superseded operational outcomes and durable references |

## Evidence wiring

| Command | Purpose |
|---|---|
| `evidence verify-ci <change> <provider> <signed.json>` | Verify signed CI provenance bound to the provider workspace |
| `hash <change> [provider]` | Print the workspace hash a signed CI envelope must bind |

## External authority

Review and acceptance, resumable across sessions. Prefer `advance`; use
these directly for diagnosis or an explicit integration.

| Command | Purpose |
|---|---|
| `authority request <change> --type review\|acceptance` | Create a resumable external request |
| `authority status <change> [--request <id>] [--template]` | Inspect authority; `--template` emits the response file to fill in |
| `authority dispatch <change> …` | Reserve the exact full/delta packet when handing review to an AI or named human |
| `authority run <change> …` | Run the configured read-only ephemeral AI reviewer and record its real session |
| `authority abort <change> …` | Close an unusable request without pretending its dispatched attempt completed |
| `authority record <change> --request <id> --response <file>` | Validate a bound host response and record its evidence |
| `evidence record <change> <provider> <status> …` | Low-level integration path for externally observed evidence |

:::caution
`evidence record` is a low-level integration path, **not** the normal interactive recovery flow. It refuses a passing receipt for any provider the harness executes.
:::

## Internal primitives

`advance` performs Prove readiness and execution (`proof readiness|advance|run|collect`),
evidence wiring (`evidence detect|init|doctor`), budget checkpoints, and every
Land step (`land check|advance|archive|recover|resume|plan`, `sandbox apply`).
Those primitives are internal: hidden from `help` and `describe`, still
dispatchable for harness internals and tests, and never a route the runtime
hands an agent. Use `advance <change> --through proven|archived` to run them
and `advance <change> --inspect` to read the next action.

## Optional pull-request delivery

| Command | Purpose |
|---|---|
| `deliver advance <change>` | One composition command for an archived change; the harness owns readiness, isolated worktree, projection guard, PR-standard rendering, commit, push, provider read-back, retry, and resume |

If `/deliver` is absent, no delivery directory, PR-specific evidence work, or
gate is created. On a proven change that is not archived yet, `/deliver` is
also Land authority: the harness lands it through `advance --through archived`
and continues delivery. The explicit command never authorizes force-push,
default-branch push, merge, deploy, publish, or product edits. Success requires
an open PR whose provider-reported base, head, and commit match the durable
delivery receipt.

## Recovery and escape hatches

| Command | Purpose |
|---|---|
| `sandbox create <change> --all` | Repair missing multi-repository bindings in place; valid existing worktrees are preserved |
| `advance <change> --decision <option> --decision-fingerprint <hash> --decision-ref <ref> --reason <approach>` | Record the user's answer to an `advance` decision (`retry`, `wait`, `pause`, `merge`, or `retain`, as offered) and resume its target |
| `advance <change> --through archived --restore-target <paths> [--decision-ref <ref>]` | Restore conflicting target paths to the sandbox base inside Land; anything other than regenerable artifacts needs the user's decision |
| `advance <change> --through archived --recover-apply settle\|keep-current\|restore-backup --decision-ref <ref>` | Settle an interrupted Land apply under the user's decision, then continue |
| `advance <change> --undo-land --decision-ref <ref>` | Undo an archived Land whose diff is still uncommitted; refuses without writing if HEAD moved or a landed path was staged or edited |
| `change abandon <change> --reason <r> --decision-ref <ref>` | Quarantine a change that cannot be proven |
| `change waive <change> --capability <c> --reason <r> --decision-ref <ref>` | Withdraw one capability's enforcement after its provider ran and failed; `--revoke` restores it |
| `budget continue <change> --reason <r> --decision-ref <ref>` | Optional explicit widening; exhausted windows auto-continue |
| `authority reset-infra <change> --decision-ref <ref> [--reviewer <id>]` | Restore AI review dispatch after reviewer infrastructure retries were used up and `doctor` passes |
| `authority extend-review <change> --decision-ref <ref>` | Allow one more AI review wave after every routed wave was delivered |
| `authority reset-base-move <change> --decision-ref <ref>` | Release the passing review attempt that a sandbox base move expired, so the forced fresh review does not exhaust the cap |
| `agents release <change> <task> --owner <id> [--lease-id <id>] [--force]` | Release a lease; a taken-over generation requires its acquired lease id, and `--force` takes over one whose owner crashed |

Commands marked as needing a `--decision-ref` require an **explicit host-recorded user decision**. The runtime will not accept the agent's own judgement in their place.

## Administration

| Command | Purpose |
|---|---|
| `init [target-path] [--host claude\|cursor\|opencode\|codex\|pi] [--yes]` | Install or upgrade Change Loop in a project; `--host` adds that host's adapter |
| `help [--all]` | Canonical commands; `--all` includes compatibility routes |
| `dashboard [-up\|-status\|-down]` | Manage the optional team-presence client |
| `update check [--refresh] [--json]` | Show the latest stable release advisory; never applies an update |
| `dashboard snapshot --json` | Print the read-only dashboard projection for this project |

## Host integration

Used by host adapters (Pi, OpenCode, and others) and parallel Build; not by users.

| Command | Purpose |
|---|---|
| `host agent-contract [--protocol 1] [--format json]` | Return the package-owned agent contract |
| `host instruction <command> [--protocol 1] [--format json] [--arguments <text>]` | Return one package-owned workflow instruction, such as `/change` |
| `agents plan <change> [--group <n>] [--full]` | Plan dispatch for independently verifiable parallel work |
| `agents dispatch <change>` | Return the next graph- and lease-bound Build action without invoking a model |
| `agents acquire <change> <task> --owner <id>` | Acquire a task lease |
| `telemetry sync <change> [transcript.jsonl]` | Synchronize native host request usage |
| `telemetry import <change> <file> [--format <format>]` | Import authoritative host usage |
| `telemetry host-import <change> <result.json>` | Import a validated host execution result with attempts, actual model, and fallback |
| `sandbox challenge <change>` | Create a short-lived challenge for signed unattended authority |

## Protocol versions

`advance <change> --inspect` reads the next action without executing work; it
cannot be combined with `--through` or `--host-result`.
`packet <change> --resume` returns bounded current agreement references,
frontier, leases and evidence. Read referenced sections when marked truncated.
`feedback <change> --diagnostics` exports allowlisted local metadata with
provider aliases; paths, commands and free-form payloads are excluded.
Build/Prove completion is `TARGET_REACHED`; archived delivery is `DELIVERED`.
Feedback reports current runtime receipt validity. Dashboard recorded proof
remains unverified when current workspace freshness cannot be checked.

Wire-visible contracts are pinned in `.claude/harness/protocol.json`. A mixed-revision install fails immediately at load rather than partway through Land.

| Pin | v3.7.0 |
|---|---|
| runtime | 3.7.0 |
| runtime API | 42 |
| semantic draft schema | 5 |
| semantic intake state schema | 2 |
| semantic amendment schema | 1 |
| artifact defaults schema | 2 |
| grounding schema | 2, 3 |
| advance protocol | 7 |
| provider protocol | 13 |
| evidence schema | 2 |
| packet schema | 12 |
| proof protocol | 7 |
| review protocol | 4 |
| acceptance protocol | 2 |
| semantic acceptance protocol | 1 |
| attestation protocol | 1 |
| authority protocol | 2 |
| quality capabilities protocol | 1 |
| CRAP protocol | 1 |
| automated mutation protocol | 1 |

:::note
Provider protocol 13 means receipts recorded by earlier protocols read as
`provider-version-stale` and must be re-proven. Older receipts cannot attest to
semantic-acceptance protocol 1.
:::
