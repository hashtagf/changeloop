// Read-only user configuration for the pi-extensions package.
// File: $XDG_CONFIG_HOME/pi-extensions/config.json (default ~/.config/...).
// A missing file, malformed JSON or a value of the wrong type falls back to the
// default; loading never throws.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export type AskUserConfig = { bell: boolean };
export const DEFAULTS: AskUserConfig = { bell: true };

export const configPath = (env = process.env) =>
  join(env.XDG_CONFIG_HOME?.trim() || join(homedir(), '.config'), 'pi-extensions', 'config.json');

export function loadAskUserConfig(env = process.env, warn: (message: string) => void = () => {}): AskUserConfig {
  const file = configPath(env);
  let raw;
  try { raw = JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) {
    if (error?.code !== 'ENOENT') warn(`pi-extensions: ignoring ${file}: ${error.message}`);
    return { ...DEFAULTS };
  }
  const section = raw && typeof raw === 'object' ? raw.askUser : undefined;
  return { bell: typeof section?.bell === 'boolean' ? section.bell : DEFAULTS.bell };
}

/** The env var always wins so a single run can silence the bell. */
export const bellEnabled = (config: AskUserConfig, env = process.env) => env.PI_ASK_USER_BELL !== '0' && config.bell;
