#!/usr/bin/env node

// The harness-owned `browser` provider for a web project that wired no browser
// check of its own: it starts the app the way the project runs it, opens the
// home page and the pages it links to in headless Chrome at desktop and phone
// width, and fails on what a running app shows and a static read cannot — a
// page that does not load, an uncaught script error, console errors, failed
// same-origin requests, and content wider than a phone. Each page's
// screenshot is saved under test-results/app-smoke/, where the visual review
// reads screenshots. It proves the app runs; a scenario's flow (clicks, forms)
// still needs the project's own browser tests, which replace this check.
//
// Dependency-free: Chrome is driven over --remote-debugging-pipe (no
// WebSocket, so Node 20 works), and the app is served by its own `start`/`dev`
// script (the URL it prints is used) or, for a static site, by a small server.
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { bestEffort } from "../core/best-effort.mjs";
import { deadline, delay } from "../core/timing.mjs";

export const APP_SMOKE_BUILT_IN = "app-smoke-v1";
export const VIEWPORTS = Object.freeze([
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "phone", width: 390, height: 844, mobile: true }]);
export const SCRIPT_ORDER = Object.freeze(["dev", "start", "serve", "preview"]);
const STATIC_ROOTS = Object.freeze([".", "public", "dist", "build", "site"]);
const MAX_PAGES = 8;
const OUT = join("test-results", "app-smoke");

export function chromePath(env = process.env) {
  if (env.CHROME_PATH && existsSync(env.CHROME_PATH)) return env.CHROME_PATH;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const found = spawnSync("sh", ["-c", `command -v ${name}`], { encoding: "utf8" }).stdout?.trim();
    if (found) return found;
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return existsSync(mac) ? mac : null;
}

function packageJson(dir) {
  // A missing or unreadable manifest means no package scripts.
  return bestEffort(() => JSON.parse(readFileSync(join(dir, "package.json"), "utf8")), null);
}

// How the app in `dir` is served: { kind: "script", script } for a package
// script, { kind: "static", root } for a folder with index.html, else null.
export function serveMethod(dir) {
  const scripts = packageJson(dir)?.scripts || {};
  const script = SCRIPT_ORDER.find((name) => typeof scripts[name] === "string" && scripts[name].trim());
  if (script) return { kind: "script", script };
  const root = STATIC_ROOTS.find((folder) => existsSync(join(dir, folder, "index.html")));
  return root ? { kind: "static", root } : null;
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2" };

function staticServer(root) {
  const base = resolve(root);
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url, "http://local").pathname);
    let file = normalize(join(base, path));
    if (file !== base && !file.startsWith(base + sep)) { response.writeHead(403).end(); return; }
    if (existsSync(file) && lstatSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) { response.writeHead(404).end("not found"); return; }
    response.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    response.end(readFileSync(file));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () =>
    done({ url: `http://127.0.0.1:${listeningPort(server)}/`, stop: () => server.close() })));
}

const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
export function printedUrl(output) {
  const match = String(output).replace(ANSI, "").match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1?\]):\d+[^\s"')]*/);
  return match ? match[0].replace("0.0.0.0", "127.0.0.1").replace(/[.,;]+$/, "") : null;
}

const listeningPort = (server) => /** @type {import("node:net").AddressInfo} */ (server.address()).port;

function freePort() {
  return new Promise((done) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => { const port = listeningPort(server); server.close(() => done(port)); });
  });
}

// The package script, run as a process group so its whole tree is stopped;
// resolves with the URL it prints, or rejects with the tail of its output.
async function scriptServer(dir, script, timeoutMs) {
  const port = await freePort();
  const manager = existsSync(join(dir, "pnpm-lock.yaml")) ? "pnpm" : existsSync(join(dir, "yarn.lock")) ? "yarn" : "npm";
  const child = spawn(manager, ["run", script], { cwd: dir, detached: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(port), BROWSER: "none", CI: "1", FORCE_COLOR: "0" } });
  let output = "";
  // The whole process group; a group that already exited is the goal.
  const stop = () => bestEffort(() => process.kill(-child.pid, "SIGTERM"));
  return new Promise((done, failed) => {
    const cancel = deadline(timeoutMs, () => { stop(); failed(new Error(`\`${manager} run ${script}\` printed no local URL within ${timeoutMs / 1000}s:\n${output.slice(-1500)}`)); });
    const read = (chunk) => {
      output += chunk;
      const url = printedUrl(output);
      if (url) { cancel(); done({ url, stop, command: `${manager} run ${script}` }); }
    };
    child.stdout.on("data", read);
    child.stderr.on("data", read);
    child.on("exit", (code) => { cancel(); failed(new Error(`\`${manager} run ${script}\` exited (${code}) before serving:\n${output.slice(-1500)}`)); });
  });
}

