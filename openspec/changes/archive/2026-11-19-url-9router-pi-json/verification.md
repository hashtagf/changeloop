# Verification

Summary of the proof run Land accepted. Receipts stay in the local proof store; the SHA-256 identifies each one.

| Proof run | Status | Workspace hash | Contract fingerprint |
|---|---|---|---|
| `proof-1795104407301` | pass | 479bd66edc3985d000d69cedf7c5a08127931e64fb2d62e39a6289c559073355 | 70cb8a16704bd69c20e73418f17f501af38f9bf109df67a2ef3f969101619cf2 |

## Providers

| Provider | Claims | Status | Observed | Command | Duration | Receipt SHA-256 |
|---|---|---|---|---|---|---|
| discovery | configure-from-pi-9router-login-base-url, configure-from-pi-url-url, configure-from-pi-esc, configure-from-pi-url, configure-from-pi-ninerouter-base-url | pass | 18 discovered; minimum 1 | sh -c node --test pi-extensions/nine-router/provider.test.cjs | 2.6 s | b3a9d1c23082d2f38d07aaf5526f606a4be0d2d61c5f2d483ec118408792386e |
| review | configure-from-pi-9router-login-base-url, configure-from-pi-url-url, configure-from-pi-esc, configure-from-pi-url, configure-from-pi-ninerouter-base-url | pass | No defects attributable to the scoped hunks were found. The changed tests cover all five agreement scenarios. | — | 0.0 s | 3492101f9559d5161df8c6a4523ab8a2951d4a0056a0e03b3890f6a836ce04ca |
| test | configure-from-pi-9router-login-base-url, configure-from-pi-url-url, configure-from-pi-esc, configure-from-pi-url, configure-from-pi-ninerouter-base-url | pass | exit 0; 2647ms; readiness observed; reused Build task check T001 (same command, cwd, environment, content); critical cases not declared | sh -c node --test pi-extensions/nine-router/provider.test.cjs | 2.6 s | fb6c42a14074dc388bfc9e07696d628924c850212897b43bc7da09c420fd26a6 |

## Advisories

None.

## Review

See Appendix: Review record in proposal.md.
