# maintainer-pi-extensions

## Purpose

Move the maintainer's own Pi extensions (agent-team, ask-user, background-bash) into a repository-only pi-extensions/ folder with a test runner and an installer that copies them into the Pi agent directory, so they are developed in one place and installed from it.

## ADDED Requirements

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
