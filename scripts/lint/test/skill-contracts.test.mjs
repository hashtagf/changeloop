import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { DEFAULT_BASELINE, main, validateContract } from "../skill-contracts.mjs";

function valid(skill = "alpha", overrides = {}) {
  return {
    version: 1,
    skill,
    trigger: "A request needs alpha",
    inputs: ["the request"],
    action: "Does alpha",
    outputs: [{ kind: "report", description: "alpha report" }],
    handoff: [{ to: "skill:beta", when: "alpha is done" }],
    responsibility: { aiDoes: ["alpha"], humanDoes: [], humanDecides: [] },
    ...overrides
  };
}

function fixture(t, { baseline = { version: 1, withoutContract: [] } } = {}) {
  const root = mkdtempSync(join(tmpdir(), "skill-contracts-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof text === "string" ? text : JSON.stringify(text));
  };
  for (const skill of ["alpha", "beta"]) write(`.claude/skills/${skill}/SKILL.md`, `# ${skill}\n`);
  write(".claude/commands/deliver.md", "# deliver\n");
  write(".claude/skills/alpha/contract.json", valid("alpha"));
  write(".claude/skills/beta/contract.json", valid("beta", { handoff: [] }));
  if (baseline) write(DEFAULT_BASELINE, baseline);
  return { root, write, baselinePath: join(root, DEFAULT_BASELINE) };
}

function capture() {
  const lines = [];
  const sink = (...args) => lines.push(args.join(" "));
  return { out: { log: sink, error: sink }, text: () => lines.join("\n") };
}

function run(root, args = []) {
  const log = capture();
  return { status: main(["--root", root, ...args], log.out), text: log.text() };
}

test("a complete contract has no findings", (t) => {
  const { root } = fixture(t);
  assert.deepEqual(validateContract("alpha", valid("alpha"), root), []);
  assert.equal(run(root).status, 0);
});

test("a missing handoff or empty outputs is reported with the field path", (t) => {
  const { root } = fixture(t);
  const { handoff: _handoff, ...withoutHandoff } = valid("alpha");
  assert.deepEqual(validateContract("alpha", withoutHandoff, root).map((f) => f.path), ["handoff"]);
  assert.deepEqual(validateContract("alpha", valid("alpha", { outputs: [] }), root).map((f) => f.path), ["outputs"]);
});

test("an unknown output kind names the path and accepted kinds", (t) => {
  const { root } = fixture(t);
  const [finding] = validateContract("alpha",
    valid("alpha", { outputs: [{ kind: "vibes", description: "x" }] }), root);
  assert.equal(finding.path, "outputs[0].kind");
  assert.match(finding.message, /agreement, code, evidence, report, decision-request, document, state, git/);
});

test("invalid JSON fails and names the file", (t) => {
  const { root, write } = fixture(t);
  write(".claude/skills/alpha/contract.json", "{ nope");
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.text, /alpha\/contract\.json contract\.json: is not valid JSON/);
});

test("a skill name that differs from its folder names both", (t) => {
  const { root } = fixture(t);
  const [finding] = validateContract("alpha", valid("gamma"), root);
  assert.equal(finding.path, "skill");
  assert.match(finding.message, /'alpha'.*'gamma'/);
});

test("a handoff to a skill that does not exist is reported", (t) => {
  const { root, write } = fixture(t);
  write(".claude/skills/alpha/contract.json",
    valid("alpha", { handoff: [{ to: "skill:no-such-skill", when: "done" }] }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.text, /alpha\/contract\.json handoff\[0\]\.to: 'skill:no-such-skill' does not exist/);
});

test("a handoff to an existing command is accepted", (t) => {
  const { root } = fixture(t);
  assert.deepEqual(validateContract("alpha",
    valid("alpha", { handoff: [{ to: "command:deliver", when: "user asks for a PR" }] }), root), []);
});

test("a malformed handoff target names the accepted forms", (t) => {
  const { root } = fixture(t);
  const [finding] = validateContract("alpha",
    valid("alpha", { handoff: [{ to: "the reviewer", when: "done" }] }), root);
  assert.equal(finding.path, "handoff[0].to");
  assert.match(finding.message, /skill:<name>, command:<name>, or user/);
});

test("a git output without a human decision is rejected", (t) => {
  const { root } = fixture(t);
  const findings = validateContract("alpha",
    valid("alpha", { outputs: [{ kind: "git", description: "commit" }] }), root);
  assert.equal(findings[0].path, "responsibility.humanDecides");
  assert.match(findings[0].message, /'git' output needs a named human decision/);
});

test("an agreement output with a named approval is accepted", (t) => {
  const { root } = fixture(t);
  assert.deepEqual(validateContract("alpha", valid("alpha", {
    outputs: [{ kind: "agreement", description: "spec" }],
    responsibility: { aiDoes: ["drafts"], humanDoes: [], humanDecides: ["approve the spec"] }
  }), root), []);
});

test("a handoff to the user with nothing for the person to do or decide is rejected", (t) => {
  const { root } = fixture(t);
  const findings = validateContract("alpha",
    valid("alpha", { handoff: [{ to: "user", when: "done" }] }), root);
  assert.deepEqual(findings.map((f) => f.path), ["responsibility"]);
  assert.match(findings[0].message, /what the person does or decides/);
});

test("the repository fixture matching its baseline exits 0", (t) => {
  const { root, write } = fixture(t, { baseline: { version: 1, withoutContract: ["gamma"] } });
  write(".claude/skills/gamma/SKILL.md", "# gamma\n");
  assert.equal(run(root).status, 0);
});

test("a new skill without contract.json fails and asks for one", (t) => {
  const { root, write } = fixture(t);
  write(".claude/skills/gamma/SKILL.md", "# gamma\n");
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.text, /gamma: add \.claude\/skills\/gamma\/contract\.json/);
});

test("a baseline skill that gained a contract fails until --tighten removes it", (t) => {
  const { root, baselinePath } = fixture(t, { baseline: { version: 1, withoutContract: ["alpha", "gamma"] } });
  mkdirSync(join(root, ".claude/skills/gamma"), { recursive: true });
  writeFileSync(join(root, ".claude/skills/gamma/SKILL.md"), "# gamma\n");
  const before = run(root);
  assert.equal(before.status, 1);
  assert.match(before.text, /Run `node scripts\/lint\/skill-contracts\.mjs --tighten`/);
  assert.equal(run(root, ["--tighten"]).status, 0);
  assert.deepEqual(JSON.parse(readFileSync(baselinePath, "utf8")).withoutContract, ["gamma"]);
  assert.equal(run(root).status, 0);
});

test("a missing or malformed baseline fails with its file name", (t) => {
  const { root, baselinePath } = fixture(t, { baseline: null });
  const missing = run(root);
  assert.equal(missing.status, 2);
  assert.match(missing.text, /baseline is missing: .*skill-contracts-v1\.json/);
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, "{ bad");
  assert.match(run(root).text, /not valid JSON: .*skill-contracts-v1\.json/);
  writeFileSync(baselinePath, "{\"version\":1}");
  assert.match(run(root).text, /wrong shape/);
});
