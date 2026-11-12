---
name: grill-task-gu-please
description: "Use when the user invokes the legacy name grill-task-gu-please, e.g. /grill-task-gu-please <PRD>; alias for grill-task-gu. Otherwise skip it (grill-task-gu)."
---

# Compatibility redirect

The old name is kept so existing prompts do not select the former unbounded
interview.

## Steps

1. Load and follow [grill-task-gu](../grill-task-gu/SKILL.md) completely. If it
   is not installed, apply steps 2–3 directly to the PRD.
2. Keep its contract: full discovery → one Decision Sheet → backlog + coverage
   → handoff.
3. Never ask one question per turn, reopen a locked decision at a phase gate,
   or ask for assignment or dates unless the invocation includes `--schedule`.

## Harness

Same ownership as `grill-task-gu`: no implementation, no compiled-spec
approval, no Git mutation.

## References

- `../grill-task-gu/SKILL.md` — the authoritative procedure.
