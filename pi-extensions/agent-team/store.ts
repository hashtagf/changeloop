import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const ACTIVE = new Set(['starting', 'working', 'idle', 'waiting', 'stopping']);
function dir(root, id) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new Error('Invalid agent ID');
  return path.join(root, 'members', id);
}
function ensure(location) { fs.mkdirSync(location, { recursive: true, mode: 0o700 }); }
function read(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
function atomic(file, data) {
  ensure(path.dirname(file));
  const temporary = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(data), { mode: 0o600 });
  fs.renameSync(temporary, file);
}
function alive(pid) {
  if (!Number.isInteger(pid) || pid < 1) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
}
function sessionId(id) { return `s-${createHash('sha256').update(id).digest('hex').slice(0, 24)}`; }
function member(root, id) {
  const location = dir(root, id), meta = read(path.join(location, 'meta.json'));
  if (!meta) throw new Error(`Unknown agent/session: ${id}. Use agent_list.`);
  const presence = read(path.join(location, 'presence.json'), {});
  const processState = read(path.join(location, 'process.json'), {});
  const online = presence.status !== 'offline' && Date.now() - (presence.lastSeen ?? 0) < 15000 && alive(presence.pid);
  let status = online ? presence.status : 'offline';
  if (meta.kind === 'managed') {
    if (['stopped', 'failed', 'exited'].includes(processState.status)) status = processState.status;
    else if (!online && ['starting', 'running', 'stopping'].includes(processState.status) && alive(processState.workerPid)) {
      status = processState.status === 'stopping' ? 'stopping' : 'starting';
    } else if (!online && !processState.status && Date.now() - meta.createdAt < 30000) status = 'starting';
    else if (!online && processState.status && !alive(processState.workerPid)) status = 'interrupted';
  }
  return { ...meta, ...presence, status, online, process: processState,
    result: read(path.join(location, 'result.json')), logPath: path.join(location, 'rpc.log') };
}
function list(root) {
  const members = path.join(root, 'members');
  if (!fs.existsSync(members)) return [];
  return fs.readdirSync(members).filter(id => /^[a-zA-Z0-9_-]{1,100}$/.test(id))
    .filter(id => fs.existsSync(path.join(members, id, 'meta.json')))
    .map(id => member(root, id)).sort((a, b) => b.createdAt - a.createdAt);
}
function resolve(root, target, self) {
  if (target === 'self') return member(root, self);
  if (target === 'parent') {
    const parent = member(root, self).parentId;
    if (!parent) throw new Error('This session has no parent agent');
    return member(root, parent);
  }
  const all = list(root);
  const exact = all.find(item => item.id === target || item.sessionId === target);
  if (exact) return exact;
  const names = all.filter(item => item.name === target);
  if (names.length !== 1) throw new Error(names.length ? 'Ambiguous name; use the agent ID' : `Unknown agent/session: ${target}. Use agent_list.`);
  return names[0];
}
function register(root, identity) {
  const location = dir(root, identity.id), existing = read(path.join(location, 'meta.json'));
  if (!existing) atomic(path.join(location, 'meta.json'), {
    id: identity.id, name: identity.name || identity.id, kind: 'session', createdAt: Date.now(),
  });
  heartbeat(root, identity.id, identity);
  return member(root, identity.id);
}
function heartbeat(root, id, presence) {
  atomic(path.join(dir(root, id), 'presence.json'), { ...presence, id, pid: process.pid, lastSeen: Date.now() });
}
function send(root, from, to, message, { delivery = 'followUp', type = 'message', details } = {}) {
  member(root, from);
  const recipient = member(root, to);
  if (recipient.kind === 'managed' && ['stopped', 'failed', 'exited', 'interrupted'].includes(recipient.status)) {
    throw new Error('Recipient worker has stopped; spawn a new worker');
  }
  const maxBytes = type === 'result' ? 16 * 1024 * 1024 : 65536;
  if (typeof message !== 'string' || !message.trim() || Buffer.byteLength(message) > maxBytes) throw new Error(`Message must contain 1–${maxBytes} bytes`);
  if (!['followUp', 'steer'].includes(delivery)) throw new Error('Invalid delivery mode');
  const id = `${Date.now()}-${randomUUID()}`;
  const envelope = { id, from, to, message, delivery, type, details, createdAt: Date.now() };
  atomic(path.join(dir(root, to), 'inbox', `${id}.json`), envelope);
  return { id, to, status: member(root, to).online ? 'queued' : 'queued_offline' };
}
function inbox(root, id, { unreadOnly = false, limit = 30, filter = () => true } = {}) {
  const location = dir(root, id), folder = path.join(location, 'inbox');
  if (!fs.existsSync(folder)) return [];
  const all = fs.readdirSync(folder).filter(file => /^\d+-[a-f0-9-]+\.json$/.test(file)).sort();
  // Delivered history is immutable and irrelevant to an unread poll. Read the
  // receipt directory once, rather than reopening every message and receipt.
  let delivered;
  if (unreadOnly) {
    try { delivered = new Set(fs.readdirSync(path.join(location, 'receipts'))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; delivered = new Set(); }
  }
  const result = [];
  for (const file of unreadOnly ? all : all.reverse()) {
    if (delivered?.has(file)) continue;
    const message = read(path.join(folder, file));
    if (!filter(message)) continue;
    const receipt = read(path.join(location, 'receipts', file));
    if (!unreadOnly || !receipt) result.push({ ...message, deliveredAt: receipt?.deliveredAt });
    if (result.length >= Math.max(1, Math.min(limit, 100))) break;
  }
  return result;
}
function deliver(root, id, handler, { filter = () => true } = {}) {
  const lock = path.join(dir(root, id), 'delivery.lock');
  try { fs.mkdirSync(lock, { mode: 0o700 }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // A crashed receiver can leave a lock; no normal synchronous delivery takes a minute.
    if (Date.now() - fs.statSync(lock).mtimeMs > 60000) fs.rmSync(lock, { recursive: true, force: true });
    return;
  }
  try {
    for (const message of inbox(root, id, { unreadOnly: true, limit: 10, filter })) {
      handler(message);
      atomic(path.join(dir(root, id), 'receipts', `${message.id}.json`), { deliveredAt: Date.now() });
    }
  } finally { fs.rmSync(lock, { recursive: true, force: true }); }
}
// Hold the same receipt lock as direct delivery; acknowledge only after injection.
function deliverBatch(root, id, select, handler) {
  const lock = path.join(dir(root, id), 'delivery.lock');
  try { fs.mkdirSync(lock, { mode: 0o700 }); }
  catch (error) { if (error.code === 'EEXIST') return 0; throw error; }
  try {
    const messages = select(inbox(root, id, { unreadOnly: true, limit: 100 }));
    if (!messages.length) return 0;
    handler(messages);
    for (const message of messages) atomic(path.join(dir(root, id), 'receipts', `${message.id}.json`), { deliveredAt: Date.now() });
    return messages.length;
  } finally { fs.rmSync(lock, { recursive: true, force: true }); }
}
function saveResult(root, id, result) { atomic(path.join(dir(root, id), 'result.json'), result); }
async function acquireSpawnLock(root, signal) {
  const lock = path.join(root, 'spawn.lock'), deadline = Date.now() + 30000;
  for (;;) {
    if (signal?.aborted) throw new Error('Cancelled before spawning');
    try { fs.mkdirSync(lock, { mode: 0o700 }); return lock; }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    try {
      if (Date.now() - fs.statSync(lock).mtimeMs > 30000) {
        fs.rmSync(lock, { recursive: true, force: true });
        continue;
      }
    } catch (error) {
      if (error.code === 'ENOENT') continue; // Its owner released it meanwhile.
      throw error;
    }
    if (Date.now() >= deadline) throw new Error('Timed out waiting for the agent spawn lock after 30 seconds');
    // Yield so the current spawn can finish, including within the same Pi process.
    await delay(25 + Math.floor(Math.random() * 25), undefined, { signal });
  }
}
async function spawnAgent(root, options) {
  if (!options.task?.trim() || Buffer.byteLength(options.task) > 65536) throw new Error('Task must contain 1–65536 bytes');
  if (!fs.statSync(options.cwd).isDirectory()) throw new Error('cwd must be a directory');
  const parent = member(root, options.parentId);
  let depth = 1, ancestor = parent;
  const seen = new Set();
  while (ancestor.parentId) {
    if (seen.has(ancestor.id)) throw new Error('Parent cycle');
    seen.add(ancestor.id); depth++;
    ancestor = member(root, ancestor.parentId);
  }
  if (depth > 3) throw new Error('Maximum nested agent depth is 3');
  ensure(root);
  const lock = await acquireSpawnLock(root, options.signal);
  let worker, location;
  try {
    if (options.signal?.aborted) throw new Error('Cancelled before spawning');
    const active = list(root).filter(item => item.kind === 'managed' && ACTIVE.has(item.status));
    if (options.admit) options.admit(active);
    else if (active.length >= 64) throw new Error('Maximum 64 active managed agents');
    const id = `a-${randomUUID()}`;
    location = dir(root, id);
    const { env, launch, signal, admit, ...metadata } = options;
    atomic(path.join(location, 'meta.json'), { ...metadata, id, kind: 'managed', depth,
      name: options.name || `agent-${id.slice(2, 10)}`, createdAt: Date.now(),
      launch, initialSessionId: randomUUID(),
    });
    const fd = fs.openSync(path.join(location, 'supervisor.log'), 'a', 0o600);
    const childEnv = { ...(env ?? process.env), PI_TEAM_AGENT_ID: id, PI_TEAM_PARENT_ID: options.parentId, PI_TEAM_ROOT: root };
    // Child agents must not claim the parent's terminal status/prefill channel.
    for (const key of Object.keys(childEnv)) if (key.startsWith('ORCA_')) delete childEnv[key];
    try {
      worker = spawn(process.execPath, [path.join(__dirname, 'worker.cjs'), root, id], {
        cwd: options.cwd, detached: true, stdio: ['ignore', fd, fd], env: childEnv,
      });
    } finally { fs.closeSync(fd); }
    await new Promise((yes, no) => { worker.once('spawn', yes); worker.once('error', no); });
    worker.unref();
    return member(root, id);
  } catch (error) {
    if (location) atomic(path.join(location, 'process.json'), { status: 'failed', error: error.message, finishedAt: Date.now() });
    throw error;
  } finally { fs.rmSync(lock, { recursive: true, force: true }); }
}
function stop(root, id, includeChildren = true) {
  const target = member(root, id);
  if (target.kind !== 'managed') throw new Error('Only managed agents can be stopped. Other Pi sessions can receive messages.');
  const targets = new Set([id]);
  if (includeChildren) {
    let added;
    do {
      added = false;
      for (const item of list(root)) if (targets.has(item.parentId) && !targets.has(item.id)) { targets.add(item.id); added = true; }
    } while (added);
  }
  for (const targetId of targets) atomic(path.join(dir(root, targetId), 'stop.json'), { requestedAt: Date.now() });
  return { status: 'stop_requested', ids: [...targets] };
}
export { dir, ensure, read, atomic, alive, sessionId, member, list, resolve, register,
  heartbeat, send, inbox, deliver, deliverBatch, saveResult, spawnAgent, stop };
