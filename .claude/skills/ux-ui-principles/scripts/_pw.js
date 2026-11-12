/* Shared Playwright / browser discovery and page loading for the browser scripts.
 * Never downloads anything. See render_check.js for the search order.
 *
 *   env = need(startPath, what)    module + browser, or prints "NOT RUN: <what> skipped (…)" and exits 3
 *   browser = await launch(env)    chromium.launch with the found executable
 *   target(arg)                    URL or file:// URL; a missing local file is a usage error (exit 2) before any launch
 *   await goto(page, url, {timeout, browser})
 *        loaded -> true; real timeout -> prints "WARN  load did not finish …" and returns false (check what rendered);
 *        refused / unreachable / bad URL -> prints "ERROR could not load <url>: <reason>", closes the browser, exits 1 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const R = require('./_report');

function findModule(startPath) {
  const dirs = [process.env.PW_MODULE, path.join(process.cwd(), 'node_modules')];
  if (startPath && !/^[a-z]+:\/\//i.test(startPath)) {
    for (let d = path.dirname(path.resolve(startPath)); d !== path.dirname(d); d = path.dirname(d)) dirs.push(path.join(d, 'node_modules'));
  }
  (process.env.NODE_PATH || '').split(path.delimiter).forEach(d => dirs.push(d));
  const tryDirs = list => {
    for (const d of list.filter(Boolean)) for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
      const p = path.join(d, name);
      if (fs.existsSync(p)) { try { const m = require(p); if (m.chromium) return { chromium: m.chromium, from: p }; } catch (e) {} }
    }
    return null;
  };
  let found = tryDirs(dirs);
  if (found) return found;
  for (const name of ['playwright', 'playwright-core']) { try { const m = require(name); if (m.chromium) return { chromium: m.chromium, from: name }; } catch (e) {} }
  // slowest lookup last (spawns npm, up to 5s), once per process
  return tryDirs([npmRoot()]);
}

let npmRootCache;
function npmRoot() {
  if (npmRootCache === undefined) {
    npmRootCache = null;
    try { npmRootCache = require('child_process').execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).toString().trim() || null; } catch (e) {}
  }
  return npmRootCache;
}

function findBrowser(chromium) {
  const ok = p => p && fs.existsSync(p);
  if (ok(process.env.PW_CHROMIUM)) return process.env.PW_CHROMIUM;
  try { const p = chromium.executablePath(); if (ok(p)) return null; } catch (e) {}
  const caches = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), 'Library/Caches/ms-playwright'),
    path.join(os.homedir(), '.cache/ms-playwright'), process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright')].filter(Boolean);
  const rel = ['chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-headless-shell-mac-x64/chrome-headless-shell',
    'chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-headless-shell-win64/chrome-headless-shell.exe',
    'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-win/chrome.exe', 'chrome-win64/chrome.exe'];
  for (const c of caches) {
    if (!fs.existsSync(c)) continue;
    const builds = fs.readdirSync(c).filter(d => /^chromium(_headless_shell)?-\d+$/.test(d))
      .sort((x, y) => Number(y.split('-').pop()) - Number(x.split('-').pop()) || (x.includes('headless') ? -1 : 1));
    for (const b of builds) for (const r of rel) { const p = path.join(c, b, r); if (ok(p)) return p; }
  }
  const system = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'];
  return system.find(ok) || undefined;
}

const isUrl = s => /^[a-z][a-z0-9+.-]*:\/\//i.test(String(s || ''));

function need(startPath, what) {
  const mod = findModule(startPath);
  const exe = mod ? findBrowser(mod.chromium) : undefined;
  if (!mod || exe === undefined) {
    R.error(`${what || 'browser step'} skipped (no Playwright module or browser)`);
    console.log(`NOT RUN: ${what || 'browser step'} skipped (no Playwright module or browser). One-time setup: npm i -D playwright && npx playwright install chromium`);
    process.exit(3);
  }
  return { mod, exe, chromium: mod.chromium };
}

const launch = (env, opts = {}) => env.mod.chromium.launch(Object.assign(env.exe ? { executablePath: env.exe } : {}, opts));

function target(arg) {
  if (isUrl(arg)) return arg;
  const file = path.resolve(arg);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    R.error(`file not found: ${file}`);
    console.error(`error: file not found: ${file} (check the path, or pass a URL)`);
    process.exit(2);
  }
  return require('url').pathToFileURL(file).href;
}

async function goto(page, url, { timeout = 30000, waitUntil = 'load', browser } = {}) {
  try { await page.goto(url, { waitUntil, timeout }); return true; }
  catch (e) {
    // A timeout leaves a partly rendered page worth checking; a refused / missing target leaves nothing.
    if (e && e.name === 'TimeoutError') { R.add('warn', 'load-timeout', `load did not finish in ${timeout}ms; checking what rendered`, url); console.log(`WARN  load did not finish in ${timeout}ms; checking what rendered`); return false; }
    R.error(`could not load ${url}: ${String(e && e.message || e).split('\n')[0]}`);
    console.log(`ERROR could not load ${url}: ${String(e && e.message || e).split('\n')[0]}`);
    if (browser) await browser.close().catch(() => {});
    process.exit(1);
  }
}

module.exports = { findModule, findBrowser, need, launch, target, goto, isUrl };
