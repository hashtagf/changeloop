// End to end with a real Pi and a fake 9router. Pi fetches provider catalogs
// over the network only in interactive startup, /model, /login and
// `pi update --models`; `pi -p` uses the saved catalog. So: -p before any
// refresh cannot find the model; an interactive start saves the catalog; then
// -p chats through the router. Needs a local Pi (>=1.5.2) on PATH or PI_BIN,
// and python3 for the pseudo-terminal.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const PI = process.env.PI_BIN || 'pi';
const EXTENSION_ROOT = path.resolve(__dirname, '../..');
const INTERACTIVE = path.join(__dirname, 'interactive.py');
const MODEL = 'kr/fake-model';
const KEY = 'e2e-test-key';

function fakeRouter() {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, headers: req.headers, body });
      if (req.method === 'GET' && req.url === '/v1/models') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ object: 'list', data: [{ id: MODEL, object: 'model', context_length: 64000, max_completion_tokens: 4096 }] }));
        return;
      }
      if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        res.writeHead(200, { 'content-type': 'text/event-stream' });
        const event = (delta, finish, usage) => `data: ${JSON.stringify({ id: 'c1', object: 'chat.completion.chunk', created: 1, model: MODEL, choices: [{ index: 0, delta, finish_reason: finish }], ...(usage ? { usage } : {}) })}\n\n`;
        res.write(event({ role: 'assistant', content: '' }, null));
        res.write(event({ content: 'pong' }, null));
        res.write(event({}, 'stop', { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 }));
        res.end('data: [DONE]\n\n');
        return;
      }
      res.writeHead(404); res.end();
    });
  });
  return { server, requests };
}

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`${command} timed out\n${stdout}\n${stderr}`)); }, 120_000);
    child.on('error', reject);
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

for (const useLogin of [false, true]) test(useLogin ? 'Pi /login saves the gateway and can chat after restart' : 'Pi chats through 9router after an interactive start saves the catalog', async () => {
  const { server, requests } = fakeRouter();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-ext-9r-e2e-'));
  const agentDir = path.join(scratch, 'agent');
  const extensions = path.join(agentDir, 'extensions');
  const extension = path.join(extensions, 'nine-router', 'index.ts');
  const options = {
    cwd: scratch,
    env: {
      ...process.env,
      HOME: scratch,
      XDG_CONFIG_HOME: path.join(scratch, 'config'),
      PI_CODING_AGENT_DIR: agentDir,
      NINEROUTER_BASE_URL: `http://127.0.0.1:${server.address().port}/v1`,
      NINEROUTER_API_KEY: KEY,
    },
  };
  const baseUrl = options.env.NINEROUTER_BASE_URL;
  if (useLogin) {
    delete options.env.NINEROUTER_BASE_URL;
    delete options.env.NINEROUTER_API_KEY;
  }
  const print = () => run(PI, ['--no-extensions', '-e', extension, '--no-session', '--model', `9router/${MODEL}`, '-p', 'ping'], options);
  try {
    // Match a local install outside the repo and its node_modules.
    for (const file of ['nine-router/index.ts', 'nine-router/config.ts', 'nine-router/models.ts', 'ask-user/config.ts']) {
      const target = path.join(extensions, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(EXTENSION_ROOT, file), target);
    }
    // Before any catalog refresh, print mode cannot see the router's models.
    const before = await print();
    assert.notEqual(before.code, 0);
    assert.match(before.stderr + before.stdout, /not found/i);
    assert.equal(requests.filter(r => r.url === '/v1/chat/completions').length, 0);

    // An interactive start refreshes the catalog from the router and saves it.
    const store = path.join(agentDir, 'models-store.json');
    const interactive = await run('python3', useLogin
      ? [path.join(__dirname, 'interactive-start.py'), PI, extension, store, baseUrl, KEY]
      : [INTERACTIVE, PI, extension, store, '9router'], options);
    assert.equal(interactive.code, 0, interactive.stderr);
    const discovery = requests.find(r => r.url === '/v1/models');
    assert.ok(discovery, 'catalog was discovered from the router');
    assert.equal(discovery.headers.authorization, `Bearer ${KEY}`);

    const after = await print();
    assert.equal(after.code, 0, `pi failed\nstdout:\n${after.stdout}\nstderr:\n${after.stderr}`);
    assert.match(after.stdout, /pong/);
    const chat = requests.find(r => r.url === '/v1/chat/completions');
    assert.ok(chat, `no chat request; saw ${requests.map(r => `${r.method} ${r.url}`).join(', ')}`);
    assert.equal(JSON.parse(chat.body).model, MODEL);
    assert.equal(chat.headers.authorization, `Bearer ${KEY}`);
  } finally {
    server.closeAllConnections?.();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});
