# nine-router

Registers the `9router` provider for a [9router](https://github.com/decolua/9router)
gateway: one OpenAI-compatible endpoint that routes to many upstream providers
with fallback. Chat requests use Pi's built-in `openai-completions` API; this
extension only supplies the endpoint, the key and the model catalog.

## Configure

| What | Source, in order |
|---|---|
| Endpoint | `NINEROUTER_BASE_URL`, then `nineRouter.baseUrl` in `~/.config/pi-extensions/config.json` (`$XDG_CONFIG_HOME` honored), then `http://localhost:20128/v1` |
| API key | `NINEROUTER_API_KEY`, else a key saved with `/login 9router` |

Copy the key from the 9router dashboard. Keep it in the environment or in
Pi's `auth.json` via `/login`; never in the config file or the repository.
Error messages name the URL and HTTP status, never the key. An endpoint that is
not an `http(s)` URL is ignored with a warning.

## Models

The catalog is `GET {endpoint}/models`: every chat model and combo the router
(and the key) exposes, named as in the dashboard, e.g. `9router/kr/claude-sonnet-4.5`.

- `context_length` → context window, `max_completion_tokens` → max output;
  128000 / 16384 when the router does not say.
- `capabilities.vision` adds image input; non-empty `thinking_levels` or
  `capabilities.reasoning` marks reasoning support.
- Cost is zero: 9router tracks usage itself.

Like other dynamic providers, Pi fetches the catalog when it starts
interactively, when `/model` opens, after `/login`, and saves the last list.
`pi -p`, RPC and offline starts use the saved list, so open Pi interactively
once after installing (or after the router's models change). A failed fetch
keeps the saved list.

Not included: router status or quota views, and image, speech, embedding or
web-search models.
