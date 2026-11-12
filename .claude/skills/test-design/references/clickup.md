# Pushing into a tracker (ClickUp / Jira)

A document nobody can tick is a document nobody runs. The goal of this step is to turn every
scenario into something that carries a status.

## The four tiers

```
[Module] <module name>                 ← overview + scenario table · tag by end user · priority
└─ SC-<CODE>-NN · <scenario name>      ← tag: scenario · the full spec
   └─ Test Scenario : <scenario name>  ← the checklist (criteria 1:1) — what QA actually ticks
└─ Issue [SC-<CODE>-NN] : <symptom>    ← task type: Bug · filed under the Module
```

**Why bugs hang under the Module, not the scenario:** one bug usually spans several scenarios,
and scenarios should stay readable specs rather than becoming bug archives. Citing the SC-ID in
the bug title gives all the traceability needed without cluttering the tree.

**Why the scenario and the test task are separate:** the scenario is documentation that outlives
releases (the spec); the test task is the record of one run. Next cycle you create a fresh test
task without touching the spec, and you can still see what passed last time.

## At L1

Skip the tiers. One task, `Test : <work item>`, with the checklist in its description.

## Fields worth setting

| Field | Value |
| ---| --- |
| Module tag | the end user (`client`, `admin`, `internal`) |
| Scenario tag | `scenario` — lets you filter every spec at once |
| Priority | scenario P0→urgent, P1→high, P2→normal, P3→low (execution.md §1); Module = its highest risk |
| Bug fields | Severity and Priority as two separate fields — never one merged "priority" |
| Build | custom field on the test task: the build/version the run used |
| Bug task type | `Bug` |
| Bug assignee | the developer who owns that area, never blank |
| Custom fields | Project, Team, PM — whatever the workspace already uses |

## Creation order

Top down, so parent ids exist first:

```
1. Module task            → keep its id
2. every scenario (parent = module id)
3. a test task per scenario (parent = scenario id)
4. bugs as they're found (parent = module id)
```

With a tracker MCP available, follow that order and **create the Module plus one scenario
first, then show the user before creating the rest**. Creating sixty tasks in the wrong shape
and deleting them afterwards costs far more than one confirmation round — and bulk-deleting
tasks is hard to undo.

## Markdown quirks in ClickUp

- markdown tables work, but need the header separator row `| ---| ---|`
- `- [ ]` becomes a real tickable checkbox
- underscores in identifiers like `access_token` need escaping (`access\_token`) or the text turns italic
- a bare Figma URL auto-expands into an embed card
- `##` is the right heading size for a description; `#` is oversized

## When scenarios already exist

Don't duplicate — map first, then propose:

| Existing | New | Action |
| ---| ---| --- |
| SC-LOGIN-04 Login with Google | SC-OAUTH-01 | move module + rename |
| SC-LOGIN-05 Forgot Password | SC-PWD-01 | move module + rename |

Renumbering breaks the bugs that cite the old ids and the ids the team has memorised. Present
the mapping and let the user decide whether to move them or keep the existing ids — don't decide
for them.
