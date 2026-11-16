# Changelog

All notable changes to `@hashtagf/pi-extensions`. Headings follow Pi's package
changelog format (`## [x.y.z]`) so Pi can show them after an update.

## [Unreleased]

### Changed

- team-webui: task board statuses now follow Change Loop phases — `open`,
  `investigate`, `change`, `build`, `prove`, `land`, `deliver`, `merge`, `tag`,
  `deploy`. Existing stores migrate once (plan/design → change, verify/review →
  prove or land for landed Change Loop cards, pr → deliver, deployed → deploy),
  including dependency thresholds. Imported Change Loop cards map phase to
  status directly. Deliver/merge/tag/deploy require evidence.

## [0.4.0]

### Added

- team-webui: the Pi workspace web hub (`/serve`), `task_board`,
  `tool_guide` and the task panel, previously the separate unversioned
  `pi-team-webui` package. It now uses the sibling background-bash manager.
  `npm run build:renderers` rebuilds its Markdown/Mermaid bundles.
- claude-accounts: `/accounts` per-session Claude account switching. It
  loads the `git:github.com/inhumanxd/pi-claude-subscription` package from
  the Pi agent directory; without it Pi still starts and `/accounts`
  explains how to install it.

### Changed

- `npm run typecheck` covers every extension in the package.

## [0.3.0]

### Added

- session-title: an unnamed session is named after the first user prompt
  (first line, up to 48 characters), and the agent keeps it current with the
  `session_title` tool. Orca and other titlebars show the session name, so
  tabs show what each session is doing. A name set with `/name` is never
  replaced.

## [0.2.0]

### Added

- nine-router: `9router` provider for a [9router](https://github.com/decolua/9router)
  gateway. Chat uses Pi's openai-completions API; the model catalog comes from
  the router's `/v1/models` (context window, max output, vision, reasoning) and
  is saved for `pi -p`, RPC and offline starts. URL from `NINEROUTER_BASE_URL`
  or `nineRouter.baseUrl` in the config file; key from `NINEROUTER_API_KEY` or
  `/login 9router`.

## [0.1.0]

### Added

- Package manifest (`pi.extensions`), host packages as `peerDependencies`,
  `npm run check` (typecheck, generated tool docs, pack contents, tests).
- `docs/tools.md`, generated from the tools, commands and shortcuts each
  extension registers.
- ask-user: structured questionnaires (1-4 questions, typed options with
  description/recommended/preview, multi-select, notes), tabbed terminal
  dialog with Submit review, persistent drafts, terminal BEL.
- ask-user: config file `~/.config/pi-extensions/config.json`
  (`askUser.bell`).

### Changed

- ask-user event bus channels are namespaced `pi-extensions:ask-user:*`
  (were `ask-user:*`).
