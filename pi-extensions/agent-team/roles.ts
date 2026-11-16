// Worker roles, Change Loop model tiers, leased-task briefs and spawn limits.
// Pure helpers: no Pi dependency, so tests run under plain Node.
import fs from 'node:fs';
import path from 'node:path';

export type Tier = 'fast' | 'standard' | 'deep';
const ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const TASK = /^T\d{3,}$/;
const DEFAULT_FAMILIES: Record<Tier, string> = { fast: 'haiku', standard: 'sonnet', deep: 'opus' };
export const DEFAULT_MAX_ACTIVE = 64;

export const REPORT_FORMAT = 'End your final report with exactly these sections: SUMMARY: one line; ' +
  'CHANGES: files changed, or none; CHECKS: commands run with their results; BLOCKERS: open issues, or none. ' +
  'The report is not evidence: never call unchecked work complete.';

export const ROLES: Record<string, { tier: Tier; readOnly: boolean; prompt: string }> = {
  explorer: { tier: 'fast', readOnly: true,
    prompt: 'Role: explorer. Locate relevant code, tests and docs; report findings with file:line. Do not edit files.' },
  executor: { tier: 'standard', readOnly: false,
    prompt: 'Role: executor. Implement the bounded task within its scope and run its focused checks. Report scope creep instead of fixing it.' },
  reviewer: { tier: 'deep', readOnly: true,
    prompt: 'Role: reviewer. Independently review the named change; report findings by severity with file:line. Do not edit files.' },
  verifier: { tier: 'standard', readOnly: true,
    prompt: 'Role: verifier. Run the named checks and report exact commands and results. Do not edit files.' },
};

/** The Change Loop project owning cwd, including its sandboxes, or undefined. */
export function changeLoopProject(cwd: string): string | undefined {
  const owned = path.resolve(cwd).match(/^(.*)\/\.foundation\/(?:sandboxes|repository-sandboxes)(?:\/|$)/)?.[1];
  if (owned && fs.existsSync(path.join(owned, 'foundation.json'))) return owned;
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'foundation.json')) &&
      (fs.existsSync(path.join(dir, 'openspec')) || fs.existsSync(path.join(dir, '.changeloop.json')))) return dir;
    if (fs.existsSync(path.join(dir, '.git')) || path.dirname(dir) === dir) return undefined;
  }
}

