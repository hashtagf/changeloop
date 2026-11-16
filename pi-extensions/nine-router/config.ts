// Where the 9router gateway lives and how Pi authenticates to it.
// Order: NINEROUTER_BASE_URL, then nineRouter.baseUrl in the package config file
// ($XDG_CONFIG_HOME/pi-extensions/config.json, default ~/.config/...), then the
// 9router default. The API key is never read from the config file: it comes from
// NINEROUTER_API_KEY or from a key stored with /login.
import { readFileSync } from 'node:fs';
import { configPath } from '../ask-user/config.ts';

export const PROVIDER_ID = '9router';
export const DEFAULT_BASE_URL = 'http://localhost:20128/v1';
export const API_KEY_ENV = 'NINEROUTER_API_KEY';
export const BASE_URL_ENV = 'NINEROUTER_BASE_URL';

export type NineRouterConfig = { baseUrl: string; apiKey?: string };

/** A trimmed http(s) URL without trailing slashes, or undefined. */
export function normalizeBaseUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  let url: URL;
  try { url = new URL(value.trim()); } catch { return undefined; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
  return url.toString().replace(/\/+$/, '');
}

function fileBaseUrl(env: NodeJS.ProcessEnv, warn: (message: string) => void): string | undefined {
  const file = configPath(env);
  let raw;
  try { raw = JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) {
    if (error?.code !== 'ENOENT') warn(`pi-extensions: ignoring ${file}: ${error.message}`);
    return undefined;
  }
  const value = raw && typeof raw === 'object' ? raw.nineRouter?.baseUrl : undefined;
  if (value === undefined) return undefined;
  const url = normalizeBaseUrl(value);
  if (!url) warn(`pi-extensions: ignoring nineRouter.baseUrl in ${file}: expected an http(s) URL`);
  return url;
}

export function loadNineRouterConfig(env: NodeJS.ProcessEnv = process.env, warn: (message: string) => void = () => {}): NineRouterConfig {
  let baseUrl = normalizeBaseUrl(env[BASE_URL_ENV]);
  if (env[BASE_URL_ENV] && !baseUrl) warn(`pi-extensions: ignoring ${BASE_URL_ENV}: expected an http(s) URL`);
  baseUrl ??= fileBaseUrl(env, warn) ?? DEFAULT_BASE_URL;
  return env[API_KEY_ENV]?.trim() ? { baseUrl, apiKey: `$${API_KEY_ENV}` } : { baseUrl };
}
