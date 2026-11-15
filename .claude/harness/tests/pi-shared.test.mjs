import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installSharedPi, initializeSharedProject } from '../adapters/pi-installation.mjs';
const source = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const temporary = realpathSync(mkdtempSync(join(tmpdir(), 'pi-shared-')));
const root = join(temporary, 'project with spaces');
let bundle;
const run = (args, cwd = root, cliRoot = bundle.path) => spawnSync('bash', [join(cliRoot, 'cli.sh'), ...args], { cwd, encoding: 'utf8', timeout: 30000,
  env: { ...process.env, PI_CODING_AGENT_DIR: join(temporary, 'agent'), CLAUDE_FOUNDATION_PROJECT: '', FOUNDATION_UPDATE_CHECK: '0' } });
before(() => { bundle = installSharedPi(source, join(temporary, 'agent')); initializeSharedProject(root, bundle.path); });
after(() => rmSync(temporary, { recursive: true, force: true }));

test('shared init writes only settings and artifact directories; upgrades preserve user settings', () => {
  assert.deepEqual(readdirSync(root).sort(), ['.changeloop.json', '.foundation', 'foundation.json', 'openspec']);
  for (const path of ['.claude', '.pi', 'openspec/schemas', 'WORKFLOW.md', 'AGENTS.md']) assert.equal(existsSync(join(root, path)), false, path);
  const original = readFileSync(join(root, 'foundation.json'), 'utf8');
  writeFileSync(join(root, 'foundation.json'), original + '\n');
  initializeSharedProject(root, bundle.path);
  assert.equal(readFileSync(join(root, 'foundation.json'), 'utf8'), original + '\n');
  assert.equal(installSharedPi(source, join(temporary, 'agent')).bundle, bundle.bundle);
});
test('shared runtime resolves the consuming project and uses its policy, not bundle defaults', () => {
  const settings = JSON.parse(readFileSync(join(root, 'foundation.json'), 'utf8'));
  settings.execution.maxParallelAgents = 7;
  writeFileSync(join(root, 'foundation.json'), JSON.stringify(settings));
  const result = run(['doctor', '--stage', 'change']);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /max-parallel=7/);
  const nested = join(root, 'src/nested'); mkdirSync(nested, { recursive: true });
  const changes = run(['changes'], nested);
  assert.equal(changes.status, 0, changes.stderr);
  assert.match(changes.stdout, /No active changes/);
  assert.equal(existsSync(join(nested, '.foundation')), false);
  assert.equal(run(['changes'], nested, source).status, 0, 'An external CLI resolves the project-pinned installed bundle');
  const alias = join(temporary, 'bundle-alias'); symlinkSync(bundle.path, alias);
  const aliased = run(['changes'], nested, alias);
  assert.equal(aliased.status, 0, aliased.stderr);
});
test('bundle pin mismatch refuses runtime access, preserving the consumer files', () => {
  const marker = join(root, '.changeloop.json'), original = readFileSync(marker, 'utf8');
  try {
    writeFileSync(marker, JSON.stringify({ ...JSON.parse(original), runtime: '0.0.0' }));
    assert.notEqual(run(['changes']).status, 0);
  } finally { writeFileSync(marker, original); }
});
test('shared templates create a change without introducing project runtime files', () => {
  const result = run(['change', 'new', 'Shared runtime fixture', '--rapid']);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(existsSync(join(root, 'openspec/changes/shared-runtime-fixture/proposal.md')), true);
  assert.equal(existsSync(join(root, '.claude')), false);
  assert.equal(existsSync(join(root, 'openspec/schemas')), false);
});
test('shared Pi uses central hooks and commands while retaining isolation and explicit Land authority', async () => {
  const { default: install } = await import(pathToFileURL(join(bundle.path, '.claude/harness/adapters/pi-extension.mjs')));
  const handlers = new Map(), commands = new Map(), notices = [], messages = [];
  const pi = { on: (name, fn) => handlers.set(name, fn), registerCommand: (name, command) => commands.set(name, command),
    registerTool() {}, sendUserMessage: text => messages.push(text) };
  const ctx = { cwd: root, model: { id: 'fixture', provider: 'test' }, signal: undefined,
    sessionManager: { getSessionId: () => 'shared-fixture' }, waitForIdle: async () => {},
    ui: { notify: text => notices.push(text), setStatus() {} } };
  install(pi, { projectRoot: root, runtimeRoot: bundle.path, hostExecutable: 'bash', hostPrefixArgs: [join(bundle.path, 'cli.sh')],
    createBashTool: () => ({ name: 'bash', execute() {} }), createLocalBashOperations: () => ({ exec() {} }) });
  await handlers.get('session_start')({}, ctx);
  assert.deepEqual(notices, []);
  await commands.get('change').handler('Shared feature', ctx);
  assert.ok(messages[0].includes(bundle.path + '/.claude/harness/AGENT.md'));
  const call = async (toolName, input) => handlers.get('tool_call')({ toolName, input, toolCallId: 'call' }, ctx);
  assert.equal((await call('write', { path: 'product.js', content: 'not allowed' })).block, true);
  assert.equal(await call('write', { path: '.foundation/drafts/shared/change.json', content: '{}' }), undefined);
  assert.equal((await call('bash', { command: 'claude-foundation advance shared-case --through archived' })).block, true);
  await commands.get('land').handler('shared-case', ctx);
  assert.equal(await call('bash', { command: 'claude-foundation advance shared-case --through archived' }), undefined);
  assert.equal((await call('bash', { command: 'claude-foundation advance other-case --through archived' })).block, true);
  writeFileSync(join(root, '.env'), 'TOKEN=fixture-secret\n');
  const input = { path: '.env' };
  assert.equal(await call('read', input), undefined);
  assert.doesNotMatch(readFileSync(input.path, 'utf8'), /fixture-secret/);
});
test('shared initialization refuses symlink destinations and leaves legacy installations untouched', () => {
  const target = join(temporary, 'linked'); mkdirSync(target);
  symlinkSync(root, join(target, 'openspec'));
  assert.throws(() => initializeSharedProject(target, bundle.path), /linked/);
  const dangling = join(temporary, 'dangling'); mkdirSync(dangling);
  symlinkSync(join(temporary, 'must-not-be-created.json'), join(dangling, 'foundation.json'));
  assert.throws(() => initializeSharedProject(dangling, bundle.path), /linked/);
  assert.equal(existsSync(join(temporary, 'must-not-be-created.json')), false);
  const legacy = join(temporary, 'legacy'); mkdirSync(join(legacy, '.claude/harness'), { recursive: true });
  writeFileSync(join(legacy, '.claude/harness/foundation.mjs'), 'user-owned-runtime');
  assert.throws(() => initializeSharedProject(legacy, bundle.path), /local runtime/);
  assert.equal(readFileSync(join(legacy, '.claude/harness/foundation.mjs'), 'utf8'), 'user-owned-runtime');
});

