const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createQuestionStore } = require('./store.ts');
const { createQuestionPresenter } = require('./presenter.ts');

async function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-questions-'));
  try { await run(createQuestionStore(root), root); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
const question = { sessionId: 'worker', recipientSessionId: 'main', agentName: 'Worker A', key: 'region', question: 'Which region should this task use?', options: ['Asia', 'Europe'] };

test('pending questions survive reload, owner absence and repeated requests without mixing sessions', () => fixture((store, root) => {
  const q = store.ask(question);
  assert.equal(store.ask(question).id, q.id);
  assert.equal(createQuestionStore(root).pending('main').length, 1);
  assert.equal(createQuestionStore(root).pending('worker').length, 1);
  assert.equal(store.pending('unrelated').length, 0);
  assert.throws(() => store.ask({ ...question, question: 'Different question?' }), /different content/);
  assert.equal(store.ask({ ...question, sessionId: 'other-worker' }).status, 'pending');
  assert.equal(store.pending('main').length, 2);
  assert.throws(() => store.answer(q.id, 'unrelated', 'Asia'), /another session/);
  assert.throws(() => store.answer(q.id, 'main', '  '), /non-empty/);
  assert.equal(store.pending('worker').length, 1);
}));

test('answers persist until owner delivery; competing UI cannot overwrite the first answer', () => fixture((store, root) => {
  const q = store.ask(question);
  const answer = store.answer(q.id, 'main', 'Use Singapore instead');
  assert.deepEqual(store.answer(q.id, 'worker', 'Europe'), answer);
  assert.equal(store.pending('main').length, 0);
  assert.equal(store.pending('worker').length, 0);
  const resumed = createQuestionStore(root);
  assert.equal(resumed.deliveries('main').length, 0);
  assert.equal(resumed.deliveries('worker')[0].answer.value, 'Use Singapore instead');
  assert.throws(() => resumed.delivered('main', q.id), /another session/);
  resumed.delivered('worker', q.id);
  assert.equal(resumed.deliveries('worker').length, 0);
  assert.equal(resumed.ask(question).answer, 'Use Singapore instead');
  assert.equal(resumed.pending('main').length, 0);
}));

test('Esc at list, choices or text and reload during a dialog never resolve a question', () => fixture(async store => {
  store.ask(question);
  for (const stage of ['list', 'choices', 'text', 'empty', 'reload']) {
    let calls = 0;
    const presenter = createQuestionPresenter(store, 'main');
    const ctx = { ui: { notify() {},
      async select(_title, options) {
        calls++;
        if (stage === 'reload') { presenter.close(); return options[0]; }
        if (calls > 2 || (stage === 'list' && calls === 1) || (stage === 'choices' && calls === 2)) return undefined;
        return calls === 1 ? options[0] : options.at(-1);
      },
      async input() { return stage === 'empty' ? '  ' : undefined; },
    } };
    await presenter.show(ctx);
    assert.equal(store.pending('main').length, 1, stage);
    presenter.close();
  }
}));

test('user selects an older question out of order and types a custom answer', () => fixture(async store => {
  const old = store.ask(question);
  store.ask({ ...question, key: 'format', question: 'Which output format?' });
  let calls = 0;
  const presenter = createQuestionPresenter(store, 'main');
  await presenter.show({ ui: { notify() {},
    async select(_title, options) {
      calls++;
      if (calls === 1) return options.find(o => o.includes('Which region'));
      if (calls === 2) return options.at(-1);
      return undefined;
    },
    async input() { return 'Singapore'; },
  } });
  assert.equal(store.pending('main')[0].key, 'format');
  assert.equal(store.deliveries('worker')[0].id, old.id);
  assert.equal(store.deliveries('worker')[0].answer.value, 'Singapore');
}));

test('idle polling reads no completed history', () => fixture(store => {
  for (let i = 0; i < 100; i++) {
    const q = store.ask({ ...question, key: String(i) });
    store.answer(q.id, 'main', 'Asia'); store.delivered('worker', q.id);
  }
  const original = fs.readFileSync; let reads = 0;
  fs.readFileSync = function(...args) { reads++; return original.apply(this, args); };
  try {
    for (let i = 0; i < 5; i++) { store.pending('main'); store.deliveries('worker'); }
    assert.equal(reads, 0);
  } finally { fs.readFileSync = original; }
}));
