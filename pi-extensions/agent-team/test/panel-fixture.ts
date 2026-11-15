// Explicit TUI smoke-test data only. No worker process or model request.
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import * as store from '../store.ts';
export default function (pi: any) {
  let timer: ReturnType<typeof setInterval>;
  pi.on('session_start', (_event: any, ctx: any) => {
    const root = process.env.PI_TEAM_ROOT!;
    const self = store.sessionId(ctx.sessionManager.getSessionId());
    for (const [id, name, task] of [
      ['preview-reviewer', 'Reviewer', 'Review cancellation behavior'],
      ['preview-tester', 'Tester', 'Run regression tests'],
    ]) {
      const file = join(root, `${id}.jsonl`);
      const entries = [
        { type: 'session', id, version: 3 },
        { type: 'message', id: 'user', parentId: null, message: { role: 'user', content: 'ตรวจโค้ดให้หน่อย', timestamp: Date.now() } },
        { type: 'message', id: 'answer', parentId: 'user', message: { role: 'assistant', content: [{ type: 'text', text: `${name}: checking files and collecting evidence.` }], timestamp: Date.now() } },
        { type: 'message', id: 'tool-result', parentId: 'answer', message: { role: 'toolResult', toolName: 'bash', content: [{ type: 'text', text: 'Saved tool output: cancellation test passed.' }], timestamp: Date.now() } },
      ];
      writeFileSync(file, entries.map(entry => JSON.stringify(entry)).join('\n') + '\n');
      store.atomic(join(store.dir(root, id), 'meta.json'), { id, name, kind: 'session', parentId: self, task, createdAt: Date.now() });
      store.register(root, { id, name, status: 'working', sessionId: id, sessionFile: file, cwd: ctx.cwd });
      store.atomic(join(store.dir(root, id), 'live.json'), { streaming: true, text: `${name} is working…`, tools: ['read'] });
    }
    timer = setInterval(() => {
      for (const id of ['preview-reviewer', 'preview-tester']) {
        const item = store.member(root, id);
        store.heartbeat(root, id, { name: item.name, status: 'working', sessionId: item.sessionId, sessionFile: item.sessionFile, cwd: ctx.cwd });
      }
    }, 1000);
    timer.unref?.();
  });
  pi.on('session_shutdown', () => clearInterval(timer));
}
