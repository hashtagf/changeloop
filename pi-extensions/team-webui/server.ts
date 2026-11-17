import http from "node:http";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { networkInterfaces, hostname } from "node:os";

const ASSETS = new Map<any, any>([
  ["/", ["text/html; charset=utf-8", "index.html"]],
  ["/app.js", ["text/javascript; charset=utf-8", "app.js"]],
  ["/render.js", ["text/javascript; charset=utf-8", "render.js"]],
  ["/render.css", ["text/css; charset=utf-8", "render.css"]],
  ["/vendor/markdown.js", ["text/javascript; charset=utf-8", "vendor/markdown.js"]],
  ["/vendor/mermaid.js", ["text/javascript; charset=utf-8", "vendor/mermaid.js"]],
  ["/tasks.js", ["text/javascript; charset=utf-8", "tasks.js"]],
  ["/tasks.css", ["text/css; charset=utf-8", "tasks.css"]],
  ["/navigation.js", ["text/javascript; charset=utf-8", "navigation.js"]],
  ["/ui-helpers.js", ["text/javascript; charset=utf-8", "ui-helpers.js"]],
  ["/i18n.js", ["text/javascript; charset=utf-8", "i18n.js"]],
  ["/city.js", ["text/javascript; charset=utf-8", "city.js"]],
  ["/city-scene.js", ["text/javascript; charset=utf-8", "city-scene.js"]],
  ["/city-state.js", ["text/javascript; charset=utf-8", "city-state.js"]],
  ["/vendor/three.module.js", ["text/javascript; charset=utf-8", "vendor/three.module.js"]],
  ["/vendor/three.core.js", ["text/javascript; charset=utf-8", "vendor/three.core.js"]],
  ["/style.css", ["text/css; charset=utf-8", "style.css"]],
  ["/favicon.svg", ["image/svg+xml", "favicon.svg"]],
].map(([path, [type, file]]) => [path, { type, url: new URL(`./web/${file}`, import.meta.url) }]));
const SESSION_MS = 8 * 60 * 60 * 1000;
const hash = (value) => createHash("sha256").update(value).digest();
const equal = (left, right) => timingSafeEqual(hash(left), hash(right));
const ID = /^[a-zA-Z0-9_-]{8,80}$/;
const fail = (status, message) => Object.assign(new Error(message), { status });
// Extra invites and the audit trail live only in hub memory; /serve stop clears them.
export const INVITE_ROLES = ["viewer", "member"];
export const INVITE_HOURS = [1, 24, 168];
const MAX_INVITES = 32, AUDIT_LIMIT = 500;
const INVALID_CODE = "Access code is invalid or expired. Ask the host for a new invite.";
const READ_ONLY = "Read-only access.";
/** Short, secret-free label for a state-changing request path. */
export function auditAction(pathname) {
  const session = pathname.match(/^\/api\/sessions\/[a-f0-9]{32}\/([a-z-]+)$/);
  if (session) return session[1];
  return pathname.replace(/^\/api\//, "").replace(/\//g, ":") || "request";
}

export function addresses() {
  return [...new Set(Object.values(networkInterfaces()).flat().filter((item) =>
    item && item.family === "IPv4" && !item.internal && !item.address.startsWith("169.254."))
    .map((item) => item.address))];
}

export async function jsonBody(req, limit = 32768) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] || ""))
    throw fail(415, "Use application/json.");
  let size = 0, large = false;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) { large = true; chunks.length = 0; }
    if (!large) chunks.push(chunk);
  }
  if (large) throw fail(413, "Message is too large.");
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw fail(400, "Invalid JSON object."); }
}

