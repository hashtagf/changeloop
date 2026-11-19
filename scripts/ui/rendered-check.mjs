#!/usr/bin/env node
// Rendered check of the repository's own interfaces: each page is opened in a
// real Chrome at desktop and phone widths, axe-core checks the rendered
// accessibility (contrast, names, roles, landmarks), the phone width may not
// scroll sideways, and a screenshot of each is saved. It complements the
// static lints (ui-a11y, ui-scale), which cannot see contrast or layout.
//
//   node scripts/ui/rendered-check.mjs        exit 1 on any finding
//
// Chrome comes from CHROME_PATH, the PATH (google-chrome, chromium), or the
// macOS application; without one the check fails rather than passing.
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const OUT = join(ROOT, "test-results", "ui-rendered");

// Pages served as files; the docs site is built separately and checked by its
// own build.
export const PAGES = [
  { name: "landing", path: "website/index.html" },
  { name: "demo", path: "website/demo/index.html" },
  { name: "dashboard", path: "dashboard/public/index.html" },
  { name: "team-webui-login", path: "pi-extensions/team-webui/web/index.html" }
];
export const VIEWPORTS = [{ name: "desktop", width: 1440, height: 900 }, { name: "phone", width: 390, height: 844 }];
// Serious and critical axe findings fail; moderate and minor are listed.
export const FAILING_IMPACTS = new Set(["serious", "critical"]);

export function chromePath(env = process.env) {
  if (env.CHROME_PATH && existsSync(env.CHROME_PATH)) return env.CHROME_PATH;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const found = spawnSync("sh", ["-c", `command -v ${name}`], { encoding: "utf8" }).stdout.trim();
    if (found) return found;
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return existsSync(mac) ? mac : null;
}

const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

export async function checkPages({ pages = PAGES, viewports = VIEWPORTS, root = ROOT, out = OUT } = {}) {
  const executablePath = chromePath();
  if (!executablePath) return { findings: [{ page: "-", viewport: "-", rule: "no-browser",
    impact: "critical", detail: "no Chrome found: set CHROME_PATH" }], notes: [] };
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
  const findings = [];
  const notes = [];
  try {
    for (const page of pages) for (const viewport of viewports) {
      const tab = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      // Pages may fetch APIs that only exist behind their servers; the rendered
      // markup and styles are what is judged.
      await tab.route(/^https?:/, (route) => route.abort());
      await tab.goto(pathToFileURL(join(root, page.path)).href, { waitUntil: "load" });
      await tab.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
      await tab.addScriptTag({ content: AXE });
      const result = await tab.evaluate(() => globalThis.axe.run(document,
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
      for (const violation of result.violations) {
        const row = { page: page.name, viewport: viewport.name, rule: violation.id, impact: violation.impact,
          detail: `${violation.help}: ${violation.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(", ")}` +
            (violation.nodes.length > 3 ? ` (+${violation.nodes.length - 3})` : "") };
        (FAILING_IMPACTS.has(violation.impact) ? findings : notes).push(row);
      }
      if (viewport.name === "phone") {
        const overflow = await tab.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (overflow > 1) findings.push({ page: page.name, viewport: viewport.name, rule: "horizontal-overflow",
          impact: "serious", detail: `the page scrolls ${overflow}px sideways at ${viewport.width}px` });
      }
      await tab.screenshot({ path: join(out, `${page.name}-${viewport.name}.png`), fullPage: true });
      await tab.close();
    }
  } finally { await browser.close(); }
  return { findings, notes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { findings, notes } = await checkPages();
  for (const row of notes) console.log(`note ${row.page} ${row.viewport} [${row.rule}, ${row.impact}] ${row.detail}`);
  for (const row of findings) console.log(`FAIL ${row.page} ${row.viewport} [${row.rule}, ${row.impact}] ${row.detail}`);
  console.log(`ui rendered check: ${findings.length} finding(s), ${notes.length} note(s); screenshots in ${OUT}`);
  process.exitCode = findings.length ? 1 : 0;
}
