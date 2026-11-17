import assert from "node:assert/strict";
import test from "node:test";
import http from "node:http";
import { createTeamServer } from "../server.ts";

async function room(t, overrides = {}) {
  const sent = [], stopped = [];
  const state = { roomId: "room-test", sessionName: "Team room", project: "test-project", model: "Test model",
    provider: "local-test", busy: false, queued: [], tools: [], messages: [], notice: "" };
  const server = createTeamServer({ host: "127.0.0.1", port: 0, token: "test-invite-code",
    getSnapshot: () => state, onMessage: async (message) => sent.push(message), onAbort: async (name) => stopped.push(name), ...overrides });
  const info = await server.start(); t.after(() => server.stop());
  const base = info.urls[0];
  async function request(path, body, cookie, extra = {}) {
    const response = await fetch(base + path, { method: body === undefined ? "GET" : "POST",
      headers: { ...(body === undefined ? {} : { "Content-Type": "application/json", Origin: base }),
        ...(cookie ? { Cookie: cookie } : {}), ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
    const value = await response.json(); return { response, value };
  }
  async function login(name = "Flame") {
    const { response, value } = await request("/api/login", { name, token: info.token });
    assert.equal(response.status, 200, JSON.stringify(value));
    return response.headers.get("set-cookie").split(";")[0];
  }
  return { server, info, base, state, sent, stopped, request, login };
}

test("only the join page and static assets are public; conversation, stream and invite require login", async (t) => {
  const r = await room(t);
  for (const path of ["/api/state", "/api/events", "/api/invite"]) {
    const result = await r.request(path); assert.equal(result.response.status, 401, path);
    assert.ok(!JSON.stringify(result.value).includes(r.state.project));
  }
  const index = await fetch(r.base);
  assert.equal(index.status, 200); assert.ok(!((await index.text()).includes(r.info.token)));
  assert.match(index.headers.get("content-security-policy"), /script-src 'self'/);
  assert.equal(index.headers.get("x-frame-options"), "DENY");
  assert.equal(index.headers.get("referrer-policy"), "no-referrer");
  const traversal = await fetch(r.base + "/%2e%2e/server.ts"); assert.equal(traversal.status, 401);
  const cookie = await r.login(); const state = await r.request("/api/state", undefined, cookie);
  assert.equal(state.value.project, "test-project"); assert.equal(state.value.member, "Flame");
  assert.equal(state.response.headers.get("cache-control"), "no-store");
});

test("login validates code and name, rejects cross-origin writes, and scopes an HttpOnly cookie to this room's port", async (t) => {
  const r = await room(t);
  assert.equal((await r.request("/api/login", { token: "wrong", name: "Member" })).response.status, 401);
  assert.equal((await r.request("/api/login", { token: r.info.token, name: "<Member>" })).response.status, 400);
  assert.equal((await r.request("/api/login", { token: r.info.token, name: "Member" }, null, { Origin: "http://example.invalid" })).response.status, 403);
  const response = await fetch(r.base + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: r.info.token, name: "Member" }) });
  assert.equal(response.status, 403);
  const result = await r.request("/api/login", { token: r.info.token, name: "สมาชิกทีม" });
  const cookie = result.response.headers.get("set-cookie");
  assert.match(cookie, new RegExp(`^pi_team_${r.info.port}=`));
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Max-Age=28800/);
});

test("DNS rebinding hosts are rejected even with a valid session cookie", async (t) => {
  const r = await room(t); const cookie = await r.login();
  const result = await new Promise((resolve, reject) => {
    const req = http.request(r.base + "/api/state", { headers: { Host: `example.invalid:${r.info.port}`, Cookie: cookie } }, (res) => {
      res.resume(); res.on("end", () => resolve(res.statusCode));
    }); req.on("error", reject); req.end();
  });
  assert.equal(result, 403);
});

test("chat dispatches with authenticated attribution; retry is idempotent and cannot be stolen by another member", async (t) => {
  const r = await room(t); const cookie = await r.login("ทีม A");
  const body = { id: "message-12345", text: "ช่วยสรุปโปรเจกต์" };
  assert.equal((await r.request("/api/messages", body, cookie)).response.status, 202);
  assert.deepEqual(r.sent, [{ ...body, name: "ทีม A" }]);
  r.state.queued = Array.from({ length: 8 }, (_, i) => ({ id: i, name: "Member" }));
  const retry = await r.request("/api/messages", body, cookie);
  assert.equal(retry.response.status, 202); assert.equal(retry.value.duplicate, true); assert.equal(r.sent.length, 1);
  assert.equal((await r.request("/api/messages", { id: "message-new-123", text: "next" }, cookie)).response.status, 429);
  const other = await r.login("ทีม B");
  assert.equal((await r.request("/api/messages", body, other)).response.status, 409);
  assert.equal((await r.request("/api/messages", { ...body, text: "changed" }, cookie)).response.status, 409);
});

