// The feature map covers every user-facing surface, names only real paths, and
// its rendered page matches the JSON.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  DOC_PATH, MAP_PATH, REPO_ROOT, main, renderFeatureMap, validateFeatureMap
} from "../../../scripts/docs/feature-map.mjs";

const load = () => JSON.parse(readFileSync(join(REPO_ROOT, MAP_PATH), "utf8"));
const quiet = { log() {}, error() {} };

test("the committed feature map is valid and its page is current", () => {
  assert.deepEqual(validateFeatureMap(load()), []);
  assert.equal(readFileSync(join(REPO_ROOT, DOC_PATH), "utf8"), renderFeatureMap(load()));
  assert.equal(main([], REPO_ROOT, quiet), 0);
});

test("a command, slash command, state, or group without a feature is reported", () => {
  const map = load();
  const advance = map.features.find((feature) => feature.id === "advance");
  advance.cliCommands = advance.cliCommands.filter((name) => name !== "advance");
  advance.slashCommands = advance.slashCommands.filter((name) => name !== "/dev");
  advance.states = advance.states.filter((state) => state !== "PAUSED");
  advance.groups = [];
  const issues = validateFeatureMap(map);
  assert.ok(issues.some((issue) => issue.includes("CLI command 'advance' belongs to no feature")));
  assert.ok(issues.some((issue) => issue.includes("slash command '/dev' belongs to no feature")));
  assert.ok(issues.some((issue) => issue.includes("user state 'PAUSED' belongs to no feature")));
  assert.ok(issues.some((issue) => issue.includes("runtime group 'workflow/advance' belongs to no feature")));
});

test("missing paths, unknown names, double mapping, and duplicate ids are reported", () => {
  const map = load();
  const [first, second] = map.features;
  first.code = [...first.code, ".claude/harness/runtime/workflow/moved-away.mjs"];
  first.cliCommands = [...first.cliCommands, "no-such-command"];
  second.cliCommands = [...second.cliCommands, first.cliCommands[0]];
  map.features.push({ ...first });
  const issues = validateFeatureMap(map);
  assert.ok(issues.some((issue) => issue.includes("code path does not exist")));
  assert.ok(issues.some((issue) => issue.includes("unknown CLI command 'no-such-command'")));
  assert.ok(issues.some((issue) => issue.includes("is already mapped to")));
  assert.ok(issues.some((issue) => issue.includes("duplicate id")));
});

test("a feature needs both languages, a phase, and owning code, tests, and docs", () => {
  const map = load();
  Object.assign(map.features[0], { name: { en: "Investigate" }, phase: "later", tests: [] });
  const issues = validateFeatureMap(map);
  assert.ok(issues.some((issue) => issue.includes("name.th is required")));
  assert.ok(issues.some((issue) => issue.includes("phase must be one of")));
  assert.ok(issues.some((issue) => issue.includes("tests must name at least one path")));
});
