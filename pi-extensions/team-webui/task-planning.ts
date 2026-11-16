import { taskGraph } from './task-graph.ts';
import { problem } from './workspace.ts';

function compact(task, node) {
  return {
    id: task.id,
    version: task.version,
    title: task.title,
    status: task.status,
    ownerSessionId: task.ownerSessionId,
    nextStep: task.nextStep.slice(0, 200),
    blocker: task.blocker.slice(0, 200),
    dependencyReady: node.blockedBy.length === 0,
    ready: task.status !== 'deployed' && !task.blocker && !node.blockedBy.length,
    blockedBy: node.blockedBy.slice(0, 3),
    moreBlockers: Math.max(0, node.blockedBy.length - 3),
  };
}

// Read-only advice. Dependency independence says nothing about shared file writes.
export function taskPlan(tasks, { offset = 0, limit = 20, ownerSessionId }: any = {}) {
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 40)
    throw problem(400, 'Use offset >= 0 and limit 1–40.');
  if (ownerSessionId !== undefined && typeof ownerSessionId !== 'string')
    throw problem(400, 'Invalid ownerSessionId.');
  const graph = taskGraph(tasks);
  const byId = new Map<any, any>(tasks.map(t => [t.id, t]));
  const nodes = new Map<any, any>(graph.nodes.map(n => [n.id, n]));
  const pending = graph.layers.flat().map(id => byId.get(id))
    .filter(t => t.status !== 'deployed' && (ownerSessionId === undefined || t.ownerSessionId === ownerSessionId));
  const ids = new Set(pending.map(t => t.id));
  const edges = graph.edges.filter(e => ids.has(e.from) && ids.has(e.to));
  const branches = new Map<any, any>(), joins = new Map<any, any>();
  for (const edge of edges) {
    branches.set(edge.from, (branches.get(edge.from) || 0) + 1);
    joins.set(edge.to, (joins.get(edge.to) || 0) + 1);
  }
  const widths = graph.layers.map(layer => layer.filter(id => ids.has(id)).length).filter(Boolean);
  const topology = !pending.length ? 'empty' : pending.length === 1 ? 'single'
    : [...branches.values(), ...joins.values()].some(n => n > 1) ? 'dag'
    : widths.some(n => n > 1) ? 'parallel' : 'sequential';
  const rows = pending.map(t => compact(t, nodes.get(t.id)));
  const ready = rows.filter(t => t.ready).length;
  return {
    topology,
    counts: { pending: rows.length, ready, blocked: rows.length - ready, deployed: tasks.filter(t => t.status === 'deployed' && (ownerSessionId === undefined || t.ownerSessionId === ownerSessionId)).length },
    depth: widths.length,
    maxLayerWidth: Math.max(0, ...widths),
    advisory: ready > 1
      ? 'Multiple tasks meet their dependency thresholds. Check shared files and owner availability before working concurrently; use existing-session handoff.'
      : ready === 1 ? 'One task is ready. Start with its brief; additional workers may not help.'
      : pending.length ? 'Resolve blockers or prerequisite stages first.' : 'No pending tasks in this selection.',
    tasks: rows.slice(offset, offset + limit),
    offset, limit, nextOffset: offset + limit < rows.length ? offset + limit : null,
    execution: 'advisory-only',
  };
}

export function taskBrief(tasks, id, project) {
  const task = tasks.find(t => t.id === id);
  if (!task) throw problem(404, 'Active task not found in this project.');
  const node = taskGraph(tasks).nodes.find(n => n.id === id);
  const limits = { description: 1200, nextStep: 600, blocker: 400, evidence: 1200 };
  return {
    project,
    ...compact(task, node),
    goal: task.title,
    context: task.description.slice(0, limits.description),
    nextStep: task.nextStep.slice(0, limits.nextStep),
    blocker: task.blocker.slice(0, limits.blocker),
    evidence: task.evidence.slice(0, limits.evidence),
    phase: task.workflow?.phase,
    truncatedFields: Object.entries(limits).filter(([field, limit]) => task[field].length > limit).map(([field]) => field),
    missingNextStep: !task.nextStep,
    delivery: 'Update this task with evidence and nextStep. Assignment does not start an agent or request a reply. Use get for full details before acting on truncated information.',
  };
}
