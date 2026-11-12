import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertArchived, cleanup, editRepositorySandbox, landTrail, repositoriesWorld, replaceLine, stackedPair
} from "./fixtures/concurrent-repositories.mjs";

// Stacked changes in a multi-repository consumer: the later change branched
// before the earlier one landed (uncommitted) in the same repository.
// Split from concurrent-repositories.test.mjs so the gate runs these slow
// real-Git cases in parallel; every test builds its own temporary world.
const line = (text, n) => text.split("\n")[n - 1];

test("a recorded resolution does not survive a change to the target file", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "shared.txt": replaceLine(10, "alpha-edit") }, { "shared.txt": replaceLine(10, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    assert.match(w.cli("sandbox", "sync", "bravo").stdout, /CONFLICT backend:shared\.txt/);
    editRepositorySandbox(sandboxes.bravo, "bravo", { "shared.txt": replaceLine(10, "alpha-edit bravo-edit") });
    // The sync that follows the agent's edit records the resolution.
    assert.doesNotMatch(w.cli("sandbox", "sync", "bravo").stdout, /CONFLICT backend:shared\.txt/);
    // Someone then edits the target file: the recorded resolution no longer applies.
    writeFileSync(join(w.project, "backend/shared.txt"), replaceLine(20, "user-edit")(w.read("backend/shared.txt")));
    const stop = landTrail(w, "bravo").at(-1);
    assert.notEqual(stop.action, "DONE", JSON.stringify(stop));
    assert.match(stop.reason, /overwrite an uncommitted target edit in 'backend': shared\.txt/);
    assert.equal(line(w.read("backend/shared.txt"), 20), "user-edit", "the user's bytes are kept");
  } finally { cleanup(w); }
});
