import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync,
  statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { createApplyRuntime } from "../runtime/workflow/land/apply-runtime.mjs";
import { VERIFICATION_RECORD_FILE } from "../runtime/workflow/land/archive-records.mjs";
import { renderVerificationRecord } from "../runtime/workflow/validation/process-fields.mjs";

const ID = "ship-widget";
const ARCHIVED = join("openspec", "changes", "archive", `2026-10-15-${ID}`);
const RECEIPT = `.foundation/evidence/${ID}/proof-1/receipts/test.json`;
const fail = (message) => { throw new Error(message); };

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
}

function quiet(fn) {
  const { log, error } = console;
  console.log = () => {};
  console.error = () => {};
  try { return fn(); } finally { console.log = log; console.error = error; }
}

// Directory identity covers every file inside, as the production directoryHash does.
function identity(path) {
  if (!statSync(path).isDirectory())
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  const hash = createHash("sha256");
  for (const name of readdirSync(path).sort()) hash.update(name).update(identity(join(path, name)));
  return `directory:${hash.digest("hex")}`;
}

const testReceipt = {
  provider: "test", status: "pass", claims: ["widget-ships", "widget-ships-2"],
  observed: "exit 0; 1200ms", command: "node --test test/widget.test.mjs", durationMs: 1234,
  log: `.foundation/evidence/${ID}/collect-1/artifacts/test/log.txt`,
  environment: { SECRET_TOKEN_NAME: "WIDGET_TOKEN" }
};

const reviewAttempts = [{ attempt: 1, status: "completed", reviewerIdentity: "codex", findings: [] }];

function fixture({ draft = {}, attempts = [], receipt = testReceipt, packetFile = false,
  sandboxFile = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "archive-verification-"));
  const change = join(root, "openspec", "changes", ID);
  write(join(change, "proposal.md"), "# Proposal\n\n## Why\n\nShip the widget.\n");
  if (packetFile) write(join(change, VERIFICATION_RECORD_FILE), "author notes\n");
  write(join(root, "openspec", "config.yaml"), "schema: foundation-standard\n");
  write(join(root, ".foundation", "proof", `${ID}.json`), JSON.stringify({
    proofRunId: "proof-1", status: "pass", workspaceHash: "ws-hash", contractFingerprint: "contract-fp",
    receipts: [{ provider: "test", path: RECEIPT, sha256: "abc123" }],
    advisories: [{ kind: "user-waived", capability: "accessibility", reason: "no UI" }]
  }));
  if (receipt) write(join(root, RECEIPT), JSON.stringify(receipt));
  const sandbox = join(root, "sandbox");
  if (sandboxFile) write(join(sandbox, "openspec", "changes", ID, VERIFICATION_RECORD_FILE), "x\n");
  const bin = join(root, "bin");
  write(join(bin, "openspec"), [
    "#!/bin/sh",
    "mkdir -p openspec/changes/archive",
    `mv "openspec/changes/$2" "openspec/changes/archive/2026-10-15-$2"`
  ].join("\n"));
  chmodSync(join(bin, "openspec"), 0o755);
  const state = {
    id: ID, status: "proven",
    workspace: sandboxFile ? { mode: "worktree", path: sandbox } : { mode: "direct" },
    draftSource: { contractRevision: 0, draft }
  };
  let activeAtArchive = null;
  const runtime = createApplyRuntime({
    root,
    loadRuntime: () => state,
    saveRuntime: () => {},
    changePath: (id) => join(root, "openspec", "changes", id),
    proofPath: (id) => join(root, ".foundation", "proof", `${id}.json`),
    readJson: (path, fallback) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback,
    pathIdentity: (path) => existsSync(path) ? identity(path) : null,
    syncClaudeTelemetry: () => {},
    modelUsageRecorded: () => true,
    verifyAppliedProjection: () => ({ valid: true }),
    cleanupApplyTransaction: () => ({ status: "committed" }),
    cleanupAppliedSandbox: () => ({ status: "removed" }),
    cleanupRepositorySandboxes: () => ({ status: "removed" }),
    recoverPendingApply: () => {},
    landCheck: () => ({ archived: false, state, hash: "hash",
      assurance: { status: "passed", workspaceHash: "hash", acceptedBy: "explicit-land-authority" } }),
    assertMultiRepositoryArchiveReady: () => {},
    archivedChangeRelativePath: () => existsSync(join(root, ARCHIVED)) ? ARCHIVED : null,
    pendingTasks: () => [],
    assertOpenSpecCli: () => {},
    proofAudit: () => ({ valid: true }),
    cleanupChangeLeases: () => {},
    now: () => "2026-10-15T00:00:00.000Z",
    fail,
    reviewAttemptRecords: () => attempts,
    archiveCheckpoint: (name) => {
      if (name === "before-archive-command")
        activeAtArchive = existsSync(join(change, VERIFICATION_RECORD_FILE));
    }
  });
  return {
    root, state, change,
    activeHadFile: () => activeAtArchive,
    file: () => join(root, ARCHIVED, VERIFICATION_RECORD_FILE),
    record: () => readFileSync(join(root, ARCHIVED, VERIFICATION_RECORD_FILE), "utf8"),
    run() {
      const path = process.env.PATH;
      process.env.PATH = `${bin}:${path}`;
      try { return quiet(() => runtime.archive(ID)); } finally { process.env.PATH = path; }
    }
  };
}

