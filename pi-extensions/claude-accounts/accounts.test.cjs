const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-claude-accounts-'));
process.env.PI_CODING_AGENT_DIR = temporary;
// The extension resolves the subscription package from the agent dir; link the installed copy in.
const SUBSCRIPTION = path.join(os.homedir(), '.pi/agent/git/github.com/inhumanxd/pi-claude-subscription');
fs.mkdirSync(path.join(temporary, 'git/github.com/inhumanxd'), { recursive: true });
fs.symlinkSync(SUBSCRIPTION, path.join(temporary, 'git/github.com/inhumanxd/pi-claude-subscription'), 'dir');
const subscriptionEntry = path.join(SUBSCRIPTION, 'index.ts');
const authPath = path.join(temporary, 'auth.json');
const BASE = 'claude-subscription';
const WORK = BASE + '-account-work';
const credential = name => ({ type: 'oauth', access: 'sk-ant-oat01-' + name, refresh: 'refresh-' + name,
  expires: Date.now() + 86400000, deviceId: 'a'.repeat(64), accountId: name, email: name + '@example.test', orgId: 'org-' + name });
fs.writeFileSync(authPath, JSON.stringify({ [BASE]: credential('original'), [WORK]: credential('work') }), { mode: 0o600 });
const originalFetch = global.fetch;
let authUrl, tokenCalls = 0, refreshCalls = 0;
global.fetch = async (url, init) => {
  if (!String(url).endsWith('/v1/oauth/token')) throw Error('Unexpected external request');
  const body = JSON.parse(init.body);
  if (body.grant_type === 'refresh_token') {
    refreshCalls++;
    const name = body.refresh_token.replace('refresh-', '');
    return new Response(JSON.stringify({ access_token: 'sk-ant-oat01-refreshed-' + name,
      refresh_token: 'refresh-' + name, expires_in: 3600 }), { status: 200 });
  }
  tokenCalls++;
  assert.equal(body.grant_type, 'authorization_code');
  assert.equal(body.code, 'test-code');
  return new Response(JSON.stringify({ access_token: 'sk-ant-oat01-personal', refresh_token: 'refresh-personal', expires_in: 3600,
    account: { uuid: 'personal', email_address: 'personal@example.test' }, organization: { uuid: 'org-personal' } }), { status: 200 });
};
const imports = (async () => {
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist`);
  const loader = await import(pathToFileURL(path.join(base, 'core/extensions/loader.js')));
  const { ModelRuntime } = await import(pathToFileURL(path.join(base, 'core/model-runtime.js')));
  const { ModelRegistry } = await import(pathToFileURL(path.join(base, 'core/model-registry.js')));
  return { ...loader, ModelRuntime, ModelRegistry };
})();
async function instance() {
  const { loadExtensions, createExtensionRuntime, ModelRuntime, ModelRegistry } = await imports;
  const models = await ModelRuntime.create({ authPath, modelsPath: null, refreshOnCreate: false });
  const runtime = createExtensionRuntime();
  runtime.registerNativeProvider = provider => models.registerNativeProvider(provider);
  runtime.getSettings = () => ({ defaultModel: 'claude-haiku-4-5' });
  const notices = [], statuses = [], registry = new ModelRegistry(models);
  const loaded = await loadExtensions([subscriptionEntry, path.join(__dirname, 'index.ts')], temporary, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const ext = loaded.extensions[1];
  const savedProvider = models.getProvider(WORK);
  assert.ok(savedProvider);
  const ctx = { model: registry.find(WORK, 'claude-haiku-4-5'), modelRegistry: registry,
    hasUI: true, isIdle: () => true, hasPendingMessages: () => false,
    ui: { notify(message, kind) { notices.push({ message, kind }); const match = message.match(/(?:https:\/\/claude.ai\/oauth\/authorize\?\S+|http:\/\/localhost:54545\/signin)/); if (match) authUrl = new URL(match[0]); },
      setStatus(key, value) { statuses.push(value); },
      async input() {
        if (authUrl.pathname === '/signin') {
          const response = await originalFetch(authUrl, { redirect: 'manual' });
          assert.equal(response.status, 302);
          authUrl = new URL(response.headers.get('location'));
          assert.equal(authUrl.searchParams.get('client_id'), '9d1c250a-e61b-44d9-88ed-5944d1962f5e');
        }
        return 'http://localhost:54545/callback?code=test-code&state=' + authUrl.searchParams.get('state');
      }, async select() {} } };
  runtime.setModel = async model => { ctx.model = model; return true; };
  const command = ext.commands.get('accounts');
  const run = args => command.handler(args, ctx);
  return { ctx, run, notices, statuses, registry, models, ext };
}
after(() => { global.fetch = originalFetch; fs.rmSync(temporary, { recursive: true, force: true }); });

test('real Pi loader registers isolated account providers; selections do not affect another session', async () => {
  const first = await instance(), second = await instance();
  assert.ok(first.registry.find(WORK, 'claude-haiku-4-5'));
  await first.run('use default');
  assert.equal(first.ctx.model.provider, BASE);
  assert.equal(second.ctx.model.provider, WORK);
  const auth = await second.registry.getApiKeyAndHeaders(second.ctx.model);
  assert.equal(auth.apiKey, credential('work').access);
  assert.equal(tokenCalls, 0);
  const before = first.ctx.model;
  first.ctx.isIdle = () => false;
  await first.run('use work');
  assert.equal(first.ctx.model, before);
  assert.ok(first.notices.at(-1).message.includes('current turn'));
  await first.run('list');
  assert.ok(!JSON.stringify(first.notices).includes('refresh-work'));
});

test('add signs into a separate credential slot, accepts full callback, retains current account and survives reload', async () => {
  const app = await instance();
  const previous = JSON.parse(fs.readFileSync(authPath));
  await app.run('add personal');
  assert.ok(app.notices.some(x => x.message.includes('Account personal saved.')), JSON.stringify(app.notices));
  assert.equal(tokenCalls, 1);
  const after = JSON.parse(fs.readFileSync(authPath));
  assert.deepEqual(after[BASE], previous[BASE]);
  assert.deepEqual(after[WORK], previous[WORK]);
  assert.equal(after[BASE + '-account-personal'].accountId, 'personal');
  assert.equal(app.ctx.model.provider, WORK);
  await app.run('use personal');
  assert.equal(app.ctx.model.provider, BASE + '-account-personal');
  const reloaded = await instance();
  assert.ok(reloaded.registry.find(BASE + '-account-personal', 'claude-haiku-4-5'));
  await app.run('add personal');
  assert.ok(app.notices.at(-1).message.includes('already exists'));
  await app.run('add ../../bad');
  assert.equal(tokenCalls, 1);
  assert.ok(!JSON.stringify(app.notices).includes('sk-ant-oat01-personal'));
  assert.equal(fs.statSync(authPath).mode & 0o077, 0);
});

test('cancelled login leaves credentials untouched and does not poison the next sign-in', async () => {
  const app = await instance();
  const before = fs.readFileSync(authPath, 'utf8');
  app.ctx.ui.input = async () => undefined;
  let login = app.run('add cancelled');
  while (!app.notices.some(x => x.message.includes('Callback input closed'))) await new Promise(done => setTimeout(done, 10));
  await app.run('cancel');
  await login;
  assert.ok(app.notices.at(-1).message.includes('cancelled'));
  assert.equal(fs.readFileSync(authPath, 'utf8'), before);
  assert.equal(tokenCalls, 1);
  login = app.run('add cancelled');
  while (!app.notices.at(-1).message.includes('Callback input closed')) await new Promise(done => setTimeout(done, 10));
  await app.run('cancel');
  await login;
  assert.ok(!app.notices.at(-1).message.includes('already in progress'));
});

test('closing callback input does not cancel OAuth and the browser can still finish', async () => {
  const app = await instance();
  app.ctx.ui.input = async () => undefined;
  const login = app.run('add hidden-input');
  const deadline = Date.now() + 5000;
  while (!app.notices.some(x => x.message.includes('Callback input closed'))) {
    if (Date.now() > deadline) throw Error('Missing hidden-input notice');
    await new Promise(done => setTimeout(done, 10));
  }
  await new Promise(done => setTimeout(done, 11000));
  assert.ok(!app.notices.some(x => x.kind === 'error'), 'Closing the input must not end sign-in after ten seconds');
  const redirect = await originalFetch('http://localhost:54545/signin', { redirect: 'manual' });
  assert.equal(redirect.status, 302);
  const url = new URL(redirect.headers.get('location'));
  const response = await originalFetch('http://localhost:54545/callback?code=test-code&state=' + url.searchParams.get('state'));
  assert.equal(response.status, 200);
  await login;
  assert.ok(app.notices.some(x => x.message.includes('Account hidden-input saved.')));
});

test('concurrent credential refresh stays isolated per account and preserves default credentials', async () => {
  const app = await instance();
  const data = JSON.parse(fs.readFileSync(authPath));
  const original = structuredClone(data[BASE]);
  data[WORK].expires = 0;
  data[BASE + '-account-personal'].expires = 0;
  fs.writeFileSync(authPath, JSON.stringify(data), { mode: 0o600 });
  const models = [WORK, BASE + '-account-personal'].map(provider => app.registry.find(provider, 'claude-haiku-4-5'));
  const results = await Promise.all(models.map(model => app.registry.getApiKeyAndHeaders(model)));
  assert.equal(refreshCalls, 2);
  assert.equal(results[0].apiKey, 'sk-ant-oat01-refreshed-work');
  assert.equal(results[1].apiKey, 'sk-ant-oat01-refreshed-personal');
  const saved = JSON.parse(fs.readFileSync(authPath));
  assert.deepEqual(saved[BASE], original);
  assert.equal(saved[WORK].accountId, 'work');
  assert.equal(saved[BASE + '-account-personal'].accountId, 'personal');
});

test('real Pi RPC loads the selected account and handles account listing without inference', async () => {
  const { spawn } = require('node:child_process');
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const cli = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js`);
  const child = spawn(process.execPath, [cli, '--mode', 'rpc', '--no-extensions', '--extension',
    subscriptionEntry, '--extension', path.join(__dirname, 'index.ts'),
    '--provider', WORK, '--model', 'claude-haiku-4-5', '--session-dir', path.join(temporary, 'sessions')],
    { cwd: temporary, env: process.env, stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', errors = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { errors += data; });
  const until = async predicate => {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) { if (predicate()) return; await new Promise(done => setTimeout(done, 50)); }
    throw Error('Timed out: ' + errors + output.slice(-1000));
  };
  try {
    child.stdin.write(JSON.stringify({ type: 'get_state', id: 'state' }) + '\n');
    await until(() => output.split('\n').some(line => { try { return JSON.parse(line).id === 'state'; } catch { return false; } }));
    const state = output.split('\n').map(line => { try { return JSON.parse(line); } catch { return {}; } }).find(row => row.id === 'state');
    assert.equal(state.data.model.provider, WORK);
    child.stdin.write(JSON.stringify({ type: 'prompt', id: 'list', message: '/accounts list' }) + '\n');
    await until(() => output.includes('work@example.test') && output.includes('"id":"list"'));
    assert.ok(!output.includes('"type":"agent_start"'));
    assert.ok(!output.includes('sk-ant-oat01-work'));
    assert.ok(!errors.includes('Failed to load extension'), errors);
  } finally {
    child.stdin.end(); child.kill('SIGTERM');
    await new Promise(done => child.once('close', done));
  }
});

