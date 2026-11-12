import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertArchived, cleanup, editRepositorySandbox, landTrail, repositoriesWorld, replaceLine, singleRepositoryChange, stackedPair
} from "./fixtures/concurrent-repositories.mjs";

// Stacked changes in a multi-repository consumer: the later change branched
// before the earlier one landed (uncommitted) in the same repository.
// Split from concurrent-repositories.test.mjs so the gate runs these slow
// real-Git cases in parallel; every test builds its own temporary world.
const line = (text, n) => text.split("\n")[n - 1];

test("two changes that create the same new file end in a stop or a landing, never a loop", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "fresh.txt": () => "alpha fresh\n" }, { "fresh.txt": () => "bravo fresh\n" }, ["fresh.txt"]);
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const synced = w.cli("sandbox", "sync", "bravo");
    assert.match(synced.stdout, /CONFLICT backend:fresh\.txt/);
    // Unresolved, the sync has already run against these bytes, so Land stops
    // with the conflict's resolve route — repository, path and the sync
    // --resolve command — instead of syncing again forever or a bare refusal.
    const trail = landTrail(w, "bravo", { limit: 6 });
    const stop = trail.at(-1);
    assert.notEqual(stop.action, "DONE", JSON.stringify(stop));
    assert.ok(trail.length < 6, "the stop ends the trail, not the attempt limit");
    assert.equal(stop.legacyAction, "REPAIR_SYNC_CONFLICT", JSON.stringify(stop));
    assert.equal(stop.actor, "agent");
    assert.deepEqual(stop.conflicts, [{ repository: "backend", path: "fresh.txt" }]);
    assert.match(stop.reason, /repository 'backend' still holds unresolved conflicts .* fresh\.txt/);
    assert.equal(stop.resolveCommand, `claude-foundation sandbox sync ${w.ids.bravo} --resolve fresh.txt`);
    assert.equal(w.read("backend/fresh.txt"), "alpha fresh\n", "the landed file is untouched");
    // Resolved by the agent, the next landing archives with the merged file.
    editRepositorySandbox(sandboxes.bravo, "bravo", { "fresh.txt": () => "alpha fresh\nbravo fresh\n" });
    assertArchived(w, "bravo", landTrail(w, "bravo", { limit: 6 }));
    assert.equal(w.read("backend/fresh.txt"), "alpha fresh\nbravo fresh\n");
  } finally { cleanup(w); }
});

test("a user's uncommitted edit on the same lines still stops Land", () => {
  const w = repositoriesWorld();
  try {
    singleRepositoryChange(w, "alpha", "backend", { "shared.txt": replaceLine(10, "alpha-edit") });
    writeFileSync(join(w.project, "backend/shared.txt"), replaceLine(10, "user-edit")(w.read("backend/shared.txt")));
    const stop = landTrail(w, "alpha").at(-1);
    assert.notEqual(stop.action, "DONE", JSON.stringify(stop));
    assert.match(stop.reason, /overwrite an uncommitted target edit in 'backend': shared\.txt/);
    assert.equal(line(w.read("backend/shared.txt"), 10), "user-edit", "the user's bytes are kept");
  } finally { cleanup(w); }
});
