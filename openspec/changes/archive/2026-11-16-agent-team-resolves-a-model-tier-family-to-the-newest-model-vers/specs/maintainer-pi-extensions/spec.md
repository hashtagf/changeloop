# maintainer-pi-extensions

## ADDED Requirements

### Requirement: newest-version

agent-team SHALL resolve a tier family to the available model with the highest numeric version on the current provider.

- The version is the dash-separated numbers after the family name, compared number by number, so 5-5 is newer than 5 and 4-8.
- A trailing 8-digit date is a snapshot of that version and only breaks ties, newest date first, after an undated id of the same version.
- Ids whose remainder is not a version (for example -latest) are used only when no versioned id exists.

#### Scenario: Snapshot date does not outrank a newer version

- **WHEN** claude-opus-4-6 and claude-opus-4-20250514 are available
- **THEN** claude-opus-4-6 is chosen

#### Scenario: Newest version wins over aliases and snapshots

- **WHEN** claude-opus-5-5, claude-opus-5-5-20261001, claude-opus-5, claude-opus-4-8 and claude-opus-latest are available
- **THEN** claude-opus-5-5 is chosen

#### Scenario: Alias only as a last resort

- **WHEN** only claude-opus-latest matches the family
- **THEN** claude-opus-latest is chosen
