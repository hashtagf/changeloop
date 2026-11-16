import assert from "node:assert/strict";
import test from "node:test";
import { ESLint } from "eslint";
import config from "../eslint.config.mjs";

const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config });

async function findings(code) {
  const [result] = await eslint.lintText(code, { filePath: "sample.mjs" });
  return result.messages.map((message) => ({
    rule: message.ruleId, line: message.line, message: message.message
  }));
}

async function ruleHits(code, rule) {
  return (await findings(code)).filter((finding) => finding.rule === `changeloop/${rule}`);
}

test("no-timer-wait reports timers and sleep used as waits with a root-cause message", async () => {
  const code = [
    "import { spawnSync, execSync } from \"node:child_process\";",
    "setTimeout(() => {}, 100);",
    "globalThis.setInterval(() => {}, 5);",
    "setImmediate(() => {});",
    "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);",
    "spawnSync(\"sleep\", [\"1\"]);",
    "execSync(`sleep 2`);",
    ""
  ].join("\n");
  const hits = await ruleHits(code, "no-timer-wait");
  assert.deepEqual(hits.map((hit) => hit.line), [2, 3, 4, 5, 6, 7]);
  assert.match(hits[0].message, /Wait for the actual event/);
  assert.match(hits[4].message, /Spawning sleep is a timer wait/);
});

test("no-workaround-comment reports TODO, HACK, and workaround comments", async () => {
  const code = [
    "// TODO: remove later",
    "/* HACK around the race */",
    "// temporary workaround for flaky git",
    "// FIXME and XXX",
    "export const value = 1;",
    ""
  ].join("\n");
  const hits = await ruleHits(code, "no-workaround-comment");
  assert.deepEqual(hits.map((hit) => hit.line), [1, 2, 3, 4]);
  assert.match(hits[0].message, /Fix the root cause now, or encode the constraint as a test or lint rule/);
});

test("no-workaround-comment ignores prose that names a marker", async () => {
  const code = [
    "// Drafts are rejected when a section still holds TODO or TBD.",
    "// Playwright reports test.fixme tests as skipped.",
    "export const value = 1;",
    ""
  ].join("\n");
  assert.deepEqual(await ruleHits(code, "no-workaround-comment"), []);
});

test("no-silent-catch reports catch blocks without statements", async () => {
  const code = [
    "export function read(load) {",
    "  try { return load(); } catch {}",
    "  try { return load(); } catch (error) { /* ignored */ }",
    "}",
    ""
  ].join("\n");
  const hits = await ruleHits(code, "no-silent-catch");
  assert.deepEqual(hits.map((hit) => hit.line), [2, 3]);
  assert.match(hits[0].message, /rethrow everything else/);
});

test("no-bare-disable reports eslint-disable comments without a reason", async () => {
  const code = [
    "// eslint-disable-next-line changeloop/no-timer-wait",
    "setTimeout(() => {}, 1);",
    "/* eslint-disable no-unused-vars */",
    "const unused = 1;",
    ""
  ].join("\n");
  const hits = await ruleHits(code, "no-bare-disable");
  assert.deepEqual(hits.map((hit) => hit.line), [1, 3]);
  assert.match(hits[0].message, /-- <why this case is safe>/);
});

test("ordinary code, rethrowing catches, plain comments, and reasoned disables are not reported", async () => {
  const code = [
    "import { readFileSync } from \"node:fs\";",
    "// Reads the file once; callers own caching because the path can change.",
    "export async function read(path, ready) {",
    "  await ready;",
    "  try {",
    "    return readFileSync(path, \"utf8\");",
    "  } catch (error) {",
    "    if (error.code === \"ENOENT\") return null;",
    "    throw error;",
    "  }",
    "}",
    "export function bounded(child) {",
    "  // eslint-disable-next-line changeloop/no-timer-wait -- kill deadline for a hung child",
    "  return setTimeout(() => child.kill(), 1000);",
    "}",
    "export const sleepless = (run) => run(\"sleeper\");",
    ""
  ].join("\n");
  assert.deepEqual(await findings(code), []);
});

test("built-in correctness rules are enabled", async () => {
  const code = [
    "export function f() {",
    "  const unused = 1;",
    "  return missing;",
    "}",
    "export const o = { a: 1, a: 2 };",
    ""
  ].join("\n");
  const rules = (await findings(code)).map((finding) => finding.rule).sort();
  assert.deepEqual(rules, ["no-dupe-keys", "no-undef", "no-unused-vars"]);
});
