import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createInvestigationRuntime, validateInvestigationBinding, withInvestigationBinding
} from "../runtime/workflow/investigation/investigation-runtime.mjs";
import { investigationCoverageIssues } from "../runtime/workflow/validation/investigation-coverage.mjs";

// A draft binds a finished investigation by id; the binding is what the
// investigation's own handoff would have been.
function investigation(t, conclusion = { status: "ready-for-change", summary: "Require revision checking." }) {
  const root = mkdtempSync(join(tmpdir(), "investigation-bind-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "openspec", "investigations"), { recursive: true });
  writeFileSync(join(root, "evidence.md"), "The retry path preserves the latest revision.\n");
  writeFileSync(join(root, "openspec/investigations/demo.json"), JSON.stringify({
    version: 1, id: "demo", problem: "Why can a retry overwrite a newer revision?", mode: "analyze",
    sources: ["evidence.md"],
    facts: [{ key: "latest", statement: "The retry path must preserve the latest revision.", sources: ["evidence.md"] }],
    hypotheses: [], decisions: [], conclusion,
    ...(conclusion.status === "ready-for-change" ? { changeIntent: "Reject stale profile writes" } : {})
  }));
  const runtime = createInvestigationRuntime({
    root, readJson: (path) => JSON.parse(readFileSync(path, "utf8")),
    writeJson: (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`),
    now: () => "2026-11-28T00:00:00.000Z", fail: (message) => { throw new Error(message); }
  });
  const prior = console.log;
  console.log = () => {};
  try { return { root, result: runtime.inspectInvestigation("openspec/investigations/demo.json") }; }
  finally { console.log = prior; }
}

test("an id binds the investigation's own handoff, as a string or an id-only object", (t) => {
  const { root, result } = investigation(t);
  assert.ok(result.handoff, "the investigation is ready for change");
  for (const value of ["demo", { id: "demo" }]) {
    const draft = withInvestigationBinding(root, { intent: "x", investigation: value });
    assert.deepEqual(draft.investigation, result.handoff);
    assert.deepEqual(validateInvestigationBinding({ projectRoot: root, binding: draft.investigation }), []);
  }
});

test("an unfinished investigation bound by id is named by validation", (t) => {
  const { root } = investigation(t, { status: "investigating", summary: "Still looking." });
  const draft = withInvestigationBinding(root, { investigation: "demo" });
  assert.equal(draft.investigation.statePath, ".foundation/investigations/demo.json");
  assert.match(validateInvestigationBinding({ projectRoot: root, binding: draft.investigation }).join("\n"),
    /must reference a ready-for-change DONE state/);
  const missing = withInvestigationBinding(root, { investigation: "absent" });
  assert.match(validateInvestigationBinding({ projectRoot: root, binding: missing.investigation }).join("\n"),
    /state is missing or unsafe/);
});

test("a full binding is kept, and a drifted copy names the id-only form", (t) => {
  const { root, result } = investigation(t);
  const full = { ...result.handoff };
  assert.equal(withInvestigationBinding(root, { investigation: full }).investigation, full);
  const drifted = { ...full, summary: "copied by hand" };
  assert.match(validateInvestigationBinding({ projectRoot: root, binding: drifted }).join("\n"),
    /does not match machine state; bind it by id instead \("investigation": "<id>"\)/);
  assert.match(investigationCoverageIssues({ investigation: { version: 2 } }).join("\n"),
    /bind the investigation by id/);
  assert.deepEqual(withInvestigationBinding(root, { intent: "no binding" }), { intent: "no binding" });
});
