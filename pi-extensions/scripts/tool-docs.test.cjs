const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = () => import(path.join(__dirname, 'tool-docs.mjs'));

test('the committed reference matches the registered tools and names every tool', async () => {
  const { collect, render, compare, DOC } = await load();
  const generated = render(await collect());
  const committed = fs.readFileSync(DOC, 'utf8');
  assert.deepEqual(compare(generated, committed), []);
  for (const name of ['agent_spawn', 'agent_list', 'agent_send', 'agent_inbox', 'agent_stop', 'ask_user', 'background_bash', 'background_job']) {
    assert.match(committed, new RegExp(`### \`${name}\``));
  }
  assert.match(committed, /`\/questions`/); assert.match(committed, /`ctrl\+alt\+u`/);
  assert.doesNotMatch(committed, /\/Users\//, 'no machine-specific paths');
});

test('a hand-edited (stale) reference fails the check with the fix', async () => {
  const { compare } = await load();
  const problems = compare('# Tool reference\n\n### `ask_user`\n', '# Tool reference\n\n### `ask_user` (edited)\n');
  assert.equal(problems.length, 1);
  assert.match(problems[0], /npm run docs/);
});

test('parameter types render unions, arrays, literals and limits', async () => {
  const { typeOf, renderTool } = await load();
  assert.equal(typeOf({ type: 'array', items: { anyOf: [{ type: 'string' }, { type: 'object', properties: { label: {} } }] } }), '(string \\| { label })[]');
  assert.equal(typeOf({ anyOf: [{ const: 'a' }, { const: 'b' }] }), '"a" \\| "b"');
  const md = renderTool({ name: 'demo', description: 'Line one\n  line two', parameters: { type: 'object', required: ['key'],
    properties: { key: { type: 'string', maxLength: 5, description: 'A | B' }, n: { type: 'integer', minimum: 1 } } } });
  assert.match(md, /^### `demo`\n\nLine one line two\n/);
  assert.match(md, /\| `key` \| string \| yes \| A \\\| B; max length 5 \|/);
  assert.match(md, /\| `n` \| integer \| no \| min 1 \|/);
});
