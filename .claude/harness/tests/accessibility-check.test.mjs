// The built-in accessibility provider: a static read of the markup a change
// touched, enforced for `ui` work when the project has no check of its own.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  ACCESSIBILITY_BUILT_IN, MARKUP_INPUTS, accessibilityProviderConfig, accessibilityReport, changedMarkup,
  markupFindings
} from "../runtime/evidence/accessibility-check.mjs";
import { builtInCommandProvider } from "../runtime/evidence/built-in-providers.mjs";
import { discoverMissingEvidence } from "../runtime/evidence/evidence-bootstrap.mjs";
import { PROVIDERS, providerCapability } from "../runtime/evidence/provider-catalog.mjs";
import {
  builtInCovers, builtInOwedCapabilities, inferredAdvisoryNext
} from "../runtime/workflow/change/built-in-capabilities.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "runtime", "evidence", "accessibility-check.mjs");
const rules = (text, path) => markupFindings(text, path).map((row) => row.rule);

test("each defect a static read can establish is a finding with its line", () => {
  assert.deepEqual(rules('<img src="a.png">'), ["img-alt"]);
  assert.deepEqual(rules('<img src="a.png" alt="">'), [], "decorative images use an empty alt");
  assert.deepEqual(rules("<input type=\"email\">"), ["control-label"]);
  assert.deepEqual(rules("<label>Email <input type=\"email\"></label>"), []);
  assert.deepEqual(rules('<label for="e">Email</label><input id="e">'), []);
  assert.deepEqual(rules('<label htmlFor="e">Email</label><input id="e" />'), [], "JSX htmlFor");
  assert.deepEqual(rules('<input aria-label="Search">'), []);
  assert.deepEqual(rules('<input type="hidden"><input type="submit" value="Go">'), []);
  assert.deepEqual(rules("<select></select><textarea></textarea>"), ["control-label", "control-label"]);
  assert.deepEqual(rules('<button><svg aria-hidden="true"></svg></button>'), ["button-name"]);
  assert.deepEqual(rules("<button>Save</button>"), []);
  assert.deepEqual(rules("<button>{t(\"save\")}</button>"), [], "an expression is content");
  assert.deepEqual(rules('<button aria-label="Close"><svg/></button>'), []);
  assert.deepEqual(rules('<a href="/x"></a><a href="/y"><img src="y.png" alt="Home"></a><a name="top"></a>'),
    ["link-name"]);
  assert.deepEqual(rules("<html><body></body></html>", "index.html"), ["html-lang"]);
  assert.deepEqual(rules('<html lang="th"></html>', "index.html"), []);
  assert.deepEqual(rules('<div tabindex="2"></div><div tabIndex={0}></div>'), ["positive-tabindex"]);
  assert.deepEqual(rules("<div onClick={open}>Open</div>"), ["click-without-keyboard"]);
  assert.deepEqual(rules('<div role="button" tabIndex={0} onClick={open} onKeyDown={key}>Open</div>'), []);
  assert.deepEqual(rules('<span @click="open">x</span>'), ["click-without-keyboard"], "Vue");
  assert.deepEqual(rules("<button onClick={() => a > b}>Go</button>"), [], "a > inside braces is not the tag end");
  const [finding] = markupFindings("<main>\n  <img src=\"a.png\">\n</main>");
  assert.equal(finding.line, 2);
  assert.match(finding.message, /alt/);
});

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "a11y-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  const write = (path, text) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); };
  write("src/Old.tsx", "<main>\n  <img src=\"legacy.png\">\n</main>\n");
  write("src/util.js", "export const x = 1;\n");
  git("add", "-A");
  git("-c", "user.email=a@b", "-c", "user.name=a", "commit", "-qm", "base");
  return { root, write, base: git("rev-parse", "HEAD").stdout.trim() };
}

test("only lines the change added or edited are judged, in edited and new markup files", (t) => {
  const { root, write, base } = repository(t);
  write("src/Old.tsx", "<main>\n  <img src=\"legacy.png\">\n  <input type=\"text\">\n</main>\n");
  write("src/New.vue", "<template><button></button></template>\n");
  write("src/util.js", "export const x = 2;\n");
  const changed = changedMarkup(root, base);
  assert.deepEqual([...changed.keys()].sort(), ["src/New.vue", "src/Old.tsx"]);
  assert.deepEqual([...changed.get("src/Old.tsx")], [3]);
  assert.equal(changed.get("src/New.vue"), null, "a new file is judged whole");
  const report = accessibilityReport({ root: { path: root, access: "write", baseHead: base } });
  assert.deepEqual(report.findings.map((row) => `${row.file}:${row.line}:${row.rule}`).sort(),
    ["src/New.vue:1:button-name", "src/Old.tsx:3:control-label"], "the legacy image on line 2 owes nothing");
  assert.equal(report.status, "fail");
  assert.equal(report.built, ACCESSIBILITY_BUILT_IN);
  assert.match(report.limits, /contrast/);
  assert.equal(accessibilityReport({ other: { path: root, access: "read", baseHead: base } }).files, 0,
    "read-only repositories are never judged");
});

