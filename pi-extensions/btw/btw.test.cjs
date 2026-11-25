const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loaderPath = path.join(__dirname, '..', 'node_modules', '@earendil-works', 'pi-coding-agent', 'dist', 'core', 'extensions', 'loader.js');

const ESC = '\x1b', ENTER = '\r';
const msg = (role, text, extra = []) => ({ type: 'message', message: { role, content: [{ type: 'text', text }, ...extra] } });
const reply = text => ({ role: 'assistant', stopReason: 'stop', content: [{ type: 'text', text }] });

// Loads /btw through Pi's real loader; every write path to the session is recorded.
async function start() {
  const { loadExtensions, createExtensionRuntime } = await import(loaderPath);
  const writes = [];
  const runtime = createExtensionRuntime();
  for (const name of ['sendMessage', 'sendUserMessage', 'appendEntry', 'setSessionName', 'setLabel']) {
    runtime[name] = (...args) => { writes.push(name); return undefined; };
  }
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], __dirname, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const command = loaded.extensions[0].commands.get('btw');
  assert.ok(command, '/btw is registered');
  return { command, writes };
}

// A fake command context. `complete` decides how the model answers.
function context({ entries = [msg('user', 'Fix the login bug'), msg('assistant', 'The token expires early.')], complete, model = { id: 'm', provider: 'p' }, mode = 'tui' } = {}) {
  const calls = { complete: [], notify: [], abort: 0, panels: [] };
  const ctx = {
    model, mode, hasUI: true,
    sessionManager: { buildContextEntries: () => entries },
    // Provider-neutral route only: streamSimple().result(). `complete` must not be used.
    modelRegistry: {
      streamSimple: (m, request, options) => {
        calls.complete.push({ model: m, request, options });
        return { result: async () => complete(request, options) };
      },
      complete: () => { calls.direct = (calls.direct || 0) + 1; return new Promise(() => {}); },
    },
    abort: () => { calls.abort++; },
    ui: {
      notify: (text, level) => calls.notify.push({ text, level }),
      custom: (factory, options) => new Promise(resolve => {
        const tui = { terminal: { rows: 40 }, requestRender: () => {} };
        const theme = { fg: (_c, s) => s, bold: s => s };
        const panel = factory(tui, theme, {}, resolve);
        calls.panels.push({ panel, options });
      }),
    },
  };
  return { ctx, calls };
}

const tick = () => new Promise(resolve => setImmediate(resolve));
const shown = panel => panel.render(80).join('\n');

test('idle question: model gets the conversation and the question, no tools, answer in an overlay', async () => {
  const { command, writes } = await start();
  const { ctx, calls } = context({ complete: () => reply('Because **refresh** runs late.') });
  const run = command.handler('why does it expire?', ctx);
  await tick(); await tick();
  assert.equal(calls.complete.length, 1);
  const { model, request, options } = calls.complete[0];
  assert.equal(model, ctx.model, 'uses the current model');
  assert.equal('tools' in request, false, 'no tool list is sent');
  assert.match(request.systemPrompt, /no tools/);
  const text = request.messages[0].content[0].text;
  assert.match(text, /User: Fix the login bug/);
  assert.match(text, /Assistant: The token expires early\./);
  assert.match(text, /Side question: why does it expire\?/);
  assert.ok(options.signal instanceof AbortSignal);
  const { panel, options: overlay } = calls.panels[0];
  assert.equal(overlay.overlay, true);
  assert.match(shown(panel), /refresh/);
  assert.match(shown(panel), /not saved to the session/);
  panel.handleInput(ESC);
  await run;
  assert.deepEqual(writes, [], 'nothing is written to the session');
  assert.equal(calls.abort, 0);
  assert.equal(calls.direct, undefined, 'the API-specific complete route is never used');
});

