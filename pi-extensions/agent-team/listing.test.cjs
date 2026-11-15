const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { selectMembers, listAgents } = require('./listing.ts');
const store = require('./store.cjs');

test('hundreds of large archived records cannot inflate a default status response', () => {
  const all = Array.from({ length: 354 }, (_, i) => ({ id: `a-${i}`, name: `worker-${i}`, kind: 'managed',
    parentId: i < 43 ? 'main' : 'other-main', status: i < 17 ? 'idle' : 'stopped', online: i < 17,
    createdAt: i, task: 'T'.repeat(64000), result: { text: 'R'.repeat(32000) } }));
  const result = selectMembers(all, 'main');
  assert.equal(result.total, 17);
  assert.equal(result.members.length, 17);
  assert.ok(Buffer.byteLength(JSON.stringify(result, null, 2)) < 6000);
  assert.ok(result.members.every(row => !('task' in row) && !('result' in row)));
  const first = selectMembers(all, 'main', { scope: 'all', includeInactive: true });
  assert.equal(first.total, 354);
  assert.equal(first.members.length, 20);
  assert.equal(first.nextOffset, 20);
  const second = selectMembers(all, 'main', { scope: 'all', includeInactive: true, offset: first.nextOffset });
  assert.equal(second.members[0].id, 'a-20');
  assert.equal(new Set([...first.members, ...second.members].map(row => row.id)).size, 40);
  assert.equal(selectMembers(all, 'main', { scope: 'all', includeInactive: true, offset: 340 }).nextOffset, null);
  assert.throws(() => selectMembers(all, 'main', { limit: 1000 }), /limit/);
});

test('active grandchildren remain discoverable through an inactive ancestor; siblings are separate', () => {
  const all = [
    { id: 'main', online: true, kind: 'session', createdAt: 0 },
    { id: 'child', parentId: 'main', status: 'stopped', kind: 'managed', createdAt: 1 },
    { id: 'grandchild', parentId: 'child', status: 'starting', kind: 'managed', createdAt: 2 },
    { id: 'other', online: true, kind: 'session', createdAt: 3 },
  ];
  assert.deepEqual(selectMembers(all, 'main').members.map(row => row.id), ['main', 'grandchild']);
  assert.equal(selectMembers(all, 'main', { includeInactive: true }).total, 3);
});

test('targeted offline lookup is compact; explicit details are bounded and reference complete originals', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-listing-'));
  try {
    store.register(root, { id: 'main', status: 'idle' });
    const location = store.dir(root, 'archived');
    store.atomic(path.join(location, 'meta.json'), { id: 'archived', name: 'old-worker', kind: 'managed', task: 'T'.repeat(64000), createdAt: 1 });
    store.atomic(path.join(location, 'process.json'), { status: 'stopped' });
    store.saveResult(root, 'archived', { text: 'R'.repeat(32000), phase: 'turn_settled' });
    const brief = listAgents(root, 'main', { id: 'old-worker' });
    assert.equal(brief.members[0].status, 'stopped');
    assert.equal(brief.members[0].taskPreview, undefined);
    const detailed = listAgents(root, 'main', { id: 'archived', details: true }).members[0];
    assert.equal(detailed.taskTruncated, true);
    assert.equal(detailed.resultTruncated, true);
    assert.ok(JSON.stringify(detailed).length < 5000);
    assert.equal(store.read(detailed.taskFile).task.length, 64000);
    assert.equal(store.read(detailed.resultFile).text.length, 32000);
    assert.throws(() => listAgents(root, 'main', { details: true }), /requires/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
