// Consumer findings ratchet: lint, type-check, file-size, module-boundary,
// stopgap-comment, and duplication findings may shrink but never grow;
// adoption starts with a baseline.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";

import {
  evaluateFindingsRatchet, fileSizeFindings, moduleBoundaryFindings, normalizeFindingsReport,
  parseEslintJson, parseGoVetText, parseGolangciJson, parseMypyText, parseRuffJson, parseTscText
} from "../runtime/quality/findings-ratchet.mjs";
import { createQualityRuntime } from "../runtime/quality/quality-runtime.mjs";
import { detectedProviders } from "../runtime/quality/quality-discovery.mjs";
import {
  duplicatesIn, duplicationFindings, duplicationWindow, maxNestingDepth, nestingDepthFindings, workaroundCommentFindings
} from "../runtime/quality/code-health-findings.mjs";
import { sourceFiles } from "../runtime/quality/source-scan.mjs";
import { FINDINGS_ADAPTERS } from "../runtime/quality/findings-ratchet.mjs";
import { configDigest } from "../runtime/quality/quality-protocol.mjs";

function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), "findings-ratchet-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const report = (findings, tool = { name: "x", adapterVersion: "1", configDigest: "d" }) =>
  normalizeFindingsReport({ repository: "root", tool, findings });

test("ESLint JSON and tsc output become findings keyed by path and rule", () => {
  const eslint = JSON.stringify([{ filePath: "/repo/src/a.js", messages: [
    { ruleId: "no-unused-vars", line: 3, message: "x unused" }, { fatal: true, line: 1, message: "parse" }] }]);
  assert.deepEqual(parseEslintJson(eslint, "/repo").map(({ path, rule, line }) => [path, rule, line]),
    [["src/a.js", "eslint/no-unused-vars", 3], ["src/a.js", "eslint/parse-error", 1]]);
  assert.deepEqual(parseTscText("src/b.ts(7,2): error TS2339: Property 'x' does not exist.\nnoise\n"),
    [{ path: "src/b.ts", rule: "types/TS2339", line: 7, message: "Property 'x' does not exist." }]);
});

test("without a baseline the lane passes with reduced assurance and names how to start", () => {
  const value = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }]) });
  assert.equal(value.status, "pass");
  assert.equal(value.assurance, "reduced");
  assert.match(value.reason, /quality baseline --write/);
});

test("a new finding fails, an existing one passes, and a fixed one is an improvement", () => {
  const baseline = report([{ path: "a.js", rule: "lint/x" }, { path: "b.js", rule: "lint/y" }]);
  const same = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }, { path: "b.js", rule: "lint/y" }]), baseline });
  assert.equal(same.status, "pass");
  const grown = evaluateFindingsRatchet({ current: report([
    { path: "a.js", rule: "lint/x" }, { path: "a.js", rule: "lint/x", line: 9 }, { path: "b.js", rule: "lint/y" }]), baseline });
  assert.equal(grown.status, "fail");
  assert.deepEqual(grown.regressions.map(({ path, baseline: was, current }) => [path, was, current]), [["a.js", 1, 2]]);
  const fixed = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }]), baseline });
  assert.equal(fixed.status, "pass");
  assert.deepEqual(fixed.improvements.map(({ path }) => path), ["b.js"]);
});

test("a changed tool or configuration is not compared against the old baseline", () => {
  const baseline = report([], { name: "x", adapterVersion: "1", configDigest: "old" });
  const value = evaluateFindingsRatchet({ current: report([{ path: "a.js", rule: "lint/x" }]), baseline });
  assert.equal(value.assurance, "reduced");
  assert.match(value.reason, /changed/);
});

