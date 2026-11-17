import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { REPO_ROOT, checkIssues, markdown, pyramid, registryIssues, scorecard } from "../scorecard.mjs";

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "scorecard-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof text === "string" ? text : JSON.stringify(text));
  }
  return root;
}

const GUIDE = "# Guide\n\nAlways keep the root small.\nNever ship\nsecrets.\nAsk before you push.\nWrite tidy prose.\n";

test("the repository's rule registry matches its guides and holds its prose-only ceiling", () => {
  assert.deepEqual(checkIssues(scorecard(REPO_ROOT)), []);
});

test("registry issues name a stale quote, a missing check file, and a judgment without a reason", (t) => {
  const root = fixture(t, { "GUIDE.md": GUIDE, "check.test.mjs": "" });
  const rules = [
    { id: "root", source: "GUIDE.md", quote: "Always keep the root small.", layer: "test", enforcedBy: ["check.test.mjs"] },
    { id: "secrets", source: "GUIDE.md", quote: "Never ship secrets.", layer: "lint", enforcedBy: ["gone.mjs"] },
    { id: "push", source: "GUIDE.md", quote: "Ask before you push.", layer: "judgment" },
    { id: "stale", source: "GUIDE.md", quote: "A sentence that was edited away.", layer: "prose" },
    { id: "odd", source: "GUIDE.md", quote: "Write tidy prose.", layer: "vibes" }
  ];
  assert.deepEqual(registryIssues(root, { rules }), [
    "rules[1] secrets: enforcedBy gone.mjs does not exist",
    "rules[2] push: a judgment says why no check can catch it",
    "rules[3] stale: quote is no longer in GUIDE.md; update the quote or remove the rule",
    "rules[4] odd: layer must be one of architecture, type, lint, test, mutation, judgment, prose"
  ]);
});

test("the pyramid share counts checks over checks plus prose, and the ceiling ratchets both ways", (t) => {
  const registry = (proseOnlyCeiling) => ({ proseOnlyCeiling, rules: [
    { id: "a", source: "GUIDE.md", quote: "Always keep the root small.", layer: "architecture", enforcedBy: ["GUIDE.md"] },
    { id: "b", source: "GUIDE.md", quote: "Never ship secrets.", layer: "test", enforcedBy: ["GUIDE.md"] },
    { id: "c", source: "GUIDE.md", quote: "Ask before you push.", layer: "judgment", judgment: "needs a person" },
    { id: "d", source: "GUIDE.md", quote: "Write tidy prose.", layer: "prose" }
  ] });
  const card = (ceiling) => ({ pyramid: pyramid(fixture(t, { "GUIDE.md": GUIDE, "quality/rule-enforcement.json": registry(ceiling) })) });
  const value = card(1).pyramid;
  assert.equal(value.enforcedShare, 67);
  assert.deepEqual(value.proseOnly, ["d"]);
  assert.deepEqual(checkIssues(card(1)), []);
  assert.match(checkIssues(card(0))[0], /prose-only rules grew to 1 \(ceiling 0\): enforce the new rule with a check/);
  assert.match(checkIssues(card(2))[0], /prose-only rules fell to 1: lower proseOnlyCeiling/);
});

test("the markdown summary lists every layer and the prose-only rules", () => {
  const text = markdown(scorecard(REPO_ROOT));
  for (const layer of ["architecture", "type", "lint", "test", "mutation", "judgment", "prose"])
    assert.match(text, new RegExp(`\\| ${layer} \\| \\d+ \\|`));
  assert.match(text, /\| Enforced share of checkable rules \| \d+% \|/);
  assert.match(text, /\| Files nesting over 5 levels \| \d+ \(deepest \d+\) \|/);
});
