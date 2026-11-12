#!/usr/bin/env python3
"""Write DESIGN.md from a direction and the interview answers, and wire it into CLAUDE.md / AGENTS.md.

Usage:
  python3 design_md.py <direction-id> --interview interview.json [--out DIR] [--wire] [--approved]
  python3 design_md.py --from-code SRC [--interview interview.json] [--out DIR] [--wire]   # brownfield
  python3 design_md.py --backoffice <style-id> [--interview interview.json] [--out DIR] [--wire]   # new product UI / back office
  python3 design_md.py --template-interview            # prints an empty interview.json

--backoffice reads a look from assets/backoffice/styles.json (calm, dense, enterprise, ledger, ...) and writes a
draft DESIGN.md for a product UI (dashboards, admin, ERP): tokens, density, one-family icon rules, status
semantics, data-honesty rules. Use it before building product UI that has no DESIGN.md. Light theme only; add dark separately.

--from-code reads an existing codebase (code_extract.py) and writes a DESIGN.md of what the code ships today:
color roles from CSS variables (light and dark blocks), fonts, radius, plus a Drift section and evidence for
every value (found / guessed / derived). It is always Status: draft; the team approves it before it binds.
Contrast failures the code ships (e.g. light grey text) stay as found and make design_md_check.py exit 1: they are
findings for the baseline audit, not something this script hides.
The interview is optional here (brand, goal, audience); without it those lines say "not asked yet".

Writes DESIGN.md into DIR (default: current directory) with Status: draft (or approved with --approved),
the Google design.md spec shape (YAML front matter tokens + the eight canonical sections), light and dark-*
colors (derived by export_tokens.py and AA-checked), dials from the energy answer, and the interview as the decision log. It refuses to
overwrite an existing DESIGN.md (use --force). The result passes design_md_check.py.

--wire appends a short, marked block to AGENTS.md and CLAUDE.md in DIR (whichever exist; if neither,
creates AGENTS.md) so the next agent reads DESIGN.md first. Running it again replaces the block.
The whole file is built before anything is written (temp file + rename), so a failed run (unknown direction or
look, bad interview) leaves no DESIGN.md and no new folder. Free-text scalars (name, description) are quoted.
Radius follows export_tokens.shape_radii(): a round subject turns a 0px direction into 24px cards and pill
buttons, and the Decision log then says `export_tokens.py <id> --shape soft` so the code tokens match.
Interview list fields (feel, languages, never, ...) also accept one string ("feel": "warm" = ["warm"]).
Without --out it writes into the current folder, but never into the skill folder itself.
Exit 0 written, 2 usage or input error (unknown direction or look, missing or malformed interview JSON,
DESIGN.md already there without --force). Standard library only.
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import export_tokens as ex  # noqa: E402

LIST_FIELDS = ("proof_available", "languages", "feel", "shape_from_subject", "likes", "dislikes", "competitors",
               "constraints", "never")
TEXT_FIELDS = ("brand", "what", "audience", "goal", "differentiator", "energy", "shape", "asked_by", "date")


def die(msg):
    sys.stderr.write("error: %s\n" % msg)
    sys.exit(2)


def load_interview(path):
    """The interview JSON as a dict; a list field given as one string becomes a one-item list."""
    if not path:
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            iv = json.load(f)
    except FileNotFoundError:
        die("--interview %s: no such file (python3 design_md.py --template-interview > interview.json)" % path)
    except (OSError, UnicodeDecodeError) as e:
        die("--interview %s: cannot read (%s)" % (path, e))
    except ValueError as e:
        die("--interview %s: not valid JSON (%s)" % (path, e))
    if not isinstance(iv, dict):
        die("--interview %s: expected a JSON object like --template-interview prints" % path)
    for k in LIST_FIELDS:
        v = iv.get(k)
        if v is None:
            continue
        if isinstance(v, str):
            iv[k] = [v] if v.strip() else []
        elif isinstance(v, list):
            iv[k] = [str(x) for x in v if x is not None]
        else:
            die("--interview %s: %s must be a list of strings or one string (got %r)" % (path, k, v))
    for k in TEXT_FIELDS:  # null = not answered (the default applies); a list or object is an input error
        v = iv.get(k)
        if v is None:
            iv.pop(k, None)
        elif isinstance(v, (int, float)) and not isinstance(v, bool):
            iv[k] = str(v)
        elif not isinstance(v, str):
            die("--interview %s: %s must be one string (got %r)" % (path, k, v))
    if iv.get("density") is not None and (isinstance(iv["density"], bool) or not isinstance(iv["density"], (int, float))):
        die("--interview %s: density must be a number 1-10 (got %r)" % (path, iv["density"]))
    if iv.get("density") is None:
        iv.pop("density", None)
    return iv

TEMPLATE = {
    "brand": "Plume",
    "what": "one sentence: what the business does",
    "audience": "who visits and what they must be able to do in one visit",
    "goal": "the one action that counts (e.g. book a 30-minute call)",
    "differentiator": "why choose them, in one sentence you could prove",
    "proof_available": ["case studies", "numbers", "testimonials", "logos"],
    "languages": ["th", "en"],
    "feel": ["premium", "friendly", "warm"],
    "energy": "balanced",
    "shape": "soft",
    "shape_from_subject": ["bean", "cup", "kraft bag", "rubber date stamp"],
    "likes": ["site or app they like and why"],
    "dislikes": ["site or app they dislike and why"],
    "competitors": ["name"],
    "constraints": ["no photos yet", "launch in 3 weeks"],
    "never": ["stock handshake photos", "gradient text"],
    "asked_by": "user | assumed (user away)",
    "date": "YYYY-MM-DD",
}
MEANS = {
    "premium": "generous space, one restrained accent, few elements per screen, no discount-style badges",
    "playful": "round shapes, one lively motion per page, friendly microcopy; never childish layout",
    "friendly": "plain words, warm color, people-first copy, soft corners",
    "warm": "warm neutrals instead of pure white or grey, tinted surfaces",
    "trustworthy": "specific proof, clear prices or process, calm color, nothing that shouts",
    "bold": "large type, strong contrast, one oversized element per page",
    "techy": "mono labels, precise grids, dense data allowed, cool palette",
    "natural": "earthy palette, organic shapes, real texture instead of gloss",
    "calm": "slow motion, low contrast between neighbors, long line spacing",
    "expressive": "unusual composition, large imagery, motion that carries meaning",
    "editorial": "serif display, strong hierarchy, column rhythm, captions and rules",
}
DIALS = {"calm": (3, 2, 3), "balanced": (5, 4, 4), "expressive": (7, 6, 3), "dense": (2, 1, 8)}


def load_direction(did):
    raw = json.load(open(ex.DIRS))
    items = raw if isinstance(raw, list) else raw["directions"]
    for d in items:
        if d["id"] == did:
            return d
    die("unknown direction: %s (python3 scripts/export_tokens.py --list)" % did)


def shape_words(r, btn, corner):
    """One description of the shape language, built from the same values the Shapes section prints."""
    btn_w = {"pill": "pill buttons", "round": "rounded buttons", "square": "square buttons"}.get(btn, "%s buttons" % btn)
    if r == 0 and btn == "square":
        label = "sharp"
    elif r == 0 or btn == "square":
        label = "mixed"
    else:
        label = "soft"
    return label, "%dpx cards, %s, %s corners" % (r, btn_w, corner)


def bullet(items):
    return "\n".join("- %s" % i for i in items) if items else "- (none given)"


def q(h):
    return '"%s"' % h


def ys(v):
    """A free-text YAML scalar, always double-quoted (a brand like "[name]" or "Acme: #1" stays a string)."""
    return json.dumps(str(v), ensure_ascii=False)


def write_atomic(path, text):
    """Write the finished text to a temp file next to path, then rename; a failed run leaves nothing behind.
    The file gets normal permissions (0666 minus umask); an unwritable target is an input error (exit 2)."""
    import tempfile
    from _net import file_mode
    if os.path.isdir(path):
        die("%s is a folder, not a file (move it away or pick another --out)" % path)
    tmp = None
    try:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)  # only now, after the text was built
        fd, tmp = tempfile.mkstemp(prefix=".%s." % os.path.basename(path), suffix=".tmp", dir=os.path.dirname(os.path.abspath(path)))
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.chmod(tmp, file_mode())
        os.replace(tmp, path)
    except OSError as e:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
        die("cannot write %s (%s; check --out)" % (path, e))
    except BaseException:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
        raise


def front_matter(d, iv, light_t, dark_t, rx, thai):
    r = rx["card"]
    name = iv.get("brand", d["name"])
    cards = light_t.get("cards_opposite") or dark_t.get("cards_opposite")
    y = ["---", "version: alpha", "name: %s" % ys(name),
         "description: %s" % json.dumps(iv.get("what", d["note"]), ensure_ascii=False), "colors:"]
    def colors(t, pre):
        rows = [("canvas", t["ground"]), ("surface", t["surface"]), ("on-surface", t["ink"]), ("muted", t["muted"]),
                ("border", t["border"]), ("primary", t["accent"]), ("on-primary", t["accent_ink"]),
                ("primary-text", t["accent_text"]), ("focus", t["focus"]), ("success", t["ok"]),
                ("warning", t["warn"]), ("error", t["bad"]), ("tint-1", t["tints"][0]), ("tint-2", t["tints"][1]),
                ("tint-3", t["tints"][2]), ("tint-4", t["tints"][3]),
                ("on-tint-1", t["tint_inks"][0]), ("on-tint-2", t["tint_inks"][1]), ("on-tint-3", t["tint_inks"][2]), ("on-tint-4", t["tint_inks"][3])]
        if cards:  # cards of the opposite tone: their own text roles (from cardInk / cardMuted when the direction has them)
            rows[4:4] = [("on-card", t["surface_ink"]), ("card-muted", t["surface_muted"]),
                         ("card-primary-text", t["surface_accent_text"]), ("card-focus", t["surface_focus"])]
        return ["  %s%s: %s" % (pre, k, q(v)) for k, v in rows]
    y += colors(light_t, "") + colors(dark_t, "dark-")
    fam_d = '%s, %s' % (d["display"], "Noto Sans Thai" if thai else "sans-serif")
    fam_b = '%s, %s' % (d["body"], "Noto Sans Thai" if thai else "sans-serif")
    body_lh = "1.6" if thai else "1.5"
    def ty(n, fam, size, w, lh, ls="0em"):
        ls = "0em" if re.fullmatch(r"\s*-?0*\.?0*\s*", str(ls)) else ls  # a bare 0 is not a dimension
        return ["  %s:" % n, "    fontFamily: %s" % json.dumps(fam), "    fontSize: %s" % size, "    fontWeight: %s" % w,
                "    lineHeight: %s" % lh, "    letterSpacing: %s" % ls]
    y.append("typography:")
    y += ty("headline-display", fam_d, "56px", d["dw"], "1.1", d["track"])
    y += ty("headline-lg", fam_d, "40px", d["dw"], "1.15", d["track"])
    y += ty("headline-md", fam_d, "28px", d["dw"], "1.25", d["track"])
    y += ty("body-lg", fam_b, "18px", 400, body_lh)
    y += ty("body-md", fam_b, "16px", 400, body_lh)
    y += ty("body-sm", fam_b, "14px", 400, body_lh)
    y += ty("label-md", fam_b, "14px", 600, "1.2")
    inp = rx["input"]
    y += ["rounded:", "  none: 0px", "  sm: 4px", "  md: %dpx" % inp, "  lg: %dpx" % r, "  xl: %dpx" % (r + 8), "  full: 9999px",
          "spacing:", "  xs: 4px", "  sm: 8px", "  md: 16px", "  lg: 24px", "  xl: 40px", "  2xl: 64px", "  3xl: 96px"]
    brad = {"pill": "{rounded.full}", "round": "{rounded.md}", "square": "{rounded.none}"}.get(d.get("btn"), "{rounded.md}")
    y += ["components:",
          "  button-primary:", '    backgroundColor: "{colors.primary}"', '    textColor: "{colors.on-primary}"',
          '    typography: "{typography.label-md}"', '    rounded: "%s"' % brad, "    height: 44px", "    padding: 12px",
          "  button-primary-hover:", '    backgroundColor: "{colors.primary}"', '    textColor: "{colors.on-primary}"',
          "  card:", '    backgroundColor: "{colors.surface}"', '    textColor: "%s"' % ("{colors.on-card}" if cards else "{colors.on-surface}"), '    rounded: "{rounded.lg}"', "    padding: 24px",
          "  input:", '    backgroundColor: "{colors.surface}"', '    textColor: "{colors.on-surface}"', '    rounded: "{rounded.md}"', "    height: 48px", "    padding: 12px",
          "  chip:", '    backgroundColor: "{colors.tint-1}"', '    textColor: "{colors.on-tint-1}"', '    rounded: "{rounded.full}"', "    padding: 8px",
          "---"]
    return "\n".join(y)


def build(d, iv, approved):
    dark_default = ex.lum(d["ground"]) < 0.2
    if dark_default:
        dark_t, light_t = ex.light_theme(d), ex.derive_light_from_dark(d)
    else:
        light_t, dark_t = ex.light_theme(d), ex.derive_dark(d)
    light_t, dark_t = ex.roles(light_t, False, "light"), ex.roles(dark_t, True, "dark")
    subject = [x for x in iv.get("shape_from_subject", []) if x]
    corner = d.get("corner", "even")
    # the recipe default (0) loses to a round subject; export_tokens.py --shape soft applies the same rule
    shape_flag = "soft" if subject and iv.get("shape") != "square" else None
    rx = ex.shape_radii(d, shape_flag)
    r, btn, btn_kind = rx["card"], rx["button"], rx["btn"]
    replaced = rx["replaced"]
    shape, shape_desc = shape_words(r, btn_kind, corner)
    v, m, den = DIALS.get(iv.get("energy", "balanced"), DIALS["balanced"])
    feel = ", ".join(iv.get("feel", []))
    langs = " and ".join(iv.get("languages", ["en"]))
    thai = "th" in iv.get("languages", [])
    never = list(iv.get("never", [])) + [
        ("square corners where the subject is round (%s)" % ", ".join(subject)) if subject and shape != "sharp"
        else ("all-square corners; this brief is %s" % shape) if shape != "sharp"
        else "rounded pills on a sharp, print-led brief",
        "more than two typefaces per language",
        "hiding content until a script reveals it (must be visible without JS and under reduced motion)",
        "text on the primary fill that is not `on-primary`; accent text that is not `primary-text`"]
    status = "approved" if approved else "draft"
    cards_line = ("\nCards are the opposite tone of the page in at least one theme: text on `surface` uses `on-card`, `card-muted`,"
                  " `card-primary-text` and the `card-focus` ring, never the page roles." if light_t["cards_opposite"] or dark_t["cards_opposite"] else "")
    fm = front_matter(dict(d, btn=btn_kind), iv, light_t, dark_t, rx, thai)
    shape_lines = ["Radius %dpx on cards (`rounded.lg`), buttons `%s` (%s), corner treatment `%s`; %s overall." % (r, btn_kind, btn, corner, shape)]
    if subject:
        shape_lines.append("Shapes come from the subject: %s. Check every new component against these objects before using a recipe default." % ", ".join(subject))
    if replaced:
        shape_lines.append("The direction's default radius 0 was replaced because the subject's objects are round.")
    out = f"""{fm}