test("Land writes verification.md with the accepted proof run and one row per receipt", () => {
  const land = fixture();
  land.run();
  assert.equal(land.state.status, "archived");
  const record = land.record();
  assert.match(record, /^# Verification\n/);
  assert.match(record, /\| `proof-1` \| pass \| ws-hash \| contract-fp \|/);
  assert.match(record,
    /\| test \| widget-ships, widget-ships-2 \| pass \| exit 0; 1200ms \| node --test test\/widget\.test\.mjs \| 1\.2 s \| abc123 \|/);
  assert.match(record, /- user-waived: accessibility: no UI/);
});

// verification.md opens for whoever reads the outcome: one line, each check
// by its plain name, the reviewer's open gaps; hashes and commands follow.
test("verification.md leads with a plain outcome, named checks, and the reviewer's open gaps", () => {
  const proof = { proofRunId: "p", status: "pass", workspaceHash: "w", contractFingerprint: "c",
    receipts: [{ provider: "test", path: "a", sha256: "s1" }, { provider: "custom-lint", path: "b", sha256: "s2" },
      { provider: "review", path: "missing", sha256: "s3" }] };
  const receipts = { a: { provider: "test", status: "pass", observed: "exit 0",
    command: "node /Users/someone/work/app/scripts/check.mjs", durationMs: 1500 },
  b: { provider: "custom-lint", status: "fail", observed: "2 findings" } };
  const attempts = [{ status: "completed", specGaps: [{ scenario: "Release fails after refund", reason: "no scenario says what happens" }] }];
  const record = renderVerificationRecord({ proof, receipts, reviewAttempts: attempts });
  const top = record.slice(0, record.indexOf("## Technical record"));
  assert.match(top, /^# Verification\n\n1 of 3 checks did not pass\. · 1 result\(s\) could not be read and are not counted as passes\. · An AI review was completed\./);
  assert.match(top, /\| Project tests \(`test`\) \| passed \| exit 0 \| 1\.5 s \|/);
  assert.match(top, /\| `custom-lint` \| failed \| 2 findings \|/);
  assert.match(top, /- \*\*Release fails after refund\*\* — no scenario says what happens/);
  assert.doesNotMatch(top, /s1|Workspace hash|\/Users\//);
  assert.match(record, /\| test \| — \| pass \| exit 0 \| node check\.mjs \| 1\.5 s \| s1 \|/,
    "the technical record keeps the command without the machine path");
  const th = renderVerificationRecord({ language: "th", proof: { ...proof, receipts: [proof.receipts[0]] }, receipts });
  assert.match(th, /^# ผลการพิสูจน์\n\nผ่านครบทั้ง 1 ด่าน/);
  assert.match(th, /\| เทสต์ของโปรเจกต์ \(`test`\) \| ผ่าน \|/);
});

test("an unreadable receipt is listed as unavailable, never as a pass", () => {
  const land = fixture({ receipt: null });
  land.run();
  assert.equal(land.state.status, "archived");
  const row = land.record().split("\n").find((line) => line.startsWith("| test |"));
  assert.match(row, /\| test \| — \| unavailable \| — \| — \| — \| abc123 \|/);
  assert.doesNotMatch(row, /\| pass \|/);
});

test("machine-local log paths and environment never reach verification.md", () => {
  const land = fixture({ receipt: { ...testReceipt, observed: `see .foundation/evidence/${ID}/log.txt` } });
  land.run();
  const record = land.record();
  assert.doesNotMatch(record, /\.foundation\//);
  assert.doesNotMatch(record, /WIDGET_TOKEN|SECRET_TOKEN_NAME/);
});

test("without a completed review the record says no review is recorded", () => {
  const land = fixture();
  land.run();
  assert.match(land.record(), /## Review\n\nNo completed review is recorded for this change\./);
});

test("with a completed review the record points to the proposal review appendix", () => {
  const land = fixture({ attempts: reviewAttempts });
  land.run();
  assert.match(land.record(), /See Appendix: Review record in proposal\.md\./);
});

test("a Thai packet gets Thai headings and labels", () => {
  const land = fixture({ draft: { language: "th" }, attempts: reviewAttempts });
  land.run();
  const record = land.record();
  assert.match(record, /^# ผลการพิสูจน์\n/);
  assert.match(record, /\| Provider \| Claim \| สถานะ \| ผลที่สังเกต \| คำสั่ง \| เวลา \| SHA-256 ของ receipt \|/);
  assert.match(record, /ดู ภาคผนวก: ผล review ใน proposal\.md/);
});

test("the active packet holds no verification.md before the archive command", () => {
  const land = fixture();
  land.run();
  assert.equal(land.activeHadFile(), false);
  assert.ok(existsSync(land.file()));
});

test("delivery integrity binds the archived verification.md", () => {
  const land = fixture();
  land.run();
  const entry = land.state.deliveryIntegrity.entries
    .find((row) => row.path === `${ARCHIVED}/${VERIFICATION_RECORD_FILE}`.replaceAll("\\", "/"));
  assert.ok(entry, "verification.md is an integrity entry");
  assert.equal(entry.identity, identity(land.file()));
});

function resumeRuntime(land) {
  return createApplyRuntime({
    root: land.root, loadRuntime: () => land.state, saveRuntime: () => {},
    changePath: (id) => join(land.root, "openspec", "changes", id),
    archivedChangeRelativePath: () => ARCHIVED,
    pathIdentity: (path) => existsSync(path) ? identity(path) : null,
    cleanupAppliedSandbox: () => ({ status: "removed" }),
    cleanupApplyTransaction: () => ({ status: "committed" }),
    cleanupChangeLeases: () => {}, now: () => "t", fail
  });
}

test("a resumed Land rewrites the same verification.md once", () => {
  const land = fixture();
  land.run();
  const once = land.record();
  // A crash after the write but before delivery integrity was bound.
  delete land.state.deliveryIntegrity;
  land.state.specSyncInputs = [];
  land.state.workspace.cleanup = { status: "removed" };
  quiet(() => resumeRuntime(land).archive(ID));
  assert.equal(land.record(), once);
  assert.ok(land.state.deliveryIntegrity.entries
    .some((row) => row.path.endsWith(`/${VERIFICATION_RECORD_FILE}`)));
});

test("a resumed Land stops on an edited verification.md and keeps it", () => {
  const land = fixture();
  land.run();
  delete land.state.deliveryIntegrity;
  land.state.specSyncInputs = [];
  land.state.workspace.cleanup = { status: "removed" };
  writeFileSync(land.file(), "edited by hand\n");
  assert.throws(() => quiet(() => resumeRuntime(land).archive(ID)),
    /archived verification\.md differs from the recorded proof summary/);
  assert.equal(readFileSync(land.file(), "utf8"), "edited by hand\n");
  assert.equal(land.state.deliveryIntegrity, undefined);
});

test("an interrupted archive recovery stops on an edited verification.md before the integrity check", () => {
  const land = fixture();
  land.run();
  // Archive moved and wrote the file, then the CLI disappeared before `archived` was recorded.
  land.state.status = "proven";
  land.state.land.status = "archive-prepared";
  delete land.state.deliveryIntegrity;
  writeFileSync(land.file(), "edited by hand\n");
  const runtime = createApplyRuntime({
    root: land.root, loadRuntime: () => land.state, saveRuntime: () => {},
    changePath: (id) => join(land.root, "openspec", "changes", id),
    archivedChangeRelativePath: () => ARCHIVED,
    pathIdentity: (path) => existsSync(path) ? identity(path) : null,
    cleanupChangeLeases: () => {}, now: () => "t", fail
  });
  assert.throws(() => quiet(() => runtime.archive(ID)),
    /archived verification\.md differs from the recorded proof summary/);
  assert.equal(readFileSync(land.file(), "utf8"), "edited by hand\n");
});

test("an interrupted archive recovery with the recorded file passes the integrity check", () => {
  const land = fixture();
  land.run();
  const once = land.record();
  land.state.status = "proven";
  land.state.land.status = "archive-prepared";
  delete land.state.deliveryIntegrity;
  const runtime = createApplyRuntime({
    root: land.root, loadRuntime: () => land.state, saveRuntime: () => {},
    changePath: (id) => join(land.root, "openspec", "changes", id),
    archivedChangeRelativePath: () => ARCHIVED,
    pathIdentity: (path) => existsSync(path) ? identity(path) : null,
    verifyAppliedProjection: () => ({ valid: true }),
    assertMultiRepositoryArchiveReady: () => {},
    pendingTasks: () => [],
    cleanupAppliedSandbox: () => ({ status: "removed" }),
    cleanupRepositorySandboxes: () => ({ status: "removed" }),
    cleanupApplyTransaction: () => ({ status: "committed" }),
    cleanupChangeLeases: () => {}, now: () => "t", fail
  });
  quiet(() => runtime.archive(ID));
  assert.equal(land.state.status, "archived");
  assert.equal(land.record(), once);
});

test("Land refuses a packet that already contains verification.md before any write", () => {
  const land = fixture({ packetFile: true });
  assert.throws(() => land.run(), /packet already contains verification\.md/);
  assert.equal(land.state.status, "proven");
  assert.equal(readFileSync(join(land.change, VERIFICATION_RECORD_FILE), "utf8"), "author notes\n");
  assert.equal(existsSync(join(land.root, ARCHIVED)), false);
  assert.equal(land.state.land, undefined);
});

test("Land refuses a sandbox packet that contains verification.md", () => {
  const land = fixture({ sandboxFile: true });
  assert.throws(() => land.run(), /packet already contains verification\.md/);
  assert.equal(existsSync(join(land.root, ARCHIVED)), false);
});

test("no proof run renders no verification record", () => {
  assert.equal(renderVerificationRecord({ proof: null }), "");
  assert.equal(renderVerificationRecord({ proof: {} }), "");
  assert.match(renderVerificationRecord({ proof: { proofRunId: "p", receipts: [] } }),
    /## Providers\n\nNone\./);
});
