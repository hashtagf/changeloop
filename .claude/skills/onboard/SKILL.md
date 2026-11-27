---
name: onboard
description: "Use when a project, with or without Change Loop installed, needs setting up for agents: quality lanes and baselines, the feature map, module boundaries (ตั้งค่าโปรเจกต์ให้พร้อมใช้ Change Loop). Skip installing files (cloop init) and agent guides (claude-md)."
---

# Onboard a project

The harness reports missing setup; you draft what needs judgment; the
user decides what becomes binding.

## Steps

1. Run `cloop doctor --json`; run the next command of each non-`ok` `setup` row.
2. Quality: `cloop quality discover`, then `cloop quality init --write` when the
   config is missing (`references/multi-repository.md`); offer
   `test-commands`, or `test-setup` via `/change`.
3. Baselines: `cloop quality run`, report each lane's finding count, ask once
   whether today's findings become the baseline; after yes run
   `cloop quality baseline --write --decision-ref <answer> --reason <why>`.
4. Feature map: draft 5–20 user-facing features per
   `references/feature-map-guide.md`; the user edits them.
5. Module boundaries (optional): show discovery's
   `proposals.module-boundaries`; add its `provider` if the user agrees.
6. Lessons: offer each warned lesson's `adoption.draft` through `/change`.
7. Guides (`references/guides.md`): agent guide to `claude-md`, draft
   `REVIEW.md`, offer `SECURITY.md` once.
8. Rules: draft `quality/rule-enforcement.json` per
   `references/rule-registry-guide.md`; the user confirms each layer.
9. UI and `verify` rows: `references/ui-readiness-guide.md`,
   `references/verify.md`.
10. Check: `cloop features --strict`, `cloop quality doctor` (offer
    hints), `cloop quality run`, `cloop quality readiness --pretty`.

## Harness

Writes only `quality/foundation-quality.json`, `quality/baselines/**` (after the user's decision), `quality/rule-enforcement.json`, `openspec/feature-map.json`, and confirmed `REVIEW.md`/`SECURITY.md`.
Never edits product code, reruns `cloop init` unasked, wires evidence (`advance` does), commits, or pushes.
Without `cloop init`: skip doctor and lessons; Prove enforces nothing until init.

## References

- `references/feature-map-guide.md` — choosing features and the JSON shape.
- `references/rule-registry-guide.md` — pyramid layers, registry.
- `references/ui-readiness-guide.md` — UI rows.
- `references/multi-repository.md` — many repositories.
- `references/guides.md` — project guides.
- `references/verify.md` — verify skill.
