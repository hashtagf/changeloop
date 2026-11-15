// Change Loop shared Pi loader. Runtime code never enters a consumer repository.
import { createBashTool, createLocalBashOperations, getAgentDir, type ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

function project(start: string) {
  const owned = start.match(/^(.*)\/\.foundation\/(?:sandboxes|repository-sandboxes)\//)?.[1];
  if (owned && existsSync(join(owned, '.changeloop.json'))) return owned;
  for (let path = start; ; path = dirname(path)) {
    if (existsSync(join(path, '.changeloop.json'))) return path;
    if (existsSync(join(path, '.git')) || dirname(path) === path) return undefined;
  }
}
function repository(start: string) {
  for (let path = start; ; path = dirname(path)) {
    if (existsSync(join(path, '.git'))) return path;
    if (dirname(path) === path) return start;
  }
}
export default async function (pi: ExtensionAPI) {
  const base = join(getAgentDir(), 'changeloop');
  const root = project(process.cwd());
  let pin = '', runtime = '', failure = '';
  try {
    pin = root ? JSON.parse(readFileSync(join(root, '.changeloop.json'), 'utf8')).bundle :
      JSON.parse(readFileSync(join(base, 'installation.json'), 'utf8')).current;
    if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?-api\d+-[a-f0-9]{16}$/.test(pin || '')) throw new Error('Invalid Change Loop runtime bundle pin.');
    runtime = join(base, 'releases', pin);
    if (!existsSync(join(runtime, 'bundle.json'))) throw new Error('The project-pinned Change Loop bundle is not installed on this computer.');
  } catch (error: any) { failure = error.message; }
  const load = (path: string) => import(pathToFileURL(join(runtime, path)).href);
  pi.registerCommand('changeloop', {
    description: 'Change Loop shared runtime: status or init (settings and artifacts only)',
    async handler(args, ctx) {
      try {
        if (failure) throw new Error(failure);
        if (args.trim() === 'init') {
          if (!ctx.isProjectTrusted()) throw new Error('Trust this project before creating Change Loop settings.');
          const { initializeSharedProject } = await load('.claude/harness/adapters/pi-installation.mjs');
          const result = initializeSharedProject(root || repository(ctx.cwd), runtime);
          ctx.ui.notify(`Change Loop configured at ${result.root}. Only settings/artifacts belong here; runtime: ${result.runtime}. Run /reload.`, 'info');
        } else if (args.trim() && args.trim() !== 'status') throw new Error('Use /changeloop init or /changeloop status.');
        else ctx.ui.notify(root ? `Change Loop ${pin}\nProject: ${root}\nRuntime: ${runtime}` : 'Change Loop is installed in Pi. Use /changeloop init to create settings for this project.', 'info');
      } catch (error: any) { ctx.ui.notify(error.message, 'error'); }
    },
  });
  if (failure) {
    pi.on('session_start', (_event, ctx) => { ctx.ui.setStatus('changeloop', 'Change Loop · unavailable'); ctx.ui.notify(failure, 'error'); });
    if (root) pi.on('tool_call', event => ['read', 'grep', 'write', 'edit', 'bash', 'powershell'].includes(event.toolName) ?
      { block: true, reason: `Change Loop unavailable: ${failure}` } : undefined);
    return;
  }
  if (!root) return;
  const { default: install } = await load('.claude/harness/adapters/pi-extension.mjs');
  install(pi, { createBashTool, createLocalBashOperations, projectRoot: root, runtimeRoot: runtime,
    hostExecutable: 'bash', hostPrefixArgs: [join(runtime, 'cli.sh')] });
  pi.on('resources_discover', (_event, ctx) => ctx.isProjectTrusted() ? { skillPaths: [join(runtime, '.claude/skills')] } : undefined);
}
