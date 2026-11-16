import { Type } from 'typebox';
import { createTaskStore, taskStatuses } from './task-store.ts';
import { describe } from './workspace.ts';
import { randomUUID } from 'node:crypto';
import { createTaskTUI } from './task-tui.ts';
import { createChangeLoopSync } from './changeloop-tasks.ts';
import { taskContext, taskContextPolicy } from './task-context.ts';
import { records } from './registry.ts';

export function installTaskBoard(pi) {
  const store = createTaskStore();
  const changeLoop = createChangeLoopSync(store);
  const projects = new Map<any, any>();
  let board = createTaskTUI(store, changeLoop);
  pi.on('session_start', () => {
    board.close();
    board = createTaskTUI(store, changeLoop);
  });
  pi.on('session_shutdown', () => board.close());
  const project = async (ctx) => {
    if (!projects.has(ctx.cwd))
      projects.set(ctx.cwd, (await describe(ctx.cwd)).projectRoot);
    return projects.get(ctx.cwd);
  };
  const fields = {
    title: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    status: Type.Optional(Type.Union(taskStatuses.map((s) => Type.Literal(s)))),
    nextStep: Type.Optional(Type.String()),
    blocker: Type.Optional(Type.String()),
    evidence: Type.Optional(Type.String()),
    ownerSessionId: Type.Optional(Type.String()),
    ownerName: Type.Optional(Type.String()),
    dependsOn: Type.Optional(
      Type.Array(
        Type.Object({
          id: Type.String(),
          status: Type.Union(taskStatuses.map((s) => Type.Literal(s))),
        }),
        { maxItems: 100 },
      ),
    ),
  };
  const result = (value) => ({
    content: [{ type: 'text', text: JSON.stringify(value) }],
    details: value,
  });
  pi.registerTool({
    name: 'task_board',
    label: 'Task board',
    description:
      'Persistent tasks across sessions. list/get; create needs key/title; update/delete/restore need id/version. delete is recoverable; list deleted:true shows trash. plan checks readiness/topology; brief(id) prepares a compact handoff. handoff assigns an existing session without spawn/message. inbox/agents/list/plan paginate via offset/limit (default 20); agents includeInactive:true includes offline. graph checks dependencies; sync/link reuse Change Loop records. Status is not execution or approval. Details: tool_guide tasks/agents.',
    parameters: Type.Object({
      action: Type.Union(
        [
          'list',
          'get',
          'create',
          'update',
          'delete',
          'restore',
          'sync',
          'link',
          'graph',
          'plan',
          'brief',
          'agents',
          'handoff',
          'inbox',
        ].map((a) => Type.Literal(a)),
      ),
      project: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 40 })),
      includeInactive: Type.Optional(Type.Boolean()),
      deleted: Type.Optional(Type.Boolean()),
      id: Type.Optional(Type.String()),
      changeId: Type.Optional(Type.String()),
      recordKind: Type.Optional(
        Type.Union([Type.Literal('change'), Type.Literal('investigation')]),
      ),
      key: Type.Optional(Type.String()),
      version: Type.Optional(Type.Integer()),
      search: Type.Optional(Type.String()),
      offset: Type.Optional(Type.Integer({ minimum: 0 })),
      ...fields,
    }),
    async execute(_id, params, _signal, _update, ctx) {
      const root = params.project || (await project(ctx)),
        actor = `agent:${ctx.sessionManager.getSessionId()}`;
      const offset = params.offset ?? 0,
        limit = params.limit ?? 20;
      if (
        !Number.isInteger(offset) ||
        offset < 0 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 40
      )
        throw Error('Use offset >= 0 and limit 1–40.');
      if (params.action === 'inbox') {
        const rows = store.inbox(ctx.sessionManager.getSessionId(), {
          offset,
          limit: limit + 1,
        });
        return result({
          tasks: rows.slice(0, limit),
          offset,
          limit,
          nextOffset: rows.length > limit ? offset + limit : null,
        });
      }
      if (params.action === 'agents') {
        const rows = (await records())
          .filter((s) => params.includeInactive || s.online)
          .sort((a, b) => a.id.localeCompare(b.id));
        return result({
          agents: rows.slice(offset, offset + limit).map((s) => ({
            id: s.id,
            name: s.sessionName || s.id,
            project: s.projectRoot || s.root,
            online: s.online,
          })),
          total: rows.length,
          offset,
          limit,
          nextOffset: offset + limit < rows.length ? offset + limit : null,
        });
      }
      if (params.action === 'handoff') {
        if (!params.ownerSessionId || !params.nextStep?.trim())
          throw Error(
            'Handoff requires an existing ownerSessionId and a concrete nextStep.',
          );
        const target = (await records()).find(
          (s) => s.id === params.ownerSessionId,
        );
        if (!target)
          throw Error(
            'Recipient session not found. Use agents to select an existing session.',
          );
        return result(
          store.update(
            root,
            params.id,
            {
              version: params.version,
              ownerSessionId: target.id,
              ownerName: target.sessionName || target.id,
              nextStep: params.nextStep,
            },
            actor,
          ),
        );
      }
      if (['delete', 'restore'].includes(params.action))
        return result(store[params.action](root, params.id, params, actor));
      if (params.action === 'link')
        return result(
          changeLoop.link(root, params.id, params.changeId, params.recordKind),
        );
      const sync = changeLoop.sync(root, { force: params.action === 'sync' });
      if (params.action === 'plan') return result(store.plan(root, { offset, limit, ownerSessionId: params.ownerSessionId }));
      if (params.action === 'brief') return result(store.brief(root, params.id));
      if (params.action === 'graph') return result(store.graph(root));
      if (params.action === 'list' || params.action === 'sync') {
        const data = store.list(root, {
          status: params.status,
          search: params.search,
          offset,
          limit,
          deleted: params.deleted ?? false,
        });
        const graph = new Map<any, any>(store.graph(root).nodes.map((t) => [t.id, t]));
        return result({
          ...data,
          tasks: data.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            ownerSessionId: t.ownerSessionId,
            version: t.version,
            deletedAt: t.deletedAt,
            nextStep: t.nextStep.slice(0, 400),
            blocker: t.blocker.slice(0, 200),
            phase: t.workflow?.phase,
            blockedBy: graph.get(t.id)?.blockedBy,
          })),
          changeLoop: sync,
        });
      }
      if (params.action === 'get') {
        const { task, history } = store.get(root, params.id);
        return result({
          task,
          recentChanges: history.slice(0, 5).map((e) => ({
            at: e.at,
            actor: e.actor,
            action: e.action,
            from: e.from,
            to: e.to,
            fields: Object.keys(e.changed || {}),
          })),
          olderHistoryAvailable: history.length > 5,
          changeLoop: sync,
        });
      }
      if (params.action === 'create')
        return result(
          store.create(
            root,
            {
              ownerSessionId: ctx.sessionManager.getSessionId(),
              ownerName: ctx.sessionManager.getSessionName?.() || 'Pi',
              ...params,
            },
            actor,
          ),
        );
      if (params.action !== 'update') throw Error('Unknown task action.');
      return result(store.update(root, params.id, params, actor));
    },
  });
  pi.on('before_agent_start', async (event, ctx) => {
    const root = await project(ctx);
    const sync = changeLoop.sync(root);
    const snapshot = taskContext(
      store,
      root,
      ctx.sessionManager.getSessionId(),
      sync.warnings,
    );
    return {
      systemPrompt: `${event.systemPrompt}\n\n${taskContextPolicy}\n${JSON.stringify(snapshot)}`,
    };
  });
  const openBoard = async (ctx) => {
    pi.events.emit('pi:local-ui', {});
    await board.show(await project(ctx), ctx);
  };
  pi.registerShortcut('ctrl+alt+t', {
    description: 'Open full-screen task Kanban',
    handler: openBoard,
  });
  pi.registerCommand('tasks', {
    description: 'Full-screen task Kanban; /tasks add <title>',
    handler: async (args, ctx) => {
      const root = await project(ctx);
      if (args.trim() === 'sync') changeLoop.sync(root, { force: true });
      if (args.startsWith('add ')) {
        const { task } = store.create(
          root,
          {
            key: randomUUID(),
            title: args.slice(4).trim(),
            ownerSessionId: ctx.sessionManager.getSessionId(),
            ownerName: ctx.sessionManager.getSessionName?.() || 'Pi',
          },
          'user:terminal',
        );
        ctx.ui.notify(`Saved: ${task.title} · open`, 'info');
        return;
      }
      await board.show(root, ctx);
    },
  });
}
