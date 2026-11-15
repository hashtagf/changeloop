# runtime-maintainability

## ADDED Requirements

### Requirement: rendering-module

The packet-rendering functions SHALL live in .claude/harness/runtime/workflow/draft-packet-render.mjs and change-lifecycle.mjs SHALL no longer define them.

#### Scenario: Rendering module owns the functions

- **WHEN** a maintainer searches for the definition of renderDraftProposal, renderDraftDesign or renderDraftTasks
- **THEN** each is defined only in draft-packet-render.mjs

### Requirement: behavior-identical

Every symbol previously exported by change-lifecycle.mjs SHALL remain importable from it, and the default deterministic gate SHALL pass unchanged.

#### Scenario: Existing importers keep working

- **WHEN** foundation.mjs and the existing tests import rendering functions from change-lifecycle.mjs
- **THEN** the imports resolve and the default gate passes without editing any test expectation
