import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { replayLandedEdit, unionMergePath } from "../runtime/workflow/transaction/target-edits.mjs";

// A landed change and this change both edited the same lines of one file.
// The target holds the landed bytes; the sandbox holds this change's bytes.
function both(t, path, { base, landed, mine, attributes = null }) {
  const root = mkdtempSync(join(tmpdir(), "union-target-"));
  const sandbox = mkdtempSync(join(tmpdir(), "union-sandbox-"));
  t.after(() => { rmSync(root, { recursive: true, force: true }); rmSync(sandbox, { recursive: true, force: true }); });
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
  git("init", "-q");
  const put = (dir, file, text) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  };
  put(root, path, base);
  if (attributes) put(root, ".gitattributes", attributes);
  git("add", "-A");
  git("-c", "user.email=a@b", "-c", "user.name=a", "commit", "-qm", "base");
  put(root, path, landed);
  put(sandbox, path, mine);
  return replayLandedEdit({ root, sandboxPath: sandbox, path, baseBytes: Buffer.from(base) });
}

const BASE = "# Changelog\n\n## [Unreleased]\n\n## [1.0.0]\n";
const entry = (text) => `# Changelog\n\n## [Unreleased]\n\n- ${text}\n\n## [1.0.0]\n`;

test("two changelog entries under one heading are both kept", (t) => {
  const replay = both(t, "CHANGELOG.md", { base: BASE, landed: entry("landed entry"), mine: entry("my entry") });
  assert.equal(replay.status, "merged");
  const text = replay.bytes.toString();
  assert.match(text, /- my entry/);
  assert.match(text, /- landed entry/);
  assert.doesNotMatch(text, /<<<<<<<|>>>>>>>/);
});

test("a path .gitattributes marks merge=union keeps both sides", (t) => {
  const replay = both(t, "docs/NOTES.md", { base: "a\n", landed: "landed\n", mine: "mine\n",
    attributes: "docs/NOTES.md merge=union\n" });
  assert.equal(replay.status, "merged");
  assert.match(replay.bytes.toString(), /mine\n[\s\S]*landed\n|landed\n[\s\S]*mine\n/);
});

test("code edited on the same lines by both changes is still a conflict", (t) => {
  const replay = both(t, "src/a.js", { base: "x = 1\n", landed: "x = 2\n", mine: "x = 3\n" });
  assert.equal(replay.status, "conflict");
});

test("a changelog whose merge attribute is unset keeps the ordinary merge", (t) => {
  const replay = both(t, "CHANGELOG.md", { base: BASE, landed: entry("landed entry"), mine: entry("my entry"),
    attributes: "CHANGELOG.md -merge\n" });
  assert.equal(replay.status, "conflict");
});

test("changelog file names are recognized only as changelogs", (t) => {
  const root = mkdtempSync(join(tmpdir(), "union-attr-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q"], { cwd: root });
  writeFileSync(join(root, ".gitattributes"), "*.txt merge=binary\n");
  assert.equal(unionMergePath(root, "CHANGELOG.md"), true);
  assert.equal(unionMergePath(root, "packages/web/CHANGELOG-v2.md"), true);
  assert.equal(unionMergePath(root, "CHANGES.md"), true);
  assert.equal(unionMergePath(root, "README.md"), false);
  assert.equal(unionMergePath(root, "notes.txt"), false);
  assert.equal(readFileSync(join(root, ".gitattributes"), "utf8").length > 0, true);
});
