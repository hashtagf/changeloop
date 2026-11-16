import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getAgentDir, ModelRuntime, type ExtensionAPI, type ExtensionContext } from '@earendil-works/pi-coding-agent';
import { accountName, accountProvider, BASE, readAccounts, renameAccount } from './accounts.ts';

export const SUBSCRIPTION_PACKAGE = 'git:github.com/inhumanxd/pi-claude-subscription';
export const subscriptionEntry = (agentDir = getAgentDir()) => join(agentDir, 'git', 'github.com', 'inhumanxd', 'pi-claude-subscription', 'index.ts');

// Pi installs the subscription package under the agent directory; resolve it
// there so this extension works from the repository as well as when installed.
async function loadSubscription(): Promise<((id: string, name: string) => any) | undefined> {
  const entry = subscriptionEntry();
  if (!existsSync(entry)) return undefined;
  return (await import(pathToFileURL(entry).href)).createSubscriptionProvider;
}

export default async function (pi: ExtensionAPI) {
  const createSubscriptionProvider = await loadSubscription();
  const authPath = join(getAgentDir(), 'auth.json');
  const registered = new Map<string, string>();
  let signingIn = false;
  let signInController: AbortController | undefined;
  const profile = (name: string, id = accountProvider(name)) => {
    if (!createSubscriptionProvider) throw new Error(`Claude accounts need the Claude subscription package. Install it with: pi install ${SUBSCRIPTION_PACKAGE}`);
    const provider = createSubscriptionProvider(id, `Claude · ${name}`);
    if (provider.id !== id) throw new Error('Claude subscription provider needs account-profile support restored after its update.');
    return provider;
  };
  const register = (name: string, provider = accountProvider(name)) => {
    if (provider !== BASE && registered.get(provider) !== name) {
      pi.registerProvider(profile(name, provider));
      registered.set(provider, name);
    }
    return provider;
  };
  const sync = () => { const rows = readAccounts(authPath); for (const row of rows) register(row.name, row.provider); return rows; };
  const status = (ctx: ExtensionContext, provider = ctx.model?.provider) => {
    const name = readAccounts(authPath).find(row => row.provider === provider)?.name || accountName(provider);
    ctx.ui.setStatus('claude-account', name ? `Claude account: ${name}` : undefined);
  };
  const use = async (name: string, ctx: ExtensionContext) => {
    if (!ctx.isIdle() || ctx.hasPendingMessages()) throw new Error('Wait for this session to finish its current turn and queued messages before switching accounts.');
    const row = sync().find(item => item.name === name || (name === 'default' && item.provider === BASE));
    if (!row) throw new Error(`Account ${name} is not signed in. Use /accounts add ${name}.`);
    if (ctx.model && !accountName(ctx.model.provider)) throw new Error('Select a Claude subscription model with /model before choosing its account.');
    const modelId = ctx.model?.id || pi.getSettings().defaultModel;
    const model = ctx.modelRegistry.find(row.provider, modelId || '');
    if (!model) throw new Error('Choose a Claude model with /model first; the account switch keeps the same model.');
    if (!await pi.setModel(model)) throw new Error('Account authentication is unavailable. Sign in again with /accounts login ' + name);
    status(ctx, row.provider);
    ctx.ui.notify(`Using Claude account: ${name}. Model: ${model.id}.`, 'info');
  };
  const login = async (name: string, replace: boolean, ctx: ExtensionContext) => {
    accountProvider(name);
    if (signingIn) throw new Error('A sign-in is already in progress in this session.');
    if (!ctx.hasUI) throw new Error('Account sign-in needs Pi TUI or a connected Web dialog.');
    if (!ctx.isIdle() || ctx.hasPendingMessages()) throw new Error('Finish the current turn and queued messages before signing in.');
    const accounts = sync();
    const existing = accounts.find(row => row.name === name || (name === 'default' && row.provider === BASE));
    if (!replace && existing) throw new Error(`Account ${name} already exists. Use /accounts use ${name} or /accounts login ${name}.`);
    const provider = existing?.provider || accountProvider(name);
    if (!existing && accounts.some(row => row.provider === provider)) throw new Error('This name belongs to a renamed credential slot. Choose another name.');
    signingIn = true;
    const controller = new AbortController();
    signInController = controller;
    const timeout = setTimeout(() => controller.abort(new Error('Sign-in timed out after 5 minutes.')), 5 * 60_000);
    try {
      const runtime = await ModelRuntime.create({ authPath, modelsPath: null, refreshOnCreate: false });
      runtime.registerNativeProvider(profile(name, provider));
      ctx.ui.notify(`Sign in for ${name}. Open the link in the browser profile for that account. The current session account stays unchanged.`, 'info');
      await runtime.login(provider, 'oauth', {
        signal: controller.signal,
        notify(event) {
          if (event.type === 'auth_url') ctx.ui.notify(`Claude sign-in (${name}):\n${event.url}\n${event.instructions || ''}`, 'info');
          else if ('message' in event && event.type !== 'progress') ctx.ui.notify(event.message, 'info');
        },
        async prompt(prompt) {
          const value = await ctx.ui.input(`Claude · ${name}: paste callback URL / code · 5 min · Esc hides input`, prompt.type === 'select' ? undefined : prompt.placeholder,
            { signal: prompt.signal || controller.signal });
          if (value === undefined) {
            const signal = prompt.signal || controller.signal;
            if (!signal.aborted) ctx.ui.notify('Callback input closed; browser sign-in is still waiting (up to 5 minutes). Use /accounts cancel to cancel.', 'info');
            return await new Promise<string>((_resolve, reject) => {
              const abort = () => reject(new Error('Sign-in input closed.'));
              if (signal.aborted) abort();
              else signal.addEventListener('abort', abort, { once: true });
            });
          }
          return value;
        },
      });
      register(name, provider);
      await ctx.modelRegistry.refresh({ allowNetwork: false });
      ctx.ui.notify(`Account ${name} saved. Use /accounts use ${name} to select it in this session.`, 'info');
    } catch (error: any) {
      // Auth errors are bounded by the provider; never render credential objects.
      throw new Error(controller.signal.aborted ? controller.signal.reason?.message || 'Sign-in cancelled.' : error.message || 'Sign-in failed.');
    } finally { clearTimeout(timeout); signingIn = false; signInController = undefined; }
  };
  // Register saved profiles at load so --provider works for worker processes too.
  try { sync(); } catch { /* The command reports storage errors without breaking Pi startup. */ }
  pi.on('session_start', (_event, ctx) => { try { sync(); status(ctx); } catch (error: any) { ctx.ui.notify(error.message, 'error'); } });
  pi.on('model_select', (event, ctx) => status(ctx, event.model.provider));
  pi.on('session_shutdown', () => signInController?.abort(new Error('Sign-in cancelled because the session closed or reloaded.')));
  pi.registerCommand('accounts', {
    description: 'Claude accounts: select, add/use/login <name>, rename <old> <new>, list, cancel. Selection is per session.',
    async handler(args, ctx) {
      try {
        const [action, name, target, extra] = args.trim().split(/\s+/);
        if (extra || (target && action !== 'rename') || (action && !['add', 'use', 'login', 'rename', 'list', 'cancel'].includes(action))) throw new Error('Usage: /accounts [add/use/login <name> | rename <old> <new> | list | cancel]');
        if (action === 'rename') {
          if (!name || !target) throw new Error('Usage: /accounts rename <old> <new>');
          if (signingIn) throw new Error('Finish or cancel sign-in before renaming an account.');
          const row = renameAccount(authPath, name, target);
          register(row.name, row.provider); status(ctx);
          ctx.ui.notify(`Renamed Claude account ${name} → ${target}. Credentials and existing sessions are preserved.`, 'info');
          return;
        }
        if (action === 'cancel') { signInController?.abort(new Error('Sign-in cancelled.')); ctx.ui.notify('Account sign-in cancellation requested.', 'info'); }
        else if (action === 'add' || action === 'login') { if (!name) throw new Error('Provide an account name, e.g. /accounts add work'); await login(name, action === 'login', ctx); }
        else if (action === 'use') { if (!name) throw new Error('Provide an account name.'); await use(name, ctx); }
        else {
          const rows = sync();
          if (action === 'list') { ctx.ui.notify(rows.map(row => `${row.provider === ctx.model?.provider ? '→ ' : ''}${row.name}${row.email ? ' · ' + row.email : ''}`).join('\n') || 'No Claude accounts. Use /accounts add work.', 'info'); return; }
          const options = [...rows.map(row => `${row.name}${row.email ? ' · ' + row.email : ''}${row.provider === ctx.model?.provider ? ' (current)' : ''}`), '+ Add account'];
          const selected = await ctx.ui.select('Claude accounts · this session', options);
          if (!selected) return;
          const index = options.indexOf(selected);
          if (index === rows.length) { const label = await ctx.ui.input('Account name (e.g. work or personal)'); if (label) await login(label.trim(), false, ctx); }
          else await use(rows[index].name, ctx);
        }
      } catch (error: any) { ctx.ui.notify(error.message || 'Account operation failed.', 'error'); }
    },
  });
}
