# pi-host-adapter

## ADDED Requirements

### Requirement: archive-word-not-land

The Pi adapter SHALL treat a bash command as a Land operation only when a Change Loop CLI invocation (claude-foundation or foundation.mjs) runs a Land subcommand or advance --through archived.

#### Scenario: Git on an archived change path runs

- **WHEN** the agent runs git add openspec/changes/archive/2026-11-16-x/tasks.md without Land authority
- **THEN** the Pi adapter does not block it as a Land operation

#### Scenario: CLI archive still needs Land

- **WHEN** the agent runs node .claude/harness/foundation.mjs archive pi-case or claude-foundation sandbox apply pi-case without Land authority
- **THEN** the Pi adapter blocks it with the Land approval message

### Requirement: natural-land-consent-variants

The Pi adapter SHALL treat short typed affirmatives such as 'land ได้', 'land เลย', 'land ได้ครับ', 'ลง land ได้', and 'go ahead and land' as Land consent, and SHALL NOT treat questions or refusals such as 'land ได้ไหม', 'land ได้ยัง', 'land?', 'อย่า land', 'ยังไม่ต้อง land', or "don't land" as consent.

#### Scenario: Short affirmative grants consent

- **WHEN** the user types 'land ได้' in the Pi session
- **THEN** it is recognized as Land consent

#### Scenario: Question is not consent

- **WHEN** the user types 'land ได้ไหม' or 'land ได้ยัง'
- **THEN** it is not recognized as Land consent

#### Scenario: Refusal is not consent

- **WHEN** the user types 'ยังไม่ต้อง land' or "don't land"
- **THEN** it is not recognized as Land consent
