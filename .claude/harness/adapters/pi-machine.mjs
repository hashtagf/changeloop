// Keeps Pi's current shared Change Loop bundle at the machine CLI's version.
// The global Pi loader imports this from Pi's current bundle before it picks a
// runtime. No Pi dependency, so it is tested under plain Node.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { delimiter, join } from 'node:path';

export const BUNDLE = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?-api\d+-[a-f0-9]{16}$/;

// CHANGELOOP_MACHINE_CLI ("none" disables), else cloop, else claude-foundation
// on PATH. A CLI inside a Pi bundle is not the machine's.
export function machineCli(base, env = process.env) {
  const configured = env.CHANGELOOP_MACHINE_CLI;
  if (configured === 'none') return undefined;
  if (configured) return configured;
  const releases = join(base, 'releases');
  for (const name of ['cloop', 'claude-foundation'])
    for (const directory of (env.PATH || '').split(delimiter).filter(Boolean)) {
      const candidate = join(directory, name);
      try {
        if (!statSync(candidate).isFile()) continue;
        if (directory.startsWith(releases + '/') || realpathSync(candidate).startsWith(releases + '/')) continue;
        return candidate;
      } catch { /* not on this PATH entry */ }
    }
  return undefined;
}

/** Returns a warning when the machine version could not be applied; undefined otherwise. */
export function followMachine(base, agentDir, env = process.env) {
  const cli = machineCli(base, env);
  if (!cli) return undefined;
  const run = (args, timeout) => spawnSync(cli, args, { encoding: 'utf8', timeout,
    env: { ...env, PI_CODING_AGENT_DIR: agentDir, FOUNDATION_UPDATE_CHECK: '0' } });
  const version = run(['version'], 15000);
  const machine = version.status === 0
    ? String(version.stdout).trim().match(/(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\s*$/)?.[1] : undefined;
  if (!machine) return `Could not read the machine Change Loop version from ${cli}; Pi keeps its current bundle.`;
  let current = '';
  try { current = JSON.parse(readFileSync(join(base, 'installation.json'), 'utf8')).current || ''; } catch { /* first install */ }
  if (BUNDLE.test(current) && current.startsWith(machine + '-api') &&
      existsSync(join(base, 'releases', current, 'bundle.json'))) return undefined;
  const installed = run(['host', 'pi-runtime', '--protocol', '1', '--format', 'json'], 120000);
  let value;
  try { value = JSON.parse(installed.stdout); } catch { value = undefined; }
  if (installed.status === 0 && value?.protocol === 1 && BUNDLE.test(value.bundle || '')) return undefined;
  const reason = value?.error?.message || String(installed.stderr || installed.error?.message || 'no output').trim().slice(0, 300);
  return `Change Loop ${machine} could not be installed in Pi (${reason}); Pi keeps its current bundle.`;
}
