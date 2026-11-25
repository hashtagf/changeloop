# Changelog

All notable changes to `@hashtagf/pi-extensions`. Headings follow Pi's package
changelog format (`## [x.y.z]`) so Pi can show them after an update.

## [Unreleased]

### Added

- btw: `/btw <question>` answers a side question about the current
  conversation with the current model and no tools, in an overlay, even while
  the agent is working. Nothing is written to the session.
- team-webui: viewer (read-only) and member invites that expire after 1 hour,
  24 hours or 7 days and can be revoked, ending the sessions that used them.
  The **Access** dialog lists invites, signed-in people and recent
  state-changing activity. Viewers get 403 for every write except logout.
  Invites and activity live in hub memory; the `/serve` code is unchanged.
- team-webui: English/Thai interface switch, first-run tips and a Help
  dialog, task-stage chips with counts and stage descriptions, a skip link,
  announced replies and in-app branch/worktree dialogs.

### Changed

- team-webui: phones show one task stage at a time and a two-row header;
  touch targets are at least 44px. Project and session paths are shortened.
  A wrong access code now says it is invalid or expired; attaching too many or
  oversized files keeps the valid ones; Send is disabled while empty; message
  headings start at h3; 3D City shows live agent counts.

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
