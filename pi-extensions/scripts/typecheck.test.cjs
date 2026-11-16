const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const tsc = path.join(root, 'node_modules', '.bin', 'tsc');

function typecheck(source) {
  // A probe beside the real config so it resolves the same host types.
  const dir = fs.mkdtempSync(path.join(root, '.typecheck-probe-'));
  try {
    fs.writeFileSync(path.join(dir, 'probe.ts'), source);
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({ extends: '../tsconfig.json', include: ['probe.ts'], exclude: [] }));
    return spawnSync(tsc, ['-p', path.join(dir, 'tsconfig.json')], { cwd: root, encoding: 'utf8' });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('the extensions typecheck cleanly', () => {
  const result = spawnSync(tsc, ['-p', path.join(root, 'tsconfig.json')], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('typecheck reports a call to an API that ExtensionAPI does not have', () => {
  const header = "import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';\n";
  assert.equal(typecheck(header + 'export default function (pi: ExtensionAPI) { pi.registerTool; }\n').status, 0, 'control probe compiles');
  const broken = typecheck(header + "export default function (pi: ExtensionAPI) { pi.registerToolz({ name: 'x' }); }\n");
  assert.notEqual(broken.status, 0);
  assert.match(broken.stdout, /registerToolz/);
});
