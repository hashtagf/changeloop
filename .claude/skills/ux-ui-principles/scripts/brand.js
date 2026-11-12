/*
 * One brand, one token set. A direction (assets/directions/directions.json) is the single source for a
 * product's public pages AND its product UI: the same ground, ink, accent, faces and radius. What differs by
 * surface is structure and density (navigation, table style, row height), which comes from the closest
 * back-office look in assets/backoffice/styles.json.
 *
 *   productStyle(direction, styles) -> a back-office style object (same keys as styles.json), so
 *   backoffice_preview.js --direction <id> draws the admin screens of that brand.
 *
 * The base look is chosen from the direction's character unless the direction names one in
 * `product.base`; `product` may also override nav, tbl, density (comfortable | compact).
 * Colour maths: scripts/_color.js. Standard library only.
 */

const color = require('./_color');

// luminance of a colour string; 1 (treated as light) when it cannot be parsed
const lum = (h) => { const v = color.luminance(h); return v == null ? 1 : v; };
function mix(a, b, t) { // a*(1-t) + b*t, hex out; a unchanged when either is not a colour
  const x = color.parse(a), y = color.parse(b); if (!x || !y) return a;
  return color.toHex([0, 1, 2].map((i) => x[i] * (1 - t) + y[i] * t));
}
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// the most raised mix of ground toward ink that still keeps ink and muted at 4.5:1
function raised(ground, ink, muted) {
  for (const t of [0.1, 0.08, 0.06, 0.04, 0.02]) {
    const s = mix(ground, ink, t);
    if (contrast(ink, s) >= 4.5 && contrast(muted, s) >= 4.5) return s;
  }
  return ground;
}

function baseFor(d) {
  if (d.product && d.product.base) return d.product.base;
  const dark = lum(d.ground) < 0.2;
  const mono = /mono/i.test(d.display + d.body);
  const print = d.radius <= 2 && (d.btn === 'square' || !d.btn);
  if (dark) return mono ? 'graphite' : 'night';
  if (mono) return 'mono';
  if (print) return d.group === 'playful' ? 'contrast' : 'ledger';
  if (d.radius >= 20) return 'calm';
  return 'harbor';
}

function productStyle(d, styles) {
  const baseId = baseFor(d);
  const b = styles.find((s) => s.id === baseId) || styles[0];
  const dark = lum(d.ground) < 0.2;
  // product UI wants a quieter ground than a poster: keep the hue, pull it toward the surface
  const ground = dark ? d.ground : mix(d.ground, d.surface, 0.35);
  // product UI puts ink and muted text on its cards: a surface of the opposite tone (light plan cards on a dark
  // page, e.g. squeeze) would give 1:1 text, so derive a raised step of the page tone instead
  const surface = contrast(d.ink, d.surface) >= 4.5 && contrast(d.muted, d.surface) >= 4.5 ? d.surface : raised(ground, d.ink, d.muted);
  const r = Math.min(d.radius, 14);
  // keep the direction's ink on the accent if it passes, else white/#111, else the best candidate (as export_tokens.roles())
  const bw = contrast('#ffffff', d.accent) >= contrast('#111111', d.accent) ? '#ffffff' : '#111111';
  const accentInk = contrast(d.accentInk, d.accent) >= 4.5 ? d.accentInk : contrast(bw, d.accent) >= 4.5 ? bw
    : [d.accentInk, d.ground, d.ink, '#ffffff', '#000000'].reduce((x, y) => (contrast(y, d.accent) > contrast(x, d.accent) ? y : x));
  const p = d.product || {};
  const compact = p.density === 'compact' || (!p.density && b.rowH <= 44);
  return Object.assign({}, b, {
    id: d.id, name: `${d.name} (product)`, note: `Product UI of the ${d.name} direction on the ${b.name} structure.`,
    dark, ground, surface, side: dark ? mix(d.ground, surface, 0.5) : surface, sideDark: false,
    ink: d.ink, muted: d.muted, line: mix(surface, d.ink, dark ? 0.18 : 0.12),
    accent: d.accent, accentInk, accentSoft: mix(surface, d.accent, dark ? 0.22 : 0.14),
    font: d.body, displayFont: d.display,
    radius: r, cr: Math.min(r + 4, 18), br: d.btn === 'pill' ? 999 : Math.min(r, 10), fr: Math.min(r, 10), nr: Math.min(r, 10),
    chip: d.btn === 'square' ? 'square' : (b.chip || 'pill'),
    edge: r <= 2 ? 'line' : b.edge,
    nav: p.nav || b.nav, tbl: p.tbl || b.tbl,
    rowH: compact ? Math.min(b.rowH, 44) : Math.max(b.rowH, 48),
    direction: d.id, base: b.id,
  });
}

module.exports = { productStyle, baseFor, mix, lum, contrast };
