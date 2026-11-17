// Pure browser helpers: no DOM access, so Node tests can import them directly.
export const ATTACHMENT_LIMIT = 10;
export const ATTACHMENT_BYTES = 20 * 1024 * 1024;

/** Last two path segments, so screenshots and tooltips do not expose home or temp directories. */
export function shortPath(path) {
  const value = String(path || '');
  const parts = value.split('/').filter(Boolean);
  if (parts.length <= 2) return value;
  return '…/' + parts.slice(-2).join('/');
}

/** Accept files that fit the per-message limits; report the rest instead of rejecting everything. */
export function selectAttachments(existingCount, files, { max = ATTACHMENT_LIMIT, maxBytes = ATTACHMENT_BYTES } = {}) {
  const accepted = [], skipped = [];
  let room = Math.max(0, max - existingCount);
  for (const file of files) {
    if (file.size > maxBytes) skipped.push({ name: file.name, reason: 'size' });
    else if (room <= 0) skipped.push({ name: file.name, reason: 'count' });
    else { accepted.push(file); room--; }
  }
  return { accepted, skipped };
}

/** Human summary for skipped attachments, or an empty string. */
export function skippedMessage(skipped, { max = ATTACHMENT_LIMIT } = {}) {
  const size = skipped.filter((s) => s.reason === 'size').map((s) => s.name);
  const count = skipped.filter((s) => s.reason === 'count').length;
  const parts = [];
  if (size.length) parts.push(size.join(', ') + ': limit is 20 MB.');
  if (count) parts.push(`Skipped ${count} file${count === 1 ? '' : 's'}: up to ${max} files per message.`);
  return parts.join(' ');
}

/** Basic Git branch-name check; the server still runs git check-ref-format. */
export function branchNameError(name) {
  const value = String(name ?? '');
  if (!value.trim()) return 'Enter a branch name.';
  if (/\s/.test(value) || /\.\.|[~^:?*[\\]|@\{/.test(value) || value.startsWith('-') || value.startsWith('/') ||
      value.endsWith('/') || value.endsWith('.') || value.endsWith('.lock') || value.includes('//') || /[\x00-\x1f\x7f]/.test(value))
    return 'Invalid branch name. Avoid spaces, "..", ~ ^ : ? * [ \\ and a leading "-".';
  return '';
}

/** Stage shown on narrow screens: the chosen one, else the first stage with work, else the first stage. */
export function defaultStage(statuses, counts, chosen) {
  if (chosen && statuses.includes(chosen)) return chosen;
  return statuses.find((s) => (counts[s] || 0) > 0) || statuses[0];
}
