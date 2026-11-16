# pi-host-adapter Specification

## Purpose
Let Pi worker sessions take part in Change Loop Build: worker guards inherit the parent session's phase through FOUNDATION_PARENT_SESSION_ID without inheriting Land or Deliver authority, and the maintainer agent-team extension propagates that identity, dispatches leased Change Loop tasks, offers model-tier roles, and caps active workers by configuration and foundation.json maxParallelAgents.
## Requirements
### Requirement: worker-phase-inheritance

When the Pi process environment has FOUNDATION_PARENT_SESSION_ID set to a session identifier, the Pi adapter SHALL resolve the recorded phase for Write, Edit and Bash guards through that parent session, so a worker may write inside the parent's active Build workspace and SHALL still be refused outside it.

#### Scenario: Worker writes in the parent's workspace

- **WHEN** the parent session is in Build and a worker session with FOUNDATION_PARENT_SESSION_ID equal to the parent writes a file inside the change workspace
- **THEN** the write is allowed

#### Scenario: Worker stays out of the main checkout

- **WHEN** the same worker writes a file in the main project checkout
- **THEN** the write is blocked by the phase guard

#### Scenario: Unrelated session gains nothing

- **WHEN** a session without FOUNDATION_PARENT_SESSION_ID writes inside another session's Build workspace
- **THEN** the write is blocked as before

### Requirement: worker-no-land

A Pi session started with FOUNDATION_PARENT_SESSION_ID SHALL refuse the /land and /deliver commands and natural Land consent, and its guards SHALL keep blocking advance --through archived and Deliver primitives.

#### Scenario: Worker cannot land

- **WHEN** a worker session runs /land for a proven change and then advance --through archived
- **THEN** no Land instruction is sent and the advance call is blocked

### Requirement: build-shell-cwd

While the session, or its coordinating parent, has a recorded Build phase with an existing workspace, the Pi adapter SHALL start every agent bash call and its guard check in that workspace; otherwise it SHALL keep the session cwd.

- The user's own ! and !! shell commands keep the session cwd.
- Investigate, Change, Prove, Land and Deliver are unchanged.
- The agent prompt states that Build shell calls start in the workspace and must not cd to the project root to write files.

#### Scenario: Relative write lands in the workspace

- **WHEN** the session is in Build and the agent runs a bash call that writes src/a.js by a relative path
- **THEN** the file is created in the change workspace and the main checkout is unchanged

#### Scenario: Outside Build nothing moves

- **WHEN** the session has no recorded Build phase and the agent runs bash
- **THEN** the call starts in the session cwd

#### Scenario: Worker inherits the coordinator's workspace

- **WHEN** a worker session started with FOUNDATION_PARENT_SESSION_ID runs bash while the parent is in Build
- **THEN** the call starts in the parent's change workspace

### Requirement: guard-warning-visible

When a guard returns additional context for an agent tool call, the Pi adapter SHALL append that text to the tool's result.

#### Scenario: Shell write outside the workspace is reported

- **WHEN** in Build the agent runs a bash call that cds to the project root and redirects into src/a.js
- **THEN** the tool result contains the phase guard's unverified shell mutation warning

### Requirement: archive-word-not-land

The Pi adapter SHALL treat a bash command as a Land operation only when a Change Loop CLI invocation (claude-foundation or foundation.mjs) runs a Land subcommand or advance --through archived.

#### Scenario: Git on an archived change path runs

- **WHEN** the agent runs git add openspec/changes/archive/2026-11-16-x/tasks.md without Land authority
- **THEN** the Pi adapter does not block it as a Land operation

#### Scenario: CLI archive still needs Land

- **WHEN** the agent runs node .claude/harness/foundation.mjs archive pi-case or claude-foundation sandbox apply pi-case without Land authority
- **THEN** the Pi adapter blocks it with the Land approval message

### Requirement: natural-land-consent-variants

The Pi adapter SHALL treat short typed affirmatives such as 'land ได้', 'land เลย', 'land ได้ครับ', 'ลง land ได้', and 'go ahead and land' as Land consent, and SHALL NOT treat questions or refusals such as 'land ได้ไหม', 'land ได้ยัง', 'land?', 'อย่า land', 'ยังไม่ต้อง land', or "don't land" as consent.

#### Scenario: Short affirmative grants consent

- **WHEN** the user types 'land ได้' in the Pi session
- **THEN** it is recognized as Land consent

#### Scenario: Question is not consent

- **WHEN** the user types 'land ได้ไหม' or 'land ได้ยัง'
- **THEN** it is not recognized as Land consent

#### Scenario: Refusal is not consent

- **WHEN** the user types 'ยังไม่ต้อง land' or "don't land"
- **THEN** it is not recognized as Land consent

### Requirement: host-pi-runtime

claude-foundation host pi-runtime --protocol 1 --format json SHALL install the CLI's own package as the current shared Pi bundle in the Pi agent directory and SHALL print protocol-1 JSON with foundationVersion, bundle and path.

