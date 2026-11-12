#!/usr/bin/env python3
"""Find and paste icons from Lucide (UI glyphs) and Simple Icons (brand marks) — references/iconography.md "Icon libraries".

Usage:
  python3 scripts/icons.py search booking calendar          # Lucide names + Simple Icons brands matching the words
  python3 scripts/icons.py lucide calendar-check phone [--size 20] [--stroke 2] [--sprite icons.svg]
  python3 scripts/icons.py brand line whatsapp [--ground "#faf7ef"] [--mono] [--size 20]   # --ground: #rgb or #rrggbb
  options: [--lucide-version 1.58.0] [--simple-version 16.35.0]

lucide  prints each icon as inline SVG ready to paste: currentColor, aria-hidden, class="icon", your size and
        stroke (one stroke width per page). Unknown names get the closest matches. --sprite writes a <symbol> sprite
        to use as <svg class="icon"><use href="icons.svg#calendar-check"/></svg>.
brand   prints the brand's single-path SVG with its hex colour (or currentColor with --mono), checks the colour
        against --ground (3:1, WCAG 1.4.11) and falls back to mono when it fails, and prints the brand's
        guidelines, licence and source links. A brand that is not in Simple Icons (PromptPay, KBank, SCB, Lazada,
        Agoda, Wongnai, LINE MAN …) must come from the brand's own media kit: never redraw a logo.

Versions are pinned (at least two weeks old) so pages stay reproducible; data is cached in the temp folder
(written only after a successful fetch; an empty or broken cache file is fetched again).
Exit 0 ok, 1 a name was not found, 2 usage error (bad flag value), 3 not run (network or CDN fetch failed).
Network: curl to cdn.jsdelivr.net (scripts/_net.py). Standard library only.
"""
import argparse, json, os, re, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _net  # noqa: E402
from _color import ratio  # noqa: E402

LUCIDE_V = "1.58.0"       # lucide-static, ISC, published 2026-10-16
SIMPLE_V = "16.35.0"      # simple-icons, CC0 project (each brand keeps its trademark), published 2026-10-11
CDN = "https://cdn.jsdelivr.net/npm"
CACHE = os.path.join(tempfile.gettempdir(), "ux-ui-icons-cache")


A = argparse.Namespace(size="20", stroke="2", sprite=None, ground=None, mono=False)


def get(url):
    return _net.get_text(url)


def cached(url, name):
    """Return the file at url, cached under CACHE (scripts/_net.py: atomic write after a good fetch; an empty
    or unreadable cached file is fetched again)."""
    return _net.cached(url, name, CACHE)


def lucide_tags(v):
    return json.loads(cached(f"{CDN}/lucide-static@{v}/tags.json", f"lucide-{v}-tags.json"))


def simple_data(v):
    d = json.loads(cached(f"{CDN}/simple-icons@{v}/data/simple-icons.json", f"simple-{v}.json"))
    return d if isinstance(d, list) else d["icons"]


def search(qs, lv, sv):
    tags, data = lucide_tags(lv), simple_data(sv)
    q = [w.lower() for w in qs]
    scored = []
    for name, t in tags.items():
        s = sum(3 if w in name.split("-") else 2 if w in name else 1 if any(w in x for x in t) else 0 for w in q)
        if s:
            scored.append((-s, name, t))
    print(f"Lucide {lv} (ISC): {len(scored)} match")
    for s, name, t in sorted(scored)[:12]:
        print(f"  {name:28} {', '.join(t[:6])}")
    def names(i):
        out = [i["title"].lower(), i["slug"]]
        for v in i.get("aliases", {}).values():  # aka: [str], dup/loc: objects with titles
            for x in (v if isinstance(v, list) else [v]):
                out += [x.lower()] if isinstance(x, str) else [str(t).lower() for t in (x.values() if isinstance(x, dict) else [])]
        return out
    def bscore(i):
        best = 0
        for n in names(i):
            for w in q:
                best = max(best, 3 if n == w else 2 if re.search(r"(^|\W)" + re.escape(w) + r"(\W|$)", n) else 0)
        return best
    hits = sorted((i for i in data if bscore(i)), key=lambda i: (-bscore(i), i["title"]))
    print(f"Simple Icons {sv} (brands): {len(hits)} match")
    for i in hits[:12]:
        print(f"  {i['slug']:28} {i['title']}  #{i['hex']}")
    if not scored:
        print("No Lucide glyph: draw one to Lucide's rules (iconography.md) and keep it in the project's icon file.")
    return 0


