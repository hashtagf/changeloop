import { openSync, closeSync, readSync, statSync } from 'node:fs';
import * as jobs from './manager.cjs';

function brief(job) {
  return { id: job.id, status: job.status, exitCode: job.exitCode ?? null,
    commandPreview: String(job.command ?? '').slice(0, 160), createdAt: job.createdAt,
    finishedAt: job.finishedAt, logPath: job.logPath };
}
function jobQuery(root, options) {
  const { action, id } = options;
  if (action === 'list') {
    const limit = options.limit ?? 20, offset = options.offset ?? 0;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0) throw new Error('Invalid page: limit 1–50, offset >= 0');
    const all = jobs.list(root).filter(job => options.includeFinished || ['starting', 'running'].includes(job.status));
    const page = all.slice(offset, offset + limit);
    return { total: all.length, offset, limit, nextOffset: offset + page.length < all.length ? offset + page.length : null, jobs: page.map(brief) };
  }
  if (!id) throw new Error('id is required');
  if (action === 'stop') return brief(jobs.stop(root, id));
  const job = jobs.read(root, id), result = brief(job);
  if (action === 'log') {
    const maxBytes = options.maxBytes ?? 8192;
    if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 32768) throw new Error('maxBytes must be 1–32768');
    let size = 0;
    try { size = statSync(job.logPath).size; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const offset = options.byteOffset ?? Math.max(0, size - maxBytes);
    if (!Number.isInteger(offset) || offset < 0) throw new Error('byteOffset must be nonnegative');
    const length = Math.max(0, Math.min(maxBytes, size - offset));
    let output = '';
    if (length) {
      const fd = openSync(job.logPath, 'r');
      try { const bytes = Buffer.alloc(length); const n = readSync(fd, bytes, 0, length, offset); output = bytes.subarray(0, n).toString('utf8'); }
      finally { closeSync(fd); }
    }
    if (options.lines != null) output = output.split('\n').slice(-Math.min(500, Math.max(1, options.lines))).join('\n');
    Object.assign(result, { output, byteOffset: offset, totalBytes: size, nextByteOffset: offset + length < size ? offset + length : null });
  } else if (action !== 'status') throw new Error('Unknown job action');
  // The model has now explicitly inspected this terminal outcome; don't wake it again.
  if (!['starting', 'running'].includes(job.status) && (job.finishedAt || job.status === 'interrupted')) jobs.acknowledge(root, id);
  return result;
}
export { brief, jobQuery };
