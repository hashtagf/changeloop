---
name: init-project-docs
description: "Use when asked to document an existing codebase for humans: onboarding, architecture, data model, API, business-rule docs under docs/, or refreshing them after code changes (ทำเอกสาร). Skip CLAUDE.md-only requests (claude-md)."
---

# Project documentation for an existing codebase

Document what traced source and real behavior establish; never invent a domain
or a shipped status.

## Steps

1. Read `references/documentation-workflow.md` to pick the mode (fresh, update,
   diff-scoped), the applicable files, and the viewer command.
2. Follow each core flow through configuration, callers, adapters, and
   persisted or emitted results.
3. Use original decisions and PRs for historical rationale; label inference,
   conflicting sources, and unknowns. Reuse valid research.
4. Write in the requested language per `references/writing.md`; preserve
   authored context, canonical terms, code identifiers, commands, and quotes.
5. Fill the templates, then verify links and generated output through project
   tools.

## Harness

With Change Loop: edit only scoped documentation; agreement and status keep their owners.
Otherwise: edit only the docs suite. A readable document is not proof.

## References

- `references/documentation-workflow.md` — modes, file set, viewer; read first.
  It routes to the per-document templates and the quality bar (Mermaid
  validity, self-review) when you reach the writing step.
- `references/writing.md` — document mode, plain style, protected text.
- Optional, if available: `claude-md` for the agent-facing CLAUDE.md.
