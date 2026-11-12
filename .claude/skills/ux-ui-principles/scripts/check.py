#!/usr/bin/env python3
"""One command for every delivery check on a built page.

Usage:
  python3 scripts/check.py <page.html> [more.html ...] [--render] [--full] [--admin list|detail|form|dashboard] [--json]

Runs, per page:
  script   node scripts/script_check.js   syntax of every script; globals that clash with window (e.g. const top)
  slop     python3 scripts/slop_check.py  template devices, inert forms, removed focus, motion without reduced motion
  contrast python3 scripts/contrast.py --css  role colour pairs in token blocks (:root, html, .dark, [data-theme], @theme)
                                            (N/A when the page defines no checkable colour tokens)
  states   python3 scripts/state_check.py  markers of loading / empty / error / disabled / focus … in the page and the
                                            local scripts / stylesheets it links (PASS when every state has a marker,
                                            MANUAL listing the missing ones otherwise)
  meta     built in                         public pages: title, description, canonical, og:title/description/image,
                                            twitter:card, exactly one h1 (N/A for /admin/ paths, noindex or data-surface="app");
                                            FLAG unfinished placeholders: example.com / example.org in canonical, og:url,
                                            og:image, and [ … ] / {{ … }} in title, description, og:title, og:description
  render   node scripts/render_check.js --fast (with --render; --full drops --fast)  overflow, JS errors, targets, shots
  admin    node scripts/admin_check.js --type T --states (with --admin T)  numeric columns, disabled reasons, sticky bars,
                                            one primary action, table above fold, every ?state= rendered and different
  fold     node scripts/fold_check.js (with --render)  primary action above the 390x844 / 1440x900 fold, next section hinted (N/A on app pages)

Prints one line per check (PASS / FLAG / FAIL / ERROR / N/A / MANUAL / NOT RUN) and the first lines of anything that is
not a pass. Each sub-check's result comes from its exit code: 0 PASS (contrast "N/A …" output: N/A), 1 FAIL (slop:
FLAG, states: MANUAL), 2 ERROR (the checker rejected its input), 3 NOT RUN (no browser / dependency). A check that
cannot run says NOT RUN; never report it as passed. --json prints [{"page", "checks": [{"name", "status", "lines"}]}].

Exit: 0 every check passed or N/A / MANUAL, 1 any FAIL / FLAG / ERROR, 2 usage error or a page not found,
3 nothing failed but a check did NOT RUN. Writes nothing itself (render / fold / admin write into their own
temp or --out folders). Standard library only.
"""
import argparse, html as htmllib, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def run(cmd):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        return r.returncode, (r.stdout + r.stderr).strip()
    except FileNotFoundError:
        return None, "not installed"
    except subprocess.TimeoutExpired:
        return 1, "timed out"


def linked_sources(page):
    """The page plus the local scripts and stylesheets it links (what the states check scans)."""
    with open(page, encoding="utf-8", errors="replace") as f:
        html = f.read()
    out, base = [page], os.path.dirname(page)
    refs = re.findall(r"<script\b[^>]*\bsrc=[\"']([^\"']+)[\"']", html, re.I)
    refs += [h for tag in re.findall(r"<link\b[^>]*>", html, re.I) if re.search(r"rel=[\"']?stylesheet", tag, re.I)
             for h in re.findall(r"href=[\"']([^\"']+)[\"']", tag, re.I)]
    for r in refs:
        if re.match(r"[a-z][a-z0-9+.-]*:|//", r, re.I):
            continue                              # remote / data: resources are not the page's own source
        q = os.path.normpath(os.path.join(base, r.split("?")[0].split("#")[0]))
        if os.path.isfile(q) and q not in out:
            out.append(q)
    return out


def states_result(out):
    """(status, lines) from state_check.py --json output; None when it is not JSON."""
    try:
        rep = json.loads(out)
    except ValueError:
        return None
    missing = rep.get("missing") or []
    return ("MANUAL", [f"MISS {s}" for s in missing] + ["missing = no marker found; verify by hand"]) if missing else ("PASS", [])


