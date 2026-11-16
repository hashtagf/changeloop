const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const labels = {
  open: 'Open',
  plan: 'Plan',
  design: 'Design',
  build: 'Build',
  verify: 'Verify',
  review: 'Review',
  pr: 'PR',
  merge: 'Merge',
  tag: 'Tag',
  deployed: 'Deployed',
};
export function createTaskBoard({ api, catalog, preferredProject, toast }) {
  let visible = false,
    project = localStorage.getItem('pi-task-project') || '',
    statuses = Object.keys(labels),
    projects = [],
    data,
    offset = 0,
    generation = 0,
    polling = false,
    fingerprint = '',
    editing,
    saving = false,
    dirty = false,
    drag,
    graphData,
    graphMode = false,
    trashMode = false,
    dialogRequest = 0,
    loadingTask = false;
  const root = el('section', 'task-board');
  root.id = 'task-board';
  root.hidden = true;
  root.setAttribute('aria-label', 'Project task board');
  root.innerHTML = `<div class="task-heading"><div><div class="eyebrow">PROJECT WORK</div><h1>Project tasks</h1><p>Shared across sessions · Record the next step before you leave.</p></div><button id="task-add" class="primary" disabled>+ New task</button></div>
    <div class="task-filters"><label>Project<select id="task-project"></select></label><label class="task-search">Search<input id="task-search" type="search" placeholder="Title, description or owner…"></label><label>Status<select id="task-filter"><option value="">All statuses</option></select></label><button id="task-trash-toggle" aria-pressed="false">Trash</button><button id="task-refresh">Refresh</button><button id="task-graph-toggle" aria-pressed="false">Dependency graph</button></div>
    <div id="task-feedback" role="status" class="task-feedback"></div><div id="task-columns" class="task-columns" tabindex="0" aria-label="Kanban columns; scroll horizontally"></div>
    <div id="task-graph" class="task-graph" hidden></div><div class="task-footer"><span id="task-count"></span><div><button id="task-prev">Previous</button><button id="task-next">Next</button></div></div>
    <p class="task-note">Moving a card records status. It does not create a PR, merge code, tag a release or deploy.</p>`;
  document.getElementById('banner').after(root);
  const $ = (id) => root.querySelector('#' + id);
  const dialog = el('dialog', 'task-dialog');
  dialog.id = 'task-dialog';
  dialog.setAttribute('aria-labelledby', 'task-dialog-title');
  dialog.innerHTML = `<form id="task-form"><div class="task-dialog-heading"><h2 id="task-dialog-title">New task</h2><button type="button" id="task-close" aria-label="Close task">×</button></div>
    <div id="task-edit-error" class="task-error" role="alert"></div><p id="task-workflow" class="task-note"></p>
    <label>Title<input name="title" maxlength="240" required></label><div class="task-form-row"><label>Status<select name="status"></select></label><label>Owner session<select name="ownerSessionId"></select></label></div>
    <details><summary>Dependencies · required milestones</summary><div id="task-dependencies"></div></details><button type="button" id="task-handoff">Hand off to selected session</button><label>Description<textarea name="description" rows="3" maxlength="12000"></textarea></label>
    <label>Next step<textarea name="nextStep" rows="2" maxlength="4000" placeholder="What should the next session do?"></textarea></label>
    <label>Blocker<textarea name="blocker" rows="2" maxlength="4000" placeholder="Waiting for an answer, dependency or decision…"></textarea></label>
    <label>Evidence / references<textarea name="evidence" rows="2" maxlength="12000" placeholder="Test results, PR URL, commit, release tag or deployment reference"></textarea></label>
    <div class="task-save-row"><small id="task-version">Draft</small><button id="task-reload" type="button">Reload latest</button><button id="task-delete" type="button">Move to trash</button><button id="task-save" class="primary" type="submit">Save task</button></div>
    <details><summary>Change history</summary><ol id="task-history"></ol></details></form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form'),
    f = (name) => form.elements.namedItem(name),
    error = dialog.querySelector('#task-edit-error');
  const feedback = (message, failed = false) => {
    $('task-feedback').textContent = message;
    $('task-feedback').classList.toggle('task-error', failed);
  };
  const query = (extra) =>
    '/api/tasks?' + new URLSearchParams({ project, ...extra });
  const option = (value, text) => {
    const o = el('option', '', text);
    o.value = value;
    return o;
  };
  const draftKey = () =>
    'pi-task-draft:' + editing.project + ':' + (editing.id || 'new');
  const formValue = () => {
    const value = Object.fromEntries(
      [
        'title',
        'status',
        'ownerSessionId',
        'description',
        'nextStep',
        'blocker',
        'evidence',
      ].map((name) => [name, f(name).value]),
    );
    value.dependsOn = [
      ...dialog.querySelectorAll('[data-dependency-id]:checked'),
    ].map((n) => ({
      id: n.dataset.dependencyId,
      status: n.parentElement.querySelector('select').value,
    }));
    value.ownerName =
      f('ownerSessionId').selectedOptions[0]?.dataset.name || '';
    return value;
  };
  const saveDraft = () => {
    if (editing && dirty && !saving)
      sessionStorage.setItem(
        draftKey(),
        JSON.stringify({ ...editing, ...formValue() }),
      );
  };
  const changed = () => {
    dirty = true;
    saveDraft();
  };
  form.addEventListener('input', changed);
  form.addEventListener('change', changed);
  function syncDialogControls() {
    const busy = saving || loadingTask;
    const deleted = Boolean(editing?.deletedAt);
    for (const input of form.querySelectorAll('input,textarea,select'))
      input.disabled = busy || deleted;
    for (const id of [
      'task-close',
      'task-delete',
      'task-reload',
      'task-handoff',
      'task-save',
    ]) {
      dialog.querySelector('#' + id).disabled = busy;
    }
    dialog.querySelector('#task-save').disabled = busy || deleted;
    dialog.querySelector('#task-handoff').disabled =
      busy || deleted || !editing?.id;
    dialog.querySelector('#task-reload').disabled = busy || !editing?.id;
    dialog.querySelector('#task-delete').hidden = !editing?.id;
    dialog.querySelector('#task-delete').textContent = deleted
      ? 'Restore task'
      : 'Move to trash';
    dialog.setAttribute('aria-busy', String(busy));
  }
  function closeTask() {
    dialogRequest++;
    loadingTask = false;
    dialog.close();
    syncDialogControls();
  }
  dialog.querySelector('#task-close').onclick = () => {
    if (!saving) {
      saveDraft();
      closeTask();
    }
  };
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (!saving) {
      saveDraft();
      closeTask();
    }
  });
  async function openTask(task, newStatus) {
    if (saving) return;
    const requestId = ++dialogRequest,
      taskProject = project;
    loadingTask = true;
    syncDialogControls();
    try {
      // Do not publish partial form state: a later selection owns the dialog.
      const [result, graph] = await Promise.all([
        task?.id
          ? api(
              '/api/tasks?' +
                new URLSearchParams({ project: taskProject, id: task.id }),
            )
          : Promise.resolve({ task, history: [] }),
        api(
          '/api/tasks?' +
            new URLSearchParams({ project: taskProject, graph: '1' }),
        ),
      ]);
      if (requestId !== dialogRequest || taskProject !== project || !visible)
        return;
      task = result.task;
      const history = result.history;
      editing = task || {
        project,
        key: crypto.randomUUID(),
        status: 'open',
        version: undefined,
      };
      let draft;
      try {
        draft = JSON.parse(sessionStorage.getItem(draftKey()) || 'null');
      } catch {}
      if (draft && !task?.deletedAt) editing = draft; // Preserve the draft's base version so conflicts cannot overwrite newer work.
      if (newStatus) editing = { ...editing, status: newStatus };
      dirty = !task?.deletedAt && Boolean(draft || newStatus);
      dialog.querySelector('#task-dialog-title').textContent = task
        ? 'Task details'
        : 'New task';
      error.textContent =
        draft && !task?.deletedAt
          ? 'Your unsaved draft was restored. Save it or use Reload latest.'
          : '';
      f('status').replaceChildren(
        ...statuses.map((s) => option(s, labels[s] || s)),
      );
      const owners = catalog();
      const ownerOptions = [
        option('', 'Unassigned'),
        ...owners.map((s) => {
          const o = option(
            s.id,
            (s.sessionName || s.id.slice(0, 8)) +
              (s.online ? '' : ' · offline'),
          );
          o.dataset.name = s.sessionName || s.id.slice(0, 8);
          return o;
        }),
      ];
      if (
        editing.ownerSessionId &&
        !owners.some((s) => s.id === editing.ownerSessionId)
      ) {
        const o = option(
          editing.ownerSessionId,
          (editing.ownerName || editing.ownerSessionId) + ' · saved',
        );
        o.dataset.name = editing.ownerName;
        ownerOptions.push(o);
      }
      f('ownerSessionId').replaceChildren(...ownerOptions);
      const dependencies = dialog.querySelector('#task-dependencies');
      dependencies.replaceChildren();
      dependencies.parentElement.open = false;
      for (const node of graph.nodes.filter((n) => n.id !== editing.id)) {
        const label = el('label', 'task-dependency'),
          check = el('input'),
          select = el('select');
        check.type = 'checkbox';
        check.dataset.dependencyId = node.id;
        const edge = (editing.dependsOn || []).find((e) => e.id === node.id);
        check.checked = Boolean(edge);
        select.append(...statuses.map((s) => option(s, labels[s])));
        select.value = edge?.status || 'review';
        select.setAttribute('aria-label', 'Required status for ' + node.title);
        label.append(
          check,
          el(
            'span',
            '',
            node.title + ' · ' + (labels[node.status] || node.status),
          ),
          select,
        );
        dependencies.append(label);
      }
      for (const name of [
        'title',
        'status',
        'ownerSessionId',
        'description',
        'nextStep',
        'blocker',
        'evidence',
      ])
        f(name).value = editing[name] || (name === 'status' ? 'open' : '');
      dialog.querySelector('#task-version').textContent = editing.id
        ? `Version ${editing.version} · ${editing.id.slice(0, 8)}`
        : 'Draft · saved after you submit';
      const workflow = task?.workflow;
      dialog.querySelector('#task-workflow').textContent = workflow
        ? `Change Loop · ${workflow.phase} · ${workflow.lifecycleStatus}${workflow.unavailable ? ' · source unavailable; last known phase' : ''}\n${workflow.changeId}\nPhase follows local records. Moving this card does not run workflow commands.`
        : '';
      const list = dialog.querySelector('#task-history');
      list.replaceChildren();
      for (const entry of history) {
        const item = el('li');
        item.append(
          el(
            'strong',
            '',
            `${entry.action === 'deleted' ? 'Moved to trash · ' : entry.action === 'restored' ? 'Restored · ' : ''}${entry.from ? labels[entry.from] + ' → ' : ''}${labels[entry.to] || entry.to}`,
          ),
          el(
            'small',
            '',
            ` ${entry.actor} · ${new Date(entry.at).toLocaleString()}`,
          ),
        );
        item.append(
          el(
            'p',
            '',
            Object.entries(entry.changed || {})
              .map(([k, v]) => `${k}: ${v || '—'}`)
              .join('\n'),
          ),
        );
        list.append(item);
      }
      if (!history.length)
        list.append(el('li', '', 'No changes recorded yet.'));
      if (!dialog.open) dialog.showModal();
    } catch (e) {
      if (requestId === dialogRequest && taskProject === project) throw e;
    } finally {
      if (requestId === dialogRequest) {
        loadingTask = false;
        syncDialogControls();
        if (dialog.open)
          (editing?.deletedAt
            ? dialog.querySelector('#task-delete')
            : f('title')
          ).focus();
      }
    }
  }
  async function mutateTask(action, fields = {}, message = 'Task saved.') {
    if (saving || loadingTask || !editing) return;
    saveDraft();
    const storageKey = draftKey();
    const payload = {
      action,
      project: editing.project,
      id: editing.id,
      key: editing.key,
      version: editing.version,
      ...fields,
    };
    saving = true;
    error.textContent = '';
    syncDialogControls();
    try {
      await api('/api/tasks', payload);
      sessionStorage.removeItem(storageKey);
      dirty = false;
      closeTask();
      toast(message);
      await safe(() => refresh());
    } catch (e) {
      error.textContent = e.message;
    } finally {
      saving = false;
      syncDialogControls();
    }
  }
  dialog.querySelector('#task-delete').onclick = () => {
    if (saving || loadingTask || !editing?.id) return;
    const action = editing.deletedAt ? 'restore' : 'delete';
    if (
      action === 'delete' &&
      !confirm(
        'Move "' +
          editing.title +
          '" to trash? History is kept and the task can be restored.',
      )
    )
      return;
    return mutateTask(
      action,
      {},
      action === 'delete' ? 'Task moved to trash.' : 'Task restored.',
    );
  };
  dialog.querySelector('#task-handoff').onclick = () => {
    if (!editing?.id || editing.deletedAt || saving || loadingTask) return;
    return mutateTask(
      'handoff',
      formValue(),
      'Task assigned. Tell the recipient to open their task inbox.',
    );
  };
  dialog.querySelector('#task-reload').onclick = () => {
    if (saving || loadingTask || !editing?.id) return;
    if (!confirm('Discard this unsaved draft and load the latest task?'))
      return;
    sessionStorage.removeItem(draftKey());
    void safe(() => openTask({ id: editing.id }));
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (saving || loadingTask || !editing || editing.deletedAt) return;
    void mutateTask(editing.id ? 'update' : 'create', formValue());
  });
  async function safe(fn) {
    try {
      await fn();
    } catch (e) {
      feedback(e.message, true);
    }
  }
  function drawEdges() {
    const layers = $('task-graph').querySelector('.task-graph-layers');
    if (!visible || !graphMode || !layers || !graphData) return;
    layers.querySelector('svg')?.remove();
    const ns = 'http://www.w3.org/2000/svg',
      svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'task-graph-edges');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', String(layers.scrollWidth));
    svg.setAttribute('height', String(layers.scrollHeight));
    const bounds = layers.getBoundingClientRect(),
      cards = new Map(
        [...layers.querySelectorAll('[data-graph-task-id]')].map((n) => [
          n.dataset.graphTaskId,
          n,
        ]),
      );
    for (const edge of graphData.edges) {
      const from = cards.get(edge.from)?.getBoundingClientRect(),
        to = cards.get(edge.to)?.getBoundingClientRect();
      if (!from || !to) continue;
      const x1 = from.right - bounds.left,
        y1 = (from.top + from.bottom) / 2 - bounds.top,
        x2 = to.left - bounds.left,
        y2 = (to.top + to.bottom) / 2 - bounds.top,
        mid = (x1 + x2) / 2;
      const path = document.createElementNS(ns, 'path');
      path.setAttribute(
        'd',
        `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2} M${x2 - 6},${y2 - 4} L${x2},${y2} L${x2 - 6},${y2 + 4}`,
      );
      svg.append(path);
    }
    layers.prepend(svg);
  }
  window.addEventListener('resize', () => requestAnimationFrame(drawEdges));
  function render() {
    const next = JSON.stringify([
      data,
      graphData,
      graphMode,
      trashMode,
      $('task-filter').value,
    ]);
    if (next === fingerprint) return;
    fingerprint = next;
    const board = $('task-columns'),
      left = board.scrollLeft;
    const focused = document.activeElement?.dataset.taskId;
    const columns = (
      $('task-filter').value ? [$('task-filter').value] : statuses
    ).map((status) => {
      const col = el('section', 'task-column');
      col.dataset.status = status;
      col.setAttribute('aria-label', labels[status]);
      const cards = data.tasks.filter((t) => t.status === status),
        head = el('div', 'task-column-head');
      head.append(
        el('h2', '', labels[status]),
        el('span', '', String(cards.length)),
      );
      col.append(head);
      for (const task of cards) {
        const card = el('button', 'task-card');
        card.type = 'button';
        card.dataset.taskId = task.id;
        card.draggable = !trashMode;
        card.append(
          el('small', 'task-card-id', task.id.slice(0, 8)),
          el('strong', '', task.title),
        );
        if (task.workflow)
          card.append(
            el(
              'span',
              'task-workflow',
              `Change Loop · ${task.workflow.phase}${task.workflow.unavailable ? ' · unavailable' : ''}`,
            ),
          );
        const node = graphData?.nodes.find((n) => n.id === task.id);
        if (node?.blockedBy.length)
          card.append(
            el(
              'span',
              'task-blocked',
              `Waiting for ${node.blockedBy.length} dependencies`,
            ),
          );
        if (task.nextStep) card.append(el('p', '', task.nextStep));
        if (task.blocker)
          card.append(el('span', 'task-blocked', 'Blocked · ' + task.blocker));
        card.append(el('span', 'task-owner', task.ownerName || 'Unassigned'));
        card.onclick = () => void safe(() => openTask(task));
        card.ondragstart = (event) => {
          drag = task;
          event.dataTransfer.setData('text/plain', task.id);
          event.dataTransfer.effectAllowed = 'move';
        };
        card.ondragend = () => {
          drag = undefined;
          root
            .querySelectorAll('.drop-target')
            .forEach((n) => n.classList.remove('drop-target'));
        };
        col.append(card);
      }
      if (!cards.length)
        col.append(el('p', 'task-stage-empty', 'No tasks in this stage'));
      col.ondragover = (event) => {
        if (drag) {
          event.preventDefault();
          col.classList.add('drop-target');
        }
      };
      col.ondragleave = (event) => {
        if (!col.contains(event.relatedTarget))
          col.classList.remove('drop-target');
      };
      col.ondrop = (event) => {
        event.preventDefault();
        col.classList.remove('drop-target');
        const task = drag;
        drag = undefined;
        if (!task || task.status === status) return;
        void safe(async () => {
          if (['pr', 'merge', 'tag', 'deployed'].includes(status)) {
            await openTask(task, status);
            return;
          }
          await api('/api/tasks', {
            action: 'update',
            project,
            id: task.id,
            version: task.version,
            status,
          });
          toast(`Moved to ${labels[status]}.`);
          await refresh();
        });
      };
      return col;
    });
    const graph = $('task-graph');
    graph.replaceChildren();
    graph.hidden = !graphMode;
    board.hidden = graphMode;
    if (graphMode && graphData) {
      const byId = new Map(graphData.nodes.map((n) => [n.id, n]));
      graph.append(
        el(
          'p',
          'task-note',
          'Prerequisite → dependent task · Each edge requires the displayed milestone. Click a node for details.',
        ),
      );
      const layers = el('div', 'task-graph-layers');
      for (const [i, ids] of graphData.layers.entries()) {
        const layer = el('section', 'task-graph-layer');
        layer.append(el('h2', '', `Step ${i + 1}`));
        for (const id of ids) {
          const node = byId.get(id),
            card = el('button', 'task-card');
          card.type = 'button';
          card.dataset.graphTaskId = id;
          card.append(
            el('strong', '', node.title),
            el(
              'span',
              'task-owner',
              `${labels[node.status]} · ${node.ownerName || 'Unassigned'}`,
            ),
          );
          for (const edge of node.dependsOn)
            card.append(
              el(
                'p',
                '',
                `${byId.get(edge.id).title} → this task · requires ${labels[edge.status]}`,
              ),
            );
          card.append(
            el(
              'span',
              node.blockedBy.length ? 'task-blocked' : 'task-workflow',
              node.blockedBy.length
                ? `Waiting for ${node.blockedBy.length} prerequisites`
                : 'Dependencies ready',
            ),
          );
          card.onclick = () => void safe(() => openTask({ id }));
          layer.append(card);
        }
        layers.append(layer);
      }
      graph.append(layers);
      requestAnimationFrame(drawEdges);
    }
    board.replaceChildren(...columns);
    board.scrollLeft = left;
    if (focused)
      [...board.querySelectorAll('[data-task-id]')]
        .find((n) => n.dataset.taskId === focused)
        ?.focus({ preventScroll: true });
    $('task-count').textContent = data.total
      ? `${data.offset + 1}–${data.offset + data.tasks.length} of ${data.total} tasks`
      : 'No tasks yet';
    $('task-prev').disabled = !offset;
    $('task-next').disabled = data.nextOffset === null;
  }
  async function refresh(initial = false) {
    const token = ++generation;
    if (initial) feedback('Loading tasks…');
    const info = await api('/api/tasks/projects');
    if (token !== generation) return;
    projects = info.projects;
    statuses = info.statuses;
    if (!projects.some((p) => p.root === project))
      project =
        projects.find((p) => p.root === preferredProject())?.root ||
        projects[0]?.root ||
        '';
    const fingerprintProjects = JSON.stringify(
      projects.map((p) => [p.root, p.name]),
    );
    if ($('task-project').dataset.signature !== fingerprintProjects) {
      $('task-project').replaceChildren(
        ...projects.map((p) => option(p.root, p.name + ' · ' + p.root)),
      );
      $('task-project').dataset.signature = fingerprintProjects;
    }
    $('task-project').value = project;
    $('task-add').disabled = !project || trashMode;
    if (!project) {
      feedback('No projects yet. Open a Pi session to add its project.');
      $('task-columns').replaceChildren();
      return;
    }
    const response = await api(
      query({
        offset,
        search: $('task-search').value,
        status: $('task-filter').value,
        deleted: String(trashMode),
      }),
    );
    if (token !== generation) return;
    graphData = await api(query({ graph: '1' }));
    if (token !== generation) return;
    data = response;
    const warnings = data.changeLoop?.warnings || [];
    feedback(
      warnings.length
        ? warnings.join(' · ')
        : data.total
          ? 'Saved on this machine · shared across sessions'
          : 'No matching tasks. Create a task or adjust your filters.',
      warnings.length > 0,
    );
    render();
  }
  $('task-filter').append(...statuses.map((s) => option(s, labels[s])));
  $('task-project').onchange = () => {
    project = $('task-project').value;
    localStorage.setItem('pi-task-project', project);
    offset = 0;
    void safe(() => refresh(true));
  };
  $('task-filter').onchange = () => {
    offset = 0;
    void safe(() => refresh(true));
  };
  let searchTimer;
  $('task-search').oninput = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      offset = 0;
      void safe(() => refresh(true));
    }, 250);
  };
  $('task-graph-toggle').onclick = () => {
    graphMode = !graphMode;
    $('task-graph-toggle').setAttribute('aria-pressed', String(graphMode));
    if (data) render();
  };
  $('task-trash-toggle').onclick = () => {
    trashMode = !trashMode;
    offset = 0;
    graphMode = false;
    $('task-trash-toggle').setAttribute('aria-pressed', String(trashMode));
    $('task-graph-toggle').setAttribute('aria-pressed', 'false');
    $('task-graph-toggle').disabled = trashMode;
    root.querySelector('h1').textContent = trashMode
      ? 'Deleted tasks'
      : 'Project tasks';
    void safe(() => refresh(true));
  };
  $('task-refresh').onclick = () => void safe(() => refresh(true));
  $('task-add').onclick = () => void safe(() => openTask());
  $('task-prev').onclick = () => {
    offset = Math.max(0, offset - 200);
    void safe(() => refresh(true));
  };
  $('task-next').onclick = () => {
    offset = data.nextOffset;
    void safe(() => refresh(true));
  };
  setInterval(() => {
    if (visible && !document.hidden && !polling && !dialog.open) {
      polling = true;
      void safe(() => refresh()).finally(() => {
        polling = false;
      });
    }
  }, 5000);
  return {
    setVisible(value) {
      const changed = visible !== value;
      visible = value;
      root.hidden = !value;
      if (!value && !saving) closeTask();
      if (value && changed) void safe(() => refresh(true));
    },
  };
}
