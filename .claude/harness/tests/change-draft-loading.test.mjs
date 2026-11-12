import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { tmpdir } from "node:os";
import {
  atomicStartPreflight, createChangeLifecycle, synchronizeProposalClassification
} from "../runtime/workflow/change-lifecycle.mjs";
import { changeLifecycleDeps } from "./fixtures/runtime-deps.mjs";

// Draft loading boundaries that remain once only semantic drafts v4/v5 are
// accepted: path containment, retired versions, and the atomic-start
// preflight that runs on the compiled draft.
const root = mkdtempSync(join(tmpdir(), "foundation-change-draft-"));
const draftPath = join(root, "draft.json");
const writeDraft = (value) => {
  writeFileSync(draftPath, `${JSON.stringify(value, null, 2)}\n`);
  return "draft.json";
};
const fail = (message) => { throw new Error(message); };
const lifecycle = createChangeLifecycle(changeLifecycleDeps({
  root,
  policy: () => ({ workflow: { grounding: "optional" } }),
  securityTerms: [], fail,
  pathInside: (parent, candidate) => {
    const rel = relative(parent, candidate);
    return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
  },
  readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
  measureStage: (_stage, operation) => operation(),
  writeJson: () => {}, slugify: (value) => value, changePath: () => root,
  loadRuntime: () => ({}), saveRuntime: () => {}, setOperationChangeId: () => {},
  initialBudget: () => ({}), gitHead: () => "head", preexistingDirty: () => [],
  now: () => "2026-08-26T00:00:00.000Z", bindClaudeSession: () => {},
  validate: () => {}, createSandbox: () => {}, showPacket: () => {}
}));

// The compiled shape atomicStartPreflight reads.
const compiled = () => ({
  version: 4,
  intent: "Load one atomic draft",
  acceptance: { required: false, reason: null, claimIds: [] },
  impact: "low",
  coupling: "isolated",
  securityTriggers: [],
  execution: { version: 1, providers: { test: { adapter: "test" } } }
});

try {
  assert.equal(synchronizeProposalClassification([
    "## Impact", "", "- **Impact:** low | medium | high",
    "- **Coupling:** isolated | coupled", ""
  ].join("\n"), { impact: "high", coupling: "coupled" }), [
    "## Impact", "", "- **Impact:** high", "- **Coupling:** coupled", ""
  ].join("\n"));

  assert.throws(() => lifecycle.loadDraft("missing.json"), /JSON file inside the project/);
  const outside = join(tmpdir(), `outside-draft-${process.pid}.json`);
  writeFileSync(outside, "{}\n");
  assert.throws(() => lifecycle.loadDraft(outside), /JSON file inside the project/);
  rmSync(outside, { force: true });

  for (const version of [1, 2, 3])
    assert.throws(() => lifecycle.loadDraft(writeDraft({ version, intent: "Old draft" })),
      new RegExp(`draft version ${version} is no longer supported`));
  assert.throws(() => lifecycle.loadDraft(writeDraft({ version: 6, intent: "Future" })),
    /semantic draft version must be 4 or 5/);

  const preflight = (mutate) => {
    const draft = compiled();
    mutate(draft);
    return atomicStartPreflight(draft).issues.join("\n");
  };
  assert.equal(preflight(() => {}), "");
  assert.match(preflight((draft) => { draft.version = 3; }), /draft version 3 is no longer supported/);
  assert.match(preflight((draft) => { draft.intent = " "; }), /non-empty 'intent'/);
  assert.match(preflight((draft) => { delete draft.acceptance; }), /acceptance.required true\|false/);
  assert.match(preflight((draft) => { draft.acceptance = { required: true }; }), /acceptance.reason/);
  assert.match(preflight((draft) => { draft.acceptance.claimIds = ["claim-1"]; }),
    /acceptance.reason and acceptance.claimIds require/);
  assert.match(preflight((draft) => { draft.impact = "critical"; }), /impact must be low\|medium\|high/);
  assert.match(preflight((draft) => { draft.coupling = "shared"; }), /coupling must be isolated\|coupled/);
  assert.match(preflight((draft) => { draft.securityTriggers = [""]; }), /array of non-empty strings/);
  assert.match(preflight((draft) => { delete draft.execution; }), /executable evidence wiring/);

  const incomplete = compiled();
  incomplete.version = 6;
  incomplete.intent = "";
  delete incomplete.acceptance;
  incomplete.impact = "critical";
  const aggregate = atomicStartPreflight(incomplete);
  assert.ok(aggregate.issues.length >= 4, aggregate.issues.join("\n"));
  console.log("change draft loading tests: PASS");
} finally {
  rmSync(root, { recursive: true, force: true });
}
