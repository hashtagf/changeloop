const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('./store.cjs');
const { isReport, setMode, status, createReportDispatcher } = require('./reports.cjs');

function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-reports-test-'));
  let now = 100000;
  const sent = [], ctx = { isIdle: () => true, hasPendingMessages: () => false };
  for (const id of ['main', 'child', 'child2', 'other']) store.register(root, { id, name: id, status: 'idle' });
  for (const id of ['child', 'child2']) {
    const file = path.join(store.dir(root, id), 'meta.json');
    store.atomic(file, { ...store.read(file), parentId: 'main' });
  }
  const make = (send = (message, options) => sent.push({ message, options })) => createReportDispatcher(root, 'main', send, () => now);
  const dispatcher = make();
  function report(from = 'child', text = 'checked', options = { type: 'result' }) {
    const receipt = store.send(root, from, 'main', text, options);
    const file = path.join(store.dir(root, 'main'), 'inbox', `${receipt.id}.json`);
    store.atomic(file, { ...store.read(file), createdAt: now });
    return receipt;
  }
  try { return run({ root, ctx, sent, make, dispatcher, report, advance: ms => { now += ms; } }); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('bursts preserve every report in one batch; receipts prevent replay after reload', () => fixture(f => {
  for (let i = 0; i < 8; i++) f.report(i % 2 ? 'child' : 'child2', `result ${i}`);
  assert.equal(f.dispatcher.flush(f.ctx), 0);
  f.advance(5000);
  assert.equal(f.dispatcher.flush(f.ctx), 8);
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].message.display, false);
  assert.equal(f.sent[0].message.details.count, 8);
  for (let i = 0; i < 8; i++) assert.ok(f.sent[0].message.content.includes(`result ${i}`));
  assert.deepEqual(f.sent[0].options, { triggerTurn: true, deliverAs: 'followUp' });
  assert.match(f.sent[0].message.content, /not proof the task is complete/);
  assert.equal(f.make().flush(f.ctx), 0);
  assert.equal(store.inbox(f.root, 'main', { limit: 100 }).length, 8, 'full history is retained');
}));

test('busy main and pending user messages postpone every report, including failures', () => fixture(f => {
  f.report('child', 'failed', { type: 'result', details: { error: 'test failure' } });
  assert.equal(f.dispatcher.flush({ ...f.ctx, isIdle: () => false }), 0);
  assert.equal(f.dispatcher.flush({ ...f.ctx, hasPendingMessages: () => true }), 0);
  assert.equal(status(f.root, 'main').pending, 1);
  assert.equal(f.dispatcher.flush(f.ctx), 1);
}));

test('quiet persists across reload, retains urgent results, and supports explicit flush', () => fixture(f => {
  setMode(f.root, 'main', 'quiet');
  f.report('child', 'blocker', { type: 'message', delivery: 'steer' });
  f.advance(60000);
  assert.equal(f.make().flush(f.ctx), 0);
  assert.deepEqual(status(f.root, 'main'), { mode: 'quiet', pending: 1 });
  assert.equal(f.make().flush(f.ctx, { force: true }), 1);
  assert.equal(status(f.root, 'main').pending, 0);
  assert.throws(() => setMode(f.root, 'main', 'invalid'), /Use/);
}));

test('continuous arrivals are flushed after 30 seconds and normal cooldown survives reload', () => fixture(f => {
  f.report();
  for (let i = 0; i < 8; i++) { f.advance(4000); f.report(); }
  assert.equal(f.dispatcher.flush(f.ctx), 9);
  f.report();
  f.advance(5000);
  assert.equal(f.make().flush(f.ctx), 0);
  f.advance(25000);
  assert.equal(f.make().flush(f.ctx), 1);
}));

test('urgent failures bypass normal debounce and cooldown without creating a wakeup storm', () => fixture(f => {
  f.report('child', 'failed', { type: 'lifecycle' });
  assert.equal(f.dispatcher.flush(f.ctx), 1);
  f.report('child2', 'need decision', { type: 'message', delivery: 'steer' });
  assert.equal(f.dispatcher.flush(f.ctx), 0);
  f.advance(5000);
  assert.equal(f.dispatcher.flush(f.ctx), 1);
}));

test('failed injection leaves all reports unread and retryable', () => fixture(f => {
  f.report(); f.advance(5000);
  const failing = f.make(() => { throw new Error('not ready'); });
  assert.throws(() => failing.flush(f.ctx), /not ready/);
  assert.equal(status(f.root, 'main').pending, 1);
  assert.equal(f.dispatcher.flush(f.ctx), 1);
}));

test('report batching preserves direct instructions and unrelated session messages', () => fixture(f => {
  const upward = f.report('child', 'ordinary upward report', { type: 'message' });
  store.send(f.root, 'other', 'main', 'direct question', { delivery: 'steer' });
  store.send(f.root, 'main', 'child', 'do work', { delivery: 'steer' });
  const direct = [];
  store.deliver(f.root, 'main', message => direct.push(message), { filter: message => !isReport(f.root, 'main', message) });
  assert.equal(direct.length, 1);
  assert.equal(direct[0].message, 'direct question');
  assert.equal(store.inbox(f.root, 'main', { unreadOnly: true })[0].id, upward.id);
  store.deliver(f.root, 'child', message => direct.push(message), { filter: message => !isReport(f.root, 'child', message) });
  assert.equal(direct[1].message, 'do work');
  f.advance(5000);
  assert.equal(f.dispatcher.flush(f.ctx), 1);
}));

test('large reports reach model context intact and remain complete in durable inbox', () => fixture(f => {
  f.report('child', 'x'.repeat(60000));
  f.advance(5000); f.dispatcher.flush(f.ctx);
  assert.ok(f.sent[0].message.content.includes('x'.repeat(60000)));
  assert.doesNotMatch(f.sent[0].message.content, /truncated/);
  assert.equal(store.inbox(f.root, 'main')[0].message.length, 60000);
}));

test('a large quiet report backlog cannot starve direct instructions', () => fixture(f => {
  setMode(f.root, 'main', 'quiet');
  for (let i = 0; i < 110; i++) f.report('child', `report ${i}`);
  const receipt = store.send(f.root, 'other', 'main', 'urgent direct instruction', { delivery: 'steer' });
  const file = path.join(store.dir(f.root, 'main'), 'inbox', `${receipt.id}.json`);
  const moved = `${Date.now() + 10000}-${require('node:crypto').randomUUID()}`;
  store.atomic(path.join(path.dirname(file), `${moved}.json`), { ...store.read(file), id: moved });
  fs.rmSync(file);
  const received = [];
  store.deliver(f.root, 'main', message => received.push(message), { filter: message => !isReport(f.root, 'main', message) });
  assert.equal(received.length, 1);
  assert.equal(received[0].message, 'urgent direct instruction');
  assert.equal(f.dispatcher.flush(f.ctx), 0);
}));

test('whole-message batch limit leaves remaining reports unread until delivery', () => fixture(f => {
  const texts = ['ก'.repeat(30000), 'ข'.repeat(30000), 'ค'.repeat(50000)];
  for (const text of texts) f.report('child', text);
  for (let i = 0; i < texts.length; i++) {
    f.advance(30000);
    assert.equal(f.dispatcher.flush(f.ctx), 1);
    assert.ok(texts.some(text => f.sent[i].message.content.includes(text)));
    assert.equal(status(f.root, 'main').pending, texts.length - i - 1);
  }
  for (const text of texts) assert.equal(f.sent.filter(item => item.message.content.includes(text)).length, 1);
  assert.equal(f.make().flush(f.ctx), 0);
}));
