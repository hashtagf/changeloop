# Lessons

**Audience:** agents and maintainers starting an investigation or change in
this project. Change Loop reads this file as grounding before investigations
and changes. It is project-owned: Change Loop seeds it once and never
rewrites it.

Each lesson is a durable rule learned from an incident in
[incidents/](incidents/). Keep one line per lesson, newest first, and link its
incident. When a lesson becomes a rule, a check, or a test, say where in
"Enforced by" and keep the line as history: a project file (`test/refund.test.js`,
`eslint.config.js`) or a quality lane (`quality:duplication`). Prose such as a
note in AGENTS.md does not count; when no check can catch it, write
`judgment: <why>`. `cloop lessons` and `cloop doctor` list recurring lessons
that still lack a check.

| Date | Lesson | Incident | Enforced by |
|---|---|---|---|
