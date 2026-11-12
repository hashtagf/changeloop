#!/usr/bin/env python3
"""Find open-licensed photographs of the subject's world (references/visual-assets.md §2b).

Usage:
  python3 scripts/photo_search.py "dental treatment room" ["dentist child" ...] [--source commons|openverse|both]
          [--n 8] [--min-width 1000] [--download DIR] [--pick 1,3] [--name dental-room,dental-chair]

Searches Wikimedia Commons (and Openverse) and keeps only licences a commercial page may use: CC0, public domain,
CC BY and CC BY-SA. Non-commercial (NC), no-derivatives (ND) and unknown licences are dropped. Prints per hit:
number, title, licence, creator, size, file page and a 1280px picture URL.

Look at the candidates before choosing (download a few, open them): reject clutter, staged stock, people who
could be mistaken for the client's staff or patients, and anything that does not show the subject's world.
--download DIR saves the --pick'ed hits (default all) as DIR/<name>.jpg and merges their credits into
DIR/credits.json ({name: {title, artist, license, page}}), the format assets/photos/credits.json uses; the
credit is written right after each file is saved. A --pick outside the listed hits exits 2 before downloading;
a failed download is skipped and the run exits 1.
Credit every photo on the page (footer line) and list it in the hand-off as a stand-in to replace.

Exit 0 ok, 1 no usable hits or a download failed, 2 usage error, 3 not run (no network: every search failed to connect).
Network: curl (system certificates, scripts/_net.py) to the Commons API and api.openverse.org, anonymous, one
request per query. Standard library only.
"""
import argparse, hashlib, json, os, re, sys, unicodedata, urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _net  # noqa: E402

UA = "ux-ui-principles-skill/1.0 (photo search for design work)"
ALLOWED = re.compile(r"^(cc0|cc[- ]?zero|public domain|pd|pdm|cc[- ]by(-sa)?([- ][0-9.]+)?|by(-sa)?)$", re.I)


def get(url):
    """Body as bytes; raises _net.NetError (a RuntimeError; _net.NotRun when offline)."""
    return _net.get(url, ua=UA)


