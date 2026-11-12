import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertArchived, cleanup, editRepositorySandbox, landTrail, repositoriesWorld, replaceLine, stackedPair, status
} from "./fixtures/concurrent-repositories.mjs";

// Stacked changes in a multi-repository consumer: the later change branched
// before the earlier one landed (uncommitted) in the same repository.
// Split from concurrent-repositories.test.mjs so the gate runs these slow
// real-Git cases in parallel; every test builds its own temporary world.
const line = (text, n) => text.split("\n")[n - 1];

// alpha lands two edits: line 3 (nobody else touches it) and line 10 (bravo
// rewrites it too, so only line 10 conflicts).
const alphaEdits = { "shared.txt": (body) => replaceLine(10, "alpha-edit")(replaceLine(3, "alpha-three")(body)) };

test("the agent decides the lines both changes rewrote while the other landed edits stay", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend", alphaEdits, { "shared.txt": replaceLine(10, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const synced = w.cli("sandbox", "sync", "bravo");
    assert.match(synced.stdout, /CONFLICT backend:shared\.txt/);
    // bravo's version of line 10 wins; alpha's line 3 is carried unchanged.
    assert.equal(line(readFileSync(join(sandboxes.bravo, "shared.txt"), "utf8"), 3), "shared line 3",
      "a conflicted replay never writes the sandbox");
    editRepositorySandbox(sandboxes.bravo, "bravo",
      { "shared.txt": replaceLine(3, "alpha-three") });
    assertArchived(w, "bravo", landTrail(w, "bravo"));
    const landed = w.read("backend/shared.txt");
    assert.equal(line(landed, 3), "alpha-three");
    assert.equal(line(landed, 10), "bravo-edit");
  } finally { cleanup(w); }
});

test("a merge that drops a landed edit outside the conflicting lines stops Land and keeps the landed bytes", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend", alphaEdits, { "shared.txt": replaceLine(10, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const landed = w.read("backend/shared.txt");
    assert.match(w.cli("sandbox", "sync", "bravo").stdout, /CONFLICT backend:shared\.txt/);
    // The agent decides line 10 but leaves alpha's line 3 at its base text.
    editRepositorySandbox(sandboxes.bravo, "bravo", { "shared.txt": replaceLine(10, "bravo-edit only") });
    const stop = landTrail(w, "bravo").at(-1);
    assert.notEqual(stop.action, "DONE", JSON.stringify(stop));
    assert.equal(stop.actor, "agent");
    assert.equal(stop.boundary, "conflict");
    assert.deepEqual(stop.details.conflicts.map((row) => [row.repository, row.path, row.landedBy]),
      [["backend", "shared.txt", w.ids.alpha]], "the stop names the repository, the path and the landed change");
    assert.equal(stop.resumeCommand, `claude-foundation advance ${w.ids.bravo} --through archived`);
    assert.equal(w.read("backend/shared.txt"), landed, "the landed bytes are untouched");
    assert.notEqual(status(w, "bravo"), "archived");
  } finally { cleanup(w); }
});
