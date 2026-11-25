# @hashtagf/pi-extensions

Maintainer Pi extensions used while developing Change Loop, laid out as a
standard [Pi package](https://pi.dev/packages). They are not part of the
product: `install.sh`, `install-pi.sh`, and the Homebrew formula never copy this
folder. The product's Pi adapter lives in `.claude/harness/adapters/`.

| Extension | Purpose |
|---|---|
| `agent-team/` | Worker sessions, messaging, task board, agent bar |
| `ask-user/` | Persistent structured user questions (`ask_user`, `/questions`) |
| `background-bash/` | Background shell jobs (`background_bash`, `background_job`) |
| `nine-router/` | `9router` model provider with catalog discovery ([README](nine-router/README.md)) |
| `session-title/` | Names each session after its work so terminal tabs differ (`session_title`) |
| `team-webui/` | Workspace web hub (`/serve`), task board (`task_board`), `tool_guide` ([README](team-webui/README.md)) |
| `claude-accounts/` | Per-session Claude account switching (`/accounts`); needs the `pi-claude-subscription` package ([README](claude-accounts/README.md)) |
| `btw/` | Side questions about the conversation (`/btw`) that never enter the session ([README](btw/README.md)) |

The extensions import each other by sibling path, so they ship as one package
and stay side by side when installed. Every tool, command and shortcut is
listed in [docs/tools.md](docs/tools.md), generated from what the extensions
register; per-extension behavior is in each folder's README.

## Package layout

```text
pi-extensions/
├── package.json        # pi.extensions manifest, peerDependencies, scripts
├── CHANGELOG.md        # "## [x.y.z]" headings; Pi shows new entries after updates
├── LICENSE
├── docs/tools.md       # generated tool reference
├── scripts/            # pack-check, tool-docs, typecheck tests (not published)
├── tsconfig.json
├── agent-team/  ask-user/  background-bash/  nine-router/  session-title/
├── team-webui/  claude-accounts/  btw/
├── install.sh          # copy-install into ~/.pi/agent/extensions
└── test.sh             # Node tests; --tui adds real-terminal smokes
```

Pi supplies `@earendil-works/pi-ai`, `pi-coding-agent`, `pi-tui` and `typebox`,
so they are `peerDependencies` (`"*"`) and pinned only as `devDependencies` for
type checking and the doc generator.

## Develop

```bash
cd pi-extensions
npm install                 # dev tools only: tsc, Pi types and loader
npm run check               # typecheck + docs:check + pack:check + tests
npm run test:tui            # adds the real-terminal smokes
npm run docs                # regenerate docs/tools.md after changing a tool
npm run build:renderers     # rebuild team-webui Markdown/Mermaid bundles
bash install.sh --dry-run
bash install.sh             # copies into ~/.pi/agent/extensions, backs up replaced copies
```

Then run `/reload` in open Pi sessions. `PI_CODING_AGENT_DIR` overrides the
agent directory. `PI_WEBUI_EXTENSION` adds a web UI extension to the
background-bash TUI smoke.

## Configuration

Optional, read-only: `$XDG_CONFIG_HOME/pi-extensions/config.json`
(default `~/.config/pi-extensions/config.json`). A missing file, malformed JSON
or a wrong-typed value falls back to the default.

```json
{ "askUser": { "bell": false }, "nineRouter": { "baseUrl": "http://10.0.0.5:20128/v1" } }
```

| Setting | Default | Effect |
|---|---|---|
| `askUser.bell` | `true` | Terminal BEL when a new question appears; `PI_ASK_USER_BELL=0` also disables it |
| `nineRouter.baseUrl` | `http://localhost:20128/v1` | 9router endpoint; `NINEROUTER_BASE_URL` takes precedence. Never put the API key here |

## Events

ask-user publishes on `pi.events` under `pi-extensions:ask-user:*`
(`prompt`, `resolved`, inbound `answer`, verdict `answer-result`); payloads are
in [ask-user/README.md](ask-user/README.md). background-bash emits the shared
`pi:local-ui` signal used by web UI integrations.

## Release

1. Add a `## [x.y.z]` section to `CHANGELOG.md` and bump `version`.
2. `npm run check` (also runs as `prepublishOnly`).
3. Publishing (`npm publish`) and tagging need separate explicit authority; a
   Change Loop Land never implies them.
