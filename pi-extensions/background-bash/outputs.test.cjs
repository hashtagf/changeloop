const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { randomUUID } = require('node:crypto');
const jobs = require('./manager.cjs');
const { jobQuery } = require('./outputs.ts');
const { createNotifications, timerOnly } = require('./notifications.ts');
function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-job-output-'));
  function add(extra = {}, state = {}) {
    const id = randomUUID(), dir = path.join(root, id); fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'job.json'), JSON.stringify({ id, command: 'printf test', notify: true, notifyMode: 'auto', createdAt: 100000, ...extra }));
    fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify({ status: 'completed', exitCode: 0, finishedAt: 100000, ...state }));
    fs.writeFileSync(path.join(dir, 'output.log'), 'full-result\n'.repeat(10000));
    return id;
  }
  try { run(root, add); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
const idle = { isIdle: () => true, hasPendingMessages: () => false };
test('history lists are bounded and status never returns logs; log pages retain full data', () => fixture((root, add) => {
  const id = add({ command: 'x'.repeat(64000) });
  for (let i = 0; i < 60; i++) add();
  assert.equal(jobQuery(root, { action: 'list' }).total, 0);
  const page = jobQuery(root, { action: 'list', includeFinished: true });
  assert.equal(page.jobs.length, 20); assert.equal(page.nextOffset, 20);
  assert.ok(JSON.stringify(page).length < 12000);
  const state = jobQuery(root, { action: 'status', id });
  assert.equal(state.output, undefined); assert.ok(JSON.stringify(state).length < 1000);
  assert.equal(jobs.read(root, id).notified, true);
  let offset = 0, full = '';
  do { const chunk = jobQuery(root, { action: 'log', id, byteOffset: offset });
    assert.ok(Buffer.byteLength(chunk.output) <= 8192); full += chunk.output; offset = chunk.nextByteOffset;
  } while (offset !== null);
  assert.equal(full, fs.readFileSync(state.logPath, 'utf8'));
}));
test('completed jobs form one idle-only batch, with durable receipts and cooldown', () => fixture((root, add) => {
  let now = 105000; const sent = [];
  for (let i = 0; i < 8; i++) add();
  const make = () => createNotifications(root, (...args) => sent.push(args), () => now);
  const dispatch = make();
  assert.equal(dispatch({ ...idle, isIdle: () => false }), 0);
  assert.equal(dispatch(idle), 8); assert.equal(sent.length, 1);
  assert.ok(sent[0][0].content.length < 14000);
  assert.equal(make()(idle), 0);
  add({}, { finishedAt: now }); now += 5000;
  assert.equal(make()(idle), 0);
  now += 25000; assert.equal(make()(idle), 1);
}));
test('failures are prioritized; auto timers/stops are silent and explicit timers still report', () => fixture((root, add) => {
  const timer = add({ command: 'sleep 10' });
  const stopped = add({}, { status: 'stopped' });
  const explicit = add({ command: 'sleep 10', notifyMode: 'always' });
  const legacy = add({ command: 'sleep 10', notifyMode: undefined });
  const failed = add({ command: 'sleep 10' }, { exitCode: 2 });
  const timedOut = add({}, { status: 'timed_out', exitCode: null });
  const sent = [];
  const dispatch = createNotifications(root, (message) => sent.push(message), () => 100000);
  assert.equal(dispatch(idle), 4);
  assert.equal(jobs.read(root, timer).notified, true); assert.equal(jobs.read(root, stopped).notified, true);
  assert.ok(sent[0].details.ids.includes(explicit));
  assert.ok(sent[0].details.ids.includes(legacy));
  assert.ok(sent[0].details.ids.includes(failed)); assert.ok(sent[0].details.ids.includes(timedOut));
  assert.equal(timerOnly('sleep 10; check-health'), false);
}));
test('inspection prevents repeat completion and failed delivery does not acknowledge jobs', () => fixture((root, add) => {
  const inspected = add(); jobQuery(root, { action: 'status', id: inspected });
  const pending = add();
  const broken = createNotifications(root, () => { throw new Error('not ready'); }, () => 105000);
  assert.throws(() => broken(idle), /not ready/);
  assert.equal(jobs.read(root, pending).notified, false);
  const sent = [];
  assert.equal(createNotifications(root, m => sent.push(m), () => 105000)(idle), 1);
  assert.deepEqual(sent[0].details.ids, [pending]);
}));
