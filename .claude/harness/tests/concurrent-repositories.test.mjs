import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  assertArchived, cleanup, editRepositorySandbox, landTrail, repositoriesWorld, replaceLine, stackedPair, status
} from "./fixtures/concurrent-repositories.mjs";

// Stacked changes in a multi-repository consumer: the later change branched
// before the earlier one landed (uncommitted) in the same repository.
const line = (text, n) => text.split("\n")[n - 1];

test("edits on different lines of a repository file merge into the later sandbox and land", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "shared.txt": replaceLine(5, "alpha-edit") }, { "shared.txt": replaceLine(25, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const synced = w.cli("sandbox", "sync", "bravo");
    assert.equal(synced.status, 0, synced.stderr || synced.stdout);
    assert.match(synced.stdout, new RegExp(`REPLAYED backend:shared\\.txt: merged the landed, uncommitted work of ${w.ids.alpha}`));
    const merged = readFileSync(join(sandboxes.bravo, "shared.txt"), "utf8");
    assert.equal(line(merged, 5), "alpha-edit");
    assert.equal(line(merged, 25), "bravo-edit");
    assert.notEqual(status(w, "bravo"), "proven", "the replay invalidates bravo's proof");
    assertArchived(w, "bravo", landTrail(w, "bravo"));
    const landed = w.read("backend/shared.txt");
    assert.equal(line(landed, 5), "alpha-edit");
    assert.equal(line(landed, 25), "bravo-edit");
    assert.equal(w.run("git", ["rev-parse", "HEAD"], join(w.project, "backend")),
      w.run("git", ["rev-list", "--max-parents=0", "HEAD"], join(w.project, "backend")), "no HEAD moved");
  } finally { cleanup(w); }
});

test("edits on the same line are reported as a repository conflict and never written", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "shared.txt": replaceLine(10, "alpha-edit") }, { "shared.txt": replaceLine(10, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    const before = readFileSync(join(sandboxes.bravo, "shared.txt"), "utf8");
    const synced = w.cli("sandbox", "sync", "bravo");
    assert.match(synced.stdout, new RegExp(`CONFLICT backend:shared\\.txt: .*${w.ids.alpha}`));
    assert.equal(readFileSync(join(sandboxes.bravo, "shared.txt"), "utf8"), before, "a conflict never writes the sandbox");
  } finally { cleanup(w); }
});

test("an agent-resolved merge that keeps every landed edit lands", () => {
  const w = repositoriesWorld();
  try {
    const sandboxes = stackedPair(w, "backend",
      { "shared.txt": replaceLine(10, "alpha-edit") }, { "shared.txt": replaceLine(10, "bravo-edit") });
    assertArchived(w, "alpha", landTrail(w, "alpha"));
    assert.match(w.cli("sandbox", "sync", "bravo").stdout, /CONFLICT backend:shared\.txt/);
    editRepositorySandbox(sandboxes.bravo, "bravo", { "shared.txt": replaceLine(10, "alpha-edit bravo-edit") });
    assertArchived(w, "bravo", landTrail(w, "bravo"));
    assert.equal(line(w.read("backend/shared.txt"), 10), "alpha-edit bravo-edit");
  } finally { cleanup(w); }
});
