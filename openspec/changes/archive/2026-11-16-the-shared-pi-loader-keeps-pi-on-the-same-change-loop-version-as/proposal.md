# Change: The shared Pi loader keeps Pi on the same Change Loop version as the machine's cloop: at Pi startup and /reload it installs the machine CLI's runtime bundle when its version differs, and shared projects can follow the machine version instead of pinning one bundle.

- **Change:** `the-shared-pi-loader-keeps-pi-on-the-same-change-loop-version-as` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## Why

The owner wants Pi to always use the Change Loop version installed on the machine. Today the shared Pi bundle is installed by hand, so after brew upgrade Pi keeps the old runtime, and every shared project pins one bundle forever.

## Scope

- **In scope (`pi-host-adapter`):** A CLI endpoint installs its own runtime bundle into Pi; Pi follows the machine cloop version; Shared projects can follow the machine version; Docs and changelog describe following the machine version
- **Out of scope:** edits outside `cli.sh`, `.claude/harness/adapters/pi-runtime.mjs`, `.claude/harness/adapters/pi-installation.mjs`, `.claude/harness/adapters/pi-shared.ts`, `.claude/harness/runtime/core/project-installation.mjs`, `.claude/harness/tests/pi-shared.test.mjs`, … +2 more

## Impact and risk

- **Impact:** medium
- **Coupling:** isolated
- **Affected surfaces:** code
- **Security triggers:** none detected

## Communication, support, and release note

### Release note

Pi now follows the machine's Change Loop: after brew upgrade, reopening or reloading Pi installs the new runtime, and new shared projects use it automatically. Projects that pin a bundle keep it until you run /changeloop follow.

## Acceptance traceability

Tasks: `tasks.md`; scenarios: the specs.

| Requirement | Scenario | Kind | Task | Check | Decision |
|---|---|---|---|---|---|
| host-pi-runtime | Endpoint installs and reports | unclassified | T001 | test: `.claude/harness/tests/pi-shared.test.mjs` | — |
| loader-syncs | Broken CLI keeps the old bundle | failure | T001 | test: `.claude/harness/tests/pi-shared.test.mjs` | — |
|  | Upgrade is picked up | unclassified | T001 |  |  |
|  | Same version starts without reinstalling | unclassified | T001 |  |  |
| project-follow | Follow resolves to current | unclassified | T001 | test: `.claude/harness/tests/pi-shared.test.mjs` | — |
|  | Pinned stays pinned | unclassified | T001 |  |  |
|  | Switch modes | unclassified | T001 |  |  |
| docs | Documented | unclassified | T002 | test | — |

## Definition of done

- Fresh evidence for every claim (8).
- Changed tests fail on the original code.
- Review: risk-tiered AI review (medium tier, standard model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## Appendix: Derived by the harness

- **Failure matrix:** read from scenarios that state a rejection or error (1); recovery is "No separate step; the outcome is the handling" where unstated.
- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for host-pi-runtime, loader-syncs, project-follow, docs.

## Appendix: Review record

| Round | Finding | Severity | Fix | Reviewer |
|---|---|---|---|---|
| 1 | pinned-test-non-discriminating: The 'Pinned stays pinned' proof asserts only `resolveRoot(project).status === 1`. The pinned bundle A (bundle.bundle) is not installed under agent-follow, and the source tree has no bundle.json, so resolution fails with 'not installed'. If sharedPackageRoot wrongly redirected a pinned marker to Pi's current bundle (fake 9.9.9), assertSharedInstallation would throw 'bundle differs from the project pin' and still exit 1. So the test cannot detect the defect the claim guards against, and it never shows the project resolving to bundle A. Fix: install bundle A into the agent dir (or point PI_CODING_AGENT_DIR at an agent where A exists alongside a different current bundle B), then assert that stdout equals A's release path. (root/.claude/harness/tests/pi-shared.test.mjs:207) | major | verified in round 2 | claude-opus |
| 1 | loader-sync-proof-skipped-without-pi: The only test for the three loader-sync claims has `skip: !existsSync(join(homedir(), '.pi/agent/install/current-version'))`. On any machine without a real Pi install (for example CI or a clean runner), node --test reports it as skipped. The declared evidence command (`node --test .claude/harness/tests/pi-shared.test.mjs && grep ...`) then exits 0, so Upgrade is picked up, Same version starts without reinstalling, and Broken CLI keeps the old bundle can be recorded as proven without any execution. Fix: make the evidence fail when the test is skipped, or exercise followMachine without Pi's extension loader (for example, extract the sync logic into an .mjs module that the loader imports and test it directly). (root/.claude/harness/tests/pi-shared.test.mjs:216) | major | verified in round 2 | claude-opus |
| 1 | pin-mismatch-test-now-hits-follow-branch: Init now defaults to follow, so `root`'s marker is a follow marker. The existing 'bundle pin mismatch' test adds `runtime: '0.0.0'` to it, which now trips the follow+pin conflict guard instead of the restructured pinned runtime/runtimeApi mismatch check in assertSharedInstallation (project-installation.mjs:36). The pinned mismatch branch, which this change moved, is no longer exercised. Use a pinned marker in that test. (root/.claude/harness/tests/pi-shared.test.mjs:48) | minor | resolved by round 2 | claude-opus |
| 1 | switch-modes-not-via-command: The Switch modes scenario is about `/changeloop pin` then `/changeloop follow` pinning the *current* bundle. The test calls setProjectRuntimeMode directly with bundle.path while Pi's current bundle is the fake 9.9.9, so it never checks that the pin names the current bundle. It also leaves the command wiring at pi-shared.ts:86-92 (trust check, root check, passing `runtime`) untested. The existing loadExtensions harness at line 131 could drive the command handler. (root/.claude/harness/tests/pi-shared.test.mjs:204) | minor | resolved by round 2 | claude-opus |
| 1 | source-checkout-version-never-matches: For a source-checkout CLI not on a tag, cli.sh print_version emits 'claude-foundation 3.7.2+source.3.7.2-5-gabc-dirty'. The trailing-version regex then captures '3.7.2-5-gabc-dirty', which never prefixes a '3.7.2-api42-…' bundle. The loader therefore runs host pi-runtime (a full tree copy and digest, up to a 120 s timeout) on every Pi start and /reload for maintainers whose cloop points at a checkout. Consider stripping '+…' build metadata, or comparing against the CLI's protocol runtime. (root/.claude/harness/adapters/pi-shared.ts:42) | minor | resolved by round 2 | claude-opus |
| 1 | follow-blocked-when-pin-missing: `if (failure) throw` runs before the follow/pin branch, so a project whose pinned bundle is not installed (for example a fresh clone on another machine) cannot use `/changeloop follow` to recover; the user has to edit .changeloop.json by hand. The CHANGELOG presents `/changeloop follow` as the way out of a pin. In that state the message also still says 'project-pinned' when a follow project's current bundle is missing (line 73). (root/.claude/harness/adapters/pi-shared.ts:80) | minor | resolved by round 2 | claude-opus |
