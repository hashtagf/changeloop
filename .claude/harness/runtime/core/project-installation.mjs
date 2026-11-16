import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
export const SHARED_MARKER = '.changeloop.json';
export function isSharedProject(root) { return existsSync(join(root, SHARED_MARKER)); }
export const BUNDLE_PATTERN = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?-api\d+-[a-f0-9]{16}$/;
// A marker either pins one bundle or follows the machine: Pi's current bundle,
// which the shared loader keeps equal to the machine's cloop version.
export function followsMachine(settings) { return settings?.follow === 'machine'; }
export function currentSharedBundle(agentDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), '.pi/agent')) {
  const current = JSON.parse(readFileSync(join(agentDir, 'changeloop/installation.json'), 'utf8')).current;
  if (!BUNDLE_PATTERN.test(current || '')) throw new Error('Pi has no valid current Change Loop bundle.');
  return current;
}
export function isFoundationProject(root) {
  return existsSync(join(root, 'openspec/config.yaml')) &&
    (isSharedProject(root) || existsSync(join(root, '.claude/harness/foundation.mjs')));
}
export function assertSharedInstallation(root, packageRoot = PACKAGE_ROOT) {
  if (!isSharedProject(root)) return;
  const settings = JSON.parse(readFileSync(join(root, SHARED_MARKER), 'utf8'));
  const bundlePath = join(packageRoot, 'bundle.json');
  if (settings.version !== 1 || settings.host !== 'pi' || settings.installation !== 'shared')
    throw new Error('Change Loop shared runtime does not match .changeloop.json; install the pinned runtime before continuing.');
  if (followsMachine(settings)) {
    if (settings.bundle || settings.runtime || settings.runtimeApi)
      throw new Error('.changeloop.json cannot both follow the machine and pin a bundle.');
    return;
  }
  const protocol = JSON.parse(readFileSync(join(packageRoot, '.claude/harness/protocol.json'), 'utf8'));
  if (settings.bundle && (!existsSync(bundlePath) || JSON.parse(readFileSync(bundlePath, 'utf8')).bundle !== settings.bundle))
    throw new Error('Change Loop bundle differs from the project pin.');
  if (settings.runtime !== protocol.runtime || String(settings.runtimeApi) !== protocol.runtimeApi)
    throw new Error('Change Loop shared runtime does not match .changeloop.json; install the pinned runtime before continuing.');
}
export function resourceRoot(root) { return isSharedProject(root) ? PACKAGE_ROOT : root; }
export function projectResource(root, ...path) { return join(resourceRoot(root), ...path); }
export function openSpecEnvironment(root, env = process.env) {
  return isSharedProject(root) ? { ...env, XDG_DATA_HOME: join(PACKAGE_ROOT, '.data') } : env;
}
export function sharedPackageRoot(root, fallback = PACKAGE_ROOT, agentDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), '.pi/agent')) {
  const settings = JSON.parse(readFileSync(join(root, SHARED_MARKER), 'utf8'));
  const bundle = followsMachine(settings) ? currentSharedBundle(agentDir) : settings.bundle;
  if (!BUNDLE_PATTERN.test(bundle || '')) throw new Error('Invalid shared runtime bundle pin.');
  const descriptor = join(fallback, 'bundle.json');
  const candidate = existsSync(descriptor) && JSON.parse(readFileSync(descriptor, 'utf8')).bundle === bundle ? fallback :
    join(agentDir, 'changeloop/releases', bundle);
  if (!existsSync(join(candidate, 'bundle.json'))) throw new Error(`Change Loop bundle ${bundle} is not installed in Pi.`);
  assertSharedInstallation(root, candidate);
  return candidate;
}
if (process.argv[2] === 'resolve' && process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(sharedPackageRoot(process.argv[3])); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
