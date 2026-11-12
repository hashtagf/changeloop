#!/usr/bin/env python3
"""Add a live tweak panel to an HTML page that reads its look from CSS custom properties.

Usage:
  python3 tweaks_panel.py page.html [--out page.tweaks.html] [--accent-var --color-accent]
         [--ink-var --color-accent-ink] [--text-var --color-accent-text] [--focus-var --color-focus]
         [--radius-vars --r-card,--r-ctrl] [--dur-vars --dur-fast,--dur-base] [--density-var --density]
         [--presets "Rust:#c96442,Cobalt:#2c4d8e,Sage:#4a7a3f,Plum:#7a3f6a,Graphite:#3a3a3a"]

Variable names are read from the page's own light :root (its <style> blocks): the accent (--color-accent,
--accent, --color-primary, --primary, --brand ...), the ink on it (--color-accent-ink, --on-accent,
--primary-foreground ...), accent text, focus, radius (--radius*, --r-*) and duration (--dur*, --duration*,
or any ms/s value) variables. Explicit flags override detection; what was used is printed.

Knobs: accent (curated swatches, no free color picker), text scale, density (sets the density variable to
0.85 / 1 / 1.2; shown only when the page has one), corners (square / default / round, scales the radius
variables; shown when found), color mode (sets data-theme light/dark, matching tokens.css from export_tokens.py)
and motion (off sets data-motion=off and zeroes the duration variables). Choices persist in localStorage per
page; T hides or shows the panel, R resets. Per swatch the colours are worked out here (scripts/_color.py), not
taken raw: the ink on the accent is the higher-contrast of #ffffff / #111111; accent text (links) and the focus
ring are the swatch moved in lightness until they reach 4.5:1 and 3:1 on the page's paper and surface (light,
and dark when the page has a dark block). For client reviews and for finding the last 20% of a look; remove the
panel before shipping. Writes only the --out file (default: <page>.tweaks.html next to the page).
Exit 0 written, 2 bad input (missing page, panel already there, bad --presets). Standard library only.
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from code_extract import css_blocks, is_dark, strip_comments, style_text, to_hex  # noqa: E402
from _color import best_ink, is_hex, norm_hex, readable  # noqa: E402
import _net  # noqa: E402

PRESETS = "Rust:#c2410c,Cobalt:#2c4d8e,Sage:#4a7a3f,Plum:#7a3f6a,Rose:#b4405f,Graphite:#3a3a3a"

PANEL = r"""
<style id="tw-style">
#tw{position:fixed;right:16px;bottom:16px;z-index:2147483000;width:260px;max-width:calc(100vw - 32px);font:14px/1.4 system-ui,sans-serif;color:#16181d;background:#fff;border:1px solid #d6d9de;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:14px 16px}
#tw[hidden]{display:none}
#tw h2{font:700 13px/1 system-ui;margin:0 0 10px;letter-spacing:.02em}
#tw label,#tw .tl{display:block;font-weight:600;font-size:12px;margin:10px 0 6px;color:#4a5160}
#tw .sw{display:flex;gap:8px;flex-wrap:wrap}
#tw .sw button{width:44px;height:44px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #c4c8cf;cursor:pointer;padding:0}
#tw .sw button[aria-pressed=true]{box-shadow:0 0 0 3px #16181d}
#tw input[type=range]{width:100%;min-height:44px;font-size:16px}
#tw .seg{display:flex;gap:4px}
#tw .seg button{flex:1;min-height:44px;border:1px solid #c4c8cf;background:#fff;border-radius:8px;font:600 12px system-ui;cursor:pointer;color:#16181d}
#tw .seg button[aria-pressed=true]{background:#16181d;color:#fff;border-color:#16181d}
#tw .ft{display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#5b6270}
#tw button:focus-visible,#tw input:focus-visible{outline:3px solid #2a6df4;outline-offset:2px}
html[data-motion=off] *{animation:none!important;transition:none!important}
</style>
<aside id="tw" aria-label="Tweaks"><h2>Tweaks</h2>
<div class="tl">Accent</div><div class="sw" id="tw-acc"></div>
<label for="tw-scale">Text size <span id="tw-sv"></span></label><input id="tw-scale" type="range" min="90" max="120" step="2" value="100">
<div class="tl" id="tw-den-l">Density</div><div class="seg" id="tw-den"><button data-v="0.85">Compact</button><button data-v="1">Normal</button><button data-v="1.2">Roomy</button></div>
<div class="tl" id="tw-rad-l">Corners</div><div class="seg" id="tw-rad"><button data-v="0">Square</button><button data-v="1">Default</button><button data-v="1.5">Round</button></div>
<div class="tl">Mode</div><div class="seg" id="tw-mode"><button data-v="light">Light</button><button data-v="dark">Dark</button></div>
<div class="tl">Motion</div><div class="seg" id="tw-mot"><button data-v="on">On</button><button data-v="off">Off</button></div>
<div class="ft"><span><kbd>T</kbd> hide</span><span><kbd>R</kbd> reset</span></div></aside>
<script id="tw-script">
(function(){
var V=__VARS__,ACC=V.accent,PRE=__PRE__,KEY='tweaks:'+location.pathname,root=document.documentElement,P=document.getElementById('tw');
var D={accent:null,scale:100,density:1,radius:1,mode:null,motion:'on'},S=Object.assign({},D);
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
if(!V.density){document.getElementById('tw-den').hidden=document.getElementById('tw-den-l').hidden=true}
if(!V.radius.length){document.getElementById('tw-rad').hidden=document.getElementById('tw-rad-l').hidden=true}
function hx(h){h=String(h||'').replace('#','');if(h.length===3||h.length===4)h=h.slice(0,3).split('').map(function(c){return c+c}).join('');return h.slice(0,6)}
function lum(h){h=hx(h);var c=[0,2,4].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function cr(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function ink(bg){return cr('#ffffff',bg)>=cr('#111111',bg)?'#ffffff':'#111111'}
function dk(){return S.mode?S.mode==='dark':(V.hasDark&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)}
function apply(){
 var AV=[ACC,V.text,V.focus,V.ink],p=PRE.filter(function(x){return x[1]===S.accent})[0];
 if(S.accent){var d=dk()?1:0;root.style.setProperty(ACC,S.accent);
  root.style.setProperty(V.text,p?p[3+2*d]:S.accent);root.style.setProperty(V.focus,p?p[4+2*d]:S.accent);
  root.style.setProperty(V.ink,p?p[2]:ink(S.accent))}
 else{AV.forEach(function(k){root.style.removeProperty(k)})}
 root.style.fontSize=S.scale+'%';document.getElementById('tw-sv').textContent=S.scale+'%';
 if(V.density){root.style.setProperty(V.density,S.density)}
 V.radius.forEach(function(r){if(S.radius==1){root.style.removeProperty(r[0])}else if(S.radius==0){root.style.setProperty(r[0],'0px')}else if(r[1]!=null){root.style.setProperty(r[0],Math.round(r[1]*S.radius)+'px')}});
 if(S.mode){root.setAttribute('data-theme',S.mode)}else{root.removeAttribute('data-theme')}
 root.setAttribute('data-motion',S.motion);
 if(S.motion==='off'){V.dur.forEach(function(k){root.style.setProperty(k,'0.01ms')})}else{V.dur.forEach(function(k){root.style.removeProperty(k)})}
 document.querySelectorAll('#tw-acc button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===S.accent))});
 [['tw-den','density'],['tw-rad','radius'],['tw-mode','mode'],['tw-mot','motion']].forEach(function(p){document.querySelectorAll('#'+p[0]+' button').forEach(function(b){b.setAttribute('aria-pressed',String(String(S[p[1]])===b.dataset.v))})});
 document.getElementById('tw-scale').value=S.scale;
 try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
}
var sw=document.getElementById('tw-acc');
PRE.forEach(function(p){var b=document.createElement('button');b.type='button';b.dataset.v=p[1];b.title=p[0];b.setAttribute('aria-label',p[0]);b.style.background=p[1];b.onclick=function(){S.accent=p[1];apply()};sw.appendChild(b)});
document.getElementById('tw-scale').oninput=function(e){S.scale=+e.target.value;apply()};
[['tw-den','density',Number],['tw-rad','radius',Number],['tw-mode','mode',String],['tw-mot','motion',String]].forEach(function(p){document.querySelectorAll('#'+p[0]+' button').forEach(function(b){b.onclick=function(){S[p[1]]=p[2](b.dataset.v);apply()}})});
document.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target.tagName||''))||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==='t'||e.key==='T'){P.hidden=!P.hidden}
 if(e.key==='r'||e.key==='R'){S=Object.assign({},D);apply()}});
