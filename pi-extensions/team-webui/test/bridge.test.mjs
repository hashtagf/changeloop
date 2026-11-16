import assert from "node:assert/strict";
import test from "node:test";
import { createBridge, projectMessage } from "../bridge.ts";

const context = (entries = []) => ({ cwd: "/workspace/team-project", model: { id: "test-model", provider: "test" },
  isIdle: () => true, abort: async () => {}, sessionManager: { getBranch: () => entries,
    getSessionId: () => "pi-room-123", getSessionName: () => "Team room" } });

test("history contains only user and assistant text; hidden reasoning, tool inputs, and outputs stay private", () => {
  const b = createBridge({ sendUserMessage() {} });
  b.attach(context([
    { id: "user", type: "message", message: { role: "user", content: "hello", timestamp: 1 } },
    { id: "assistant", type: "message", message: { role: "assistant", timestamp: 2, content: [
      { type: "thinking", thinking: "private reasoning" }, { type: "toolCall", arguments: { secret: "tool argument" } }, { type: "text", text: "public answer" }] } },
    { id: "tool", type: "message", message: { role: "toolResult", content: [{ type: "text", text: "private tool result" }], timestamp: 3 } },
    { id: "custom", type: "custom", data: "private state" },
  ]));
  const state = b.snapshot();
  assert.equal(state.messages.length, 2); assert.equal(state.messages[1].text, "public answer");
  assert.ok(!JSON.stringify(state).includes("private")); assert.ok(!JSON.stringify(state).includes("tool argument"));
});

test("web messages use Pi's follow-up queue and are attributed without dispatching slash commands", async () => {
  const calls = []; const b = createBridge({ sendUserMessage: (...args) => calls.push(args) }); const ctx = context();
  b.attach(ctx);
  await b.send({ id: "request-12345", name: "สมาชิกทีม", text: "hello" });
  assert.equal(calls.length, 1); assert.deepEqual(calls[0][1], { deliverAs: "followUp" });
  assert.equal(calls[0][1].expandPromptTemplates, undefined); assert.equal(b.snapshot().queued.length, 1);
  b.event("message_start", { message: { role: "user", content: calls[0][0], timestamp: 1 } }, ctx);
  const state = b.snapshot(); assert.equal(state.queued.length, 0);
  assert.equal(state.messages[0].author, "สมาชิกทีม"); assert.equal(state.messages[0].text, "hello");
  assert.equal(state.messages[0].requestId, "request-12345");
});

test("streaming updates replace one assistant bubble and final settle follows Pi rather than a tool's success", () => {
  const b = createBridge({ sendUserMessage() {} }); const ctx = context(); b.attach(ctx);
  b.event("agent_start", {}, ctx); assert.equal(b.snapshot().busy, true);
  b.event("message_start", { message: { role: "assistant", content: [], timestamp: 2 } }, ctx);
  b.event("message_update", { message: { role: "assistant", content: [{ type: "text", text: "one" }], timestamp: 2 } }, ctx);
  b.event("message_update", { message: { role: "assistant", content: [{ type: "text", text: "one two" }], timestamp: 2 } }, ctx);
  b.event("tool_execution_start", { toolCallId: "t", toolName: "bash", args: { command: "private" } }, ctx);
  assert.equal(b.snapshot().tools[0].name, "bash"); assert.ok(!JSON.stringify(b.snapshot()).includes("private"));
  b.event("tool_execution_end", { toolCallId: "t" }, ctx);
  assert.equal(b.snapshot().busy, true); assert.equal(b.snapshot().tools.length, 0);
  b.event("message_end", { message: { role: "assistant", content: [{ type: "text", text: "one two" }], timestamp: 2 } }, ctx);
  assert.equal(b.snapshot().messages.length, 1); assert.equal(b.snapshot().messages[0].streaming, false);
  b.event("agent_settled", {}, ctx); assert.equal(b.snapshot().busy, false);
});

test("retention is bounded and context replacement clears the previous room", () => {
  const b = createBridge({ sendUserMessage() {} }); const ctx = context(); b.attach(ctx);
  for (let i = 0; i < 300; i++) b.event("message_end", { message: { role: "user", content: "x".repeat(5000), timestamp: i } }, ctx);
  const state = b.snapshot(); assert.ok(state.messages.length <= 120);
  assert.ok(state.messages.reduce((n, row) => n + row.text.length, 0) <= 131072);
  assert.equal(projectMessage({ role: "assistant", content: [{ type: "text", text: "x".repeat(40000) }] }, "x").truncated, true);
  b.attach(context()); assert.equal(b.snapshot().messages.length, 0); assert.equal(b.snapshot().queued.length, 0);
});

test("abort uses the current Pi context and reports provider errors without leaking raw error details", async () => {
  let aborted = false; const ctx = { ...context(), abort: async () => { aborted = true; } };
  const b = createBridge({ sendUserMessage() {} }); b.attach(ctx); await b.abort("Flame"); assert.equal(aborted, true);
  b.event("message_end", { message: { role: "assistant", timestamp: 1, content: [], stopReason: "error", errorMessage: "private-key=secret" } }, ctx);
  assert.match(b.snapshot().notice, /could not finish/); assert.ok(!JSON.stringify(b.snapshot()).includes("private-key"));
});
