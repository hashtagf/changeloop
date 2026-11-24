// Whether an agent can check its change by running the real thing: a
// `verify` skill that boots and drives the app, an end-to-end or smoke suite,
// or a browser/E2E tool the project already declares. Running the change end
// to end catches what unit tests and type checks miss, and an E2E check is
// hard to fool. Read-only: marker files and package scripts, never a run.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const VERIFY_SCRIPTS = /^(verify|smoke|e2e|test:e2e|test:smoke|test:integration|test:browser|test:api)$/;
const E2E_DEPENDENCIES = new Set(["@playwright/test", "playwright", "cypress", "puppeteer", "webdriverio",
  "@wdio/cli", "nightwatch", "testcafe", "supertest", "pactum"]);
const E2E_CONFIG = /^(playwright|cypress|wdio|nightwatch)\.config\.[cm]?[jt]s$/;
const SKILL_DIRECTORIES = [".claude/skills", ".agents/skills", ".codex/skills"];

function json(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function verifySkill(root) {
  for (const base of SKILL_DIRECTORIES) {
    let names = [];
    try { names = readdirSync(join(root, base)); } catch { continue; }
    const name = names.find((entry) => /verify|smoke|e2e/i.test(entry) && existsSync(join(root, base, entry, "SKILL.md")));
    if (name) return `${base}/${name}`;
  }
  return null;
}

// `null` when nothing is found; otherwise what the agent can run.
export function verifyFacts(root) {
  const skill = verifySkill(root);
  if (skill) return { source: skill, kind: "skill" };
  const manifest = json(join(root, "package.json"));
  const script = Object.keys(manifest?.scripts || {}).find((name) => VERIFY_SCRIPTS.test(name));
  if (script) return { source: `npm run ${script}`, kind: "script" };
  const dependency = Object.keys({ ...manifest?.dependencies, ...manifest?.devDependencies })
    .find((name) => E2E_DEPENDENCIES.has(name));
  if (dependency) return { source: dependency, kind: "dependency" };
  let entries = [];
  try { entries = readdirSync(root); } catch { entries = []; }
  const config = entries.find((name) => E2E_CONFIG.test(name));
  if (config) return { source: config, kind: "config" };
  if (["e2e", "tests/e2e", "test/e2e", "tests/integration", "test/integration"].some((path) => existsSync(join(root, path))))
    return { source: "end-to-end test directory", kind: "directory" };
  return null;
}