# DESIGN.md: {iv.get('brand', d['name'])}

Status: {status}. Direction: {d['name']} (`{d['id']}`). Written {iv.get('date', 'today')}. Format: Google design.md spec (alpha). Source of truth for every screen; change it here first.

## Overview
{bullet(["%s: %s" % (f, MEANS.get(f.lower(), "state what this means on screen")) for f in iv.get('feel', [])])}
- {d['note']}

Philosophy, ranked:
1. Serve the one goal: {iv.get('goal', 'state the one action that counts')}.
2. Say only what can be proved: {iv.get('differentiator', 'state the differentiator')}.
3. Audience first: {iv.get('audience', 'state the audience')}.
4. Shape language is {shape}: {shape_desc}{" (from the subject: " + ", ".join(subject) + ")" if subject else ""}.

## Colors
Values live in the front matter. `primary` is for fills and buttons with `on-primary` text; `primary-text` is the
darker or lighter step for links and small accent text (4.5:1 checked). `muted` is secondary text (4.5:1),
`border` is for hairlines, `focus` is the ring color (2px, 3:1). `tint-1..4` are fills only, never text; text on a tint uses its own `on-tint-N`. The dark theme is the
`dark-*` set, derived and AA-checked; review it by eye. Status colors (`success`, `warning`, `error`) are never the only cue.{cards_line}

