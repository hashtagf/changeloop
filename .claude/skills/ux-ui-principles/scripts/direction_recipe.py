#!/usr/bin/env python3
"""Print a build recipe for a direction: hard rules, banned, required components, motion, pre-flight.

Usage:
  python3 direction_recipe.py <direction-id> [--out recipe.md]
  python3 direction_recipe.py --list

The recipe is derived from assets/directions/directions.json (palette, type, radius, button shape, corner
treatment, surface rule, hero composition). It is a checklist to build and review against, in the style of
the template pre-flights studied in assets/evidence.md. The display clamp is export_tokens.DISPLAY_CLAMP (the
same value tokens.css ships). Pure #000 / #fff are banned except where the direction's own tokens name them
(brutal's ink is #000000; many surfaces are #ffffff). Exit 0 ok, 2 unknown direction or bad flag.
Standard library only.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DIRS = os.path.join(HERE, "..", "assets", "directions", "directions.json")
sys.path.insert(0, HERE)
from export_tokens import DISPLAY_CLAMP  # noqa: E402
from _color import norm_hex, is_hex  # noqa: E402
import _net  # noqa: E402

PURE = {"#000000": "#000", "#ffffff": "#fff"}


def die(msg):
    sys.stderr.write("error: %s\n" % msg)
    sys.exit(2)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        die("%s (run with --help)" % message)

HERO = {
    "split": "Split hero: headline and actions on one side, one art or product panel on the other; the panel never covers the headline.",
    "settled": "Settled hero: left-aligned headline, one lede (max 52ch), two CTAs, a proof strip directly below.",
    "giant": "Giant hero: one oversized word or numeral bleeds the viewport; metadata blocks small and quiet beside it.",
    "stagger": "Staggered hero: headline lines offset, one sticker or tilted element; keep the CTA on the straight baseline.",
    "arch": "Arch hero: one arch-framed image or panel as the single free-form shape; text stays rectangular.",
    "band": "Band hero: a full-width color band with the headline inside; the next section starts on paper.",
    "full": "Full-bleed hero: art or image edge to edge with text on a guaranteed-contrast plate or scrim.",
}
SURF = {
    "flat": ("tone steps only; no shadows, no borders heavier than a hairline", ["drop shadows", "glows", "borders heavier than 1px"]),
    "outline": ("1px borders carry structure; no resting shadows", ["resting shadows", "gradients behind cards"]),
    "offset": ("hard offset shadows (same ink, no blur) as the one depth device", ["blurred shadows", "glows"]),
    "lift": ("one soft, wide, low-opacity shadow lifts cards (for example 0 20px 40px -15px at 5-8%)", ["hard outlines on cards", "stacked heavy shadows"]),
    "plastic": ("tinted translucent surfaces with a soft inner highlight; one tint per card group", ["opaque grey cards", "hard black borders"]),
    "sticker": ("thick-edged stickers with a slight tilt; at most 3 tilted elements per page", ["tilting body text", "more than 3 tilted elements"]),
    "paper": ("paper tone steps with a fine rule; grain only as a faint background layer", ["glossy gradients", "neon accents"]),
}


def items():
    raw = json.load(open(DIRS, encoding="utf-8"))
    return raw if isinstance(raw, list) else raw["directions"]


def load(did):
    for d in items():
        if d["id"] == did:
            return d
    die("unknown direction: %s (try --list)" % did)


def pure_roles(d):
    """{role: '#000'/'#fff'} for the direction's own tokens that are pure black or white."""
    return {k: PURE[norm_hex(d[k])] for k in ("ground", "surface", "ink", "muted") if is_hex(d.get(k, "")) and norm_hex(d[k]) in PURE}


