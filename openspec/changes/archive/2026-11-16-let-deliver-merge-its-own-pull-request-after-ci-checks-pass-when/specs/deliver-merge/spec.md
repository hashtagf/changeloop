# deliver-merge

## Purpose

Let /deliver merge its own pull request after CI checks pass when the project opts in with deliver.merge, so one Deliver invocation reaches a merged change.

## ADDED Requirements

### Requirement: merge-is-opt-in

Deliver SHALL stop at an open pull request and SHALL NOT merge unless foundation.json sets deliver.merge to after-checks.

#### Scenario: No merge policy keeps the PR open

- **GIVEN** foundation.json has no deliver.merge setting
- **WHEN** Deliver opens the pull request
- **THEN** the result reaches pr-opened and no merge request is sent to the provider

#### Scenario: Unknown merge policy is refused

- **GIVEN** foundation.json sets deliver.merge to an unsupported value
- **WHEN** Deliver reads its policy
- **THEN** Deliver returns a delivery-policy wait naming deliver.merge before any merge request

### Requirement: merge-after-green-checks

With deliver.merge after-checks, Deliver SHALL merge the delivered pull request with the configured method only after every reported check passed, bound to the delivered head commit, and SHALL record the read-back merge commit.

#### Scenario: Green checks merge the pull request

- **GIVEN** deliver.merge is after-checks and every reported check passed
- **WHEN** Deliver continues after opening the pull request
- **THEN** it merges with the delivered head commit as the required head, reaches merged, and the receipt records the merge commit and method

#### Scenario: Repeated Deliver does not merge twice

- **GIVEN** the delivered pull request is already merged
- **WHEN** Deliver runs again
- **THEN** it reaches merged from the read-back state without sending another merge request

### Requirement: merge-stops-safely

Deliver SHALL NOT merge when checks are pending, failing, or absent, when the pull request is a draft, or when the provider refuses the merge, and SHALL return a resumable wait or decision without bypassing branch protection.

#### Scenario: Pending checks wait

- **GIVEN** deliver.merge is after-checks and a check is still running
- **WHEN** Deliver evaluates the pull request checks
- **THEN** it returns a WAIT on the ci-checks boundary with the Deliver resume command and sends no merge request

#### Scenario: Failing checks stop

- **GIVEN** a reported check failed
- **WHEN** Deliver evaluates the pull request checks
- **THEN** it returns a decision naming the failed checks and sends no merge request

#### Scenario: No reported checks stop

- **GIVEN** the provider reports no checks for the pull request
- **WHEN** Deliver evaluates the pull request checks
- **THEN** it returns a decision and sends no merge request

#### Scenario: Branch protection refusal waits

- **GIVEN** checks passed but the provider refuses the merge, for example because a review is required
- **WHEN** Deliver requests the merge
- **THEN** it returns a WAIT owned by the repository reviewer with the provider reason and never retries with an admin override

#### Scenario: Draft pull request is not merged

- **GIVEN** Deliver opened the pull request as a draft
- **WHEN** Deliver reaches the merge stage
- **THEN** it returns a decision and sends no merge request

### Requirement: merge-single-repository

Deliver SHALL NOT merge a multi-repository delivery and SHALL report that merge applies only to single-repository changes.

#### Scenario: Multi-repository delivery is not merged

- **GIVEN** deliver.merge is after-checks and the change spans several repositories
- **WHEN** Deliver opens the pull requests
- **THEN** it reaches pr-opened, sends no merge request, and includes a notice that merge is single-repository only
