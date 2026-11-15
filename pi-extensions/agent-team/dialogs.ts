import path from 'node:path';
import { readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as store from './store.ts';

const methods = new Set(['select', 'confirm', 'input', 'editor']);
const fileFor = (root, worker, id) => path.join(store.dir(root, worker), 'ui-requests',
  createHash('sha256').update(id).digest('hex') + '.json');
const cancelled = id => ({ type: 'extension_ui_response', id, cancelled: true });

export function createDialogRelay(root, worker, send, clock = Date.now) {
  const pending = new Map<string, string>();
  return {
    enqueue(event) {
      if (!methods.has(event.method) || typeof event.id !== 'string') return false;
      let recipient = store.member(root, worker), seen = new Set<string>();
      while (recipient.kind === 'managed' && recipient.parentId && !seen.has(recipient.id)) {
        seen.add(recipient.id); recipient = store.member(root, recipient.parentId);
      }
      const file = fileFor(root, worker, event.id);
      const createdAt = clock();
      store.atomic(file, { worker, recipient: recipient.id, request: event, status: 'pending', createdAt,
        expiresAt: event.timeout > 0 ? createdAt + event.timeout : undefined });
      pending.set(event.id, file);
      return true;
    },
    poll() {
      for (const [id, file] of pending) {
        const entry = store.read(file, {});
        if (entry.expiresAt && clock() >= entry.expiresAt) {
          send(cancelled(id)); store.atomic(file, { ...entry, status: 'expired' }); pending.delete(id);
        } else if (entry.status === 'answered') {
          send(entry.response); store.atomic(file, { ...entry, status: 'delivered' }); pending.delete(id);
        }
      }
    },
    close() {
      for (const file of pending.values()) {
        store.atomic(file, { ...store.read(file, {}), status: 'closed' });
      }
      pending.clear();
    },
  };
}

export function workerDialogs(root, worker, now = Date.now()) {
  const entries = [];
  const directory = path.join(store.dir(root, worker), 'ui-requests');
  let files: string[];
  try { files = readdirSync(directory); } catch (error) { if (error.code === 'ENOENT') return entries; throw error; }
  for (const name of files.filter(name => name.endsWith('.json'))) {
    const file = path.join(directory, name), entry = store.read(file, {});
    if (entry.status === 'pending' &&
        (!entry.expiresAt || entry.expiresAt > now)) entries.push({ ...entry, file });
  }
  return entries.sort((a, b) => a.createdAt - b.createdAt);
}

export function pendingDialogs(root, recipient, now = Date.now(), members = store.list(root)) {
  return members
    .filter(member => !['stopped', 'failed', 'exited', 'interrupted'].includes(member.status))
    .flatMap(member => workerDialogs(root, member.id, now))
    .filter(entry => entry.recipient === recipient)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function createDialogPresenter(root, recipient) {
  let busy = false, controller: AbortController | undefined, disposed = false;
  return {
    async show(ctx) {
      if (busy || disposed) return;
      const entry = pendingDialogs(root, recipient)[0];
      if (!entry) { ctx.ui.notify('ไม่มีคำถามจาก agent ที่รอคำตอบ', 'info'); return; }
      busy = true; controller = new AbortController();
      const signal = controller.signal, request = entry.request;
      const watch = setInterval(() => {
        try {
          const current = store.read(entry.file, {});
          if (current.status !== 'pending' || (current.expiresAt && Date.now() >= current.expiresAt)) controller?.abort();
        } catch { controller?.abort(); }
      }, 250);
      watch.unref?.();
      try {
        const name = store.member(root, entry.worker).name || entry.worker;
        const title = `${name}: ${request.title || request.method}`;
        const opts = { signal, ...(entry.expiresAt ? { timeout: Math.max(1, entry.expiresAt - Date.now()) } : {}) };
        let value;
        if (request.method === 'confirm') value = await ctx.ui.confirm(title, request.message || '', opts);
        else if (request.method === 'select') value = await ctx.ui.select(title, request.options, opts);
        else if (request.method === 'input') value = await ctx.ui.input(title, request.placeholder, opts);
        else value = await ctx.ui.editor(title, request.prefill);
        const current = store.read(entry.file, {});
        if (disposed || signal.aborted || current.status !== 'pending' ||
            (current.expiresAt && Date.now() >= current.expiresAt)) return;
        const response = value === undefined ? cancelled(request.id) : request.method === 'confirm'
          ? { type: 'extension_ui_response', id: request.id, confirmed: value === true }
          : { type: 'extension_ui_response', id: request.id, value };
        store.atomic(entry.file, { ...current, status: 'answered', response });
      } finally { clearInterval(watch); busy = false; controller = undefined; }
    },
    close() { disposed = true; controller?.abort(); },
  };
}
