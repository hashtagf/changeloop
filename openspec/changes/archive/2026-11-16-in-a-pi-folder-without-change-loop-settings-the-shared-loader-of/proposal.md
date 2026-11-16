# Change: In a Pi folder without Change Loop settings, the shared loader offers /change, /investigate, /dev and /feature; the first use in a trusted project creates follow-machine settings at the project root, reloads Pi and runs the same command, so Change Loop works without a per-repository install step.

- **Change:** `in-a-pi-folder-without-change-loop-settings-the-shared-loader-of` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## Why

The owner wants Change Loop usable in Pi immediately in any repository. Today a repository without .changeloop.json only has /changeloop; the user must run /changeloop init and /reload before /change. The owner chose to create settings on the first work command so folders that are only opened or chatted in are never written.

## Scope

- **In scope (`pi-host-adapter`):** First work command sets up and continues; Unsafe folders are never written; Opening or chatting writes nothing; Docs and changelog describe first-use setup
- **Out of scope:** edits outside `.claude/harness/adapters/pi-bootstrap.mjs`, `.claude/harness/adapters/pi-shared.ts`, `.claude/harness/tests/pi-shared.test.mjs`, `.claude/harness/README.md`, `CHANGELOG.md`

## Impact and risk

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## Communication, support, and release note

### Release note

In Pi, /change, /investigate, /dev and /feature now work in any trusted repository: the first one sets up Change Loop for that repository (following the machine version) and continues. Opening a folder or chatting writes nothing.

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| bootstrap-commands | First /change in a fresh repository | unclassified | T001 | test: `.claude/harness/tests/pi-shared.test.mjs` | — |
|  | Stale or foreign hand-off is ignored | unclassified | T001 |  |  |
| bootstrap-refusals | Untrusted folder | unclassified | T001 | test: `.claude/harness/tests/pi-shared.test.mjs` | — |
|  | Home directory | unclassified | T001 |  |  |
|  | Local installation | unclassified | T001 |  |  |
| no-write-on-open | Just opened | unclassified | T001 | test: `.claude/harness/tests/pi-shared.test.mjs` | — |
| first-use-docs | Documented | unclassified | T002 | test | — |

## Definition of done

- Fresh evidence for every claim (7).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Derived by the harness

- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for bootstrap-commands, bootstrap-refusals, no-write-on-open, first-use-docs.

## Appendix: Review record

| Round | Finding | Severity | Fix | Reviewer |
|---|---|---|---|---|
| 2 | changelog-missing-fs-root-refusal: The refusal list names untrusted folders, the home directory and local installations, but not the filesystem root. The bootstrap-refusals requirement and bootstrapRefusal (pi-bootstrap.mjs:30) both refuse when the project resolves to the filesystem root. Adding 'or the filesystem root' would make the entry complete. This doesn't change whether first-use-docs is met, so it doesn't block the review. (root/CHANGELOG.md:22) | minor | open | claude-opus |
