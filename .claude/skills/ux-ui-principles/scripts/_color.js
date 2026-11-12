/*
 * Shared colour maths for the Node scripts (brand.js, compositions.js) and, injected as source, for checks that
 * run inside a page (render_check.js composition, admin_check.js). Standard library only.
 *
 *   parse(c)          '#rgb' '#rgba' '#rrggbb' '#rrggbbaa' ('#' required) 'rgb(…)' 'rgba(…)' (comma or space syntax,
 *                     % allowed; an empty item such as a trailing comma is rejected)
 *                     -> [r, g, b, a] (0..255, alpha 0..1) or null
 *   luminance(c)      WCAG 2.x relative luminance of a colour string or [r, g, b]; null when unparseable
 *   contrast(a, b)    WCAG contrast ratio (1..21); null when either is unparseable
 *   over(top, under)  composite an [r, g, b, a] over an opaque [r, g, b]
 *   toHex([r,g,b])    '#rrggbb'
 *   inject            JS source that defines window.__uxuiColor = { canvasRGBA, luminance, contrast, over, sat }
 *                     in a page: canvasRGBA paints any computed colour (rgb, oklab, oklch, color-mix, color(srgb …))
 *                     on a 1x1 canvas and reads sRGB back. Pass it to page.evaluate before an in-page check.
 */

function parse(c) {
  if (Array.isArray(c)) return c.length >= 3 ? [c[0], c[1], c[2], c[3] == null ? 1 : c[3]] : null;
  const s = String(c == null ? '' : c).trim().toLowerCase();
  let m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = h.split('').map((x) => x + x).join('');
    const n = [0, 2, 4, 6].map((i) => (i < h.length ? parseInt(h.slice(i, i + 2), 16) : 255));
    return [n[0], n[1], n[2], n[3] / 255];
  }
  m = /^rgba?\(\s*([^)]*)\)$/.exec(s);
  if (m) {
    if (/^\s*,|,\s*(,|\/|$)/.test(m[1])) return null; // empty item: 'rgb(1,2,3,)', 'rgb(,1,2,3)'
    const parts = m[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);
    if (parts.length < 3 || parts.length > 4) return null;
    const ch = (v, max) => { const p = v.endsWith('%'); const n = parseFloat(v); if (!Number.isFinite(n)) return NaN; return p ? (n / 100) * max : n; };
    const rgb = parts.slice(0, 3).map((v) => Math.max(0, Math.min(255, ch(v, 255))));
    const a = parts[3] == null ? 1 : Math.max(0, Math.min(1, ch(parts[3], 1)));
    return [...rgb, a].some(Number.isNaN) ? null : [...rgb, a];
  }
  if (s === 'transparent') return [0, 0, 0, 0];
  return null;
}

function luminance(c) {
  const v = Array.isArray(c) ? c : parse(c);
  if (!v) return null;
  const [r, g, b] = v.slice(0, 3).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  if (x == null || y == null) return null;
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function over(top, under) {
  const a = top[3] == null ? 1 : top[3];
  return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1);
}

const toHex = (v) => '#' + v.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');

// HSL saturation of an [r, g, b, a]: 0 for near-transparent (< 0.5), near-black, near-white or grey
function sat(v) {
  if (!v || v[3] < 0.5) return 0;
  const [r, g, b] = v.slice(0, 3).map((x) => x / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  return mx === mn || l < 0.12 || l > 0.9 ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
}

// Browser only: any CSS colour the page computed -> [r, g, b, a] via a 1x1 canvas (cached).
function canvasRGBA(c) {
  const st = canvasRGBA.st || (canvasRGBA.st = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; return { cx: cv.getContext('2d', { willReadFrequently: true }), cache: new Map() }; })());
  if (st.cache.has(c)) return st.cache.get(c);
  let v = [0, 0, 0, 0];
  if (c && c !== 'transparent') {
    st.cx.clearRect(0, 0, 1, 1); st.cx.fillStyle = '#000'; st.cx.fillStyle = c;
    st.cx.fillRect(0, 0, 1, 1); const d = st.cx.getImageData(0, 0, 1, 1).data;
    v = [d[0], d[1], d[2], d[3] / 255];
  }
  st.cache.set(c, v); return v;
}

const inject = `window.__uxuiColor = window.__uxuiColor || (() => {
${[parse, luminance, contrast, over, sat, canvasRGBA].map((f) => f.toString()).join('\n')}
return { parse, luminance, contrast, over, sat, canvasRGBA };
})();`;

module.exports = { parse, luminance, contrast, over, toHex, sat, canvasRGBA, inject };
