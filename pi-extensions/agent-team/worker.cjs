// Detached RPC supervisor. Keeps managed Pi alive while idle and across parent reloads.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { homedir } = require('node:os');
const store = require('./store.cjs');
const [root, id] = process.argv.slice(2);
const location = store.dir(root, id), meta = store.read(path.join(location, 'meta.json'));
const log = fs.openSync(path.join(location, 'rpc.log'), 'a', 0o600);
let logBytes = 0, ending = false, stopped = false, timer, forceTimer, startupTimer;
let lastError, fatal = false, stderrTail = '';
function record(text) {
  const buffer = Buffer.from(text);
  if (logBytes >= 10 * 1024 * 1024) return;
  const part = buffer.subarray(0, 10 * 1024 * 1024 - logBytes);
  fs.writeSync(log, part); logBytes += part.length;
}
const state = { status: 'starting', workerPid: process.pid, startedAt: Date.now() };
const save = () => store.atomic(path.join(location, 'process.json'), state);
save();
const args = [...meta.launch.args, '--mode', 'rpc', '--session-id', meta.initialSessionId,
  '--session-dir', path.join(location, 'sessions'), '--name', meta.name];
if (meta.provider && meta.model) args.push('--provider', meta.provider, '--model', meta.model);
if (meta.thinking) args.push('--thinking', meta.thinking);
if (Array.isArray(meta.excludeTools) && meta.excludeTools.length) args.push('--exclude-tools', meta.excludeTools.join(','));
if (meta.appendSystemPrompt) args.push('--append-system-prompt', meta.appendSystemPrompt);
process.env.PI_TEAM_SUPERVISOR_PID = String(process.pid);
const child = spawn(meta.launch.command, args, { cwd: meta.cwd, env: process.env,
  detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
state.piPid = child.pid; save();
const send = command => {
  if (!child.stdin.destroyed && child.stdin.writable) child.stdin.write(JSON.stringify(command) + '\n');
};
const dialogs = require('./dialogs.ts').createDialogRelay(root, id, send);
function stopSessionJobs() {
  const presence = store.read(path.join(location, 'presence.json'));
  const sessionId = presence?.sessionId || state.sessionId || meta.initialSessionId;
  if (!sessionId) return;
  const { createHash } = require('node:crypto');
  const jobsRoot = path.join(homedir(), '.pi', 'agent', 'background-jobs', createHash('sha256').update(sessionId).digest('hex').slice(0, 24));
  try {
    const jobs = require('../background-bash/manager.cjs');
    for (const job of jobs.list(jobsRoot)) jobs.stop(jobsRoot, job.id);
  } catch (error) { record(`Background cleanup: ${error.message}\n`); }
}
function stop() {
  if (ending) return;
  ending = true; stopped = true;
  dialogs.close();
  state.status = 'stopping'; save();
  stopSessionJobs();
  send({ type: 'clear_queue', id: 'stop-clear' });
  send({ type: 'abort', id: 'stop-abort' });
  child.stdin.end();
  forceTimer = setTimeout(() => {
    try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') record(error.message); }
  }, 3000);
}
function failure(message) { lastError = message; fatal = true; record(`Supervisor error: ${message}\n`); stop(); }
let buffer = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', data => {
  record(data);
  buffer += data.toString('utf8');
  if (Buffer.byteLength(buffer) > 16 * 1024 * 1024) return failure('RPC record exceeds 16 MiB');
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline).replace(/\r$/, ''); buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let event;
    try { event = JSON.parse(line); }
    catch { record('Ignored non-JSON RPC output\n'); continue; }
    if (event.type === 'response' && event.id === 'ready') {
      if (!event.success) return failure(event.error || 'RPC startup failed');
      clearTimeout(startupTimer);
      state.status = 'running'; state.sessionId = event.data?.sessionId; save();
      if (ending || fs.existsSync(path.join(location, 'stop.json'))) return stop();
      send({ type: 'prompt', id: 'initial-task', message: meta.task });
    }
    if (event.type === 'response' && event.id === 'initial-task' && !event.success) failure(event.error || 'Task rejected');
    if (event.type === 'agent_end') dialogs.close();
    if (event.type === 'extension_ui_request' && ['select', 'confirm', 'input', 'editor'].includes(event.method)) {
      // Only an explicit response from the user's parent UI answers this request.
      try { dialogs.enqueue(event); }
      catch (error) { failure(`Cannot relay worker dialog: ${error.message}`); }
    }
  }
});
child.stderr.setEncoding('utf8');
child.stderr.on('data', data => { stderrTail = (stderrTail + data).slice(-3000); record(data); });
child.stdin.on('error', error => { if (!ending) failure(`RPC stdin: ${error.message}`); });
function finish(code, signal) {
  if (state.finishedAt) return;
  dialogs.close();
  clearInterval(timer); clearTimeout(forceTimer); clearTimeout(startupTimer);
  stopSessionJobs();
  state.status = fatal ? 'failed' : stopped ? 'stopped' : code === 0 ? 'exited' : 'failed';
  if (!lastError && !stopped && code !== 0) lastError = stderrTail.trim() || 'Pi exited unexpectedly';
  Object.assign(state, { exitCode: code, signal, error: lastError, finishedAt: Date.now() }); save();
  // Startup/crash failures must reach the parent even if the extension never loaded.
  if (!stopped || fatal) {
    try { store.send(root, id, meta.parentId, `Agent ${meta.name} (${id}) ${state.status}. ${lastError || `Exit code: ${code}, signal: ${signal || 'none'}`}`, { type: 'lifecycle' }); }
    catch (error) { record(error.message); }
  }
  fs.closeSync(log);
}
child.on('error', error => { lastError = error.message; fatal = true; finish(127, null); });
child.on('close', finish);
timer = setInterval(() => {
  if (fs.existsSync(path.join(location, 'stop.json'))) stop();
  if (!ending) {
    try { dialogs.poll(); } catch (error) { failure(`Worker dialog relay: ${error.message}`); }
  }
}, 250);
startupTimer = setTimeout(() => failure('Pi RPC did not become ready within 30 seconds'), 30000);
child.once('spawn', () => send({ type: 'get_state', id: 'ready' }));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
