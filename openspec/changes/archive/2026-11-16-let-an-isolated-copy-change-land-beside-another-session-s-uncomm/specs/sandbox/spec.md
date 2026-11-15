# sandbox

## ADDED Requirements

### Requirement: untouched-copy-not-claimed

The changed surface of a copy-mode change SHALL exclude a path whose sandbox bytes still equal the bytes recorded for that path in the target dirty snapshot taken at isolation.

#### Scenario: Untouched foreign file is not claimed

- **GIVEN** the target had an untracked file at isolation and the sandbox copy still has the same bytes
- **WHEN** the changed surface is computed
- **THEN** the path is not part of the change's changed surface

#### Scenario: Edited foreign file is still claimed

- **GIVEN** the sandbox copy of that file was edited after isolation
- **WHEN** the changed surface is computed
- **THEN** the path is part of the change's changed surface

### Requirement: untouched-copy-forwards-on-sync

Copy sandbox sync SHALL fast-forward a path absent from the copy baseline whose sandbox bytes still equal the isolation target dirty snapshot, and SHALL keep reporting a conflict when the sandbox copy was edited.

#### Scenario: Untouched copy fast-forwards

- **GIVEN** a path absent from the baseline whose sandbox bytes equal its isolation snapshot, and the target has since changed it
- **WHEN** sandbox sync runs
- **THEN** the sandbox receives the target's bytes, the path counts as fast-forwarded, and no conflict is reported

#### Scenario: Edited copy still conflicts

- **GIVEN** the same path whose sandbox bytes differ from its isolation snapshot
- **WHEN** sandbox sync runs
- **THEN** the path is reported as a conflict and the sandbox copy is not overwritten
