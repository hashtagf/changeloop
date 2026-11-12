#!/usr/bin/env python3
"""Look up the design-system study guides in assets/design-systems/ without opening whole files.

Usage:
  ds_lookup.py --list                      # slugs
  ds_lookup.py <slug>                      # outline: sections with sizes
  ds_lookup.py <slug> <section>            # print one section; e.g. design-reference | agent-prompt | sources
  ds_lookup.py <slug> <section> --sub tokens   # only the ### sub-section whose title contains 'tokens'
  ds_lookup.py --find "density" [--max 3]  # search all guides; slug, section, matching lines

Sections match by case-insensitive substring of the "## " title (spaces or dashes). Standard library only.
Exit 0 with output; 2 for an unknown slug or section, a --sub with no match, a bad --find pattern or a bad flag.
The guides are a secondary study (see assets/design-systems/index.md): confirm exact values at the linked source.
"""
import argparse, os, re, sys

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "design-systems")


def slugs():
    return sorted(f[:-3] for f in os.listdir(DIR) if f.endswith(".md") and f != "index.md")


def split(text, level):
    """[(title, body)] for headings of exactly `level` hashes; text before the first heading is ('', body)."""
    pat = re.compile(r"^%s (.+)$" % ("#" * level), re.M)
    out, last, title = [], 0, ""
    for m in pat.finditer(text):
        out.append((title, text[last:m.start()]))
        title, last = m.group(1).strip(), m.end()
    out.append((title, text[last:]))
    return [(t, b.strip("\n")) for t, b in out if t or b.strip()]


def norm(s):
    return re.sub(r"[\s_-]+", " ", re.sub(r"^\d+\.\s*", "", s.strip()).lower()).strip()


# guides with another layout (e.g. radix-themes: numbered sections) map the standard names to theirs
ALIASES = {
    "design reference": ["color palette", "typography", "component styling", "layout", "radius"],
    "agent prompt": ["agent prompt", "starter prompt"],
    "implementation starting point": ["implementation"],
}


def die(msg):
    sys.stderr.write("error: %s\n" % msg)
    sys.exit(2)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        die("%s (run with --help)" % message)


def load(slug):
    p = os.path.join(DIR, slug + ".md")
    if not re.fullmatch(r"[\w.-]+", slug) or not os.path.isfile(p):
        near = [s for s in slugs() if slug.lower() in s]
        die("unknown slug %r (%s)" % (slug, "did you mean: " + ", ".join(near) if near else "use --list"))
    return open(p, encoding="utf-8").read()


def main(a):
    ap = Parser(prog="ds_lookup.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?")
    ap.add_argument("section", nargs="?")
    ap.add_argument("--list", action="store_true", help="list the guide slugs")
    ap.add_argument("--find", metavar="PATTERN", help="regular expression to search all guides for (case-insensitive)")
    ap.add_argument("--max", type=int, default=3, help="matching lines per section with --find (default 3)")
    ap.add_argument("--sub", metavar="TITLE", help="only the ### sub-section whose title contains this")
    o = ap.parse_args(a)
    if o.list:
        print("\n".join(slugs())); return 0
    if o.find is not None:
        try:
            rx = re.compile(o.find, re.I)
        except re.error as e:
            die("--find %r is not a valid regular expression: %s (escape ( [ * + ? with a backslash, or search a plain word)" % (o.find, e))
        if o.max < 1:
            die("--max must be 1 or more")
        hits = 0
        for s in slugs():
            for title, body in split(load(s), 2):
                lines = [l.strip() for l in body.split("\n") if rx.search(l)]
                if lines:
                    hits += 1
                    print("%s :: %s" % (s, title or "(intro)"))
                    for l in lines[:o.max]:
                        print("   " + (l[:200] + "…" if len(l) > 200 else l))
        print("\n%d section hits" % hits); return 0
    if not o.slug:
        print(__doc__); return 0
    text = load(o.slug)
    secs = split(text, 2)
    if not o.section:
        if o.sub:
            die("--sub needs a section (ds_lookup.py %s <section> --sub %s)" % (o.slug, o.sub))
        for t, b in secs:
            print("%6d chars  %s" % (len(b), t or "(intro)"))
        return 0
    want = norm(o.section)
    m = [(t, b) for t, b in secs if want in norm(t)]
    if not m and want in ALIASES:
        m = [(t, b) for t, b in secs if any(k in norm(t) for k in ALIASES[want])]
    if not m:
        die("no section matching %r (run ds_lookup.py %s for the outline)" % (o.section, o.slug))
    if not o.sub:
        for t, b in m:
            print("## %s\n%s\n" % (t, b))
        return 0
    sub, printed, titles = norm(o.sub), 0, []
    for t, b in m:
        subs = split(b, 3)
        titles += [st for st, _ in subs if st]
        for st, sb in subs:
            if st and sub in norm(st):
                print("### %s\n%s\n" % (st, sb)); printed += 1
    if not printed:
        die("no ### sub-section matching %r in %r (sub-sections: %s)" % (o.sub, o.section, ", ".join(titles) or "none"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
