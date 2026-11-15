const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('./store.cjs');

async function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-spawn-test-'));
  store.register(root, { id: 'parent', status: 'idle' });
  const options = { parentId: 'parent', task: 'local test only', cwd: root,
    launch: { command: process.execPath, args: [path.join(__dirname, 'test/crash.cjs')] } };
  try { await run(root, options); }
  finally {
    const deadline = Date.now() + 8000;
    while (store.list(root).some(item => item.kind === 'managed' &&
      (!item.process.finishedAt || store.alive(item.process.workerPid)))) {
      if (Date.now() > deadline) throw new Error('Test supervisors did not exit');
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('concurrent spawn requests each create exactly one worker', () => fixture(async (root, options) => {
  const results = await Promise.allSettled(Array.from({ length: 8 }, (_, i) =>
    store.spawnAgent(root, { ...options, name: `parallel-${i}` })));
  assert.deepEqual(results.filter(result => result.status === 'rejected').map(result => result.reason.message), []);
  assert.equal(new Set(results.map(result => result.value.id)).size, 8);
  assert.equal(store.list(root).filter(item => item.kind === 'managed').length, 8);
  assert.equal(fs.existsSync(path.join(root, 'spawn.lock')), false);
}));

test('a stale spawn lock is recovered within the same request', () => fixture(async (root, options) => {
  const lock = path.join(root, 'spawn.lock');
  fs.mkdirSync(lock);
  const old = new Date(Date.now() - 60000);
  fs.utimesSync(lock, old, old);
  const child = await store.spawnAgent(root, options);
  assert.equal(child.kind, 'managed');
  assert.equal(fs.existsSync(lock), false);
}));

test('separate session processes wait for the same shared spawn lock', () => fixture(async (root, options) => {
  const execFile = require('node:util').promisify(require('node:child_process').execFile);
  const script = `const store = require(process.argv[1]);
    store.spawnAgent(process.argv[2], JSON.parse(process.argv[3]))
      .then(child => console.log(child.id)).catch(error => { console.error(error); process.exitCode = 1; });`;
  const lock = path.join(root, 'spawn.lock');
  fs.mkdirSync(lock);
  const requests = Array.from({ length: 4 }, (_, i) => execFile(process.execPath,
    ['-e', script, path.join(__dirname, 'store.cjs'), root, JSON.stringify({ ...options, name: `session-${i}` })]));
  setTimeout(() => fs.rmSync(lock, { recursive: true, force: true }), 500);
  const results = await Promise.allSettled(requests);
  assert.deepEqual(results.filter(result => result.status === 'rejected').map(result => result.reason.message), []);
  assert.equal(new Set(results.map(result => result.value.stdout.trim())).size, 4);
  assert.equal(store.list(root).filter(item => item.kind === 'managed').length, 4);
}));

test('cancelled queued spawn creates no worker and preserves the held lock', () => fixture(async (root, options) => {
  const lock = path.join(root, 'spawn.lock');
  fs.mkdirSync(lock);
  const controller = new AbortController();
  const request = store.spawnAgent(root, { ...options, signal: controller.signal });
  setTimeout(() => controller.abort(), 20);
  await assert.rejects(request, /abort|cancel/i);
  assert.equal(store.list(root).filter(item => item.kind === 'managed').length, 0);
  assert.equal(fs.existsSync(lock), true);
}));
