# pi-host-adapter

## ADDED Requirements

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
