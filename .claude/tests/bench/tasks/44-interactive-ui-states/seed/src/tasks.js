// The Tasks screen. `createTaskBoard(root, { load })` renders into `root`;
// `load()` resolves to an array of { id, title } or rejects.
export function createTaskBoard(root, { load } = {}) {
  void load;
  root.innerHTML = '<main class="tasks"><p class="placeholder">The tasks screen has not been built yet.</p></main>';
  return {};
}
