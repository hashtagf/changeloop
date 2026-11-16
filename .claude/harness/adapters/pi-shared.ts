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
const BUNDLE = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?-api\d+-[a-f0-9]{16}$/;
// Follow the machine's cloop version with the helper shipped in Pi's current
// bundle (installed together with this loader). Failures only warn.
async function followMachine(base: string, agentDir: string): Promise<string | undefined> {
  try {
    const current = JSON.parse(readFileSync(join(base, 'installation.json'), 'utf8')).current;
    const helper = join(base, 'releases', current, '.claude/harness/adapters/pi-machine.mjs');
    if (!BUNDLE.test(current || '') || !existsSync(helper)) return undefined;
    return (await import(pathToFileURL(helper).href)).followMachine(base, agentDir);
  } catch (error: any) { return `Change Loop could not check the machine version: ${error.message}`; }
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
  const syncWarning = await followMachine(base, getAgentDir());
  let pin = '', runtime = '', failure = '', mode = 'machine';
  try {
    const marker = root ? JSON.parse(readFileSync(join(root, '.changeloop.json'), 'utf8')) : undefined;
    mode = !marker || marker.follow === 'machine' ? 'machine' : 'pinned';
    pin = mode === 'pinned' ? marker.bundle : JSON.parse(readFileSync(join(base, 'installation.json'), 'utf8')).current;
    if (!BUNDLE.test(pin || '')) throw new Error('Invalid Change Loop runtime bundle pin.');
    runtime = join(base, 'releases', pin);
    if (!existsSync(join(runtime, 'bundle.json'))) throw new Error('The project-pinned Change Loop bundle is not installed on this computer.');
  } catch (error: any) { failure = error.message; }
  const load = (path: string) => import(pathToFileURL(join(runtime, path)).href);
  pi.registerCommand('changeloop', {
    description: 'Change Loop shared runtime: status, init (settings and artifacts only), follow (machine version) or pin',
    async handler(args, ctx) {
      try {
        if (failure) throw new Error(failure);
        if (args.trim() === 'init') {
          if (!ctx.isProjectTrusted()) throw new Error('Trust this project before creating Change Loop settings.');
          const { initializeSharedProject } = await load('.claude/harness/adapters/pi-installation.mjs');
          const result = initializeSharedProject(root || repository(ctx.cwd), runtime);
          ctx.ui.notify(`Change Loop configured at ${result.root}. Only settings/artifacts belong here; runtime: ${result.follow === 'machine' ? 'follows the machine version' : result.bundle}. Run /reload.`, 'info');
        } else if (['follow', 'pin'].includes(args.trim())) {
          if (!root) throw new Error('This folder has no shared Change Loop settings; run /changeloop init first.');
          if (!ctx.isProjectTrusted()) throw new Error('Trust this project before changing its Change Loop settings.');
          const { setProjectRuntimeMode } = await load('.claude/harness/adapters/pi-installation.mjs');
          const result = setProjectRuntimeMode(root, args.trim(), runtime);
          ctx.ui.notify(result.follow === 'machine' ? 'This project now follows the machine Change Loop version. Run /reload.' :
            `This project now pins ${result.bundle}. Run /reload.`, 'info');
        } else if (args.trim() && args.trim() !== 'status') throw new Error('Use /changeloop status, init, follow or pin.');
        else ctx.ui.notify(root ? `Change Loop ${pin} (${mode === 'machine' ? 'follows the machine version' : 'pinned'})\nProject: ${root}\nRuntime: ${runtime}` : 'Change Loop is installed in Pi. Use /changeloop init to create settings for this project.', 'info');
      } catch (error: any) { ctx.ui.notify(error.message, 'error'); }
    },
  });
  if (syncWarning) pi.on('session_start', (_event, ctx) => ctx.ui.notify(syncWarning, 'warning'));
  if (failure) {
    pi.on('session_start', (_event, ctx) => { ctx.ui.setStatus('changeloop', 'Change Loop · unavailable'); ctx.ui.notify(failure, 'error'); });
    if (root) pi.on('tool_call', event => ['read', 'grep', 'write', 'edit', 'bash', 'powershell'].includes(event.toolName) ?
      { block: true, reason: `Change Loop unavailable: ${failure}` } : undefined);
    return;
  }
  const bootstrapPath = join(runtime, '.claude/harness/adapters/pi-bootstrap.mjs');
  if (!root) {
    // First use: offer the work-starting commands without writing anything until one runs.
    if (!existsSync(bootstrapPath)) return;
    const bootstrap = await load('.claude/harness/adapters/pi-bootstrap.mjs');
    if (bootstrap.hasLocalRuntime(bootstrap.projectRootFor(process.cwd()))) return;
    for (const command of bootstrap.BOOTSTRAP_COMMANDS) pi.registerCommand(command, {
      description: `Change Loop: ${command} (sets up this project on first use)`,
      async handler(args, ctx) {
        try {
          const result = bootstrap.bootstrapProject({ cwd: ctx.cwd, command, args: args.trim(),
            trusted: ctx.isProjectTrusted(), runtime, agentDir: getAgentDir() });
          ctx.ui.notify(`Change Loop set up at ${result.root} (follows the machine version); continuing /${command}.`, 'info');
          await ctx.reload();
        } catch (error: any) { ctx.ui.notify(error.message, 'error'); }
      },
    });
    return;
  }
  const { default: install } = await load('.claude/harness/adapters/pi-extension.mjs');
  install(pi, { createBashTool, createLocalBashOperations, projectRoot: root, runtimeRoot: runtime,
    hostExecutable: 'bash', hostPrefixArgs: [join(runtime, 'cli.sh')] });
  // After a first-use reload, run the command that set this project up, once.
  if (existsSync(bootstrapPath)) pi.on('session_start', async () => {
    const { takePendingCommand } = await load('.claude/harness/adapters/pi-bootstrap.mjs');
    const pending = takePendingCommand({ root, agentDir: getAgentDir() });
    if (pending) pi.sendUserMessage(pending, { expandPromptTemplates: true });
  });
  pi.on('resources_discover', (_event, ctx) => ctx.isProjectTrusted() ? { skillPaths: [join(runtime, '.claude/skills')] } : undefined);
}
