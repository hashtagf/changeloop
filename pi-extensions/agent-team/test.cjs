const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const store = require('./store.cjs');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-agent-team-test-'));
const root = path.join(temporary, 'agent-team');
process.env.PI_TEAM_ROOT = root;
const wait = ms => new Promise(yes => setTimeout(yes, ms));
async function until(predicate, ms = 15000) {
  const deadline = Date.now() + ms;
  do { const value = predicate(); if (value) return value; await wait(50); } while (Date.now() < deadline);
  throw new Error(`Timed out after ${ms} ms`);
}
function peer(id, name = id, extra = {}) {
  return store.register(root, { id, name, status: 'idle', sessionId: id, cwd: temporary, ...extra });
}
async function loader() {
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent`);
  return { ...(await import(path.join(base, 'dist/core/extensions/loader.js'))), base };
}
after(async () => {
  for (const item of store.list(root)) if (item.kind === 'managed') store.stop(root, item.id);
  await until(() => store.list(root).every(item => item.kind !== 'managed' || !store.alive(item.process.workerPid)), 8000);
  fs.rmSync(temporary, { recursive: true, force: true });
});
test('durable cross-session inbox, names, offline queue and no duplicate delivery', () => {
  peer('one', 'Alpha'); peer('two', 'Beta');
  const sent = store.send(root, 'one', 'two', 'สวัสดีข้าม session', { delivery: 'steer' });
  assert.equal(sent.status, 'queued');
  const delivered = [];
  store.deliver(root, 'two', message => delivered.push(message));
  store.deliver(root, 'two', message => delivered.push(message));
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].message, 'สวัสดีข้าม session');
  assert.equal(delivered[0].delivery, 'steer');
  assert.equal(store.inbox(root, 'two', { unreadOnly: true }).length, 0);
  assert.ok(store.inbox(root, 'two')[0].deliveredAt);
  store.heartbeat(root, 'two', { status: 'offline' });
  assert.equal(store.send(root, 'one', 'two', 'resume later').status, 'queued_offline');
  peer('two', 'Beta');
  store.deliver(root, 'two', message => delivered.push(message));
  assert.equal(delivered.length, 2);
  assert.equal(store.resolve(root, 'Alpha', 'two').id, 'one');
  assert.throws(() => store.member(root, '../escape'), /Invalid agent ID/);
  assert.throws(() => store.send(root, 'one', 'two', ''), /Message/);
  assert.throws(() => store.stop(root, 'one'), /Only managed/);
});
test('wire-name repair is bounded to known agent tools and preserves IDs/arguments', () => {
  const { normalizeAgentToolCalls } = require('./tool-names.cjs');
  const args = { to: 'one', message: 'same payload', delivery: 'followUp' };
  const message = { role: 'assistant', content: [
    { type: 'toolCall', id: 'send-1', name: '_agent_send', arguments: args },
    { type: 'toolCall', id: 'stop-1', name: '__agent_stop', arguments: { id: 'self' } },
    { type: 'toolCall', id: 'custom-1', name: '_inspect', arguments: {} },
    { type: 'text', text: '_agent_send is text, not a call' },
  ] };
  const result = normalizeAgentToolCalls(message);
  assert.equal(result.content[0].name, 'agent_send');
  assert.equal(result.content[0].id, 'send-1');
  assert.equal(result.content[0].arguments, args);
  assert.equal(result.content[1].name, 'agent_stop');
  assert.equal(result.content[2].name, '_inspect');
  assert.equal(result.content[3], message.content[3]);
  assert.equal(message.content[0].name, '_agent_send', 'original input is not mutated');
  assert.equal(normalizeAgentToolCalls(result), result, 'repair is idempotent');
});
test('failed inbox injection is retried without falsely recording a receipt', () => {
  peer('retry-one'); peer('retry-two');
  store.send(root, 'retry-one', 'retry-two', 'retry me');
  assert.throws(() => store.deliver(root, 'retry-two', () => { throw new Error('not ready'); }));
  assert.equal(store.inbox(root, 'retry-two', { unreadOnly: true }).length, 1);
  store.deliver(root, 'retry-two', () => {});
  assert.equal(store.inbox(root, 'retry-two', { unreadOnly: true }).length, 0);
});
test('project skill discovery respects trust and repository boundaries across reload', async () => {
  const { loadExtensions, createExtensionRuntime } = await loader();
  const outer = path.join(temporary, 'skill-scope'), repo = path.join(outer, 'repo'), nested = path.join(repo, 'src');
  const project = path.join(repo, '.claude', 'skills'), child = path.join(nested, '.codex', 'skills');
  for (const dir of [path.join(outer, '.claude', 'skills'), path.join(repo, '.git'), project, child]) fs.mkdirSync(dir, { recursive: true });
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], nested, undefined, createExtensionRuntime());
  assert.deepEqual(loaded.errors, []);
  const discover = loaded.extensions[0].handlers.get('resources_discover')[0];
  const event = {cwd:nested,reason:'startup'};
  assert.deepEqual(await discover(event,{isProjectTrusted:()=>false}),{skillPaths:[]});
  const result = await discover(event,{isProjectTrusted:()=>true});
  assert.deepEqual(result.skillPaths,[child,project]);
  assert.deepEqual(await discover({...event,reason:'reload'},{isProjectTrusted:()=>true}),result);
});
test('extension tools and lifecycle deliver messages/results across independent sessions', async () => {
  const { loadExtensions, createExtensionRuntime } = await loader();
  async function instance(session, parentId) {
    const messages = [], runtime = createExtensionRuntime();
    runtime.sendMessage = (message, options) => messages.push({ message, options });
    const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], temporary, undefined, runtime);
    assert.deepEqual(loaded.errors, []);
    const extension = loaded.extensions[0];
    const id = store.sessionId(session);
    if (parentId) store.atomic(path.join(store.dir(root, id), 'meta.json'), { id, name: session, kind: 'session', parentId, createdAt: Date.now() });
    const ctx = { cwd: temporary, isIdle: () => true, hasPendingMessages: () => false, sessionManager: { getSessionId: () => session, getSessionFile: () => `/tmp/${session}.jsonl`, getSessionName: () => session }, ui: { setStatus() {}, notify() {} } };
    const emit = async (type, event = {}) => { for (const handler of extension.handlers.get(type) ?? []) await handler(event, ctx); };
    await emit('session_start');
    return { id, extension, ctx, emit, messages };
  }
  const parent = await instance(`parent-${randomUUID()}`), child = await instance(`child-${randomUUID()}`, parent.id);
  try {
    assert.deepEqual([...parent.extension.tools.keys()], ['agent_spawn', 'agent_list', 'agent_send', 'agent_inbox', 'agent_stop']);
    const listTool = parent.extension.tools.get('agent_list').definition;
    const compact = await listTool.execute('list', {});
    assert.equal(compact.details.scope, 'team');
    assert.equal(compact.details.limit, 20);
    assert.ok(compact.details.members.some(row => row.id === child.id));
    assert.ok(compact.details.members.every(row => !('task' in row) && !('result' in row)));
    const detail = await listTool.execute('detail', { id: child.id, details: true });
    assert.ok(detail.details.members[0].taskFile.endsWith('meta.json'));
    const tool = parent.extension.tools.get('agent_send').definition;
    await tool.execute('send', { to: child.id, message: 'review this', delivery: 'steer' });
    await until(() => child.messages.length === 1);
    assert.equal(child.messages[0].options.deliverAs, 'steer');
    assert.equal(child.messages[0].options.triggerTurn, true);
    await child.emit('agent_start');
    const fullResult = 'review completed\n' + 'ก'.repeat(30000) + '\nfinal evidence';
    await child.emit('message_end', { message: { role: 'assistant', content: [{ type: 'text', text: fullResult }], stopReason: 'stop' } });
    await child.emit('agent_settled', { aborted: false });
    await until(() => parent.messages.length === 1);
    assert.ok(parent.messages[0].message.content.includes(fullResult));
    assert.equal(parent.messages[0].message.customType, 'agent-team-report-batch');
    assert.equal(parent.messages[0].message.display, false);
    assert.deepEqual(parent.messages[0].options, { triggerTurn: true, deliverAs: 'followUp' });
    assert.equal(store.member(root, child.id).result.text, fullResult);
    assert.equal(store.member(root, child.id).result.phase, 'turn_settled');
    const inboxTool = parent.extension.tools.get('agent_inbox').definition;
    const previews = await inboxTool.execute('inbox', {});
    assert.equal(previews.details.messages[0].message, undefined);
    const fullMessage = await inboxTool.execute('read-message', { id: previews.details.messages[0].id });
    assert.match(fullMessage.details.text, /review completed/);
    assert.equal(store.resolve(root, 'parent', child.id).id, parent.id);
    const reportsCommand = parent.extension.commands.get('agents');
    await reportsCommand.handler('reports quiet', parent.ctx);
    await child.emit('message_end', { message: { role: 'assistant', content: [{ type: 'text', text: 'quiet result' }], stopReason: 'stop' } });
    await child.emit('agent_settled', { aborted: false });
    await until(() => store.inbox(root, parent.id, { unreadOnly: true }).length === 1);
    await parent.emit('session_shutdown');
    await parent.emit('session_start');
    assert.equal(parent.messages.length, 1, 'quiet mode and unread reports survive reload');
    await reportsCommand.handler('reports flush', parent.ctx);
    assert.equal(parent.messages.length, 2);
    assert.match(parent.messages[1].message.content, /quiet result/);
    await reportsCommand.handler('reports batch', parent.ctx);
    await child.emit('session_shutdown');
    await tool.execute('offline', { to: child.id, message: 'after reload' });
    await child.emit('session_start');
    assert.equal(child.messages.length, 2);
    await child.emit('session_shutdown');
    await child.emit('session_start');
    assert.equal(child.messages.length, 2, 'reload does not repeat received messages');

    // Exercise the actual tool's default launcher and all installed extensions.
    // A slash command is handled locally and never invokes the user's model.
    const spawned = await parent.extension.tools.get('agent_spawn').definition.execute('spawn',
      { task: '/agents inbox', name: 'global-launch-test' }, undefined, undefined, parent.ctx);
    const managed = spawned.details;
    assert.equal(managed.task, undefined, 'spawn must not echo the full task into context');
    assert.equal(managed.result, undefined);
    try {
      await until(() => store.member(root, managed.id).online, 20000);
      await until(() => fs.readFileSync(managed.logPath, 'utf8').includes('"disposition":"handled"'), 10000);
      assert.equal(store.member(root, managed.id).name, 'global-launch-test');
    } finally {
      store.stop(root, managed.id);
      await until(() => !store.alive(store.member(root, managed.id).process.workerPid), 8000);
    }
  } finally { await parent.emit('session_shutdown'); await child.emit('session_shutdown'); }
});
test('spawn limits and stop descendants are enforced without touching interactive sessions', async () => {
  const limitedRoot = path.join(temporary, 'limits');
  store.register(limitedRoot, { id: 'limit-parent', status: 'idle' });
  for (let i = 0; i < 64; i++) store.atomic(path.join(store.dir(limitedRoot, `limit-${i}`), 'meta.json'),
    { id: `limit-${i}`, kind: 'managed', name: `limit-${i}`, parentId: i ? `limit-${i - 1}` : 'limit-parent', createdAt: Date.now() });
  await assert.rejects(store.spawnAgent(limitedRoot, { parentId: 'limit-parent', task: 'no-op', cwd: temporary }), /Maximum 64/);
  await assert.rejects(store.spawnAgent(limitedRoot, { parentId: 'limit-3', task: 'no-op', cwd: temporary }), /depth/);
  assert.equal(store.stop(limitedRoot, 'limit-0').ids.length, 64);
  assert.ok(!fs.existsSync(path.join(store.dir(limitedRoot, 'limit-parent'), 'stop.json')));
});
test('real managed Pi retires after configured idle timeout and retains its result', async () => {
  const { base } = await loader();
  peer('idle-parent');
  store.atomic(path.join(root, 'config.json'), { idleTimeoutMinutes: 0.02 });
  let child;
  try {
    child = await store.spawnAgent(root, { parentId: 'idle-parent', name: 'idle-retire-test',
      task: 'Reply with idle test complete.', cwd: temporary, provider: 'agent-team-test', model: 'echo', thinking: 'off',
      launch: { command: process.execPath, args: [path.join(base, 'dist/bundle/cli.js'), '--no-extensions',
        '--extension', path.join(__dirname, 'index.ts'), '--extension', path.join(__dirname, 'test/mock-provider.ts')] } });
    await until(() => store.member(root, child.id).status === 'stopped', 20000);
    assert.ok(store.member(root, child.id).result?.text);
    assert.equal(store.member(root, 'idle-parent').status, 'idle');
    assert.ok(fs.existsSync(store.member(root, child.id).sessionFile));
  } finally {
    fs.rmSync(path.join(root, 'config.json'), { force: true });
    if (child) {
      store.stop(root, child.id);
      await until(() => !store.alive(store.member(root, child.id).process.workerPid), 8000);
    }
  }
});
test('unexpected child exit reports failure to parent and retains stderr', async () => {
  peer('crash-parent');
  const child = await store.spawnAgent(root, { parentId: 'crash-parent', task: 'test crash', cwd: temporary,
    launch: { command: process.execPath, args: [path.join(__dirname, 'test/crash.cjs')] } });
  await until(() => store.member(root, child.id).status === 'failed');
  const failed = store.member(root, child.id);
  assert.equal(failed.process.exitCode, 23);
  assert.ok(failed.process.error.includes('Intentional local worker test failure'));
  await until(() => store.inbox(root, 'crash-parent').some(message => message.type === 'lifecycle'));
});
test('real managed Pi can call agent_stop self and exits without stopping its peers', async () => {
  const { base } = await loader();
  peer('self-stop-parent'); peer('self-stop-peer');
  const child = await store.spawnAgent(root, { parentId: 'self-stop-parent', name: 'self-stop-test',
    task: 'team-test-stop-self', cwd: temporary, provider: 'agent-team-test', model: 'echo', thinking: 'off',
    launch: { command: process.execPath, args: [path.join(base, 'dist/bundle/cli.js'), '--no-extensions',
      '--extension', path.join(__dirname, 'index.ts'), '--extension', path.join(__dirname, 'test/mock-provider.ts')] } });
  try {
    await until(() => ['stopped', 'failed'].includes(store.member(root, child.id).status), 20000);
    assert.equal(store.member(root, child.id).status, 'stopped', JSON.stringify(store.member(root, child.id)));
    assert.ok(fs.readFileSync(child.logPath, 'utf8').includes('"toolName":"agent_stop"'));
    assert.equal(store.member(root, 'self-stop-peer').status, 'idle');
    assert.ok(!fs.existsSync(path.join(store.dir(root, 'self-stop-peer'), 'stop.json')));
  } finally {
    store.stop(root, child.id);
    await until(() => !store.alive(store.member(root, child.id).process.workerPid), 8000);
  }
});
test('real Pi executes leaked _agent_send and _agent_stop names as canonical tools', async () => {
  const { base } = await loader();
  peer('prefix-parent');
  const launch = { command: process.execPath, args: [path.join(base, 'dist/bundle/cli.js'), '--no-extensions',
    '--extension', path.join(__dirname, 'index.ts'), '--extension', path.join(__dirname, 'test/mock-provider.ts')] };
  const sender = await store.spawnAgent(root, { parentId: 'prefix-parent', name: 'prefix-send',
    task: 'team-test-prefixed-send', cwd: temporary, provider: 'agent-team-test', model: 'echo', thinking: 'off', launch });
  try {
    await until(() => store.inbox(root, 'prefix-parent').some(message => message.message === 'prefixed-send-delivered'), 20000);
    await until(() => !!store.member(root, sender.id).result);
    assert.equal(store.inbox(root, 'prefix-parent').filter(message => message.message === 'prefixed-send-delivered').length, 1);
    const log = fs.readFileSync(sender.logPath, 'utf8');
    assert.ok(log.includes('"toolName":"agent_send"'));
    assert.ok(!log.includes('Tool _agent_send not found'));
    const history = fs.readFileSync(store.member(root, sender.id).sessionFile, 'utf8');
    assert.ok(history.includes('"name":"agent_send"'));
    assert.ok(!history.includes('"name":"_agent_send"'));
  } finally {
    store.stop(root, sender.id);
    await until(() => !store.alive(store.member(root, sender.id).process.workerPid), 8000);
  }
  const stopper = await store.spawnAgent(root, { parentId: 'prefix-parent', name: 'prefix-stop',
    task: 'team-test-prefixed-stop', cwd: temporary, provider: 'agent-team-test', model: 'echo', thinking: 'off', launch });
  try {
    await until(() => ['stopped', 'failed'].includes(store.member(root, stopper.id).status), 20000);
    assert.equal(store.member(root, stopper.id).status, 'stopped');
    const log = fs.readFileSync(stopper.logPath, 'utf8');
    assert.ok(log.includes('"toolName":"agent_stop"'));
    assert.ok(!log.includes('Tool _agent_stop not found'));
  } finally {
    store.stop(root, stopper.id);
    await until(() => !store.alive(store.member(root, stopper.id).process.workerPid), 8000);
  }
});
test('real Pi RPC worker uses local provider, stays available for messages, reports results and stops', async () => {
  const { base } = await loader();
  peer('rpc-parent');
  const worker = await store.spawnAgent(root, { parentId: 'rpc-parent', name: 'rpc-test-worker',
    task: 'team-test-start-background then return the deterministic local test result.', cwd: temporary,
    provider: 'agent-team-test', model: 'echo', thinking: 'off',
    launch: { command: process.execPath, args: [path.join(base, 'dist/bundle/cli.js'),
      '--no-extensions', '--extension', path.join(__dirname, 'index.ts'),
      '--extension', path.join(__dirname, '../background-bash/index.ts'),
      '--extension', path.join(__dirname, 'test/mock-provider.ts')] },
  });
  const { createHash } = require('node:crypto');
  const jobs = require('../background-bash/manager.cjs');
  const jobRoot = path.join(os.homedir(), '.pi/agent/background-jobs', createHash('sha256').update(worker.initialSessionId).digest('hex').slice(0, 24));
  const describe = () => JSON.stringify(store.member(root, worker.id));
  try {
    try { await until(() => {
      const current = store.member(root, worker.id);
      if (['failed', 'exited', 'interrupted'].includes(current.status)) throw new Error('Worker exited before reporting a result');
      return current.result?.text.includes('local-worker-result');
    }, 25000); }
    catch (error) { throw new Error(`${error.message}\n${describe()}\n${fs.readFileSync(worker.logPath, 'utf8').slice(-6000)}`); }
    let current = store.member(root, worker.id);
    assert.equal(current.status, 'idle');
    assert.ok(current.sessionId);
    assert.ok(fs.existsSync(current.sessionFile));
    assert.ok(store.inbox(root, 'rpc-parent').some(message => message.type === 'result'));
    assert.equal(jobs.list(jobRoot).length, 1);
    assert.ok(['starting', 'running'].includes(jobs.list(jobRoot)[0].status));
    const before = current.result.finishedAt;
    store.send(root, 'rpc-parent', worker.id, 'Follow-up: report again.');
    await until(() => store.member(root, worker.id).result?.finishedAt > before);
    assert.ok(store.inbox(root, worker.id)[0].deliveredAt);
    store.stop(root, worker.id);
    await until(() => ['stopped', 'failed'].includes(store.member(root, worker.id).status), 8000);
    current = store.member(root, worker.id);
    assert.equal(current.status, 'stopped', describe());
    await until(() => jobs.list(jobRoot).every(job => job.status === 'stopped'));
    assert.throws(() => store.send(root, 'rpc-parent', worker.id, 'cannot restart'), /stopped/);
  } finally {
    store.stop(root, worker.id);
    await until(() => !store.alive(store.member(root, worker.id).process.workerPid), 8000);
    for (const job of jobs.list(jobRoot)) jobs.stop(jobRoot, job.id);
    await until(() => jobs.list(jobRoot).every(job => job.finishedAt));
    fs.rmSync(jobRoot, { recursive: true, force: true });
  }
});
