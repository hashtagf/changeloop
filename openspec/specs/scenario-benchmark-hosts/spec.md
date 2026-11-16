# scenario-benchmark-hosts Specification

## Purpose
Add a Pi host to the paid scenario lab: a Claude-CLI-compatible shim drives Pi over RPC and translates its events into the stream the runner already measures, and lab.mjs gains --host pi and --model so the same scenario runs on Claude Code and Pi with one pinned model.
## Requirements
### Requirement: pi-host-stream

The Pi host shim SHALL accept the Claude CLI arguments the runner passes, run the prompt through Pi RPC mode in the project directory, and write Claude stream-json rows for session start, each assistant message, each tool result, and one final result.

- Assistant rows carry a unique message id, the answering model, text and tool_use blocks, and token usage.
- Tool result rows carry the tool call id, the result text, and is_error.
- The result row carries total_cost_usd summed from Pi usage when Pi reports cost, else null, plus usage totals and num_turns.
- Pi tool names map to the runner's names: bash Bash, read Read, edit Edit, write Write, grep Grep, find Glob, ls LS.

#### Scenario: Translated session

- **WHEN** a fake Pi RPC process answers a prompt with one tool call, its result, and a final text message
- **THEN** stdout has a system init row, two assistant rows with distinct ids, a user tool_result row, and a success result whose total_cost_usd is the summed cost

#### Scenario: Extension command runs its turn

- **WHEN** the prompt starts with a slash command whose handler starts the agent turn
- **THEN** the shim waits for that turn to settle before writing the result

### Requirement: pi-host-budget

The shim SHALL stop Pi and write a result with subtype error_max_budget_usd once summed cost reaches --max-budget-usd, and on SIGTERM SHALL write a non-error result with subtype terminated carrying the cost measured so far before exiting.

#### Scenario: Budget cap

- **WHEN** the fake Pi reports assistant costs that exceed --max-budget-usd
- **THEN** the result subtype is error_max_budget_usd and the Pi process is stopped

#### Scenario: Runner stop keeps cost

- **WHEN** the shim receives SIGTERM after one priced assistant message
- **THEN** the last row is a result with subtype terminated, is_error false, and that cost

### Requirement: pi-host-isolation

The shim SHALL run Pi in a temporary agent directory holding only the selected provider credential, and SHALL refuse a credential that expires too soon.

- The directory also holds the default provider setting and is removed on exit.
- The minimum credential lifetime is configurable.
- FOUNDATION_, CLAUDE_FOUNDATION_PROJECT, CLAUDE_PROJECT_DIR, PI_TEAM_ and ORCA_ variables are stripped from Pi's environment.
- Pi dialog requests are answered as cancelled.

#### Scenario: Short-lived credential

- **WHEN** the source credential expires in less than the minimum lifetime
- **THEN** the shim exits non-zero with an error result and starts no Pi process

#### Scenario: Isolated directory

- **WHEN** the fake Pi records PI_CODING_AGENT_DIR and its environment
- **THEN** the directory held only the selected credential, no FOUNDATION_ variable reached Pi, and the directory is gone after exit

### Requirement: lab-pi-host

lab.mjs SHALL accept --host pi, which installs with install-pi.sh, passes the shim as the runner's --claude-bin, records host pi in the run manifest and names the run <scenario>-pi-<stamp>, and SHALL accept --model, which pins that model for every arm through the runner's host arguments.

#### Scenario: Pi dry run

- **WHEN** lab.mjs --scenario notes-api --host pi --model claude-sonnet-5-5 --dry-run runs
- **THEN** the runner arguments include --claude-bin with the Pi shim and --model claude-sonnet-5-5, and the prepared project contains .pi/extensions/changeloop.ts

#### Scenario: Baseline stays on Claude

- **WHEN** --host pi is combined with a baseline arm
- **THEN** the lab refuses the combination

### Requirement: scorecard-host

run.mjs SHALL accept --host and record it as provenance.host, defaulting to claude-code, and lab.mjs SHALL pass --host pi for the Pi arm.

#### Scenario: Pi dry run names the host

- **WHEN** lab.mjs --host pi --dry-run runs
- **THEN** the runner arguments include --host pi
