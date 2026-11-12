#!/usr/bin/env node
/*
 * Static script check for built pages, no browser needed (Node only).
 *
 * Usage: node script_check.js page.html [more.html ...] [--json] [-h|--help]
 *
 * For each page: every inline <script> (except JSON / templates) and every local <script src>
 * is compiled with Node's parser (syntax errors fail), and top-level declarations are checked
 * against names the browser already defines on window (top, name, status, parent, …). A classic
 * script that declares `const top` throws "Identifier 'top' has already been declared" and stops,
 * so the page silently loses its charts or handlers. Fix: wrap the script in an IIFE / block, or rename.
 *
 * Module scripts (type="module") are compiled as modules (node --check on a temp .mjs) and are exempt from the
 * global-name check. src may be quoted or unquoted (data-src is not a src); a root-relative src ("/assets/x.js") is
 * looked up from the page's folder upwards; a src that is a folder or unreadable is reported as missing-script.
 * Top-level names are found by V8's own parser, so destructuring (const {top, left} = …, let [a, name] = …,
 * nested or renamed {x: top}) is caught like a simple name.
 * Exit code 1 when any problem is found; 2 for a missing or unreadable page or a bad option. Use render_check.js as well when a browser is available:
 * it catches runtime errors this static check cannot see.
 * --json: one JSON document on stdout (README "Script contract"; "target" is a list when several pages are given),
 * same exit codes; findings syntax-error / missing-script / global-clash (fail); "pages" lists each script's result.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const WINDOW_NAMES = new Set(['top', 'name', 'status', 'parent', 'self', 'length', 'origin', 'history', 'location',
  'event', 'close', 'open', 'print', 'scroll', 'frames', 'opener', 'closed', 'screen', 'external', 'navigator',
  'document', 'window', 'menubar', 'toolbar', 'stop', 'focus', 'blur', 'find', 'alert', 'confirm', 'prompt',
  'scrollX', 'scrollY', 'innerWidth', 'innerHeight', 'localStorage', 'sessionStorage', 'performance', 'crypto', 'caches']);

// One attribute value: double / single quoted or unquoted; the name must stand alone (src, not data-src).
const attr = (attrs, name) => { const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\x60]+))`, 'i').exec(attrs); return m ? (m[1] ?? m[2] ?? m[3]) : undefined; };
// A root-relative src ("/assets/x.js") is resolved against the page's folder, then each folder above it
// (the site root is one of them); the first existing file wins, else the page's folder is reported.
function resolveSrc(file, src) {
  const rel = src.split(/[?#]/)[0];
  const dir = path.dirname(path.resolve(file));
  if (!rel.startsWith('/')) return path.resolve(dir, rel);
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d)) { const p = path.join(d, rel); if (fs.existsSync(p)) return p; }
  return path.join(dir, rel);
}

function scriptsOf(file, html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const type = (attr(attrs, 'type') || '').trim();
    if (type && !/^(module|text\/javascript|application\/javascript)$/i.test(type)) continue; // JSON, templates
    const src = (attr(attrs, 'src') || '').trim();
    const line = html.slice(0, m.index).split('\n').length;
    if (src) {
      if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) continue;
      const p = resolveSrc(file, src);
      let code;
      try { if (!fs.statSync(p).isFile()) throw new Error('not a file'); code = fs.readFileSync(p, 'utf8'); }
      catch (e) { out.push({where: `${src} (line ${line})`, missing: true, why: e.code === 'ENOENT' ? '' : ` (${e.code === 'EACCES' ? 'unreadable' : 'not a file'})`}); continue; }
      out.push({where: src, code, module: /module/i.test(type)});
    } else if (m[2].trim()) {
      out.push({where: `inline script at line ${line}`, code: m[2], module: /module/i.test(type)});
    }
  }
  return out;
}

// Top-level names that clash with window globals, found by the parser itself: compile `let <name>;` in front of
// the script; V8 reports "Identifier '<name>' has already been declared" exactly when the script declares <name>
// at top level, in any form (const/let/var/class/function, destructuring {top}, [a, name], nested or renamed
// {x: top}), and never for names in inner blocks or functions, or property keys ({top: x} declares x).
function globalClashes(code) {
  const found = [];
  for (const n of WINDOW_NAMES) {
    if (!new RegExp(`\\b${n}\\b`).test(code)) continue;
    try { new vm.Script(`let ${n};\n${code}`); }
    catch (e) { if (e instanceof SyntaxError && e.message.includes(`'${n}' has already been declared`)) found.push(n); }
  }
  return found;
}

// Modules are compiled by Node itself (node --check on a temp .mjs), so multi-line import/export is parsed as such.
let modDir;
function moduleError(code) {
  if (!modDir) { modDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-ui-script-check-')); process.on('exit', () => { try { fs.rmSync(modDir, { recursive: true, force: true }); } catch (e) {} }); }
  const f = path.join(modDir, 'module.mjs');
  fs.writeFileSync(f, code);
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status === 0) return null;
  const err = String(r.stderr || '');
  return ((/^\w*Error: .*$/m.exec(err) || [err.trim().split('\n').pop() || 'syntax error'])[0]).replace(/^SyntaxError: /, '');
}

const A = require('./_args');
const R = require('./_report');
const a = A.parse(process.argv.slice(2), { file: __filename, report: 'script_check', positional: [1, Infinity, 'page.html (one or more)'] });
for (const f of a._) if (!fs.existsSync(f) || !fs.statSync(f).isFile()) A.usageError(`file not found: ${path.resolve(f)}`, 'check the path');
const htmlOf = {};
for (const f of a._) { try { htmlOf[f] = fs.readFileSync(f, 'utf8'); } catch (e) { A.usageError(`cannot read ${path.resolve(f)}: ${e.code || e.message.split('\n')[0]}`, 'check the file permissions'); } }
if (a._.length > 1) R.target(a._);
let problems = 0;
const pages = []; R.set('pages', pages);
for (const file of a._) {
  const scripts = scriptsOf(file, htmlOf[file]);
  const issues = [];
  const res = [];
  const add = (rule, msg, where, item) => { issues.push(msg); R.add('fail', rule, msg, where, { page: file }); if (item) res.push(item); };
  for (const s of scripts) {
    if (s.missing) { add('missing-script', `missing local script ${s.where}${s.why}`, s.where, { where: s.where, syntax: 'missing', clashes: [] }); continue; }
    try {
      if (s.module) { const m = moduleError(s.code); if (m) throw new SyntaxError(m); }
      else new vm.Script(s.code, {filename: s.where});
    } catch (e) {
      add('syntax-error', `syntax error in ${s.where}: ${e.message}`, s.where, { where: s.where, module: !!s.module, syntax: 'error', error: e.message, clashes: [] });
      continue;
    }
    const clash = s.module ? [] : globalClashes(s.code);
    res.push({ where: s.where, module: !!s.module, syntax: 'ok', clashes: clash });
    if (!s.module) {
      if (clash.length) add('global-clash', `${s.where} declares global ${clash.map((n) => `'${n}'`).join(', ')}, which clash${clash.length > 1 ? '' : 'es'} with window.${clash[0]}: wrap the script in an IIFE or rename`, s.where);
    }
  }
  pages.push({ page: file, result: issues.length ? 'FAIL' : 'PASS', scripts: res });
  if (issues.length) { problems += issues.length; console.log(`FAIL  ${file}`); issues.forEach((i) => console.log(`   - ${i}`)); }
  else console.log(`PASS  ${file} (${scripts.length} script${scripts.length === 1 ? '' : 's'})`);
}
process.exit(problems ? 1 : 0);
