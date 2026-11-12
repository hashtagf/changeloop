import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertArchived, cleanup, landTrail, repositoriesWorld, replaceLine, stackedPair
} from "./fixtures/concurrent-repositories.mjs";

// Stacked changes in a multi-repository consumer: the later change branched
// before the earlier one landed (uncommitted) in the same repository.
// Split from concurrent-repositories.test.mjs so the gate runs these slow
// real-Git cases in parallel; every test builds its own temporary world.

test("a file edited after the landing is not replayed into the later sandbox", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "shared.txt": replaceLine(5, "alpha-edit") }, { "shared.txt": replaceLine(25, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    writeFileSync(join(w.project, "backend/shared.txt"), replaceLine(7, "user-edit")(w.read("backend/shared.txt")));
    const before = readFileSync(join(sandboxes.bravo, "shared.txt"), "utf8");
    const synced = w.cli("sandbox", "sync", "bravo");
    assert.doesNotMatch(synced.stdout, /REPLAYED backend:shared\.txt/);
    assert.equal(readFileSync(join(sandboxes.bravo, "shared.txt"), "utf8"), before);
  } finally { cleanup(w); }
});

test("a landed file the later sandbox did not edit is left alone", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "other.txt": (body) => `${body}alpha-edit\n` }, { "shared.txt": replaceLine(25, "bravo-edit") }, ["other.txt", "shared.txt"]);
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const synced = w.cli("sandbox", "sync", "bravo");
    assert.doesNotMatch(synced.stdout, /REPLAYED backend:other\.txt/);
    assert.equal(readFileSync(join(sandboxes.bravo, "other.txt"), "utf8"), "other base\n");
  } finally { cleanup(w); }
});
