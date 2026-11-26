import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  SPEC_REVIEW_LENSES, createPromptReviewer, createSpecReviewRuntime, forbiddenSpecReviewSessions,
  readSpecReview, specReviewPrompt, specReviewers
} from "../runtime/workflow/change/spec-review.mjs";

function promptReviewer(sessionId, spawned = []) {
  return createPromptReviewer({
    foundationPolicy: () => POLICY, reviewerStatus: () => ({ ok: true }),
    fail: (message) => { throw new Error(message); }, uuid: () => "requested-session", env: {},
    spawn: (command, args) => {
      spawned.push(args);
      return { status: 0, stdout: JSON.stringify({ type: "result", subtype: "success",
        session_id: sessionId, structured_output: { summary: "ok", findings: [] } }) };
    }
  });
}

const HERE = dirname(fileURLToPath(import.meta.url));
const ID = "add-tag-filter";

const REVIEWER = {
  adapter: "claude-cli", executable: "claude", providerFamily: "anthropic",
  modelFamily: "claude", modelId: "opus", reasoningEffort: "high",
  sandbox: "read-only", ephemeral: true
};
const POLICY = {
  models: { standard: { family: "sonnet" }, fast: { family: "haiku" } },
  review: { defaultReviewer: "claude-opus", fallbackReviewers: ["main-session"],
    reviewers: { "claude-opus": REVIEWER } }
};