def is_app_page(page, html):
    """Admin / app / noindex pages: no public metadata, no marketing fold rule."""
    return bool("/admin/" in page.replace(os.sep, "/") or re.search(r"<meta[^>]+name=[\"']robots[\"'][^>]+noindex", html, re.I)
                or re.search(r"<html[^>]+data-surface=[\"']app", html, re.I))


def tag_attrs(tag):
    return {k.lower(): htmllib.unescape(v1 if v1 is not None and q else v2)
            for k, q, v1, v2 in ((m.group(1), m.group(2), m.group(3), m.group(4))
                                 for m in re.finditer(r"([\w:-]+)\s*=\s*(?:([\"'])(.*?)\2|([^\s>]+))", tag, re.S))}


PLACEHOLDER_TEXT = re.compile(r"\[[^\[\]\n]{1,80}\]|\{\{[^{}\n]{1,80}\}\}")
PLACEHOLDER_HOST = re.compile(r"^(?:https?:)?//(?:[\w-]+\.)*example\.(?:com|org|net)(?:[:/?#]|$)", re.I)


def meta_placeholders(html):
    """Lines naming unfinished metadata: example.com URLs and [ … ] / {{ … }} tokens."""
    vals = {}
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    if m:
        vals["title"] = htmllib.unescape(" ".join(m.group(1).split()))
    for tag in re.findall(r"<(?:meta|link)\b[^>]*>", html, re.I):
        a = tag_attrs(tag)
        if tag[1:5].lower() == "link":
            if "canonical" in (a.get("rel") or "").lower().split():
                vals.setdefault("canonical", a.get("href", ""))
            continue
        key = (a.get("property") or a.get("name") or "").lower()
        if key in ("description", "og:title", "og:description", "og:url", "og:image"):
            vals.setdefault(key, a.get("content", ""))
    out = []
    for k in ("canonical", "og:url", "og:image"):
        if k in vals and PLACEHOLDER_HOST.match(vals[k].strip()):
            out.append(f"placeholder URL in {k}: {vals[k].strip()[:80]} (set the real domain)")
    for k in ("title", "description", "og:title", "og:description"):
        hits = PLACEHOLDER_TEXT.findall(vals.get(k, ""))
        if hits:
            out.append(f"placeholder text in {k}: {', '.join(hits[:3])} (replace with the real fact)")
    return out


def meta_check(page):
    """Return (status, lines) for the public-page metadata check."""
    with open(page, encoding="utf-8", errors="replace") as f:
        html = f.read()
    if is_app_page(page, html):
        return "N/A", ["app or noindex page: metadata not required"]
    have = set()
    if re.search(r"<title[^>]*>\s*[^<\s][^<]*</title>", html, re.I | re.S):
        have.add("title")
    for tag in re.findall(r"<(?:meta|link)\b[^>]*>", html, re.I):   # attributes in any order
        a = tag_attrs(tag)
        if tag[1:5].lower() == "link":
            if "canonical" in (a.get("rel") or "").lower().split() and a.get("href", "").strip():
                have.add("canonical")
            continue
        key = (a.get("property") or a.get("name") or "").lower()
        if a.get("content", "").strip():
            have.add("meta description" if key == "description" else key)
    need = ["title", "meta description", "canonical", "og:title", "og:description", "og:image", "twitter:card"]
    missing = [k for k in need if k not in have]
    h1 = len(re.findall(r"<h1[\s>]", html, re.I))
    if h1 != 1:
        missing.append(f"exactly one h1 (found {h1})")
    lines = (["missing: " + ", ".join(missing)] if missing else []) + meta_placeholders(html)
    return ("PASS", []) if not lines else ("FLAG", lines)


def result_of(name, code, out):
    """(status, lines to show) for a sub-check from its exit code (shared contract: 0 ok, 1 failed, 2 error, 3 not run)."""
    first = [l for l in out.splitlines() if l.strip()][:8]
    if code is None or code == 3:
        return "NOT RUN", first or ["not run"]
    if "traceback (most recent call last)" in out.lower():
        return "ERROR", first                  # the checker itself crashed: report it, never as a pass
    if code == 2:
        return "ERROR", first                  # the checker rejected its input
    if name == "states" and code in (0, 1):
        res = states_result(out)               # markers only; a miss means unverified, not failed
        if res:
            return res[0], res[1]
        return ("PASS", []) if code == 0 else ("MANUAL", first)
    if code == 0:
        if name == "contrast" and out.lstrip().startswith(("N/A", "[{\"status\": \"N/A\"")):
            return "N/A", first                # page defines no checkable colour tokens; check its pairs by hand
        return "PASS", []
    if code == 1 and out.lstrip().startswith("ERROR"):
        return "ERROR", first                  # legacy: a JS checker that could not load the page (missing file, refused URL)
    if code == 1:
        return ("FLAG" if name == "slop" else "FAIL"), first
    return "ERROR", first + [f"(unexpected exit code {code})"]


