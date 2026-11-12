#!/usr/bin/env node
/*
 * Rendered enterprise / back-office audit by page type, plus URL-reachable states.
 *
 * What:  checks the rules from references/back-office.md, component-states.md and
 *        data-visualization.md that only show up in a rendered admin page.
 * Why:   render_check.js is a generic smoke check (overflow, errors, names); nothing else
 *        catches a left-aligned money column, a sticky save bar that cannot stick, or a
 *        disabled button with no reason.
 * How:   node admin_check.js <url-or-file> --type list|detail|form|dashboard [--states] [--out dir] [--timeout ms] [--json] [-h|--help]
 *        (also run by `python3 scripts/check.py <page> --admin <type>`).
 *
 * Rules (FAIL unless marked note):
 *   numeric-align      numeric/money column cells not right-aligned (all types)
 *   tabular-nums       numeric column without tabular figures or a monospace face (all types)
 *   disabled-reason    disabled control with no reason (aria-describedby / title / data-reason) (all types)
 *   sticky-inert       position:sticky inside an overflow:hidden/clip ancestor, so it never sticks (all types)
 *   one-primary        more than one filled accent button in the first viewport (detail, form; note on list)
 *   table-above-fold   list page whose first table/grid starts below 1440x900 (list)
 *   row-height         body rows of one table differ by more than 1.5x the median (note)
 *   readonly-input     read-only value rendered as a greyed input instead of text (note; detail)
 *   uppercase-text     uppercase text runs longer than 20 characters (note)
 * --states renders <page>?state=loading|empty|nomatch|error|denied|partial and fails a state whose
 *   visible text is identical to the default page (the state is declared but not built).
 * Screenshots: admin-check/ next to a local page; for a URL a new temp folder
 * (<os temp>/ux-ui-admin-check/<host>-<time>, printed); --out overrides.
 * Exit 1 on any FAIL; 3 when no Playwright/browser (NOT RUN). A refused / unreachable URL prints
 * "ERROR <reason>" and exits 1 (a slow load only WARNs); a missing file or a bad option prints "error: …", exit 2.
 * one-primary reads button colours through a canvas, so oklch()/oklab()/color-mix() accents count.
 * --json: one JSON document on stdout (README "Script contract"), log lines on stderr, same exit codes; findings use
 * the rule ids above (plus state-not-built, js-errors); "page_type", "checks" {rule: PASS|FAIL|NOTE}, "states".
 */
const path = require('path');
const fs = require('fs');
const A = require('./_args');
const pw = require('./_pw');
const color = require('./_color');
const R = require('./_report');
const a = A.parse(process.argv.slice(2), { file: __filename, report: 'admin_check', values: ['--type', '--out', '--timeout'], flags: ['--states'], positional: [1, 1, '<url-or-file>'] });
const TYPES = ['list', 'detail', 'form', 'dashboard'];
const type = a.get('--type', 'list');
if (!TYPES.includes(type)) A.usageError(`unknown --type ${type}`, `choose from ${TYPES.join(', ')}`);
const arg0 = a._[0];
const base = pw.target(arg0);
const timeout = a.num('--timeout', 30000, { min: 1 });
const env = pw.need(arg0, 'admin check');
const out = A.outFor({ given: a.get('--out'), target: arg0, script: 'admin-check', folder: 'admin-check' });
if (A.isUrl(arg0) && !a.has('--out')) console.log(`output: ${out}`);
R.setArtifact('out', out);
R.set('page_type', type);
const STATES = ['loading', 'empty', 'nomatch', 'error', 'denied', 'partial'];
const withState = (u, s) => { const [a, h = ''] = u.split('#'); return a + (a.includes('?') ? '&' : '?') + 'state=' + s + (h ? '#' + h : ''); };

