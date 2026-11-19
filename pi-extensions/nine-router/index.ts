import { createProvider, type ApiKeyCredential } from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/compat';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { BASE_URL_ENV, loadNineRouterConfig, normalizeBaseUrl, PROVIDER_ID } from './config.ts';
import { fetchModels, resolveKey, toStored } from './models.ts';

const API = openAICompletionsApi();
const URL_FIELD = BASE_URL_ENV;

type RouterCredential = Pick<ApiKeyCredential, 'key' | 'env'> & { type?: string };

export default function nineRouter(pi: ExtensionAPI, env: NodeJS.ProcessEnv = process.env) {
  const config = loadNineRouterConfig(env, message => console.warn(message));
  const forcedUrl = normalizeBaseUrl(env[BASE_URL_ENV]);
  const pinnedUrl = (credential?: RouterCredential) =>
    forcedUrl ?? (credential?.type === 'api_key' ? normalizeBaseUrl(credential.env?.[URL_FIELD]) : undefined);
  pi.registerProvider(createProvider<'openai-completions'>({
    id: PROVIDER_ID,
    name: '9router',
    baseUrl: config.baseUrl,
    models: [],
    api: API,
    auth: {
      apiKey: {
        name: '9router API key',
        async login({ prompt, signal }) {
          let baseUrl = forcedUrl;
          let message = `9Router Base URL (Enter for ${config.baseUrl})`;
          while (!baseUrl) {
            const input = (await prompt({ type: 'text', message, placeholder: 'https://router.example.com/v1' })).trim();
            baseUrl = input ? normalizeBaseUrl(input) : config.baseUrl;
            message = 'Enter an http:// or https:// Base URL without credentials, query, or fragment';
          }
          let key = '';
          while (!key) {
            key = (await prompt({ type: 'secret', message: `API key for ${baseUrl}${forcedUrl ? ` (${BASE_URL_ENV})` : ''}` })).trim();
          }
          signal.throwIfAborted();
          return { type: 'api_key', key, env: { [URL_FIELD]: baseUrl } };
        },
        async resolve({ credential }) {
          const apiKey = resolveKey(credential, env);
          if (!apiKey) return undefined;
          const baseUrl = pinnedUrl(credential) ?? config.baseUrl;
          return { auth: { apiKey, baseUrl }, env: { [URL_FIELD]: baseUrl } };
        },
      },
    },
    // A cached catalog for a different gateway must not appear under a new login.
    filterModels(models, credential) {
      const baseUrl = pinnedUrl(credential) ?? config.baseUrl;
      return models.filter(model => model.baseUrl === baseUrl);
    },
    async fetchModels(context) {
      const baseUrl = pinnedUrl(context.credential) ?? config.baseUrl;
      const models = await fetchModels({ baseUrl, apiKey: resolveKey(context.credential, env), signal: context.signal });
      return toStored(models, PROVIDER_ID, baseUrl);
    },
  }));
}
