# nine-router

Registers the `9router` provider for a [9router](https://github.com/decolua/9router)
gateway: one OpenAI-compatible endpoint that routes to many upstream providers
with fallback. Chat requests use Pi's built-in `openai-completions` API; this
extension only supplies the endpoint, the key and the model catalog.

## Configure

In Pi, run `/login 9router`, enter the gateway's Base URL (for example,
`https://router.example.com/v1`), then paste the API key from the 9router
Dashboard. Open `/model` to pick a model; no reload is needed. To set a new
URL through `/login`, enter the key for that endpoint again. Escape cancels
without changing the saved settings.

| What | Source, in order |
|---|---|
| Endpoint | `NINEROUTER_BASE_URL`, then the URL saved by login, then `nineRouter.baseUrl` in `~/.config/pi-extensions/config.json` (`$XDG_CONFIG_HOME` honored), then `http://localhost:20128/v1` |
| API key | Key saved by `/login`, then `NINEROUTER_API_KEY` |

When `NINEROUTER_BASE_URL` is set to a valid URL, login shows the enforced
endpoint instead of asking for a URL. Existing saved keys still work with the
previous URL configuration until you log in again. Use HTTPS for a remote
gateway and never put its key in the URL, shared config, or repository.

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
