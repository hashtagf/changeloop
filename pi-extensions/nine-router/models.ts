// Model discovery for the 9router gateway: GET {baseUrl}/models returns chat
// models and combos in OpenAI list format, plus optional 9router metadata
// (context_length, max_completion_tokens, capabilities, thinking_levels).
import { API_KEY_ENV } from './config.ts';

export const DEFAULT_CONTEXT_WINDOW = 128_000;
export const DEFAULT_MAX_TOKENS = 16_384;
const ZERO_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

export type RouterModel = {
  id?: unknown;
  context_length?: unknown;
  max_completion_tokens?: unknown;
  thinking_levels?: unknown;
  capabilities?: { vision?: unknown; reasoning?: unknown; contextWindow?: unknown; maxOutput?: unknown } | null;
};

export type ChatModelConfig = {
  id: string;
  name: string;
  reasoning: boolean;
  input: ('text' | 'image')[];
  cost: typeof ZERO_COST;
  contextWindow: number;
  maxTokens: number;
};

const positive = (...values: unknown[]) => values.find(v => typeof v === 'number' && Number.isFinite(v) && v > 0) as number | undefined;

export function toModelConfig(entry: RouterModel): ChatModelConfig | undefined {
  if (!entry || typeof entry.id !== 'string' || !entry.id.trim()) return undefined;
  const caps = entry.capabilities && typeof entry.capabilities === 'object' ? entry.capabilities : {};
  const levels = Array.isArray(entry.thinking_levels) ? entry.thinking_levels : [];
  return {
    id: entry.id,
    name: entry.id,
    reasoning: levels.length > 0 || caps.reasoning === true,
    input: caps.vision === true ? ['text', 'image'] : ['text'],
    cost: { ...ZERO_COST },
    contextWindow: positive(entry.context_length, caps.contextWindow) ?? DEFAULT_CONTEXT_WINDOW,
    maxTokens: positive(entry.max_completion_tokens, caps.maxOutput) ?? DEFAULT_MAX_TOKENS,
  };
}

export function parseModelList(payload: unknown): ChatModelConfig[] {
  const data = Array.isArray(payload) ? payload : (payload as { data?: unknown })?.data;
  if (!Array.isArray(data)) throw new Error('expected an OpenAI model list ({ data: [...] })');
  const seen = new Set<string>();
  const models: ChatModelConfig[] = [];
  for (const entry of data) {
    const model = toModelConfig(entry);
    if (!model || seen.has(model.id)) continue;
    seen.add(model.id);
    models.push(model);
  }
  return models;
}

/** Full model records for Pi's persisted catalog (used offline, in pi -p and RPC). */
export function toStored(models: ChatModelConfig[], provider: string, baseUrl: string) {
  return models.map(model => ({ ...model, type: 'chat' as const, provider, api: 'openai-completions' as const, baseUrl }));
}

/** The stored /login key, else the env key (Pi may pass the unresolved $VAR form). */
export function resolveKey(credential: { type?: string; key?: string } | undefined, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const key = credential?.type === 'api_key' ? credential.key?.trim() : undefined;
  if (key && !/^\$\{?\w+\}?$/.test(key)) return key;
  if (key) return env[key.replace(/^\$\{?|\}?$/g, '')]?.trim() || undefined;
  return env[API_KEY_ENV]?.trim() || undefined;
}

export type FetchModelsOptions = {
  baseUrl: string;
  apiKey?: string;
  signal?: AbortSignal;
  fetch?: typeof fetch;
};

export async function fetchModels({ baseUrl, apiKey, signal, fetch: doFetch = fetch }: FetchModelsOptions): Promise<ChatModelConfig[]> {
  const url = `${baseUrl}/models`;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  let response: Response;
  try { response = await doFetch(url, { headers, signal }); }
  catch (error) {
    if (error?.name === 'AbortError' || signal?.aborted) throw error;
    throw new Error(`9router: cannot reach ${url}: ${error?.cause?.code ?? error?.message ?? error}`);
  }
  if (!response.ok) {
    const hint = response.status === 401 || response.status === 403 ? ` (set ${API_KEY_ENV} or /login with a key from the 9router dashboard)` : '';
    throw new Error(`9router: GET ${url} returned ${response.status}${hint}`);
  }
  let payload: unknown;
  try { payload = await response.json(); }
  catch (error) {
    if (error?.name === 'AbortError' || signal?.aborted) throw error;
    throw new Error(`9router: GET ${url} returned invalid JSON`);
  }
  try { return parseModelList(payload); }
  catch (error) { throw new Error(`9router: GET ${url}: ${error.message}`); }
}
