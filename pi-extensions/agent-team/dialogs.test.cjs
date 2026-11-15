const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('./store.cjs');
const { createDialogRelay, createDialogPresenter, pendingDialogs } = require('./dialogs.ts');

async function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-dialogs-'));
  for (const id of ['main', 'child', 'nested', 'other']) {
    store.register(root, { id, name: id, status: 'working' });
    if (['child', 'nested'].includes(id)) store.atomic(path.join(store.dir(root, id), 'meta.json'),
      { id, name: id, kind: 'managed', parentId: id === 'child' ? 'main' : 'child' });
  }
  const sent = [], relay = createDialogRelay(root, 'nested', response => sent.push(response));
  const presenter = createDialogPresenter(root, 'main');
  try { await run({ root, sent, relay, presenter }); }
  finally { presenter.close(); relay.close(); fs.rmSync(root, { recursive: true, force: true }); }
}

test('nested worker dialogs wait for real user answers and preserve all dialog types', () => fixture(async f => {
  const cases = [
    ['confirm', true, { confirmed: true }], ['confirm', false, { confirmed: false }],
    ['select', 'second', { value: 'second' }], ['input', '', { value: '' }],
    ['editor', 'line one\nline two', { value: 'line one\nline two' }],
    ['input', undefined, { cancelled: true }],
  ];
  for (const [index, [method, answer, expected]] of cases.entries()) {
    const request = { type: 'extension_ui_request', id: `request-${index}`, method,
      title: 'Question', message: 'Full reason', options: ['first', 'second'], placeholder: 'hint', prefill: 'draft' };
    f.relay.enqueue(request); f.relay.poll();
    assert.equal(f.sent.length, index, 'Never automatically cancel or approve a pending question');
    assert.equal(pendingDialogs(f.root, 'main').length, 1);
    assert.equal(pendingDialogs(f.root, 'child').length, 0);
    assert.equal(pendingDialogs(f.root, 'other').length, 0);
    await f.presenter.show({ ui: { [method]: async (title, content) => {
      assert.match(title, /nested: Question/);
      assert.deepEqual(content, request[method === 'confirm' ? 'message' : method === 'select' ? 'options' : method === 'input' ? 'placeholder' : 'prefill']);
      return answer;
    } } });
    f.relay.poll(); f.relay.poll();
    assert.deepEqual(f.sent[index], { type: 'extension_ui_response', id: request.id, ...expected });
    assert.equal(f.sent.length, index + 1);
  }
}));

test('expiry, worker shutdown and parent reload never fabricate approval', () => fixture(async f => {
  let now = Date.now();
  const relay = createDialogRelay(f.root, 'child', value => f.sent.push(value), () => now);
  relay.enqueue({ id: 'timeout', method: 'confirm', timeout: 100 });
  now += 101; relay.poll();
  assert.deepEqual(f.sent, [{ type: 'extension_ui_response', id: 'timeout', cancelled: true }]);
  relay.enqueue({ id: 'stopped', method: 'confirm' });
  await f.presenter.show({ ui: { confirm: async () => { relay.close(); return true; } } });
  relay.poll(); assert.equal(f.sent.length, 1);
  f.relay.enqueue({ id: 'reload', method: 'confirm' });
  await f.presenter.show({ ui: { confirm: async () => { f.presenter.close(); return true; } } });
  f.relay.poll(); assert.equal(f.sent.length, 1);
  const resumed = createDialogPresenter(f.root, 'main');
  await resumed.show({ ui: { confirm: async () => false } });
  f.relay.poll(); resumed.close();
  assert.deepEqual(f.sent.at(-1), { type: 'extension_ui_response', id: 'reload', confirmed: false });
}));

test('parent UI failures retain the pending request for retry', () => fixture(async f => {
  f.relay.enqueue({ id: 'retry', method: 'input' });
  await assert.rejects(f.presenter.show({ ui: { input: async () => { throw Error('UI unavailable'); } } }), /UI unavailable/);
  assert.equal(pendingDialogs(f.root, 'main').length, 1);
  f.relay.poll(); assert.equal(f.sent.length, 0);
}));

test('real supervisor relays questions and routes user answers back over RPC', () => fixture(async f => {
  const output = path.join(f.root, 'responses.json');
  const child = await store.spawnAgent(f.root, { parentId: 'main', task: 'RPC dialog test', cwd: f.root,
    launch: { command: process.execPath, args: [path.join(__dirname, 'test/dialog-worker.cjs'), output] } });
  const waitFor = async check => {
    const deadline = Date.now() + 8000;
    while (!check()) {
      if (Date.now() > deadline) throw Error('Timed out waiting for dialog fixture');
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  };
  try {
    const ui = { confirm: async () => true, select: async () => 'two', input: async () => 'answer', editor: async () => 'a\nb' };
    for (let i = 0; i < 4; i++) {
      await waitFor(() => pendingDialogs(f.root, 'main').some(entry => entry.worker === child.id));
      await f.presenter.show({ ui });
    }
    await waitFor(() => fs.existsSync(output));
    assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), [
      { type: 'extension_ui_response', id: 'confirm', confirmed: true },
      { type: 'extension_ui_response', id: 'select', value: 'two' },
      { type: 'extension_ui_response', id: 'input', value: 'answer' },
      { type: 'extension_ui_response', id: 'editor', value: 'a\nb' },
    ]);
  } finally {
    if (!store.member(f.root, child.id).process.finishedAt) store.stop(f.root, child.id);
    await waitFor(() => {
      const state = store.member(f.root, child.id).process;
      return state.finishedAt && !store.alive(state.workerPid);
    });
  }
}));
