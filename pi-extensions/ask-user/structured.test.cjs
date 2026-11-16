const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createQuestionStore } = require('./store.ts');
const { createQuestionPresenter, walkQuestions } = require('./presenter.ts');
const schema = require('./schema.ts');

const fixture = async run => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-questions-structured-'));
  try { await run(createQuestionStore(root), root); } finally { fs.rmSync(root, { recursive: true, force: true }); }
};
const batch = { sessionId: 'worker', recipientSessionId: 'main', agentName: 'Worker', key: 'plan', questions: [
  { question: 'Which cache?', header: 'Cache', options: [{ label: 'Redis', description: 'Shared', recommended: true, preview: '```\nredis://\n```' }, { label: 'Memory' }] },
  { question: 'Which tests?', header: 'Tests', multiSelect: true, options: ['Unit', 'Integration', 'E2E'] },
] };

test('validation rejects malformed questionnaires with model-readable errors', () => {
  const bad = [
    [{ question: 'a', questions: [{ question: 'b' }] }, /exactly one/],
    [{ questions: [] }, /1-4/],
    [{ questions: Array.from({ length: 5 }, (_, i) => ({ question: `q${i}` })) }, /1-4/],
    [{ questions: [{ question: 'x' }, { question: 'x' }] }, /Duplicate question/],
    [{ question: 'x', options: ['A', 'a'] }, /duplicate labels/],
    [{ question: 'x', options: ['Type something.'] }, /reserved/],
    [{ question: 'x', multiSelect: true }, /multiSelect needs options/],
    [{ question: 'x', options: [{ label: 'A', recommended: true }, { label: 'B', recommended: true }] }, /only one recommended/],
  ];
  for (const [input, error] of bad) assert.throws(() => schema.normalizeQuestions(input), error);
  assert.deepEqual(schema.normalizeQuestions({ question: ' Pick? ', options: ['A'] }), [{ question: 'Pick?', multiSelect: false, options: [{ label: 'A' }] }]);
});

test('structured batch: idempotent key, all-or-nothing answers, notes and readable summary', () => fixture(async store => {
  const q = store.ask(batch);
  assert.equal(store.ask(batch).id, q.id);
  assert.throws(() => store.ask({ ...batch, questions: [batch.questions[0]] }), /different content/);
  assert.match(q.question, /1\. \[Cache\] Which cache\?\n2\. \[Tests\] Which tests\?/);
  assert.throws(() => store.answer(q.id, 'main', { answers: [{ questionIndex: 0, answer: 'Redis' }] }), /Unanswered: Tests/);
  assert.throws(() => store.answer(q.id, 'main', { answers: [{ questionIndex: 0, answer: 'Redis' }, { questionIndex: 1, selected: ['Nope'] }] }), /Unknown option/);
  assert.equal(store.pending('main').length, 1, 'rejected answers leave the question pending');
  const saved = store.answer(q.id, 'main', { globalNote: 'ship Friday', answers: [
    { questionIndex: 1, selected: ['E2E', 'Unit'], answer: 'smoke on staging' },
    { questionIndex: 0, answer: 'Redis', notes: 'use cluster' }] });
  assert.deepEqual(saved.response.answers.map(a => a.kind), ['option', 'multi']);
  assert.deepEqual(saved.response.answers[1].selected, ['Unit', 'E2E'], 'selection follows option order');
  assert.equal(saved.value, '1. [Cache] Which cache?\n→ Redis\n  notes: use cluster\n2. [Tests] Which tests?\n→ Unit, E2E, (wrote) smoke on staging\nGlobal note: ship Friday');
  assert.equal(store.deliveries('worker')[0].answer.response.globalNote, 'ship Friday');
  assert.equal(store.ask(batch).status, 'answered');
}));

