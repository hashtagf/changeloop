# Claude accounts for Pi

Run `/reload` in existing sessions. New sessions load this extension automatically.

- `/accounts`: select an account or add one through TUI/Web dialogs.
- `/accounts add work`: sign into a new named account. Open the short localhost link on this computer in the appropriate browser profile; it redirects to the complete OAuth URL without terminal line wrapping. Paste the complete callback URL or code. Esc hides the input but leaves browser sign-in waiting; `/accounts cancel` cancels it. Sign-in times out after five minutes. If the local callback port is unavailable, the original full OAuth URL is shown instead.
- `/accounts use work`: keep the same Claude model, change only this session's account.
- `/accounts use default`: return to the existing subscription account.
- `/accounts login work`: reauthenticate that named profile.
- `/accounts rename work office`: rename without logging in again. The credential/provider ID stays fixed, including for running sessions and workers. `/accounts use office` then resolves the new name. Existing sessions discover the label change when they open `/accounts` or reload. Names cannot overwrite another saved account. `default` remains an alias for the original account even if you rename its display name.
- `/accounts list`: show saved profile names and emails, never tokens.

Names use 1–32 lowercase letters, digits or hyphens. `default` refers to the existing `claude-subscription` credential. Adding a profile does not select it or change the default provider/model settings. Busy sessions and queued messages block account switches. No automatic rotation is performed.

Each named profile starts as a separate `claude-subscription-account-<name>` provider. Its ID is permanent across renames. Display names live in `claude-account-names.json` beside `auth.json`, with atomic updates; that file contains no credentials. Pi's native credential store locks login/refresh operations and retains each profile's token, device, account and organization identity in its own slot in `auth.json`. Credentials are not duplicated into a new config file or shown in conversation messages. The footer/status shows the selected name; the existing Web extension mirrors status and dialogs. The normal model picker also lists each profile.

Managed agents inherit the selected provider when spawned; an explicit provider override can choose another saved profile. Existing sessions discover newly added profiles when `/accounts` is opened. New processes can start with `--provider claude-subscription-account-work --model <same-model-id>`.

Requires the small installed provider factory change accepting provider ID/name in `pi-claude-subscription/index.ts`. If a package update removes that support, profile registration refuses to overwrite the default provider.

Verification: `npm test` in pi-extensions (runs `claude-accounts/*.test.cjs`). Requires the `git:github.com/inhumanxd/pi-claude-subscription` Pi package; without it `/accounts` explains how to install it. Tests use isolated credentials, fake OAuth responses and real Pi loader/RPC; no real sign-in or inference is performed.
