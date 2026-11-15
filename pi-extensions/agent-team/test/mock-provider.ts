// Local deterministic provider used only by the explicit integration test.
import { createAssistantMessageEventStream } from '@earendil-works/pi-ai';
export default function (pi: any) {
  pi.registerProvider('agent-team-test', {
    api: 'agent-team-test-api', apiKey: 'local-test-key', baseUrl: 'http://127.0.0.1:1',
    models: [{ id: 'echo', name: 'Local team test', reasoning: false, input: ['text'],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128000, maxTokens: 1024 }],
    streamSimple(model: any, context: any) {
      const stream = createAssistantMessageEventStream();
      queueMicrotask(() => {
        const wantsBackground = JSON.stringify(context).includes('team-test-start-background') &&
          !(context.messages ?? []).some((message: any) => message.role === 'toolResult');
        const wantsStop = JSON.stringify(context).includes('team-test-stop-self') &&
          !(context.messages ?? []).some((message: any) => message.role === 'toolResult');
        const wantsPrefixedStop = JSON.stringify(context).includes('team-test-prefixed-stop') &&
          !(context.messages ?? []).some((message: any) => message.role === 'toolResult');
        const wantsPrefixedSend = JSON.stringify(context).includes('team-test-prefixed-send') &&
          !(context.messages ?? []).some((message: any) => message.role === 'toolResult');
        const content = wantsPrefixedSend ? [{ type: 'toolCall', id: 'local-prefixed-send', name: '_agent_send',
          arguments: { to: 'parent', message: 'prefixed-send-delivered', delivery: 'followUp' } }] :
          wantsPrefixedStop ? [{ type: 'toolCall', id: 'local-prefixed-stop', name: '_agent_stop', arguments: { id: 'self' } }] :
          wantsStop ? [{ type: 'toolCall', id: 'local-stop-test', name: 'agent_stop', arguments: { id: 'self' } }] :
          wantsBackground ? [{ type: 'toolCall', id: 'local-background-test', name: 'background_bash',
          arguments: { command: 'rtk proxy sleep 30', notify: false } }] : [{ type: 'text', text: 'ทดสอบสำเร็จ / local-worker-result' }];
        const output = { role: 'assistant', content,
          api: model.api, provider: model.provider, model: model.id, stopReason: 'stop', timestamp: Date.now(),
          usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0, totalTokens: 2,
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } } };
        if (wantsBackground || wantsStop || wantsPrefixedSend || wantsPrefixedStop) output.stopReason = 'toolUse';
        stream.push({ type: 'done', reason: output.stopReason, message: output } as any);
        stream.end();
      });
      return stream;
    },
  });
}