test('index answers from bridges map to labels and enforce single-select rules', () => {
  const qs = schema.normalizeQuestions(batch);
  const r = schema.responseFromIndexes(qs, { answers: [{ questionIndex: 0, optionIndexes: [1] }, { questionIndex: 1, optionIndexes: [0, 2], text: 'and perf' }] });
  assert.deepEqual(r.answers.map(a => a.answer), ['Memory', 'and perf']);
  assert.throws(() => schema.responseFromIndexes(qs, { answers: [{ questionIndex: 0, optionIndexes: [0, 1] }, { questionIndex: 1, optionIndexes: [0] }] }), /exactly one/);
  assert.throws(() => schema.responseFromIndexes(qs, { answers: [{ questionIndex: 0, optionIndexes: [9] }, { questionIndex: 1, optionIndexes: [0] }] }), /out of range/);
});

test('legacy records and plain-text answers keep the previous wire format', () => fixture(async (store, root) => {
  const id = require('node:crypto').createHash('sha256').update('old\0legacy').digest('hex');
  const record = { id, sessionId: 'old', recipientSessionId: 'main', agentName: 'Old', key: 'legacy', question: 'Old?', options: ['Yes', 'No'], createdAt: 1 };
  fs.mkdirSync(path.join(root, 'records'), { recursive: true });
  fs.writeFileSync(path.join(root, 'records', id + '.json'), JSON.stringify(record));
  assert.equal(store.ask({ sessionId: 'old', recipientSessionId: 'main', key: 'legacy', question: 'Old?', options: ['Yes', 'No'] }).id, id);
  assert.equal(store.answer(id, 'main', 'Yes').value, 'Yes');
  assert.equal(store.answered(id).response.answers[0].kind, 'option');
}));

test('dialog walker (RPC hosts) answers a batch; Esc anywhere keeps it pending', () => fixture(async store => {
  const q = store.ask(batch);
  const script = (selects, inputs) => ({ ui: { notify() {}, async select(title, options) { const s = selects.shift(); return typeof s === 'function' ? s(title, options) : s; }, async input() { return inputs.shift(); } } });
  assert.equal(await walkQuestions(script([undefined], []), q, {}), undefined);
  assert.equal(await walkQuestions(script([(_t, o) => o[0]], ['']), q, {}), undefined, 'empty multi-select input keeps pending');
  let title, labels;
  const response = await walkQuestions(script([(t, o) => { title = t; labels = o; return o[0]; }], ['1, 3; and perf']), q, {});
  assert.equal(labels[0], '1. Redis (แนะนำ) — Shared'); assert.match(title, /redis:\/\//);
  assert.deepEqual(response.answers[1], { questionIndex: 1, kind: 'multi', answer: 'and perf', selected: ['Unit', 'E2E'] });
  const presenter = createQuestionPresenter(store, 'main');
  const selects = [o => o[0], o => o[1]];
  await presenter.show({ ui: { notify() {}, async select(_t, o) { const f = selects.shift(); return f ? f(o) : undefined; }, async input() { return '2'; } } });
  assert.equal(store.answered(q.id).response.answers[0].answer, 'Memory');
}));

test('drafts persist per answering session and disappear once answered', () => fixture(async (store, root) => {
  const q = store.ask(batch);
  store.saveDraft(q.id, 'main', { v: 1, x: 1 });
  store.saveDraft(q.id, 'main', { v: 1, x: 2 });
  assert.deepEqual(createQuestionStore(root).draft(q.id, 'main'), { v: 1, x: 2 }, 'survives a new store (reload)');
  assert.equal(store.draft(q.id, 'worker'), undefined);
  store.answer(q.id, 'main', { answers: [{ questionIndex: 0, answer: 'Redis' }, { questionIndex: 1, selected: ['Unit'] }] });
  assert.equal(store.draft(q.id, 'main'), undefined);
  store.saveDraft(q.id, 'main', { v: 1 });
  assert.equal(store.draft(q.id, 'main'), undefined, 'no draft is written for an answered question');
}));

