#!/usr/bin/env python3
"""Turn a direction (assets/directions/directions.json) into code-ready design tokens.

Usage:
  python3 export_tokens.py <direction-id> [--out DIR] [--only css,tailwind,shadcn]
  python3 export_tokens.py --json my-tokens.json [--out DIR]     # same keys as a directions.json entry
                           (needs ground, surface, ink, muted, accent, accentInk, tints[4] as hex; id/name default
                           to the file name; #rrggbbaa alpha is dropped with a warning; oklch()/rgb() are refused)
  python3 export_tokens.py --list
  python3 export_tokens.py <direction-id> --print-dark     # derived dark theme as JSON (used by previews)
  python3 export_tokens.py <direction-id> --shape soft|mixed|sharp   # shape override, same rule as design_md.py

--shape soft turns a 0px direction into 24px cards + pill buttons (what DESIGN.md writes when the subject is
round); sharp forces 0px + square buttons; mixed (or no flag) keeps the direction's radius.

Without --out it writes nothing: it prints tokens.css to stdout (redirect it, or pass --out) and the contrast
report to stderr, so running it from the skill folder never leaves files behind; with --only it prints the
selected files instead, each after a /* ===== name ===== */ line. With --out DIR it writes:
  tokens.css          plain CSS custom properties: color roles (light + dark), type, space,
                      radius, shadow, motion. Works in any stack.
  tailwind-theme.css  Tailwind v4: @theme inline mapping onto tokens.css
  shadcn-globals.css  shadcn/ui variable names (:root and .dark) plus @theme inline

The dark theme is derived, then every text/background pair is checked (WCAG AA) on the page (paper)
and on cards (surface), and the derived colors are nudged until they pass. Cards of the opposite tone
(light cards on a dark page) use surface-ink / surface-muted (the direction's cardInk / cardMuted when
given) plus surface-accent-text / surface-focus, emitted only for such directions. A pair that still fails is printed and exit
code is 1; a usage or input error (unknown id, bad flag value, unreadable --json) exits 2.
Review the output; it is a starting point, not a finished brand.
Standard library only.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DIRS = os.path.join(HERE, "..", "assets", "directions", "directions.json")


# ---------- color math: one source in _color.py (re-exported: code_extract / design_md use ex.lum, ex.reach ...) ----------
sys.path.insert(0, HERE)
import _net  # noqa: E402
from _color import (best_ink, delin, from_oklch, has_alpha, hex_rgb, is_hex, lin, lum, mix,  # noqa: E402,F401
                    norm_hex, ratio, reach, to_oklch)


def ok_css(h):
    L, C, H = to_oklch(h)
    return "oklch(%.1f%% %.3f %.0f)" % (L * 100, C, H)


def best_on(bg, a, b):
    return a if ratio(bg, a) >= ratio(bg, b) else b


# ---------- themes ----------
def light_theme(d):
    """The direction's own colors. cardInk / cardMuted (optional) are text colors for cards of the opposite tone."""
    return dict(ground=d["ground"], surface=d["surface"], ink=d["ink"], muted=d["muted"],
                accent=d["accent"], accent_ink=d["accentInk"], tints=list(d["tints"]),
                card_ink=d.get("cardInk"), card_muted=d.get("cardMuted"))


def derive_dark(d):
    _, gC, gH = to_oklch(d["ground"])
    tint = min(gC, 0.02)
    ground = from_oklch(0.18, tint, gH)
    surface = from_oklch(0.225, tint, gH)
    ink = from_oklch(0.95, tint * 0.4, gH)
    muted = reach(from_oklch(0.72, tint, gH), ground, 4.5, +1)
    accent = reach(d["accent"], ground, 4.5, +1)
    accent_ink = best_on(accent, ground, ink)
    tints = []
    for t in d["tints"]:
        _, c, h = to_oklch(t)
        tints.append(from_oklch(0.30, min(c, 0.05), h))
    return dict(ground=ground, surface=surface, ink=ink, muted=muted, accent=accent,
                accent_ink=accent_ink, tints=tints)


def derive_light_from_dark(d):
    _, gC, gH = to_oklch(d["ground"])
    ground = from_oklch(0.97, min(gC, 0.015), gH)
    surface = "#ffffff"
    ink = from_oklch(0.2, min(gC, 0.02), gH)
    muted = reach(from_oklch(0.5, min(gC, 0.02), gH), ground, 4.5, -1)
    accent = reach(d["accent"], ground, 4.5, -1)
    accent_ink = best_on(accent, "#ffffff", ink)
    tints = []
    for t in d["tints"]:
        _, c, h = to_oklch(t)
        tints.append(from_oklch(0.92, min(c, 0.06), h))
    return dict(ground=ground, surface=surface, ink=ink, muted=muted, accent=accent,
                accent_ink=accent_ink, tints=tints)


