import { createHash } from 'node:crypto';
import path from 'node:path';
import * as store from './store.ts';

// Exact short acknowledgements only: never substring-match a substantive report.
const acknowledgement = /^(?:no update(?: needed)?|nothing new|acknowledged|understood|รับทราบ(?:ครับ|ค่ะ)?|ไม่มีข้อมูลใหม่)[.!。\s]*$/iu;
export function publishResult(root, self, result, { usedTools = false, prompt = '' } = {}, publish) {
  const file = path.join(store.dir(root, self), 'published-result.json');
  const previous = store.read(file, {});
  const fingerprint = createHash('sha256').update(JSON.stringify([prompt, result.text, result.error, Boolean(result.aborted)])).digest('hex');
  const critical = Boolean(result.error || result.aborted);
  if (previous.fingerprint && !critical && !usedTools &&
      (previous.fingerprint === fingerprint || acknowledgement.test(result.text.trim()))) return false;
  publish(); // Commit only after durable enqueue succeeds.
  store.atomic(file, { fingerprint, publishedAt: Date.now() });
  return true;
}