apply();
})();
</script>
"""


ACCENT = ["--color-accent", "--accent", "--color-primary", "--primary", "--color-brand", "--brand", "--brand-color", "--accent-color"]
INK = ["-ink", "-foreground", "-contrast", "-on"]
ON = ["--on-accent", "--color-on-accent", "--on-primary", "--color-on-primary", "--on-brand"]
TEXT = ["-text", "-link"]
FOCUS = ["--color-focus", "--focus", "--focus-ring", "--color-ring", "--ring"]


def root_vars(html, dark=False):
    """name -> value of custom properties in the page's light (or dark) :root / html blocks (its <style> contents)."""
    out = {}
    for sel, body in css_blocks(strip_comments(style_text(html), ".css")):
        if is_dark(sel) != dark or not re.search(r":root|\bhtml\b|\.dark\b|\[data-theme", sel):
            continue
        for m in re.finditer(r"(--[\w-]+)\s*:\s*([^;{}]+)", body):
            out.setdefault(m.group(1), m.group(2).strip())
    return out


def detect(vs):
    """Pick the page's own variable names; fall back to the tokens.css names from export_tokens.py."""
    first = lambda names, default: next((n for n in names if n in vs), default)
    acc = first(ACCENT, "--color-accent")
    ink = first([acc + s for s in INK] + ON + ["--color-accent-ink"], "--color-accent-ink")
    text = first([acc + s for s in TEXT] + ["--color-accent-text", "--accent-text", "--primary-text", "--link"], acc + "-text")
    focus = first(FOCUS, "--color-focus")
    radius = []
    for n, v in vs.items():
        if re.match(r"^--(radius|r|rounded|corner)(-[\w-]+)?$", n) and not n.endswith(("-pill", "-full", "-round")):
            m = re.fullmatch(r"(\d*\.?\d+)px", v)
            if m and float(m.group(1)) >= 999:
                continue
            radius.append([n, float(m.group(1)) if m else None])
    dur = [n for n, v in vs.items() if re.search(r"dur|duration", n) or re.fullmatch(r"\d*\.?\d+m?s", v)]
    return dict(accent=acc, ink=ink, text=text, focus=focus, radius=radius,
                dur=dur or ["--dur-fast", "--dur-base", "--dur-slow"], density="--density" if "--density" in vs else None)


