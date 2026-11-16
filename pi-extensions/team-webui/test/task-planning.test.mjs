import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTaskStore } from '../task-store.ts';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'pi-plan-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const store = createTaskStore(root);
  return { store, root, add: (key, fields = {}) => store.create('/project', { key, title: key, ...fields }).task };
}

test('plan respects explicit blockers, threshold regressions, owner scope and completed tasks', t => {
  const { store, add } = fixture(t);
  const a = add('Design', { ownerSessionId: 'designer', status: 'review' });
  const b = add('Build', { ownerSessionId: 'builder', dependsOn: [{ id: a.id, status: 'review' }] });
  const c = add('Blocked', { ownerSessionId: 'builder', blocker: 'Waiting for user' });
  add('Done', { status: 'deployed', evidence: 'deployment-reference' });
  let plan = store.plan('/project', { ownerSessionId: 'builder' });
  assert.deepEqual(plan.counts, { pending: 2, ready: 1, blocked: 1, deployed: 0 });
  assert.equal(plan.tasks.find(x => x.id === b.id).ready, true);
  assert.equal(plan.tasks.find(x => x.id === c.id).ready, false);
  store.update('/project', a.id, { version: a.version, status: 'build' });
  plan = store.plan('/project', { ownerSessionId: 'builder' });
  assert.equal(plan.counts.ready, 0);
  assert.equal(plan.tasks.find(x => x.id === b.id).blockedBy[0].id, a.id);
  assert.equal(store.plan('/project').counts.deployed, 1);
});

test('plan identifies chain, independent work and fan-in without creating workers or changing cards', t => {
  const { store, root, add } = fixture(t);
  assert.equal(store.plan('/project').topology, 'empty');
  const a = add('A');
  assert.equal(store.plan('/project').topology, 'single');
  const b = add('B', { dependsOn: [{ id: a.id, status: 'review' }] });
  assert.equal(store.plan('/project').topology, 'sequential');
  const c = add('C');
  assert.equal(store.plan('/project').topology, 'parallel');
  add('D', { dependsOn: [{ id: b.id, status: 'review' }, { id: c.id, status: 'review' }] });
  const before = store.get('/project', a.id);
  assert.equal(store.plan('/project').topology, 'dag');
  assert.equal(store.plan('/project').execution, 'advisory-only');
  assert.deepEqual(createTaskStore(root).get('/project', a.id), before);
});

test('plan paginates, excludes trash and isolates projects', t => {
  const { store, add } = fixture(t);
  for (let i = 0; i < 23; i++) add(`task-${i}`);
  const trash = add('trash');
  store.delete('/project', trash.id, { version: 1 });
  store.create('/other', { key: 'secret', title: 'Other project' });
  const first = store.plan('/project'), second = store.plan('/project', { offset: first.nextOffset });
  assert.equal(first.tasks.length, 20);
  assert.equal(second.tasks.length, 3);
  assert.equal(second.nextOffset, null);
  assert.equal(new Set([...first.tasks, ...second.tasks].map(x => x.id)).size, 23);
  assert.throws(() => store.plan('/project', { limit: 41 }), /limit/);
  assert.throws(() => store.plan('/project', { offset: -1 }), /offset/);
});

test('brief is durable and bounded, retains blockers and flags omitted text', t => {
  const { store, root, add } = fixture(t);
  const dependencies = Array.from({ length: 5 }, (_, i) => add(`prerequisite-${i}`));
  const task = add('Handoff', {
    description: 'c'.repeat(4000), nextStep: 's'.repeat(2000), evidence: 'e'.repeat(4000), blocker: 'b'.repeat(1000),
    dependsOn: dependencies.map(t => ({ id: t.id, status: 'review' })), ownerSessionId: 'existing-session',
  });
  const brief = createTaskStore(root).brief('/project', task.id);
  assert.equal(brief.context.length, 1200);
  assert.equal(brief.nextStep.length, 600);
  assert.equal(brief.evidence.length, 1200);
  assert.equal(brief.blockedBy.length, 3);
  assert.equal(brief.moreBlockers, 2);
  assert.equal(brief.ready, false);
  assert.deepEqual(brief.truncatedFields, ['description', 'nextStep', 'blocker', 'evidence']);
  assert.equal(brief.ownerSessionId, 'existing-session');
  assert.equal(brief.version, 1);
  assert.throws(() => store.brief('/other', task.id), /not found/);
  store.delete('/project', task.id, { version: 1 });
  assert.throws(() => store.brief('/project', task.id), /not found/);
});
