import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installSharedPi, initializeSharedProject, setProjectRuntimeMode } from '../adapters/pi-installation.mjs';
import { chmodSync, cpSync } from 'node:fs';
import { followMachine, machineCli } from '../adapters/pi-machine.mjs';
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
test('shared Pi uses central hooks and commands while retaining isolation and explicit Land authority', async (t) => {
  // Guards advise by default; the refusals asserted here are the opt-in block mode.
  const previousMode = process.env.FOUNDATION_GUARDRAIL_MODE;
  process.env.FOUNDATION_GUARDRAIL_MODE = 'block';
  t.after(() => { if (previousMode === undefined) delete process.env.FOUNDATION_GUARDRAIL_MODE; else process.env.FOUNDATION_GUARDRAIL_MODE = previousMode; });
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
  assert.equal((await call('bash', { command: 'cloop advance shared-case --through archived' })).block, true);
  await commands.get('land').handler('shared-case', ctx);
  assert.equal(await call('bash', { command: 'cloop advance shared-case --through archived' }), undefined);
  assert.equal((await call('bash', { command: 'cloop advance other-case --through archived' })).block, true);
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
    cwd: root, env: { ...process.env, PI_CODING_AGENT_DIR: join(temporary, 'agent'), FOUNDATION_UPDATE_CHECK: '0', CHANGELOOP_MACHINE_CLI: 'none',
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
  const previous = process.cwd(), agent = process.env.PI_CODING_AGENT_DIR, machine = process.env.CHANGELOOP_MACHINE_CLI;
  try {
    process.env.CHANGELOOP_MACHINE_CLI = 'none';
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
    assert.equal(fresh.extensions[0].commands.has('land'), false, 'An unrelated nested Git repository does not inherit outer guards');
    assert.equal(fresh.extensions[0].handlers.has('tool_call'), false, 'Only first-use commands, no guards, in an unconfigured repository');
    await fresh.extensions[0].commands.get('changeloop').handler('init', { cwd: child, isProjectTrusted: () => true, ui: { notify: text => notices.push(text) } });
    assert.equal(existsSync(join(nested, '.changeloop.json')), true, 'Init from src configures the Git root');
    assert.equal(existsSync(join(child, '.changeloop.json')), false);
  } finally {
    process.chdir(previous); if (agent === undefined) delete process.env.PI_CODING_AGENT_DIR; else process.env.PI_CODING_AGENT_DIR = agent;
    if (machine === undefined) delete process.env.CHANGELOOP_MACHINE_CLI; else process.env.CHANGELOOP_MACHINE_CLI = machine;
  }
});

test('new shared projects follow the machine version; init keeps an existing marker', () => {
  assert.deepEqual(JSON.parse(readFileSync(join(root, '.changeloop.json'), 'utf8')),
    { version: 1, host: 'pi', installation: 'shared', follow: 'machine' });
  const pinned = join(temporary, 'pinned-init');
  assert.equal(initializeSharedProject(pinned, bundle.path, { follow: false }).bundle, bundle.bundle);
  assert.equal(initializeSharedProject(pinned, bundle.path).bundle, bundle.bundle, 'init does not rewrite a pin');
});

test('host pi-runtime installs this CLI as the current Pi bundle and is repeatable', () => {
  const agent = join(temporary, 'agent-endpoint');
  const call = () => spawnSync('bash', [join(source, 'cli.sh'), 'host', 'pi-runtime', '--protocol', '1', '--format', 'json', '--agent-dir', agent],
    { cwd: temporary, encoding: 'utf8', timeout: 120000, env: { ...process.env, CLAUDE_FOUNDATION_PROJECT: '', FOUNDATION_UPDATE_CHECK: '0' } });
  const first = call();
  assert.equal(first.status, 0, first.stderr + first.stdout);
  const value = JSON.parse(first.stdout);
  const protocol = JSON.parse(readFileSync(join(source, '.claude/harness/protocol.json'), 'utf8'));
  assert.equal(value.protocol, 1);
  assert.equal(value.foundationVersion, protocol.runtime);
  assert.equal(JSON.parse(readFileSync(join(agent, 'changeloop/installation.json'), 'utf8')).current, value.bundle);
  assert.equal(existsSync(join(value.path, 'bundle.json')), true);
  assert.equal(JSON.parse(call().stdout).bundle, value.bundle);
  const bad = spawnSync('bash', [join(source, 'cli.sh'), 'host', 'pi-runtime', '--protocol', '2'], { encoding: 'utf8' });
  assert.notEqual(bad.status, 0);
  assert.equal(JSON.parse(bad.stdout).error.code, 'unsupported-protocol');
});

test('follow resolves to the current bundle, a pin stays pinned, and modes switch explicitly', () => {
  const agent = join(temporary, 'agent-follow');
  const fake = '9.9.9-api42-0123456789abcdef';
  mkdirSync(join(agent, 'changeloop/releases', fake), { recursive: true });
  writeFileSync(join(agent, 'changeloop/releases', fake, 'bundle.json'), JSON.stringify({ bundle: fake }));
  mkdirSync(join(agent, 'changeloop'), { recursive: true });
  writeFileSync(join(agent, 'changeloop/installation.json'), JSON.stringify({ current: fake }));
  const resolveRoot = (project) => spawnSync(process.execPath, [join(source, '.claude/harness/runtime/core/project-installation.mjs'), 'resolve', project],
    { encoding: 'utf8', env: { ...process.env, PI_CODING_AGENT_DIR: agent } });
  const project = join(temporary, 'follow-project');
  initializeSharedProject(project, bundle.path);
  const followed = resolveRoot(project);
  assert.equal(followed.status, 0, followed.stderr);
  assert.equal(followed.stdout.trim(), join(agent, 'changeloop/releases', fake));
  // Bundle A is installed beside the different current bundle B (the fake).
  cpSync(bundle.path, join(agent, 'changeloop/releases', bundle.bundle), { recursive: true });
  const pinned = setProjectRuntimeMode(project, 'pin', bundle.path);
  assert.equal(pinned.bundle, bundle.bundle);
  assert.equal(JSON.parse(readFileSync(join(project, '.changeloop.json'), 'utf8')).bundle, bundle.bundle);
  const stays = resolveRoot(project);
  assert.equal(stays.status, 0, stays.stderr);
  assert.equal(stays.stdout.trim(), join(agent, 'changeloop/releases', bundle.bundle), 'A pin is not redirected to the current bundle');
  setProjectRuntimeMode(project, 'follow', bundle.path);
  const marker = JSON.parse(readFileSync(join(project, '.changeloop.json'), 'utf8'));
  assert.deepEqual(marker, { version: 1, host: 'pi', installation: 'shared', follow: 'machine' });
  writeFileSync(join(project, '.changeloop.json'), JSON.stringify({ ...marker, bundle: bundle.bundle }));
  assert.notEqual(resolveRoot(project).status, 0, 'follow plus a pin is refused');
  assert.throws(() => setProjectRuntimeMode(join(temporary, 'no-settings'), 'follow', bundle.path), /no shared Change Loop settings/);
});

function fakeMachine(name, realBundle) {
  const calls = join(temporary, `${name}.log`), cli = join(temporary, name);
  writeFileSync(cli, `#!/usr/bin/env bash
printf '%s\\n' "$*" >> '${calls}'
case "$1" in
  version) [ "$FAKE_BROKEN" = 1 ] && exit 3; printf 'cloop %s\\n' "$FAKE_VERSION" ;;
  host) [ "$FAKE_BROKEN_INSTALL" = 1 ] && { echo boom >&2; exit 4; }
    b="$FAKE_VERSION-api42-fedcba9876543210"; mkdir -p "$PI_CODING_AGENT_DIR/changeloop/releases"
    rm -rf "$PI_CODING_AGENT_DIR/changeloop/releases/$b"; cp -R '${realBundle}' "$PI_CODING_AGENT_DIR/changeloop/releases/$b"
    printf '{"bundle":"%s"}' "$b" > "$PI_CODING_AGENT_DIR/changeloop/releases/$b/bundle.json"
    printf '{"current":"%s"}' "$b" > "$PI_CODING_AGENT_DIR/changeloop/installation.json"
    printf '{"protocol":1,"foundationVersion":"%s","bundle":"%s"}\\n' "$FAKE_VERSION" "$b" ;;
esac
`);
  chmodSync(cli, 0o755);
  const installs = () => existsSync(calls) ? readFileSync(calls, 'utf8').split('\n').filter(line => line.startsWith('host pi-runtime')).length : 0;
  return { cli, calls, installs };
}

test('Pi follows the machine CLI version and a broken CLI only warns', () => {
  const agent = join(temporary, 'agent-machine');
  const installed = installSharedPi(source, agent), base = join(agent, 'changeloop');
  const machine = fakeMachine('fake-cloop', installed.path);
  const current = () => JSON.parse(readFileSync(join(base, 'installation.json'), 'utf8')).current;
  const env = (extra) => ({ ...process.env, CHANGELOOP_MACHINE_CLI: machine.cli, ...extra });
  assert.equal(followMachine(base, agent, env({ FAKE_VERSION: installed.runtime })), undefined);
  assert.equal(machine.installs(), 0, 'The same version does not reinstall');
  assert.equal(current(), installed.bundle);
  assert.equal(followMachine(base, agent, env({ FAKE_VERSION: '9.8.7' })), undefined);
  assert.equal(machine.installs(), 1);
  assert.equal(current(), '9.8.7-api42-fedcba9876543210');
  const failed = followMachine(base, agent, env({ FAKE_VERSION: '9.8.8', FAKE_BROKEN_INSTALL: '1' }));
  assert.match(failed, /9\.8\.8 could not be installed in Pi \(boom\)/);
  assert.equal(current(), '9.8.7-api42-fedcba9876543210', 'A failed install keeps the current bundle');
  assert.match(followMachine(base, agent, env({ FAKE_BROKEN: '1' })), /Could not read the machine Change Loop version/);
  const before = readFileSync(machine.calls, 'utf8');
  assert.equal(followMachine(base, agent, { ...process.env, CHANGELOOP_MACHINE_CLI: 'none' }), undefined);
  assert.equal(readFileSync(machine.calls, 'utf8'), before, 'none disables the machine check');
  // PATH lookup finds only cloop and never picks a CLI inside a Pi bundle.
  const bin = join(temporary, 'machine-bin'); mkdirSync(bin, { recursive: true });
  for (const name of ['cloop', 'claude-foundation']) { writeFileSync(join(bin, name), '#!/bin/sh\n'); chmodSync(join(bin, name), 0o755); }
  assert.equal(machineCli(base, { PATH: [join(installed.path, 'bin'), bin].join(':') }), join(bin, 'cloop'));
  const legacy = join(temporary, 'legacy-bin'); mkdirSync(legacy, { recursive: true });
  writeFileSync(join(legacy, 'claude-foundation'), '#!/bin/sh\n'); chmodSync(join(legacy, 'claude-foundation'), 0o755);
  assert.equal(machineCli(base, { PATH: legacy }), undefined, 'the retired name is not the machine CLI');
  assert.equal(machineCli(base, { PATH: join(installed.path, 'bin') }), undefined);
});

test('the installed Pi loader applies the machine version at load', { skip: !existsSync(join(piInstall, 'current-version')) }, async () => {
  const agent = join(temporary, 'agent-loader');
  const installed = installSharedPi(source, agent);
  const machine = fakeMachine('fake-cloop-loader', installed.path);
  const version = readFileSync(join(piInstall, 'current-version'), 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(pathToFileURL(join(piInstall, 'releases', version,
    'node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js')));
  const outside = join(temporary, 'outside'); mkdirSync(outside, { recursive: true });
  const saved = Object.fromEntries(['PI_CODING_AGENT_DIR', 'CHANGELOOP_MACHINE_CLI', 'FAKE_VERSION', 'FAKE_BROKEN_INSTALL']
    .map(key => [key, process.env[key]]));
  const previous = process.cwd();
  const load = async () => {
    const result = await loadExtensions([join(agent, 'extensions/changeloop.ts')], outside, undefined, createExtensionRuntime());
    assert.deepEqual(result.errors, []);
    const notices = [];
    for (const handler of result.extensions[0].handlers.get('session_start') || [])
      await handler({}, { ui: { notify: (text, kind) => notices.push({ text, kind }), setStatus() {} } });
    return notices;
  };
  try {
    process.chdir(outside);
    Object.assign(process.env, { PI_CODING_AGENT_DIR: agent, CHANGELOOP_MACHINE_CLI: machine.cli, FAKE_VERSION: '9.8.7' });
    await load();
    assert.equal(JSON.parse(readFileSync(join(agent, 'changeloop/installation.json'), 'utf8')).current, '9.8.7-api42-fedcba9876543210');
    Object.assign(process.env, { FAKE_VERSION: '9.8.8', FAKE_BROKEN_INSTALL: '1' });
    const notices = await load();
    assert.ok(notices.some(notice => notice.kind === 'warning' && /9\.8\.8 could not be installed/.test(notice.text)), JSON.stringify(notices));
  } finally {
    process.chdir(previous);
    for (const [key, value] of Object.entries(saved)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

test('first-use setup writes follow settings, hands one command to the reload, and refuses unsafe folders', async () => {
  const { bootstrapProject, takePendingCommand, bootstrapRefusal, projectRootFor, PENDING_TTL_MS } =
    await import('../adapters/pi-bootstrap.mjs');
  const agent = join(temporary, 'agent-bootstrap');
  const repo = join(temporary, 'fresh-repo'); mkdirSync(join(repo, '.git'), { recursive: true });
  const nested = join(repo, 'src/app'); mkdirSync(nested, { recursive: true });
  assert.equal(projectRootFor(nested), repo);
  const result = bootstrapProject({ cwd: nested, command: 'change', args: 'add a feature', trusted: true, runtime: bundle.path, agentDir: agent });
  assert.equal(result.root, repo);
  assert.deepEqual(JSON.parse(readFileSync(join(repo, '.changeloop.json'), 'utf8')),
    { version: 1, host: 'pi', installation: 'shared', follow: 'machine' });
  assert.equal(existsSync(join(nested, '.changeloop.json')), false);
  assert.equal(takePendingCommand({ root: repo, agentDir: agent }), '/change add a feature');
  assert.equal(takePendingCommand({ root: repo, agentDir: agent }), undefined, 'consumed once');
  const pending = join(agent, 'changeloop/pending-command.json');
  bootstrapProject({ cwd: repo, command: 'investigate', trusted: true, runtime: bundle.path, agentDir: agent });
  assert.equal(takePendingCommand({ root: join(temporary, 'other'), agentDir: agent }), undefined);
  assert.equal(existsSync(pending), false, 'a foreign hand-off is removed');
  const created = Date.now();
  bootstrapProject({ cwd: repo, command: 'dev', trusted: true, runtime: bundle.path, agentDir: agent, now: created });
  assert.equal(takePendingCommand({ root: repo, agentDir: agent, now: created + PENDING_TTL_MS + 1 }), undefined);
  assert.equal(existsSync(pending), false, 'a stale hand-off is removed');
  const untrusted = join(temporary, 'untrusted-repo'); mkdirSync(join(untrusted, '.git'), { recursive: true });
  assert.throws(() => bootstrapProject({ cwd: untrusted, command: 'change', trusted: false, runtime: bundle.path, agentDir: agent }), /Trust this project/);
  assert.deepEqual(readdirSync(untrusted), ['.git']);
  const home = join(temporary, 'pretend-home'); mkdirSync(home);
  assert.throws(() => bootstrapProject({ cwd: home, command: 'change', trusted: true, runtime: bundle.path, agentDir: agent, home }), /Open a project folder/);
  assert.deepEqual(readdirSync(home), []);
  assert.match(bootstrapRefusal('/', { trusted: true }), /Open a project folder/);
  const local = join(temporary, 'local-install'); mkdirSync(join(local, '.claude/harness'), { recursive: true });
  writeFileSync(join(local, '.claude/harness/foundation.mjs'), '');
  assert.match(bootstrapRefusal(local, { trusted: true }), /local Change Loop installation/);
  assert.throws(() => bootstrapProject({ cwd: repo, command: 'land', trusted: true, runtime: bundle.path, agentDir: agent }), /Unsupported/);
});

test('the Pi loader offers first-use commands, writes nothing on open, and reruns the command after reload', { skip: !existsSync(join(piInstall, 'current-version')) }, async () => {
  const agent = join(temporary, 'agent-first-use');
  installSharedPi(source, agent);
  const version = readFileSync(join(piInstall, 'current-version'), 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(pathToFileURL(join(piInstall, 'releases', version,
    'node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js')));
  const repo = join(temporary, 'first-use-repo'); mkdirSync(join(repo, '.git'), { recursive: true });
  const local = join(temporary, 'first-use-local'); mkdirSync(join(local, '.claude/harness'), { recursive: true });
  writeFileSync(join(local, '.claude/harness/foundation.mjs'), '');
  const saved = Object.fromEntries(['PI_CODING_AGENT_DIR', 'CHANGELOOP_MACHINE_CLI'].map(key => [key, process.env[key]]));
  const previous = process.cwd(), sent = [], notices = [];
  const ui = { notify: (text, kind) => notices.push({ text, kind }), setStatus() {} };
  const load = async (cwd) => {
    process.chdir(cwd);
    const runtime = createExtensionRuntime();
    runtime.sendUserMessage = (text, options) => sent.push({ text, options });
    const result = await loadExtensions([join(agent, 'extensions/changeloop.ts')], cwd, undefined, runtime);
    assert.deepEqual(result.errors, []);
    return result.extensions[0];
  };
  try {
    Object.assign(process.env, { PI_CODING_AGENT_DIR: agent, CHANGELOOP_MACHINE_CLI: 'none' });
    assert.equal((await load(local)).commands.has('change'), false, 'a local installation keeps its own commands');
    const fresh = await load(repo);
    for (const name of ['change', 'investigate', 'dev', 'feature']) assert.ok(fresh.commands.has(name), name);
    for (const handler of fresh.handlers.get('session_start') || []) await handler({}, { ui });
    assert.deepEqual(readdirSync(repo), ['.git'], 'opening the folder writes nothing');
    let reloaded = 0;
    await fresh.commands.get('change').handler('add a feature', { cwd: repo, isProjectTrusted: () => true,
      reload: async () => { reloaded += 1; }, ui });
    assert.equal(reloaded, 1);
    assert.equal(existsSync(join(repo, '.changeloop.json')), true);
    const configured = await load(repo);
    assert.ok(configured.commands.has('land'), 'the full adapter loads after setup');
    const ctx = { cwd: repo, model: { id: 'fixture', provider: 'test' }, signal: undefined,
      sessionManager: { getSessionId: () => 'first-use' }, waitForIdle: async () => {}, ui };
    for (const handler of configured.handlers.get('session_start') || []) await handler({ reason: 'reload' }, ctx);
    assert.deepEqual(sent, [{ text: '/change add a feature', options: { expandPromptTemplates: true } }]);
    for (const handler of configured.handlers.get('session_start') || []) await handler({ reason: 'reload' }, ctx);
    assert.equal(sent.length, 1, 'the command runs once');
  } finally {
    process.chdir(previous);
    for (const [key, value] of Object.entries(saved)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
