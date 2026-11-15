import { createQuestionStore } from '../store.ts';
export default function(pi) {
  pi.registerProvider('questions-test', { api: 'questions-test-api', apiKey: 'local-test', baseUrl: 'http://127.0.0.1:1',
    models: [{ id: 'fixture', name: 'Question UI fixture', reasoning: false, input: ['text'], contextWindow: 128000, maxTokens: 100, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } }],
    streamSimple() { throw new Error('Unexpected model call'); } });
  pi.on('session_start', (_event, ctx) => {
    const store = createQuestionStore();
    for (const [key, question] of [['region', 'Which region?'], ['format', 'Which format?']]) {
      store.ask({ sessionId: 'offline-fixture-worker', recipientSessionId: ctx.sessionManager.getSessionId(), agentName: 'Worker', key, question, options: ['First option', 'Second option'] });
    }
  });
}
