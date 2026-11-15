const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

test('bundled Pi reloads an installed upgrade over a live stale CJS graph', { timeout: 40000 }, async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-reload-rpc-'));
  const extensionDir = path.join(temporary, 'extension');
  fs.mkdirSync(extensionDir);
  const sourceFiles = fs.readdirSync(__dirname).filter(file => /\.(ts|cjs)$/.test(file) && !file.includes('.test.') && file !== 'test.cjs');
  const install = () => { for (const file of sourceFiles) fs.copyFileSync(path.join(__dirname, file), path.join(extensionDir, file)); };
  install();
  // Start as the broken pre-fix extension, then upgrade its files without restarting Pi.
  fs.writeFileSync(path.join(extensionDir, 'index.ts'), `import { createReportDispatcher } from './reports.cjs';
    export default function(pi) {
      let timer;
      pi.on('session_start', (_event, ctx) => {
        const dispatcher = createReportDispatcher();
        timer = setInterval(() => { try { dispatcher.flush(); }
          catch (error) { ctx.ui.notify('Agent team: ' + error, 'error'); } }, 100);
      });
      pi.on('session_shutdown', () => clearInterval(timer));
    }`);
  const storeFile = path.join(extensionDir, 'store.ts');
  fs.writeFileSync(storeFile, fs.readFileSync(storeFile, 'utf8').replace('deliver, deliverBatch,', 'deliver,'));
  fs.writeFileSync(path.join(extensionDir, 'reports.cjs'), `const store = require('./store.cjs');
    exports.createReportDispatcher = () => ({ flush() { return store.deliverBatch(); } });`);
  const probe = path.join(temporary, 'probe.ts');
  fs.writeFileSync(probe, `export default function(pi) {
    pi.registerCommand('reload-probe', { handler: async (_args, ctx) => { await ctx.reload(); } });
  }`);
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const cli = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js`);
  const child = spawn(process.execPath, [cli, '--mode', 'rpc', '--no-extensions', '--extension', path.join(extensionDir, 'index.ts'),
    '--extension', probe, '--session-dir', path.join(temporary, 'sessions')], {
    cwd: temporary, env: { ...process.env, PI_TEAM_ROOT: path.join(temporary, 'team'), PI_CODING_AGENT_DIR: path.join(temporary, 'profile') },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let output = '', errors = '', cursor = 0;
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { errors += data; });
  const until = async predicate => {
    const deadline = Date.now() + 15000;
    while (!predicate()) {
      if (child.exitCode !== null || Date.now() > deadline) throw new Error(`RPC check failed: ${output.slice(-5000)}\n${errors.slice(-2000)}`);
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  };
  const command = async (id, message) => {
    child.stdin.write(JSON.stringify({ type: 'prompt', id, message }) + '\n');
    await until(() => output.slice(cursor).includes(`"id":"${id}"`));
    cursor = output.length;
  };
  try {
    await until(() => output.includes('store.deliverBatch is not a function'));
    install();
    await command('reload-1', '/reload-probe');
    const reloaded = output.length;
    await command('reports-1', '/agents reports flush');
    // Let at least two monitor ticks run after the reload.
    await new Promise(resolve => setTimeout(resolve, 2200));
    assert.ok(!output.slice(reloaded).includes('store.deliverBatch is not a function'), output.slice(reloaded));
    assert.ok(output.includes('"success":true'), output);
  } finally {
    child.stdin.end();
    child.kill('SIGTERM');
    await new Promise(resolve => { if (child.exitCode !== null) return resolve(); child.once('exit', resolve); });
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
