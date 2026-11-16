// Guards advise instead of refuse (2026-11-16). The guides must not claim the
// default guards refuse Land, Deliver, or commit/push, and must name the
// opt-in strict mode and the secret-redaction exception.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("guides describe advisory guards with an opt-in strict mode", () => {
  for (const path of ["WORKFLOW.md", "AGENTS.md", "website/docs/src/content/docs/install.md"]) {
    const text = read(path);
    assert.match(text, /advise/, path);
    assert.match(text, /FOUNDATION_GUARDRAIL_MODE=block/, path);
  }
  assert.match(read("website/docs/src/content/docs/th/install.md"), /FOUNDATION_GUARDRAIL_MODE=block/);
  assert.match(read("WORKFLOW.md"), /Secret redaction is the exception/);
  const harness = read(".claude/harness/README.md");
  assert.match(harness, /Pi guards advise by default/);
  assert.doesNotMatch(harness, /never runs `authority run`/);
  assert.doesNotMatch(harness, /A worker session refuses `\/land`/);
});

test("no guide claims the default guards turn Deliver or commit/push into a question", () => {
  for (const path of ["WORKFLOW.md", ".claude/harness/lifecycle/build.md", ".claude/hooks/README.md",
    ".claude/hooks/phase-mutation-guard.md"]) {
    const text = read(path);
    assert.doesNotMatch(text, /becomes the\s+question for the user/, path);
    assert.doesNotMatch(text, /replaces it with the\s+question/, path);
    assert.doesNotMatch(text, /replaced by the question/, path);
    assert.doesNotMatch(text, /delivery into the question/, path);
  }
  assert.doesNotMatch(read("website/docs/src/content/docs/install.md"), /revokes the previous command's Land authority/);
});