export function createTeamServer({ getSnapshot, onMessage, onAbort, onApi,
  host = "127.0.0.1", port = 4318, token = randomBytes(24).toString("base64url") }) {
  if (!["127.0.0.1", "0.0.0.0"].includes(host)) throw new Error("Choose localhost or --lan.");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid port.");
  const sessions = new Map<any, any>(), attempts = new Map<any, any>(), receipts = new Map<any, any>(), clients = new Set<any>();
  const invites = new Map<any, any>(), audit: any[] = [];
  const pruneInvites = () => { for (const [id, invite] of invites) if (invite.expires < Date.now()) invites.delete(id); };
  const record = (entry) => { audit.push(entry); if (audit.length > AUDIT_LIMIT) audit.splice(0, audit.length - AUDIT_LIMIT); };
  const endSessions = (match) => {
    for (const [id, session] of sessions) if (match(session)) {
      sessions.delete(id);
      for (const client of clients) if (client.sessionId === id) client.res.end();
    }
  };
  const allowedNames = new Set(["localhost", "127.0.0.1", ...addresses(), hostname().toLowerCase()]);
  let actualPort, updateTimer, heartbeat, cleanupTimer, stopped = false;
  const cookieName = () => `pi_team_${actualPort}`;
  const headers = {
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' blob: data: https: http:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  };
  const cookie = (value, age = SESSION_MS / 1000) =>
    `${cookieName()}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}`;
  const respond = (res, code, body, extra: any = {}) => {
    if (res.writableEnded || res.destroyed) return;
    res.writeHead(code, { ...headers, "Content-Type": "application/json; charset=utf-8", ...extra });
    res.end(JSON.stringify(body));
  };
  const origin = (req) => {
    let url;
    try { url = new URL(`http://${req.headers.host}`); } catch { throw fail(403, "Invalid host."); }
    const localAddress = req.socket.localAddress?.replace(/^::ffff:/, "");
    if (url.username || url.password || url.pathname !== "/" ||
        (!allowedNames.has(url.hostname.toLowerCase()) && url.hostname !== localAddress) ||
        Number(url.port || 80) !== actualPort) throw fail(403, "Host is not allowed.");
    if (req.headers.origin && req.headers.origin !== url.origin) throw fail(403, "Cross-origin requests are not allowed.");
    if (req.method === "POST" && req.headers.origin !== url.origin)
      throw fail(403, "A same-origin browser request is required.");
    return url.origin;
  };
  const authenticate = (req) => {
    const value = (req.headers.cookie || "").split(";").map((s) => s.trim())
      .find((s) => s.startsWith(`${cookieName()}=`))?.slice(cookieName().length + 1);
    const session = value && sessions.get(value);
    if (!session || session.expires < Date.now()) throw fail(401, "Your access ended. Sign in again.");
    return { id: value, ...session, role: session.role || "member" };
  };
  const snapshot = () => ({ ...getSnapshot(), connections: clients.size });
  const sendState = (res) => {
    if (res.writableLength > 256 * 1024) { res.end(); return; }
    res.write(`event: state\ndata: ${JSON.stringify(snapshot())}\n\n`);
  };
  const flush = () => { updateTimer = undefined; for (const client of clients) sendState(client.res); };
  const publish = () => { if (!stopped && !updateTimer) updateTimer = setTimeout(flush, 60); };
  const server = http.createServer(async (req, res) => {
    let pending;
    try {
      const base = origin(req);
      const url = new URL(req.url || "/", base);
      if (url.origin !== base) throw fail(403, "Invalid URL.");
      if (req.method === "GET" && ASSETS.has(url.pathname)) {
        const asset = ASSETS.get(url.pathname);
        res.writeHead(200, { ...headers, "Content-Type": asset.type }); res.end(readFileSync(asset.url)); return;
      }
      if (req.method === "GET" && url.pathname === "/health") { respond(res, 200, { status: "ok", service:'pi-workspace', instance: hash(token).toString('hex').slice(0,16) }); return; }
      if (req.method === "POST" && url.pathname === "/api/login") {
        const ip = req.socket.remoteAddress;
        const recent = (attempts.get(ip) || []).filter((at) => Date.now() - at < 60000);
        if (recent.length >= 10) throw fail(429, "Too many attempts. Try again in a minute.");
        recent.push(Date.now()); attempts.set(ip, recent);
        if (attempts.size > 1024) attempts.delete(attempts.keys().next().value);
        const body = await jsonBody(req);
        if (typeof body.token !== "string" || body.token.length > 128) throw fail(401, INVALID_CODE);
        pruneInvites();
        let role = "member", inviteId = null;
        if (!equal(body.token, token)) {
          const invite = [...invites.values()].find((item) => equal(body.token, item.code));
          if (!invite) throw fail(401, INVALID_CODE);
          role = invite.role; inviteId = invite.id;
        }
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name || [...name].length > 40 || /[\p{C}<>]/u.test(name)) throw fail(400, "Enter a name of 1–40 characters.");
        for (const [id, session] of sessions) if (session.expires < Date.now()) sessions.delete(id);
        if (sessions.size >= 64) throw fail(429, "This room has reached its member limit.");
        const id = randomBytes(24).toString("base64url");
        const invite = inviteId && invites.get(inviteId);
        sessions.set(id, { name, role, inviteId, expires: Math.min(Date.now() + SESSION_MS, invite?.expires ?? Infinity), messages: [], aborts: [] });
        respond(res, 200, { name, role }, { "Set-Cookie": cookie(id) }); return;
      }
      const member = authenticate(req);
      if (req.method === "POST") {
        pending = { at: Date.now(), name: member.name, role: member.role, action: auditAction(url.pathname) };
        if (member.role === "viewer" && url.pathname !== "/api/logout") throw fail(403, READ_ONLY);
      }
      if (url.pathname === "/api/access") {
        if (member.role !== "member") throw fail(403, READ_ONLY);
        pruneInvites();
        if (req.method === "GET") {
          respond(res, 200, {
            role: member.role,
            invites: [...invites.values()].map(({ code, ...item }) => item),
            members: [...sessions.values()].filter((s) => s.expires >= Date.now()).map((s) => ({ name: s.name, role: s.role || "member", expires: s.expires })),
            audit: audit.slice(-100).reverse(),
          }); return;
        }
        if (req.method !== "POST") throw fail(405, "Use GET or POST.");
        const body = await jsonBody(req);
        if (body.action === "create") {
          if (!INVITE_ROLES.includes(body.role) || !INVITE_HOURS.includes(body.hours)) throw fail(400, "Choose role viewer or member and 1, 24 or 168 hours.");
          if (invites.size >= MAX_INVITES) throw fail(429, "Revoke an invite before creating another.");
          const item = { id: randomBytes(8).toString("hex"), code: randomBytes(24).toString("base64url"), role: body.role,
            createdAt: Date.now(), expires: Date.now() + body.hours * 3600000, createdBy: member.name };
          invites.set(item.id, item); pending.action = "invite-create:" + item.role;
          const { code, ...visible } = item;
          respond(res, 200, { ...visible, url: `${base}/#${code}` }); return;
        }
        if (body.action === "revoke") {
          if (typeof body.id !== "string" || !invites.has(body.id)) throw fail(404, "Invite not found.");
          invites.delete(body.id); pending.action = "invite-revoke";
          endSessions((session) => session.inviteId === body.id);
          respond(res, 200, { ok: true }); publish(); return;
        }
        throw fail(400, "Use create or revoke.");
      }
      if (onApi && (url.pathname.startsWith('/api/session') || url.pathname === '/api/tasks' || url.pathname === '/api/tasks/projects' || url.pathname === '/api/city')) {
        if(req.method === 'POST') {
          const record = sessions.get(member.id), now = Date.now();
          record.actions = (record.actions || []).filter(at => now-at < 60000);
          if(record.actions.length >= 60) throw fail(429,'Too many actions. Try again in a minute.');
          record.actions.push(now);
        }
        const result = await onApi(req, url, member);
        if(result?.binary) {
          res.writeHead(200,{...headers,'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(result.name)});
          res.end(result.binary); return;
        }
        respond(res, result?.status || 200, result?.body ?? result); publish(); return;
      }
      if (req.method === "POST" && url.pathname === "/api/logout") {
        sessions.delete(member.id);
        for (const client of clients) if (client.sessionId === member.id) client.res.end();
        respond(res, 200, { ok: true }, { "Set-Cookie": cookie("", 0) }); return;
      }
      if (req.method === "GET" && url.pathname === "/api/state") {
        respond(res, 200, { ...snapshot(), member: member.name, role: member.role }); return;
      }
      if (req.method === "GET" && url.pathname === "/api/invite") {
        if (member.role !== "member") throw fail(403, READ_ONLY);
        respond(res, 200, { url: `${base}/#${token}` }); return;
      }
      if (req.method === "GET" && url.pathname === "/api/events") {
        if (clients.size >= 32) throw fail(429, "This room has reached its live connection limit.");
        res.writeHead(200, { ...headers, "Content-Type": "text/event-stream", "X-Accel-Buffering": "no", "Connection": "keep-alive" });
        res.write("retry: 2000\n\n"); req.setTimeout(0);
        const client = { res, sessionId: member.id, expires: member.expires };
        clients.add(client); sendState(res); publish();
        res.on("close", () => { clients.delete(client); publish(); }); return;
      }
      if (req.method === "POST" && url.pathname === "/api/messages") {
        const body = await jsonBody(req);
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (typeof body.id !== "string" || !ID.test(body.id) || !text || text.length > 16000) throw fail(400, "Enter a message of 1–16,000 characters.");
        // Remote chat never dispatches terminal extension commands such as
        // /serve or /land. Normal requests go through Pi's ordinary agent loop.
        if (text.startsWith("/")) throw fail(400, "Use a plain-language message. Slash commands belong in the Pi terminal.");
        const prior = receipts.get(body.id);
        const digest = hash(text).toString("hex");
        if (prior) {
          if (prior.sessionId !== member.id || prior.digest !== digest) throw fail(409, "Message id was already used.");
          respond(res, 202, { id: body.id, accepted: true, duplicate: true }); return;
        }
        const record = sessions.get(member.id);
        record.messages = record.messages.filter((at) => Date.now() - at < 60000);
        if (record.messages.length >= 10) throw fail(429, "Send up to 10 messages per minute.");
        if (getSnapshot().queued.length >= 8) throw fail(429, "The message queue is full. Wait for Pi to catch up.");
        if (receipts.size >= 2048) throw fail(429, "The room is busy. Try again shortly.");
        receipts.set(body.id, { sessionId: member.id, digest, at: Date.now() });
        record.messages.push(Date.now());
        try { await onMessage({ id: body.id, name: member.name, text }); }
        catch { receipts.delete(body.id); throw fail(503, "Pi could not accept this message. You can retry it."); }
        respond(res, 202, { id: body.id, accepted: true }); publish(); return;
      }
      if (req.method === "POST" && url.pathname === "/api/abort") {
        const record = sessions.get(member.id);
        record.aborts = record.aborts.filter((at) => Date.now() - at < 10000);
        if (record.aborts.length >= 3) throw fail(429, "Wait before stopping again.");
        record.aborts.push(Date.now());
        await onAbort(member.name); respond(res, 200, { ok: true }); publish(); return;
      }
      throw fail(404, "Not found.");
    } catch (error) { respond(res, error.status || 500, { error: error.status ? error.message : "The room could not complete this request." }); }
    finally { if (pending) record({ ...pending, status: res.statusCode }); }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return {
    publish,
    async start() {
      await new Promise<void>((resolve, reject) => {
        const error = (e) => { server.off("listening", listening); reject(e); };
        const listening = () => { server.off("error", error); resolve(); };
        server.once("error", error); server.once("listening", listening); server.listen(port, host);
      });
      actualPort = (server.address() as any).port;
      heartbeat = setInterval(() => {
        for (const client of clients) {
          if (client.expires < Date.now() || !sessions.has(client.sessionId)) client.res.end();
          else client.res.write(": keepalive\n\n");
        }
      }, 15000); heartbeat.unref();
      cleanupTimer = setInterval(() => {
        for (const [id, session] of sessions) if (session.expires < Date.now()) sessions.delete(id);
        pruneInvites();
        for (const [id, receipt] of receipts) if (Date.now() - receipt.at > 15 * 60000) receipts.delete(id);
        for (const [ip, times] of attempts) if (Date.now() - times.at(-1) > 60000) attempts.delete(ip);
      }, 60000); cleanupTimer.unref();
      const urls = [`http://127.0.0.1:${actualPort}`, ...(host === "0.0.0.0" ? addresses().map((ip) => `http://${ip}:${actualPort}`) : [])];
      return { port: actualPort, host, urls, token, inviteUrls: urls.map((url) => `${url}/#${token}`) };
    },
    async stop() {
      stopped = true; clearTimeout(updateTimer); clearInterval(heartbeat); clearInterval(cleanupTimer);
      for (const client of clients) client.res.end();
      clients.clear(); sessions.clear(); receipts.clear(); attempts.clear(); invites.clear(); audit.length = 0;
      await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
    },
  };
}
