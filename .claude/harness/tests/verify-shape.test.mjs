import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyRunsBehavior, verifySegmentKind, verifyShapeIssues
} from "../runtime/workflow/validation/verify-shape.mjs";
import { amendmentVerifyShapeIssues } from "../runtime/workflow/draft/semantic-amendment.mjs";

// A product task is ticked by its verify, so that verify must run tests.

const task = (verify, paths = ["src/**"]) => ({ semanticKey: "implement", verify, paths });
const feature = { workTypes: ["feature"] };

test("verify-runs-tests-noop: a no-op verify on a product task is an EDIT", () => {
  for (const verify of ["true", ":", "exit 0", "echo ok", "printf done", "cd src && true"]) {
    const issues = verifyShapeIssues([task(verify)], feature);
    assert.equal(issues.length, 1, verify);
    assert.match(issues[0], /task 'implement' edits product code but its verify .* runs no test/);
  }
  assert.equal(verifySegmentKind("exit 0"), "no-op");
});

test("verify-runs-tests-lint-only: lint, format, and typecheck commands are an EDIT", () => {
  for (const verify of ["npm run lint", "npx eslint src", "tsc --noEmit", "ruff check .",
    "npm run lint && npm run typecheck", "go vet ./...", "cargo clippy"]) {
    assert.equal(verifyShapeIssues([task(verify)], feature).length, 1, verify);
  }
  assert.equal(verifySegmentKind("pnpm run format:check"), "check-only");
});

test("verify-runs-tests-test-file: a verify naming a test file passes", () => {
  assert.deepEqual(verifyShapeIssues([task("node --test tests/config.test.mjs")], feature), []);
  assert.deepEqual(verifyShapeIssues([task("npm run lint && node --test tests/config.test.mjs")], feature), []);
  assert.equal(verifyRunsBehavior("CI=1 npx vitest run tests/unit/card.spec.js"), true);
});

test("verify-runs-tests-runner: a test runner or project command passes", () => {
  for (const verify of ["npm test", "pytest -q", "go test ./...", "cd web && npm test", "make check",
    "sh scripts/check.sh"]) {
    assert.deepEqual(verifyShapeIssues([task(verify)], feature), [], verify);
  }
});

test("verify-runs-tests-docs-task: tasks without product paths and neutral work are exempt", () => {
  assert.deepEqual(verifyShapeIssues([task("npm run lint:docs", ["docs/**", "README.md"])], feature), []);
  assert.deepEqual(verifyShapeIssues([task("true", ["tests/a.test.mjs"])], feature), []);
  assert.deepEqual(verifyShapeIssues([task("npm run lint")], { workTypes: ["refactor"] }), []);
  assert.deepEqual(verifyShapeIssues([task("true", [])], feature), []);
});

test("verify-runs-tests-amend-noop: an amendment that sets a product verify to echo is an EDIT", () => {
  const tasks = "- [ ] **T001** Implement [key:implement] [paths:src/**] — verify: `npm test`\n";
  const issues = amendmentVerifyShapeIssues({ updateTasks: [{ key: "implement", verify: "echo ok" }] },
    tasks, feature);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /amendment task 'implement' edits product code/);
  assert.deepEqual(amendmentVerifyShapeIssues({ updateTasks: [{ key: "implement", verify: "npm test" }] },
    tasks, feature), []);
  assert.equal(amendmentVerifyShapeIssues({ addTasks: [{ key: "more", verify: "true", paths: ["src/x.mjs"] }] },
    tasks, feature).length, 1);
});
