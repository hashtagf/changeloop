"""Shared sRGB colour maths for the skill's scripts (export_tokens, design_md, design_md_check, code_extract,
icons, tweaks_panel, contrast, direction_recipe). One place for luminance, contrast and OKLCH; standard library only.

Stable API (other scripts import these names; keep them, add aliases when renaming):
  is_hex(h)            True for #rgb, #rgba, #rrggbb, #rrggbbaa (the # is optional)
  hex_rgb(h)           [r, g, b] in 0..1, alpha dropped; ValueError when not a hex colour
  hex_rgba(h)          [r, g, b, a] in 0..1 (a = 1 when the hex has no alpha)
  has_alpha(h)         True when a 4/8-digit hex carries alpha below 1
  norm_hex(h)          '#rrggbb' lower case
  lin(c)               sRGB channel -> linear light
  lum(h)               WCAG 2.x relative luminance (alias: luminance)
  ratio(a, b)          WCAG 2.x contrast ratio, 1..21 (alias: contrast)
  best_ink(bg, cands)  the candidate with the highest contrast on bg
  to_oklch / from_oklch / mix / reach   OKLCH helpers used to derive passing colours
  CSS_NAMED            {css colour keyword: '#rrggbb'} for the 148 CSS named colours (transparent excluded)
"""
import math
import re

_HEX = re.compile(r"^#?([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")


def is_hex(h):
    """True when h is a 3/4/6/8-digit hex colour, with or without '#'."""
    return isinstance(h, str) and bool(_HEX.match(h.strip()))


