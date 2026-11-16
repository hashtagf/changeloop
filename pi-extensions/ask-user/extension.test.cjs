const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createQuestionStore } = require('./store.ts');
const { createIdleReaper } = require('../agent-team/idle.ts');
const team = require('../agent-team/store.ts');
const wait = () => new Promise(resolve => setTimeout(resolve, 1700));

test('real Pi loader: tool, reload, answer batching, durable delivery and idle retirement protection', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-question-extension-'));
  const previous = process.env.PI_QUESTIONS_ROOT;
  const envKeys = ['PI_TEAM_ROOT', 'PI_TEAM_AGENT_ID', 'PI_TEAM_SUPERVISOR_PID'];
  const previousTeam = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  process.env.PI_QUESTIONS_ROOT = path.join(root, 'questions');
  process.env.PI_TEAM_ROOT = path.join(root, 'team');
  delete process.env.PI_TEAM_SUPERVISOR_PID;
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent`);
  const { loadExtensions, createExtensionRuntime } = await import(path.join(base, 'dist/core/extensions/loader.js'));
  const store = createQuestionStore(), sent = [], errors = [], branch = [], statuses = [];
  let extension, busy = false, fail = false;
  const ctx = { cwd: root, mode: 'rpc', isIdle: () => !busy, hasPendingMessages: () => false,
    sessionManager: { getSessionId: () => 'main-test', getBranch: () => branch },
    ui: { setStatus(_key, text) { statuses.push(text); }, notify(text, level) { if (level === 'error') errors.push(text); } } };
  const fire = async name => { for (const handler of extension?.handlers.get(name) || []) await handler({}, ctx); };
  async function load() {
    const runtime = createExtensionRuntime();
    runtime.sendMessage = (message, options) => { if (fail) throw new Error('fixture delivery unavailable'); sent.push({ message, options }); };
    const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], root, undefined, runtime);
    assert.deepEqual(loaded.errors, []);
    extension = loaded.extensions[0]; await fire('session_start');
  }
  try {
    await load();
    const tool = extension.tools.get('ask_user');
    const definition = tool.definition || tool;
    // Nested workers route to the interactive ancestor, not an intermediate RPC worker.
    const teamRootForRoute = process.env.PI_TEAM_ROOT;
    team.register(teamRootForRoute, { id: 'parent-main', sessionId: 'parent-session', name: 'Main' });
    team.register(teamRootForRoute, { id: 'parent-worker', kind: 'managed', parentId: 'parent-main', sessionId: 'middle-session' });
    team.register(teamRootForRoute, { id: 'nested-worker', kind: 'managed', parentId: 'parent-worker', sessionId: 'nested-session', name: 'Nested worker' });
    process.env.PI_TEAM_SUPERVISOR_PID = String(process.ppid); process.env.PI_TEAM_AGENT_ID = 'nested-worker';
    const nestedCtx = { ...ctx, sessionManager: { ...ctx.sessionManager, getSessionId: () => 'nested-session' } };
    await definition.execute('nested-call', { key: 'nested', question: 'Nested question?' }, undefined, undefined, nestedCtx);
    delete process.env.PI_TEAM_SUPERVISOR_PID; delete process.env.PI_TEAM_AGENT_ID;
    assert.equal(store.pending('parent-session')[0].sessionId, 'nested-session');
    assert.equal(store.pending('middle-session').length, 0);
    const first = await definition.execute('call-1', { key: 'region', question: 'Choose region', options: ['Asia', 'Europe'] }, undefined, undefined, ctx);
    const second = await definition.execute('call-2', { key: 'format', question: 'Choose format' }, undefined, undefined, ctx);
    assert.equal(first.details.status, 'pending');
    await fire('session_shutdown'); await load();
    assert.equal(store.pending('main-test').length, 2);
    await wait(); assert.ok(statuses.includes('รอคำตอบ 2 · /questions'));
    busy = true;
    store.answer(second.details.id, 'main-test', 'JSON');
    store.answer(first.details.id, 'main-test', 'Asia');
    await wait(); assert.equal(sent.length, 0, 'busy model does not get a burst of follow-ups');
    busy = false; fail = true; await wait();
    assert.equal(store.deliveries('main-test').length, 2, 'delivery failure keeps both answers');
    fail = false; await wait();
    assert.equal(sent.length, 1); assert.equal(sent[0].message.details.questionIds.length, 2);
    await wait(); assert.equal(sent.length, 1, 'queued answers are not repeatedly sent');
    await fire('agent_settled'); await wait();
    assert.equal(sent.length,1,'settling before persistence must not resend queued answers');
    const {SessionManager}=await import(path.join(base,'dist/core/session-manager.js'));
    const actual=SessionManager.inMemory(root);
    const message=sent[0].message;
    actual.appendCustomMessageEntry(message.customType,message.content,message.display,message.details);
    branch.push(...actual.getEntries());
    await fire('agent_settled'); await wait();
    assert.equal(sent.length,1,'actual Pi custom_message entries acknowledge delivery');
    await fire('session_shutdown'); await load(); await wait();
    assert.equal(sent.length, 1); assert.equal(store.deliveries('main-test').length, 0);
    assert.ok(errors.every(e => e.includes('fixture delivery unavailable')));

    const owner = { id: 'worker-test', kind: 'managed', status: 'idle', sessionId: 'waiting-worker' };
    const teamRoot = path.join(root, 'team');
    team.atomic(path.join(team.dir(teamRoot, owner.id), 'meta.json'), owner);
    const q = store.ask({ sessionId: owner.sessionId, recipientSessionId: 'main-test', key: 'choice', question: 'Pick one' });
    const reaper = createIdleReaper(teamRoot, () => []);
    assert.equal(reaper(owner.id, ctx, [owner], 0), false);
    assert.equal(reaper(owner.id, ctx, [owner], 99999999), false);
    store.answer(q.id, 'main-test', 'One');
    assert.equal(reaper(owner.id, ctx, [owner], 199999999), false, 'undelivered answer protects idle worker too');
    assert.equal(fs.existsSync(path.join(team.dir(teamRoot, owner.id), 'stop.json')), false);
    reaper.close();
  } finally {
    await fire('session_shutdown');
    if (previous === undefined) delete process.env.PI_QUESTIONS_ROOT; else process.env.PI_QUESTIONS_ROOT = previous;
    for (const key of envKeys) { if (previousTeam[key] === undefined) delete process.env[key]; else process.env[key] = previousTeam[key]; }
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('real Pi loader: structured batch tool call and event-bus bridge (prompt, answer, result, resolved)', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-question-events-'));
  const saved = { q: process.env.PI_QUESTIONS_ROOT, t: process.env.PI_TEAM_ROOT };
  process.env.PI_QUESTIONS_ROOT = path.join(root, 'questions'); process.env.PI_TEAM_ROOT = path.join(root, 'team');
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent`);
  const { loadExtensions, createExtensionRuntime } = await import(path.join(base, 'dist/core/extensions/loader.js'));
  const { createEventBus } = await import(path.join(base, 'dist/core/event-bus.js'));
  const bus = createEventBus(), seen = { prompt: [], result: [], resolved: [] };
  for (const name of Object.keys(seen)) bus.on(`ask-user:${name === 'result' ? 'answer-result' : name}`, p => seen[name].push(p));
  const ctx = { cwd: root, mode: 'rpc', isIdle: () => false, hasPendingMessages: () => false,
    sessionManager: { getSessionId: () => 'events-main', getBranch: () => [] }, ui: { setStatus() {}, notify() {} } };
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], root, bus, createExtensionRuntime());
  assert.deepEqual(loaded.errors, []);
  const extension = loaded.extensions[0];
  const fire = async name => { for (const handler of extension.handlers.get(name) || []) await handler({}, ctx); };
  try {
    await fire('session_start');
    const tool = extension.tools.get('ask_user'); const definition = tool.definition || tool;
    const { Value } = await import(path.join(base, '../../typebox/build/value/index.mjs'));
    const params = { key: 'plan', questions: [
      { question: 'Which cache?', header: 'Cache', options: [{ label: 'Redis', recommended: true, preview: 'x' }, 'Memory'] },
      { question: 'Which tests?', multiSelect: true, options: ['Unit', 'E2E'] }] };
    assert.ok(Value.Check(definition.parameters, params), 'schema accepts the batch form');
    const result = await definition.execute('c1', params, undefined, undefined, ctx);
    await assert.rejects(definition.execute('c2', { key: 'bad', question: 'x', questions: [{ question: 'y' }] }, undefined, undefined, ctx), /exactly one/);
    await fire('agent_settled');
    assert.equal(seen.prompt.length, 1);
    assert.deepEqual(seen.prompt[0].questions[0].options[0], { label: 'Redis', description: undefined, recommended: true, hasPreview: true });
    const id = result.details.id;
    bus.emit('ask-user:answer', { id, requestId: 'r1', answers: [{ questionIndex: 0, optionIndexes: [0] }] });
    assert.equal(seen.result.at(-1).code, 'invalid_answer');
    bus.emit('ask-user:answer', { id: 'f'.repeat(64), answers: [] });
    assert.equal(seen.result.at(-1).code, 'not_found');
    bus.emit('ask-user:answer', { id, requestId: 'r2', answers: [{ questionIndex: 0, optionIndexes: [1] }, { questionIndex: 1, optionIndexes: [0, 1], notes: 'both' }], globalNote: 'via telegram' });
    assert.deepEqual(seen.result.at(-1), { ok: true, code: undefined, reason: undefined, id, requestId: 'r2' });
    bus.emit('ask-user:answer', { id, text: 'late' });
    assert.equal(seen.result.at(-1).code, 'already_answered');
    assert.equal(seen.resolved.length, 1); assert.equal(seen.resolved[0].response.globalNote, 'via telegram');
    await fire('session_shutdown');
    bus.emit('ask-user:answer', { id, text: 'after shutdown' });
    assert.equal(seen.result.length, 4, 'listener removed on shutdown');
  } finally {
    await fire('session_shutdown');
    for (const [k, v] of [['PI_QUESTIONS_ROOT', saved.q], ['PI_TEAM_ROOT', saved.t]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    fs.rmSync(root, { recursive: true, force: true });
  }
});