def clean(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


def ok_license(name):
    n = (name or "").strip()
    if re.search(r"\b(nc|nd)\b|non-?commercial|no ?deriv", n, re.I):
        return False
    return bool(ALLOWED.match(n)) or n.lower().startswith(("public domain", "cc by", "cc-by", "cc0"))


def commons(q, n, min_w):
    params = {"action": "query", "generator": "search", "gsrsearch": q + " filetype:bitmap", "gsrnamespace": 6,
              "gsrlimit": n * 3, "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 1280, "format": "json"}
    data = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
    out = []
    for p in sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
        lic = clean(m.get("LicenseShortName", {}).get("value"))
        if ii["width"] < min_w or not ok_license(lic):
            continue
        out.append({"source": "commons", "title": p["title"].replace("File:", ""), "license": lic,
                    "artist": clean(m.get("Artist", {}).get("value")) or "unknown", "w": ii["width"], "h": ii["height"],
                    "page": ii["descriptionurl"], "img": ii.get("thumburl") or ii["url"]})
    return out[:n]


def openverse(q, n, min_w):
    params = {"q": q, "license": "cc0,pdm,by,by-sa", "page_size": n * 2, "mature": "false"}
    data = json.loads(get("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(params)))
    out = []
    for r in data.get("results", []):
        lic = (r.get("license") or "").lower()
        name = {"cc0": "CC0", "pdm": "Public domain"}.get(lic, "CC " + lic.upper() + (" " + r["license_version"] if r.get("license_version") else ""))
        if (r.get("width") or min_w) < min_w or not ok_license(name):
            continue
        out.append({"source": "openverse/" + (r.get("provider") or "?"), "title": r.get("title") or r["id"], "license": name,
                    "artist": r.get("creator") or "unknown", "w": r.get("width"), "h": r.get("height"),
                    "page": r.get("foreign_landing_url") or r.get("url"), "img": r.get("url")})
    return out[:n]


def default_name(h, used, out, credits):
    """File name from the title: Unicode letters and digits kept (Thai stays Thai), a trailing file extension dropped,
    a short hash of the picture URL when nothing is left; -2, -3 ... when the name is taken in this run or by
    another photo already in the folder."""
    t = re.sub(r"\.(jpe?g|png|gif|webp|tiff?|svg)$", "", h["title"].strip(), flags=re.I).lower()
    base = "".join(c if unicodedata.category(c)[0] in "LMN" else "-" for c in t)
    base = re.sub(r"-+", "-", base)[:40].strip("-") or "photo-" + hashlib.sha1(h["img"].encode()).hexdigest()[:8]
    def taken(n):  # the same photo (same page) may be saved again under its own name
        c = credits.get(n)
        if n in used:
            return True
        if c is not None:
            return not (isinstance(c, dict) and c.get("page") == h["page"])
        return any(os.path.exists(os.path.join(out, n + e)) for e in (".jpg", ".png"))
    name, i = base, 1
    while taken(name):
        i += 1
        name = "%s-%d" % (base, i)
    return name


class Parser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write("error: %s (run with --help)\n" % message)
        sys.exit(2)


def main(argv=None):
    ap = Parser(prog="photo_search.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("queries", nargs="*")
    ap.add_argument("--source", choices=("commons", "openverse", "both"), default="commons")
    ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--min-width", type=int, default=1000)
    ap.add_argument("--download", metavar="DIR")
    ap.add_argument("--pick")
    ap.add_argument("--name")
    a = ap.parse_intermixed_args(sys.argv[1:] if argv is None else argv)
    qs = [q for q in a.queries if q.strip()]
    if not qs:
        ap.error("give at least one search query")
    if not 1 <= a.n <= 50:
        ap.error("--n must be 1-50")
    if a.min_width < 0:
        ap.error("--min-width must be 0 or more")
    src, n, min_w = a.source, a.n, a.min_width
    hits, offline, tried = [], 0, 0
    for q in qs:
        for fn in ([commons] if src == "commons" else [openverse] if src == "openverse" else [commons, openverse]):
            tried += 1
            try:
                hits += fn(q, n, min_w)
            except _net.NotRun as e:
                offline += 1
                print(f"[{fn.__name__}] '{q}' not run: {e}")
            except Exception as e:  # network or API change: say so, keep the other source
                print(f"[{fn.__name__}] '{q}' failed: {e}")
    if not hits and offline == tried:
        print("NOT RUN: no network (curl could not reach the search APIs)"); return _net.EXIT_NOT_RUN
    if not hits:
        print("No usable hits. Search the subject's world (the room, the tool, the material), not the category."); return 1
    for i, h in enumerate(hits, 1):
        print(f"{i:>2}. {h['title'][:90]}\n    {h['license']} · {h['artist'][:60]} · {h['w']}x{h['h']} · {h['source']}\n    page: {h['page']}\n    img:  {h['img']}")
    out = a.download
    if not out:
        print("\nNext: --download DIR --pick 2,5 --name a,b, then open each picture before using it."); return 0
    raw = a.pick or ",".join(str(i) for i in range(1, len(hits) + 1))
    try:
        picks = [int(x) for x in raw.split(",") if x.strip()]
    except ValueError:
        picks = []
    bad = [k for k in picks if not 1 <= k <= len(hits)]
    if not picks or bad:
        print(f"--pick {raw}: choose hit numbers from 1 to {len(hits)}, comma-separated (nothing downloaded)", file=sys.stderr)
        return 2
    names = a.name.split(",") if a.name else []
    bad_names = [x for x in names if x and not re.fullmatch(r"[\w.-]+", x)]
    if bad_names:
        print(f"--name {bad_names[0]!r}: use letters, digits, - _ . only (no folders)", file=sys.stderr); return 2
    try:
        os.makedirs(out, exist_ok=True)
    except OSError as e:
        print(f"error: cannot create --download {out} ({e})", file=sys.stderr); return 2
    cpath = os.path.join(out, "credits.json")
    try:
        credits = json.load(open(cpath, encoding="utf-8")) if os.path.exists(cpath) else {}
    except ValueError:
        print(f"error: {cpath} is not valid JSON (fix or move it; nothing downloaded)", file=sys.stderr); return 2
    except OSError as e:
        print(f"error: cannot read {cpath} ({e}; nothing downloaded)", file=sys.stderr); return 2
    if not isinstance(credits, dict):
        print(f"error: {cpath} is not a JSON object of credits (fix or move it; nothing downloaded)", file=sys.stderr); return 2
    used = set()
    failed = 0
    for j, k in enumerate(picks):
        h = hits[k - 1]
        name = names[j] if j < len(names) and names[j] else default_name(h, used, out, credits)
        used.add(name)
        try:
            body = get(h["img"])
        except RuntimeError as e:
            print(f"skip {name}: download failed ({e})"); failed += 1; continue
        if not body[:3] == b"\xff\xd8\xff" and not body[:8] == b"\x89PNG\r\n\x1a\n":
            print(f"skip {name}: not an image (the server returned something else)"); failed += 1; continue
        ext = ".png" if body[:4] == b"\x89PNG" else ".jpg"
        _net.write_atomic(os.path.join(out, name + ext), body)
        credits[name] = {"title": h["title"], "artist": h["artist"], "license": h["license"], "page": h["page"]}
        # credit each file as soon as it is saved, so an interrupted run never leaves an uncredited photo
        _net.write_atomic(cpath, json.dumps(credits, ensure_ascii=False, indent=1))
        print(f"saved {os.path.join(out, name + ext)}  ({h['license']}, {h['artist'][:40]})")
    print(f"credits → {cpath}. Footer line: 'ภาพ: <artist> (<licence>)' linked to each page.")
    if failed:
        print(f"{failed} of {len(picks)} picks not saved (see above)"); return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
