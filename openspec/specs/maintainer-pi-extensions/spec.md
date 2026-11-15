# maintainer-pi-extensions Specification

## Purpose
Move the maintainer's own Pi extensions (agent-team, ask-user, background-bash) into a repository-only pi-extensions/ folder with a test runner and an installer that copies them into the Pi agent directory, so they are developed in one place and installed from it.
## Requirements
### Requirement: extensions-in-repo

The repository SHALL contain the agent-team, ask-user and background-bash Pi extensions under pi-extensions/ as sibling folders, without generated reports or machine-specific absolute paths, and SHALL NOT contain the claude-accounts extension.

#### Scenario: Extensions are present without personal paths

- **WHEN** a maintainer lists pi-extensions/ and searches it for /Users/
- **THEN** each of agent-team, ask-user and background-bash has an index.ts, claude-accounts is absent, and no file contains a /Users/ path

### Requirement: not-shipped

pi-extensions/ SHALL be repository-only: install.sh, install-pi.sh and the Homebrew formula SHALL NOT reference or copy it, and CLAUDE.md SHALL list it as a repository-only development surface.

#### Scenario: Shipping surfaces ignore the folder

- **WHEN** install.sh, install-pi.sh and Formula/claude-foundation.rb are searched for pi-extensions
- **THEN** none matches, and CLAUDE.md names pi-extensions/ under repository-only development surfaces

### Requirement: installer

pi-extensions/install.sh SHALL copy each extension into <agent dir>/extensions/<name> (agent dir from PI_CODING_AGENT_DIR, default ~/.pi/agent), SHALL move a differing existing copy into a timestamped backup folder first, SHALL skip identical copies, and with --dry-run SHALL change nothing.

#### Scenario: Fresh install

- **WHEN** install.sh runs with PI_CODING_AGENT_DIR set to an empty temporary directory
- **THEN** extensions/agent-team, extensions/ask-user and extensions/background-bash match the repository copies

#### Scenario: Replaced copy is backed up

- **WHEN** an installed extension differs from the repository and install.sh runs
- **THEN** the previous copy is preserved under extension-backups/<timestamp>/<name> and the installed copy matches the repository

#### Scenario: Dry run changes nothing

- **WHEN** install.sh --dry-run runs against an empty agent directory
- **THEN** no extensions directory is created

### Requirement: test-runner

pi-extensions/test.sh SHALL run the extensions' Node tests and SHALL run the real-terminal smokes only when passed --tui; pi-extensions/README.md SHALL document test, dry-run and install.

#### Scenario: Runner and docs exist

- **WHEN** a maintainer reads pi-extensions/README.md and runs pi-extensions/test.sh
- **THEN** the README documents test.sh, install.sh --dry-run and install.sh, and test.sh is valid shell that runs the smokes only with --tui

### Requirement: team-propagates-parent

agent-team SHALL start every managed worker with FOUNDATION_PARENT_SESSION_ID set to the value it inherited, or otherwise to the spawning Pi session's id.

#### Scenario: Nested workers keep the root session

- **WHEN** a main session spawns a worker and that worker spawns another
- **THEN** both workers receive the main session's id as FOUNDATION_PARENT_SESSION_ID

### Requirement: team-changeloop-task

agent_spawn SHALL accept changeLoopTask {change, task}; agent-team SHALL validate both identifiers, start the worker in the change's recorded workspace with a brief that runs the task packet command first and implements only that task without editing the task ledger or leases, and SHALL refuse a change without a recorded workspace.

#### Scenario: Leased task brief

- **WHEN** a brief is built for change c1 task T002 whose runtime state records a workspace
- **THEN** the worker cwd is that workspace and the brief names 'claude-foundation packet c1 --task T002' and forbids editing tasks.md and leases

#### Scenario: Unknown change is refused

- **WHEN** a brief is requested for a change with no runtime workspace or an invalid id
- **THEN** an error is returned and no worker starts

### Requirement: team-roles

agent_spawn SHALL accept role explorer, executor, reviewer or verifier, mapping each to a Change Loop model tier, read-only tool limits and a structured report prompt.

- Tiers: explorer fast, executor standard, reviewer deep, verifier standard.
- explorer, reviewer and verifier exclude the write and edit tools.
- The role prompt ends the report with SUMMARY, CHANGES, CHECKS and BLOCKERS.
- A tier resolves to a configured model, else an available model of the tier family from foundation.json (haiku, sonnet, opus by default) on the current provider, else the current model.

#### Scenario: Reviewer is read-only and deep

- **WHEN** the reviewer role is resolved in a project whose deep tier family is opus and an opus model is available
- **THEN** the model is that opus model, write and edit are excluded, and the prompt asks for SUMMARY, CHANGES, CHECKS and BLOCKERS

#### Scenario: Unknown role is refused

- **WHEN** agent_spawn is called with role 'admin'
- **THEN** an error names the supported roles

### Requirement: team-limits

agent-team SHALL refuse a spawn when active managed workers reach maxActiveWorkers from its config.json (default 64), and, when the worker cwd is inside a Change Loop project, when active managed workers in that project reach execution.maxParallelAgents from foundation.json.

#### Scenario: Project cap

- **WHEN** a project with maxParallelAgents 3 already has 3 active managed workers and another spawn targets it
- **THEN** the spawn is refused with a message naming maxParallelAgents
