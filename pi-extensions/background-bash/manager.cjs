const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');

function directory(root, id) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid job ID');
  return path.join(root, id);
}
function read(root, id) {
  const dir = directory(root, id);
  const job = JSON.parse(fs.readFileSync(path.join(dir, 'job.json'), 'utf8'));
  let state = { status: 'starting' };
  try { state = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (state.status === 'running') {
    try { process.kill(state.workerPid, 0); }
    catch (error) { if (error.code === 'ESRCH') state.status = 'interrupted'; }
  }
  if (state.status === 'starting' && Date.now() - job.createdAt > 10000) state.status = 'interrupted';
  return { ...job, ...state, notify: job.notify || fs.existsSync(path.join(dir, 'background')),
    notified: fs.existsSync(path.join(dir, 'notified')), logPath: path.join(dir, 'output.log') };
}
function list(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).filter(id => /^[a-f0-9-]{36}$/.test(id))
    .map(id => read(root, id)).sort((a, b) => b.createdAt - a.createdAt);
}
async function start(root, options) {
  if (!options.command?.trim()) throw new Error('Command cannot be empty');
  if (!fs.statSync(options.cwd).isDirectory()) throw new Error('cwd must be a directory');
  const id = randomUUID(), dir = directory(root, id);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  // Environment may contain credentials: inherit it through spawn, never persist it.
  const { env, ...metadata } = options;
  const job = { ...metadata, id, createdAt: Date.now() };
  fs.writeFileSync(path.join(dir, 'job.json'), JSON.stringify(job), { mode: 0o600 });
  const fd = fs.openSync(path.join(dir, 'supervisor.log'), 'a', 0o600);
  const worker = spawn(process.execPath, [path.join(__dirname, 'worker.cjs'), dir], {
    detached: true, stdio: ['ignore', fd, fd], env: env ?? process.env,
  });
  fs.closeSync(fd);
  await new Promise((resolve, reject) => {
    worker.once('spawn', resolve);
    worker.once('error', reject);
  });
  worker.unref();
  return read(root, id);
}
function tail(root, id, count = 80) {
  const job = read(root, id);
  if (!fs.existsSync(job.logPath)) return '';
  const fd = fs.openSync(job.logPath, 'r');
  try {
    const size = fs.fstatSync(fd).size, length = Math.min(size, 32768);
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, size - length);
    return buffer.toString('utf8').split('\n').slice(-Math.min(500, Math.max(1, count))).join('\n');
  } finally { fs.closeSync(fd); }
}
function stop(root, id) {
  const job = read(root, id);
  if (['running', 'starting'].includes(job.status)) {
    fs.writeFileSync(path.join(directory(root, id), 'stop'), '', { mode: 0o600 });
    return { ...job, status: 'stop_requested' };
  }
  return job;
}
function acknowledge(root, id) {
  fs.writeFileSync(path.join(directory(root, id), 'notified'), '', { mode: 0o600 });
}
function promote(root, id) {
  fs.writeFileSync(path.join(directory(root, id), 'background'), '', { mode: 0o600 });
}
module.exports = { start, read, list, tail, stop, acknowledge, promote };