test("file-size records files over the ceiling and fails when one grows or a new one appears", (t) => {
  const lines = (count) => "x;\n".repeat(count);
  const root = project(t, { "src/big.js": lines(12), "src/small.js": lines(3), "node_modules/dep.js": lines(50),
    ".claude/harness/runtime/installed.mjs": lines(50) });
  const first = fileSizeFindings(root, { ceiling: 10 });
  assert.deepEqual(first.map(({ path, value }) => [path, value]), [["src/big.js", 12]]);
  const baseline = report(first);
  writeFileSync(join(root, "src/big.js"), lines(13));
  writeFileSync(join(root, "src/new.js"), lines(11));
  const value = evaluateFindingsRatchet({ current: report(fileSizeFindings(root, { ceiling: 10 })), baseline });
  assert.equal(value.status, "fail");
  assert.deepEqual(value.regressions.map(({ path, message }) => [path, message]),
    [["src/big.js", "grew from 12 to 13"], ["src/new.js", "new: 11"]]);
});

test("module boundaries report imports a module's allow list does not name", (t) => {
  const root = project(t, {
    "src/ui/view.js": "import { load } from \"../data/store.js\";\nimport { fmt } from \"../shared/fmt\";\n",
    "src/data/store.js": "import { view } from \"../ui/view.js\";\nexport const load = () => view;\n",
    "src/shared/fmt.js": "export const fmt = (x) => x;\n"
  });
  const provider = {
    modules: [{ name: "ui", paths: ["src/ui/**"] }, { name: "data", paths: ["src/data/**"] },
      { name: "shared", paths: ["src/shared/**"] }],
    allow: { ui: ["data", "shared"], data: ["shared"] }
  };
  const findings = moduleBoundaryFindings(root, provider);
  assert.deepEqual(findings.map(({ path, rule, line }) => [path, rule, line]),
    [["src/data/store.js", "boundary/data->ui", 1]]);
  assert.match(findings[0].message, /move the shared code/);
  assert.throws(() => moduleBoundaryFindings(root, { modules: [{ name: "ui", paths: ["src/**"] }], allow: { ui: ["nope"] } }),
    /must list declared modules/);
});

test("discovery offers type-check, lint, and file-size without project scripts", (t) => {
  const root = project(t, { "tsconfig.json": "{}", "package.json": JSON.stringify({
    devDependencies: { typescript: "5", eslint: "9" } }) });
  const providers = detectedProviders(root, ["application-js-ts"]);
  assert.equal(providers["type-check"].adapter, "tsc-text");
  assert.equal(providers["type-check"].inputs.report, "-");
  assert.equal(providers.lint.adapter, "eslint-json");
  for (const adapter of ["file-size", "workaround-comments", "duplication", "nesting-depth"]) {
    assert.equal(providers[adapter].adapter, adapter);
    assert.equal(detectedProviders(root, ["web-style"])[adapter], undefined);
  }
});

test("Ruff, mypy, golangci-lint, and go vet output become findings keyed by path and rule", () => {
  const ruff = JSON.stringify([{ filename: "/repo/app/a.py", code: "F401", location: { row: 2 }, message: "unused" },
    { filename: "app/b.py", code: null, location: { row: 1 }, message: "syntax" }]);
  assert.deepEqual(parseRuffJson(ruff, "/repo").map(({ path, rule, line }) => [path, rule, line]),
    [["app/a.py", "ruff/F401", 2], ["app/b.py", "ruff/syntax-error", 1]]);
  assert.deepEqual(parseMypyText("app/a.py:4: error: Incompatible types  [assignment]\napp/b.py:9:3: error: Bad\nSuccess\n")
    .map(({ path, rule, line }) => [path, rule, line]),
  [["app/a.py", "types/mypy-assignment", 4], ["app/b.py", "types/mypy-error", 9]]);
  const golangci = `level=warn msg="x"\n${JSON.stringify({ Issues: [
    { FromLinter: "errcheck", Text: "unchecked", Pos: { Filename: "pkg/a.go", Line: 7 } }] })}\n`;
  assert.deepEqual(parseGolangciJson(golangci).map(({ path, rule, line }) => [path, rule, line]),
    [["pkg/a.go", "golangci/errcheck", 7]]);
  assert.deepEqual(parseGolangciJson(""), []);
  assert.deepEqual(parseGoVetText("# example/pkg\npkg/a.go:3:2: undefined: foo\nvet: pkg/b.go:5:1: bad\n")
    .map(({ path, rule, line }) => [path, rule, line]),
  [["pkg/a.go", "types/go-vet", 3], ["pkg/b.go", "types/go-vet", 5]]);
});