NOTES = []


def roles(t, dark, label=""):
    t = dict(t)
    g = t["ground"]
    d = +1 if dark else -1
    base = {"ok": "#14733f", "warn": "#9a6400", "bad": "#b3261e", "info": "#2a4bd7"}
    if dark:
        base = {"ok": "#5ac88a", "warn": "#e8b04a", "bad": "#f2837a", "info": "#7fa8f0"}
    for k, v in base.items():
        t[k] = reach(v, g, 4.5, d)
    # accent as a FILL keeps the direction's color; text on it must pass, so pick the best ink.
    cands = [t["accent_ink"], g, t["ink"], "#ffffff", "#000000"]
    best = max(cands, key=lambda c: ratio(c, t["accent"]))
    if best != t["accent_ink"] and ratio(t["accent_ink"], t["accent"]) < 4.5:
        NOTES.append("%s: text on accent changed %s -> %s (%.1f:1)" % (label, t["accent_ink"], best, ratio(best, t["accent"])))
        t["accent_ink"] = best
    # cards that sit on the opposite tone of the page (light cards on a dark ground) need their own ink;
    # the direction's cardInk / cardMuted win when they pass on the surface.
    ci, cm = t.get("card_ink"), t.get("card_muted")
    if ratio(t["ink"], t["surface"]) >= 4.5:
        si = t["ink"]
    elif ci and ratio(ci, t["surface"]) >= 4.5:
        si = ci
    else:
        si = max([g, "#000000", "#ffffff"], key=lambda c: ratio(c, t["surface"]))
    t["surface_ink"] = si
    opposite = si != t["ink"]
    toward = -1 if lum(si) < lum(t["surface"]) else +1
    if ratio(t["muted"], t["surface"]) >= 4.5:
        t["surface_muted"] = t["muted"]
    elif cm and ratio(cm, t["surface"]) >= 4.5:
        t["surface_muted"] = cm
    else:
        t["surface_muted"] = reach(mix(t["surface"], si, 0.35), t["surface"], 4.5, toward)
    # accent as TEXT (links, icons) is a separate, darker/lighter step so the fill stays on brand.
    # It must read on the page and on cards of the same tone; opposite-tone cards get surface-accent-text.
    same = [g] if opposite else [g, t["surface"]]
    t["accent_text"] = reach(t["accent"], same, 4.5, d)
    if t["accent_text"] != t["accent"]:
        NOTES.append("%s: accent-text %s derived from accent %s for links" % (label, t["accent_text"], t["accent"]))
    t["focus"] = reach(t["accent"], same, 3.0, d)
    t["surface_accent_text"] = reach(t["accent"], t["surface"], 4.5, toward) if opposite else t["accent_text"]
    t["surface_focus"] = reach(t["accent"], t["surface"], 3.0, toward) if opposite else t["focus"]
    t["cards_opposite"] = opposite
    if opposite:
        NOTES.append("%s: cards are the opposite tone; use surface-ink/surface-muted/surface-accent-text on cards" % label)
    # tints are brand fills; each gets its own readable ink (best of ink, ground, white, black)
    t["tint_inks"] = [t["ink"] if ratio(t["ink"], tn) >= 4.5 else max([g, "#ffffff", "#000000"], key=lambda c: ratio(c, tn)) for tn in t["tints"]]
    t["border"] = mix(g, t["ink"], 0.16)
    t["subtle"] = mix(g, t["surface"], 0.7) if dark else mix(g, t["ink"], 0.04)
    return t


def checks(name, t):
    pairs = [("ink on ground", t["ink"], t["ground"], 4.5), ("ink on surface", t["surface_ink"], t["surface"], 4.5),
             ("muted on ground", t["muted"], t["ground"], 4.5), ("muted on surface", t["surface_muted"], t["surface"], 4.5),
             ("accent-ink on accent", t["accent_ink"], t["accent"], 4.5),
             ("accent-text on ground", t["accent_text"], t["ground"], 4.5),
             ("accent-text on surface", t["surface_accent_text"], t["surface"], 4.5),
             ("focus ring on ground", t["focus"], t["ground"], 3.0),
             ("focus ring on surface", t["surface_focus"], t["surface"], 3.0),
             ("border on ground", t["border"], t["ground"], 1.0)]
    for k in ("ok", "warn", "bad", "info"):
        pairs.append((k + " on ground", t[k], t["ground"], 4.5))
    for i, tn in enumerate(t["tints"]):
        pairs.append(("on-tint-%d on tint-%d" % (i + 1, i + 1), t["tint_inks"][i], tn, 4.5))
    out = []
    for label, fg, bg, need in pairs:
        r = ratio(fg, bg)
        out.append((name, label, r, need, r >= need))
    return out


