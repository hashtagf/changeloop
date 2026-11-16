// First-use setup for the shared Pi loader. In a folder without Change Loop
// settings the loader offers the work-starting commands; the first one creates
// follow-machine settings at the project root, reloads Pi, and the reloaded
// loader runs the same command once. No Pi dependency: tested under plain Node.
import { existsSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { initializeSharedProject } from './pi-installation.mjs';

export const BOOTSTRAP_COMMANDS = Object.freeze(['change', 'investigate', 'dev', 'feature']);
export const PENDING_TTL_MS = 2 * 60 * 1000;
const real = (path) => { try { return realpathSync(path); } catch { return resolve(path); } };

/** Nearest Git root, else the folder itself. */
export function projectRootFor(start) {
  for (let path = resolve(start); ; path = dirname(path)) {
    if (existsSync(join(path, '.git'))) return path;
    if (dirname(path) === path) return resolve(start);
  }
}

/** A local installation owns its own adapter and command names. */
export function hasLocalRuntime(root) {
  return existsSync(join(root, '.claude/harness/foundation.mjs'));
}

/** Why this folder must not be set up, or undefined when it may be. */
export function bootstrapRefusal(root, { trusted, home = homedir() }) {
  if (!trusted) return 'Trust this project before Change Loop creates its settings.';
  if (real(root) === real(home) || dirname(real(root)) === real(root))
    return 'Open a project folder before starting Change Loop work.';
  if (hasLocalRuntime(root))
    return 'This project has a local Change Loop installation; upgrade it with cloop init --host pi before using the shared runtime.';
  return undefined;
}

const pendingPath = (agentDir) => join(agentDir, 'changeloop', 'pending-command.json');

/** Create follow-machine settings and record the command to run after reload. */
export function bootstrapProject({ cwd, command, args = '', trusted, runtime, agentDir, now = Date.now(), home }) {
  if (!BOOTSTRAP_COMMANDS.includes(command)) throw new Error(`Unsupported first-use command: ${command}`);
  const root = projectRootFor(cwd);
  const refusal = bootstrapRefusal(root, { trusted, home });
  if (refusal) throw new Error(refusal);
  const result = initializeSharedProject(root, runtime);
  const path = pendingPath(agentDir);
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify({ version: 1, root: real(root), command, args: String(args), createdAt: now }), { mode: 0o600 });
  renameSync(temporary, path);
  return result;
}

/** The recorded command for this project, consumed once; stale or foreign entries are discarded. */
export function takePendingCommand({ root, agentDir, now = Date.now() }) {
  const path = pendingPath(agentDir);
  if (!existsSync(path)) return undefined;
  let pending;
  try { pending = JSON.parse(readFileSync(path, 'utf8')); } catch { pending = undefined; }
  const fresh = pending?.version === 1 && Number.isFinite(pending.createdAt) &&
    now - pending.createdAt >= 0 && now - pending.createdAt <= PENDING_TTL_MS;
  // One hand-off, one chance: a stale, foreign or malformed entry is discarded.
  rmSync(path, { force: true });
  if (!fresh || pending.root !== real(root) || !BOOTSTRAP_COMMANDS.includes(pending.command)) return undefined;
  return `/${pending.command}${pending.args ? ` ${pending.args}` : ''}`;
}