test('long conversations are cut to the newest part within the limit', async () => {
  const { buildRequest, keepTail, OMITTED } = await import('./context.ts');
  const entries = [msg('user', 'OLDEST ' + 'a'.repeat(5000)), msg('assistant', 'b'.repeat(5000) + ' NEWEST')];
  const text = buildRequest(entries, 'q', 2000).messages[0].content[0].text;
  const conversation = text.split('<conversation>\n')[1].split('\n</conversation>')[0];
  assert.ok(conversation.length <= 2000, `kept ${conversation.length}`);
  assert.ok(conversation.startsWith(OMITTED));
  assert.match(conversation, /NEWEST$/);
  assert.doesNotMatch(conversation, /OLDEST/);
  assert.equal(keepTail('short', 2000), 'short');
});

test('compaction summaries are kept; tool output is left out', async () => {
  const { conversationText } = await import('./context.ts');
  const text = conversationText([
    { type: 'compaction', summary: 'Earlier: chose JWT.' },
    msg('assistant', 'Reading files', [{ type: 'toolCall', name: 'read', arguments: { path: 'a' } }]),
    { type: 'message', message: { role: 'toolResult', content: [{ type: 'text', text: 'SECRET FILE BODY' }] } },
  ]);
  assert.match(text, /Summary of earlier conversation:\nEarlier: chose JWT\./);
  assert.match(text, /\(called tool read\)/);
  assert.doesNotMatch(text, /SECRET FILE BODY/);
});

test('no question: usage is shown and the model is not called', async () => {
  const { command } = await start();
  const { ctx, calls } = context({ complete: () => reply('x') });
  await command.handler('   ', ctx);
  assert.equal(calls.complete.length, 0);
  assert.deepEqual(calls.notify, [{ text: 'Usage: /btw <question>', level: 'warning' }]);
});

test('no model selected: the user is told to pick one and the model is not called', async () => {
  const { command } = await start();
  const { ctx, calls } = context({ model: null, complete: () => reply('x') });
  await command.handler('anything', ctx);
  assert.equal(calls.complete.length, 0);
  assert.equal(calls.notify.length, 1);
  assert.match(calls.notify[0].text, /\/model/);
});

test('Esc while waiting cancels only the side question', async () => {
  const { command, writes } = await start();
  let signal;
  const { ctx, calls } = context({ complete: (_r, options) => new Promise((_resolve, reject) => {
    signal = options.signal;
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  }) });
  const run = command.handler('still there?', ctx);
  await tick(); await tick();
  const { panel } = calls.panels[0];
  assert.match(shown(panel), /Thinking/);
  panel.handleInput(ENTER);
  assert.equal(signal.aborted, false, 'Enter does not cancel a pending answer');
  panel.handleInput(ESC);
  await run;
  assert.equal(signal.aborted, true, 'its own request is aborted');
  assert.equal(calls.abort, 0, 'the main run is not aborted');
  assert.equal(calls.notify.length, 0, 'no error after a cancel');
  assert.deepEqual(writes, []);
});

test('model failure is reported and the main run continues', async () => {
  const { command, writes } = await start();
  const { ctx, calls } = context({ complete: () => ({ role: 'assistant', stopReason: 'error', errorMessage: 'rate limited', content: [] }) });
  const run = command.handler('q', ctx);
  await tick(); await tick();
  const { panel } = calls.panels[0];
  assert.match(shown(panel), /btw failed: rate limited/);
  panel.handleInput(ENTER);
  await run;
  assert.equal(calls.abort, 0);
  assert.deepEqual(writes, []);

  const thrown = context({ mode: 'print', complete: () => { throw new Error('network down'); } });
  await command.handler('q', thrown.ctx);
  assert.deepEqual(thrown.calls.notify, [{ text: 'btw failed: network down', level: 'error' }]);
});

test('long answers scroll inside the panel', async () => {
  const { createPanel } = await import('./index.ts');
  const panel = createPanel('q', { terminal: { rows: 20 }, requestRender: () => {} }, undefined, () => {});
  panel.setState({ kind: 'answer', text: Array.from({ length: 60 }, (_, i) => `line ${i}`).join('\n\n') });
  const first = shown(panel);
  assert.match(first, /scroll 1-/);
  panel.handleInput('\x1b[6~'); // page down
  assert.notEqual(shown(panel), first);
  assert.doesNotMatch(shown(panel), /scroll 1-/);
});