const piInstall = join(homedir(), '.pi/agent/install');
test('real Pi auto-loads the global extension in a settings-only project without a model call', { skip: !existsSync(join(piInstall, 'current-version')) }, async () => {
  const version = readFileSync(join(piInstall, 'current-version'), 'utf8').trim();
  const cli = join(piInstall, 'releases', version, 'node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js');
  const child = spawn(process.execPath, [cli, '--mode', 'rpc', '--no-mcp', '--no-skills', '--no-context-files', '--session-dir', join(temporary, 'sessions')], {
    cwd: root, env: { ...process.env, PI_CODING_AGENT_DIR: join(temporary, 'agent'), FOUNDATION_UPDATE_CHECK: '0',
      PI_TEAM_ROOT: join(temporary, 'team'), PI_OFFLINE: '1' }, stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', stderr = '';
  child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { stderr += data; });
  const response = id => output.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } }).find(event => event.id === id);
  const until = async predicate => {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) { if (predicate()) return; if (child.exitCode !== null) break; await new Promise(done => setTimeout(done, 25)); }
    throw new Error('Pi startup/command failed: ' + stderr.slice(-1500) + output.slice(-2500));
  };
  try {
    child.stdin.write(JSON.stringify({ type: 'get_commands', id: 'commands' }) + '\n');
    await until(() => response('commands'));
    const names = response('commands').data.commands.map(command => command.name);
    for (const name of ['changeloop', 'investigate', 'change', 'build', 'prove', 'land', 'deliver', 'changes']) assert.ok(names.includes(name), name);
    child.stdin.write(JSON.stringify({ type: 'prompt', id: 'status', message: '/changeloop status' }) + '\n');
    await until(() => response('status') && output.includes('Runtime:'));
    assert.ok(!output.includes('"type":"agent_start"'), 'Read-only status must not invoke a model');
    assert.ok(!stderr.includes('Failed to load extension'), stderr);
    assert.equal(existsSync(join(root, '.pi')), false);
    assert.equal(existsSync(join(root, '.claude')), false);
  } finally {
    child.stdin.end(); child.kill('SIGTERM');
    await new Promise(done => child.once('close', done));
  }
});

test('Pi shared discovery binds a sandbox copy to its owner and respects nested repository boundaries', async () => {
  const marker = readFileSync(join(root, '.changeloop.json'), 'utf8');
  const sandbox = join(root, '.foundation/sandboxes/discovery'); mkdirSync(sandbox, { recursive: true });
  writeFileSync(join(sandbox, '.changeloop.json'), marker);
  const versionPath = join(piInstall, 'current-version');
  if (!existsSync(versionPath)) return;
  const version = readFileSync(versionPath, 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(pathToFileURL(join(piInstall, 'releases', version,
    'node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js')));
  const previous = process.cwd(), agent = process.env.PI_CODING_AGENT_DIR;
  try {
    process.env.PI_CODING_AGENT_DIR = join(temporary, 'agent'); process.chdir(sandbox);
    const result = await loadExtensions([join(temporary, 'agent/extensions/changeloop.ts')], sandbox, undefined, createExtensionRuntime());
    assert.deepEqual(result.errors, []);
    const notices = [];
    await result.extensions[0].commands.get('changeloop').handler('status', { ui: { notify: text => notices.push(text) } });
    assert.ok(notices[0].includes(`Project: ${root}\n`), notices[0]);
    const nested = join(root, 'separate-repository'), child = join(nested, 'src');
    mkdirSync(join(nested, '.git'), { recursive: true }); mkdirSync(child);
    process.chdir(child);
    const fresh = await loadExtensions([join(temporary, 'agent/extensions/changeloop.ts')], child, undefined, createExtensionRuntime());
    assert.deepEqual(fresh.errors, []);
    assert.equal(fresh.extensions[0].commands.has('change'), false, 'An unrelated nested Git repository does not inherit outer guards');
    await fresh.extensions[0].commands.get('changeloop').handler('init', { cwd: child, isProjectTrusted: () => true, ui: { notify: text => notices.push(text) } });
    assert.equal(existsSync(join(nested, '.changeloop.json')), true, 'Init from src configures the Git root');
    assert.equal(existsSync(join(child, '.changeloop.json')), false);
  } finally { process.chdir(previous); if (agent === undefined) delete process.env.PI_CODING_AGENT_DIR; else process.env.PI_CODING_AGENT_DIR = agent; }
});
