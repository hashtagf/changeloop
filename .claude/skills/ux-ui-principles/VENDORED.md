# Vendored copy

This skill is copied unchanged from `hashtagf/skills`, release 0.16.0
(commit `0a295d4e2b2c131f8dc4ee548353952990c3fb2a`, path
`skills/ux-ui-principles/`). Only the files tracked by Git at that commit were
copied. Update it by copying a newer release; do not edit it here.

Excluded: `evals/` (89 files, 568 KB). It holds the upstream skill's own
evaluation prompts and checks (`evals/index_check.py` in `README.md`). No
route in `SKILL.md`, `references/`, or `scripts/` needs it at runtime.

Whitespace only: extra blank lines at end of file were removed from
`assets/evidence.md`, `assets/layouts/{accounts,admin,commerce,content,marketing,mobile,opendesign,productivity}.md`,
and `references/app-screen-rules.md` so `git diff --check` passes. No other
byte differs from upstream.

Kept: `assets/` (13 MB). `SKILL.md`, the references, and the scripts
(`look.py`, `_library.py`, `ds_lookup.py`, preview builders) read it at
runtime.