def lucide(names, lv):
    size, stroke, sprite = A.size, A.stroke, A.sprite
    tags = lucide_tags(lv)
    symbols, bad = [], 0
    for n in names:
        n = n.strip()  # names are lower-case kebab: "Calendar" -> calendar, "CalendarCheck" -> calendar-check
        n = n.lower() if n.lower() in tags else re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", n).replace("_", "-").lower()
        if n not in tags:
            near = [k for k in tags if n in k or any(n in t for t in tags[k])][:8]
            print(f"<!-- '{n}' is not in Lucide {lv}. Closest: {', '.join(near) or 'none'}. "
                  f"No glyph fits: draw one to Lucide's rules (iconography.md) or drop the icon. -->")
            bad += 1
            continue
        svg = cached(f"{CDN}/lucide-static@{lv}/icons/{n}.svg", f"lucide-{lv}-{n}.svg")
        m = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S)
        if not m:
            print(f"<!-- '{n}': unexpected file, skipped -->"); bad += 1; continue
        inner = m.group(1).strip()
        inner = re.sub(r"\s*\n\s*", "", inner)
        symbols.append((n, inner))
        if not sprite:
            print(f'<svg class="icon" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
                  f'stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '
                  f'data-lucide="{n}">{inner}</svg>')
    if sprite and symbols:
        body = "".join(f'<symbol id="{n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{stroke}" '
                       f'stroke-linecap="round" stroke-linejoin="round">{inner}</symbol>' for n, inner in symbols)
        try:
            _net.write_atomic(sprite, f'<!-- Lucide {lv} (ISC License, lucide.dev) --><svg xmlns="http://www.w3.org/2000/svg" style="display:none">{body}</svg>\n')
        except OSError as e:
            print(f"error: cannot write --sprite {sprite} ({e})", file=sys.stderr); return 2
        print(f"wrote {sprite} ({len(symbols)} symbols). Use: <svg class=\"icon\" aria-hidden=\"true\"><use href=\"{os.path.basename(sprite)}#{symbols[0][0]}\"/></svg>")
    print(f"<!-- Lucide {lv}, ISC License (keep the notice with the source: lucide.dev/license). "
          f"Size {size}px, stroke {stroke}: use one stroke width per page. -->")
    return 1 if bad else 0


