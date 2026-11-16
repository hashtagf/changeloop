const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Without the Claude subscription package Pi must still load, and /accounts must say how to fix it.
test('missing subscription package: Pi loads, /accounts explains the install, no provider is registered', async () => {
  const agentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-claude-accounts-missing-'));
  const previous = process.env.PI_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = agentDir;
  try {
    fs.writeFileSync(path.join(agentDir, 'auth.json'), JSON.stringify({ 'claude-subscription-account-work': { type: 'oauth', access: 'x', refresh: 'y', expires: Date.now() + 1e6 } }), { mode: 0o600 });
    const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
    const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist`);
    const { loadExtensions, createExtensionRuntime } = await import(pathToFileURL(path.join(base, 'core/extensions/loader.js')));
    const runtime = createExtensionRuntime(), providers = [];
    runtime.registerNativeProvider = provider => providers.push(provider.id);
    const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], agentDir, undefined, runtime);
    assert.deepEqual(loaded.errors, []);
    const command = loaded.extensions[0].commands.get('accounts');
    assert.ok(command, '/accounts is registered');
    const notices = [];
    const ctx = { hasUI: true, isIdle: () => true, hasPendingMessages: () => false, model: undefined,
      ui: { notify: (text, level) => notices.push({ text, level }), setStatus() {}, input: async () => undefined, select: async () => undefined } };
    await command.handler('add work', ctx);
    assert.equal(notices.at(-1).level, 'error');
    assert.match(notices.at(-1).text, /pi install git:github\.com\/inhumanxd\/pi-claude-subscription/);
    assert.deepEqual(providers, []);
  } finally {
    if (previous === undefined) delete process.env.PI_CODING_AGENT_DIR; else process.env.PI_CODING_AGENT_DIR = previous;
    fs.rmSync(agentDir, { recursive: true, force: true });
  }
});
