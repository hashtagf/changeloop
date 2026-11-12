#!/usr/bin/env python3
"""Read an existing (brownfield) codebase and report the design language it actually ships.

Usage:
  python3 code_extract.py SRC [--json]

Scans CSS/SCSS/LESS, Tailwind config, JS/TS/JSX/TSX, Vue, Svelte and HTML under SRC (skips node_modules,
.git, build output). In HTML/Vue/Svelte/Astro only the <style> contents are parsed as CSS, plus local
stylesheets an HTML file links to; light vs dark is decided per rule by its own selector and @media. Reports: stack, CSS custom properties (light and dark blocks), every color literal
with counts and files, font families, font sizes, radii, Tailwind utility usage, and drift (near-duplicate
colors, too many radii/fonts/sizes, hard-coded colors in component files). Maps variables to the DESIGN.md
color roles by name (shadcn, MUI-like and common names), with a frequency fallback marked "guessed".

React Native / Expo (react-native or expo in package.json, or StyleSheet.create) is detected as the stack; its
numeric borderRadius / radius and fontSize values and its theme-object colours (primary: "#ff5a5f") are read.
Language: lang="th" on a page, or mostly Thai text in markup and string literals, marks the project Thai
(design_md.py --from-code then proposes body line-height 1.6; the Thai rule is 1.55-1.7).
On-surface is never guessed from a grey that fails 4.5:1 on canvas: the darkest neutral that passes, or a
default marked derived with the reason.

It reports what the code does; it never decides what it should do. design_md.py --from-code turns the
result into a draft DESIGN.md. Exit 0 ok, 2 SRC missing or not a folder. Standard library only.
"""
import argparse
import colorsys
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import export_tokens as ex  # noqa: E402
from _color import norm_hex  # noqa: E402,F401  (one hex parser for all scripts)

SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".nuxt", ".svelte-kit", "out", "coverage",
             "vendor", ".turbo", ".cache", "storybook-static", ".output", "public", "__pycache__", ".venv", "venv"}
STYLE_EXT = {".css", ".scss", ".sass", ".less", ".pcss"}
CODE_EXT = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte", ".html", ".astro"}
MAX_BYTES = 600_000

HEX_RE = re.compile(r"(?<![\w&])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])")
FN_RE = re.compile(r"\b(rgba?|hsla?|oklch)\(\s*([^()]*?)\s*\)", re.I)
VAR_RE = re.compile(r"(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+?)\s*(?:;|$)", re.M)
FONT_RE = re.compile(r"font-family\s*:\s*([^;}{]+)", re.I)
FSIZE_RE = re.compile(r"font-size\s*:\s*([0-9.]+(?:px|rem|em))", re.I)
RADIUS_RE = re.compile(r"border-radius\s*:\s*([^;}{]+)", re.I)
RN_RADIUS_RE = re.compile(r"\b(?:border(?:Top|Bottom)?(?:Left|Right|Start|End)?Radius|radius|rounded)\s*:\s*['\"]?(\d+(?:\.\d+)?)(px)?['\"]?\s*[,}\n]")
RN_FSIZE_RE = re.compile(r"\bfontSize\s*:\s*['\"]?(\d+(?:\.\d+)?)(px)?['\"]?\s*[,}\n]")
JS_COLOR_RE = re.compile(r"\b([A-Za-z][\w]*)\s*:\s*['\"](#[0-9a-fA-F]{3,8})['\"]")
THAI_RE = re.compile(r"[\u0e01-\u0e3a\u0e40-\u0e5b]")  # Thai letters and marks; not ฿ (U+0E3F)
LATIN_RE = re.compile(r"[A-Za-z]")
LANG_TH = re.compile(r"<html\b[^>]*\blang\s*=\s*['\"]?th\b", re.I)
NEXT_FONT_RE = re.compile(r"import\s*\{([^}]+)\}\s*from\s*['\"]next/font/(?:google|local)['\"]")
TW_CLASS_RE = re.compile(r"(?<![\w-])(rounded(?:-[a-z0-9]+)?|text-(?:xs|sm|base|lg|[2-9]?xl)|font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)"
                         r"|(?:bg|text|border|ring)-(?:[a-z]+-\d{2,3}|\[#[0-9a-fA-F]{3,8}\]))(?![\w-])")

