# Tasks screen

Build the Tasks screen. `createTaskBoard(root, { load })` in `src/tasks.js`
renders into the DOM element `root`; `load()` returns a promise of an array of
`{ id, title }` (it may reject). `src/main.js` already mounts it into
`index.html` with a sample loader.

The screen has a heading "Tasks" and shows one of these states:

- **Loading** while `load()` is pending: the text "Loading tasks…", and the
  list region has `aria-busy="true"`.
- **Empty** when it resolves to `[]`: "No tasks yet".
- **Error** when it rejects: "Could not load tasks" and a "Retry" button that
  calls `load()` again and shows the result.
- **Loaded**: each task title as an item of a list (`<ul>`/`<li>`).

Below the list, a form adds a task: a text input labelled "Task title" and an
"Add" button. Submitting an empty or whitespace-only title adds nothing and
shows "Enter a title" in an element with `role="alert"`; a valid title is
added to the end of the list, the input is cleared, and the alert disappears.
Adding works from the loaded and the empty state.

The screen must work at phone width (390px): nothing wider than the screen.
Styles live in `styles.css`.

`npm run screenshot` (`node scripts/screenshot.mjs`) serves the project and
writes `test-results/tasks-desktop.png` and `test-results/tasks-phone.png` with
headless Chromium; set `CHROME_PATH` if no browser is found. `npm test` runs
the unit tests.
