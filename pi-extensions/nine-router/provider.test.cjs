const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { loadNineRouterConfig, DEFAULT_BASE_URL } = require('./config.ts');
const { fetchModels, parseModelList, resolveKey } = require('./models.ts');
const nineRouter = require('./index.ts').default;

function withConfigHome(content, run) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-ext-9r-'));
  try {
    if (content !== undefined) {
      fs.mkdirSync(path.join(home, 'pi-extensions'));
      fs.writeFileSync(path.join(home, 'pi-extensions', 'config.json'), content);
    }
    return run(home);
  } finally { fs.rmSync(home, { recursive: true, force: true }); }
}

function register(env) {
  const calls = [];
  const pi = { registerProvider: (provider, config) => calls.push(config ? config : provider) };
  const warn = console.warn; console.warn = () => {};
  try { nineRouter(pi, env); } finally { console.warn = warn; }
  assert.equal(calls.length, 1);
  return calls[0];
}

async function withServer(handler, run) {
  const requests = [];
  const server = http.createServer((req, res) => { requests.push({ url: req.url, headers: req.headers }); handler(req, res); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/v1`;
  try { return await run(baseUrl, requests); }
  finally { server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); }
}

const json = body => (req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };

function loginInteraction(values) {
  const prompts = [];
  return {
    prompts, signal: new AbortController().signal, notify() {},
    async prompt(prompt) {
      prompts.push(prompt);
      const value = values.shift();
      if (value instanceof Error) throw value;
      assert.notEqual(value, undefined, 'unexpected prompt');
      return value;
    },
  };
}

async function runtime(env, store) {
  const { createModels } = await import('@earendil-works/pi-ai');
  const runtime = createModels({ modelsStore: store });
  runtime.setProvider(register(env));
  return runtime;
}

test('native login saves URL and key and refreshes the same Pi runtime', () => withServer(json({ data: [{ id: 'from-login' }] }), async (baseUrl, requests) => {
  const models = await runtime({});
  const interaction = loginInteraction([`${baseUrl}/`, 'new-key']);
  const credential = await models.login('9router', 'api_key', interaction);
  assert.equal(interaction.prompts[0].type, 'text');
  assert.equal(interaction.prompts[1].type, 'secret');
  assert.equal(credential.key, 'new-key');
  assert.equal((await models.getAuth('9router')).auth.baseUrl, baseUrl);
  const result = await models.refresh({ providers: ['9router'] });
  assert.ifError(result.errors.get('9router'));
  assert.deepEqual((await models.getAvailable('9router')).map(model => [model.id, model.baseUrl]), [['from-login', baseUrl]]);
  assert.equal(requests[0].headers.authorization, 'Bearer new-key');
}));

test('invalid input is retried before asking for a key or saving', async () => {
  const models = await runtime({});
  const interaction = loginInteraction(['not a URL', 'https://user:secret@router.example/v1', 'https://router.example/v1?key=x', 'https://router.example/v1', 'key']);
  await models.login('9router', 'api_key', interaction);
  assert.deepEqual(interaction.prompts.map(prompt => prompt.type), ['text', 'text', 'text', 'text', 'secret']);
  assert.equal((await models.getAuth('9router')).auth.baseUrl, 'https://router.example/v1');
});

test('cancelling after entering a URL retains the old credential and destination', async () => {
  const models = await runtime({});
  await models.login('9router', 'api_key', loginInteraction(['https://old.example/v1', 'old-key']));
  await assert.rejects(models.login('9router', 'api_key', loginInteraction(['https://new.example/v1', new Error('Login cancelled')])), /Login cancelled/);
  assert.deepEqual((await models.getAuth('9router')).auth, { baseUrl: 'https://old.example/v1', apiKey: 'old-key' });
});

test('an old stored key uses the configured URL without a new login', () => withConfigHome('{"nineRouter":{"baseUrl":"https://file.example/v1"}}', async home => {
  const provider = register({ XDG_CONFIG_HOME: home });
  const auth = await provider.auth.apiKey.resolve({ credential: { type: 'api_key', key: 'old-key' } });
  assert.deepEqual(auth.auth, { apiKey: 'old-key', baseUrl: 'https://file.example/v1' });
}));

test('login shows the env-enforced URL and never prompts for an ineffective edit', async () => {
  const models = await runtime({ NINEROUTER_BASE_URL: 'https://env.example/v1' });
  const interaction = loginInteraction(['env-key']);
  await models.login('9router', 'api_key', interaction);
  assert.equal(interaction.prompts.length, 1);
  assert.equal(interaction.prompts[0].type, 'secret');
  assert.match(interaction.prompts[0].message, /https:\/\/env\.example\/v1/);
  assert.equal((await models.getAuth('9router')).auth.baseUrl, 'https://env.example/v1');
});

// provider-registration
test('env URL and key configure 9router without login', () => withConfigHome(undefined, async home => {
  const provider = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: 'https://router.example.com/v1/', NINEROUTER_API_KEY: 'secret-key' });
  assert.equal(provider.id, '9router');
  assert.equal(provider.baseUrl, 'https://router.example.com/v1');
  assert.equal((await provider.auth.apiKey.resolve({})).auth.apiKey, 'secret-key');
  assert.deepEqual(provider.getModels(), []);
}));

test('the config file supplies the URL when the env var is unset', () => withConfigHome('{"nineRouter":{"baseUrl":"http://10.0.0.5:20128/v1"}}', home => {
  assert.equal(loadNineRouterConfig({ XDG_CONFIG_HOME: home }).baseUrl, 'http://10.0.0.5:20128/v1');
}));

test('no configuration uses the 9router default and leaves apiKey for /login', () => withConfigHome(undefined, home => {
  const provider = register({ XDG_CONFIG_HOME: home });
  assert.equal(provider.baseUrl, DEFAULT_BASE_URL);
  assert.equal(typeof provider.auth.apiKey.login, 'function');
}));

test('a non-http URL in the config file falls back with a key-free warning', () => withConfigHome('{"nineRouter":{"baseUrl":"ftp://x"}}', home => {
  const warnings = [];
  const config = loadNineRouterConfig({ XDG_CONFIG_HOME: home, NINEROUTER_API_KEY: 'secret-key' }, w => warnings.push(w));
  assert.equal(config.baseUrl, DEFAULT_BASE_URL);
  assert.equal(warnings.length, 1);
  assert.doesNotMatch(warnings[0], /secret-key/);
}));

test('malformed config JSON falls back without throwing', () => withConfigHome('{not json', home => {
  const warnings = [];
  assert.equal(loadNineRouterConfig({ XDG_CONFIG_HOME: home }, w => warnings.push(w)).baseUrl, DEFAULT_BASE_URL);
  assert.equal(warnings.length, 1);
}));

// model-discovery
test('refreshModels maps the 9router catalog and sends the bearer key', () => withConfigHome(undefined, home => withServer(json({
  object: 'list',
  data: [
    { id: 'kr/claude-sonnet-4.5', object: 'model', context_length: 200000, max_completion_tokens: 64000, capabilities: { vision: true }, thinking_levels: ['low', 'high'] },
    { id: 'my-combo', object: 'model' },
    { id: 'my-combo' },
    { object: 'model' },
  ],
}), async (baseUrl, requests) => {
  const provider = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  const published = [];
  await provider.refreshModels({ allowNetwork: true, signal: new AbortController().signal, credential: { type: 'api_key', key: 'test-key' }, publish: async p => { published.push(p); p.update?.(); return true; } });
  const models = provider.getModels().map(({ type, provider, api, baseUrl, ...model }) => model);
  assert.equal(published.length, 1);
  assert.deepEqual(published[0].persist.models.map(m => [m.provider, m.id, m.api, m.baseUrl]), [['9router', 'kr/claude-sonnet-4.5', 'openai-completions', baseUrl], ['9router', 'my-combo', 'openai-completions', baseUrl]]);
  assert.equal(typeof published[0].persist.checkedAt, 'number');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/v1/models');
  assert.equal(requests[0].headers.authorization, 'Bearer test-key');
  assert.equal(models.length, 2);
  assert.deepEqual(models[0], { id: 'kr/claude-sonnet-4.5', name: 'kr/claude-sonnet-4.5', reasoning: true, input: ['text', 'image'], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 200000, maxTokens: 64000 });
  assert.deepEqual(models[1], { id: 'my-combo', name: 'my-combo', reasoning: false, input: ['text'], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128000, maxTokens: 16384 });
})));

test('without network refreshModels returns only the saved 9router models', () => withConfigHome(undefined, home => withServer(json({ data: [{ id: 'x' }] }), async (baseUrl, requests) => {
  const provider = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  const stored = { models: [
    { id: 'kr/a', name: 'kr/a', provider: '9router', api: 'openai-completions', reasoning: true, input: ['text', 'image'], contextWindow: 200000, maxTokens: 8000 },
    { id: 'gpt-x', provider: 'openai', api: 'openai-completions' },
  ] };
  await provider.refreshModels({ allowNetwork: false, stored, signal: new AbortController().signal, publish: async p => { assert.equal(p.persist, undefined); p.update(); return true; } });
  assert.deepEqual(provider.getModels().map(model => model.id), ['kr/a']);
  assert.equal(requests.length, 0);
})));

test('without network and nothing saved refreshModels returns no models', () => withConfigHome(undefined, home => withServer(json({ data: [{ id: 'x' }] }), async (baseUrl, requests) => {
  const provider = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  await provider.refreshModels({ allowNetwork: false, signal: new AbortController().signal });
  assert.deepEqual(provider.getModels(), []);
  assert.equal(requests.length, 0);
})));

test('a failed refresh does not publish over the saved catalog', () => withConfigHome(undefined, home => withServer((req, res) => { res.writeHead(401); res.end(); }, async baseUrl => {
  const provider = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  await assert.rejects(provider.refreshModels({ allowNetwork: true, signal: new AbortController().signal, credential: { type: 'api_key', key: 'k' }, publish: async () => assert.fail('must not publish') }), /401/);
})));

test('a rejected key reports the status and URL without the key', () => withServer((req, res) => { res.writeHead(401); res.end('{"error":"bad key"}'); }, async baseUrl => {
  await assert.rejects(fetchModels({ baseUrl, apiKey: 'wrong-secret' }), error => {
    assert.match(error.message, /401/);
    assert.ok(error.message.includes(`${baseUrl}/models`));
    assert.doesNotMatch(error.message, /wrong-secret/);
    return true;
  });
}));

test('an unreachable router or a malformed body throws instead of returning models', async () => {
  const closed = await withServer(json({}), async baseUrl => baseUrl);
  await assert.rejects(fetchModels({ baseUrl: closed, apiKey: 'k' }), error => error.message.includes(`${closed}/models`) && !error.message.includes('k@'));
  await withServer(json({ foo: 1 }), async baseUrl => {
    await assert.rejects(fetchModels({ baseUrl }), /model list/);
  });
  assert.throws(() => parseModelList({ foo: 1 }), /model list/);
});

test('aborting while the router is slow ends with AbortError', () => withServer((req, res) => { setTimeout(() => { res.end('{"data":[]}'); }, 2000); }, async baseUrl => {
  const controller = new AbortController();
  const pending = fetchModels({ baseUrl, signal: controller.signal });
  setTimeout(() => controller.abort(), 50);
  await assert.rejects(pending, { name: 'AbortError' });
}));

test('resolveKey prefers a stored key and resolves the env reference form', () => {
  assert.equal(resolveKey({ type: 'api_key', key: 'stored' }, { NINEROUTER_API_KEY: 'env' }), 'stored');
  assert.equal(resolveKey({ type: 'api_key', key: '$NINEROUTER_API_KEY' }, { NINEROUTER_API_KEY: 'env' }), 'env');
  assert.equal(resolveKey(undefined, { NINEROUTER_API_KEY: 'env' }), 'env');
  assert.equal(resolveKey(undefined, {}), undefined);
});
