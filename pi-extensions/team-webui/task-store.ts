import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { problem } from './workspace.ts';
import { dependencies, taskGraph, stages } from './task-graph.ts';
import { taskPlan, taskBrief } from './task-planning.ts';

export const taskStatuses = stages;
const activeTaskFilter = "json_extract(data,'$.deletedAt') IS NULL";
const fields = {
  title: 240,
  description: 12000,
  nextStep: 4000,
  blocker: 4000,
  evidence: 12000,
  ownerSessionId: 200,
  ownerName: 200,
};
function clean(input, partial = false) {
  const data: any = {};
  for (const [field, max] of Object.entries(fields)) {
    if (partial && input[field] === undefined) continue;
    const value = input[field] ?? '';
    if (
      typeof value !== 'string' ||
      value.length > max ||
      /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)
    )
      throw problem(400, `Invalid ${field}.`);
    data[field] = value.trim();
  }
  if ((!partial || input.title !== undefined) && !data.title)
    throw problem(400, 'Enter a task title.');
  if (!partial || input.status !== undefined) {
    if (!taskStatuses.includes(input.status ?? 'open'))
      throw problem(400, 'Invalid task status.');
    data.status = input.status ?? 'open';
  }
  if (input.dependsOn !== undefined)
    data.dependsOn = dependencies(input.dependsOn);
  return data;
}
export function createTaskStore(
  root = process.env.PI_TASKS_ROOT ||
    join(
      process.env.PI_CODING_AGENT_DIR || join(homedir(), '.pi/agent'),
      'task-board',
    ),
) {
  const file = join(root, 'tasks.sqlite');
  const use = (fn) => {
    mkdirSync(root, { recursive: true, mode: 0o700 });
    const db = new DatabaseSync(file);
    try {
      chmodSync(file, 0o600);
      db.exec(`PRAGMA busy_timeout=1000; PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY, project TEXT NOT NULL, task_key TEXT NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, updated INTEGER NOT NULL, data TEXT NOT NULL, UNIQUE(project, task_key));
        CREATE INDEX IF NOT EXISTS task_project_status ON tasks(project,status,updated);
        CREATE UNIQUE INDEX IF NOT EXISTS task_workflow_source ON tasks(project,json_extract(data,'$.workflow.sourceKey')) WHERE json_extract(data,'$.workflow.sourceKey') IS NOT NULL;
        CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT NOT NULL, at INTEGER NOT NULL, actor TEXT NOT NULL, data TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS task_events ON events(task_id,seq);`);
      return fn(db);
    } finally {
      db.close();
    }
  };
  const transaction = (operation) =>
    use((db) => {
      db.exec('BEGIN IMMEDIATE');
      try {
        const result = operation(db);
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    });
  const activeTasks = (db, project) =>
    db
      .prepare(`SELECT data FROM tasks WHERE project=? AND ${activeTaskFilter}`)
      .all(project)
      .map((row) => JSON.parse(row.data));
  const requireVersion = (version) => {
    if (!Number.isInteger(version) || version < 1)
      throw problem(400, 'The task version is required.');
  };
  const requireEvidence = (task) => {
    if (
      ['pr', 'merge', 'tag', 'deployed'].includes(task.status) &&
      !task.evidence
    ) {
      throw problem(400, 'Add evidence or a reference for this status.');
    }
  };
  const projectPath = (project) => {
    if (
      typeof project !== 'string' ||
      !project.startsWith('/') ||
      project.includes('\0')
    )
      throw problem(400, 'Choose a project.');
    return resolve(project);
  };
  const get = (db, project, id) => {
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id))
      throw problem(400, 'Invalid task ID.');
    const row = db
      .prepare('SELECT data FROM tasks WHERE project=? AND id=?')
      .get(project, id);
    if (!row) throw problem(404, 'Task not found in this project.');
    return JSON.parse(row.data);
  };
  const event = (db, task, actor, change) =>
    db
      .prepare('INSERT INTO events(task_id,at,actor,data) VALUES(?,?,?,?)')
      .run(
        task.id,
        task.updatedAt,
        String(actor || 'Unknown').slice(0, 300),
        JSON.stringify(change),
      );
  const setDeleted = (project, id, input, actor, deleted) => {
    project = projectPath(project);
    requireVersion(input.version);
    return transaction((db) => {
      const old = get(db, project, id);
      if (old.version !== input.version)
        throw problem(
          409,
          'This task changed. Reload it before deleting or restoring.',
        );
      if (Boolean(old.deletedAt) === deleted) {
        return { task: old, unchanged: true };
      }
      const active = activeTasks(db, project);
      if (deleted) {
        const dependents = active.filter((t) =>
          (t.dependsOn || []).some((e) => e.id === id),
        );
        if (dependents.length)
          throw problem(
            409,
            'Remove dependencies from these tasks first: ' +
              dependents.map((t) => t.title).join(', '),
          );
      }
      const task = { ...old, version: old.version + 1, updatedAt: Date.now() };
      if (!deleted) {
        delete task.deletedAt;
        delete task.deletedBy;
        taskGraph([...active, task]);
      } else {
        task.deletedAt = task.updatedAt;
        task.deletedBy = String(actor || 'Unknown').slice(0, 300);
      }
      db.prepare(
        'UPDATE tasks SET version=?,updated=?,data=? WHERE id=? AND project=?',
      ).run(task.version, task.updatedAt, JSON.stringify(task), id, project);
      event(db, task, actor, {
        action: deleted ? 'deleted' : 'restored',
        from: old.status,
        to: task.status,
        changed: { deleted },
      });
      return { task };
    });
  };
  return {
    delete(project, id, input, actor) {
      return setDeleted(project, id, input, actor, true);
    },
    restore(project, id, input, actor) {
      return setDeleted(project, id, input, actor, false);
    },
    contextSummary(project, sessionId) {
      project = projectPath(project);
      return use((db) => {
        const active = `${activeTaskFilter} AND status!='deployed'`;
        const projectActive = Number(
          db
            .prepare(
              `SELECT count(*) AS n FROM tasks WHERE project=? AND ${active}`,
            )
            .get(project).n,
        );
        const assignedActive = Number(
          db
            .prepare(
              `SELECT count(*) AS n FROM tasks WHERE json_extract(data,'$.ownerSessionId')=? AND ${active}`,
            )
            .get(sessionId).n,
        );
        const rows = db
          .prepare(
            `SELECT data FROM tasks WHERE json_extract(data,'$.ownerSessionId')=? AND ${active} ORDER BY CASE WHEN project=? THEN 0 ELSE 1 END,updated DESC,id LIMIT 3`,
          )
          .all(sessionId, project);
        const tasks = rows.map((row) => {
          const t = JSON.parse(row.data);
          return {
            id: t.id,
            project: t.project === project ? undefined : t.project,
            title: t.title.slice(0, 96),
            status: t.status,
            version: t.version,
            nextStep: t.nextStep.slice(0, 160),
            blocker: t.blocker.slice(0, 120),
          };
        });
        return {
          projectActive,
          assignedActive,
          tasks,
          moreAssigned: Math.max(0, assignedActive - tasks.length),
        };
      });
    },
    cityAssignments() {
      return use((db) =>
        db
          .prepare(
            `SELECT data FROM (SELECT data,ROW_NUMBER() OVER (PARTITION BY json_extract(data,'$.ownerSessionId') ORDER BY CASE WHEN status='deployed' THEN 1 ELSE 0 END,updated DESC,id) AS rank FROM tasks WHERE ${activeTaskFilter} AND json_extract(data,'$.ownerSessionId')!='') WHERE rank=1 LIMIT 512`,
          )
          .all()
          .map((row) => {
            const t = JSON.parse(row.data);
            return {
              id: t.id,
              ownerSessionId: t.ownerSessionId,
              project: t.project,
              title: t.title,
              status: t.status,
              blocker: t.blocker,
              updatedAt: t.updatedAt,
            };
          }),
      );
    },
    plan(project, options: any = {}) {
      return use(db => taskPlan(activeTasks(db, projectPath(project)), options));
    },
    brief(project, id) {
      return use(db => taskBrief(activeTasks(db, projectPath(project)), id, projectPath(project)));
    },
    graph(project) {
      return use((db) =>
        taskGraph(
          db
            .prepare(
              `SELECT data FROM tasks WHERE project=? AND ${activeTaskFilter} ORDER BY updated DESC,id`,
            )
            .all(projectPath(project))
            .map((row) => JSON.parse(row.data)),
        ),
      );
    },
    inbox(sessionId, { offset = 0, limit = 100 }: any = {}) {
      if (
        !Number.isInteger(offset) ||
        offset < 0 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      )
        throw problem(400, 'Invalid inbox query.');
      return use((db) =>
        db
          .prepare(
            `SELECT data FROM tasks WHERE ${activeTaskFilter} AND json_extract(data,'$.ownerSessionId')=? AND status!='deployed' ORDER BY updated DESC,id LIMIT ? OFFSET ?`,
          )
          .all(sessionId, limit, offset)
          .map((row) => {
            const t = JSON.parse(row.data);
            return {
              id: t.id,
              project: t.project,
              title: t.title,
              status: t.status,
              version: t.version,
              nextStep: t.nextStep.slice(0, 400),
            };
          }),
      );
    },
    linked(project) {
      return use((db) =>
        db
          .prepare(
            "SELECT data FROM tasks WHERE project=? AND json_extract(data,'$.workflow.sourceKey') IS NOT NULL",
          )
          .all(projectPath(project))
          .map((row) => JSON.parse(row.data)),
      );
    },
    syncWorkflow(project, source, taskId) {
      project = projectPath(project);
      return transaction((db) => {
        const row = db
          .prepare(
            "SELECT data FROM tasks WHERE project=? AND json_extract(data,'$.workflow.sourceKey')=?",
          )
          .get(project, source.sourceKey);
        const linked = row ? JSON.parse(row.data) : null;
        if (taskId && linked && linked.id !== taskId)
          throw problem(
            409,
            `This Change Loop record is already linked to task ${linked.id}. Reuse that task.`,
          );
        const old = taskId ? get(db, project, taskId) : linked;
        if (old?.deletedAt) {
          return { task: old, changed: false };
        }
        if (old?.workflow && old.workflow.sourceKey !== source.sourceKey)
          throw problem(
            409,
            'This task is already linked to another Change Loop record.',
          );
        if (old?.workflow?.fingerprint === source.fingerprint) {
          return { task: old, changed: false };
        }
        const phases = [
          'investigate',
          'change',
          'build',
          'prove',
          'land',
          'deliver',
        ];
        const backwards =
          old?.workflow &&
          phases.indexOf(source.phase) < phases.indexOf(old.workflow.phase);
        const followStatus =
          !old?.workflow ||
          old.status === old.workflow.boardStatus ||
          backwards;
        const task: any = {
          ...(old || {
            id: randomUUID(),
            project,
            key: 'changeloop:' + source.sourceKey,
            title: source.title,
            description: source.description,
            ownerSessionId: '',
            ownerName: '',
            createdAt: Date.now(),
          }),
          status: source.unavailable
            ? old.status
            : followStatus
              ? source.boardStatus
              : old.status,
          nextStep:
            !old || !old.nextStep || old.nextStep === old.workflow?.nextStep
              ? source.nextStep
              : old.nextStep,
          blocker:
            !old || !old.blocker || old.blocker === old.workflow?.blocker
              ? source.blocker
              : old.blocker,
          evidence:
            !old || !old.evidence || old.evidence === old.workflow?.evidence
              ? source.evidence
              : old.evidence,
          version: (old?.version || 0) + 1,
          updatedAt: Date.now(),
          workflow: { ...source, observedAt: Date.now() },
        };
        if (old)
          db.prepare(
            'UPDATE tasks SET status=?,version=?,updated=?,data=? WHERE id=?',
          ).run(
            task.status,
            task.version,
            task.updatedAt,
            JSON.stringify(task),
            task.id,
          );
        else
          db.prepare(
            'INSERT INTO tasks(id,project,task_key,status,version,updated,data) VALUES(?,?,?,?,?,?,?)',
          ).run(
            task.id,
            project,
            task.key,
            task.status,
            task.version,
            task.updatedAt,
            JSON.stringify(task),
          );
        event(db, task, 'changeloop:sync', {
          action: 'synced',
          from: old?.status,
          to: task.status,
          changed: {
            changeLoop: source.sourceKey,
            phase: source.phase,
            lifecycleStatus: source.lifecycleStatus,
            unavailable: Boolean(source.unavailable),
          },
        });
        return { task, changed: true };
      });
    },
    projects() {
      return use((db) =>
        db
          .prepare(
            'SELECT project, count(*) AS count FROM tasks GROUP BY project ORDER BY project',
          )
          .all(),
      );
    },
    list(
      project,
      {
        status = '',
        search = '',
        offset = 0,
        limit = 200,
        activeOnly = false,
        deleted = false as boolean | string,
      } = {},
    ) {
      project = projectPath(project);
      if (status && !taskStatuses.includes(status))
        throw problem(400, 'Invalid status filter.');
      offset = Number(offset);
      limit = Number(limit);
      if (
        !Number.isInteger(offset) ||
        offset < 0 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 200 ||
        typeof search !== 'string' ||
        search.length > 500
      )
        throw problem(400, 'Invalid task query.');
      return use((db) => {
        if (![true, false, 'true', 'false', '1', '0'].includes(deleted))
          throw problem(400, 'Invalid deleted filter.');
        const params = [project],
          filters = [
            'project=?',
            deleted === true || deleted === 'true' || deleted === '1'
              ? "json_extract(data,'$.deletedAt') IS NOT NULL"
              : activeTaskFilter,
          ];
        if (activeOnly) filters.push("status!='deployed'");
        if (status) {
          filters.push('status=?');
          params.push(status);
        }
        if (search.trim()) {
          filters.push(
            "instr(lower(json_extract(data,'$.title') || ' ' || json_extract(data,'$.description') || ' ' || json_extract(data,'$.ownerName')),lower(?))>0",
          );
          params.push(search.trim());
        }
        const where = filters.join(' AND ');
        const total = Number(
          db
            .prepare(`SELECT count(*) AS count FROM tasks WHERE ${where}`)
            .get(...params).count,
        );
        const tasks = db
          .prepare(
            `SELECT data FROM tasks WHERE ${where} ORDER BY updated DESC,id LIMIT ? OFFSET ?`,
          )
          .all(...params, limit, offset)
          .map((row) => JSON.parse(row.data));
        return {
          project,
          statuses: taskStatuses,
          tasks,
          total,
          offset,
          limit,
          nextOffset:
            offset + tasks.length < total ? offset + tasks.length : null,
        };
      });
    },
    get(project, id) {
      return use((db) => {
        const task = get(db, projectPath(project), id);
        const history = db
          .prepare(
            'SELECT at,actor,data FROM events WHERE task_id=? ORDER BY seq DESC LIMIT 100',
          )
          .all(id)
          .map((e) => ({ at: e.at, actor: e.actor, ...JSON.parse(e.data) }));
        return { task, history };
      });
    },
    create(project, input, actor) {
      project = projectPath(project);
      const data = clean(input),
        key = input.key;
      if (typeof key !== 'string' || !key.trim() || key.length > 200)
        throw problem(400, 'Supply a stable task key for safe retries.');
      requireEvidence(data);
      return transaction((db) => {
        const old = db
          .prepare('SELECT data FROM tasks WHERE project=? AND task_key=?')
          .get(project, key);
        if (old) {
          return { task: JSON.parse(old.data), existing: true };
        }
        const task: any = {
          id: randomUUID(),
          project,
          key,
          ...data,
          version: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        if (task.dependsOn?.length)
          taskGraph([...activeTasks(db, project), task]);
        db.prepare(
          'INSERT INTO tasks(id,project,task_key,status,version,updated,data) VALUES(?,?,?,?,?,?,?)',
        ).run(
          task.id,
          project,
          key,
          task.status,
          task.version,
          task.updatedAt,
          JSON.stringify(task),
        );
        event(db, task, actor, {
          action: 'created',
          to: task.status,
          changed: data,
        });
        return { task, existing: false };
      });
    },
    update(project, id, input, actor) {
      project = projectPath(project);
      requireVersion(input.version);
      const patch = clean(input, true);
      return transaction((db) => {
        const old = get(db, project, id);
        if (old.deletedAt)
          throw problem(409, 'Restore this task before editing it.');
        if (old.version !== input.version)
          throw problem(
            409,
            'This task changed in another session. Reload the task before saving; your draft has been kept.',
          );
        const task: any = {
          ...old,
          ...patch,
          version: old.version + 1,
          updatedAt: Date.now(),
        };
        if (patch.dependsOn !== undefined)
          taskGraph(
            activeTasks(db, project).map((current) =>
              current.id === id ? task : current,
            ),
          );
        requireEvidence(task);
        db.prepare(
          'UPDATE tasks SET status=?,version=?,updated=?,data=? WHERE id=? AND project=?',
        ).run(
          task.status,
          task.version,
          task.updatedAt,
          JSON.stringify(task),
          id,
          project,
        );
        event(db, task, actor, {
          action: 'updated',
          from: old.status,
          to: task.status,
          changed: patch,
        });
        return { task };
      });
    },
  };
}
