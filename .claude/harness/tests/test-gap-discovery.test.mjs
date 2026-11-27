import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { discoverRepositoryQuality } from "../runtime/quality/quality-discovery.mjs";
import { countTestFiles, knownTestFileCount, testCommandProposals } from "../runtime/quality/test-gap-discovery.mjs";
import { pyramidReadiness } from "../runtime/quality/pyramid-readiness.mjs";
import { validateToolchainPack } from "../runtime/quality/language-profiles.mjs";

// 828 consumer repositories: 187 JavaScript ones had no test script (Nuxt 127,
// Vue 36), only 19 had test files, 15 named a test command in a Makefile, CI
// workflow, or README, and .vue was not counted as JavaScript at all.
function repo(t, files) {
  const root = mkdtempSync(join(tmpdir(), "test-gap-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(resolve(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}
// Discovery proposes a command only for a tool on PATH; a test names the PATH it means
// so it gives the same result on a machine with gradle (the CI runner) and without.
function discover(root, path = process.env.PATH) {
  const saved = process.env.PATH;
  process.env.PATH = path;
  try { return discoverRepositoryQuality({ id: "root", path: root, relativePath: "." }); }
  finally { process.env.PATH = saved; }
}
function toolPath(t, names) {
  const bin = mkdtempSync(join(tmpdir(), "test-gap-bin-"));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  for (const name of names) { writeFileSync(join(bin, name), "#!/bin/sh\n"); chmodSync(join(bin, name), 0o755); }
  return bin;
}
const nuxt = JSON.stringify({ name: "shop", dependencies: { nuxt: "3" } });

test("a Nuxt repository with only .vue sources is JavaScript/TypeScript", (t) => {
  const found = discover(repo(t, { "package.json": nuxt, "pages/index.vue": "<template/>" }));
  assert.ok(found.profiles.includes("application-js-ts"));
  assert.deepEqual(found.languages.filter((name) => ["javascript", "typescript"].includes(name)), ["javascript", "typescript"]);
  const bare = discover(repo(t, { "components/a.vue": "<template/>" }));
  assert.ok(bare.profiles.includes("application-js-ts"));
  assert.equal(bare.providers.test, undefined);
});

test("test files without a test script use the runner the repository installed", (t) => {
  const root = repo(t, { "package.json": nuxt, "tests/cart.spec.ts": "", "node_modules/.bin/vitest": "#!/bin/sh\n" });
  chmodSync(join(root, "node_modules/.bin/vitest"), 0o755);
  const found = discover(root);
  assert.deepEqual(found.providers.test.command, ["npx", "--no-install", "vitest", "run"]);
  assert.equal(found.testFiles, 1, "the count that led to the runner is reported");
  const none = discover(repo(t, { "package.json": nuxt, "tests/cart.spec.ts": "" }));
  assert.equal(none.providers.test, undefined);
  assert.equal(none.testFiles, 1);
  assert.equal(none.proposals["test-setup"], undefined, "it has tests; it is not offered a setup");
});

test("test commands in a Makefile, CI workflow, and README become proposals, never providers", (t) => {
  const root = repo(t, {
    "go.sum": "",
    "Makefile": "build:\n\tgo build ./...\ntest:\n\tgo test ./...\ntest-integration:\n\tgo test -tags=int ./...\nX := test\n",
    ".github/workflows/ci.yml": "jobs:\n  t:\n    steps:\n      - run: go test -race ./...\n      - run: |\n          npm ci\n          npm test\n",
    "README.md": "# x\n\n```sh\n$ make test\npytest -q\n```\n\nRun the tests with care.\n"
  });
  const found = discover(root);
  assert.equal(found.providers.test, undefined);
  assert.deepEqual(found.proposals["test-commands"], [
    { command: "make test", source: "Makefile", verified: false },
    { command: "make test-integration", source: "Makefile", verified: false },
    { command: "go test -race ./...", source: ".github/workflows/ci.yml", verified: false },
    { command: "npm test", source: ".github/workflows/ci.yml", verified: false },
    { command: "pytest -q", source: "README.md", verified: false }
  ]);
  assert.equal(testCommandProposals(repo(t, { "README.md": "npm test outside a code block\n" })).length, 0);
});

test("a repository with a test lane gets no test proposals", (t) => {
  const found = discover(repo(t, { "package.json": JSON.stringify({ scripts: { test: "vitest" } }), "Makefile": "test:\n\tx\n" }));
  assert.deepEqual(found.providers.test.command, ["npm", "test"]);
  assert.equal(found.proposals?.["test-commands"], undefined);
  assert.equal(found.proposals?.["test-setup"], undefined);
});

test("a repository with no tests is told so and offered a runner to set up", (t) => {
  const found = discover(repo(t, { "package.json": nuxt, "pages/index.vue": "<template/>" }));
  assert.equal(found.testFiles, 0);
  assert.equal(found.proposals["test-setup"].runner, "vitest");
  assert.match(found.proposals["test-setup"].message, /has no tests; propose adding vitest through \/change/);
  const go = discover(repo(t, { "main.go": "package main\n" }));
  assert.equal(go.proposals["test-setup"].runner, "go test");
});

test("readiness names a repository without tests, apart from a missing lane", () => {
  const facts = { configured: true, lanes: {}, statuses: {}, histories: {} };
  const row = (extra) => pyramidReadiness({ ...facts, ...extra }).criteria.find((item) => item.id === "tests");
  assert.equal(row({ testFiles: 0 }).detail, "the repository has no tests");
  assert.match(row({ testFiles: 0 }).next, /propose adding a test runner .* through \/change/);
  assert.equal(row({ testFiles: 3 }).detail, "no test lane");
  assert.equal(row({}).detail, "no test lane", "an unmeasured count keeps the old row");
});

test("test files are counted outside dependencies and build output", (t) => {
  const root = repo(t, { "src/a.test.ts": "", "pkg/b_test.go": "", "tests/test_c.py": "", "spec/d_spec.rb": "",
    "node_modules/x/e.test.js": "", ".nuxt/f.spec.ts": "", "src/g.ts": "" });
  assert.equal(countTestFiles(root), 4);
});

test("a duration pattern that is invalid alone is refused even when the added '|' would hide it", () => {
  assert.throws(() => validateToolchainPack({ id: "toolchain-x", markers: ["x"], capabilities: ["test"],
    durations: [{ pattern: "(\\d+)\\" }] }), /valid regular expression/);
});

test("Java, Kotlin, PHP, Dart, Rust and __tests__ test files count; a partial walk is not zero", (t) => {
  const root = repo(t, { "src/test/java/FooTest.java": "", "src/test/kotlin/BarTests.kt": "", "tests/UserTest.php": "",
    "test/widget_test.dart": "", "tests/integration.rs": "", "src/__tests__/a.js": "", "src/Foo.java": "" });
  assert.equal(countTestFiles(root), 6);
  assert.equal(countTestFiles(root, { maximumEntries: 2 }), null);
  const gradleRepo = repo(t, { "build.gradle": "", "src/test/java/FooTest.java": "" });
  const java = discover(gradleRepo, toolPath(t, []));
  assert.equal(java.testFiles, 1);
  assert.equal(java.proposals?.["test-setup"], undefined);
  assert.deepEqual(discover(gradleRepo, toolPath(t, ["gradle"])).providers.test.command, ["gradle", "test"],
    "with gradle installed the repository gets its lane instead");
  const jest = discover(repo(t, { "package.json": nuxt, "src/__tests__/a.js": "" }));
  assert.equal(jest.testFiles, 1);
});

test("a language whose test files are not recognised never reads as having no tests", (t) => {
  const terraform = discover(repo(t, { "main.tf": "" }));
  assert.equal(terraform.testFiles, null);
  assert.equal(terraform.proposals?.["test-setup"], undefined);
  assert.equal(knownTestFileCount(repo(t, { "main.tf": "" }), ["toolchain-terraform"]), null);
});

test("a GitLab or Bitbucket script list yields each command once, without its dash", (t) => {
  const gitlab = testCommandProposals(repo(t, { ".gitlab-ci.yml": "test:\n  script:\n    - npm ci\n    - npm test\n" }));
  assert.deepEqual(gitlab, [{ command: "npm test", source: ".gitlab-ci.yml", verified: false }]);
  const bitbucket = testCommandProposals(repo(t, { "bitbucket-pipelines.yml":
    "pipelines:\n  default:\n    - step:\n        script:\n          - go test ./...\n" }));
  assert.deepEqual(bitbucket, [{ command: "go test ./...", source: "bitbucket-pipelines.yml", verified: false }]);
});
