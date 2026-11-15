---
description: Optionally deliver an archived change as a pull request and return its verified URL.
argument-hint: <change>
---

Deliver **$ARGUMENTS**. A direct request ("เปิด PR ให้เลย", "open a PR")
is this command.

Run `claude-foundation deliver advance <change>` once; a proven change Lands
first. It grants only Land, isolation, committing the proven projection,
pushing its feature branch, and opening or updating a pull request—never
force-push, default-branch push, or deploy; it merges only under
`deliver.merge: "after-checks"`. A review follow-up citing
a delivered, open PR updates it; otherwise one opens.

Recover internally; never give the user commands, SHAs, or JSON. Ask only
real decisions. `DONE` requires read-back binding the PR (or merge)
to the delivered commit. Without Deliver, `archived` is complete.
