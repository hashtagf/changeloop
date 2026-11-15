import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as store from './store.ts';

function inboxView(root, self, options = {}) {
  const location = store.dir(root, self), folder = join(location, 'inbox');
  if (options.id) {
    if (!/^\d+-[a-f0-9-]+$/.test(options.id)) throw new Error('Invalid message ID');
    const file = join(folder, options.id + '.json'), message = store.read(file);
    if (!message) throw new Error('Message not found');
    const offset = options.textOffset ?? 0, length = options.maxChars ?? 4000;
    if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(length) || length < 1 || length > 8000) throw new Error('Invalid text range');
    const text = String(message.message ?? '');
    return { self, id: message.id, from: message.from, type: message.type, file,
      text: text.slice(offset, offset + length), textOffset: offset, totalCharacters: text.length,
      nextTextOffset: offset + length < text.length ? offset + length : null };
  }
  const limit = options.limit ?? 10, offset = options.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > 20 || !Number.isInteger(offset) || offset < 0) throw new Error('limit must be 1–20; offset must be nonnegative');
  const files = existsSync(folder) ? readdirSync(folder).filter(name => /^\d+-[a-f0-9-]+\.json$/.test(name)).sort().reverse() : [];
  const matching = files.filter(name => !options.unreadOnly || !existsSync(join(location, 'receipts', name)));
  const page = matching.slice(offset, offset + limit);
  return { self, total: matching.length, offset, limit, nextOffset: offset + page.length < matching.length ? offset + page.length : null,
    messages: page.map(name => {
      const message = store.read(join(folder, name)), receipt = store.read(join(location, 'receipts', name));
      return { id: message.id, from: message.from, type: message.type, delivery: message.delivery,
        createdAt: message.createdAt, deliveredAt: receipt?.deliveredAt,
        preview: String(message.message ?? '').slice(0, 180), characters: String(message.message ?? '').length };
    }) };
}
export { inboxView };
