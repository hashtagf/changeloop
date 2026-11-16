# land

## ADDED Requirements

### Requirement: stopped-land-releases-phase

When advance --through archived enters Land and returns without archiving while the change is still proven, the harness SHALL record the prove phase for the change after the land phase.

#### Scenario: Stopped Land records prove

- **GIVEN** a proven change whose Land returns a REPAIR without applying
- **WHEN** advance --through archived returns
- **THEN** the recorded phases end with prove after land

#### Scenario: Interrupted apply keeps land

- **GIVEN** a Land that returns while the change is applied but not archived
- **WHEN** advance --through archived returns
- **THEN** the last recorded phase stays land so recovery keeps Land rules
