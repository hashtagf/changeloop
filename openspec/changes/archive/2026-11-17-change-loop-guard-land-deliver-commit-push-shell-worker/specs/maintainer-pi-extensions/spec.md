# maintainer-pi-extensions

## MODIFIED Requirements

### Requirement: team-limits

agent-team SHALL refuse a spawn when active managed workers reach maxActiveWorkers from its config.json (default 64), and, when the worker cwd is inside a Change Loop project and active managed workers in that project reach execution.maxParallelAgents from foundation.json, SHALL start the worker and warn.

#### Scenario: Project cap

- **WHEN** a project with maxParallelAgents 3 already has 3 active managed workers and another spawn targets it
- **THEN** the worker starts and the spawn result warns with a message naming maxParallelAgents
