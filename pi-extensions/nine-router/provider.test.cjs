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
  const pi = { registerProvider: (name, config) => calls.push({ name, config }) };
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

// provider-registration
test('env URL and key register an openai-completions provider named 9router', () => withConfigHome(undefined, home => {
  const { name, config } = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: 'https://router.example.com/v1/', NINEROUTER_API_KEY: 'secret-key' });
  assert.equal(name, '9router');
  assert.equal(config.api, 'openai-completions');
  assert.equal(config.baseUrl, 'https://router.example.com/v1');
  assert.equal(config.apiKey, '$NINEROUTER_API_KEY');
  assert.equal(typeof config.refreshModels, 'function');
  assert.equal(config.models, undefined, 'no static catalog');
}));

test('the config file supplies the URL when the env var is unset', () => withConfigHome('{"nineRouter":{"baseUrl":"http://10.0.0.5:20128/v1"}}', home => {
  assert.equal(loadNineRouterConfig({ XDG_CONFIG_HOME: home }).baseUrl, 'http://10.0.0.5:20128/v1');
}));

test('no configuration uses the 9router default and leaves apiKey for /login', () => withConfigHome(undefined, home => {
  const { config } = register({ XDG_CONFIG_HOME: home });
  assert.equal(config.baseUrl, DEFAULT_BASE_URL);
  assert.equal('apiKey' in config, false);
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
  const { config } = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  const published = [];
  const models = await config.refreshModels({ allowNetwork: true, signal: new AbortController().signal, credential: { type: 'api_key', key: 'test-key' }, publish: async p => { published.push(p); return true; } });
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
  const { config } = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  const stored = { models: [
    { id: 'kr/a', name: 'kr/a', provider: '9router', api: 'openai-completions', reasoning: true, input: ['text', 'image'], contextWindow: 200000, maxTokens: 8000 },
    { id: 'gpt-x', provider: 'openai', api: 'openai-completions' },
  ] };
  const models = await config.refreshModels({ allowNetwork: false, stored, signal: new AbortController().signal, publish: async () => assert.fail('no publish offline') });
  assert.deepEqual(models, [{ id: 'kr/a', name: 'kr/a', reasoning: true, input: ['text', 'image'], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 200000, maxTokens: 8000 }]);
  assert.equal(requests.length, 0);
})));

test('without network and nothing saved refreshModels returns no models', () => withConfigHome(undefined, home => withServer(json({ data: [{ id: 'x' }] }), async (baseUrl, requests) => {
  const { config } = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  assert.deepEqual(await config.refreshModels({ allowNetwork: false, signal: new AbortController().signal }), []);
  assert.equal(requests.length, 0);
})));

test('a failed refresh does not publish over the saved catalog', () => withConfigHome(undefined, home => withServer((req, res) => { res.writeHead(401); res.end(); }, async baseUrl => {
  const { config } = register({ XDG_CONFIG_HOME: home, NINEROUTER_BASE_URL: baseUrl });
  await assert.rejects(config.refreshModels({ allowNetwork: true, signal: new AbortController().signal, credential: { type: 'api_key', key: 'k' }, publish: async () => assert.fail('must not publish') }), /401/);
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
