# model-tier-routing-default

## Purpose

New Change Loop installations ship with model-tier routing on (models.routing true in the shipped foundation.json), while upgrades keep every existing project's effective routing setting, and the English and Thai configuration docs and the changelog describe the new default.

## ADDED Requirements

### Requirement: ship-routing-on

The shipped foundation.json SHALL set models.routing to true with the haiku, sonnet and opus tier families, so a fresh installation enables routing.

#### Scenario: Fresh install

- **WHEN** install.sh installs into a project that has no foundation.json
- **THEN** the installed foundation.json has models.routing true

### Requirement: upgrade-keeps-routing

On upgrade the installer SHALL keep an explicit models.routing value, including false, and SHALL write false when the key is missing, matching the runtime's off behavior for a missing key.

#### Scenario: Explicit false survives

- **WHEN** a project with models.routing false is upgraded
- **THEN** models.routing is still false

#### Scenario: Missing key stays off

- **WHEN** a project whose foundation.json has no models.routing is upgraded
- **THEN** models.routing is false

#### Scenario: Explicit true survives

- **WHEN** a project with models.routing true is upgraded
- **THEN** models.routing is still true

### Requirement: docs-default

The English and Thai foundation-config pages SHALL state that new installations ship with routing on, that a missing key or false keeps every task on the standard tier, and that upgrades keep the existing value; the changelog SHALL record the change.

#### Scenario: Docs agree

- **WHEN** a reader opens the English and Thai foundation-config pages and the changelog
- **THEN** both pages say new installs ship routing on and upgrades keep the existing value, and the Unreleased changelog names the change
