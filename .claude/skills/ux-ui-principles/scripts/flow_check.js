#!/usr/bin/env node
/*
 * Click through a page's main task from a JSON list of steps and check each result.
 *
 * Usage:
 *   node flow_check.js <url-or-file> <steps.json> [--width 1440] [--height 900] [--wait 600] [--timeout 30000] [--json] [-h|--help]
 *
 * steps.json is an array. Action steps: {"do": "click"|"fill"|"check"|"uncheck"|"select"|"press"|"wait", "sel": "...", "value": "..."}
 *   click  sel may be a CSS selector or "text=..." (Playwright text selector); falls back to a forced click
 *          when an invisible input covers the target (visually hidden radios with a label overlay)
 *   fill / select  value is the text or option value; press  value is a key ("Escape"), sel optional
 *   wait   value is milliseconds
 * Expect steps: {"expect": "text"|"visible"|"hidden"|"disabled"|"enabled"|"attr", "sel": "...", "value": "...", "attr": "..."}
 *   text   substring of the element's text (whitespace collapsed); attr  attribute `attr` equals `value`
 *
 * Example for the coffee-shop bean picker:
 * [
 *   {"do": "click", "sel": "#b2"},
 *   {"do": "click", "sel": "text=500 g"},
 *   {"do": "click", "sel": "#add"},
 *   {"expect": "text", "sel": "#bagCount", "value": "1"},
 *   {"expect": "text", "sel": "#status", "value": "ใส่"}
 * ]
 *
 * Prints PASS/FAIL per step, then any page errors and console errors. Exit 1 on any failure or error,
 * 3 when no browser is available (NOT RUN). A missing page or steps file, malformed JSON, a steps file that is
 * not an array, an empty array, a step with no known "do"/"expect" or a step missing a field it needs (sel; value for
 * fill / select / press / expect text / expect attr; attr for expect attr; a number for wait) prints "error: …"
 * naming the step and exits 2 before any browser starts.
 * --json: one JSON document on stdout (README "Script contract"), log lines on stderr, same exit codes; findings
 * step / page-errors / console-errors (fail); "steps" lists each step's result.
 */