## Typography
- Display: {d['display']} {d['dw']}, tracking {d['track']}, because it carries the {feel or 'brand'} feel without a second display face.
- Body: {d['body']}, because it stays calm next to the display face at small sizes.
{"- Thai: Noto Sans Thai (or the display face's Thai companion); body line-height 1.6, never tracked or uppercased, because Thai needs room for stacked marks." if thai else ""}
- Languages: {langs}; the font family switches with the language, one pair per language.

## Layout
- Container 1280px, gutter clamp(20px, 5vw, 64px); 96px or more between sections on desktop.
- Hero shows the goal and one proof; the first screen reads in five seconds. Tablet 768-1024 and phone 390 are designed, not shrunk.

## Elevation & Depth
- One depth strategy only: surface rule `{d['surf']}`. Dark theme steps up in lightness instead of using shadows.

## Shapes
{bullet(shape_lines)}

## Components
- Primary button: `primary` fill (hover darkens it about 8%), `on-primary` text, 44px minimum height, one per view. Cards: `surface` on `canvas`. Inputs 48px, visible label, own error message.
- Every interactive part defines default, hover, focus-visible, pressed, disabled (advanced-components.md in the design skill).

## Do's and Don'ts
Do:
- Follow the tokens above; add a token before using a new value.
- Keep content readable with scripting off; keep the language switch from losing scroll position.
Don't:
{bullet(never)}

