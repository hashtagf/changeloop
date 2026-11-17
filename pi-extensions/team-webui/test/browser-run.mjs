// Start a fresh preview fixture, run one Playwright script against it, then stop the fixture.
// Usage: node team-webui/test/browser-run.mjs <script.py> [KEY=VALUE ...]   (no model calls)
import { spawn } from "node:child_process";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const [script, ...pairs] = process.argv.slice(2);
if (!script) { console.error("Usage: browser-run.mjs <script.py> [KEY=VALUE ...]"); process.exit(2); }
const agentDir = await mkdtemp(join(tmpdir(), "pi-web-browser-"));
// A script may declare fixture flags on a line such as: # preview-env: PI_PREVIEW_RICH=1 PI_PREVIEW_CHANGELOOP=1
const declared = ((await readFile(script, "utf8")).match(/^# preview-env:(.*)$/m)?.[1] || "").trim().split(/\s+/).filter(Boolean);
const env = { ...process.env, PI_CODING_AGENT_DIR: agentDir,
  ...Object.fromEntries([...declared, ...pairs].map((p) => p.split(/=(.*)/s).slice(0, 2))) };
const preview = spawn(process.execPath, [fileURLToPath(new URL("./preview.mjs", import.meta.url))], { env, stdio: ["ignore", "pipe", "inherit"] });
const url = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("Preview did not start within 30s.")), 30000);
  createInterface({ input: preview.stdout }).once("line", (line) => { clearTimeout(timer); try { resolve(JSON.parse(line).preview); } catch (e) { reject(e); } });
  preview.once("exit", (code) => reject(new Error("Preview exited with " + code)));
});
let code = 1;
try {
  code = await new Promise((resolve) => {
    const run = spawn("python3", [script, url], { stdio: "inherit", env });
    run.once("exit", (c) => resolve(c ?? 1));
  });
} finally {
  preview.kill("SIGTERM");
  await new Promise((resolve) => { preview.once("exit", resolve); setTimeout(resolve, 5000); });
  await rm(agentDir, { recursive: true, force: true });
}
process.exit(code);
