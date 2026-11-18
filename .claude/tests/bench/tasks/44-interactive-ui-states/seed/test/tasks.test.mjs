import assert from "node:assert/strict";
import test from "node:test";

import { createTaskBoard } from "../src/tasks.js";

test("createTaskBoard renders the tasks root element", () => {
  const root = { innerHTML: "" };
  createTaskBoard(root, { load: async () => [] });
  assert.match(root.innerHTML, /<main class="tasks">/);
});
