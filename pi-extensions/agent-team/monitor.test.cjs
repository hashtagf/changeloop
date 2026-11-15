const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('./store.cjs');
const { createTeamReader } = require('./monitor.ts');
const { pendingDialogs, createDialogRelay } = require('./dialogs.ts');

function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-monitor-'));
  const add = (id, parentId, status = 'idle') => {
    store.register(root, { id, name: id, status });
    if (parentId) store.atomic(path.join(store.dir(root, id), 'meta.json'),
      { ...store.read(path.join(store.dir(root, id), 'meta.json')), parentId, kind: 'managed' });
  };
  try { return run(root, add); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('warm monitor reads only its family and shares it with dialog discovery', () => fixture((root, add) => {
  add('main'); add('child', 'main'); add('nested', 'child');
  for (let i = 0; i < 529; i++) add(`history-${i}`);
  const relay = createDialogRelay(root, 'nested', () => {});
  relay.enqueue({ id: 'question', method: 'confirm', title: 'Test' });
  const monitor = createTeamReader(root, 'main', () => 1000);
  assert.deepEqual(new Set(monitor().map(item => item.id)), new Set(['main', 'child', 'nested']));
  const original = fs.readFileSync;
  let reads = 0, unrelated = 0;
  fs.readFileSync = function(file, ...args) {
    reads++; if (String(file).includes('history-')) unrelated++;
    return original.call(this, file, ...args);
  };
  try {
    const startLegacy = performance.now();
    for (let i = 0; i < 5; i++) { store.list(root); pendingDialogs(root, 'main'); }
    const legacy = { reads, milliseconds: performance.now() - startLegacy };
    reads = 0; unrelated = 0;
    const start = performance.now();
    for (let i = 0; i < 5; i++) {
      const members = monitor();
      assert.equal(pendingDialogs(root, 'main', Date.now(), members).length, 1);
    }
    const optimized = { reads, milliseconds: performance.now() - start };
    assert.equal(unrelated, 0, 'Idle monitoring must not reopen unrelated historical sessions');
    assert.ok(optimized.reads < legacy.reads / 50);
    console.log(JSON.stringify({ fixture: '529 unrelated sessions, 3 team members, 5 polls', legacy, optimized }));
  } finally { fs.readFileSync = original; relay.close(); }
}));

test('monitor discovers new descendants, refreshes reparenting, and reads live status/results', () => fixture((root, add) => {
  let now = 1;
  add('main'); add('other'); add('child', 'main');
  const monitor = createTeamReader(root, 'main', () => now);
  assert.equal(monitor().length, 2);
  add('new-child', 'child');
  assert.equal(monitor().length, 3);
  store.heartbeat(root, 'child', { status: 'working' });
  store.saveResult(root, 'child', { text: 'latest', finishedAt: 42 });
  const child = monitor().find(item => item.id === 'child');
  assert.equal(child.status, 'working'); assert.equal(child.result.text, 'latest');
  const meta = path.join(store.dir(root, 'child'), 'meta.json');
  store.atomic(meta, { ...store.read(meta), parentId: 'other' });
  now += 30000;
  assert.deepEqual(monitor().map(item => item.id), ['main']);
  fs.rmSync(store.dir(root, 'new-child'), { recursive: true, force: true });
  assert.deepEqual(monitor().map(item => item.id), ['main']);
}));

test('unread polling skips delivered bodies but keeps failed deliveries retryable and history readable', () => fixture((root, add) => {
  add('main'); add('child', 'main');
  const receipts = [];
  for (let i = 0; i < 100; i++) receipts.push(store.send(root, 'child', 'main', `message ${i}`));
  for (const receipt of receipts) store.atomic(path.join(store.dir(root, 'main'), 'receipts', `${receipt.id}.json`), { deliveredAt: 1 });
  const next = store.send(root, 'child', 'main', 'new message');
  const original = fs.readFileSync;
  let oldReads = 0;
  const delivered = new Set(receipts.map(item => item.id + '.json'));
  fs.readFileSync = function(file, ...args) {
    if (delivered.has(path.basename(String(file)))) oldReads++;
    return original.call(this, file, ...args);
  };
  try {
    assert.equal(store.inbox(root, 'main', { unreadOnly: true })[0].id, next.id);
    assert.throws(() => store.deliver(root, 'main', () => { throw Error('retry'); }), /retry/);
    assert.equal(store.inbox(root, 'main', { unreadOnly: true }).length, 1);
    store.deliver(root, 'main', () => {});
    assert.equal(store.inbox(root, 'main', { unreadOnly: true }).length, 0);
    assert.equal(oldReads, 0);
  } finally { fs.readFileSync = original; }
  assert.equal(store.inbox(root, 'main', { limit: 100 }).length, 100);
}));
