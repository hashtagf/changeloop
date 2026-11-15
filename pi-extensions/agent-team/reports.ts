import path from 'node:path';
import * as store from './store.ts';
import { communicationPolicy } from './communication.ts';

function isReport(root, self, message) {
  if (['result', 'lifecycle'].includes(message.type)) return true;
  try { return store.member(root, message.from).parentId === self; }
  catch { return false; }
}
function settings(root, self) {
  const saved = store.read(path.join(store.dir(root, self), 'report-settings.json'), {});
  return { mode: saved.mode === 'quiet' ? 'quiet' : 'batch' };
}
function setMode(root, self, mode) {
  if (!['batch', 'quiet'].includes(mode)) throw new Error('Use /agents reports batch | quiet | status | flush');
  store.atomic(path.join(store.dir(root, self), 'report-settings.json'), { mode });
  return status(root, self);
}
function pending(root, self) {
  return store.inbox(root, self, { unreadOnly: true, limit: 100, filter: message => isReport(root, self, message) });
}
function status(root, self) { return { ...settings(root, self), pending: pending(root, self).length }; }
function urgent(message) {
  return message.delivery === 'steer' || Boolean(message.details?.error) ||
    (message.type === 'lifecycle' && /\bfailed\b/.test(message.message));
}
function createReportDispatcher(root, self, send, clock = Date.now) {
  const statePath = path.join(store.dir(root, self), 'report-state.json');
  return {
    flush(ctx, { force = false } = {}) {
      // Never queue a report behind a user's active conversation or steering.
      if (!ctx.isIdle?.() || ctx.hasPendingMessages?.()) return 0;
      const now = clock(), mode = settings(root, self).mode;
      if (mode === 'quiet' && !force) return 0;
      return store.deliverBatch(root, self, messages => {
        const reports = messages.filter(message => isReport(root, self, message));
        if (!reports.length) return [];
        const important = reports.some(urgent);
        const first = Math.min(...reports.map(message => message.createdAt));
        const last = Math.max(...reports.map(message => message.createdAt));
        const state = store.read(statePath, {});
        // Debounce bursts, cap collection at 30s, and limit normal wakeups to 1/30s.
        if (!force && !important && (now < Math.min(last + 5000, first + 30000) ||
          now < (state.lastWakeAt ?? -Infinity) + 30000)) return [];
        // A repeated failure must not create a fast wakeup loop either.
        if (!force && important && now < (state.lastWakeAt ?? -Infinity) + 5000) return [];
        // Bound each wakeup by whole messages, never discard or truncate a report.
        const batch = []; let bytes = 0;
        for (const report of reports) {
          const size = Buffer.byteLength(report.message);
          if (batch.length && bytes + size > 128 * 1024) break;
          batch.push(report); bytes += size;
        }
        return batch;
      }, messages => {
        const summaries = messages.map(message => {
          let name = message.from;
          try { name = `${store.member(root, message.from).name} (${message.from})`; } catch {}
          return `[${message.type} from ${name}; message ${message.id}]\n${message.message}`;
        });
        send({ customType: 'agent-team-report-batch', display: false,
          content: `Collected ${messages.length} agent reports. A settled turn is not proof the task is complete.\n` +
            communicationPolicy + '\n\n' + 'Review these together, coordinate any necessary next work, and give at most one concise combined update when useful. Do not acknowledge each agent or send acknowledgement-only replies. Full reports remain in agent_inbox and the source sessions.\n\n' + summaries.join('\n\n'),
          details: { ids: messages.map(message => message.id), count: messages.length },
        }, { triggerTurn: true, deliverAs: 'followUp' });
        store.atomic(statePath, { lastWakeAt: now });
      });
    },
    status: () => status(root, self),
  };
}
export { isReport, settings, setMode, status, createReportDispatcher };
