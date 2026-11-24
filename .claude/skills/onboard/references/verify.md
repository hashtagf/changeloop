# A verify route for agents

An agent that can run the real thing checks its own change: it starts the app,
drives one flow, and reads what happened. That catches what unit tests and
type checks miss, and an end-to-end check is hard to fool. The readiness row
`verify` is met by a verify skill, an `e2e`/`smoke`/`verify` script, an
end-to-end tool the project declares, or an end-to-end test directory.

## Drafting a verify skill

When the row is not met, draft a `verify` skill in the project's own skills
directory (a `SKILL.md` under a `verify` folder) from what the project already
has, and show it to the user before writing:

- **Start:** the project's own start or dev command (`npm run dev`, `make run`,
  `go run ./cmd/...`, `docker compose up`), the port or URL it prints, and how
  to know it is ready.
- **Drive one real flow:** for a web UI, open the page and act through the
  browser tool the host has; for an API, one request with `curl` and the
  expected status and body; for a CLI, one command and its expected output.
- **Read the result:** what success looks like, and what to report as evidence
  (the command and its output, or a screenshot).
- **Stop:** how to shut the app down.

Keep it short and fast; a slow or flaky verify route trains the agent to skip
it. Never put credentials or production URLs in the skill.

## Stronger tests worth proposing

Propose these through `/change`, only where the code calls for them:

- **Property tests** (fast-check, Hypothesis, proptest) for parsers,
  serializers, money and other invariants: round trips, idempotency, and
  "never negative" rules find edge cases the author did not think of.
- **Differential tests** for a migration or rewrite: run old and new on the
  same inputs and compare, with a list of approved differences.
