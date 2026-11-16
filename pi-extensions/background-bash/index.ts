import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';
import { Type } from 'typebox';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import * as jobs from './manager.cjs';
import { foreground } from './foreground.cjs';
import { BackgroundPanel, activeJob } from './panel.ts';
import { truncateToWidth } from '@earendil-works/pi-tui';
import { brief, jobQuery } from './outputs.ts';
import { createNotifications } from './notifications.ts';
import { createJobMonitor } from './monitor.ts';

const terminal = (status: string) => !['starting', 'running'].includes(status);
const result = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }], details: data });

export default function backgroundBash(pi: ExtensionAPI) {
  let root = '', monitor: ReturnType<typeof setInterval> | undefined;
  const waiting = new Map<string, () => void>();
  let ownsBash = false;
  let panel: BackgroundPanel | undefined, panelOpen = false, panelDone: (() => void) | undefined;
  let widgetTui: any, recentJobs: any[] = [];
  let jobMonitor: ReturnType<typeof createJobMonitor> | undefined;
  const sessionRoot = (ctx: ExtensionContext) => join(homedir(), '.pi', 'agent', 'background-jobs',
    createHash('sha256').update(ctx.sessionManager.getSessionId()).digest('hex').slice(0, 24));
  const commandOptions = (ctx: ExtensionContext, command: string, cwd: string, timeoutSeconds?: number, env?: NodeJS.ProcessEnv) => ({
    command, cwd, timeoutSeconds, notifyMode: 'auto',
    env: { ...process.env, ...env, PI_SESSION_ID: ctx.sessionManager.getSessionId(),
      PI_SESSION_FILE: ctx.sessionManager.getSessionFile?.() ?? '', PI_PROVIDER: ctx.model?.provider ?? '',
      PI_MODEL: ctx.model?.id ?? '', PI_REASONING_LEVEL: ctx.thinkingLevel ?? '' },
  });
  const query = (dir: string, action: string, id?: string, lines?: number): any => {
    return jobQuery(dir, { action, id, lines });
  };
  const openJobs = async (ctx: ExtensionContext, initial?: string, native = false) => {
    if (ctx.mode !== 'tui' || panelOpen) return;
    if (native) pi.events.emit('pi:local-ui', {});
    const dir = sessionRoot(ctx); panelOpen = true;
    try {
      await ctx.ui.custom<void>((tui, theme, _keys, done) => {
        panelDone = done;
        panel = new BackgroundPanel({ tui, theme, initial, done, log: id => jobs.tail(dir, id, 500), stop: id => jobs.stop(dir, id) });
        panel.update(jobs.list(dir)); return panel;
      });
    } finally { panel = undefined; panelDone = undefined; panelOpen = false; widgetTui?.requestRender(); }
  };

  const runBash = async (command: string, cwd: string, timeout: number | undefined,
    signal: AbortSignal | undefined, ctx: ExtensionContext, onOutput?: (output: string) => void,
    env?: NodeJS.ProcessEnv) => {
    if (timeout !== undefined && (!Number.isFinite(timeout) || timeout <= 0 || timeout > 2147483.647)) {
      throw new Error('Invalid timeout: must be positive seconds, maximum 2147483.647');
    }
    let jobId: string | undefined;
    try {
      return await foreground(sessionRoot(ctx), commandOptions(ctx, command, cwd, timeout, env), { signal, onOutput,
        onReady: ({ id, detach }: { id: string; detach: () => void }) => {
          jobId = id;
          waiting.set(id, detach);
          ctx.ui.setStatus('foreground-bash', 'bash · auto BG 10s · Ctrl+B now');
        },
      });
    } finally {
      if (jobId) waiting.delete(jobId);
      if (!waiting.size) ctx.ui.setStatus('foreground-bash', undefined);
    }
  };
  const backgroundText = (run: any) => `Command continues in background (not completed).\nJob ID: ${run.job.id}\nLog: ${run.job.logPath}\nUse background_job or /jobs to inspect or stop it. Completion will be reported automatically.\n${run.output}`;

  const bashTool = {
    name: 'bash', label: 'bash',
    promptSnippet: 'Execute bash; automatically continues in background after 10 seconds.',
    description: 'Run bash; after 10s (or Ctrl+B) return a job ID while the same process continues. Optional timeout still kills the job after detaching. A background result is not success; background_job inspects or stops it.',
    parameters: Type.Object({ command: Type.String(), timeout: Type.Optional(Type.Number()) }),
    async execute(_id: string, params: { command: string; timeout?: number }, signal: AbortSignal | undefined, onUpdate: any, ctx: ExtensionContext) {
      const run = await runBash(params.command, ctx.cwd, params.timeout, signal, ctx,
        output => onUpdate?.({ content: [{ type: 'text', text: output }], details: undefined }));
      const details = { fullOutputPath: run.job.logPath };
      if (run.background) return {
        content: [{ type: 'text' as const, text: backgroundText(run) }], details,
        structuredContent: { background: true, job_id: run.job.id, exit_code: null, full_output_path: run.job.logPath },
      };
      const failed = run.job.status !== 'completed' || run.job.exitCode !== 0;
      return {
        content: [{ type: 'text' as const, text: (run.output || '(no output)') +
          (failed ? `\n\nCommand ${run.job.status}; exit code ${run.job.exitCode ?? 'unknown'}` : '') }],
        details, isError: failed,
        structuredContent: { output: run.output, exit_code: run.job.exitCode ?? null,
          background: false, status: run.job.status, full_output_path: run.job.logPath },
      };
    },
  };
  pi.registerShortcut('ctrl+b', {
    description: 'Background waiting bash commands, or open the jobs panel',
    handler: async ctx => {
      const count = waiting.size;
      if (!count && ctx.mode === 'tui') { await openJobs(ctx, undefined, true); return; }
      for (const detach of [...waiting.values()]) detach();
      ctx.ui.notify(count ? `Sent ${count} bash command(s) to background · /jobs` : 'No foreground bash command is waiting.', 'info');
    },
  });
  pi.registerShortcut('ctrl+alt+b', { description: 'Open background jobs and live logs', handler: ctx => openJobs(ctx, undefined, true) });
  // Cover user-entered ! / !! commands too, retaining streaming/cancellation.
  pi.on('user_bash', (_event, ctx) => !ownsBash ? undefined : ({ operations: {
    exec: async (command, cwd, options) => {
      let previous = '';
      const run = await runBash(command, cwd, options.timeout, options.signal, ctx, output => {
        const chunk = output.startsWith(previous) ? output.slice(previous.length) : `\n${output}`;
        previous = output;
        if (chunk) options.onData(Buffer.from(chunk));
      }, options.env);
      if (run.background) options.onData(Buffer.from(`\n${backgroundText({ ...run, output: '' })}\n`));
      return { exitCode: run.background ? null : run.job.exitCode ?? 1 };
    },
  } }));

  pi.registerTool({
    name: 'background_bash', label: 'Background bash',
    promptSnippet: 'Run long shell commands in the background; returns job ID immediately.',
    description: 'Start bash -c with no stdin; return a persistent job ID immediately. Inherits session environment; survives Pi exit/reload. Completion notifies automatically unless notify=false. Cannot adopt an existing process.',
    parameters: Type.Object({
      command: Type.String(),
      cwd: Type.Optional(Type.String({ description: 'Working directory, relative to project cwd or absolute' })),
      timeoutSeconds: Type.Optional(Type.Number({ minimum: 1, maximum: 604800 })),
      notify: Type.Optional(Type.Boolean({ description: 'Omit for batched automatic reporting (successful bare sleep and intentional stops stay silent). true explicitly requests completion reporting, including timers; false disables reporting.' })),
    }),
    async execute(_id, params, signal, _update, ctx) {
      if (signal?.aborted) throw new Error('Cancelled before start');
      return result(brief(await jobs.start(sessionRoot(ctx), { ...commandOptions(ctx, params.command,
        resolve(ctx.cwd, params.cwd ?? '.'), params.timeoutSeconds), notify: params.notify !== false,
        notifyMode: params.notify === true ? 'always' : params.notify === false ? 'off' : 'auto' })));
    },
  });
  pi.registerTool({
    name: 'background_job', label: 'Background job',
    promptSnippet: 'Inspect logs/status or stop a background job.',
    description: 'Compact paginated job list: active only by default, 20 per page (max 50). includeFinished includes history. status never includes logs. log returns up to 8 KiB by default (max 32 KiB); use byteOffset and nextByteOffset to page from byte 0, or omit byteOffset for the tail. Full logPath remains available. Reading a terminal status/log acknowledges its completion notification. Completion reports are batched while idle: do not poll.',
    parameters: Type.Object({
      action: Type.Union([Type.Literal('list'), Type.Literal('status'), Type.Literal('log'), Type.Literal('stop')]),
      id: Type.Optional(Type.String()),
      lines: Type.Optional(Type.Integer({ minimum: 1, maximum: 500 })),
      includeFinished: Type.Optional(Type.Boolean()),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 50 })), offset: Type.Optional(Type.Integer({ minimum: 0 })),
      byteOffset: Type.Optional(Type.Integer({ minimum: 0 })), maxBytes: Type.Optional(Type.Integer({ minimum: 1, maximum: 32768 })),
    }),
    async execute(_id, params, _signal, _update, ctx) {
      return result(jobQuery(sessionRoot(ctx), params));
    },
  });
  pi.registerCommand('jobs', {
    description: 'Open background jobs and logs: /jobs [log|stop <job-id>]',
    handler: async (args, ctx) => {
      const [action, id] = args.trim().split(/\s+/);
      try {
        if (ctx.mode === 'tui' && (!action || action === 'log')) { await openJobs(ctx, id); return; }
        const dir = sessionRoot(ctx);
        if (action === 'stop' && id) ctx.ui.notify(JSON.stringify(query(dir, action, id)), 'info');
        else if (action === 'log' && id) ctx.ui.notify(query(dir, action, id).output || '(no output yet)', 'info');
        else ctx.ui.notify(JSON.stringify(query(dir, 'list'), null, 2), 'info');
      } catch (error) { ctx.ui.notify(String(error), 'error'); }
    },
  });
  pi.on('before_agent_start', event => ({
    systemPrompt: event.systemPrompt + (ownsBash ? '\nAll bash commands automatically continue in background after 10 seconds; Ctrl+B backgrounds waiting commands immediately. background_bash starts background work without waiting. A returned job ID means still running, never success. Continue independent work and use completion notifications; do not repeatedly poll. Use background_job for logs/cancellation. Do not rerun a command merely because it moved to background.' : '\nAnother extension owns bash in this project. Preserve its workflow, environment and command handling; this extension does not replace that bash tool. Delegate long project execution to an agent worker and use the project bash there. Existing background jobs remain inspectable with background_job.'),
  }));
  pi.on('session_start', (_event, ctx) => {
    // Register after all extensions have loaded, so startup never contains two
    // owners for bash. Project adapters (e.g. Change Loop) keep their own tool.
    const existing = pi.getAllTools().find(tool => tool.name === 'bash');
    ownsBash = existing?.sourceInfo.source === 'builtin';
    if (ownsBash) pi.registerTool(bashTool);
    root = sessionRoot(ctx);
    jobMonitor?.close(); jobMonitor = createJobMonitor(root);
    const notifyJobs = createNotifications(root, (message: any, options: any) => pi.sendMessage(message, options));
    if (ctx.mode === 'tui') ctx.ui.setWidget('background-jobs', (tui, theme) => {
      widgetTui = tui;
      return { render: (width: number) => [truncateToWidth(theme.fg('muted', `Background · ${recentJobs.filter(activeJob).length} running · Ctrl+B ${waiting.size ? 'detach' : 'open'} · Ctrl+Alt+B always`), width)], invalidate() {} };
    }, { placement: 'belowEditor' });
    const startedAt = Date.now(), seenCommands = new Set<string>();
    let lastView = '', lastRunning = -1;
    const shellEntries = () => (ctx.sessionManager.getBranch?.() || [])
      .filter((entry: any) => entry.type === 'message' && entry.message?.role === 'bashExecution');
    for (const entry of shellEntries()) seenCommands.add(entry.id);
    const tick = () => {
      try {
        // Observe the native saved result, including project-owned bash. Never
        // replace its execution/guards or replay commands from earlier history.
        const completed = shellEntries().filter((entry: any) => {
          if (seenCommands.has(entry.id)) return false;
          const message = entry.message;
          if (message.excludeFromContext || message.cancelled || message.timestamp < startedAt || message.exitCode == null) {
            seenCommands.add(entry.id); return false;
          }
          return true;
        }).slice(0, 20);
        if (completed.length) {
          pi.sendMessage({ customType: 'user-command-complete', display: false,
            content: `User shell command(s) finished: ${completed.map((entry: any) => `exit ${entry.message.exitCode}: ${entry.message.command.slice(0, 160)}`).join('\n')}\nResults are already in the session. Continue the existing task from those results without asking the user to say done. Do not rerun completed commands or assume a failed command succeeded.`,
            details: { entryIds: completed.map((entry: any) => entry.id) },
          }, { triggerTurn: true, deliverAs: 'followUp' });
          for (const entry of completed) seenCommands.add(entry.id);
        }
        const all = jobMonitor!.read();
        const view = JSON.stringify(all.map(job => [job.id, job.status, job.exitCode, job.finishedAt]));
        recentJobs = all;
        if (panelOpen) panel?.update(all);
        if (view !== lastView || panelOpen) { widgetTui?.requestRender(); lastView = view; }
        const running = all.filter((job: any) => !terminal(job.status));
        if (running.length !== lastRunning) {
          lastRunning = running.length;
          ctx.ui.setStatus('background-bash', running.length ? `BG: ${running.length} · /jobs` : undefined);
        }
        notifyJobs(ctx, all);
      } catch (error) { ctx.ui.notify(`Background jobs: ${String(error)}`, 'error'); }
    };
    // Persistent acknowledgement avoids duplicates on /reload and catches jobs
    // that finished while Pi was closed.
    monitor = setInterval(tick, 1500);
    monitor.unref?.();
    tick();
  });
  pi.on('session_shutdown', (_event, ctx) => {
    if (monitor) clearInterval(monitor);
    jobMonitor?.close(); jobMonitor = undefined;
    panelDone?.(); panel = undefined; widgetTui = undefined; recentJobs = [];
    if (ctx.mode === 'tui') ctx.ui.setWidget('background-jobs', undefined);
    for (const detach of [...waiting.values()]) detach();
  });
}
