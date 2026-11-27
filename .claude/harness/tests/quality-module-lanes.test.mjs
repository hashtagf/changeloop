import assert from "node:assert/strict";
import { chmodSync, existsSync, symlinkSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { createQualityRuntime, runQualityProvider } from "../runtime/quality/quality-runtime.mjs";
import { discoverRepositoryQuality } from "../runtime/quality/quality-discovery.mjs";
import { validateConsumerQualityConfig, defaultConsumerQualityConfig } from "../runtime/quality/quality-policy.mjs";

// control-pane-indo: twelve Go modules under services/ and no go.mod at the
// root, so discovery proposed no lane and every change waited for nothing or
// for everything.
function fixture(t, files = {}, changed = ["services/wallet/main.go"], clock = undefined) {
  const root = mkdtempSync(join(tmpdir(), "quality-module-lanes-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, body] of Object.entries({ "openspec/config.yaml": "schema: x\n", ...files })) {
    mkdirSync(resolve(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  const writeJson = (path, value) => {
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  };
  const repository = { id: "root", path: root, relativePath: "." };
  const runtime = createQualityRuntime({
    root, repositoryCatalog: () => ({ repositories: [repository] }),
    selectedRepositories: () => [{ ...repository, workspacePath: root }],
    canonicalChangedSurface: () => changed.map((path) => ({ repositoryId: "root", path })),
    declaredSurfaceMatcher: () => () => true, loadRuntime: () => ({ id: "change" }),
    git: (args, cwd = root) => spawnSync("git", args, { cwd, encoding: "utf8" }), gitHead: () => "abc",
    readJson: (path) => JSON.parse(readFileSync(path, "utf8")), writeJson,
    pathInside: (parent, candidate) => !relative(resolve(parent), resolve(candidate)).startsWith(".."),
    fail: (message) => { throw new Error(message); }, log: () => {}, ...(clock ? { clock } : {})
  });
  const configure = (providers) => {
    const config = defaultConsumerQualityConfig([{ id: "root", profiles: [], providers }]);
    writeJson(join(root, "quality", "foundation-quality.json"), config);
    return config;
  };
  return { root, runtime, configure };
}

// Passes only when run in a directory holding marker.txt.
const IN_MODULE = [process.execPath, "-e", "process.exit(require('fs').existsSync('marker.txt') ? 0 : 3)"];

test("a module lane runs in its own directory and reports its capability and key", (t) => {
  const value = fixture(t, { "services/wallet/marker.txt": "" });
  value.configure({ "test:services/wallet": { kind: "command", command: IN_MODULE, cwd: "services/wallet" } });
  const [lane] = value.runtime.run({ change: "change" }).lanes.filter((row) => row.capability === "test");
  assert.equal(lane.status, "pass", lane.reason);
  assert.equal(lane.lane, "test:services/wallet");
  assert.ok(existsSync(join(value.root, ".foundation/quality/results/root/test_services_wallet.status.json")));
});

test("two lanes of one capability keep separate histories, and readiness sees both", (t) => {
  const value = fixture(t, { "a/marker.txt": "", "b/marker.txt": "" }, []);
  value.configure({
    "test:a": { kind: "command", command: IN_MODULE, cwd: "a" },
    "test:b": { kind: "command", command: IN_MODULE, cwd: "b" }
  });
  const summary = value.runtime.run({ change: "change", capability: "test" });
  assert.deepEqual(summary.lanes.filter((row) => row.capability === "test").map((row) => [row.lane, row.status]),
    [["test:a", "pass"], ["test:b", "pass"]]);
  const states = value.runtime.laneStates();
  assert.equal(states.statuses.test, "pass");
  assert.equal(states.histories.test.length, 2);
  assert.ok(!summary.lanes.some((row) => /compensating evidence is missing/.test(row.reason || "")),
    "module test lanes count as the test capability");
});

test("a lane directory outside the repository is refused; a missing one fails the lane", (t) => {
  const value = fixture(t);
  const config = defaultConsumerQualityConfig([{ id: "root", profiles: [], providers: {
    "test:x": { kind: "command", command: ["true"], cwd: "../other" } } }]);
  assert.throws(() => validateConsumerQualityConfig(config), /providers\.test:x\.cwd must be a directory inside the repository/);
  config.repositories[0].providers["test:x"].cwd = "/abs";
  assert.throws(() => validateConsumerQualityConfig(config), /cwd must be a directory inside/);
  value.configure({ "test:missing": { kind: "command", command: IN_MODULE, cwd: "services/missing" } });
  const [lane] = value.runtime.run({ change: "change" }).lanes.filter((row) => row.capability === "test");
  assert.equal(lane.status, "fail");
  assert.match(lane.reason, /lane directory 'services\/missing' does not exist/);
});

test("a plain capability key keeps its result files", (t) => {
  const value = fixture(t, { "marker.txt": "" });
  value.configure({ test: { kind: "command", command: IN_MODULE } });
  const [lane] = value.runtime.run({ change: "change" }).lanes.filter((row) => row.capability === "test");
  assert.equal(lane.status, "pass");
  assert.equal(lane.lane, undefined);
  assert.ok(existsSync(join(value.root, ".foundation/quality/results/root/test.status.json")));
});

function goPath(t) {
  const bin = mkdtempSync(join(tmpdir(), "module-lanes-bin-"));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  writeFileSync(join(bin, "go"), "#!/bin/sh\n");
  chmodSync(join(bin, "go"), 0o755);
  return bin;
}

const discover = (root) => discoverRepositoryQuality({ id: "root", path: root, relativePath: "." });

test("Go modules without a root go.mod get one lane per module and no root go lane", (t) => {
  const value = fixture(t, { "services/a/go.mod": "module a\n", "services/a/a.go": "package a\n",
    "services/b/go.mod": "module b\n", "services/b/b.go": "package b\n" });
  const found = discover(value.root);
  assert.equal(found.providers.test, undefined, "go test ./... cannot run without a root module");
  assert.deepEqual(found.providers["test:services/a"], { kind: "command", command: ["go", "test", "./..."],
    isolation: "read-only", cwd: "services/a", paths: ["services/a/**"] });
  assert.deepEqual(found.providers["static-analysis:services/b"].command, ["go", "vet", "./..."]);
  assert.deepEqual(found.modules, ["services/a", "services/b"]);
  assert.equal(found.capabilities.test.status, "available");
});

test("a root lane of the same language covers its modules; a module of another language still gets one", (t) => {
  const value = fixture(t, { "package.json": JSON.stringify({ scripts: { test: "node --test" } }), "index.js": "",
    "packages/x/package.json": JSON.stringify({ scripts: { test: "vitest" } }),
    "tools/gen/go.mod": "module gen\n", "tools/gen/main.go": "package main\n" });
  const found = discover(value.root);
  assert.deepEqual(found.providers.test.command, ["npm", "test"]);
  assert.equal(found.providers["test:packages/x"], undefined);
  assert.deepEqual(found.providers["test:tools/gen"].command, ["go", "test", "./..."]);
});

test("a nested module of the same language joins its parent, another git repository is skipped, and at most 40 modules are proposed", (t) => {
  const files = { "svc/go.mod": "module svc\n", "svc/internal/tool/go.mod": "module tool\n", "libs/x/go.mod": "module x\n" };
  for (let index = 0; index < 45; index += 1) files[`m/${String(index).padStart(2, "0")}/go.mod`] = "module m\n";
  const value = fixture(t, files);
  mkdirSync(join(value.root, "libs/x/.git"));
  const found = discover(value.root);
  assert.equal(found.providers["test:svc/internal/tool"], undefined);
  assert.equal(found.providers["test:libs/x"], undefined);
  assert.equal(Object.keys(found.providers).filter((key) => key.startsWith("test:")).length, 40);
  assert.equal(found.modulesTruncated, 6, "svc plus 45 under m/ is 46 modules");
});

test("discovery stops naming the cause when the quality config cannot be read", (t) => {
  const value = fixture(t);
  mkdirSync(join(value.root, "quality"), { recursive: true });
  writeFileSync(join(value.root, "quality", "foundation-quality.json"), "{ not json");
  assert.throws(() => value.runtime.discovery({}), /quality\/foundation-quality\.json cannot be read/);
});

test("a project pack's test-time pattern marks a lingering quality lane; an override drops the shipped one", (t) => {
  const value = fixture(t);
  const script = join(value.root, "report.mjs");
  writeFileSync(script, "console.log('Finished in 2s');\nconsole.log('ok  \\tx\\t1.0s');\n");
  // Each run takes 60s on its own clock: 0 when it starts, 60000 at every later reading.
  const run = (durations) => {
    let now = 0;
    const clock = () => { const reading = now; now = 60000; return reading; };
    return runLane(durations, clock);
  };
  const runLane = (durations, clock) => runQualityProvider({ repository: { id: "root", path: value.root }, capability: "test",
    provider: { kind: "command", command: [process.execPath, script] }, git: () => ({ status: 1, stdout: "" }),
    pathInside: () => true, durations, clock });
  const elixir = { id: "toolchain-elixir", markers: ["mix.exs"], capabilities: ["test"],
    durations: [{ pattern: "^Finished in (\\d+)(s)\\b" }] };
  assert.deepEqual(run([elixir]).lingering, { testsMs: 3000, wallMs: 60000 }, "2s from the project pack plus Go's shipped 1s");
  const goWithout = { id: "application-go", extensions: [".go"], markers: ["go.mod"], capabilities: ["test"] };
  assert.deepEqual(run([elixir, goWithout]).lingering, { testsMs: 2000, wallMs: 60000 }, "the override has no Go pattern");
  assert.equal(run([]).lingering.testsMs, 1000, "without project packs only shipped patterns count");
});

test("quality run reads the config's project packs and files the lingering lane in its history", (t) => {
  // Each lane run reads 0 when it starts and 60000 afterwards: a 60s run whose report says 2s.
  let now = 0;
  const value = fixture(t, {}, [], () => { const reading = now; now = 60000; return reading; });
  const script = join(value.root, "report.mjs");
  writeFileSync(script, "console.log('Elixir done 2s');\n");
  const config = value.configure({ test: { kind: "command", command: [process.execPath, script] } });
  config.toolchains = [{ id: "toolchain-elixir", markers: ["mix.exs"], capabilities: ["test"],
    durations: [{ pattern: "^Elixir done (\\d+)(s)\\b" }] }];
  writeFileSync(join(value.root, "quality", "foundation-quality.json"), JSON.stringify(config));
  const lane = value.runtime.run({}).lanes.find((row) => row.capability === "test");
  assert.equal(lane.status, "pass");
  assert.deepEqual(lane.lingering, { testsMs: 2000, wallMs: 60000 });
  const status = JSON.parse(readFileSync(join(value.root, ".foundation/quality/results/root/test.status.json"), "utf8"));
  assert.deepEqual(status.history.at(-1).lingering, { testsMs: 2000, wallMs: 60000 });
  now = 0;
  delete config.toolchains;
  writeFileSync(join(value.root, "quality", "foundation-quality.json"), JSON.stringify(config));
  assert.equal(value.runtime.run({}).lanes.find((row) => row.capability === "test").lingering, null,
    "without the pack the report's time is unreadable");
});

test("lane keys that share a result file, flags the pattern breaks under, and a symlinked cwd are refused", (t) => {
  const config = defaultConsumerQualityConfig([{ id: "root", profiles: [], providers: {
    "test:services/a_b": { kind: "command", command: ["true"] }, "test:services/a/b": { kind: "command", command: ["true"] } } }]);
  assert.throws(() => validateConsumerQualityConfig(config), /would share result file 'test_services_a_b'/);
  const base = defaultConsumerQualityConfig([{ id: "root", profiles: [], providers: {} }]);
  for (const [durations, message] of [[[{ pattern: "\\-(\\d+)", flags: "u" }], /valid regular expression with its flags/],
    [[{ pattern: "(\\d+)s", flags: "gg" }], /distinct regular expression flags/]])
    assert.throws(() => validateConsumerQualityConfig({ ...base, toolchains: [{ id: "toolchain-x", markers: ["x"],
      capabilities: ["test"], durations }] }), message);
  const value = fixture(t);
  const outside = mkdtempSync(join(tmpdir(), "quality-outside-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(join(outside, "marker.txt"), "");
  symlinkSync(outside, join(value.root, "linked"));
  value.configure({ "test:linked": { kind: "command", command: IN_MODULE, cwd: "linked" } });
  const [lane] = value.runtime.run({ change: "change" }).lanes.filter((row) => row.capability === "test");
  assert.equal(lane.status, "fail");
  assert.match(lane.reason, /resolves outside the repository/);
});
