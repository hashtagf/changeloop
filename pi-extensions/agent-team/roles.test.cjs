const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const roles = require('./roles.ts');

function project({ maxParallelAgents = 3, deepFamily = 'opus' } = {}) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'team-roles-')));
  fs.mkdirSync(path.join(dir, '.git'));
  fs.mkdirSync(path.join(dir, 'openspec'));
  fs.writeFileSync(path.join(dir, 'foundation.json'), JSON.stringify({
    models: { deep: { family: deepFamily } }, execution: { maxParallelAgents } }));
  return dir;
}
const available = [
  { provider: 'anthropic', id: 'claude-haiku-4-5' }, { provider: 'anthropic', id: 'claude-sonnet-4-5' },
  { provider: 'anthropic', id: 'claude-opus-4-1' }, { provider: 'anthropic', id: 'claude-opus-4-6' },
  { provider: 'other', id: 'opus-clone-9' }];
const current = { provider: 'anthropic', id: 'claude-sonnet-4-5' };

test('reviewer is deep, read-only and asks for a structured report', () => {
  const settings = roles.projectSettings(project());
  const role = roles.resolveRole('reviewer', { families: settings.families, current, available });
  assert.deepEqual([role.provider, role.model], ['anthropic', 'claude-opus-4-6']);
  assert.deepEqual(role.excludeTools, ['write', 'edit']);
  for (const section of ['SUMMARY', 'CHANGES', 'CHECKS', 'BLOCKERS']) assert.match(role.appendSystemPrompt, new RegExp(section));
  const explorer = roles.resolveRole('explorer', { current, available });
  assert.equal(explorer.model, 'claude-haiku-4-5');
  assert.deepEqual(roles.resolveRole('executor', { current, available }).excludeTools, []);
});

test('tier models prefer configuration, then the project family, then the current model', () => {
  assert.deepEqual(roles.resolveTierModel('deep', { configured: { deep: 'x/y-1' }, current, available }), { provider: 'x', model: 'y-1' });
  const dir = project({ deepFamily: 'sonnet' });
  assert.equal(roles.resolveTierModel('deep', { families: roles.projectSettings(dir).families, current, available }).model, 'claude-sonnet-4-5');
  assert.equal(roles.resolveTierModel('fast', { current, available: [] }).model, 'claude-sonnet-4-5');
});

test('unknown roles are refused with the supported names', () => {
  assert.throws(() => roles.resolveRole('admin', { current }), /explorer, executor, reviewer, verifier/);
});

test('a leased-task brief runs from the project and names the packet and ledger limits', () => {
  const dir = project();
  const workspace = path.join(dir, '.foundation/sandboxes/c1');
  fs.mkdirSync(workspace, { recursive: true });
  fs.mkdirSync(path.join(dir, '.foundation/runtime'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.foundation/runtime/c1.json'), JSON.stringify({ id: 'c1', workspace: { path: workspace } }));
  assert.equal(roles.changeLoopProject(path.join(workspace)), dir);
  const brief = roles.changeLoopTaskBrief(roles.changeLoopProject(dir), 'c1', 'T002', 'focus on parser');
  assert.equal(brief.cwd, dir);
  assert.equal(brief.workspace, workspace);
  assert.match(brief.task, /claude-foundation packet c1 --task T002/);
  assert.match(brief.task, /Do not edit openspec\/changes\/c1\/tasks\.md, acquire or release leases/);
  assert.match(brief.task, /Coordinator notes: focus on parser/);
});

test('a leased-task brief refuses unknown changes, bad ids and non-projects', () => {
  const dir = project();
  assert.throws(() => roles.changeLoopTaskBrief(dir, 'missing', 'T001'), /no Build workspace/);
  assert.throws(() => roles.changeLoopTaskBrief(dir, '../x', 'T001'), /task id/);
  assert.throws(() => roles.changeLoopTaskBrief(dir, 'c1', 'rm -rf'), /task id/);
  assert.throws(() => roles.changeLoopTaskBrief(undefined, 'c1', 'T001'), /Change Loop project/);
});

test('active workers are capped by configuration and the project maxParallelAgents', () => {
  const dir = project({ maxParallelAgents: 3 });
  const settings = roles.projectSettings(dir);
  assert.equal(settings.maxParallelAgents, 3);
  const inProject = [{ cwd: dir }, { cwd: path.join(dir, '.foundation/sandboxes/c1') }, { cwd: dir }];
  assert.throws(() => roles.admitWorker(inProject, { project: dir, projectCap: settings.maxParallelAgents }), /maxParallelAgents/);
  assert.doesNotThrow(() => roles.admitWorker(inProject.slice(0, 2), { project: dir, projectCap: 3 }));
  assert.doesNotThrow(() => roles.admitWorker([{ cwd: os.tmpdir() }, { cwd: os.tmpdir() }, { cwd: os.tmpdir() }], { project: dir, projectCap: 3 }));
  assert.throws(() => roles.admitWorker([{}, {}], { maxActive: 2 }), /maxActiveWorkers/);
  assert.doesNotThrow(() => roles.admitWorker(Array(63).fill({})));
  assert.throws(() => roles.admitWorker(Array(64).fill({})), /64/);
});

test('nested workers keep the root coordinating session', () => {
  const first = roles.parentSessionEnv({ PATH: '/bin' }, 'main-session');
  assert.equal(first.FOUNDATION_PARENT_SESSION_ID, 'main-session');
  const nested = roles.parentSessionEnv(first, 'worker-session');
  assert.equal(nested.FOUNDATION_PARENT_SESSION_ID, 'main-session');
});
