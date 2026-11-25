#!/usr/bin/env node
// Validates the Pi package manifest, the changelog heading for the current
// version, and the files `npm pack` would publish. Exits non-zero with every
// problem listed; pure checks are exported for tests.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HOST_PACKAGES = ['@earendil-works/pi-ai', '@earendil-works/pi-coding-agent', '@earendil-works/pi-tui', 'typebox'];
export const EXTENSIONS = ['agent-team', 'ask-user', 'background-bash', 'nine-router', 'session-title', 'team-webui', 'claude-accounts', 'btw'];
const REQUIRED_FILES = [...EXTENSIONS.map(name => `${name}/index.ts`), 'LICENSE', 'CHANGELOG.md', 'README.md', 'docs/tools.md', 'package.json'];
const FORBIDDEN = [/\.test\.cjs$/, /\.test\.mjs$/, /(^|\/)__pycache__\//, /^team-webui\/scripts\//, /(^|\/)test\.cjs$/, /(^|\/)test\//, /(^|\/)node_modules\//];

export function checkManifest(pkg, root) {
  const problems = [];
  for (const field of ['name', 'version', 'license', 'description']) if (!pkg[field]) problems.push(`package.json: missing ${field}`);
  if (pkg.version && !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(pkg.version)) problems.push(`package.json: version ${pkg.version} is not semver`);
  if (!pkg.repository?.url) problems.push('package.json: missing repository.url');
  if (!pkg.engines?.node) problems.push('package.json: missing engines.node');
  if (!pkg.keywords?.includes('pi-package')) problems.push('package.json: keywords must include pi-package');
  const declared = pkg.pi?.extensions;
  if (!Array.isArray(declared) || !declared.length) problems.push('package.json: pi.extensions must list the extension entry points');
  else for (const entry of declared) if (!existsSync(resolve(root, entry))) problems.push(`package.json: pi.extensions entry not found: ${entry}`);
  for (const name of EXTENSIONS) if (Array.isArray(declared) && !declared.includes(`./${name}/index.ts`)) problems.push(`package.json: pi.extensions is missing ./${name}/index.ts`);
  for (const host of HOST_PACKAGES) {
    if (pkg.dependencies?.[host]) problems.push(`package.json: ${host} is provided by Pi; move it from dependencies to peerDependencies with range "*"`);
    if (pkg.peerDependencies?.[host] !== '*') problems.push(`package.json: peerDependencies.${host} must be "*"`);
  }
  return problems;
}

export function checkChangelog(pkg, text) {
  const version = String(pkg.version || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^## \\[?${version}\\]?(\\s|$)`, 'm').test(text) ? []
    : [`CHANGELOG.md: add a heading "## [${pkg.version}]" for the current package.json version`];
}

export function checkPackFiles(files) {
  const problems = [];
  for (const required of REQUIRED_FILES) if (!files.includes(required)) problems.push(`npm pack: missing ${required}`);
  for (const file of files) if (FORBIDDEN.some(pattern => pattern.test(file))) problems.push(`npm pack: must not publish ${file}`);
  return problems;
}

export function checkPersonalPaths(root, files) {
  return files.filter(file => /\.(ts|cjs|mjs|js|json|md|py|sh)$/.test(file))
    .filter(file => readFileSync(join(root, file), 'utf8').includes('/Users/'))
    .map(file => `npm pack: ${file} contains a personal /Users/ path`);
}

export function packFiles(root) {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(out)[0].files.map(entry => entry.path).sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const changelog = existsSync(join(root, 'CHANGELOG.md')) ? readFileSync(join(root, 'CHANGELOG.md'), 'utf8') : '';
  const files = packFiles(root);
  const problems = [...checkManifest(pkg, root), ...checkChangelog(pkg, changelog), ...checkPackFiles(files), ...checkPersonalPaths(root, files)];
  if (problems.length) {
    console.error(problems.map(p => `✗ ${p}`).join('\n'));
    process.exit(1);
  }
  console.log(`✓ ${pkg.name}@${pkg.version}: extensions ${pkg.pi.extensions.join(', ')}; ${files.length} files in the tarball`);
}
