import fs from 'node:fs';
import { stripVTControlCharacters } from 'node:util';

function safe(text) {
  return stripVTControlCharacters(String(text ?? '')).replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
}
function messageText(message) {
  if (typeof message.content === 'string') return safe(message.content);
  return (message.content ?? []).map(block => {
    if (block.type === 'text') return safe(block.text);
    if (block.type === 'toolCall') return `[tool: ${safe(block.name)}]`;
    if (block.type === 'image') return '[image]';
    return ''; // Do not display private thinking or binary content.
  }).filter(Boolean).join('\n');
}
function cleanValue(value, depth = 0) {
  if (depth > 12) return '[nested]';
  if (typeof value === 'string') return safe(value).slice(-16000);
  if (Array.isArray(value)) return value.map(item => cleanValue(item, depth + 1));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [safe(key), cleanValue(item, depth + 1)]));
  return value;
}
function visibleMessage(message) {
  const content = typeof message.content === 'string' ? [{ type: 'text', text: safe(message.content) }] :
    (message.content || []).flatMap(block => block.type === 'text' ? [{ type: 'text', text: safe(block.text) }] :
      block.type === 'toolCall' ? [{ type: 'toolCall', id: safe(block.id), name: safe(block.name), arguments: cleanValue(block.arguments) }] :
      block.type === 'image' ? [{ type: 'text', text: '[image]' }] : []);
  return { role: message.role, content, toolCallId: safe(message.toolCallId), toolName: safe(message.toolName),
    isError: !!message.isError, timestamp: message.timestamp, stopReason: message.stopReason,
    errorMessage: message.errorMessage ? safe(message.errorMessage) : undefined };
}
function readTranscript(file, limit = 40, maxBytes = 512 * 1024) {
  if (!file || !fs.existsSync(file)) return [];
  const fd = fs.openSync(file, 'r');
  let text, offset;
  try {
    const size = fs.fstatSync(fd).size, length = Math.min(size, maxBytes);
    offset = size - length;
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, offset);
    text = buffer.toString('utf8');
  } finally { fs.closeSync(fd); }
  let lines = text.split('\n');
  if (offset) lines.shift(); // A bounded read can start in the middle of a record.
  const entries = lines.flatMap(line => {
    if (!line) return [];
    try { return [JSON.parse(line)]; } catch { return []; } // Concurrent partial append.
  });
  const byId = new Map(entries.filter(entry => entry.id && entry.type !== 'session').map(entry => [entry.id, entry]));
  let leaf = [...entries].reverse().find(entry => byId.has(entry.id));
  const branch = [], seen = new Set();
  while (leaf && !seen.has(leaf.id)) {
    seen.add(leaf.id); branch.push(leaf); leaf = byId.get(leaf.parentId);
  }
  return branch.reverse().flatMap(entry => {
    if (entry.type === 'custom_message' && entry.display !== false) {
      return [{ id: entry.id, role: 'message', text: messageText(entry), timestamp: entry.timestamp }];
    }
    if (entry.type !== 'message' || !['user', 'assistant', 'toolResult', 'custom'].includes(entry.message?.role)) return [];
    const message = entry.message, content = messageText(message);
    if (!content) return [];
    return [{ id: entry.id, role: message.role, text: content.slice(-16000),
      tool: message.toolName, timestamp: message.timestamp, message: visibleMessage(message) }];
  }).slice(-limit);
}
export { safe, readTranscript };
