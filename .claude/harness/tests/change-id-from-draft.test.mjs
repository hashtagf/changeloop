import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { draftChangeId, draftNameFromPath } from "../runtime/workflow/draft/draft-packet-render.mjs";
import { installConsumer } from "./fixtures/installed-consumer.mjs";

const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
const THAI = "Build ติดตั้ง dependency จาก lockfile ของ PHP, Ruby, Python และ Go";

test("the draft name comes from its folder, the folder holding change.json, or a .json file", () => {
  assert.equal(draftNameFromPath(".foundation/drafts/polyglot-build-setup"), "polyglot-build-setup");
  assert.equal(draftNameFromPath(".foundation/drafts/polyglot-build-setup/"), "polyglot-build-setup");
  assert.equal(draftNameFromPath(".foundation/drafts/polyglot-build-setup/change.json"), "polyglot-build-setup");
  assert.equal(draftNameFromPath(".foundation/drafts/subtract.json"), "subtract");
  assert.equal(draftNameFromPath(""), null);
});

test("a non-English intent is named after its draft; an English one after its intent", () => {
  assert.equal(draftChangeId({ intent: THAI }, slugify, { draftName: "polyglot-build-setup" }), "polyglot-build-setup");
  assert.equal(draftChangeId({ intent: "Calc exports subtract that returns a minus b" }, slugify,
    { draftName: "subtract" }), "calc-exports-subtract-that-returns-a-minus-b");
  assert.equal(draftChangeId({ intent: THAI, id: "my-change" }, slugify, { draftName: "x-y" }), "my-change");
  for (const generic of ["draft", "change", "new", "tmp"])
    assert.equal(draftChangeId({ intent: THAI }, slugify, { draftName: generic }), slugify(THAI), generic);
  assert.equal(draftChangeId({ intent: THAI }, slugify), slugify(THAI), "no draft name keeps the old rule");
});

test("change start names a Thai-intent folder draft after the folder", () => {
  const temp = mkdtempSync(join(tmpdir(), "foundation-change-id-"));
  try {
    const project = join(temp, "consumer");
    mkdirSync(project);
    installConsumer(project, { sourceRoot: resolve(dirname(fileURLToPath(import.meta.url)), "../../..") });
    const folder = join(project, ".foundation/drafts/polyglot-build-setup");
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, "change.json"), JSON.stringify({
      version: 5, intent: "เครื่องคิดเลข export subtract ที่คืน a ลบ b",
      requirements: [{ description: "The calc module SHALL export subtract(a, b) returning a minus b",
        scenarios: [{ when: "subtract(5, 3) is called", then: "it returns 2" }] }],
      tasks: [{ outcome: "Add subtract with a test", verify: "node --test", paths: ["src/**", "test/**"] }]
    }));
    writeFileSync(join(folder, "proposal.md"), "## Why\n\nเครื่องคิดเลขยังลบเลขไม่ได้\n");
    const env = { ...process.env };
    for (const key of Object.keys(env)) if (/^(FOUNDATION_|CLAUDE_)/.test(key)) delete env[key];
    delete env.NODE_TEST_CONTEXT;
    const started = spawnSync("node", [".claude/harness/foundation.mjs", "start",
      ".foundation/drafts/polyglot-build-setup"], { cwd: project, encoding: "utf8", env });
    assert.match(started.stdout, /^CREATED polyglot-build-setup$/m, started.stderr || started.stdout);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