# ---------- emit ----------
SPACE = "--space-3xs: 2px; --space-2xs: 4px; --space-xs: 8px; --space-sm: 12px; --space-md: 16px; --space-lg: 24px; --space-xl: 40px; --space-2xl: 64px; --space-3xl: 96px;"
DISPLAY_CLAMP = "clamp(2.25rem, 5vw + 1rem, 5.25rem)"   # one source: direction_recipe.py prints this too
SECTION_CLAMP = "clamp(2rem, 2.5vw + 1rem, 3.5rem)"
TEXT = ("--text-xs: 0.8125rem; --text-sm: 0.875rem; --text-md: 1rem; --text-lg: 1.25rem; --text-xl: 1.5625rem; --text-2xl: 1.953rem; --text-3xl: 2.441rem;\n"
        "  --text-display: %s; --text-section: %s;" % (DISPLAY_CLAMP, SECTION_CLAMP))
MOTION = ("--ease-out: cubic-bezier(0.22, 1, 0.36, 1); --ease-in: cubic-bezier(0.64, 0, 0.78, 0); --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);\n"
          "  --dur-fast: 120ms; --dur-base: 240ms; --dur-slow: 600ms;  /* motion.md: micro 100-150, layout 200-300, reveal 500-800 */")


def color_block(t, indent="  ", cards=False):
    """cards: the direction has opposite-tone cards in a theme, so both themes carry the surface-accent-text/surface-focus pair."""
    rows = [("paper", t["ground"]), ("surface", t["surface"]), ("surface-ink", t["surface_ink"]), ("surface-muted", t["surface_muted"]), ("ink", t["ink"]), ("muted", t["muted"]),
            ("rule", t["border"]), ("subtle", t["subtle"]), ("accent", t["accent"]), ("accent-ink", t["accent_ink"]), ("accent-text", t["accent_text"]),
            ("focus", t["focus"]), ("ok", t["ok"]), ("warn", t["warn"]), ("bad", t["bad"]), ("info", t["info"])]
    if cards:
        rows[4:4] = [("surface-accent-text", t["surface_accent_text"]), ("surface-focus", t["surface_focus"])]
    rows += [("tint-%d" % (i + 1), c) for i, c in enumerate(t["tints"])]
    rows += [("on-tint-%d" % (i + 1), c) for i, c in enumerate(t["tint_inks"])]
    return "\n".join("%s--color-%s: %s; /* %s */" % (indent, k, ok_css(v), v) for k, v in rows)


SHAPES = ("soft", "mixed", "sharp")


def shape_radii(d, shape=None):
    """The one radius rule (export_tokens and design_md both use it).

    shape (from --shape or the interview) overrides the direction:
      soft  - a 0px direction becomes 24px cards and pill buttons (round subject / soft brief)
      sharp - 0px cards and square buttons
      mixed / None - the direction's own radius and button shape
    Returns dict(card, input, button (CSS value), btn (pill|round|square), replaced).
    """
    r, btn = int(d["radius"]), d.get("btn", "round")
    replaced = False
    if shape == "soft" and r == 0:
        r, btn, replaced = 24, "pill", True
    elif shape == "sharp" and (r != 0 or btn != "square"):
        r, btn, replaced = 0, "square", True
    inp = max(6, round(r * 0.6))
    button = {"pill": "999px", "round": "%dpx" % inp, "square": "0px"}.get(btn, "%dpx" % r)
    return dict(card=r, input=inp, button=button, btn=btn, replaced=replaced)


def radii(d, shape=None):
    """(card radius px, button radius CSS value); kept for older callers."""
    x = shape_radii(d, shape)
    return x["card"], x["button"]