ROLE_NAMES = [  # (role, regex on var name without leading --); first match wins, order matters
    ("on-primary", r"(^|-)(primary|brand|accent)-(foreground|fg|contrast|ink|on)$|^on-(primary|brand|accent)$|^color-on-primary$"),
    ("primary-text", r"(primary|brand|accent)-(text|link)$|^link(-color)?$"),
    ("muted", r"^(muted-foreground|text-(muted|secondary|subtle)|foreground-muted|fg-muted|color-text-secondary|secondary-text|muted)$"),
    ("on-surface", r"^(foreground|fg|text|ink|on-surface|on-background|color-text(-primary)?|text-primary|body-color|text-color)$|^(card|popover)-foreground$"),
    ("canvas", r"^(background|bg|canvas|color-bg|bg-(base|default|app|page)|body-bg|page-bg|color-background|paper|ground)$"),
    ("surface", r"^(card|surface|popover|panel|bg-(surface|elevated|card|subtle)|color-surface)$"),
    ("border", r"^(border|input|divider|stroke|rule|line|hair|hairline|color-border|border-color|outline)$"),
    ("focus", r"^(ring|focus|focus-ring|color-focus|outline-focus)$"),
    ("success", r"(^|-)(success|positive|ok|green)$"),
    ("warning", r"(^|-)(warning|warn|caution|amber|yellow)$"),
    ("error", r"(^|-)(destructive|danger|error|negative|red|bad)$"),
    ("primary", r"^(primary|brand|accent|color-primary|color-brand|primary-color|brand-color|theme-primary)(-500|-600|-default|-main)?$"),
]
DARK_SEL = re.compile(r"\.dark\b|\[data-theme=['\"]?dark|\[data-mode=['\"]?dark|prefers-color-scheme:\s*dark|\.theme-dark", re.I)
NOT_DARK = re.compile(r":not\([^)]*\)", re.I)  # :root:not(.dark) / :not([data-theme=dark]) is a light block
STYLE_TAG = re.compile(r"<style\b[^>]*>([\s\S]*?)</style\s*>", re.I)
LINK_CSS = re.compile(r"<link\b[^>]*>", re.I)
MARKUP_EXT = {".html", ".vue", ".svelte", ".astro"}


def is_dark(selector):
    """Light vs dark is decided per block by its own selector and enclosing @media, not by text around it."""
    return bool(DARK_SEL.search(NOT_DARK.sub("", selector)))


def style_text(text):
    """Only the CSS inside <style> elements of a markup file (HTML head, Vue/Svelte/Astro SFC)."""
    return "\n".join(m.group(1) for m in STYLE_TAG.finditer(text))


def linked_css(text, base_dir):
    """Local stylesheets an HTML file links to (<link rel=stylesheet href=...>), resolved from its folder."""
    out = []
    for tag in LINK_CSS.findall(text):
        if not re.search(r"\brel\s*=\s*['\"]?[^'\">]*stylesheet", tag, re.I):
            continue
        m = re.search(r"\bhref\s*=\s*['\"]?([^'\" >]+)", tag, re.I)
        if not m or re.match(r"^(?:[a-z]+:)?//|^data:", m.group(1), re.I):
            continue
        p = os.path.normpath(os.path.join(base_dir, m.group(1).split("?")[0].split("#")[0]))
        if os.path.isfile(p) and os.path.getsize(p) <= MAX_BYTES:
            out.append(p)
    return out


