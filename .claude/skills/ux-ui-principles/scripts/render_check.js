#!/usr/bin/env node
/*
 * Render a page at several widths and color schemes, report problems, save screenshots.
 *
 * Usage:
 *   node render_check.js --doctor | -h
 *   node render_check.js <url-or-file> [--out dir] [--widths 1440,768,390] [--schemes light,dark]
 *                         [--zoom] [--fast] [--viewport-shots] [--reduced-motion] [--wait 800] [--timeout 30000]
 *                         [--toggle "<selector>"] [--scroll-budget 15000] [--json]
 *
 * The page is loaded once; widths and color schemes are switched in place
 * (viewport resize + prefers-color-scheme emulation), so each extra viewport
 * costs a relayout, not a reload. --fast = widths 1440,390, light only,
 * viewport-only screenshots. --viewport-shots skips full-page screenshots
 * (the slowest step on long pages).
 *
 * Reports per viewport: JS errors, console errors, failed requests, horizontal page
 * overflow (and the widest offending elements), elements wider than the viewport,
 * images without alt, buttons/links without an accessible name, form controls
 * without a label, form controls with different heights or misaligned rows,
 * invalid fields styled like valid ones, gaps before punctuation, and text
 * left at opacity 0 on the first screen. --reduced-motion emulates
 * prefers-reduced-motion and also reports animations still moving and any
 * content never revealed. Also reported: images that failed to load (lazy images
 * are forced eager first, so full-page shots are not blank), text touching the
 * viewport edge (no gutter), text overlapping other text, decoration (absolutely positioned badge or stamp)
 * covering text, images drawn at the wrong aspect ratio, h1/h2 wrapping to 3+ lines and Thai words split
 * across lines (NOTEs, not failures). Visually hidden radios/checkboxes are measured by their label; closed
 * <details>, off-screen drawers and sticky table headers are skipped; sticky/fixed elements are left out of
 * the text-overlap check (full-page shots stack them mid-page).
 * Composition (_composition.js): FAIL on unequal outer margins, a blank gap ≥ 0.6 viewport and no h1
 * on the first screen of a public page; NOTEs for lopsided sections, hero void, scattered left edges,
 * < 4 pictures at ≥1280, no focal point, body text < 16px / < 7:1 / past the measure (Latin ~90 chars,
 * Thai ~80 graphemes per line), > 8-line paragraphs on a phone, text covering > 50% of a public first screen,
 * tables with different row heights (mixed density), mostly centred text,
 * > 9 font sizes, side-scrolling rows, difference-blend text, fonts not loaded, a page that barely
 * moves or uses one animation for every block, and a dev server (HMR) target.
 * --toggle "<selector>" clicks a language/theme switch after the first pass and
 * repeats every viewport (screenshots prefixed alt-), so both states are checked.
 * --zoom also renders at 320px width (approximates 400% zoom reflow
 * of a 1280px window). Exit code 1 when any problem is found.
 *
 * Setup is automatic and never downloads anything:
 *   - Playwright module: ./node_modules, the page's project, NODE_PATH, playwright /
 *     playwright-core on the require path, then the global npm root (looked up once, last). Set PW_MODULE=/path/to/node_modules to force one.
 *   - Browser: PW_CHROMIUM, then Playwright's own build, then any cached
 *     chromium / headless shell build (any version), then installed Chrome / Edge.
 *   - A file without <!doctype>/<html> (a fragment) is wrapped in a doctype + viewport meta page
 *     written to a temp folder (never next to the page or into --out), with <base href> set to the
 *     page's folder so relative assets still resolve.
 * --doctor prints what was found and exits. When no module or browser is found
 * the script exits 3 at once: report the render check as "not tested" and move
 * on; do not install browsers mid-task (`npx playwright install chromium` is a
 * one-time setup the user can run).
 * --timeout bounds the page load (no shell `timeout` needed; macOS lacks it). A load that times out is
 * checked as far as it rendered (WARN); a refused / unreachable URL prints "ERROR <reason>" and exits 1;
 * a missing file or a bad option prints "error: …" and exits 2 before any browser starts.
 * Screenshots go to render-check/ next to a local page, or for a URL to a new temp folder
 * (<os temp>/ux-ui-render-check/<host>-<time>, printed), never the current directory; --out overrides. Before each viewport is measured, finite CSS/JS animations and
 * transitions are given up to 3s to finish, so entrance effects do not skew the checks or shots.
 * Before that, each viewport scrolls through the page once (reveal-on-scroll content); --scroll-budget caps that
 * scroll in ms per viewport (default 15000, 0 = no scroll). A page too long for the budget is scrolled as far as
 * the budget allows and a NOTE (rule scroll-budget) says where it stopped: content below may stay hidden.
 * This is a smoke check, not an accessibility audit: it does not test keyboard
 * flows, screen readers, contrast or task success.
 * --json: one JSON document on stdout (README "Script contract"), log lines on stderr, same exit codes. Each
 * problem above is a fail finding (rule = its label: overflow, unnamed-control, phone, composition, …), each
 * NOTE a note finding; "viewports" lists scheme, width, result and screenshot per pass.
 */
