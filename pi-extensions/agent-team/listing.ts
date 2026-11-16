import { join } from 'node:path';
import * as store from './store.ts';

const active = new Set(['starting', 'working', 'idle', 'waiting', 'stopping']);
const clip = (value, length) => value == null ? undefined : String(value).slice(0, length);
function summary(member) {
  return { id: member.id, name: clip(member.name, 120), kind: member.kind,
    status: clip(member.status, 24), online: Boolean(member.online), parentId: member.parentId };
}
function selectMembers(members, self, options: any = {}) {
  const scope = options.scope ?? 'team';
  if (!['team', 'all'].includes(scope)) throw new Error('scope must be team or all');
  const limit = options.limit ?? 20, offset = options.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error('limit must be 1–50');
  if (!Number.isInteger(offset) || offset < 0) throw new Error('offset must be a nonnegative integer');
  const family = new Set([self]);
  if (scope === 'team') {
    for (let size = -1; size !== family.size;) {
      size = family.size;
      for (const member of members) if (family.has(member.parentId)) family.add(member.id);
    }
  }
  const matching = members.filter(member => (scope === 'all' || family.has(member.id)) &&
    (options.includeInactive || member.online || (member.kind === 'managed' && active.has(member.status))))
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0) || a.id.localeCompare(b.id));
  const page = matching.slice(offset, offset + limit);
  return { self, scope, includeInactive: Boolean(options.includeInactive), total: matching.length,
    offset, limit, nextOffset: offset + page.length < matching.length ? offset + page.length : null,
    members: page.map(summary) };
}
function listAgents(root, self, options: any = {}) {
  if (options.details && !options.id) throw new Error('details requires a single agent id');
  if (!options.id) return selectMembers(store.list(root), self, options);
  const member = store.resolve(root, options.id, self);
  const row = summary(member);
  if (options.details) {
    const location = store.dir(root, member.id);
    Object.assign(row, { cwd: member.cwd, provider: member.provider, model: member.model,
      sessionId: member.sessionId, sessionFile: member.sessionFile,
      taskPreview: clip(member.task, 1500), taskTruncated: (member.task?.length ?? 0) > 1500,
      resultPreview: clip(member.result?.text, 1500), resultTruncated: (member.result?.text?.length ?? 0) > 1500,
      resultPhase: member.result?.phase, resultFinishedAt: member.result?.finishedAt,
      error: clip(member.process?.error || member.result?.error, 500),
      taskFile: join(location, 'meta.json'), resultFile: member.result ? join(location, 'result.json') : undefined,
      logPath: member.logPath });
  }
  return { self, members: [row] };
}
export { summary, selectMembers, listAgents };
