const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const jobs = require('./manager.cjs');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) {
  for (let i = 0; i < 150; i++) { const value = fn(); if (value) return value; await wait(50); }
  throw new Error('Timed out');
}
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-background-test-'));
test('returns immediately, captures stdout/stderr and failing exit code', async () => {
  const began = Date.now();
  const job = await jobs.start(root, { command: 'sleep 1; printf hello; printf error >&2; exit 7', cwd: root });
  assert.ok(Date.now() - began < 700);
  assert.ok(['starting', 'running'].includes(job.status));
  const final = await until(() => { const state = jobs.read(root, job.id); return state.status === 'completed' && state; });
  assert.equal(final.exitCode, 7);
  assert.equal(jobs.tail(root, job.id), 'helloerror');
});
test('stop kills descendants even if they ignore TERM', async () => {
  const job = await jobs.start(root, { command: "trap '' TERM; sleep 30 & echo $!; wait", cwd: root });
  const pid = await until(() => Number(jobs.tail(root, job.id).trim()));
  jobs.stop(root, job.id);
  await until(() => jobs.read(root, job.id).status === 'stopped' && jobs.read(root, job.id).finishedAt);
  await until(() => { try { process.kill(pid, 0); return false; } catch (error) { return error.code === 'ESRCH'; } });
});
test('timeout is enforced and status survives a new manager instance', async () => {
  const job = await jobs.start(root, { command: 'sleep 30', cwd: root, timeoutSeconds: 1 });
  const final = await until(() => { const state = jobs.read(root, job.id); return state.finishedAt && state; });
  assert.equal(final.status, 'timed_out');
  delete require.cache[require.resolve('./manager.cjs')];
  assert.equal(require('./manager.cjs').read(root, job.id).status, 'timed_out');
});
test('validates cwd and job IDs', async () => {
  await assert.rejects(jobs.start(root, { command: 'true', cwd: path.join(root, 'missing') }));
  assert.throws(() => jobs.read(root, '../outside'));
});
test('caps output while allowing command to exit', async () => {
  const job = await jobs.start(root, { command: "head -c 12000000 /dev/zero; exit 0", cwd: root });
  await until(() => jobs.read(root, job.id).status === 'completed');
  assert.equal(jobs.read(root, job.id).exitCode, 0);
  assert.ok(fs.statSync(jobs.read(root, job.id).logPath).size < 10 * 1024 * 1024 + 100);
  assert.ok(jobs.tail(root, job.id).includes('log capped'));
});
test('Pi loader, tool execution, reload recovery and completion notification', async () => {
  const { createHash, randomUUID } = require('node:crypto');
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
  const session = `background-extension-test-${randomUUID()}`;
  const jobRoot = path.join(os.homedir(), '.pi/agent/background-jobs', createHash('sha256').update(session).digest('hex').slice(0, 24));
  const messages = [];
  const runtime = createExtensionRuntime();
  runtime.getAllTools = () => [{ name: 'bash', sourceInfo: { source: 'builtin', path: 'builtin:bash' } }];
  runtime.sendMessage = (message, options) => messages.push({ message, options });
  const ctx = { cwd: root, isIdle: () => true, hasPendingMessages: () => false, sessionManager: { getSessionId: () => session }, ui: { setStatus() {}, notify() {} } };
  const load = async () => {
    const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], root, undefined, runtime);
    assert.deepEqual(loaded.errors, []);
    return loaded.extensions[0];
  };
  let extension = await load();
  const emit = async name => { for (const handler of extension.handlers.get(name) ?? []) await handler({}, ctx); };
  try {
    await emit('session_start');
    const tool = extension.tools.get('background_bash').definition;
    const started = await tool.execute('test', { command: 'sleep 1; printf integration-ok', notify: true }, undefined, undefined, ctx);
    const id = started.details.id;
    await emit('session_shutdown');
    await until(() => jobs.read(jobRoot, id).status === 'completed');
    extension = await load();
    await emit('session_start');
    await until(() => messages.length === 1);
    assert.ok(messages[0].message.content.includes('integration-ok'));
    assert.equal(messages[0].options.triggerTurn, true);
    assert.equal(messages[0].options.deliverAs, 'followUp');
    assert.equal(started.details.command, undefined);
    const inspect = extension.tools.get('background_job').definition;
    const status = await inspect.execute('status', { action: 'status', id }, undefined, undefined, ctx);
    assert.equal(status.details.output, undefined);
    const history = await inspect.execute('history', { action: 'list', includeFinished: true }, undefined, undefined, ctx);
    assert.equal(history.details.jobs.length, 1);
    assert.equal(history.details.jobs[0].command, undefined);
    await emit('session_shutdown');
    extension = await load();
    await emit('session_start');
    assert.equal(messages.length, 1, 'reload must not repeat completion');
    assert.ok(extension.commands.has('jobs'));
  } finally {
    await emit('session_shutdown');
    fs.rmSync(jobRoot, { recursive: true, force: true });
  }
});
test('automatic 10s backgrounding, Ctrl+B, foreground failures, timeout, abort and user bash', async () => {
  const { createHash, randomUUID } = require('node:crypto');
  const session = `auto-bash-test-${randomUUID()}`;
  const jobRoot = path.join(os.homedir(), '.pi/agent/background-jobs', createHash('sha256').update(session).digest('hex').slice(0, 24));
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
  const runtime = createExtensionRuntime();
  runtime.getAllTools = () => [{ name: 'bash', sourceInfo: { source: 'builtin', path: 'builtin:bash' } }];
  runtime.sendMessage = () => {};
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], root, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const extension = loaded.extensions[0];
  const statuses = new Map();
  const ctx = { cwd: root, isIdle: () => true, hasPendingMessages: () => false, sessionManager: { getSessionId: () => session },
    ui: { setStatus(key, value) { statuses.set(key, value); }, notify() {} } };
  for (const handler of extension.handlers.get('session_start') ?? []) await handler({}, ctx);
  const tool = extension.tools.get('bash').definition;
  const run = (command, timeout, signal) => tool.execute('test', { command, timeout }, signal, undefined, ctx);
  const shortcut = extension.shortcuts.get('ctrl+b');
  assert.ok(shortcut, 'Ctrl+B must be registered');
  try {
    const fast = await run('printf fast-error; exit 6');
    assert.equal(fast.isError, true);
    assert.equal(fast.structuredContent.exit_code, 6);
    assert.equal(fast.structuredContent.background, false);
    assert.ok(fast.content[0].text.includes('fast-error'));
    assert.equal(jobs.list(jobRoot)[0].notified, true, 'foreground completion must not notify twice');

    const began = Date.now();
    const automatic = await run('printf "once\\n"; sleep 11; printf finished');
    assert.ok(Date.now() - began >= 9900 && Date.now() - began < 11000, 'must yield at 10s');
    assert.equal(automatic.structuredContent.background, true);
    assert.equal(automatic.structuredContent.exit_code, null, 'background must not claim success');
    const id = automatic.structuredContent.job_id;
    await until(() => jobs.read(jobRoot, id).status === 'completed');
    assert.equal(jobs.tail(jobRoot, id), 'once\nfinished', 'process must continue without restarting');
    assert.equal(jobs.read(jobRoot, id).notify, true);

    const pressedAt = Date.now();
    const pending = run('sleep 2; printf shortcut-finished');
    await until(() => statuses.get('foreground-bash'));
    await shortcut.handler(ctx);
    const manual = await pending;
    assert.equal(manual.structuredContent.background, true);
    assert.ok(Date.now() - pressedAt < 1000, 'Ctrl+B should return immediately');
    await until(() => jobs.read(jobRoot, manual.structuredContent.job_id).status === 'completed');

    const timed = await run('sleep 30', 0.3);
    assert.equal(timed.isError, true);
    assert.equal(timed.structuredContent.status, 'timed_out');

    const controller = new AbortController();
    const cancelled = run('sleep 29', undefined, controller.signal);
    await until(() => statuses.get('foreground-bash'));
    controller.abort();
    await assert.rejects(cancelled, /aborted/);
    const stopped = jobs.list(jobRoot).find(job => job.command === 'sleep 29');
    await until(() => jobs.read(jobRoot, stopped.id).finishedAt);
    assert.equal(jobs.read(jobRoot, stopped.id).status, 'stopped');

    const userHook = extension.handlers.get('user_bash')[0];
    const { operations } = await userHook({}, ctx);
    let output = '';
    const direct = await operations.exec('printf user-bash', root, { onData: data => { output += data; } });
    assert.equal(direct.exitCode, 0);
    assert.equal(output, 'user-bash');
    await assert.rejects(run('true', -1), /Invalid timeout/);
    // Session environment is inherited, but never written into job metadata.
    assert.ok(!fs.readFileSync(path.join(jobRoot, id, 'job.json'), 'utf8').includes('PI_SESSION_ID'));
  } finally {
    for (const handler of extension.handlers.get('session_shutdown') ?? []) await handler({}, ctx);
    for (const job of jobs.list(jobRoot)) jobs.stop(jobRoot, job.id);
    await until(() => jobs.list(jobRoot).every(job => !['starting', 'running'].includes(job.status)));
    fs.rmSync(jobRoot, { recursive: true, force: true });
  }
});
test('does not claim bash or user shell execution owned by another extension', async () => {
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
  const runtime = createExtensionRuntime();
  runtime.getAllTools = () => [{ name: 'bash', sourceInfo: { source: 'project', path: '/project/.pi/extensions/changeloop.ts' } }];
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], root, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const extension = loaded.extensions[0];
  const ctx = { cwd: root, isIdle: () => true, hasPendingMessages: () => false, sessionManager: { getSessionId: () => 'project-owner-test' }, ui: { setStatus() {}, notify() {} } };
  try {
    assert.equal(extension.tools.has('bash'), false, 'no startup collision');
    for (const handler of extension.handlers.get('session_start') ?? []) await handler({}, ctx);
    assert.equal(extension.tools.has('bash'), false, 'project owner is preserved after startup');
    assert.equal(await extension.handlers.get('user_bash')[0]({}, ctx), undefined);
    assert.ok(extension.tools.has('background_bash'));
  } finally {
    for (const handler of extension.handlers.get('session_shutdown') ?? []) await handler({}, ctx);
  }
});
test('user shell completion resumes once, batches results and ignores private/cancelled/history commands', async () => {
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const { loadExtensions, createExtensionRuntime } = await import(path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`));
  const runtime = createExtensionRuntime(), messages = [], branch = [];
  runtime.getAllTools = () => [{ name: 'bash', sourceInfo: { source: 'project' } }];
  runtime.sendMessage = (message, options) => messages.push({ message, options });
  const entry = (id, extra = {}) => ({ type: 'message', id, message: {
    role: 'bashExecution', command: `printf ${id}`, exitCode: 0, timestamp: Date.now(), ...extra,
  } });
  branch.push(entry('old'));
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], root, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const extension = loaded.extensions[0];
  const ctx = { sessionManager: { getSessionId: () => 'user-completion-test', getBranch: () => branch }, ui: { setStatus() {}, notify() {} } };
  const emit = async name => { for (const handler of extension.handlers.get(name) ?? []) await handler({}, ctx); };
  try {
    await emit('session_start');
    branch.push(entry('copy-one'), entry('copy-two', { exitCode: 1 }), entry('private', { excludeFromContext: true }), entry('cancelled', { cancelled: true }));
    await until(() => messages.length === 1);
    assert.deepEqual(messages[0].message.details.entryIds, ['copy-one', 'copy-two']);
    assert.equal(messages[0].options.triggerTurn, true);
    assert.equal(messages[0].options.deliverAs, 'followUp');
    assert.ok(messages[0].message.content.includes('exit 1'));
    await wait(1600);
    assert.equal(messages.length, 1);
    await emit('session_shutdown'); await emit('session_start');
    branch.push(entry('historical-branch', { timestamp: 0 }), entry('next-command'));
    await until(() => messages.length === 2);
    assert.deepEqual(messages[1].message.details.entryIds, ['next-command']);
    assert.equal(extension.tools.has('bash'), false, 'project execution remains untouched');
  } finally { await emit('session_shutdown'); }
});
test('real Pi resumes the model after a user bash command without another prompt', async () => {
  const { spawn } = require('node:child_process');
  const project = path.join(os.homedir(), 'Desktop/Work/changeloop');
  const teamRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-command-resume-'));
  const env = { ...process.env, PI_TEAM_ROOT: teamRoot };
  for (const key of Object.keys(env)) if (key.startsWith('ORCA_') || ['PI_TEAM_AGENT_ID', 'PI_TEAM_SUPERVISOR_PID'].includes(key)) delete env[key];
  const child = spawn(path.join(os.homedir(), '.local/bin/pi'), ['--mode', 'rpc', '--no-session',
    '--extension', path.join(__dirname, '../agent-team/test/mock-provider.ts'), '--provider', 'agent-team-test', '--model', 'echo', '--thinking', 'off'],
    { cwd: fs.existsSync(project) ? project : root, env, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = '', stderr = '', settled = false, accepted = false, response = false;
  child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
  child.stderr.on('data', text => { stderr += text; });
  child.stdout.on('data', text => {
    buffer += text;
    let newline;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const event = JSON.parse(line);
      if (event.id === 'user-shell') accepted = event.success;
      if (event.type === 'message_end' && event.message.role === 'assistant') response = true;
      if (event.type === 'agent_settled') settled = true;
    }
  });
  const exited = new Promise(resolve => child.once('exit', resolve));
  try {
    child.stdin.write(JSON.stringify({ id: 'user-shell', type: 'bash', command: 'printf continuation-test' }) + '\n');
    await until(() => settled);
    assert.equal(accepted, true, stderr);
    assert.equal(response, true, 'No user prompt was sent; completion must trigger this response');
  } finally {
    child.stdin.end();
    const force = setTimeout(() => child.kill('SIGKILL'), 5000);
    await exited; clearTimeout(force);
    fs.rmSync(teamRoot, { recursive: true, force: true });
  }
});
test('real Pi launcher starts in ordinary and Change Loop folders without tool conflicts', () => {
  const { spawnSync } = require('node:child_process');
  const project = path.join(os.homedir(), 'Desktop/Work/changeloop');
  const folders = fs.existsSync(path.join(project, '.pi/extensions/changeloop.ts')) ? [root, project] : [root];
  for (const cwd of folders) {
    const teamRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-launch-regression-'));
    const env = { ...process.env, PI_TEAM_ROOT: teamRoot };
    for (const key of Object.keys(env)) if (key.startsWith('ORCA_') || ['PI_TEAM_AGENT_ID', 'PI_TEAM_SUPERVISOR_PID'].includes(key)) delete env[key];
    try {
      const result = spawnSync(path.join(os.homedir(), '.local/bin/pi'), ['--mode', 'rpc', '--no-session'], {
        cwd, env, input: JSON.stringify({ id: 'launch-check', type: 'get_state' }) + '\n', encoding: 'utf8', timeout: 25000,
      });
      assert.equal(result.status, 0, `${cwd}: ${result.stderr}`);
      const records = result.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line));
      assert.ok(records.some(record => record.id === 'launch-check' && record.success));
      assert.ok(!result.stderr.includes('conflicts with'));
    } finally { fs.rmSync(teamRoot, { recursive: true, force: true }); }
  }
});