PAPER = ["--color-paper", "--paper", "--color-ground", "--ground", "--color-bg", "--bg", "--color-background",
         "--background", "--canvas", "--color-canvas", "--page-bg", "--body-bg"]
SURFACE = ["--color-surface", "--surface", "--color-card", "--card", "--panel"]


def page_colors(vs, default):
    """(paper, surface) hexes from the page's variables (var() chains resolved); default when not found."""
    def val(names):
        for n in names:
            v, seen = vs.get(n), 0
            while v and seen < 6:
                m = re.fullmatch(r"\s*var\((--[\w-]+)(?:,[^)]*)?\)\s*", v)
                if not m:
                    break
                v, seen = vs.get(m.group(1)), seen + 1
            h = to_hex(v) if v else None
            if h:
                return h
        return None
    paper = val(PAPER) or default
    return paper, val(SURFACE) or paper


def swatch(name, acc, light, dark):
    """[name, accent, ink on it, text on light, focus on light, text on dark, focus on dark]."""
    return [name, acc, best_ink(acc, ("#ffffff", "#111111")),
            readable(acc, light, 4.5), readable(acc, light, 3.0), readable(acc, dark, 4.5), readable(acc, dark, 3.0)]


def die(msg):
    sys.stderr.write("error: %s\n" % msg)
    sys.exit(2)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        die("%s (run with --help)" % message)


