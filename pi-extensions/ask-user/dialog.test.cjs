const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
const modules = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules`);
const strip = s => s.replace(/\x1b\[[0-9;?]*[A-Za-z]|\x1b\]8;;[^\x07]*\x07|\x1b_[^\x07]*\x07/g, '');
const KEY = { down: '\x1b[B', up: '\x1b[A', enter: '\r', esc: '\x1b', tab: '\t', space: ' ' };

async function libs() {
  const { createJiti } = require(path.join(modules, 'jiti'));
  const tuiPath = path.join(modules, '@earendil-works/pi-tui/dist/index.js');
  const codingPath = path.join(modules, '@earendil-works/pi-coding-agent/dist/index.js');
  const jiti = createJiti(__filename, { alias: { '@earendil-works/pi-tui': tuiPath, '@earendil-works/pi-coding-agent': codingPath } });
  const coding = await jiti.import(codingPath); coding.initTheme('dark', false);
  const { KeybindingsManager } = await import(path.join(modules, '@earendil-works/pi-coding-agent/dist/core/keybindings.js'));
  const tui = await import(tuiPath);
  return { ...(await jiti.import(path.join(__dirname, 'dialog.ts'))), keybindings: new KeybindingsManager(), theme: coding.theme ?? (await jiti.import(path.join(modules, '@earendil-works/pi-coding-agent/dist/modes/interactive/theme/theme.js'))).theme, visibleWidth: tui.visibleWidth };
}
const record = { id: 'x', agentName: 'Worker', questions: [
  { question: 'Which cache?', header: 'Cache', multiSelect: false, options: [{ label: 'Redis', description: 'Shared across pods', recommended: true, preview: '# Redis\n\n```\nREDIS_URL=redis://\n```' }, { label: 'Memory' }] },
  { question: 'Which tests?', header: 'Tests', multiSelect: true, options: [{ label: 'Unit' }, { label: 'Integration' }, { label: 'E2E' }] },
] };

function mount(l, rec = record, draft = l.createDraft(rec.questions)) {
  const results = [];
  const tui = { requestRender() {}, terminal: { rows: 40, columns: 120 } };
  const c = l.createQuestionnaire({ tui, theme: l.theme, keybindings: l.keybindings, record: rec, draft, done: r => results.push(r) });
  c.focused = true;
  const press = (...keys) => { for (const k of keys) c.handleInput(KEY[k] ?? k); };
  const screen = (w = 120) => { const lines = c.render(w); for (const line of lines) assert.ok(l.visibleWidth(line) <= w, `line exceeds ${w}: ${strip(line)}`); return strip(lines.join('\n')); };
  return { c, press, screen, results, draft };
}