def emit_css(d, light, dark, dark_is_default, shape=None):
    rx = shape_radii(d, shape)
    r, btn = rx["card"], rx["button"]
    cards = light["cards_opposite"] or dark["cards_opposite"]
    disp, body = d["display"], d["body"]
    fonts = ('--font-display: "%s", "Noto Sans Thai", ui-sans-serif, sans-serif;\n'
             '  --font-body: "%s", "Noto Sans Thai", ui-sans-serif, sans-serif;\n'
             '  --font-mono: "DM Mono", ui-monospace, monospace;') % (disp, body)
    first, second, first_name, second_name = (dark, light, "dark", "light") if dark_is_default else (light, dark, "light", "dark")
    sh = "0 1px 2px rgb(0 0 0 / 0.08), 0 14px 32px -16px rgb(0 0 0 / 0.30)" if d.get("surf") in ("lift", "plastic", "paper") else "none"
    return f"""/* Tokens for direction "{d['id']}" ({d['name']}). Generated by export_tokens.py; edit the source, not this file.
   Fonts: add the Google Fonts links for {disp} and {body}; Thai falls back to Noto Sans Thai. */
:root {{
  color-scheme: {first_name};
{color_block(first, cards=cards)}
  {fonts}
  --display-weight: {d['dw']}; --tracking-display: {d['track']};
  --radius-card: {r}px; --radius-input: {rx['input']}px; --radius-button: {btn}; --radius-pill: 999px;
  --shadow-card: {sh};
  {SPACE}
  {TEXT}
  {MOTION}
  --container: 1280px; --gutter: clamp(20px, 5vw, 64px);
}}
[data-theme="{second_name}"] {{
  color-scheme: {second_name};
{color_block(second, cards=cards)}
}}
@media (prefers-color-scheme: {second_name}) {{
  :root:not([data-theme]) {{
{color_block(second, '    ', cards)}
  }}
}}
@media (prefers-reduced-motion: reduce) {{
  :root {{ --dur-fast: 0.01ms; --dur-base: 0.01ms; --dur-slow: 0.01ms; }}
}}
"""


def emit_tailwind(d, cards=False):
    extra = "  --color-surface-accent-text: var(--color-surface-accent-text);\n  --color-surface-focus: var(--color-surface-focus);\n" if cards else ""
    return f"""/* Tailwind v4 theme for "{d['id']}". Import after tokens.css:  @import "tailwindcss"; @import "./tokens.css"; */
@theme inline {{
  --color-paper: var(--color-paper);
  --color-surface: var(--color-surface);
  --color-surface-ink: var(--color-surface-ink);
  --color-surface-muted: var(--color-surface-muted);
{extra}  --color-ink: var(--color-ink);
  --color-muted: var(--color-muted);
  --color-rule: var(--color-rule);
  --color-subtle: var(--color-subtle);
  --color-accent: var(--color-accent);
  --color-accent-ink: var(--color-accent-ink);
  --color-accent-text: var(--color-accent-text);
  --color-focus: var(--color-focus);
  --color-ok: var(--color-ok);
  --color-warn: var(--color-warn);
  --color-bad: var(--color-bad);
  --color-info: var(--color-info);
  --color-tint-1: var(--color-tint-1);
  --color-tint-2: var(--color-tint-2);
  --color-tint-3: var(--color-tint-3);
  --color-tint-4: var(--color-tint-4);
  --color-on-tint-1: var(--color-on-tint-1);
  --color-on-tint-2: var(--color-on-tint-2);
  --color-on-tint-3: var(--color-on-tint-3);
  --color-on-tint-4: var(--color-on-tint-4);
  --font-display: var(--font-display);
  --font-sans: var(--font-body);
  --font-mono: var(--font-mono);
  --radius-card: var(--radius-card);
  --radius-input: var(--radius-input);
  --radius-button: var(--radius-button);
  --shadow-card: var(--shadow-card);
}}
"""


def shadcn_vars(t):
    chart = [t["accent"]] + [reach(c, t["ground"], 3.0, -1 if ratio(t["ink"], t["ground"]) > 7 and lum(t["ground"]) > 0.5 else +1) for c in t["tints"]]
    destructive = t["bad"]
    m = {"background": t["ground"], "foreground": t["ink"], "card": t["surface"], "card-foreground": t["surface_ink"],
         "popover": t["surface"], "popover-foreground": t["surface_ink"], "primary": t["accent"], "primary-foreground": t["accent_ink"],
         "secondary": t["tints"][0], "secondary-foreground": t["ink"], "muted": t["subtle"], "muted-foreground": t["muted"],
         "accent": t["tints"][0], "accent-foreground": t["ink"], "destructive": destructive,
         "border": t["border"], "input": t["border"], "ring": t["focus"]}
    for i, c in enumerate(chart[:5]):
        m["chart-%d" % (i + 1)] = c
    m.update({"sidebar": t["surface"], "sidebar-foreground": t["ink"], "sidebar-primary": t["accent"],
              "sidebar-primary-foreground": t["accent_ink"], "sidebar-accent": t["subtle"],
              "sidebar-accent-foreground": t["ink"], "sidebar-border": t["border"], "sidebar-ring": t["focus"]})
    return m