test("invalid, oversized and slash-command messages never invoke Pi", async (t) => {
  const r = await room(t); const cookie = await r.login();
  for (const body of [{ id: ["message-12345"], text: "hello" }, { id: "message-12345", text: "" },
    { id: "message-12345", text: "/serve stop" }, { id: "message-12345", text: "a".repeat(16001) }])
    assert.equal((await r.request("/api/messages", body, cookie)).response.status, 400);
  const oversized = await r.request("/api/messages", { id: "message-12345", text: "a".repeat(40000) }, cookie);
  assert.equal(oversized.response.status, 413); assert.equal(r.sent.length, 0);
  const type = await fetch(r.base + "/api/messages", { method: "POST", headers: { Origin: r.base, Cookie: cookie, "Content-Type": "text/plain" }, body: "hello" });
  assert.equal(type.status, 415);
});

test("login and message rate limits are enforced server-side", async (t) => {
  const r = await room(t); const cookie = await r.login();
  for (let i = 0; i < 10; i++) assert.equal((await r.request("/api/messages", { id: `message-${i}-valid`, text: "test" }, cookie)).response.status, 202);
  assert.equal((await r.request("/api/messages", { id: "message-over-limit", text: "test" }, cookie)).response.status, 429);
  for (let i = 0; i < 9; i++) await r.request("/api/login", { token: "wrong", name: "Member" });
  assert.equal((await r.request("/api/login", { token: "wrong", name: "Member" })).response.status, 429);
});

test("SSE sends authenticated live snapshots and closes when the member logs out", async (t) => {
  const r = await room(t); const cookie = await r.login();
  const response = await fetch(r.base + "/api/events", { headers: { Cookie: cookie } });
  assert.equal(response.status, 200); assert.match(response.headers.get("content-type"), /text\/event-stream/);
  const reader = response.body.getReader(); const decoder = new TextDecoder();
  let first = decoder.decode((await reader.read()).value);
  while (!first.includes("event: state")) first += decoder.decode((await reader.read()).value);
  assert.match(first, /test-project/); assert.ok(!first.includes(r.info.token));
  r.state.messages = [{ id: "answer", role: "assistant", author: "Pi", text: "Live answer" }]; r.server.publish();
  let update = "";
  while (!update.includes("Live answer")) update += decoder.decode((await reader.read()).value);
  assert.match(update, /Live answer/);
  assert.equal((await r.request("/api/logout", {}, cookie)).response.status, 200);
  assert.equal((await r.request("/api/state", undefined, cookie)).response.status, 401);
  await reader.cancel();
});

test("member stop requests reach Pi, failed dispatch can be retried, and session expiry is enforced", async (t) => {
  let unavailable = true;
  const r = await room(t, { onMessage: async () => { if (unavailable) throw new Error("private provider details"); } });
  const cookie = await r.login("Flame");
  const body = { id: "retry-message", text: "hello" };
  const failure = await r.request("/api/messages", body, cookie);
  assert.equal(failure.response.status, 503); assert.ok(!JSON.stringify(failure.value).includes("private provider details"));
  unavailable = false; assert.equal((await r.request("/api/messages", body, cookie)).response.status, 202);
  assert.equal((await r.request("/api/abort", {}, cookie)).response.status, 200); assert.deepEqual(r.stopped, ["Flame"]);
  const now = Date.now;
  try {
    Date.now = () => now() + 9 * 60 * 60 * 1000;
    assert.equal((await r.request("/api/state", undefined, cookie)).response.status, 401);
  } finally { Date.now = now; }
});

async function invite(r, cookie, role = "viewer", hours = 24) {
  const result = await r.request("/api/access", { action: "create", role, hours }, cookie);
  assert.equal(result.response.status, 200, JSON.stringify(result.value));
  return { ...result.value, code: new URL(result.value.url).hash.slice(1) };
}
async function loginWith(r, code, name) {
  const result = await r.request("/api/login", { token: code, name });
  return { ...result, cookie: result.response.headers.get("set-cookie")?.split(";")[0] };
}

test("wrong or expired access codes explain how to recover", async (t) => {
  const r = await room(t);
  const wrong = await r.request("/api/login", { token: "wrong", name: "Newbie" });
  assert.equal(wrong.response.status, 401);
  assert.equal(wrong.value.error, "Access code is invalid or expired. Ask the host for a new invite.");
  const cookie = await r.login(); const now = Date.now;
  try {
    Date.now = () => now() + 9 * 60 * 60 * 1000;
    const ended = await r.request("/api/state", undefined, cookie);
    assert.equal(ended.response.status, 401); assert.equal(ended.value.error, "Your access ended. Sign in again.");
  } finally { Date.now = now; }
});

