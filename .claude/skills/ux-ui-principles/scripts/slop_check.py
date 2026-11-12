#!/usr/bin/env python3
"""Flag template-look ("AI slop") patterns in an HTML page and its local CSS.

Usage:
  python3 slop_check.py page.html [more.html ...] [--json]

Reads inline <style>, style="" attributes and local <link rel=stylesheet> files.
Each rule is a deterministic heuristic. A hit means "look at this in the render",
not "this is wrong": a device is fine when the brief asks for it or you can
defend it in one sentence (references/design-quality.md §2).

Levels: flag (likely default/defect) and note (worth a look).
--json prints {file: [{"level","rule","message","examples"}]}.
Exit: 0 no flag (notes only), 1 any flag found, 2 usage or input error (missing file). Writes nothing.
Standard library only.
"""
import argparse
import json
import os
import re
import sys
from collections import Counter
from html.parser import HTMLParser

HEADINGS = {"h1", "h2", "h3"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}
FILLER = ["supercharge", "unlock", "all-in-one", "seamless", "revolutioniz",
          "next-generation", "next-gen", "empower", "elevate your", "game-chang",
          "cutting-edge", "unleash", "effortless", "transform your", "lorem ipsum",
          "your workflow", "the future of"]
WEAK_CTA = {"submit", "click here", "learn more", "get started", "read more", "ok"}


class Node:
    __slots__ = ("tag", "attrs", "children", "text", "parent")

    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent = tag, attrs, parent
        self.children, self.text = [], []

    def cls(self):
        return set((self.attrs.get("class") or "").split())

    def all_text(self):
        return " ".join(t for n in self.walk() for t in n.text if t).strip()

    def walk(self):
        """Pre-order, iterative: deep unclosed nesting (1000s of <li>/<p>) must not hit the recursion limit."""
        stack = [self]
        while stack:
            n = stack.pop()
            yield n
            stack.extend(reversed(n.children))


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", {}, None)
        self.cur: Node = self.root
        self.styles, self.links, self.scripts = [], [], []
        self._in = None

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        n = Node(tag, a, self.cur)
        self.cur.children.append(n)
        if tag == "link" and "stylesheet" in a.get("rel", ""):
            self.links.append(a.get("href", ""))
        if a.get("style"):
            self.styles.append("x{" + a["style"] + "}")
        if tag in ("style", "script"):
            self._in = tag
        if tag not in VOID:
            self.cur = n

    def handle_endtag(self, tag):
        self._in = None
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent or self.root
        if n is not self.root:
            self.cur = n.parent or self.root

    def handle_data(self, data):
        if self._in == "style":
            self.styles.append(data)
        elif self._in == "script":
            self.scripts.append(data)
        elif data.strip():
            self.cur.text.append(data.strip())


