import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { PACKAGE_ROOT, SHARED_MARKER, followsMachine } from '../runtime/core/project-installation.mjs';

// Only runtime-owned paths enter the bundle; project settings/artifacts are seeded separately.
const BUNDLE_PATHS = ['.claude/harness', '.claude/hooks', '.claude/commands', '.claude/skills', '.claude/rules',
  '.claude/orchestrator.md', 'openspec/schemas', 'cli.sh', 'VERSION', 'foundation.json', 'dashboard'];
const OMIT = new Set(['tests', 'fixtures', 'node_modules', '.git', 'test', 'reports']);
function safeDestination(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error(`Refusing linked installation destination: ${current}`);
  }
  return current;
}
function writeJSON(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = path + '.' + randomUUID() + '.tmp';
  try { writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600, flag: 'wx' }); renameSync(temp, path); }
  finally { rmSync(temp, { force: true }); }
}
function digestTree(root) {
  const hash = createHash('sha256');
  function walk(relative = '') {
    for (const entry of readdirSync(join(root, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = relative ? relative + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink()) throw new Error('Runtime bundle must not contain symbolic links.');
      if (entry.isDirectory()) walk(path);
      else hash.update(path + '\0').update(readFileSync(join(root, path))).update('\0');
    }
  }
  walk(); return hash.digest('hex');
}
function pinnedMarker(packageRoot) {
  const descriptor = JSON.parse(readFileSync(join(packageRoot, 'bundle.json'), 'utf8'));
  return { version: 1, host: 'pi', installation: 'shared', runtime: descriptor.runtime,
    runtimeApi: descriptor.runtimeApi, bundle: descriptor.bundle };
}
const FOLLOW_MARKER = Object.freeze({ version: 1, host: 'pi', installation: 'shared', follow: 'machine' });

// `follow` follows the machine's Change Loop (Pi's current bundle); `pin` pins this bundle.
export function setProjectRuntimeMode(target, mode, packageRoot = PACKAGE_ROOT) {
  target = resolve(target);
  const markerPath = safeDestination(target, SHARED_MARKER);
  if (!existsSync(markerPath)) throw new Error('This project has no shared Change Loop settings; run /changeloop init first.');
  if (!['follow', 'pin'].includes(mode)) throw new Error('Use follow or pin.');
  const marker = mode === 'follow' ? { ...FOLLOW_MARKER } : pinnedMarker(packageRoot);
  writeJSON(markerPath, marker);
  return { root: target, ...marker };
}

export function initializeSharedProject(target, packageRoot = PACKAGE_ROOT, { follow = true } = {}) {
  target = resolve(target);
  if (existsSync(join(target, '.claude/harness/foundation.mjs')) && !existsSync(join(target, SHARED_MARKER)))
    throw new Error('This project has a local runtime. Keep using it until a reviewed migration removes its owned files; shared init does not delete existing installations.');
  const files = [SHARED_MARKER, 'foundation.json', 'openspec/config.yaml', 'openspec/repositories.yaml', '.foundation/.gitignore'];
  mkdirSync(target, { recursive: true });
  for (const path of files) safeDestination(target, path);
  const pinned = pinnedMarker(packageRoot);
  const markerPath = join(target, SHARED_MARKER);
  let marker = follow ? { ...FOLLOW_MARKER } : pinned;
  if (existsSync(markerPath)) {
    // Init never rewrites an existing marker; a different pin needs an explicit /changeloop follow or pin.
    const existing = JSON.parse(readFileSync(markerPath, 'utf8'));
    if (!followsMachine(existing) && Object.entries(pinned).some(([key, value]) => existing[key] !== value))
      throw new Error('Project already pins another Change Loop bundle. Run /changeloop follow or /changeloop pin to change it instead of overwriting it.');
    marker = existing;
  }
  for (const path of files.slice(1)) {
    const destination = join(target, path);
    if (existsSync(destination)) continue;
    mkdirSync(dirname(destination), { recursive: true });
    if (path === '.foundation/.gitignore') writeFileSync(destination, '*\n!.gitignore\n', { flag: 'wx' });
    else cpSync(join(packageRoot, path), destination, { errorOnExist: true, force: false });
  }
  if (!existsSync(markerPath)) writeJSON(markerPath, marker);
  return { root: target, ...marker, files };
}

export function installSharedPi(source, agentDir) {
  source = resolve(source); agentDir = resolve(agentDir);
  const base = join(agentDir, 'changeloop'), releases = join(base, 'releases');
  safeDestination(agentDir, 'changeloop/releases');
  safeDestination(agentDir, 'extensions/changeloop.ts');
  const extension = join(agentDir, 'extensions/changeloop.ts');
  if (existsSync(extension) && !/changeloopDiscovery|Change Loop shared Pi loader/.test(readFileSync(extension, 'utf8')))
    throw new Error('A user-owned global changeloop.ts already exists; shared installation will not overwrite it.');
  mkdirSync(releases, { recursive: true });
  const stage = mkdtempSync(join(releases, '.install-'));
  try {
    for (const relative of BUNDLE_PATHS) {
      const from = join(source, relative);
      if (!existsSync(from)) throw new Error(`Runtime package is missing ${relative}`);
      mkdirSync(dirname(join(stage, relative)), { recursive: true });
      cpSync(from, join(stage, relative), { recursive: true,
        filter: path => path === from || !OMIT.has(path.split('/').at(-1)) });
    }
    for (const relative of ['openspec/config.yaml', 'openspec/repositories.yaml']) {
      mkdirSync(dirname(join(stage, relative)), { recursive: true });
      cpSync(join(source, relative), join(stage, relative));
    }
    // OpenSpec has a documented user-schema lookup; use it only for OpenSpec child processes.
    mkdirSync(join(stage, '.data/openspec'), { recursive: true });
    cpSync(join(stage, 'openspec/schemas'), join(stage, '.data/openspec/schemas'), { recursive: true });
    mkdirSync(join(stage, 'bin'), { recursive: true });
    writeFileSync(join(stage, 'bin/claude-foundation'), '#!/usr/bin/env bash\nexec bash "$(cd "$(dirname "$0")/.." && pwd)/cli.sh" "$@"\n', { mode: 0o755 });
    writeFileSync(join(stage, 'bin/openspec'), '#!/usr/bin/env bash\nHERE="$(cd "$(dirname "$0")" && pwd)"\nIFS=: read -ra paths <<< "$PATH"\nfor path in "${paths[@]}"; do\n  if [ "$path" != "$HERE" ] && [ -x "$path/openspec" ]; then\n    exec env XDG_DATA_HOME="$HERE/../.data" "$path/openspec" "$@"\n  fi\ndone\nprintf "OpenSpec CLI unavailable; run Change Loop tool preparation.\\n" >&2\nexit 127\n', { mode: 0o755 });
    const protocol = JSON.parse(readFileSync(join(stage, '.claude/harness/protocol.json'), 'utf8'));
    const digest = digestTree(stage), bundle = `${protocol.runtime}-api${protocol.runtimeApi}-${digest.slice(0, 16)}`;
    const descriptor = { bundle, runtime: protocol.runtime, runtimeApi: protocol.runtimeApi, sha256: digest };
    const destination = join(releases, bundle);
    writeJSON(join(stage, 'bundle.json'), descriptor);
    if (!existsSync(destination)) renameSync(stage, destination);
    mkdirSync(dirname(extension), { recursive: true });
    const loader = readFileSync(join(source, '.claude/harness/adapters/pi-shared.ts'), 'utf8');
    if (existsSync(extension) && readFileSync(extension, 'utf8') !== loader) {
      const backups = join(base, 'backups'); mkdirSync(backups, { recursive: true, mode: 0o700 });
      cpSync(extension, join(backups, 'changeloop-' + Date.now() + '.ts'));
    }
    writeFileSync(extension, loader, { mode: 0o600 });
    writeJSON(join(base, 'installation.json'), { current: bundle });
    return { ...descriptor, path: destination };
  } finally { rmSync(stage, { recursive: true, force: true }); }
}
