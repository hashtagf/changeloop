#!/usr/bin/env node
/*
 * First-screen check for public pages: is the primary action above the fold, is the next
 * section hinted, is the offer (a price or the --offer element) on the first screen?
 *
 * Usage:
 *   node fold_check.js <url-or-file> [--cta ".selector"] [--offer ".selector"] [--next ".selector"]
 *                      [--sizes 1440x900,390x844] [--out dir] [--wait 800] [--timeout 30000] [--json] [-h|--help]
 *
 * Defaults: --cta is the first a.btn-primary / button.btn-primary / [data-cta] inside the first
 * <section>, <header> or the first child of <main>; failing that, the first visible a.btn / button-class
 * link, <button>, then <a href> there (outside nav menus); --next is the first heading of the second <section>.
 * Per size: FAIL when the CTA's bottom edge is below the fold; NOTE when nothing of the next section
 * shows and the hero does not end at least 24px above the fold; NOTE when no offer is visible.
 * Screenshots: <out>/fold-<width>.png (default out: render-check/ next to a local page; for a URL a new
 * temp folder <os temp>/ux-ui-fold-check/<host>-<time>, printed).
 * Exit 1 on any FAIL, 3 when no browser is available (NOT RUN). A refused / unreachable URL prints
 * "ERROR <reason>" and exits 1; a slow load only WARNs. A missing file or a bad option prints "error: …" and exits 2.
 * --json: one JSON document on stdout (README "Script contract"), log lines on stderr, same exit codes; findings
 * cta-missing / cta-below-fold (fail), next-not-hinted / no-offer (note); "sizes": per viewport cta, above_fold, offer.
 */
const path = require('path');
const fs = require('fs');
const A = require('./_args');
const pw = require('./_pw');
const R = require('./_report');
const a = A.parse(process.argv.slice(2), {
  file: __filename, report: 'fold_check', values: ['--cta', '--offer', '--next', '--sizes', '--out', '--wait', '--timeout'], positional: [1, 1, '<url-or-file>'],
});
const arg0 = a._[0];
const target = pw.target(arg0);
const sizes = a.list('--sizes', null, ['1440x900', '390x844']).map(s => s.split('x').map(Number));
if (sizes.some(s => s.length !== 2 || s.some(n => !Number.isInteger(n) || n < 100))) A.usageError(`--sizes ${a.get('--sizes')} is not WIDTHxHEIGHT,…`, 'e.g. --sizes 1440x900,390x844');
const wait = a.num('--wait', 800, { min: 0 });
const timeout = a.num('--timeout', 30000, { min: 1 });
const sel = { cta: a.get('--cta', ''), offer: a.get('--offer', ''), next: a.get('--next', '') };
const env = pw.need(arg0, 'fold check');
const out = A.outFor({ given: a.get('--out'), target: arg0, script: 'fold-check', folder: 'render-check' });
R.setArtifact('out', out);
const bySize = []; R.set('sizes', bySize);
if (A.isUrl(arg0) && !a.has('--out')) console.log(`output: ${out}`);

