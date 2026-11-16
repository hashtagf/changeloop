import assert from "node:assert/strict";
import test from "node:test";
import { applyDeltaPacket, deltaScopeRows } from "../runtime/workflow/review-delta-scope.mjs";

const row = (path, identity, extra = {}) => ({ repositoryId: "root", path, identity, ...extra });

test("delta scope keeps changed rows, marks removed rows reverted, and sorts", () => {
  const base = [row("b.js", "1"), row("a.js", "1"), row("gone.js", "1")];
  const current = [row("b.js", "2"), row("a.js", "1"), row("new.js", "1")];
  assert.deepEqual(deltaScopeRows(base, current, false).map((r) => `${r.path}:${r.identity}`),
    ["b.js:2", "gone.js:reverted-to-base", "new.js:1"]);
});

test("a projected retry keeps its manifest instead of re-diffing", () => {
  const current = [row("z.js", "2"), row("a.js", "2")];
  assert.deepEqual(deltaScopeRows([row("a.js", "1")], current, true).map((r) => r.path),
    ["a.js", "z.js"]);
});

test("the delta packet keeps only changed contract artifacts and reuses claims", () => {
  const stableHash = (value) => `h(${JSON.stringify(value)})`;
  const scopeRows = [row("openspec/changes/c/proposal.md", "2",
    { kind: "contract-artifact", relativePath: "proposal.md" })];
  const request = { packet: {
    changedSurface: { inspection: [] },
    contractArtifacts: { "proposal.md": {}, "design.md": {} },
    decisions: { d1: { relativePath: "design.md" } },
    references: {},
    grounding: { g: 1 },
    claims: [{ id: "c1" }]
  } };
  const packet = applyDeltaPacket({}, {
    request, scopeRows, scopePaths: ["root/openspec/changes/c/proposal.md"],
    baseAttempt: { digest: "base", findings: [] }, baseAttemptDigest: "base",
    baseWorkspaceHash: "ws-1", stableHash
  });
  assert.deepEqual(Object.keys(packet.contractArtifacts), ["proposal.md"]);
  assert.deepEqual(packet.decisions, {});
  assert.equal(packet.grounding, null);
  assert.deepEqual(packet.claims, { reuseFromAttempt: "base", digest: 'h([{"id":"c1"}])' });
  assert.deepEqual(packet.changedSurface.deltaFrom, { attemptDigest: "base", workspaceHash: "ws-1" });
  assert.equal(packet.closureFindings.baseAttemptDigest, "base");
});
