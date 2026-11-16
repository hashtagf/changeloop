# scenario-benchmark-hosts

## ADDED Requirements

### Requirement: scorecard-host

run.mjs SHALL accept --host and record it as provenance.host, defaulting to claude-code, and lab.mjs SHALL pass --host pi for the Pi arm.

#### Scenario: Pi dry run names the host

- **WHEN** lab.mjs --host pi --dry-run runs
- **THEN** the runner arguments include --host pi
