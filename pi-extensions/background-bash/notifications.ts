import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as jobs from './manager.cjs';
import { brief } from './outputs.ts';

// Deliberately recognize only a bare sleep command; never infer shell semantics
// for commands that run checks, chains, scripts, redirections or substitutions.
const timerOnly = command => /^\s*(?:rtk\s+(?:proxy\s+)?)?(?:\/bin\/|\/usr\/bin\/)?sleep\s+\d+(?:\.\d+)?\s*$/.test(command);
function createNotifications(root, send, clock = Date.now) {
  const stateFile = join(root, 'notification-state.json');
  return (ctx, all = jobs.list(root)) => {
    const pending = [];
    for (const job of all) {
      if (!job.notify || job.notified || ['starting', 'running'].includes(job.status) || (!job.finishedAt && job.status !== 'interrupted')) continue;
      // Legacy jobs lack an explicit policy: preserve their promised notification.
      if (job.notifyMode === 'auto' && (job.status === 'stopped' || (job.status === 'completed' && job.exitCode === 0 && timerOnly(job.command)))) {
        jobs.acknowledge(root, job.id); continue;
      }
      pending.push(job);
    }
    if (!pending.length || !ctx.isIdle?.() || ctx.hasPendingMessages?.()) return 0;
    const failure = job => job.status !== 'completed' || job.exitCode !== 0;
    const now = clock();
    let state: { lastWakeAt?: number } = {};
    try { state = JSON.parse(readFileSync(stateFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const important = pending.some(failure);
    const first = Math.min(...pending.map(job => job.finishedAt ?? job.createdAt));
    const last = Math.max(...pending.map(job => job.finishedAt ?? job.createdAt));
    if (now < (state.lastWakeAt ?? -Infinity) + (important ? 5000 : 30000)) return 0;
    if (!important && now < Math.min(last + 5000, first + 30000)) return 0;
    const batch = pending.sort((a, b) => Number(failure(b)) - Number(failure(a)) || (a.finishedAt ?? a.createdAt) - (b.finishedAt ?? b.createdAt)).slice(0, 20);
    send({ customType: 'background-job', display: false,
      content: 'Background outcomes collected. Review together and continue only work that needs action. Do not acknowledge each job. Use background_job action log for full output.\n' +
        JSON.stringify(batch.map(job => ({ ...brief(job), outputPreview: jobs.tail(root, job.id, 20).slice(-800) }))),
      details: { ids: batch.map(job => job.id), count: batch.length },
    }, { triggerTurn: true, deliverAs: 'followUp' });
    mkdirSync(root, { recursive: true, mode: 0o700 });
    writeFileSync(stateFile + '.tmp', JSON.stringify({ lastWakeAt: now }), { mode: 0o600 });
    renameSync(stateFile + '.tmp', stateFile);
    for (const job of batch) jobs.acknowledge(root, job.id);
    return batch.length;
  };
}
export { timerOnly, createNotifications };
