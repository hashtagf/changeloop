import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  SHARED_LINES, agentEdit, assertArchived, buildChange, cleanup, landTrail, proveChange,
  replaceLine, runtimeText, startChange, world
} from "./fixtures/concurrent-changes.mjs";

const SHARED = "src/shared.txt";
const workspaceOf = (w, label) => JSON.parse(runtimeText(w, label)).workspace;
const sync = (w, label) => w.cli("sandbox", "sync", label);

// Lands `label` from a sandbox built now, editing `line` of the shared file.
function landEdit(w, label, line) {
  const sandbox = buildChange(w, label);
  agentEdit(sandbox, label, { [SHARED]: replaceLine(line, `${label}-edit`) });
  proveChange(w, label);
  assertArchived(w, label, landTrail(w, label));
}

// A sandbox created after another change landed starts from the landed bytes.
// The change's edit next to the landed lines is its own work: no sync replays
// the landed edit into it again, and Land accepts the path.
test("a carried landed file edited on adjacent lines syncs without conflict and lands", () => {
  const w = world();
  try {
    startChange(w, "bravo", [SHARED]);
    landEdit(w, "bravo", 3);
    // Started after bravo landed: the landed file is pre-existing dirt, so
    // alpha still gets a worktree and the carry copies bravo's bytes into it.
    startChange(w, "alpha", [SHARED]);
    const sandbox = buildChange(w, "alpha");
    assert.equal(workspaceOf(w, "alpha").mode, "worktree");
    assert.equal(workspaceOf(w, "alpha").landedCarriedFrom?.[SHARED]?.changeId, w.ids.bravo,
      "the carry records where the sandbox copy started");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(4, "alpha-edit") });
    const edited = readFileSync(join(sandbox, SHARED), "utf8");
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const synced = sync(w, "alpha");
      assert.equal(synced.status, 0, synced.stderr || synced.stdout);
      assert.doesNotMatch(synced.stdout, /CONFLICT/, synced.stdout);
      assert.equal(readFileSync(join(sandbox, SHARED), "utf8"), edited,
        "the sandbox bytes are never rewritten");
    }
    const workspace = workspaceOf(w, "alpha");
    assert.equal(workspace.landedConflicts?.[SHARED], undefined);
    assert.ok(workspace.landedResolved?.[SHARED], JSON.stringify(workspace));
    assert.equal(workspace.landedCarriedFrom?.[SHARED]?.changeId, w.ids.bravo,
      "the carry origin survives the change's own edit");
    proveChange(w, "alpha");
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const final = w.read(SHARED).split("\n");
    assert.equal(final[2], "bravo-edit");
    assert.equal(final[3], "alpha-edit");
    assert.equal(final.length, SHARED_LINES + 1, "no line was lost or duplicated");
  } finally { cleanup(w); }
});

// Once the target moves past the carried bytes, the carry no longer vouches
// for the sandbox copy: the replay merges the new landed edit as before and an
// overlap is a conflict.
test("a target that moved after the carry is replayed again and conflicts on overlap", () => {
  const w = world();
  try {
    for (const label of ["bravo", "charlie"]) startChange(w, label, [SHARED]);
    // Charlie's sandbox predates bravo's Land; it edits line 20 only.
    const charlie = buildChange(w, "charlie");
    agentEdit(charlie, "charlie", { [SHARED]: replaceLine(20, "charlie-edit") });
    proveChange(w, "charlie");
    landEdit(w, "bravo", 3);
    startChange(w, "alpha", [SHARED]);
    const sandbox = buildChange(w, "alpha");
    assert.ok(workspaceOf(w, "alpha").landedCarriedFrom?.[SHARED]);
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(20, "alpha-edit") });
    assert.equal(sync(w, "alpha").status, 0);
    assert.equal(workspaceOf(w, "alpha").landedConflicts?.[SHARED], undefined);
    assertArchived(w, "charlie", landTrail(w, "charlie"));
    const synced = sync(w, "alpha");
    assert.match(synced.stdout + synced.stderr, /CONFLICT|conflict/, synced.stdout);
    const workspace = workspaceOf(w, "alpha");
    assert.ok(workspace.landedConflicts?.[SHARED], JSON.stringify(workspace));
    assert.equal(workspace.landedResolved?.[SHARED], undefined);
    assert.equal(workspace.landedCarriedFrom?.[SHARED], undefined,
      "a moved target drops the carry origin");
  } finally { cleanup(w); }
});

