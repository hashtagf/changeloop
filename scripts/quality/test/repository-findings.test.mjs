// Change Loop onboards itself through the consumer path. Its quality lanes
// reuse the repository's own guards, so the consumer readiness and the
// repository scorecard must count the same findings.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { REPO_ROOT, codeHealth } from "../scorecard.mjs";
import { repositoryFindings } from "../repository-findings.mjs";

const config = JSON.parse(readFileSync(join(REPO_ROOT, "quality/foundation-quality.json"), "utf8"));
const providers = config.repositories.find((row) => row.id === "root").providers;

test("every findings lane runs the repository's own guard", () => {
  for (const [capability, provider] of Object.entries(providers).filter(([name]) => name !== "test"))
    assert.deepEqual(provider.command, ["node", "scripts/quality/repository-findings.mjs", capability], capability);
  assert.deepEqual(providers.test.command, ["sh", ".claude/tests/run-all.sh"]);
});

test("the consumer lanes count what the scorecard counts", async () => {
  const code = codeHealth(REPO_ROOT);
  const count = async (capability) => (await repositoryFindings(capability)).length;
  assert.equal(await count("lint"), code.lintFindings);
  assert.equal(await count("type-check"), code.typeFindings);
  assert.equal(await count("file-size"), code.filesOverSizeCeiling);
  assert.equal(await count("nesting-depth"), code.filesNestedOverLimit);
  assert.equal(await count("duplication"), code.duplicateBlocks);
  assert.equal(await count("workaround-comments"), code.workaroundComments);
  assert.equal(await count("module-boundaries"), 0, "the architecture check passes");
});
