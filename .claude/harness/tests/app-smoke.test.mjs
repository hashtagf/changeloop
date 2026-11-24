import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { APP_SMOKE_BUILT_IN, appSmoke, chromePath, printedUrl, serveMethod } from "../runtime/evidence/app-smoke-check.mjs";
import { appSmokeProvider } from "../runtime/evidence/built-in-providers.mjs";
import { builtInCovers } from "../runtime/workflow/change/built-in-capabilities.mjs";
import { WORK_TYPE_CAPABILITIES } from "../runtime/workflow/change/change-policy.mjs";

const chrome = chromePath();

function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), "app-smoke-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, value] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), value);
  }
  return root;
}

const PAGE = (body) => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width">` +
  `<title>t</title></head><body>${body}</body></html>`;

test("the app is served by its own script, else as a static folder", (t) => {
  assert.deepEqual(serveMethod(project(t, { "package.json": '{"scripts":{"build":"x","start":"node s.js","dev":"vite"}}' })),
    { kind: "script", script: "dev" });
  assert.deepEqual(serveMethod(project(t, { "public/index.html": PAGE("x") })), { kind: "static", root: "public" });
  assert.equal(serveMethod(project(t, { "src/a.js": "" })), null);
  assert.equal(printedUrl("\u001b[32m  ➜  Local:   http://localhost:5173/\u001b[0m"), "http://localhost:5173/");
  assert.equal(printedUrl("ready on http://0.0.0.0:3000."), "http://127.0.0.1:3000");
});

test("ui work owes the running-app check; the built-in covers it only where it can run", (t) => {
  assert.deepEqual(WORK_TYPE_CAPABILITIES.ui, ["accessibility", "browser"]);
  const servable = project(t, { "index.html": PAGE("<h1>x</h1>") });
  const config = appSmokeProvider((name) => `/h/${name}`, () => [{ id: "root", workspacePath: servable }], { chrome: "/bin/chrome" });
  assert.deepEqual(config, { adapter: "command", capability: "browser", version: "1",
    command: ["node", "/h/app-smoke-check.mjs"], inputMode: "browser-automation", repository: undefined, builtIn: APP_SMOKE_BUILT_IN });
  assert.ok(builtInCovers(config));
  assert.equal(appSmokeProvider((name) => name, () => [{ id: "root", workspacePath: servable }], { chrome: null }), null,
    "no Chrome: no check, so the capability stays an advisory");
  const library = project(t, { "src/a.js": "" });
  assert.equal(appSmokeProvider((name) => name, () => [{ id: "root", workspacePath: library }], { chrome: "/bin/chrome" }), null);
});

test("a running static app: script errors, failed requests, phone overflow, and screenshots", { skip: !chrome && "no Chrome" }, async (t) => {
  const root = project(t, {
    "index.html": PAGE('<h1>Shop</h1><a href="/about.html">About</a><div style="width:600px">wide</div><script>missingFn()</script>'),
    "about.html": PAGE('<p>About</p><img src="/missing.png" alt="x">')
  });
  const report = await appSmoke(root, { chrome });
  assert.equal(report.status, "fail");
  const problems = report.findings.map((row) => `${row.page} ${row.viewport} ${row.problem}`);
  assert.ok(problems.some((row) => /^\/ desktop uncaught error: ReferenceError: missingFn/.test(row)), problems.join("\n"));
  assert.ok(problems.some((row) => /^\/ phone content is \d+px wider than a 390px screen/.test(row)), problems.join("\n"));
  assert.ok(problems.some((row) => /^\/about\.html desktop HTTP 404: \/missing\.png/.test(row)), problems.join("\n"));
  assert.deepEqual(report.pages.map((page) => page.path), ["/", "/about.html"], "linked pages are visited");
  for (const page of report.pages) for (const shot of page.screenshots) assert.ok(existsSync(join(root, shot)), shot);
});

test("a clean app started by its dev script passes and its server is stopped", { skip: !chrome && "no Chrome" }, async (t) => {
  const root = project(t, {
    "package.json": '{"name":"d","private":true,"scripts":{"dev":"node server.mjs"}}',
    "server.mjs": `import { createServer } from "node:http";
createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); r.end(${JSON.stringify(PAGE("<h1>Ready</h1>"))}); })
  .listen(Number(process.env.PORT), () => console.log("  Local: http://localhost:" + process.env.PORT + "/"));`
  });
  const report = await appSmoke(root, { chrome });
  assert.equal(report.status, "pass", JSON.stringify(report.findings));
  assert.equal(report.served, "npm run dev");
  const { hostname, port } = new URL(report.url);
  // SIGTERM is sent to the process group; allow the child time to exit.
  const connection = () => new Promise((done, failed) => {
    const socket = connect({ host: hostname, port: Number(port) });
    socket.once("error", failed);
    socket.once("connect", () => { socket.destroy(); done(); });
    // A port whose server is gone either refuses or, on a loaded runner while
    // the socket closes, never answers; both mean nothing is listening.
    socket.setTimeout(2000, () => socket.destroy(Object.assign(new Error("stop check timed out"), { code: "ETIMEDOUT" })));
  });
  const stoppedBy = Date.now() + 3000;
  while (Date.now() < stoppedBy) {
    try { await connection(); }
    catch (error) {
      assert.ok(["ECONNREFUSED", "ETIMEDOUT"].includes(error.code), `unexpected ${error.code}: ${error.message}`);
      return;
    }
    await delay(50);
  }
  assert.fail("the dev server is still listening after the check");
});

test("an app that cannot start fails with its output, not a pass", { skip: !chrome && "no Chrome" }, async (t) => {
  const root = project(t, { "package.json": '{"scripts":{"start":"node -e \\"console.error(\'boom: missing DATABASE_URL\');process.exit(1)\\""}}' });
  const report = await appSmoke(root, { chrome, timeoutMs: 20000 });
  assert.equal(report.status, "fail");
  assert.match(report.findings[0].problem, /exited \(1\) before serving:[\s\S]*boom: missing DATABASE_URL/);
});
