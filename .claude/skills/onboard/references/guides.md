# Agent guide, review rules, and security policy

The installer seeds an agent guide pointer and a template `REVIEW.md` so
Change Loop works at once. Neither knows this project. `cloop doctor --json`
reports them as the `agent-guide` and `review-rules` setup rows.

## Agent guide (`AGENTS.md` / `CLAUDE.md`)

When `agent-guide` is not `ok`, the guide holds only the Change Loop pointer.
Hand it to the `claude-md` skill, which drafts the project's commands, layout,
and rules for the user to confirm. Never edit the
`claude-foundation:*:start`/`end` blocks; the installer owns them. Draft the
rule registry (step 7) after the guide has rules, since it reads them.

## Review rules (`REVIEW.md`)

The reviewer reads `REVIEW.md` on every change; the rules are advisory and
never decide whether a review passes. When `review-rules` is not `ok`,
draft from facts, not imagination:

- **Owner:** ask who maintains the rules.
- **Passes:** keep the template's five, then add what this project risks: one
  line per sensitive area found (auth, payments, personal data, migrations,
  public API), naming the paths and the failure to look for.
- **From history:** each recurring lesson (`cloop lessons`) and each closed
  incident in `openspec/incidents/` becomes a "check that ..." line.
- **Exclusions:** generated, vendored, and fixture paths seen in the repository.

Show the draft as a diff of the template and write it only after the user
confirms. Keep it under 32 KiB.

## Security policy (`SECURITY.md`)

`SECURITY.md` tells outside reporters how to disclose a vulnerability; agents
do not read it. When it is missing, ask once whether to add it. On yes, ask
for the private contact (email or the host's private advisory form), the
supported versions, and the response time, then write those answers into a
short policy. Never invent a contact or a promise, and never leave a
placeholder in a written file.
