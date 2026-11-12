#!/usr/bin/env python3
"""List every placeholder still on a page, so the owner knows exactly what to supply.

Usage:
  python3 placeholders.py <page.html> [--md README.md] [--json]

Finds text inside elements with class "ph" (or data-placeholder) and any [ ... ] or {{ ... }}
token in visible text, plus attribute placeholders: [ ... ] / {{ ... }} tokens in the content of
<meta> og:* / twitter:* / description, and in title, alt, aria-label and placeholder attributes
(reported separately, with the attribute they sit in). <script> and <style> are ignored. Prints a
table with counts (columns aligned by display width, so Thai combining marks do not skew them).
--json prints a list of {"placeholder", "count", "kind": "text"|"attribute", "where": [...]}.
With --md, writes or replaces a "## Placeholders" section in the given Markdown file (only there:
nothing is written by default).

Proof must never be a placeholder (marketing-copy.md "Never invent proof"): a placeholder that
looks like reviews, ratings, customer counts or awards is reported on stderr as a warning; leave
that proof out of the page instead. Exit 0 (placeholders are listed, not failed), 2 on usage or
input error (missing page, --md without a path). Standard library only.
"""
import argparse
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from html.parser import HTMLParser

TOKEN = re.compile(r"\[[^\[\]\n]{1,80}\]|\{\{[^{}\n]{1,80}\}\}")
ATTRS = ("title", "alt", "aria-label", "placeholder")
PROOF = re.compile(r"review|รีวิว|rating|คะแนน|ลูกค้า\s*\d|\d+\s*customers|customers|award|รางวัล|testimonial|ดาว|stars?\b", re.I)


class Scan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, is_ph)
        self.skip = 0
        self.ph = Counter()
        self.loose = Counter()
        self.attr = Counter()
        self.attr_where = defaultdict(set)
        self._buf = None

    def _attr_tokens(self, where, value):
        for m in TOKEN.findall(value or ""):
            k = " ".join(m.split())
            self.attr[k] += 1
            self.attr_where[k].add(where)

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "template"):
            self.skip += 1
            return
        a = {k: (v or "") for k, v in attrs}
        if not self.skip:
            if tag == "meta":
                key = (a.get("property") or a.get("name") or "").lower()
                if key.startswith(("og:", "twitter:")) or key == "description":
                    self._attr_tokens(f"meta {key}", a.get("content"))
            for at in ATTRS:
                if at in a:
                    self._attr_tokens(at, a[at])
        is_ph = "ph" in a.get("class", "").split() or "data-placeholder" in a
        if tag in ("br", "img", "input", "meta", "link", "hr", "source", "wbr"):
            return
        self.stack.append((tag, is_ph))
        if is_ph and self._buf is None:
            self._buf = [len(self.stack), []]

    def handle_endtag(self, tag):
        if tag in ("script", "style", "template"):
            self.skip = max(0, self.skip - 1)
            return
        while self.stack:
            t, _ = self.stack.pop()
            if self._buf and len(self.stack) < self._buf[0]:
                text = " ".join("".join(self._buf[1]).split())
                if text:
                    self.ph[text] += 1
                self._buf = None
            if t == tag:
                break

    def handle_data(self, data):
        if self.skip:
            return
        if self._buf is not None:
            self._buf[1].append(data)
        else:
            for m in TOKEN.findall(data):
                self.loose[" ".join(m.split())] += 1


def scan(path):
    """(text Counter, attribute Counter, {attribute token: set of where})."""
    s = Scan()
    with open(path, encoding="utf-8", errors="replace") as f:
        s.feed(f.read())
    total = Counter(s.ph)
    total.update(s.loose)
    return total, s.attr, s.attr_where


def dwidth(t):
    """Terminal display width: combining marks (Thai vowels and tone marks, category Mn/Me) and format
    characters take no column, East Asian wide/fullwidth characters take two."""
    w = 0
    for ch in t:
        if unicodedata.combining(ch) or unicodedata.category(ch) in ("Mn", "Me", "Cf"):
            continue
        w += 2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1
    return w


def dljust(t, width):
    return t + " " * max(0, width - dwidth(t))


