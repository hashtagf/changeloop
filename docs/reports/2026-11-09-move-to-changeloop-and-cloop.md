# Move to `hashtagf/changeloop`, `changeloop.ai`, and the `cloop` command

**Status:** plan with in-repository steps implemented on 2026-11-09; external
steps pending. **Audience:** maintainers. This record holds the decisions and
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

1. **[user]** `changeloop.ai` is delegated to Cloudflare (`ernest`/`brianna`
   nameservers on 2026-11-09) but has no `A` record yet; complete step 4.
2. **[agent, with authority]** Create `hashtagf/changeloop` (public, required for
   free GitHub Pages with a custom domain), push `main`, branches, and tags.
3. **[user]** In the new repository: enable Pages (GitHub Actions source), set
   the custom domain to `changeloop.ai`, enforce HTTPS, and copy the release
   and bottle secrets.
4. **[user]** In Cloudflare: apex `A` records to GitHub Pages
   (`185.199.108–111.153`), `www` `CNAME` to `hashtagf.github.io`, DNS-only
   (grey cloud) until the Pages certificate is issued.
5. **[user]** Keep `claude-foundation.dev` and redirect it with a 301 to
   `https://changeloop.ai/$path` (Cloudflare Redirect Rule) so search ranking
   and existing links carry over. Then submit the new domain and sitemap in
   Google Search Console and use its change-of-address tool.
6. **[user]** In the old repository: add a README notice pointing to the new
   home, and publish one final release whose notes say where releases now live.
   Installs older than this change check the old repository for updates.
7. **[agent]** Cut the next release from `hashtagf/changeloop`. The formula then
   points to the new source tarball and bottle.
8. **[agent]** On a clean machine, verify
   `brew tap hashtagf/changeloop https://github.com/hashtagf/changeloop`,
   `brew install cloop`, `cloop version`, and whether Homebrew asks for
   `brew trust` on the new tap; document it if it does.

## Verification limits

The formula was syntax-checked and linted (`brew style`, 0 offenses) and the
alias resolution was checked with a local tap. It was not installed end to end,
because no release exists in the new repository yet.
