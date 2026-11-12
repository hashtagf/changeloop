---
name: skill-suite-auditor
description: "Use when auditing a skills directory as a whole: frontmatter, overlapping or competing triggers, broken references, missing owners, or conflicting instructions. Skip live model comparisons (skill-evaluation) and writing a skill (skill-creator)."
---

# Skill suite auditor

An empty static report does not establish behavioral correctness.

## Steps

1. Pin the catalog, version, and audit scope. Preserve dirty work and custom
   consumer skills. Inventory entry points and dependencies.
2. Run `node scripts/audit.mjs <skills-dir>` (path relative to this skill);
   its JSON reports static metadata and reference coverage only.
3. Read descriptions and bodies for competing triggers, missing task owners,
   undeclared tools, and instructions that conflict with lifecycle, workspace,
   evidence, authority, or recovery contracts.
4. Prioritize defects by concrete failure. Recommend merge, revise, reference,
   or new skill with a positive/negative trigger and an acceptance check.
5. Report audited coverage, source paths, findings, and unknowns.

## Harness

With OpenSpec: store durable implementation choices there, not another ledger. Otherwise: the issue tracker.
Do not import routing hooks, fabricate receipts, or grant external authority.

## References

- `references/pstack-adoption.md` — disposition of pstack-derived procedures.
- Optional, if available: `skill-evaluation` for live comparisons, `skill-creator` for approved edits.
