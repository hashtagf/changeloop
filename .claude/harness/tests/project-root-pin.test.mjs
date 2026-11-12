// A host session exports CLAUDE_FOUNDATION_PROJECT (and CLAUDE_PROJECT_DIR,
// FOUNDATION_* identity) into every agent shell. A harness command run inside
// another Foundation project — a test fixture, a sibling checkout — must never
// resolve to, or write into, the pinned project.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createBootstrap } from "../runtime/composition/bootstrap.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tmp = realpathSync(mkdtempSync(join(tmpdir(), "root-pin-")));
test.after(() => rmSync(tmp, { recursive: true, force: true }));

function markers(dir) {
  mkdirSync(join(dir, "openspec"), { recursive: true });
  mkdirSync(join(dir, ".claude", "harness"), { recursive: true });
  writeFileSync(join(dir, "openspec", "config.yaml"), "schema: rapid\n");
  writeFileSync(join(dir, ".claude", "harness", "foundation.mjs"), "\n");
  return dir;
}

function bootstrap(options) {
  return createBootstrap({ warn() {}, fail(message) { throw new Error(message); }, ...options });
}

test("a pin from another project is refused before any state is created", () => {
  const victim = markers(join(tmp, "unit-victim"));
  const fixture = markers(join(tmp, "unit-fixture"));
  assert.throws(() => bootstrap({ start: fixture, pinned: victim,
    harness: join(fixture, ".claude", "harness") }), /refusing to change a different project/);
  assert.equal(existsSync(join(victim, ".foundation")), false);
  assert.equal(existsSync(join(fixture, ".foundation")), false);
});

test("a pin is honored from its own tree, a sandbox copy, or its own runtime", () => {
  const owner = markers(join(tmp, "unit-owner"));
  const copy = markers(join(owner, ".foundation", "sandboxes", "change-a"));
  const elsewhere = join(tmp, "unit-elsewhere");
  mkdirSync(elsewhere, { recursive: true });
  assert.equal(bootstrap({ start: join(owner, "openspec"), pinned: owner }).root, owner);
  assert.equal(bootstrap({ start: copy, pinned: owner }).root, owner);
  assert.equal(bootstrap({ start: copy, pinned: copy }).root, copy);
  assert.equal(bootstrap({ start: elsewhere, pinned: owner,
    harness: join(owner, ".claude", "harness") }).root, owner);
});

test("without a pin the cwd decides and a sandbox copy resolves to its owner", () => {
  const owner = markers(join(tmp, "unit-plain"));
  const copy = markers(join(owner, ".foundation", "repository-sandboxes", "change-b"));
  assert.equal(bootstrap({ start: copy }).root, owner);
});

test("the runtime run in a fixture under a host session leaves the host project untouched", () => {
  const install = (target) => {
    mkdirSync(join(target, ".claude"), { recursive: true });
    cpSync(join(ROOT, ".claude", "harness"), join(target, ".claude", "harness"), { recursive: true });
    cpSync(join(ROOT, "openspec", "schemas"), join(target, "openspec", "schemas"), { recursive: true });
    cpSync(join(ROOT, "openspec", "config.yaml"), join(target, "openspec", "config.yaml"));
    cpSync(join(ROOT, "foundation.json"), join(target, "foundation.json"));
    return target;
  };
  const host = install(join(tmp, "host"));
  const fixture = install(join(tmp, "fixture"));
  const snapshot = (dir) => readdirSync(dir, { recursive: true }).sort();
  const before = snapshot(host);
  const result = spawnSync(process.execPath,
    [join(fixture, ".claude", "harness", "foundation.mjs"), "new", "Pin probe", "--id", "pin-probe", "--rapid"], {
      cwd: fixture, encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: host, CLAUDE_FOUNDATION_PROJECT: host,
        FOUNDATION_HOST: "pi", FOUNDATION_SESSION_ID: "host-session",
        FOUNDATION_MAIN_IDENTITY: "pi-main-session", FOUNDATION_GUARDRAIL_MODE: "block",
        FOUNDATION_TELEMETRY: "0", FOUNDATION_UPDATE_CHECK: "0" }
    });
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /BLOCKED: CLAUDE_FOUNDATION_PROJECT pins .*refusing to change a different project/);
  assert.deepEqual(snapshot(host), before);
  assert.equal(existsSync(join(fixture, "openspec", "changes", "pin-probe")), false);
});