test("Go and Python lanes are proposed only from what the project declares", (t) => {
  const go = detectedProviders(project(t, { "go.mod": "module x\n", ".golangci.yml": "version: \"2\"\n" }), ["application-go"]);
  assert.equal(go.lint.adapter, "golangci-json");
  assert.ok(go.lint.command.includes("--output.json.path"), "a v2 config gets the v2 flag");
  assert.equal(go["type-check"].adapter, "go-vet-text");
  const goV1 = detectedProviders(project(t, { "go.mod": "module x\n", ".golangci.yml": "linters: {}\n" }), ["application-go"]);
  assert.ok(goV1.lint.command.includes("--out-format"));
  assert.equal(detectedProviders(project(t, { "go.mod": "module x\n" }), ["application-go"]).lint, undefined);

  const bare = detectedProviders(project(t, { "tools/script.py": "print(1)\n" }), ["application-python"]);
  assert.equal(bare.test, undefined, "a stray script is not a pytest suite");
  assert.equal(bare.lint, undefined);
  assert.equal(bare["type-check"], undefined);
  const python = detectedProviders(project(t, {
    "pyproject.toml": "[tool.ruff]\nline-length = 100\n[tool.mypy]\nstrict = true\n",
    "requirements-dev.txt": "pytest==8.0\n" }), ["application-python"]);
  assert.deepEqual(python.test.command.slice(-2), ["-m", "pytest"]);
  assert.ok(python.test.command.includes("pycache_prefix=.foundation/quality/pycache"),
    "bytecode goes under the ignored .foundation, so a test run leaves git status unchanged");
  assert.equal(python.lint.adapter, "ruff-json");
  assert.equal(python["type-check"].adapter, "mypy-text");
  const declared = detectedProviders(project(t, { "requirements.txt": "ruff>=0.4\nmypy\n", "conftest.py": "" }), ["application-python"]);
  assert.deepEqual([declared.test?.kind, declared.lint?.adapter, declared["type-check"]?.adapter],
    ["command", "ruff-json", "mypy-text"]);
  assert.equal(detectedProviders(project(t, { "requirements.txt": "ruffian\n" }), ["application-python"]).lint, undefined);
});

test("file-size measures every code language and skips nested repositories", (t) => {
  const root = project(t, { "big.py": "x = 1\n".repeat(1200), "big.go": "// x\n".repeat(1200),
    "small.js": "x\n", "repos/other/huge.js": "x\n".repeat(1200), "repos/other/.git": "gitdir: x\n" });
  assert.deepEqual(fileSizeFindings(root, {}).map((row) => row.path).sort(), ["big.go", "big.py"]);
});

test("lint and test lanes follow the project's own scripts", (t) => {
  const vue = detectedProviders(project(t, { "package.json": JSON.stringify({
    scripts: { "lint:js": "eslint --ext \".js,.vue\" --ignore-path .gitignore .", "test:unit": "jest" },
    devDependencies: { eslint: "7", jest: "29" } }) }), ["application-js-ts"]);
  assert.deepEqual(vue.lint.command, ["npx", "--no-install", "eslint", ".", "--ext", ".js,.vue",
    "--ignore-path", ".gitignore", "-f", "json"], "a Vue project's lane lints .vue as its script does");
  assert.deepEqual(vue.test.command, ["npm", "run", "test:unit"]);
  const bare = detectedProviders(project(t, { "package.json": JSON.stringify({ devDependencies: { vitest: "1" } }) }),
    ["application-js-ts"]);
  assert.deepEqual(bare.test.command, ["npx", "--no-install", "vitest", "run"]);
});

test("scans skip what the repository's .gitignore excludes", (t) => {
  const root = project(t, { ".gitignore": ".nuxt\ncoverage/\n", ".nuxt/router.js": "// TODO generated\n",
    "coverage/lcov.js": "x\n", "src/app.js": "x\n" });
  spawnSync("git", ["init", "-q"], { cwd: root });
  assert.deepEqual(sourceFiles(root, {}), ["src/app.js"]);
  assert.deepEqual(workaroundCommentFindings(root, {}), [], "a marker in build output is not the project's");
});

