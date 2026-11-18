// Reference delivery for the interactive Tasks screen (task 44) and the
// plausible wrong deliveries its oracle must reject.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
}

export function repairTaskBoard(project) {
  write(join(project, "src/tasks.js"), `// The Tasks screen. \`createTaskBoard(root, { load })\` renders into \`root\`;
// \`load()\` resolves to an array of { id, title } or rejects.
const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// The screen's markup for one state; pure, so it is testable without a DOM.
export function renderTaskBoard({ state, tasks = [], error = "" }) {
  const list = state === "loading" ? '<p class="status">Loading tasks…</p>'
    : state === "error" ? '<p class="status">Could not load tasks</p><button type="button" class="retry">Retry</button>'
      : tasks.length ? \`<ul>\${tasks.map((task) => \`<li>\${escape(task.title)}</li>\`).join("")}</ul>\`
        : '<p class="status">No tasks yet</p>';
  return '<main class="tasks"><h1>Tasks</h1>' +
    \`<section class="list" aria-busy="\${state === "loading"}">\${list}</section>\` +
    '<form class="add"><label for="task-title">Task title</label>' +
    '<input id="task-title" name="title" autocomplete="off"><button type="submit">Add</button>' +
    (error ? \`<p role="alert">\${error}</p>\` : "") + "</form></main>";
}

export function createTaskBoard(root, { load } = {}) {
  let tasks = [];
  let state = "loading";
  let error = "";

  function render() {
    root.innerHTML = renderTaskBoard({ state, tasks, error });
    root.querySelector(".retry")?.addEventListener("click", refresh);
    root.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = root.querySelector("#task-title").value.trim();
      if (!title) { error = "Enter a title"; render(); return; }
      error = "";
      tasks = [...tasks, { id: String(Date.now()), title }];
      if (state !== "error") state = "loaded";
      render();
    });
  }

  function refresh() {
    state = "loading";
    render();
    load().then((rows) => { tasks = rows; state = "loaded"; render(); },
      () => { state = "error"; render(); });
  }

  refresh();
  return { refresh };
}
`);
  write(join(project, "styles.css"), `body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  background: #f3f4f6; color: #111827; }
.tasks { max-width: 640px; margin: 32px auto; padding: 0 16px; }
.add { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.add input { flex: 1 1 160px; min-width: 0; padding: 8px; }
[role="alert"] { flex-basis: 100%; color: #b91c1c; margin: 0; }
`);
  write(join(project, "test/tasks.test.mjs"), `import assert from "node:assert/strict";
import test from "node:test";
import { renderTaskBoard } from "../src/tasks.js";

test("each state renders its message", () => {
  assert.match(renderTaskBoard({ state: "loading" }), /aria-busy="true"[^]*Loading tasks/);
  assert.match(renderTaskBoard({ state: "loaded", tasks: [] }), /No tasks yet/);
  assert.match(renderTaskBoard({ state: "error" }), /Could not load tasks[^]*Retry/);
});

test("tasks render as list items and an error as an alert", () => {
  assert.match(renderTaskBoard({ state: "loaded", tasks: [{ id: "1", title: "A & B" }] }), /<li>A &amp; B<\\/li>/);
  assert.match(renderTaskBoard({ state: "loaded", error: "Enter a title" }), /role="alert">Enter a title/);
});
`);
}

// [failing case id, label, [[before, after], ...]] edits of src/tasks.js.
export const TASK_BOARD_MUTANTS = [
  ["CASE_LOADING", "no busy marker while loading",
    [['aria-busy="${state === "loading"}"', 'aria-busy="false"']]],
  ["CASE_EMPTY", "empty list shows nothing",
    [["'<p class=\"status\">No tasks yet</p>'", "''"]]],
  ["CASE_ERROR_RETRY", "retry button does nothing",
    [['root.querySelector(".retry")?.addEventListener("click", refresh);', ""]]],
  ["CASE_EMPTY_TITLE_REFUSED", "empty title is added",
    [['if (!title) { error = "Enter a title"; render(); return; }', ""]]],
  ["CASE_ADD_TASK", "the input keeps the added title",
    [["error = \"\";\n      tasks = [...tasks", "error = \"\";\n      const keep = root.querySelector(\"#task-title\").value;\n      tasks = [...tasks"],
     ["if (state !== \"error\") state = \"loaded\";\n      render();", "if (state !== \"error\") state = \"loaded\";\n      render();\n      root.querySelector(\"#task-title\").value = keep;"]]],
  ["CASE_ADD_TASK", "added task goes first",
    [["tasks = [...tasks, { id: String(Date.now()), title }];", "tasks = [{ id: String(Date.now()), title }, ...tasks];"]]],
  ["CASE_ADD_TASK", "input has no accessible label",
    [['<label for="task-title">Task title</label>', ""]]],
  ["CASE_HEADING", "wrong heading",
    [["<h1>Tasks</h1>", "<h1>To-do</h1>"]]]
];
