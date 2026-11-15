const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('compact team prompt preserves manual mode, Thai communication and on-demand procedures', async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'team-context-'));
  const previous = process.env.PI_TEAM_ROOT;
  process.env.PI_TEAM_ROOT = temp;
  t.after(() => {
    if(previous === undefined) delete process.env.PI_TEAM_ROOT;
    else process.env.PI_TEAM_ROOT = previous;
    fs.rmSync(temp, {recursive:true, force:true});
  });
  const version = fs.readFileSync(path.join(os.homedir(), '.pi/agent/install/current-version'), 'utf8').trim();
  const base = path.join(os.homedir(), `.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent`);
  const {loadExtensions, createExtensionRuntime} = await import(path.join(base, 'dist/core/extensions/loader.js'));
  const loaded = await loadExtensions([path.join(__dirname,'index.ts')], temp, undefined, createExtensionRuntime());
  assert.deepEqual(loaded.errors, []);
  const handlers = loaded.extensions[0].handlers.get('before_agent_start');
  let prompt = 'BASE';
  for(const handler of handlers) prompt = (await handler({prompt:'Review this task',systemPrompt:prompt},{}))?.systemPrompt || prompt;
  assert.ok(prompt.startsWith('BASE'));
  assert.ok(prompt.length < 2400, `prompt chars: ${prompt.length}`);
  assert.match(prompt,/Respond in Thai/);
  assert.match(prompt,/โหมดแตกตัวทำงานอัตโนมัติปิดอยู่/);
  assert.match(prompt,/read the best relevant SKILL.md/);
  assert.match(prompt,/reference\/agent-workflow.md/);
  assert.match(prompt,/no repeated approval requests|repeated approval requests/);
  assert.match(prompt,/settled is not done/);
});
