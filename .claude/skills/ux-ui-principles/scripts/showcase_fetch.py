#!/usr/bin/env python3
"""Fetch the Open Design showcase (https://open-design.ai/showcase/) as a local study set.

Usage:
  python3 scripts/showcase_fetch.py [--out assets/showcase] [--limit 100] [--delay 1.0]

For every item on the showcase index: title, type, attribution and licence lines, the "how to create" brief
(the page's own design notes), and its pictures (first view + full page), resized. Writes
<out>/items.json and <out>/img/<slug>.jpg + <slug>-full.jpg.

Pictures are a STUDY SET, not assets: each item's licence covers the plugin, "not every depicted asset", so the
pictures stay local (git-ignored) and are never copied into client work. Re-run to refresh.
Pictures are found from the item page's own <img src/srcset> (and og:image), so a change of image host does
not break the run. Exit 0 ok, 1 no picture fetched (or the index failed), 2 usage error, 3 not run (Pillow
missing or no network). The default --out is the skill's git-ignored study folder (assets/showcase).
Network: curl --fail (system certificates, scripts/_net.py). Pillow resizes the pictures. Be polite: one request
per --delay seconds.
"""
import argparse, html, io, json, os, re, sys, time, urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _net  # noqa: E402

BASE = "https://open-design.ai"
UA = "Mozilla/5.0 (design study; ux-ui-principles skill)"


FetchError = _net.NetError  # kept for callers and tests: _net.NotRun (offline) is a FetchError too


def get_bytes(url):
    return _net.get(url, ua=UA)


def get(url):
    return get_bytes(url).decode("utf-8", "replace")


SKIP = re.compile(r"^(Tip:|Gallery|Download and Install|Export and Get|Related|More |Designed For|Highlights)", re.I)


def sections(page):
    """[{h, text}] for every h2/h3 between the title and the related-items list."""
    parts = re.split(r"(<h[23][^>]*>.*?</h[23]>)", page, flags=re.S)
    out, head = [], None
    for part in parts:
        m = re.match(r"<h([23])[^>]*>(.*?)</h[23]>", part, re.S)
        if m:
            head = text_of(m.group(2))
            if re.match(r"^(Related|More )", head):
                break
            continue
        if head and not SKIP.match(head):
            body = text_of(part)
            if body:
                out.append({"h": head, "text": body[:1500]})
    return out


def text_of(fragment):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", fragment, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t).strip()


def _attr(tag, name):
    m = re.search(r'\s' + name + r'\s*=\s*"([^"]*)"', tag)
    return html.unescape(m.group(1)) if m else None


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def item_images(page, base_url, view_w=1440, full_w=960):
    """(view_url, full_url) of an item page: its first-view picture and its full-page capture.

    Reads every <img src/srcset> between the item's <h1> and the related-items list ("More ..."/"Related"),
    with each picture's declared size (width/height or style aspect-ratio). The full page is the tallest
    picture (height >= 2x width); the view is the first wide picture that is not it. Falls back to og:image
    for the view. From a srcset it takes the smallest candidate at least as wide as needed (polite), else src.
    """
    start = (re.search(r"<h1[\s>]", page) or re.search(r"<body", page) or re.match("", page)).start()
    end_m = re.search(r"<h[23][^>]*>\s*(?:<[^>]+>\s*)*(?:Related|More )", page[start:])
    main = page[start:start + end_m.start()] if end_m else page[start:]
    cands = []
    for m in re.finditer(r"<img\b[^>]*>", main, re.S):
        tag = m.group(0)
        src = _attr(tag, "src")
        srcset = _attr(tag, "srcset") or ""
        if not src and not srcset:
            continue
        w, h = _num(_attr(tag, "width")), _num(_attr(tag, "height"))
        ar = re.search(r"aspect-ratio\s*:\s*([\d.]+)\s*/\s*([\d.]+)", _attr(tag, "style") or "")
        if ar and not (w and h):
            w, h = float(ar.group(1)), float(ar.group(2))
        if w and w < 200:  # icons, avatars
            continue
        sizes = []
        for part in srcset.split(","):
            bits = part.strip().split()
            if bits and len(bits) > 1 and bits[1].endswith("w"):
                sizes.append((_num(bits[1][:-1]) or 0, bits[0]))
        cands.append({"src": src, "srcset": sorted(sizes), "w": w, "h": h})

    def pick(c, need):
        ok = [u for sw, u in c["srcset"] if sw >= need]
        u = ok[0] if ok else (c["src"] or (c["srcset"][-1][1] if c["srcset"] else None))
        return urllib.parse.urljoin(base_url, u) if u else None

    tall = [c for c in cands if c["w"] and c["h"] and c["h"] >= 2 * c["w"]]
    full = max(tall, key=lambda c: c["h"] / c["w"]) if tall else None
    view = next((c for c in cands if c is not full and not (c["w"] and c["h"] and c["h"] >= 2 * c["w"])), None)
    view_url = pick(view, view_w) if view else None
    if not view_url:
        og = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', page) or \
            re.search(r'<meta[^>]+content="([^"]+)"[^>]+property="og:image"', page)
        view_url = urllib.parse.urljoin(base_url, html.unescape(og.group(1))) if og else None
    return view_url, (pick(full, full_w) if full else None)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write("error: %s (run with --help)\n" % message)
        sys.exit(2)