def md_section(items, attr_items=(), where=None):
    lines = ["## Placeholders", "", "Replace each one with the real fact, then remove its `ph` wrapper.", "",
             "| Placeholder | Times |", "|---|---|"]
    lines += ["| `%s` | %d |" % (k.replace("|", "\\|"), v) for k, v in items]
    if attr_items:
        lines += ["", "Attribute placeholders (metadata, alt text, labels):", "", "| Placeholder | Where | Times |", "|---|---|---|"]
        lines += ["| `%s` | %s | %d |" % (k.replace("|", "\\|"), ", ".join(sorted(where[k])), v) for k, v in attr_items]
    return "\n".join(lines) + "\n"


def read_md(path):
    """Current text of the --md file ("" when it does not exist yet); raises OSError / UnicodeDecodeError."""
    if os.path.isdir(path):
        raise IsADirectoryError(21, "is a directory", path)
    if not os.path.isdir(os.path.dirname(os.path.abspath(path))):
        raise FileNotFoundError(2, "folder not found", path)
    if not os.path.isfile(path):
        return ""
    with open(path, encoding="utf-8") as f:
        return f.read()


def write_md(path, section):
    old = read_md(path)
    pat = re.compile(r"^## Placeholders\b.*?(?=^## |\Z)", re.S | re.M)
    new = pat.sub(lambda m: section + "\n", old, count=1) if pat.search(old) else (old.rstrip() + "\n\n" + section if old else section)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)


def main(argv):
    ap = argparse.ArgumentParser(prog="placeholders.py", description="List placeholders left on a page (see the module docstring).")
    ap.add_argument("pages", nargs="+", metavar="PAGE", help="built .html page(s)")
    ap.add_argument("--md", metavar="README.md", help="write or replace a '## Placeholders' section in this Markdown file")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    a = ap.parse_args(argv)
    gone = [p for p in a.pages if not os.path.isfile(p)]
    if gone:
        print(f"error: file not found: {gone[0]} (pass the path to a built .html file)", file=sys.stderr)
        return 2
    if a.md:
        try:
            read_md(a.md)
        except OSError as e:
            print(f"error: cannot write --md {a.md}: {e.strerror} (pass a Markdown file in an existing folder)", file=sys.stderr)
            return 2
        except UnicodeDecodeError:
            print(f"error: cannot update --md {a.md}: not UTF-8 text (pass a UTF-8 Markdown file)", file=sys.stderr)
            return 2
    total, attr, where = Counter(), Counter(), defaultdict(set)
    for p in a.pages:
        t, at, w = scan(p)
        total.update(t)
        attr.update(at)
        for k, v in w.items():
            where[k] |= v
    items = sorted(total.items(), key=lambda kv: (-kv[1], kv[0]))
    attr_items = sorted(attr.items(), key=lambda kv: (-kv[1], kv[0]))
    for k in sorted(set(total) | set(attr)):
        if PROOF.search(k):
            print("warning: placeholder looks like proof (%s); leave proof off the page until it is real" % k, file=sys.stderr)
    if a.json:
        rows = [{"placeholder": k, "count": v, "kind": "text", "where": ["text"]} for k, v in items]
        rows += [{"placeholder": k, "count": v, "kind": "attribute", "where": sorted(where[k])} for k, v in attr_items]
        print(json.dumps(rows, ensure_ascii=False, indent=2))
    else:
        print("%d distinct placeholder(s), %d in total" % (len(items), sum(total.values())))
        w = max([dwidth(k) for k, _ in items + attr_items] + [11])
        for k, v in items:
            print("  %s  %d" % (dljust(k, w), v))
        if attr_items:
            print("%d attribute placeholder(s), %d in total" % (len(attr_items), sum(attr.values())))
            for k, v in attr_items:
                print("  %s  %d  (%s)" % (dljust(k, w), v, ", ".join(sorted(where[k]))))
    if a.md:
        try:
            write_md(a.md, md_section(items, attr_items, where))
        except (OSError, UnicodeDecodeError) as e:
            print(f"error: cannot write --md {a.md}: {getattr(e, 'strerror', None) or e}", file=sys.stderr)
            return 2
        print("wrote section to", a.md, file=sys.stderr if a.json else sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
