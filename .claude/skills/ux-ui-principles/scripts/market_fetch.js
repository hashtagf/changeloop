#!/usr/bin/env node
/*
 * Screenshot the sites of a market study (assets/market/catalog.json) so you can look at the category
 * before choosing a direction (references/design-direction.md §9, Round B "research the market first").
 *
 * Usage:
 *   node scripts/market_fetch.js --kind clinic                 # (re)shoot every site listed for that kind
 *   node scripts/market_fetch.js --kind spa --urls urls.txt    # new study: one "slug url TH|intl" per line
 *   options: [--out assets/market/img] [--width 1440] [--height 900] [--only slug1,slug2] [--timeout 45000] [-h|--help]
 *
 * Writes <out>/<kind>-<slug>-1.jpg (first screen) and -2.jpg (scrolled one screen), JPEG quality 70.
 * The pictures are other businesses' pages: they stay local (git-ignored) as a study set and never go into
 * client work. A new study prints a catalog stub to fill in (category_look, designed_moves, gaps, facts,
 * a note and verdict per site) after you have looked at every picture.
 * The default --out is the skill's assets/market/img (resolved from the skill root, whatever the current
 * directory); a given --out is resolved against the current directory.
 * Exit 0 when every site was shot; 1 when any was skipped (WARN skip lines: refused, unreachable, timed out twice);
 * 2 for a usage error (no --kind, unknown study, --only slug not in the study: the valid slugs are listed; an --urls
 * file that is missing, a folder or unreadable, or a line without an http(s) URL);
 * 3 when Playwright or a browser is missing (NOT RUN). Setup: see render_check.js --doctor; nothing is downloaded.
 */
const fs = require('fs');
const path = require('path');
const A = require('./_args');
const pw = require('./_pw');
const a = A.parse(process.argv.slice(2), { file: __filename, values: ['--kind', '--urls', '--out', '--width', '--height', '--only', '--timeout'], required: ['--kind'] });

const kind = a.get('--kind');
// library study set: assets/market/img under the skill root (git-ignored); a user --out resolves against the current directory
const out = a.has('--out') ? A.userPath(a.get('--out')) : A.libPath('assets/market/img');
const W = a.num('--width', 1440, { min: 200, int: true }), H = a.num('--height', 900, { min: 200, int: true });
const timeout = a.num('--timeout', 45000, { min: 1 });
const catalogFile = A.libPath('assets/market/catalog.json');
let catalog;
try { catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8')); } catch (e) { A.usageError(`cannot read ${catalogFile}: ${e.message.split('\n')[0]}`, 'restore the catalog'); }

let sites;
if (a.has('--urls')) {
  const f = a.get('--urls');
  if (!fs.existsSync(f)) A.usageError(`--urls file not found: ${path.resolve(f)}`, 'one "slug url TH|intl" per line');
  if (!fs.statSync(f).isFile()) A.usageError(`--urls ${path.resolve(f)} is not a file`, 'one "slug url TH|intl" per line');
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch (e) { A.usageError(`cannot read --urls ${path.resolve(f)}: ${e.code || e.message.split('\n')[0]}`, 'check the file permissions'); }
  sites = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => { const [slug, url, region] = l.split(/\s+/); return { slug, url, region: region || '?' }; });
  const bad = sites.filter(s => !s.slug || !/^https?:\/\/[^\s/]/i.test(s.url || ''));
  if (bad.length) A.usageError(`--urls line for ${JSON.stringify(bad[0].slug || '')} has no http(s) URL`, 'one "slug url TH|intl" per line');
} else {
  const k = (catalog.kinds || {})[kind];
  if (!k) A.usageError(`no study for '${kind}' in assets/market/catalog.json`, `pass --urls to start one; studies: ${Object.keys(catalog.kinds || {}).join(', ')}`);
  sites = k.sites;
}
if (a.has('--only')) sites = a.list('--only', sites.map(s => s.slug)).map(slug => sites.find(s => s.slug === slug));
if (!sites.length) A.usageError('no sites to shoot', 'check --kind / --urls');

A.main(async () => {
  const env = pw.need(process.cwd(), 'market fetch');
  fs.mkdirSync(out, { recursive: true });
  const browser = await pw.launch(env);
  const ok = [], failed = [];
  for (const s of sites) {
    const page = await browser.newPage({ viewport: { width: W, height: H }, locale: s.region === 'TH' ? 'th-TH' : 'en-US' });
    let done = false;
    for (let attempt = 0; attempt < 2 && !done; attempt++) {
      try {
        await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout });
        await page.waitForTimeout(3500);
        // dismiss the most common cookie banners; harmless when absent
        for (const label of ['Accept', 'Accept all', 'Allow', 'I agree', 'OK', 'ยอมรับ', 'ยอมรับทั้งหมด', 'ตกลง']) {
          const b = page.getByRole('button', { name: label, exact: true }).first();
          if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await page.waitForTimeout(500); break; }
        }
        const base = path.join(out, `${kind}-${s.slug}`);
        await page.screenshot({ path: base + '-1.jpg', type: 'jpeg', quality: 70 });
        await page.evaluate(h => window.scrollTo(0, h), H);
        await page.waitForTimeout(1200);
        await page.screenshot({ path: base + '-2.jpg', type: 'jpeg', quality: 70 });
        ok.push(s); done = true;
        console.log(`PASS  ${s.slug}  → ${base}-1.jpg`);
      } catch (e) {
        // a refused / unreachable site is not retried; a timeout is, once
        const final = attempt === 1 || !(e && e.name === 'TimeoutError');
        if (final) { failed.push(s); attempt = 1; console.log(`WARN  skip ${s.slug}  ${String(e && e.message || e).split('\n')[0]}`); }
      }
    }
    await page.close();
  }
  await browser.close();
  console.log(`\n${ok.length} shot, ${failed.length} skipped. Open every -1 and -2 picture before writing the study.`);
  if (a.has('--urls')) {
    const stub = { synonyms: [kind], studied: new Date().toISOString().slice(0, 10), category_look: '', designed_moves: '', gaps: ['', '', ''], facts: [],
      sites: ok.map(s => ({ slug: s.slug, url: s.url, region: s.region, verdict: 'category | designed', note: '' })) };
    console.log(`\nAdd to assets/market/catalog.json under kinds.${kind} after looking:\n` + JSON.stringify(stub, null, 2));
  }
  process.exit(failed.length ? 1 : 0);
});