def hex_rgba(h):
    """'#abc' / '#abcd' / '#aabbcc' / '#aabbccdd' (with or without #) -> [r, g, b, a] in 0..1. ValueError otherwise."""
    m = _HEX.match(str(h).strip())
    if not m:
        raise ValueError("not a hex color: %r" % (h,))
    s = m.group(1)
    if len(s) in (3, 4):
        s = "".join(c * 2 for c in s)
    a = int(s[6:8], 16) / 255 if len(s) == 8 else 1.0
    return [int(s[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [a]


def hex_rgb(h):
    """'#abc' / '#abcd' / '#aabbcc' / '#aabbccdd' -> [r, g, b] in 0..1 (alpha dropped). ValueError otherwise."""
    return hex_rgba(h)[:3]


def has_alpha(h):
    """True when the hex carries an alpha channel below 1 (#rgba / #rrggbbaa); False for opaque or invalid input."""
    try:
        return hex_rgba(h)[3] < 1
    except ValueError:
        return False


def norm_hex(h):
    """Any hex form -> '#rrggbb' lower case (alpha dropped)."""
    return "#" + "".join("%02x" % round(c * 255) for c in hex_rgb(h))


def lin(c):
    """sRGB channel (0..1) -> linear light."""
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def delin(c):
    """Linear light -> sRGB channel (0..1), clamped."""
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def lum(h):
    """WCAG 2.x relative luminance of a hex colour (0 black .. 1 white); alpha ignored."""
    r, g, b = [lin(x) for x in hex_rgb(h)]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    """WCAG 2.x contrast ratio between two hex colours (order does not matter), 1..21."""
    x, y = sorted((lum(a), lum(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


luminance = lum
contrast = ratio


def best_ink(bg, candidates=("#ffffff", "#111111")):
    """The candidate with the highest contrast on bg (ties keep the first)."""
    return max(candidates, key=lambda c: ratio(c, bg))


# ---------- OKLCH ----------
def to_oklch(h):
    """hex -> (L 0..1, C, H degrees)."""
    r, g, b = [lin(x) for x in hex_rgb(h)]
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = l ** (1 / 3), m ** (1 / 3), s ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360


def from_oklch(L, C, H):
    """(L 0..1, C, H degrees) -> '#rrggbb' (clipped to sRGB)."""
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return "#" + "".join("%02x" % round(delin(x) * 255) for x in (r, g, bl))


def mix(a, b, t):
    """t of b over a, in linear light -> '#rrggbb'."""
    ra, rb = [lin(x) for x in hex_rgb(a)], [lin(x) for x in hex_rgb(b)]
    return "#" + "".join("%02x" % round(delin(x * (1 - t) + y * t) * 255) for x, y in zip(ra, rb))


def reach(color, bg, need, direction):
    """Move the OKLCH lightness of color (+1 lighter, -1 darker) until it has `need` contrast on bg
    (one hex or a list of hexes). Returns the first passing colour, or the end of the walk."""
    bgs = [bg] if isinstance(bg, str) else list(bg)
    L, C, H = to_oklch(color)
    for _ in range(60):
        c = from_oklch(L, C, H)
        if all(ratio(c, b) >= need for b in bgs):
            return c
        L = max(0.0, min(1.0, L + 0.01 * direction))
    return from_oklch(L, C, H)


def readable(color, bg, need=4.5):
    """color itself when it reaches `need` on bg (one hex or a list), else the lightness step toward the
    side with more room (darker on a light ground, lighter on a dark one)."""
    bgs = [bg] if isinstance(bg, str) else list(bg)
    if all(ratio(color, b) >= need for b in bgs):
        return norm_hex(color)
    return reach(color, bgs, need, -1 if sum(lum(b) for b in bgs) / len(bgs) > 0.18 else +1)


# ---------- CSS named colours ----------
_NAMED = """
aliceblue f0f8ff antiquewhite faebd7 aqua 00ffff aquamarine 7fffd4 azure f0ffff beige f5f5dc bisque ffe4c4
black 000000 blanchedalmond ffebcd blue 0000ff blueviolet 8a2be2 brown a52a2a burlywood deb887
cadetblue 5f9ea0 chartreuse 7fff00 chocolate d2691e coral ff7f50 cornflowerblue 6495ed cornsilk fff8dc
crimson dc143c cyan 00ffff darkblue 00008b darkcyan 008b8b darkgoldenrod b8860b darkgray a9a9a9
darkgreen 006400 darkgrey a9a9a9 darkkhaki bdb76b darkmagenta 8b008b darkolivegreen 556b2f darkorange ff8c00
darkorchid 9932cc darkred 8b0000 darksalmon e9967a darkseagreen 8fbc8f darkslateblue 483d8b
darkslategray 2f4f4f darkslategrey 2f4f4f darkturquoise 00ced1 darkviolet 9400d3 deeppink ff1493
deepskyblue 00bfff dimgray 696969 dimgrey 696969 dodgerblue 1e90ff firebrick b22222 floralwhite fffaf0
forestgreen 228b22 fuchsia ff00ff gainsboro dcdcdc ghostwhite f8f8ff gold ffd700 goldenrod daa520 gray 808080
green 008000 greenyellow adff2f grey 808080 honeydew f0fff0 hotpink ff69b4 indianred cd5c5c indigo 4b0082
ivory fffff0 khaki f0e68c lavender e6e6fa lavenderblush fff0f5 lawngreen 7cfc00 lemonchiffon fffacd
lightblue add8e6 lightcoral f08080 lightcyan e0ffff lightgoldenrodyellow fafad2 lightgray d3d3d3
lightgreen 90ee90 lightgrey d3d3d3 lightpink ffb6c1 lightsalmon ffa07a lightseagreen 20b2aa
lightskyblue 87cefa lightslategray 778899 lightslategrey 778899 lightsteelblue b0c4de lightyellow ffffe0
lime 00ff00 limegreen 32cd32 linen faf0e6 magenta ff00ff maroon 800000 mediumaquamarine 66cdaa
mediumblue 0000cd mediumorchid ba55d3 mediumpurple 9370db mediumseagreen 3cb371 mediumslateblue 7b68ee
mediumspringgreen 00fa9a mediumturquoise 48d1cc mediumvioletred c71585 midnightblue 191970 mintcream f5fffa
mistyrose ffe4e1 moccasin ffe4b5 navajowhite ffdead navy 000080 oldlace fdf5e6 olive 808000 olivedrab 6b8e23
orange ffa500 orangered ff4500 orchid da70d6 palegoldenrod eee8aa palegreen 98fb98 paleturquoise afeeee
palevioletred db7093 papayawhip ffefd5 peachpuff ffdab9 peru cd853f pink ffc0cb plum dda0dd powderblue b0e0e6
purple 800080 rebeccapurple 663399 red ff0000 rosybrown bc8f8f royalblue 4169e1 saddlebrown 8b4513
salmon fa8072 sandybrown f4a460 seagreen 2e8b57 seashell fff5ee sienna a0522d silver c0c0c0 skyblue 87ceeb
slateblue 6a5acd slategray 708090 slategrey 708090 snow fffafa springgreen 00ff7f steelblue 4682b4 tan d2b48c
teal 008080 thistle d8bfd8 tomato ff6347 turquoise 40e0d0 violet ee82ee wheat f5deb3 white ffffff
whitesmoke f5f5f5 yellow ffff00 yellowgreen 9acd32
""".split()
CSS_NAMED = {n: "#" + h for n, h in zip(_NAMED[::2], _NAMED[1::2])}
