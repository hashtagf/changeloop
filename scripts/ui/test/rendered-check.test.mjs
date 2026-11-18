// The rendered check of the repository's own interfaces: a real browser,
// axe-core, and a phone width that may not scroll sideways.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPages, chromePath } from "../rendered-check.mjs";

// CI must have a browser: there the check runs or fails, never skips.
const browser = chromePath() || process.env.CI;

test("a page with a contrast failure and sideways scroll fails; a clean page passes", { skip: !browser && "no Chrome" }, async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ui-rendered-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>t</title></head><body><main><h1>Title</h1>${body}</main></body></html>`;
  writeFileSync(join(root, "bad.html"), page('<p style="color:#bbb;background:#fff">faint</p><div style="width:900px">wide</div>'));
  writeFileSync(join(root, "good.html"), page("<p>readable</p>"));
  const { findings } = await checkPages({ root, out: join(root, "out"),
    pages: [{ name: "bad", path: "bad.html" }, { name: "good", path: "good.html" }] });
  const rules = new Set(findings.map((row) => `${row.page}:${row.rule}`));
  assert.ok(rules.has("bad:color-contrast"));
  assert.ok(rules.has("bad:horizontal-overflow"));
  assert.ok(![...rules].some((rule) => rule.startsWith("good:")));
});

test("the repository's own interfaces pass the rendered check", { skip: !browser && "no Chrome" }, async () => {
  const { findings } = await checkPages();
  assert.deepEqual(findings, []);
});