test("without a Git base a file is changed when it differs from the project copy", (t) => {
  const { root, write } = repository(t);
  const control = mkdtempSync(join(tmpdir(), "a11y-control-"));
  t.after(() => rmSync(control, { recursive: true, force: true }));
  mkdirSync(join(control, "src"), { recursive: true });
  writeFileSync(join(control, "src", "Old.tsx"), "<main>\n  <img src=\"legacy.png\">\n</main>\n");
  assert.deepEqual([...changedMarkup(root, null, control).keys()], []);
  write("src/Old.tsx", "<main></main>\n");
  assert.deepEqual([...changedMarkup(root, null, control).keys()], ["src/Old.tsx"]);
});

test("the command reads the provider repository manifest and fails on findings", (t) => {
  const { root, write, base } = repository(t);
  const manifest = join(root, ".manifest.json");
  writeFileSync(manifest, JSON.stringify({ repositories: { root: { path: root, access: "write", baseHead: base } } }));
  const run = () => spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: "utf8",
    env: { ...process.env, FOUNDATION_REPOSITORIES_FILE: manifest } });
  assert.equal(run().status, 0);
  write("src/Form.jsx", "<form><input name=\"q\"></form>\n");
  const failed = run();
  assert.equal(failed.status, 1);
  assert.match(failed.stdout, /src\/Form\.jsx:1 \[control-label\]/);
  assert.match(failed.stdout, /1 finding\(s\) in 1 changed markup file\(s\)/);
});

test("the built-in provider stands in until the project wires its own check", () => {
  const config = builtInCommandProvider("accessibility", (name) => `/h/${name}`, () => []);
  assert.deepEqual(config, accessibilityProviderConfig("/h/accessibility-check.mjs"));
  assert.equal(config.capability, "accessibility");
  assert.deepEqual(config.inputs, [...MARKUP_INPUTS]);
  assert.equal(builtInCommandProvider("performance", (name) => name, () => []), null);
  assert.ok(builtInCovers(config));
  assert.ok(!builtInCovers({ adapter: "command", command: ["npm", "run", "a11y"] }));
  // Detection still looks for a project-owned command and, finding none,
  // leaves the built-in in place instead of asking for wiring.
  const providerConfig = (provider) => provider === "accessibility" ? config : null;
  const repo = { id: "root", workspacePath: "/w", mode: "write" };
  const scripts = (names) => {
    const packageJson = { scripts: Object.fromEntries(names.map((name) => [name, "pa11y-ci"])) };
    return new Map([["root", { path: "/w/package.json", packageJson, dependencies: {},
      scripts: packageJson.scripts, manager: "npm" }]]);
  };
  const found = discoverMissingEvidence({ missing: ["accessibility"], providerConfig, providerCapability,
    knownProviders: PROVIDERS, repositories: [repo], contract: { providers: {}, claims: [] }, tooling: scripts(["test:a11y"]) });
  assert.equal(found.unresolved.length, 0);
  assert.deepEqual(found.candidates.map((row) => row.source), ["package.json#scripts.test:a11y"],
    "a project-owned script is proposed over the built-in");
  const none = discoverMissingEvidence({ missing: ["accessibility"], providerConfig, providerCapability,
    knownProviders: PROVIDERS, repositories: [repo], contract: { providers: {}, claims: [] }, tooling: scripts([]) });
  assert.deepEqual(none, { candidates: [], unresolved: [] });
});

test("ui work enforces the built-in check; a touched UI file alone stays advisory", () => {
  const config = accessibilityProviderConfig("/h/accessibility-check.mjs");
  const owed = builtInOwedCapabilities([{ capability: "accessibility" }, { capability: "performance" }],
    (capability) => capability === "accessibility" ? config : null);
  assert.deepEqual([...owed], ["accessibility"]);
  assert.deepEqual([...builtInOwedCapabilities([], () => config)], [], "only what the work type owes");
  assert.match(inferredAdvisoryNext("c", "accessibility"), /workType 'ui'/);
  assert.match(inferredAdvisoryNext("c", "performance"), /project-owned performance provider/);
});