test("markup that only closes elements is not duplicated code", () => {
  const closing = ["</button>", "</el-popconfirm>", "</el-tooltip>", "</div>", "</template>",
    "</el-table-column>", "</table-card>", "</div></div>", "/>", "</section>"].join("\n");
  assert.deepEqual(duplicatesIn([{ path: "a.vue", text: `<a>\n${closing}\n` }, { path: "b.vue", text: `<b>\n${closing}\n` }], 8), []);
});

test("workspace package names resolve as imports into the package", (t) => {
  const root = project(t, {
    "packages/core/package.json": JSON.stringify({ name: "@acme/core" }),
    "packages/core/index.js": "export const x = 1;\n",
    "packages/web/src/app.js": "import { x } from \"@acme/core\";\nimport \"@acme/core/util\";\nimport \"@acme/core-extra\";\n"
  });
  const findings = moduleBoundaryFindings(root, { aliases: { "@acme/core": "packages/core/" },
    modules: [{ name: "core", paths: ["packages/core/**"] }, { name: "web", paths: ["packages/web/**"] }] });
  assert.deepEqual(findings.map((row) => [row.rule, row.line]), [["boundary/web->core", 1], ["boundary/web->core", 2]],
    "a package name and its subpath resolve; a longer name is a different package");
});

test("Python lanes use python3 where only python3 is installed", (t) => {
  const bin = project(t, { python3: "" });
  const both = project(t, { python: "", python3: "" });
  const root = project(t, { "pytest.ini": "[pytest]\n" });
  const saved = process.env.PATH;
  t.after(() => { process.env.PATH = saved; });
  process.env.PATH = bin;
  assert.equal(detectedProviders(root, ["application-python"]).test.command[0], "python3");
  process.env.PATH = both;
  assert.equal(detectedProviders(root, ["application-python"]).test.command[0], "python");
});

test("a tool reporting the resolved path still maps to a repository path", (t) => {
  const created = project(t, { "app/a.py": "" });
  const link = `${created}-link`;
  symlinkSync(created, link);
  const real = realpathSync(created);
  t.after(() => rmSync(link, { force: true }));
  const ruff = JSON.stringify([{ filename: join(real, "app/a.py"), code: "F401", location: { row: 1 }, message: "x" }]);
  assert.equal(parseRuffJson(ruff, link)[0].path, "app/a.py");
  const eslint = JSON.stringify([{ filePath: join(real, "app/a.js"), messages: [{ ruleId: "r", line: 1, message: "m" }] }]);
  assert.equal(parseEslintJson(eslint, link)[0].path, "app/a.js");
});

const BLOCK = ["function total(order) {", "  const items = order.items.filter(Boolean);",
  "  const sum = items.reduce((acc, item) => acc + item.price, 0);", "  const tax = sum * order.taxRate;",
  "  const shipping = sum > 100 ? 0 : order.shipping;", "  const discount = order.coupon ? sum * 0.1 : 0;",
  "  log('total', sum + tax + shipping - discount);", "  return sum + tax + shipping - discount;", "}"];

test("stopgap marker comments are findings per marker; ordinary words and strings are not", (t) => {
  const root = project(t, {
    "src/a.js": "// TODO: drop after v2\nconst list = 'TODO app'; // a todo list\n/* FIXME(ann) */\n",
    "src/b.py": "x = 1  # HACK until the API returns ids\n# Workaround for the vendor bug\n",
    "src/c.md": "TODO in docs is not code\n",
    // Named in prose or inside a pattern, a marker is not a stopgap.
    "src/d.js": "const tap = line.match(/\\s+#\\s*(SKIP|TODO)\\b/i);\n// checks the folder (no TODO\n// placeholders)\n",
    "node_modules/d.js": "// TODO vendored\n"
  });
  assert.deepEqual(workaroundCommentFindings(root, {}).map(({ path, rule, line }) => `${path}:${line} ${rule}`), [
    "src/a.js:1 comment/todo", "src/a.js:3 comment/fixme", "src/b.py:1 comment/hack", "src/b.py:2 comment/workaround"]);
});

