import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { workerDialogs } from './dialogs.ts';
import { createJobMonitor } from '../background-bash/monitor.ts';
import { createQuestionStore } from '../ask-user/store.ts';
import * as store from './store.ts';

const ACTIVE = new Set(['starting', 'working', 'idle', 'waiting', 'stopping']);
function sessionJobs(sessionId) {
  if (!sessionId) throw new Error('Session identity is unavailable');
  const root = path.join(homedir(), '.pi', 'agent', 'background-jobs',
    createHash('sha256').update(sessionId).digest('hex').slice(0, 24));
  return require('../background-bash/manager.cjs').list(root);
}

// One clock per session; uncertainty resets the clock rather than retiring work.
function createIdleReaper(root, jobs = sessionJobs) {
  const questions = createQuestionStore();
  let idleSince, retired = false;
  let jobMonitor;
  const monitoredJobs = sessionId => {
    if (jobs !== sessionJobs) return jobs(sessionId);
    if (!sessionId) throw new Error('Session identity is unavailable');
    jobMonitor ??= createJobMonitor(path.join(homedir(), '.pi', 'agent', 'background-jobs',
      createHash('sha256').update(sessionId).digest('hex').slice(0, 24)));
    return jobMonitor.read();
  };
  const reap = (self, ctx, members, now = Date.now()) => {
    try {
      const minutes = store.read(path.join(root, 'config.json'), {}).idleTimeoutMinutes ?? 10;
      const own = members.find(item => item.id === self);
      const family = new Set([self]);
      for (let size = -1; size !== family.size;) {
        size = family.size;
        for (const item of members) if (family.has(item.parentId)) family.add(item.id);
      }
      const blocked = retired || !Number.isFinite(minutes) || minutes <= 0 ||
        own?.kind !== 'managed' || own.status !== 'idle' ||
        !ctx.isIdle?.() || ctx.hasPendingMessages?.() !== false ||
        store.inbox(root, self, { unreadOnly: true, limit: 1 }).length ||
        workerDialogs(root, self, now).length ||
        (own?.sessionId && (questions.hasPending(own.sessionId) || questions.deliveries(own.sessionId).length)) ||
        members.some(item => item.id !== self && family.has(item.id) && ACTIVE.has(item.status));
      if (blocked || monitoredJobs(own.sessionId).some(job => ['starting', 'running', 'stop_requested'].includes(job.status))) {
        idleSince = undefined; return false;
      }
      idleSince ??= now;
      if (now - idleSince < minutes * 60000) return false;
      if (jobs(own.sessionId).some(job => ['starting', 'running', 'stop_requested'].includes(job.status))) {
        idleSince = undefined; return false;
      }
      // The monitor's family index is cached. Before an irreversible retirement,
      // recheck the complete current graph so a newly attached child is not missed.
      const current = store.list(root), descendants = new Set([self]);
      for (let size = -1; size !== descendants.size;) {
        size = descendants.size;
        for (const item of current) if (descendants.has(item.parentId)) descendants.add(item.id);
      }
      if (current.some(item => item.id !== self && descendants.has(item.id) && ACTIVE.has(item.status))) {
        idleSince = undefined; return false;
      }
      // No descendant shutdown: each worker retires only itself.
      store.stop(root, self, false);
      retired = true;
      return true;
    } catch {
      idleSince = undefined;
      return false;
    }
  };
  reap.reset = () => { idleSince = undefined; };
  reap.close = () => jobMonitor?.close();
  return reap;
}
export { createIdleReaper };
