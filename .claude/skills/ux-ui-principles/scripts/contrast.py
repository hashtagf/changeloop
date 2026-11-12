#!/usr/bin/env python3
"""Check WCAG 2.x contrast ratios for color pairs.

Usage:
  python3 contrast.py pairs.json            # JSON: [{"name","fg","bg","min"}...]
  python3 contrast.py "#0f6e64" "#ffffff"   # single pair, prints ratio
  python3 contrast.py --css page.html       # read token blocks (:root, .dark, [data-theme], @theme), check role pairs per theme
  python3 contrast.py --css tokens.css      # also works on a stylesheet; local @import and <link> files are followed

--css finds every token block: rules whose selector is :root, html or body, a theme class or
attribute (.dark, .light, .theme-x, [data-theme=…], [data-mode=…], [data-color-scheme=…]) alone or
on :root/html/body, and Tailwind v4 @theme {} (also inside @media). It layers each block's custom
properties over the base (first light) block and checks known role pairs (ink/bg, muted/panel,
accent-ink/accent, field/panel, foreground/background, …) plus naming patterns: --X with --X-ink,
--X-foreground or --on-X, and --lN with --lNi. A leading "color-" is ignored (--color-ink = ink)
and paper/paper-2/paper-3 count as bg/panel grounds. Blocks whose selector mentions "dark" are
layered over the first plain dark block (approximating the cascade for palette variants); blocks
other than :root ones are labelled "(light theme)" / "(dark theme)". Values resolved: #hex, CSS named colours, rgb(), hsl(), oklch()
(alpha only when opaque: / 1, / 100%) and var(--x) references (with fallback); !important is ignored.
color-mix(), translucent and transparent values are skipped. "dark" inside :not(…) does not make a block dark. Local
@import and <link rel=stylesheet> files are read too. It cannot see colors set outside tokens.
Prints "N/A …" and exits 0 (check.py: N/A) when no token block or no checkable pair is found.

`min` defaults to 4.5 (normal text). Use 3 for large text, UI components,
focus indicators and graphics (WCAG 1.4.3 / 1.4.11). Colors: #rgb, #rgba, #rrggbb or #rrggbbaa
(alpha is ignored: resolve translucent colors against their actual background first).
--json prints the results as a JSON list (pairs mode, --css) or object (single pair).

Exit: 0 all pass (or N/A: --css found no token block / no checkable pair, printed as "N/A …"),
1 a pair fails, 2 usage or input error (missing file, bad color, malformed JSON). Writes nothing.
Standard library only.
"""
import argparse
import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _color import CSS_NAMED, is_hex, lum as luminance, ratio  # noqa: E402,F401  (shared WCAG maths)


def _hex(r, g, b):
    clamp = lambda x: max(0, min(255, round(x * 255)))
    return "#%02x%02x%02x" % (clamp(r), clamp(g), clamp(b))


