// Independent supervisor: survives Pi exit/reload; only signals its own child group.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const dir = process.argv[2];
const job = JSON.parse(fs.readFileSync(path.join(dir, 'job.json'), 'utf8'));
const save = data => {
  fs.writeFileSync(path.join(dir, 'state.tmp'), JSON.stringify(data), { mode: 0o600 });
  fs.renameSync(path.join(dir, 'state.tmp'), path.join(dir, 'state.json'));
};
const state = { status: 'running', workerPid: process.pid, startedAt: Date.now() };
const fd = fs.openSync(path.join(dir, 'output.log'), 'a', 0o600);
let bytes = 0, stopping = false, finished = false, killTimer;
const cap = 10 * 1024 * 1024;
function output(chunk) {
  if (bytes >= cap) return;
  const part = chunk.subarray(0, cap - bytes);
  fs.writeSync(fd, part);
  bytes += part.length;
  if (bytes === cap) fs.writeSync(fd, '\n[log capped at 10 MiB; command continues]\n');
}
const child = spawn('/bin/bash', ['-c', job.command], {
  cwd: job.cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
});
state.pid = child.pid;
save(state);
child.stdout.on('data', output);
child.stderr.on('data', output);
function signalGroup(signal) {
  if (!child.pid) return;
  try { process.kill(-child.pid, signal); } catch (error) {
    if (error.code !== 'ESRCH') output(Buffer.from(`\n${error.message}\n`));
  }
}
function stop(reason) {
  if (stopping || finished) return;
  stopping = true;
  state.status = reason;
  signalGroup('SIGTERM');
  killTimer = setTimeout(() => { signalGroup('SIGKILL'); finalize(null, 'SIGKILL'); }, 1000);
}
function finalize(code, signal) {
  if (finished) return;
  finished = true;
  clearInterval(timer);
  clearTimeout(killTimer);
  // A command can leave descendants holding the output pipes open.
  child.stdout.destroy();
  child.stderr.destroy();
  save({ ...state, status: stopping ? state.status : 'completed', exitCode: code, signal, finishedAt: Date.now() });
  fs.closeSync(fd);
}
const timer = setInterval(() => {
  if (fs.existsSync(path.join(dir, 'stop'))) stop('stopped');
  if (job.timeoutSeconds && Date.now() - state.startedAt >= job.timeoutSeconds * 1000) stop('timed_out');
}, 200);
child.on('error', error => { output(Buffer.from(error.message)); finalize(127, null); });
child.on('exit', (code, signal) => {
  // Allow final pipe data to drain on normal completion. During stop, retain
  // the grace period so grandchildren that ignore TERM also receive KILL.
  if (stopping) return;
  const drain = setTimeout(() => finalize(code, signal), 200);
  child.once('close', () => { clearTimeout(drain); finalize(code, signal); });
});
process.on('SIGTERM', () => stop('stopped'));
process.on('SIGINT', () => stop('stopped'));
