# host-adapter

## MODIFIED Requirements

### Requirement: One coordinator projects the next safe host action

Foundation SHALL expose an additive high-level coordinator that evaluates the current lifecycle and returns one versioned machine action for implementation, repair, configured review, external wait, decision, local recovery, Land readiness, or completion; it SHALL preserve existing low-level commands and SHALL invoke a model only to run a configured reviewer route the harness generated.

#### Scenario: Runnable implementation or repair work exists

- **WHEN** the current graph has one safe runnable frontier
- **THEN** the coordinator returns its bounded task or repair packet and required result authority

#### Scenario: Configured review is ready

- **WHEN** executable evidence passes and a configured reviewer request is current
- **THEN** under advance --through proven|archived the coordinator runs the generated reviewer route inline when the reviewer is ready
- **AND** otherwise it returns RUN_EXTERNAL with legacyAction RUN_CONFIGURED_REVIEW for the host

#### Scenario: Coordinator reaches an authority boundary

- **WHEN** continuation requires a contract choice, waiver, budget grant, conflict resolution, commit, push, publish, or other external authority
- **THEN** the coordinator stops with a typed terminal action and exact resume route

#### Scenario: Safe progress continues

- **WHEN** a deterministic local step succeeds and progress identity changes
- **THEN** the host may call the coordinator again without interpreting prose or invoking a duplicate action

#### Scenario: A host requests a lifecycle target

- **WHEN** a host calls `advance <change> --through build|proven|archived`
- **THEN** Foundation performs safe deterministic steps internally and returns exactly one of WORKING, EDIT, RUN_EXTERNAL, REPAIR, WAIT, ASK_USER, or DONE at the next real boundary, where WORKING means harness work such as a running proof is still in progress

#### Scenario: A target is reached

- **WHEN** the requested lifecycle target is reached without missing authority
- **THEN** the coordinator returns `DONE`, records the phase once, and does not require the host to replay the completed command chain

#### Scenario: The coordinator cannot continue safely

- **WHEN** authority, a resource, a contract repair, a conflict, or repeated no-progress prevents automatic continuation
- **THEN** the response names the cause and actor, confirms preserved state, offers bounded alternatives, and includes the exact resume route

#### Scenario: An internal lifecycle dependency throws

- **WHEN** Build preparation, dispatch, Prove, or Land throws an operational failure while `advance` is evaluating or chaining
- **THEN** the coordinator returns a `REPAIR` action carrying the original reason, exact recovery command when available, preserved-state claim, and the same resume route instead of exiting outside the seven-action protocol

#### Scenario: A long deterministic chain keeps progressing

- **WHEN** more than 32 automated transitions each change the semantic lifecycle progress identity
- **THEN** `advance --through` continues toward the requested target without applying a fixed cycle ceiling

#### Scenario: Automated continuation repeats unchanged

- **WHEN** the same automated transition leaves the semantic lifecycle progress identity unchanged twice
- **THEN** the coordinator returns an agent-owned `REPAIR` (`NO_PROGRESS_BOUNDARY`) carrying the unchanged step's output, with state preserved, instead of a bare inspection route or a user question
