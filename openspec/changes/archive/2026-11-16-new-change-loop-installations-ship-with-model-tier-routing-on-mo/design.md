# Design

## Work type

config, docs

## Config contract

| Key | Type | Default | Validation | Secret | Per-environment | Reload | Owner | Removal task |
|---|---|---|---|---|---|---|---|---|
| models.routing | — | true in the shipped foundation.json; false when the key is missing | boolean; any other type fails runtime policy validation | — | — | — | — | — |

## File map

| Tasks | Paths |
|---|---|
| T001 | `install.sh`, `foundation.json`, `.claude/tests/harness/run-upgrade-compat-tests.sh`, `.claude/tests/harness/run-context-budget-tests.sh` |
| T002 | `CHANGELOG.md`, `website/docs/src/content/docs/foundation-config.md`, `website/docs/src/content/docs/th/foundation-config.md` |

`+` add · `~` change · `-` remove

```text
.
├── .claude/
│   └── tests/
│       └── harness/
│           ├── ~ run-context-budget-tests.sh
│           └── ~ run-upgrade-compat-tests.sh
├── ~ CHANGELOG.md
├── ~ foundation.json
├── ~ install.sh
└── website/
    └── docs/
        └── src/
            └── content/
                └── docs/
                    ├── ~ foundation-config.md
                    └── th/
                        └── ~ foundation-config.md
```

## Test map

| Scenario | Level | Check | Task |
|---|---|---|---|
| Fresh install; Explicit false survives; Missing key stays off; Explicit true survives | task check | `node -e "if(require('./foundation.json').models.routing!==true)process.exit(1)" && bash .claude/tests/harness/run-upgrade-compat-tests.sh && bash .claude/tests/harness/run-context-budget-tests.sh` | T001 |
| Docs agree | task check | `grep -q 'routing' CHANGELOG.md && grep -q 'New installations ship with' website/docs/src/content/docs/foundation-config.md && grep -q 'การติดตั้งใหม่' website/docs/src/content/docs/th/foundation-config.md && bash .claude/tests/docs/run-doc-consistency.sh` | T002 |