function audit(type) {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : '')) + ' "' + (e.innerText || e.value || '').trim().slice(0, 30) + '"';
  const fails = [], notes = [];
  const NUM = /^[-+−(]?\s?[฿$€£¥]?\s?\d[\d,.\s]*\s?(%|฿|บาท|THB|USD)?\)?$/;
  // numeric columns
  document.querySelectorAll('table').forEach((t, ti) => {
    if (!vis(t)) return;
    const rows = [...t.querySelectorAll('tbody tr')].filter(vis);
    const cols = {};
    rows.forEach(r => [...r.children].forEach((c, ci) => { const tx = c.innerText.trim(); if (!tx || tx === '—' || tx === '-') return; (cols[ci] = cols[ci] || []).push([c, NUM.test(tx) && /\d/.test(tx) && !/^\d{1,2}[\/.:]\d/.test(tx)]); }));
    Object.entries(cols).forEach(([ci, cells]) => {
      const num = cells.filter(x => x[1]).map(x => x[0]);
      if (num.length < 2 || num.length / cells.length < 0.6) return;
      const head = (t.querySelectorAll('thead th')[ci] || {}).innerText || 'col ' + (+ci + 1);
      const left = num.filter(c => { const a = getComputedStyle(c).textAlign; return !(a === 'right' || a === 'end' || (a === 'start' && getComputedStyle(c).direction === 'rtl')); });
      if (left.length > num.length / 2) fails.push(`numeric-align: table ${ti + 1} "${head.trim()}" numbers are not right-aligned`);
      const prop = num.filter(c => { const s = getComputedStyle(c); const inner = c.querySelector('*') ? getComputedStyle(c.querySelector('*')) : s; return !/tabular-nums/.test(s.fontVariantNumeric + inner.fontVariantNumeric) && !/mono/i.test(s.fontFamily); });
      if (prop.length > num.length / 2) fails.push(`tabular-nums: table ${ti + 1} "${head.trim()}" has no tabular figures (font-variant-numeric: tabular-nums)`);
    });
    const hs = rows.map(r => r.getBoundingClientRect().height).sort((a, b) => a - b);
    if (hs.length > 3) { const med = hs[hs.length >> 1]; if (hs[hs.length - 1] > med * 1.5) notes.push(`row-height: table ${ti + 1} rows range ${Math.round(hs[0])}–${Math.round(hs[hs.length - 1])}px (median ${Math.round(med)})`); }
  });
  // disabled without reason
  document.querySelectorAll('button:disabled, [aria-disabled="true"], input[type=submit]:disabled').forEach(e => {
    if (!vis(e) || e.closest('[aria-hidden="true"]')) return;
    if (!(e.getAttribute('aria-describedby') || e.title || e.dataset.reason || e.closest('[title]'))) fails.push(`disabled-reason: ${name(e)} is disabled with no reason (aria-describedby, title or visible text)`);
  });
  // sticky that cannot stick
  document.querySelectorAll('*').forEach(e => {
    if (getComputedStyle(e).position !== 'sticky' || !vis(e)) return;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a), o = s.overflowY + ' ' + s.overflowX;
      if (/hidden|clip/.test(o)) { fails.push(`sticky-inert: ${name(e)} is sticky inside ${name(a)} (overflow ${s.overflowY}), so it never sticks`); break; }
      if (/auto|scroll/.test(o)) break;
    }
  });
  // primary actions in first viewport
  // any computed colour (rgb, oklab, oklch, color-mix…) -> sRGB via the canvas helper from _color.js (injected)
  const C = window.__uxuiColor;
  const sat = c => C.sat(C.canvasRGBA(c));
  const prim = [...document.querySelectorAll('button, a[role=button], a.btn, input[type=submit]')].filter(e => vis(e) && e.getBoundingClientRect().top < innerHeight && !e.closest('tbody, nav, [role=tablist], [role=dialog]') && sat(getComputedStyle(e).backgroundColor) > 0.35);
  if (prim.length > 1) (type === 'list' || type === 'dashboard' ? notes : fails).push(`one-primary: ${prim.length} filled accent buttons in the first viewport: ${prim.slice(0, 4).map(name).join(', ')}`);
  // list: table above fold
  if (type === 'list') { const t = [...document.querySelectorAll('table, [role=grid], [role=table]')].find(vis); if (!t) notes.push('table-above-fold: no table or grid found'); else if (t.getBoundingClientRect().top + scrollY > innerHeight) fails.push(`table-above-fold: first table starts at ${Math.round(t.getBoundingClientRect().top + scrollY)}px, below the ${innerHeight}px fold`); }
  if (type === 'detail') document.querySelectorAll('input[readonly], input:disabled, textarea[readonly]').forEach(e => { if (vis(e) && !e.closest('form[data-editing]')) notes.push(`readonly-input: ${name(e)} — show a read-only value as text, not a greyed input`); });
  let up = 0; document.querySelectorAll('body *').forEach(e => { if (e.children.length === 0 && getComputedStyle(e).textTransform === 'uppercase' && (e.innerText || '').trim().length > 20 && vis(e)) up++; });
  if (up) notes.push(`uppercase-text: ${up} uppercase run(s) longer than 20 characters`);
  return { fails: [...new Set(fails)], notes: [...new Set(notes)].slice(0, 12), text: document.body.innerText.replace(/\s+/g, ' ').trim() };
}

