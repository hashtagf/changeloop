const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('./store.cjs');
const { createIdleReaper } = require('./idle.cjs');

test('idle retirement waits ten quiet minutes and stops only its managed owner', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-idle-'));
  try {
    const ctx = { isIdle: () => true, hasPendingMessages: () => false };
    const owner = { id: 'worker', kind: 'managed', status: 'idle', sessionId: 'test' };
    let jobs = [];
    const reap = createIdleReaper(root, () => jobs);
    const file = path.join(store.dir(root, 'worker'), 'stop.json');
    store.atomic(path.join(store.dir(root, 'worker'), 'meta.json'), owner);
    assert.equal(reap('worker', ctx, [owner], 0), false);
    jobs = [{ status: 'running' }];
    assert.equal(reap('worker', ctx, [owner], 600000), false);
    jobs = [];
    assert.equal(reap('worker', ctx, [owner], 600001), false);
    ctx.hasPendingMessages = () => true;
    assert.equal(reap('worker', ctx, [owner], 1200001), false);
    ctx.hasPendingMessages = () => false;
    assert.equal(reap('worker', ctx, [owner], 1200002), false);
    assert.equal(reap('worker', ctx, [owner, { id: 'child', parentId: 'worker', status: 'working' }], 1800002), false);
    assert.equal(reap('worker', ctx, [owner], 1800003), false);
    reap.reset(); // A quick turn between monitor ticks starts a fresh idle period.
    assert.equal(reap('worker', ctx, [owner], 1800003), false);
    assert.equal(reap('worker', ctx, [owner], 2400002), false);
    assert.equal(fs.existsSync(file), false);
    assert.equal(reap('worker', ctx, [owner], 2400003), true);
    assert.equal(fs.existsSync(file), true);
    assert.equal(fs.existsSync(path.join(store.dir(root, 'child'), 'stop.json')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('interactive sessions, unread inbox, disabled config and uncertain jobs never retire', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-idle-'));
  try {
    const owner = { id: 'worker', kind: 'managed', status: 'idle', sessionId: 'test' };
    store.atomic(path.join(store.dir(root, owner.id), 'meta.json'), owner);
    const ctx = { isIdle: () => true, hasPendingMessages: () => false };
    const check = (members, jobs = () => []) => {
      const reap = createIdleReaper(root, jobs);
      assert.equal(reap(owner.id, ctx, members, 0), false);
      assert.equal(reap(owner.id, ctx, members, 9999999), false);
    };
    check([{ ...owner, kind: 'session' }]);
    check([owner], () => { throw Error('Cannot read job state'); });
    check([owner, { id: 'child', parentId: owner.id, status: 'stopped' },
      { id: 'grandchild', parentId: 'child', status: 'working' }]);
    store.atomic(path.join(root, 'config.json'), { idleTimeoutMinutes: 0 });
    check([owner]);
    store.atomic(path.join(root, 'config.json'), { idleTimeoutMinutes: 1 });
    const dialog = path.join(store.dir(root, owner.id), 'ui-requests', 'pending.json');
    store.atomic(dialog, { status: 'pending', createdAt: 0 });
    check([owner]);
    fs.rmSync(dialog);
    store.send(root, owner.id, owner.id, 'pending task');
    check([owner]);
    assert.equal(fs.existsSync(path.join(store.dir(root, owner.id), 'stop.json')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('fresh child graph prevents retirement when the monitor index has not discovered a child yet', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-idle-fresh-'));
  try {
    const owner = { id: 'worker', kind: 'managed', status: 'idle', sessionId: 'test' };
    store.atomic(path.join(store.dir(root, owner.id), 'meta.json'), owner);
    const ctx = { isIdle: () => true, hasPendingMessages: () => false };
    const reap = createIdleReaper(root, () => []);
    assert.equal(reap(owner.id, ctx, [owner], 0), false);
    store.register(root, { id: 'new-child', status: 'working' });
    const file = path.join(store.dir(root, 'new-child'), 'meta.json');
    store.atomic(file, { ...store.read(file), parentId: owner.id, kind: 'managed' });
    assert.equal(reap(owner.id, ctx, [owner], 600000), false);
    assert.equal(fs.existsSync(path.join(store.dir(root, owner.id), 'stop.json')), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
