import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as store from '../store.ts';
export default function (pi: any) {
  pi.registerProvider('chat-ui-fixture', { api: 'chat-ui-fixture', apiKey: 'fixture', baseUrl: 'http://127.0.0.1:1',
    models: [{ id: 'fixture', name: 'Chat UI fixture', reasoning: false, input: ['text'], contextWindow: 10000, maxTokens: 100,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } }],
    streamSimple() { throw Error('Unexpected model call in chat UI test'); } });
  pi.on('session_start', (_event: any, ctx: any) => {
    const root = process.env.PI_TEAM_ROOT!, file = join(root, 'fixture-chat.jsonl');
    const entries = [
      { type: 'session', version: 3, id: 'fixture-session' },
      { type: 'message', id: 'user', parentId: null, message: { role: 'user', content: 'Inspect the fixture build' } },
      { type: 'message', id: 'assistant', parentId: 'user', message: { role: 'assistant', content: [
        { type: 'text', text: '## Native chat result\n```js\nconst answer = 42;\n```' },
        { type: 'toolCall', id: 'call', name: 'bash', arguments: { command: 'fixture-command-only' } },
        { type: 'thinking', thinking: 'PRIVATE FIXTURE REASONING' },
      ] } },
      { type: 'message', id: 'result', parentId: 'assistant', message: { role: 'toolResult', toolCallId: 'call', toolName: 'bash',
        content: [{ type: 'text', text: 'Fixture tool output\n' + Array.from({ length: 20 }, (_, i) => `fixture-line-${i}`).join('\n') }], isError: false } },
    ];
    writeFileSync(file, entries.map(entry => JSON.stringify(entry)).join('\n') + '\n');
    store.register(root, { id: 'chat-fixture-worker', parentId: store.sessionId(ctx.sessionManager.getSessionId()), name: 'Chat fixture worker',
      status: 'working', sessionId: 'fixture-session', sessionFile: file, cwd: ctx.cwd });
    ctx.ui.notify('Native chat fixture ready', 'info');
  });
}