const fs = require('fs');
const A = require('./_args');
const pw = require('./_pw');
const R = require('./_report');
const a = A.parse(process.argv.slice(2), { file: __filename, report: 'flow_check', values: ['--width', '--height', '--wait', '--timeout'], positional: [2, 2, '<url-or-file> <steps.json>'] });
const [arg0, stepsFile] = a._;
const target = pw.target(arg0);
if (!fs.existsSync(stepsFile)) A.usageError(`steps file not found: ${stepsFile}`, 'pass a JSON array of steps');
let steps;
try { steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8')); }
catch (e) { A.usageError(`${stepsFile} is not valid JSON: ${e.message.split('\n')[0]}`, 'fix the steps file'); }
if (!Array.isArray(steps)) A.usageError(`${stepsFile} must hold a JSON array of steps, got ${steps === null ? 'null' : typeof steps}`, 'wrap the steps in [ … ]');
if (!steps.length) A.usageError(`${stepsFile} holds no steps`, 'add at least one {"do": …} or {"expect": …} step');
const DO = ['click', 'fill', 'check', 'uncheck', 'select', 'press', 'wait'], EXPECT = ['text', 'visible', 'hidden', 'disabled', 'enabled', 'attr'];
steps.forEach((s, i) => {
  if (!s || typeof s !== 'object' || Array.isArray(s)) A.usageError(`step ${i + 1} is not an object`, 'each step is {"do": …} or {"expect": …}');
  if (!(DO.includes(s.do) || EXPECT.includes(s.expect))) A.usageError(`step ${i + 1} has no known "do" (${DO.join('|')}) or "expect" (${EXPECT.join('|')})`, 'see --help');
  if (s.do !== 'wait' && s.do !== 'press' && typeof s.sel !== 'string') A.usageError(`step ${i + 1} needs "sel"`, 'a CSS selector or "text=…"');
  if (s.do === 'press' && s.sel != null && typeof s.sel !== 'string') A.usageError(`step ${i + 1} (press) "sel" must be a string`, 'a CSS selector or leave it out');
  const scalar = (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  const what = s.do || `expect ${s.expect}`;
  if (['fill', 'select'].includes(s.do) || ['text', 'attr'].includes(s.expect)) {
    if (!scalar(s.value)) A.usageError(`step ${i + 1} (${what}) needs a "value"`, s.do ? 'the text or option value to use' : 'the text or attribute value to expect');
  }
  if (s.do === 'press' && (typeof s.value !== 'string' || !s.value)) A.usageError(`step ${i + 1} (press) needs a "value" key`, 'e.g. "Escape" or "Enter"');
  if (s.do === 'wait' && s.value != null && !(s.value !== '' && Number.isFinite(Number(s.value)) && Number(s.value) >= 0)) A.usageError(`step ${i + 1} (wait) "value" ${JSON.stringify(s.value)} is not a number of milliseconds`, 'e.g. "value": 500');
  if (s.expect === 'attr' && (typeof s.attr !== 'string' || !s.attr)) A.usageError(`step ${i + 1} (expect attr) needs "attr"`, 'the attribute name, e.g. "aria-expanded"');
});
const W = a.num('--width', 1440, { min: 100, int: true }), H = a.num('--height', 900, { min: 100, int: true });
const wait = a.num('--wait', 600, { min: 0 }), timeout = a.num('--timeout', 30000, { min: 1 });
const env = pw.need(arg0, 'flow check');

A.main(async () => {
  const browser = await pw.launch(env);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = [], cons = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') cons.push(m.text()); });
  await pw.goto(page, target, { timeout, browser });
  await page.waitForTimeout(wait);
  let failed = 0;
  const stepRes = []; R.set('steps', stepRes); R.set('steps_file', stepsFile);
  const T = { timeout: 5000 };
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  for (const [i, s] of steps.entries()) {
    const label = `${String(i + 1).padStart(2)} ${s.do ? s.do : 'expect ' + s.expect} ${s.sel || ''}${s.value != null ? ' ' + JSON.stringify(s.value) : ''}`;
    try {
      if (s.do === 'click') {
        try { await page.click(s.sel, { timeout: 2500 }); }
        catch (e) { if (/intercepts pointer events|not visible|Timeout/i.test(e.message)) await page.click(s.sel, { force: true, timeout: 2500 }); else throw e; }
      } else if (s.do === 'fill') await page.fill(s.sel, String(s.value), T);
      else if (s.do === 'check') await page.check(s.sel, { ...T, force: true });
      else if (s.do === 'uncheck') await page.uncheck(s.sel, { ...T, force: true });
      else if (s.do === 'select') await page.selectOption(s.sel, String(s.value), T);
      else if (s.do === 'press') { if (s.sel) await page.press(s.sel, s.value, T); else await page.keyboard.press(s.value); }
      else if (s.do === 'wait') await page.waitForTimeout(s.value == null ? 300 : Number(s.value));
      else if (s.expect === 'text') {
        const got = norm(await page.textContent(s.sel, T));
        if (!got.includes(norm(String(s.value)))) throw new Error(`text is "${got.slice(0, 80)}"`);
      } else if (s.expect === 'visible') { if (!(await page.isVisible(s.sel))) throw new Error('not visible'); }
      else if (s.expect === 'hidden') { if (!(await page.isHidden(s.sel))) throw new Error('visible'); }
      else if (s.expect === 'disabled') { if (!(await page.isDisabled(s.sel, T))) throw new Error('enabled'); }
      else if (s.expect === 'enabled') { if (!(await page.isEnabled(s.sel, T))) throw new Error('disabled'); }
      else if (s.expect === 'attr') { const v = await page.getAttribute(s.sel, s.attr, T); if (v !== String(s.value)) throw new Error(`${s.attr}="${v}"`); }
      else throw new Error('unknown step');
      if (s.do && s.do !== 'wait') await page.waitForTimeout(120);
      console.log(`PASS  ${label}`);
      stepRes.push({ n: i + 1, step: s, label: label.trim(), result: 'PASS' });
    } catch (e) {
      failed++;
      console.log(`FAIL  ${label}  → ${e.message.split('\n')[0].slice(0, 140)}`);
      const why = e.message.split('\n')[0].slice(0, 140);
      stepRes.push({ n: i + 1, step: s, label: label.trim(), result: 'FAIL', error: why });
      R.add('fail', 'step', `${label.trim()}  → ${why}`, `step ${i + 1}`, { step: s });
    }
  }
  if (errs.length) { console.log(`FAIL  page errors: ${errs.slice(0, 3).join(' | ')}`); R.add('fail', 'page-errors', `page errors: ${errs.slice(0, 3).join(' | ')}`, null, { count: errs.length }); }
  if (cons.length) { console.log(`FAIL  console errors: ${cons.slice(0, 3).join(' | ')}`); R.add('fail', 'console-errors', `console errors: ${cons.slice(0, 3).join(' | ')}`, null, { count: cons.length }); }
  await browser.close();
  const bad = failed + (errs.length ? 1 : 0) + (cons.length ? 1 : 0);
  console.log(bad ? `\n${bad} failure(s).` : `\nAll ${steps.length} steps passed.`);
  R.set('failures', bad);
  process.exit(bad ? 1 : 0);
});