// Another session works uncommitted in the target while this change lands:
// it edits other lines of a file the change also edits and adds a file that
// edit needs. Land must prove on the target it is about to produce, so every
// uncommitted file the change did not touch is carried into the sandbox too,
// not only the merged one; neither side's work is lost and nothing carried
// becomes this change's contribution.
test("uncommitted target files the change did not touch are carried before proof", () => {
  const w = world();
  try {
    startChange(w, "alpha", [SHARED]);
    const sandbox = buildChange(w, "alpha");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(3, "alpha-edit") });
    // Code that merges in the other session's edit also needs its new file.
    writeFileSync(join(sandbox, "test/alpha.test.js"),
      'import test from "node:test";\nimport assert from "node:assert/strict";\n' +
      'import { existsSync, readFileSync } from "node:fs";\n' +
      'const at = (f) => new URL(`../${f}`, import.meta.url);\n' +
      'test("alpha", () => {\n' +
      `  const shared = readFileSync(at("${SHARED}"), "utf8");\n` +
      '  assert.match(shared, /alpha-edit/);\n' +
      '  if (shared.includes("other-edit")) assert.ok(existsSync(at("src/helper.txt")), "helper carried");\n' +
      '});\n');
    proveChange(w, "alpha");
    // The other session, uncommitted: a non-overlapping edit to the shared
    // file, a new file it depends on, and an edit to a file alpha never touched.
    w.write(SHARED, replaceLine(20, "other-edit")(w.read(SHARED)));
    w.write("src/helper.txt", "helper\n");
    w.write("src/bravo.txt", "bravo other session\n");
    const trail = landTrail(w, "alpha", { limit: 6 });
    assertArchived(w, "alpha", trail);
    const final = w.read(SHARED).split("\n");
    assert.equal(final[2], "alpha-edit");
    assert.equal(final[19], "other-edit", "the other session's edit is kept");
    assert.equal(w.read("src/helper.txt"), "helper\n");
    assert.equal(w.read("src/bravo.txt"), "bravo other session\n");
    const workspace = workspaceOf(w, "alpha");
    assert.deepEqual(Object.keys(workspace.targetUncommitted || {}).sort(),
      ["src/bravo.txt", "src/helper.txt"], JSON.stringify(workspace));
    // Carried files are not alpha's work: the target never shows them staged or
    // committed by Land, and they remain the other session's uncommitted edits.
    const dirty = w.run("git", ["status", "--porcelain", "--", "src/helper.txt", "src/bravo.txt"]);
    assert.match(dirty, /\?\? src\/helper\.txt/);
    assert.match(dirty, /(^| )M src\/bravo\.txt/m, "modified, not staged");
  } finally { cleanup(w); }
});

// A target file that becomes uncommitted after the change was proven: Land
// sends it back through sync and proof before applying anything.
test("Land re-syncs when the target gained uncommitted files after proof", () => {
  const w = world();
  try {
    startChange(w, "alpha", [SHARED]);
    const sandbox = buildChange(w, "alpha");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(3, "alpha-edit") });
    proveChange(w, "alpha");
    w.write("src/late.txt", "late\n");
    const trail = landTrail(w, "alpha", { limit: 6 });
    assertArchived(w, "alpha", trail);
    assert.ok(runtimeText(w, "alpha").includes("target-edit-sync"),
      "Land stopped for a sync before applying");
    assert.ok(workspaceOf(w, "alpha").targetUncommitted?.["src/late.txt"],
      "the late file was in the proved sandbox");
    assert.equal(w.read("src/late.txt"), "late\n");
    assert.equal(existsSync(join(w.project, "src/late.txt")), true);
  } finally { cleanup(w); }
});