function readJson(file: string, fallback: any = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

export function projectSettings(project?: string) {
  const config = project ? readJson(path.join(project, 'foundation.json')) : {};
  const families = { ...DEFAULT_FAMILIES };
  for (const tier of Object.keys(families) as Tier[]) {
    const family = config?.models?.[tier]?.family;
    if (typeof family === 'string' && family.trim()) families[tier] = family.trim().toLowerCase();
  }
  const cap = Number(config?.execution?.maxParallelAgents);
  return { families, maxParallelAgents: Number.isInteger(cap) && cap > 0 ? cap : undefined };
}

type Model = { provider: string; id: string };

/** Version of a model id within a family: dash-separated numbers, then an optional 8-digit snapshot date. */
export function familyVersion(id: string, family: string) {
  const lower = id.toLowerCase(), at = lower.indexOf(family);
  if (at < 0) return undefined;
  const rest = lower.slice(at + family.length).match(/^-(\d{1,4}(?:-\d{1,4})*)(?:-(\d{8}))?$/);
  if (!rest) return { version: [] as number[], date: 0, versioned: false };
  return { version: rest[1].split('-').map(Number), date: rest[2] ? Number(rest[2]) : 0, versioned: true };
}

/** Newer first: versioned ids, higher version, undated (current) before snapshots, newer snapshot. */
export function compareFamilyVersions(a: ReturnType<typeof familyVersion>, b: ReturnType<typeof familyVersion>) {
  if (a!.versioned !== b!.versioned) return a!.versioned ? -1 : 1;
  for (let index = 0; index < Math.max(a!.version.length, b!.version.length); index++) {
    const difference = (b!.version[index] ?? -1) - (a!.version[index] ?? -1);
    if (difference) return difference;
  }
  if (!a!.date !== !b!.date) return a!.date ? 1 : -1;
  return b!.date - a!.date;
}
export function resolveTierModel(tier: Tier, { configured, families = DEFAULT_FAMILIES, current, available = [] }:
  { configured?: Record<string, any>; families?: Record<Tier, string>; current?: Model; available?: Model[] }) {
  const pinned = configured?.[tier];
  if (typeof pinned === 'string' && pinned.includes('/')) {
    const [provider, ...rest] = pinned.split('/');
    return { provider, model: rest.join('/') };
  }
  if (pinned?.provider && pinned?.model) return { provider: String(pinned.provider), model: String(pinned.model) };
  const family = families[tier];
  const match = available.filter(model => (!current || model.provider === current.provider) &&
    familyVersion(model.id, family))
    .sort((a, b) => compareFamilyVersions(familyVersion(a.id, family), familyVersion(b.id, family)) ||
      a.id.localeCompare(b.id))[0];
  if (match) return { provider: match.provider, model: match.id };
  return current ? { provider: current.provider, model: current.id } : {};
}

export function resolveRole(name: string, options: Parameters<typeof resolveTierModel>[1]) {
  const role = ROLES[name];
  if (!role) throw new Error(`Unknown role '${name}'; use ${Object.keys(ROLES).join(', ')}`);
  return { role: name, tier: role.tier, ...resolveTierModel(role.tier, options),
    excludeTools: role.readOnly ? ['write', 'edit'] : [],
    appendSystemPrompt: `${role.prompt}\n${REPORT_FORMAT}` };
}

/** Brief for one leased Change Loop task; the worker runs in the project root. */
export function changeLoopTaskBrief(project: string | undefined, change: string, task: string, notes = '') {
  if (!project) throw new Error('changeLoopTask needs a Change Loop project as cwd');
  if (!ID.test(change) || !TASK.test(task)) throw new Error('changeLoopTask needs a change id and a task id like T001');
  const workspace = readJson(path.join(project, '.foundation', 'runtime', `${change}.json`), null)?.workspace?.path;
  if (typeof workspace !== 'string' || !fs.statSync(workspace, { throwIfNoEntry: false })?.isDirectory())
    throw new Error(`Change '${change}' has no Build workspace; resume advance in the coordinating session first`);
  return { cwd: project, workspace, task: [
    `Change Loop leased task ${task} of change ${change}. Workspace: ${workspace}`,
    `First run: cd ${workspace} && cloop packet ${change} --task ${task}`,
    'Follow its workerContract: implement only that task inside its allowed paths and run its focused checks.',
    `Every bash call starts in ${project}; cd to the absolute workspace in each call and use absolute file paths.`,
    `Do not edit openspec/changes/${change}/tasks.md, acquire or release leases, run advance, land, or work on other tasks.`,
    'The coordinator resumes advance, which reruns verification; your report is coordination, not evidence.',
    notes.trim() ? `Coordinator notes: ${notes.trim()}` : '',
  ].filter(Boolean).join('\n') };
}

/** Throws when another active worker would exceed the configured or project limit. */
export function admitWorker(active: { cwd?: string }[], { maxActive = DEFAULT_MAX_ACTIVE, project, projectCap }:
  { maxActive?: number; project?: string; projectCap?: number } = {}) {
  if (active.length >= maxActive) throw new Error(`Maximum ${maxActive} active managed agents (maxActiveWorkers)`);
  if (project && projectCap) {
    const inProject = active.filter(member => member.cwd && changeLoopProject(member.cwd) === project).length;
    if (inProject >= projectCap)
      throw new Error(`Change Loop project allows ${projectCap} active workers (execution.maxParallelAgents in foundation.json)`);
  }
}

/** The coordinating session every descendant worker reports its phase through. */
export function parentSessionEnv(env: NodeJS.ProcessEnv, sessionId: string) {
  return { ...env, FOUNDATION_PARENT_SESSION_ID: env.FOUNDATION_PARENT_SESSION_ID || sessionId };
}
