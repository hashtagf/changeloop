// Scripted stand-in for `pi --mode rpc`: no model is called. FAKE_PI_MODE
// selects the script; FAKE_PI_RECORD receives argv, env and agent-dir contents.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const mode = process.env.FAKE_PI_MODE || "session";
if (process.env.FAKE_PI_RECORD) {
  const agent = process.env.PI_CODING_AGENT_DIR;
  writeFileSync(process.env.FAKE_PI_RECORD, JSON.stringify({ argv: process.argv.slice(2), agent,
    files: readdirSync(agent).sort(), auth: JSON.parse(readFileSync(join(agent, "auth.json"), "utf8")),
    foundationEnv: Object.keys(process.env).filter((key) => /^(FOUNDATION_|PI_TEAM_|CLAUDE_PROJECT_DIR)/.test(key)) }));
}
const emit = (event) => process.stdout.write(`${JSON.stringify(event)}\n`);
const usage = (cost) => ({ input: 10, output: 5, cacheRead: 2, cacheWrite: 1, totalTokens: 18,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: cost } });
const assistant = (content, cost) => ({ role: "assistant", model: "fake-model", content, usage: usage(cost), stopReason: "stop" });

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
  for (let index = input.indexOf("\n"); index >= 0; index = input.indexOf("\n")) {
    const command = JSON.parse(input.slice(0, index));
    input = input.slice(index + 1);
    handle(command);
  }
});
function handle(command) {
  // The turn starts only after the dialog is answered as cancelled.
  if (command.type === "extension_ui_response") { if (command.id === "d1" && command.cancelled) turn(); return; }
  if (command.type !== "prompt") return;
  // An extension command answers before its own turn starts, as /dev does.
  emit({ type: "response", command: "prompt", success: true, id: command.id });
  if (mode === "dialog") emit({ type: "extension_ui_request", id: "d1", method: "select", title: "Pick", options: ["a"] });
  else turn();
}
function turn() {
  setTimeout(() => {
    emit({ type: "agent_start" });
    emit({ type: "message_end", message: assistant([{ type: "thinking", thinking: "hidden" },
      { type: "toolCall", id: "call-1", name: "read", arguments: { path: "a.txt" } }], 0.25) });
    if (mode === "hang") return;
    emit({ type: "tool_execution_end", toolCallId: "call-1", toolName: "read",
      result: { content: [{ type: "text", text: "file body" }] }, isError: false });
    emit({ type: "message_end", message: assistant([{ type: "text", text: "done" }], mode === "budget" ? 5 : 0.5) });
    emit({ type: "turn_end" });
    emit({ type: "agent_end", messages: [] });
    if (mode === "budget") return;
    emit({ type: "agent_settled", aborted: false });
  }, 20);
}
process.on("SIGTERM", () => process.exit(143));
