import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  commandWorkspaceFiles, uncoveredCommandWorkspaceFiles
} from "../runtime/evidence/provider-inputs.mjs";
import { safePackageScriptInputs } from
  "../runtime/evidence/evidence-bootstrap.mjs";

function fixture() {
  const workspace = mkdtempSync(join(tmpdir(), "provider-inputs-"));
  mkdirSync(join(workspace, "tests"));
  writeFileSync(join(workspace, "tests", "run.mjs"), "export default true;\n");
  return workspace;
}

test("command workspace files ignore executables and flags", () => {
  const workspace = fixture();
  try {
    assert.deepEqual(commandWorkspaceFiles({
      command: ["node", "--test", "tests/run.mjs"]
    }, workspace), ["tests/run.mjs"]);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test("the installed harness entrypoint is not an untracked product input", () => {
  // A paid lab without Git blocked Prove: the onboarded quality gate runs
  // `node .claude/harness/foundation.mjs quality-run --enforce`, and every
  // installed file counted as untracked outside the declared surface.
  const workspace = fixture();
  try {
    mkdirSync(join(workspace, ".claude", "harness"), { recursive: true });
    writeFileSync(join(workspace, ".claude", "harness", "foundation.mjs"), "// harness\n");
    const config = { command: ["node", ".claude/harness/foundation.mjs", "quality-run", "--enforce"] };
    assert.deepEqual(commandWorkspaceFiles(config, workspace), []);
    assert.deepEqual(uncoveredCommandWorkspaceFiles({ config, workspace }), []);
    assert.deepEqual(uncoveredCommandWorkspaceFiles({ config: { command: ["node", "tests/run.mjs"] }, workspace }),
      ["tests/run.mjs"], "a product file is still checked");
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test("a configured report argument is an output rather than an input", () => {
  const workspace = fixture();
  try {
    writeFileSync(join(workspace, "report.json"), "{}\n");
    assert.deepEqual(commandWorkspaceFiles({
      command: ["node", "tests/run.mjs", "report.json"],
      report: "report.json"
    }, workspace), ["tests/run.mjs"]);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test("bootstrap binds a safely identified package script with declared surface", () => {
  const workspace = fixture();
  try {
    writeFileSync(join(workspace, "tests", "prepare.mjs"), "export default true;\n");
    assert.deepEqual(safePackageScriptInputs(workspace,
      ["node tests/prepare.mjs", "node tests/run.mjs"], ["src/**"]),
    ["package.json", "src/**", "tests/prepare.mjs", "tests/run.mjs"]);
    assert.deepEqual(safePackageScriptInputs(workspace,
      "node tests/run.mjs", []), []);
    assert.deepEqual(safePackageScriptInputs(workspace,
      "node 'tests/run.mjs'", ["src/**"]), []);
    assert.deepEqual(safePackageScriptInputs(workspace,
      ["node tests/run.mjs", "node 'tests/prepare.mjs'"], ["src/**"]), []);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test("an untracked undeclared command file requires explicit coverage", () => {
  const workspace = fixture();
  try {
    const config = { command: ["node", "tests/run.mjs"] };
    assert.deepEqual(uncoveredCommandWorkspaceFiles({ config, workspace }),
      ["tests/run.mjs"]);
    assert.deepEqual(uncoveredCommandWorkspaceFiles({
      config: { ...config, inputs: ["src/**", "tests/**"] }, workspace
    }), []);
    assert.deepEqual(uncoveredCommandWorkspaceFiles({
      config, workspace, declared: (path) => path === "tests/run.mjs"
    }), []);
    assert.deepEqual(uncoveredCommandWorkspaceFiles({
      config, workspace, tracked: (path) => path === "tests/run.mjs"
    }), []);
    // Git is consulted only for files no pure rule already covers.
    assert.deepEqual(uncoveredCommandWorkspaceFiles({
      config, workspace, declared: () => true,
      tracked: () => { throw new Error("tracked must not be consulted"); }
    }), []);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});
