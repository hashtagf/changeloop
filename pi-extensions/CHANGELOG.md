# Changelog

All notable changes to `@hashtagf/pi-extensions`. Headings follow Pi's package
changelog format (`## [x.y.z]`) so Pi can show them after an update.

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
