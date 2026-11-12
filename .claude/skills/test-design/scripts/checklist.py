#!/usr/bin/env python3
"""Generate (or verify) the per-scenario test checklists from the acceptance criteria.

The checklist is the criteria 1:1, so writing it by hand means typing everything twice —
roughly a fifth of a module file's volume. Write the criteria once, then let this produce the
checklist blocks.

  python3 checklist.py 01-checkout.md              # print the blocks
  python3 checklist.py 01-checkout.md --write      # insert/refresh them inside the file
  python3 checklist.py *.md --check                # verify every scenario is 1:1 (exit 1 if not)

--check is the useful one at review time: it catches criteria added to a spec but never
mirrored into the checklist QA actually ticks, which is how a criterion silently stops being
tested.
"""

import argparse
import re
import sys
from pathlib import Path

SPEC_ID = re.compile(r"^##\s+(SC-[A-Z]+-\d+)\s*·\s*(.+?)\s*$", re.M)
CRIT_HEADS = ("acceptance criteria", "เกณฑ์การยอมรับ")
CHECK_BLOCK = re.compile(
    r"^### Test Scenario\s*:.*?\n(?:.*?\n)?```+markdown\n(.*?)^```+\s*$",
    re.M | re.S,
)


FENCE = re.compile(r"^\s*`{3,}", re.M)


def outer_marks(text):
    """Scenario headings that are NOT inside a fenced block.

    Module files carry the heading twice — once as the document section and once inside the
    ````markdown spec block meant for pasting into a task. Only the outer one is a real
    section boundary; treating both as boundaries duplicates every checklist.
    """
    fences = [f.start() for f in FENCE.finditer(text)]
    marks = []
    for m in SPEC_ID.finditer(text):
        depth = sum(1 for f in fences if f < m.start())
        if depth % 2 == 0:
            marks.append(m)
    return marks


def parse_scenarios(text):
    """Return [(id, name, [criteria]), ...] taken from the spec blocks."""
    out = []
    marks = list(SPEC_ID.finditer(text))
    for i, m in enumerate(marks):
        sid, name = m.group(1), m.group(2)
        body = text[m.end(): marks[i + 1].start() if i + 1 < len(marks) else len(text)]
        crit = []
        for sec in re.finditer(r"^##\s+(.+?)\s*$", body, re.M):
            if sec.group(1).strip().lower() in CRIT_HEADS:
                rest = body[sec.end():]
                nxt = re.search(r"^##\s+", rest, re.M)
                chunk = rest[: nxt.start()] if nxt else rest
                # accept *, -, + bullets — hand-written specs use whichever the author prefers
                crit = [re.sub(r"\s+", " ", c).strip()
                        for c in re.findall(r"^[*\-+]\s+(?!\[[ xX]\])(.+?)\s*$", chunk, re.M)]
                break
        if crit:
            # the same scenario appears twice (section heading + inside the fenced spec);
            # keep the occurrence that actually carries criteria, and don't duplicate ids
            if out and out[-1][0] == sid:
                out[-1] = (sid, name, crit)
            else:
                out.append((sid, name, crit))
    return out


def render(sid, name, crit, note):
    items = "\n".join(f"- [ ] {c}" for c in crit)
    return (f"### Test Scenario : {name}\n\n> {note} · {sid}\n\n"
            f"````markdown\n{items}\n````\n")


def insert_blocks(text, scen, note):
    """Place each checklist under its own scenario rather than appending at the end of the file,
    so the template's spec/checklist interleaving survives and nothing the author wrote moves."""
    by_id = {sid: (name, crit) for sid, name, crit in scen}
    marks = outer_marks(text) or list(SPEC_ID.finditer(text))
    if not marks:
        return text
    out = [text[: marks[0].start()]]
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        chunk = text[m.start(): end]
        sid = m.group(1)
        if sid in by_id:
            # ตัด block เดิมของ scenario นี้ทิ้งก่อนวางใหม่ (idempotent เมื่อรันซ้ำ)
            chunk = re.sub(r"\n*^### Test Scenario\s*:.*?(?=^## |\Z)", "\n", chunk,
                           flags=re.M | re.S)
            name, crit = by_id[sid]
            chunk = chunk.rstrip() + "\n\n" + render(sid, name, crit, note)
        out.append(chunk)
    return "".join(out)


def existing_blocks(text):
    return [re.findall(r"^- \[[ xX]\]\s*(.+?)\s*$", b.group(1), re.M) for b in CHECK_BLOCK.finditer(text)]


def norm(s):
    """Compare meaning, not markup — emphasis and code ticks routinely get dropped when a
    criterion is copied into a checkbox, and that isn't a coverage problem."""
    s = re.sub(r"[*_`]+", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip().rstrip(".").lower()


def check_file(path):
    text = path.read_text(encoding="utf-8")
    scen = parse_scenarios(text)
    blocks = existing_blocks(text)
    problems = []
    if len(scen) != len(blocks):
        problems.append(f"{len(scen)} scenario(s) with criteria but {len(blocks)} checklist block(s)")
    for (sid, _n, crit), got in zip(scen, blocks):
        if len(crit) != len(got):
            problems.append(f"{sid}: {len(crit)} criteria vs {len(got)} checklist items")
        else:
            for a, b in zip(crit, got):
                if norm(a) != norm(b):
                    problems.append(f"{sid}: text differs → criterion: {a[:60]!r} / checklist: {b[:60]!r}")
                    break
    return scen, problems


def main():
    p = argparse.ArgumentParser(description="Generate or verify test checklists from criteria")
    p.add_argument("files", nargs="+", type=Path)
    p.add_argument("--write", action="store_true", help="insert/refresh the blocks inside the file")
    p.add_argument("--check", action="store_true", help="verify 1:1 only; exit 1 on mismatch")
    p.add_argument("--note", default="copied 1:1 from the scenario's Acceptance Criteria")
    args = p.parse_args()

    failed = False
    for path in args.files:
        if not path.exists():
            print(f"{path}: not found", file=sys.stderr)
            failed = True
            continue
        text = path.read_text(encoding="utf-8")
        scen, problems = check_file(path)

        if args.check:
            if problems:
                failed = True
                print(f"✗ {path.name}")
                for x in problems:
                    print(f"    {x}")
            else:
                print(f"✓ {path.name} — {len(scen)} scenario(s), checklists match 1:1")
            continue

        if not scen:
            print(f"{path.name}: no scenario with acceptance criteria found", file=sys.stderr)
            failed = True
            continue

        blocks = [render(sid, name, crit, args.note) for sid, name, crit in scen]
        if args.write:
            path.write_text(insert_blocks(text, scen, args.note), encoding="utf-8")
            print(f"{path.name}: wrote {len(blocks)} checklist block(s) "
                  f"({sum(len(c) for _, _, c in scen)} items)")
        else:
            print(f"<!-- {path.name} -->")
            print("\n---\n\n".join(blocks))

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