# ---------- color parsing ----------
def hsl_hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, l / 100, s / 100)
    return "#%02x%02x%02x" % tuple(round(max(0, min(1, x)) * 255) for x in (r, g, b))


def nums(s):
    return [float(x) for x in re.findall(r"-?\d*\.?\d+", s)]


def to_hex(value):
    """Best-effort conversion of a CSS color value to #rrggbb; None if not a plain color."""
    v = value.strip().strip("\"'")
    m = HEX_RE.fullmatch(v) or HEX_RE.match(v)
    if m and m.start() == 0:
        return norm_hex(m.group(0))
    m = FN_RE.match(v)
    if m:
        fn, args = m.group(1).lower(), m.group(2)
        n = nums(args)
        if len(n) < 3:
            return None
        if fn.startswith("rgb"):
            # channels and alpha separately: "rgb(100 50 25 / 50%)" has percent alpha, not percent channels
            ch = [t for t in re.split(r"[\s,]+", args.split("/")[0].strip()) if t][:3]
            if len(ch) < 3 or any(not nums(t) for t in ch):
                return None
            n = [nums(t)[0] * (2.55 if t.endswith("%") else 1) for t in ch]
            return "#%02x%02x%02x" % tuple(round(max(0, min(255, x))) for x in n)
        if fn.startswith("hsl"):
            return hsl_hex(n[0], n[1], n[2])
        if fn == "oklch":
            L = n[0] / 100 if ("%" in args.split()[0] or n[0] > 1) else n[0]
            return ex.from_oklch(L, n[1], n[2])
    # shadcn v1 bare HSL channels: "222.2 47.4% 11.2%"
    m = re.fullmatch(r"(-?\d*\.?\d+)(?:deg)?\s+(\d*\.?\d+)%?\s+(\d*\.?\d+)%?(\s*/\s*[\d.%]+)?", v)
    if m:
        return hsl_hex(float(m.group(1)), float(m.group(2)), float(m.group(3)))
    return None


# "#add" in href="#add", id="#cafe", url(#bad), querySelector("#bad") or a CSS id selector "#cafe {" is a name, not a colour
_NOT_COLOR_BEFORE = re.compile(r"(?:\b(?:href|xlink:href|src|action|to|id|for|name|target|data-target|aria-controls)\s*=\s*[\"']?"
                               r"|\burl\(\s*[\"']?|\b(?:querySelector(?:All)?|getElementById|closest|\$)\(\s*[\"'])$", re.I)


def not_a_color(text, m):
    return bool(_NOT_COLOR_BEFORE.search(text[max(0, m.start() - 40):m.start()])) or bool(re.match(r"\s*\{", text[m.end():m.end() + 20]))


def chroma(h):
    r, g, b = ex.hex_rgb(h)
    return max(r, g, b) - min(r, g, b)


def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(ex.hex_rgb(a), ex.hex_rgb(b))) ** 0.5 * 255


# ---------- scanning ----------
def walk(src):
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in STYLE_EXT or ext in CODE_EXT or re.match(r"tailwind\.config\.", f):
                p = os.path.join(root, f)
                try:
                    if os.path.getsize(p) <= MAX_BYTES and not f.endswith((".min.js", ".min.css", ".d.ts")):
                        yield p, ext
                except OSError:
                    pass


def css_blocks(text):
    """Yield (selector, body) for each innermost-ish rule; good enough for :root / .dark variable blocks."""
    stack, sel_start = [], 0
    i = 0
    while i < len(text):
        c = text[i]
        if c == "{":
            sel = text[sel_start:i].strip().split("}")[-1].strip()
            stack.append((sel, i + 1))
            sel_start = i + 1
        elif c == "}":
            if stack:
                sel, start = stack.pop()
                parents = " ".join(s for s, _ in stack)
                yield (parents + " " + sel).strip(), text[start:i]
            sel_start = i + 1
        elif c == ";" and stack:
            sel_start = i + 1
        i += 1


