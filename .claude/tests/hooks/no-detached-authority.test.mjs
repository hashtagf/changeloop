import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const HOOK = fileURLToPath(new URL("../../hooks/no-detached-authority.mjs", import.meta.url));
function runHook(command, env = {}) {
  const base = { ...process.env };
  delete base.FOUNDATION_GUARDRAIL_MODE;
  const result = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name: "Bash", tool_input: { command } }),
    env: { ...base, ...env }, encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

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

test("an unrewritable detached authority run is only warned outside block mode", () => {
  const command = "cloop authority run demo; type setsid";
  assert.equal(detachedAuthorityCommand(attachedAuthorityCommand(command)), true);
  const advised = runHook(command);
  assert.equal(advised.decision, undefined);
  assert.match(advised.hookSpecificOutput.additionalContext, /foreground/);
  assert.equal(advised.hookSpecificOutput.updatedInput, undefined);
});

test("block mode still refuses a detached authority run", () => {
  const refused = runHook("cloop authority run demo &", { FOUNDATION_GUARDRAIL_MODE: "block" });
  assert.equal(refused.decision, "block");
  assert.match(refused.reason, /foreground/);
  const unknown = runHook("cloop authority run demo &", { FOUNDATION_GUARDRAIL_MODE: "strict" });
  assert.equal(unknown.decision, undefined);
  assert.equal(unknown.hookSpecificOutput.updatedInput.command, "cloop authority run demo");
  const rewritten = runHook("cloop authority run demo &");
  assert.equal(rewritten.hookSpecificOutput.updatedInput.command, "cloop authority run demo");
});
