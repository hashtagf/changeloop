/*
 * Composition checks run inside the page by render_check.js (one call per viewport).
 * FAIL: unequal outer frame, a blank vertical gap ≥ 0.6 viewport, no h1 on the first
 * screen of a public page. Everything else is a NOTE: a hint to look at the screenshot.
 * Rules: references/design-quality.md §4, review-loop.md §8a, visual-system.md Part C.
 * Needs scripts/_color.js injected into the page first (render_check.js does page.evaluate(color.inject)).
 */
module.exports = async function composition({ w, first }) {
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  const fails = [], notes = [];
  const vis = e => { const b = e.getBoundingClientRect(); if (b.width < 3 || b.height < 3 || b.right < 0 || b.left > vw) return false; const s = getComputedStyle(e); if (/rect\(0|inset\(50%\)/.test(s.clip + ' ' + s.clipPath)) return false; return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05; };
  const pinned = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const ps = getComputedStyle(p).position; if (ps === 'sticky' || ps === 'fixed') return true; } return false; };
  const abs = b => ({ l: b.left, r: b.right, t: b.top + scrollY, b: b.bottom + scrollY, w: b.width, h: b.height });
  const words = s => (s || '').trim().split(/\s+/).filter(Boolean).length + ((s || '').match(/[฀-๿]{4}/g) || []).length / 2;
  const app = !!document.querySelector('aside, [class*=sidebar], [class*=side-nav], [data-app-shell]');
  const desk = w >= 1024;
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1);
  const texts = [...document.querySelectorAll('body *')].filter(e => !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(e.tagName) && ownText(e) && vis(e) && !pinned(e));
  const media = [...document.querySelectorAll('img,video,svg,canvas,picture,iframe')].filter(e => { const b = e.getBoundingClientRect(); return vis(e) && !pinned(e) && b.width > 40 && b.height > 40; });
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const fields = [...document.querySelectorAll('body *')].filter(e => {
    if (!vis(e) || pinned(e)) return false; const s = getComputedStyle(e), b = e.getBoundingClientRect();
    if (b.width * b.height < vw * vh * 0.08) return false;
    return s.backgroundImage !== 'none' || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== bodyBg);
  });
  const boxes = [...texts, ...media, ...fields].map(e => abs(e.getBoundingClientRect()));
  const sel = e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : ''}`;

  // Frame: outer margins (all content, so a nav with logo left and action right sets both)
  const framed = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if (s.position === 'absolute' || s.position === 'fixed' || p.getAttribute('aria-hidden') === 'true') return false; if (p !== e && p.scrollWidth > p.clientWidth + 4) return false; } return true; };
  if (desk && !app && boxes.length) {
    const tb = [...texts, ...media].filter(framed).map(e => e.getBoundingClientRect()).filter(b => b.width < vw - 2 && b.left >= 0 && b.right <= vw);
    if (tb.length) {
      const L = Math.min(...tb.map(b => b.left)), R = vw - Math.max(...tb.map(b => b.right));
      if (Math.abs(L - R) >= Math.max(40, 0.045 * vw)) fails.push(`unequal outer margins: left ${Math.round(L)}px, right ${Math.round(R)}px`);
    }
  }
  // Blank vertical gap
  const docH = document.documentElement.scrollHeight;
  const iv = boxes.map(b => [b.t, b.b]).sort((a, b) => a[0] - b[0]);
  const all = [...texts, ...media, ...fields].map(e => [e, abs(e.getBoundingClientRect())]);
  let end = iv.length ? iv[0][1] : 0, gap = null;
  for (const [t, b] of iv) { if (t - end >= 0.6 * vh && (!gap || t - end > gap[1] - gap[0])) gap = [end, t]; end = Math.max(end, b); }
  if (gap) {
    const above = all.filter(([, b]) => Math.abs(b.b - gap[0]) < 2).map(([e]) => sel(e))[0] || '?';
    const below = all.filter(([, b]) => Math.abs(b.t - gap[1]) < 2).map(([e]) => sel(e))[0] || '?';
    fails.push(`blank gap of ${Math.round(gap[1] - gap[0])}px (≥ 0.6 viewport) between ${above} and ${below}`);
  }

  // Titles
  const h1s = [...document.querySelectorAll('h1')].filter(vis);
  if (!app && !h1s.some(h => h.getBoundingClientRect().top + scrollY < vh)) fails.push(h1s.length ? 'the h1 is below the first screen; the first screen needs a title saying what this is' : 'no visible h1');
  const untitled = [...document.querySelectorAll('section, article, main > div')].filter(s => vis(s) && words(s.innerText) >= 30 && !s.querySelector('h1,h2,h3,h4,[role=heading]'));
  if (untitled.length) notes.push(`${untitled.length} section(s) of running text without a heading: ${untitled.slice(0, 3).map(sel).join(', ')}`);

  if (desk && !app) {
    // Lopsided sections: content covers too little of the width
    const lop = [...document.querySelectorAll('section, main > div, footer')].filter(s => {
      if (!vis(s) || words(s.innerText) < 12) return false;
      const sb = s.getBoundingClientRect(); if (sb.width < vw * 0.8) return false;
      const inner = [...texts, ...media].filter(e => s.contains(e)).map(e => e.getBoundingClientRect());
      if (!inner.length) return false;
      const cover = Math.max(...inner.map(b => b.right)) - Math.min(...inner.map(b => b.left));
      return cover < vw * 0.58;
    });
    if (lop.length >= 2) notes.push(`${lop.length} sections leave ≥ 42% of the width empty: ${lop.slice(0, 3).map(sel).join(', ')}`);
    // Hero void: a big empty box on the first screen
    const voids = [...document.querySelectorAll('body *')].filter(e => {
      if (!vis(e)) return false; const b = e.getBoundingClientRect(); if (b.top > vh || b.width * Math.min(b.bottom, vh) < vw * vh * 0.28) return false;
      return !(e.innerText || '').trim() && !e.querySelector('img,video,svg,canvas,picture,iframe') && getComputedStyle(e).backgroundImage === 'none' && !/^(IMG|VIDEO|SVG|CANVAS|PICTURE|IFRAME|PATH|G)$/i.test(e.tagName) && !e.closest('svg');
    });
    if (voids.length) notes.push(`empty box covers ≥ 28% of the first screen: ${sel(voids[0])}`);
    // Left edges
    const blocks = texts.filter(e => /^(P|H1|H2|H3|LI|BLOCKQUOTE)$/.test(e.tagName));
    const xs = blocks.map(e => Math.round(e.getBoundingClientRect().left / 4) * 4);
    const cnt = {}; xs.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
    const ranked = Object.values(cnt).sort((a, b) => b - a);
    if (ranked.length > 6 && ranked.slice(0, 3).reduce((a, b) => a + b, 0) < xs.length * 0.6) notes.push(`${ranked.length} distinct text left edges; align blocks to two or three`);
    // Pictures
    if (w >= 1280) {
      const pics = [...document.querySelectorAll('img,video,picture')].filter(e => { const b = e.getBoundingClientRect(); return vis(e) && b.width * b.height > vw * vh * 0.01 && !/\.svg(\?|$)/i.test(e.currentSrc || e.src || ''); });
      if (pics.length < 4) notes.push(`${pics.length} real picture(s) at ${w}px; a public page usually needs 4 (review-loop §8a)`);
    }
    // Focal point on the first screen
    const fsz = texts.filter(e => e.getBoundingClientRect().top < vh).map(e => parseFloat(getComputedStyle(e).fontSize));
    const bigMedia = media.some(e => { const b = e.getBoundingClientRect(); return b.top < vh && b.width * Math.min(b.height, vh - b.top) >= vw * vh * 0.3; });
    if (fsz.length && Math.max(...fsz) < vw * 0.045 && !bigMedia) notes.push(`no focal point on the first screen: largest type ${Math.max(...fsz)}px (< 4.5vw) and no picture ≥ 30% of the screen`);
  }

  // Running text
  // Colour maths come from scripts/_color.js, injected by the caller (page.evaluate(color.inject)) as
  // window.__uxuiColor: canvasRGBA paints rgb(), oklab(), oklch(), color(srgb …) etc. on a 1x1 canvas and reads sRGB back.
  const C = window.__uxuiColor;
  if (!C) throw new Error('_composition.js needs _color.js injected first (page.evaluate(require("./_color").inject))');
  const toRGBA = C.canvasRGBA, over = C.over;
  // Resolved background: semi-transparent layers composited up to the first opaque one (white canvas below); null over an image.
  const bgOf = e => {
    const layers = [];
    for (let p = e; p; p = p.parentElement) {
      const s = getComputedStyle(p); if (s.backgroundImage !== 'none') return null;
      const c = toRGBA(s.backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 0.99) break;
    }
    return layers.reverse().reduce((under, top) => over(top, under), [255, 255, 255, 1]);
  };
  const quiet = /muted|meta|caption|hint|small|note|sub|fine|legal|foot/i;
  const paras = texts.filter(e => e.tagName === 'P' && words(e.innerText) >= 8 && !quiet.test(typeof e.className === 'string' ? e.className : '') && !e.closest('footer,small,figcaption'));
  const small = [], weak = [], wide = [], tall = [];
  // Measure (visual-system.md "Content widths"): real characters per full line. Thai is counted per grapheme
  // (tone marks and upper/lower vowels have no width); Latin per character. Lines from the client rects.
  const gseg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'grapheme' }) : null;
  const glyphs = t => gseg ? [...gseg.segment(t)].length : t.length;
  const lineCount = e => {
    const lh = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.4;
    // text-node rects only: a range over the element also returns the boxes of inline wrappers (double count)
    const rs = [], tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let tn;
    while ((tn = tw.nextNode())) { const rg = document.createRange(); rg.selectNodeContents(tn); rs.push(...[...rg.getClientRects()].filter(x => x.width > 1)); }
    const tops = rs.map(x => x.top).sort((a, b) => a - b);
    let n = 0, last = -1e9; for (const t of tops) { if (t - last > lh / 2) { n++; last = t; } }
    return { n, ink: rs.reduce((a, x) => a + x.width, 0) };
  };
  for (const p of paras) {
    const s = getComputedStyle(p), fs = parseFloat(s.fontSize);
    if (fs < 16) small.push(sel(p));
    const bg = bgOf(p);
    if (bg) { const cr = C.contrast(over(toRGBA(s.color), bg), bg); if (cr < 7) weak.push(`${sel(p)} ${cr.toFixed(1)}:1`); }
  }
  // Measure and paragraph height: every visible paragraph, including CMS markup (<p><span>text</span></p>)
  // and content inside a sticky wrapper, which the own-text list above leaves out. Capped at 40.
  const mParas = [...document.querySelectorAll('p')].filter(e => vis(e) && words(e.innerText) >= 8 && !quiet.test(typeof e.className === 'string' ? e.className : '') && !e.closest('footer,small,figcaption,nav')).slice(0, 40);
  for (const p of mParas) {
    const fs = parseFloat(getComputedStyle(p).fontSize);
    const txt = p.innerText.replace(/\s+/g, ' ').trim(), lc = lineCount(p), lines = lc.n;
    const thai = (txt.match(/[\u0E00-\u0E7F]/g) || []).length > txt.length * 0.4;
    if (lines >= 3) {
      const cs = getComputedStyle(p), inner = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const cpl = Math.round(glyphs(txt) * inner / Math.max(lc.ink, inner)); // characters that fit one full line
      if (cpl > (thai ? 80 : 90)) wide.push(`${sel(p)} ~${cpl} ${thai ? 'Thai graphemes' : 'chars'}/line`);
    } else if (!thai && p.getBoundingClientRect().width / (fs * 0.5) > 88) wide.push(`${sel(p)} > 88ch wide`);
    if (vw <= 480 && lines > 8 && !p.closest('article, [class*=prose], [class*=article]')) tall.push(`${sel(p)} ${lines} lines`);
  }
  if (small.length) notes.push(`${small.length} paragraph(s) under 16px: ${small.slice(0, 3).join(', ')}`);
  if (weak.length) notes.push(`${weak.length} paragraph(s) below 7:1 (body text reads unfinished in grey): ${weak.slice(0, 3).join(', ')}`);
  if (wide.length) notes.push(`${wide.length} paragraph(s) past the measure (Latin ~90 chars, Thai ~80 graphemes per line; aim 65ch / 40em): ${wide.slice(0, 3).join(', ')}`);
  if (tall.length) notes.push(`${tall.length} paragraph(s) taller than 8 lines on a phone with no break; split, add a subhead or a list: ${tall.slice(0, 3).join(', ')}`);
  // Text density on the first screen of a public page: area of the text line boxes vs the viewport
  if (!app) {
    let ink = 0;
    for (const e of texts) {
      if (/^(H1|H2|H3|BUTTON|A|LABEL)$/.test(e.tagName)) continue;
      for (const n of e.childNodes) { if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const x of rg.getClientRects()) { const t = Math.max(0, x.top), b = Math.min(vh, x.bottom); if (b > t && x.right > 0 && x.left < vw) ink += (Math.min(vw, x.right) - Math.max(0, x.left)) * (b - t); } }
    }
    if (ink / (vw * vh) > 0.5) notes.push(`running text covers ~${Math.round(100 * ink / (vw * vh))}% of the first screen; a public first screen reads as a wall of text (visual-system.md "Density")`);
  }
  // Mixed density: tables on one page with different row heights (one density per app)
  const rowH = [...document.querySelectorAll('table, [role=grid]')].filter(vis).map(t => {
    const hs = [...t.querySelectorAll('tbody tr, [role=row]')].filter(vis).slice(0, 30).map(r => r.getBoundingClientRect().height).sort((a, b) => a - b);
    return hs.length >= 4 ? [sel(t), Math.round(hs[Math.floor(hs.length / 2)])] : null;
  }).filter(Boolean);
  if (rowH.length >= 2) {
    const lo = rowH.reduce((a, b) => (b[1] < a[1] ? b : a)), hi = rowH.reduce((a, b) => (b[1] > a[1] ? b : a));
    if (hi[1] > lo[1] * 1.25) notes.push(`mixed density: table rows ${lo[1]}px in ${lo[0]} vs ${hi[1]}px in ${hi[0]}; use one density per app`);
  }
  const tl = texts.filter(e => /^(P|H1|H2|H3|LI)$/.test(e.tagName));
  const totalLen = tl.reduce((a, e) => a + e.innerText.length, 0);
  const centred = tl.filter(e => getComputedStyle(e).textAlign === 'center').reduce((a, e) => a + e.innerText.length, 0);
  if (totalLen > 400 && centred / totalLen > 0.72) notes.push(`${Math.round(100 * centred / totalLen)}% of text is centred; long text reads left-aligned`);
  const sizes = new Set(texts.map(e => Math.round(parseFloat(getComputedStyle(e).fontSize))));
  if (sizes.size > 9) notes.push(`${sizes.size} distinct font sizes; use the type scale`);

  // Rows and blends
  const side = [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); return /auto|scroll/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 4 && !e.closest('pre,code,table,[role=grid]') && e.tagName !== 'TABLE' && !e.querySelector(':scope > table'); });
  if (side.length) notes.push(`side-scrolling row(s): ${side.slice(0, 3).map(sel).join(', ')}; make sure a cue shows there is more`);
  const blend = [...document.querySelectorAll('body *')].filter(e => /difference|exclusion/.test(getComputedStyle(e).mixBlendMode) && (e.innerText || '').trim());
  if (blend.length) notes.push(`text with mix-blend-mode difference/exclusion: ${blend.slice(0, 2).map(sel).join(', ')}`);

  if (first) {
    // Fonts declared but not in use
    const declared = new Set([...document.fonts].map(f => f.family.replace(/["']/g, '')));
    const bad = [];
    for (const e of [document.body, h1s[0], document.querySelector('h2'), document.querySelector('p')].filter(Boolean)) {
      const fam = getComputedStyle(e).fontFamily.split(',')[0].trim().replace(/["']/g, '');
      if (declared.has(fam) && !document.fonts.check(`16px "${fam}"`)) bad.push(fam);
    }
    if ([...document.fonts].some(f => f.status === 'error')) bad.push('a @font-face failed');
    if (bad.length) notes.push(`font not loaded: ${[...new Set(bad)].join(', ')}`);
    // Motion: elements that move while scrolling through
    if (!app && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const moved = new Set(), names = new Set();
      const sample = () => document.getAnimations().forEach(a => { const t = a.effect && a.effect.target; if (t) moved.add(t); names.add(a.animationName || a.transitionProperty || 'js'); });
      const h = document.documentElement.scrollHeight, step = Math.max(300, vh * 0.6);
      for (let y = 0; y < h; y += step) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120)); sample(); }
      scrollTo({ top: 0, behavior: 'instant' });
      if (moved.size < 4) notes.push(`page barely moves: ${moved.size} element(s) animate during load and scroll (review-loop §8a)`);
      else if (moved.size >= 6 && names.size === 1) notes.push(`every moving block uses the same animation (${[...names][0]}); vary entrance by role`);
    }
  }
  return { fails, notes };
};
