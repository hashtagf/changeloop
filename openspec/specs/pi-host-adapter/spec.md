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
