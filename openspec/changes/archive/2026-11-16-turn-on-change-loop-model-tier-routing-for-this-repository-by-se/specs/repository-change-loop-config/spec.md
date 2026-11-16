# repository-change-loop-config

## Purpose

Turn on Change Loop model-tier routing for this repository by setting models.routing to true in foundation.json, so Build tasks use the fast, standard or deep tier by task kind and risk, matching the agent-team worker roles.

## ADDED Requirements

### Requirement: routing-on

The repository foundation.json SHALL set models.routing to true and SHALL keep the fast, standard and deep tier families haiku, sonnet and opus unchanged.

#### Scenario: Routing enabled

- **WHEN** a maintainer reads foundation.json
- **THEN** models.routing is true and the tier families are haiku, sonnet and opus