const path = require('path');
const fs = require('fs');
const A = require('./_args');
const R = require('./_report');
const a = A.parse(process.argv.slice(2), {
  file: __filename,
  report: 'render_check',
  values: ['--out', '--widths', '--schemes', '--wait', '--timeout', '--toggle', '--scroll-budget'],
  flags: ['--zoom', '--fast', '--viewport-shots', '--reduced-motion', '--doctor'],
  positional: process.argv.includes('--doctor') ? [0, 1, '<url-or-file>'] : [1, 1, '<url-or-file> (node render_check.js page.html, or --doctor)'],
});
const doctor = a.has('--doctor');
const pw = require('./_pw');
const composition = require('./_composition');
const color = require('./_color');
const arg0 = a._[0];
let target = doctor ? null : pw.target(arg0);

const mod = pw.findModule(arg0);
const exe = mod ? pw.findBrowser(mod.chromium) : undefined;
if (doctor) {
  console.log(`playwright module: ${mod ? mod.from : 'NOT FOUND'}`);
  console.log(`browser: ${exe === null ? "Playwright's bundled build" : exe || 'NOT FOUND'}`);
  R.set('doctor', { playwright_module: mod ? mod.from : null, browser: exe === null ? 'bundled' : exe || null });
  if (!mod || exe === undefined) pw.need(arg0, 'render check');
  process.exit(0);
}

if (!A.isUrl(arg0)) {
  const file = path.resolve(arg0);
  let html;
  try { html = fs.readFileSync(file, 'utf8'); } catch (e) { A.usageError(`cannot read ${file}: ${e.code || e.message.split('\n')[0]}`, 'check the file permissions'); }
  if (!/<!doctype|<html[\s>]/i.test(html.slice(0, 2000))) {
    // the wrapper lives in a temp folder; <base> points relative assets back at the page's folder
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ux-ui-render-check-'));
    const wrapped = path.join(tmp, `${path.basename(file, path.extname(file))}.html`);
    const base = require('url').pathToFileURL(path.dirname(file) + path.sep).href;
    fs.writeFileSync(wrapped, `<!doctype html><html><head><meta charset="utf-8"><base href="${base}"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n` + html + '\n</body></html>');
    process.on('exit', () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} });
    console.log(`note: ${path.basename(file)} is a fragment; rendered inside a doctype wrapper`);
    R.add('note', 'fragment', `${path.basename(file)} is a fragment; rendered inside a doctype wrapper`, null);
    target = pw.target(wrapped);
  }
}
// Default output: render-check/ next to a local page; a temp folder for a URL (never the current directory).
const out = A.outFor({ given: a.get('--out'), target: arg0, script: 'render-check', folder: 'render-check' });
const fast = a.has('--fast');
const widths = a.list('--widths', null, fast ? ['1440', '390'] : ['1440', '768', '390']).map(Number);
if (widths.some(w => !Number.isInteger(w) || w < 200 || w > 4000)) A.usageError(`--widths ${a.get('--widths')} must be whole pixel widths`, 'e.g. --widths 1440,768,390');
if (a.has('--zoom')) widths.push(320);
const schemes = a.list('--schemes', ['light', 'dark'], fast ? ['light'] : ['light', 'dark']);
const wait = a.num('--wait', 800, { min: 0 });
const timeout = a.num('--timeout', 30000, { min: 1 });
const scrollBudget = a.num('--scroll-budget', 15000, { min: 0 });
const fullPage = !(fast || a.has('--viewport-shots'));
if (A.isUrl(arg0) && !a.has('--out')) console.log(`output: ${out}`);
R.setArtifact('out', out);
const viewports = []; R.set('widths', widths); R.set('schemes', schemes); R.set('viewports', viewports);
// every input and option is checked above (exit 2) before looking for a browser (exit 3)
const env = pw.need(arg0, 'render check');