def main(argv=None):
    ap = Parser(prog="showcase_fetch.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "showcase"))
    ap.add_argument("--limit", type=int, default=100)
    ap.add_argument("--delay", type=float, default=1.0)
    a = ap.parse_args(sys.argv[1:] if argv is None else argv)
    if a.limit < 1:
        ap.error("--limit must be 1 or more")
    if a.delay < 0:
        ap.error("--delay must be 0 or more seconds")
    out, limit, delay = os.path.abspath(a.out), a.limit, a.delay
    try:
        from PIL import Image
    except ImportError:
        print("NOT RUN: Pillow is needed to resize the pictures (pip install pillow)"); return 3
    try:
        index = get(BASE + "/showcase/?type=all")
    except _net.NotRun as e:
        print(f"NOT RUN: {e}"); return _net.EXIT_NOT_RUN
    except FetchError as e:
        print(f"index fetch failed: {e}"); return 1
    try:
        os.makedirs(os.path.join(out, "img"), exist_ok=True)
    except OSError as e:
        print(f"error: cannot create {out} ({e})", file=sys.stderr); return 2
    slugs = sorted(set(re.findall(r'href="/showcase/([a-z0-9-]+)/"', index)))[:limit]
    if not slugs:
        print("no showcase items found on the index page (layout changed?)"); return 1
    items, fetched = [], 0
    for n, slug in enumerate(slugs, 1):
        url = f"{BASE}/showcase/{slug}/"
        try:
            page = get(url)
        except FetchError as e:
            print(f"[{n}/{len(slugs)}] {slug} PAGE FAILED: {e}", flush=True); time.sleep(delay); continue
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
        view, full = item_images(page, url)
        item = {
            "slug": slug, "title": text_of(h1.group(1)) if h1 else slug,
            "type": slug.replace("-design", "").split("-")[-1],
            "url": url,
            "sections": sections(page),
            "view": view, "full": full,
        }
        for key, img_url, w, cap in (("img", item["view"], 1440, 1000), ("img_full", item["full"], 960, 2800)):
            if not img_url:
                continue
            time.sleep(delay / 2)
            try:
                raw = get_bytes(img_url)
                im = Image.open(io.BytesIO(raw)).convert("RGB")
            except Exception as e:  # network error or not a picture: report, keep going
                print(f"  {slug} {key}: {e}", flush=True)
                continue
            if im.width > w:
                im = im.resize((w, round(im.height * w / im.width)))
            im = im.crop((0, 0, im.width, min(im.height, cap)))
            name = f"img/{slug}{'' if key == 'img' else '-full'}.jpg"
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=72, optimize=True)
            _net.write_atomic(os.path.join(out, name), buf.getvalue())
            item[key] = name
        att = [x["text"] for x in item["sections"] if x["h"].lower().startswith("source and attribution")]
        item["attribution"] = att[0] if att else ""
        items.append(item)
        fetched += bool(item.get("img"))
        print(f"[{n}/{len(slugs)}] {slug} {'img' if item.get('img') else 'NO IMAGE'}{' +full' if item.get('img_full') else ''}", flush=True)
        _net.write_atomic(os.path.join(out, "items.json"), json.dumps(items, ensure_ascii=False, indent=1))
        time.sleep(delay)
    print("saved", len(items), "items,", fetched, "with pictures, to", out)
    if not fetched:
        print("no pictures fetched: the item pages' <img> layout may have changed"); return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
