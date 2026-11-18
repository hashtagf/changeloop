// Hidden oracle for the interactive Tasks screen (task 44).
// Usage: node check.mjs <work-copy> <seed>
// Mounts the delivered createTaskBoard() into a happy-dom document with a
// controlled loader and drives it like a user: the loading, empty, error, and
// loaded states, Retry, adding through the labelled form (empty title refused
// with an alert), the stylesheet at phone width, and a grown passing suite.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Window } from "happy-dom";

const work = resolve(process.argv[2]);
const seed = resolve(process.argv[3]);
const results = {};
const text = (node) => String(node?.textContent || "").replace(/\s+/g, " ").trim();

let createTaskBoard = null;
try {
  ({ createTaskBoard } = await import(`${pathToFileURL(join(work, "src/tasks.js"))}?oracle=${Date.now()}`));
} catch { /* every mounted case fails below */ }

// A loader the oracle resolves or rejects when it chooses.
function deferredLoader() {
  const calls = [];
  const load = () => new Promise((resolveCall, rejectCall) => calls.push({ resolve: resolveCall, reject: rejectCall }));
  return { load, calls };
}

async function settle(window) {
  for (let round = 0; round < 6; round += 1) {
    await new Promise((done) => setTimeout(done, 0));
    await window.happyDOM?.waitUntilComplete?.();
  }
}

// The board mounted in a fresh document; the DOM globals the product may use
// are the document's own.
async function mount(load) {
  const window = new Window({ url: "http://localhost/" });
  const saved = {};
  for (const name of ["window", "document", "HTMLElement", "Event", "CustomEvent", "Node"]) {
    saved[name] = globalThis[name];
    globalThis[name] = name === "window" ? window : window[name];
  }
  const root = window.document.createElement("div");
  window.document.body.appendChild(root);
  createTaskBoard(root, { load });
  await settle(window);
  return { window, root, restore: () => Object.assign(globalThis, saved) };
}

const items = (root) => [...root.querySelectorAll("li")].map(text);
const button = (root, name) => [...root.querySelectorAll("button")].find((node) => text(node) === name);
const alertText = (root) => [...root.querySelectorAll('[role="alert"]')].map(text).join(" ");

function titleInput(root) {
  for (const label of root.querySelectorAll("label")) {
    if (!text(label).toLowerCase().includes("task title")) continue;
    const wrapped = label.querySelector("input");
    if (wrapped) return wrapped;
    const target = label.getAttribute("for");
    if (target) return root.ownerDocument.getElementById(target);
  }
  return [...root.querySelectorAll("input")].find((input) =>
    String(input.getAttribute("aria-label") || "").toLowerCase().includes("task title")) || null;
}

async function add(window, root, title) {
  const input = titleInput(root);
  input.value = title;
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  button(root, "Add").click();
  await settle(window);
}

async function check(id, fn) {
  let mounted = null;
  try {
    results[id] = (await fn((load) => mount(load).then((value) => (mounted = value)))) ? "pass" : "fail";
  } catch {
    results[id] = "fail";
  } finally {
    mounted?.restore();
    mounted?.window.happyDOM?.close?.();
  }
}

await check("CASE_HEADING", async (open) => {
  const { root } = await open(async () => []);
  return [...root.querySelectorAll("h1, h2")].some((node) => text(node) === "Tasks");
});
await check("CASE_LOADING", async (open) => {
  const loader = deferredLoader();
  const { root } = await open(loader.load);
  return text(root).includes("Loading tasks") && Boolean(root.querySelector('[aria-busy="true"]')) &&
    loader.calls.length === 1;
});
await check("CASE_EMPTY", async (open) => {
  const { root } = await open(async () => []);
  return text(root).includes("No tasks yet") && items(root).length === 0 && !text(root).includes("Loading tasks") &&
    !root.querySelector('[aria-busy="true"]');
});
await check("CASE_LOADED", async (open) => {
  const { root } = await open(async () => [{ id: "1", title: "Ship it" }, { id: "2", title: "Write docs" }]);
  return JSON.stringify(items(root)) === JSON.stringify(["Ship it", "Write docs"]) && !text(root).includes("No tasks yet");
});
await check("CASE_ERROR_RETRY", async (open) => {
  const loader = deferredLoader();
  const { window, root } = await open(loader.load);
  loader.calls[0].reject(new Error("offline"));
  await settle(window);
  if (!text(root).includes("Could not load tasks") || !button(root, "Retry")) return false;
  button(root, "Retry").click();
  await settle(window);
  if (loader.calls.length !== 2) return false;
  loader.calls[1].resolve([{ id: "9", title: "Recovered" }]);
  await settle(window);
  return JSON.stringify(items(root)) === JSON.stringify(["Recovered"]) && !text(root).includes("Could not load tasks");
});
await check("CASE_ADD_TASK", async (open) => {
  const { window, root } = await open(async () => [{ id: "1", title: "First" }]);
  await add(window, root, "  Second  ");
  return JSON.stringify(items(root)) === JSON.stringify(["First", "Second"]) && titleInput(root).value === "" &&
    !alertText(root);
});
await check("CASE_ADD_FROM_EMPTY", async (open) => {
  const { window, root } = await open(async () => []);
  await add(window, root, "Only");
  return JSON.stringify(items(root)) === JSON.stringify(["Only"]) && !text(root).includes("No tasks yet");
});
await check("CASE_EMPTY_TITLE_REFUSED", async (open) => {
  const { window, root } = await open(async () => [{ id: "1", title: "First" }]);
  await add(window, root, "   ");
  if (JSON.stringify(items(root)) !== JSON.stringify(["First"]) || !alertText(root).includes("Enter a title")) return false;
  await add(window, root, "Fixed");
  return items(root).at(-1) === "Fixed" && !alertText(root).includes("Enter a title");
});
// Phone width: no fixed width or min-width above 390px outside a media query.
await check("CASE_PHONE_WIDTH", async () => {
  const css = readFileSync(join(work, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const outside = css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const widths = [...outside.matchAll(/(?:^|[;{\s])(?:min-)?width\s*:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
  return /<meta[^>]+name=["']viewport["']/i.test(readFileSync(join(work, "index.html"), "utf8")) &&
    widths.every((width) => width <= 390);
});

function suite() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap"],
    { cwd: work, encoding: "utf8", timeout: 60000, env, maxBuffer: 10 * 1024 * 1024 });
  return { ok: run.status === 0, pass: Number((String(run.stdout).match(/^# pass (\d+)/m) || [])[1] || 0) };
}
const seedTests = readdirSync(join(seed, "test")).filter((name) => name.endsWith(".test.mjs")).length;
await check("CASE_TESTS_PASS", async () => {
  const delivered = suite();
  return delivered.ok && delivered.pass > seedTests;
});

const ids = Object.keys(results);
const score = ids.filter((id) => results[id] === "pass").length;
process.stdout.write(`${JSON.stringify({ results, score, max: ids.length,
  verdict: score === ids.length ? "pass" : "fail" })}\n`);
process.exit(0);