async function waitForHttp(url, timeoutMs) {
  const end = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < end) {
    try { const response = await fetch(url, { redirect: "manual" }); if (response.status < 500) return; last = `HTTP ${response.status}`; }
    catch (error) { last = error.message; }
    await delay(300);
  }
  throw new Error(`${url} did not answer within ${timeoutMs / 1000}s (${last})`);
}

// Chrome DevTools over the pipe transport: NUL-delimited JSON on fds 3 and 4.
function launchChrome(executable) {
  const profile = join(tmpdir(), `app-smoke-${process.pid}-${Date.now()}`);
  const child = spawn(executable, ["--headless=new", "--remote-debugging-pipe", "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--mute-audio", `--user-data-dir=${profile}`,
    ...(process.getuid?.() === 0 ? ["--no-sandbox"] : []), "about:blank"],
  { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const writer = /** @type {import("node:stream").Writable} */ (child.stdio[3]);
  const reader = child.stdio[4];
  let nextId = 0;
  const pending = new Map();
  const listeners = new Set();
  let buffer = "";
  reader.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    let index;
    while ((index = buffer.indexOf("\0")) >= 0) {
      const message = JSON.parse(buffer.slice(0, index));
      buffer = buffer.slice(index + 1);
      if (message.id && pending.has(message.id)) {
        const { done, failed } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) failed(new Error(message.error.message)); else done(message.result);
      } else for (const listener of listeners) listener(message);
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((done, failed) => {
    const id = ++nextId;
    pending.set(id, { done, failed });
    writer.write(`${JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })}\0`);
  });
  // Chrome writes its profile until it has exited; remove it after.
  const exited = new Promise((done) => child.once("exit", done));
  const close = async () => {
    child.kill("SIGKILL");
    await Promise.race([exited, delay(5000)]);
    // A temporary profile; the OS reclaims what cannot be removed now.
    bestEffort(() => rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
  };
  return { send, listeners, close };
}

function waitFor(browser, sessionId, method, timeoutMs) {
  return new Promise((done) => {
    const cancel = deadline(timeoutMs, () => { browser.listeners.delete(listener); done(false); });
    const listener = (message) => {
      if (message.sessionId === sessionId && message.method === method) {
        cancel(); browser.listeners.delete(listener); done(true);
      }
    };
    browser.listeners.add(listener);
  });
}

const slug = (path) => (path.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-") || "home").slice(0, 60);

// One page at one viewport: the problems it shows, its same-origin links, and
// its screenshot path.
async function visit(browser, origin, path, viewport, outDir) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const problems = [];
  const listener = (message) => {
    if (message.sessionId !== sessionId) return;
    const params = message.params || {};
    if (message.method === "Runtime.exceptionThrown")
      problems.push(`uncaught error: ${params.exceptionDetails?.exception?.description?.split("\n")[0] || params.exceptionDetails?.text}`);
    if (message.method === "Runtime.consoleAPICalled" && params.type === "error")
      problems.push(`console error: ${(params.args || []).map((arg) => arg.value ?? arg.description ?? "").join(" ").slice(0, 200)}`);
    if (message.method === "Network.responseReceived" && params.response?.status >= 400 &&
        String(params.response.url).startsWith(origin) && !/favicon\.ico$/.test(params.response.url))
      problems.push(`HTTP ${params.response.status}: ${params.response.url.slice(origin.length - 1)}`);
    if (message.method === "Network.loadingFailed" && !params.canceled && params.type !== "Other")
      problems.push(`request failed: ${params.errorText}`);
  };
  browser.listeners.add(listener);
  try {
    for (const domain of ["Page", "Runtime", "Network"]) await browser.send(`${domain}.enable`, {}, sessionId);
    await browser.send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height,
      deviceScaleFactor: 1, mobile: viewport.mobile }, sessionId);
    const loaded = waitFor(browser, sessionId, "Page.loadEventFired", 20000);
    const navigation = await browser.send("Page.navigate", { url: new URL(path, origin).href }, sessionId);
    if (navigation.errorText) problems.push(`page did not load: ${navigation.errorText}`);
    else if (!(await loaded)) problems.push("page did not finish loading within 20s");
    await delay(600); // late script errors after the load event
    const { result } = await browser.send("Runtime.evaluate", { returnByValue: true, expression: `(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      empty: !document.body || !document.body.innerText.trim(),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.href)
    }))()` }, sessionId);
    const page = result.value || {};
    if (viewport.mobile && page.overflow > 1) problems.push(`content is ${page.overflow}px wider than a ${viewport.width}px screen`);
    if (page.empty) problems.push("the page shows no text");
    const { data } = await browser.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
    const screenshot = join(outDir, `${slug(path)}-${viewport.name}.png`);
    writeFileSync(screenshot, Buffer.from(data, "base64"));
    return { problems: [...new Set(problems)], links: page.links || [], screenshot };
  } finally {
    browser.listeners.delete(listener);
    await browser.send("Target.closeTarget", { targetId }).catch(() => {});
  }
}

// Same-origin pages the home page links to, once each.
function enqueueLinks(links, origin, seen, queue) {
  for (const link of links) {
    const url = new URL(link);
    if (url.origin + "/" !== origin || /\.(pdf|zip|png|jpe?g|svg)$/i.test(url.pathname) || /log-?out|sign-?out/i.test(url.pathname)) continue;
    if (!seen.has(url.pathname)) { seen.add(url.pathname); queue.push(url.pathname); }
  }
}

// node_modules from the control project when a sandbox has none, removed after.
function borrowDependencies(dir, controlRoot) {
  const target = join(dir, "node_modules");
  const source = controlRoot && join(controlRoot, "node_modules");
  if (existsSync(target) || !source || !existsSync(source) || resolve(source) === resolve(target)) return () => {};
  symlinkSync(source, target, "dir");
  return () => bestEffort(() => unlinkSync(target)); // the link may already be gone
}

export async function appSmoke(dir, { controlRoot = null, chrome = chromePath(), timeoutMs = 90000 } = {}) {
  const method = serveMethod(dir);
  if (!method) return { built: APP_SMOKE_BUILT_IN, status: "fail", pages: [],
    findings: [{ page: "-", viewport: "-", problem: "nothing to serve: no dev/start/serve/preview script and no index.html" }] };
  if (!chrome) return { built: APP_SMOKE_BUILT_IN, status: "fail", pages: [],
    findings: [{ page: "-", viewport: "-", problem: "no Chrome or Chromium found; install one or set CHROME_PATH" }] };
  const outDir = join(dir, OUT);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const restore = method.kind === "script" ? borrowDependencies(dir, controlRoot) : () => {};
  let server = null;
  let browser = null;
  const findings = [];
  const pages = [];
  try {
    server = method.kind === "script" ? await scriptServer(dir, method.script, timeoutMs) : await staticServer(join(dir, method.root));
    await waitForHttp(server.url, 30000);
    const origin = new URL(server.url).origin + "/";
    browser = launchChrome(chrome);
    const queue = [new URL(server.url).pathname || "/"];
    const seen = new Set(queue);
    while (queue.length && pages.length < MAX_PAGES) {
      const path = queue.shift();
      const shots = [];
      for (const viewport of VIEWPORTS) {
        const result = await visit(browser, origin, path, viewport, outDir);
        shots.push(result.screenshot.slice(dir.length + 1));
        for (const problem of result.problems) findings.push({ page: path, viewport: viewport.name, problem });
        if (viewport.name === "desktop" && pages.length === 0) enqueueLinks(result.links, origin, seen, queue);
      }
      pages.push({ path, screenshots: shots });
    }
    return { built: APP_SMOKE_BUILT_IN, served: server.command || `static ${method.root}`, url: server.url,
      status: findings.length ? "fail" : "pass", pages, findings };
  } catch (error) {
    findings.push({ page: "-", viewport: "-", problem: error.message });
    return { built: APP_SMOKE_BUILT_IN, status: "fail", pages, findings };
  } finally {
    await browser?.close();
    server?.stop();
    restore();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const report = await appSmoke(process.cwd(), { controlRoot: process.env.FOUNDATION_CONTROL_ROOT || null });
  mkdirSync(join(process.cwd(), OUT), { recursive: true });
  writeFileSync(join(process.cwd(), OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  for (const finding of report.findings) console.log(`${finding.page} [${finding.viewport}] ${finding.problem}`);
  console.log(`app smoke (${report.built}): ${report.pages.length} page(s) at desktop and phone width, ` +
    `${report.findings.length} problem(s)${report.served ? `; served by ${report.served}` : ""}; ` +
    "screenshots in test-results/app-smoke/; scenario flows need the project's own browser tests");
  process.exitCode = report.findings.length ? 1 : 0;
}