EXIT_RANK = {"FAIL": 1, "FLAG": 1, "ERROR": 1, "NOT RUN": 3}


def main(argv):
    ap = argparse.ArgumentParser(prog="check.py", description="Every delivery check on a built page (see the module docstring).")
    ap.add_argument("pages", nargs="+", metavar="PAGE", help="built .html page(s)")
    ap.add_argument("--render", action="store_true", help="also run render_check.js --fast and fold_check.js")
    ap.add_argument("--full", action="store_true", help="like --render, without --fast")
    ap.add_argument("--admin", nargs="?", const="list", choices=("list", "detail", "form", "dashboard"),
                    help="back-office page of this type (default list): admin_check.js, no metadata or fold rule")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    a = ap.parse_args(argv)
    node = shutil.which("node")
    report, failed, not_run, bad_input = [], False, False, False
    say = (lambda *x, **k: None) if a.json else print
    for page in a.pages:
        page = os.path.abspath(page)
        say(f"== {page}")
        entry = {"page": page, "checks": []}
        report.append(entry)
        def emit(status, name, lines=(), note=""):
            nonlocal failed, not_run
            entry["checks"].append({"name": name, "status": status, "lines": list(lines) if status != "PASS" else []})
            failed |= EXIT_RANK.get(status) == 1
            not_run |= status == "NOT RUN"
            say(f"  {status:<8} {name}" + (f" ({note})" if note else ""))
            if status not in ("PASS", "N/A"):
                for line in lines:
                    say(f"           {line[:160]}")
        if not os.path.isfile(page):
            entry["error"] = "page not found"
            say("  ERROR    page not found (pass the path to a built .html file)")
            bad_input = True
            continue
        checks = [
            ("script", [node, os.path.join(HERE, "script_check.js"), page] if node else None),
            ("slop", [sys.executable, os.path.join(HERE, "slop_check.py"), page]),
            ("contrast", [sys.executable, os.path.join(HERE, "contrast.py"), "--css", page]),
            ("states", [sys.executable, os.path.join(HERE, "state_check.py")] + linked_sources(page) + ["--json"]),
        ]
        if a.render or a.full:
            checks.append(("render", [node, os.path.join(HERE, "render_check.js"), page] + ([] if a.full else ["--fast"]) if node else None))
            fold = os.path.join(HERE, "fold_check.js")
            with open(page, encoding="utf-8", errors="replace") as f:
                app = is_app_page(page, f.read()) or a.admin   # --admin declares a back-office page
            if app:
                checks.append(("fold", "n/a"))
            else:
                checks.append(("fold", ([node, fold, page] if os.path.isfile(fold) else "missing") if node else None))
        if a.admin:
            checks.append(("admin", [node, os.path.join(HERE, "admin_check.js"), page, "--type", a.admin, "--states"] if node else None))
        status, lines = ("N/A", ["--admin: back-office page, metadata not required"]) if a.admin else meta_check(page)
        emit(status, "meta", lines)
        for name, cmd in checks:
            if cmd is None:
                emit("NOT RUN", name, ["node not found"], "node not found"); continue
            if cmd == "n/a":
                emit("N/A", name, ["app or noindex page: marketing fold rule does not apply"], "app or noindex page: marketing fold rule does not apply"); continue
            if cmd == "missing":
                emit("NOT RUN", name, [f"scripts/{name}_check.js not found"], f"scripts/{name}_check.js not found"); continue
            code, out = run(cmd)
            if code is None:
                emit("NOT RUN", name, [out], out); continue
            status, shown = result_of(name, code, out)
            emit(status, name, shown)
    if a.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    return 2 if bad_input else 1 if failed else 3 if not_run else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
