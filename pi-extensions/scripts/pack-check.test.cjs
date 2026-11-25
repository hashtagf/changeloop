const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = () => import(path.join(__dirname, 'pack-check.mjs'));
const pkg = () => JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('the real manifest is a valid Pi package', async () => {
  const { checkManifest } = await load();
  assert.deepEqual(checkManifest(pkg(), root), []);
});

test('a host package in dependencies is rejected with the package name', async () => {
  const { checkManifest } = await load();
  const broken = { ...pkg(), dependencies: { '@earendil-works/pi-tui': '1.5.2' } };
  const problems = checkManifest(broken, root);
  assert.ok(problems.some(p => p.includes('@earendil-works/pi-tui') && p.includes('peerDependencies')), problems.join('\n'));
});

test('a missing pi.extensions entry is reported by path', async () => {
  const { checkManifest } = await load();
  const broken = { ...pkg(), pi: { extensions: ['./agent-team/index.ts', './ask-user/index.ts', './background-bash/index.ts', './nine-router/index.ts', './session-title/index.ts', './team-webui/index.ts', './claude-accounts/index.ts', './btw/index.ts', './missing/index.ts'] } };
  assert.deepEqual(checkManifest(broken, root), ['package.json: pi.extensions entry not found: ./missing/index.ts']);
  assert.ok(checkManifest({ ...pkg(), keywords: ['pi'] }, root).some(p => p.includes('pi-package')));
});

test('changelog needs a heading for the current version', async () => {
  const { checkChangelog } = await load();
  assert.deepEqual(checkChangelog({ version: '0.1.0' }, '# Changelog\n\n## [0.1.0]\n- x\n'), []);
  const problems = checkChangelog({ version: '0.2.0' }, '# Changelog\n\n## [0.1.0]\n- x\n');
  assert.equal(problems.length, 1); assert.match(problems[0], /## \[0\.2\.0\]/);
  assert.equal(checkChangelog({ version: '0.1.0' }, '## [0.1.01]\n').length, 1, 'no prefix match');
});

test('pack contents: tests are forbidden and required files must exist', async () => {
  const { checkPackFiles } = await load();
  const good = ['package.json', 'LICENSE', 'CHANGELOG.md', 'README.md', 'docs/tools.md', 'agent-team/index.ts', 'ask-user/index.ts', 'background-bash/index.ts', 'nine-router/index.ts', 'session-title/index.ts', 'team-webui/index.ts', 'claude-accounts/index.ts', 'btw/index.ts'];
  assert.deepEqual(checkPackFiles(good), []);
  assert.deepEqual(checkPackFiles([...good, 'ask-user/store.test.cjs']), ['npm pack: must not publish ask-user/store.test.cjs']);
  assert.ok(checkPackFiles([...good, 'ask-user/test/tui-smoke.py', 'agent-team/test.cjs']).length === 2);
  assert.deepEqual(checkPackFiles(good.filter(f => f !== 'LICENSE')), ['npm pack: missing LICENSE']);
  assert.deepEqual(checkPackFiles(good.filter(f => f !== 'nine-router/index.ts')), ['npm pack: missing nine-router/index.ts']);
});

test('the real npm pack file list excludes tests', async () => {
  const { packFiles, checkPackFiles } = await load();
  const files = packFiles(root);
  assert.ok(files.includes('ask-user/index.ts'));
  assert.ok(files.includes('nine-router/index.ts'));
  assert.ok(!files.some(f => f.startsWith('nine-router/') && /test/.test(f)), files.join('\n'));
  assert.deepEqual(checkPackFiles(files).filter(p => p.includes('must not publish')), []);
});