def brand(slugs, sv):
    size, ground, mono = A.size, A.ground, A.mono
    data = {i["slug"]: i for i in simple_data(sv)}
    titles = {i["title"].lower(): i for i in data.values()}
    bad = 0
    for s in slugs:
        i = data.get(s.lower()) or titles.get(s.lower())
        if not i:
            near = [k for k in data if s.lower() in k][:6]
            print(f"<!-- '{s}' is not in Simple Icons {sv}{' (closest: ' + ', '.join(near) + ')' if near else ''}. "
                  f"Get the official mark from the brand's media kit or press page; never redraw or approximate a logo. -->")
            bad += 1
            continue
        svg = cached(f"{CDN}/simple-icons@{sv}/icons/{i['slug']}.svg", f"simple-{sv}-{i['slug']}.svg")
        m = re.search(r'<path d="([^"]+)"', svg)
        if not m:
            print(f"<!-- '{s}': unexpected file, skipped -->"); bad += 1; continue
        path = m.group(1)
        fill, note = "#" + i["hex"], ""
        if ground and not mono:
            r = ratio(fill, ground)
            if r < 3:
                note = f"brand colour #{i['hex']} is {r:.2f}:1 on {ground} (< 3:1): using currentColor; put the colour on a contrasting chip or keep it mono"
                fill = "currentColor"
            else:
                note = f"brand colour #{i['hex']} is {r:.2f}:1 on {ground} (passes 3:1)"
        if mono:
            fill = "currentColor"
        print(f'<svg class="brand-mark" width="{size}" height="{size}" viewBox="0 0 24 24" fill="{fill}" aria-hidden="true" '
              f'data-brand="{i["slug"]}"><path d="{path}"/></svg>')
        print(f"<!-- {i['title']}: trademark of its owner; use it only to name or link to that brand (contact, pay with, "
              f"integrations), unaltered. {note}")
        print(f"     guidelines: {i.get('guidelines') or 'none listed (check the source and the brand site)'}")
        print(f"     licence: {(i.get('license') or {}).get('type') or (i.get('license') or {}).get('url') or 'not listed (not proof of any licence)'}; source: {i['source']} -->")
    print("<!-- Simple Icons " + sv + " (CC0 project; brands keep their trademarks, see simpleicons.org DISCLAIMER). "
          "Give the link or button its own accessible name, e.g. aria-label=\"แชทกับเราทาง LINE\". -->")
    return 1 if bad else 0


HEX = re.compile(r"#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})")


class Parser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write("error: %s (run with --help)\n" % message)
        sys.exit(2)


def usage(msg):
    print("error: " + msg, file=sys.stderr)
    return 2


def main(argv=None):
    global A
    ap = Parser(prog="icons.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=("search", "lucide", "brand"))
    ap.add_argument("words", nargs="*")
    ap.add_argument("--size", default="20")
    ap.add_argument("--stroke", default="2")
    ap.add_argument("--sprite")
    ap.add_argument("--ground")
    ap.add_argument("--mono", action="store_true")
    ap.add_argument("--lucide-version", default=LUCIDE_V)
    ap.add_argument("--simple-version", default=SIMPLE_V)
    argv = sys.argv[1:] if argv is None else argv
    if not argv:
        return usage("give a command: search, lucide or brand (run with --help)")
    if argv[0] in ("-h", "--help"):
        print(__doc__); return 0
    A = ap.parse_intermixed_args(argv)
    if A.ground is not None and not HEX.fullmatch(A.ground):
        return usage(f"--ground takes a hex colour, #rgb or #rrggbb (got {A.ground!r})")
    if A.ground is not None and not A.ground.startswith("#"):
        A.ground = "#" + A.ground
    if not re.fullmatch(r"\d+(\.\d+)?", A.size) or not 8 <= float(A.size) <= 512:
        return usage(f"--size takes a number of px, 8-512 (got {A.size!r})")
    if not re.fullmatch(r"\d+(\.\d+)?", A.stroke) or not 0.5 <= float(A.stroke) <= 4:
        return usage(f"--stroke takes a number, 0.5-4 (got {A.stroke!r}; Lucide's default is 2)")
    for flag, v in (("--lucide-version", A.lucide_version), ("--simple-version", A.simple_version)):
        if not re.fullmatch(r"[0-9][\w.+-]*", v):
            return usage(f"{flag} takes a version like 1.58.0 (got {v!r})")
    if not A.words:
        return usage(f"{A.cmd} needs at least one name or word, e.g. icons.py {A.cmd} {'calendar' if A.cmd != 'brand' else 'line'}")
    lv, sv, w = A.lucide_version, A.simple_version, A.words
    try:
        return {"search": lambda: search(w, lv, sv), "lucide": lambda: lucide(w, lv), "brand": lambda: brand(w, sv)}[A.cmd]()
    except _net.NetError as e:
        print(f"NOT RUN: {e}"); return _net.EXIT_NOT_RUN


if __name__ == "__main__":
    sys.exit(main())
