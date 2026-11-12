#!/usr/bin/env node
/*
 * Rebuild every preview image of the ux-ui-principles skill. The images are generated, not
 * committed (they are git-ignored); the data and generators are the source of truth.
 *
 * Usage:
 *   node scripts/build_previews.js [--only directions,brand,backoffice,mobile,tablet,rtl] [--thai] [--dry-run] [-h|--help]
 *
 * Runs, in order (needs Playwright; see render_check.js --doctor; fonts need network):
 *   directions   direction_preview.js --sheet            assets/directions/previews   (~2 min; each direction in its
 *                composition on a subject's content with photographs)
 *   brand        backoffice_preview.js --direction all   assets/directions/previews/product (~3 min; the same
 *                directions as product UI: one token set for public pages and admin)
 *   backoffice   backoffice_preview.js --sheet           assets/backoffice/previews   (~2 min)
 *   mobile       backoffice_preview.js --mobile --sheet --singles none   assets/backoffice/previews (m-*; ~1 min)
 *   tablet       backoffice_preview.js --width 820 --height 1366 (records, overview, approval, detail)
 *   rtl          backoffice_preview.js --rtl (layout mirroring)
 * Output folders are resolved from the skill root (scripts/..), so the current directory does not matter.
 * --dry-run prints the commands (with their absolute --out folders) and renders nothing.
 * Total about 10 minutes and 30 MB. Use --only to rebuild one set, or call a generator directly
 * with --ids / --pages / --styles / --screens for a few pictures (direction_preview.js with --ids/--group/--subject/
 * --comp/--brief/--width/--height writes to a temp folder or --out, never over these library pictures).
 */
const { spawnSync } = require('child_process');
const path = require('path');
const A = require('./_args');
const SETS = ['directions', 'brand', 'backoffice', 'mobile', 'tablet', 'rtl'];
const a = A.parse(process.argv.slice(2), { file: __filename, values: ['--only'], flags: ['--thai', '--dry-run'] });
const only = a.list('--only', SETS, SETS);
const thai = a.has('--thai') ? ['--thai'] : [];
const dry = a.has('--dry-run');
// library folders are resolved from the skill root, so running from any directory writes the skill's own assets/
const lib = (rel) => A.libPath(rel);
const run = (script, a) => {
  console.log(`\n> node scripts/${script} ${a.join(' ')}`);
  if (dry) return;
  const r = spawnSync('node', [path.join(__dirname, script), ...a], { stdio: 'inherit' });
  if (r.status === 3) { console.log('NOT RUN: no Playwright module or browser (npm i -D playwright && npx playwright install chromium)'); process.exit(3); }
  if (r.status) process.exit(r.status);
};
if (only.includes('directions')) run('direction_preview.js', ['--sheet', '--out', lib('assets/directions/previews'), ...thai]);
if (only.includes('brand')) run('backoffice_preview.js', ['--direction', 'all', '--screens', 'overview,records', '--singles', 'all', '--sheet', '--out', lib('assets/directions/previews/product'), ...thai]);
// --singles is explicit: with --out the generator would otherwise keep every single image
if (only.includes('backoffice')) run('backoffice_preview.js', ['--sheet', '--singles', 'records,approval', '--out', lib('assets/backoffice/previews'), ...thai]);
if (only.includes('mobile')) run('backoffice_preview.js', ['--mobile', '--sheet', '--singles', 'none', '--out', lib('assets/backoffice/previews'), ...thai]);
if (only.includes('tablet')) run('backoffice_preview.js', ['--screens', 'records,overview,approval,detail', '--width', '820', '--height', '1366', '--sheet', '--out', lib('assets/backoffice/previews/tablet'), ...thai]);
if (only.includes('rtl')) run('backoffice_preview.js', ['--screens', 'records,overview,approval', '--rtl', '--sheet', '--out', lib('assets/backoffice/previews/rtl')]);
console.log(dry ? '\nDry run: nothing rendered.' : '\nPreviews rebuilt.');
