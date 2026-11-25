import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agreementDriftError, agreementIdentity, agreementRestoredNotice, assertSpecApproval,
  carryWiringIntoAmendment, currentWaivers, preserveSpecApprovalAcross, repairWhitespaceDrift, restoreDriftedAgreement, REVIEW_DISPATCH_TIMEOUT_MS }
  from "../runtime/core/user-decisions.mjs";
import { createAdvanceRuntime } from "../runtime/workflow/advance/advance-runtime.mjs";
import { advanceFailureAction } from "../runtime/workflow/advance/advance-envelope.mjs";
import { drainSignals } from "../runtime/core/signals.mjs";
import { workspaceCapabilityValue } from "../runtime/core/execution-contract.mjs";
import { advanceRuntimeDeps } from "./fixtures/runtime-deps.mjs";

// Provider wiring is evidence configuration: editing it reruns that provider,
// but which providers exist and every claim still need consent.
test("spec approval survives provider wiring edits but not provider or claim edits", (t) => {
  const root = mkdtempSync(join(tmpdir(), "spec-wiring-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packet = join(root, "openspec/changes/demo");
  mkdirSync(packet, { recursive: true });
  writeFileSync(join(packet, "proposal.md"), "Change the greeting");
  const evidence = (providers, capability = "test") => JSON.stringify({ version: 2,
    claims: [{ id: "greets", capabilities: [capability] }], providers }, null, 2);
  const testProvider = (timeoutMs) => ({ test: { adapter: "test-discovery", command: ["npm", "test"], timeoutMs } });
  writeFileSync(join(packet, "evidence.yaml"), evidence(testProvider(120000)));
  writeFileSync(join(packet, "execution.yaml"), JSON.stringify({ version: 1,
    providers: { lint: { command: ["npm", "run", "lint"] } }, services: {} }));
  const prior = agreementIdentity(root, "demo", { wiring: true });
  const state = { status: "change", specApproval: { required: true, identity: agreementIdentity(root, "demo"), revision: 0 } };
  writeFileSync(join(packet, "evidence.yaml"), evidence(testProvider(1800000)));
  writeFileSync(join(packet, "execution.yaml"), JSON.stringify({ version: 1,
    providers: { lint: { command: ["npm", "run", "lint", "--fix"] } }, services: {} }));
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state), "a wiring edit keeps consent");
  writeFileSync(join(packet, "evidence.yaml"), evidence({}));
  assert.throws(() => assertSpecApproval(root, "demo", state), { code: "SPEC_APPROVAL_REQUIRED" },
    "removing a provider needs consent");
  writeFileSync(join(packet, "evidence.yaml"), evidence(testProvider(1800000), "security-static"));
  assert.throws(() => assertSpecApproval(root, "demo", state), { code: "SPEC_APPROVAL_REQUIRED" },
    "changing a claim needs consent");
  // An approval recorded before wiring became configuration still matches.
  writeFileSync(join(packet, "evidence.yaml"), evidence(testProvider(120000)));
  writeFileSync(join(packet, "execution.yaml"), JSON.stringify({ version: 1,
    providers: { lint: { command: ["npm", "run", "lint"] } }, services: {} }));
  assert.doesNotThrow(() => assertSpecApproval(root, "demo",
    { ...state, specApproval: { ...state.specApproval, identity: prior } }));
});