- The agent directory is --agent-dir, else PI_CODING_AGENT_DIR, else ~/.pi/agent.
- Installing the same package twice yields the same bundle and changes nothing else.
- It refuses a user-owned global changeloop.ts as installSharedPi already does.

#### Scenario: Endpoint installs and reports

- **WHEN** host pi-runtime runs against an empty agent directory
- **THEN** the JSON names this package's runtime version and a bundle that installation.json lists as current

### Requirement: loader-syncs

At load, the shared Pi loader SHALL compare the machine CLI version with Pi's current bundle and, when they differ, run that CLI's host pi-runtime endpoint before choosing a runtime.

- The machine CLI is CHANGELOOP_MACHINE_CLI when set (none disables the check), else cloop on PATH, else claude-foundation on PATH.
- A CLI inside a Pi runtime bundle is ignored.
- If the CLI is missing, fails or times out, the loader keeps the existing bundle and shows a warning; it does not fail closed for that reason.

#### Scenario: Upgrade is picked up

- **WHEN** Pi's current bundle is from an older version and the machine CLI reports a newer one
- **THEN** after the loader runs, installation.json names a bundle of the machine version

#### Scenario: Same version starts without reinstalling

- **WHEN** the machine CLI reports the same version as Pi's current bundle
- **THEN** host pi-runtime is not run

#### Scenario: Broken CLI keeps the old bundle

- **WHEN** the machine CLI exits with an error
- **THEN** Pi keeps the existing current bundle and the loader reports a warning

### Requirement: project-follow

A .changeloop.json with follow set to machine SHALL resolve to Pi's current bundle in the loader and in CLI runtime resolution, and /changeloop init SHALL write that form for a new project.

- A pinned marker (bundle, runtime, runtimeApi) keeps resolving to exactly that bundle.
- /changeloop follow rewrites the marker to follow the machine version; /changeloop pin pins the current bundle.
- An existing marker is never rewritten by init.

#### Scenario: Follow resolves to current

- **WHEN** a project's .changeloop.json is {version 1, host pi, installation shared, follow machine}
- **THEN** the CLI resolve command prints the path of Pi's current bundle

#### Scenario: Pinned stays pinned

- **WHEN** a project pins bundle A and Pi's current bundle is B
- **THEN** the project still resolves to bundle A

#### Scenario: Switch modes

- **WHEN** /changeloop pin then /changeloop follow run in a trusted project
- **THEN** the marker first names the current bundle, then contains follow machine and no bundle

### Requirement: docs

The harness README Pi adapter section and the changelog SHALL describe machine-version following, the follow and pin modes, and host pi-runtime.

#### Scenario: Documented

- **WHEN** a maintainer reads the Pi adapter section and the Unreleased changelog
- **THEN** both name host pi-runtime and the follow machine mode

### Requirement: bootstrap-commands

In a folder without Change Loop settings, the shared Pi loader SHALL register change, investigate, dev and feature commands that, in a trusted project, create follow-machine settings at the project root, reload Pi, and then run the same command with the same arguments once.

- The project root is the nearest Git root, else the current folder.
- The pending command is handed to the reloaded loader through a file in the Pi agent directory, bound to that project root and consumed once within two minutes.

#### Scenario: First /change in a fresh repository

- **WHEN** a trusted Git repository without settings runs /change add a feature
- **THEN** .changeloop.json follows the machine version at the Git root, Pi reloads, and /change add a feature is sent once after the reload

#### Scenario: Stale or foreign hand-off is ignored

- **WHEN** a pending command is older than two minutes or names another project root
- **THEN** no command is sent and the pending file is removed

### Requirement: bootstrap-refusals

The bootstrap commands SHALL refuse without writing when the project is untrusted, has a local Change Loop installation, or resolves to the home directory or filesystem root.

- A folder with a local runtime (.claude/harness/foundation.mjs at its project root) gets no bootstrap commands, so its own adapter keeps owning those names.

#### Scenario: Untrusted folder

- **WHEN** an untrusted repository runs /change
- **THEN** no file is written and the user is told to trust the project

#### Scenario: Home directory

- **WHEN** /change runs in the home directory with no Git root
- **THEN** no file is written and the user is told to open a project folder

#### Scenario: Local installation

- **WHEN** Pi opens a project that has .claude/harness/foundation.mjs
- **THEN** the shared loader registers no change command there

### Requirement: no-write-on-open

Loading Pi in a folder without settings SHALL NOT create .changeloop.json, foundation.json, openspec or .foundation.

#### Scenario: Just opened

- **WHEN** Pi loads and starts a session in a fresh repository
- **THEN** the repository contains no new Change Loop files

### Requirement: first-use-docs

The harness README Pi adapter section and the changelog SHALL describe first-use setup and its refusals.

#### Scenario: Documented

- **WHEN** a maintainer reads the Pi adapter section and the Unreleased changelog
- **THEN** both describe that the first /change in a trusted repository sets it up
