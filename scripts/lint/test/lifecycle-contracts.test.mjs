import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT, SKILLS_DIR, main, validateContract } from "../skill-contracts.mjs";

const LIFECYCLE = ["investigate", "change", "build", "prove", "land", "dev", "feature", "changes"];
const read = (skill) => JSON.parse(readFileSync(join(REPO_ROOT, SKILLS_DIR, skill, "contract.json"), "utf8"));
const kinds = (contract) => contract.outputs.map((output) => output.kind);

test("every lifecycle skill has a valid contract", () => {
  for (const skill of LIFECYCLE)
    assert.deepEqual(validateContract(skill, read(skill)), [], skill);
});

test("Land stays with a person and produces no Git output", () => {
  const land = read("land");
  assert.ok(land.responsibility.humanDecides.some((line) => /grant Land/i.test(line)));
  assert.equal(kinds(land).includes("git"), false);
});

test("Change produces an agreement the user approves before Build", () => {
  const change = read("change");
  assert.ok(kinds(change).includes("agreement"));
  assert.ok(change.responsibility.humanDecides.some((line) => /approve.*spec/i.test(line)));
  assert.ok(change.handoff.some((handoff) => handoff.to === "skill:build"));
});

test("the repository passes the skill contract check against its baseline", () => {
  const lines = [];
  const sink = (...args) => lines.push(args.join(" "));
  assert.equal(main([], { log: sink, error: sink }), 0, lines.join("\n"));
});
