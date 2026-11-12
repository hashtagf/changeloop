#!/usr/bin/env node
/*
 * Render one-screen preview pictures of the directions in assets/directions/directions.json,
 * so a user can choose a look from pictures (references/direction-library.md).
 *
 * Usage:
 *   node scripts/direction_preview.js [--ids dose,riso] [--group company|premium|playful|atmospheric]
 *        [--out dir] [--width 1440] [--height 1240] [--sheet] [--brief "Headline|Sentence|Button"] [--comp c1..c14] [--subject <pack>]
 *        [--same-comp] [--thai] [-h|--help]
 *   client shortlist: node scripts/direction_preview.js --ids a,b,c --subject dental --sheet --out <project>/previews
 *
 * Output: with no selection flags (the library build, as build_previews.js runs it) the pictures go to
 * assets/directions/previews/ (<id>.jpg, sheet.jpg, sheet-<group>.jpg). When any of --ids, --group, --subject, --comp,
 * --brief, --width or --height is given (a different set or size) and --out is not, they go to a new temp folder (<os temp>/ux-ui-previews/<timestamp>, printed),
 * so a client shortlist never overwrites the library previews that look.py serves. Pass --out to choose.
 *
 * A shortlist (--ids) must differ in layout, not only colour: when two listed directions share a composition,
 * the later ones are drawn in the next unused composition and the script says so (--same-comp keeps them).
 * A subject without photographs (a content pack with no "photo", e.g. saas, data) is only moved to a composition
 * that needs none (photo compositions: c2 c3 c6 c9 c11 c12 c13).
 * For a client, add --subject <their kind> (e.g. dental) so every option shows their world.
 * Unknown --ids entries, --group, --comp or --subject values, an unknown option or a bad --width/--height exit 2
 * with the valid choices ("error: …" on stderr). A given --out is resolved against the current directory; the
 * library folder is resolved from the skill root.
 *
 * Each direction is drawn in its own composition (scripts/compositions.js, c1..c14: editorial, collage, full-bleed
 * photo, Swiss, soft product, poster, question, centred, magazine, board, nocturne, portrait, nature, cover) on
 * content from a real kind of business (assets/directions/content-packs.json) with open-collection photographs
 * (assets/photos/). The pairing lives in directions.json (comp, subject, photoFilter); --comp c1..c14 and
 * --subject <pack> override it to try a direction in another arrangement. Fonts load
 * from Google Fonts (network); offline, generic fallbacks are used and the previews say so.
 * --sheet also writes sheet.jpg (sheet-th.jpg with --thai): every preview as a labelled thumbnail grid.
 * Setup needs Playwright; nothing is downloaded (see render_check.js --doctor). Exit 3: no Playwright.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const A = require('./_args');
const pw = require('./_pw');
const a = A.parse(process.argv.slice(2), {
  file: __filename,
  values: ['--ids', '--group', '--out', '--width', '--height', '--brief', '--comp', '--subject'],
  flags: ['--sheet', '--same-comp', '--thai'],
});
const opt = (k, d) => a.get(k, d);
const has = k => a.has(k);
const fail = (what, how) => A.usageError(what, how);

const root = A.ROOT;
const readJson = (rel) => { const f = path.join(root, rel); try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return fail(`cannot read ${f}: ${e.message.split('\n')[0]}`, 'restore the file'); } };
const data = readJson('assets/directions/directions.json').directions;
const comps = require('./compositions');
const packs = readJson('assets/directions/content-packs.json').packs;
if (opt('--comp') && !comps.COMPS[opt('--comp')]) fail(`unknown --comp ${opt('--comp')}`, `choose one of ${Object.keys(comps.COMPS).join(', ')}`);
if (opt('--subject') && !packs[opt('--subject')]) fail(`unknown --subject ${opt('--subject')}`, `choose one of ${Object.keys(packs).join(', ')}`);
const GROUPS = [...new Set(data.map(d => d.group))];
if (opt('--group') && !GROUPS.includes(opt('--group'))) fail(`unknown --group ${opt('--group')}`, `choose one of ${GROUPS.join(', ')}`);
// a client selection never writes into the library folder unless --out says so
const custom = ['--ids', '--group', '--subject', '--comp', '--brief', '--width', '--height'].some(has);
const libraryOut = A.libPath('assets/directions/previews');
const out = opt('--out') ? A.userPath(opt('--out')) : custom ? path.join(os.tmpdir(), 'ux-ui-previews', A.stamp()) : libraryOut;
const W = a.num('--width', 1440, { min: 200, max: 4000, int: true }), H = a.num('--height', 1240, { min: 200, max: 6000, int: true });
let list = data;
if (opt('--ids')) { const ids = a.list('--ids', data.map(d => d.id)); list = data.filter(d => ids.includes(d.id)); }
if (opt('--group')) list = list.filter(d => d.group === opt('--group'));
if (!list.length) fail('no directions matched', '--ids and --group select no direction together');

const thai = has('--thai');
if (custom && !opt('--out')) console.log(`output: ${out} (temp folder; pass --out <project>/previews to keep them; the library previews are not touched)`);
const photoDir = path.join(root, 'assets/photos');
const photos = {};
if (fs.existsSync(photoDir)) for (const f of fs.readdirSync(photoDir)) if (/\.jpe?g$/i.test(f)) photos[f.replace(/\.jpe?g$/i, '')] = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(photoDir, f)).toString('base64');
// --brief "Headline|Sentence|Button" replaces the pack's headline, sentence and action with the user's copy
const withBrief = (p) => (brief[0] ? Object.assign({}, p, { h1: [brief[0], '', ''], sub: brief[1] || p.sub, cta: brief[2] || p.cta }) : p);
// shortlist: give directions that share a composition different ones, so the user compares layouts, not swatches
const ORDER = ['c5', 'c1', 'c2', 'c3', 'c8', 'c13', 'c12', 'c14', 'c4', 'c6', 'c9', 'c7', 'c10', 'c11'];
// compositions that draw photographs (scripts/compositions.js); a pack without a "photo" leaves them empty
const PHOTO_COMPS = new Set(['c2', 'c3', 'c6', 'c9', 'c11', 'c12', 'c13']);
const packOf = (d) => packs[opt('--subject', d.subject)] || packs.cafe;
const compOf = {};
if ((opt('--ids') || opt('--subject')) && !opt('--comp') && !has('--same-comp')) {
  const used = new Set();
  for (const d of list) {
    let c = d.comp;
    const fits = (x) => !!packOf(d).photo || !PHOTO_COMPS.has(x);
    const shared = opt('--ids') && used.has(c);
    if (shared || !fits(c)) {
      const alt = ORDER.find(x => !used.has(x) && x !== d.comp && fits(x)) || (fits(c) ? null : ORDER.find(x => fits(x)));
      if (alt) {
        console.log(shared
          ? `${d.id} shares ${c} with an earlier pick; drawn in ${alt} so the shortlist differs in layout (--same-comp to keep ${c})`
          : `${d.id}: ${c} needs photographs and subject ${opt('--subject', d.subject)} has none; drawn in ${alt}`);
        c = alt;
      }
    }
    used.add(c); compOf[d.id] = c;
  }
}
const pageFor = (d) => comps.render(d, opt('--comp', compOf[d.id] || d.comp), withBrief(packOf(d)), photos, { width: W, height: H, photoFilter: d.photoFilter, subject: opt('--subject', d.subject) });
const brief = (opt('--brief', '') || '').split('|');

A.main(async () => {
  const env = pw.need(process.cwd(), 'direction preview');
  fs.mkdirSync(out, { recursive: true });
  const browser = await pw.launch(env);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const d of list) {
    await page.setContent(pageFor(d), { waitUntil: 'load', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(900);
    const file = path.join(out, `${d.id}${thai ? '-th' : ''}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`${d.id}  ${d.group}  → ${file}`);
  }
  if (has('--sheet')) {
    const makeSheet = async (items, name) => {
      const cols = 4, tw = 480, th = Math.round(tw * H / W);
      const cells = items.map(d => `<figure style="margin:0"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(out, `${d.id}${thai ? '-th' : ''}.jpg`)).toString('base64')}" width="${tw}" height="${th}" style="display:block;border:1px solid #ccc"><figcaption style="font:600 16px system-ui;padding:6px 2px">${d.name} <span style="font-weight:400;color:#666">${d.group}</span></figcaption></figure>`).join('');
      await page.setViewportSize({ width: cols * (tw + 24) + 24, height: 400 });
      await page.setContent(`<body style="margin:0;padding:24px;background:#fff"><div style="display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:20px 24px">${cells}</div></body>`, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const sheetFile = path.join(out, `${name}${thai ? '-th' : ''}.jpg`);
      await page.screenshot({ path: sheetFile, type: 'jpeg', quality: 78, fullPage: true });
      console.log(`${name} → ${sheetFile}`);
    };
    await makeSheet(list, has('--group') ? `sheet-${opt('--group')}` : 'sheet');
    if (!has('--group') && !opt('--ids')) for (const g of [...new Set(list.map(d => d.group))]) await makeSheet(list.filter(d => d.group === g), `sheet-${g}`);
  }
  await browser.close();
});