test('rename preserves credential bytes and active session providers; new names survive reload and collisions are refused', async () => {
  const app = await instance(), other = await instance();
  const before = fs.readFileSync(authPath, 'utf8');
  const calls = tokenCalls;
  await app.run('rename work office');
  assert.ok(app.notices.at(-1).message.includes('Renamed Claude account work → office'));
  assert.equal(fs.readFileSync(authPath, 'utf8'), before);
  assert.equal(app.ctx.model.provider, WORK);
  assert.equal(other.ctx.model.provider, WORK);
  await app.run('use office');
  assert.equal(app.ctx.model.provider, WORK);
  await other.run('list');
  assert.ok(other.notices.at(-1).message.includes('office · work@example.test'));
  const reloaded = await instance();
  await reloaded.run('use office');
  assert.equal(reloaded.ctx.model.provider, WORK);
  const names = fs.readFileSync(path.join(temporary, 'claude-account-names.json'), 'utf8');
  await app.run('rename office personal');
  assert.ok(app.notices.at(-1).message.includes('already exists'));
  await app.run('rename office ../../bad');
  assert.equal(fs.readFileSync(path.join(temporary, 'claude-account-names.json'), 'utf8'), names);
  await app.run('add work');
  assert.ok(app.notices.at(-1).message.includes('renamed credential slot'));
  await app.run('rename default primary');
  await app.run('use default');
  assert.equal(app.ctx.model.provider, BASE);
  await app.run('use primary');
  assert.equal(app.ctx.model.provider, BASE);
  assert.equal(fs.readFileSync(authPath, 'utf8'), before);
  assert.equal(tokenCalls, calls);
});
