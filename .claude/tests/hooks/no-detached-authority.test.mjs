import assert from "node:assert/strict";
import test from "node:test";

import { attachedAuthorityCommand, detachedAuthorityCommand } from "../../hooks/no-detached-authority.mjs";

test("configured authority reviewer must remain in the foreground", () => {
  assert.equal(detachedAuthorityCommand(
    "cloop authority run demo --request req &"), true);
  assert.equal(detachedAuthorityCommand(
    "nohup node .claude/harness/foundation.mjs authority run demo --request req"), true);
  assert.equal(detachedAuthorityCommand(
    "node .claude/harness/foundation.mjs authority-run demo --request req; disown"), true);
  assert.equal(detachedAuthorityCommand(
    "cloop authority run demo --request req"), false);
  assert.equal(detachedAuthorityCommand("node --test &"), false);
  assert.equal(detachedAuthorityCommand(
    "printf '%s' 'authority run demo &'"), false);
});

// A detached reviewer is never refused: the harness runs it attached.
test("a detached authority run is rewritten to run in the foreground", () => {
  for (const [detached, attached] of [
    ["cloop authority run demo --request req &",
      "cloop authority run demo --request req"],
    ["nohup cloop authority run demo > review.log 2>&1 &",
      "cloop authority run demo > review.log 2>&1"],
    ["node .claude/harness/foundation.mjs authority-run demo; disown",
      "node .claude/harness/foundation.mjs authority-run demo"],
    ["setsid cloop authority run demo &",
      "cloop authority run demo"]
  ]) {
    assert.equal(attachedAuthorityCommand(detached), attached);
    assert.equal(detachedAuthorityCommand(attachedAuthorityCommand(detached)), false);
  }
  assert.equal(attachedAuthorityCommand("cloop authority run demo && echo done"),
    "cloop authority run demo && echo done");
});
