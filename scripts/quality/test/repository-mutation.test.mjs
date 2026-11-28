import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mutantRecord, repositoryMutation, suiteRows } from "../repository-mutation.mjs";

const row = (fields) => ({ id: "MUT-A", sourcePath: "src/a.mjs", applied: true, compiled: true,
  result: "killed", expectedKiller: "CASE-A", killedBy: "CASE-A", restored: true, ...fields });

test("a mutant killed by its expected case is Killed and names the killer", () => {
  assert.deepEqual(mutantRecord("suite a", row({})), {
    id: "suite a:MUT-A", path: "src/a.mjs", mutatorName: "semantic-fault",
    status: "Killed", killedBy: ["CASE-A"]
  });
});

test("a mutant killed by another case survives and names no killer", () => {
  const record = mutantRecord("s", row({ killedBy: "CASE-B" }));
  assert.equal(record.status, "Survived");
  assert.deepEqual(record.killedBy, []);
  assert.equal(mutantRecord("s", row({ result: "survived", killedBy: "" })).status, "Survived");
});

test("a fault that was not applied is Ignored; one that did not compile is CompileError", () => {
  assert.equal(mutantRecord("s", row({ applied: false })).status, "Ignored");
  assert.equal(mutantRecord("s", row({ compiled: false })).status, "CompileError");
  assert.equal(mutantRecord("s", row({ sourcePath: undefined })).path, "unknown");
});

test("rows are read as label|command, keeping pipes inside the command", () => {
  assert.deepEqual(suiteRows("a|sh x.sh\n!b|node y.mjs | cat\n\n"), [
    { label: "a", command: "sh x.sh" }, { label: "b", command: "node y.mjs | cat" }]);
});

test("a suite that writes no report is named, and reports from every suite combine", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "repository-mutation-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const writes = (id) => `node -e 'require("fs").writeFileSync(process.env.FOUNDATION_RESULT_REPORT,` +
    `JSON.stringify({mutants:[{id:"${id}",sourcePath:"x.mjs",applied:true,compiled:true,` +
    `result:"killed",expectedKiller:"K",killedBy:"K"}]}))'`;
  const missing = await repositoryMutation([
    { label: "writes", command: writes("M1") }, { label: "silent", command: "exit 1" }], root);
  assert.deepEqual(missing.missing.map((run) => run.label), ["silent"]);
  assert.equal(missing.missing[0].code, 1);
  const combined = await repositoryMutation([
    { label: "a", command: writes("M1") }, { label: "b", command: writes("M1") }], root);
  assert.deepEqual(combined.report.mutants.map((mutant) => [mutant.id, mutant.status]),
    [["a:M1", "Killed"], ["b:M1", "Killed"]]);
});
