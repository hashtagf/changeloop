#!/usr/bin/env python3
"""Turn review findings into a single self-contained HTML report (radar chart, scores with bands, Keep / Fix / Quick wins).

Usage:
  python3 review_report.py findings.json [--out review.html]   # default: review.html next to findings.json
  python3 review_report.py --template        # prints an example findings.json

findings.json:
  {"title": "...", "artifact": "path or URL", "date": "YYYY-MM-DD", "verdict": "one line",
   "dimensions": [{"name": "Hierarchy", "score": 7, "evidence": "cite elements", "keep": "...", "fix": "...", "quick": "..."}],
   "keep": ["..."], "fix": [{"p": "P0", "text": "..."}], "quick": ["..."]}

Dimensions are the rubric criteria in references/review-loop.md §3-4 (3 to 8 per report, e.g. the 6 visual or 5 UX criteria). Score 0-10; bands: 0-4 Broken,
5-6 Functional, 7-8 Strong, 9-10 Exceptional; a non-integer score falls in the band of its whole part (4.5 Broken,
6.5 Functional, 8.9 Strong), since a band starts at its lower integer. The report never averages: each dimension stands alone, so a
9 on one and a 4 on another stays visible.

Writes only the report: --out PATH, or review.html in the folder of findings.json (never the current folder).
Exit 0 written, 2 usage or input error (missing file, malformed JSON, fewer than 3 or more than 8 dimensions,
a score that is missing, not a number or outside 0-10, a text field or list item of the wrong type). The report
is rendered first and written atomically, so a failed run never leaves an empty review.html. Standard library only.
"""
import argparse
import html
import os
import json
import math
import sys
import tempfile

TEMPLATE = {
    "title": "Review: landing page", "artifact": "index.html", "date": "2026-11-05",
    "verdict": "Strong direction, weak mobile hierarchy.",
    "dimensions": [
        {"name": "Direction consistency", "score": 8, "evidence": "Round buttons and leaf cards used on every section.", "keep": "Shape language", "fix": "Footer uses square chips", "quick": "Round the footer chips"},
        {"name": "Visual hierarchy", "score": 5, "evidence": "Hero headline wraps to 3 lines at 390px; CTA below the fold.", "keep": "Section rhythm", "fix": "Shorten the headline", "quick": "Set max 2 lines"},
        {"name": "Detail and craft", "score": 7, "evidence": "Spacing on a 4px scale; one off-scale 22px gap in the plan card.", "keep": "Type scale", "fix": "Off-scale gap", "quick": "Use 24px"},
        {"name": "Accessibility", "score": 9, "evidence": "Contrast passes in both themes; focus ring visible.", "keep": "Focus ring", "fix": "None", "quick": "None"}],
    "keep": ["Shape language", "Contrast in both themes"], "fix": [{"p": "P0", "text": "Hero headline over 2 lines on phone"}, {"p": "P1", "text": "Footer chips are square"}],
    "quick": ["Round the footer chips", "Cap the hero headline at 2 lines"],
}


def band(s):
    return "Broken" if s < 5 else "Functional" if s < 7 else "Strong" if s < 9 else "Exceptional"


def radar(dims):
    n = len(dims)
    cx, cy, R = 170, 170, 120
    pt = lambda i, v: (cx + R * v / 10 * math.sin(2 * math.pi * i / n), cy - R * v / 10 * math.cos(2 * math.pi * i / n))
    out = ['<svg viewBox="-60 0 460 340" role="img" aria-label="Radar chart of %d scores" width="460" height="340">' % n]
    for ring in (2, 4, 6, 8, 10):
        out.append('<polygon points="%s" fill="none" stroke="#d6d9de"/>' % " ".join("%.1f,%.1f" % pt(i, ring) for i in range(n)))
    for i, d in enumerate(dims):
        x, y = pt(i, 10)
        out.append('<line x1="%d" y1="%d" x2="%.1f" y2="%.1f" stroke="#d6d9de"/>' % (cx, cy, x, y))
        lx, ly = pt(i, 11.8)
        anchor = "middle" if abs(lx - cx) < 12 else ("start" if lx > cx else "end")
        out.append('<text x="%.1f" y="%.1f" font-size="11" text-anchor="%s" fill="#4a5160">%s</text>' % (lx, ly + 4, anchor, html.escape(str(d["name"])[:22])))
    out.append('<polygon points="%s" fill="rgba(42,109,244,.18)" stroke="#2a6df4" stroke-width="2"/>' % " ".join("%.1f,%.1f" % pt(i, d["score"]) for i, d in enumerate(dims)))
    for i, d in enumerate(dims):
        x, y = pt(i, d["score"])
        out.append('<circle cx="%.1f" cy="%.1f" r="4" fill="#2a6df4"/>' % (x, y))
    out.append("</svg>")
    return "".join(out)


