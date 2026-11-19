import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { REQUIRED_ARCHIVE_PATHS, cliHelpStatus, rehearsalStatus,
  unsafeEnvironmentPaths } from "../../../scripts/release/local-rehearsal.mjs";

test("local release rehearsal requires runtime, installer, formula, and site sources", () => {
  for (const path of ["VERSION", "install.sh", "cli.sh", ".claude/harness/foundation.mjs",
    "Formula/cloop.rb", "website/docs/package.json"])
    assert.ok(REQUIRED_ARCHIVE_PATHS.includes(path), path);
});

test("optional unavailable host tooling is distinct from a failed required check", () => {
  assert.equal(rehearsalStatus({ archive: { status: "pass" },
    brew: { status: "unavailable", required: false } }), "pass");
  assert.equal(rehearsalStatus({ archive: { status: "fail" },
    brew: { status: "pass", required: false } }), "fail");
});

test("archive intake permits examples but rejects environment payloads", () => {
  assert.deepEqual(unsafeEnvironmentPaths([
    "dashboard/.env.example", ".env", "app/.env.local", "src/app.js"
  ]), [".env", "app/.env.local"]);
});

test("rehearsal checks compact intent help and full compatibility help separately", () => {
  const compact = { status: 0, stdout: "change start <draft>\nadvance <change>\n" };
  const full = { status: 0, stdout: "proof readiness <change>\nland check <change>\n" };
  assert.equal(cliHelpStatus(compact, full), "pass");
  assert.equal(cliHelpStatus({ status: 0, stdout: full.stdout }, full), "fail");
  assert.equal(cliHelpStatus(compact, { status: 1, stdout: full.stdout }), "fail");
});

test("Homebrew installs cloop directly and resolves the former formula name for existing users", () => {
  const renames = JSON.parse(readFileSync(resolve("formula_renames.json"), "utf8"));
  assert.equal(renames["claude-foundation"], "cloop");
  assert.match(readFileSync(resolve("Formula/cloop.rb"), "utf8"), /^class Cloop < Formula\b/m);
  assert.ok(!existsSync(resolve("Formula/claude-foundation.rb")));
  assert.ok(!existsSync(resolve("Aliases/cloop")));
});

test("Homebrew can install the renamed formula at a newer keg revision", () => {
  const formula = readFileSync(resolve("Formula/cloop.rb"), "utf8");
  assert.match(formula, /^  revision [1-9]\d*$/m);
});

test("Homebrew test checks compact and full CLI help at their owning surfaces", () => {
  const formula = readFileSync(resolve("Formula/cloop.rb"), "utf8");
  assert.match(formula, /help = shell_output\("#\{bin\}\/cloop --help"\)/);
  assert.match(formula, /assert_match "change start", help/);
  assert.match(formula, /assert_match "advance", help/);
  assert.match(formula, /full_help = shell_output\("#\{bin\}\/cloop help --all"\)/);
  assert.match(formula, /assert_match "proof readiness", full_help/);
  assert.match(formula, /assert_match "land check", full_help/);
});
