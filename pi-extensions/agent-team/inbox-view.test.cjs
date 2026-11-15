const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const store = require('./store.cjs');
const { inboxView } = require('./inbox-view.ts');
test('inbox previews bound large duplicated envelopes and full text is pageable without consuming messages', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-inbox-view-'));
  try {
    store.register(root, { id: 'self' }); store.register(root, { id: 'worker' });
    const body = 'x'.repeat(32000);
    for (let i = 0; i < 35; i++) store.send(root, 'worker', 'self', body, { type: 'result', details: { text: body } });
    const page = inboxView(root, 'self');
    assert.equal(page.total, 35); assert.equal(page.messages.length, 10); assert.equal(page.nextOffset, 10);
    assert.ok(JSON.stringify(page).length < 6000);
    assert.equal(page.messages[0].details, undefined);
    const next = inboxView(root, 'self', { offset: page.nextOffset });
    assert.equal(new Set([...page.messages, ...next.messages].map(m => m.id)).size, 20);
    let offset = 0, reconstructed = '';
    do { const chunk = inboxView(root, 'self', { id: page.messages[0].id, textOffset: offset });
      reconstructed += chunk.text; offset = chunk.nextTextOffset;
      assert.equal(store.read(chunk.file).details.text, body);
    } while (offset !== null);
    assert.equal(reconstructed, body);
    assert.equal(inboxView(root, 'self', { unreadOnly: true }).total, 35);
    assert.throws(() => inboxView(root, 'self', { id: '../escape' }), /Invalid/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