test('tabbed questionnaire: preview, recommended, multi-select, notes, review and submit', async () => {
  const l = await libs();
  const { press, screen, results } = mount(l);
  let s = screen(120);
  assert.match(s, /□ Cache .*□ Tests .*✓ Submit/);
  assert.match(s, /1\. Redis \(แนะนำ\)/); assert.match(s, /Shared across pods/);
  assert.match(s, /│ Preview/, 'side-by-side preview on wide terminals'); assert.match(s, /REDIS_URL=redis:\/\//);
  s = screen(80); assert.match(s, /── preview/, 'stacked preview on narrow terminals');
  screen(30);
  press('n'); assert.match(screen(), /โน้ตสำหรับข้อนี้/);
  press(...'use cluster', 'enter'); assert.match(screen(), /📝 use cluster/);
  press('enter'); // choose Redis, advance to Tests
  s = screen(); assert.match(s, /■ Cache/); assert.match(s, /เลือกได้หลายข้อ/);
  press('down', 'down', 'down', 'down', 'enter'); // Next with nothing selected
  assert.match(screen(), /เลือกอย่างน้อย 1 ข้อ/);
  press('1', '3'); assert.match(screen(), /\[x\] Unit[\s\S]*\[ \] Integration[\s\S]*\[x\] E2E/);
  press('down', 'enter', ...'smoke', 'enter'); // Type something on multi-select keeps checked options
  press('down', 'enter');
  s = screen(); assert.match(s, /ทบทวนคำตอบ/); assert.match(s, /Cache: Redis/); assert.match(s, /Tests: Unit, E2E, ✎ smoke/);
  press('n', ...'ship Friday', 'enter');
  press('enter');
  assert.equal(results.length, 1);
  const { response } = results[0];
  assert.deepEqual(response.answers[0], { questionIndex: 0, kind: 'option', answer: 'Redis', notes: 'use cluster' });
  assert.deepEqual(response.answers[1], { questionIndex: 1, kind: 'multi', answer: 'smoke', selected: ['Unit', 'E2E'] });
  assert.equal(response.globalNote, 'ship Friday');
});

test('Esc keeps the draft and resolves nothing; incomplete submit names missing tabs', async () => {
  const l = await libs();
  const first = mount(l);
  first.press('down', 'enter'); // Memory
  first.press('esc');
  assert.deepEqual(first.results, [undefined]);
  const again = mount(l, record, first.draft);
  assert.match(again.screen(), /■ Cache/, 'draft survives reopening');
  again.press('tab', 'enter');
  assert.match(again.screen(), /ยังไม่ตอบ: Tests/);
  assert.equal(again.results.length, 0);
  again.press('down', 'enter'); // back, keep pending
  assert.deepEqual(again.results, [undefined]);
});

test('single question submits immediately; custom text editor keeps its draft after Esc', async () => {
  const l = await libs();
  const rec = { id: 'y', agentName: 'Pi', question: 'Which region?', options: ['Asia', 'Europe'] };
  const m = mount(l, rec, l.createDraft([{ question: 'Which region?', multiSelect: false, options: [{ label: 'Asia' }, { label: 'Europe' }] }]));
  assert.doesNotMatch(m.screen(), /Submit/, 'no tab bar for one question');
  m.press('down', 'down', 'enter', ...'Singa', 'esc');
  assert.match(m.screen(), /✎ Singa/); assert.equal(m.results.length, 0);
  m.press('enter', ...'pore', 'enter');
  assert.deepEqual(m.results[0].response.answers, [{ questionIndex: 0, kind: 'custom', answer: 'Singapore' }]);
});

test('draft round-trips through JSON, flushes in-progress text, and rejects stale shapes', async () => {
  const l = await libs();
  const m = mount(l);
  m.press('enter', '1', '3', 'down', 'enter', ...'half typed'); // Redis, Unit+E2E, editing custom
  m.c.flush();
  const json = JSON.parse(JSON.stringify(l.serializeDraft(m.draft)));
  const back = l.restoreDraft(record.questions, json);
  assert.equal(back.qs[0].choice, 0);
  assert.deepEqual([...back.qs[1].selected], [0, 2]);
  assert.equal(back.qs[1].custom, 'half typed');
  assert.match(mount(l, record, back).screen(), /■ Cache .*■ Tests/);
  assert.deepEqual(l.restoreDraft(record.questions, { ...json, qs: [json.qs[0]] }), l.createDraft(record.questions), 'question count changed');
  const odd = l.restoreDraft(record.questions, { ...json, tab: 9, qs: [{ choice: 7 }, { selected: [1, 99, -1] }] });
  assert.equal(odd.tab, 0); assert.equal(odd.qs[0].choice, undefined); assert.deepEqual([...odd.qs[1].selected], [1]);
});

test('presenter saves the TUI draft on Esc and on reload, restores it, and never treats it as an answer', async () => {
  const l = await libs();
  const { createJiti } = require(path.join(modules, 'jiti'));
  const jiti = createJiti(__filename, { alias: { '@earendil-works/pi-tui': path.join(modules, '@earendil-works/pi-tui/dist/index.js'), '@earendil-works/pi-coding-agent': path.join(modules, '@earendil-works/pi-coding-agent/dist/index.js') } });
  const { createQuestionStore } = await jiti.import(path.join(__dirname, 'store.ts'));
  const { createQuestionPresenter } = await jiti.import(path.join(__dirname, 'presenter.ts'));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-questions-draft-'));
  try {
    const store = createQuestionStore(root);
    const q = store.ask({ sessionId: 'w', recipientSessionId: 'main', agentName: 'W', key: 'k', questions: record.questions });
    const open = (presenter, script) => presenter.show({ mode: 'tui', ui: { notify() {}, async select(_t, o) { return o[0]; },
      custom(factory) { return new Promise(resolve => { const c = factory({ requestRender() {}, terminal: { rows: 40 } }, l.theme, l.keybindings, resolve); c.focused = true; script(c, presenter); }); } } });
    const first = createQuestionPresenter(store, 'main');
    await open(first, (c, p) => { c.handleInput('2'); for (const ch of 'n wip') c.handleInput(ch); p.close(); }); // reload while typing a note
    const saved = store.draft(q.id, 'main');
    assert.equal(saved.qs[0].choice, 1); assert.equal(saved.qs[1].notes, ' wip');
    assert.equal(store.pending('main').length, 1, 'draft is not an answer');
    let screen;
    const second = createQuestionPresenter(store, 'main');
    await open(second, c => { screen = strip(c.render(120).join('\n')); c.handleInput('\x1b'); });
    assert.match(screen, /■ Cache/); assert.match(screen, /📝\s+wip/);
    store.answer(q.id, 'main', { answers: [{ questionIndex: 0, answer: 'Redis' }, { questionIndex: 1, selected: ['Unit'] }] });
    assert.equal(store.draft(q.id, 'main'), undefined, 'answering removes the draft');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
