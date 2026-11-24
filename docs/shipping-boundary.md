# Shipping boundary

**Audience:** maintainers and agents changing what Change Loop installs.
Moved from `CLAUDE.md`, which keeps a one-paragraph summary and links here.

`install.sh` is authoritative. These paths are managed and overwritten during
installation:

```text
.claude/orchestrator.md
.claude/commands
.claude/harness
.claude/skills
.claude/rules
.claude/hooks
openspec/schemas
.foundation/.gitignore
.foundation/README.md
WORKFLOW.md
```

These are project-owned and must be preserved: `.claude/settings.json`,
`openspec/config.yaml`, `openspec/repositories.yaml`, `foundation.json`,
`CLAUDE.md`, `AGENTS.md`, active OpenSpec changes, and `.foundation` state.
Installers may seed or merge them only through their documented ownership rules.

`install.sh` copies `.claude/harness` except its `tests/` and `fixtures/`
(`UNSHIPPED`); those stay repository-only.

A skill with `VENDORED.md` (`ux-ui-principles`, `test-design`) is an unchanged
upstream copy, exempt from the authored-skill budgets and shape rules but not
from the authority guards (`vendored-skills` in the skill-guidance spec). Do not
edit it in place: update it by copying a newer upstream release, record the
release, commit, exclusions, and whitespace-only edits in `VENDORED.md`, and
update the pinned source in that requirement,
`.claude/tests/docs/skill-catalog.test.mjs`, and
`.claude/tests/harness/run-installer-tests.sh`. `skill-creator` and `ui-ux-pro-max` are adapted upstream copies
without `VENDORED.md`; their local script and path fixes (see `CHANGELOG.md`)
must be reapplied after any upstream sync.

Never make a shipped file depend on repository-only tests, reports, or release
paths. Never store benchmark history, incidents, or cost observations in the
installed runtime.