def emit_shadcn(d, light, dark, shape=None):
    def block(t):
        return "\n".join("  --%s: %s; /* %s */" % (k, ok_css(v), v) for k, v in shadcn_vars(t).items())
    r, _ = radii(d, shape)
    names = [k for k in shadcn_vars(light)]
    inline = "\n".join("  --color-%s: var(--%s);" % (k, k) for k in names)
    return f"""/* shadcn/ui theme for "{d['id']}". Paste into app/globals.css (or src/index.css) in place of the default :root/.dark blocks. */
:root {{
{block(light)}
  --radius: {r / 16:.3f}rem;
}}
.dark {{
{block(dark)}
}}
@theme inline {{
{inline}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: "{d['body']}", "Noto Sans Thai", ui-sans-serif, sans-serif;
  --font-heading: "{d['display']}", "Noto Sans Thai", ui-sans-serif, sans-serif;
}}
"""


FILES = {"css": "tokens.css", "tailwind": "tailwind-theme.css", "shadcn": "shadcn-globals.css"}
COLOR_KEYS = ("ground", "surface", "ink", "muted", "accent", "accentInk")


def die(msg):
    sys.stderr.write("error: %s\n" % msg)
    sys.exit(2)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        die("%s (run with --help)" % message)


def directions():
    raw = json.load(open(DIRS, encoding="utf-8"))
    return raw if isinstance(raw, list) else raw["directions"]


def check_colors(d, src):
    """Every colour must be hex. #rgba / #rrggbbaa: the alpha is dropped with a warning (tokens are opaque)."""
    def one(key, v):
        if not isinstance(v, str) or not is_hex(v):
            hint = " (oklch()/rgb()/hsl() are not read here: convert to hex first)" if isinstance(v, str) and "(" in v else ""
            die("%s: %s is %r, not a hex colour%s; use #rgb or #rrggbb" % (src, key, v, hint))
        if has_alpha(v):
            print("warning: %s: %s %s has alpha; tokens are opaque, using %s" % (src, key, v, norm_hex(v)), file=sys.stderr)
        return norm_hex(v) if len(v.lstrip("#")) in (4, 8) else (v if v.startswith("#") else "#" + v)
    for k in COLOR_KEYS + ("cardInk", "cardMuted"):
        if d.get(k) is not None:
            d[k] = one(k, d[k])
    d["tints"] = [one("tints[%d]" % i, t) for i, t in enumerate(d["tints"])]
    return d


def load_json(path):
    """A token file with the keys of a directions.json entry. id / name default to the file name; type keys
    (display, body, dw, track, radius, btn) default to a plain sans set."""
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
    except FileNotFoundError:
        die("--json %s: no such file (check the path)" % path)
    except (OSError, UnicodeDecodeError) as e:
        die("--json %s: cannot read (%s)" % (path, e))
    except ValueError as e:
        die("--json %s: not valid JSON (%s)" % (path, e))
    if isinstance(d, dict) and isinstance(d.get("directions"), list) and len(d["directions"]) == 1:
        d = d["directions"][0]
    if not isinstance(d, dict):
        die("--json %s: expected one object with the keys of a directions.json entry" % path)
    missing = [k for k in COLOR_KEYS + ("tints",) if d.get(k) is None]
    if missing:
        die("--json %s: missing %s (a token file needs %s, tints: 4 hex fills)" % (path, ", ".join(missing), ", ".join(COLOR_KEYS)))
    if not isinstance(d["tints"], list) or len(d["tints"]) != 4:
        die("--json %s: tints must be a list of 4 hex colours" % path)
    stem = os.path.splitext(os.path.basename(path))[0]
    d = {k: v for k, v in d.items() if v is not None}  # "display": null means not given: the default applies
    d.setdefault("id", stem)
    d.setdefault("name", d["id"])
    for k, v in (("display", "Inter"), ("body", "Inter"), ("dw", 700), ("track", "-0.02em"), ("radius", 8), ("btn", "round")):
        d.setdefault(k, v)
    try:
        int(d["radius"])
    except (TypeError, ValueError):
        die("--json %s: radius must be a number of px, got %r" % (path, d["radius"]))
    return check_colors(d, "--json " + path)


