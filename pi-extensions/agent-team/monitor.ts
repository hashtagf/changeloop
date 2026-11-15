import fs from 'node:fs';
import path from 'node:path';
import * as store from './store.ts';

/** Keep history discoverable without reopening every archived session each tick. */
export function createTeamReader(root, self, clock = Date.now) {
  const directory = path.join(root, 'members');
  const metadata = new Map<string, { stamp: string; value: any }>();
  let directoryStamp = '', nextRefresh = 0;
  return () => {
    const now = clock(), stat = fs.statSync(directory);
    const stamp = `${stat.mtimeMs}:${stat.ctimeMs}`;
    if (stamp !== directoryStamp || now >= nextRefresh) {
      const ids = fs.readdirSync(directory).filter(id => /^[a-zA-Z0-9_-]{1,100}$/.test(id));
      const present = new Set(ids);
      for (const id of metadata.keys()) if (!present.has(id)) metadata.delete(id);
      for (const id of ids) {
        const file = path.join(store.dir(root, id), 'meta.json');
        try {
          const info = fs.statSync(file), key = `${info.ino}:${info.mtimeMs}:${info.ctimeMs}:${info.size}`;
          if (metadata.get(id)?.stamp !== key) metadata.set(id, { stamp: key, value: store.read(file) });
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
          metadata.delete(id);
        }
      }
      directoryStamp = stamp; nextRefresh = now + 30000;
    }
    const children = new Map<string, string[]>();
    for (const [id, entry] of metadata) {
      const parent = entry.value?.parentId;
      if (parent) { const ids = children.get(parent) || []; ids.push(id); children.set(parent, ids); }
    }
    const family = new Set([self]), queue = [self];
    for (let i = 0; i < queue.length; i++) for (const child of children.get(queue[i]) || []) {
      if (!family.has(child)) { family.add(child); queue.push(child); }
    }
    // Presence, process state and results of this team stay live, even without
    // metadata changes. Never cache online/dead-process decisions.
    return [...family].filter(id => metadata.has(id)).map(id => store.member(root, id));
  };
}
