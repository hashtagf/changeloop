# Onboarding a multi-repository topology

A topology of many repositories onboards a few at a time. Nobody chooses well
among hundreds of names, and onboarding everything at once asks the user for
hundreds of decisions.

## Choosing repositories

1. Run `cloop quality readiness` (JSON); read `onboarding`: `onboarded` of
   `total`, and `candidates`, the next repositories ranked by recorded work,
   sensitive areas (auth, payments, personal data), and checks already declared.
2. Ask once, with one question: offer the candidates with their reasons, the
   first one recommended, several selectable, and let the user type other
   repository ids. Never list every repository.
3. When a change is about to write to a repository that is not onboarded, offer
   that repository the same way; do not block the change on the answer.

## Onboarding the chosen repositories

- `cloop quality discover --repo <id>,<id>` drafts only those repositories.
- `cloop quality init --write --repo <id>,<id>` adds them to
  `quality/foundation-quality.json` with `onboardedAt`, keeps the repositories
  already there, and sets `unlisted: not-onboarded`: a change that selects a
  repository outside the list reports it as not onboarded instead of failing.
- `cloop quality run`, then one baseline question for the whole batch, not one
  per repository.
- Module boundaries: offer a draft only for a repository whose proposal lists a
  cycle or more than one module.
- The feature map and rule registry stay project-wide; extend them only for
  what the chosen repositories add.

## Reporting

`cloop quality readiness --pretty` shows each onboarded repository's codebase,
static, and verification layers, weakest first, then the next candidates.
`cloop outcomes` compares each repository before and after its own
`onboardedAt`, on the changes that selected it.
