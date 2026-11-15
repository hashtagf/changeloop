import fs from 'node:fs';
import path from 'node:path';
import * as jobs from './manager.cjs';

const ID = /^[a-f0-9-]{36}$/;
const live = job => ['starting', 'running', 'interrupted'].includes(job.status);

/** Watch state changes; keep finished history out of the hot polling path. */
export function createJobMonitor(root, clock = Date.now) {
  const cache = new Map<string, { job: any; stamp: string }>();
  const dirty = new Set<string>();
  const changed = new Set<string>();
  let watcher: fs.FSWatcher | undefined, discover = true, nextReconcile = 0, closed = false;
  const attach = () => {
    if (watcher || closed || !fs.existsSync(root)) return;
    try {
      watcher = fs.watch(root, { recursive: true, persistent: false }, (_event, filename) => {
        if (!filename) { discover = true; nextReconcile = 0; return; }
        const [id, file] = String(filename).split(/[\\/]/);
        if (!ID.test(id)) return;
        if (!file) { discover = true; dirty.add(id); changed.add(id); }
        else if (['job.json', 'state.json', 'background', 'notified'].includes(file)) { dirty.add(id); changed.add(id); }
      });
      watcher.on('error', () => { watcher?.close(); watcher = undefined; nextReconcile = 0; });
    } catch { /* Unsupported watching falls back to per-poll stat reconciliation. */ }
  };
  return {
    read() {
      if (closed) return [];
      attach();
      const reconcile = !watcher || clock() >= nextReconcile;
      if (discover || reconcile) {
        let ids: string[];
        try { ids = fs.readdirSync(root).filter(id => ID.test(id)); }
        catch (error) { if (error.code !== 'ENOENT') throw error; cache.clear(); return []; }
        const present = new Set(ids);
        for (const id of cache.keys()) if (!present.has(id)) cache.delete(id);
        for (const id of ids) if (!cache.has(id) || reconcile) dirty.add(id);
        discover = false; nextReconcile = clock() + 30000;
      }
      for (const [id, entry] of cache) if (live(entry.job)) dirty.add(id);
      for (const id of [...dirty]) {
        try {
          const stat = fs.statSync(path.join(root, id));
          const stamp = `${stat.ino}:${stat.mtimeMs}:${stat.ctimeMs}`;
          const previous = cache.get(id);
          if (!previous || changed.has(id) || live(previous.job) || previous.stamp !== stamp) {
            cache.set(id, { job: jobs.read(root, id), stamp });
          }
          dirty.delete(id);
          changed.delete(id);
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
          // A worker may still be creating job.json. Retry without losing it.
          cache.delete(id);
          if (!fs.existsSync(path.join(root, id))) { dirty.delete(id); changed.delete(id); }
        }
      }
      return [...cache.values()].map(entry => entry.job).sort((a, b) => b.createdAt - a.createdAt);
    },
    close() { closed = true; watcher?.close(); watcher = undefined; cache.clear(); dirty.clear(); changed.clear(); },
  };
}
