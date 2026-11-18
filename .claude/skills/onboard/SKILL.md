---
name: onboard
description: "Use when a project that installed Change Loop needs setting up for agents: quality lanes and baselines, the feature map, module boundaries (ตั้งค่าโปรเจกต์ให้พร้อมใช้ Change Loop). Skip installing files (cloop init) and agent guides (claude-md)."
---

# Onboard a project

The harness reports what setup is missing; you draft what needs judgment; the
user decides what becomes binding.

## Steps

1. Run `cloop doctor --json`; work only `setup` rows that are not `ok`, running
   each row's next command.
2. Quality: `cloop quality discover`, then `cloop quality init --write` when the
   config is missing.
3. Baselines: `cloop quality run`, report each lane's finding count, and ask once
   whether today's findings become the baseline; after a yes run
   `cloop quality baseline --write --decision-ref <answer> --reason <why>`.
4. Feature map: draft 5–20 user-facing features per
   `references/feature-map-guide.md`; the user renames, merges, or drops them.
5. Module boundaries (optional): propose modules from real imports with their
   current violations; add the lane only if the user agrees.
6. Lessons: offer each warned lesson's `adoption.draft` through `/change`.
7. Rules: draft `quality/rule-enforcement.json` per
   `references/rule-registry-guide.md`; the user confirms each layer.
8. Verify with `cloop features --strict`, `cloop quality run`, and
   `cloop quality readiness --pretty`; report each layer's percent and next step.
9. Hand a missing or stale `CLAUDE.md`/`AGENTS.md` to `claude-md`.

## Harness

Writes only `quality/foundation-quality.json`, `quality/baselines/**` (after the user's decision), `quality/rule-enforcement.json`, and `openspec/feature-map.json`.
Never edits product code, reruns `cloop init` unasked, wires evidence (`advance` does), commits, or pushes.
Without Change Loop installed: stop; `cloop init` comes first.

## References

- `references/feature-map-guide.md` — choosing features and the JSON shape.
- `references/rule-registry-guide.md` — pyramid layers, what counts as a check,
  and the registry shape.