## Direction dials
Variance {v}/10 · Motion {m}/10 · Density {den}/10 (energy: {iv.get('energy', 'balanced')}). Motion baseline per motion.md; reduced-motion path required.

## Interaction rules
- Focus ring 2px in `focus`, offset 2px, keyboard focus only. Hover is never the only cue. Respect prefers-reduced-motion. Destructive actions confirm.

## Decision log
Interview ({iv.get('asked_by', 'user')}, {iv.get('date', 'today')}):
- Business: {iv.get('what', 'n/a')}
- Audience: {iv.get('audience', 'n/a')}; goal: {iv.get('goal', 'n/a')}
- Proof available: {", ".join(iv.get('proof_available', [])) or 'none yet (do not invent logos, numbers or testimonials)'}
- Likes: {"; ".join(iv.get('likes', [])) or 'none given'}; dislikes: {"; ".join(iv.get('dislikes', [])) or 'none given'}
- Competitors: {", ".join(iv.get('competitors', [])) or 'none given'}
- Constraints: {", ".join(iv.get('constraints', [])) or 'none given'}
- Chosen direction `{d['id']}` because it matches feel ({feel}) and shape ({shape}).
Tokens in code: `python3 scripts/export_tokens.py {d['id']}{" --shape soft" if replaced else ""} --out src/styles` (CSS, Tailwind v4, shadcn).
"""
    return re.sub(r"\n{3,}", "\n\n", out)


def px(v):
    m = re.match(r"^\s*([0-9.]+)(px|rem|em)?", str(v))
    if not m:
        return None
    n = float(m.group(1)) * (16 if m.group(2) in ("rem", "em") else 1)
    return int(round(n))


def build_from_code(res, iv, src_label):
    import datetime
    iv = dict(iv)
    iv.setdefault("date", datetime.date.today().isoformat())
    L, D = res["light"], res["dark"]
    ev, dev = res["light_evidence"], res["dark_evidence"]
    name = iv.get("brand") or os.path.basename(res["src"].rstrip("/")) or "Product"
    rows = ["canvas", "surface", "on-surface", "muted", "border", "primary", "on-primary", "primary-text",
            "focus", "success", "warning", "error"]
    y = ["---", "version: alpha", "name: %s" % ys(name),
         "description: %s" % json.dumps(iv.get("what", "Design language extracted from the shipping code"), ensure_ascii=False),
         "colors:"]
    y += ["  %s: %s" % (k, q(L[k])) for k in rows]
    if D:
        y += ["  dark-%s: %s" % (k, q(D[k])) for k in rows if k in D]
    def rv_(v, n=0):  # resolve var(--x) through the extracted variable table
        m = re.fullmatch(r"\s*var\((--[\w-]+)(?:,[^)]*)?\)\s*", str(v))
        return rv_(res["var_raw"][m.group(1)], n + 1) if m and n < 6 and m.group(1) in res["var_raw"] else v
    fams = []
    for f, _ in res["fonts"].most_common(10):
        f = rv_(f)
        first = f.split(" (")[0].split(",")[0].strip().strip("'\"")
        if first and not re.match(r"(inherit|initial|var\(|-apple|system-ui|sans-serif$|serif$|monospace$)", first) and first not in fams:
            fams.append(first)
    body_f = fams[0] if fams else "system-ui"
    disp_f = fams[1] if len(fams) > 1 else body_f
    lang = res.get("language") or {}
    thai = "th" in iv.get("languages", []) or any("thai" in f.lower() for f in fams) or bool(lang.get("thai"))
    lh = "1.6" if thai else "1.5"  # Thai rule: body line-height 1.55-1.7
    sizes = sorted({px(s) for s in res["font_sizes"] if px(s)} or {14, 16, 20, 28, 40})
    big = sizes[-1] if sizes[-1] >= 24 else 32
    def ty(n, fam, size, w, l):
        return ["  %s:" % n, "    fontFamily: %s" % json.dumps(fam), "    fontSize: %dpx" % size,
                "    fontWeight: %s" % w, "    lineHeight: %s" % l]
    y.append("typography:")
    y += ty("headline-lg", disp_f, big, 700, "1.2") + ty("body-md", body_f, 16, 400, lh) + ty("label-md", body_f, 14, 600, "1.2")
    rv = res["var_raw"].get("--radius") or res["var_raw"].get("--r")
    r = px(rv) if rv else None
    r_from = "`--radius: %s`" % rv if rv else None
    if r is None:
        cand = [(px(rv_(k)), k) for k, _ in res["radii"].most_common(10) if px(rv_(k)) is not None and px(rv_(k)) < 100]
        if cand:
            r, r_from = cand[0][0], "the most used border-radius, `%s`" % cand[0][1]
        else:
            r, r_from = 8, None
    y += ["rounded:", "  sm: %dpx" % max(2, r // 2), "  md: %dpx" % r, "  lg: %dpx" % (r + 4), "  full: 9999px",
          "spacing:", "  xs: 4px", "  sm: 8px", "  md: 16px", "  lg: 24px", "  xl: 40px",
          "components:",
          "  button-primary:", '    backgroundColor: "{colors.primary}"', '    textColor: "{colors.on-primary}"',
          '    rounded: "{rounded.md}"', "    height: 44px",
          "  card:", '    backgroundColor: "{colors.surface}"', '    textColor: "{colors.on-surface}"', '    rounded: "{rounded.lg}"',
          "---"]
    found = set(res["found_roles"])
    def evrow(k, tbl, e):
        tag = "found" if k in found and not e[k].startswith(("guessed", "derived")) else e[k].split(":")[0]
        return "| %s | %s | %s | %s |" % (k, tbl[k], tag, e[k].replace("|", "/"))
    tw = ", ".join("`%s` ×%d" % kv for kv in res["tailwind"].most_common(10)) or "none"
    drift = res["drift"] or ["none found"]
    dark_line = ("Dark theme: `dark-*` values come from the code's dark block; review them by eye." if D else
                 "Dark theme: none in code. Light only for now; adding one is a separate decision.")
    out = f"""{chr(10).join(y)}