test("a copied block is one duplication finding in the later file, and the ratchet catches a new copy", (t) => {
  const root = project(t, { "src/a.js": `${BLOCK.join("\n")}\n`, "src/b.js": `// copy\n${BLOCK.join("\n")}\n` });
  const findings = duplicationFindings(root, {});
  assert.deepEqual(findings.map(({ path, rule, line }) => `${path}:${line} ${rule}`), ["src/b.js:2 duplication/block"]);
  assert.match(findings[0].message, /repeat src\/a\.js:1; extract the shared code/);
  const repository = { id: "root", path: root };
  const run = () => FINDINGS_ADAPTERS.duplication.run({ repository, provider: {} });
  const baseline = run();
  writeFileSync(join(root, "src", "c.js"), `${BLOCK.join("\n")}\n`);
  const grown = evaluateFindingsRatchet({ current: run(), baseline });
  assert.equal(grown.status, "fail");
  assert.equal(grown.regressions[0].path, "src/c.js");
  // Blank lines and lone brackets never make two blocks alike, and short blocks are below the window.
  assert.deepEqual(duplicationFindings(project(t, { "a.js": "}\n\n}\n".repeat(20) }), {}), []);
  assert.throws(() => duplicationWindow({ window: 2 }), /at least 4/);
});

test("nesting depth is one finding per file over the limit, ignoring braces in strings and comments", (t) => {
  const nest = (depth) => [...Array(depth).keys()].map((level) => `${"  ".repeat(level)}if (x) {`)
    .concat([...Array(depth).keys()].reverse().map((level) => `${"  ".repeat(level)}}`)).join("\n");
  const root = project(t, {
    "src/deep.js": `${nest(6)}\n`,
    "src/ok.js": `${nest(5)}\nconst s = "{{{{{{"; // {{{{\n/* {{{{{{\n{{{{ */\n`,
    "src/deep.py": "def f(a):\n    if a:\n        for x in a:\n            if x:\n                while x:\n                    if x:\n                        pass\n",
    "src/script.sh": "{ { { { { { { echo; } } } } } } }\n"
  });
  assert.deepEqual(nestingDepthFindings(root, {}).map(({ path, rule, line, value }) => `${path}:${line} ${rule} ${value}`),
    ["src/deep.js:6 complexity/nesting 6", "src/deep.py:7 complexity/nesting 6"]);
  assert.deepEqual(nestingDepthFindings(root, { maxDepth: 6 }), []);
  assert.throws(() => maxNestingDepth({ maxDepth: 1 }), /at least 2/);
  // Like file size, the depth is a value: a tracked file may not get deeper.
  const repository = { id: "root", path: root };
  const run = () => FINDINGS_ADAPTERS["nesting-depth"].run({ repository, provider: {} });
  const baseline = run();
  writeFileSync(join(root, "src", "deep.js"), `${nest(7)}\n`);
  const grown = evaluateFindingsRatchet({ current: run(), baseline });
  assert.equal(grown.status, "fail");
  assert.deepEqual(grown.regressions.map((row) => [row.path, row.baseline, row.current]), [["src/deep.js", 6, 7]]);
});

// Depth is control flow: a nested schema or configuration value is data, and
// a multi-line template, a `${}` expression, or a regular expression never
// shifts the count for the code after it.
test("nesting depth counts blocks, not object literals, templates, or regular expressions", async () => {
  const { nestingIn } = await import("../runtime/quality/code-health-findings.mjs");
  const depth = (source) => nestingIn("a.mjs", source, 0)[0]?.value ?? 0;
  assert.equal(depth("const schema = { a: { b: { c: { d: { e: { f: 1 } } } } } };\n"), 0);
  assert.equal(depth("function f() {\n  return { a: [{ b: { c: 1 } }] };\n}\n"), 1);
  assert.equal(depth("function f() {\n  if (x) {\n    for (const y of z) {\n      g(() => {\n        h();\n      });\n    }\n  } else {\n  }\n}\n"), 4);
  assert.equal(depth("function f() {\n  const m = `a ${\n    b({ c: 1 })\n  } {`;\n  const r = /[{]{2}/;\n}\nfunction g() {\n  if (x) {\n  }\n}\n"), 2);
  assert.equal(depth("import { a, b } from \"x\";\nexport { a };\nclass K {\n  m() {\n  }\n}\n"), 2);
});

