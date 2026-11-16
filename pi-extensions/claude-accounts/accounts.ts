import { readFileSync, mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const BASE = 'claude-subscription';
const PREFIX = BASE + '-account-';
export function accountProvider(name: string) {
  if (name === 'default') return BASE;
  if (!/^[a-z0-9][a-z0-9-]{0,31}$/.test(name)) throw new Error('Use 1–32 lowercase letters, numbers or hyphens for the account name.');
  return PREFIX + name;
}
export function accountName(provider = '') {
  if (provider === BASE) return 'default';
  const name = provider.startsWith(PREFIX) ? provider.slice(PREFIX.length) : '';
  return /^[a-z0-9][a-z0-9-]{0,31}$/.test(name) && name !== 'default' ? name : undefined;
}
export function readAccounts(authPath: string) {
  let data: Record<string, any>;
  try { data = JSON.parse(readFileSync(authPath, 'utf8')); }
  catch (error: any) { if (error.code === 'ENOENT') return []; throw new Error('Cannot read Pi account storage.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid Pi account storage.');
  let labels: Record<string, string> = {};
  try { labels = JSON.parse(readFileSync(join(dirname(authPath), 'claude-account-names.json'), 'utf8')); }
  catch (error: any) { if (error.code !== 'ENOENT') throw new Error('Cannot read Claude account names.'); }
  if (!labels || typeof labels !== 'object' || Array.isArray(labels)) throw new Error('Invalid Claude account names.');
  return Object.entries(data).flatMap(([provider, credential]) => {
    const name = accountName(provider);
    if (!name || accountProvider(name) !== provider || credential?.type !== 'oauth') return [];
    const label = labels[provider];
    if (label !== undefined) accountProvider(label);
    return [{ name: label || name, provider, email: typeof credential.email === 'string' ? credential.email : undefined }];
  }).sort((a, b) => a.provider === BASE ? -1 : b.provider === BASE ? 1 : a.name.localeCompare(b.name));
}

export function renameAccount(authPath: string, from: string, to: string) {
  accountProvider(to);
  const file = join(dirname(authPath), 'claude-account-names.json'), lock = file + '.lock';
  try { mkdirSync(lock, { mode: 0o700 }); }
  catch { throw new Error('Account names are being updated; retry shortly.'); }
  const temporary = file + '.' + randomUUID() + '.tmp';
  try {
    const rows = readAccounts(authPath);
    const row = rows.find(item => item.name === from || (from === 'default' && item.provider === BASE));
    if (!row) throw new Error(`Unknown account: ${from}`);
    if (to === 'default' && row.provider !== BASE) throw new Error('default is reserved for the original account.');
    if (rows.some(item => item.provider !== row.provider && item.name === to)) throw new Error(`Account ${to} already exists.`);
    const labels = Object.fromEntries(rows.map(item => [item.provider, item.provider === row.provider ? to : item.name]));
    writeFileSync(temporary, JSON.stringify(labels, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    renameSync(temporary, file);
    return { ...row, name: to };
  } finally { rmSync(temporary, { force: true }); rmSync(lock, { recursive: true, force: true }); }
}
