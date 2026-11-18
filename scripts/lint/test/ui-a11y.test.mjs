// The repository UI accessibility lint: real markup defects are findings,
// tags named in an Astro component's script fence are not, and the
// repository's own interfaces stay at zero.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { lintUi } from "../ui-a11y.mjs";

test("markup defects are findings; an Astro script fence is not markup", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ui-a11y-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "index.html"), "<!doctype html>\n<html>\n<head><title>x</title>" +
    "<meta name=\"viewport\" content=\"width=device-width\"></head>\n<body><h1>x</h1><img src=\"a.png\">" +
    "<input id=\"q\"></body></html>\n");
  writeFileSync(join(root, "src", "Logo.astro"), "---\n/** Renders <img> next to the <html> title. */\n" +
    "const href = \"/\";\n---\n<a href={href}><img src=\"/logo.svg\"></a>\n");
  const findings = await lintUi(root, ["index.html", "src/*.astro"]);
  assert.deepEqual(findings.map((row) => `${row.file}:${row.line}:${row.rule}`).sort(), [
    "index.html:2:@html-eslint/require-lang",
    "index.html:4:@html-eslint/require-img-alt",
    "index.html:4:@html-eslint/require-input-label",
    "src/Logo.astro:5:@html-eslint/require-img-alt"
  ]);
});

test("the repository's own interfaces have no accessibility lint finding", async () => {
  assert.deepEqual(await lintUi(), []);
});
