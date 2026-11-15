const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const store = require('./store.cjs');

test('reload replaces stale native CJS modules and batches reports in the same process', async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-team-reload-'));
  const previousRoot = process.env.PI_TEAM_ROOT;
  process.env.PI_TEAM_ROOT = temporary;
  const storePath = require.resolve('./store.cjs');
  // Simulate a running pre-upgrade session whose native require cache lacks the API.
  require.cache[storePath].exports = { ...store, deliverBatch: undefined };
  delete require.cache[require.resolve('./reports.cjs')];
  require('./reports.cjs'); // It captures the obsolete store object, too.
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent`);
  const { loadExtensions, createExtensionRuntime } = await import(path.join(base, 'dist/core/extensions/loader.js'));
  let extension;
  const messages = [], errors = [];
  const ctx = { getContextUsage: () => ({ tokens: 900000, contextWindow: 1000000 }),
    compact() { throw new Error('Agent team must leave compaction to native Pi'); },
    cwd: temporary, isIdle: () => true, hasPendingMessages: () => false,
    sessionManager: { getSessionId: () => 'reload-main', getSessionFile: () => undefined },
    ui: { setStatus() {}, notify(text, level) { if (level === 'error') errors.push(text); } } };
  async function load() {
    const runtime = createExtensionRuntime();
    runtime.sendMessage = (message, options) => messages.push({ message, options });
    const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], temporary, undefined, runtime);
    assert.deepEqual(loaded.errors, []);
    extension = loaded.extensions[0];
    for (const handler of extension.handlers.get('session_start')) await handler({}, ctx);
  }
  async function shutdown() {
    for (const handler of extension?.handlers.get('session_shutdown') ?? []) await handler({}, ctx);
    extension = undefined;
  }
  try {
    await load();
    assert.deepEqual(errors, [], 'reload must replace both store and modules holding stale references');
    const self = store.sessionId('reload-main');
    store.register(temporary, { id: 'child', status: 'idle' });
    store.send(temporary, 'child', self, 'first result', { type: 'result' });
    store.send(temporary, 'child', self, 'second result', { type: 'result' });
    await extension.commands.get('agents').handler('reports quiet', ctx);
    await shutdown();
    await load();
    assert.equal(messages.length, 0, 'reload preserves quiet mode and pending inbox');
    await extension.commands.get('agents').handler('reports flush', ctx);
    assert.deepEqual(errors, []);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].message.details.count, 2);
    await shutdown();
    await load();
    await extension.commands.get('agents').handler('reports flush', ctx);
    assert.equal(messages.length, 1, 'receipts prevent replay across repeated reloads');
  } finally {
    await shutdown();
    if (previousRoot === undefined) delete process.env.PI_TEAM_ROOT;
    else process.env.PI_TEAM_ROOT = previousRoot;
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
