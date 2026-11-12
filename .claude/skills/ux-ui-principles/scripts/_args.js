/*
 * Shared command-line handling for the skill's Node scripts. Standard library only.
 *
 *   const A = require('./_args');
 *   const a = A.parse(process.argv.slice(2), { file: __filename, values: ['--out', '--width'], flags: ['--fast'],
 *                                               positional: [1, 1, '<url-or-file>'], required: ['--kind'] });
 *   a.get('--out', dflt)  a.has('--fast')  a.num('--width', 1440)  a._ (positionals)
 *
 * -h / --help anywhere prints the calling script's header comment and exits 0. An unknown flag, a value flag
 * without a value, a missing required flag or a wrong number of positionals prints
 * "error: <what> (<how to fix>)" to stderr and exits 2. "--flag=value" is accepted for value flags; "--" ends the
 * options (every argument after it is a positional, e.g. a file named "-x.html").
 * Paths: userPath() resolves a user-given path against the current directory; libPath() resolves an
 * internal library path against the skill root; tempOut() is os.tmpdir()/ux-ui-<script>/<host>-<timestamp>.
 * spec.report = '<script name>' also accepts --json and starts the shared JSON report (_report.js); usage errors
 * and main() errors are then recorded in it as well.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const R = require('./_report');

const ROOT = path.resolve(__dirname, '..');
const isUrl = (s) => /^[a-z][a-z0-9+.-]*:\/\//i.test(String(s || ''));

function usageError(what, how = 'see --help') {
  R.error(what);
  console.error(`error: ${what} (${how})`);
  process.exit(2);
}

function helpText(file) {
  const m = fs.readFileSync(file, 'utf8').match(/\/\*([\s\S]*?)\*\//);
  return m ? m[1].split('\n').map((l) => l.replace(/^ \* ?/, '').replace(/^ \*$/, '')).join('\n').trim() : '';
}

function parse(argv, spec = {}) {
  const values = new Set(spec.values || []), flags = new Set(spec.flags || []);
  const opts = argv.includes('--') ? argv.slice(0, argv.indexOf('--')) : argv;
  if (opts.includes('-h') || opts.includes('--help')) { console.log(helpText(spec.file || require.main.filename)); process.exit(0); }
  if (spec.report) { flags.add('--json'); R.start(spec.report, opts.includes('--json')); }
  const got = new Map(), pos = [];
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i], inline;
    if (a === '--') { pos.push(...argv.slice(i + 1)); break; } // end of options: the rest are positionals
    if (a.startsWith('--') && a.includes('=')) { inline = a.slice(a.indexOf('=') + 1); a = a.slice(0, a.indexOf('=')); }
    if (values.has(a)) {
      const v = inline !== undefined ? inline : argv[i + 1];
      if (inline === undefined) i++;
      if (v === undefined || v === '' || (inline === undefined && /^--./.test(v))) usageError(`${a} needs a value`);
      got.set(a, v);
    } else if (flags.has(a) && inline === undefined) got.set(a, true);
    else if (/^-(-.|[A-Za-z])/.test(a)) usageError(`unknown option ${JSON.stringify(argv[i])}`);
    else pos.push(a);
  }
  R.target(pos.length ? pos[0] : null);
  for (const r of spec.required || []) if (!got.has(r)) usageError(`${r} is required`);
  const [min = 0, max = Infinity, name = 'argument'] = spec.positional || [0, 0];
  if (pos.length < min) usageError(`missing ${name}`);
  if (pos.length > max) usageError(`unexpected argument ${JSON.stringify(pos[max])}`);
  const res = {
    _: pos,
    has: (k) => got.has(k),
    get: (k, d) => (got.has(k) ? got.get(k) : d),
    // number with optional bounds; a non-number is a usage error
    num: (k, d, { min = -Infinity, max = Infinity, int = false } = {}) => {
      if (!got.has(k)) return d;
      const n = Number(got.get(k));
      if (!Number.isFinite(n) || n < min || n > max || (int && !Number.isInteger(n))) usageError(`${k} ${JSON.stringify(got.get(k))} is not a valid number`, `give a number${min > -Infinity ? ' >= ' + min : ''}`);
      return n;
    },
    // comma list whose items must be in `allowed`
    list: (k, allowed, d) => {
      if (!got.has(k)) return d;
      const items = String(got.get(k)).split(',').map((x) => x.trim()).filter(Boolean);
      const bad = allowed ? items.filter((x) => !allowed.includes(x)) : [];
      if (!items.length || bad.length) usageError(`unknown ${k} ${bad.join(',') || '(empty)'}`, `choose from ${allowed.join(', ')}`);
      return items;
    },
  };
  return res;
}

const userPath = (p) => path.resolve(process.cwd(), p);
const libPath = (...rel) => path.resolve(ROOT, ...rel);
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');
function tempOut(script, target) {
  let host = 'run';
  try { host = new URL(target).host.replace(/[^\w.-]+/g, '_') || 'local'; } catch (e) {}
  return path.join(os.tmpdir(), `ux-ui-${script}`, `${host}-${stamp()}`);
}
// --out given -> against cwd; URL target -> temp; local page -> <folder> next to the page
function outFor({ given, target, script, folder }) {
  if (given) return userPath(given);
  if (isUrl(target)) return tempOut(script, target);
  return path.join(path.dirname(path.resolve(target)), folder);
}

// Runs an async main; an unexpected error prints one ERROR line (no stack) and exits 1.
function main(fn) {
  process.on('unhandledRejection', (e) => { R.error(String(e && e.message || e).split('\n')[0]); console.log(`ERROR ${String(e && e.message || e).split('\n')[0]}`); process.exit(1); });
  Promise.resolve().then(fn).catch((e) => { R.error(String(e && e.message || e).split('\n')[0]); console.log(`ERROR ${String(e && e.message || e).split('\n')[0]}`); process.exit(1); });
}

module.exports = { parse, usageError, helpText, userPath, libPath, tempOut, outFor, isUrl, main, ROOT, stamp };
