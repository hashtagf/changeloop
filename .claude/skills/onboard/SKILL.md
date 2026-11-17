---
name: onboard
description: "Use when a project that installed Change Loop needs setting up for agents: quality lanes and baselines, the feature map, module boundaries (ตั้งค่าโปรเจกต์ให้พร้อมใช้ Change Loop). Skip installing files (cloop init) and agent guides (claude-md)."
---

# Onboard a project

The harness reports what setup is missing; you draft what needs judgment; the
user decides what becomes binding.

## Steps

1. Run `cloop doctor --json`; work only `setup` rows that are not `ok`, running
   the deterministic next command each row names.
2. Quality: `cloop quality discover`, then `cloop quality init --write` when the
   config is missing. Keep discovered providers.
3. Baselines: `cloop quality run`, report each lane's finding count, and ask once
   whether today's findings become the baseline. Only after a yes run
   `cloop quality baseline --write --decision-ref <answer> --reason <why>`.
4. Feature map: draft 5–20 user-facing features with their paths per
   `references/feature-map-guide.md`; let the user rename, merge, or drop
   before writing `openspec/feature-map.json`.
5. Module boundaries (optional): propose modules from real imports, say how
   many imports already violate them, and add the lane only if the user agrees.
6. Lessons: if `lessons-enforcement` warns, offer each listed lesson's
   `adoption.draft` through `/change`; never mark one enforced without a check.
7. Verify with `cloop features --strict`, `cloop quality run`, and
   `cloop doctor`; report what is ready and the next command for the rest.
8. Hand a missing or stale `CLAUDE.md`/`AGENTS.md` to `claude-md`.

## Harness

Writes only `quality/foundation-quality.json`, `quality/baselines/**` (after the user's decision), and `openspec/feature-map.json`.
Never edits product code, reruns `cloop init` unasked, wires evidence (`advance` does), commits, or pushes.
Without Change Loop installed: stop; `cloop init` comes first.

## References

- `references/feature-map-guide.md` — choosing features, the JSON shape, and
  what is not a feature; read before drafting the map.
