# maintainer-pi-extensions

## ADDED Requirements

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