// The other session reverts a file after the sync carried it: proof that saw
// it no longer describes the target Land leaves, so Land syncs again (the
// sandbox drops the file) and proves before applying.
test("a carried file the target reverts is put back and proved again before Land", () => {
  const w = world();
  try {
    startChange(w, "alpha", [SHARED]);
    const sandbox = buildChange(w, "alpha");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(3, "alpha-edit") });
    proveChange(w, "alpha");
    w.write("src/helper.txt", "helper\n");
    assert.equal(sync(w, "alpha").status, 0);
    assert.equal(readFileSync(join(sandbox, "src/helper.txt"), "utf8"), "helper\n");
    assert.ok(workspaceOf(w, "alpha").targetUncommitted?.["src/helper.txt"]);
    proveChange(w, "alpha");
    w.run("rm", ["src/helper.txt"]);
    assertArchived(w, "alpha", landTrail(w, "alpha", { limit: 6 }));
    assert.equal(workspaceOf(w, "alpha").targetUncommitted?.["src/helper.txt"], undefined,
      "the proved sandbox no longer held the reverted file");
    assert.equal(existsSync(join(w.project, "src/helper.txt")), false, "Land did not recreate it");
  } finally { cleanup(w); }
});

// Only regular files are carried, and Land asks for a sync only when that
// sync would carry something: an uncommitted symlink or nested repository in
// the target never blocks Land.
test("an uncommitted symlink or nested repository never blocks Land", () => {
  const w = world();
  try {
    startChange(w, "alpha", [SHARED]);
    const sandbox = buildChange(w, "alpha");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(3, "alpha-edit") });
    proveChange(w, "alpha");
    w.run("ln", ["-s", "alpha.txt", "src/alpha-link"]);
    w.run("git", ["init", "-q", "nested"]);
    w.write("nested/file.txt", "nested\n");
    const trail = landTrail(w, "alpha", { limit: 3 });
    assertArchived(w, "alpha", trail);
    assert.equal(runtimeText(w, "alpha").includes("target-edit-sync"), false,
      "no sync was requested for paths it cannot carry");
  } finally { cleanup(w); }
});

// The change's own edit is never replaced by the target's bytes: a file both
// edit stays on the merge route, and a carried file the change later edits
// becomes the change's work again.
test("the change's own edits are never overwritten by the carry", () => {
  const w = world();
  try {
    startChange(w, "alpha", [SHARED, "src/charlie.txt"]);
    const sandbox = buildChange(w, "alpha");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(3, "alpha-edit"),
      "src/charlie.txt": () => "charlie alpha\n" });
    w.write("src/charlie.txt", "charlie other session\n");
    sync(w, "alpha");
    assert.equal(readFileSync(join(sandbox, "src/charlie.txt"), "utf8"), "charlie alpha\n");
    assert.equal(workspaceOf(w, "alpha").targetUncommitted?.["src/charlie.txt"], undefined);
  } finally { cleanup(w); }
});

// A sandbox that never carried the landed bytes keeps the 3-way replay: the
// same line edited by both changes is a conflict.
test("a never-carried sandbox editing the landed lines still conflicts", () => {
  const w = world();
  try {
    for (const label of ["alpha", "bravo"]) startChange(w, label, [SHARED]);
    const sandbox = buildChange(w, "alpha");
    agentEdit(sandbox, "alpha", { [SHARED]: replaceLine(3, "alpha-edit") });
    proveChange(w, "alpha");
    landEdit(w, "bravo", 3);
    const synced = sync(w, "alpha");
    assert.match(synced.stdout + synced.stderr, /CONFLICT|conflict/, synced.stdout);
    const workspace = workspaceOf(w, "alpha");
    assert.equal(workspace.landedCarriedFrom?.[SHARED], undefined);
    assert.ok(workspace.landedConflicts?.[SHARED], JSON.stringify(workspace));
    assert.equal(workspace.landedResolved?.[SHARED], undefined);
  } finally { cleanup(w); }
});