def strip_comments(text, ext):
    text = re.sub(r"/\*[\s\S]*?\*/", "", text)
    if ext in CODE_EXT or ext in (".scss", ".sass", ".less"):
        text = re.sub(r"(?<![:\"'])//[^\n]*", "", text)
    return text


def package_jsons(src):
    """Root package.json first, then workspace packages (apps/*, packages/*, two levels deep)."""
    found = []
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        if os.path.relpath(root, src).count(os.sep) >= 2:
            dirs[:] = []
        if "package.json" in files:
            found.append(os.path.join(root, "package.json"))
    return found


def detect_stack(src):
    out = []
    for pj in package_jsons(src):
        try:
            p = json.load(open(pj))
            p = p if isinstance(p, dict) else {}  # a package.json that is [] or has "dependencies": null counts as empty
            deps = {}
            for k in ("dependencies", "devDependencies"):
                deps.update({n: str(v) for n, v in (p.get(k) or {}).items()} if isinstance(p.get(k), dict) else {})
            for key, label in [("expo", "Expo"), ("react-native", "React Native"), ("next", "Next.js"), ("nuxt", "Nuxt"), ("react", "React"), ("vue", "Vue"), ("svelte", "Svelte"),
                               ("@angular/core", "Angular"), ("astro", "Astro"), ("tailwindcss", "Tailwind"),
                               ("@mui/material", "MUI"), ("@chakra-ui/react", "Chakra"), ("antd", "Ant Design"),
                               ("@radix-ui/react-slot", "Radix"), ("styled-components", "styled-components"),
                               ("@emotion/react", "Emotion"), ("bootstrap", "Bootstrap"), ("@mantine/core", "Mantine")]:
                if key in deps and not any(o.startswith(label + " ") for o in out):
                    out.append("%s %s" % (label, deps[key]))
        except (ValueError, OSError):
            pass
    if any(os.path.exists(os.path.join(os.path.dirname(pj), "components.json")) for pj in package_jsons(src)):
        out.append("shadcn/ui (components.json)")
    # list real names (a case-insensitive filesystem reports DESIGN.md and design.md for one file)
    for folder, pre in ((src, ""), (os.path.join(src, "docs"), "docs/")):
        try:
            names = sorted(os.listdir(folder))
        except OSError:
            continue
        for n in names:
            if n.lower() == "design.md" and os.path.isfile(os.path.join(folder, n)) and (pre == "" or n == "DESIGN.md"):
                out.append("existing %s%s" % (pre, n))
    return out


def role_for(name):
    n = name.lstrip("-").lower()
    n = re.sub(r"^(color|clr|c|theme|ds|app|ui)-", "", n) if not re.match(r"^color-(text|bg|background|surface|border|focus|on-primary|primary|brand)", n) else n
    for role, pat in ROLE_NAMES:
        if re.search(pat, n):
            return role
    return None


