# pi-host-adapter

## ADDED Requirements

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
