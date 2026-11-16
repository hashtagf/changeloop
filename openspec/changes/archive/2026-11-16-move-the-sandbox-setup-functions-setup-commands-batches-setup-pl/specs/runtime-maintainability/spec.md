# runtime-maintainability

## ADDED Requirements

### Requirement: sandbox-setup-module

The sandbox setup functions SHALL live in .claude/harness/runtime/workflow/sandbox-setup.mjs and sandbox-runtime.mjs SHALL re-export them unchanged.

#### Scenario: Importers keep working

- **WHEN** existing code and tests import setup functions from sandbox-runtime.mjs
- **THEN** the imports resolve and the default gate passes without editing any test expectation