function fixture(t, { status = "planned", policy = POLICY, routing = { tier: "medium",
  triggers: ["medium-impact-or-coupling"] }, installed = () => true, environment = {},
runPromptReview } = {}) {
  const root = mkdtempSync(join(tmpdir(), "spec-review-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const runtimeDir = join(root, ".foundation", "runtime");
  const reviewsDir = join(root, ".foundation", "spec-reviews");
  mkdirSync(runtimeDir, { recursive: true });
  writeFileSync(join(runtimeDir, `${ID}.json`), JSON.stringify({ status }));
  const packet = join(root, "openspec", "changes", ID);
  mkdirSync(join(packet, "specs", "search"), { recursive: true });
  writeFileSync(join(packet, "proposal.md"), "## Why\n\nUsers cannot filter by tag.\n");
  writeFileSync(join(packet, "specs", "search", "spec.md"),
    "### Requirement: tag filter\n\nThe system SHALL filter by tag.\n");
  mkdirSync(join(root, ".foundation", "drafts", ID), { recursive: true });
  writeFileSync(join(root, ".foundation", "drafts", ID, "change.json"),
    JSON.stringify({ intent: "SECRET-CONVERSATION-CONTEXT" }));
  const calls = [];
  const runtime = createSpecReviewRuntime({
    root, reviewsDir, runtimeDir,
    loadRuntime: (id) => JSON.parse(readFileSync(join(runtimeDir, `${id}.json`), "utf8")),
    activeChangePath: (id) => join(root, "openspec", "changes", id),
    foundationPolicy: () => policy,
    reviewPolicy: () => routing,
    reviewerInstalled: installed,
    environment,
    now: () => "2026-11-25T00:00:00.000Z",
    fail: (message) => { throw new Error(message); },
    runPromptReview: (request) => {
      calls.push(request);
      return (runPromptReview || (() => ({ ok: true, reviewer: request.reviewer, model: "sonnet",
        modelTier: request.modelTier, sessionId: `session-${calls.length}`,
        output: { summary: "ok", findings: [] } })))(request, calls.length);
    },
    log: () => {}
  });
  return { root, reviewsDir, runtime, calls, packet };
}

test("an on-demand review runs three lenses against the current packet and binds its digest", (t) => {
  const value = fixture(t);
  const result = value.runtime.runSpecReview(ID);
  assert.deepEqual(result.record.lenses.map((row) => row.lens),
    ["comprehension", "implementation-readiness", "zoom-out"]);
  assert.equal(value.calls.length, 3);
  assert.match(result.record.packetDigest, /^sha256:[0-9a-f]{64}$/);
  assert.deepEqual(result.record.files, [
    `openspec/changes/${ID}/proposal.md`, `openspec/changes/${ID}/specs/search/spec.md`]);
  assert.deepEqual(readSpecReview(value.reviewsDir, ID), result.record);
  assert.equal(result.summary.status, "current");
});

test("change start never runs a spec review: no intake module imports it", () => {
  for (const file of ["change-start.mjs", "change-lifecycle.mjs", "change-materialize.mjs"]) {
    const source = readFileSync(join(HERE, "..", "runtime", "workflow", "change", file), "utf8");
    assert.doesNotMatch(source, /spec-review\.mjs|runSpecReview|SpecReview/, file);
  }
});

test("an unknown change fails naming the id without spawning a reviewer", (t) => {
  const value = fixture(t);
  assert.throws(() => value.runtime.runSpecReview("missing-change"), /unknown change 'missing-change'/);
  assert.equal(value.calls.length, 0);
});

test("a change that entered Land is refused without spawning a reviewer", (t) => {
  for (const status of ["applied", "archived"]) {
    const value = fixture(t, { status });
    assert.throws(() => value.runtime.runSpecReview(ID), /already entered Land/);
    assert.equal(value.calls.length, 0, status);
  }
});

test("each lens runs in its own fresh session", (t) => {
  const value = fixture(t);
  const sessions = value.runtime.runSpecReview(ID).record.lenses.map((row) => row.sessionId);
  assert.equal(new Set(sessions).size, 3);
  assert.equal(sessions.every(Boolean), true);
});

test("the prompt carries only the lens, its criteria, and packet paths", (t) => {
  const value = fixture(t);
  value.runtime.runSpecReview(ID);
  for (const [index, call] of value.calls.entries()) {
    const lens = SPEC_REVIEW_LENSES[index];
    assert.match(call.prompt, new RegExp(lens.title.replace(/[()]/g, "\\$&")));
    assert.match(call.prompt, new RegExp(`openspec/changes/${ID}/proposal\\.md`));
    assert.doesNotMatch(call.prompt, /SECRET-CONVERSATION-CONTEXT|\.foundation\/drafts/);
    assert.doesNotMatch(call.prompt, /Users cannot filter by tag/, "file contents are not inlined");
  }
  assert.equal(specReviewPrompt(SPEC_REVIEW_LENSES[0], []).includes("no conversation history"), true);
});

test("a medium change reviews on the standard model class through the configured reviewer", (t) => {
  const value = fixture(t);
  value.runtime.runSpecReview(ID);
  assert.deepEqual(value.calls.map((call) => call.modelTier), ["standard", "standard", "standard"]);

  // The real reviewer runtime turns that class into the standard model alias.
  const spawned = [];
  const result = promptReviewer("fresh-1", spawned)({ reviewer: "claude-opus", modelTier: "standard",
    workspace: value.root, prompt: "PROMPT", schema: { type: "object" } });
  assert.equal(result.ok, true);
  assert.equal(result.sessionId, "fresh-1");
  assert.equal(result.modelTier, "standard");
  const args = spawned.at(-1);
  assert.equal(args[args.indexOf("--model") + 1], "sonnet");
  assert.equal(args.includes("--no-session-persistence"), true);
  assert.equal(args[args.indexOf("--tools") + 1], "Read,Glob,Grep");
  assert.equal(args[args.indexOf("--json-schema") + 1], JSON.stringify({ type: "object" }));
  assert.equal(args.at(-1), "PROMPT");
});

test("a codex reviewer runs read-only and ephemeral with the spec schema and its own thread", (t) => {
  const value = fixture(t);
  const policy = { review: { defaultReviewer: "codex", reviewers: { codex: { ...REVIEWER,
    adapter: "codex-cli", executable: "codex", providerFamily: "openai", modelId: "gpt" } } } };
  const calls = [];
  const run = createPromptReviewer({ foundationPolicy: () => policy, reviewerStatus: () => ({ ok: true }),
    fail: (message) => { throw new Error(message); }, env: {},
    spawn: (command, args, options) => {
      calls.push({ args, options, schema: readFileSync(args[args.indexOf("--output-schema") + 1], "utf8") });
      writeFileSync(args[args.indexOf("-o") + 1], JSON.stringify({ summary: "s", findings: [] }));
      return { status: 0, stdout: `${JSON.stringify({ type: "thread.started", thread_id: "t-1" })}\n` };
    } });
  const result = run({ reviewer: "codex", workspace: value.root, prompt: "P", schema: { type: "object" } });
  assert.deepEqual([result.ok, result.sessionId, result.output.summary], [true, "t-1", "s"]);
  const [{ args, options, schema }] = calls;
  assert.equal(args[args.indexOf("-s") + 1], "read-only");
  assert.equal(args.includes("--ephemeral"), true);
  assert.equal(options.input, "P");
  assert.equal(schema, JSON.stringify({ type: "object" }));
});

test("a reviewer that reuses the calling session is not-run, not counted", (t) => {
  const value = fixture(t, { environment: { FOUNDATION_CLAUDE_SESSION_ID: "host-session" },
    runPromptReview: () => ({ ok: true, sessionId: "HOST-SESSION",
      output: { summary: "ok", findings: [] } }) });
  const lenses = value.runtime.runSpecReview(ID).record.lenses;
  assert.equal(lenses.every((row) => row.status === "not-run"), true);
  assert.match(lenses[0].reason, /reused the calling session/);
  assert.deepEqual(forbiddenSpecReviewSessions({ FOUNDATION_CLAUDE_SESSION_ID: "a", CODEX_THREAD_ID: "b" }),
    ["a", "b"]);
  // The reviewer runtime refuses the same reuse itself.
  const reused = promptReviewer("host-session")({ reviewer: "claude-opus", workspace: value.root,
    prompt: "P", schema: {}, forbiddenSessionIds: ["host-session"] });
  assert.equal(reused.ok, false);
  assert.match(reused.detail, /reused the calling session/);
});

test("one failure then success completes the lens on its retry", (t) => {
  const seen = new Map();
  const value = fixture(t, { runPromptReview: (request, count) => {
    const lens = request.prompt.split("\n")[0];
    const attempt = (seen.get(lens) || 0) + 1;
    seen.set(lens, attempt);
    return attempt === 1 ? { ok: false, detail: "timeout" }
      : { ok: true, sessionId: `s-${count}`, output: { summary: "", findings: [] } };
  } });
  const lenses = value.runtime.runSpecReview(ID).record.lenses;
  assert.equal(lenses.every((row) => row.status === "completed" && row.attempts === 2), true);
  assert.equal(value.calls.length, 6);
});

test("two failures leave the lens not-run with its reason and no pass", (t) => {
  const value = fixture(t, { runPromptReview: (request) =>
    request.prompt.includes("Zoom out") ? { ok: false, detail: "rate limited" }
      : { ok: true, sessionId: `s-${Math.random()}`, output: { summary: "", findings: [] } } });
  const result = value.runtime.runSpecReview(ID);
  const zoom = result.record.lenses.find((row) => row.lens === "zoom-out");
  assert.equal(zoom.status, "not-run");
  assert.equal(zoom.attempts, 2);
  assert.match(zoom.reason, /rate limited; rate limited/);
  assert.deepEqual(result.summary.notRun, ["zoom-out"]);
  // Malformed output is a failure, never zero findings.
  const malformed = fixture(t, { runPromptReview: () =>
    ({ ok: true, sessionId: `s-${Math.random()}`, output: { findings: "none" } }) });
  assert.equal(malformed.runtime.runSpecReview(ID).record.lenses
    .every((row) => row.status === "not-run"), true);
});

test("without an installed configured reviewer every lens is not-run and main-session is never used", (t) => {
  const value = fixture(t, { installed: () => false });
  const lenses = value.runtime.runSpecReview(ID).record.lenses;
  assert.equal(value.calls.length, 0);
  assert.equal(lenses.every((row) => row.status === "not-run"), true);
  assert.match(lenses[0].reason, /main-session is never used/);
  assert.deepEqual(specReviewers(POLICY), ["claude-opus"]);
  assert.deepEqual(specReviewers({ review: { defaultReviewer: "main-session",
    fallbackReviewers: ["main-session"] } }), []);
});
