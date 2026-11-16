# sandbox

## ADDED Requirements

### Requirement: acceptance-per-path

The target-edit stop SHALL be cleared when every blocking path appears in the recorded acceptance with its current bytes, regardless of other dirty paths recorded or present, and SHALL NOT be cleared when a blocking path is unaccepted or its bytes changed.

#### Scenario: Wider acceptance clears the stop

- **GIVEN** an acceptance recorded over the blocking path and other unrelated dirty paths
- **WHEN** the gate re-checks with only the blocking path inside the Land projection
- **THEN** no issue is raised and the notice says accepted by user decision

#### Scenario: Changed bytes need a new decision

- **GIVEN** an acceptance recorded for the blocking path
- **WHEN** that path's bytes change afterwards
- **THEN** the TARGET_EDITED_OUTSIDE_SANDBOX issue is raised again
