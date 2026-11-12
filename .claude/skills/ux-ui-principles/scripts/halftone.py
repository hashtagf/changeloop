#!/usr/bin/env python3
"""Real one-ink halftone (AM dot screen) from a photograph, for print-led directions
(Halftone, Riso, Paste-up, Newsprint). Dot size follows the picture's darkness, so the
image reads as printed; a CSS dot pattern laid over a photo does not.

  python3 scripts/halftone.py in.jpg out.jpg --size 900 --ink "#2a1410" --paper "#f8f1d9"
  python3 scripts/halftone.py in.jpg out.jpg --size 1200x800 --cell 8 --angle 15 --bright 2.2 --crop-x 0.6 --eq

--size     output WxH or one number for a square (cover crop)
--cell     screen pitch in px (7-10 reads as print at 1x; smaller looks like noise)
--angle    screen angle; 45 for black, 15 or 75 for a colour ink
--bright   gamma lift (>1 opens the midtones; most photos need 1.5-2.2)
--crop-x   horizontal crop centre 0-1, to keep the subject in a square crop
--eq       equalize the histogram first (rescues flat or dark photos)

Pick photos with clear shapes on a light-to-mid ground (beans in a scoop, a cup, hands).
A dark, busy photo turns to mud in one ink: use it as a one-colour duotone band instead.
--ink / --paper take hex colours (#rgb or #rrggbb, # optional). Exit 0 written, 2 bad input (unreadable
picture, bad flag value), 3 Pillow missing.
Standard library + Pillow.
"""
import argparse, math, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _color import hex_rgb as _hex01, is_hex  # noqa: E402


def die(msg):
    sys.stderr.write('error: %s\n' % msg)
    sys.exit(2)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write('error: %s (run with --help)\n' % message)
        sys.exit(2)


def hex_rgb(h):
    """'#rgb' / '#rrggbb' -> (r, g, b) 0..255."""
    return tuple(round(c * 255) for c in _hex01(h))


def main():
    ap = Parser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--size', default='900'); ap.add_argument('--cell', type=float, default=8)
    ap.add_argument('--ink', default='#2a1410'); ap.add_argument('--paper', default='#f8f1d9')
    ap.add_argument('--angle', type=float, default=45); ap.add_argument('--bright', type=float, default=1.6)
    ap.add_argument('--crop-x', type=float, default=0.5); ap.add_argument('--eq', action='store_true')
    ap.add_argument('--quality', type=int, default=80)
    a = ap.parse_args()
    for flag, v in (('--cell', a.cell), ('--angle', a.angle), ('--bright', a.bright), ('--crop-x', a.crop_x)):
        if not math.isfinite(v):
            die('%s %r: must be a finite number' % (flag, v))
    for flag, v in (('--ink', a.ink), ('--paper', a.paper)):
        if not is_hex(v) or len(v.lstrip('#')) not in (3, 6):
            die('%s %r is not a hex colour; use #rgb or #rrggbb, e.g. %s "#2a1410"' % (flag, v, flag))
    try:
        w, h = (int(v) for v in a.size.lower().split('x')) if 'x' in a.size.lower() else (int(a.size),) * 2
    except ValueError:
        die('--size %r: use WxH or one number, e.g. --size 1200x800' % a.size)
    if not (16 <= w <= 8000 and 16 <= h <= 8000):
        die('--size %r: each side must be 16-8000 px' % a.size)
    if not 2 <= a.cell <= 200:
        die('--cell %g: use a screen pitch of 2-200 px (7-10 reads as print)' % a.cell)
    if a.bright <= 0:
        die('--bright %g: must be above 0 (1.5-2.2 suits most photos)' % a.bright)
    if not 0 <= a.crop_x <= 1:
        die('--crop-x %g: must be 0-1' % a.crop_x)
    if not 1 <= a.quality <= 100:
        die('--quality %d: must be 1-100' % a.quality)
    if not os.path.isfile(a.src):
        die('no picture at %s (check the path)' % a.src)
    try:
        from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
    except ImportError:
        print('NOT RUN: Pillow is needed (pip install pillow)', file=sys.stderr)
        sys.exit(3)
    try:
        src = Image.open(a.src).convert('L')
    except (OSError, ValueError) as e:
        die('%s is not a readable picture (%s)' % (a.src, e))
    im = ImageOps.fit(src, (w, h), centering=(a.crop_x, 0.5))
    if a.eq:
        im = ImageOps.equalize(im)
    im = im.point(lambda v: int(255 * ((v / 255) ** (1 / a.bright))))
    im = ImageEnhance.Contrast(im).enhance(1.35).filter(ImageFilter.GaussianBlur(a.cell / 4))
    S = 3  # supersample, then downscale for clean dot edges
    W, H = w * S, h * S
    canvas = Image.new('RGB', (W, H), hex_rgb(a.paper))
    d = ImageDraw.Draw(canvas)
    ink = hex_rgb(a.ink)
    t = math.radians(a.angle); ct, st = math.cos(t), math.sin(t)
    c = a.cell * S; n = int(max(W, H) * 1.5 / c) + 2
    px = im.tobytes()  # one byte per pixel (mode L)
    for i in range(-n, n):
        for j in range(-n, n):
            x = i * c * ct - j * c * st + W / 2
            y = i * c * st + j * c * ct + H / 2
            if not (-c < x < W + c and -c < y < H + c):
                continue
            dark = 1 - px[min(h - 1, max(0, int(y / S))) * w + min(w - 1, max(0, int(x / S)))] / 255
            r = c * 0.72 * math.sqrt(dark)
            if r > 0.4:
                d.ellipse((x - r, y - r, x + r, y + r), fill=ink)
    try:
        canvas.resize((w, h), Image.Resampling.LANCZOS).save(a.out, quality=a.quality, optimize=True, progressive=True)
    except (OSError, ValueError) as e:
        die('cannot write %s (%s; check the folder and the extension, e.g. .jpg)' % (a.out, e))
    print('wrote %s (%dx%d, cell %g, ink %s on %s)' % (a.out, w, h, a.cell, a.ink, a.paper))


if __name__ == '__main__':
    main()