VALUE_FLAGS = ("--out", "--accent-var", "--ink-var", "--text-var", "--focus-var", "--density-var", "--radius-vars",
               "--dur-vars", "--presets")


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    # values here are CSS variable names that start with "--": glue them to their flag so argparse keeps them
    glued, i = [], 0
    while i < len(argv):
        if argv[i] in VALUE_FLAGS and i + 1 < len(argv):
            glued.append(argv[i] + "=" + argv[i + 1]); i += 2
        else:
            glued.append(argv[i]); i += 1
    ap = Parser(prog="tweaks_panel.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("page")
    for f in VALUE_FLAGS:
        ap.add_argument(f)
    a = ap.parse_args(glued)
    src = a.page
    if not os.path.isfile(src):
        die("no page at %s (check the path)" % src)
    out = a.out or os.path.splitext(src)[0] + ".tweaks.html"
    pre = []
    for p in (a.presets or PRESETS).split(","):
        if not p.strip():
            continue
        name, _, hx = p.partition(":")
        if not name.strip() or not is_hex(hx.strip()):
            die("--presets entry %r: use Name:#rrggbb, comma-separated (e.g. \"Rust:#c2410c,Sage:#4a7a3f\")" % p)
        pre.append((name.strip(), norm_hex(hx.strip())))
    try:
        html = open(src, encoding="utf-8").read()
    except (OSError, UnicodeDecodeError) as e:
        die("cannot read %s (%s)" % (src, e))
    if 'id="tw"' in html:
        die("a tweak panel is already present in %s (start from the page without it)" % src)
    vs = root_vars(html)
    vd = root_vars(html, dark=True)
    v = detect(vs)
    for flag, key in (("accent_var", "accent"), ("ink_var", "ink"), ("text_var", "text"), ("focus_var", "focus"), ("density_var", "density")):
        if getattr(a, flag):
            v[key] = getattr(a, flag)
    if a.radius_vars is not None:
        v["radius"] = [[n, float(vs[n][:-2]) if re.fullmatch(r"\d*\.?\d+px", vs.get(n, "")) else None] for n in a.radius_vars.split(",") if n]
    if a.dur_vars is not None:
        v["dur"] = [n for n in a.dur_vars.split(",") if n]
    light = list(dict.fromkeys(page_colors(vs, "#ffffff")))
    dark = list(dict.fromkeys(page_colors(dict(vs, **vd), "#121212"))) if vd else ["#121212"]
    v["hasDark"] = bool(vd)
    swatches = [swatch(n, h, light, dark) for n, h in pre]
    panel = PANEL.replace("__VARS__", json.dumps(v)).replace("__PRE__", json.dumps(swatches))
    # case-insensitive search on the original string: lower() can change its length ('İ' -> 'i̇') and shift the index
    m = None
    for m in re.finditer(r"</body\s*>", html, re.I):
        pass
    i = m.start() if m else -1
    html = html[:i] + panel + html[i:] if i != -1 else html + panel
    try:
        _net.write_atomic(out, html)
    except OSError as e:
        die("cannot write %s (%s)" % (out, e))
    print("wrote", out)
    print("variables: accent %s, ink %s, text %s, focus %s, density %s, radius %s, motion %s" % (
        v["accent"], v["ink"], v["text"], v["focus"], v["density"] or "(none; knob hidden)",
        ", ".join(r[0] for r in v["radius"]) or "(none; knob hidden)", ", ".join(v["dur"])))
    print("accent text / focus checked on paper %s%s" % (" + ".join(light), (" and dark " + " + ".join(dark)) if vd else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
