const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const jobs = require('./manager.cjs');
const { createJobMonitor } = require('./monitor.ts');

async function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-job-monitor-'));
  let now = 1000;
  const monitor = createJobMonitor(root, () => now);
  const add = (state = {}, notify = false) => {
    const id = randomUUID(), dir = path.join(root, id); fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'job.json'), JSON.stringify({ id, command: 'fixture', notify, createdAt: Date.now() }));
    fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify({ status: 'completed', exitCode: 0, finishedAt: Date.now(), ...state }));
    return id;
  };
  try { await run({ root, monitor, add, advance: () => { now += 30001; } }); }
  finally { monitor.close(); fs.rmSync(root, { recursive: true, force: true }); }
}
const settle = () => new Promise(resolve => setTimeout(resolve, 150));

test('finished history is cached; active jobs stay live', () => fixture(async f => {
  for (let i = 0; i < 1000; i++) f.add();
  f.add({ status: 'running', workerPid: process.pid, finishedAt: null });
  assert.equal(f.monitor.read().length, 1001);
  await settle(); f.monitor.read();
  const original = fs.readFileSync; let reads = 0;
  fs.readFileSync = function(...args) { reads++; return original.apply(this, args); };
  try {
    const before = performance.now();
    for (let i = 0; i < 5; i++) jobs.list(f.root);
    const legacy = { reads, milliseconds: performance.now() - before };
    reads = 0; const after = performance.now();
    for (let i = 0; i < 5; i++) f.monitor.read();
    const optimized = { reads, milliseconds: performance.now() - after };
    assert.equal(optimized.reads, 10, 'Only the live job is reopened');
    console.log(JSON.stringify({ fixture: '1000 finished jobs, 1 running job, 5 polls', legacy, optimized }));
  } finally { fs.readFileSync = original; }
}));

test('watcher detects new jobs, completion, late promotion and acknowledgements', () => fixture(async f => {
  const id = f.add({ status: 'running', workerPid: process.pid, finishedAt: null });
  f.monitor.read();
  // In-place writes also invalidate the cache, not only atomic renames.
  fs.writeFileSync(path.join(f.root, id, 'state.json'), JSON.stringify({ status: 'completed', exitCode: 0, finishedAt: 100 }));
  await settle();
  assert.equal(f.monitor.read()[0].status, 'completed');
  jobs.promote(f.root, id); await settle();
  assert.equal(f.monitor.read()[0].notify, true);
  jobs.acknowledge(f.root, id); await settle();
  assert.equal(f.monitor.read()[0].notified, true);
  const next = f.add(); await settle();
  assert.ok(f.monitor.read().some(job => job.id === next));
  fs.rmSync(path.join(f.root, next), { recursive: true }); await settle();
  assert.equal(f.monitor.read().length, 1);
}));

test('periodic reconciliation recovers missed events and partial job creation', () => fixture(async f => {
  assert.deepEqual(f.monitor.read(), []);
  const id = randomUUID(), dir = path.join(f.root, id); fs.mkdirSync(dir);
  f.advance(); assert.deepEqual(f.monitor.read(), []);
  fs.writeFileSync(path.join(dir, 'job.json'), JSON.stringify({ id, command: 'fixture', createdAt: Date.now() }));
  assert.equal(f.monitor.read()[0].status, 'starting');
  fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify({ status: 'completed', finishedAt: 100, exitCode: 0 }));
  assert.equal(f.monitor.read()[0].status, 'completed');
  const added = f.add(); f.advance();
  assert.ok(f.monitor.read().some(job => job.id === added));
  f.monitor.close(); assert.deepEqual(f.monitor.read(), []);
}));