def render(d):
    e = html.escape
    dims = d["dimensions"]
    cards = ""
    for x in dims:
        b = band(x["score"])
        cards += '<section class="card"><div class="top"><h3>%s</h3><span class="sc %s">%s/10 · %s</span></div><p>%s</p><ul><li><b>Keep</b> %s</li><li><b>Fix</b> %s</li><li><b>Quick win</b> %s</li></ul></section>' % (
            e(x["name"]), b.lower(), x["score"], b, e(x.get("evidence", "")), e(x.get("keep", "-")), e(x.get("fix", "-")), e(x.get("quick", "-")))
    li = lambda items: "".join("<li>%s</li>" % e(i if isinstance(i, str) else "%s %s" % (i.get("p", ""), i.get("text", ""))) for i in items) or "<li>None</li>"
    return """<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s</title>
<style>:root{--ink:#16181d;--m:#4a5160;--ln:#d6d9de}*{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:var(--ink);font:15px/1.5 system-ui,"Noto Sans Thai",sans-serif}
main{max-width:1100px;margin:0 auto;padding:28px 20px 60px}h1{font-size:26px;margin:0 0 4px}.sub{color:var(--m);margin:0 0 18px}
.hero{display:grid;grid-template-columns:460px 1fr;gap:24px;align-items:center;background:#fff;border:1px solid var(--ln);border-radius:14px;padding:18px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:16px}.card{background:#fff;border:1px solid var(--ln);border-radius:14px;padding:16px}
.top{display:flex;justify-content:space-between;gap:8px;align-items:center}h3{margin:0;font-size:16px}h2{font-size:18px;margin:26px 0 8px}
.sc{font:700 12px system-ui;padding:3px 10px;border-radius:99px;white-space:nowrap}.broken{background:#fde4e1;color:#8a1c12}.functional{background:#fdf0d0;color:#7a4b00}.strong{background:#dff1e5;color:#14573a}.exceptional{background:#d9e6ff;color:#1c3f96}
ul{padding-left:18px;margin:8px 0 0}.lists{margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.lists>div{background:#fff;border:1px solid var(--ln);border-radius:14px;padding:6px 18px 14px}
@media(max-width:800px){.hero{grid-template-columns:1fr}svg{max-width:100%%;height:auto}}</style><main>
<h1>%s</h1><p class="sub">%s · %s</p>
<div class="hero">%s<div><p style="font-size:18px;margin:0 0 10px"><b>%s</b></p><p class="sub" style="margin:0">Scores are not averaged: each dimension stands alone so a strong one never hides a broken one.</p></div></div>
<div class="grid">%s</div>
<div class="lists"><div><h2>Keep</h2><ul>%s</ul></div><div><h2>Fix</h2><ul>%s</ul></div><div><h2>Quick wins</h2><ul>%s</ul></div></div></main></html>""" % (
        e(d.get("title", "Review")), e(d.get("title", "Review")), e(d.get("artifact", "")), e(d.get("date", "")), radar(dims), e(d.get("verdict", "")), cards,
        li(d.get("keep", [])), li(d.get("fix", [])), li(d.get("quick", [])))


def fail(msg):
    print("error: " + msg, file=sys.stderr)
    return 2


def validate(d, src):
    """Error message for a findings object that render() cannot use, else None."""
    if not isinstance(d, dict):
        return f"{src} must hold a JSON object (see --template)"
    dims = d.get("dimensions")
    if not isinstance(dims, list):
        return f"{src}: \"dimensions\" must be a list (see --template)"
    if not 3 <= len(dims) <= 8:
        return f"need 3 to 8 dimensions, got {len(dims)} (one per rubric criterion, references/review-loop.md)"
    for i, x in enumerate(dims):
        if not isinstance(x, dict) or not isinstance(x.get("name"), str) or not x["name"].strip():
            return f"dimension {i + 1} needs a \"name\" string"
        sc = x.get("score")
        if isinstance(sc, bool) or not isinstance(sc, (int, float)):
            return f"dimension {x['name']!r}: \"score\" must be a number 0-10, got {sc!r}"
        if not 0 <= sc <= 10:
            return f"score out of range (0-10): {x['name']} = {sc}"
        for k in ("evidence", "keep", "fix", "quick"):
            if k in x and not isinstance(x[k], str):
                return f"dimension {x['name']!r}: \"{k}\" must be a string, got {x[k]!r}"
    for k in ("title", "artifact", "date", "verdict"):
        if k in d and not isinstance(d[k], str):
            return f"{src}: \"{k}\" must be a string, got {d[k]!r}"
    for k in ("keep", "fix", "quick"):
        if not isinstance(d.get(k, []), list):
            return f"{src}: \"{k}\" must be a list"
        for n, i in enumerate(d.get(k, [])):
            if not isinstance(i, (str, dict)):
                return f"{src}: \"{k}\" item {n + 1} must be a string (or {{\"p\", \"text\"}}), got {i!r}"
    return None


def main(argv=None):
    ap = argparse.ArgumentParser(prog="review_report.py", description="Review findings -> one self-contained HTML report.")
    ap.add_argument("findings", nargs="?", help="findings.json")
    ap.add_argument("--out", help="output .html (default: review.html next to findings.json)")
    ap.add_argument("--template", action="store_true", help="print an example findings.json")
    a = ap.parse_args(argv)
    if a.template:
        print(json.dumps(TEMPLATE, indent=2))
        return 0
    if not a.findings:
        ap.error("pass findings.json (python3 review_report.py --template prints an example)")
    try:
        with open(a.findings, encoding="utf-8") as f:
            d = json.load(f)
    except OSError as e:
        return fail(f"cannot read {a.findings}: {e.strerror} (check the path)")
    except ValueError as e:
        return fail(f"malformed JSON in {a.findings}: {e} (python3 review_report.py --template prints an example)")
    err = validate(d, a.findings)
    if err:
        return fail(err)
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.findings)), "review.html")
    page = render(d)                       # render before touching the output file
    tmp = None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=os.path.dirname(os.path.abspath(out)),
                                         prefix=".review-", suffix=".tmp", delete=False) as f:
            tmp = f.name
            f.write(page)
        um = os.umask(0); os.umask(um)
        os.chmod(tmp, 0o666 & ~um)         # mkstemp is 0600; keep the usual file mode
        os.replace(tmp, out)
    except OSError as e:
        if tmp and os.path.exists(tmp):
            os.remove(tmp)
        return fail(f"cannot write {out}: {e.strerror} (pass a writable --out path)")
    print("wrote", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