def css_rules(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        yield m.group(1).strip(), m.group(2)


def sharp_intent(t, html, base):
    """True when the page or its DESIGN.md says the direction is sharp/print on purpose."""
    for n in t.root.walk():
        if n.tag in ("html", "body") and n.attrs.get("data-shape", "").lower() in ("sharp", "square", "print"):
            return True
    if re.search(r"<meta[^>]+name=[\"']shape[\"'][^>]+content=[\"'](sharp|square|print)", html, re.I):
        return True
    for d in (base, os.path.dirname(base)):
        p = os.path.join(d, "DESIGN.md")
        if os.path.isfile(p):
            with open(p, encoding="utf-8", errors="replace") as f:
                m = re.search(r"^## Shapes\s*\n(.*?)(?=^## |\Z)", f.read(), re.S | re.M)
            if m and re.search(r"\b(sharp|square)\b", m.group(1), re.I) and not re.search(r"\bno square\b|square corners anywhere", m.group(1), re.I):
                return True
            break
    return False


def check(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        html = f.read()
    t = Tree()
    t.feed(html)
    css = "\n".join(t.styles)
    base = os.path.dirname(os.path.abspath(path))
    for href in t.links:
        p = os.path.join(base, href.split("?")[0])
        if href and not re.match(r"^[a-z]+:", href) and os.path.isfile(p):
            with open(p, encoding="utf-8", errors="replace") as f:
                css += "\n" + f.read()
    js = "\n".join(t.scripts)
    rules = list(css_rules(css))
    nodes = list(t.root.walk())
    out = []

    def add(level, rule, msg, examples=()):
        out.append({"level": level, "rule": rule, "message": msg,
                    "examples": [e[:80] for e in list(examples)[:3]]})

    # Classes that render uppercase small labels
    upper = set()
    for sel, body in rules:
        if re.search(r"text-transform\s*:\s*uppercase", body):
            upper |= set(re.findall(r"\.([\w-]+)", sel))
    eyebrow = re.compile(r"eyebrow|kicker|overline|pretitle|tagline|label")
    hits = []
    for n in nodes:
        sibs = n.children
        for i, c in enumerate(sibs):
            if c.tag in HEADINGS and i > 0:
                prev = sibs[i - 1]
                if prev.cls() & upper or any(eyebrow.search(k) for k in prev.cls()):
                    hits.append(prev.all_text())
    if len(hits) == 1:
        add("note", "eyebrow-label", "one small/uppercase label above a heading; check it carries information the heading lacks", hits)
    if len(hits) >= 2:
        add("flag", "eyebrow-labels", f"{len(hits)} small/uppercase labels above headings; put the information in the heading", hits)

    # Language variants (<span lang="th">…</span><span lang="en">…</span>) are one headline in
    # two languages, not a styled word; nested non-lang spans inside a variant still count.
    def is_placeholder(c):
        return "ph" in c.cls() or "data-placeholder" in c.attrs

    def styled_child(h):
        kids = [c for c in h.children if not (c.tag == "span" and "lang" in c.attrs)]
        kids += [g for c in h.children if c.tag == "span" and "lang" in c.attrs for g in c.children]
        return any(c.tag in ("span", "em", "i", "mark", "strong", "b") and "lang" not in c.attrs
                   and "nb" not in c.cls() and not is_placeholder(c) for c in kids)
    accent = [n.all_text() for n in nodes if n.tag in ("h1", "h2") and styled_child(n)]
    if accent:
        # Roman + italic emphasis (em/i, at most one headline per page) is a recipe device, not slop: note, not flag.
        def italic_only(n):
            return all(c.tag in ("em", "i") for c in n.children if c.tag in ("span", "em", "i", "mark", "strong", "b") and "lang" not in c.attrs and not is_placeholder(c))
        hs = [n for n in nodes if n.tag in ("h1", "h2") and styled_child(n)]
        if len(hs) <= 1 and all(italic_only(n) for n in hs):
            add("note", "italic-emphasis", "one headline uses italic emphasis (allowed by the recipes once per page; waive in the context card)", accent)
        else:
            add("flag", "accent-word-headline", f"{len(accent)} headline(s) style one word differently", accent)

    if re.search(r"(-webkit-)?background-clip\s*:\s*text", css):
        add("flag", "gradient-text", "gradient-filled text")

    idx = [n.all_text() for n in nodes if re.fullmatch(r"0[1-9]\.?", n.all_text() or "")]
    if len(idx) >= 3:
        add("note", "index-numbering", f"{len(idx)} '01/02/03' markers; keep only for real sequences", idx)

    # Rows of identical cards (3-12 siblings, same tag+class, each with a heading and an icon).
    # An icon is an <svg>, an empty <i>, an icon-class element, or an <img> drawn at <= 64px (width/height
    # attributes, inline style or a CSS rule naming its class); photos (a team grid) and a glyph standing in
    # a photo placeholder ([รูป…] / .ph next to it) are not icons.
    small_img_sel = [sel for sel, body in rules
                     if any(float(v) <= 64 for v in re.findall(r"(?<![-\w])(?:max-)?(?:width|height|inline-size|block-size)\s*:\s*([\d.]+)px", body))]

    def px(v):
        m = re.fullmatch(r"\s*([\d.]+)\s*(px)?\s*", v or "")
        return float(m.group(1)) if m else None

    def icon_class(d):
        return any("icon" in k or k in ("ic", "fa", "fas", "far", "fab") or k.startswith(("fa-", "bi-", "ti-", "ri-", "lucide", "material-symbols", "material-icons"))
                   for k in d.cls())

    def small_img(d):
        sizes = [px(d.attrs.get(a)) for a in ("width", "height")]
        sizes += [float(v) for v in re.findall(r"(?:^|;)\s*(?:max-)?(?:width|height)\s*:\s*([\d.]+)px", d.attrs.get("style", ""))]
        if any(v is not None for v in sizes):
            return all(v <= 64 for v in sizes if v is not None)
        anc = set()
        for a in (d.parent, d.parent.parent if d.parent else None):
            if a is not None:
                anc |= a.cls()
        for sel in small_img_sel:
            for part in sel.split(","):
                last = re.split(r"[\s>+~]+", part.strip())[-1]
                classes = set(re.findall(r"\.([\w-]+)", last))
                if classes & d.cls() or (re.match(r"img\b", last) and set(re.findall(r"\.([\w-]+)", part)) & anc):
                    return True
        return False

    def in_photo_slot(d):
        p = d.parent
        return p is not None and any(c is not d and ("ph" in c.cls() or "data-placeholder" in c.attrs) for c in p.children)

    def is_icon(d):
        if d.tag == "img":
            return icon_class(d) or small_img(d)
        if d.tag == "svg" or (d.tag == "i" and not d.all_text()) or icon_class(d):
            return not in_photo_slot(d)
        return False

    rows = []
    for n in nodes:
        if n.tag in ("table", "tbody", "thead", "tr", "select"):
            continue
        sig = Counter((c.tag, c.attrs.get("class", "")) for c in n.children
                      if c.tag in ("div", "li", "article", "a"))
        for (tag, k), cnt in sig.items():
            if not 3 <= cnt <= 12:
                continue
            group = [c for c in n.children if c.tag == tag and c.attrs.get("class", "") == k]
            iconed = sum(1 for g in group
                         if any(d.tag in HEADINGS | {"h4"} for d in g.walk())
                         and any(d is not g and is_icon(d) for d in g.walk()))
            if iconed >= 3:
                rows.append(f"{tag}.{k or '-'} x{iconed}: " + " / ".join(g.all_text()[:20] for g in group[:3]))
    if rows:
        add("flag", "icon-card-row", f"{len(rows)} row(s) of identical icon+heading cards; vary the composition", rows)

    radii = [m for m in re.findall(r"border-radius\s*:\s*([^;}]+)", css) if not re.fullmatch(r"\s*0(px)?\s*", m)]
    rounded = [m for m in radii if not re.fullmatch(r"\s*(50%|999\w*|9999\w*)\s*", m)]
    if len(css) > 800 and not rounded and not sharp_intent(t, html, base):
        add("flag", "all-square", "no rounded corners anywhere: check shape against what the subject sells (design-quality §1 subject shapes); waive with data-shape=\"sharp\" when the direction is print")
    if re.search(r"\.js\s+[^{]*\{[^}]*opacity\s*:\s*0", css) and "prefers-reduced-motion" not in css:
        add("flag", "reveal-hides-content", "content is hidden until scripted reveal and no reduced-motion fallback; plain screenshots and print show blanks (motion.md)")

    tw_arb = re.findall(r"\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|shadow)-\[(?:#|rgb|hsl|oklch)[^\]]*\]", html)
    if tw_arb:
        add("note", "tailwind-arbitrary-color", f"{len(tw_arb)} Tailwind arbitrary color classes; use theme tokens (tailwind.md)", sorted(set(tw_arb))[:5])
    grads = len(re.findall(r"(linear|radial|conic)-gradient\(", css))
    if grads > 3:
        add("note", "decorative-gradients", f"{grads} gradients; keep them for one deliberate use")
    blur = len(re.findall(r"backdrop-filter\s*:", css))
    if blur > 2:
        add("note", "glass-overuse", f"backdrop-filter used {blur} times; glass is an accent, check text contrast over it")
    glows = [b for _, b in rules for m in re.finditer(r"box-shadow\s*:\s*([^;]+)", b)
             if re.search(r"\b0(px)?\s+0(px)?\s+([2-9]\d|\d{3,})px", m.group(1))]
    if glows:
        add("note", "glow-shadows", f"{len(glows)} glow shadows (0 0 ≥20px)")

    fams = Counter()
    for sel, b in rules:
        if re.search(r":lang\(|\[lang|\.lang-|\[data-lang", sel or ""):
            continue  # per-language families (Thai pair) are counted by the base rule, not again
        for m in re.finditer(r"font-family\s*:\s*([^;]+)", b):
            first = m.group(1).split(",")[0].strip().strip("'\"").lower()
            if not first.startswith("var(") and "mono" not in first and first not in ("inherit", "sans-serif", "serif", "system-ui"):
                fams[first] += 1
    if len(fams) > 2:
        add("flag", "too-many-typefaces", f"{len(fams)} typefaces; one, two at most (mono not counted)", fams.keys())
    mono_sel = [s for s, b in rules if re.search(r"font-family\s*:[^;]*mono", b, re.I)
                and not re.search(r"\b(code|pre|kbd|samp)\b", s)]
    if mono_sel:
        add("note", "mono-outside-code", "monospace set on non-code selectors", mono_sel)

    radii = Counter(m.group(1).strip() for _, b in rules
                    for m in re.finditer(r"border-radius\s*:\s*([^;]+)", b)
                    if "var(" not in m.group(1))
    if len(radii) > 4:
        add("flag", "inconsistent-radii", f"{len(radii)} distinct raw border-radius values; use radius tokens", radii.keys())

    raw_hex = sum(len(re.findall(r"#[0-9a-fA-F]{3,8}\b", re.sub(r"--[\w-]+\s*:[^;]+;?", "", b))) for _, b in rules)
    if raw_hex > 12:
        add("note", "hardcoded-colors", f"{raw_hex} raw hex colors outside custom properties; reference tokens")

    # Palette: saturated hues in UI chrome, pure black
    import colorsys
    hues = set()
    for h in re.findall(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", css):
        h = "".join(c * 2 for c in h) if len(h) == 3 else h
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
        if ss > 0.45 and 0.25 < ll < 0.8:
            hues.add(int(hh * 360) // 30)
    if len(hues) > 2:
        add("note", "many-saturated-hues", f"{len(hues)} saturated hue families in CSS; UI chrome usually needs ≤ 2 (color-palette.md)")
    if re.search(r"(?<![\w-])(background(-color)?|color)\s*:\s*(#000\b|#000000\b|black\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))", css):
        add("note", "pure-black", "pure black used for text or ground; use a tinted ink / near-black")
    sections = len([n for n in nodes if n.tag == "section"])
    if sections >= 3 and not re.search(r"(@keyframes|animation\s*:|transition\s*:|animate\(|IntersectionObserver)", css + js):
        add("note", "no-motion", f"{sections} sections and no transition/animation at all; public pages need the motion baseline (motion.md §1)")

    if re.search(r"(?<![\w-])outline\s*:\s*(none|0(?:\.0*)?(?:px|em|rem)?)\s*(?:!important\s*)?(?:[;}]|$)", css) and ":focus-visible" not in css:
        add("flag", "focus-removed", "outline removed with no :focus-visible replacement")
    if re.search(r"(@keyframes|animation\s*:|transition\s*:)", css) and "prefers-reduced-motion" not in css:
        add("flag", "no-reduced-motion", "motion without a prefers-reduced-motion path")

    text = t.root.all_text()
    low = text.lower()
    filler = [w for w in FILLER if w in low]
    if filler:
        add("flag", "filler-copy", "generic marketing phrases; say what this product does", filler)
    btns = [n.all_text() for n in nodes if n.tag in ("button", "a") and n.all_text().lower().strip(" →›>") in WEAK_CTA]
    if len(btns) >= 2:
        add("note", "weak-cta-labels", f"{len(btns)} generic action labels; name the outcome", btns)
    dots = len(re.findall(r"\S\s+·\s+\S", text))
    arrows = len(re.findall(r"→", text))
    if dots >= 3:
        add("note", "middot-meta", f"{dots} 'A · B · C' strings")
    if arrows >= 3:
        add("note", "arrow-links", f"{arrows} '→' appended to text")

    VAL_JS = re.compile(r"setCustomValidity|\.validity|checkValidity|reportValidity|aria-invalid|zod|yup|"
                        r"resolver|useForm|Formik|vee-validate|validate\(|errors\[")
    FORMAT = re.compile(r"phone|tel|mobile|email|zip|post|id[-_]?card|national|citizen|tax|date|amount|price|url|เบอร์|อีเมล")
    for n in nodes:
        if n.tag != "form":
            continue
        fields = [d for d in n.walk() if d.tag in ("input", "select", "textarea")
                  and d.attrs.get("type") not in ("submit", "button", "hidden", "reset")]
        if not fields:
            continue
        typed = [d for d in fields if d.tag == "textarea" or (d.tag == "input" and d.attrs.get("type", "text") not in ("radio", "checkbox", "range", "color"))]
        groups = {}
        for d in fields:
            if d.tag == "input" and d.attrs.get("type") == "radio":
                groups.setdefault(d.attrs.get("name", ""), []).append("checked" in d.attrs)
        choice_only = not typed and all(any(g) for g in groups.values())
        has_handler = n.attrs.get("action") or n.attrs.get("method") == "dialog" or n.attrs.get("onsubmit") or re.search(r"submit|addEventListener|onSubmit|FormData", js)
        if not has_handler:
            add("flag", "inert-form", "form with no action and no submit handling; specify submit, validation, error and success behavior")
        has_rules = any(any(k in d.attrs for k in ("required", "pattern", "min", "max", "minlength", "maxlength"))
                    or d.attrs.get("type") in ("email", "url", "number", "tel", "date") for d in fields)
        messages = re.search(r"aria-invalid|field-error|error-message|role=\"alert\"", html) or VAL_JS.search(js)
        if choice_only:
            pass  # only choices with defaults: nothing the user types can be invalid
        elif not has_rules and not messages:
            add("flag", "form-without-validation", f"form with {len(fields)} field(s) but no rules (required/type/pattern) and no error messages; see forms.md §6b")
        elif not messages:
            add("flag", "form-without-messages", "fields have rules but no own error messages / aria-invalid / error summary; browser bubbles only (forms.md §6b)")
        unnamed = [d.attrs.get("type", d.tag) for d in fields if not d.attrs.get("name")]
        if unnamed:
            add("note", "unnamed-fields", f"{len(unnamed)} form fields without name", unnamed)
        nohint = [d.attrs.get("name") or d.attrs.get("id") or d.attrs.get("type", d.tag) for d in fields
                  if d.tag in ("input", "textarea")
                  and (d.attrs.get("type") in ("tel", "email", "url") or FORMAT.search((d.attrs.get("name", "") + " " + d.attrs.get("id", "")).lower()))
                  and not d.attrs.get("placeholder") and not d.attrs.get("aria-describedby")]
        if nohint:
            add("note", "format-field-without-example", f"{len(nohint)} format field(s) with neither an example placeholder nor a hint (forms.md §3)", nohint)
    # App navigation items without icons (iconography.md: navigation = icon + label). Applies to product UI:
    # a sidebar / aside, or a nav of 7+ items. A public page's short text menu (3-6 links) is a convention, not slop.
    # Only menu links count: the brand/logo link and buttons / CTAs in the header are not navigation items.
    navs = [n for n in nodes if n.tag in ("aside", "nav") or any(k in ("sidebar", "side", "nav-list", "menu") for k in n.cls())]
    def menu_link(a, first):
        """A menu item: not the brand/logo link (also an image link to the home page first in the nav), not a button or CTA."""
        k = " ".join(a.cls()).lower()
        if re.search(r"brand|logo|\bbtn|button|cta", k) or a.attrs.get("rel") == "home":
            return False
        if first and a.attrs.get("href", "") in ("/", "./", "#", "#top", "index.html", "./index.html") and any(d.tag in ("svg", "img") for d in a.walk()):
            return False
        return True
    for nv in navs[:1]:
        anchors = [a for a in nv.walk() if a.tag == "a"]
        links = [a for i, a in enumerate(anchors) if menu_link(a, i == 0)]
        app_nav = nv.tag == "aside" or any(k in ("sidebar", "side") for k in nv.cls()) or len(links) >= 7
        if app_nav and len(links) >= 4:
            with_icon = [a for a in links if any(d.tag in ("svg", "img", "i", "use") or any("icon" in k or k in ("ic", "fa") for k in d.cls())
                                                 for d in a.walk() if d is not a)]
            if len(with_icon) < len(links) / 2:
                add("flag", "nav-without-icons", f"{len(links) - len(with_icon)} of {len(links)} navigation items have no icon; use icon + label from one family (iconography.md)",
                    [a.all_text() for a in links if a not in with_icon])
    if re.search(r"[\u25B2\u25BC\u2191\u2193]", html + js):
        add("note", "glyph-as-icon", "text arrows (up/down triangles) used as trend icons; use an icon from the set plus visually hidden text (iconography.md)")
    # Product-UI doctrine (app-screen-rules.md §7): viewport-scaled type, cards nested in cards, hero in an app shell.
    vw = [sel for sel, body in rules
          for m in re.findall(r"font-size\s*:\s*([^;}]+)", body)
          if re.search(r"\d\s*vw\b", m) and not re.search(r"clamp\(|min\(|max\(", m)]
    if vw:
        add("flag", "viewport-scaled-font", f"{len(vw)} rule(s) size type in raw vw units (no clamp); text jumps with window width (app-screen-rules.md §7)", vw)
    # A framed box is a class token that IS card/panel/tile/box or ends with -card/-panel/-tile
    # (hero-panel, plan-card). Sub-parts (card-h, card-body, panel-head, box-head) start with the word
    # and never count. Where the page CSS styles the token, it must give it a frame (background,
    # border, radius or shadow); a token with no CSS at all still counts.
    framed_css = {}
    for sel, body in rules:
        frame = bool(re.search(r"(^|[;\s])(background(-color)?|border(-radius)?|box-shadow)\s*:", body))
        for k in re.findall(r"\.([\w-]+)", sel):
            framed_css[k] = framed_css.get(k, False) or frame
    def frame_token(k):
        return re.fullmatch(r"card|panel|tile|box", k) or re.search(r"-(card|panel|tile)$", k)
    cardish = lambda n: any(frame_token(k) and framed_css.get(k, True) for k in n.cls())
    nested = [c.cls() for n in nodes if cardish(n) for c in n.walk() if c is not n and cardish(c)]
    if nested:
        add("flag", "nested-cards", f"{len(nested)} card/panel inside another card/panel; one framed level, use spacing or dividers inside (app-screen-rules.md §7)", [" ".join(sorted(x)) for x in nested])
    srcs = Counter()
    skip = re.compile(r"favicon|logo|sprite|\.svg$|^data:", re.I)
    for n in nodes:
        if n.tag == "img" and n.attrs.get("src"):
            srcs[n.attrs["src"].split("?")[0].split("#")[0]] += 1
    for _, b in rules:
        for u in re.findall(r"url\(\s*['\"]?([^'\")]+)", b):
            srcs[u.split("?")[0].split("#")[0]] += 1
    dupes = [f"{k} x{v}" for k, v in srcs.items() if v >= 2 and not skip.search(k)]
    if dupes:
        add("flag", "duplicate-image", f"{len(dupes)} image(s) used twice; each section needs its own picture, a repeat reads as filler (design-quality.md §2)", dupes)
    shell = any(n.tag == "aside" or "sidebar" in n.cls() for n in nodes)
    hero = [n.cls() for n in nodes if any(k in ("hero", "jumbotron", "banner-hero") for k in n.cls())]
    if shell and hero:
        add("flag", "hero-in-app", "decorative hero inside an app shell (sidebar present); an operational screen opens on its task; a hero is allowed only as the first-run state (app-screen-rules.md §8)", [" ".join(sorted(x)) for x in hero])
    finish_checks(add, html, css, js, rules, nodes, text, sharp_intent(t, html, base))
    more_checks(add, html, css, rules, nodes, text, declared_posture(t, html, base))
    return out


EMOJI = re.compile("[☀-➿\U0001F300-\U0001FAFF]")
DEFAULT_HEX = re.compile(r"#(6366f1|4f46e5|8b5cf6|7c3aed|0f172a|1e293b|a855f7|3b82f6)\b", re.I)


def finish_checks(add, html, css, js, rules, nodes, text, sharp):
    """Motion, layout, copy and finish checks (design-quality.md §2, motion.md, marketing-copy.md)."""
    # Motion
    if re.search(r"transition(-property)?\s*:\s*all\b", css) or re.search(r"\btransition-all\b", html):
        add("flag", "transition-all", "transition: all animates layout and colour together; list the properties (motion.md §5)")
    lay = [s for s, b in rules if re.search(r"transition[^;]*\b(width|height|top|left|margin)\b", b)]
    if lay:
        add("note", "layout-transition", f"{len(lay)} rule(s) transition layout properties; animate transform/opacity", lay)
    def overshoot(m):
        try:
            v = [float(x) for x in m.group(1).split(",")]
        except ValueError:
            return False
        return len(v) == 4 and any(y < -0.05 or y > 1.05 for y in (v[1], v[3]))
    if any(overshoot(m) for m in re.finditer(r"cubic-bezier\(([^)]*)\)", css)) \
            or re.search(r"\b(bounce|elastic)\b", css) or re.search(r"\banimate-(bounce|ping|pulse)\b", html):
        add("note", "overshoot-easing", "bounce/overshoot easing; UI state uses no overshoot (component-states.md)")
    fade = [s for s, b in rules if ":focus" in s and re.search(r"transition[^;]*(outline|box-shadow|all)", b)]
    if fade:
        add("note", "focus-ring-fade", "focus ring transitions; focus appears instantly", fade)
    rest = [s for s, b in rules if "will-change" in b and not re.search(r":hover|:focus|\.is-|\[data-", s)]
    if rest:
        add("note", "will-change-at-rest", "will-change set at rest; add it only during the animation", rest)
    if re.search(r"prefers-reduced-motion[^{]*\{[^@]*?0\.01m?s\s*!important", css, re.S):
        add("note", "reduced-motion-kill", "blanket 0.01ms !important under reduced motion also kills state feedback; remove travel, keep fades (motion.md §4)")
    if re.search(r"addEventListener\(\s*['\"](pointerdown|mousemove|touchmove)", js) and "touch-action" not in css:
        add("note", "drag-without-touch-action", "drag handlers but no touch-action; mobile scroll fights the drag")

    # Layout
    hv = [s for s, b in rules if re.search(r"hero|banner|masthead", s) and re.search(r"(min-)?height\s*:\s*\d+vh", b)]
    if hv:
        add("note", "hero-vh", "hero height in vh; use dvh/svh (mobile toolbars)", hv)
    if re.search(r"\b100vw\b", css):
        add("note", "100vw", "100vw includes the scrollbar and causes side-scroll; use width: 100%")
    if [s for s, b in rules if re.search(r"(^|,)\s*(html|body)\s*($|,)", s) and re.search(r"overflow-x\s*:\s*hidden", b)]:
        add("note", "overflow-hidden-root", "overflow-x: hidden on html/body breaks sticky; use overflow-x: clip")
    sticky = [s for s, b in rules if re.search(r"position\s*:\s*sticky", b) and re.search(r"\btop\s*:\s*0", b)]
    if len(sticky) >= 2:
        add("note", "double-sticky", f"{len(sticky)} sticky elements at top: 0 overlap; offset the second by the nav height", sticky)
    caps = [s for s, b in rules if re.search(r"text-transform\s*:\s*uppercase", b) and (m := re.search(r"line-height\s*:\s*(0?\.\d+)\b", b)) and float(m.group(1)) < 1]
    if caps:
        add("note", "caps-tight-leading", "uppercase head with line-height < 1 collides when it wraps", caps)
    if re.search(r"mix-blend-mode\s*:\s*(difference|exclusion)", css):
        add("note", "blend-difference", "difference/exclusion blend on text shows random hues; use a solid ink (design-quality.md §2)")

    # Surfaces and colour
    if not sharp and re.search(r"box-shadow\s*:\s*-?[1-9]\d*px\s+-?[1-9]\d*px\s+0(px)?\s", css):
        add("note", "hard-offset-shadow", "hard offset shadow (no blur); a neobrutal device unless the direction asks for it")
    dh = sorted(set(m.group(0).lower() for m in DEFAULT_HEX.finditer(css)))
    tw = sorted(set(re.findall(r"\b(?:bg|text|from|to|via)-(?:indigo|violet|slate)-\d00\b", html)))
    if dh or tw:
        add("note", "default-palette", "framework default colours; derive the palette from the subject (color-palette.md)", dh + tw)
    if css.strip() and not re.search(r"::selection|caret-color|scrollbar-color|color-scheme", css):
        add("note", "unthemed-browser-surfaces", "no ::selection, caret-color, scrollbar-color or color-scheme; browser defaults show through")
    if css.strip() and re.search(r"(^|[\s,}])h[12]\b", css) and "text-wrap" not in css:
        add("note", "headings-without-balance", "h1/h2 styled without text-wrap: balance")

    # Controls
    has_btn = any(n.tag == "button" or "btn" in n.cls() for n in nodes)
    if has_btn and not re.search(r":disabled|\[disabled\]|\[aria-disabled", css):
        add("note", "no-disabled-style", "buttons have no :disabled / [aria-disabled] style (component-states.md)")
    filled = set()
    for s, b in rules:
        if re.search(r":(hover|focus|active|disabled)", s):
            continue
        if re.search(r"\.(btn|button|cta)[\w-]*", s) and (m := re.search(r"background(-color)?\s*:\s*([^;]+)", b)):
            if not re.search(r"transparent|none|inherit|paper|surface|ground|canvas", m.group(2)):
                filled.add(m.group(2).strip())
    if len(filled) >= 2:
        add("note", "multiple-filled-buttons", f"{len(filled)} filled-button recipes; derive variants from one .btn", sorted(filled))
    emo = [n.all_text() for n in nodes if n.tag in ("button", "a", "li", "h1", "h2", "h3", "h4") and EMOJI.search(n.all_text())]
    if emo:
        add("flag", "emoji-icon", f"{len(emo)} emoji used as icons; use one icon family (iconography.md)", emo)
    icon_family_checks(add, html, js, rules, nodes)

    # Media
    for n in nodes:
        if n.tag == "video":
            if "autoplay" in n.attrs and "muted" not in n.attrs:
                add("flag", "video-autoplay-sound", "autoplay video without muted is blocked by browsers")
            if "poster" not in n.attrs:
                add("note", "video-no-poster", "video without poster shows a blank box while loading")
            break
    first_img = next((n for n in nodes if n.tag == "img"), None)
    if first_img is not None and first_img.attrs.get("loading") == "lazy":
        add("note", "lazy-first-image", "first image is loading=lazy; it delays LCP")

    # Forms
    if any(n.tag == "form" for n in nodes) and re.search(r"(sent|thank you|thanks|ส่งแล้ว|ขอบคุณ)", js, re.I) \
            and not re.search(r"\bfetch\(|XMLHttpRequest|sendBeacon|\.submit\(\)|axios|\$\.(post|ajax)|\bdemo\b", js, re.I):
        add("flag", "fake-send", "script shows a success message but sends nothing; wire the request or label it a demo (forms.md §6b)")

    # Copy
    prose = re.sub(r"\s+", " ", text)
    sq = re.findall(r"[A-Za-z฀-๿]'[A-Za-z]|\"\w[^\"]{0,40}\"", prose)
    if len(sq) >= 2:
        add("note", "straight-quotes", f"{len(sq)} straight quotes in prose; use ’ “ ”", sq)
    dashes = prose.count("—") + prose.count(" – ")
    if dashes > 4:
        add("note", "dash-heavy-copy", f"{dashes} em/en dashes in copy; prefer a comma, colon or full stop (marketing-copy.md)")
    nj = re.findall(r"[^.]{0,30}\bnot just\b[^.]{0,40}", prose, re.I) + re.findall(r"\bNot [\w ]{1,25}\. [A-Z]\w+", prose)
    if nj:
        add("note", "rebuttal-cadence", "'not just X' / 'Not X. Y.' cadence (marketing-copy.md)", nj)
    tokens = Counter(re.findall(r"(?:฿|\$|€)\s?\d[\d,.]*|\b\d{1,2}:\d{2}\b", prose))
    echo = [f"{k} x{v}" for k, v in tokens.items() if v >= 4]
    if echo:
        add("note", "echo", "the same price/time repeated 4+ times; say each fact once", echo)


# UI icon libraries and the markup each leaves behind (class tokens, attributes, script/stylesheet/import names).
# Brand-logo sets are a different role (iconography.md "Icon libraries") and never count as a UI family.
ICON_FAMILIES = {
    "Lucide": (re.compile(r"^lucide(-[\w-]+)?$"), ("data-lucide",), r"lucide(-react|-vue|-svelte|-static|-angular)?[@/\"']|lucide\.createIcons"),
    "Feather": (re.compile(r"^feather(-[\w-]+)?$"), ("data-feather",), r"feather-icons|feather\.replace"),
    "Phosphor": (re.compile(r"^ph(-(bold|fill|light|thin|duotone|[a-z][\w-]*))?$"), (), r"@phosphor-icons|phosphor-icons|<ph-[a-z]"),
    "Tabler": (re.compile(r"^ti(-[\w-]+)?$"), (), r"tabler-icons|@tabler/icons"),
    "Font Awesome": (re.compile(r"^(fa|fas|far|fal|fad|fa-(solid|regular|light|thin|duotone|sharp)|fa-(?!brands$)[a-z][\w-]*)$"), (), r"font-?awesome|kit\.fontawesome\.com|@fortawesome/(?!free-brands)"),
    "Bootstrap Icons": (re.compile(r"^bi(-[\w-]+)?$"), (), r"bootstrap-icons"),
    "Material": (re.compile(r"^material-(icons|symbols)[\w-]*$"), (), r"fonts\.googleapis\.com/(icon\?family=Material|css2\?family=Material\+Symbols)|@mui/icons-material"),
    "Heroicons": (re.compile(r"^heroicon[\w-]*$"), (), r"heroicons"),
    "Remix": (re.compile(r"^ri-[\w-]+$"), (), r"remixicon"),
    "Ionicons": (re.compile(r"^$"), (), r"<ion-icon|ionicons"),
}
ICONIFY_PREFIX = {"lucide": "Lucide", "ph": "Phosphor", "tabler": "Tabler", "mdi": "Material Design Icons", "material-symbols": "Material",
                  "fa": "Font Awesome", "fa6-solid": "Font Awesome", "fa6-regular": "Font Awesome", "bi": "Bootstrap Icons",
                  "heroicons": "Heroicons", "ri": "Remix", "feather": "Feather", "ion": "Ionicons", "carbon": "Carbon", "iconoir": "Iconoir"}
BRAND_SETS = re.compile(r"^(simple-icons|simpleicons|logos|skill-icons|devicon|fa-brands|fa6-brands|cib)$")


def icon_family_checks(add, html, js, rules, nodes):
    """Mixed icon sets (iconography.md "Choosing glyphs": one family, one stroke style)."""
    found = {}

    def seen(fam, ev):
        found.setdefault(fam, set()).add(ev)

    def is_brand(n):
        p = n
        while p is not None:
            if p.attrs.get("data-brand") or any(re.search(r"brand|logo|wordmark", k) for k in p.cls()):
                return True
            p = p.parent
        return False

    for n in nodes:
        if is_brand(n) or "fab" in n.cls() or "fa-brands" in n.cls():
            continue
        for fam, (cls_re, attrs, _src) in ICON_FAMILIES.items():
            hit = next((k for k in n.cls() if cls_re.match(k)), None)
            # a bare short token (ph, ti, bi, fa) counts only beside its icon token (ph ph-house); ".ph" alone is
            # often a project class (placeholders)
            if hit and not (hit in ("ph", "ti", "bi", "fa") and not any(k.startswith(hit + "-") for k in n.cls())):
                seen(fam, f"class {hit}")
            for a in attrs:
                if a in n.attrs:
                    seen(fam, a)
        ic = n.attrs.get("icon") if n.tag == "iconify-icon" else n.attrs.get("data-icon", "")
        if ic and ":" in ic:
            pre = ic.split(":")[0]
            if not BRAND_SETS.match(pre):
                seen(ICONIFY_PREFIX.get(pre, f"Iconify {pre}"), f"iconify {pre}:")
    srcs = "\n".join([n.attrs.get("src", "") for n in nodes if n.tag == "script"] + [n.attrs.get("href", "") for n in nodes if n.tag == "link"]) + "\n" + js
    for fam, (_c, _a, src_re) in ICON_FAMILIES.items():
        m = re.search(src_re, srcs + ("\n" + html if fam == "Ionicons" else ""), re.I)
        if m:
            seen(fam, m.group(0)[:40])
    if len(found) >= 2:
        add("flag", "mixed-icon-families", f"{len(found)} UI icon families on one page ({', '.join(sorted(found))}); keep one, and redraw any missing glyph in its style (iconography.md \"Icon libraries\")",
            [f"{f}: {', '.join(sorted(e))}" for f, e in sorted(found.items())])

    # Inline SVG icons: one stroke width and one fill style. Icon-sized viewBox only; logos, brand marks,
    # illustrations and charts are skipped.
    widths, outline, filled = Counter(), [], []
    css_sw = {}
    for sel, body in rules:
        m = re.search(r"stroke-width\s*:\s*([\d.]+)", body)
        if m and re.search(r"icon", sel) and not re.search(r"brand|logo|chart|map|illus", sel):  # icon selectors only; "svg" alone hits drawings
            css_sw[sel.strip()] = m.group(1)
    for n in nodes:
        if n.tag != "svg" or is_brand(n):
            continue
        vb = re.sub(r"\s+", " ", n.attrs.get("viewbox", n.attrs.get("viewBox", ""))).strip()
        if vb not in ("0 0 24 24", "0 0 20 20", "0 0 16 16", "0 0 32 32"):
            continue
        fill, sw = n.attrs.get("fill", ""), n.attrs.get("stroke-width")
        if fill == "none" or (n.attrs.get("stroke") and fill != "currentColor") or (not fill and any("icon" in k for k in n.cls())):
            outline.append(n)
            if sw:
                widths[sw] += 1
        elif fill:
            filled.append(n)
    allw = set(widths) | set(css_sw.values())
    if len(allw) >= 2:
        add("note", "mixed-icon-strokes", f"icons drawn with {len(allw)} stroke widths ({', '.join(sorted(allw))}); use one per page (iconography.md \"Icon libraries\")",
            [f"stroke-width {w} x{c}" for w, c in widths.most_common()] + [f"{s} {{stroke-width:{w}}}" for s, w in css_sw.items()])
    if outline and len(filled) >= 2:
        add("note", "mixed-icon-fill", f"{len(outline)} outline and {len(filled)} filled UI icons; one style, filled only for a selected state (iconography.md)",
            [f"filled svg fill={n.attrs.get('fill')}" for n in filled])


def main(argv):
    ap = argparse.ArgumentParser(prog="slop_check.py", description="Flag template-look patterns (see the module docstring).")
    ap.add_argument("files", nargs="+", metavar="PAGE", help="built .html page(s)")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    a = ap.parse_args(argv)
    files, as_json = a.files, a.json
    gone = [p for p in files if not os.path.isfile(p)]
    if gone:
        print(f"error: file not found: {gone[0]} (pass the path to a built .html file)", file=sys.stderr)
        return 2
    report, flags = {}, 0
    for p in files:
        res = check(p)
        report[p] = res
        flags += sum(1 for r in res if r["level"] == "flag")
    if as_json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        for p, res in report.items():
            print(f"== {p}: {sum(r['level']=='flag' for r in res)} flag, {sum(r['level']=='note' for r in res)} note")
            for r in res:
                ex = f"  e.g. {r['examples']}" if r["examples"] else ""
                print(f"  [{r['level']}] {r['rule']}: {r['message']}{ex}")
        print("Heuristics only: confirm each hit in the rendered page.")
    return 1 if flags else 0



def declared_posture(t, html, base):
    """Colour posture from <html data-posture> or DESIGN.md (color-palette.md "Colour posture")."""
    for n in t.root.walk():
        if n.tag in ("html", "body") and n.attrs.get("data-posture"):
            return n.attrs["data-posture"].lower()
    for d in (base, os.path.dirname(base)):
        p = os.path.join(d, "DESIGN.md")
        if os.path.isfile(p):
            with open(p, encoding="utf-8", errors="replace") as f:
                m = re.search(r"posture\W{0,4}(restrained|committed|full[ -]palette|drenched)", f.read(), re.I)
            return m.group(1).lower() if m else "restrained"
    return "restrained"


def _hsl(hexv):
    h = hexv.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0, 0, l
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    hue = ((g - b) / d % 6 if mx == r else (b - r) / d + 2 if mx == g else (r - g) / d + 4) * 60
    return hue, s, l


def more_checks(add, html, css, rules, nodes, text, posture):
    """Palette, surface, type, control and heading checks (design-quality.md §2, color-palette.md)."""
    cols = [_hsl(m) for m in re.findall(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", css)]
    cream = any(22 <= h <= 62 and s >= .16 and l >= .88 for h, s, l in cols)
    terra = any(10 <= h <= 30 and .35 <= s <= .75 and .40 <= l <= .65 for h, s, l in cols)
    if cream and terra:
        add("flag", "cream-terracotta", "warm cream ground with a terracotta accent; take the palette from the subject (design-quality.md §2)")
    if any(244 <= h <= 295 and s >= .42 and .2 < l < .8 for h, s, l in cols):
        add("note", "violet", "saturated violet in the palette; check it comes from the subject, not a default")
    stops = [[_hsl(c) for c in re.findall(r"#[0-9a-fA-F]{6}", g)] for g in re.findall(r"gradient\(([^;]*)\)", css)]
    if any(any(255 <= h <= 300 and s > .3 for h, s, _ in st) and any(200 <= h < 255 and s > .3 for h, s, _ in st) for st in stops):
        add("note", "purple-blue-gradient", "purple-to-blue gradient, the default AI gradient")
    stripe = [s for s, b in rules if re.search(r"card|alert|callout|item|note|quote|tile", s) and re.search(r"border-(left|right|inline-start)(-width)?\s*:\s*([3-9]|\d{2,})px", b)]
    if stripe:
        add("flag", "accent-stripe", "thick side stripe on cards/callouts (design-quality.md §2)", stripe)
    hair = len(re.findall(r"<hr\b", html, re.I)) + len(re.findall(r"\bdivide-[xy]\b", html)) + len([1 for s, b in rules if re.search(r"border(-top|-bottom)?\s*:\s*1px\s+solid", b)])
    if hair >= 2 and posture == "restrained":
        add("note", "hairlines", f"{hair} hairline rules/dividers; separate with space unless the direction is print")
    float_sel = re.compile(r"menu|dialog|modal|popover|toast|dropdown|tooltip|sheet|drawer|:hover|:focus|\.is-|sticky|header|nav")
    resting = [s for s, b in rules if (m := re.search(r"box-shadow\s*:\s*([^;]+)", b)) and not re.search(r"none|inset", m.group(1)) and re.search(r"-?\d+(px)?\s+-?\d+(px)?\s+[1-9]", m.group(1)) and not float_sel.search(s)]
    if resting:
        add("note", "resting-shadow", f"{len(resting)} soft shadow(s) on resting elements; shadows are for things that float", resting)
    both = [s for s, b in rules if re.search(r"border\s*:\s*1px", b) and (m := re.search(r"box-shadow\s*:\s*[^;]*?-?\d+(?:px)?\s+-?\d+(?:px)?\s+(\d+)px", b)) and int(m.group(1)) >= 24]
    if both:
        add("note", "border-and-big-shadow", "border plus a ≥24px blurred shadow on one element; pick one depth strategy", both)
    if posture == "restrained":
        big = [s for s, b in rules if re.search(r"background(-color)?\s*:\s*var\(--(accent|primary|brand)[\w-]*\)", b)
               and (re.search(r"(^|[\s,.#])(body|section|header|footer|main|hero|band)\b", s) or re.search(r"min-height\s*:\s*(3[2-9]\d|[4-9]\d\d)px|min-height\s*:\s*([4-9]\d)vh", b))]
        if big:
            add("note", "accent-fill-large", "accent fills a large area; declare a colour posture (committed/drenched) or keep accent ≤ 5% (color-palette.md)", big)
    # Type
    disp = [s for s, b in rules if re.search(r"(^|[\s,])h[12]\b|display|hero", s) and re.search(r"font-family\s*:\s*[\"']?(Impact|Arial Black|Arial|Helvetica)\b", b, re.I)]
    if disp:
        add("note", "system-display-font", "display type set in a system face (Impact/Arial/Helvetica); choose a face for the direction", disp)
    deflt = sorted({m.group(1) for m in re.finditer(r"font-family\s*:\s*[\"']?(Inter|Roboto|Open Sans|Poppins|Montserrat|Lato)\b", css)})
    if deflt:
        add("note", "default-face", "framework-default face; fine when chosen on purpose, record why in DESIGN.md", deflt)
    tracked = [s for s, b in rules if re.search(r"text-transform\s*:\s*uppercase", b) and not re.search(r"(^|[\s,])h[1-3]\b", s)
               and (re.search(r"letter-spacing\s*:\s*(0?\.0[4-9]|0?\.[1-9]|[1-9])\d*em", b) or re.search(r"font-size\s*:\s*(1[0-5]|[0-9])px", b))]
    if len(tracked) >= 2:
        add("note", "tracked-caps-labels", f"{len(tracked)} small tracked uppercase label styles; app screens allow one", tracked)
    if re.search(r"text-align\s*:\s*justify", css) and "hyphens" not in css:
        add("note", "justify-without-hyphens", "justified text without hyphens leaves rivers")
    if re.search(r"transition[^;]*\bease-in\b(?!-out)", css):
        add("note", "ease-in", "ease-in on UI feels sluggish; use ease-out for entrances (motion.md §2)")
    if re.search(r"scale\(\s*0\s*\)", css):
        add("note", "scale-zero", "animating from scale(0) looks like a pop; start near 0.95 with opacity")
    # Controls
    opac = [s for s, b in rules if re.search(r":disabled|\[disabled\]|\[aria-disabled", s) and "opacity" in b and "cursor" not in b]
    if opac:
        add("note", "disabled-opacity-only", "disabled style is only opacity; add cursor and keep the label legible", opac)
    # Content
    if re.search(r"\b(Acme|John Doe|Jane Doe|Foo Bar|Lorem ipsum)\b", text, re.I):
        add("note", "placeholder-names", "stock placeholder names; use 'Sample Person A' style labels or real content")
    if text.count("...") >= 1:
        add("note", "three-dots", "'...' in copy; use the ellipsis character …")
    # Headings
    levels = [int(n.tag[1]) for n in nodes if re.fullmatch(r"h[1-6]", n.tag or "")]
    skips = [f"h{a}→h{b}" for a, b in zip(levels, levels[1:]) if b > a + 1]
    if skips:
        add("note", "heading-skip", f"heading levels skipped: {', '.join(skips[:3])}")
    h1 = [n for n in nodes if n.tag == "h1"]
    if h1 and all(not n.all_text().strip() for n in h1) and any(c.tag == "img" for n in h1 for c in n.walk()):
        add("flag", "h1-image-only", "the h1 is an image with no text; search engines and screen readers need real text")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