test("spec approval binds semantics and revision, not task completion", (t) => {
  const root = mkdtempSync(join(tmpdir(), "spec-consent-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packet = join(root, "openspec/changes/demo");
  mkdirSync(packet, { recursive: true });
  writeFileSync(join(packet, "proposal.md"), "Change the greeting");
  writeFileSync(join(packet, "tasks.md"), "- [ ] Implement greeting\n");
  const state = { status: "change", specApproval: { required: true } };
  assert.throws(() => assertSpecApproval(root, "demo", state), { code: "SPEC_APPROVAL_REQUIRED" });
  state.specApproval = { required: true, identity: agreementIdentity(root, "demo"), revision: 0 };
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  writeFileSync(join(packet, "tasks.md"), "- [x] Implement greeting\n");
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  writeFileSync(join(packet, "proposal.md"), "Delete the greeting");
  assert.throws(() => assertSpecApproval(root, "demo", state), { code: "SPEC_APPROVAL_REQUIRED" });
  const workspace = join(root, "workspace");
  const workspacePacket = join(workspace, "openspec/changes/demo");
  mkdirSync(workspacePacket, { recursive: true });
  writeFileSync(join(workspacePacket, "proposal.md"), "Amend the greeting");
  writeFileSync(join(workspacePacket, "tasks.md"), "- [x] Implement greeting\n");
  state.status = "building";
  state.contractRevision = 1;
  assert.equal(workspaceCapabilityValue("demo", state).mode, "agreement-only");
  state.workspace = { mode: "copy", path: workspace };
  state.amendments = [{ revision: 1 }];
  state.specApproval = { required: true, identity: agreementIdentity(workspace, "demo"), revision: 1 };
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  state.amendments = [];
  // Without an amendment the target packet is canonical: the harness restores
  // the isolated packet to it, so consent is checked against the target alone.
  assert.throws(() => assertSpecApproval(root, "demo", state), { code: "SPEC_APPROVAL_REQUIRED" });
  assert.equal(readFileSync(join(workspacePacket, "proposal.md"), "utf8"), "Delete the greeting");
});

// A consumer Build widened a task's `[paths:]` in its isolated packet; the
// approval could then never match both packets and `advance` asked the user to
// approve again forever, until the agent asked the user to copy tasks.md.
test("task write scope is bookkeeping and packet drift is agent repair", (t) => {
  const root = mkdtempSync(join(tmpdir(), "spec-scope-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const workspace = join(root, "workspace");
  const tasks = (paths) => `- [ ] T001 Build it [paths:${paths}] — verify: npm test\n`;
  for (const base of [root, workspace]) {
    mkdirSync(join(base, "openspec/changes/demo"), { recursive: true });
    writeFileSync(join(base, "openspec/changes/demo/proposal.md"), "Change the greeting");
    writeFileSync(join(base, "openspec/changes/demo/tasks.md"), tasks("src/a.ts"));
  }
  const legacy = agreementIdentity(root, "demo", { legacy: true });
  const state = { status: "building", contractRevision: 0, workspace: { path: workspace },
    specApproval: { required: true, identity: agreementIdentity(root, "demo"), revision: 0 } };
  writeFileSync(join(workspace, "openspec/changes/demo/tasks.md"),
    tasks("src/a.ts,app/[tenant]/**"));
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  // Approvals recorded before the upgrade keep their exact-bytes identity,
  // including when the sandbox later widens only its write scope.
  writeFileSync(join(workspace, "openspec/changes/demo/tasks.md"), tasks("src/a.ts"));
  state.specApproval.identity = legacy;
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  writeFileSync(join(workspace, "openspec/changes/demo/tasks.md"), tasks("src/a.ts,src/b.ts"));
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  // Changing what a task does is not consented: the harness restores the
  // approved task, keeps its bookkeeping, and saves the edit for an amendment.
  writeFileSync(join(workspace, "openspec/changes/demo/tasks.md"),
    "- [x] T001 Delete it [paths:src/a.ts] — verify: npm test\n");
  const notices = [];
  const original = console.error;
  console.error = (line) => notices.push(String(line));
  drainSignals();
  try { assert.doesNotThrow(() => assertSpecApproval(root, "demo", state)); }
  finally { console.error = original; }
  const signals = drainSignals();
  assert.deepEqual(signals.map((row) => row.code), ["agreement-restored"],
    "the restored-drift notice also reaches the advance envelope");
  assert.match(signals[0].message, /^the isolated agreement for 'demo' was edited outside/);
  assert.equal(readFileSync(join(workspace, "openspec/changes/demo/tasks.md"), "utf8"), tasks("src/a.ts"));
  const saved = notices.join("\n").match(/saved the edit at (\S+)\. /)?.[1];
  assert.ok(saved, notices.join("\n"));
  assert.match(readFileSync(join(saved, "tasks.md"), "utf8"), /Delete it/);
  // When restoring cannot reproduce consent, the agent still gets the amend route.
  const drift = agreementDriftError("demo", workspace);
  const action = advanceFailureAction("demo", drift, { through: "build" });
  assert.equal(action.action, "REPAIR");
  assert.equal(action.actor, "agent");
  assert.match(action.command, /^cloop change amend demo /);
});

test("legacy in-flight state needs no invented approval", () => {
  assert.doesNotThrow(() => assertSpecApproval("/missing", "legacy", { status: "building" }));
});

test("waivers expire on changed product or agreement without rewriting findings", () => {
  const waiver = { capability: "review", reason: "User accepts unreviewed scope",
    binding: { workspaceHash: "a", contractRevision: 2 } };
  const state = { contractRevision: 2, waivers: [waiver] };
  assert.deepEqual(currentWaivers(state, "a"), [waiver]);
  assert.deepEqual(currentWaivers(state, "b"), []);
  assert.deepEqual(currentWaivers({ ...state, contractRevision: 3 }, "a"), []);
  assert.deepEqual(state.waivers, [waiver]);
});

// A shared 30-minute window counted the agent's repair between review rounds
// and reviewer retries, then asked the user about elapsed time. Review is now
// bounded by its rounds; each dispatch keeps its own timeout.
test("an old expired review window never stops advance or asks the user", () => {
  const state = { status: "building", reviewWindow: { deadline: "2026-09-09T00:30:00Z" },
    reviewWindowHistory: [{ deadline: "2026-09-09T00:00:00Z", decisionRef: "harness://auto-extend/review-window/1" }] };
  const runtime = createAdvanceRuntime(advanceRuntimeDeps({
    loadRuntime: () => state,
    saveRuntime: assert.fail,
    nowMs: () => Date.parse("2026-09-10T00:00:00Z"),
    agentDispatchValue: () => ({ action: "build-complete" }),
    authorityStatusValue: () => ({ requests: [{ type: "review", status: "requested" }] }),
    relevantHash: () => "w", deliveredAiAttempts: () => [],
    readJson: () => ({}), proofAdvancePath: () => "/missing", stableHash: (value) => JSON.stringify(value)
  }));
  const action = runtime.advanceValue("demo");
  assert.notEqual(action.boundary, "review-time-exhausted");
  assert.notEqual(action.decision?.kind, "REVIEW_TIME_EXHAUSTED");
  assert.equal(REVIEW_DISPATCH_TIMEOUT_MS, 30 * 60 * 1000, "each dispatch keeps its own timeout");
});

// A formatter pass over the isolated packet is not agreement drift: the
// harness restores the target's bytes and keeps checkbox and `[paths:]`
// bookkeeping. A wording change is still drift and is left untouched.
test("whitespace drift is repaired in place and wording drift is restored with the edit saved", (t) => {
  const root = mkdtempSync(join(tmpdir(), "spec-whitespace-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (base, files) => {
    const packet = join(base, "openspec/changes/demo");
    mkdirSync(packet, { recursive: true });
    for (const [name, content] of Object.entries(files)) writeFileSync(join(packet, name), content);
    return packet;
  };
  write(root, { "proposal.md": "# Greeting\n\nChange the greeting.\n",
    "tasks.md": "## 1\n- [ ] 1.1 Implement [paths: a.js]\n- [ ] 1.2 Test\n" });
  const workspace = join(root, "workspace");
  const packet = write(workspace, { "proposal.md": "# Greeting\n\nChange the   greeting.  \n\n",
    "tasks.md": "## 1\n\n- [x] 1.1 Implement [paths: a.js, b.js]\n-  [ ] 1.2 Test\n" });
  const state = { status: "building", contractRevision: 0, workspace: { path: workspace },
    specApproval: { required: true, identity: agreementIdentity(root, "demo"), revision: 0 } };
  assert.doesNotThrow(() => assertSpecApproval(root, "demo", state));
  assert.equal(readFileSync(join(packet, "proposal.md"), "utf8"), "# Greeting\n\nChange the greeting.\n");
  assert.equal(readFileSync(join(packet, "tasks.md"), "utf8"),
    "## 1\n- [x] 1.1 Implement [paths: a.js, b.js]\n- [ ] 1.2 Test\n");

  writeFileSync(join(packet, "proposal.md"), "# Greeting\n\nDelete the greeting.\n");
  assert.equal(repairWhitespaceDrift(root, workspace, "demo"), false);
  const original = console.error;
  console.error = () => {};
  try { assert.doesNotThrow(() => assertSpecApproval(root, "demo", state)); }
  finally { console.error = original; }
  assert.equal(readFileSync(join(packet, "proposal.md"), "utf8"), "# Greeting\n\nChange the greeting.\n");
});

// The restore names what it put back and where the edit went, so the agent
// (and the user reading the envelope) see what was overwritten before acting.
test("a restore names the restored files and the saved copy", (t) => {
  const root = mkdtempSync(join(tmpdir(), "spec-restore-notice-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (base, files) => {
    const packet = join(base, "openspec/changes/demo");
    mkdirSync(packet, { recursive: true });
    for (const [name, content] of Object.entries(files)) writeFileSync(join(packet, name), content);
    return packet;
  };
  write(root, { "proposal.md": "# Greeting\n", "design.md": "## Overview\n", "tasks.md": "- [ ] 1.1 Do\n" });
  const workspace = join(root, "workspace");
  write(workspace, { "proposal.md": "# Greeting\n", "design.md": "## Overview\n\nEdited.\n",
    "tasks.md": "- [x] 1.1 Do\n- [ ] 1.2 Added by hand\n" });
  const restored = restoreDriftedAgreement(root, workspace, "demo", 42);
  assert.deepEqual(restored.files, ["design.md", "tasks.md"]);
  assert.equal(restored.saved, join(root, ".foundation", "agreement-drift", "demo", "42"));
  assert.equal(readFileSync(join(restored.saved, "design.md"), "utf8"), "## Overview\n\nEdited.\n");
  assert.equal(readFileSync(join(workspace, "openspec/changes/demo/tasks.md"), "utf8"), "- [x] 1.1 Do\n");
  const notice = agreementRestoredNotice("demo", restored);
  assert.match(notice, /Restored: design\.md, tasks\.md\./);
  assert.match(notice, /agreement-drift\/demo\/42/);
  // Whitespace-only differences are repaired in place and never restored.
  write(workspace, { "proposal.md": "# Greeting  \n", "design.md": "## Overview\n", "tasks.md": "- [ ] 1.1 Do\n" });
  assert.equal(repairWhitespaceDrift(root, workspace, "demo"), true);
});

// An amended change in Build: the target packet is the pre-amendment text, the
// isolated packet and its harness snapshot carry the amendment, and consent
// binds the amended packet. Evidence wiring then writes execution.yaml.
function amendedBuild(t, { amended = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "spec-amended-wiring-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const workspace = join(root, "workspace");
  const target = join(root, "openspec/changes/demo");
  const isolated = join(workspace, "openspec/changes/demo");
  for (const [packet, proposal] of [[target, "Greet"], [isolated, amended ? "Greet and wave" : "Greet"]]) {
    mkdirSync(packet, { recursive: true });
    writeFileSync(join(packet, "proposal.md"), proposal);
    writeFileSync(join(packet, "tasks.md"), "- [ ] T001 Build it [paths:src/a.ts]\n");
  }
  const snapshotPath = ".foundation/agreement-amended/demo/1";
  if (amended) cpSync(isolated, join(root, snapshotPath), { recursive: true });
  const directoryHash = (dir) => {
    const hash = createHash("sha256");
    for (const name of readdirSync(dir).sort()) hash.update(name).update(readFileSync(join(dir, name)));
    return hash.digest("hex");
  };
  const changePath = (id) => join(root, "openspec/changes", id);
  let stored = { status: "building", contractRevision: amended ? 1 : 0,
    workspace: { path: workspace, changeSourceHash: directoryHash(target) },
    amendments: amended ? [{ revision: 1, snapshot: snapshotPath, identity: agreementIdentity(workspace, "demo") }] : [],
    specApproval: { required: true, identity: agreementIdentity(workspace, "demo"),
      revision: amended ? 1 : 0, decisionRef: "user" } };
  let saves = 0;
  const deps = { loadRuntime: () => structuredClone(stored),
    saveRuntime: (state) => { saves += 1; stored = structuredClone(state); },
    directoryHash, changePath, now: () => "2026-01-01T00:00:00.000Z" };
  const execution = JSON.stringify({ version: 1, providers: { lint: { command: ["npm", "run", "lint"] } }, services: {} });
  const wire = () => {
    writeFileSync(join(target, "execution.yaml"), execution);
    writeFileSync(join(isolated, "execution.yaml"), execution);
  };
  return { root, workspace, target, isolated, snapshot: join(root, snapshotPath), deps, wire,
    directoryHash, state: () => stored, saves: () => saves };
}

const quietly = (fn) => {
  const original = console.error;
  console.error = () => {};
  try { return fn(); } finally { console.error = original; drainSignals(); }
};

test("wiring after an amendment keeps consent and the written execution.yaml", (t) => {
  // Before the fix the restore deleted the harness's own wiring and consent
  // no longer matched: advance asked for approval on every run.
  const bug = amendedBuild(t);
  preserveSpecApprovalAcross(bug.root, "demo", bug.deps, bug.wire, "evidence-wiring");
  assert.throws(() => quietly(() => assertSpecApproval(bug.root, "demo", bug.state())),
    { code: "SPEC_APPROVAL_REQUIRED" });
  assert.equal(existsSync(join(bug.isolated, "execution.yaml")), false);

  const run = amendedBuild(t);
  preserveSpecApprovalAcross(run.root, "demo", run.deps,
    () => carryWiringIntoAmendment(run.root, "demo", run.deps, run.wire), "evidence-wiring");
  drainSignals();
  assert.doesNotThrow(() => assertSpecApproval(run.root, "demo", run.state()));
  assert.deepEqual(drainSignals(), [], "no drift restore");
  assert.equal(existsSync(join(run.isolated, "execution.yaml")), true);
  assert.equal(readFileSync(join(run.snapshot, "execution.yaml"), "utf8"),
    readFileSync(join(run.isolated, "execution.yaml"), "utf8"));
  assert.equal(run.state().amendments[0].identity, agreementIdentity(run.workspace, "demo"));
  assert.equal(run.state().workspace.changeSourceHash, run.directoryHash(run.target),
    "the harness's own target write is not a competing edit");
});

test("an agreement edit outside an amendment is still restored after wiring", (t) => {
  const run = amendedBuild(t);
  const identity = run.state().amendments[0].identity;
  writeFileSync(join(run.isolated, "proposal.md"), "Delete the greeting");
  carryWiringIntoAmendment(run.root, "demo", run.deps, run.wire);
  assert.equal(readFileSync(join(run.snapshot, "proposal.md"), "utf8"), "Greet and wave");
  assert.equal(existsSync(join(run.snapshot, "execution.yaml")), false, "snapshot left as it was");
  assert.equal(run.state().amendments[0].identity, identity);
  quietly(() => assertSpecApproval(run.root, "demo", run.state()));
  assert.equal(readFileSync(join(run.isolated, "proposal.md"), "utf8"), "Greet and wave");
});

test("a target edited elsewhere before wiring stays a user decision", (t) => {
  const run = amendedBuild(t);
  const recorded = run.state().workspace.changeSourceHash;
  writeFileSync(join(run.target, "proposal.md"), "Greet loudly");
  carryWiringIntoAmendment(run.root, "demo", run.deps, run.wire);
  assert.equal(run.state().workspace.changeSourceHash, recorded);
  assert.notEqual(recorded, run.directoryHash(run.target));
});

test("wiring a change without an amendment leaves state untouched", (t) => {
  const run = amendedBuild(t, { amended: false });
  const before = structuredClone(run.state());
  let wired = 0;
  assert.equal(carryWiringIntoAmendment(run.root, "demo", run.deps, () => { wired += 1; return "ok"; }), "ok");
  assert.equal(wired, 1);
  assert.equal(run.saves(), 0);
  assert.deepEqual(run.state(), before);
  assert.equal(existsSync(join(run.root, ".foundation/agreement-amended")), false);
});
