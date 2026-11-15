const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const store = require('./store.cjs');
const { readTranscript } = require('./transcript.cjs');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-agent-panel-test-'));
after(() => fs.rmSync(temporary, { recursive: true, force: true }));
const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
const modules = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules`);
async function libraries() {
  const { createJiti } = require(path.join(modules, 'jiti'));
  const tuiPath = path.join(modules, '@earendil-works/pi-tui/dist/index.js');
  const codingPath = path.join(modules, '@earendil-works/pi-coding-agent/dist/index.js');
  const jiti = createJiti(__filename, { alias: { '@earendil-works/pi-tui': tuiPath, '@earendil-works/pi-coding-agent': codingPath } });
  const coding = await jiti.import(codingPath); coding.initTheme('dark', false);
  const { KeybindingsManager } = await import(path.join(modules, '@earendil-works/pi-coding-agent/dist/core/keybindings.js'));
  const keybindings = new KeybindingsManager();
  return { ...(await jiti.import(path.join(__dirname, 'panel.ts'))),
    ...(await jiti.import(path.join(__dirname, 'dock.ts'))), ...(await jiti.import(path.join(__dirname, 'chat.ts'))), keybindings, ...(await import(tuiPath)) };
}
function session(file) {
  const entries = [
    { type: 'session', id: 'session-test', version: 3 },
    { type: 'message', id: 'system', parentId: null, message: { role: 'system', content: 'PRIVATE SYSTEM' } },
    { type: 'message', id: 'old', parentId: 'system', message: { role: 'assistant', content: [{ type: 'text', text: 'Wrong branch' }] } },
    { type: 'message', id: 'question', parentId: 'system', message: { role: 'user', content: 'ตรวจโค้ดนี้ให้หน่อย' } },
    { type: 'message', id: 'answer', parentId: 'question', message: { role: 'assistant', content: [
      { type: 'thinking', thinking: 'PRIVATE THINKING' }, { type: 'text', text: 'พบปัญหา cancellation\n' + 'details\n'.repeat(40) + '\u001b]52;c;bad\u0007\u001b[31mSafe text' }] } },
  ];
  fs.writeFileSync(file, entries.map(value => JSON.stringify(value)).join('\n') + '\n');
}
test('recent transcript follows the active branch, strips terminal controls and tolerates partial appends', () => {
  const file = path.join(temporary, 'transcript.jsonl'); session(file);
  fs.appendFileSync(file, '{"type":"message"');
  const text = JSON.stringify(readTranscript(file));
  assert.ok(text.includes('cancellation'));
  for (const forbidden of ['Wrong branch', 'PRIVATE SYSTEM', 'PRIVATE THINKING', '52;c;', '\\u001b']) assert.ok(!text.includes(forbidden), forbidden);
});
test('native chat renders Markdown and paired tool output, with expansion and no private reasoning', async () => {
  const { renderAgentChat } = await libraries();
  const { stripVTControlCharacters } = require('node:util');
  const file = path.join(temporary, 'native-tools.jsonl');
  const entries = [
    { type: 'session', id: 'native', version: 3 },
    { type: 'message', id: 'u', parentId: null, message: { role: 'user', content: 'Please inspect the build' } },
    { type: 'message', id: 'a', parentId: 'u', message: { role: 'assistant', content: [
      { type: 'text', text: '## Build result\n```js\nconst answer = 42;\n```' },
      { type: 'thinking', thinking: 'PRIVATE REASONING' },
      { type: 'toolCall', id: 'call', name: 'bash', arguments: { command: 'npm test\u001b]52;c;bad\u0007' } },
    ] } },
    { type: 'message', id: 'r', parentId: 'a', message: { role: 'toolResult', toolCallId: 'call', toolName: 'bash', isError: false,
      content: [{ type: 'text', text: Array.from({ length: 35 }, (_, i) => `test-output-${i}`).join('\n') }] } },
  ];
  fs.writeFileSync(file, entries.map(x => JSON.stringify(x)).join('\n') + '\n');
  const messages = readTranscript(file);
  assert.ok(!JSON.stringify(messages).includes('PRIVATE REASONING'));
  assert.ok(!JSON.stringify(messages).includes('52;c;'));
  const render = expanded => renderAgentChat(messages, {}, { cwd: temporary }, { terminal: { columns: 90, rows: 40 }, requestRender() {} }, 90, expanded);
  const collapsed = render(false), expanded = render(true);
  const text = stripVTControlCharacters(expanded.join('\n'));
  assert.ok(text.includes('Build result'));
  assert.ok(text.includes('const answer = 42'));
  assert.ok(text.includes('npm test'));
  assert.ok(text.includes('test-output-34'));
  assert.ok(expanded.length > collapsed.length, 'Native tool output expansion reveals full bounded output');
});
test('Down enters dock selection; arrows browse, Enter selects without sending, Escape cancels', async () => {
  const { AgentDock, wrapAgentNavigation, Editor } = await libraries();
  const root = path.join(temporary, 'arrow-test');
  for (const id of ['main', 'reviewer', 'tester']) store.register(root, { id, name: id, parentId: id === 'main' ? undefined : 'main', status: 'idle' });
  const theme = { borderColor: text => text, selectList: {
    selectedPrefix: text => text, selectedText: text => text, description: text => text,
    scrollInfo: text => text, noMatch: text => text,
  } };
  const editor = new Editor({ terminal: { columns: 80, rows: 24 }, requestRender() {} }, theme);
  let submitted = 0;
  const opened = [];
  editor.onSubmit = () => { submitted++; };
  const dock = new AgentDock({ self: 'main', changed() {}, open: id => opened.push(id) });
  dock.update(store.list(root));
  wrapAgentNavigation(editor, () => dock);
  editor.render(80);
  editor.handleInput('main draft');
  editor.handleInput('\x1b[B');
  assert.equal(dock.isPicking, true);
  assert.equal(editor.focused, false);
  editor.handleInput('\x1b[B');
  assert.equal(dock.activeAgentId, undefined, 'Browsing does not select yet');
  assert.equal(opened.length, 0);
  editor.handleInput('\r');
  assert.equal(dock.isPicking, false);
  assert.ok(dock.activeAgentId);
  assert.equal(opened[0], dock.activeAgentId, 'Confirming opens that agent’s history directly');
  assert.equal(submitted, 0, 'Enter selected a destination, never submitted the saved draft');
  assert.equal(editor.getText(), 'main draft', 'Main editor is never repurposed for worker input');
  editor.handleInput('\x1b[B');
  editor.handleInput('\x1b[B');
  const selected = dock.activeAgentId;
  editor.handleInput('\x1b');
  assert.equal(dock.activeAgentId, selected, 'Escape cancels the highlighted candidate');
  assert.equal(dock.isPicking, false);
  dock.home(); assert.equal(editor.getText(), 'main draft');
  // Normal multiline movement still happens before the selector can take focus.
  editor.setText('line one\nline two');
  editor.handleInput('\x1b[H');
  editor.handleInput('\x1b[A');
  assert.equal(editor.getCursor().line, 0);
  editor.handleInput('\x1b[B');
  assert.equal(editor.getCursor().line, 1);
  assert.equal(dock.isPicking, false);
});
test('one dock handles filtering, offline history and narrow terminals', async () => {
  const { AgentDock, visibleWidth } = await libraries();
  const root = path.join(temporary, 'dock-test');
  for (const [id, name] of [['main', 'Main'], ['reviewer', 'Reviewer'], ['tester', 'Tester'], ['stopped', 'Old worker']]) {
    store.register(root, { id, name, parentId: id === 'main' ? undefined : 'main', status: id === 'stopped' ? 'offline' : 'working' });
  }
  const dock = new AgentDock({ self: 'main', changed() {}, open() {} });
  dock.update(store.list(root));
  const theme = { fg: (_color, value) => value };
  assert.ok(dock.render(100, theme).join('\n').includes('[Main]'));
  assert.ok(!dock.render(100, theme).join('\n').includes('Old worker'));
  dock.beginPick(); dock.navigate('Reviewer');
  assert.ok(dock.render(100, theme).join('\n').includes('Reviewer'));
  assert.ok(!dock.render(100, theme).join('\n').includes('Tester'));
  dock.navigate('\r'); assert.equal(dock.activeAgentId, 'reviewer');
  dock.beginPick(true); dock.navigate('Old worker'); dock.navigate('\r');
  assert.equal(dock.activeAgentId, 'stopped', 'Offline history uses the same picker');
  dock.home();
  for (let i = 0; i < 12; i++) {
    dock.cycle();
    for (const width of [25, 40, 80, 120]) {
      const lines = dock.render(width, theme);
      assert.ok(lines.every(line => visibleWidth(line) <= width));
      assert.ok(lines.length <= 6);
      assert.ok(!lines.join('\n').includes('Find >'));
    }
  }
});
test('dock selection and offline history stay within the current session descendants', async () => {
  const { AgentDock } = await libraries();
  const opened = [], theme = { fg: (_color, text) => text };
  const members = [
    { id: 'other', name: 'Unrelated session', online: true },
    { id: 'outsider', name: 'Other worker', parentId: 'other', online: true },
    { id: 'main', name: 'Coordinator', online: true },
    { id: 'child', name: 'My worker', parentId: 'main', online: true },
    { id: 'grandchild', name: 'Nested worker', parentId: 'child', online: true },
    { id: 'offline', name: 'Saved worker', parentId: 'main', online: false },
    { id: 'sibling', name: 'Sibling worker', parentId: 'other', online: true },
  ].map((member, i) => ({ status: 'idle', createdAt: i, cwd: '/same-project', ...member }));
  const dock = new AgentDock({ self: 'main', changed() {}, open: id => opened.push(id) });
  dock.update(members);
  dock.beginPick(true);
  const rendered = dock.render(120, theme, 60).join('\n');
  for (const label of ['Main', 'My worker', 'Nested worker', 'Saved worker']) assert.ok(rendered.includes(label), label);
  for (const label of ['Unrelated session', 'Other worker', 'Sibling worker']) assert.ok(!rendered.includes(label), label);
  dock.select('outsider'); assert.equal(opened.length, 0);
  dock.select('grandchild'); assert.equal(dock.activeAgentId, 'grandchild');
  dock.update(members.map(member => member.id === 'child' ? { ...member, parentId: 'other' } : member));
  assert.equal(dock.activeAgentId, undefined, 'A worker moved out of this session returns the dock to Main');
  assert.equal(opened.at(-1), 'main');
  const childDock = new AgentDock({ self: 'child', changed() {}, open() {} });
  childDock.update(members); childDock.beginPick(true);
  const childView = childDock.render(120, theme, 60).join('\n');
  assert.ok(childView.includes('Nested worker'));
  assert.ok(!childView.includes('Saved worker'), 'A worker session does not inherit its parent’s other workers');
});
test('switching, direct steering/follow-up, drafts and return to main preserve running sessions', async () => {
  const { AgentPanel, AgentDock, visibleWidth, keybindings } = await libraries();
  const root = path.join(temporary, 'members-test');
  const file = path.join(temporary, 'worker.jsonl'); session(file);
  const before = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  for (const [id, name] of [['main', 'Coordinator'], ['reviewer', 'Reviewer'], ['tester', 'Tester']]) {
    store.register(root, { id, name, parentId: id === 'main' ? undefined : 'main', status: id === 'main' ? 'idle' : 'working', sessionFile: file });
    if (id !== 'main') {
      const meta = store.read(path.join(store.dir(root, id), 'meta.json'));
      store.atomic(path.join(store.dir(root, id), 'meta.json'), { ...meta, kind: 'managed', parentId: 'main', task: `${name} task` });
    }
  }
  store.atomic(path.join(store.dir(root, 'reviewer'), 'live.json'), { streaming: true, text: 'Live progress ทดสอบ', tools: ['bash'] });
  let closed = 0;
  const terminal = { rows: 28, columns: 90 };
  let panel;
  const drafts = new Map();
  const dock = new AgentDock({ self: 'main', changed() {}, open: id => id === 'main' ? panel?.close() : panel?.show() });
  dock.update(store.list(root)); dock.select('reviewer');
  panel = new AgentPanel({ root, dock, drafts, keybindings, tui: { terminal, requestRender() {} },
    theme: { fg: (_color, text) => text, bold: text => text },
    done: () => { closed++; }, send: (id, text, delivery) => store.send(root, 'main', id, text, { delivery }),
    stop: id => store.stop(root, id) });
  panel.focused = true;
  try {
    assert.equal(panel.activeAgentId, 'reviewer');
    assert.ok(panel.render(90).join('\n').includes('Live progress'));
    panel.handleInput('แก้ cancellation'); panel.handleInput('\r');
    assert.equal(store.inbox(root, 'reviewer')[0].delivery, 'steer');
    assert.equal(store.inbox(root, 'reviewer')[0].message, 'แก้ cancellation');
    panel.handleInput('\x1b[200~line one\nline two\x1b[201~');
    panel.handleInput('\r');
    assert.equal(store.inbox(root, 'reviewer')[0].message, 'line one\nline two', 'Native editor preserves multiline paste');
    panel.handleInput('draft stays'); panel.handleInput('\t');
    assert.equal(panel.activeAgentId, 'tester');
    panel.handleInput('run tests later'); panel.handleInput('\x1b\r');
    assert.equal(store.inbox(root, 'tester')[0].delivery, 'followUp');
    panel.handleInput('\x1b[Z');
    assert.equal(panel.activeAgentId, 'reviewer');
    assert.ok(panel.render(90).join('\n').includes('draft stays'), panel.render(90).join('\n'));
    for (const rows of [8, 12, 24, 50, 80]) for (const width of [25, 40, 80, 120]) {
      terminal.rows = rows;
      for (const line of panel.render(width)) assert.equal(visibleWidth(line), width, 'Every row covers the main conversation');
      assert.equal(panel.render(width).length, rows, 'Worker chat uses the entire terminal height');
      assert.ok(panel.render(width).join('\n').includes('To:'), 'Agent switching remains available in the full-screen view');
    }
    terminal.rows = 28;
    panel.handleInput('\x1b[5~'); // Page up
    assert.ok(panel.render(90).join('\n').includes('history'));
    panel.handleInput('\x18'); // Ctrl+X stops only the selected worker, without a model.
    assert.ok(fs.existsSync(path.join(store.dir(root, 'reviewer'), 'stop.json')));
    assert.ok(!fs.existsSync(path.join(store.dir(root, 'tester'), 'stop.json')));
    assert.ok(panel.render(90).join('\n').includes('Stop requested'));
    panel.handleInput('\x11'); // Ctrl+Q back to list
    assert.equal(dock.isPicking, true);
    panel.handleInput('\x1b'); // Cancel selection without closing the chat.
    panel.handleInput('\x1b');
    assert.equal(closed, 1);
    assert.equal(drafts.get('reviewer'), 'draft stays');
    assert.equal(store.member(root, 'reviewer').status, 'working');
    assert.equal(store.member(root, 'tester').status, 'working');
    assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), before);
  } finally { panel.close(); }
});