def _oklch_to_hex(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l_, m_, s_ = L + 0.3963377774 * a + 0.2158037573 * b, L - 0.1055613458 * a - 0.0638541728 * b, L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s_ = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s_
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s_
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s_
    enc = lambda x: 12.92 * x if x <= 0.0031308 else 1.055 * (max(x, 0) ** (1 / 2.4)) - 0.055
    return _hex(enc(max(r, 0)), enc(max(g, 0)), enc(max(bl, 0)))


def _hsl_to_hex(h, sat, lig):
    c = (1 - abs(2 * lig - 1)) * sat
    x = c * (1 - abs((h / 60) % 2 - 1)); m = lig - c / 2
    r, g, b = [(c, x, 0), (x, c, 0), (0, c, x), (0, x, c), (x, 0, c), (c, 0, x)][int(h % 360 // 60)]
    return _hex(r + m, g + m, b + m)


_ALPHA = r"(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)"     # optional alpha; only an opaque one (>= 1 or 100%) resolves


def _opaque(a, pct):
    return a is None or float(a) >= (100 if pct else 1)


def resolve_color(value, tok, depth=0):
    """Return #rrggbb for hex, CSS named colours, rgb(), hsl(), oklch() (opaque alpha only) and
    var(--x[, fallback]); a trailing !important is ignored. Else None (translucent, color-mix(), …)."""
    if not value or depth > 6:
        return None
    v = re.sub(r"\s*!\s*important\s*$", "", value.strip(), flags=re.I)
    if re.fullmatch(r"#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?", v):
        return v
    if v.lower() in CSS_NAMED:
        return CSS_NAMED[v.lower()]
    m = re.fullmatch(r"var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)", v)
    if m:
        return resolve_color(tok.get(m.group(1)) or m.group(2), tok, depth + 1)
    m = re.fullmatch(r"oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?" + _ALPHA, v)
    if m and _opaque(m.group(5), m.group(6)):
        L = float(m.group(1)) / (100 if m.group(2) else 1)
        return _oklch_to_hex(L, float(m.group(3)), float(m.group(4)))
    m = re.fullmatch(r"rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)" + _ALPHA, v)
    if m and _opaque(m.group(4), m.group(5)):
        return _hex(*(int(x) / 255 for x in m.groups()[:3]))
    m = re.fullmatch(r"hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%" + _ALPHA, v)
    if m and _opaque(m.group(4), m.group(5)):
        return _hsl_to_hex(float(m.group(1)), float(m.group(2)) / 100, float(m.group(3)) / 100)
    return None


def read_css(path, seen=None):
    """CSS text of a .css/.html file plus local @import and <link> stylesheets."""
    seen = seen if seen is not None else set()
    path = os.path.abspath(path)
    if path in seen or not os.path.exists(path):
        return ""
    seen.add(path)
    text = open(path, encoding="utf-8", errors="replace").read()
    base = os.path.dirname(path)
    if path.endswith((".html", ".htm")):
        css = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", text, flags=re.S))
        refs = re.findall(r"<link[^>]+rel=[\"']stylesheet[\"'][^>]*href=[\"']([^\"']+)", text)
        refs += re.findall(r"<link[^>]+href=[\"']([^\"']+)[\"'][^>]*rel=[\"']stylesheet", text)
    else:
        css, refs = text, []
    refs += re.findall(r"@import\s+(?:url\()?[\"']?([^\"')\s;]+)", css)
    for r in refs:
        if re.match(r"[a-z]+://|//", r):
            continue
        css += "\n" + read_css(os.path.join(base, r.split("?")[0]), seen)
    return css


ROLE_PAIRS = [
    ("ink", "ground", 4.5), ("ink", "surface", 4.5), ("ink2", "ground", 4.5), ("ink2", "surface", 4.5),
    ("muted", "ground", 4.5), ("muted", "surface", 4.5), ("accent", "ground", 3.0),
    ("ink", "paper", 4.5), ("ink", "paper-2", 4.5), ("ink", "paper-3", 4.5), ("ink-2", "paper", 4.5),
    ("muted", "paper", 4.5), ("muted", "paper-2", 4.5), ("accent", "paper", 3.0),
    ("accent-deep", "paper", 3.0), ("accent-ink", "accent", 4.5), ("focus", "paper", 3.0),
    ("ink", "bg", 4.5), ("ink", "panel", 4.5), ("fg", "bg", 4.5), ("text", "surface", 4.5),
    ("muted", "panel", 4.5), ("muted", "bg", 4.5), ("faint", "panel", 4.5), ("faint", "bg", 4.5),
    ("accent", "panel", 4.5), ("accent", "bg", 4.5), ("accent-ink", "accent", 4.5),
    ("side-ink", "side", 4.5), ("side-muted", "side", 4.5),
    ("crit", "crit-soft", 4.5), ("warn", "warn-soft", 4.5), ("ok", "ok-soft", 4.5),
    ("crit", "panel", 4.5), ("ok", "panel", 4.5),
    ("field", "panel", 3.0), ("focus", "panel", 3.0), ("focus", "bg", 3.0),
    ("foreground", "background", 4.5), ("muted-foreground", "background", 4.5),
]


# A token block: :root, html, body, a theme class / attribute (.dark, .light, .theme-x, [data-theme=…],
# [data-mode=…], [data-color-scheme=…], [class~=dark]) on its own or on :root/html/body, or Tailwind v4 @theme.
_THEME = r"(?:\.(?:(?:dark|light)(?:-mode)?|theme[\w-]*|[\w-]*-theme)|\[(?:data-(?:theme|mode|color-scheme|bs-theme)|class[~*]?=[\"']?(?:dark|light))[^\]]*\])"
_TOKEN_SEL = re.compile(r"(?:(?::root|html|body)(?::where\([^)]*\)|" + _THEME + r")*|(?::where\()?" + _THEME + r"+\)?)")


def is_token_selector(sel):
    """True for selectors that hold design tokens (see _TOKEN_SEL); component rules are skipped."""
    if re.match(r"@theme\b", sel):
        return True
    parts = [p.strip() for p in sel.split(",") if p.strip()]
    return bool(parts) and all(_TOKEN_SEL.fullmatch(p) for p in parts)


def css_blocks(text):
    """Yield (label, {prop: value}) for token blocks (:root, html, theme selectors, @theme)."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    out, stack, buf, i = [], [], "", 0
    while i < len(text):
        c = text[i]
        if c == "{":
            sel = re.split(r";", buf)[-1]                     # "@import …; :root"; a selector list may span lines
            if "<" in sel:          # leftover HTML before the selector; a bare ">" is a CSS child combinator, kept
                sel = re.split(r"<[^<>]*>?", sel)[-1]
            stack.append(" ".join(sel.split())); buf = ""
        elif c == "}":
            sel = stack.pop() if stack else ""
            if "--" in buf and (":root" in sel or is_token_selector(sel)):
                props = dict(re.findall(r"--([\w-]+)\s*:\s*([^;]+);?", buf))
                ctx = " ".join(x for x in stack if x.startswith("@"))
                out.append(((ctx + " " + sel).strip(), {k: v.strip() for k, v in props.items()}))
            buf = ""
        else:
            buf += c
        i += 1
    return out


def is_dark(label):
    """A dark block: "dark" in the selector or @media context outside :not(…) (so :root:not(.dark) is light)."""
    return "dark" in re.sub(r":not\((?:[^()]|\([^()]*\))*\)", "", label.lower())


def theme_of(label):
    return "dark" if is_dark(label) else "light"


def check_css(path, as_json=False):
    blocks = css_blocks(read_css(path))
    results = []
    def na(msg):
        print(json.dumps([{"status": "N/A", "message": msg}]) if as_json else "N/A  " + msg)
        return 0
    if not blocks:
        return na("no :root custom properties found (no :root, html, .dark, [data-theme] or @theme token block)")
    base_i = next((i for i, (l, _) in enumerate(blocks) if theme_of(l) == "light"), 0)
    base = blocks[base_i][1]
    dark_base = next((p for i, (l, p) in enumerate(blocks) if i != base_i and is_dark(l) and "palette" not in l), {})
    strip = lambda d: {(k[6:] if k.startswith("color-") else k): v for k, v in d.items()}
    failed = total = 0
    for i, (label, props) in enumerate(blocks):
        raw = dict(base)
        if is_dark(label):  # theme variants layer over the main dark block, as in the browser
            raw.update(dark_base)
        raw.update(props)
        hexv = lambda name: resolve_color(tok.get(name), raw)
        tok = strip(raw)
        props = strip(props)
        pairs = list(ROLE_PAIRS)
        for k in tok:
            if k + "-ink" in tok: pairs.append((k + "-ink", k, 4.5))
            if k + "-foreground" in tok: pairs.append((k + "-foreground", k, 4.5))
            if "on-" + k in tok: pairs.append(("on-" + k, k, 4.5))
            m = re.fullmatch(r"(l\d+)", k)
            if m and k + "i" in tok: pairs.append((k + "i", k, 4.5))
        seen, rows = set(), []
        for fg, bg, need in pairs:
            if (fg, bg) in seen: continue
            seen.add((fg, bg))
            if i != base_i and fg not in props and bg not in props: continue
            a, b = hexv(fg), hexv(bg)
            if not (a and b): continue
            r = ratio(a, b); ok = r >= need; total += 1; failed += not ok
            rows.append(f"  {'PASS' if ok else 'FAIL'}  {r:5.2f}:1  need {need}:1  --{fg} on --{bg}  ({a} on {b})")
            results.append({"block": label, "theme": theme_of(label), "fg": "--" + fg, "bg": "--" + bg, "fg_value": a, "bg_value": b,
                            "ratio": round(r, 2), "min": need, "status": "PASS" if ok else "FAIL"})
        if rows and not as_json:
            print(f"[{label}]" + ("" if ":root" in label or i == base_i else f"  ({theme_of(label)} theme)")); print("\n".join(rows))
    if not total:
        return na("no checkable colour pairs: token blocks found, but no known role pair resolves to plain colours (check pairs by hand)")
    if as_json:
        print(json.dumps(results, indent=2))
    else:
        print(f"\n{total - failed}/{total} pairs pass")
    return 1 if failed else 0


def fail(msg):
    print("error: " + msg, file=sys.stderr)
    return 2


def main(argv):
    ap = argparse.ArgumentParser(prog="contrast.py", description="WCAG 2.x contrast ratios (see the module docstring).")
    ap.add_argument("args", nargs="*", help="pairs.json, or two colors")
    ap.add_argument("--css", metavar="FILE", help="page .html or stylesheet .css to read token blocks from")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    a = ap.parse_args(argv[1:])
    if a.css:
        if a.args:
            ap.error("--css takes one file and no other positional arguments")
        if not os.path.isfile(a.css):
            return fail(f"file not found: {a.css} (pass a built .html page or a .css file)")
        return check_css(a.css, a.json)
    if len(a.args) == 2:
        bad = [c for c in a.args if not is_hex(c)]
        if bad:
            return fail(f"not a hex color: {bad[0]} (use #rgb or #rrggbb, e.g. \"#0f6e64\")")
        r = ratio(*a.args)
        print(json.dumps({"fg": a.args[0], "bg": a.args[1], "ratio": round(r, 2)}) if a.json else f"{r:.2f}:1")
        return 0
    if len(a.args) != 1:
        ap.error("pass pairs.json, two colors, or --css FILE")
    try:
        with open(a.args[0], encoding="utf-8") as f:
            pairs = json.load(f)
    except OSError as e:
        return fail(f"cannot read {a.args[0]}: {e.strerror} (check the path)")
    except ValueError as e:
        return fail(f"malformed JSON in {a.args[0]}: {e} (expected [{{\"name\",\"fg\",\"bg\",\"min\"}}, ...])")
    if not isinstance(pairs, list) or not all(isinstance(p, dict) for p in pairs):
        return fail(f"{a.args[0]} must be a JSON list of objects (expected [{{\"name\",\"fg\",\"bg\",\"min\"}}, ...])")
    rows, failed = [], 0
    for n, p in enumerate(pairs):
        fg, bg = p.get("fg"), p.get("bg")
        if not (is_hex(fg) and is_hex(bg)):
            return fail(f"pair {n} ({p.get('name', '')}): fg and bg must be hex colors, got {fg!r} / {bg!r}")
        try:
            need = float(p.get("min", 4.5))
        except (TypeError, ValueError):
            return fail(f"pair {n} ({p.get('name', '')}): min must be a number, got {p.get('min')!r}")
        r = ratio(fg, bg)
        ok = r >= need
        failed += not ok
        rows.append({"name": p.get("name", ""), "fg": fg, "bg": bg, "ratio": round(r, 2), "min": need, "status": "PASS" if ok else "FAIL"})
    if a.json:
        print(json.dumps(rows, indent=2, ensure_ascii=False))
    else:
        for x in rows:
            print(f"{x['status']}  {x['ratio']:5.2f}:1  need {x['min']}:1  {x['name']}  {x['fg']} on {x['bg']}")
        print(f"\n{len(pairs) - failed}/{len(pairs)} pairs pass")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
