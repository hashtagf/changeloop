// 9router provider: an OpenAI-compatible gateway whose model catalog is
// discovered from the router itself. Streaming uses Pi's built-in
// openai-completions implementation. See README.md for configuration.
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { loadNineRouterConfig, PROVIDER_ID } from './config.ts';
import { fetchModels, fromStored, resolveKey, toStored } from './models.ts';

export default function nineRouter(pi: ExtensionAPI, env: NodeJS.ProcessEnv = process.env) {
  const config = loadNineRouterConfig(env, message => console.warn(message));
  pi.registerProvider(PROVIDER_ID, {
    name: '9router',
    baseUrl: config.baseUrl,
    api: 'openai-completions',
    ...(config.apiKey ? { apiKey: config.apiKey } : {}),
    async refreshModels(context) {
      const baseUrl = (context.baseUrl || config.baseUrl).replace(/\/+$/, '');
      // Offline or cache-only phases (startup, pi -p, RPC) use the last saved catalog.
      if (!context.allowNetwork) return fromStored(context.stored, PROVIDER_ID);
      const models = await fetchModels({
        baseUrl,
        apiKey: resolveKey(context.credential as { type?: string; key?: string } | undefined, env),
        signal: context.signal,
      });
      if (!context.signal.aborted) await context.publish({ persist: { models: toStored(models, PROVIDER_ID, baseUrl) as any, checkedAt: Date.now() } });
      return models;
    },
  });
}
