# Maintainer Pi extensions

Repository-only Pi extensions used while developing Change Loop. They are not
shipped: `install.sh`, `install-pi.sh`, and the Homebrew formula never copy this
folder. The product's Pi adapter lives in `.claude/harness/adapters/`.

| Extension | Purpose |
|---|---|
| `agent-team/` | Worker sessions, messaging, task board, agent bar |
| `ask-user/` | Persistent user questions (`ask_user`, `/questions`) |
| `background-bash/` | Background shell jobs (`background_bash`, `background_job`) |

They import each other by sibling path, so keep them side by side.

Develop here, then install:

```bash
rtk bash pi-extensions/test.sh             # Node tests; add --tui for real-terminal smokes
rtk bash pi-extensions/install.sh --dry-run
rtk bash pi-extensions/install.sh          # copies into ~/.pi/agent/extensions, backs up replaced copies
```

Then run `/reload` in open Pi sessions. `PI_CODING_AGENT_DIR` overrides the
agent directory. `PI_WEBUI_EXTENSION` adds a web UI extension to the
background-bash TUI smoke. Per-extension details are in each folder's README.