def scan(src):
    src = os.path.abspath(src)
    colors = Counter()
    color_files = defaultdict(set)
    hard_in_components = Counter()
    vars_light, vars_dark, var_raw = {}, {}, {}
    fonts, fsizes, radii, tw = Counter(), Counter(), Counter(), Counter()
    rn_radii, rn_sizes, js_colors = Counter(), Counter(), {}
    thai_chars, latin_chars, lang_th, stylesheet_create = 0, 0, [], False
    files_scanned = 0
    queue = list(walk(src))
    seen = {os.path.abspath(p) for p, _ in queue}
    while queue:
        path, ext = queue.pop(0)
        try:
            raw = open(path, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        text = strip_comments(raw, ext)
        if ext == ".html":  # linked local CSS outside the walked folders (public/, static/) still counts
            for css in linked_css(raw, os.path.dirname(path)):
                if os.path.abspath(css) not in seen:
                    seen.add(os.path.abspath(css))
                    queue.append((css, os.path.splitext(css)[1].lower()))
        files_scanned += 1
        rel = os.path.relpath(path, src)
        is_style = ext in STYLE_EXT
        # color literals
        found = [norm_hex(m.group(0)) for m in HEX_RE.finditer(text) if not not_a_color(text, m)]
        for m in FN_RE.finditer(text):
            h = to_hex(m.group(0))
            if h:
                found.append(h)
        for h in found:
            colors[h] += 1
            color_files[h].add(rel)
        if not is_style and "tailwind.config" not in rel and found:
            hard_in_components[rel] += len(found)
        # custom properties with their block (light vs dark)
        if is_style or ext in MARKUP_EXT:
            # markup: feed only the <style> contents to the CSS parser, so the <head> text before the first
            # rule (meta tags, inline scripts) never becomes part of a selector
            css = text if is_style else style_text(text)
            for sel, body in css_blocks(css):
                for m in VAR_RE.finditer(body):
                    name, val = m.group(1), m.group(2).strip()
                    if "{" in val:
                        continue
                    target = vars_dark if is_dark(sel) else vars_light
                    target.setdefault(name, Counter())[val] += 1
                    var_raw.setdefault(name, val)
            for m in FONT_RE.finditer(text):
                fonts[m.group(1).strip().split(",")[0].strip().strip("\"'")] += 1
            for m in FSIZE_RE.finditer(text):
                fsizes[m.group(1)] += 1
            for m in RADIUS_RE.finditer(text):
                radii[m.group(1).strip()] += 1
        if ext in MARKUP_EXT or ext in CODE_EXT:
            if ext == ".html" and LANG_TH.search(raw):
                lang_th.append(rel)
            # words people read: text between tags, readable attributes and string literals
            visible = re.sub(r"<(script|style)\b[\s\S]*?</\1\s*>", " ", raw, flags=re.I) if ext in MARKUP_EXT else ""
            words = re.findall(r">([^<>]+)<", visible) + re.findall(r"\b(?:placeholder|title|alt|aria-label|label)\s*=\s*['\"]([^'\"]*)", raw)
            if ext in CODE_EXT and ext not in MARKUP_EXT:
                words += [w for w in re.findall(r"['\"`]([^'\"`\n]{2,})['\"`]", text) if not re.match(r"^[\w./@:-]+$", w)]
                words += re.findall(r">([^<>{}]+)<", text)
            for w in words:
                thai_chars += len(THAI_RE.findall(w))
                latin_chars += len(LATIN_RE.findall(w))
        if ext in CODE_EXT and ext not in MARKUP_EXT or ext == ".ts":
            if "StyleSheet.create" in text:
                stylesheet_create = True
            for m in RN_RADIUS_RE.finditer(text):
                rn_radii[m.group(1)] += 1
            for m in RN_FSIZE_RE.finditer(text):
                rn_sizes[m.group(1)] += 1
            for m in JS_COLOR_RE.finditer(text):
                js_colors.setdefault(m.group(1), Counter())[norm_hex(m.group(2))] += 1
        if ext in CODE_EXT:
            for m in NEXT_FONT_RE.finditer(text):
                for f in m.group(1).split(","):
                    f = f.strip().split(" as ")[0].strip()
                    if f:
                        fonts[f.replace("_", " ") + " (next/font)"] += 1
            for m in TW_CLASS_RE.finditer(text):
                tw[m.group(1)] += 1
            for m in re.finditer(r"fontFamily\s*:\s*\[?\s*['\"]([^'\"]+)['\"]", text):
                fonts[m.group(1)] += 1
            if not RN_RADIUS_RE.search(text):  # web CSS-in-JS: borderRadius: '8px' / '0.5rem'
                for m in re.finditer(r"borderRadius\s*:\s*['\"]([0-9.]+(?:px|rem))", text):
                    radii[m.group(1)] += 1
    stack = detect_stack(src)
    native = any(x.startswith(("React Native", "Expo")) for x in stack)
    if stylesheet_create and not native:
        stack.insert(0, "React Native (StyleSheet.create)")
        native = True
    if native:  # unitless numbers are dp in React Native
        for k, n in rn_radii.items():
            radii[k + "px"] += n
        for k, n in rn_sizes.items():
            fsizes[k + "px"] += n
    thai = bool(lang_th) or (thai_chars >= 20 and thai_chars >= latin_chars)
    lang = {"thai": thai, "evidence": ('lang="th" in %s' % ", ".join(lang_th[:3]) if lang_th else
                                       "%d Thai vs %d Latin letters in page text" % (thai_chars, latin_chars))}
    if not any("tailwind" in s.lower() for s in stack):
        tw = Counter()  # utility-like names (rounded-circle, text-sm) also exist in Bootstrap and others; count only in Tailwind projects
    return {"src": src, "files": files_scanned, "stack": stack, "colors": colors,
            "color_files": color_files, "hard_in_components": hard_in_components, "vars_light": vars_light,
            "vars_dark": vars_dark, "var_raw": var_raw, "fonts": fonts, "font_sizes": fsizes, "radii": radii, "tailwind": tw,
            "js_colors": js_colors if native else {}, "native": native, "language": lang}


def resolve_var(val, table, depth=0):
    m = re.fullmatch(r"(?:hsl|oklch|rgb)?\(?\s*var\((--[\w-]+)(?:,[^)]*)?\)\s*\)?", val.strip())
    if m and depth < 6:
        nxt = table.get(m.group(1))
        return resolve_var(nxt, table, depth + 1) if nxt else None
    return to_hex(val)


def top(c):
    return c.most_common(1)[0][0] if c else None


def map_roles(vars_, fallback_table=None):
    table = {k: top(v) for k, v in (fallback_table or {}).items()}
    table.update({k: top(v) for k, v in vars_.items()})
    roles, evidence = {}, {}
    # "accent" is a hover tint in shadcn and a brand color elsewhere: let primary/brand names win first
    for name, vals in sorted(vars_.items(), key=lambda kv: "accent" in kv[0]):
        r = role_for(name)
        if not r or r in roles:
            continue
        for val, n in vals.most_common():
            h = resolve_var(val, table)
            if h:
                more = " (+%d other value%s in code)" % (len(vals) - 1, "s" if len(vals) > 2 else "") if len(vals) > 1 else ""
                roles[r], evidence[r] = h, "%s: %s%s" % (name, val, more)
                break
    return roles, evidence


def guess_roles(colors, roles, evidence):
    """Fill missing core roles from frequency. Marked 'guessed'."""
    ranked = [h for h, _ in colors.most_common(40)]
    if not ranked:
        return
    neutrals = [h for h in ranked if chroma(h) < 0.08]
    vivid = [h for h in ranked if chroma(h) >= 0.2]
    def put(role, h, why):
        if role not in roles and h:
            roles[role], evidence[role] = h, "guessed: " + why
    if neutrals:
        put("canvas", max(neutrals[:8], key=ex.lum), "lightest frequent neutral")
        canvas = roles.get("canvas")
        # text must read: the darkest frequent colour that reaches 4.5:1 on canvas, never a failing grey
        ok = [h for h in neutrals[:12] if ex.ratio(h, canvas) >= 4.5] or [h for h in ranked if ex.ratio(h, canvas) >= 4.5]
        if ok:
            put("on-surface", max(ok, key=lambda h: ex.ratio(h, canvas)), "darkest frequent colour that reaches 4.5:1 on canvas")
        elif "on-surface" not in roles:
            dk = min(neutrals[:8], key=ex.lum)
            evidence["on-surface:note"] = "no text colour in code reaches 4.5:1 on canvas %s (darkest neutral %s is %.1f:1)" % (
                canvas, dk, ex.ratio(dk, canvas))
    if vivid:
        put("primary", vivid[0], "most used saturated color")
    canvas = roles.get("canvas")
    ink = roles.get("on-surface") or (canvas and ("#111111" if ex.lum(canvas) > 0.4 else "#f5f5f5"))
    if canvas and ink:
        rest = [h for h in neutrals if h not in (canvas, ink)]
        border = [h for h in rest if 1.1 <= ex.ratio(h, canvas) < 3 and ex.lum(h) <= ex.lum(canvas)]
        muted = [h for h in rest if 4.5 <= ex.ratio(h, canvas) and ex.ratio(h, ink) >= 1.5]
        put("border", border[0] if border else None, "frequent neutral close to canvas")
        put("muted", muted[0] if muted else None, "frequent mid neutral that reaches 4.5:1 on canvas")
    put("surface", roles.get("canvas"), "same as canvas")


def complete(roles, evidence):
    """Derive what a DESIGN.md needs but the code did not state; mark each 'derived'."""
    def put(role, h, why):
        if role not in roles and h:
            roles[role], evidence[role] = h, "derived: " + why
    canvas = roles.get("canvas", "#ffffff")
    ink = roles.get("on-surface", "#111111" if ex.lum(canvas) > 0.4 else "#f5f5f5")
    put("canvas", canvas, "default")
    put("on-surface", ink, "default" + ("; " + evidence.pop("on-surface:note") if "on-surface:note" in evidence else ""))
    evidence.pop("on-surface:note", None)
    put("surface", canvas, "same as canvas")
    if "primary" not in roles:
        put("primary", ink, "no brand color found; using text color")
    p = roles["primary"]
    put("on-primary", "#ffffff" if ex.ratio("#ffffff", p) >= ex.ratio("#000000", p) else "#000000", "best contrast on primary")
    put("primary-text", p if ex.ratio(p, canvas) >= 4.5 else ink, "primary if it reaches 4.5:1 on canvas, else text color")
    put("muted", ink, "no muted text color found; using text color")
    put("border", ex.mix(canvas, ink, 0.16), "no border color found; a 16% tint of on-surface over canvas")
    put("focus", p, "primary")
    put("success", "#15803d", "default (not in code)")
    put("warning", "#b45309", "default (not in code)")
    put("error", "#b91c1c", "default (not in code)")


def drift(res):
    out = []
    top = [h for h, _ in res["colors"].most_common(60)]
    pairs = []
    for i, a in enumerate(top):
        for b in top[i + 1:]:
            if 0 < dist(a, b) < 10:
                pairs.append((a, b))
    if pairs:
        out.append("near-duplicate colors (merge candidates): " + ", ".join("%s≈%s" % p for p in pairs[:8]))
    if len(res["colors"]) > 40:
        out.append("%d distinct color literals; a token set usually needs 15-30" % len(res["colors"]))
    if len(res["radii"]) > 5:
        out.append("%d distinct border-radius values: %s" % (len(res["radii"]), ", ".join(k for k, _ in res["radii"].most_common(8))))
    fams = {f.split(" (")[0] for f in res["fonts"] if not re.match(r"(inherit|initial|var\(|system-ui|-apple|sans-serif|serif|monospace)", f)}
    if len(fams) > 3:
        out.append("%d font families in use: %s" % (len(fams), ", ".join(sorted(fams)[:6])))
    if len(res["font_sizes"]) > 10:
        out.append("%d distinct font-size values outside a scale" % len(res["font_sizes"]))
    hc = res["hard_in_components"]
    if hc:
        tot = sum(hc.values())
        out.append("%d hard-coded color literals in %d component/script files (top: %s)" % (
            tot, len(hc), ", ".join("%s ×%d" % kv for kv in hc.most_common(3))))
    arb = [k for k in res["tailwind"] if "[#" in k]
    if arb:
        out.append("%d Tailwind arbitrary color classes (e.g. %s)" % (len(arb), ", ".join(arb[:3])))
    conflicts = [n for n, c in res["vars_light"].items() if len(c) > 1 and role_for(n)]
    if conflicts:
        out.append("%d color variables defined with different values in different files (%s); "
                   "if this is a monorepo, run once per app" % (len(conflicts), ", ".join(sorted(conflicts)[:5])))
    if not res["vars_dark"]:
        out.append("no dark theme variables found")
    return out


def extract(src):
    res = scan(src)
    light, light_ev = map_roles(res["vars_light"])
    if res.get("js_colors"):  # React Native theme objects: {primary: "#ff5a5f", bg: "#fff", text: "#222"}
        js, js_ev = map_roles({"--" + k: v for k, v in res["js_colors"].items()})
        for r, h in js.items():
            if r not in light:
                light[r], light_ev[r] = h, "theme object " + js_ev[r].lstrip("-")
    dark, dark_ev = map_roles(res["vars_dark"], res["vars_light"])
    guess_roles(res["colors"], light, light_ev)
    found_roles = sorted(light)
    complete(light, light_ev)
    if dark:
        for r in ("canvas", "on-surface", "primary"):
            dark.setdefault(r, light[r])
        complete(dark, dark_ev)
    res.update(light=light, light_evidence=light_ev, dark=dark, dark_evidence=dark_ev, found_roles=found_roles,
               drift=drift(res))
    return res


def report(res):
    def kv(c, n=10):
        return ", ".join("%s ×%d" % x for x in c.most_common(n)) or "none"
    lines = ["Scanned %d files under %s" % (res["files"], res["src"]),
             "Stack: " + (", ".join(res["stack"]) or "unknown"),
             "Language: " + ("Thai (%s); body line-height 1.6 (Thai rule 1.55-1.7)" % res["language"]["evidence"]
                             if res.get("language", {}).get("thai") else "not Thai-led (%s)" % res.get("language", {}).get("evidence", "n/a")),
             "Custom properties: %d light, %d dark" % (len(res["vars_light"]), len(res["vars_dark"])),
             "Colors (top): " + kv(res["colors"], 12),
             "Fonts: " + kv(res["fonts"], 6), "Font sizes: " + kv(res["font_sizes"], 8),
             "Radii: " + kv(res["radii"], 8), "Tailwind (top): " + kv(res["tailwind"], 12), "", "Color roles (light):"]
    lines += ["  %-13s %s  <- %s" % (r, h, res["light_evidence"].get(r, "derived")) for r, h in res["light"].items()]
    if res["dark"]:
        lines += ["Color roles (dark):"] + ["  %-13s %s  <- %s" % (r, h, res["dark_evidence"].get(r, "derived")) for r, h in res["dark"].items()]
    lines += ["", "Drift:"] + ["  - " + d for d in res["drift"] or ["none found"]]
    return "\n".join(lines)


def to_json(res):
    out = {}
    for k, v in res.items():
        if isinstance(v, Counter):
            out[k] = dict(v.most_common(50))
        elif k == "color_files":
            out[k] = {h: sorted(fs)[:5] for h, fs in v.items() if h in dict(res["colors"].most_common(50))}
        else:
            out[k] = v
    return out


class Parser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write("error: %s (run with --help)\n" % message)
        sys.exit(2)


def main(argv):
    ap = Parser(prog="code_extract.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", help="folder of the codebase")
    ap.add_argument("--json", action="store_true", help="print JSON instead of the report")
    a = ap.parse_args(argv)
    if not os.path.isdir(a.src):
        sys.stderr.write("error: %s is not a folder (pass the codebase root, e.g. code_extract.py ./my-app)\n" % a.src)
        return 2
    res = extract(a.src)
    print(json.dumps(to_json(res), ensure_ascii=False, indent=2) if a.json else report(res))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
