# Move to `hashtagf/changeloop`, `changeloop.ai`, and the `cloop` command

**Status:** in-repository and hosting steps completed on 2026-11-09; v3.7.0
published from the new repository on 2026-11-10; a clean-machine Homebrew check
is pending. **Audience:** maintainers. This record holds the decisions and
the remaining external checklist. It is not a release report.

## Decisions (owner: user, 2026-11-09)

| Decision | Choice | Reason |
|---|---|---|
| Human command | `cloop`, with `claude-foundation` kept as a permanent alias | `changeloop` is already the ChangeLoop CLI (OpenCode fork) binary; a hard rename would break installs, scripts, and CI |
| Brand | **Change Loop** (unchanged) | User choice |
| Rename depth | Public names only | `.foundation/`, `foundation.json`, `foundation.mjs`, skill names, schema `$id`s, and runtime routes are compatibility contracts in consumer repositories |
| Repository | New `hashtagf/changeloop`, history pushed | The old `Maximumsoft-Co-LTD/claude-foundation` stays as is, with no automatic redirect |
| Domain | `changeloop.ai` (Cloudflare) | Replaces `claude-foundation.dev` |

## Boundary: what keeps the old name

Agents keep invoking `claude-foundation`. Project permission allowlists seed
`Bash(claude-foundation *)` and `Bash(.foundation/bin/claude-foundation *)`, the
installer writes the `.foundation/bin/claude-foundation` shim, and runtime
next-step routes print `claude-foundation advance …`. Renaming any of these is a
wire-visible change that would add permission prompts in headless consumers;
it is out of scope. The Homebrew formula file stays `Formula/claude-foundation.rb`
because the release and bottle workflows build it by that name.

## Implemented in this repository

| Area | Change |
|---|---|
| Formula | `bin/cloop` symlink and a `cloop version` test; `homepage` and `head` point to the new home; `url`, `sha256`, and bottle `root_url` stay on the published v3.6.11 assets until the next release |
| Tap alias | `Aliases/cloop` → `Formula/claude-foundation.rb`; `brew install cloop` resolves (checked with a local tap, Homebrew 7.0.12) |
| Release workflow | Rewrites the formula's whole `url` line from `GITHUB_REPOSITORY`, not only the version; `TAP` is `hashtagf/changeloop` (also in the bottle workflow) |
| Update advisory | `update-advisory.mjs` reads `repos/hashtagf/changeloop/releases/latest` |
| Docs and site | Repository URLs and the domain updated in README (EN/TH), website pages (EN/TH), landing page, Astro `site`, `robots.txt`, RELEASING, CONTRIBUTING, SECURITY, issue templates, harness README/EVIDENCE, WORKFLOW; commands people type use `cloop` |
| Unchanged on purpose | `CHANGELOG.md` history, dated reports, `LICENSE` copyright, JSON schema `$id`s |

## External checklist (owner in brackets)

Done on 2026-11-09:

1. **[agent]** Created public `hashtagf/changeloop`; pushed `main` and all tags.
2. **[agent]** Enabled Pages (GitHub Actions), custom domain `changeloop.ai`,
   certificate approved for `changeloop.ai` and `www.changeloop.ai`, HTTPS
   enforced. No repository secrets are needed: the workflows use `GITHUB_TOKEN`.
3. **[agent, user-authorized Cloudflare session]** `changeloop.ai`: apex `A`
   records to `185.199.108–111.153` and `www` `CNAME` to `hashtagf.github.io`,
   all DNS-only.
4. **[agent]** `claude-foundation.dev`: two Single Redirect rules, apex and
   `www` only (`http*://claude-foundation.dev/*` and
   `http*://www.claude-foundation.dev/*` → `https://changeloop.ai/${2}`, 301,
   query preserved); the apex `A` and `www` `CNAME` records switched to
   proxied so the rules apply. `9router.`, `chat.`, and `dashboard.` records
   were not changed.
5. **[agent]** Google Search Console: both domains verified by DNS `TXT`,
   `https://changeloop.ai/docs/sitemap-index.xml` submitted, and a change of
   address from `claude-foundation.dev` to `changeloop.ai` started.
6. **[agent]** Old repository README (English and Thai) points to the new home
   (`Maximumsoft-Co-LTD/claude-foundation` commit `46ba15de`).

Pending:

7. **[done 2026-11-10]** v3.7.0 published from `hashtagf/changeloop` after the
   [all-lane checkpoint](scenario-checkpoint-candidate-88f28fe-2026-11-10.md)
   (one failing lane accepted as an explicit exception). The formula points to
   the new tarball and bottle, and the update advisory reads the new
   repository. Installs older than v3.7.0 still check the old repository.
8. **[agent]** On a clean machine, verify
   `brew tap hashtagf/changeloop https://github.com/hashtagf/changeloop`,
   `brew install cloop`, `cloop version`, and whether Homebrew asks for
   `brew trust` on the new tap; document it if it does.

## Verification limits

The formula was syntax-checked and linted (`brew style`, 0 offenses) and the
alias resolution was checked with a local tap. It was not installed end to end,
because no release exists in the new repository yet.
