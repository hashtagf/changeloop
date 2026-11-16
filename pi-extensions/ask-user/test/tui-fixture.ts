import { createQuestionStore } from '../store.ts';
export default function(pi) {
  pi.registerProvider('questions-test', { api: 'questions-test-api', apiKey: 'local-test', baseUrl: 'http://127.0.0.1:1',
    models: [{ id: 'fixture', name: 'Question UI fixture', reasoning: false, input: ['text'], contextWindow: 128000, maxTokens: 100, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } }],
    streamSimple() { throw new Error('Unexpected model call'); } });
  pi.on('session_start', (_event, ctx) => {
    const store = createQuestionStore();
    const base = { sessionId: 'offline-fixture-worker', recipientSessionId: ctx.sessionManager.getSessionId(), agentName: 'Worker' };
    store.ask({ ...base, key: 'region', question: 'Which region?', options: ['First option', 'Second option'] });
    store.ask({ ...base, key: 'format', questions: [
      { question: 'Which format?', header: 'Format', options: [{ label: 'First option', description: 'Plain JSON', recommended: true, preview: '```json\n{ "ok": true }\n```' }, 'Second option'] },
      { question: 'Which checks?', header: 'Checks', multiSelect: true, options: ['Lint', 'Unit'] }] });
  });
}
