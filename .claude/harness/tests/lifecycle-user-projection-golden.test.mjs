// Golden: what the user sees for each lifecycle state. A reviewer reads this
// file to know the exact projection an envelope produces; a change to any
// projection fails here and must update the expectation deliberately.
import assert from "node:assert/strict";
import test from "node:test";

import {
  lifecycleOutcome, lifecycleUserProjection, validateLifecycleOutcome
} from "../runtime/core/lifecycle-outcome.mjs";

const decision = {
  kind: "scope", summary: "Keep the export button on the dashboard?",
  options: [
    { id: "keep", outcome: "The button stays on the dashboard." },
    { id: "move", outcome: "The button moves to settings." },
    { id: "pause", outcome: "Work pauses until you decide." }
  ],
  recommended: "keep"
};

const CASES = [
  ["working (agent edit)", { protocol: 7, action: "EDIT", actor: "agent", reason: "Build task T1 is ready." },
    { state: "WORKING", summary: "Build task T1 is ready." }],
  ["working (multi-repository)", { protocol: 7, action: "WORKING", actor: "harness",
    repositories: [{ id: "api", status: "applied" }, { repository: "web", status: "pending" }] },
  { state: "WORKING", summary: "Work is continuing.",
    repositories: [{ id: "api", status: "applied" }, { id: "web", status: "pending" }] }],
  ["target reached", { protocol: 7, action: "DONE", actor: "harness", reached: "proven" },
    { state: "TARGET_REACHED", summary: "The requested target is reached; the change is not yet delivered.",
      reached: "proven", delivered: false }],
  ["delivered", { protocol: 7, action: "DONE", actor: "harness", reached: "archived" },
    { state: "DELIVERED", summary: "The change is delivered and archived.", reached: "archived", delivered: true }],
  ["needs decision", { protocol: 7, action: "ASK_USER", actor: "user", decision },
    { state: "NEEDS_DECISION", summary: "A work decision is required.", decision: {
      kind: "scope", summary: "Keep the export button on the dashboard?",
      options: decision.options, recommended: "keep" } }],
  ["Land authority", { protocol: 5, action: "ASK_USER", actor: "user", boundary: "land-authority",
    reason: "Land needs your explicit instruction." },
  { state: "NEEDS_DECISION", summary: "Land needs your explicit instruction.", decision: {
    kind: "land-authority", summary: "Land needs your explicit instruction.", options: [] } }],
  ["waiting external", { protocol: 7, action: "WAIT", actor: "external-authority",
    wait: { owner: "ci", condition: "the signed CI run finishes", checkCommand: "cloop advance c" } },
  { state: "WAITING_EXTERNAL", summary: "An external dependency is pending.",
    owner: "ci", condition: "the signed CI run finishes" }],
  ["paused", { protocol: 7, action: "WAIT", actor: "harness", paused: true, reason: "Paused by the user.",
    wait: { owner: "user", condition: "the user resumes", checkCommand: "cloop advance c" } },
  { state: "PAUSED", summary: "Paused by the user.", owner: "user", condition: "the user resumes" }]
];

for (const [name, envelope, expected] of CASES)
  test(`user projection: ${name}`, () => {
    assert.deepEqual(lifecycleUserProjection(lifecycleOutcome(envelope)), expected);
  });

test("envelopes that would mislead the user are rejected", () => {
  const reject = (value, pattern) => assert.throws(() => validateLifecycleOutcome(value), pattern);
  reject({ action: "ASK_USER", owner: "user", decision: { kind: "machine-state" } },
    /must not be delegated to the user/);
  reject({ action: "ASK_USER", owner: "user", protocol: 7,
    decision: { ...decision, options: decision.options.filter((row) => row.id !== "pause") } },
  /alternatives, pause, and a recommendation/);
  reject({ action: "WAIT", owner: "external", protocol: 7, wait: { owner: "ci" } },
    /named owner, condition, and checking route/);
  reject({ action: "REPAIR", owner: "agent" }, /actionable 'command' or 'instruction'/);
  reject({ action: "DONE", owner: "agent" }, /belong to the harness/);
});
