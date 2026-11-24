# Repository map

**Audience:** maintainers and agents changing Change Loop itself. Moved from
`CLAUDE.md`, which links here.

Shipped product:

- `.claude/orchestrator.md` and `.claude/commands/` — agent-facing lifecycle.
- `.claude/harness/foundation.mjs` — composition root and compatibility entry.
- `.claude/harness/runtime/` — core, evidence, workflow, observability,
  quality, and portable contracts; `workflow/` is split into layered feature
  groups (see `runtime/README.md`).
- `.claude/rules/`, `.claude/skills/`, `.claude/hooks/` — routing, procedures,
  and host enforcement.
- `openspec/schemas/` — rapid and standard assurance profiles.
- `WORKFLOW.md` — installed lifecycle reference.

Repository-only development surfaces:

- `.claude/tests/` — deterministic unit, seam, integration, mutation, and
  consumer-install suites.
- `.claude/tests/bench/` — frozen scenario lab and release evidence tooling.
- `scripts/release/`, `RELEASING.md`, `Formula/`, `.github/workflows/` — release
  and distribution tooling. Paid portfolio execution is manual and explicitly
  authorized; there is no scheduled paid workflow.
- `dashboard/`, `website/`, and `examples/` — observability UI, public docs, and
  sample consumers.
- `pi-extensions/` — maintainer Pi extensions (agent team, user questions,
  background jobs), installed into Pi by `pi-extensions/install.sh`.

## Change-specific gates

| Change touches | Required focused checks in addition to the default gate |
|---|---|
| Runtime/composition | nearest unit/seam tests, wiring and architecture checks |
| Commands, skills, hooks, docs | context budgets, command contracts, docs consistency |
| Installer, schemas, protocol | installer smoke, managed ownership, upgrade matrix |
| Evidence or Land | freshness/receipt seams, recovery checkpoints, semantic acceptance |
| Website docs | English/Thai parity and `website/docs` build |
| Release tooling | release preflight, local rehearsal, `RELEASING.md` |
