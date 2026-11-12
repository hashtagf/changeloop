#!/usr/bin/env python3
"""Download the Mobbin study pictures listed in assets/mobbin/urls.json into assets/mobbin/img/.

Usage:
  python3 scripts/mobbin_fetch.py [--urls assets/mobbin/urls.json] [--out assets/mobbin/img] [--force] [--delay 0.3]

urls.json maps each catalog slug to its screen URLs in order ({"basecamp": [url1, url2, ...]}); screen N is
saved as <slug>-N.jpg (max 1440 px, JPEG), matching catalog.json "screens". The URLs come from a logged-in
Mobbin session (README "Rebuild") and are signed, so they can expire: collect them again when downloads fail.
Existing pictures are kept unless --force. Pictures are other companies' products captured by Mobbin: a local
study set (git-ignored), never assets for client work.
Exit 0 all fetched, 1 some failed, 2 usage error, 3 not run (Pillow missing or no network).
"""
import argparse, io, json, math, os, re, sys, time

import _net

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write("error: %s (run with --help)\n" % message)
        sys.exit(2)


def main(argv=None):
    ap = Parser(prog="mobbin_fetch.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--urls", default=os.path.join(ROOT, "assets", "mobbin", "urls.json"))
    ap.add_argument("--out", default=os.path.join(ROOT, "assets", "mobbin", "img"))
    ap.add_argument("--force", action="store_true", help="re-download pictures that already exist")
    ap.add_argument("--delay", type=float, default=0.3, help="seconds between requests (default 0.3)")
    a = ap.parse_args(argv)
    if not math.isfinite(a.delay):
        ap.error("--delay %r: must be a finite number of seconds" % a.delay)
    if not os.path.exists(a.urls):
        ap.error("no %s: collect the URLs first (assets/mobbin/README.md, Rebuild)" % a.urls)
    try:
        with open(a.urls, encoding="utf-8") as f:
            urls = json.load(f)
    except ValueError as e:
        ap.error("%s is not JSON: %s" % (a.urls, e))
    except OSError as e:
        ap.error("cannot read --urls %s (%s)" % (a.urls, e))
    # {"slug": ["https://...", ...]}: the slug becomes a file name, so it must stay inside --out
    if not isinstance(urls, dict):
        ap.error("%s: expected an object {\"slug\": [url, ...]}" % a.urls)
    for slug, lst in urls.items():
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
            ap.error("%s: slug %r: use lower-case letters, digits and - only" % (a.urls, slug))
        if not isinstance(lst, list) or not all(isinstance(u, str) and re.match(r"https?://", u) for u in lst):
            ap.error("%s: %s must be a list of http(s) URLs" % (a.urls, slug))
    try:
        from PIL import Image
    except ImportError:
        print("NOT RUN: Pillow missing (pip install Pillow)", file=sys.stderr)
        return _net.EXIT_NOT_RUN
    try:
        os.makedirs(a.out, exist_ok=True)
    except OSError as e:
        ap.error("cannot create --out %s (%s)" % (a.out, e))
    if not os.access(a.out, os.W_OK):
        ap.error("cannot write into --out %s (permission denied)" % a.out)
    ok = failed = kept = 0
    for slug, lst in urls.items():
        for i, u in enumerate(lst, 1):
            path = os.path.join(a.out, "%s-%d.jpg" % (slug, i))
            if os.path.exists(path) and not a.force:
                kept += 1
                continue
            try:
                data = _net.get(u)
                im = Image.open(io.BytesIO(data)).convert("RGB")
            except _net.NotRun as e:
                print("NOT RUN: %s" % e, file=sys.stderr)
                return _net.EXIT_NOT_RUN
            except Exception as e:  # HTTP error, expired signature, not an image
                print("FAILED %s-%d: %s" % (slug, i, str(e)[:120]))
                failed += 1
                continue
            im.thumbnail((1440, 1440))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=82)
            try:
                _net.write_atomic(path, buf.getvalue())
            except OSError as e:
                ap.error("cannot write %s (%s)" % (path, e))
            ok += 1
            time.sleep(max(a.delay, 0))
    print("fetched %d, kept %d, failed %d -> %s" % (ok, kept, failed, a.out))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