# DESIGN.md: {name}

Status: draft. Source: extracted from code at `{src_label}` by `design_md.py --from-code` on {iv.get('date', 'today')}. It describes what ships today, not a target. Approve it (or change values here first) before treating it as binding.

## Overview
- Stack: {", ".join(res["stack"]) or "not detected"}; {res["files"]} files scanned.
- Product: {iv.get('what', 'not asked yet')}. Audience: {iv.get('audience', 'not asked yet')}. Goal: {iv.get('goal', 'not asked yet')}.
- Brownfield rule: keep the existing language; changes are scoped (polish / restyle / redesign named before work) and recorded in the Decision log.

## Colors
Values live in the front matter. Evidence per role (found = named CSS variable; guessed = from color frequency; derived = filled in so the file is complete; check every non-found row):

| Role | Value | How | Evidence |
|---|---|---|---|
{chr(10).join(evrow(k, L, ev) for k in rows)}

{dark_line}

## Typography
- Body: {body_f}; display: {disp_f}, because these are the most used families in the code (fonts seen: {", ".join("%s ×%d" % kv for kv in res["fonts"].most_common(6)) or "none"}).
- Font sizes in code: {", ".join("%s ×%d" % kv for kv in res["font_sizes"].most_common(8)) or "none (likely utility classes)"}.
{"- Thai: body line-height 1.6 (Thai rule 1.55-1.7), never tracked or uppercased" + ((" (" + lang["evidence"] + ")") if lang.get("thai") else "") + "." if thai else ""}