A.main(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await pw.launch(env);
  const reduced = a.has('--reduced-motion');
  const page = await browser.newPage({ viewport: { width: widths[0], height: 900 }, colorScheme: schemes[0], reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const errs = [], cons = [], fails = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') cons.push(m.text()); });
  page.on('requestfailed', r => fails.push(r.url()));
  await pw.goto(page, target, { timeout, browser });
  await page.waitForTimeout(wait);
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; });
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 8000); })));
  });
  // Scroll through once so reveal-on-scroll content (IntersectionObserver) is shown in full-page shots,
  // within --scroll-budget ms; returns where it stopped when the budget ran out first, else null.
  const reveal = async () => {
    if (!scrollBudget) return null;
    return page.evaluate(async (budget) => {
      const h = document.documentElement.scrollHeight, step = Math.max(300, innerHeight * 0.5), t0 = performance.now();
      let y = 0, cut = null;
      for (; y < h; y += step) {
        if (performance.now() - t0 > budget) { cut = { y: Math.round(y), h }; break; }
        scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 300));
      }
      scrollTo({ top: 0, behavior: 'instant' }); await new Promise(r => setTimeout(r, 400));
      return cut;
    }, scrollBudget);
  };
  // Let entrance animations / transitions end (finite ones only, capped at 3s) so checks and shots see the final state.
  const idle = () => page.evaluate(async () => {
    const finite = () => document.getAnimations().filter(a => { if (a.playState !== 'running' && a.playState !== 'pending') return false; const t = a.effect && a.effect.getComputedTiming(); return t && Number.isFinite(t.endTime); });
    const t0 = performance.now();
    while (finite().length && performance.now() - t0 < 3000) await Promise.race([Promise.all(finite().map(a => a.finished.catch(() => 0))), new Promise(r => setTimeout(r, 250))]);
  }).catch(() => {});
  let cut = null;
  const settle = async () => { cut = await reveal(); await idle(); await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); };
  let problems = 0, reported = { errs: 0, cons: 0, fails: 0 }, compFirst = true;
  // Dev server: the final gate runs on the shipped build (render-verification.md)
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(target)) {
    const dev = await page.evaluate(() => !!document.querySelector('script[src*="@vite/client"],script[src*="webpack-hmr"],script[src*="_next/static/webpack"],script[id="__NEXT_DATA__"][data-dev]') || typeof window.__vite_plugin_react_preamble_installed__ !== 'undefined');
    if (dev) { console.log('NOTE  dev server detected (HMR client); run the final gate on the production build'); R.add('note', 'dev-server', 'dev server detected (HMR client); run the final gate on the production build', target); }
  }
  async function matrix(prefix) {
  for (const scheme of schemes) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await settle();
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth > vw;
        let wide = [];
        if (overflow) {
          const clips = new Set();
          for (const p of document.querySelectorAll('body *')) {
            if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) clips.add(p);
          }
          const inScroller = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (clips.has(p)) return true; return false; };
          for (const e of document.querySelectorAll('body *')) {
            const b = e.getBoundingClientRect();
            if (b.width && b.right > vw + 1 && !inScroller(e)) {
              wide.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''} right=${Math.round(b.right)}`);
              if (wide.length >= 5) break;
            }
          }
        }
        const visible = e => { const b = e.getBoundingClientRect(); if (!b.width) return false; const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden'; };
        // Visible to the user: not inside a closed <details> (except its summary), not pushed off-screen (closed drawer, skip link)
        const shown = e => {
          if (!visible(e)) return false;
          const d = e.closest('details'); if (d && !d.open && !e.closest('summary')) return false;
          const b = e.getBoundingClientRect(); return !(b.right <= 0 || b.left >= vw);
        };
        const pinned = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const ps = getComputedStyle(p).position; if (ps === 'sticky' || ps === 'fixed') return true; } return false; };
        // A visually hidden input (tiny, opacity 0 or clipped) is operated through its label: measure the label
        const hiddenInput = e => { if (e.tagName !== 'INPUT') return false; const b = e.getBoundingClientRect(), st = getComputedStyle(e); return b.width <= 2 || b.height <= 2 || st.opacity === '0' || /rect\(0/.test(st.clip) || st.clipPath === 'inset(50%)'; };
        const targetRect = e => { if (hiddenInput(e)) { const l = (e.labels && e.labels[0]) || e.closest('label'); if (l) return l.getBoundingClientRect(); } return e.getBoundingClientRect(); };
        const name = e => (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || '').trim() || (e.getAttribute('aria-labelledby') ? 'x' : '');
        const noAlt = [...document.images].filter(i => !i.hasAttribute('alt') && visible(i)).length;
        const noName = [...document.querySelectorAll('button,a[href],[role=button]')].filter(e => !name(e) && !e.querySelector('img[alt]:not([alt=""])') && visible(e)).map(e => e.outerHTML.slice(0, 80));
        const noLabel = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea')].filter(e => {
          if (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.closest('label')) return false;
          if (e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)) return false; return visible(e);
        }).map(e => e.outerHTML.slice(0, 80));
        // Forms: control heights, row alignment, invalid styling
        const formIssues = [];
        for (const f of document.querySelectorAll('form')) {
          const ctrls = [...f.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),select')].filter(visible);
          const hs = [...new Set(ctrls.map(c => Math.round(c.getBoundingClientRect().height)))];
          if (hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 2) formIssues.push(`single-line controls have different heights: ${hs.join('/')}px`);
          const rects = ctrls.map(c => [c, c.getBoundingClientRect()]);
          for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
            const [a, ra] = rects[i], [b, rb] = rects[j];
            const sameRow = ra.right <= rb.left + 1 || rb.right <= ra.left + 1 ? Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) > -40 : false;
            if (sameRow && Math.abs(ra.top - rb.top) > 2) formIssues.push(`fields in one row not top-aligned: ${a.name || a.id} vs ${b.name || b.id} (${Math.round(Math.abs(ra.top - rb.top))}px)`);
          }
          for (const c of f.querySelectorAll('[aria-invalid="true"]')) {
            const sib = [...f.querySelectorAll('input,select,textarea')].find(x => x !== c && x.getAttribute('aria-invalid') !== 'true' && visible(x));
            if (sib && getComputedStyle(c).borderTopColor === getComputedStyle(sib).borderTopColor) formIssues.push(`invalid field ${c.name || c.id} has the same border as valid fields`);
          }
        }
        // Gap before punctuation: real spaces, or glyph gaps from font fallback / letter-spacing
        const punct = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let tn, seen = 0;
        while ((tn = walker.nextNode()) && seen < 400) {
          const t = tn.nodeValue; if (!t || !/[.,:;!?]/.test(t) || !tn.parentElement || !visible(tn.parentElement)) continue;
          seen++;
          const m1 = t.match(/[A-Za-z0-9฀-๿)]\s+[.,:;!?](?=\s|$)/);
          if (m1) { punct.push(`space before "${m1[0].trim().slice(-1)}": "${t.trim().slice(0, 40)}"`); continue; }
          const re = /[A-Za-z0-9][.,:;](?=\s|$)/g; let m;
          while ((m = re.exec(t))) {
            // A period/comma/colon normally advances ~0.25-0.3em; much wider means
            // letter-spacing or a fallback font with wide punctuation (reads as "word .")
            const r = document.createRange(); r.setStart(tn, m.index + 1); r.setEnd(tn, m.index + 2);
            const w = r.getBoundingClientRect().width; const fs = parseFloat(getComputedStyle(tn.parentElement).fontSize) || 16;
            if (w > fs * 0.45) { punct.push(`wide "${t[m.index + 1]}" glyph (${(w / fs).toFixed(2)}em; letter-spacing or fallback font?): "${t.trim().slice(0, 40)}"`); break; }
          }
          if (punct.length >= 3) break;
        }
        // Motion: content left invisible after load; movement under reduced motion
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hidden = [];
        for (const e of document.querySelectorAll('body *')) {
          if (hidden.length >= 3) break;
          if (e.closest('[aria-hidden="true"],[hidden],dialog:not([open])')) continue;
          const st = getComputedStyle(e); if (st.opacity !== '0' || st.display === 'none') continue;
          const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue;
          if (!reduce && b.top > innerHeight) continue; // below the fold may reveal on scroll
          if ((e.innerText || '').trim().length > 2) hidden.push(`${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : ''} "${e.innerText.trim().slice(0, 30)}"`);
        }
        const moving = reduce ? document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getKeyframes()
          .some(k => k.transform || k.translate || k.scale || k.rotate || k.left || k.top || k.backgroundPosition)).length : 0;
        // Phone composition (<= 480px)
        const mobile = [];
        if (vw <= 480) {
          const small = [...document.querySelectorAll('a[href],button,[role=button],input:not([type=hidden]),select,summary')]
            .filter(e => shown(e) || (hiddenInput(e) && e.labels && e.labels[0] && shown(e.labels[0]))).filter(e => { const r = targetRect(e); const inText = e.tagName === 'A' && e.closest('p,li') && getComputedStyle(e).display === 'inline'; return !inText && (r.height < 44 || r.width < 44); });
          if (small.length) mobile.push(`${small.length} tap target(s) under 44px (project default; WCAG floor is 24px), e.g. ${small.slice(0, 3).map(e => `${e.tagName.toLowerCase()} "${(e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 15)}" ${Math.round(targetRect(e).width)}x${Math.round(targetRect(e).height)}`).join(', ')}`);
          const zoomy = [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea')].filter(visible).filter(e => parseFloat(getComputedStyle(e).fontSize) < 16);
          if (zoomy.length) mobile.push(`${zoomy.length} field(s) with font-size < 16px (iOS zooms on focus)`);
          const tiny = [...document.querySelectorAll('p,li,td,dd')].filter(visible).filter(e => (e.innerText || '').trim().length > 40 && parseFloat(getComputedStyle(e).fontSize) < 14);
          if (tiny.length) mobile.push(`${tiny.length} text block(s) under 14px`);
          const stuck = [...document.querySelectorAll('body *')].filter(e => /fixed|sticky/.test(getComputedStyle(e).position) && !e.closest('thead,th,tr') && shown(e) && e.getBoundingClientRect().height > 30);
          if (stuck.length > 1) mobile.push(`${stuck.length} fixed/sticky elements; keep one`);
        }
        // Images that failed to load (blank slot), text with no gutter, 3+ line headings
        const broken = [...document.images].filter(i => (visible(i) || i.parentElement && visible(i.parentElement)) && i.complete && !i.naturalWidth).map(i => (i.currentSrc || i.src).split('/').pop().slice(0, 40));
        const edge = [];
        for (const e of document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,label,summary,figcaption,dt,dd')) {
          if (edge.length >= 3) break;
          if (e.closest('[aria-hidden="true"],[hidden]') || !visible(e)) continue;
          const own = [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1);
          if (!own) continue;
          const b = e.getBoundingClientRect();
          if (b.right < 0 || b.left > vw) continue; // off-screen (skip links)
          if (b.left < 6 || b.right > vw - 6) edge.push(`${e.tagName.toLowerCase()} "${e.innerText.trim().slice(0, 24)}" left=${Math.round(b.left)} right=${Math.round(vw - b.right)}`);
        }
        // Text colliding with other text or with a card/image block (headline over a panel, etc.)
        const overlap = [];
        const boxes = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,label,summary,figcaption,dt,dd')].filter(e => {
          if (e.closest('[aria-hidden="true"],[hidden]') || !shown(e) || pinned(e)) return false; // sticky/fixed: full-page shot artefact
          if (!(e.innerText || '').trim()) return false;
          return [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1);
        }).map(e => ({ e, r: e.getBoundingClientRect() })).filter(x => x.r.width > 8 && x.r.height > 8 && x.r.bottom > 0 && x.r.top < innerHeight * 12);
        for (let i = 0; i < boxes.length && overlap.length < 3; i++) {
          for (let j = i + 1; j < boxes.length && overlap.length < 3; j++) {
            const a = boxes[i], b = boxes[j];
            if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
            const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
            if (w <= 0 || h <= 0) continue;
            const small = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
            if ((w * h) / small > 0.25) overlap.push(`"${a.e.innerText.trim().slice(0, 20)}" over "${b.e.innerText.trim().slice(0, 20)}"`);
          }
        }
        const notes = [];
        for (const h of document.querySelectorAll('h1,h2')) {
          if (!visible(h) || h.closest('[aria-hidden="true"]')) continue;
          const cs = getComputedStyle(h); const fs = parseFloat(cs.fontSize);
          const lh = parseFloat(cs.lineHeight) || fs * 1.2;
          const rg = document.createRange(); rg.selectNodeContents(h);
          const tops = [...rg.getClientRects()].filter(x => x.width > 1).map(x => x.top).sort((a, b) => a - b);
          let lines = 0, last = -1e9; for (const t of tops) { if (t - last > lh / 2) { lines++; last = t; } }
          const limit = /^th/i.test(h.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || '') ? 3 : 2; // Thai wraps by characters
          if (lines > limit) notes.push(`${h.tagName.toLowerCase()} wraps to ${lines} lines: "${h.innerText.trim().slice(0, 36)}"`);
        }
        // Images drawn at a different aspect ratio than the file (e.g. height attribute without CSS height:auto)
        const distorted = [...document.images].filter(i => visible(i) && i.naturalWidth && i.naturalHeight).filter(i => {
          const fit = getComputedStyle(i).objectFit; if (fit && fit !== 'fill') return false;
          const b = i.getBoundingClientRect(); if (b.width < 24 || b.height < 24) return false;
          return Math.abs((b.width / b.height) / (i.naturalWidth / i.naturalHeight) - 1) > 0.03;
        }).slice(0, 3).map(i => `${(i.currentSrc || i.src).split('/').pop().slice(0, 40)} drawn ${Math.round(i.getBoundingClientRect().width)}x${Math.round(i.getBoundingClientRect().height)}, file ${i.naturalWidth}x${i.naturalHeight}`);
        // Decoration (badge, stamp, ornament: an absolutely positioned box) covering a line of text
        const sel = e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
        const decoOver = [];
        const area = innerWidth * innerHeight;
        const decos = [...document.querySelectorAll('body *')].filter(e => { const st = getComputedStyle(e); if (!/absolute|fixed/.test(st.position) || st.opacity === '0' || !shown(e)) return false; const b = e.getBoundingClientRect(); return b.width > 4 && b.height > 4 && b.width * b.height < area * 0.25; });
        if (decos.length) {
          const texts = [...document.querySelectorAll('h1,h2,h3,p,button,a')].filter(t => shown(t) && (t.innerText || '').trim());
          for (const d of decos) {
            if (decoOver.length >= 3) break;
            const db = d.getBoundingClientRect();
            for (const t of texts) {
              if (t.contains(d) || d.contains(t)) continue;
              const rg = document.createRange(); rg.selectNodeContents(t);
              const hit = [...rg.getClientRects()].some(x => x.width > 2 && Math.min(x.right, db.right) - Math.max(x.left, db.left) > 2 && Math.min(x.bottom, db.bottom) - Math.max(x.top, db.top) > 2);
              if (hit) { decoOver.push(`${sel(d)} covers ${sel(t)} "${t.innerText.trim().slice(0, 24)}"`); break; }
            }
          }
        }
        // Thai words split across two lines (loanwords like ออเดอร์ the line breaker does not know)
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
          const seg = new Intl.Segmenter('th', { granularity: 'word' }); const split = [];
          for (const el of document.querySelectorAll('h1,h2,p')) {
            if (split.length >= 3 || !shown(el)) continue;
            const lang = el.closest('[lang]')?.getAttribute('lang') || '';
            if (!/^th/i.test(lang) || !/[\u0E00-\u0E7F]/.test(el.textContent)) continue;
            const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.5;
            const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
            while ((n = tw.nextNode()) && split.length < 3) {
              for (const w of seg.segment(n.nodeValue)) {
                if (!w.isWordLike || w.segment.length < 3 || !/[\u0E00-\u0E7F]/.test(w.segment)) continue;
                const a = document.createRange(); a.setStart(n, w.index); a.setEnd(n, w.index + 1);
                const z = document.createRange(); z.setStart(n, w.index + w.segment.length - 1); z.setEnd(n, w.index + w.segment.length);
                const ra = a.getClientRects()[0], rz = z.getClientRects()[0];
                if (ra && rz && rz.top - ra.top > lh / 2) { split.push(`"${w.segment}" in ${el.tagName.toLowerCase()} "${el.innerText.trim().slice(0, 30)}"`); break; }
              }
            }
          }
          if (split.length) notes.push(`Thai word split across lines: ${split.join(' | ')}; keep number + unit or loanword phrases together with white-space: nowrap`);
        }
        return { distorted, decoOver, overflow, wide, noAlt, noName, noLabel, formIssues: [...new Set(formIssues)], punct, hidden, moving, reduce, mobile, broken, edge, overlap, notes, lang: document.documentElement.lang };
      });
      if (w >= 1024 || w <= 480) await page.evaluate(color.inject);
      const comp = (w >= 1024 || w <= 480) ? await page.evaluate(composition, { w, first: compFirst && w >= 1024 }) : { fails: [], notes: [] };
      if (w >= 1024) compFirst = false;
      const ownNotes = r.notes.length;
      r.notes.push(...comp.notes);
      const file = path.join(out, `${prefix}${scheme}-${w}.png`);
      // Viewport shots are the first screen: scroll to top instantly (smooth scroll would still be moving).
      if (!fullPage) await page.evaluate(() => new Promise(r => { scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(r)); }));
      await page.screenshot({ path: file, fullPage });
      const issues = [], rules = [];
      const push = (rule, msg) => { issues.push(msg); rules.push(rule); };
      const fresh = (arr, k) => { const n = arr.slice(reported[k]); reported[k] = arr.length; return n; };
      const e1 = fresh(errs, 'errs'), c1 = fresh(cons, 'cons'), f1 = fresh(fails, 'fails');
      if (e1.length) push('js-errors', `JS errors: ${e1.slice(0, 3).join(' | ')}`);
      if (c1.length) push('console-errors', `console errors: ${c1.slice(0, 3).join(' | ')}`);
      if (f1.length) push('failed-requests', `failed requests: ${f1.slice(0, 3).join(' | ')}`);
      if (r.overflow) push('overflow', `horizontal page overflow; widest: ${r.wide.join(', ') || 'unknown'}`);
      if (r.noAlt) push('img-alt', `${r.noAlt} visible image(s) without alt`);
      if (r.noName.length) push('unnamed-control', `unnamed controls: ${r.noName.slice(0, 3).join(' | ')}`);
      if (r.noLabel.length) push('unlabeled-field', `unlabeled fields: ${r.noLabel.slice(0, 3).join(' | ')}`);
      r.formIssues.slice(0, 4).forEach(x => push('form', `form: ${x}`));
      r.punct.forEach(x => push('text-punctuation', `text: ${x}`));
      if (r.hidden.length) push('invisible-content', `content invisible after load (opacity 0${r.reduce ? ', reduced motion' : ', first screen'}): ${r.hidden.join(' | ')}`);
      r.mobile.forEach(x => push('phone', `phone: ${x}`));
      if (r.broken.length) push('image-broken', `image(s) failed to load: ${[...new Set(r.broken)].slice(0, 3).join(', ')}`);
      if (r.overlap && r.overlap.length) push('text-overlap', `text overlaps other text: ${r.overlap.join(' | ')}`);
      if (r.decoOver && r.decoOver.length) push('decoration-covers-text', `decoration covers text: ${r.decoOver.join(' | ')}`);
      if (r.distorted && r.distorted.length) push('image-aspect', `image drawn at the wrong aspect ratio (add height:auto or object-fit): ${r.distorted.join(' | ')}`);
      if (r.edge.length) push('edge-gutter', `text touches the viewport edge (no gutter): ${r.edge.join(' | ')}`);
      if (r.moving) push('reduced-motion', `${r.moving} animation(s) still moving under prefers-reduced-motion`);
      comp.fails.forEach(x => push('composition', `composition: ${x}`));
      problems += issues.length;
      const where = `${prefix}${scheme} ${w}px`;
      issues.forEach((m, k) => R.add('fail', rules[k], m, where));
      r.notes.forEach((m, k) => R.add('note', k >= ownNotes ? 'composition' : /^Thai word split/.test(m) ? 'thai-word-split' : 'heading-wrap', m, where));
      if (cut) {
        const m = `reveal scroll stopped at ${cut.y}px of ${cut.h}px (--scroll-budget ${scrollBudget}ms); reveal-on-scroll content below may stay hidden`;
        R.add('note', 'scroll-budget', m, where); r.notes.push(m);
      }
      R.artifact('screenshots', file);
      viewports.push({ pass: prefix ? 'alt' : 'default', scheme, width: w, lang: r.lang || null, result: issues.length ? 'FAIL' : 'PASS', problems: issues.length, notes: r.notes.length, screenshot: file });
      console.log(`${issues.length ? 'FAIL' : 'PASS'}  ${prefix}${scheme} ${w}px${r.lang ? ' [' + r.lang + ']' : ''}  → ${file}`);
      issues.forEach(i => console.log('   - ' + i));
      r.notes.forEach(i => console.log('   · note: ' + i));
    }
  }
  }
  await matrix('');
  const toggle = a.get('--toggle', '');
  if (toggle) {
    try { await page.click(toggle, { timeout: 5000 }); await page.waitForTimeout(wait); }
    catch (e) { console.log(`WARN  --toggle ${toggle} could not be clicked: ${e.message.split('\n')[0]}`); R.add('warn', 'toggle', `--toggle ${toggle} could not be clicked: ${e.message.split('\n')[0]}`, toggle); }
    await matrix('alt-');
  }
  await browser.close();
  console.log(problems ? `\n${problems} problem(s). Look at the screenshots too: overlap, clipping and hierarchy need human review.` : '\nNo automated problems. Review the screenshots for overlap, clipping and hierarchy.');
  R.set('problems', problems);
  process.exit(problems ? 1 : 0);
});