A.main(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await pw.launch(env);
  let fails = 0;
  for (const [w, h] of sizes) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await pw.goto(page, target, { timeout, browser });
    await page.waitForTimeout(wait);
    await page.evaluate(() => new Promise(r => { scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(r)); }));
    const r = await page.evaluate(sel => {
      const vis = e => { if (!e) return false; const b = e.getBoundingClientRect(), s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
      const sections = [...document.querySelectorAll('main section, body > section, section')];
      const hero = sections[0] || document.querySelector('header') || document.querySelector('main > *');
      let cta = sel.cta ? document.querySelector(sel.cta) : null;
      if (!cta) {
        const scopes = [document.querySelector('main section'), document.querySelector('section'), document.querySelector('header'), document.querySelector('main > *')].filter(Boolean);
        for (const s of scopes) { cta = [...s.querySelectorAll('a.btn-primary, button.btn-primary, [data-cta]')].find(vis); if (cta) break; }
        // No marked primary: the first visible button-like link or button in the hero / first section
        // (a.btn, [class*=btn|button|cta], role=button, then any <button>), skipping nav menus.
        if (!cta) {
          const okEl = e => vis(e) && !e.closest('nav') && (e.innerText || e.getAttribute('aria-label') || '').trim();
          for (const s of scopes) {
            cta = [...s.querySelectorAll('a.btn, a[class*=button], a[class*=cta], button[class*=btn], button[class*=cta], a[role=button]')].find(okEl)
              || [...s.querySelectorAll('button:not([type=reset])')].find(okEl) || [...s.querySelectorAll('a[href]')].find(okEl);
            if (cta) break;
          }
        }
      }
      let next = sel.next ? document.querySelector(sel.next) : null;
      if (!next) { const s2 = sections.find(s => s !== hero && !hero?.contains(s) && s.getBoundingClientRect().top >= (hero ? hero.getBoundingClientRect().bottom - 1 : 0)); next = s2 && (s2.querySelector('h1,h2,h3') || s2); }
      const fold = innerHeight;
      const ctaBox = cta && vis(cta) ? cta.getBoundingClientRect() : null;
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : null;
      const nextTop = next ? next.getBoundingClientRect().top : null;
      let offer = null;
      if (sel.offer) { const o = document.querySelector(sel.offer); offer = o && vis(o) && o.getBoundingClientRect().top < fold ? o.innerText.trim().slice(0, 50) : null; }
      else {
        const re = /฿\s?\d|\$\s?\d|\d[\d,.]*\s?(บาท|THB)/;
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = tw.nextNode())) {
          if (!re.test(n.parentElement?.innerText || '') || !vis(n.parentElement)) continue;
          const rg = document.createRange(); rg.selectNodeContents(n); const b = rg.getBoundingClientRect();
          if (b.height && b.top >= 0 && b.bottom <= fold) { offer = (n.parentElement.closest('p,li,div,span') || n.parentElement).innerText.trim().slice(0, 50); break; }
        }
      }
      return { fold, cta: cta ? (cta.innerText || cta.getAttribute('aria-label') || '').trim().slice(0, 30) : null, ctaBottom: ctaBox ? Math.round(ctaBox.bottom) : null, heroBottom: heroBottom == null ? null : Math.round(heroBottom), nextTop: nextTop == null ? null : Math.round(nextTop), offer };
    }, sel);
    const file = path.join(out, `fold-${w}.png`);
    await page.screenshot({ path: file });
    const lines = [];
    let fail = false;
    if (r.ctaBottom == null) { fail = true; lines.push(`- no primary CTA found${sel.cta ? ` for ${sel.cta}` : ' (pass --cta)'}`); }
    else if (r.ctaBottom > r.fold) { fail = true; lines.push(`- CTA "${r.cta}" ends at ${r.ctaBottom}px, below the ${r.fold}px fold`); }
    else lines.push(`  CTA "${r.cta}" ends at ${r.ctaBottom}px of ${r.fold}px`);
    const hinted = (r.nextTop != null && r.nextTop < r.fold) || (r.heroBottom != null && r.heroBottom <= r.fold - 24);
    const nextAt = `${r.heroBottom == null ? 'no hero found' : `hero ends ${r.heroBottom}px`}, ${r.nextTop == null ? 'no second section found (pass --next)' : `next heading at ${r.nextTop}px`}`;
    lines.push(hinted ? `  next section hinted (${nextAt})` : `· note: next section not hinted: ${nextAt}`);
    lines.push(r.offer ? `  offer on first screen: "${r.offer}"` : '· note: no offer or price on the first screen' + (sel.offer ? ` (${sel.offer})` : ''));
    if (fail) fails++;
    const where = `${w}x${h}`;
    if (r.ctaBottom == null) R.add('fail', 'cta-missing', lines[0].slice(2), where);
    else if (r.ctaBottom > r.fold) R.add('fail', 'cta-below-fold', lines[0].slice(2), where, { cta: r.cta, cta_bottom: r.ctaBottom, fold: r.fold });
    if (!hinted) R.add('note', 'next-not-hinted', lines[1].replace('· note: ', ''), where, { hero_bottom: r.heroBottom, next_top: r.nextTop });
    if (!r.offer) R.add('note', 'no-offer', lines[2].replace('· note: ', ''), where);
    R.artifact('screenshots', file);
    bySize.push({ viewport: where, width: w, height: h, result: fail ? 'FAIL' : 'PASS', fold: r.fold, cta: r.cta, cta_found: r.ctaBottom != null,
      cta_bottom: r.ctaBottom, above_fold: r.ctaBottom != null && r.ctaBottom <= r.fold, hero_bottom: r.heroBottom, next_top: r.nextTop,
      next_hinted: hinted, offer: r.offer, screenshot: file });
    console.log(`${fail ? 'FAIL' : 'PASS'}  ${w}x${h}  → ${file}`);
    lines.forEach(l => console.log('   ' + l));
    await page.close();
  }
  await browser.close();
  process.exit(fails ? 1 : 0);
});