## Layout
- Not extracted (layout lives in components). Record container width, grid and section spacing from the main pages after the baseline audit.

## Elevation & Depth
- Not extracted. Record the one depth strategy (borders, shadows or tonal surfaces) seen in the audit.

## Shapes
- Base radius {r}px ({"from " + r_from if r_from else "a placeholder: no radius found in code; set it from the baseline audit"}). Radii in code: {", ".join("%s ×%d" % kv for kv in res["radii"].most_common(6)) or "none found"}.
- Tailwind usage (top): {tw}.

## Components
- Primary button: `primary` fill, `on-primary` text, 44px minimum height. Cards: `surface` on `canvas`.
- Inventory the real components (buttons, inputs, tables, dialogs) and their states during the baseline audit; reuse them, do not add parallel ones.

## Do's and Don'ts
Do:
- Reuse existing tokens and components; add a token before using a new value.
- Scope every change; keep a before/after for each changed screen.
Don't:
- Add new color literals in component files; use a token.
- Introduce another font family or radius without a Decision log entry.
- Redesign areas nobody asked to change.

## Drift found in code
{chr(10).join("- " + d for d in drift)}

## Direction dials
Not set: dials come from an interview or an approved direction, not from code. Set them before any restyle.

## Interaction rules
- Focus ring 2px in `focus`, offset 2px, keyboard focus only. Hover is never the only cue. Respect prefers-reduced-motion. Destructive actions confirm.

