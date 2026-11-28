# Fast checks

An agent runs a check after every edit only when it answers in seconds. A slow
or hanging check gets skipped, and then it guides nothing. When `quality
doctor` reports `provider-slow`, or readiness `tests-fast` is unmet, draft one
`/change` from this guide for the user to approve. Never edit the project's
tests or scripts outside a change.

## 1. Split fast and full suites

Keep a fast suite (unit tests, no network, no real database or browser) for the
edit loop, and a full suite for Prove. Point the `test` lane at the fast suite;
give slow suites their own lane (`integration`, `browser`) with `paths`, so a
change that does not touch them does not wait for them.

| Language | Fast suite | Full or slow suite |
|---|---|---|
| JS/TS | `vitest run --project unit`, `node --test tests/unit` | `vitest run`, `playwright test` |
| Go | `go test -short ./...` (tests call `testing.Short()` to skip) | `go test ./...`, `-tags=integration` |
| Python | `pytest -m "not slow"` | `pytest` |
| Rust | `cargo test --lib` | `cargo test` |
| JVM | `./gradlew test` (unit source set) | `./gradlew integrationTest` |
| Ruby | `rspec --tag ~slow` | `rspec` |
| Dart | `flutter test test/unit` | `flutter test`, `flutter test integration_test` |

## 2. One task, its own tests

A task's `verify` runs only the tests for its paths, for example
`node --test tests/cart.test.ts`, `go test ./services/wallet/...`,
`pytest tests/test_cart.py`. The whole suite runs once in Prove.

## 3. Close what a test opens

A test that leaves a server, connection, timer, or database client open makes
the runner wait after the tests pass (one consumer suite passed in 7s and then
waited 360s, every run).

- Close them in the test's after hook (`server.close()` and
  `server.closeAllConnections()`, `client.close()`, `clearTimeout`).
- Start an expensive service once per suite, not per test; prefer in-memory
  stores (SQLite in memory, `mongodb-memory-server`) over real services in the
  fast suite.
- As a last resort, let the runner exit when the tests finish:
  `node --test --test-force-exit`, `tsx --test --test-force-exit`,
  `jest --forceExit`.

## 4. Run in parallel and cache

Use the runner's own parallelism (`go test -p N`, `pytest -n auto` with
pytest-xdist, `vitest --pool threads`, Gradle `--parallel` and the build
cache). In a monorepo let turbo or nx skip unchanged packages, and keep one
lane per module (`test:<dir>` with `cwd` and `paths`).

## 5. Fast linters and type checks

Prefer the fast tool of each ecosystem: Biome or oxlint for JS/TS, ruff for
Python, golangci-lint with a cache for Go, `cargo clippy` for Rust. Check only
changed files where the tool supports it, and keep type checks incremental
(`tsc --incremental`, `mypy` with its cache).

## 6. Output the harness can read

Print the runner's summary with its time (the default spec, TAP, `go test`,
pytest, cargo, or RSpec output), or a JUnit XML report. The harness reads the
time to tell a slow suite from one that waited after its tests, and never
guesses a pass from a silent run.