test("a later lane setting joins the digest only when set, so existing baselines keep comparing", (t) => {
  const root = project(t, { "a.js": "x\n" });
  const repository = { id: "root", path: root };
  const digest = (provider) => FINDINGS_ADAPTERS["file-size"].run({ repository, provider }).tool.configDigest;
  const legacy = configDigest({ adapter: "file-size", inputs: null, include: null, exclude: null,
    ceiling: null, modules: null, allow: null, tool: null });
  // file-size now scans every code language: a baseline from the JS/TS-only
  // scan deliberately stops comparing and asks for a new one.
  assert.notEqual(digest({}), legacy, "a JS/TS-only file-size baseline is not compared with the wider scan");
  assert.notEqual(digest({}), digest({ extensions: [".py"] }));
  const nesting = FINDINGS_ADAPTERS["nesting-depth"].run({ repository, provider: {} }).tool.configDigest;
  assert.equal(nesting, configDigest({ adapter: "nesting-depth", inputs: null, include: null, exclude: null,
    ceiling: null, modules: null, allow: null, tool: null }), "other lanes keep the digest their baselines recorded");
  const window = (value) => FINDINGS_ADAPTERS.duplication.run({ repository, provider: { window: value } }).tool.configDigest;
  assert.notEqual(window(8), window(12));
});

test("quality run ratchets a type checker that exits 1 and reads its stdout", (t) => {
  const root = project(t, { "src.ts": "x\n" });
  const script = join(root, "tsc.mjs");
  writeFileSync(script, "process.stdout.write(require('node:fs').readFileSync(process.env.TSC_OUT, 'utf8')); process.exit(1);\n"
    .replace("require('node:fs')", "(await import('node:fs'))"));
  const out = join(tmpdir(), `tsc-out-${process.pid}-${Date.now()}`);
  t.after(() => rmSync(out, { force: true }));
  process.env.TSC_OUT = out;
  t.after(() => { delete process.env.TSC_OUT; });
  const writeJson = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value)); };
  const repository = { id: "root", path: root, relativePath: "." };
  const runtime = createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [repository], canonicalChangedSurface: () => [],
    declaredSurfaceMatcher: () => () => true, loadRuntime: () => ({}),
    git: (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => null,
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")), writeJson,
    pathInside: (parent, child) => !relative(resolve(parent), resolve(child)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}
  });
  const config = runtime.draft();
  config.repositories[0].profiles = [];
  config.repositories[0].providers = { "type-check": { kind: "builtin", adapter: "tsc-text",
    command: [process.execPath, script], inputs: { report: "-" }, isolation: "read-only" } };
  writeJson(join(root, "quality", "foundation-quality.json"), config);
  writeFileSync(out, "src.ts(1,1): error TS2304: Cannot find name 'x'.\n");
  const first = runtime.run({});
  assert.equal(first.lanes[0].status, "pass");
  assert.equal(first.lanes[0].assurance, "reduced");
  runtime.baseline({ write: true, "decision-ref": "test", reason: "adopt" });
  assert.equal(runtime.run({}).status, "pass");
  writeFileSync(out, "src.ts(1,1): error TS2304: Cannot find name 'x'.\nsrc.ts(2,1): error TS2304: Cannot find name 'y'.\n");
  const grown = runtime.run({});
  assert.equal(grown.status, "fail");
  assert.equal(grown.lanes[0].evaluation.regressions[0].rule, "types/TS2304");
  assert.throws(() => runtime.run({ enforce: true }), /consumer quality gate fail/);
});