def parse(argv):
    ap = Parser(prog="export_tokens.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("id", nargs="?", help="direction id (see --list)")
    ap.add_argument("--json", metavar="FILE", help="token file with the keys of a directions.json entry")
    ap.add_argument("--out", metavar="DIR", help="write the files into DIR (default: print to stdout)")
    ap.add_argument("--only", metavar="LIST", help="comma list of css,tailwind,shadcn")
    ap.add_argument("--shape", metavar="SHAPE", help="soft|mixed|sharp")
    ap.add_argument("--list", action="store_true", help="list direction ids")
    ap.add_argument("--print-dark", action="store_true", help="print the derived dark theme as JSON")
    a, extra = ap.parse_known_args(argv)
    if extra:
        die("unexpected argument %r (one direction id; flags: --out, --only, --shape, --json, --list, --print-dark)" % extra[0])
    return a


def load(a):
    if a.list:
        print(", ".join(x["id"] for x in directions()))
        sys.exit(0)
    if a.json:
        if a.id:
            die("give a direction id or --json FILE, not both")
        return load_json(a.json)
    if not a.id:
        die("give a direction id or --json FILE (run with --help)")
    for x in directions():
        if x["id"] == a.id:
            return dict(x)
    die("unknown direction: %s (try --list)" % a.id)


def main(argv=None):
    a = parse(sys.argv[1:] if argv is None else argv)
    if a.shape is not None and a.shape not in SHAPES:
        die("--shape must be one of: %s (got %r)" % (", ".join(SHAPES), a.shape))
    only = None
    if a.only is not None:
        only = [k.strip() for k in a.only.split(",") if k.strip()]
        bad = [k for k in only if k not in FILES]
        if bad or not only:
            die("--only %r: choose from %s, comma-separated" % (a.only, ",".join(FILES)))
    d = load(a)
    out, shape = a.out, a.shape
    dark_is_default = lum(d["ground"]) < 0.2
    if dark_is_default:
        dark_t, light_t = light_theme(d), derive_light_from_dark(d)
    else:
        light_t, dark_t = light_theme(d), derive_dark(d)
    light_t, dark_t = roles(light_t, False, "light"), roles(dark_t, True, "dark")
    if a.print_dark:
        u = dark_t
        print(json.dumps(dict(ground=u["ground"], surface=u["surface"], ink=u["ink"], muted=u["muted"],
                              accent=u["accent"], accentInk=u["accent_ink"], tints=u["tints"], dark=True)))
        return 0
    cards = light_t["cards_opposite"] or dark_t["cards_opposite"]
    files = {"css": (FILES["css"], emit_css(d, light_t, dark_t, dark_is_default, shape)),
             "tailwind": (FILES["tailwind"], emit_tailwind(d, cards)),
             "shadcn": (FILES["shadcn"], emit_shadcn(d, light_t, dark_t, shape))}
    report = sys.stdout
    if out:
        try:
            os.makedirs(out, exist_ok=True)
            for k in only or list(FILES):
                name, body = files[k]
                _net.write_atomic(os.path.join(out, name), body)
                print("wrote", os.path.join(out, name))
        except OSError as e:
            die("cannot write into %s (%s)" % (out, e))
    else:
        report = sys.stderr  # stdout carries the CSS only, so `> tokens.css` stays clean
        if only is None:
            sys.stdout.write(files["css"][1])
            print("(printed tokens.css; nothing written. Pass --out DIR to write %s)" % ", ".join(FILES.values()), file=report)
        else:
            for k in only:
                sys.stdout.write("/* ===== %s ===== */\n%s" % files[k])
            print("(printed %s; nothing written. Pass --out DIR to write files)" % ", ".join(files[k][0] for k in only), file=report)
    fails = 0
    for name, t in (("light", light_t), ("dark", dark_t)):
        for n, label, r, need, passed in checks(name, t):
            if not passed:
                fails += 1
                print("FAIL  %-5s %-26s %.2f:1 need %.1f:1" % (n, label, r, need), file=report)
    for n in NOTES:
        print("note  " + n, file=report)
    print("contrast: %s" % ("all pairs pass" if not fails else "%d pair(s) fail; adjust the direction's colors" % fails), file=report)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