def recipe(d):
    r = int(d["radius"])
    btn = d.get("btn", "round")
    square = r <= 2 and btn == "square"
    surf_rule, surf_bans = SURF.get(d.get("surf"), ("one depth strategy", []))
    shape = {"pill": "full pills (999px)", "round": "rounded (about %dpx)" % max(8, round(r * 0.6)), "square": "square (0)"}[btn]
    pure = pure_roles(d)
    named = ", ".join("%s %s" % (k, v) for k, v in pure.items())
    bans = ["pure #000 or #fff as text or ground" if not pure else
            "pure #000 or #fff anywhere the tokens do not name it (named here: %s)" % named, "a display face other than %s" % d["display"], "gradient text",
            "emoji as feature icons", "three equal icon-heading-text cards in a row", "invented metrics, logos or testimonials",
            "AI cliche copy (Elevate, Seamless, Unleash, Next-Gen)"] + surf_bans
    # Radius is a default, never a ban: the subject's own objects decide (design-quality.md §1).
    motion = ("hero entrance plus once-only section reveal; transform and opacity only; no linear or ease-in-out; reduced-motion path"
              if d.get("group") != "atmospheric" else "one slow ambient layer (24s or longer) plus hero entrance; transform and opacity only; reduced-motion path")
    L = []
    A = L.append
    A("# Recipe: %s (`%s`, %s)\n" % (d["name"], d["id"], d["group"]))
    A("> %s\n" % d["note"])
    A("## Hard rules")
    A("- **Ground** `%s`, **surface** `%s`, **ink** `%s`, **muted** `%s` (%s)." % (
        d["ground"], d["surface"], d["ink"], d["muted"],
        "never pure black or white" if not pure else "pure %s only where named here: %s" % (" / ".join(sorted(set(pure.values()))), named)))
    A("- **One accent** `%s` with `%s` text on it. The solid accent fill (primary CTA) appears once per view; a nav CTA is outlined or is the same action; other uses are small (eyebrow, link, focus). Links and small accent text use the derived `accent-text` step (`scripts/export_tokens.py`)." % (d["accent"], d["accentInk"]))
    A("- **Tints** %s for fills only, never for text." % ", ".join("`%s`" % t for t in d["tints"]))
    A("- **Type**: display %s %s, tracking %s%s; body %s. One pair per language; Thai uses %s, body line-height 1.55-1.7." % (d["display"], d["dw"], d["track"], ", uppercase" if d.get("case") == "upper" else "", d["body"], d.get("thai", "Noto Sans Thai")))
    A("- **Shape (default, check against the subject)**: radius %dpx on cards, buttons %s, corner treatment `%s`. List 3-5 objects from the client's world first; keep this default only if they agree (a bean, cup or bag is round; a ledger, ticket or poster is square)." % (r, shape, d.get("corner", "even")))
    A("- **Depth**: %s." % surf_rule)
    if d.get("images"):
        A("- **Images**: %s" % d["images"])
    A("- Section padding 96px or more on desktop; display scale %s (`--text-display` in tokens.css)." % DISPLAY_CLAMP)
    A("\n## Banned")
    A("\n".join("- %s" % b for b in bans))
    A("\n## Required components")
    A("- %s" % HERO.get(d.get("hero"), "Hero with the goal and one proof."))
    A("- Navigation: %s." % ("sticky bar with a hairline rule" if square else "floating pill or soft bar, 44px targets"))
    A("- Primary CTA says what happens (\"Book a 30-minute call\", not \"Get started\"); one primary per view.")
    A("- A proof block under the hero. With no real proof yet, replace it with a how-we-work strip (steps, what you get, how long) rather than invented logos or numbers; an uneven-weight feature area (not three equal cards), one closing band, a footer with a hairline above.")
    A("\n## Motion")
    A("- %s." % motion)
    A("\n## Pre-flight")
    for c in ["Ground, ink and accent come from the tokens; no raw hex outside the token block",
              "Solid accent fill once per view (nav CTA outlined); accent text uses `accent-text`",
              "Display and body faces are exactly the two named above; Thai pair set per language",
              "Shape checked against 3-5 objects from the client's world (design-quality §1); recipe radius kept only if they agree",
              "One radius per component class, from tokens (default: buttons %s, cards %dpx)" % (shape, r),
              "Depth follows `%s` only" % d.get("surf"),
              "No banned device appears (see list)",
              "Hero matches `%s`; first screen reads in five seconds" % d.get("hero"),
              "Section types alternate; one decisive flourish",
              "Content visible without JS and under reduced motion",
              "`render_check.js` clean at 1440, 768 and 390; `contrast.py --css` passes; `slop_check.py` has no flags"]:
        A("- [ ] %s" % c)
    return "\n".join(L) + "\n"


def main(argv=None):
    ap = Parser(prog="direction_recipe.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("id", nargs="?", help="direction id (see --list)")
    ap.add_argument("--out", metavar="FILE", help="write the recipe to FILE instead of printing it")
    ap.add_argument("--list", action="store_true", help="list direction ids")
    a = ap.parse_args(sys.argv[1:] if argv is None else argv)
    if a.list:
        print(", ".join(x["id"] for x in items()))
        return 0
    if not a.id:
        ap.error("give a direction id (or --list)")
    out = recipe(load(a.id))
    if a.out:
        try:
            _net.write_atomic(a.out, out)
        except OSError as e:
            die("cannot write %s (%s)" % (a.out, e))
        print("wrote", a.out)
    else:
        print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