## Decision log
- {iv.get('date', 'today')}: extracted from code (`{src_label}`); Status draft. Next: baseline audit, then approve or correct each guessed/derived row.
"""
    return re.sub(r"\n{3,}", "\n\n", out)


BLOCK_START, BLOCK_END = "<!-- design-md:start -->", "<!-- design-md:end -->"
BLOCK = f"""{BLOCK_START}
## Design language
Read `DESIGN.md` before any UI work (Google design.md format: front matter tokens plus rationale): it holds the
approved direction, color roles (light and dark-*), type, shape and don'ts. Follow it over your own taste. Change a value in DESIGN.md first, then in code, and record
the reason in its Decision log. Check it with `design_md_check.py DESIGN.md` and export tokens with `export_tokens.py`
(both are in the ux-ui-principles skill's `scripts/` folder; use the path where the skill is installed). If DESIGN.md says Status: draft, ask before treating values as binding.
{BLOCK_END}
"""


def backoffice_text_roles(st):
    """on-primary, primary-text, focus for a back-office look, derived like export_tokens.roles():
    the fill keeps the look's accent; its text is the best-contrast ink; accent as text and the focus ring
    move in lightness until they pass on canvas and surface (4.5:1 and 3:1)."""
    acc, bgs = st["accent"], [st["ground"], st["surface"]]
    on_primary = st["accentInk"]
    if ex.ratio(on_primary, acc) < 4.5:
        on_primary = max([st["accentInk"], st["ground"], st["ink"], "#ffffff", "#000000"], key=lambda c: ex.ratio(c, acc))
    toward = -1 if ex.lum(st["ink"]) < ex.lum(st["ground"]) else +1
    return on_primary, ex.reach(acc, bgs, 4.5, toward), ex.reach(acc, bgs, 3.0, toward)


def build_backoffice(sid, iv):
    import datetime
    styles = json.load(open(os.path.join(HERE, "..", "assets", "backoffice", "styles.json")))
    styles = styles.get("styles", styles)
    st = next((x for x in (styles if isinstance(styles, list) else styles.values()) if x.get("id") == sid), None)
    if not st:
        ids = [x.get("id") for x in (styles if isinstance(styles, list) else styles.values())]
        die("unknown back-office look %r (choose from: %s)" % (sid, ", ".join(ids)))
    name = iv.get("brand", "Product")
    date = iv.get("date", datetime.date.today().isoformat())
    font = st.get("font", "Public Sans")
    thai = "th" in iv.get("languages", ["th"])
    fam = "%s, Noto Sans Thai" % font if thai else font
    lh = "1.6" if thai else "1.5"
    ok, warn, bad = st["ok"], st["warn"], st["bad"]
    r, fs, rowh = st.get("radius", 4), st.get("fs", 14), st.get("rowH", 40)
    who = iv.get("audience", "operators and managers (assumed)")
    goal = iv.get("goal", "finish the daily job faster with fewer errors (assumed)")
    asked = iv.get("asked_by", "assumed (user away)")
    def ty(n, size, w, l):
        return ["  %s:" % n, "    fontFamily: %s" % json.dumps(fam), "    fontSize: %dpx" % size, "    fontWeight: %s" % w, "    lineHeight: %s" % l]
    y = ["---", "version: alpha", "name: %s" % ys(name),
         "description: %s" % json.dumps(iv.get("what", "Product UI, %s look" % st["name"]), ensure_ascii=False), "colors:"]
    on_primary, primary_text, focus = backoffice_text_roles(st)
    for k, v in [("canvas", st["ground"]), ("surface", st["surface"]), ("sidebar", st["side"]), ("on-surface", st["ink"]),
                 ("muted", st["muted"]), ("border", st["line"]), ("primary", st["accent"]), ("on-primary", on_primary),
                 ("primary-soft", st["accentSoft"]), ("primary-text", primary_text), ("focus", focus),
                 ("success", ok[0]), ("success-soft", ok[1]), ("warning", warn[0]), ("warning-soft", warn[1]),
                 ("error", bad[0]), ("error-soft", bad[1])]:
        y.append("  %s: %s" % (k, q(v)))
    y.append("typography:")
    y += ty("headline-lg", fs + 6, 600, "1.3") + ty("kpi", 28, 600, "1.3") + ty("body-md", fs, 400, lh) + ty("label-md", 12, 500, "1.4")
    y += ["rounded:", "  sm: %dpx" % r, "  md: %dpx" % r, "  lg: %dpx" % r, "  full: 9999px",
          "spacing:", "  xs: 4px", "  sm: 8px", "  md: 16px", "  lg: %dpx" % st.get("pad", 24), "  xl: 40px",
          "components:",
          "  button-primary:", '    backgroundColor: "{colors.primary}"', '    textColor: "{colors.on-primary}"', '    rounded: "{rounded.md}"', "    height: 32px",
          "  card:", '    backgroundColor: "{colors.surface}"', '    textColor: "{colors.on-surface}"', '    rounded: "{rounded.lg}"', "---"]
    body = f"""
# DESIGN.md: {name}

Status: draft. Written {date} from the back-office look `{sid}` (assets/backoffice/styles.json) and the brief. Answers marked *assumed* came from defaults, not from the user ({asked}). Approve or correct them before they bind.

## Overview
- Users: {who}. Job: {goal}.
- Page rule: one question per page; order by the role's reason for arriving (operators: exceptions first; managers: KPIs first).
- Look: `{sid}`, {st.get("note", "")}
- Rigor: Standard; approvals, payments and anything irreversible are Critical.
- Locale: {"th-TH, Buddhist Era dates, ฿ with thousands separators" if thai else "set per product"}.

## Colors
Values are in the front matter. `primary` marks the main action and the current nav item only. Status uses `success` / `warning` / `error` with their `-soft` tints and is always icon + text. Control borders need 3:1; decorative card and row rules stay light. Dark theme: none yet; add as a separate decision (`export_tokens.py`, contrast checked).

## Typography
- {font}{" with Noto Sans Thai fallback" if thai else ""}. Body {fs}px/{lh}, labels 12px, page title {fs + 6}px, KPI 28px (never above 30px).
- Numbers use tabular figures and align right in tables. Never track or uppercase Thai.

## Layout
- Shell: {"side navigation" if st.get("nav") == "side" else "top navigation"}, sticky top bar, content padding {st.get("pad", 24)}px, max width 1280px, gap 16px.
- Table rows {rowh}px. Stack to one column at 1100px; navigation becomes a drawer and tables become cards at 860px.

## Elevation & Depth
One strategy: 1px borders. No resting shadows. Shadows only on floating elements (dialog, menu, toast).

## Shapes
Radius {r}px on buttons, inputs, cards and pills. Fully round only for count badges.

## Components
- Button 32px high (44px on touch), one primary per card, verb labels.
- Table: row rules, no zebra, identifier first, amounts right-aligned, status pill (icon + text).
- Dialog only for decisions that need interruption: repeats the amount and destination, reject needs a reason.
- KPI tile: title, value, delta with trend icon and hidden text, comparison, freshness, links to its source.

## Iconography
- One family for the whole product: outline, 24px grid, 1.75 stroke, round caps, `currentColor`, delivered as one sprite or one package.
- Navigation, primary actions, status and toolbars use icon + visible label. Icon-only only for universally known actions (bell, search, close, menu) and then with an accessible name and a title.
- Status icons sit beside text. Trend uses icons plus hidden text, not the characters up/down triangle.
- Sizes: 16px with {fs}px text, 20px icon-only, 12px inside pills. Target stays at least 44px on touch.
- Keep a table of glyph → meaning → where used in this file. One meaning per glyph.

## Data honesty
Every KPI states unit, period, comparison and freshness. Totals and deltas are recomputed from displayed values. Zero and missing look different. No sparkline per KPI, no icon-in-circle per KPI.

## Do's and Don'ts
Do:
- Reuse tokens and the icon set; add a token before a new value.
- Keep filters, sort and tab in the URL.
Don't:
- Use color as the only status cue.
- Add a second icon family or another radius without a Decision log entry.

## Direction dials
variance 2 · motion 2 · density {iv.get("density", 7)}/10. Motion only for toast and drawer, with `prefers-reduced-motion` honoured.

## Interaction rules
Focus ring 2px `focus` with 2px offset. Hover is never the only cue. Money and destructive actions use check-and-confirm; block duplicate submit while pending.

## Decision log
- {date}: created from back-office look `{sid}`; Status draft. {asked}.
- Open: real roles and modules, approval rules, brand colors, dark theme.
"""
    return "\n".join(y) + "\n" + body


def wire(dirpath):
    names = [n for n in ("AGENTS.md", "CLAUDE.md") if os.path.exists(os.path.join(dirpath, n))] or ["AGENTS.md"]
    for n in names:
        p = os.path.join(dirpath, n)
        t = open(p, encoding="utf-8").read() if os.path.exists(p) else ""
        if BLOCK_START in t:
            t = re.sub(re.escape(BLOCK_START) + r"[\s\S]*?" + re.escape(BLOCK_END) + r"\n?", BLOCK, t)
        else:
            t = t.rstrip() + ("\n\n" if t.strip() else "") + BLOCK
        write_atomic(p, t)
        print("wired", p)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        die("%s (run with --help)" % message)


def out_dir(a):
    """--out, else the current folder; refuse the skill folder itself (the file belongs in the project)."""
    if a.out:
        return a.out
    cwd = os.path.realpath(".")
    if cwd == os.path.realpath(SKILL) or cwd.startswith(os.path.realpath(SKILL) + os.sep):
        die("the current folder is inside the skill (%s); run from the project or pass --out DIR" % SKILL)
    return "."


def target(a, out, hint=""):
    path = os.path.join(out, "DESIGN.md")
    if os.path.exists(path) and not a.force:
        die("DESIGN.md already exists in %s (use --force to overwrite%s)" % (out, hint))
    return path


def main(argv=None):
    ap = Parser(prog="design_md.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("id", nargs="?", help="direction id")
    ap.add_argument("--interview", metavar="FILE")
    ap.add_argument("--out", metavar="DIR")
    ap.add_argument("--wire", action="store_true")
    ap.add_argument("--approved", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--from-code", metavar="SRC")
    ap.add_argument("--backoffice", metavar="STYLE")
    ap.add_argument("--template-interview", action="store_true")
    a = ap.parse_args(sys.argv[1:] if argv is None else argv)
    if a.template_interview:
        print(json.dumps(TEMPLATE, ensure_ascii=False, indent=2))
        return 0
    modes = [m for m in ("id", "from_code", "backoffice") if getattr(a, m)]
    if len(modes) > 1:
        die("give one of: a direction id, --from-code SRC, --backoffice STYLE")
    if a.backoffice is not None:
        iv = load_interview(a.interview)
        out = out_dir(a)
        path = target(a, out)
        write_atomic(path, build_backoffice(a.backoffice, iv))
        print("wrote", path)
    elif a.from_code is not None:
        if not os.path.isdir(a.from_code):
            die("--from-code needs a folder: %s (pass the codebase root)" % a.from_code)
        import code_extract  # noqa: E402
        iv = load_interview(a.interview)
        out = out_dir(a)
        path = target(a, out, "; or compare with code_extract.py SRC first")
        if a.approved:
            print("note: --from-code always writes Status: draft")
        res = code_extract.extract(a.from_code)
        write_atomic(path, build_from_code(res, iv, a.from_code))
        print("wrote", path)
    else:
        if not a.id or not a.interview:
            die("give a direction id and --interview FILE (or --from-code SRC / --backoffice STYLE; run with --help)")
        iv = load_interview(a.interview)
        d = load_direction(a.id)
        out = out_dir(a)
        path = target(a, out)
        write_atomic(path, build(d, iv, a.approved))
        print("wrote", path)
    if a.wire:
        try:
            wire(out)
        except OSError as e:
            die("cannot wire AGENTS.md / CLAUDE.md in %s (%s)" % (out, e))
    return 0


if __name__ == "__main__":
    sys.exit(main())