A.main(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await pw.launch(env);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const load = async u => {
    await pw.goto(page, u, { timeout, browser });
    await page.waitForTimeout(500);
    await page.evaluate(color.inject);
  };
  let failed = 0;
  await load(base);
  const r = await page.evaluate(audit, type);
  await page.screenshot({ path: path.join(out, `admin-${type}-default.png`) });
  console.log(`${r.fails.length ? 'FAIL' : 'PASS'}  admin ${type} 1440x900  → ${path.join(out, `admin-${type}-default.png`)}`);
  r.fails.forEach(f => console.log('   - ' + f)); r.notes.forEach(n => console.log('   · note: ' + n));
  R.artifact('screenshots', path.join(out, `admin-${type}-default.png`));
  const rid = t => { const i = t.indexOf(': '); return i > 0 ? [t.slice(0, i), t.slice(i + 2)] : ['admin', t]; };
  r.fails.forEach(f => { const [k, m] = rid(f); R.add('fail', k, m, `${type} 1440x900`); });
  r.notes.forEach(n => { const [k, m] = rid(n); R.add('note', k, m, `${type} 1440x900`); });
  const RULES = ['numeric-align', 'tabular-nums', 'disabled-reason', 'sticky-inert', 'one-primary', 'row-height', 'uppercase-text']
    .concat(type === 'list' ? ['table-above-fold'] : [], type === 'detail' ? ['readonly-input'] : []);
  const checks = {};
  RULES.forEach(k => { checks[k] = r.fails.some(f => rid(f)[0] === k) ? 'FAIL' : r.notes.some(n => rid(n)[0] === k) ? 'NOTE' : 'PASS'; });
  R.set('checks', checks);
  const stateRes = {};
  failed += r.fails.length;
  if (a.has('--states')) {
    for (const s of STATES) {
      await load(withState(base, s));
      const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
      const shot = path.join(out, `admin-${type}-${s}.png`);
      await page.screenshot({ path: shot });
      const same = t === r.text;
      if (same) failed++;
      stateRes[s] = { result: same ? 'FAIL' : 'PASS', screenshot: shot };
      R.artifact('screenshots', shot);
      if (same) R.add('fail', 'state-not-built', 'page identical to default: state not built', `?state=${s}`);
      console.log(`${same ? 'FAIL' : 'PASS'}  ?state=${s}${same ? '  page identical to default: state not built' : ''}  → ${shot}`);
    }
    R.set('states', stateRes);
  }
  if (errs.length) { R.add('fail', 'js-errors', 'JS errors: ' + [...new Set(errs)].slice(0, 3).join(' | '), `${type} 1440x900`, { count: errs.length }); failed += errs.length; console.log('FAIL  JS errors: ' + [...new Set(errs)].slice(0, 3).join(' | ')); }
  await browser.close();
  console.log(failed ? `\n${failed} problem(s).` : '\nNo admin rule failures. Notes are judgment calls; look at the screenshots.');
  R.set('problems', failed);
  process.exit(failed ? 1 : 0);
});
