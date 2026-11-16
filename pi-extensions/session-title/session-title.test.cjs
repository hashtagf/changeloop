const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loaderPath = path.join(__dirname, '..', 'node_modules', '@earendil-works', 'pi-coding-agent', 'dist', 'core', 'extensions', 'loader.js');
const { titleFromPrompt, normalizeTitle, MAX_AUTO } = require('./index.ts');

// Loads the extension through Pi's real loader with an in-memory session.
async function start(entries = [], name) {
  const { loadExtensions, createExtensionRuntime } = await import(loaderPath);
  const session = { name, entries: [...entries] };
  const runtime = createExtensionRuntime();
  runtime.getSessionName = () => session.name;
  runtime.setSessionName = value => { session.name = value; };
  runtime.appendEntry = (customType, data) => { session.entries.push({ type: 'custom', customType, data }); };
  const loaded = await loadExtensions([path.join(__dirname, 'index.ts')], __dirname, undefined, runtime);
  assert.deepEqual(loaded.errors, []);
  const ext = loaded.extensions[0];
  const ctx = { sessionManager: { getEntries: () => session.entries } };
  const fire = async (name, event = {}) => { let out; for (const h of ext.handlers.get(name) || []) out = await h(event, ctx); return out; };
  await fire('session_start');
  const tool = ext.tools.get('session_title'); const def = tool.definition || tool;
  return { session, fire, call: title => def.execute('t', { title }, undefined, undefined, ctx),
    prompt: text => fire('before_agent_start', { type: 'before_agent_start', messageType: 'user', prompt: text, systemPrompt: 'BASE' }),
    reload: async () => { await fire('session_shutdown'); return start(session.entries, session.name); } };
}

test('first prompt names an unnamed session and the guidance is appended', async () => {
  const s = await start();
  const result = await s.prompt('ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่\n\nรายละเอียดเพิ่ม');
  assert.equal(s.session.name, 'ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่');
  assert.match(result.systemPrompt, /^BASE\n\n.*session_title/s);
  await s.prompt('second prompt');
  assert.equal(s.session.name, 'ปรับให้แสดงชื่อ ที่ว่าทำงานอะไรอยู่', 'only the first prompt names it');
});

test('long prompts are cut to the limit with an ellipsis, without splitting graphemes', () => {
  const name = titleFromPrompt('x'.repeat(120));
  assert.equal([...name].length, MAX_AUTO); assert.ok(name.endsWith('…'));
  const thai = titleFromPrompt('ที่'.repeat(60));
  assert.ok(thai.endsWith('…')); assert.ok(!thai.includes('\uFFFD'));
  assert.equal(titleFromPrompt('  spaced    out   words  '), 'spaced out words');
});

test('an existing name is kept', async () => {
  const s = await start([], 'Release prep');
  await s.prompt('do something else');
  assert.equal(s.session.name, 'Release prep');
});

test('commands and text without letters are skipped; the next real prompt is used', async () => {
  assert.equal(titleFromPrompt('/reload'), undefined);
  assert.equal(titleFromPrompt('???'), undefined);
  assert.equal(titleFromPrompt(undefined), undefined);
  const s = await start();
  await s.prompt('/reload'); await s.prompt('???');
  assert.equal(s.session.name, undefined);
  await s.prompt('Fix login bug');
  assert.equal(s.session.name, 'Fix login bug');
});

test('the agent updates an automatic name with session_title', async () => {
  const s = await start();
  await s.prompt('first prompt');
  const r = await s.call('  Tab titles   from work ');
  assert.equal(s.session.name, 'Tab titles from work'); assert.equal(r.details.changed, true);
});

test('a name the user set with /name is never replaced', async () => {
  const s = await start();
  await s.prompt('first prompt');
  s.session.name = 'Mine'; // /name
  const r = await s.call('Agent label');
  assert.equal(s.session.name, 'Mine'); assert.equal(r.details.changed, false);
  assert.match(r.content[0].text, /user named this session "Mine"/);
});

test('empty or too long titles are refused and the name is unchanged', async () => {
  const s = await start();
  await s.prompt('first prompt');
  await assert.rejects(s.call('   '), /1-60/);
  await assert.rejects(s.call('a'.repeat(61)), /1-60/);
  assert.equal(s.session.name, 'first prompt');
  assert.equal(normalizeTitle('a'.repeat(60)).length, 60);
});

test('ownership of the automatic name survives /reload', async () => {
  const s = await start();
  await s.prompt('first prompt');
  const reloaded = await s.reload();
  await reloaded.call('After reload');
  assert.equal(reloaded.session.name, 'After reload');
  const manual = await start([], 'Mine');
  assert.equal((await manual.call('x')).details.changed, false, 'no entry → a pre-existing name is the user\'s');
});