test("viewer invites can read but every state-changing request except logout is refused", async (t) => {
  let api = 0;
  const r = await room(t, { onApi: async () => { api++; return { ok: true }; } });
  const owner = await r.login("Owner");
  const ownerState = await r.request("/api/state", undefined, owner);
  assert.equal(ownerState.value.role, "member");
  const created = await invite(r, owner, "viewer", 24);
  assert.equal(created.role, "viewer"); assert.ok(created.expires > Date.now() + 23 * 3600000);
  const viewer = await loginWith(r, created.code, "PM");
  assert.equal(viewer.response.status, 200); assert.equal(viewer.value.role, "viewer");
  const state = await r.request("/api/state", undefined, viewer.cookie);
  assert.equal(state.response.status, 200); assert.equal(state.value.role, "viewer");
  assert.equal((await r.request("/api/sessions/" + "a".repeat(32) + "/state", undefined, viewer.cookie)).response.status, 200);
  const before = api;
  for (const path of ["/api/sessions/" + "a".repeat(32) + "/commit", "/api/sessions/" + "a".repeat(32) + "/save", "/api/tasks", "/api/messages", "/api/abort", "/api/access"]) {
    const denied = await r.request(path, { action: "create", role: "viewer", hours: 1, message: "x" }, viewer.cookie);
    assert.equal(denied.response.status, 403, path); assert.equal(denied.value.error, "Read-only access.");
  }
  assert.equal(api, before); assert.equal(r.sent.length, 0); assert.equal(r.stopped.length, 0);
  assert.equal((await r.request("/api/invite", undefined, viewer.cookie)).response.status, 403);
  assert.equal((await r.request("/api/access", undefined, viewer.cookie)).response.status, 403);
  assert.equal((await r.request("/api/sessions/" + "a".repeat(32) + "/commit", { message: "ok" }, owner)).response.status, 200);
  assert.equal((await r.request("/api/logout", {}, viewer.cookie)).response.status, 200);
});

test("invites validate role and lifetime, expire, and revocation ends their sessions", async (t) => {
  const r = await room(t); const owner = await r.login("Owner");
  for (const body of [{ action: "create", role: "admin", hours: 24 }, { action: "create", role: "viewer", hours: 5 }, { action: "create", role: "viewer" }, { action: "nope" }])
    assert.equal((await r.request("/api/access", body, owner)).response.status, 400, JSON.stringify(body));
  const member = await invite(r, owner, "member", 1);
  const guest = await loginWith(r, member.code, "Guest");
  assert.equal(guest.value.role, "member");
  const listed = await r.request("/api/access", undefined, owner);
  assert.deepEqual(listed.value.invites.map((i) => [i.id, i.role]), [[member.id, "member"]]);
  assert.ok(!JSON.stringify(listed.value).includes(member.code));
  assert.ok(listed.value.members.some((m) => m.name === "Guest" && m.role === "member"));
  assert.equal((await r.request("/api/access", { action: "revoke", id: member.id }, owner)).response.status, 200);
  assert.equal((await r.request("/api/state", undefined, guest.cookie)).response.status, 401);
  assert.equal((await loginWith(r, member.code, "Again")).response.status, 401);
  assert.equal((await r.request("/api/access", { action: "revoke", id: member.id }, owner)).response.status, 404);
  assert.equal((await r.request("/api/state", undefined, owner)).response.status, 200, "the main /serve code is not revoked");
  const short = await invite(r, owner, "viewer", 1); const now = Date.now;
  try {
    Date.now = () => now() + 2 * 3600000;
    const expired = await loginWith(r, short.code, "Late");
    assert.equal(expired.response.status, 401); assert.match(expired.value.error, /invalid or expired/);
  } finally { Date.now = now; }
});

test("state-changing requests are audited without secrets, including refusals", async (t) => {
  const r = await room(t, { onApi: async () => ({ ok: true }) });
  const owner = await r.login("Ann");
  await r.request("/api/sessions/" + "b".repeat(32) + "/commit", { message: "secret commit text" }, owner);
  const created = await invite(r, owner, "viewer", 24);
  const viewer = await loginWith(r, created.code, "Bo");
  await r.request("/api/sessions/" + "b".repeat(32) + "/save", { path: "README.md", text: "x" }, viewer.cookie);
  const { value } = await r.request("/api/access", undefined, owner);
  const rows = value.audit.map((e) => [e.name, e.role, e.action, e.status]);
  assert.deepEqual(rows.find((row) => row[2] === "commit"), ["Ann", "member", "commit", 200]);
  assert.deepEqual(rows.find((row) => row[2] === "save"), ["Bo", "viewer", "save", 403]);
  assert.ok(rows.some((row) => row[2] === "invite-create:viewer"));
  const text = JSON.stringify(value.audit);
  assert.ok(!text.includes(created.code)); assert.ok(!text.includes("secret commit text")); assert.ok(!text.includes(r.info.token));
  assert.ok(value.audit.every((e) => Number.isFinite(e.at)));
});
