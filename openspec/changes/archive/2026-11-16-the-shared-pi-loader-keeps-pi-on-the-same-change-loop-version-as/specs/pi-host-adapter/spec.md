# pi-host-adapter

## ADDED Requirements

### Requirement: host-pi-runtime

claude-foundation host pi-runtime --protocol 1 --format json SHALL install the CLI's own package as the current shared Pi bundle in the Pi agent directory and SHALL print protocol-1 JSON with foundationVersion, bundle and path.

- The agent directory is --agent-dir, else PI_CODING_AGENT_DIR, else ~/.pi/agent.
- Installing the same package twice yields the same bundle and changes nothing else.
- It refuses a user-owned global changeloop.ts as installSharedPi already does.

#### Scenario: Endpoint installs and reports

- **WHEN** host pi-runtime runs against an empty agent directory
- **THEN** the JSON names this package's runtime version and a bundle that installation.json lists as current

### Requirement: loader-syncs

At load, the shared Pi loader SHALL compare the machine CLI version with Pi's current bundle and, when they differ, run that CLI's host pi-runtime endpoint before choosing a runtime.

- The machine CLI is CHANGELOOP_MACHINE_CLI when set (none disables the check), else cloop on PATH, else claude-foundation on PATH.
- A CLI inside a Pi runtime bundle is ignored.
- If the CLI is missing, fails or times out, the loader keeps the existing bundle and shows a warning; it does not fail closed for that reason.

#### Scenario: Upgrade is picked up

- **WHEN** Pi's current bundle is from an older version and the machine CLI reports a newer one
- **THEN** after the loader runs, installation.json names a bundle of the machine version

#### Scenario: Same version starts without reinstalling

- **WHEN** the machine CLI reports the same version as Pi's current bundle
- **THEN** host pi-runtime is not run

#### Scenario: Broken CLI keeps the old bundle

- **WHEN** the machine CLI exits with an error
- **THEN** Pi keeps the existing current bundle and the loader reports a warning

### Requirement: project-follow

A .changeloop.json with follow set to machine SHALL resolve to Pi's current bundle in the loader and in CLI runtime resolution, and /changeloop init SHALL write that form for a new project.

- A pinned marker (bundle, runtime, runtimeApi) keeps resolving to exactly that bundle.
- /changeloop follow rewrites the marker to follow the machine version; /changeloop pin pins the current bundle.
- An existing marker is never rewritten by init.

#### Scenario: Follow resolves to current

- **WHEN** a project's .changeloop.json is {version 1, host pi, installation shared, follow machine}
- **THEN** the CLI resolve command prints the path of Pi's current bundle

#### Scenario: Pinned stays pinned

- **WHEN** a project pins bundle A and Pi's current bundle is B
- **THEN** the project still resolves to bundle A

#### Scenario: Switch modes

- **WHEN** /changeloop pin then /changeloop follow run in a trusted project
- **THEN** the marker first names the current bundle, then contains follow machine and no bundle

### Requirement: docs

The harness README Pi adapter section and the changelog SHALL describe machine-version following, the follow and pin modes, and host pi-runtime.

#### Scenario: Documented

- **WHEN** a maintainer reads the Pi adapter section and the Unreleased changelog
- **THEN** both name host pi-runtime and the follow machine mode
