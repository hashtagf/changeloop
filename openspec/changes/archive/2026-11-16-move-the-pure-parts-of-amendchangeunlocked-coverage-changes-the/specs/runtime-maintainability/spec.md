# runtime-maintainability

## ADDED Requirements

### Requirement: amendment-record-module

amendment-record.mjs SHALL own the amendment coverage changes, the amendment history row, the AMENDED report and the approval-delta and waiver formatters, and amendChangeUnlocked SHALL call them.

#### Scenario: Report text unchanged

- **WHEN** an amendment is applied
- **THEN** the AMENDED report and the recorded amendment row are identical to the previous behavior and the default gate passes without changing any expectation
